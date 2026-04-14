use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// ── Equipment Category ───────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct EquipmentCategory {
    pub category_id: i32,
    pub category_name: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateEquipmentCategoryRequest {
    pub category_name: String,
}

// ── Equipment ────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Equipment {
    pub equipment_id: i32,
    pub equipment_name: String,
    pub category_id: i32,
    pub lab_resource_id: Option<i32>,
    pub serial_number: Option<String>,
    pub condition: String,
    pub status: String,
    pub purchase_date: Option<NaiveDate>,
}

#[derive(Debug, Deserialize)]
pub struct CreateEquipmentRequest {
    pub equipment_name: String,
    pub category_id: i32,
    pub lab_resource_id: Option<i32>,
    pub serial_number: Option<String>,
    pub condition: Option<String>,
    pub status: Option<String>,
    pub purchase_date: Option<NaiveDate>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateEquipmentRequest {
    pub equipment_name: Option<String>,
    pub category_id: Option<i32>,
    pub lab_resource_id: Option<i32>,
    pub serial_number: Option<String>,
    pub condition: Option<String>,
    pub status: Option<String>,
    pub purchase_date: Option<NaiveDate>,
}

#[derive(Debug, Deserialize)]
pub struct EquipmentQuery {
    pub category_id: Option<i32>,
    pub lab_resource_id: Option<i32>,
    pub status: Option<String>,
    pub condition: Option<String>,
}
