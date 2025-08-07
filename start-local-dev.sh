#!/bin/bash

echo "🚀 Starting Local Development Environment"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed"
    exit 1
fi

echo "📡 Backend will run on: http://localhost:8003"
echo "🌐 Frontend will run on: http://localhost:5173"
echo "🔗 API Proxy: Frontend → Backend (8003)"
echo ""

# Set environment variables for local development
export PORT=8003
export VITE_API_TARGET=http://localhost:8003

echo "✅ Environment variables set:"
echo "   - PORT=$PORT"
echo "   - VITE_API_TARGET=$VITE_API_TARGET"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down local development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "🖥️  Starting Backend Server (Port 8003)..."
node server/server-db.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo "🌐 Starting Frontend Server (Port 5173)..."
cd mainapp && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Local Development Environment Started!"
echo "========================================"
echo "📡 Backend API: http://localhost:8003"
echo "🌐 Frontend: http://localhost:5173"
echo "🔗 API calls from frontend will proxy to backend"
echo ""
echo "💡 Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait 