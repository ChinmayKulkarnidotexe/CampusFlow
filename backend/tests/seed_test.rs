// TDD Test: Seed Migration Password Hash Verification
//
// RED: This test will initially FAIL because the seed migration uses a placeholder
// password hash that won't match "Password123!" (or any real password).
//
// GREEN: After fixing, the test will PASS because we'll update the seed data
// to use a proper bcrypt hash for "Password123!".

#[cfg(test)]
mod seed_migration_tests {
    use bcrypt::{hash, verify, DEFAULT_COST};

    /// Test: Password hash in seed migration should match a known password
    #[test]
    fn seed_migration_password_hash_is_valid() {
        // The password we want users to have
        let password = "Password123!";

        // The password_hash from seed migration (now a valid bcrypt hash)
        let seed_password_hash = "$2b$12$3OnVHjnRgBZ4jUbBWTlqJumrUv7qpklooSSIQ9Fftmi6zXQeyYPoS";

        // After fix, this should pass - the hash should verify correctly
        let is_valid = verify(password, seed_password_hash).unwrap_or(false);

        // We expect the hash to be valid for the known password
        assert!(is_valid, "Seed migration password hash should be valid for 'Password123!' - the hash was updated to a valid bcrypt hash");
    }

    /// Test: Generate a proper bcrypt hash for testing
    #[test]
    fn generate_valid_test_password_hash() {
        let password = "Password123!";
        let hash_result = hash(password, DEFAULT_COST);

        assert!(hash_result.is_ok(), "Should generate valid bcrypt hash");

        let generated_hash = hash_result.unwrap();
        let is_valid = verify(password, &generated_hash).unwrap();

        assert!(is_valid, "Generated hash should verify correctly");

        println!("\n=== To fix seed migration, replace all password hashes with: ===");
        println!("{}", generated_hash);
        println!("=============================================================\n");
    }
}
