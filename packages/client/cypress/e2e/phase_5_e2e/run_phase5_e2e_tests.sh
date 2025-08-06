#!/bin/bash

# Phase 5 E2E Test Runner
# Tests full happy-path for all services in all 3 languages (EN/HE/RU)

echo "🚀 Starting Phase 5 E2E Tests - Multi-Language Happy Path"
echo "========================================================"
echo "Services: Mortgage Calculator, Credit Calculator, Refinance Calculator"
echo "Languages: English, Hebrew, Russian"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if frontend server is running
echo "🔍 Checking frontend server..."
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo -e "${RED}❌ Error: Frontend server is not running on port 5173${NC}"
  echo "Please start the frontend server with:"
  echo "  cd mainapp && npm run dev"
  exit 1
fi
echo -e "${GREEN}✅ Frontend server is running${NC}"

# Check if backend server is running
echo "🔍 Checking backend server..."
if ! curl -s http://localhost:8003/api/v1/banks > /dev/null 2>&1; then
  echo -e "${RED}❌ Error: Backend server is not running on port 8003${NC}"
  echo "Please start the backend server with:"
  echo "  npm run dev"
  exit 1
fi
echo -e "${GREEN}✅ Backend server is running${NC}"
echo ""

# Function to run a test file
run_test() {
  local test_file=$1
  local test_name=$2
  
  echo -e "${BLUE}📋 Running: ${test_name}${NC}"
  echo "----------------------------------------"
  
  if npm run cypress:run -- --spec "cypress/e2e/phase_5_e2e/${test_file}" --quiet; then
    echo -e "${GREEN}✅ ${test_name} - PASSED${NC}"
    return 0
  else
    echo -e "${RED}❌ ${test_name} - FAILED${NC}"
    return 1
  fi
  echo ""
}

# Track test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Run Mortgage Calculator tests
((TOTAL_TESTS++))
if run_test "mortgage_calculator_happy_path.cy.ts" "Mortgage Calculator Multi-Language"; then
  ((PASSED_TESTS++))
else
  ((FAILED_TESTS++))
fi

# Run Credit Calculator tests
((TOTAL_TESTS++))
if run_test "credit_calculator_happy_path.cy.ts" "Credit Calculator Multi-Language"; then
  ((PASSED_TESTS++))
else
  ((FAILED_TESTS++))
fi

# Run Refinance Calculator tests
((TOTAL_TESTS++))
if run_test "refinance_calculator_happy_path.cy.ts" "Refinance Calculator Multi-Language"; then
  ((PASSED_TESTS++))
else
  ((FAILED_TESTS++))
fi

# Summary Report
echo ""
echo "========================================"
echo -e "${BLUE}📊 PHASE 5 E2E TEST SUMMARY${NC}"
echo "========================================"
echo "Total Test Suites: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 All Phase 5 E2E tests passed!${NC}"
  echo ""
  echo "✅ Multi-language support verified (EN/HE/RU)"
  echo "✅ Database-driven dropdowns working correctly"
  echo "✅ Form validation functioning in all languages"
  echo "✅ Data persistence across steps confirmed"
  echo "✅ API integration with caching verified"
  echo "✅ Error handling tested"
  echo ""
  echo -e "${YELLOW}📌 Next Steps:${NC}"
  echo "1. Run admin panel smoke tests"
  echo "2. Deploy to staging for UAT"
  echo "3. Monitor performance metrics"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Some tests failed. Please check the logs above.${NC}"
  echo ""
  echo "To run tests interactively:"
  echo "  npm run cypress"
  echo ""
  echo "To run a specific test:"
  echo "  npm run cypress:run -- --spec 'cypress/e2e/phase_5_e2e/<test-file>.cy.ts'"
  exit 1
fi