#!/bin/bash

echo "🖥️  Starting Local Backend Server"
echo "📡 Port: 8004 (local development)"
echo "🔗 API: http://localhost:8004"
echo ""

# Set environment variable for local development
export PORT=8004

echo "✅ PORT set to: $PORT"
echo ""

# Start the backend server
node server/server-db.js 