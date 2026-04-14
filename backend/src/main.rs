use std::sync::Arc;

use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod auth;
mod config;
mod db;
mod email;
mod errors;
mod middleware;
mod models;
mod routes;

use auth::otp::OtpStore;
use config::AppConfig;
use email::smtp::SmtpMailer;

/// Shared application state accessible from all route handlers.
pub struct AppState {
    pub db: sqlx::PgPool,
    pub config: AppConfig,
    pub otp_store: OtpStore,
    pub mailer: Option<SmtpMailer>,
}

#[tokio::main]
async fn main() {
    // ── Tracing ──────────────────────────────────────────────────────────
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "backend=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // ── Environment ──────────────────────────────────────────────────────
    dotenvy::dotenv().ok();
    let config = AppConfig::from_env();

    // ── Database ─────────────────────────────────────────────────────────
    tracing::info!("Connecting to database...");
    let pool = db::init_pool(&config.database_url).await;

    tracing::info!("Running migrations...");
    db::run_migrations(&pool).await;

    // ── OTP store ────────────────────────────────────────────────────────
    let otp_store = OtpStore::new(
        config.otp_expiry,
        config.otp_cooldown,
        config.otp_max_attempts,
    );

    // ── SMTP mailer ──────────────────────────────────────────────────────
    let mailer = SmtpMailer::new(
        &config.smtp_username,
        &config.smtp_password,
        &config.smtp_from,
        config.smtp_rate_limit,
    );

    if mailer.is_none() {
        tracing::warn!("⚠  SMTP not configured — OTP codes will be logged to console");
    }

    // ── App state ────────────────────────────────────────────────────────
    let state = Arc::new(AppState {
        db: pool,
        config: config.clone(),
        otp_store,
        mailer,
    });

    // ── Background: OTP cleanup every 60 s ───────────────────────────────
    {
        let state = state.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(60));
            loop {
                interval.tick().await;
                state.otp_store.cleanup_expired();
            }
        });
    }

    // ── Router ───────────────────────────────────────────────────────────
    let app = axum::Router::new()
        .nest("/api", routes::api_routes())
        .with_state(state.clone())
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http());

    // ── Start server ─────────────────────────────────────────────────────
    let addr = format!("{}:{}", state.config.server_host, state.config.server_port);
    tracing::info!("CampusFlow backend starting on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
