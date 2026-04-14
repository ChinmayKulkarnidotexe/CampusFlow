use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct EquipmentIssue {
    pub issue_id: i32,
    pub equipment_id: i32,
    pub user_id: i32,
    pub issue_time: NaiveDateTime,
    pub expected_return: Option<NaiveDateTime>,
    pub actual_return: Option<NaiveDateTime>,
    pub issue_status: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateEquipmentIssueRequest {
    pub equipment_id: i32,
    pub user_id: i32,
    pub expected_return: Option<NaiveDateTime>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateEquipmentIssueRequest {
    pub actual_return: Option<NaiveDateTime>,
    pub issue_status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct EquipmentIssueQuery {
    pub equipment_id: Option<i32>,
    pub user_id: Option<i32>,
    pub issue_status: Option<String>,
}
