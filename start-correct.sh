#!/bin/bash

# Modern Launch Script - The CORRECT way to start development
# This script ensures you're using the proper modern architecture

echo "🚀 Starting Bankimonline Development Environment (Modern Architecture)"
echo "=================================================="
echo ""

# Check for any processes on critical ports
echo "📋 Checking for port conflicts..."
if lsof -i :8003 | grep LISTEN > /dev/null 2>&1; then
    echo "⚠️  Port 8003 is already in use!"
    echo "Run 'npm run kill-ports:all' to clean up"
    exit 1
fi

if lsof -i :5173 | grep LISTEN > /dev/null 2>&1; then
    echo "⚠️  Port 5173 is already in use!"
    echo "Run 'npm run kill-ports:all' to clean up"
    exit 1
fi

if lsof -i :3001 | grep LISTEN > /dev/null 2>&1; then
    echo "⚠️  Port 3001 is already in use!"
    echo "Run 'npm run kill-ports:all' to clean up"
    exit 1
fi

echo "✅ Ports are clear!"
echo ""

# Start backend servers in background
echo "🔧 Starting Backend Servers (API on 8003, Files on 3001)..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend in new terminal (if possible)
if command -v osascript &> /dev/null; then
    # macOS - open new terminal
    osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/mainapp && npm run dev"'
    echo "✅ Frontend starting in new terminal window..."
elif command -v gnome-terminal &> /dev/null; then
    # Linux with GNOME
    gnome-terminal -- bash -c "cd mainapp && npm run dev; exec bash"
    echo "✅ Frontend starting in new terminal window..."
else
    # Fallback - instructions only
    echo ""
    echo "⚠️  Please open a NEW terminal and run:"
    echo "    cd mainapp"
    echo "    npm run dev"
    echo ""
fi

echo ""
echo "=================================================="
echo "✅ Development Environment Starting!"
echo ""
echo "📍 Backend API: http://localhost:8003"
echo "📍 File Server: http://localhost:3001"
echo "📍 Frontend:    http://localhost:5173"
echo ""
echo "📚 See DEVELOPMENT.md for more information"
echo "=================================================="
echo ""
echo "Press Ctrl+C to stop all servers"

# Keep script running and handle cleanup
trap "echo 'Stopping servers...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM

# Wait for backend process
wait $BACKEND_PID