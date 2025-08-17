#!/usr/bin/env bash

# ============================================
# PRODUCTION HEALTH CHECK & MONITORING
# ============================================
# Run this daily to ensure production is healthy
# and using the correct monorepo architecture
# ============================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    PRODUCTION HEALTH CHECK REPORT${NC}"
echo -e "${BLUE}    $(date)${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

ERRORS=0
WARNINGS=0

# 1. Check if correct PM2 process is running
echo -e "${YELLOW}1. PM2 Process Check:${NC}"
PM2_CHECK=$(pm2 list 2>/dev/null | grep -c "bankimonline-monorepo" || echo "0")
if [ "$PM2_CHECK" -gt "0" ]; then
    echo -e "   ${GREEN}✓ Correct process (bankimonline-monorepo) is running${NC}"
    
    # Check number of instances
    INSTANCES=$(pm2 list | grep "bankimonline-monorepo" | wc -l)
    echo -e "   ${GREEN}✓ Running $INSTANCES instances${NC}"
else
    echo -e "   ${RED}✗ CRITICAL: bankimonline-monorepo NOT running!${NC}"
    
    # Check if old process is running
    OLD_PROCESS=$(pm2 list 2>/dev/null | grep -c "bankimonline-api" || echo "0")
    if [ "$OLD_PROCESS" -gt "0" ]; then
        echo -e "   ${RED}✗ WRONG PROCESS: Old bankimonline-api is running!${NC}"
        echo -e "   ${RED}  This uses server/server-db.js which causes dropdown issues${NC}"
    fi
    ERRORS=$((ERRORS + 1))
fi

# 2. Check server file path
echo ""
echo -e "${YELLOW}2. Server File Path Check:${NC}"
if [ "$PM2_CHECK" -gt "0" ]; then
    SERVER_PATH=$(pm2 show bankimonline-monorepo 2>/dev/null | grep "script path" | awk '{print $4}')
    if [[ "$SERVER_PATH" == *"packages/server/src/server.js"* ]]; then
        echo -e "   ${GREEN}✓ Using correct server: packages/server/src/server.js${NC}"
    else
        echo -e "   ${RED}✗ WRONG SERVER PATH: $SERVER_PATH${NC}"
        echo -e "   ${RED}  Should be: packages/server/src/server.js${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${YELLOW}⚠ Cannot check - PM2 process not running${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 3. Check API availability
echo ""
echo -e "${YELLOW}3. API Availability Check:${NC}"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8003/api/health 2>/dev/null || echo "000")
if [ "$API_RESPONSE" == "200" ] || [ "$API_RESPONSE" == "404" ]; then
    echo -e "   ${GREEN}✓ API is responding on port 8003${NC}"
else
    echo -e "   ${RED}✗ API not responding (HTTP $API_RESPONSE)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 4. Check critical dropdown endpoints
echo ""
echo -e "${YELLOW}4. Critical Dropdown Checks:${NC}"

# Check Step 1 dropdowns
STEP1_WHEN=$(curl -s 'http://localhost:8003/api/dropdowns/mortgage_step1/he' 2>/dev/null | grep -c "when_needed" || echo "0")
STEP1_FIRST=$(curl -s 'http://localhost:8003/api/dropdowns/mortgage_step1/he' 2>/dev/null | grep -c "first_home" || echo "0")

if [ "$STEP1_WHEN" -gt "0" ]; then
    echo -e "   ${GREEN}✓ Step 1: 'when_needed' dropdown OK${NC}"
else
    echo -e "   ${RED}✗ Step 1: 'when_needed' dropdown MISSING${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ "$STEP1_FIRST" -gt "0" ]; then
    echo -e "   ${GREEN}✓ Step 1: 'first_home' dropdown OK${NC}"
else
    echo -e "   ${RED}✗ Step 1: 'first_home' dropdown MISSING${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check Step 2 family status
FAMILY_STATUS=$(curl -s 'http://localhost:8003/api/dropdowns/mortgage_step2/he' 2>/dev/null | grep -c "family_status" || echo "0")
if [ "$FAMILY_STATUS" -gt "0" ]; then
    echo -e "   ${GREEN}✓ Step 2: 'family_status' dropdown OK${NC}"
else
    echo -e "   ${RED}✗ Step 2: 'family_status' dropdown MISSING${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 5. Check database connections
echo ""
echo -e "${YELLOW}5. Database Connection Check:${NC}"
# Check if environment file exists
if [ -f "/opt/bankimonline_20250817_041201/packages/server/.env" ]; then
    CONTENT_DB=$(grep -c "CONTENT_DATABASE_URL" /opt/bankimonline_20250817_041201/packages/server/.env || echo "0")
    if [ "$CONTENT_DB" -gt "0" ]; then
        echo -e "   ${GREEN}✓ Content database configured${NC}"
    else
        echo -e "   ${YELLOW}⚠ Content database URL not found in .env${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "   ${RED}✗ Environment file not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 6. Check PM2 logs for errors
echo ""
echo -e "${YELLOW}6. Recent Error Check (last 100 lines):${NC}"
if [ "$PM2_CHECK" -gt "0" ]; then
    ERROR_COUNT=$(pm2 logs bankimonline-monorepo --nostream --lines 100 2>/dev/null | grep -c "ERROR\|CRITICAL\|FATAL" || echo "0")
    if [ "$ERROR_COUNT" -eq "0" ]; then
        echo -e "   ${GREEN}✓ No errors in recent logs${NC}"
    else
        echo -e "   ${YELLOW}⚠ Found $ERROR_COUNT error messages in recent logs${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "   ${YELLOW}⚠ Cannot check logs - PM2 process not running${NC}"
fi

# 7. Check system resources
echo ""
echo -e "${YELLOW}7. System Resources:${NC}"
MEMORY=$(free -m | awk 'NR==2{printf "%.1f", $3*100/$2}')
DISK=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
CPU=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')

echo -e "   Memory Usage: ${MEMORY}%"
echo -e "   Disk Usage: ${DISK}%"
echo -e "   CPU Usage: ${CPU}%"

if [ "${DISK%.*}" -gt "90" ]; then
    echo -e "   ${RED}✗ WARNING: Disk usage critical!${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}              SUMMARY${NC}"
echo -e "${BLUE}============================================${NC}"

if [ "$ERRORS" -eq "0" ] && [ "$WARNINGS" -eq "0" ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - System is healthy!${NC}"
    exit 0
elif [ "$ERRORS" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS issue(s) need attention${NC}"
    exit 0
else
    echo -e "${RED}❌ CRITICAL: $ERRORS error(s) detected!${NC}"
    echo -e "${YELLOW}⚠️  WARNINGS: $WARNINGS warning(s)${NC}"
    echo ""
    echo -e "${RED}IMMEDIATE ACTION REQUIRED:${NC}"
    echo "1. Check if bankimonline-monorepo is running"
    echo "2. Verify using packages/server/src/server.js"
    echo "3. Check dropdown endpoints"
    echo "4. Review PM2 logs for details"
    exit 1
fi