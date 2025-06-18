-- Multi-Day Booking Test Scenarios
-- This file creates specific test data to validate complex booking scenarios

-- Clear existing test data
DELETE FROM booking_days WHERE booking_id IN (SELECT id FROM bookings WHERE user_id = '99999999-9999-9999-9999-999999999999');
DELETE FROM bookings WHERE user_id = '99999999-9999-9999-9999-999999999999';
DELETE FROM dependents WHERE user_id = '99999999-9999-9999-9999-999999999999';
DELETE FROM users WHERE id = '99999999-9999-9999-9999-999999999999';

-- Create test user for multi-day scenarios
INSERT INTO users (id, name, email, hashed_pass, zip_code) VALUES 
('99999999-9999-9999-9999-999999999999', 'Test Frank', 'testfrank@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.HmyfVxzJ1HUTl/4KCk5X0YQXdW3DAa', '12345');

-- Create test dependents
INSERT INTO dependents (id, user_id, name, birth_date) VALUES 
('d9999999-9999-9999-9999-999999999991', '99999999-9999-9999-9999-999999999999', 'TestChild1', '2018-01-01'),
('d9999999-9999-9999-9999-999999999992', '99999999-9999-9999-9999-999999999999', 'TestChild2', '2019-01-01');

-- Clear existing centers to create controlled test environment
DELETE FROM center_operating_days;
DELETE FROM center_schedule_exceptions;
DELETE FROM centers WHERE zip_code = '12345';

-- Create test centers with specific schedules for multi-day testing
INSERT INTO centers (id, name, daily_capacity, zip_code) VALUES 
-- Center A: Monday-Friday only (closed weekends)
('ca000000-0000-0000-0000-000000000001', 'Weekday Only Center', 30, '12345'),
-- Center B: Tuesday-Saturday (closed Sunday-Monday) 
('cb000000-0000-0000-0000-000000000002', 'Tuesday-Saturday Center', 25, '12345'),
-- Center C: 7 days a week
('cc000000-0000-0000-0000-000000000003', 'Full Week Center', 20, '12345'),
-- Center D: Monday, Wednesday, Friday only
('cd000000-0000-0000-0000-000000000004', 'MWF Only Center', 35, '12345'),
-- Center E: Saturday-Sunday only (weekend care)
('ce000000-0000-0000-0000-000000000005', 'Weekend Only Center', 15, '12345');

-- Set up operating days for test centers
-- Center A: Monday-Friday (1-5)
INSERT INTO center_operating_days (center_id, weekday) 
SELECT 'ca000000-0000-0000-0000-000000000001', generate_series(1, 5);

-- Center B: Tuesday-Saturday (2-6)
INSERT INTO center_operating_days (center_id, weekday) 
SELECT 'cb000000-0000-0000-0000-000000000002', generate_series(2, 6);

-- Center C: All days (1-7)
INSERT INTO center_operating_days (center_id, weekday) 
SELECT 'cc000000-0000-0000-0000-000000000003', generate_series(1, 7);

-- Center D: Monday, Wednesday, Friday (1, 3, 5)
INSERT INTO center_operating_days (center_id, weekday) VALUES 
('cd000000-0000-0000-0000-000000000004', 1),
('cd000000-0000-0000-0000-000000000004', 3),
('cd000000-0000-0000-0000-000000000004', 5);

-- Center E: Saturday-Sunday (6-7)
INSERT INTO center_operating_days (center_id, weekday) VALUES 
('ce000000-0000-0000-0000-000000000005', 6),
('ce000000-0000-0000-0000-000000000005', 7);

-- Add some schedule exceptions for advanced testing
INSERT INTO center_schedule_exceptions (center_id, date, capacity_override, is_closed) VALUES 
-- Center C closed on a specific date
('cc000000-0000-0000-0000-000000000003', '2024-01-17', NULL, TRUE),
-- Center A has reduced capacity on a specific date  
('ca000000-0000-0000-0000-000000000001', '2024-01-19', 10, FALSE);

-- Test Scenario Documentation
SELECT '=== MULTI-DAY BOOKING TEST SCENARIOS ===' as info;

SELECT 'Scenario 1: Thu-Fri-Sat Split' as scenario,
       'Request: Thu, Fri, Sat' as request,
       'Expected: Thu-Fri at Center A, Sat at Center B' as expected_result;

SELECT 'Scenario 2: Mon-Wed-Fri Perfect Match' as scenario,
       'Request: Mon, Wed, Fri' as request,
       'Expected: All at Center D (MWF only)' as expected_result;

SELECT 'Scenario 3: Full Week Challenge' as scenario,
       'Request: Mon-Sun (7 days)' as request,
       'Expected: Most at Center C, some split to others' as expected_result;

SELECT 'Scenario 4: Weekend Only' as scenario,
       'Request: Sat, Sun' as request,
       'Expected: All at Center E (weekend only)' as expected_result;

SELECT 'Scenario 5: Exception Handling' as scenario,
       'Request: Jan 17 (when Center C is closed)' as request,
       'Expected: Fallback to other available centers' as expected_result;

-- Show center availability matrix
SELECT 
    c.name as center_name,
    CASE WHEN 1 = ANY(array_agg(cod.weekday)) THEN 'Mon' ELSE '' END ||
    CASE WHEN 2 = ANY(array_agg(cod.weekday)) THEN ' Tue' ELSE '' END ||
    CASE WHEN 3 = ANY(array_agg(cod.weekday)) THEN ' Wed' ELSE '' END ||
    CASE WHEN 4 = ANY(array_agg(cod.weekday)) THEN ' Thu' ELSE '' END ||
    CASE WHEN 5 = ANY(array_agg(cod.weekday)) THEN ' Fri' ELSE '' END ||
    CASE WHEN 6 = ANY(array_agg(cod.weekday)) THEN ' Sat' ELSE '' END ||
    CASE WHEN 7 = ANY(array_agg(cod.weekday)) THEN ' Sun' ELSE '' END as operating_days,
    c.daily_capacity
FROM centers c
LEFT JOIN center_operating_days cod ON c.id = cod.center_id
WHERE c.zip_code = '12345'
GROUP BY c.id, c.name, c.daily_capacity
ORDER BY c.name;

-- Test specific date scenarios (using upcoming dates)
-- Calculate next Thursday, Friday, Saturday from today
WITH date_calc AS (
    SELECT 
        CURRENT_DATE + INTERVAL '1 day' * ((4 - EXTRACT(dow FROM CURRENT_DATE)::int + 7) % 7) as next_thursday
)
SELECT 
    'Test Dates for Thu-Fri-Sat scenario:' as info,
    next_thursday as thursday,
    next_thursday + INTERVAL '1 day' as friday,
    next_thursday + INTERVAL '2 days' as saturday
FROM date_calc;

-- Show which centers should be available for Thu-Fri-Sat
WITH date_calc AS (
    SELECT 
        CURRENT_DATE + INTERVAL '1 day' * ((4 - EXTRACT(dow FROM CURRENT_DATE)::int + 7) % 7) as next_thursday
),
test_dates AS (
    SELECT 
        next_thursday as test_date,
        'Thursday' as day_name,
        EXTRACT(dow FROM next_thursday)::int as weekday
    FROM date_calc
    UNION ALL
    SELECT 
        next_thursday + INTERVAL '1 day',
        'Friday',
        EXTRACT(dow FROM next_thursday + INTERVAL '1 day')::int
    FROM date_calc
    UNION ALL
    SELECT 
        next_thursday + INTERVAL '2 days',
        'Saturday', 
        EXTRACT(dow FROM next_thursday + INTERVAL '2 days')::int
    FROM date_calc
)
SELECT 
    td.day_name,
    td.test_date,
    c.name as available_center,
    c.daily_capacity
FROM test_dates td
JOIN center_operating_days cod ON (cod.weekday = td.weekday OR (td.weekday = 0 AND cod.weekday = 7))
JOIN centers c ON cod.center_id = c.id
WHERE c.zip_code = '12345'
ORDER BY td.test_date, c.name;

SELECT '=== READY FOR MULTI-DAY BOOKING TESTS ===' as status; 