#!/bin/bash

# Phase 7: Post-Deployment Monitoring Tests Runner
# This script runs all Phase 7 tests that validate KPI monitoring,
# performance metrics, and legacy cleanup after deployment

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Phase 7: Post-Deployment Monitoring Tests${NC}"
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

echo -e "${YELLOW}Running Phase 7 post-deployment monitoring tests...${NC}"
echo ""

# Array of Phase 7 test files
PHASE7_TESTS=(
    "verify_phase7_monitoring.cy.ts"
    "verify_phase7_performance.cy.ts"
    "verify_phase7_cleanup.cy.ts"
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

# Run each Phase 7 test
for test in "${PHASE7_TESTS[@]}"; do
    run_test "$test"
done

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Phase 7 Test Summary${NC}"
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

# Phase 7 specific monitoring checks
echo -e "${YELLOW}Phase 7 Monitoring Status:${NC}"
echo "----------------------------------------"

# Check 1: Error rate monitoring
echo -n "1. Error rate monitoring: "
ERROR_RATE=$(curl -s http://localhost:8003/api/admin/metrics/errors 2>/dev/null | jq -r '.error_rate // "N/A"' 2>/dev/null || echo "N/A")
if [ "$ERROR_RATE" != "N/A" ] && [ $(echo "$ERROR_RATE < 0.01" | bc -l 2>/dev/null || echo 0) -eq 1 ]; then
    echo -e "${GREEN}✓ Healthy (${ERROR_RATE})${NC}"
else
    echo -e "${YELLOW}⚠ Check needed (${ERROR_RATE})${NC}"
fi

# Check 2: API performance
echo -n "2. API performance: "
AVG_LATENCY=$(curl -s http://localhost:8003/api/admin/metrics/performance 2>/dev/null | jq -r '.avg_latency // "N/A"' 2>/dev/null || echo "N/A")
if [ "$AVG_LATENCY" != "N/A" ] && [ $(echo "$AVG_LATENCY < 200" | bc -l 2>/dev/null || echo 0) -eq 1 ]; then
    echo -e "${GREEN}✓ Good (${AVG_LATENCY}ms)${NC}"
else
    echo -e "${YELLOW}⚠ Needs optimization (${AVG_LATENCY}ms)${NC}"
fi

# Check 3: Cache performance
echo -n "3. Cache hit rate: "
CACHE_HIT_RATE=$(curl -s http://localhost:8003/api/admin/cache/stats 2>/dev/null | jq -r '.hit_rate // "N/A"' 2>/dev/null || echo "N/A")
if [ "$CACHE_HIT_RATE" != "N/A" ] && [ $(echo "$CACHE_HIT_RATE > 0.9" | bc -l 2>/dev/null || echo 0) -eq 1 ]; then
    echo -e "${GREEN}✓ Excellent ($(echo "$CACHE_HIT_RATE * 100" | bc -l | cut -d. -f1)%)${NC}"
else
    echo -e "${YELLOW}⚠ Below target (${CACHE_HIT_RATE})${NC}"
fi

# Check 4: Legacy cleanup
echo -n "4. Legacy code cleanup: "
LEGACY_COUNT=$(find "$PROJECT_ROOT/src" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "option_1\|option_2\|option_3" {} \; 2>/dev/null | wc -l)
if [ "$LEGACY_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ Complete${NC}"
else
    echo -e "${YELLOW}⚠ ${LEGACY_COUNT} files with legacy patterns${NC}"
fi

echo ""

# Generate monitoring dashboard
echo -e "${YELLOW}Generating monitoring dashboard...${NC}"

# Create monitoring summary
cat > "$PROJECT_ROOT/cypress/reports/phase7_monitoring_dashboard.json" << EOF
{
  "phase": "Phase 7: Post-Deployment Monitoring",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "test_results": {
    "total": $TOTAL_TESTS,
    "passed": $PASSED_TESTS,
    "failed": $FAILED_TESTS
  },
  "system_health": {
    "error_rate": "$ERROR_RATE",
    "avg_latency": "$AVG_LATENCY",
    "cache_hit_rate": "$CACHE_HIT_RATE",
    "legacy_files": $LEGACY_COUNT
  },
  "kpis": {
    "error_threshold": "< 1%",
    "latency_threshold": "< 200ms",
    "cache_threshold": "> 90%",
    "completion_threshold": "> 85%"
  }
}
EOF

echo -e "${GREEN}Dashboard saved to cypress/reports/phase7_monitoring_dashboard.json${NC}"
echo ""

# Exit code
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}All Phase 7 tests passed! 🎉${NC}"
    echo -e "${GREEN}Post-deployment monitoring shows system is healthy.${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Continue monitoring for 30 days"
    echo "2. Archive legacy code after stability confirmed"
    echo "3. Plan next phase migrations"
    echo "4. Document lessons learned"
    
    exit 0
else
    echo -e "${RED}Some Phase 7 tests failed!${NC}"
    echo -e "${YELLOW}Please review monitoring metrics and address any issues.${NC}"
    echo ""
    echo -e "${BLUE}Troubleshooting:${NC}"
    echo "1. Check error logs: tail -f logs/error.log"
    echo "2. Review performance metrics in dashboard"
    echo "3. Validate cache configuration"
    echo "4. Ensure legacy cleanup is complete"
    
    exit 1
fi