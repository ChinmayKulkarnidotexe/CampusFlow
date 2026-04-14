use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PhysicalResource {
    pub resource_id: i32,
    pub resource_name: String,
    pub resource_type: String,
    pub capacity: i32,
    pub location: String,
    pub has_projector: bool,
    pub has_ac: bool,
    pub department: Option<String>,
    pub status: String,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreatePhysicalResourceRequest {
    pub resource_name: String,
    pub resource_type: String,
    pub capacity: Option<i32>,
    pub location: String,
    pub has_projector: Option<bool>,
    pub has_ac: Option<bool>,
    pub department: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePhysicalResourceRequest {
    pub resource_name: Option<String>,
    pub resource_type: Option<String>,
    pub capacity: Option<i32>,
    pub location: Option<String>,
    pub has_projector: Option<bool>,
    pub has_ac: Option<bool>,
    pub department: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PhysicalResourceQuery {
    pub resource_type: Option<String>,
    pub department: Option<String>,
    pub status: Option<String>,
    pub has_projector: Option<bool>,
    pub has_ac: Option<bool>,
}
