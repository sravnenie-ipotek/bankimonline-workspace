#!/bin/bash

echo "🚀 Launching BankDev2 Locally - Complete Setup"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd mainapp
npm install
cd ..

# Check ports
echo "🔍 Checking port availability..."
if lsof -Pi :8003 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8003 is busy. Killing existing processes..."
    pkill -f "server-db.js" || true
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5173 is busy. Killing existing processes..."
    pkill -f "vite" || true
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3001 is busy. Killing existing processes..."
    pkill -f "serve.js" || true
fi

echo ""
echo "🌟 Choose your launch method:"
echo "1. Full Development Mode (Backend + Frontend)"
echo "2. Backend Only (API + File Server)"
echo "3. Frontend Only (React Dev Server)"
echo "4. PM2 Development Mode"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Starting Full Development Mode..."
        echo "   Backend API: http://localhost:8003"
        echo "   Frontend Dev: http://localhost:5173"
        echo "   File Server: http://localhost:3001"
        echo ""
        
        # Start backend servers
        npm run dev &
        BACKEND_PID=$!
        
        # Wait for backend to start
        sleep 3
        
        # Start frontend
        cd mainapp
        npm run dev &
        FRONTEND_PID=$!
        cd ..
        
        echo "✅ All servers started!"
        echo "🌐 Open http://localhost:5173 in your browser"
        echo "📋 Press Ctrl+C to stop all servers"
        
        # Wait for user interrupt
        trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
        wait
        ;;
        
    2)
        echo "🚀 Starting Backend Only..."
        npm run dev
        ;;
        
    3)
        echo "🚀 Starting Frontend Only..."
        echo "⚠️  Make sure backend is running on port 8003!"
        cd mainapp
        npm run dev
        ;;
        
    4)
        echo "🚀 Starting PM2 Development Mode..."
        npm run pm2:dev
        echo "✅ PM2 processes started!"
        echo "📊 Check status: npm run pm2:status"
        echo "📝 View logs: npm run pm2:logs"
        echo "🛑 Stop: npm run pm2:stop"
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac