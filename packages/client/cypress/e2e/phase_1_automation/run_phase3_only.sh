#!/bin/bash

# Phase 3 Only Test Runner
# This script runs only Phase 3 API automation tests

echo "🚀 Starting Phase 3 API Automation Tests..."
echo "==========================================="

# Check if server is running
if ! curl -s http://localhost:8003/api/health > /dev/null 2>&1; then
  echo "❌ Error: Development server is not running on port 8003"
  echo "Please start the server with: npm run dev"
  exit 1
fi

echo "✅ Server is running on port 8003"
echo ""

# Phase 3 Tests Only
echo "🔷 PHASE 3 API AUTOMATION TESTS"
echo "==============================="

echo "📋 Running Enhanced Content API Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase3_content_api.cy.ts" --quiet

echo ""
echo "📋 Running Structured Dropdowns API Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase3_dropdowns_api.cy.ts" --quiet

echo ""
echo "📋 Running Performance Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase3_performance.cy.ts" --quiet

echo ""
echo "📋 Running Cache Management Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase3_cache_management.cy.ts" --quiet

echo ""
echo "📋 Running Phase 3 Compliance Report..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/phase_3_compliance_report.cy.ts" --quiet

echo ""
echo "==========================================="
echo "✅ Phase 3 API Tests Complete!"
echo ""
echo "Summary of Phase 3 Tests:"
echo "✓ Enhanced Content API with type filtering"
echo "✓ Structured Dropdowns API"
echo "✓ Performance requirements (<200ms)"
echo "✓ Cache management and statistics"
echo "✓ Multi-language support (EN/HE/RU)"
echo "✓ Error handling and edge cases"