# Banking Calculation Formulas - ACCURATE CODE IMPLEMENTATION

## IMPORTANT: Database-Driven Architecture
**All calculations now use database-driven parameters via `calculationService`**. There are NO hardcoded interest rates or parameters in the calculation functions anymore.

## 1. MORTGAGE CALCULATIONS

### 1.1 Monthly Payment Calculation (calculateMonthlyPayment.ts)
**Formula**: 
```
Monthly Payment = (Loan Amount × Monthly Rate × (1 + Monthly Rate)^n) / ((1 + Monthly Rate)^n - 1)

Where:
- Loan Amount = Total Amount - Initial Payment  
- Monthly Rate = Annual Rate / 12 / 100
- n = Period in Years × 12
```

**Implementation Details**:
- **File**: `mainapp/src/utils/helpers/calculateMonthlyPayment.ts`
- **Return Type**: Integer (`Math.trunc()` - rounds DOWN)
- **Required Parameters**: `totalAmount`, `initialPayment`, `period`, `annualRate` (NO DEFAULT)
- **Null Validation**: Returns `1` if totalAmount or initialPayment is null (NOT 0 as previously documented)
- **Other Validation**: Returns `0` if period ≤ 0, totalAmount ≤ 0, annualRate ≤ 0, or initialPayment ≥ totalAmount

**Usage with CalculationService**:
```typescript
const rate = await calculationService.getCurrentRate('mortgage');
const payment = calculateMonthlyPayment(1000000, 200000, 10, rate);
```

### 1.2 Period Calculation (Inverse) (calculatePeriod.ts)
**Formula**:
```
Term in Months = ln(PMT / (PMT - L × r)) / ln(1 + r)
Term in Years = Term in Months / 12

Where:
- PMT = Monthly Payment
- L = Loan Amount = Total Amount - Initial Payment
- r = Monthly Rate = Annual Rate / 12 / 100
- ln = Natural logarithm (Math.log in JavaScript)
```

**Implementation Details**:
- **File**: `mainapp/src/utils/helpers/calculatePeriod.ts`
- **Return Type**: Integer (`Math.trunc()` - rounds DOWN)
- **Required Parameters**: `totalAmount`, `initialPayment`, `monthlyPayment`, `annualRate` (NO DEFAULT)
- **Null Validation**: Returns `1` if totalAmount or initialPayment is null (NOT 0 as previously documented)
- **Other Validation**: Returns `0` if loanAmount ≤ 0, monthlyRate ≤ 0, or monthlyPayment ≤ 0

### 1.3 Property Ownership LTV Rules
**Loan-to-Value Ratios** (stored in `property_ownership_options` table):
- **no_property**: 75% max financing (25% min down payment)
- **has_property**: 50% max financing (50% min down payment)
- **selling_property**: 70% max financing (30% min down payment)

**Database Tables**:
- `property_ownership_options` - stores LTV configurations with columns:
  - `option_key`: 'no_property', 'has_property', 'selling_property'
  - `ltv_percentage`: 75.0, 50.0, 70.0
  - `financing_percentage`: same as ltv_percentage

## 2. REFINANCE MORTGAGE CALCULATIONS

### 2.1 Refinance Monthly Payment (server-db.js)
**Backend Implementation**:
```javascript
// Uses database function calculate_annuity_payment
const monthlyPaymentQuery = `SELECT calculate_annuity_payment($1, $2, $3) as monthly_payment`;
const monthlyPaymentResult = await pool.query(monthlyPaymentQuery, [amount_left, currentRate, years || 25]);
const monthlyPayment = Math.round(parseFloat(monthlyPaymentResult.rows[0].monthly_payment));
```

**Savings Calculation**:
```
Total Savings = Amount Left × (Savings Percentage / 100)

Where Savings Percentage from banking_standards table:
- business_path: 'mortgage_refinance'
- standard_category: 'refinance'  
- standard_name: 'minimum_savings_percentage'
- Default fallback: 2%
```

**Database Configuration**:
- Current rate: `get_current_mortgage_rate()` function
- Savings percentage: `banking_standards` table
- Bank rates: `bank_configurations` table (overrides base rate)

**API Endpoint**: `/api/refinance-mortgage`

## 3. CREDIT CALCULATIONS

### 3.1 Credit Annuity Payment (calculateCreditAnnuityPayment.ts)
**Formula**:
```
Annuity Payment = Loan Sum × Annuity Coefficient

Annuity Coefficient = (r × (1 + r)^n) / ((1 + r)^n - 1)

Where:
- r = Monthly Rate = percentageOfLoan / 12 / 100
- n = Total Months = Period in Years × 12
```

**Implementation Details**:
- **File**: `mainapp/src/utils/helpers/calculateCreditAnnuityPayment.ts`
- **Return Type**: Integer (`Math.ceil()` - rounds UP)
- **Required Parameters**: `sum`, `period`, `percentageOfLoan` (NO DEFAULT)
- **Validation**: No null checks (assumes valid inputs)

**Usage with CalculationService**:
```typescript
const rate = await calculationService.getCurrentRate('credit');
const payment = calculateCreditAnnuityPayment(100000, 5, rate);
```

## 4. REFINANCE CREDIT CALCULATIONS

### 4.1 Credit Refinance Calculation (server-db.js)
**Backend Implementation**:
```javascript
// Calculate new rate = current rate - minimum rate reduction
const newRate = Math.max(currentCreditRate - minRateReduction, 5.0); // Minimum 5%

// Uses database function for 5-year term
const monthlyPaymentQuery = `SELECT calculate_annuity_payment($1, $2, $3) as monthly_payment`;
const monthlyPaymentResult = await pool.query(monthlyPaymentQuery, [totalDebt, newRate, 5]);
```

**Configuration from banking_standards**:
- Current credit rate:
  - business_path: 'credit'
  - standard_name: 'base_credit_rate'
  - Default fallback: 8.5%
- Minimum rate reduction:
  - business_path: 'credit_refinance'
  - standard_name: 'minimum_rate_reduction'
  - Default fallback: 1.0%

**Savings Calculation**:
```
Old Monthly Payment = calculate_annuity_payment(totalDebt, currentCreditRate, 5)
New Monthly Payment = calculate_annuity_payment(totalDebt, newRate, 5)
Monthly Savings = Old Monthly Payment - New Monthly Payment
Total Savings = Monthly Savings × 60 (5 years)
```

**API Endpoint**: `/api/refinance-credit`

## 5. REMAINING AMOUNT CALCULATION

### 5.1 Simple Interest Formula (calculateRemainingAmount.ts)
**Formula**:
```
Total Amount to Pay = Remaining Amount × (1 + (Annual Rate × Remaining Years) / 100)
```

**IMPORTANT**: This uses SIMPLE INTEREST, NOT compound interest

**Implementation Details**:
- **File**: `mainapp/src/utils/helpers/calculateRemainingAmount.ts`
- **Return Type**: Integer (`Math.trunc()` - rounds DOWN)
- **Required Parameters**: `remainingMortgageAmount`, `remainingYears`, `annualRate` (NO DEFAULT)
- **Null Validation**: Returns `0` if remainingMortgageAmount is null
- **Other Validation**: Returns `0` if any parameter ≤ 0

## 6. DATABASE CALCULATION FUNCTION

### 6.1 calculate_annuity_payment (SQL Function)
**Location**: `migrations/013-form-session-management.sql`

**Function Signature**:
```sql
CREATE OR REPLACE FUNCTION calculate_annuity_payment(
    p_loan_amount DECIMAL(12,2),
    p_annual_rate DECIMAL(5,3),
    p_term_years INTEGER
) RETURNS DECIMAL(12,2)
```

**Implementation**:
```sql
-- Convert annual rate to monthly rate
monthly_rate := (p_annual_rate / 100.0) / 12.0;
total_payments := p_term_years * 12;

-- Handle zero interest rate case
IF monthly_rate = 0 THEN
    RETURN p_loan_amount / total_payments;
END IF;

-- Standard annuity formula
monthly_payment := p_loan_amount * 
    (monthly_rate * POWER(1 + monthly_rate, total_payments)) / 
    (POWER(1 + monthly_rate, total_payments) - 1);

RETURN ROUND(monthly_payment, 2);
```

## 7. CALCULATION SERVICE ARCHITECTURE

### 7.1 CalculationService (calculationService.ts)
**Purpose**: Centralized service for database-driven calculations

**Key Methods**:
- `getCurrentRate(businessPath)` - Fetches current interest rate
- `getPropertyOwnershipLtv(ownership, businessPath)` - Gets LTV ratio
- `getStandardValue(category, name, businessPath)` - Gets any standard value
- `calculateMortgagePayment()` - Wrapper for mortgage calculation
- `calculateCreditPayment()` - Wrapper for credit calculation
- `calculateRemainingMortgage()` - Wrapper for remaining amount
- `calculateLoanPeriod()` - Wrapper for period calculation

**Caching**: 5-minute cache for API responses

**API Endpoint**: `/api/v1/calculation-parameters?business_path={path}`

### 7.2 Emergency Fallbacks
Only used when API is completely unreachable:
- Mortgage rate: 5.0%
- Credit rate: 8.5%
- Property ownership LTVs: Standard values (75%, 50%, 70%)

## 8. DATABASE CONFIGURATION TABLES

### Primary Configuration Tables:
1. **banking_standards** - Central configuration for all rates and parameters
   - Columns: `business_path`, `standard_category`, `standard_name`, `standard_value`, `value_type`
   - Key records:
     - `('mortgage', 'interest_rate', 'base_mortgage_rate', '5.0', 'percentage')`
     - `('credit', 'interest_rate', 'base_credit_rate', '8.5', 'percentage')`
     - `('mortgage_refinance', 'refinance', 'minimum_savings_percentage', '2.0', 'percentage')`
     - `('credit_refinance', 'refinance', 'minimum_rate_reduction', '1.0', 'percentage')`

2. **property_ownership_options** - LTV ratios by ownership type
   - Columns: `option_key`, `option_text_en`, `ltv_percentage`, `financing_percentage`

3. **bank_configurations** - Bank-specific rate overrides
   - Columns: `bank_id`, `product_type`, `base_interest_rate`

4. **calculation_parameters** - Legacy/backup configuration table

### Helper Functions (SQL):
- `get_current_mortgage_rate()` - Returns current mortgage rate from banking_standards
- `get_property_ownership_ltv(ownership_key)` - Returns LTV percentage for ownership type

## 9. ROUNDING RULES SUMMARY - ACCURATE

| Calculation Type | Frontend | Backend | Notes |
|-----------------|----------|---------|-------|
| Mortgage Payment | `Math.trunc()` ↓ | `ROUND(n, 2)` | Frontend truncates to integer, backend keeps 2 decimals |
| Credit Payment | `Math.ceil()` ↑ | `ROUND(n, 2)` | Frontend rounds up to integer |
| Period Calculation | `Math.trunc()` ↓ | N/A | Frontend only |
| Remaining Amount | `Math.trunc()` ↓ | N/A | Frontend only |
| Refinance Mortgage | `Math.round()` ↔ | `ROUND(n, 2)` | Backend rounds result then JS rounds again |
| Refinance Credit | `Math.round()` ↔ | `ROUND(n, 2)` | Backend rounds result then JS rounds again |

## 10. CRITICAL IMPLEMENTATION NOTES

### Null Handling Discrepancy
- **Documentation stated**: Return 0 for null inputs
- **Actual implementation**: Returns 1 for null inputs in mortgage/period calculations
- This affects `calculateMonthlyPayment` and `calculatePeriod` functions

### Rate Parameter Requirements
- All calculation functions now REQUIRE rate parameters
- No more default/hardcoded values
- Must fetch rates from database via calculationService or API

### Business Path Concept
- System uses "business_path" to differentiate calculation contexts:
  - `'mortgage'` - Standard mortgage calculations
  - `'credit'` - Standard credit calculations
  - `'mortgage_refinance'` - Refinance mortgage calculations
  - `'credit_refinance'` - Refinance credit calculations

### API Response Caching
- Frontend caches calculation parameters for 5 minutes
- Reduces database load for frequently accessed parameters
- Cache can be cleared with `calculationService.clearCache()`