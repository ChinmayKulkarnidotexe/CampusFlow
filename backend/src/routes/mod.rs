pub mod auth;
pub mod bookings;
pub mod equipment;
pub mod equipment_categories;
pub mod equipment_issues;
pub mod maintenance_logs;
pub mod physical_resources;
pub mod roles;
pub mod users;

use axum::Router;
use std::sync::Arc;

use crate::AppState;

/// Build the `/api` router by nesting all resource routers.
pub fn api_routes() -> Router<Arc<AppState>> {
    Router::new()
        .nest("/auth", auth::router())
        .nest("/users", users::router())
        .nest("/roles", roles::router())
        .nest("/physical-resources", physical_resources::router())
        .nest("/equipment-categories", equipment_categories::router())
        .nest("/equipment", equipment::router())
        .nest("/bookings", bookings::router())
        .nest("/equipment-issues", equipment_issues::router())
        .nest("/maintenance-logs", maintenance_logs::router())
}
