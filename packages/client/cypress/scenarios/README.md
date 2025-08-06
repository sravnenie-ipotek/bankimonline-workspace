# Cypress Test Scenarios

This directory contains comprehensive test scenarios for all calculator processes in the banking application.

## Structure

Each process has its own folder with complete test coverage:

```
scenarios/
├── refinance-credit/          # מחזור משכנתא (Refinance Credit)
│   ├── refinance-credit-complete.cy.ts
│   └── refinance-credit-edge-cases.cy.ts
├── calculate-credit/          # חישוב אשראי (Calculate Credit)
├── refinance-mortgage/        # מחזור משכנתא (Refinance Mortgage)
└── calculate-mortgage/        # חישוב משכנתא (Calculate Mortgage)
```

## Refinance Credit Tests

### refinance-credit-complete.cy.ts
Complete end-to-end test covering all 4 steps:

**Step 1 Coverage:**
- ✅ All 4 refinancing goal options with conditional fields
- ✅ Multiple credit entry management (add/edit/delete)
- ✅ All 5 bank dropdown options
- ✅ Date picker interactions
- ✅ Early repayment field (conditional)
- ✅ Desired payment input (conditional)
- ✅ Desired term slider (conditional)
- ✅ Delete confirmation modal
- ✅ Authentication flow

**Step 2 Coverage:**
- ✅ All personal information fields
- ✅ Education dropdown (7 options)
- ✅ Citizenship dropdown (3 options)
- ✅ Family status dropdown (6 options)
- ✅ Medical insurance dropdown (2 options)
- ✅ Yes/No fields (4 fields)
- ✅ City autocomplete
- ✅ Partner information (conditional)

**Step 3 Coverage:**
- ✅ Income source modal (7 types)
- ✅ Additional income modal (7 types)
- ✅ Obligations modal (5 types)
- ✅ All bank options in obligations
- ✅ Edit/Delete functionality
- ✅ Modal interactions

**Step 4 Coverage:**
- ✅ Bank offer display
- ✅ Filter functionality
- ✅ Sorting options
- ✅ Bank selection
- ✅ Navigation
- ✅ Final submission

### refinance-credit-edge-cases.cy.ts
Comprehensive edge case testing:

- ✅ Maximum credit entries (10+)
- ✅ All validation scenarios
- ✅ Negative and zero values
- ✅ Extremely large values
- ✅ All 16 combinations of yes/no fields
- ✅ All modal cancel methods (button, ESC, click outside)
- ✅ Complex navigation patterns
- ✅ All dropdown option combinations
- ✅ Multiple income/obligation scenarios

## Test Execution

Run all scenarios:
```bash
npm run cypress:open
# Select scenarios folder
```

Run specific process:
```bash
npx cypress run --spec "cypress/scenarios/refinance-credit/**/*.cy.ts"
```

## Key Test Features

1. **Complete Coverage**: Every button, dropdown, input, and modal is tested
2. **Real User Flow**: Tests follow actual user journeys
3. **Edge Cases**: Handles validation, errors, and unusual inputs
4. **Conditional Logic**: Tests all conditional field appearances
5. **Modal Interactions**: All modal open/close/submit scenarios
6. **Multi-language**: Tests work with Hebrew UI

## Test Data

- Phone: `0544123456`
- OTP: `123456` (mock)
- ID: `123456789`

## Notes

- Tests clear session data before each run
- Authentication flow is handled automatically
- All form validations are tested
- Tests work with both authenticated and non-authenticated states