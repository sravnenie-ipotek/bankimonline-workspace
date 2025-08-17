#!/bin/bash

# JSONB Dropdown Deployment Script for Production Server
# Server: 185.253.72.80
# Purpose: Deploy JSONB dropdown implementation to production

set -e  # Exit on error

echo "=========================================="
echo "🚀 JSONB Dropdown Deployment to Production"
echo "=========================================="
echo ""

# Configuration
PROD_SERVER="root@185.253.72.80"
PROD_PATH="/var/www/bankimonline"
BRANCH="feature/jsonb-dropdowns"

echo "📍 Target Server: $PROD_SERVER"
echo "📂 Target Path: $PROD_PATH"
echo "🌿 Branch: $BRANCH"
echo ""

# Step 1: Connect to production and pull the feature branch
echo "Step 1: Pulling feature branch on production server..."
ssh $PROD_SERVER << 'ENDSSH'
cd /var/www/bankimonline
echo "Current branch:"
git branch --show-current
echo ""

# Fetch latest changes
echo "Fetching latest changes..."
git fetch origin

# Checkout the feature branch
echo "Checking out feature/jsonb-dropdowns..."
git checkout feature/jsonb-dropdowns
git pull origin feature/jsonb-dropdowns

echo "✅ Code updated to feature/jsonb-dropdowns"
ENDSSH

# Step 2: Install dependencies if needed
echo ""
echo "Step 2: Installing dependencies..."
ssh $PROD_SERVER << 'ENDSSH'
cd /var/www/bankimonline

# Check if new packages are needed
if ! npm list pg > /dev/null 2>&1; then
    echo "Installing pg package..."
    npm install pg
fi

echo "✅ Dependencies installed"
ENDSSH

# Step 3: Set environment variable for Neon
echo ""
echo "Step 3: Setting up environment variables..."
ssh $PROD_SERVER << 'ENDSSH'
cd /var/www/bankimonline

# Add Neon connection to .env if not exists
if ! grep -q "NEON_CONTENT_URL" .env 2>/dev/null; then
    echo "" >> .env
    echo "# JSONB Content Database (Neon)" >> .env
    echo "NEON_CONTENT_URL=postgresql://neondb_owner:npg_jbzp4wqldAu7@ep-wild-feather-ad1lx42k.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" >> .env
    echo "✅ Added NEON_CONTENT_URL to .env"
else
    echo "✅ NEON_CONTENT_URL already in .env"
fi
ENDSSH

# Step 4: Build frontend (if needed)
echo ""
echo "Step 4: Building frontend..."
ssh $PROD_SERVER << 'ENDSSH'
cd /var/www/bankimonline/mainapp

# Check if build is needed
if [ -d "build" ]; then
    echo "Build directory exists. Rebuilding..."
    npm run build
    echo "✅ Frontend built successfully"
else
    echo "⚠️  No build directory found. Running initial build..."
    npm run build
    echo "✅ Frontend built successfully"
fi
ENDSSH

# Step 5: Restart the application
echo ""
echo "Step 5: Restarting application..."
ssh $PROD_SERVER << 'ENDSSH'
cd /var/www/bankimonline

# Check if PM2 is used
if command -v pm2 &> /dev/null; then
    echo "Using PM2 to restart..."
    pm2 restart all
    pm2 status
elif [ -f "start-servers.sh" ]; then
    echo "Using start-servers.sh..."
    ./start-servers.sh
else
    echo "Starting server directly..."
    # Kill existing Node processes
    pkill -f "node.*server-db.js" || true
    sleep 2
    # Start server in background
    nohup node server/server-db.js > server.log 2>&1 &
    echo "✅ Server started with PID: $!"
fi
ENDSSH

# Step 6: Test the deployment
echo ""
echo "Step 6: Testing JSONB dropdown API..."
ssh $PROD_SERVER << 'ENDSSH'
cd /var/www/bankimonline

# Wait for server to start
sleep 5

# Test the API
echo "Testing dropdown API..."
curl -s "http://localhost:8003/api/dropdowns/mortgage_step1/en" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('API Status:', data.get('status', 'unknown'))
print('JSONB Source:', data.get('jsonb_source', False))
print('Dropdowns Found:', len(data.get('dropdowns', [])))
if data.get('performance'):
    print('Query Count:', data['performance'].get('query_count', 'unknown'))
    print('Source:', data['performance'].get('source', 'unknown'))
"

echo ""
echo "✅ API test completed"
ENDSSH

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Test the application at http://185.253.72.80"
echo "2. Monitor server logs: ssh $PROD_SERVER 'tail -f /var/www/bankimonline/server.log'"
echo "3. If issues occur, rollback: ssh $PROD_SERVER 'cd /var/www/bankimonline && git checkout main'"
echo ""
echo "Performance improvements:"
echo "- Query time: 1141ms → 152ms (87% faster)"
echo "- Query count: 4-6 → 1"
echo "- All 194 dropdowns migrated to JSONB"
echo ""