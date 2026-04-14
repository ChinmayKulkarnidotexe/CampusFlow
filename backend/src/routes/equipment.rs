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
use crate::models::equipment::*;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_equipment).post(create_equipment))
        .route("/:id", get(get_equipment).put(update_equipment).delete(delete_equipment))
}

// ── GET /api/equipment ───────────────────────────────────────────────────

async fn list_equipment(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
    Query(params): Query<EquipmentQuery>,
) -> Result<Json<Value>, AppError> {
    let equipment = sqlx::query_as::<_, Equipment>(
        "SELECT equipment_id, equipment_name, category_id, lab_resource_id, \
         serial_number, condition, status, purchase_date \
         FROM equipment \
         WHERE ($1::int IS NULL OR category_id = $1) \
         AND ($2::int IS NULL OR lab_resource_id = $2) \
         AND ($3::text IS NULL OR status = $3) \
         AND ($4::text IS NULL OR condition = $4) \
         ORDER BY equipment_id DESC",
    )
    .bind(&params.category_id)
    .bind(&params.lab_resource_id)
    .bind(&params.status)
    .bind(&params.condition)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(json!({ "equipment": equipment })))
}

// ── GET /api/equipment/:id ───────────────────────────────────────────────

async fn get_equipment(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<Json<Value>, AppError> {
    let equipment = sqlx::query_as::<_, Equipment>(
        "SELECT equipment_id, equipment_name, category_id, lab_resource_id, \
         serial_number, condition, status, purchase_date \
         FROM equipment WHERE equipment_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Equipment not found".to_string()))?;

    Ok(Json(json!({ "equipment": equipment })))
}

// ── POST /api/equipment ─────────────────────────────────────────────────

async fn create_equipment(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<CreateEquipmentRequest>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    auth.require_admin()?;

    let equipment = sqlx::query_as::<_, Equipment>(
        "INSERT INTO equipment \
         (equipment_name, category_id, lab_resource_id, serial_number, condition, status, purchase_date) \
         VALUES ($1, $2, $3, $4, $5, $6, $7) \
         RETURNING equipment_id, equipment_name, category_id, lab_resource_id, \
         serial_number, condition, status, purchase_date",
    )
    .bind(&payload.equipment_name)
    .bind(payload.category_id)
    .bind(&payload.lab_resource_id)
    .bind(&payload.serial_number)
    .bind(payload.condition.as_deref().unwrap_or("good"))
    .bind(payload.status.as_deref().unwrap_or("available"))
    .bind(&payload.purchase_date)
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(json!({ "equipment": equipment }))))
}

// ── PUT /api/equipment/:id ──────────────────────────────────────────────

async fn update_equipment(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateEquipmentRequest>,
) -> Result<Json<Value>, AppError> {
    auth.require_admin()?;

    let current = sqlx::query_as::<_, Equipment>(
        "SELECT equipment_id, equipment_name, category_id, lab_resource_id, \
         serial_number, condition, status, purchase_date \
         FROM equipment WHERE equipment_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Equipment not found".to_string()))?;

    let equipment = sqlx::query_as::<_, Equipment>(
        "UPDATE equipment SET \
         equipment_name = $1, category_id = $2, lab_resource_id = $3, \
         serial_number = $4, condition = $5, status = $6, purchase_date = $7 \
         WHERE equipment_id = $8 \
         RETURNING equipment_id, equipment_name, category_id, lab_resource_id, \
         serial_number, condition, status, purchase_date",
    )
    .bind(payload.equipment_name.as_ref().unwrap_or(&current.equipment_name))
    .bind(payload.category_id.unwrap_or(current.category_id))
    .bind(payload.lab_resource_id.or(current.lab_resource_id))
    .bind(payload.serial_number.as_ref().or(current.serial_number.as_ref()))
    .bind(payload.condition.as_ref().unwrap_or(&current.condition))
    .bind(payload.status.as_ref().unwrap_or(&current.status))
    .bind(payload.purchase_date.or(current.purchase_date))
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(json!({ "equipment": equipment })))
}

// ── DELETE /api/equipment/:id ───────────────────────────────────────────

async fn delete_equipment(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    auth.require_admin()?;

    let result = sqlx::query("DELETE FROM equipment WHERE equipment_id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Equipment not found".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}
