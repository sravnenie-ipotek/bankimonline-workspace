#!/bin/bash

# PM2 Production Startup Script for BankIM Application
# This script ensures database migrations are run and PM2 processes are started correctly

echo "🚀 Starting BankIM Application with PM2..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

# Load environment variables
if [ -f .env ]; then
    echo "✅ Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️ Warning: .env file not found"
fi

# Run database migrations
echo "🔄 Running database migrations..."
node run-migration.js
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed. Exiting..."
    exit 1
fi

# Ensure content is populated
echo "🔄 Verifying and populating content..."
node verify-and-populate-content.js
if [ $? -eq 0 ]; then
    echo "✅ Content verification completed"
else
    echo "⚠️ Warning: Content verification had issues but continuing..."
fi

# Build frontend if needed
if [ ! -d "mainapp/build" ] || [ "$1" == "--build" ]; then
    echo "🔄 Building frontend application..."
    cd mainapp
    npm run build
    cd ..
    echo "✅ Frontend build completed"
fi

# Stop any existing PM2 processes
echo "🔄 Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || true

# Start PM2 with ecosystem config
echo "🔄 Starting PM2 processes..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Generate startup script (optional, for system reboots)
# pm2 startup

# Show PM2 status
echo ""
echo "✅ PM2 processes started successfully!"
echo ""
pm2 status

echo ""
echo "📊 Monitoring commands:"
echo "  pm2 status     - Show process status"
echo "  pm2 logs       - Show all logs"
echo "  pm2 monit      - Interactive monitoring"
echo "  pm2 reload all - Zero-downtime reload"
echo ""
echo "🌐 Application URLs:"
echo "  Frontend: http://localhost:5173"
echo "  API:      http://localhost:8003"
echo ""