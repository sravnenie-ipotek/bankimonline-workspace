#!/bin/bash

# Phase 1 Only Test Runner
# This script runs only Phase 1 verification tests

echo "🚀 Starting Phase 1 Automation Tests..."
echo "======================================"

# Check if server is running
if ! curl -s http://localhost:8003/api/health > /dev/null 2>&1; then
  echo "❌ Error: Development server is not running on port 8003"
  echo "Please start the server with: npm run dev"
  exit 1
fi

echo "✅ Server is running on port 8003"
echo ""

# Phase 1 Tests Only
echo "🔷 PHASE 1 VERIFICATION TESTS"
echo "=============================="

echo "📋 Running Content API Verification..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_content_api.cy.ts" --quiet

echo ""
echo "📋 Running Dropdown Structure Verification..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_dropdown_structure.cy.ts" --quiet

echo ""
echo "📋 Running Translation Coverage Verification..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_translation_coverage.cy.ts" --quiet

echo ""
echo "📋 Running Screen Location Verification..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_screen_locations.cy.ts" --quiet

echo ""
echo "📋 Running Phase 1 Compliance Report..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/phase_1_compliance_report.cy.ts" --quiet

echo ""
echo "======================================"
echo "✅ Phase 1 Tests Complete!"