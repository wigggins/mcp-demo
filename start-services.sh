#!/bin/bash

# Start Services Script for Smart Childcare Booking System
echo "🚀 Starting Smart Childcare Booking System..."

# Check if required commands exist
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

echo "📦 Installing dependencies..."

# Install booking service dependencies
cd services/booking
if [ ! -d "node_modules" ]; then
    echo "Installing booking service dependencies..."
    npm install
fi

# Install CSR Plus dependencies
cd ../../csr-plus
if [ ! -d "node_modules" ]; then
    echo "Installing CSR Plus dependencies..."
    npm install
fi

cd ..

echo "🎯 Starting services in background..."

# Start Booking Service
echo "Starting Booking Service on http://localhost:3001..."
cd services/booking
npm run dev &
BOOKING_PID=$!

# Wait a moment for booking service to start
sleep 2

# Start CSR Plus Dashboard
echo "Starting CSR Plus Dashboard on http://localhost:5173..."
cd ../../csr-plus
npm run dev &
CSR_PID=$!

echo ""
echo "✅ Services are starting up..."
echo ""
echo "📊 CSR Plus Dashboard: http://localhost:5173"
echo "🔧 Booking API: http://localhost:3001"
echo "💡 Health Check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for background processes
wait 