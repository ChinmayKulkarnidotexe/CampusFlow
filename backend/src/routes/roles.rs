use axum::{
    extract::State,
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::user::{CreateRoleRequest, Role};
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", get(list_roles).post(create_role))
}

// ── GET /api/roles ───────────────────────────────────────────────────────

async fn list_roles(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
) -> Result<Json<Value>, AppError> {
    let roles = sqlx::query_as::<_, Role>(
        "SELECT role_id, role_name FROM roles ORDER BY role_id",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(json!({ "roles": roles })))
}

// ── POST /api/roles ──────────────────────────────────────────────────────

async fn create_role(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<CreateRoleRequest>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    auth.require_admin()?;

    let role = sqlx::query_as::<_, Role>(
        "INSERT INTO roles (role_name) VALUES ($1) RETURNING role_id, role_name",
    )
    .bind(&payload.role_name)
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(json!({ "role": role }))))
}
