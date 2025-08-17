#!/bin/bash

# JSONB Dropdown Rollback Script for Production Server
# Server: 185.253.72.80
# Purpose: Rollback to previous dropdown implementation if issues occur

set -e  # Exit on error

echo "=========================================="
echo "⚠️  JSONB Dropdown Rollback for Production"
echo "=========================================="
echo ""

# Configuration
PROD_SERVER="root@185.253.72.80"
PROD_PATH="/var/www/bankimonline"

echo "📍 Target Server: $PROD_SERVER"
echo "📂 Target Path: $PROD_PATH"
echo ""
echo "This will rollback to the main branch and restart the application."
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Step 1: Connect to production and switch to main branch
echo "Step 1: Rolling back to main branch..."
ssh $PROD_SERVER << 'ENDSSH'
cd /var/www/bankimonline
echo "Current branch:"
git branch --show-current
echo ""

# Stash any local changes
echo "Stashing any local changes..."
git stash

# Checkout main branch
echo "Switching to main branch..."
git checkout main
git pull origin main

echo "✅ Rolled back to main branch"
ENDSSH

# Step 2: Restart the application
echo ""
echo "Step 2: Restarting application..."
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
    echo "Restarting server directly..."
    # Kill existing Node processes
    pkill -f "node.*server-db.js" || true
    sleep 2
    # Start server in background
    nohup node server/server-db.js > server.log 2>&1 &
    echo "✅ Server restarted with PID: $!"
fi
ENDSSH

# Step 3: Test the rollback
echo ""
echo "Step 3: Testing rollback..."
ssh $PROD_SERVER << 'ENDSSH'
cd /var/www/bankimonline

# Wait for server to start
sleep 5

# Test the API
echo "Testing dropdown API..."
curl -s "http://localhost:8003/api/dropdowns/mortgage_step1/en" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('API Status:', data.get('status', 'unknown'))
    print('JSONB Source:', data.get('jsonb_source', 'Not using JSONB (rollback successful)'))
    print('Dropdowns Found:', len(data.get('dropdowns', [])))
except:
    print('Could not parse API response')
"

echo ""
echo "✅ Rollback test completed"
ENDSSH

echo ""
echo "=========================================="
echo "✅ ROLLBACK COMPLETE!"
echo "=========================================="
echo ""
echo "The application has been rolled back to the main branch."
echo "Using the original dropdown implementation (Railway + content_translations)."
echo ""
echo "To re-deploy JSONB later, run:"
echo "./deploy_jsonb_production.sh"
echo ""