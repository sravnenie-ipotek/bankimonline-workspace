#!/bin/bash

# E2E Verification Script for Database Translation System
# This script starts the application with PM2 and runs comprehensive E2E tests

echo "🧪 Database Translation System E2E Verification"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $url to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
            echo -e "${GREEN}✅ Service ready at $url${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ Service failed to start at $url${NC}"
    return 1
}

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️ PM2 not found, installing...${NC}"
    npm install -g pm2
fi

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Step 2: Stop any existing services
echo "🛑 Stopping existing services..."
pm2 stop all 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "server-db.js" 2>/dev/null || true
sleep 2
echo ""

# Step 3: Start services with PM2
echo "🚀 Starting services with PM2..."
./pm2-start.sh

# Wait for services to be ready
wait_for_service "http://localhost:8003/api/server-mode"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ API server failed to start${NC}"
    pm2 logs bankim-api --lines 50
    exit 1
fi

wait_for_service "http://localhost:5173"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend failed to start${NC}"
    pm2 logs bankim-frontend --lines 50
    exit 1
fi

echo ""
echo "✅ All services started successfully"
echo ""

# Step 4: Run database verification
echo "🔍 Verifying database content..."
node -e "
const http = require('http');

// Check content API
http.get('http://localhost:8003/api/content/home_page/en', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const response = JSON.parse(data);
        if (response.status === 'success') {
            console.log('✅ Content API working: ' + response.content_count + ' items loaded');
        } else {
            console.log('❌ Content API error:', response);
            process.exit(1);
        }
    });
}).on('error', (err) => {
    console.log('❌ Cannot connect to API:', err.message);
    process.exit(1);
});

// Check dropdown API
http.get('http://localhost:8003/api/dropdowns/mortgage_step1/en', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const response = JSON.parse(data);
        if (response.status === 'success') {
            console.log('✅ Dropdown API working: ' + response.dropdowns.length + ' dropdowns loaded');
        } else {
            console.log('❌ Dropdown API error:', response);
        }
    });
});
"

echo ""

# Step 5: Run Cypress E2E tests
echo "🧪 Running E2E tests..."
echo ""

cd mainapp

# Install Cypress if needed
if [ ! -d "node_modules/cypress" ]; then
    echo "📦 Installing Cypress..."
    npm install cypress --save-dev
fi

# Run the tests
npx cypress run --spec "cypress/e2e/database-translations-verification.cy.ts" --browser chrome --headed

TEST_RESULT=$?

cd ..

echo ""
echo "================================================"
echo ""

# Step 6: Generate report
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    echo "Database translation system is working correctly:"
    echo "  • Database schema is correct"
    echo "  • Content API endpoints are functional"
    echo "  • All 6 problematic pages are fixed"
    echo "  • Multi-language support is working"
    echo "  • Caching is operational"
    echo "  • No raw translation keys visible"
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please check the Cypress output above for details."
    echo ""
    echo "Debug commands:"
    echo "  pm2 logs bankim-api    # Check API logs"
    echo "  pm2 logs bankim-frontend # Check frontend logs"
    echo "  pm2 status              # Check process status"
fi

echo ""
echo "📊 Current PM2 Status:"
pm2 status

echo ""
echo "🔗 Application URLs:"
echo "  Frontend: http://localhost:5173"
echo "  API:      http://localhost:8003"
echo ""
echo "To stop services: ./pm2-stop.sh"
echo "To view logs:     pm2 logs"
echo ""

exit $TEST_RESULT