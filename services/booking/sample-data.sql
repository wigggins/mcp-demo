-- Sample Data for Testing Intelligent Booking System
-- Run this after your schema is set up

-- Insert sample users with different zip codes
INSERT INTO users (name, email, hashed_pass, zip_code) VALUES 
('John Doe', 'john@example.com', '$2b$10$example_hash_replace_with_real', '12345'),
('Sarah Smith', 'sarah@example.com', '$2b$10$example_hash_replace_with_real', '12345'),
('Mike Johnson', 'mike@example.com', '$2b$10$example_hash_replace_with_real', '67890');

-- Insert sample dependents/children
INSERT INTO dependents (user_id, name, birth_date) 
SELECT 
    u.id, 
    CASE 
        WHEN u.name = 'John Doe' THEN 'Emma Doe'
        WHEN u.name = 'Sarah Smith' THEN 'Alex Smith'
        WHEN u.name = 'Mike Johnson' THEN 'Lisa Johnson'
    END,
    CASE 
        WHEN u.name = 'John Doe' THEN '2018-05-15'
        WHEN u.name = 'Sarah Smith' THEN '2019-03-22'
        WHEN u.name = 'Mike Johnson' THEN '2017-08-10'
    END::DATE
FROM users u;

-- Insert more dependents for testing multiple children
INSERT INTO dependents (user_id, name, birth_date) 
SELECT 
    u.id, 
    'Tommy Doe',
    '2020-01-08'::DATE
FROM users u WHERE u.name = 'John Doe';

-- Insert sample childcare centers with zip codes
INSERT INTO centers (name, daily_capacity, zip_code) VALUES 
('Sunshine Childcare Center', 25, '12345'),
('Happy Kids Daycare', 30, '12345'),
('Little Learners Academy', 20, '67890'),
('Bright Beginnings Center', 35, '11111');

-- Set up operating days for centers (Monday through Friday)
INSERT INTO center_operating_days (center_id, weekday) 
SELECT c.id, generate_series(1, 5) 
FROM centers c;

-- Add some weekend hours for one center
INSERT INTO center_operating_days (center_id, weekday) 
SELECT c.id, 6 -- Saturday
FROM centers c WHERE c.name = 'Sunshine Childcare Center';

-- Display the inserted data for verification
SELECT 'USERS' as table_name, name, email, zip_code FROM users
UNION ALL
SELECT 'DEPENDENTS', d.name, u.name as parent, d.birth_date::text FROM dependents d JOIN users u ON d.user_id = u.id
UNION ALL
SELECT 'CENTERS', name, daily_capacity::text, zip_code FROM centers;

-- Display center operating days
SELECT 
    c.name as center_name,
    c.zip_code,
    array_agg(cod.weekday ORDER BY cod.weekday) as operating_days
FROM centers c
LEFT JOIN center_operating_days cod ON c.id = cod.center_id
GROUP BY c.id, c.name, c.zip_code
ORDER BY c.name; 