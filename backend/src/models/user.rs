use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// ── Full User row (includes password_hash — only for internal auth use) ──

#[derive(Debug, FromRow)]
#[allow(dead_code)]
pub struct User {
    pub user_id: i32,
    pub full_name: String,
    pub email: String,
    pub password_hash: String,
    pub role_id: i32,
    pub department: Option<String>,
    pub created_at: NaiveDateTime,
}

// ── Safe API response (no password_hash) ─────────────────────────────────

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct UserResponse {
    pub user_id: i32,
    pub full_name: String,
    pub email: String,
    pub role_id: i32,
    pub department: Option<String>,
    pub created_at: NaiveDateTime,
}

// ── Request bodies ───────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub full_name: String,
    pub email: String,
    pub password: String,
    pub role_id: Option<i32>,
    pub department: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub role_id: Option<i32>,
    pub department: Option<String>,
}

// ── Role model ───────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Role {
    pub role_id: i32,
    pub role_name: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateRoleRequest {
    pub role_name: String,
}
