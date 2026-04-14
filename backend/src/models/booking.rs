use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Booking {
    pub booking_id: i32,
    pub user_id: i32,
    pub resource_id: i32,
    pub start_time: NaiveDateTime,
    pub end_time: NaiveDateTime,
    pub booking_status: String,
    pub purpose: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBookingRequest {
    pub resource_id: i32,
    pub start_time: NaiveDateTime,
    pub end_time: NaiveDateTime,
    pub purpose: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBookingRequest {
    pub booking_status: Option<String>,
    pub start_time: Option<NaiveDateTime>,
    pub end_time: Option<NaiveDateTime>,
    pub purpose: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct BookingQuery {
    pub user_id: Option<i32>,
    pub resource_id: Option<i32>,
    pub booking_status: Option<String>,
}
