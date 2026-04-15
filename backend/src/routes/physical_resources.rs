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
use crate::models::physical_resource::*;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_resources).post(create_resource))
        .route("/:id", get(get_resource).put(update_resource).delete(delete_resource))
}

// ── GET /api/physical-resources ──────────────────────────────────────────

async fn list_resources(
    State(state): State<Arc<AppState>>,
    Query(params): Query<PhysicalResourceQuery>,
) -> Result<Json<Value>, AppError> {
    let resources = sqlx::query_as::<_, PhysicalResource>(
        "SELECT resource_id, resource_name, resource_type, capacity, location, \
         has_projector, has_ac, department, status, created_at \
         FROM physical_resources \
         WHERE ($1::text IS NULL OR resource_type = $1) \
         AND ($2::text IS NULL OR department = $2) \
         AND ($3::text IS NULL OR status = $3) \
         AND ($4::bool IS NULL OR has_projector = $4) \
         AND ($5::bool IS NULL OR has_ac = $5) \
         ORDER BY created_at DESC",
    )
    .bind(&params.resource_type)
    .bind(&params.department)
    .bind(&params.status)
    .bind(&params.has_projector)
    .bind(&params.has_ac)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(json!({ "resources": resources })))
}

// ── GET /api/physical-resources/:id ──────────────────────────────────────

async fn get_resource(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i32>,
) -> Result<Json<Value>, AppError> {
    let resource = sqlx::query_as::<_, PhysicalResource>(
        "SELECT resource_id, resource_name, resource_type, capacity, location, \
         has_projector, has_ac, department, status, created_at \
         FROM physical_resources WHERE resource_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Resource not found".to_string()))?;

    Ok(Json(json!({ "resource": resource })))
}

// ── POST /api/physical-resources ─────────────────────────────────────────

async fn create_resource(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<CreatePhysicalResourceRequest>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    auth.require_admin()?;

    let resource = sqlx::query_as::<_, PhysicalResource>(
        "INSERT INTO physical_resources \
         (resource_name, resource_type, capacity, location, has_projector, has_ac, department, status) \
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) \
         RETURNING resource_id, resource_name, resource_type, capacity, location, \
         has_projector, has_ac, department, status, created_at",
    )
    .bind(&payload.resource_name)
    .bind(&payload.resource_type)
    .bind(payload.capacity.unwrap_or(0))
    .bind(&payload.location)
    .bind(payload.has_projector.unwrap_or(false))
    .bind(payload.has_ac.unwrap_or(false))
    .bind(&payload.department)
    .bind(payload.status.as_deref().unwrap_or("available"))
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(json!({ "resource": resource }))))
}

// ── PUT /api/physical-resources/:id ──────────────────────────────────────

async fn update_resource(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
    Json(payload): Json<UpdatePhysicalResourceRequest>,
) -> Result<Json<Value>, AppError> {
    auth.require_admin()?;

    let current = sqlx::query_as::<_, PhysicalResource>(
        "SELECT resource_id, resource_name, resource_type, capacity, location, \
         has_projector, has_ac, department, status, created_at \
         FROM physical_resources WHERE resource_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Resource not found".to_string()))?;

    let resource = sqlx::query_as::<_, PhysicalResource>(
        "UPDATE physical_resources SET \
         resource_name = $1, resource_type = $2, capacity = $3, location = $4, \
         has_projector = $5, has_ac = $6, department = $7, status = $8 \
         WHERE resource_id = $9 \
         RETURNING resource_id, resource_name, resource_type, capacity, location, \
         has_projector, has_ac, department, status, created_at",
    )
    .bind(payload.resource_name.as_ref().unwrap_or(&current.resource_name))
    .bind(payload.resource_type.as_ref().unwrap_or(&current.resource_type))
    .bind(payload.capacity.unwrap_or(current.capacity))
    .bind(payload.location.as_ref().unwrap_or(&current.location))
    .bind(payload.has_projector.unwrap_or(current.has_projector))
    .bind(payload.has_ac.unwrap_or(current.has_ac))
    .bind(payload.department.as_ref().or(current.department.as_ref()))
    .bind(payload.status.as_ref().unwrap_or(&current.status))
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(json!({ "resource": resource })))
}

// ── DELETE /api/physical-resources/:id ───────────────────────────────────

async fn delete_resource(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    auth.require_admin()?;

    let result = sqlx::query("DELETE FROM physical_resources WHERE resource_id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Resource not found".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}
