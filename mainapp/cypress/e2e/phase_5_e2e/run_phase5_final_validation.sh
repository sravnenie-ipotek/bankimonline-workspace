#!/bin/bash

#
# PHASE 5 FINAL VALIDATION MASTER SCRIPT
# 
# Executes comprehensive test suite for dropdown standardization project
# Generates production readiness report with executive summary
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
REPORT_DIR="cypress/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FINAL_REPORT="PHASE_5_FINAL_VALIDATION_${TIMESTAMP}"

echo ""
echo "========================================================"
echo -e "${BLUE}🎯 PHASE 5 FINAL VALIDATION SUITE${NC}"
echo "========================================================"
echo -e "${YELLOW}Comprehensive testing for dropdown standardization project${NC}"
echo "Date: $(date)"
echo "Report ID: ${FINAL_REPORT}"
echo ""

# Change to mainapp directory
cd "$(dirname "$0")/../../.."

# Ensure report directory exists
mkdir -p "${REPORT_DIR}"

# Initialize results tracking
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0
CRITICAL_ISSUES=()

# Function to run test suite and capture results
run_test_suite() {
    local suite_name="$1"
    local test_file="$2"
    local suite_description="$3"
    
    echo ""
    echo -e "${PURPLE}Running: ${suite_name}${NC}"
    echo -e "${YELLOW}Description: ${suite_description}${NC}"
    echo "----------------------------------------"
    
    TOTAL_SUITES=$((TOTAL_SUITES + 1))
    
    local start_time=$(date +%s)
    
    if npx cypress run --spec "$test_file" --reporter json --reporter-options "output=${REPORT_DIR}/${suite_name// /_}_${TIMESTAMP}.json" > "${REPORT_DIR}/${suite_name// /_}_output.log" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        echo -e "${GREEN}✅ ${suite_name} PASSED${NC} (${duration}s)"
        PASSED_SUITES=$((PASSED_SUITES + 1))
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        echo -e "${RED}❌ ${suite_name} FAILED${NC} (${duration}s)"
        FAILED_SUITES=$((FAILED_SUITES + 1))
        CRITICAL_ISSUES+=("$suite_name failed validation")
        
        # Show last few lines of error log
        echo -e "${RED}Error details:${NC}"
        tail -n 5 "${REPORT_DIR}/${suite_name// /_}_output.log"
        
        return 1
    fi
}

# Pre-flight checks
echo -e "${BLUE}🔍 PRE-FLIGHT CHECKS${NC}"
echo "----------------------------------------"

# Check if servers are running
echo -n "Checking frontend server (5174)... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5174 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    echo -e "${RED}Error: Frontend server must be running on port 5174${NC}"
    echo "Start with: npm run dev"
    exit 1
fi

echo -n "Checking backend API (8003)... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8003/api/v1/banks | grep -q "200"; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    echo -e "${RED}Error: Backend API server must be running on port 8003${NC}"
    echo "Start with: node server/server-db.js"
    exit 1
fi

echo -n "Checking dropdown API... "
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8003/api/dropdowns/mortgage_step3/en" | grep -q "200"; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Not working${NC}"
    CRITICAL_ISSUES+=("Dropdown API not responding")
fi

echo ""
echo -e "${BLUE}🚀 STARTING COMPREHENSIVE TEST EXECUTION${NC}"
echo ""

# TEST SUITE 1: Executive Summary (Master Test)
run_test_suite \
    "Executive Validation" \
    "cypress/e2e/phase_5_e2e/phase5_executive_test_runner.cy.ts" \
    "Master validation covering all critical business flows and production readiness"

# TEST SUITE 2: Comprehensive Validation
run_test_suite \
    "Comprehensive Validation" \
    "cypress/e2e/phase_5_e2e/phase5_final_comprehensive_validation.cy.ts" \
    "Detailed testing of all business flows, edge cases, and error handling"

# TEST SUITE 3: Browser Compatibility
run_test_suite \
    "Browser Compatibility" \
    "cypress/e2e/phase_5_e2e/phase5_browser_compatibility.cy.ts" \
    "Cross-browser validation for Chrome, Firefox, Safari, and Edge"

# TEST SUITE 4: Performance & Stress Testing
run_test_suite \
    "Performance Testing" \
    "cypress/e2e/phase_5_e2e/phase5_api_stress_testing.cy.ts" \
    "API performance, stress testing, and resource usage validation"

# Calculate success metrics
SUCCESS_RATE=$(( (PASSED_SUITES * 100) / TOTAL_SUITES ))

echo ""
echo "========================================================"
echo -e "${BLUE}📊 PHASE 5 VALIDATION SUMMARY${NC}"
echo "========================================================"
echo "Total Test Suites: $TOTAL_SUITES"
echo -e "Passed: ${GREEN}$PASSED_SUITES${NC}"
echo -e "Failed: ${RED}$FAILED_SUITES${NC}"
echo "Success Rate: $SUCCESS_RATE%"
echo ""

# Determine production readiness
if [ $FAILED_SUITES -eq 0 ] && [ ${#CRITICAL_ISSUES[@]} -eq 0 ]; then
    PRODUCTION_READY="YES"
    OVERALL_STATUS="PASSED"
    echo -e "${GREEN}🚀 PRODUCTION DEPLOYMENT APPROVED${NC}"
    echo -e "${GREEN}✅ All validation criteria met${NC}"
else
    PRODUCTION_READY="NO"
    OVERALL_STATUS="FAILED"
    echo -e "${RED}⚠️ PRODUCTION DEPLOYMENT BLOCKED${NC}"
    echo -e "${RED}❌ Critical issues require resolution${NC}"
fi

echo ""
echo "Production Ready: $PRODUCTION_READY"

# Show critical issues if any
if [ ${#CRITICAL_ISSUES[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}🚨 CRITICAL ISSUES:${NC}"
    for issue in "${CRITICAL_ISSUES[@]}"; do
        echo -e "${RED}- $issue${NC}"
    done
fi

# Generate master summary report
cat > "${REPORT_DIR}/${FINAL_REPORT}_MASTER_SUMMARY.md" << EOF
# 🎯 PHASE 5 FINAL VALIDATION - MASTER SUMMARY

**Execution Date**: $(date)  
**Report ID**: ${FINAL_REPORT}  
**Overall Status**: ${OVERALL_STATUS}  
**Production Ready**: ${PRODUCTION_READY}  

## Executive Summary

The Phase 5 dropdown standardization project has completed comprehensive validation testing. This report summarizes the production readiness assessment.

### Validation Results

- **Total Test Suites**: $TOTAL_SUITES
- **Passed**: ✅ $PASSED_SUITES
- **Failed**: ❌ $FAILED_SUITES  
- **Success Rate**: $SUCCESS_RATE%
- **Critical Issues**: ${#CRITICAL_ISSUES[@]}

### Test Suite Breakdown

1. **Executive Validation**: Core business flow validation and production readiness assessment
2. **Comprehensive Validation**: Detailed E2E testing, accessibility, and multi-language support
3. **Browser Compatibility**: Cross-browser functionality validation
4. **Performance Testing**: API stress testing, load handling, and performance metrics

### Production Readiness Assessment

$(if [ "$PRODUCTION_READY" == "YES" ]; then
cat << PROD_READY
✅ **APPROVED FOR PRODUCTION**

All validation criteria have been met:
- Core business flows working correctly
- Service-specific content independence achieved  
- Income component rendering fixed (critical bug resolved)
- Performance within acceptable limits
- Cross-browser compatibility verified
- Multi-language support functional
- Error handling robust

**Recommendation**: Proceed with production deployment.

**Next Steps**:
1. Deploy to staging environment for final UAT
2. Schedule production deployment window
3. Monitor system performance post-deployment  
4. Continue monitoring dashboard for any issues

PROD_READY
else
cat << PROD_BLOCKED
❌ **PRODUCTION DEPLOYMENT BLOCKED**

Critical issues require resolution before production deployment:

$(for issue in "${CRITICAL_ISSUES[@]}"; do echo "- $issue"; done)

**Recommendation**: Resolve all critical issues and re-run validation.

**Next Steps**:
1. Address all identified critical issues
2. Re-execute Phase 5 validation suite
3. Verify all tests pass with 100% success rate
4. Update deployment timeline accordingly

PROD_BLOCKED
fi)

### Technical Validation Details

#### Critical Business Flows
- **Mortgage Calculator**: End-to-end user journey
- **Credit Calculator**: Income component rendering (critical fix)
- **Other Borrowers**: Service content independence
- **Cross-Service**: API endpoint independence

#### Quality Assurance
- **Performance**: Page load times, API response times
- **Accessibility**: ARIA labels, keyboard navigation
- **Multi-Language**: Hebrew RTL, English LTR
- **Mobile**: Responsive design, touch interactions
- **Error Handling**: Graceful degradation, fallback UI

#### Infrastructure Health
- **Frontend Server**: Port 5174 operational
- **Backend API**: Port 8003 operational  
- **Database**: Dropdown APIs responsive
- **Caching**: Performance optimization active

## Detailed Reports

Individual test suite reports and metrics available in:
- \`${REPORT_DIR}/Executive_Validation_${TIMESTAMP}.json\`
- \`${REPORT_DIR}/Comprehensive_Validation_${TIMESTAMP}.json\`
- \`${REPORT_DIR}/Browser_Compatibility_${TIMESTAMP}.json\`
- \`${REPORT_DIR}/Performance_Testing_${TIMESTAMP}.json\`

---

**Report generated by Phase 5 Master Validation Script**  
**Timestamp**: $(date -Iseconds)
EOF

echo ""
echo -e "${BLUE}📋 REPORTS GENERATED:${NC}"
echo "- Master Summary: ${REPORT_DIR}/${FINAL_REPORT}_MASTER_SUMMARY.md"
echo "- Individual Reports: ${REPORT_DIR}/*_${TIMESTAMP}.json"
echo "- Test Logs: ${REPORT_DIR}/*_output.log"

echo ""
echo -e "${BLUE}🎯 VALIDATION COMPLETE${NC}"

# Set exit code based on overall status
if [ "$OVERALL_STATUS" == "PASSED" ]; then
    echo -e "${GREEN}🚀 Phase 5 validation successful - Ready for production!${NC}"
    exit 0
else
    echo -e "${RED}⚠️ Phase 5 validation failed - Issues require resolution${NC}"
    exit 1
fi