#!/bin/bash

# 🔵🟢 Blue-Green Deployment Script for BankiMonline
# Usage: ./blue-green-deploy.sh

set -e

TEST_SERVER="45.83.42.74"
TEST_USER="root"
TEST_PASSWORD="3GM8jHZuTWzDXe"
HEALTH_CHECK_URL="http://45.83.42.74"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🔵🟢 Starting Blue-Green Deployment...${NC}"

# Check current active environment
echo -e "${BLUE}🔍 Checking current active environment...${NC}"
CURRENT_ENV=$(sshpass -p "$TEST_PASSWORD" ssh -o StrictHostKeyChecking=no ${TEST_USER}@${TEST_SERVER} \
  "if [[ -f /etc/nginx/sites-enabled/bankimonline ]]; then 
     grep -o 'proxy_pass.*:80[0-9][0-9]' /etc/nginx/sites-enabled/bankimonline | grep -o '80[0-9][0-9]' || echo '8003'
   else 
     echo '8003'
   fi")

if [[ "$CURRENT_ENV" == "8003" ]]; then
    ACTIVE="blue"
    INACTIVE="green"
    ACTIVE_PORT="8003"
    INACTIVE_PORT="8004"
else
    ACTIVE="green"  
    INACTIVE="blue"
    ACTIVE_PORT="8004"
    INACTIVE_PORT="8003"
fi

echo -e "${BLUE}📊 Current Status:${NC}"
echo -e "  Active:  🔵 ${ACTIVE} (port ${ACTIVE_PORT})"
echo -e "  Deploy:  🟢 ${INACTIVE} (port ${INACTIVE_PORT})"

# Build frontend locally
echo -e "${BLUE}🏗️ Building frontend locally...${NC}"
cd mainapp
npm ci --silent
npm run build

if [[ ! -d "build" ]]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi
cd ..

# Deploy to inactive environment
echo -e "${BLUE}📤 Deploying to ${INACTIVE} environment...${NC}"
sshpass -p "$TEST_PASSWORD" ssh -o StrictHostKeyChecking=no ${TEST_USER}@${TEST_SERVER} << EOF
    # Create directories
    mkdir -p /app/${INACTIVE}
    mkdir -p /app/logs
EOF

# Upload files to inactive environment
sshpass -p "$TEST_PASSWORD" rsync -avz --progress \
    -e "ssh -o StrictHostKeyChecking=no" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --exclude=uploads \
    ./ ${TEST_USER}@${TEST_SERVER}:/app/${INACTIVE}/

# Install dependencies and start inactive environment
echo -e "${BLUE}🔧 Setting up ${INACTIVE} environment...${NC}"
sshpass -p "$TEST_PASSWORD" ssh -o StrictHostKeyChecking=no ${TEST_USER}@${TEST_SERVER} << EOF
    cd /app/${INACTIVE}
    npm ci --only=production --silent
    
    # Stop existing inactive environment
    pm2 delete bankimonline-${INACTIVE} 2>/dev/null || true
    
    # Start inactive environment
    PORT=${INACTIVE_PORT} APP_VERSION=${INACTIVE} pm2 start server/server-db.js --name bankimonline-${INACTIVE}
    
    sleep 5
    pm2 status
EOF

# Health check on inactive environment
echo -e "${BLUE}🩺 Health checking ${INACTIVE} environment...${NC}"
for i in {1..30}; do
    if curl -sf http://${TEST_SERVER}:${INACTIVE_PORT}/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        break
    fi
    
    if [[ $i -eq 30 ]]; then
        echo -e "${RED}❌ Health check failed after 30 attempts${NC}"
        echo -e "${YELLOW}🔄 Rolling back...${NC}"
        sshpass -p "$TEST_PASSWORD" ssh -o StrictHostKeyChecking=no ${TEST_USER}@${TEST_SERVER} \
            "pm2 delete bankimonline-${INACTIVE} 2>/dev/null || true"
        exit 1
    fi
    
    echo -e "${YELLOW}⏳ Waiting for ${INACTIVE} to be ready... (${i}/30)${NC}"
    sleep 2
done

# Switch traffic (using nginx or direct port switch)
echo -e "${BLUE}🔀 Switching traffic to ${INACTIVE} environment...${NC}"
sshpass -p "$TEST_PASSWORD" ssh -o StrictHostKeyChecking=no ${TEST_USER}@${TEST_SERVER} << EOF
    # Method 1: If using nginx
    if [[ -f /etc/nginx/sites-available/bankimonline ]]; then
        sed -i 's/proxy_pass.*:80[0-9][0-9]/proxy_pass http:\/\/localhost:${INACTIVE_PORT}/' /etc/nginx/sites-available/bankimonline
        nginx -t && systemctl reload nginx
        echo "✅ Nginx updated to port ${INACTIVE_PORT}"
    fi
    
    # Method 2: Update main port (if not using nginx)
    # This would require restarting main proxy or updating load balancer config
    
    echo "🔀 Traffic switched to ${INACTIVE} (port ${INACTIVE_PORT})"
EOF

# Final health check
echo -e "${BLUE}🩺 Final health check...${NC}"
sleep 3
if curl -sf ${HEALTH_CHECK_URL}:${INACTIVE_PORT}/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    
    # Clean up old environment
    echo -e "${BLUE}🧹 Cleaning up ${ACTIVE} environment...${NC}"
    sshpass -p "$TEST_PASSWORD" ssh -o StrictHostKeyChecking=no ${TEST_USER}@${TEST_SERVER} \
        "pm2 delete bankimonline-${ACTIVE} 2>/dev/null || true"
    
else
    echo -e "${RED}❌ Final health check failed!${NC}"
    echo -e "${YELLOW}🔄 Rolling back to ${ACTIVE}...${NC}"
    
    # Rollback
    sshpass -p "$TEST_PASSWORD" ssh -o StrictHostKeyChecking=no ${TEST_USER}@${TEST_SERVER} << EOF
        if [[ -f /etc/nginx/sites-available/bankimonline ]]; then
            sed -i 's/proxy_pass.*:80[0-9][0-9]/proxy_pass http:\/\/localhost:${ACTIVE_PORT}/' /etc/nginx/sites-available/bankimonline
            nginx -t && systemctl reload nginx
        fi
        pm2 delete bankimonline-${INACTIVE} 2>/dev/null || true
EOF
    exit 1
fi

# Summary
echo -e "${CYAN}📊 Deployment Summary:${NC}"
echo -e "Previous: 🔵 ${ACTIVE} (port ${ACTIVE_PORT})"  
echo -e "Current:  🟢 ${INACTIVE} (port ${INACTIVE_PORT})"
echo -e "URL:      ${HEALTH_CHECK_URL}:${INACTIVE_PORT}"
echo -e "Time:     $(date)"
echo -e "${GREEN}🎉 Blue-Green deployment completed successfully!${NC}"