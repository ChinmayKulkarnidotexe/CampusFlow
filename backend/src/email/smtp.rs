use dashmap::DashMap;
use lettre::{
    message::header::ContentType,
    transport::smtp::authentication::Credentials,
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
};
use std::time::{SystemTime, UNIX_EPOCH};

// ── Rate limiter (max N emails per minute) ───────────────────────────────

pub struct EmailRateLimiter {
    counts: DashMap<u64, u32>,
    max_per_minute: u32,
}

impl EmailRateLimiter {
    pub fn new(max_per_minute: u32) -> Self {
        Self {
            counts: DashMap::new(),
            max_per_minute,
        }
    }

    /// Returns `true` if the send is allowed (and increments the counter).
    pub fn check_and_increment(&self) -> bool {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let minute_bucket = now / 60;

        // Prune old buckets
        self.counts
            .retain(|k, _| *k >= minute_bucket.saturating_sub(1));

        let mut count = self.counts.entry(minute_bucket).or_insert(0);
        if *count >= self.max_per_minute {
            false
        } else {
            *count += 1;
            true
        }
    }
}

// ── SMTP Mailer ──────────────────────────────────────────────────────────

pub struct SmtpMailer {
    transport: AsyncSmtpTransport<Tokio1Executor>,
    from: String,
    rate_limiter: EmailRateLimiter,
}

impl SmtpMailer {
    /// Create a new mailer. Returns `None` if SMTP credentials are empty (dev mode).
    pub fn new(username: &str, password: &str, from: &str, rate_limit: u32) -> Option<Self> {
        if username.is_empty() || password.is_empty() {
            tracing::warn!("SMTP credentials not configured — email sending disabled");
            return None;
        }

        let creds = Credentials::new(username.to_string(), password.to_string());

        let transport = AsyncSmtpTransport::<Tokio1Executor>::relay("smtp.gmail.com")
            .expect("Failed to create SMTP relay")
            .credentials(creds)
            .build();

        Some(Self {
            transport,
            from: from.to_string(),
            rate_limiter: EmailRateLimiter::new(rate_limit),
        })
    }

    /// Send an OTP verification email with a styled HTML template.
    pub async fn send_otp_email(&self, to: &str, otp_code: &str) -> Result<(), String> {
        if !self.rate_limiter.check_and_increment() {
            return Err("Email rate limit exceeded. Please try again later.".to_string());
        }

        let html_body = format!(
            r#"<!DOCTYPE html>
<html><head><style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }}
    .container {{ max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px;
                  box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               padding: 32px 24px; text-align: center; }}
    .header h1 {{ color: #fff; margin: 0; font-size: 24px; }}
    .body {{ padding: 32px 24px; text-align: center; }}
    .otp-code {{ font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea;
                 background: #f0f2ff; padding: 16px 32px; border-radius: 8px;
                 display: inline-block; margin: 24px 0; }}
    .footer {{ padding: 16px 24px; text-align: center; color: #888; font-size: 13px;
               border-top: 1px solid #eee; }}
</style></head>
<body>
<div class="container">
    <div class="header"><h1>CampusFlow</h1></div>
    <div class="body">
        <p>Your one-time verification code is:</p>
        <div class="otp-code">{otp_code}</div>
        <p style="color:#666;font-size:14px;">
            This code expires in <strong>5 minutes</strong>.<br>Do not share it with anyone.
        </p>
    </div>
    <div class="footer">If you didn't request this, please ignore this email.</div>
</div>
</body></html>"#
        );

        let email = Message::builder()
            .from(self.from.parse().map_err(|e| format!("Invalid from address: {}", e))?)
            .to(to.parse().map_err(|e| format!("Invalid to address: {}", e))?)
            .subject("CampusFlow — Your Login OTP")
            .header(ContentType::TEXT_HTML)
            .body(html_body)
            .map_err(|e| format!("Failed to build email: {}", e))?;

        self.transport
            .send(email)
            .await
            .map_err(|e| format!("Failed to send email: {}", e))?;

        tracing::info!("OTP email sent to {}", to);
        Ok(())
    }

    /// Send a "login successful" notification email.
    pub async fn send_login_success_email(&self, to: &str, user_name: &str) -> Result<(), String> {
        if !self.rate_limiter.check_and_increment() {
            tracing::warn!("Rate limited: skipping login success email for {}", to);
            return Ok(()); // don't fail login over a notification
        }

        let html_body = format!(
            r#"<!DOCTYPE html>
<html><head><style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }}
    .container {{ max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px;
                  box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
               padding: 32px 24px; text-align: center; }}
    .header h1 {{ color: #fff; margin: 0; font-size: 24px; }}
    .body {{ padding: 32px 24px; text-align: center; }}
    .footer {{ padding: 16px 24px; text-align: center; color: #888; font-size: 13px;
               border-top: 1px solid #eee; }}
</style></head>
<body>
<div class="container">
    <div class="header"><h1>Login Successful</h1></div>
    <div class="body">
        <p>Hi <strong>{user_name}</strong>,</p>
        <p>You've successfully logged into <strong>CampusFlow</strong>.</p>
        <p style="color:#666;font-size:14px;">
            If this wasn't you, please contact your administrator immediately.
        </p>
    </div>
    <div class="footer">CampusFlow — Campus Resource Management</div>
</div>
</body></html>"#
        );

        let email = Message::builder()
            .from(self.from.parse().map_err(|e| format!("Invalid from: {}", e))?)
            .to(to.parse().map_err(|e| format!("Invalid to: {}", e))?)
            .subject("CampusFlow — Login Successful")
            .header(ContentType::TEXT_HTML)
            .body(html_body)
            .map_err(|e| format!("Failed to build email: {}", e))?;

        self.transport
            .send(email)
            .await
            .map_err(|e| format!("Failed to send email: {}", e))?;

        tracing::info!("Login success email sent to {}", to);
        Ok(())
    }
}
