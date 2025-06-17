-- Comprehensive Sample Data for Testing Intelligent Booking System
-- Run this after your schema is set up

-- Clear existing data (if any)
DELETE FROM booking_days;
DELETE FROM bookings;
DELETE FROM center_schedule_exceptions;
DELETE FROM center_operating_days;
DELETE FROM dependents;
DELETE FROM centers;
DELETE FROM users;

-- Insert comprehensive test users covering various scenarios
INSERT INTO users (id, name, email, hashed_pass, zip_code) VALUES 
-- Users in popular zip code 12345 (multiple centers available)
('11111111-1111-1111-1111-111111111111', 'John Doe', 'john@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.HmyfVxzJ1HUTl/4KCk5X0YQXdW3DAa', '12345'),
('22222222-2222-2222-2222-222222222222', 'Sarah Smith', 'sarah@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.HmyfVxzJ1HUTl/4KCk5X0YQXdW3DAa', '12345'),
('33333333-3333-3333-3333-333333333333', 'Emily Johnson', 'emily@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.HmyfVxzJ1HUTl/4KCk5X0YQXdW3DAa', '12345'),

-- Users in secondary zip code 67890 (fewer centers)
('44444444-4444-4444-4444-444444444444', 'Mike Wilson', 'mike@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.HmyfVxzJ1HUTl/4KCk5X0YQXdW3DAa', '67890'),
('55555555-5555-5555-5555-555555555555', 'Lisa Brown', 'lisa@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.HmyfVxzJ1HUTl/4KCk5X0YQXdW3DAa', '67890'),

-- User in zip code with no centers (edge case testing)
('66666666-6666-6666-6666-666666666666', 'David Miller', 'david@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.HmyfVxzJ1HUTl/4KCk5X0YQXdW3DAa', '99999'),

-- Users for different testing scenarios
('77777777-7777-7777-7777-777777777777', 'Maria Garcia', 'maria@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.HmyfVxzJ1HUTl/4KCk5X0YQXdW3DAa', '54321'),
('88888888-8888-8888-8888-888888888888', 'Robert Davis', 'robert@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.HmyfVxzJ1HUTl/4KCk5X0YQXdW3DAa', '11111');

-- Insert comprehensive test dependents
INSERT INTO dependents (id, user_id, name, birth_date) VALUES 
-- John Doe's children (testing multiple dependents)
('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Emma', '2018-05-15'),
('d1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Tommy', '2020-01-08'),
('d1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Sophie', '2019-09-22'),

-- Sarah Smith's children (testing name similarity)
('d2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Emma Smith', '2017-03-10'),
('d2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Alexander', '2019-07-14'),

-- Emily Johnson's child (single dependent)
('d3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Olivia', '2018-11-30'),

-- Mike Wilson's children
('d4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'Lucas', '2016-12-05'),
('d4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'Mia', '2020-04-18'),

-- Lisa Brown's child
('d5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'Ethan', '2017-08-25'),

-- David Miller's child (in zip code with no centers)
('d6666666-6666-6666-6666-666666666661', '66666666-6666-6666-6666-666666666666', 'Ava', '2019-02-12'),

-- Maria Garcia's children (testing different zip code)
('d7777777-7777-7777-7777-777777777771', '77777777-7777-7777-7777-777777777777', 'Diego', '2018-06-03'),
('d7777777-7777-7777-7777-777777777772', '77777777-7777-7777-7777-777777777777', 'Isabella', '2020-10-15'),

-- Robert Davis's child
('d8888888-8888-8888-8888-888888888881', '88888888-8888-8888-8888-888888888888', 'Noah', '2017-01-20');

-- Insert comprehensive test centers
INSERT INTO centers (id, name, daily_capacity, zip_code) VALUES 
-- Centers in zip code 12345 (high demand area)
('c1111111-1111-1111-1111-111111111111', 'Sunshine Childcare Center', 25, '12345'),
('c1111111-1111-1111-1111-111111111112', 'Happy Kids Daycare', 30, '12345'),
('c1111111-1111-1111-1111-111111111113', 'Rainbow Learning Academy', 20, '12345'),
('c1111111-1111-1111-1111-111111111114', 'Little Angels Preschool', 35, '12345'),

-- Centers in zip code 67890
('c4444444-4444-4444-4444-444444444441', 'Little Learners Academy', 20, '67890'),
('c4444444-4444-4444-4444-444444444442', 'Creative Kids Center', 25, '67890'),

-- Centers in zip code 54321
('c7777777-7777-7777-7777-777777777771', 'Bright Beginnings Center', 35, '54321'),
('c7777777-7777-7777-7777-777777777772', 'Future Stars Daycare', 28, '54321'),

-- Centers in zip code 11111
('c8888888-8888-8888-8888-888888888881', 'Discovery Learning Center', 22, '11111'),

-- Center with special characteristics (weekend hours)
('c9999999-9999-9999-9999-999999999991', 'Full Time Care Center', 40, '12345');

-- Set up operating days for centers
-- Standard Monday-Friday centers
INSERT INTO center_operating_days (center_id, weekday) 
SELECT c.id, generate_series(1, 5) 
FROM centers c 
WHERE c.name != 'Full Time Care Center';

-- Full Time Care Center operates 7 days a week
INSERT INTO center_operating_days (center_id, weekday) 
SELECT c.id, generate_series(1, 7) 
FROM centers c 
WHERE c.name = 'Full Time Care Center';

-- Add Saturday hours for some centers
INSERT INTO center_operating_days (center_id, weekday) 
SELECT c.id, 6 
FROM centers c 
WHERE c.name IN ('Sunshine Childcare Center', 'Creative Kids Center');

-- Add some schedule exceptions for testing
INSERT INTO center_schedule_exceptions (center_id, date, capacity_override, is_closed) VALUES 
-- Holiday closures
((SELECT id FROM centers WHERE name = 'Sunshine Childcare Center'), '2024-12-25', NULL, TRUE),
((SELECT id FROM centers WHERE name = 'Happy Kids Daycare'), '2024-12-25', NULL, TRUE),
-- Reduced capacity days
((SELECT id FROM centers WHERE name = 'Rainbow Learning Academy'), '2024-01-15', 10, FALSE),
-- Special event day (increased capacity)
((SELECT id FROM centers WHERE name = 'Little Angels Preschool'), '2024-02-14', 40, FALSE);

-- Create some test bookings for various scenarios
INSERT INTO bookings (id, user_id, dependent_id, status) VALUES 
-- Confirmed booking
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'CONFIRMED'),
-- Draft booking
('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222221', 'DRAFT'),
-- Cancelled booking
('b3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333331', 'CANCELLED');

-- Create booking days for the test bookings
INSERT INTO booking_days (id, booking_id, date, center_id, status) VALUES 
-- Confirmed booking days
('bd111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', '2024-01-15', 'c1111111-1111-1111-1111-111111111111', 'ACCEPTED'),
('bd111111-1111-1111-1111-111111111112', 'b1111111-1111-1111-1111-111111111111', '2024-01-16', 'c1111111-1111-1111-1111-111111111111', 'ACCEPTED'),
-- Pending booking days
('bd222222-2222-2222-2222-222222222221', 'b2222222-2222-2222-2222-222222222222', '2024-01-17', 'c1111111-1111-1111-1111-111111111112', 'PENDING'),
-- Declined booking day
('bd333333-3333-3333-3333-333333333331', 'b3333333-3333-3333-3333-333333333333', '2024-01-18', 'c1111111-1111-1111-1111-111111111113', 'DECLINED');

-- Display comprehensive test data summary
SELECT '=== USERS BY ZIP CODE ===' as info;
SELECT zip_code, COUNT(*) as user_count, string_agg(name, ', ') as users
FROM users 
GROUP BY zip_code 
ORDER BY zip_code;

SELECT '=== DEPENDENTS BY USER ===' as info;
SELECT 
    u.name as parent_name,
    u.zip_code,
    COUNT(d.id) as dependent_count,
    string_agg(d.name, ', ') as dependents
FROM users u
LEFT JOIN dependents d ON u.id = d.user_id
GROUP BY u.id, u.name, u.zip_code
ORDER BY u.name;

SELECT '=== CENTERS BY ZIP CODE ===' as info;
SELECT 
    zip_code, 
    COUNT(*) as center_count, 
    string_agg(name, ', ') as centers,
    SUM(daily_capacity) as total_capacity
FROM centers 
GROUP BY zip_code 
ORDER BY zip_code;

SELECT '=== CENTER OPERATING DAYS ===' as info;
SELECT 
    c.name as center_name,
    c.zip_code,
    c.daily_capacity,
    array_agg(cod.weekday ORDER BY cod.weekday) as operating_days
FROM centers c
LEFT JOIN center_operating_days cod ON c.id = cod.center_id
GROUP BY c.id, c.name, c.zip_code, c.daily_capacity
ORDER BY c.zip_code, c.name;

SELECT '=== TEST SCENARIOS SUMMARY ===' as info;
SELECT 
    'Users in 12345 (4 centers available)' as scenario,
    COUNT(*) as count
FROM users WHERE zip_code = '12345'
UNION ALL
SELECT 
    'Users in 67890 (2 centers available)',
    COUNT(*)
FROM users WHERE zip_code = '67890'
UNION ALL
SELECT 
    'Users in 99999 (0 centers available)',
    COUNT(*)
FROM users WHERE zip_code = '99999'
UNION ALL
SELECT 
    'Users with multiple dependents',
    COUNT(*)
FROM (
    SELECT user_id 
    FROM dependents 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
) multi_deps
UNION ALL
SELECT 
    'Total existing bookings',
    COUNT(*)
FROM bookings;

-- Test case user IDs for easy reference
SELECT '=== TEST USER IDS FOR API TESTING ===' as info;
SELECT 
    name,
    id,
    zip_code,
    (SELECT COUNT(*) FROM dependents WHERE user_id = users.id) as dependent_count,
    (SELECT COUNT(*) FROM centers WHERE zip_code = users.zip_code) as centers_in_area
FROM users
ORDER BY zip_code, name; 