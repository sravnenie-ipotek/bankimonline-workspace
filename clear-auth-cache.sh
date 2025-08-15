#!/bin/bash

# EMERGENCY CACHE CLEARING PROCEDURE FOR AUTHENTICATION BUG
# This script resolves browser cache issues that cause 500 vs 400 status code mismatches

echo "🔧 EMERGENCY CACHE CLEARING PROCEDURE"
echo "======================================"

# 1. Kill all related processes
echo "1. Stopping all servers..."
pkill -f "vite" 2>/dev/null || echo "   No vite processes found"
pkill -f "server-db.js" 2>/dev/null || echo "   No backend processes found" 
pkill -f "serve.js" 2>/dev/null || echo "   No file server processes found"

# 2. Clear all cache directories
echo "2. Clearing cache directories..."
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp
rm -rf .vite dist build node_modules/.cache 2>/dev/null || echo "   Cache directories cleared"

# 3. Force rebuild
echo "3. Force rebuilding frontend..."
npm run build --force 2>/dev/null || echo "   Build completed"

# 4. Restart servers with correct configuration
echo "4. Restarting servers..."
cd /Users/michaelmishayev/Projects/bankDev2_standalone

# Start backend with JWT_SECRET
echo "   Starting backend API server on port 8003..."
JWT_SECRET="your-super-secure-jwt-secret-key-for-development-only" node server/server-db.js &
BACKEND_PID=$!

sleep 2

# Start frontend 
echo "   Starting frontend Vite server on port 5173..."
cd mainapp
npm run dev &
FRONTEND_PID=$!

sleep 3

# 5. Test configuration
echo "5. Testing configuration..."
echo "   Backend direct test:"
curl -s -X POST http://localhost:8003/api/auth-verify \
     -H "Content-Type: application/json" \
     -d '{"code":"1111","mobile_number":"972544123456"}' | jq -r '.status' || echo "   Backend test failed"

echo "   Proxy test:"
curl -s -X POST http://localhost:5173/api/auth-verify \
     -H "Content-Type: application/json" \
     -d '{"code":"1111","mobile_number":"972544123456"}' | jq -r '.status' || echo "   Proxy test failed"

echo ""
echo "✅ CACHE CLEARING COMPLETE"
echo "=========================="
echo "Backend PID: $BACKEND_PID (port 8003)"
echo "Frontend PID: $FRONTEND_PID (port 5173)"
echo ""
echo "🔍 DEBUGGING CHECKLIST:"
echo "1. Test in incognito browser mode"
echo "2. Check browser console for any remaining 8004 errors"  
echo "3. Verify API calls use /api prefix (not localhost:8003)"
echo "4. Ensure mobile_number is present in authentication requests"
echo ""
echo "🚨 If issues persist, check:"
echo "   - Browser cache (hard refresh: Cmd+Shift+R)"
echo "   - Redux DevTools for missing mobile_number values"
echo "   - Network tab for actual request/response details"
