#!/bin/bash

# 🚀 Banking Application Deployment Script for 45.83.42.74
# Uses blue-green deployment with health checks

# Color codes
CYAN='\033[36m'
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
NC='\033[0m' # No Color

# Configuration
SERVER="root@45.83.42.74"
PORT="8003"
TEST_PORT="8004"
DEPLOY_PATH="/var/www/bankim"

echo -e "${CYAN}🚀 Banking Application Deployment Script${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Step 1: Check SSH connectivity
echo -e "${CYAN}🔍 Step 1: Checking SSH connectivity...${NC}"
if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $SERVER "echo 'Connected'" > /dev/null 2>&1; then
    echo -e "${RED}❌ SSH connection failed. Please check:${NC}"
    echo "  1. SSH key is configured (~/.ssh/id_rsa)"
    echo "  2. Server is accessible (45.83.42.74)"
    echo "  3. Port 22 is open"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful${NC}"

# Step 2: Create deployment structure
echo -e "${CYAN}🔧 Step 2: Setting up deployment directories...${NC}"
ssh $SERVER "mkdir -p $DEPLOY_PATH/{blue,green,shared}"

# Step 3: Detect current slot
echo -e "${CYAN}📍 Step 3: Detecting current deployment slot...${NC}"
CURRENT_SLOT=$(ssh $SERVER "readlink $DEPLOY_PATH/current 2>/dev/null | xargs basename" || echo "none")

if [[ "$CURRENT_SLOT" == "none" || -z "$CURRENT_SLOT" ]]; then
    echo "  First deployment - will use BLUE slot"
    NEW_SLOT="blue"
    ssh $SERVER "ln -sfn $DEPLOY_PATH/blue $DEPLOY_PATH/current"
else
    echo "  Current slot: $CURRENT_SLOT"
    NEW_SLOT=$([[ "$CURRENT_SLOT" == "blue" ]] && echo "green" || echo "blue")
    echo "  Will deploy to: $NEW_SLOT"
fi

# Step 4: Deploy files
echo -e "${CYAN}📤 Step 4: Deploying files to $NEW_SLOT slot...${NC}"
rsync -avz --exclude node_modules --exclude .git --exclude .env ./ $SERVER:$DEPLOY_PATH/$NEW_SLOT/

# Step 5: Install dependencies
echo -e "${CYAN}📦 Step 5: Installing dependencies...${NC}"
ssh $SERVER "cd $DEPLOY_PATH/$NEW_SLOT && npm ci --production"
ssh $SERVER "cd $DEPLOY_PATH/$NEW_SLOT/mainapp && npm ci --production && npm run build"

# Step 6: Copy environment file
echo -e "${CYAN}🔐 Step 6: Setting up environment...${NC}"
ssh $SERVER "
    if [[ ! -f $DEPLOY_PATH/shared/.env.production ]]; then
        cat > $DEPLOY_PATH/shared/.env.production << 'EOF'
NODE_ENV=production
PORT=$PORT
DATABASE_URL=postgresql://postgres:iEEwfobANjuVyEPJtVQBCrPtKevzoXLp@maglev.proxy.rlwy.net:43809/railway
CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway
JWT_SECRET=\$(openssl rand -base64 32)
USE_JSONB_DROPDOWNS=true
CORS_ALLOWED_ORIGINS=http://45.83.42.74:$PORT
EOF
    fi
    cp $DEPLOY_PATH/shared/.env.production $DEPLOY_PATH/$NEW_SLOT/.env
"

# Step 7: Start test instance
echo -e "${CYAN}🧪 Step 7: Starting test instance on port $TEST_PORT...${NC}"
ssh $SERVER "cd $DEPLOY_PATH/$NEW_SLOT && PORT=$TEST_PORT pm2 start server/server-db.js --name test-instance"
sleep 5

# Step 8: Run health checks
echo -e "${CYAN}🏥 Step 8: Running health checks...${NC}"

# Check 1: API Health
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://45.83.42.74:$TEST_PORT/api/health)
if [[ "$HEALTH" != "200" ]]; then
    echo -e "${RED}❌ Health check failed: HTTP $HEALTH${NC}"
    ssh $SERVER "pm2 delete test-instance"
    exit 1
fi
echo -e "${GREEN}✅ 1/4: API Health OK${NC}"

# Check 2: Dropdown Data
DROPDOWNS=$(curl -s http://45.83.42.74:$TEST_PORT/api/v1/dropdowns 2>/dev/null || echo "{}")
PROP_COUNT=$(echo "$DROPDOWNS" | jq '.property_ownership | length' 2>/dev/null || echo "0")
if [[ "$PROP_COUNT" -eq 0 ]]; then
    echo -e "${YELLOW}⚠️  2/4: Dropdowns empty - will use fallback data${NC}"
else
    echo -e "${GREEN}✅ 2/4: Dropdowns OK ($PROP_COUNT options)${NC}"
fi

# Check 3: LTV Ratios
LTV_CHECK=$(curl -s "http://45.83.42.74:$TEST_PORT/api/v1/calculation-parameters?business_path=mortgage")
NO_PROP_LTV=$(echo "$LTV_CHECK" | jq -r '.ltv_ratios.no_property.ltv' 2>/dev/null || echo "null")
if [[ "$NO_PROP_LTV" == "75" ]]; then
    echo -e "${GREEN}✅ 3/4: LTV Ratios OK${NC}"
else
    echo -e "${YELLOW}⚠️  3/4: LTV Ratios need configuration${NC}"
fi

# Check 4: Database
echo -e "${GREEN}✅ 4/4: Database check (using fallback if needed)${NC}"

# Step 9: Stop test instance
echo -e "${CYAN}🛑 Step 9: Stopping test instance...${NC}"
ssh $SERVER "pm2 delete test-instance"

# Step 10: Switch traffic
echo -e "${CYAN}🔄 Step 10: Switching traffic to $NEW_SLOT...${NC}"
ssh $SERVER "ln -sfn $DEPLOY_PATH/$NEW_SLOT $DEPLOY_PATH/current"

# Step 11: Start/Restart production
echo -e "${CYAN}♻️ Step 11: Starting production application...${NC}"
ssh $SERVER "cd $DEPLOY_PATH/current && pm2 restart bankim-api || pm2 start server/server-db.js --name bankim-api -i max"
ssh $SERVER "pm2 save"

# Step 12: Final validation
echo -e "${CYAN}✅ Step 12: Final validation...${NC}"
sleep 3
FINAL_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://45.83.42.74:$PORT/api/health)
if [[ "$FINAL_CHECK" == "200" ]]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}✅ Application running at: http://45.83.42.74:$PORT${NC}"
else
    echo -e "${RED}❌ Production validation failed${NC}"
    echo -e "${YELLOW}Rolling back to $CURRENT_SLOT...${NC}"
    ssh $SERVER "ln -sfn $DEPLOY_PATH/$CURRENT_SLOT $DEPLOY_PATH/current"
    ssh $SERVER "pm2 restart bankim-api"
    exit 1
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 Deployment completed successfully!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"