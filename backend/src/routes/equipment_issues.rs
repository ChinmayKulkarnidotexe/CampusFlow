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
use crate::models::equipment_issue::*;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_issues).post(create_issue))
        .route("/:id", get(get_issue).put(update_issue))
}

// ── GET /api/equipment-issues ────────────────────────────────────────────

async fn list_issues(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
    Query(params): Query<EquipmentIssueQuery>,
) -> Result<Json<Value>, AppError> {
    let issues = sqlx::query_as::<_, EquipmentIssue>(
        "SELECT issue_id, equipment_id, user_id, issue_time, expected_return, \
         actual_return, issue_status FROM equipment_issue \
         WHERE ($1::int IS NULL OR equipment_id = $1) \
         AND ($2::int IS NULL OR user_id = $2) \
         AND ($3::text IS NULL OR issue_status = $3) \
         ORDER BY issue_time DESC",
    )
    .bind(&params.equipment_id)
    .bind(&params.user_id)
    .bind(&params.issue_status)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(json!({ "issues": issues })))
}

// ── GET /api/equipment-issues/:id ────────────────────────────────────────

async fn get_issue(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<Json<Value>, AppError> {
    let issue = sqlx::query_as::<_, EquipmentIssue>(
        "SELECT issue_id, equipment_id, user_id, issue_time, expected_return, \
         actual_return, issue_status FROM equipment_issue WHERE issue_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Equipment issue not found".to_string()))?;

    Ok(Json(json!({ "issue": issue })))
}

// ── POST /api/equipment-issues ───────────────────────────────────────────

async fn create_issue(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
    Json(payload): Json<CreateEquipmentIssueRequest>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    // Verify equipment exists and is available
    let status = sqlx::query_scalar::<_, String>(
        "SELECT status FROM equipment WHERE equipment_id = $1",
    )
    .bind(payload.equipment_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Equipment not found".to_string()))?;

    if status != "available" {
        return Err(AppError::Conflict(
            "Equipment is not available for issue".to_string(),
        ));
    }

    // Create issue record
    let issue = sqlx::query_as::<_, EquipmentIssue>(
        "INSERT INTO equipment_issue (equipment_id, user_id, expected_return) \
         VALUES ($1, $2, $3) \
         RETURNING issue_id, equipment_id, user_id, issue_time, expected_return, actual_return, issue_status",
    )
    .bind(payload.equipment_id)
    .bind(payload.user_id)
    .bind(&payload.expected_return)
    .fetch_one(&state.db)
    .await?;

    // Mark equipment as issued
    sqlx::query("UPDATE equipment SET status = 'issued' WHERE equipment_id = $1")
        .bind(payload.equipment_id)
        .execute(&state.db)
        .await?;

    Ok((StatusCode::CREATED, Json(json!({ "issue": issue }))))
}

// ── PUT /api/equipment-issues/:id ────────────────────────────────────────

async fn update_issue(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateEquipmentIssueRequest>,
) -> Result<Json<Value>, AppError> {
    let current = sqlx::query_as::<_, EquipmentIssue>(
        "SELECT issue_id, equipment_id, user_id, issue_time, expected_return, \
         actual_return, issue_status FROM equipment_issue WHERE issue_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Equipment issue not found".to_string()))?;

    let new_status = payload
        .issue_status
        .as_deref()
        .unwrap_or(&current.issue_status);

    let issue = sqlx::query_as::<_, EquipmentIssue>(
        "UPDATE equipment_issue SET actual_return = $1, issue_status = $2 \
         WHERE issue_id = $3 \
         RETURNING issue_id, equipment_id, user_id, issue_time, expected_return, actual_return, issue_status",
    )
    .bind(payload.actual_return.or(current.actual_return))
    .bind(new_status)
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    // If returned, mark equipment available again
    if new_status == "returned" {
        sqlx::query("UPDATE equipment SET status = 'available' WHERE equipment_id = $1")
            .bind(current.equipment_id)
            .execute(&state.db)
            .await?;
    }

    Ok(Json(json!({ "issue": issue })))
}
