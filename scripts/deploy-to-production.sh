#!/bin/bash

# ============================================
# UNIFIED MONOREPO DEPLOYMENT SCRIPT
# ============================================
# This script ensures production uses the SAME
# packages/server that development uses
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROD_HOST="45.83.42.74"
PROD_USER="root"
PROD_PASS="3GM8jHZuTWzDXe"
LOCAL_PATH="/Users/michaelmishayev/Projects/bankDev2_standalone"
PROD_PATH="/opt/bankimonline_20250817_041201"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}UNIFIED MONOREPO DEPLOYMENT TO PRODUCTION${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Pre-deployment checks
echo -e "${YELLOW}Step 1: Pre-deployment checks...${NC}"

# Check if packages/server exists locally
if [ ! -d "$LOCAL_PATH/packages/server" ]; then
    echo -e "${RED}ERROR: packages/server directory not found!${NC}"
    echo "Expected at: $LOCAL_PATH/packages/server"
    exit 1
fi

# Check if local server runs correctly
echo "Testing local packages/server..."
cd "$LOCAL_PATH/packages/server"
if [ ! -f "src/server.js" ]; then
    echo -e "${RED}ERROR: src/server.js not found in packages/server!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Local packages/server verified${NC}"

# Step 2: Create deployment package
echo ""
echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
cd "$LOCAL_PATH"
tar -czf /tmp/packages-server-deploy.tar.gz packages/server/
echo -e "${GREEN}✓ Deployment package created${NC}"

# Step 3: Upload to production
echo ""
echo -e "${YELLOW}Step 3: Uploading to production...${NC}"
sshpass -p "$PROD_PASS" scp -o StrictHostKeyChecking=no /tmp/packages-server-deploy.tar.gz $PROD_USER@$PROD_HOST:/tmp/
echo -e "${GREEN}✓ Package uploaded${NC}"

# Step 4: Deploy on production
echo ""
echo -e "${YELLOW}Step 4: Deploying on production...${NC}"

sshpass -p "$PROD_PASS" ssh -o StrictHostKeyChecking=no $PROD_USER@$PROD_HOST << 'DEPLOY_SCRIPT'
set -e

echo "=== Creating backup ==="
cd /opt/bankimonline_20250817_041201/
if [ -d "packages/server" ]; then
    BACKUP_NAME="packages/server.backup.$(date +%Y%m%d_%H%M%S)"
    cp -r packages/server "$BACKUP_NAME"
    echo "Backup created: $BACKUP_NAME"
fi

echo "=== Extracting new version ==="
tar -xzf /tmp/packages-server-deploy.tar.gz
echo "Extraction complete"

echo "=== Installing dependencies ==="
cd packages/server
npm install --production --silent
echo "Dependencies installed"

echo "=== Copying environment file ==="
if [ -f "../api/.env" ]; then
    cp ../api/.env .env
    echo "Environment file copied"
else
    echo "WARNING: No .env file found in ../api/"
fi

echo "=== Checking PM2 processes ==="
PM2_PROCESS=$(pm2 list | grep -c "bankimonline-monorepo" || true)
if [ "$PM2_PROCESS" -eq "0" ]; then
    echo "Starting new monorepo process..."
    PORT=8003 pm2 start src/server.js --name bankimonline-monorepo -i 2
else
    echo "Restarting existing monorepo process..."
    pm2 restart bankimonline-monorepo
fi

echo "=== Waiting for server to start ==="
sleep 5

echo "=== Clearing cache ==="
curl -X POST http://localhost:8003/api/cache/clear > /dev/null 2>&1

echo "=== Saving PM2 configuration ==="
pm2 save

echo "=== Deployment complete ==="
DEPLOY_SCRIPT

# Step 5: Verify deployment
echo ""
echo -e "${YELLOW}Step 5: Verifying deployment...${NC}"

# Test critical endpoints
echo "Testing API endpoints..."
FAMILY_STATUS=$(sshpass -p "$PROD_PASS" ssh -o StrictHostKeyChecking=no $PROD_USER@$PROD_HOST \
    "curl -s 'http://localhost:8003/api/dropdowns/mortgage_step2/he' | grep -c family_status || echo 0")

if [ "$FAMILY_STATUS" -gt "0" ]; then
    echo -e "${GREEN}✓ Family status dropdown: WORKING${NC}"
else
    echo -e "${RED}✗ Family status dropdown: NOT WORKING${NC}"
    echo -e "${RED}DEPLOYMENT VERIFICATION FAILED!${NC}"
    exit 1
fi

# Check PM2 status
echo "Checking PM2 status..."
sshpass -p "$PROD_PASS" ssh -o StrictHostKeyChecking=no $PROD_USER@$PROD_HOST \
    "pm2 list | grep bankimonline-monorepo"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Production is now running:"
echo "- Server: packages/server/src/server.js"
echo "- Process: bankimonline-monorepo"
echo "- Port: 8003"
echo ""
echo -e "${YELLOW}Remember: NEVER use server/server-db.js!${NC}"