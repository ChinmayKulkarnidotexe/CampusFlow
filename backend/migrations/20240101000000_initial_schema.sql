-- CampusFlow Initial Schema

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    role_id   SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Users (with password_hash for auth)
CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INTEGER NOT NULL REFERENCES roles(role_id),
    department    VARCHAR(255),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Physical Resources
CREATE TABLE IF NOT EXISTS physical_resources (
    resource_id   SERIAL PRIMARY KEY,
    resource_name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    capacity      INTEGER NOT NULL DEFAULT 0,
    location      VARCHAR(255) NOT NULL,
    has_projector BOOLEAN NOT NULL DEFAULT FALSE,
    has_ac        BOOLEAN NOT NULL DEFAULT FALSE,
    department    VARCHAR(255),
    status        VARCHAR(50) NOT NULL DEFAULT 'available',
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Equipment Categories
CREATE TABLE IF NOT EXISTS equipment_categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id    SERIAL PRIMARY KEY,
    equipment_name  VARCHAR(255) NOT NULL,
    category_id     INTEGER NOT NULL REFERENCES equipment_categories(category_id),
    lab_resource_id INTEGER REFERENCES physical_resources(resource_id),
    serial_number   VARCHAR(255) UNIQUE,
    condition       VARCHAR(50) NOT NULL DEFAULT 'good',
    status          VARCHAR(50) NOT NULL DEFAULT 'available',
    purchase_date   DATE
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    booking_id     SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(user_id),
    resource_id    INTEGER NOT NULL REFERENCES physical_resources(resource_id),
    start_time     TIMESTAMP NOT NULL,
    end_time       TIMESTAMP NOT NULL,
    booking_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    purpose        TEXT
);

-- Equipment Issue
CREATE TABLE IF NOT EXISTS equipment_issue (
    issue_id        SERIAL PRIMARY KEY,
    equipment_id    INTEGER NOT NULL REFERENCES equipment(equipment_id),
    user_id         INTEGER NOT NULL REFERENCES users(user_id),
    issue_time      TIMESTAMP NOT NULL DEFAULT NOW(),
    expected_return TIMESTAMP,
    actual_return   TIMESTAMP,
    issue_status    VARCHAR(50) NOT NULL DEFAULT 'issued'
);

-- Maintenance Logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
    maintenance_id SERIAL PRIMARY KEY,
    resource_type  VARCHAR(100) NOT NULL,
    resource_id    INTEGER NOT NULL,
    issue_reported TEXT NOT NULL,
    reported_date  TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_date  TIMESTAMP,
    status         VARCHAR(50) NOT NULL DEFAULT 'reported'
);

-- ═══════════════════════════════════════════════════════════════
-- Seed default roles
-- ═══════════════════════════════════════════════════════════════
INSERT INTO roles (role_name) VALUES
    ('admin'),
    ('faculty'),
    ('student'),
    ('lab_assistant')
ON CONFLICT (role_name) DO NOTHING;
