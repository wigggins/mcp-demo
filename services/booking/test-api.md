# Comprehensive API Testing Guide

## Prerequisites

1. **Start all services:**
   ```bash
   # Terminal 1: Start PostgreSQL
   cd services/booking
   docker-compose up -d
   
   # Terminal 2: Start Booking Service
   npm install && npm run dev
   
   # Terminal 3: Start MCP Server
   cd ../mcp-server
   npm run dev
   
   # Terminal 4: Start Orchestration
   cd ../orchestration
   npm run dev
   ```

2. **Load test data:**
   ```bash
   cd services/booking
   psql -h localhost -U booking_user -d mcp_booking_db -f schema.sql
   psql -h localhost -U booking_user -d mcp_booking_db -f sample-data.sql
   ```

## Test Scenarios

### 1. Health Check Tests
```bash
# Test all services are running
curl http://localhost:3001/health  # Booking Service
curl http://localhost:3002/health  # MCP Server  
curl http://localhost:3000/health  # Orchestration

# Expected: {"status":"ok","database":"connected"} for booking service
```

### 2. Basic Data Retrieval Tests

#### Get Users and Dependents
```bash
# Get John Doe's dependents (has 3 children)
curl "http://localhost:3001/users/11111111-1111-1111-1111-111111111111/dependents"

# Get centers in zip code 12345 (should find 5 centers)
curl "http://localhost:3001/centers?zip_code=12345"

# Get centers in zip code 99999 (should find 0 centers)
curl "http://localhost:3001/centers?zip_code=99999"
```

### 3. Intelligent Booking Tests

#### Test Case 1: Successful Booking (User with Multiple Dependents)
```bash
# John Doe wants to book care for Emma tomorrow
curl -X POST http://localhost:3001/bookings/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "11111111-1111-1111-1111-111111111111",
    "dependent_name": "Emma"
  }'

# Expected: Success with Emma matched, center in zip 12345 found
```

#### Test Case 2: Booking with Specific Date
```bash
# Sarah Smith wants to book care for specific date
curl -X POST http://localhost:3001/bookings/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "22222222-2222-2222-2222-222222222222",
    "request_date": "2024-02-15",
    "dependent_name": "Alexander"
  }'

# Expected: Success with specific date
```

#### Test Case 3: No Dependent Name (Should Use First)
```bash
# Emily Johnson (single dependent) - no name specified
curl -X POST http://localhost:3001/bookings/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "33333333-3333-3333-3333-333333333333"
  }'

# Expected: Success using first/only dependent (Olivia)
```

#### Test Case 4: User in Area with No Centers (Edge Case)
```bash
# David Miller in zip 99999 (no centers)
curl -X POST http://localhost:3001/bookings/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "66666666-6666-6666-6666-666666666666",
    "dependent_name": "Ava"
  }'

# Expected: Error - no centers found in zip code
```

#### Test Case 5: Fuzzy Name Matching
```bash
# John Doe booking for "Tom" (should match "Tommy")
curl -X POST http://localhost:3001/bookings/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "11111111-1111-1111-1111-111111111111",
    "dependent_name": "Tom"
  }'

# Expected: Success matching Tommy via fuzzy search
```

#### Test Case 6: Invalid User ID
```bash
# Non-existent user
curl -X POST http://localhost:3001/bookings/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000000",
    "dependent_name": "Test"
  }'

# Expected: Error - user not found
```

### 4. End-to-End Chat Tests (Orchestration Layer)

#### Test Case 1: Simple Booking Request
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need to book childcare for Emma tomorrow",
    "user": {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "John Doe"
    }
  }'

# Expected: Tool execution + friendly response
```

#### Test Case 2: Specific Date Request
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you book care for Tommy on February 20th?",
    "user": {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "John Doe"
    }
  }'

# Expected: Tool execution with parsed date
```

#### Test Case 3: No Dependent Specified
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to book childcare for tomorrow",
    "user": {
      "id": "33333333-3333-3333-3333-333333333333",
      "name": "Emily Johnson"
    }
  }'

# Expected: Uses first dependent automatically
```

#### Test Case 4: Different User Areas
```bash
# User in zip 67890 (2 centers available)
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Book care for Mia tomorrow please",
    "user": {
      "id": "44444444-4444-4444-4444-444444444444",
      "name": "Mike Wilson"
    }
  }'

# Expected: Books at center in zip 67890
```

### 5. Booking Management Tests

#### List Bookings
```bash
# Get all bookings
curl "http://localhost:3001/bookings"

# Get bookings for specific user
curl "http://localhost:3001/bookings?user_id=11111111-1111-1111-1111-111111111111"

# Get bookings for specific center
curl "http://localhost:3001/bookings?center_id=c1111111-1111-1111-1111-111111111111"
```

#### Update Booking Status
```bash
# Update booking status
curl -X PATCH http://localhost:3001/bookings/[BOOKING_ID]/status \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'
```

### 6. Error Handling Tests

#### Missing Required Fields
```bash
# Missing user_id
curl -X POST http://localhost:3001/bookings/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "dependent_name": "Emma"
  }'

# Expected: 400 error - user_id required
```

#### Invalid Dependent Name
```bash
# Non-existent dependent
curl -X POST http://localhost:3001/bookings/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "11111111-1111-1111-1111-111111111111",
    "dependent_name": "NonExistentChild"
  }'

# Expected: 404 error - no dependent found
```

## Expected Test Results Summary

| Scenario | User | Zip | Centers Available | Expected Result |
|----------|------|-----|-------------------|-----------------|
| John Doe | 12345 | 5 | ✅ Success | 
| Sarah Smith | 12345 | 5 | ✅ Success |
| Emily Johnson | 12345 | 5 | ✅ Success |
| Mike Wilson | 67890 | 2 | ✅ Success |
| Lisa Brown | 67890 | 2 | ✅ Success |
| David Miller | 99999 | 0 | ❌ No centers |
| Maria Garcia | 54321 | 2 | ✅ Success |
| Robert Davis | 11111 | 1 | ✅ Success |

## Debugging Commands

```bash
# Check database data
psql -h localhost -U booking_user -d mcp_booking_db -c "
SELECT u.name, u.zip_code, 
       (SELECT COUNT(*) FROM dependents WHERE user_id = u.id) as deps,
       (SELECT COUNT(*) FROM centers WHERE zip_code = u.zip_code) as centers
FROM users u ORDER BY u.name;
"

# Check service logs
docker logs mcp-booking-postgres
tail -f services/booking/logs/* # if you have log files
```

## Performance Tests

```bash
# Test multiple rapid requests
for i in {1..5}; do
  curl -X POST http://localhost:3001/bookings/intelligent \
    -H "Content-Type: application/json" \
    -d '{
      "user_id": "11111111-1111-1111-1111-111111111111",
      "dependent_name": "Emma"
    }' &
done
wait
```

Run through these tests systematically to validate all functionality and identify any issues! 🚀 