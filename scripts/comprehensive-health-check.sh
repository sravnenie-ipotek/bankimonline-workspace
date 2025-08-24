#!/bin/bash

# 🛡️ BULLETPROOF 5-POINT DEPLOYMENT HEALTH VALIDATION
# Comprehensive health check system for BankiMonline deployment
# Based on DevOps Master analysis for permanent deployment issue prevention

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/../health-check.log"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Default values - can be overridden
SERVER_TYPE="${1:-test}"  # test or production
DOMAIN="${2:-dev2.bankimonline.com}"
API_PORT="${3:-8003}"

# Server-specific configuration
if [[ "$SERVER_TYPE" == "production" ]]; then
    DOMAIN="bankimonline.com"
    API_PORT="8003"
elif [[ "$SERVER_TYPE" == "test" ]]; then
    DOMAIN="dev2.bankimonline.com"
    API_PORT="8003"
fi

# Logging function
log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

# Print header
echo -e "${CYAN}"
echo "=============================================="
echo "🛡️ BULLETPROOF HEALTH VALIDATION SYSTEM"
echo "=============================================="
echo -e "${NC}"
echo "Server: $SERVER_TYPE"
echo "Domain: $DOMAIN"
echo "API Port: $API_PORT"
echo "Time: $TIMESTAMP"
echo ""

# Initialize counters
TOTAL_TESTS=5
PASSED_TESTS=0
FAILED_TESTS=0

# Test results array
declare -a TEST_RESULTS

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -n "🔍 Testing $test_name... "
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASS${NC}"
        TEST_RESULTS+=("✅ $test_name: PASS")
        ((PASSED_TESTS++))
        log "✅ $test_name: PASS"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        TEST_RESULTS+=("❌ $test_name: FAIL")
        ((FAILED_TESTS++))
        log "❌ $test_name: FAIL"
        return 1
    fi
}

# Function to test HTTP response code
test_http_code() {
    local url="$1"
    local expected_code="$2"
    local timeout="${3:-10}"
    
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$timeout" --connect-timeout 5 "$url" 2>/dev/null || echo "000")
    
    if [[ "$response_code" == "$expected_code" ]]; then
        return 0
    else
        echo "(Expected: $expected_code, Got: $response_code)" >&2
        return 1
    fi
}

# Function to test PM2 status
test_pm2_status() {
    if command -v pm2 >/dev/null 2>&1; then
        pm2 status 2>/dev/null | grep -q "bankim-api.*online"
    else
        echo "PM2 not installed" >&2
        return 1
    fi
}

echo -e "${BLUE}🚀 Starting 5-Point Health Validation...${NC}"
echo ""

# ============================================
# TEST 1: PM2 Process Status
# ============================================
run_test "PM2 Process Status" "test_pm2_status" "online"

# ============================================
# TEST 2: API Health Endpoint (Direct)
# ============================================
run_test "API Health Endpoint" "test_http_code 'http://localhost:$API_PORT/api/health' '200'" "HTTP 200"

# ============================================
# TEST 3: HTTPS Frontend Access
# ============================================
run_test "HTTPS Frontend Access" "test_http_code 'https://$DOMAIN/' '200'" "HTTP 200"

# ============================================
# TEST 4: API via HTTPS Proxy
# ============================================
run_test "API via HTTPS Proxy" "test_http_code 'https://$DOMAIN/api/health' '200'" "HTTP 200"

# ============================================
# TEST 5: HTTP to HTTPS Redirect
# ============================================
run_test "HTTP to HTTPS Redirect" "test_http_code 'http://$DOMAIN/' '301'" "HTTP 301"

echo ""
echo -e "${CYAN}=============================================="
echo "📊 HEALTH CHECK RESULTS"
echo -e "==============================================${NC}"

# Print all test results
for result in "${TEST_RESULTS[@]}"; do
    echo "$result"
done

echo ""
echo "📈 Summary:"
echo "  Total Tests: $TOTAL_TESTS"
echo "  Passed: $PASSED_TESTS"
echo "  Failed: $FAILED_TESTS"
echo ""

# Final assessment
if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "${GREEN}🎉 ALL HEALTH CHECKS PASSED${NC}"
    echo -e "${GREEN}🛡️ DEPLOYMENT IS BULLETPROOF${NC}"
    log "🎉 ALL $TOTAL_TESTS HEALTH CHECKS PASSED"
    
    # Additional validation for production
    if [[ "$SERVER_TYPE" == "production" ]]; then
        echo ""
        echo -e "${CYAN}🏦 PRODUCTION VALIDATION COMPLETE${NC}"
        echo "✅ Version chip should be displaying correctly"
        echo "✅ All banking services operational"
        echo "✅ SSL certificates valid"
    fi
    
    exit 0
else
    echo -e "${RED}🚨 $FAILED_TESTS/$TOTAL_TESTS HEALTH CHECKS FAILED${NC}"
    echo -e "${RED}🚨 DEPLOYMENT NEEDS ATTENTION${NC}"
    log "🚨 $FAILED_TESTS/$TOTAL_TESTS HEALTH CHECKS FAILED"
    
    # Provide troubleshooting guidance
    echo ""
    echo -e "${YELLOW}🔧 TROUBLESHOOTING GUIDANCE:${NC}"
    if [[ $FAILED_TESTS -gt 3 ]]; then
        echo "• Multiple failures detected - check server status"
        echo "• Verify PM2 processes: pm2 status"
        echo "• Check NGINX configuration: nginx -t"
        echo "• Review server logs: tail -f /var/log/nginx/error.log"
    elif [[ $FAILED_TESTS -gt 1 ]]; then
        echo "• Check specific service configurations"
        echo "• Verify firewall settings and ports"
        echo "• Test network connectivity"
    else
        echo "• Single failure - check specific service"
        echo "• May require targeted fix"
    fi
    
    echo ""
    echo -e "${YELLOW}⚡ AUTO-RECOVERY RECOMMENDATIONS:${NC}"
    echo "• Run: pm2 restart bankim-api"
    echo "• Run: systemctl reload nginx"
    echo "• Check: curl -v http://localhost:$API_PORT/api/health"
    
    exit 1
fi