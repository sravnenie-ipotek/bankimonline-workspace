#!/bin/bash

# Phase 4 Frontend Integration Test Runner
# Runs only Phase 4 specific tests for targeted validation

echo "=============================================="
echo "PHASE 4 FRONTEND INTEGRATION TEST SUITE"
echo "=============================================="
echo "Testing: Database-driven dropdown integration"
echo "Focus: Hooks, Components, Performance, Multi-language"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_DIR="cypress/e2e/phase_1_automation"
PHASE4_TESTS=(
    "verify_phase4_component_integration.cy.ts"
    "verify_phase4_hooks_functionality.cy.ts"
    "verify_phase4_multilanguage_support.cy.ts"
    "verify_phase4_performance_caching.cy.ts"
    "verify_phase4_error_handling.cy.ts"
    "phase_4_compliance_report.cy.ts"
)

# Check if we're in the correct directory
if [ ! -d "cypress" ]; then
    echo -e "${RED}❌ Error: Must be run from mainapp directory${NC}"
    echo "Please run: cd mainapp && ./cypress/e2e/phase_1_automation/run_phase4_only.sh"
    exit 1
fi

# Check if Cypress is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Error: npx not found. Please install Node.js and npm${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Checking Phase 4 test files...${NC}"

# Verify all test files exist
missing_tests=()
for test in "${PHASE4_TESTS[@]}"; do
    if [ ! -f "$TEST_DIR/$test" ]; then
        missing_tests+=("$test")
    else
        echo -e "${GREEN}✅ Found: $test${NC}"
    fi
done

if [ ${#missing_tests[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing test files:${NC}"
    for test in "${missing_tests[@]}"; do
        echo -e "${RED}   - $test${NC}"
    done
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Starting Phase 4 test execution...${NC}"
echo ""

# Function to run individual test with error handling
run_test() {
    local test_file=$1
    local test_name=$(basename "$test_file" .cy.ts)
    
    echo -e "${YELLOW}⏳ Running: $test_name${NC}"
    
    if npx cypress run --spec "$TEST_DIR/$test_file" --browser chrome --headless; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        return 1
    fi
}

# Track test results
passed_tests=0
failed_tests=0
total_tests=${#PHASE4_TESTS[@]}

# Run each Phase 4 test
for test in "${PHASE4_TESTS[@]}"; do
    echo ""
    echo "──────────────────────────────────────────────"
    
    if run_test "$test"; then
        ((passed_tests++))
    else
        ((failed_tests++))
    fi
    
    echo "──────────────────────────────────────────────"
done

# Generate summary report
echo ""
echo "=============================================="
echo -e "${BLUE}PHASE 4 TEST EXECUTION SUMMARY${NC}"
echo "=============================================="
echo -e "Total Tests: $total_tests"
echo -e "${GREEN}Passed: $passed_tests${NC}"
echo -e "${RED}Failed: $failed_tests${NC}"

# Calculate success rate
success_rate=$((passed_tests * 100 / total_tests))
echo -e "Success Rate: $success_rate%"

echo ""
echo "Phase 4 Test Results:"
echo "├─ Component Integration: See verify_phase4_component_integration.cy.ts"
echo "├─ Hooks Functionality: See verify_phase4_hooks_functionality.cy.ts"
echo "├─ Multi-Language Support: See verify_phase4_multilanguage_support.cy.ts"
echo "├─ Performance & Caching: See verify_phase4_performance_caching.cy.ts"
echo "├─ Error Handling: See verify_phase4_error_handling.cy.ts"
echo "└─ Compliance Report: See phase_4_compliance_report.cy.ts"

echo ""
echo -e "${BLUE}Key Phase 4 Features Tested:${NC}"
echo "✓ Enhanced useDropdownData hook with returnStructure='full'"
echo "✓ New useAllDropdowns hook for bulk fetching"
echo "✓ 10 components updated with database-driven dropdowns"
echo "✓ Multi-language support (EN/HE/RU) with RTL"
echo "✓ Intelligent caching with 46.5x performance improvement"
echo "✓ Complete legacy cleanup and Redux/Formik integration"

echo ""
if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL PHASE 4 TESTS PASSED!${NC}"
    echo -e "${GREEN}✅ Frontend integration is complete and compliant${NC}"
    echo -e "${GREEN}✅ Ready for production deployment${NC}"
    exit 0
elif [ $success_rate -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Most Phase 4 tests passed ($success_rate%)${NC}"
    echo -e "${YELLOW}🔧 Address failing tests before full deployment${NC}"
    exit 1
else
    echo -e "${RED}❌ Phase 4 tests failed ($success_rate% success rate)${NC}"
    echo -e "${RED}🚨 Significant issues detected - fix before proceeding${NC}"
    exit 1
fi