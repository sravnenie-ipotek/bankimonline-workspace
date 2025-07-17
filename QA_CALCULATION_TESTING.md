# QA Testing Plan for Database-Driven Calculations

## Overview
This document outlines comprehensive QA testing for the elimination of hardcoded values in the calculation system, ensuring all calculations are database-driven and follow the Confluence specification.

## Test Categories

### 1. Database-Driven Parameter Fetching Tests

#### Test 1.1: Calculation Parameters API
**Endpoint**: `/api/v1/calculation-parameters`
**Test Cases**:
```bash
# Test mortgage parameters
curl "http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage"

# Test credit parameters  
curl "http://localhost:8003/api/v1/calculation-parameters?business_path=credit"

# Test refinance parameters
curl "http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage_refinance"
```

**Expected Results**:
- ✅ Returns current_interest_rate (5.0% for mortgage, 8.5% for credit)
- ✅ Returns property_ownership_ltvs with correct Confluence values
- ✅ Returns standards organized by category
- ✅ No hardcoded fallback values unless DB is completely down

#### Test 1.2: Property Ownership LTV Ratios
**Endpoint**: `/api/property-ownership-ltv`
**Test Cases**:
```bash
curl "http://localhost:8003/api/property-ownership-ltv"
```

**Expected Results (Confluence Specification)**:
- ✅ `no_property`: 0.75 (75% financing, 25% min down payment)
- ✅ `has_property`: 0.50 (50% financing, 50% min down payment)
- ✅ `selling_property`: 0.70 (70% financing, 30% min down payment)

### 2. Frontend Component Tests

#### Test 2.1: CalculateCredit FirstStepForm
**File**: `mainapp/src/pages/Services/pages/CalculateCredit/pages/FirstStep/FirstStepForm/FirstStepForm.tsx`

**Test Cases**:
```javascript
// Test 1: Verify calculationService usage
const testData = {
  loanAmount: 100000,
  period: 5
};

// Expected: Should call calculationService.calculateCreditPayment()
// Not: calculateMonthlyPayment() with hardcoded rate
```

**Manual Testing Steps**:
1. Navigate to Credit Calculator
2. Enter loan amount: 100,000 NIS
3. Adjust period slider
4. Verify monthly payment updates dynamically
5. Check browser console for database API calls
6. Ensure no hardcoded rate (5%) is used

#### Test 2.2: RefinanceMortgage FirstStepForm
**File**: `mainapp/src/pages/Services/pages/RefinanceMortgage/pages/FirstStep/FirstStepForm/FirstStepForm.tsx`

**Test Cases**:
```javascript
// Test 1: Verify mortgage calculation service usage
const testData = {
  mortgageBalance: 800000,
  period: 15
};

// Expected: Should call calculationService.calculateMortgagePayment()
// Not: calculateMonthlyPayment() with hardcoded rate
```

**Manual Testing Steps**:
1. Navigate to Mortgage Refinance Calculator
2. Enter mortgage balance: 800,000 NIS
3. Adjust period slider (4-30 years)
4. Verify monthly payment updates dynamically
5. Check loan term limits are database-driven
6. Ensure payment limits are calculated, not hardcoded

#### Test 2.3: CreditParams Component
**File**: `mainapp/src/components/ui/CreditParams.tsx`

**Test Cases**:
```javascript
// Test 1: Verify loan term limits are database-driven
// Expected: min/max values fetched from calculationService
// Not: hardcoded 4-30 years

// Test 2: Verify payment limits are calculated
// Expected: Calculated based on property value and loan terms
// Not: hardcoded 51130/2654 NIS
```

**Manual Testing Steps**:
1. Navigate to Mortgage Calculator
2. Enter property value: 1,500,000 NIS
3. Enter initial payment: 300,000 NIS
4. Verify period slider shows database-driven min/max (4-30 years)
5. Verify monthly payment slider shows calculated limits
6. Check browser console for loan term API calls

### 3. Calculation Formula Validation (Confluence Compliance)

#### Test 3.1: Mortgage Monthly Payment Calculation
**Formula**: Annuity Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
Where: P = Principal, r = Monthly rate, n = Total payments

**Test Cases**:
```javascript
// Test Case 1: Standard mortgage calculation
const testCase1 = {
  propertyValue: 1000000,
  initialPayment: 250000,
  period: 20,
  propertyOwnership: 'no_property' // Should use 75% LTV
};

// Expected monthly payment calculation:
// Loan amount: 1,000,000 - 250,000 = 750,000 NIS
// Monthly rate: 5% / 12 = 0.004167
// Total payments: 20 × 12 = 240
// Monthly payment: ~4,944 NIS
```

#### Test 3.2: Property Ownership LTV Logic
**Confluence Specification Test**:
```javascript
// Test Case 1: No property (75% financing)
const noPropertyTest = {
  propertyValue: 1000000,
  propertyOwnership: 'no_property'
};
// Expected: Max loan = 750,000 NIS, Min down payment = 250,000 NIS

// Test Case 2: Has property (50% financing)
const hasPropertyTest = {
  propertyValue: 1000000,
  propertyOwnership: 'has_property'
};
// Expected: Max loan = 500,000 NIS, Min down payment = 500,000 NIS

// Test Case 3: Selling property (70% financing)
const sellingPropertyTest = {
  propertyValue: 1000000,
  propertyOwnership: 'selling_property'
};
// Expected: Max loan = 700,000 NIS, Min down payment = 300,000 NIS
```

#### Test 3.3: Credit Annuity Payment Calculation
**Formula**: Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
Where: P = Principal, r = Monthly rate, n = Total payments

**Test Cases**:
```javascript
// Test Case 1: Standard credit calculation
const creditTest = {
  loanAmount: 200000,
  period: 5,
  rate: 8.5 // Database-driven credit rate
};

// Expected monthly payment calculation:
// Monthly rate: 8.5% / 12 = 0.007083
// Total payments: 5 × 12 = 60
// Monthly payment: ~4,106 NIS
```

### 4. Fallback Scenario Tests

#### Test 4.1: Database Connection Failure
**Test Steps**:
1. Stop the database service
2. Navigate to calculator pages
3. Verify emergency fallback values are used
4. Check console for proper error messages

**Expected Fallback Values**:
- Mortgage rate: 5.0%
- Credit rate: 8.5%
- LTV ratios: 75%/50%/70%
- DTI ratios: 28%/42%
- Credit score: 620 minimum
- Loan terms: 4-30 years

#### Test 4.2: API Endpoint Failure
**Test Steps**:
1. Block access to `/api/v1/calculation-parameters`
2. Navigate to calculator pages
3. Verify calculationService fallback is used
4. Check proper error handling and logging

#### Test 4.3: Partial Database Data
**Test Steps**:
1. Remove some records from `banking_standards` table
2. Navigate to calculator pages
3. Verify getEmergencyFallback() provides values
4. Check console warnings for missing parameters

### 5. Backend API Tests

#### Test 5.1: Mortgage Payment Calculation Endpoint
**Endpoint**: `/api/customer/calculate-payment`
**Test Cases**:
```bash
# Test 1: Standard mortgage calculation
curl -X POST "http://localhost:8003/api/customer/calculate-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 750000,
    "term_years": 20,
    "property_ownership": "no_property"
  }'

# Expected: Uses get_current_mortgage_rate() function
# Not: Hardcoded rate
```

#### Test 5.2: Bank Comparison Endpoint
**Endpoint**: `/api/customer/compare-banks`
**Test Cases**:
```bash
# Test 1: Mortgage comparison with property ownership
curl -X POST "http://localhost:8003/api/customer/compare-banks" \
  -H "Content-Type: application/json" \
  -d '{
    "priceOfEstate": 1000000,
    "initialFee": 250000,
    "period": 20,
    "propertyOwnership": "no_property"
  }'

# Expected: Uses database-driven configurable_base_rate
# Not: Hardcoded 5% rate
```

### 6. Error Handling and Logging Tests

#### Test 6.1: Console Logging Verification
**Test Steps**:
1. Open browser developer tools
2. Navigate to calculator pages
3. Verify proper logging messages:
   - `✅ Using database-driven rate: X%`
   - `⚠️ Using fallback calculation parameters`
   - `❌ Error calculating values:` (for failures)

#### Test 6.2: Network Error Handling
**Test Steps**:
1. Simulate network issues (disable internet)
2. Navigate to calculator pages
3. Verify graceful degradation
4. Check user sees calculated values (from fallback)
5. Verify no application crashes

### 7. Performance Tests

#### Test 7.1: Calculation Speed
**Test Steps**:
1. Navigate to calculator pages
2. Rapidly change input values
3. Verify calculations update smoothly
4. Check browser performance tab for excessive API calls

#### Test 7.2: API Response Time
**Test Steps**:
1. Monitor API response times for:
   - `/api/v1/calculation-parameters`
   - `/api/property-ownership-ltv`
   - `/api/customer/calculate-payment`
2. Verify responses < 500ms
3. Check database query performance

### 8. Integration Tests

#### Test 8.1: End-to-End Mortgage Flow
**Test Steps**:
1. Navigate to Mortgage Calculator
2. Enter property details (1,000,000 NIS)
3. Select property ownership: "No property"
4. Enter initial payment (250,000 NIS)
5. Adjust period (20 years)
6. Verify monthly payment ~4,944 NIS
7. Continue to bank comparison
8. Verify results use database-driven rates

#### Test 8.2: End-to-End Credit Flow
**Test Steps**:
1. Navigate to Credit Calculator
2. Enter loan amount (200,000 NIS)
3. Adjust period (5 years)
4. Verify monthly payment ~4,106 NIS
5. Continue to bank comparison
6. Verify results use database-driven rates

## Test Execution Checklist

### Pre-Test Setup
- [ ] Database is running with proper banking_standards data
- [ ] Backend server is running on port 8003
- [ ] Frontend is running on port 5173
- [ ] Browser developer tools are open

### Test Execution
- [ ] All API endpoints return correct data
- [ ] Frontend components use calculationService
- [ ] Calculation formulas match Confluence spec
- [ ] Property ownership LTV ratios are correct
- [ ] Fallback scenarios work properly
- [ ] Error handling is graceful
- [ ] Performance is acceptable
- [ ] Integration flows work end-to-end

### Post-Test Verification
- [ ] No hardcoded values remain in calculation logic
- [ ] All console errors are resolved
- [ ] Database queries are efficient
- [ ] User experience is smooth
- [ ] Calculations match expected results

## Expected Test Results

### ✅ Success Criteria
1. **Database-Driven**: All calculations use database parameters
2. **Confluence Compliant**: LTV ratios exactly match specification
3. **Proper Fallbacks**: Emergency values only for critical failures
4. **No Hardcoded Values**: Zero hardcoded rates, ratios, or limits
5. **Smooth UX**: Calculations update dynamically without delays
6. **Error Resilient**: Graceful handling of database/network issues

### ❌ Failure Indicators
1. Hardcoded rates (5%, 8.5%) used in calculations
2. Incorrect LTV ratios (not 75%/50%/70%)
3. Application crashes on database failure
4. Slow or unresponsive calculation updates
5. Console errors during normal operation
6. Calculation results don't match expected values

## Bug Reporting Template

```
**Bug Title**: [Brief description]
**Severity**: [Critical/High/Medium/Low]
**Component**: [Frontend/Backend/Database]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Browser/Environment**: [Chrome/Firefox/Safari, version]
**Console Errors**: [Any error messages]
**Screenshots**: [If applicable]
```

## Automated Testing Commands

```bash
# Run backend tests
npm test

# Run frontend tests
cd mainapp && npm test

# Run E2E tests
cd mainapp && npm run cypress:run

# Build verification
cd mainapp && npm run build

# Lint checks
npm run lint
```

This comprehensive QA plan ensures all calculation changes work correctly and follow the Confluence specification exactly.