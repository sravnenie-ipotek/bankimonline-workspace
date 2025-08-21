#!/bin/bash

# 🚀 BankiMonline Standalone Deployment Script
# Usage: ./deploy.sh [test]

set -e

ENVIRONMENT=${1:-test}
TEST_SERVER="45.83.42.74"
TEST_USER="root"
TEST_PASSWORD="3GM8jHZuTWzDXe"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment to ${ENVIRONMENT} server...${NC}"

# Validate environment
if [[ "$ENVIRONMENT" != "test" ]]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Usage: ./deploy.sh test${NC}"
    echo -e "${YELLOW}Available: test (45.83.42.74)${NC}"
    exit 1
fi

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}⚠️  sshpass not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install hudochenkov/sshpass/sshpass
        else
            echo -e "${RED}❌ Please install Homebrew or sshpass manually${NC}"
            exit 1
        fi
    else
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci --silent

# Database migrations excluded for now
# echo -e "${BLUE}🗄️ Running database migrations on ${ENVIRONMENT}...${NC}"
# if npm run migrate:${ENVIRONMENT}; then
#     echo -e "${GREEN}✅ Migrations completed successfully${NC}"
# else
#     echo -e "${RED}❌ Migration failed! Stopping deployment${NC}"
#     exit 1
# fi
echo -e "${YELLOW}ℹ️  Database migrations excluded for now${NC}"

echo -e "${BLUE}🏗️ Building frontend...${NC}"
cd mainapp
npm ci --silent
npm run build

if [[ ! -d "build" ]]; then
    echo -e "${RED}❌ Frontend build failed! No build directory found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build completed${NC}"
cd ..

echo -e "${BLUE}🚀 Deploying to test server (${TEST_SERVER})...${NC}"

# Deploy files to test server
echo -e "${BLUE}📤 Uploading files to test server...${NC}"
sshpass -p "$TEST_PASSWORD" rsync -avz --progress \
    -e "ssh -o StrictHostKeyChecking=no" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=uploads \
    ./ ${TEST_USER}@${TEST_SERVER}:/app/

echo -e "${BLUE}🔄 Restarting test server services...${NC}"
sshpass -p "$TEST_PASSWORD" ssh -o StrictHostKeyChecking=no ${TEST_USER}@${TEST_SERVER} << 'EOF'
    cd /app
    npm ci --only=production
    pm2 restart bankimonline || pm2 start server/server-db.js --name bankimonline
    pm2 save
    pm2 status
EOF

echo -e "${GREEN}🎉 Deployment to ${ENVIRONMENT} completed successfully!${NC}"

# Show status
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "Environment: ${ENVIRONMENT}"
echo -e "Server: ${TEST_SERVER}"
echo -e "Migrations: ⏭️  Excluded"
echo -e "Frontend: ✅ Built"
echo -e "Backend: ✅ Deployed"
echo -e "Time: $(date)"

echo -e "${GREEN}🔗 Test Server URL: http://${TEST_SERVER}:8003${NC}"