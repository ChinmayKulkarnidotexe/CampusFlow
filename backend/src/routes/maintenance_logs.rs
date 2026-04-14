use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::maintenance_log::*;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_logs).post(create_log))
        .route("/:id", get(get_log).put(update_log))
}

// ── GET /api/maintenance-logs ────────────────────────────────────────────

async fn list_logs(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
    Query(params): Query<MaintenanceLogQuery>,
) -> Result<Json<Value>, AppError> {
    let logs = sqlx::query_as::<_, MaintenanceLog>(
        "SELECT maintenance_id, resource_type, resource_id, issue_reported, \
         reported_date, resolved_date, status FROM maintenance_logs \
         WHERE ($1::text IS NULL OR resource_type = $1) \
         AND ($2::int IS NULL OR resource_id = $2) \
         AND ($3::text IS NULL OR status = $3) \
         ORDER BY reported_date DESC",
    )
    .bind(&params.resource_type)
    .bind(&params.resource_id)
    .bind(&params.status)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(json!({ "logs": logs })))
}

// ── GET /api/maintenance-logs/:id ────────────────────────────────────────

async fn get_log(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<Json<Value>, AppError> {
    let log = sqlx::query_as::<_, MaintenanceLog>(
        "SELECT maintenance_id, resource_type, resource_id, issue_reported, \
         reported_date, resolved_date, status FROM maintenance_logs WHERE maintenance_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Maintenance log not found".to_string()))?;

    Ok(Json(json!({ "log": log })))
}

// ── POST /api/maintenance-logs ───────────────────────────────────────────

async fn create_log(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
    Json(payload): Json<CreateMaintenanceLogRequest>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    let log = sqlx::query_as::<_, MaintenanceLog>(
        "INSERT INTO maintenance_logs (resource_type, resource_id, issue_reported) \
         VALUES ($1, $2, $3) \
         RETURNING maintenance_id, resource_type, resource_id, issue_reported, \
         reported_date, resolved_date, status",
    )
    .bind(&payload.resource_type)
    .bind(payload.resource_id)
    .bind(&payload.issue_reported)
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(json!({ "log": log }))))
}

// ── PUT /api/maintenance-logs/:id ────────────────────────────────────────

async fn update_log(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateMaintenanceLogRequest>,
) -> Result<Json<Value>, AppError> {
    auth.require_admin()?;

    let current = sqlx::query_as::<_, MaintenanceLog>(
        "SELECT maintenance_id, resource_type, resource_id, issue_reported, \
         reported_date, resolved_date, status FROM maintenance_logs WHERE maintenance_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Maintenance log not found".to_string()))?;

    let log = sqlx::query_as::<_, MaintenanceLog>(
        "UPDATE maintenance_logs SET \
         issue_reported = $1, resolved_date = $2, status = $3 \
         WHERE maintenance_id = $4 \
         RETURNING maintenance_id, resource_type, resource_id, issue_reported, \
         reported_date, resolved_date, status",
    )
    .bind(payload.issue_reported.as_ref().unwrap_or(&current.issue_reported))
    .bind(payload.resolved_date.or(current.resolved_date))
    .bind(payload.status.as_ref().unwrap_or(&current.status))
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(json!({ "log": log })))
}
