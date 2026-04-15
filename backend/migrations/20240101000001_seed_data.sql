-- CampusFlow Seed Data
-- Adds sample users, physical resources, and bookings for testing

-- Add default password for all users: "Password123!"

-- ═══════════════════════════════════════════════════════════════
-- Sample Users (password_hash for "Password123!")
-- Roles: admin=1, faculty=2, student=3, lab_assistant=4
-- ═══════════════════════════════════════════════════════════════
INSERT INTO users (full_name, email, password_hash, role_id, department, created_at) VALUES
    (
        'Alice Johnson',
        'alice.johnson@university.edu',
        '$2b$12$3OnVHjnRgBZ4jUbBWTlqJumrUv7qpklooSSIQ9Fftmi6zXQeyYPoS',
        3, -- student
        'Computer Science',
        '2025-09-01 08:00:00'
    ),
    (
        'Dr. Robert Smith',
        'robert.smith@university.edu',
        '$2b$12$3OnVHjnRgBZ4jUbBWTlqJumrUv7qpklooSSIQ9Fftmi6zXQeyYPoS',
        2, -- faculty
        'Physics',
        '2025-08-15 09:30:00'
    ),
    (
        'Emily Davis',
        'emily.davis@university.edu',
        '$2b$12$3OnVHjnRgBZ4jUbBWTlqJumrUv7qpklooSSIQ9Fftmi6zXQeyYPoS',
        3, -- student
        'Mathematics',
        '2025-09-10 10:15:00'
    ),
    (
        'Dr. Michael Chen',
        'michael.chen@university.edu',
        '$2b$12$3OnVHjnRgBZ4jUbBWTlqJumrUv7qpklooSSIQ9Fftmi6zXQeyYPoS',
        2, -- faculty
        'Computer Science',
        '2025-07-20 14:00:00'
    ),
    (
        'Admin',
        'nnm24cs315@nmamit.in',
        '$2a$12$fHaF8/5sKD.v.8GoiRg6SOYKfa58/THsqg5Ri3Au02LPycAv75zvG', -- admin@123
        1, -- admin
        'Administration',
        '2025-06-01 08:30:00'
    ),
    (
        'David Brown',
        'david.brown@university.edu',
        '$2b$12$3OnVHjnRgBZ4jUbBWTlqJumrUv7qpklooSSIQ9Fftmi6zXQeyYPoS',
        3, -- student
        'Chemistry',
        '2025-09-05 11:45:00'
    ),
    (
        'Prof. Jennifer Lee',
        'jennifer.lee@university.edu',
        '$2b$12$3OnVHjnRgBZ4jUbBWTlqJumrUv7qpklooSSIQ9Fftmi6zXQeyYPoS',
        2, -- faculty
        'English Literature',
        '2025-07-01 10:00:00'
    ),
    (
        'Prof. James Wilson',
        'james.wilson@university.edu',
        '$2b$12$3OnVHjnRgBZ4jUbBWTlqJumrUv7qpklooSSIQ9Fftmi6zXQeyYPoS',
        2, -- faculty
        'History',
        '2025-06-15 09:00:00'
    ),
    (
        '实验室助手1',
        'lab.assistant@university.edu',
        '$2b$12$3OnVHjnRgBZ4jUbBWTlqJumrUv7qpklooSSIQ9Fftmi6zXQeyYPoS',
        4, -- lab_assistant
        'Computer Science',
        '2025-08-01 08:00:00'
    ),
    (
        'Lisa Garcia',
        'lisa.garcia@university.edu',
        '$2b$12$3OnVHjnRgBZ4jUbBWTlqJumrUv7qpklooSSIQ9Fftmi6zXQeyYPoS',
        3, -- student
        'Biology',
        '2025-09-15 12:00:00'
    )
ON CONFLICT (email) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Sample Physical Resources
-- ═══════════════════════════════════════════════════════════════
INSERT INTO physical_resources (resource_name, resource_type, capacity, location, has_projector, has_ac, department, status, created_at) VALUES
    ('Computer Lab A', 'computer_lab', 30, 'Engineering Building, Room 101', true, true, 'Computer Science', 'available', '2025-01-15 09:00:00'),
    ('Physics Lab 1', 'science_lab', 25, 'Science Block, Room 205', true, true, 'Physics', 'available', '2025-01-15 09:00:00'),
    ('Lecture Hall 1', 'lecture_hall', 100, 'Main Building, Ground Floor', true, false, 'General', 'available', '2025-01-15 09:00:00'),
    ('Chemistry Lab A', 'science_lab', 20, 'Science Block, Room 301', true, true, 'Chemistry', 'available', '2025-01-15 09:00:00'),
    ('Mathematics Room', 'classroom', 40, 'Mathematics Building, Room 102', true, false, 'Mathematics', 'available', '2025-01-15 09:00:00'),
    ('Seminar Room B', 'seminar_room', 15, 'Research Block, Room 210', true, true, 'General', 'available', '2025-01-15 09:00:00'),
    ('Computer Lab B', 'computer_lab', 28, 'Engineering Building, Room 105', true, true, 'Computer Science', 'available', '2025-01-15 09:00:00'),
    ('Auditorium', 'auditorium', 200, 'Main Building, First Floor', true, true, 'General', 'available', '2025-01-15 09:00:00'),
    ('Electronics Lab', 'laboratory', 20, 'Engineering Building, Room 201', true, true, 'Electronics', 'available', '2025-01-15 09:00:00'),
    ('Group Study Room 1', 'classroom', 6, 'Library Basement, Room 101', false, false, 'General', 'available', '2025-01-20 10:00:00')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Sample Bookings (with proper timestamps)
-- Status: pending, approved, rejected, cancelled
-- ═══════════════════════════════════════════════════════════════
INSERT INTO bookings (user_id, resource_id, start_time, end_time, booking_status, purpose) VALUES
    -- Pending bookings
    (1, 1, '2026-04-20 09:00:00', '2026-04-20 11:00:00', 'pending', 'Final project demonstration for Software Engineering course'),
    (3, 5, '2026-04-22 14:00:00', '2026-04-22 16:00:00', 'pending', 'Study group session for Advanced Mathematics'),
    (6, 4, '2026-04-25 10:00:00', '2026-04-25 13:00:00', 'pending', 'Organic chemistry lab practice'),
    (9, 2, '2026-04-28 09:00:00', '2026-04-28 12:00:00', 'pending', 'Quantum physics tutorial session'),

    -- Approved bookings
    (2, 2, '2026-04-15 09:00:00', '2026-04-15 12:00:00', 'approved', 'Quantum Mechanics practical examination'),
    (2, 3, '2026-04-16 10:00:00', '2026-04-16 12:00:00', 'approved', 'Thermodynamics lecture'),
    (4, 1, '2026-04-17 14:00:00', '2026-04-17 16:00:00', 'approved', 'Database Management Systems lab session'),
    (6, 4, '2026-04-18 09:00:00', '2026-04-18 12:00:00', 'approved', 'Analytical chemistry practical'),
    (7, 6, '2026-04-19 14:00:00', '2026-04-19 16:00:00', 'approved', 'Literature seminar discussion'),

    -- Rejected bookings
    (1, 7, '2026-04-12 09:00:00', '2026-04-12 11:00:00', 'rejected', 'Game development workshop'),
    (3, 3, '2026-04-13 08:00:00', '2026-04-13 10:00:00', 'rejected', 'Student party'),

    -- Cancelled bookings
    (4, 6, '2026-04-10 14:00:00', '2026-04-10 16:00:00', 'cancelled', 'Algorithm design workshop'),
    (2, 8, '2026-04-11 10:00:00', '2026-04-11 12:00:00', 'cancelled', 'Physics department meeting')
ON CONFLICT DO NOTHING;
