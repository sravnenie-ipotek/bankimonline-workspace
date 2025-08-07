#!/bin/bash

echo "🖥️  Starting Local Backend Server"
echo "📡 Port: 8003 (local development)"
echo "🔗 API: http://localhost:8003"
echo ""

# Set environment variable for local development
export PORT=8003

echo "✅ PORT set to: $PORT"
echo ""

# Start the backend server
node server/server-db.js 