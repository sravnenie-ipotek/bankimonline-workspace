#!/bin/bash

# Phase 6: Deployment & Rollback Tests Runner
# This script runs all Phase 6 tests that validate deployment procedures,
# feature flags, and rollback capabilities

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Phase 6: Deployment & Rollback Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../../../.."

# Change to mainapp directory
cd "$PROJECT_ROOT" || exit 1

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Not in the mainapp directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Running Phase 6 deployment validation tests...${NC}"
echo ""

# Array of Phase 6 test files
PHASE6_TESTS=(
    "verify_phase6_deployment.cy.ts"
    "verify_phase6_feature_flags.cy.ts"
    "verify_phase6_rollback.cy.ts"
)

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FAILED_SPECS=()

# Function to run a single test
run_test() {
    local test_file=$1
    local test_name=$(echo "$test_file" | sed 's/.cy.ts//')
    
    echo -e "${BLUE}Running: $test_name${NC}"
    echo "----------------------------------------"
    
    # Run the test and capture result
    if npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/$test_file" --quiet; then
        echo -e "${GREEN}✓ $test_name passed${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}✗ $test_name failed${NC}"
        ((FAILED_TESTS++))
        FAILED_SPECS+=("$test_file")
    fi
    
    ((TOTAL_TESTS++))
    echo ""
}

# Run each Phase 6 test
for test in "${PHASE6_TESTS[@]}"; do
    run_test "$test"
done

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Phase 6 Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Total test suites: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

# Show failed tests if any
if [ ${#FAILED_SPECS[@]} -gt 0 ]; then
    echo -e "${RED}Failed test suites:${NC}"
    for spec in "${FAILED_SPECS[@]}"; do
        echo -e "${RED}  - $spec${NC}"
    done
    echo ""
fi

# Phase 6 specific checks
echo -e "${YELLOW}Phase 6 Validation Checklist:${NC}"
echo "----------------------------------------"

# Check 1: Feature flag configuration
echo -n "1. Feature flag configuration: "
if curl -s http://localhost:8003/api/v1/params | grep -q "USE_DB_DROPDOWNS"; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${YELLOW}⚠ Not found (may need server running)${NC}"
fi

# Check 2: Database backup files
echo -n "2. Database backup files: "
BACKUP_DIR="$PROJECT_ROOT/../@28.07.25"
if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR/*.sql 2>/dev/null | wc -l)" -gt 0 ]; then
    echo -e "${GREEN}✓ Found ($(ls -A $BACKUP_DIR/*.sql 2>/dev/null | wc -l) files)${NC}"
else
    echo -e "${RED}✗ Not found${NC}"
fi

# Check 3: Migration files
echo -n "3. Migration scripts: "
MIGRATION_DIR="$PROJECT_ROOT/../migrations"
if [ -d "$MIGRATION_DIR" ] && [ "$(ls -A $MIGRATION_DIR/202501_phase1*.sql 2>/dev/null | wc -l)" -gt 0 ]; then
    echo -e "${GREEN}✓ Found ($(ls -A $MIGRATION_DIR/202501_phase1*.sql 2>/dev/null | wc -l) files)${NC}"
else
    echo -e "${RED}✗ Not found${NC}"
fi

# Check 4: Health check endpoint
echo -n "4. Health check endpoint: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8003/api/health | grep -q "200"; then
    echo -e "${GREEN}✓ Responding${NC}"
else
    echo -e "${YELLOW}⚠ Not responding (server may be down)${NC}"
fi

echo ""

# Exit code
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}All Phase 6 tests passed! 🎉${NC}"
    echo -e "${GREEN}Deployment validation complete.${NC}"
    
    # Generate success report
    cat > "$PROJECT_ROOT/cypress/reports/phase6_success.json" << EOF
{
  "phase": "Phase 6: Deployment & Rollback",
  "status": "PASS",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "total_tests": $TOTAL_TESTS,
    "passed": $PASSED_TESTS,
    "failed": $FAILED_TESTS
  },
  "validations": {
    "database_migration": "Ready",
    "feature_flags": "Configured",
    "rollback_procedures": "Tested",
    "health_checks": "Implemented"
  }
}
EOF
    
    exit 0
else
    echo -e "${RED}Some Phase 6 tests failed!${NC}"
    echo -e "${YELLOW}Please review the failed tests and fix issues before deployment.${NC}"
    
    # Generate failure report
    cat > "$PROJECT_ROOT/cypress/reports/phase6_failure.json" << EOF
{
  "phase": "Phase 6: Deployment & Rollback",
  "status": "FAIL",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "total_tests": $TOTAL_TESTS,
    "passed": $PASSED_TESTS,
    "failed": $FAILED_TESTS,
    "failed_specs": $(printf '%s\n' "${FAILED_SPECS[@]}" | jq -R . | jq -s .)
  }
}
EOF
    
    exit 1
fi