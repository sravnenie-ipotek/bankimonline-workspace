#!/bin/bash

echo "🚀 Starting Local Development Server"
echo "📡 API Target: http://localhost:8004 (local development)"
echo "🌐 Frontend: http://localhost:5173"
echo ""

# Set environment variable for local development
export VITE_API_TARGET=http://localhost:8004

echo "✅ VITE_API_TARGET set to: $VITE_API_TARGET"
echo ""

# Start the development server
npm run dev 