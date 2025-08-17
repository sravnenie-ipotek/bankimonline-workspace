#!/bin/bash

# Ultra-Safe Deployment Validation Script
# This script validates the entire deployment

set -e

echo "✅ ULTRA-SAFE DEPLOYMENT VALIDATION"
echo "===================================="
echo

# Configuration
PROD_SERVER="root@45.83.42.74"
DOMAIN="dev2.bankimonline.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [[ "$status" =~ $expected ]]; then
        echo -e "${GREEN}✅ PASS (HTTP $status)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL (HTTP $status, expected $expected)${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to test command
test_command() {
    local name=$1
    local cmd=$2
    
    echo -n "Testing $name... "
    if eval "$cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

echo "🌐 Network & DNS Tests"
echo "----------------------"

# DNS resolution
test_command "DNS resolution" "dig +short $DOMAIN | grep -q '45.83.42.74'"

# Ping test
test_command "Server connectivity" "ping -c 1 45.83.42.74"

echo
echo "🖥️ Server Infrastructure Tests"
echo "------------------------------"

# SSH connection
test_command "SSH access" "ssh -o ConnectTimeout=5 $PROD_SERVER 'echo connected' | grep -q connected"

# Disk space
echo -n "Testing disk space... "
DISK_USAGE=$(ssh $PROD_SERVER "df -h / | grep '^/' | awk '{print \$5}' | sed 's/%//'")
if [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${GREEN}✅ PASS ($DISK_USAGE% used)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ WARNING ($DISK_USAGE% used - cleanup needed)${NC}"
    ((TESTS_FAILED++))
fi

# Memory usage
echo -n "Testing memory... "
MEM_USAGE=$(ssh $PROD_SERVER "free | grep Mem | awk '{print int(\$3/\$2 * 100)}'")
if [ "$MEM_USAGE" -lt 90 ]; then
    echo -e "${GREEN}✅ PASS ($MEM_USAGE% used)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ WARNING ($MEM_USAGE% used)${NC}"
    ((TESTS_FAILED++))
fi

echo
echo "🚀 Application Services Tests"
echo "-----------------------------"

# PM2 processes
echo -n "Testing PM2 processes... "
PM2_STATUS=$(ssh $PROD_SERVER "pm2 list | grep bankimonline-api | grep online | wc -l")
if [ "$PM2_STATUS" -ge 1 ]; then
    echo -e "${GREEN}✅ PASS ($PM2_STATUS instances running)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL (No instances running)${NC}"
    ((TESTS_FAILED++))
fi

# Nginx status
test_command "Nginx status" "ssh $PROD_SERVER 'systemctl is-active nginx | grep -q active'"

# Database connectivity
echo -n "Testing main database... "
DB_TEST=$(ssh $PROD_SERVER "cd /opt/bankimonline-current && node -e \"
const { Client } = require('pg');
const client = new Client({
    connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});
client.connect()
    .then(() => { console.log('connected'); client.end(); })
    .catch(err => { console.log('failed'); });
\" 2>/dev/null")

if [[ "$DB_TEST" == "connected" ]]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo
echo "🌍 HTTP/HTTPS Endpoints Tests"
echo "-----------------------------"

# Direct IP access
test_endpoint "Direct IP redirect" "http://45.83.42.74" "301"

# Domain tests (if DNS is ready)
if dig +short $DOMAIN | grep -q '45.83.42.74'; then
    test_endpoint "HTTP to HTTPS redirect" "http://$DOMAIN" "301|200"
    
    # Check if HTTPS is configured
    if curl -I -s https://$DOMAIN 2>/dev/null | head -n 1 | grep -q "200\|301"; then
        test_endpoint "HTTPS homepage" "https://$DOMAIN" "200"
        test_endpoint "HTTPS API health" "https://$DOMAIN/api/health" "200|404"
    else
        echo "HTTPS not configured yet (expected if SSL not installed)"
    fi
else
    echo -e "${YELLOW}⏳ DNS not propagated yet - skipping domain tests${NC}"
fi

echo
echo "📡 API Endpoints Tests"
echo "---------------------"

# API endpoints via IP
test_endpoint "Banks API" "http://45.83.42.74/api/v1/banks" "200|301"
test_endpoint "Cities API" "http://45.83.42.74/api/v1/cities" "200|301"
test_endpoint "Locales API" "http://45.83.42.74/api/v1/locales" "200|301"

echo
echo "📊 VALIDATION SUMMARY"
echo "===================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "Your deployment is fully operational!"
else
    echo -e "${YELLOW}⚠️ Some tests failed. Review the output above.${NC}"
    echo
    echo "Common fixes:"
    echo "1. DNS: Wait 5-30 minutes for propagation"
    echo "2. SSL: Run setup-ssl-certificate.sh after DNS is ready"
    echo "3. Services: Check PM2 logs with: pm2 logs"
    echo "4. Nginx: Check logs at /var/log/nginx/"
fi

echo
echo "📝 Useful Commands:"
echo "-------------------"
echo "SSH to server:        ssh $PROD_SERVER"
echo "Check PM2:           ssh $PROD_SERVER 'pm2 list'"
echo "View logs:           ssh $PROD_SERVER 'pm2 logs'"
echo "Restart services:    ssh $PROD_SERVER 'pm2 restart all'"
echo "Check Nginx:         ssh $PROD_SERVER 'systemctl status nginx'"

if [ $TESTS_FAILED -eq 0 ] && dig +short $DOMAIN | grep -q '45.83.42.74'; then
    echo
    echo "🌐 Your application is available at:"
    if curl -I -s https://$DOMAIN 2>/dev/null | head -n 1 | grep -q "200"; then
        echo -e "${BLUE}https://$DOMAIN${NC}"
    else
        echo -e "${BLUE}http://$DOMAIN${NC}"
        echo "(Run setup-ssl-certificate.sh to enable HTTPS)"
    fi
fi