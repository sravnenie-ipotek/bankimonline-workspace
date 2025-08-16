#!/bin/bash

# QA Test Runner - One-Click Testing Solution
# Usage: ./qa-run.sh [dev|prod] [test-script-name]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
ENVIRONMENT="${1:-dev}"
TEST_SCRIPT="${2:-test-remaining-bugs.js}"
ENV_FILE=".env.qa"

# Banner
echo -e "${BLUE}🚀 QA TEST RUNNER${NC}"
echo -e "${BLUE}==================${NC}"

# Set environment
echo -e "\n${YELLOW}⚙️  Setting up $ENVIRONMENT environment...${NC}"
./qa-env-switch.sh "$ENVIRONMENT"

# Load environment
echo -e "\n${YELLOW}📡 Loading environment variables...${NC}"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    echo -e "${GREEN}✅ Environment loaded from $ENV_FILE${NC}"
    echo -e "${BLUE}📍 Testing URL: $PLAYWRIGHT_BASE_URL${NC}"
    echo -e "${BLUE}🛡️  Safety Mode: $([ "$CREATE_REAL_BUGS" = "true" ] && echo "DISABLED (Real bugs)" || echo "ENABLED (No real bugs)")${NC}"
else
    echo -e "${RED}❌ Environment file not found!${NC}"
    exit 1
fi

# Run the test
echo -e "\n${YELLOW}🧪 Running test: $TEST_SCRIPT${NC}"
echo -e "${BLUE}----------------------------------${NC}"

if [ -f "$TEST_SCRIPT" ]; then
    echo -e "${GREEN}▶️  Starting test execution...${NC}"
    echo ""
    
    # Run the actual test with environment variables
    node "$TEST_SCRIPT"
    
    echo ""
    echo -e "${GREEN}✅ Test execution completed!${NC}"
else
    echo -e "${RED}❌ Test script not found: $TEST_SCRIPT${NC}"
    echo -e "\n${YELLOW}📋 Available test scripts:${NC}"
    ls -la *.js | grep -E "(test|verify)" | awk '{print "   " $9}' | head -10
    exit 1
fi

# Show summary
echo -e "\n${BLUE}📊 TEST SUMMARY${NC}"
echo -e "${BLUE}=================${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}URL: $PLAYWRIGHT_BASE_URL${NC}"
echo -e "${BLUE}Script: $TEST_SCRIPT${NC}"
echo -e "${BLUE}Bug Creation: $([ "$CREATE_REAL_BUGS" = "true" ] && echo "ENABLED" || echo "DISABLED")${NC}"

echo -e "\n${GREEN}🎉 Test run completed successfully!${NC}"