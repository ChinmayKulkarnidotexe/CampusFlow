use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct MaintenanceLog {
    pub maintenance_id: i32,
    pub resource_type: String,
    pub resource_id: i32,
    pub issue_reported: String,
    pub reported_date: NaiveDateTime,
    pub resolved_date: Option<NaiveDateTime>,
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateMaintenanceLogRequest {
    pub resource_type: String,
    pub resource_id: i32,
    pub issue_reported: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMaintenanceLogRequest {
    pub resolved_date: Option<NaiveDateTime>,
    pub status: Option<String>,
    pub issue_reported: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct MaintenanceLogQuery {
    pub resource_type: Option<String>,
    pub resource_id: Option<i32>,
    pub status: Option<String>,
}
