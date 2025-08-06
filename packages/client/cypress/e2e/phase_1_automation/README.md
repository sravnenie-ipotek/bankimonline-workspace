# Phase 1 & Phase 3 Automation Tests

This folder contains automated tests to verify both Phase 1 database structure changes and Phase 3 API implementation for the dropdown migration project.

## Overview

**Phase 1** focused on restructuring the database to comply with the `dropDownsInDBLogic` requirements:
- ✅ Screen-location alignment (mortgage_calculation → mortgage_step1-4)
- ✅ Component type standardization (field_label → label, etc.)
- ✅ Category standardization (all form items → category='form')
- ✅ Database indexes for performance

**Phase 3** focused on enhanced API implementation with performance optimization:
- ✅ Enhanced Content API with type filtering
- ✅ New Structured Dropdowns API
- ✅ Cache management and statistics
- ✅ Performance requirements (<200ms)
- ✅ Multi-language support validation

## Phase 1 Test Coverage

### 1. `verify_content_api.cy.ts`
Tests the content API endpoints to ensure:
- Proper screen locations are returned
- Component types follow new standards
- Categories are correctly set
- All dropdown structures are present

### 2. `verify_dropdown_structure.cy.ts`
Validates dropdown data structure:
- Each dropdown has proper container
- Options are linked to dropdowns
- Labels and placeholders exist
- No duplicate content keys

### 3. `verify_translation_coverage.cy.ts`
Checks translation status:
- Identifies missing translations
- Validates language coverage (en, he, ru)
- Reports on screens needing translations

### 4. `verify_screen_locations.cy.ts`
Ensures proper content organization:
- mortgage_step1 contains property/loan fields
- mortgage_step2 contains personal data
- mortgage_step3 contains income data
- mortgage_step4 contains bank offers

### 5. `phase_1_compliance_report.cy.ts`
Generates comprehensive Phase 1 compliance report

## Phase 3 Test Coverage

### 1. `verify_phase3_content_api.cy.ts`
Tests enhanced Content API features:
- Type filtering functionality (dropdown, option, placeholder, label)
- Backward compatibility (no type parameter)
- Multi-language support validation
- Error handling for invalid parameters
- Data integrity across all responses

### 2. `verify_phase3_dropdowns_api.cy.ts`
Tests structured Dropdowns API:
- Structured response format validation
- Data completeness and consistency
- Cross-language consistency
- Performance requirements
- Option data validation
- Error handling

### 3. `verify_phase3_performance.cy.ts`
Validates performance requirements:
- Response time <200ms for all endpoints
- Cache performance improvement validation
- Concurrent request handling
- Multi-language performance consistency
- Payload efficiency analysis

### 4. `verify_phase3_cache_management.cy.ts`
Tests cache management features:
- Cache statistics endpoint
- Cache clearing functionality
- Performance impact of caching
- Cache behavior under load
- Multi-language cache consistency

### 5. `phase_3_compliance_report.cy.ts`
Generates comprehensive Phase 3 compliance report

## Running the Tests

### All Tests (Phase 1 + Phase 3)
```bash
# Run all tests using the comprehensive script
cd mainapp/cypress/e2e/phase_1_automation
./run_all_tests.sh

# Or run individual test files
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/**/*.cy.ts"
```

### Phase 1 Tests Only
```bash
# Run only Phase 1 verification tests
cd mainapp/cypress/e2e/phase_1_automation
./run_phase1_only.sh

# Or run specific Phase 1 tests
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_content_api.cy.ts"
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_dropdown_structure.cy.ts"
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/phase_1_compliance_report.cy.ts"
```

### Phase 3 Tests Only
```bash
# Run only Phase 3 API automation tests
cd mainapp/cypress/e2e/phase_1_automation
./run_phase3_only.sh

# Or run specific Phase 3 tests
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase3_content_api.cy.ts"
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase3_dropdowns_api.cy.ts"
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/verify_phase3_performance.cy.ts"
npm run cypress:run -- --spec "cypress/e2e/phase_1_automation/phase_3_compliance_report.cy.ts"
```

### Interactive Mode
```bash
# Run in interactive mode
npm run cypress:open
# Then navigate to phase_1_automation folder and select tests
```

## Expected Results

### Phase 1 Results
All Phase 1 tests should pass, confirming:
- 100% Database structure compliance
- 100% Component type compliance  
- 100% Screen location compliance
- 95% Translation coverage (10 items pending)

### Phase 3 Results
All Phase 3 tests should pass, confirming:
- ✅ Enhanced Content API with filtering: 25 dropdown items
- ✅ Structured Dropdowns API: 38 dropdowns, 21 option groups
- ✅ Cache performance: 46.5x speedup (93ms → 2ms)
- ✅ Multi-language support: EN/HE both have 38 dropdowns
- ✅ Performance requirement: <200ms response times
- ✅ Cache management: Statistics and clearing functionality

## Test Data & Endpoints

### Phase 1 Endpoints
- `/api/content/:screen/:language` - Content management API
- `/api/v1/locales` - Legacy translation API (for comparison)

### Phase 3 Endpoints
- `/api/content/:screen/:language?type=:component_type` - Enhanced content API
- `/api/dropdowns/:screen/:language` - Structured dropdowns API
- `/api/content/cache/stats` - Cache statistics
- `/api/content/cache/clear` - Cache clearing

## Performance Benchmarks

Phase 3 tests validate these performance requirements:
- **Response Time**: <200ms for all API endpoints
- **Cache Speedup**: >10x improvement (target: 46.5x)
- **Concurrent Handling**: 10+ simultaneous requests
- **Payload Size**: <100KB for content, <50KB for dropdowns
- **Cache Hit Rate**: >50% after initial population

## Notes

- Tests run against the development server (localhost:8003)
- Database connection must be active
- Tests are read-only (no data modifications)
- Results are logged to console for debugging
- Phase 3 tests include automatic cache clearing for accurate performance measurements

## Troubleshooting

If tests fail:
1. Check database connection in .env file
2. Ensure dev server is running: `npm run dev`
3. Verify recent migrations were applied
4. Check console logs for specific errors
5. For Phase 3 tests, ensure cache endpoints are implemented
6. Verify manual test results match automated expectations

## Future Enhancements

When Phase 4-5 are complete, add tests for:
- Frontend component integration with new APIs
- Admin panel dropdown management
- Cross-browser compatibility
- E2E user workflow validation
- Real-time dropdown updates