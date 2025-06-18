-- Child-care Booking System Database Schema
-- PostgreSQL DDL Script

-- Enable UUID extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types
CREATE TYPE booking_status AS ENUM ('DRAFT','PENDING','PARTIAL','CONFIRMED','CANCELLED');
CREATE TYPE booking_day_status AS ENUM ('PENDING','ACCEPTED','DECLINED');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    hashed_pass TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create dependents table
CREATE TABLE dependents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    birth_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create centers table
CREATE TABLE centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    daily_capacity INT NOT NULL CHECK (daily_capacity >= 0),
    zip_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create center_operating_days table
CREATE TABLE center_operating_days (
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
    PRIMARY KEY(center_id, weekday)
);

-- Create center_schedule_exceptions table
CREATE TABLE center_schedule_exceptions (
    id SERIAL PRIMARY KEY,
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    capacity_override INT CHECK (capacity_override >= 0),
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(center_id, date)
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dependent_id UUID NOT NULL REFERENCES dependents(id),
    status booking_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create booking_days table
CREATE TABLE booking_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    center_id UUID REFERENCES centers(id),
    status booking_day_status NOT NULL DEFAULT 'PENDING',
    center_responded_at TIMESTAMPTZ,
    UNIQUE(booking_id, date)
);

-- Create indexes
CREATE INDEX idx_dependents_user ON dependents(user_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_booking_days_center_date ON booking_days(center_id, date) WHERE status = 'ACCEPTED';
CREATE INDEX idx_users_zip_code ON users(zip_code);
CREATE INDEX idx_centers_zip_code ON centers(zip_code);

-- Add comments for documentation
COMMENT ON TYPE booking_status IS 'Overall status of a booking request';
COMMENT ON TYPE booking_day_status IS 'Status of individual booking days, managed by centers';

COMMENT ON TABLE users IS 'Users who can make bookings for their dependents';
COMMENT ON TABLE dependents IS 'Children or other dependents that can be booked for childcare';
COMMENT ON TABLE centers IS 'Childcare centers that accept bookings';
COMMENT ON TABLE center_operating_days IS 'Days of the week when centers operate (1=Monday, 7=Sunday)';
COMMENT ON TABLE center_schedule_exceptions IS 'Special dates when centers have different capacity or are closed';
COMMENT ON TABLE bookings IS 'Booking requests made by users for their dependents';
COMMENT ON TABLE booking_days IS 'Individual days within a booking, each can be accepted/declined by centers';

COMMENT ON COLUMN users.hashed_pass IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.zip_code IS 'User zip code for matching with nearby centers';
COMMENT ON COLUMN dependents.birth_date IS 'Used for age-appropriate grouping and capacity planning';
COMMENT ON COLUMN centers.daily_capacity IS 'Maximum number of children the center can accommodate per day';
COMMENT ON COLUMN centers.zip_code IS 'Center zip code for matching with users in the area';
COMMENT ON COLUMN center_operating_days.weekday IS '1=Monday through 7=Sunday';
COMMENT ON COLUMN center_schedule_exceptions.capacity_override IS 'Override normal daily capacity for this date';
COMMENT ON COLUMN center_schedule_exceptions.is_closed IS 'Center is closed on this date regardless of capacity';
COMMENT ON COLUMN booking_days.center_responded_at IS 'Timestamp when center accepted/declined this booking day';

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dependents_updated_at BEFORE UPDATE ON dependents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_centers_updated_at BEFORE UPDATE ON centers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - uncomment to insert test data)
/*
-- Insert a sample center
INSERT INTO centers (name, daily_capacity) VALUES ('Sunshine Childcare', 20);

-- Insert sample operating days (Monday through Friday)
INSERT INTO center_operating_days (center_id, weekday) 
SELECT id, generate_series(1, 5) 
FROM centers WHERE name = 'Sunshine Childcare';

-- Insert a sample user
INSERT INTO users (name, email, hashed_pass) 
VALUES ('John Doe', 'john@example.com', '$2b$10$example_hash_here');

-- Insert a sample dependent
INSERT INTO dependents (user_id, name, birth_date)
SELECT id, 'Emma Doe', '2018-05-15'
FROM users WHERE email = 'john@example.com';
*/ 