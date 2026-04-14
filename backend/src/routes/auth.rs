use axum::{extract::State, routing::post, Json, Router};
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Arc;

use crate::auth::jwt::{decode_token, generate_token_pair};
use crate::auth::otp::OtpError;
use crate::errors::AppError;
use crate::models::user::{Role, User, UserResponse};
use crate::AppState;

// ── Request types ────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub full_name: String,
    pub email: String,
    pub password: String,
    pub department: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyOtpRequest {
    pub email: String,
    pub otp_code: String,
}

#[derive(Debug, Deserialize)]
pub struct ResendOtpRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

// ── Router ───────────────────────────────────────────────────────────────

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/verify-otp", post(verify_otp))
        .route("/resend-otp", post(resend_otp))
        .route("/refresh", post(refresh_token))
}

// ── POST /api/auth/register ──────────────────────────────────────────────

async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<Value>, AppError> {
    // Validate
    if payload.email.is_empty() || payload.password.is_empty() || payload.full_name.is_empty() {
        return Err(AppError::BadRequest("full_name, email, and password are required".to_string()));
    }
    if payload.password.len() < 8 {
        return Err(AppError::BadRequest("Password must be at least 8 characters".to_string()));
    }

    // Check duplicate email
    let exists = sqlx::query_scalar::<_, i32>("SELECT user_id FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.db)
        .await?;

    if exists.is_some() {
        return Err(AppError::Conflict("Email already registered".to_string()));
    }

    // Default role → student
    let role = sqlx::query_as::<_, Role>(
        "SELECT role_id, role_name FROM roles WHERE role_name = 'student'",
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| AppError::Internal("Default role 'student' not found — run migrations".to_string()))?;

    // Hash password
    let password_hash = bcrypt::hash(&payload.password, 12)
        .map_err(|e| AppError::Internal(format!("Hashing error: {}", e)))?;

    // Insert
    let user = sqlx::query_as::<_, UserResponse>(
        "INSERT INTO users (full_name, email, password_hash, role_id, department) \
         VALUES ($1, $2, $3, $4, $5) \
         RETURNING user_id, full_name, email, role_id, department, created_at",
    )
    .bind(&payload.full_name)
    .bind(&payload.email)
    .bind(&password_hash)
    .bind(role.role_id)
    .bind(&payload.department)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(json!({ "message": "Registration successful", "user": user })))
}

// ── POST /api/auth/login ─────────────────────────────────────────────────

async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<Value>, AppError> {
    // Find user
    let user = sqlx::query_as::<_, User>(
        "SELECT user_id, full_name, email, password_hash, role_id, department, created_at \
         FROM users WHERE email = $1",
    )
    .bind(&payload.email)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    // Verify password
    let valid = bcrypt::verify(&payload.password, &user.password_hash)
        .map_err(|e| AppError::Internal(format!("Password verify error: {}", e)))?;

    if !valid {
        return Err(AppError::Unauthorized("Invalid email or password".to_string()));
    }

    // Generate & store OTP
    let otp_code = state.otp_store.generate_otp();
    state.otp_store.store_otp(&user.email, &otp_code);

    // Send OTP email (or log in dev mode)
    match &state.mailer {
        Some(mailer) => {
            if let Err(e) = mailer.send_otp_email(&user.email, &otp_code).await {
                tracing::error!("Failed to send OTP email: {}", e);
                return Err(AppError::Internal(format!("Failed to send OTP: {}", e)));
            }
        }
        None => {
            tracing::info!("📧 OTP for {} → {}", user.email, otp_code);
        }
    }

    Ok(Json(json!({
        "message": "OTP sent to your email",
        "requires_otp": true,
        "email": user.email
    })))
}

// ── POST /api/auth/verify-otp ────────────────────────────────────────────

async fn verify_otp(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<VerifyOtpRequest>,
) -> Result<Json<Value>, AppError> {
    match state.otp_store.verify_otp(&payload.email, &payload.otp_code) {
        Ok(true) => {
            // OTP valid — fetch user + role, issue tokens
            let user = sqlx::query_as::<_, UserResponse>(
                "SELECT user_id, full_name, email, role_id, department, created_at \
                 FROM users WHERE email = $1",
            )
            .bind(&payload.email)
            .fetch_one(&state.db)
            .await?;

            let role = sqlx::query_as::<_, Role>(
                "SELECT role_id, role_name FROM roles WHERE role_id = $1",
            )
            .bind(user.role_id)
            .fetch_one(&state.db)
            .await?;

            let tokens = generate_token_pair(
                user.user_id,
                &user.email,
                &role.role_name,
                &state.config.jwt_access_secret,
                &state.config.jwt_refresh_secret,
                state.config.access_token_expiry,
                state.config.refresh_token_expiry,
            )?;

            // Send login-success email (best-effort)
            if let Some(mailer) = &state.mailer {
                if let Err(e) = mailer.send_login_success_email(&user.email, &user.full_name).await {
                    tracing::warn!("Login-success email failed: {}", e);
                }
            }

            Ok(Json(json!({
                "access_token": tokens.access_token,
                "refresh_token": tokens.refresh_token,
                "token_type": "Bearer",
                "expires_in": state.config.access_token_expiry,
                "user": user
            })))
        }
        Ok(false) => Err(AppError::Unauthorized("Invalid OTP code".to_string())),
        Err(OtpError::NotFound) => {
            Err(AppError::BadRequest(OtpError::NotFound.to_string()))
        }
        Err(OtpError::Expired) => {
            Err(AppError::BadRequest(OtpError::Expired.to_string()))
        }
        Err(OtpError::MaxAttemptsExceeded) => {
            Err(AppError::RateLimited(OtpError::MaxAttemptsExceeded.to_string()))
        }
        Err(OtpError::CooldownActive(s)) => {
            Err(AppError::RateLimited(OtpError::CooldownActive(s).to_string()))
        }
    }
}

// ── POST /api/auth/resend-otp ────────────────────────────────────────────

async fn resend_otp(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ResendOtpRequest>,
) -> Result<Json<Value>, AppError> {
    // Verify user exists
    let exists = sqlx::query_scalar::<_, i32>("SELECT user_id FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.db)
        .await?;

    if exists.is_none() {
        return Err(AppError::NotFound("User not found".to_string()));
    }

    // Check cooldown
    if let Err(OtpError::CooldownActive(secs)) = state.otp_store.can_resend(&payload.email) {
        return Err(AppError::RateLimited(format!(
            "Please wait {} seconds before requesting a new OTP",
            secs
        )));
    }

    // Generate & send
    let otp_code = state.otp_store.generate_otp();
    state.otp_store.store_otp(&payload.email, &otp_code);

    match &state.mailer {
        Some(mailer) => {
            if let Err(e) = mailer.send_otp_email(&payload.email, &otp_code).await {
                tracing::error!("Failed to resend OTP email: {}", e);
                return Err(AppError::Internal(format!("Failed to send OTP: {}", e)));
            }
        }
        None => {
            tracing::info!("📧 OTP for {} → {}", payload.email, otp_code);
        }
    }

    Ok(Json(json!({
        "message": "OTP resent to your email",
        "cooldown_seconds": state.config.otp_cooldown
    })))
}

// ── POST /api/auth/refresh ───────────────────────────────────────────────

async fn refresh_token(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RefreshRequest>,
) -> Result<Json<Value>, AppError> {
    let claims = decode_token(
        &payload.refresh_token,
        &state.config.jwt_refresh_secret,
        "refresh",
    )
    .map_err(|e| AppError::Unauthorized(format!("Invalid refresh token: {}", e)))?;

    let tokens = generate_token_pair(
        claims.sub,
        &claims.email,
        &claims.role,
        &state.config.jwt_access_secret,
        &state.config.jwt_refresh_secret,
        state.config.access_token_expiry,
        state.config.refresh_token_expiry,
    )?;

    Ok(Json(json!({
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "token_type": "Bearer",
        "expires_in": state.config.access_token_expiry
    })))
}
