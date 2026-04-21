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
use crate::models::booking::*;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_bookings).post(create_booking))
        .route("/:id", get(get_booking).put(update_booking).delete(cancel_booking))
        .route("/resource/:id/availability", get(get_resource_availability))
}

// ── GET /api/bookings ────────────────────────────────────────────────────

async fn list_bookings(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Query(params): Query<BookingQuery>,
) -> Result<Json<Value>, AppError> {
    // Admins see all bookings; others only their own
    let bookings = if auth.role == "admin" {
        sqlx::query_as::<_, Booking>(
            "SELECT booking_id, user_id, resource_id, start_time, end_time, \
             booking_status, purpose FROM bookings \
             WHERE ($1::int IS NULL OR user_id = $1) \
             AND ($2::int IS NULL OR resource_id = $2) \
             AND ($3::text IS NULL OR booking_status = $3) \
             ORDER BY start_time DESC",
        )
        .bind(&params.user_id)
        .bind(&params.resource_id)
        .bind(&params.booking_status)
        .fetch_all(&state.db)
        .await?
    } else {
        sqlx::query_as::<_, Booking>(
            "SELECT booking_id, user_id, resource_id, start_time, end_time, \
             booking_status, purpose FROM bookings \
             WHERE user_id = $1 \
             AND ($2::int IS NULL OR resource_id = $2) \
             AND ($3::text IS NULL OR booking_status = $3) \
             ORDER BY start_time DESC",
        )
        .bind(auth.user_id)
        .bind(&params.resource_id)
        .bind(&params.booking_status)
        .fetch_all(&state.db)
        .await?
    };

    Ok(Json(json!({ "bookings": bookings })))
}

// ── GET /api/bookings/:id ────────────────────────────────────────────────

async fn get_booking(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<Json<Value>, AppError> {
    let booking = sqlx::query_as::<_, Booking>(
        "SELECT booking_id, user_id, resource_id, start_time, end_time, \
         booking_status, purpose FROM bookings WHERE booking_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Booking not found".to_string()))?;

    // Non-admin can only see their own
    if auth.role != "admin" && booking.user_id != auth.user_id {
        return Err(AppError::Forbidden("Access denied".to_string()));
    }

    Ok(Json(json!({ "booking": booking })))
}

// ── POST /api/bookings ───────────────────────────────────────────────────

async fn create_booking(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<CreateBookingRequest>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    // Validate time range
    if payload.start_time >= payload.end_time {
        return Err(AppError::BadRequest(
            "start_time must be before end_time".to_string(),
        ));
    }

    // Check for booking conflicts
    let conflict = sqlx::query_scalar::<_, i32>(
        "SELECT booking_id FROM bookings \
         WHERE resource_id = $1 AND booking_status != 'cancelled' \
         AND start_time < $3 AND end_time > $2",
    )
    .bind(payload.resource_id)
    .bind(&payload.start_time)
    .bind(&payload.end_time)
    .fetch_optional(&state.db)
    .await?;

    if conflict.is_some() {
        return Err(AppError::Conflict(
            "Resource already booked for the requested time slot".to_string(),
        ));
    }

    let booking = sqlx::query_as::<_, Booking>(
        "INSERT INTO bookings (user_id, resource_id, start_time, end_time, purpose) \
         VALUES ($1, $2, $3, $4, $5) \
         RETURNING booking_id, user_id, resource_id, start_time, end_time, booking_status, purpose",
    )
    .bind(auth.user_id)
    .bind(payload.resource_id)
    .bind(&payload.start_time)
    .bind(&payload.end_time)
    .bind(&payload.purpose)
    .fetch_one(&state.db)
    .await?;

    // ── Best-effort confirmation email ────────────────────────────────
    if let Some(mailer) = &state.mailer {
        // Look up user email + name and resource name
        let user_row = sqlx::query_as::<_, (String, String)>(
            "SELECT email, full_name FROM users WHERE user_id = $1",
        )
        .bind(auth.user_id)
        .fetch_optional(&state.db)
        .await
        .ok()
        .flatten();

        let resource_name = sqlx::query_scalar::<_, String>(
            "SELECT resource_name FROM physical_resources WHERE resource_id = $1",
        )
        .bind(payload.resource_id)
        .fetch_optional(&state.db)
        .await
        .ok()
        .flatten()
        .unwrap_or_else(|| format!("Resource #{}", payload.resource_id));

        if let Some((email, name)) = user_row {
            let start_str = booking.start_time.format("%Y-%m-%d %H:%M").to_string();
            let end_str = booking.end_time.format("%Y-%m-%d %H:%M").to_string();
            let purpose = booking.purpose.as_deref().unwrap_or("Not specified");
            if let Err(e) = mailer
                .send_booking_confirmation_email(
                    &email, &name, &resource_name, &start_str, &end_str, purpose,
                )
                .await
            {
                tracing::warn!("Failed to send booking confirmation email: {}", e);
            }
        }
    }

    Ok((StatusCode::CREATED, Json(json!({ "booking": booking }))))
}

// ── PUT /api/bookings/:id ────────────────────────────────────────────────

async fn update_booking(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateBookingRequest>,
) -> Result<Json<Value>, AppError> {
    // Only admin can approve / reject
    auth.require_admin()?;

    let current = sqlx::query_as::<_, Booking>(
        "SELECT booking_id, user_id, resource_id, start_time, end_time, \
         booking_status, purpose FROM bookings WHERE booking_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Booking not found".to_string()))?;

    let booking = sqlx::query_as::<_, Booking>(
        "UPDATE bookings SET \
         booking_status = $1, start_time = $2, end_time = $3, purpose = $4 \
         WHERE booking_id = $5 \
         RETURNING booking_id, user_id, resource_id, start_time, end_time, booking_status, purpose",
    )
    .bind(payload.booking_status.as_ref().unwrap_or(&current.booking_status))
    .bind(payload.start_time.unwrap_or(current.start_time))
    .bind(payload.end_time.unwrap_or(current.end_time))
    .bind(payload.purpose.as_ref().or(current.purpose.as_ref()))
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(json!({ "booking": booking })))
}

// ── DELETE /api/bookings/:id (cancel) ────────────────────────────────────

async fn cancel_booking(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<Json<Value>, AppError> {
    let booking = sqlx::query_as::<_, Booking>(
        "SELECT booking_id, user_id, resource_id, start_time, end_time, \
         booking_status, purpose FROM bookings WHERE booking_id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Booking not found".to_string()))?;

    // Users cancel their own; admins cancel any
    if auth.role != "admin" && booking.user_id != auth.user_id {
        return Err(AppError::Forbidden(
            "You can only cancel your own bookings".to_string(),
        ));
    }

    let updated = sqlx::query_as::<_, Booking>(
        "UPDATE bookings SET booking_status = 'cancelled' WHERE booking_id = $1 \
         RETURNING booking_id, user_id, resource_id, start_time, end_time, booking_status, purpose",
    )
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(json!({ "booking": updated })))
}

// ── GET /api/bookings/resource/:id/availability?date=YYYY-MM-DD ──────────

#[derive(Debug, serde::Deserialize)]
struct AvailabilityQuery {
    date: Option<String>, // YYYY-MM-DD
}

async fn get_resource_availability(
    State(state): State<Arc<AppState>>,
    Path(resource_id): Path<i32>,
    Query(params): Query<AvailabilityQuery>,
) -> Result<Json<Value>, AppError> {
    // Default to today if no date is provided
    let date_str = params.date.unwrap_or_else(|| {
        chrono::Local::now().format("%Y-%m-%d").to_string()
    });

    let date = chrono::NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Invalid date format, use YYYY-MM-DD".to_string()))?;

    let day_start = date.and_hms_opt(0, 0, 0).unwrap();
    let day_end = date.and_hms_opt(23, 59, 59).unwrap();

    let bookings = sqlx::query_as::<_, Booking>(
        "SELECT booking_id, user_id, resource_id, start_time, end_time, \
         booking_status, purpose FROM bookings \
         WHERE resource_id = $1 AND booking_status != 'cancelled' \
         AND start_time < $3 AND end_time > $2 \
         ORDER BY start_time ASC",
    )
    .bind(resource_id)
    .bind(day_start)
    .bind(day_end)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(json!({ "bookings": bookings, "date": date_str })))
}
