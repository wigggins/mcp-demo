# Multi-Day Booking System

## Overview

The enhanced intelligent booking system can handle complex multi-day childcare requests that require splitting bookings across multiple centers based on their availability schedules.

## Core Features

### ✅ **Smart Center Assignment**
- **Single Center Preference**: When possible, assigns all days to one center to minimize transitions
- **Optimal Splitting**: When one center can't handle all days, intelligently splits across multiple centers
- **Schedule Awareness**: Respects each center's operating days and schedule exceptions
- **Preferred Center Support**: Honors user's center preferences when specified

### ✅ **Complex Scenario Handling**
- **Weekend/Weekday Splits**: Automatically handles centers with different weekend availability
- **Custom Schedules**: Supports centers with unusual schedules (e.g., MWF only)
- **Schedule Exceptions**: Handles temporary closures and capacity overrides
- **Error Recovery**: Provides clear feedback when dates are unavailable

## Algorithm Details

### 1. **Availability Analysis**
```javascript
// For each center and each requested date:
// 1. Check if center operates on that weekday
// 2. Check for schedule exceptions (closures)
// 3. Build availability matrix
```

### 2. **Assignment Optimization**
```javascript
// Priority order:
// 1. Preferred center (if specified) can handle all dates
// 2. Single center can handle all dates
// 3. Greedy assignment (center handling most dates first)
// 4. Report unassignable dates
```

### 3. **Booking Creation**
```javascript
// Creates single booking with multiple booking_days
// Each booking_day can reference different center_id
// Provides assignment summary with center breakdown
```

## Test Scenarios

### Scenario 1: **Thursday-Friday-Saturday Split**
```json
{
  "request_dates": ["2024-01-18", "2024-01-19", "2024-01-20"],
  "expected_behavior": "Thu-Fri at Weekday Center, Sat at Weekend-capable Center"
}
```

### Scenario 2: **Perfect Match (MWF)**
```json
{
  "request_dates": ["2024-01-15", "2024-01-17", "2024-01-19"],
  "expected_behavior": "All days at MWF-only Center"
}
```

### Scenario 3: **Weekend Only**
```json
{
  "request_dates": ["2024-01-20", "2024-01-21"],
  "expected_behavior": "Both days at Weekend-only Center"
}
```

### Scenario 4: **Full Week Challenge**
```json
{
  "request_dates": ["2024-01-15", "2024-01-16", "2024-01-17", "2024-01-18", "2024-01-19", "2024-01-20", "2024-01-21"],
  "expected_behavior": "Optimal distribution across all available centers"
}
```

### Scenario 5: **Error Handling**
```json
{
  "request_dates": ["2024-01-14"],
  "expected_behavior": "Clear error message about unavailable dates"
}
```

## API Usage

### Single Day Request
```json
POST /bookings/intelligent
{
  "user_id": "uuid",
  "request_date": "2024-01-16"
}
```

### Multi-Day Request
```json
POST /bookings/intelligent
{
  "user_id": "uuid",
  "request_dates": ["2024-01-18", "2024-01-19", "2024-01-20"]
}
```

### Multi-Day with Preferred Center
```json
POST /bookings/intelligent
{
  "user_id": "uuid",
  "request_dates": ["2024-01-18", "2024-01-19"],
  "center_name": "Little Angels Preschool"
}
```

## Response Format

### Successful Multi-Day Booking
```json
{
  "id": "booking-uuid",
  "user_id": "user-uuid",
  "dependent_id": "dependent-uuid",
  "status": "DRAFT",
  "dependent_name": "Emma",
  "booking_days": [
    {
      "id": "day-uuid-1",
      "date": "2024-01-18",
      "center_id": "center-a-uuid",
      "center_name": "Weekday Only Center",
      "status": "PENDING"
    },
    {
      "id": "day-uuid-2",
      "date": "2024-01-19",
      "center_id": "center-a-uuid",
      "center_name": "Weekday Only Center",
      "status": "PENDING"
    },
    {
      "id": "day-uuid-3",
      "date": "2024-01-20",
      "center_id": "center-b-uuid",
      "center_name": "Tuesday-Saturday Center",
      "status": "PENDING"
    }
  ],
  "assignment_summary": {
    "total_days": 3,
    "centers_used": 2,
    "center_breakdown": {
      "Weekday Only Center": 2,
      "Tuesday-Saturday Center": 1
    }
  }
}
```

### Error Response (Unavailable Dates)
```json
{
  "error": "No available centers found for the following dates: 2024-01-14",
  "unavailable_dates": ["2024-01-14"],
  "available_centers": [
    {
      "name": "Weekday Only Center",
      "operating_days": [1, 2, 3, 4, 5]
    }
  ]
}
```

## AI Integration

### Natural Language Processing
The AI assistant can now parse complex multi-day requests:

- **"Book care for Thursday, Friday, and Saturday"** → `request_dates: ["2024-01-18", "2024-01-19", "2024-01-20"]`
- **"I need childcare Monday through Friday"** → `request_dates: ["2024-01-15", "2024-01-16", "2024-01-17", "2024-01-18", "2024-01-19"]`
- **"Book this weekend at Little Angels"** → `request_dates: ["2024-01-20", "2024-01-21"], center_name: "Little Angels"`

### Smart Response Generation
The AI provides intelligent feedback about booking assignments:

- **Single Center**: "Great! I've booked all 3 days at Weekday Only Center."
- **Multi-Center**: "I've booked your childcare across 2 centers: Thursday-Friday at Weekday Only Center, and Saturday at Tuesday-Saturday Center for continuity."
- **Partial Failure**: "I could book Thursday and Friday, but Saturday isn't available at any centers in your area. Here are your options..."

## Test Data Setup

### 1. Load Test Schema
```sql
\i services/booking/test-multi-day-scenarios.sql
```

### 2. Run Automated Tests
```bash
cd services/booking
node test-multi-day-booking.js
```

### 3. Verify Center Availability
```sql
SELECT 
    c.name,
    array_agg(cod.weekday ORDER BY cod.weekday) as operating_days
FROM centers c
JOIN center_operating_days cod ON c.id = cod.center_id
WHERE c.zip_code = '12345'
GROUP BY c.name
ORDER BY c.name;
```

## Center Schedule Matrix

| Center Name | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Capacity |
|-------------|-----|-----|-----|-----|-----|-----|-----|----------|
| Weekday Only Center | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 30 |
| Tuesday-Saturday Center | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | 25 |
| Full Week Center | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 20 |
| MWF Only Center | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | 35 |
| Weekend Only Center | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 15 |

## Edge Cases Handled

### ✅ **Schedule Conflicts**
- User requests Thu-Fri-Sat
- Weekday center closed Sat, Weekend center closed Thu
- **Solution**: Thu-Fri at Weekday center, Sat at Tuesday-Saturday center

### ✅ **Preferred Center Limitations**
- User requests "Little Angels" for Thu-Fri-Sat
- Little Angels only operates Mon-Fri
- **Solution**: Thu-Fri at Little Angels, Sat at alternative center

### ✅ **No Availability**
- User requests Sunday when only weekend centers are open but all are full
- **Solution**: Clear error with alternative date suggestions

### ✅ **Single Center Optimization**
- User requests Mon-Wed-Fri
- Multiple centers could handle individual days
- **Solution**: All days at MWF-only center for continuity

## Future Enhancements

### 🚀 **Capacity Management**
- Check actual capacity vs. existing bookings
- Suggest alternative times when centers are full

### 🚀 **Smart Recommendations**
- Suggest optimal date combinations
- Recommend centers based on past preferences

### 🚀 **Waitlist Management**
- Automatic rebooking when capacity opens up
- Priority queuing for regular customers

---

## Testing Instructions

1. **Setup Test Environment**:
   ```bash
   cd services/booking
   psql -d childcare_booking -f test-multi-day-scenarios.sql
   ```

2. **Run Automated Tests**:
   ```bash
   node test-multi-day-booking.js
   ```

3. **Manual API Testing**:
   ```bash
   curl -X POST http://localhost:3001/bookings/intelligent \
     -H "Content-Type: application/json" \
     -d '{"user_id":"99999999-9999-9999-9999-999999999999","request_dates":["2024-01-18","2024-01-19","2024-01-20"]}'
   ```

4. **Chat Interface Testing**:
   - "Book care for Thursday, Friday, and Saturday"
   - "I need childcare Monday through Friday next week"
   - "Can you book weekend care at Little Angels?"

The system is now ready to handle the most complex multi-day, multi-center booking scenarios! 🎉 