use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
};
use std::sync::Arc;

use crate::auth::jwt::decode_token;
use crate::errors::AppError;
use crate::AppState;

/// Extractor that validates the JWT access token from the Authorization header
/// and injects the authenticated user's identity into route handlers.
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct AuthUser {
    pub user_id: i32,
    pub email: String,
    pub role: String,
}

impl AuthUser {
    /// Require the user to be an admin. Returns Forbidden if not.
    pub fn require_admin(&self) -> Result<(), AppError> {
        if self.role != "admin" {
            return Err(AppError::Forbidden("Admin access required".to_string()));
        }
        Ok(())
    }

    /// Require the user to have one of the given roles.
    #[allow(dead_code)]
    pub fn require_role(&self, allowed: &[&str]) -> Result<(), AppError> {
        if !allowed.contains(&self.role.as_str()) {
            return Err(AppError::Forbidden(format!(
                "Required role: one of {:?}",
                allowed
            )));
        }
        Ok(())
    }
}

#[async_trait]
impl FromRequestParts<Arc<AppState>> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &Arc<AppState>,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| {
                AppError::Unauthorized("Missing Authorization header".to_string())
            })?;

        let token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
            AppError::Unauthorized(
                "Invalid authorization format. Expected: Bearer <token>".to_string(),
            )
        })?;

        let claims =
            decode_token(token, &state.config.jwt_access_secret, "access").map_err(|e| {
                AppError::Unauthorized(format!("Invalid access token: {}", e))
            })?;

        Ok(AuthUser {
            user_id: claims.sub,
            email: claims.email,
            role: claims.role,
        })
    }
}
