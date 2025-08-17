#!/usr/bin/env bash

# ============================================
# QUICK PRODUCTION QA TEST SCRIPT
# ============================================
# Simple QA testing for https://dev2.bankimonline.com
# using curl to test critical API endpoints
# ============================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BASE_URL="https://dev2.bankimonline.com"
API_URL="https://dev2.bankimonline.com/api"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="qa-report-${TIMESTAMP}.txt"

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNING_TESTS=0

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}    PRODUCTION QA TEST - QUICK CHECK${NC}"
echo -e "${BLUE}    Environment: ${BASE_URL}${NC}"
echo -e "${BLUE}    $(date)${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Start report
echo "PRODUCTION QA REPORT - $(date)" > $REPORT_FILE
echo "Environment: ${BASE_URL}" >> $REPORT_FILE
echo "============================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Function to test endpoint
test_endpoint() {
    local test_name=$1
    local url=$2
    local expected_content=$3
    local critical=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}Testing: ${test_name}${NC}"
    echo "Test: ${test_name}" >> $REPORT_FILE
    
    # Make request with timeout
    response=$(curl -s -k --max-time 10 "$url" 2>/dev/null)
    http_code=$(curl -s -k -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
    
    if [ "$http_code" == "200" ] || [ "$http_code" == "304" ]; then
        if [ -n "$expected_content" ]; then
            if echo "$response" | grep -q "$expected_content"; then
                echo -e "  ${GREEN}✅ PASS - Found expected content${NC}"
                echo "  Result: PASS - Found expected content" >> $REPORT_FILE
                PASSED_TESTS=$((PASSED_TESTS + 1))
            else
                if [ "$critical" == "true" ]; then
                    echo -e "  ${RED}❌ FAIL - Expected content not found${NC}"
                    echo "  Result: FAIL - Expected content not found" >> $REPORT_FILE
                    FAILED_TESTS=$((FAILED_TESTS + 1))
                else
                    echo -e "  ${YELLOW}⚠️  WARNING - Expected content not found${NC}"
                    echo "  Result: WARNING - Expected content not found" >> $REPORT_FILE
                    WARNING_TESTS=$((WARNING_TESTS + 1))
                fi
            fi
        else
            echo -e "  ${GREEN}✅ PASS - Endpoint responding (HTTP $http_code)${NC}"
            echo "  Result: PASS - HTTP $http_code" >> $REPORT_FILE
            PASSED_TESTS=$((PASSED_TESTS + 1))
        fi
    else
        if [ "$critical" == "true" ]; then
            echo -e "  ${RED}❌ FAIL - HTTP $http_code${NC}"
            echo "  Result: FAIL - HTTP $http_code" >> $REPORT_FILE
            FAILED_TESTS=$((FAILED_TESTS + 1))
        else
            echo -e "  ${YELLOW}⚠️  WARNING - HTTP $http_code${NC}"
            echo "  Result: WARNING - HTTP $http_code" >> $REPORT_FILE
            WARNING_TESTS=$((WARNING_TESTS + 1))
        fi
    fi
    
    echo "" >> $REPORT_FILE
}

# Function to test dropdown API
test_dropdown() {
    local dropdown_name=$1
    local screen=$2
    local field=$3
    local language=${4:-"he"}
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}Testing Dropdown: ${dropdown_name}${NC}"
    echo "Test Dropdown: ${dropdown_name}" >> $REPORT_FILE
    
    url="${API_URL}/dropdowns/${screen}/${language}"
    response=$(curl -s -k --max-time 10 "$url" 2>/dev/null)
    
    if echo "$response" | grep -q "\"$field\""; then
        # Check if options exist for this field
        if echo "$response" | grep -q "\"options\".*\"$field\""; then
            echo -e "  ${GREEN}✅ PASS - Dropdown has data${NC}"
            echo "  Result: PASS - Found dropdown with options" >> $REPORT_FILE
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "  ${RED}❌ FAIL - Dropdown exists but no options${NC}"
            echo "  Result: FAIL - No options in dropdown" >> $REPORT_FILE
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        echo -e "  ${RED}❌ FAIL - Dropdown field not found${NC}"
        echo "  Result: FAIL - Field '$field' not found" >> $REPORT_FILE
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo "" >> $REPORT_FILE
}

echo -e "${BLUE}1. TESTING PAGE ACCESSIBILITY${NC}"
echo "SECTION: Page Accessibility" >> $REPORT_FILE
echo "----------------------------" >> $REPORT_FILE
test_endpoint "Homepage" "${BASE_URL}" "" true
test_endpoint "Mortgage Calculator Step 1" "${BASE_URL}/services/calculate-mortgage/1" "" true
test_endpoint "Mortgage Calculator Step 2" "${BASE_URL}/services/calculate-mortgage/2" "" true
test_endpoint "Credit Calculator" "${BASE_URL}/services/calculate-credit/1" "" false

echo ""
echo -e "${BLUE}2. TESTING API ENDPOINTS${NC}"
echo "" >> $REPORT_FILE
echo "SECTION: API Endpoints" >> $REPORT_FILE
echo "----------------------" >> $REPORT_FILE
test_endpoint "Banks API" "${API_URL}/v1/banks" "bank" false
test_endpoint "Cities API" "${API_URL}/v1/cities" "city" false
test_endpoint "Locales API" "${API_URL}/v1/locales" "" false

echo ""
echo -e "${BLUE}3. TESTING CRITICAL DROPDOWNS${NC}"
echo "" >> $REPORT_FILE
echo "SECTION: Critical Dropdowns" >> $REPORT_FILE
echo "---------------------------" >> $REPORT_FILE

# Test Step 1 dropdowns
test_dropdown "Property Ownership (Step 1)" "mortgage_step1" "mortgage_step1_property_ownership" "he"
test_dropdown "When Needed (Step 1)" "mortgage_step1" "mortgage_step1_when_needed" "he"
test_dropdown "First Home (Step 1)" "mortgage_step1" "mortgage_step1_first_home" "he"

# Test Step 2 dropdowns
test_dropdown "Family Status (Step 2)" "mortgage_step2" "mortgage_step2_family_status" "he"

echo ""
echo -e "${BLUE}4. TESTING LANGUAGE SUPPORT${NC}"
echo "" >> $REPORT_FILE
echo "SECTION: Language Support" >> $REPORT_FILE
echo "-------------------------" >> $REPORT_FILE

# Test different languages
for lang in en he ru; do
    test_endpoint "Dropdowns API - ${lang}" "${API_URL}/dropdowns/mortgage_step1/${lang}" "" false
done

echo ""
echo -e "${BLUE}5. TESTING CALCULATION PARAMETERS${NC}"
echo "" >> $REPORT_FILE
echo "SECTION: Calculation Parameters" >> $REPORT_FILE
echo "--------------------------------" >> $REPORT_FILE
test_endpoint "Mortgage Parameters" "${API_URL}/v1/calculation-parameters?business_path=mortgage" "" true
test_endpoint "Credit Parameters" "${API_URL}/v1/calculation-parameters?business_path=credit" "" false

# Calculate pass rate
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
else
    PASS_RATE=0
fi

# Summary
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}              TEST SUMMARY${NC}"
echo -e "${BLUE}============================================${NC}"
echo "" >> $REPORT_FILE
echo "============================================" >> $REPORT_FILE
echo "TEST SUMMARY" >> $REPORT_FILE
echo "============================================" >> $REPORT_FILE

echo -e "Total Tests:    ${TOTAL_TESTS}"
echo -e "${GREEN}Passed:         ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed:         ${FAILED_TESTS}${NC}"
echo -e "${YELLOW}Warnings:       ${WARNING_TESTS}${NC}"
echo -e "Pass Rate:      ${PASS_RATE}%"

echo "Total Tests:    ${TOTAL_TESTS}" >> $REPORT_FILE
echo "Passed:         ${PASSED_TESTS}" >> $REPORT_FILE
echo "Failed:         ${FAILED_TESTS}" >> $REPORT_FILE
echo "Warnings:       ${WARNING_TESTS}" >> $REPORT_FILE
echo "Pass Rate:      ${PASS_RATE}%" >> $REPORT_FILE

# Determine overall status
if [ $FAILED_TESTS -eq 0 ]; then
    if [ $WARNING_TESTS -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
        echo "" >> $REPORT_FILE
        echo "RESULT: ALL TESTS PASSED!" >> $REPORT_FILE
        EXIT_CODE=0
    else
        echo ""
        echo -e "${YELLOW}⚠️  TESTS PASSED WITH WARNINGS${NC}"
        echo "" >> $REPORT_FILE
        echo "RESULT: PASSED WITH WARNINGS" >> $REPORT_FILE
        EXIT_CODE=0
    fi
else
    echo ""
    echo -e "${RED}❌ CRITICAL FAILURES DETECTED!${NC}"
    echo "" >> $REPORT_FILE
    echo "RESULT: CRITICAL FAILURES DETECTED!" >> $REPORT_FILE
    
    # List critical issues
    echo ""
    echo -e "${RED}Critical Issues:${NC}"
    echo "" >> $REPORT_FILE
    echo "Critical Issues:" >> $REPORT_FILE
    
    if [ $FAILED_TESTS -gt 0 ]; then
        echo "  - Check dropdown APIs for missing data"
        echo "  - Verify monorepo server is running"
        echo "  - Check database connections"
        
        echo "  - Check dropdown APIs for missing data" >> $REPORT_FILE
        echo "  - Verify monorepo server is running" >> $REPORT_FILE
        echo "  - Check database connections" >> $REPORT_FILE
    fi
    
    EXIT_CODE=1
fi

echo ""
echo -e "${BLUE}Report saved to: ${REPORT_FILE}${NC}"
echo ""

# Optional: Run production health check if critical failures
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${YELLOW}Running production health check...${NC}"
    if [ -f "./production-health-check.sh" ]; then
        bash ./production-health-check.sh
    else
        echo "Health check script not found. To diagnose issues, SSH to production:"
        echo "  ssh root@45.83.42.74"
        echo "  pm2 list"
        echo "  pm2 logs bankimonline-monorepo --lines 50"
    fi
fi

exit $EXIT_CODE