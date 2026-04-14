use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::user::{CreateUserRequest, UpdateUserRequest, UserResponse};
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_users).post(create_user))
        .route("/me", get(get_current_user))
        .route("/:id", get(get_user).put(update_user).delete(delete_user))
}

// ── GET /api/users ───────────────────────────────────────────────────────

async fn list_users(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<Value>, AppError> {
    auth.require_admin()?;

    let users = sqlx::query_as::<_, UserResponse>(
        "SELECT user_id, full_name, email, role_id, department, created_at \
         FROM users ORDER BY created_at DESC",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(json!({ "users": users })))
}

// ── GET /api/users/me ────────────────────────────────────────────────────

async fn get_current_user(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<Value>, AppError> {
    let user = sqlx::query_as::<_, UserResponse>(
        "SELECT user_id, full_name, email, role_id, department, created_at \
         FROM users WHERE user_id = $1",
    )
    .bind(auth.user_id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(json!({ "user": user })))
}

// ── GET /api/users/:id ───────────────────────────────────────────────────

async fn get_user(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<Json<Value>, AppError> {
    if auth.user_id != id {
        auth.require_admin()?;
    }

    let user = sqlx::query_as::<_, UserResponse>(
        "SELECT user_id, full_name, email, role_id, department, created_at \
         FROM users WHERE user_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    Ok(Json(json!({ "user": user })))
}

// ── POST /api/users ──────────────────────────────────────────────────────

async fn create_user(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    auth.require_admin()?;

    let password_hash = bcrypt::hash(&payload.password, 12)
        .map_err(|e| AppError::Internal(format!("Hashing error: {}", e)))?;

    let role_id = payload.role_id.unwrap_or(3);

    let user = sqlx::query_as::<_, UserResponse>(
        "INSERT INTO users (full_name, email, password_hash, role_id, department) \
         VALUES ($1, $2, $3, $4, $5) \
         RETURNING user_id, full_name, email, role_id, department, created_at",
    )
    .bind(&payload.full_name)
    .bind(&payload.email)
    .bind(&password_hash)
    .bind(role_id)
    .bind(&payload.department)
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(json!({ "user": user }))))
}

// ── PUT /api/users/:id ──────────────────────────────────────────────────

async fn update_user(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<Json<Value>, AppError> {
    auth.require_admin()?;

    let current = sqlx::query_as::<_, UserResponse>(
        "SELECT user_id, full_name, email, role_id, department, created_at \
         FROM users WHERE user_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    let user = sqlx::query_as::<_, UserResponse>(
        "UPDATE users SET full_name = $1, email = $2, role_id = $3, department = $4 \
         WHERE user_id = $5 \
         RETURNING user_id, full_name, email, role_id, department, created_at",
    )
    .bind(payload.full_name.as_ref().unwrap_or(&current.full_name))
    .bind(payload.email.as_ref().unwrap_or(&current.email))
    .bind(payload.role_id.unwrap_or(current.role_id))
    .bind(payload.department.as_ref().or(current.department.as_ref()))
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(json!({ "user": user })))
}

// ── DELETE /api/users/:id ────────────────────────────────────────────────

async fn delete_user(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    auth.require_admin()?;

    let result = sqlx::query("DELETE FROM users WHERE user_id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("User not found".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}
