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
use crate::models::equipment::{CreateEquipmentCategoryRequest, EquipmentCategory};
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_categories).post(create_category))
        .route("/:id", axum::routing::delete(delete_category))
}

// ── GET /api/equipment-categories ────────────────────────────────────────

async fn list_categories(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
) -> Result<Json<Value>, AppError> {
    let categories = sqlx::query_as::<_, EquipmentCategory>(
        "SELECT category_id, category_name FROM equipment_categories ORDER BY category_name",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(json!({ "categories": categories })))
}

// ── POST /api/equipment-categories ───────────────────────────────────────

async fn create_category(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<CreateEquipmentCategoryRequest>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    auth.require_admin()?;

    let category = sqlx::query_as::<_, EquipmentCategory>(
        "INSERT INTO equipment_categories (category_name) VALUES ($1) \
         RETURNING category_id, category_name",
    )
    .bind(&payload.category_name)
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(json!({ "category": category }))))
}

// ── DELETE /api/equipment-categories/:id ─────────────────────────────────

async fn delete_category(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    auth.require_admin()?;

    let result = sqlx::query("DELETE FROM equipment_categories WHERE category_id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Category not found".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}
