use chrono::Utc;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i32,           // user_id
    pub email: String,
    pub role: String,       // role_name
    pub token_type: String, // "access" | "refresh"
    pub exp: usize,
    pub iat: usize,
}

pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
}

/// Create an access token (short-lived, used for API access).
pub fn encode_access_token(
    user_id: i32,
    email: &str,
    role: &str,
    secret: &str,
    expiry_seconds: i64,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let claims = Claims {
        sub: user_id,
        email: email.to_string(),
        role: role.to_string(),
        token_type: "access".to_string(),
        iat: now.timestamp() as usize,
        exp: (now.timestamp() + expiry_seconds) as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

/// Create a refresh token (long-lived, used to get new access tokens).
pub fn encode_refresh_token(
    user_id: i32,
    email: &str,
    role: &str,
    secret: &str,
    expiry_seconds: i64,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let claims = Claims {
        sub: user_id,
        email: email.to_string(),
        role: role.to_string(),
        token_type: "refresh".to_string(),
        iat: now.timestamp() as usize,
        exp: (now.timestamp() + expiry_seconds) as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

/// Decode and validate a token, ensuring it matches the expected type.
pub fn decode_token(
    token: &str,
    secret: &str,
    expected_type: &str,
) -> Result<Claims, jsonwebtoken::errors::Error> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;

    if token_data.claims.token_type != expected_type {
        return Err(jsonwebtoken::errors::Error::from(
            jsonwebtoken::errors::ErrorKind::InvalidToken,
        ));
    }

    Ok(token_data.claims)
}

/// Generate both access and refresh tokens as a pair.
pub fn generate_token_pair(
    user_id: i32,
    email: &str,
    role: &str,
    access_secret: &str,
    refresh_secret: &str,
    access_expiry: i64,
    refresh_expiry: i64,
) -> Result<TokenPair, jsonwebtoken::errors::Error> {
    let access_token =
        encode_access_token(user_id, email, role, access_secret, access_expiry)?;
    let refresh_token =
        encode_refresh_token(user_id, email, role, refresh_secret, refresh_expiry)?;

    Ok(TokenPair {
        access_token,
        refresh_token,
    })
}
