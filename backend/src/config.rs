use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub jwt_access_secret: String,
    pub jwt_refresh_secret: String,
    pub access_token_expiry: i64,
    pub refresh_token_expiry: i64,
    pub smtp_username: String,
    pub smtp_password: String,
    pub smtp_from: String,
    pub otp_expiry: u64,
    pub otp_cooldown: u64,
    pub otp_max_attempts: u32,
    pub smtp_rate_limit: u32,
    pub server_host: String,
    pub server_port: u16,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL")
                .expect("DATABASE_URL must be set"),

            jwt_access_secret: env::var("JWT_ACCESS_SECRET")
                .expect("JWT_ACCESS_SECRET must be set"),
            jwt_refresh_secret: env::var("JWT_REFRESH_SECRET")
                .expect("JWT_REFRESH_SECRET must be set"),
            access_token_expiry: env::var("ACCESS_TOKEN_EXPIRY")
                .unwrap_or_else(|_| "900".to_string())
                .parse()
                .expect("ACCESS_TOKEN_EXPIRY must be a number"),
            refresh_token_expiry: env::var("REFRESH_TOKEN_EXPIRY")
                .unwrap_or_else(|_| "604800".to_string())
                .parse()
                .expect("REFRESH_TOKEN_EXPIRY must be a number"),

            smtp_username: env::var("SMTP_USERNAME").unwrap_or_default(),
            smtp_password: env::var("SMTP_PASSWORD").unwrap_or_default(),
            smtp_from: env::var("SMTP_FROM").unwrap_or_default(),

            otp_expiry: env::var("OTP_EXPIRY")
                .unwrap_or_else(|_| "300".to_string())
                .parse()
                .expect("OTP_EXPIRY must be a number"),
            otp_cooldown: env::var("OTP_COOLDOWN")
                .unwrap_or_else(|_| "60".to_string())
                .parse()
                .expect("OTP_COOLDOWN must be a number"),
            otp_max_attempts: env::var("OTP_MAX_ATTEMPTS")
                .unwrap_or_else(|_| "5".to_string())
                .parse()
                .expect("OTP_MAX_ATTEMPTS must be a number"),

            smtp_rate_limit: env::var("SMTP_RATE_LIMIT")
                .unwrap_or_else(|_| "10".to_string())
                .parse()
                .expect("SMTP_RATE_LIMIT must be a number"),

            server_host: env::var("SERVER_HOST")
                .unwrap_or_else(|_| "127.0.0.1".to_string()),
            server_port: env::var("SERVER_PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("SERVER_PORT must be a number"),
        }
    }
}
