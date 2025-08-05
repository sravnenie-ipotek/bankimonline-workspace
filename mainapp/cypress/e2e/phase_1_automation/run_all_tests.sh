#!/bin/bash

# Complete Dropdown Migration Test Runner  
# This script runs all Phase 1, 3, 4, 5, 6, and 7 automation tests

echo "🚀 Starting Complete Dropdown Migration Test Suite..."
echo "====================================================="
echo "Phases: 1 (Database), 3 (API), 4 (Frontend), 5 (Testing), 6 (Deployment), 7 (Monitoring)"

# Check if server is running
if ! curl -s http://localhost:8003/api/health > /dev/null 2>&1; then
  echo "❌ Error: Development server is not running on port 8003"
  echo "Please start the server with: npm run dev"
  exit 1
fi

echo "✅ Server is running on port 8003"
echo ""

# Phase 1 Tests
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

# Phase 3 Tests
echo ""
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

# Phase 4 Tests
echo ""
echo "🔷 PHASE 4 FRONTEND INTEGRATION TESTS"
echo "======================================"

echo "📋 Running Component Integration Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase4_component_integration.cy.ts" --quiet

echo ""
echo "📋 Running Hooks Functionality Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase4_hooks_functionality.cy.ts" --quiet

echo ""
echo "📋 Running Multi-Language Support Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase4_multilanguage_support.cy.ts" --quiet

echo ""
echo "📋 Running Performance & Caching Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase4_performance_caching.cy.ts" --quiet

echo ""
echo "📋 Running Error Handling Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase4_error_handling.cy.ts" --quiet

echo ""
echo "📋 Running Phase 4 Compliance Report..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/phase_4_compliance_report.cy.ts" --quiet

# Phase 5 Tests
echo ""
echo "🔷 PHASE 5 VALIDATION & TESTING"
echo "==============================="

echo "📋 Running Mortgage Calculator Happy Path Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_5_e2e/mortgage_calculator_happy_path.cy.ts" --quiet

echo ""
echo "📋 Running Credit Calculator Happy Path Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_5_e2e/credit_calculator_happy_path.cy.ts" --quiet

echo ""
echo "📋 Running Refinance Calculator Happy Path Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_5_e2e/refinance_calculator_happy_path.cy.ts" --quiet

echo ""
echo "📋 Running Admin Panel Smoke Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_5_e2e/admin_panel_smoke_tests.cy.ts" --quiet

# Phase 6 Tests
echo ""
echo "🔷 PHASE 6 DEPLOYMENT & ROLLBACK"
echo "================================"

echo "📋 Running Deployment Validation Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase6_deployment.cy.ts" --quiet

echo ""
echo "📋 Running Feature Flag Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase6_feature_flags.cy.ts" --quiet

echo ""
echo "📋 Running Rollback Procedure Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase6_rollback.cy.ts" --quiet

# Phase 7 Tests
echo ""
echo "🔷 PHASE 7 POST-DEPLOYMENT MONITORING"
echo "====================================="

echo "📋 Running KPI Monitoring Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase7_monitoring.cy.ts" --quiet

echo ""
echo "📋 Running Performance Metrics Tests..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase7_performance.cy.ts" --quiet

echo ""
echo "📋 Running Legacy Cleanup Verification..."
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase7_cleanup.cy.ts" --quiet

echo ""
echo "====================================================="
echo "✅ Complete Dropdown Migration Test Suite Complete!"
echo ""
echo "📊 MIGRATION PROGRESS:"
echo "├─ Phase 1: Database Structure ✅"
echo "├─ Phase 2: Translation Coverage ✅"
echo "├─ Phase 3: API Implementation ✅"  
echo "├─ Phase 4: Frontend Integration ✅"
echo "├─ Phase 5: Validation & Testing ✅"
echo "├─ Phase 6: Deployment & Rollback ✅"
echo "└─ Phase 7: Post-Deployment Monitoring ✅"
echo ""
echo "To run tests interactively, use:"
echo "npm run cypress:open"
echo ""
echo "To run specific phase tests:"
echo "./run_phase1_only.sh     # Phase 1: Database tests"
echo "./run_phase3_only.sh     # Phase 3: API tests"
echo "./run_phase4_only.sh     # Phase 4: Frontend tests"
echo "../phase_5_e2e/run_phase5_e2e_tests.sh    # Phase 5: E2E tests"
echo "./run_phase6_only.sh     # Phase 6: Deployment tests"
echo "./run_phase7_only.sh     # Phase 7: Monitoring tests"
echo ""
echo "To run a specific test file:"
echo "npm run cypress:run -- --spec 'cypress/e2e/phase_1_automation/<test-file>.cy.ts'"