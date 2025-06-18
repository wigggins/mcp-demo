# Smart Childcare Booking System

A comprehensive childcare booking system with intelligent orchestration, real-time booking management, and administrative interfaces.

## System Architecture

This system consists of several integrated components:

### 1. **Booking Service** (`services/booking/`)
- **Technology**: Node.js + Express + PostgreSQL + TypeScript
- **Port**: 3001
- **Purpose**: Core API service handling users, dependents, centers, and bookings
- **Database**: PostgreSQL with comprehensive schema for childcare operations

### 2. **CSR Plus Dashboard** (`csr-plus/`)
- **Technology**: React + TypeScript + Tailwind CSS
- **Port**: 5173 (dev)
- **Purpose**: Administrative dashboard for managing centers, bookings, and system monitoring
- **Features**: Real-time data, loading states, error handling

### 3. **Client Application** (`client/`)
- **Technology**: React + TypeScript + Tailwind CSS
- **Purpose**: Customer-facing interface for parents to manage bookings
- **Features**: Authentication, protected routes, chat integration

### 4. **Orchestration Service** (`services/orchestration/`)
- **Technology**: Node.js + TypeScript + OpenAI
- **Purpose**: AI-powered booking intelligence and chat processing

### 5. **MCP Server** (`services/mcp-server/`)
- **Technology**: Node.js + TypeScript
- **Purpose**: Model Context Protocol server for external integrations

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb childcare_booking

# Set up environment variables
cd services/booking
cp env.example .env
# Edit .env with your database credentials

# Run schema and sample data
psql childcare_booking < schema.sql
psql childcare_booking < sample-data.sql
```

### 2. Start Services

#### Terminal 1: Booking Service
```bash
cd services/booking
npm install
npm run dev
```
Service will run on http://localhost:3001

#### Terminal 2: CSR Plus Dashboard
```bash
cd csr-plus
npm install
npm run dev
```
Dashboard will run on http://localhost:5173

#### Terminal 3: Client Application (Optional)
```bash
cd client
npm install
npm run dev
```
Client will run on http://localhost:5174

### 3. Access Applications

- **CSR Plus Dashboard**: http://localhost:5173
  - View all care centers and their capacity
  - Monitor all bookings across the system
  - Real-time system health monitoring
  - Administrative controls

- **Booking API**: http://localhost:3001
  - RESTful API with comprehensive endpoints
  - Health check: `GET /health`
  - Interactive API testing available

## API Endpoints

### Authentication
- `POST /auth/login` - User login

### Users & Dependents
- `POST /users` - Create user
- `GET /users/:id/dependents` - Get user's dependents
- `POST /dependents` - Create dependent
- `PUT /dependents/:id` - Update dependent
- `DELETE /dependents/:id` - Delete dependent

### Care Centers
- `GET /centers` - List centers (filter by zip_code)
- `POST /centers` - Create center

### Bookings
- `GET /bookings` - List bookings (filter by status, user_id, center_id)
- `GET /bookings/:id` - Get booking details
- `POST /bookings` - Create booking
- `POST /bookings/intelligent` - AI-powered booking creation
- `PATCH /bookings/:id/status` - Update booking status
- `PATCH /booking-days/:id/respond` - Center response to booking day

## Database Schema

### Core Tables
- **users**: Parents/guardians who make bookings
- **dependents**: Children who need childcare
- **centers**: Childcare facilities
- **bookings**: Booking requests
- **booking_days**: Individual days within bookings
- **center_operating_days**: Days when centers operate

### Sample Data
The system includes comprehensive test data:
- 8 test users across different zip codes
- 13 dependents with various ages
- 9 care centers with different capacities
- Multiple booking scenarios for testing

## Features

### CSR Plus Dashboard
✅ **Real-time Data Integration**
- Live booking statistics
- Dynamic care center information
- System health monitoring

✅ **Interactive Management**
- Filter bookings by status
- Search centers by ZIP code
- Loading states and error handling

✅ **Responsive Design**
- Dark/light theme support
- Mobile-friendly interface
- Professional UI with Tailwind CSS

### Booking Service
✅ **Comprehensive API**
- Full CRUD operations for all entities
- Complex querying with relationships
- Intelligent booking creation

✅ **Data Integrity**
- PostgreSQL constraints and triggers
- Proper foreign key relationships
- Automated timestamp management

## Testing the Integration

### 1. Verify Database Connection
```bash
curl http://localhost:3001/health
```
Should return: `{"status":"ok","database":"connected"}`

### 2. Test API Endpoints
```bash
# Get all centers
curl http://localhost:3001/centers

# Get all bookings
curl http://localhost:3001/bookings

# Filter centers by zip code
curl "http://localhost:3001/centers?zip_code=12345"
```

### 3. Use Dashboard
1. Open http://localhost:5173
2. Navigate through different sections
3. Verify data loads from API
4. Test search and filter functionality

## Intelligent Booking System

The system includes an AI-powered booking endpoint (`/bookings/intelligent`) that:
- Automatically matches users with nearby centers
- Selects appropriate dependents based on name matching
- Creates bookings with sensible defaults
- Handles edge cases gracefully

Example usage:
```bash
curl -X POST http://localhost:3001/bookings/intelligent \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "11111111-1111-1111-1111-111111111111",
    "dependent_name": "Emma",
    "request_date": "2024-01-20"
  }'
```

## Next Steps

1. **Authentication Integration**: Connect CSR Plus dashboard with user authentication
2. **Real-time Updates**: Add WebSocket support for live data updates
3. **Advanced Filtering**: Enhanced search and filtering capabilities
4. **Notification System**: Email/SMS notifications for booking updates
5. **Analytics Dashboard**: Advanced reporting and analytics
6. **Mobile App**: Native mobile application for parents

## Development

### Adding New Features
1. Add database migrations in `services/booking/schema.sql`
2. Update API endpoints in `services/booking/index.ts`
3. Add TypeScript types in `csr-plus/src/services/api.ts`
4. Create React hooks in `csr-plus/src/hooks/useApi.ts`
5. Update UI components to consume new data

### Architecture Decisions
- **TypeScript**: End-to-end type safety
- **REST API**: Simple, predictable interface
- **React Hooks**: Clean state management
- **Tailwind CSS**: Consistent, responsive design
- **PostgreSQL**: Reliable, ACID-compliant data storage

This integration provides a solid foundation for a production-ready childcare booking system with room for expansion and enhancement.