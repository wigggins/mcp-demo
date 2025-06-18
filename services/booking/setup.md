# PostgreSQL Setup Guide for MCP Booking Service

## Prerequisites

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database and User**:
   ```bash
   # Connect to PostgreSQL as superuser
   psql postgres
   
   # Create database and user
   CREATE DATABASE mcp_booking_db;
   CREATE USER booking_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE mcp_booking_db TO booking_user;
   \q
   ```

## Setup Steps

1. **Install Dependencies**:
   ```bash
   cd services/booking
   npm install
   ```

2. **Configure Environment**:
   ```bash
   # Copy the environment template
   cp env.example .env
   
   # Edit .env and update your database credentials:
   # - Change POSTGRES_PASSWORD to a secure password
   # - Optionally customize POSTGRES_DB and POSTGRES_USER
   # - The DATABASE_URL will automatically use these values
   ```

3. **Initialize Prisma**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Create and run migrations
   npx prisma migrate dev --name init
   
   # Optional: Open Prisma Studio to view your database
   npx prisma studio
   ```

4. **Start the Service**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Users
- `POST /users` - Create a new user
- `GET /users/:userId/children` - Get user's children

### Children
- `POST /children` - Create a new child profile

### Bookings
- `POST /bookings` - Create a new booking
- `GET /bookings` - List bookings (supports ?status and ?userId filters)
- `POST /bookings/:id/cancel` - Cancel a booking

### Health Check
- `GET /health` - Service health check

## Database Schema

The database includes three main tables:
- **users**: Customer information
- **children**: Child profiles linked to users
- **bookings**: Booking records with references to users and children

## Development Tools

- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database

## Migration Commands

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

## Production Considerations

1. **Database Connection Pooling**: Consider using PgBouncer or similar
2. **Environment Variables**: Use secure environment variable management
3. **Backup Strategy**: Implement regular database backups
4. **Monitoring**: Add database performance monitoring
5. **Security**: Enable SSL connections for production databases 