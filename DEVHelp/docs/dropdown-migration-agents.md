# 🤖 Dropdown Migration Specialized Subagents

This document outlines the specialized AI subagents created for the dropdown migration project. Each agent has bulletproof instructions and specific expertise areas.

## 🟢 dropdown-migration-specialist
**Color**: Green  
**Purpose**: Database migration and content standardization  
**Phase**: 1-2 (Database & Translations)

### Key Responsibilities:
- Screen-location alignment (mortgage_calculation → mortgage_step1-4)
- Component type standardization (field_option → option)
- Category assignment and index creation
- Translation coverage verification

### When to Use:
- Moving dropdown content between screens
- Standardizing component types
- Creating migration SQL scripts
- Fixing test failures related to database structure

### Critical Rules:
- NEVER delete translations
- ALWAYS use BEGIN/COMMIT in migrations
- Cities are in separate table BY DESIGN
- All dropdown items must have category='form'

---

## 🔵 api-dropdown-engineer
**Color**: Blue  
**Purpose**: API endpoint creation and optimization  
**Phase**: 3 (Server/API Layer)

### Key Responsibilities:
- Extend `/api/content/{screen}/{lang}` with type filtering
- Create `/api/dropdowns/{screen}/{lang}` structured endpoint
- Implement 5-minute caching with node-cache
- Write API tests with Jest/Supertest

### When to Use:
- Creating new dropdown-specific endpoints
- Implementing caching strategies
- Optimizing API performance
- Writing API contract tests

### Critical Features:
- Structured response format (dropdowns, options, placeholders, labels)
- Cache key generation with language support
- Error handling with graceful degradation
- Performance monitoring (<200ms target)

---

## 🔷 frontend-dropdown-refactor
**Color**: Cyan  
**Purpose**: React component refactoring  
**Phase**: 4 (Frontend Integration)

### Key Responsibilities:
- Create useDropdownData and useAllDropdowns hooks
- Update 15+ dropdown components
- Remove hardcoded arrays
- Implement loading states and error handling

### When to Use:
- Refactoring dropdown components to use API
- Creating React hooks for data fetching
- Implementing Formik integration
- Adding loading skeletons

### Component Priority:
1. **High**: PropertyOwnership, WhenDoYouNeedMoney, TypeSelect
2. **Medium**: MainSourceSelect, DebtTypesSelect, BankSelect  
3. **Low**: RefinanceTypeSelect, FilterSelect

---

## 🟡 dropdown-test-automation
**Color**: Yellow  
**Purpose**: Comprehensive test coverage  
**Phase**: 5 (Testing & Validation)

### Key Responsibilities:
- Database integrity tests
- API contract validation
- E2E Cypress workflows
- Multi-language testing
- Performance benchmarking

### When to Use:
- Writing new test suites
- Debugging test failures
- Performance testing
- Regression testing

### Test Categories:
- **Database**: Integrity, duplicates, translations
- **API**: Contracts, caching, concurrent requests
- **E2E**: User flows, language switching, error handling
- **Performance**: Response times, load testing

---

## 🔴 content-migration-fixer
**Color**: Red  
**Purpose**: Fix content key mismatches  
**Phase**: Ongoing (Debugging & Fixes)

### Key Responsibilities:
- Diagnose "content not found" issues
- Map component keys to database keys
- Fix naming convention mismatches
- Create migration scripts for key updates

### When to Use:
- Component shows hardcoded fallback text
- Translation keys don't match database
- Content API returns empty for known fields
- After moving content between screens

### Common Patterns:
- `calculate_mortgage_*` vs `mortgage_calculation.field.*`
- `_ph` vs `_placeholder`
- `option_1` vs `option_no_property`
- Screen location mismatches

---

## 🟠 Existing Agents to Use

### database-migrator (Orange)
**When to Use**: General database migrations, content system transitions
**Synergy**: Works with dropdown-migration-specialist for complex migrations

### api-integration-expert 
**When to Use**: RTK Query setup, API slice creation
**Synergy**: Pairs with api-dropdown-engineer for frontend API integration

### form-validator (Purple)
**When to Use**: Formik validation, Yup schemas
**Synergy**: Updates validation after frontend-dropdown-refactor changes

### qa-comprehensive-tester
**When to Use**: Manual test scenarios, cross-browser testing
**Synergy**: Complements dropdown-test-automation for manual verification

### rtl-ui-specialist
**When to Use**: Hebrew language support, RTL layouts
**Synergy**: Ensures dropdowns work correctly in RTL mode

---

## 🚀 Recommended Workflow

### Phase 1-2: Database & Translations
1. Use **dropdown-migration-specialist** to standardize database
2. Use **content-migration-fixer** to resolve any key mismatches
3. Run automation tests to verify

### Phase 3: API Layer
1. Use **api-dropdown-engineer** to create endpoints
2. Use **api-integration-expert** for RTK Query setup
3. Test with **dropdown-test-automation**

### Phase 4: Frontend
1. Use **frontend-dropdown-refactor** for component updates
2. Use **form-validator** to update Yup schemas
3. Use **rtl-ui-specialist** for Hebrew support

### Phase 5: Testing
1. Use **dropdown-test-automation** for comprehensive tests
2. Use **qa-comprehensive-tester** for manual scenarios
3. Document with **translation-manager**

---

## 💡 Pro Tips

1. **Always start with diagnosis**: Use content-migration-fixer first when things don't work
2. **Work in phases**: Complete each phase before moving to next
3. **Test continuously**: Run Phase 1 automation after each change
4. **Document migrations**: Keep DEVHelp/bugs/dropDownAndMigrationsBugs.md updated
5. **Use agents together**: They're designed to complement each other

## 🎯 Success Metrics
- ✅ 55/55 Phase 1 automation tests passing
- ✅ API response time <200ms
- ✅ All 15 components using dynamic data
- ✅ 100% translation coverage
- ✅ Zero hardcoded dropdown arrays