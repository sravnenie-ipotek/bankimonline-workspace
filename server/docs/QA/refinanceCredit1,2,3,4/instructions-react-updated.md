# 🏠💳 REFINANCE CREDIT QA INSTRUCTIONS - REACT COMPONENT TESTING
## Updated for Advanced React Component Testing Patterns

### 🎯 CRITICAL UPDATE: React Component Testing Approach
**All dropdowns and form elements use custom React components, NOT standard HTML elements**

---

## 📋 STEP 1: CURRENT LOAN DETAILS

### Test URL
```
http://localhost:5173/services/refinance-credit/1
```

### React Component Selectors & Interactions

#### 1. Current Loan Balance Input
```javascript
// ✅ React Component Approach
await page.locator('[data-testid="current-loan-balance"]').fill('75000');
// Verify formatted display
await expect(page.locator('[data-testid="current-loan-balance"]')).toHaveValue('75,000');
```

#### 2. Current Interest Rate Input
```javascript
await page.locator('[data-testid="current-interest-rate"]').fill('12.5');
// Verify percentage formatting
await expect(page.locator('[data-testid="current-interest-rate"]')).toHaveValue('12.5%');
```

#### 3. Remaining Term Dropdown
```javascript
// React dropdown for remaining months/years
await page.locator('[data-testid="remaining-term-dropdown"]').click();
await page.waitForSelector('[role="option"]');
await page.locator('[role="option"]:has-text("24 months")').click();
```

#### 4. Current Monthly Payment Input
```javascript
await page.locator('[data-testid="current-monthly-payment"]').fill('3500');
await expect(page.locator('[data-testid="current-monthly-payment"]')).toHaveValue('3,500');
```

#### 5. Property Value Input (if secured)
```javascript
// Only appears for secured loans
const propertySection = page.locator('[data-testid="property-value-section"]');
if (await propertySection.isVisible()) {
  await page.locator('[data-testid="property-value"]').fill('500000');
}
```

#### 6. Refinance Reason Dropdown
```javascript
// Critical dropdown for refinance purpose
await page.locator('[data-testid="refinance-reason-dropdown"]').click();
await page.locator('[role="option"]:has-text("Lower Interest Rate")').click();

// Other options to test:
// - "Lower Monthly Payment"
// - "Cash Out Equity"
// - "Change Loan Terms"
// - "Consolidate Debts"
```

#### 7. Current Lender Dropdown
```javascript
await page.locator('[data-testid="current-lender-dropdown"]').click();
await page.locator('[role="option"]:has-text("Bank Leumi")').click();
```

#### 8. Loan Type Classification
```javascript
// Radio group or dropdown for loan type
await page.locator('[data-testid="loan-type-secured"]').click();
// or
await selectReactDropdown(page, 'loan-type-dropdown', 'Secured Loan');
```

#### 9. Refinance Benefit Calculator Preview
```javascript
// Verify initial benefit calculation appears
async function validateRefinanceBenefit(page) {
  const currentPayment = 3500;
  const estimatedNewPayment = 2800;
  const monthlySavings = currentPayment - estimatedNewPayment;
  
  const displayedSavings = await page.locator('[data-testid="estimated-monthly-savings"]').textContent();
  expect(parseFloat(displayedSavings.replace(/[^0-9.]/g, ''))).toBeCloseTo(monthlySavings, 2);
}
```

#### 10. Break-Even Analysis Preview
```javascript
// Check break-even calculation
const breakEvenMonths = await page.locator('[data-testid="break-even-months"]').textContent();
expect(parseInt(breakEvenMonths)).toBeGreaterThan(0);
expect(parseInt(breakEvenMonths)).toBeLessThan(60); // Reasonable range
```

#### 11. Cash-Out Equity Option
```javascript
// If refinancing for cash out
const cashOutToggle = page.locator('[data-testid="cash-out-toggle"]');
if (await cashOutToggle.isVisible()) {
  await cashOutToggle.click();
  await page.locator('[data-testid="cash-out-amount"]').fill('50000');
}
```

---

## 📋 STEP 2: PERSONAL & EMPLOYMENT INFORMATION

### Test URL
```
http://localhost:5173/services/refinance-credit/2
```

### React Component Interactions

#### 1. Personal Information Form
```javascript
// Basic details
await page.locator('[data-testid="first-name"]').fill('Michael');
await page.locator('[data-testid="last-name"]').fill('Cohen');
await page.locator('[data-testid="israeli-id"]').fill('111222333');

// Birth date picker
await page.locator('[data-testid="birth-date"]').click();
await page.locator('.date-picker-year').selectOption('1980');
await page.locator('.date-picker-month').selectOption('3');
await page.locator('.date-picker-day:has-text("15")').click();
```

#### 2. Family Status Dropdown
```javascript
await page.locator('[data-testid="family-status-dropdown"]').click();
await page.locator('[role="option"]:has-text("Married with children")').click();
```

#### 3. Citizenship Status
```javascript
// Multi-select for citizenship
await page.locator('[data-testid="citizenship-dropdown"]').click();
await page.locator('[role="option"]:has-text("Israeli Citizen")').click();
await page.locator('[role="option"]:has-text("Permanent Resident")').click();
await page.keyboard.press('Escape');
```

#### 4. Education Level
```javascript
await selectReactDropdown(page, 'education-dropdown', "Master's Degree");
```

#### 5. Military Service Status
```javascript
await selectReactDropdown(page, 'military-service-dropdown', 'Completed IDF Service');
```

#### 6. Employment Status & Details
```javascript
// Employment type
await selectReactDropdown(page, 'employment-status-dropdown', 'Salaried Employee');

// Employer details
await page.locator('[data-testid="employer-name"]').fill('Tech Solutions Ltd');
await page.locator('[data-testid="job-title"]').fill('Senior Developer');

// Employment duration
await selectReactDropdown(page, 'employment-years-dropdown', '5-10 years');
```

#### 7. Monthly Income
```javascript
await page.locator('[data-testid="monthly-income"]').fill('18000');
await expect(page.locator('[data-testid="monthly-income"]')).toHaveValue('18,000');
```

#### 8. Co-Borrower Information (if applicable)
```javascript
// Check if co-borrower exists on current loan
const hasCoBorrower = await page.locator('[data-testid="has-co-borrower-checkbox"]').isChecked();

if (hasCoBorrower) {
  await page.locator('[data-testid="co-borrower-first-name"]').fill('Sarah');
  await page.locator('[data-testid="co-borrower-last-name"]').fill('Cohen');
  await page.locator('[data-testid="co-borrower-id"]').fill('444555666');
  await page.locator('[data-testid="co-borrower-income"]').fill('12000');
}
```

---

## 📋 STEP 3: FINANCIAL OBLIGATIONS & ANALYSIS

### Test URL
```
http://localhost:5173/services/refinance-credit/3
```

### React Component Interactions

#### 1. Financial Obligations Dropdown (Multi-Select)
```javascript
// Select current obligations
await page.locator('[data-testid="obligations-dropdown"]').click();

const obligations = [
  'Current Loan Being Refinanced',
  'Credit Cards',
  'Car Loan',
  'Other Personal Loans'
];

for (const obligation of obligations) {
  await page.locator(`[role="option"]:has-text("${obligation}")`).click();
}

await page.keyboard.press('Escape');
```

#### 2. Main Income Source
```javascript
await selectReactDropdown(page, 'main-income-source-dropdown', 'Salary');
```

#### 3. Additional Income Sources
```javascript
// Add additional income
await page.locator('[data-testid="add-income-button"]').click();
await selectReactDropdown(page, 'additional-income-type-0', 'Rental Income');
await page.locator('[data-testid="additional-income-amount-0"]').fill('4000');
```

#### 4. Monthly Obligations Input
```javascript
// Total monthly obligations (excluding current loan being refinanced)
await page.locator('[data-testid="other-monthly-obligations"]').fill('2500');
```

#### 5. DTI Ratio Analysis
```javascript
// Verify DTI calculation with refinance
async function validateRefinanceDTI(page) {
  const monthlyIncome = 18000;
  const additionalIncome = 4000;
  const otherObligations = 2500;
  const newLoanPayment = 2800; // Estimated from Step 1
  
  const totalIncome = monthlyIncome + additionalIncome;
  const totalDebt = otherObligations + newLoanPayment;
  const expectedDTI = (totalDebt / totalIncome * 100).toFixed(1);
  
  const displayedDTI = await page.locator('[data-testid="new-dti-ratio"]').textContent();
  expect(displayedDTI).toContain(expectedDTI);
  
  // Compare with current DTI
  const currentDTI = await page.locator('[data-testid="current-dti-ratio"]').textContent();
  console.log(`DTI Improvement: ${currentDTI} → ${displayedDTI}`);
}
```

#### 6. Refinance Benefit Calculator
```javascript
// Detailed benefit analysis
async function analyzeRefinanceBenefits(page) {
  // Monthly savings
  const monthlySavings = await page.locator('[data-testid="monthly-savings-amount"]').textContent();
  
  // Total interest savings
  const totalInterestSavings = await page.locator('[data-testid="total-interest-savings"]').textContent();
  
  // Break-even period
  const breakEvenMonths = await page.locator('[data-testid="break-even-period"]').textContent();
  
  // Closing costs
  const closingCosts = await page.locator('[data-testid="estimated-closing-costs"]').textContent();
  
  console.log('Refinance Analysis:');
  console.log(`- Monthly Savings: ${monthlySavings}`);
  console.log(`- Total Interest Savings: ${totalInterestSavings}`);
  console.log(`- Break-Even: ${breakEvenMonths} months`);
  console.log(`- Closing Costs: ${closingCosts}`);
  
  // Verify recommendation
  const recommendation = await page.locator('[data-testid="refinance-recommendation"]').textContent();
  expect(recommendation).toMatch(/Recommended|Not Recommended|Consider Carefully/);
}
```

#### 7. Cash-Out Calculations (if applicable)
```javascript
// If cash-out was selected in Step 1
const cashOutSection = page.locator('[data-testid="cash-out-analysis"]');
if (await cashOutSection.isVisible()) {
  const availableEquity = await page.locator('[data-testid="available-equity"]').textContent();
  const maxCashOut = await page.locator('[data-testid="max-cash-out"]').textContent();
  const newLoanAmount = await page.locator('[data-testid="new-total-loan"]').textContent();
  
  console.log(`Available Equity: ${availableEquity}`);
  console.log(`Maximum Cash Out: ${maxCashOut}`);
  console.log(`New Loan Amount: ${newLoanAmount}`);
}
```

---

## 📋 STEP 4: BANK COMPARISON & APPLICATION

### Test URL
```
http://localhost:5173/services/refinance-credit/4
```

### React Component Interactions

#### 1. Bank Offers Comparison Table
```javascript
// Analyze bank offers
async function compareBankOffers(page) {
  const offers = await page.locator('[data-testid^="bank-offer-row-"]').all();
  
  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i];
    const bankName = await offer.locator('[data-testid="bank-name"]').textContent();
    const interestRate = await offer.locator('[data-testid="interest-rate"]').textContent();
    const monthlyPayment = await offer.locator('[data-testid="monthly-payment"]').textContent();
    const totalInterest = await offer.locator('[data-testid="total-interest"]').textContent();
    const closingCosts = await offer.locator('[data-testid="closing-costs"]').textContent();
    
    console.log(`Offer ${i + 1}: ${bankName}`);
    console.log(`  Rate: ${interestRate}, Payment: ${monthlyPayment}`);
    console.log(`  Total Interest: ${totalInterest}, Closing: ${closingCosts}`);
  }
}
```

#### 2. Preferred Bank Selection
```javascript
// Select best offer
await page.locator('[data-testid="select-bank-offer-0"]').click();
// or click on bank card
await page.locator('[data-testid="bank-card-hapoalim"]').click();
```

#### 3. Loan Program Selection
```javascript
await selectReactDropdown(page, 'loan-program-dropdown', 'Prime Rate + 2%');
```

#### 4. Rate Type Selection
```javascript
// Radio buttons for rate type
await page.locator('[data-testid="rate-type-variable"]').click();
// or
await page.locator('label:has-text("Variable Rate")').click();
```

#### 5. Refinance Terms Configuration
```javascript
// New loan term
await selectReactDropdown(page, 'new-loan-term-dropdown', '48 months');

// Payment date
await selectReactDropdown(page, 'payment-date-dropdown', '10th of month');
```

#### 6. Monthly Payment Comparison
```javascript
// Visual comparison of payments
async function verifyPaymentComparison(page) {
  const currentPayment = await page.locator('[data-testid="current-payment-display"]').textContent();
  const newPayment = await page.locator('[data-testid="new-payment-display"]').textContent();
  const savings = await page.locator('[data-testid="payment-savings-display"]').textContent();
  
  const current = parseFloat(currentPayment.replace(/[^0-9.]/g, ''));
  const newPay = parseFloat(newPayment.replace(/[^0-9.]/g, ''));
  const save = parseFloat(savings.replace(/[^0-9.]/g, ''));
  
  expect(current - newPay).toBeCloseTo(save, 2);
}
```

#### 7. Total Savings Summary
```javascript
// Final savings calculation
const lifetimeSavings = await page.locator('[data-testid="lifetime-savings"]').textContent();
const breakEvenPeriod = await page.locator('[data-testid="final-break-even"]').textContent();
const effectiveRate = await page.locator('[data-testid="effective-interest-rate"]').textContent();

console.log(`Total Lifetime Savings: ${lifetimeSavings}`);
console.log(`Break-Even Period: ${breakEvenPeriod}`);
console.log(`Effective Interest Rate: ${effectiveRate}`);
```

#### 8. Application Summary Review
```javascript
// Review all details before submission
await page.locator('[data-testid="expand-summary-button"]').click();
await page.waitForSelector('[data-testid="full-summary-content"]');

// Verify critical information
await expect(page.locator('[data-testid="summary-current-balance"]')).toContainText('75,000');
await expect(page.locator('[data-testid="summary-new-rate"]')).toBeVisible();
await expect(page.locator('[data-testid="summary-new-payment"]')).toBeVisible();
```

#### 9. Submit Refinance Application
```javascript
// Accept terms and submit
await page.locator('[data-testid="accept-terms-checkbox"]').click();
await page.locator('[data-testid="submit-refinance-application"]').click();

// Wait for confirmation
await page.waitForSelector('[data-testid="refinance-confirmation-modal"]');
const confirmationId = await page.locator('[data-testid="confirmation-id"]').textContent();
console.log(`Refinance application submitted: ${confirmationId}`);
```

---

## 🔧 REFINANCE CREDIT SPECIFIC HELPERS

```javascript
// Helper functions specific to refinance credit

async function calculateBreakEven(closingCosts, monthlySavings) {
  return Math.ceil(closingCosts / monthlySavings);
}

async function validateRefinanceRecommendation(page) {
  const breakEven = await page.locator('[data-testid="break-even-months"]').textContent();
  const remainingTerm = await page.locator('[data-testid="remaining-term"]').textContent();
  
  const breakEvenMonths = parseInt(breakEven);
  const remainingMonths = parseInt(remainingTerm);
  
  // Refinance recommended if break-even is less than half of remaining term
  const shouldRecommend = breakEvenMonths < (remainingMonths / 2);
  
  const recommendation = await page.locator('[data-testid="refinance-recommendation"]').textContent();
  
  if (shouldRecommend) {
    expect(recommendation).toContain('Recommended');
  } else {
    expect(recommendation).toContain('Not Recommended');
  }
}

async function testCashOutScenarios(page) {
  const scenarios = [
    { propertyValue: 500000, currentLoan: 200000, maxCashOut: 150000 }, // 70% LTV
    { propertyValue: 800000, currentLoan: 400000, maxCashOut: 160000 }, // 70% LTV
    { propertyValue: 1000000, currentLoan: 300000, maxCashOut: 400000 } // 70% LTV
  ];
  
  for (const scenario of scenarios) {
    await page.locator('[data-testid="property-value"]').fill(scenario.propertyValue.toString());
    await page.locator('[data-testid="current-loan-balance"]').fill(scenario.currentLoan.toString());
    
    await page.locator('[data-testid="cash-out-toggle"]').click();
    
    const maxCashOut = await page.locator('[data-testid="max-cash-out-available"]').textContent();
    const maxValue = parseFloat(maxCashOut.replace(/[^0-9.]/g, ''));
    
    // Maximum LTV is typically 70% for cash-out refinance
    const expectedMax = (scenario.propertyValue * 0.7) - scenario.currentLoan;
    expect(maxValue).toBeCloseTo(expectedMax, 1000);
  }
}

async function compareMultipleBanks(page) {
  const banks = ['Hapoalim', 'Leumi', 'Discount', 'Mizrahi'];
  const comparisons = [];
  
  for (const bank of banks) {
    const bankOffer = page.locator(`[data-testid="bank-offer-${bank.toLowerCase()}"]`);
    if (await bankOffer.isVisible()) {
      const rate = await bankOffer.locator('[data-testid="interest-rate"]').textContent();
      const payment = await bankOffer.locator('[data-testid="monthly-payment"]').textContent();
      const closing = await bankOffer.locator('[data-testid="closing-costs"]').textContent();
      
      comparisons.push({
        bank,
        rate: parseFloat(rate),
        payment: parseFloat(payment.replace(/[^0-9.]/g, '')),
        closing: parseFloat(closing.replace(/[^0-9.]/g, ''))
      });
    }
  }
  
  // Sort by best rate
  comparisons.sort((a, b) => a.rate - b.rate);
  console.log('Best Rate:', comparisons[0]);
  
  // Sort by lowest payment
  comparisons.sort((a, b) => a.payment - b.payment);
  console.log('Lowest Payment:', comparisons[0]);
  
  return comparisons;
}
```

---

## 📝 REFINANCE CREDIT TEST EXECUTION SCRIPT

```javascript
const { chromium } = require('playwright');

async function testRefinanceCredit() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🏠💳 Starting Refinance Credit React Component Testing');
  
  try {
    // STEP 1: Current Loan Details
    await page.goto('http://localhost:5173/services/refinance-credit/1');
    await page.waitForLoadState('networkidle');
    
    await fillReactInput(page, 'current-loan-balance', '75000');
    await fillReactInput(page, 'current-interest-rate', '12.5');
    await selectReactDropdown(page, 'remaining-term-dropdown', '24 months');
    await fillReactInput(page, 'current-monthly-payment', '3500');
    
    await selectReactDropdown(page, 'refinance-reason-dropdown', 'Lower Interest Rate');
    await selectReactDropdown(page, 'current-lender-dropdown', 'Bank Leumi');
    
    await page.locator('[data-testid="continue-button"]').click();
    await page.waitForURL('**/refinance-credit/2');
    
    // STEP 2: Personal & Employment Information
    await fillReactInput(page, 'first-name', 'Michael');
    await fillReactInput(page, 'last-name', 'Cohen');
    await fillReactInput(page, 'israeli-id', '111222333');
    
    await selectReactDropdown(page, 'family-status-dropdown', 'Married with children');
    await selectReactDropdown(page, 'employment-status-dropdown', 'Salaried Employee');
    await fillReactInput(page, 'monthly-income', '18000');
    
    await page.locator('[data-testid="continue-button"]').click();
    await page.waitForURL('**/refinance-credit/3');
    
    // STEP 3: Financial Obligations & Analysis
    await selectMultipleOptions(page, 'obligations-dropdown', [
      'Current Loan Being Refinanced',
      'Credit Cards'
    ]);
    
    await selectReactDropdown(page, 'main-income-source-dropdown', 'Salary');
    await fillReactInput(page, 'other-monthly-obligations', '2500');
    
    // Validate refinance benefits
    await validateRefinanceDTI(page);
    await analyzeRefinanceBenefits(page);
    
    await page.locator('[data-testid="continue-button"]').click();
    await page.waitForURL('**/refinance-credit/4');
    
    // STEP 4: Bank Comparison & Application
    await compareBankOffers(page);
    
    // Select best offer
    await page.locator('[data-testid="select-bank-offer-0"]').click();
    await selectReactDropdown(page, 'loan-program-dropdown', 'Prime Rate + 2%');
    await selectReactDropdown(page, 'new-loan-term-dropdown', '48 months');
    
    // Review and submit
    await verifyPaymentComparison(page);
    await page.locator('[data-testid="accept-terms-checkbox"]').click();
    await page.locator('[data-testid="submit-refinance-application"]').click();
    
    await page.waitForSelector('[data-testid="refinance-confirmation-modal"]');
    
    console.log('✅ Refinance Credit Testing Complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'refinance-credit-error.png' });
  } finally {
    await browser.close();
  }
}

// Run test
testRefinanceCredit();
```

---

## 🚨 CRITICAL REFINANCE CREDIT VALIDATIONS

1. **Refinance Benefit Analysis**
   - ✅ Monthly savings calculated correctly
   - ✅ Break-even period accurate
   - ✅ Total interest savings computed
   - ✅ Recommendation logic works

2. **Cash-Out Equity**
   - ✅ Maximum LTV 70% enforced
   - ✅ Available equity calculated
   - ✅ New loan amount correct
   - ✅ Impact on payments shown

3. **DTI Improvement**
   - ✅ Current DTI calculated
   - ✅ New DTI with refinance
   - ✅ DTI comparison displayed
   - ✅ Threshold warnings shown

4. **Bank Comparison**
   - ✅ Multiple offers displayed
   - ✅ Rates accurately shown
   - ✅ Closing costs included
   - ✅ Best offer highlighted

5. **Break-Even Analysis**
   - ✅ Closing costs considered
   - ✅ Monthly savings factored
   - ✅ Recommendation threshold
   - ✅ Visual representation

---

## 📊 SUCCESS CRITERIA

All refinance credit tests pass when:
1. ✅ Current loan details captured accurately
2. ✅ Refinance benefits calculated correctly
3. ✅ Break-even analysis is accurate
4. ✅ Cash-out options work properly
5. ✅ DTI improvements shown
6. ✅ Bank offers compared effectively
7. ✅ All React components functional
8. ✅ Application submits successfully