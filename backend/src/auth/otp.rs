use dashmap::DashMap;
use rand::Rng;
use std::time::{Duration, Instant};

pub struct OtpEntry {
    pub code: String,
    pub created_at: Instant,
    pub attempts: u32,
}

pub struct OtpStore {
    store: DashMap<String, OtpEntry>,
    expiry: Duration,
    cooldown: Duration,
    max_attempts: u32,
}

#[derive(Debug)]
pub enum OtpError {
    NotFound,
    Expired,
    MaxAttemptsExceeded,
    CooldownActive(u64),
}

impl std::fmt::Display for OtpError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            OtpError::NotFound => write!(f, "No OTP found for this email. Please request a new one."),
            OtpError::Expired => write!(f, "OTP has expired. Please request a new one."),
            OtpError::MaxAttemptsExceeded => write!(f, "Maximum verification attempts exceeded. Please request a new OTP."),
            OtpError::CooldownActive(secs) => write!(f, "Please wait {} seconds before requesting a new OTP.", secs),
        }
    }
}

impl OtpStore {
    pub fn new(expiry_secs: u64, cooldown_secs: u64, max_attempts: u32) -> Self {
        Self {
            store: DashMap::new(),
            expiry: Duration::from_secs(expiry_secs),
            cooldown: Duration::from_secs(cooldown_secs),
            max_attempts,
        }
    }

    /// Generate a random 6-digit OTP code.
    pub fn generate_otp(&self) -> String {
        let mut rng = rand::thread_rng();
        let otp: u32 = rng.gen_range(100_000..999_999);
        otp.to_string()
    }

    /// Store an OTP for the given email (replaces any existing one).
    pub fn store_otp(&self, email: &str, code: &str) {
        self.store.insert(
            email.to_lowercase(),
            OtpEntry {
                code: code.to_string(),
                created_at: Instant::now(),
                attempts: 0,
            },
        );
    }

    /// Verify an OTP code. Returns Ok(true) if valid, Ok(false) if wrong code,
    /// or Err with the reason (expired, max attempts, etc).
    pub fn verify_otp(&self, email: &str, code: &str) -> Result<bool, OtpError> {
        let email = email.to_lowercase();

        let mut entry = self
            .store
            .get_mut(&email)
            .ok_or(OtpError::NotFound)?;

        // Check expiry
        if entry.created_at.elapsed() > self.expiry {
            drop(entry);
            self.store.remove(&email);
            return Err(OtpError::Expired);
        }

        // Check max attempts
        if entry.attempts >= self.max_attempts {
            return Err(OtpError::MaxAttemptsExceeded);
        }

        entry.attempts += 1;

        if entry.code == code {
            drop(entry);
            self.store.remove(&email);
            Ok(true)
        } else {
            Ok(false)
        }
    }

    /// Check whether a new OTP can be sent (cooldown must have elapsed).
    pub fn can_resend(&self, email: &str) -> Result<(), OtpError> {
        let email = email.to_lowercase();

        if let Some(entry) = self.store.get(&email) {
            let elapsed = entry.created_at.elapsed();
            if elapsed < self.cooldown {
                let remaining = (self.cooldown - elapsed).as_secs();
                return Err(OtpError::CooldownActive(remaining));
            }
        }

        Ok(())
    }

    /// Remove expired OTP entries (called by background task).
    pub fn cleanup_expired(&self) {
        self.store
            .retain(|_, entry| entry.created_at.elapsed() < self.expiry);
    }
}
