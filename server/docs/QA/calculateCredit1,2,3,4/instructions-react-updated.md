# 💳 CREDIT CALCULATOR QA INSTRUCTIONS - REACT COMPONENT TESTING
## Updated for Advanced React Component Testing Patterns

### 🎯 CRITICAL UPDATE: React Component Testing Approach
**All dropdowns and form elements use custom React components, NOT standard HTML elements**

---

## 📋 STEP 1: CREDIT TYPE & AMOUNT

### Test URL
```
http://localhost:5173/services/calculate-credit/1
```

### React Component Selectors & Interactions

#### 1. Credit Type Selection Dropdown
```javascript
// ❌ OLD APPROACH (HTML select - DOESN'T WORK)
// await page.selectOption('select[name="creditType"]', 'personal_loan');

// ✅ NEW APPROACH (React Component)
await page.locator('[data-testid="credit-type-dropdown"]').click();
await page.waitForSelector('[role="option"], .dropdown-menu-item');
await page.locator('text="Personal Loan"').first().click();

// Verify selection
await expect(page.locator('[data-testid="credit-type-dropdown"]')).toContainText('Personal Loan');
```

#### 2. Loan Amount Input with Limits
```javascript
// Different credit types have different limits
async function testCreditLimits(page) {
  // Personal Loan: up to 100,000
  await selectReactDropdown(page, 'credit-type-dropdown', 'Personal Loan');
  await page.locator('[data-testid="loan-amount-input"]').fill('100000');
  
  // Car Loan: up to 500,000
  await selectReactDropdown(page, 'credit-type-dropdown', 'Car Loan');
  await page.locator('[data-testid="loan-amount-input"]').fill('300000');
  
  // Home Improvement: up to 200,000
  await selectReactDropdown(page, 'credit-type-dropdown', 'Home Improvement');
  await page.locator('[data-testid="loan-amount-input"]').fill('150000');
}
```

#### 3. Loan Purpose Dropdown
```javascript
await page.locator('[data-testid="loan-purpose-dropdown"]').click();
await page.locator('[role="option"]:has-text("Debt Consolidation")').click();
```

#### 4. Loan Term Selection (React Slider or Dropdown)
```javascript
// If dropdown
await page.locator('[data-testid="loan-term-dropdown"]').click();
await page.locator('[role="option"]:has-text("36 months")').click();

// If slider component
const termSlider = page.locator('[data-testid="loan-term-slider"]');
await termSlider.click();
// Use keyboard for precise control
for (let i = 0; i < 12; i++) {
  await termSlider.press('ArrowRight'); // Move to 36 months
}
```

#### 5. Interest Rate Display
```javascript
// Verify interest rate updates based on credit type
const interestRate = await page.locator('[data-testid="interest-rate-display"]').textContent();
expect(parseFloat(interestRate)).toBeGreaterThan(0);
```

#### 6. Monthly Payment Calculation
```javascript
// Verify monthly payment calculation
async function validateMonthlyPayment(page) {
  const amount = 50000;
  const term = 36;
  const rate = 8.5;
  
  await page.locator('[data-testid="loan-amount-input"]').fill(amount.toString());
  await selectReactDropdown(page, 'loan-term-dropdown', `${term} months`);
  
  // Wait for calculation
  await page.waitForTimeout(500);
  
  const monthlyPayment = await page.locator('[data-testid="monthly-payment-display"]').textContent();
  const expectedPayment = calculateMonthlyPayment(amount, rate, term);
  
  expect(parseFloat(monthlyPayment.replace(/,/g, ''))).toBeCloseTo(expectedPayment, 2);
}
```

#### 7. Continue Button Validation
```javascript
// Ensure all required fields are filled
await page.locator('[data-testid="continue-button"]').click();

// Check for validation errors
const errors = await page.locator('.error-message, [role="alert"]').count();
if (errors > 0) {
  console.log('Validation errors detected - filling required fields');
  // Fill missing fields
}

// Successful navigation
await page.waitForURL('**/calculate-credit/2');
```

---

## 📋 STEP 2: PERSONAL INFORMATION

### Test URL
```
http://localhost:5173/services/calculate-credit/2
```

### React Component Interactions

#### 1. Personal Details Form
```javascript
// Basic information inputs
await page.locator('[data-testid="first-name"]').fill('Jane');
await page.locator('[data-testid="last-name"]').fill('Smith');
await page.locator('[data-testid="israeli-id"]').fill('987654321');

// Email with validation
await page.locator('[data-testid="email"]').fill('jane.smith@example.com');
await page.locator('[data-testid="email"]').blur();
// Check validation passed
await expect(page.locator('[data-testid="email-error"]')).not.toBeVisible();
```

#### 2. Date of Birth (Date Picker Component)
```javascript
// React date picker interaction
await page.locator('[data-testid="birth-date"]').click();

// Navigate to year
await page.locator('.date-picker-year-select').click();
await page.locator('[data-value="1985"]').click();

// Select month
await page.locator('.date-picker-month-select').click();
await page.locator('[data-value="6"]').click();

// Select day
await page.locator('.date-picker-day:has-text("20")').click();
```

#### 3. Marital Status Radio Group
```javascript
// React radio button group
await page.locator('label:has-text("Single") input[type="radio"]').click();
// or using data-testid
await page.locator('[data-testid="marital-status-single"]').click();
```

#### 4. Number of Dependents
```javascript
// Number input with increment/decrement buttons
await page.locator('[data-testid="dependents-input"]').fill('2');
// Or use increment buttons
await page.locator('[data-testid="dependents-increment"]').click();
await page.locator('[data-testid="dependents-increment"]').click();
```

#### 5. Education Level Dropdown
```javascript
await page.locator('[data-testid="education-dropdown"]').click();
await page.locator('[role="option"]:has-text("Bachelor\'s Degree")').click();
```

#### 6. Co-Borrower Toggle
```javascript
// Toggle co-borrower section
await page.locator('[data-testid="add-co-borrower-toggle"]').click();

// Fill co-borrower details
await page.locator('[data-testid="co-borrower-first-name"]').fill('Bob');
await page.locator('[data-testid="co-borrower-last-name"]').fill('Johnson');
await page.locator('[data-testid="co-borrower-id"]').fill('555666777');
```

---

## 📋 STEP 3: INCOME & FINANCIAL OBLIGATIONS

### Test URL
```
http://localhost:5173/services/calculate-credit/3
```

### React Component Interactions

#### 1. Employment Type Dropdown
```javascript
await page.locator('[data-testid="employment-type-dropdown"]').click();
await page.locator('[role="option"]:has-text("Full-time Employee")').click();
```

#### 2. Monthly Income with Currency Formatting
```javascript
// Input with automatic formatting
await page.locator('[data-testid="monthly-income"]').fill('15000');
// Verify formatted display
await expect(page.locator('[data-testid="monthly-income"]')).toHaveValue('15,000');
```

#### 3. Years at Current Job
```javascript
await page.locator('[data-testid="employment-years-dropdown"]').click();
await page.locator('[role="option"]:has-text("3-5 years")').click();
```

#### 4. Financial Obligations Multi-Select
```javascript
// Open multi-select dropdown
await page.locator('[data-testid="obligations-dropdown"]').click();

// Select multiple obligations
const obligations = ['Credit Cards', 'Car Loan', 'Mortgage', 'Student Loan'];
for (const obligation of obligations) {
  await page.locator(`[role="option"]:has-text("${obligation}")`).click();
}

// Close dropdown
await page.keyboard.press('Escape');
```

#### 5. Monthly Obligations Amount
```javascript
// Enter total monthly obligations
await page.locator('[data-testid="monthly-obligations-amount"]').fill('5000');
```

#### 6. Additional Income Sources
```javascript
// Add additional income
await page.locator('[data-testid="add-income-source-button"]').click();

// Select income type
await page.locator('[data-testid="additional-income-type-0"]').click();
await page.locator('[role="option"]:has-text("Freelance")').click();

// Enter amount
await page.locator('[data-testid="additional-income-amount-0"]').fill('3000');

// Add another source
await page.locator('[data-testid="add-income-source-button"]').click();
await page.locator('[data-testid="additional-income-type-1"]').click();
await page.locator('[role="option"]:has-text("Investments")').click();
await page.locator('[data-testid="additional-income-amount-1"]').fill('2000');
```

#### 7. DTI Ratio Validation
```javascript
// Validate Debt-to-Income ratio calculation
async function validateDTIRatio(page) {
  const monthlyIncome = 15000;
  const additionalIncome = 5000;
  const monthlyObligations = 5000;
  const requestedLoanPayment = 1500;
  
  const totalIncome = monthlyIncome + additionalIncome;
  const totalDebt = monthlyObligations + requestedLoanPayment;
  const expectedDTI = (totalDebt / totalIncome * 100).toFixed(1);
  
  const displayedDTI = await page.locator('[data-testid="dti-ratio-display"]').textContent();
  expect(displayedDTI).toContain(expectedDTI);
  
  // Check DTI threshold warning
  if (parseFloat(expectedDTI) > 40) {
    await expect(page.locator('[data-testid="dti-warning"]')).toBeVisible();
  }
}
```

#### 8. Bank Account Details
```javascript
// Select primary bank
await page.locator('[data-testid="primary-bank-dropdown"]').click();
await page.locator('[role="option"]:has-text("Bank Hapoalim")').click();

// Account standing
await page.locator('[data-testid="account-standing-dropdown"]').click();
await page.locator('[role="option"]:has-text("Good Standing")').click();
```

---

## 📋 STEP 4: REVIEW & BANK OFFERS

### Test URL
```
http://localhost:5173/services/calculate-credit/4
```

### React Component Interactions

#### 1. Application Summary Review
```javascript
// Verify all entered data is displayed correctly
async function verifyApplicationSummary(page) {
  // Personal Information
  await expect(page.locator('[data-testid="summary-name"]')).toContainText('Jane Smith');
  await expect(page.locator('[data-testid="summary-id"]')).toContainText('987654321');
  
  // Loan Details
  await expect(page.locator('[data-testid="summary-loan-type"]')).toContainText('Personal Loan');
  await expect(page.locator('[data-testid="summary-loan-amount"]')).toContainText('50,000');
  
  // Income & DTI
  await expect(page.locator('[data-testid="summary-monthly-income"]')).toContainText('20,000');
  await expect(page.locator('[data-testid="summary-dti-ratio"]')).toContainText('32.5%');
}
```

#### 2. Bank Offers Grid/Cards
```javascript
// Iterate through bank offers
const bankOffers = await page.locator('[data-testid^="bank-offer-card-"]').all();

for (const offer of bankOffers) {
  const bankName = await offer.locator('[data-testid="bank-name"]').textContent();
  const interestRate = await offer.locator('[data-testid="interest-rate"]').textContent();
  const monthlyPayment = await offer.locator('[data-testid="monthly-payment"]').textContent();
  
  console.log(`Bank: ${bankName}, Rate: ${interestRate}, Payment: ${monthlyPayment}`);
}

// Select best offer
await page.locator('[data-testid="bank-offer-card-0"]').click();
```

#### 3. Loan Program Selection
```javascript
// Select specific program from chosen bank
await page.locator('[data-testid="loan-program-dropdown"]').click();
await page.locator('[role="option"]:has-text("Standard Personal Loan")').click();
```

#### 4. Additional Options
```javascript
// Insurance options (checkboxes)
await page.locator('[data-testid="life-insurance-checkbox"]').click();
await page.locator('[data-testid="unemployment-insurance-checkbox"]').click();

// Recalculate with insurance
await page.locator('[data-testid="recalculate-button"]').click();
await page.waitForTimeout(1000); // Wait for recalculation
```

#### 5. Terms and Conditions
```javascript
// Expand and read terms
await page.locator('[data-testid="terms-expand-button"]').click();
await page.waitForSelector('[data-testid="terms-content"]');

// Accept terms
await page.locator('[data-testid="accept-terms-checkbox"]').click();
```

#### 6. Submit Application
```javascript
// Final submission
await page.locator('[data-testid="submit-credit-application"]').click();

// Wait for confirmation
await page.waitForSelector('[data-testid="application-success-modal"]');
const confirmationNumber = await page.locator('[data-testid="confirmation-number"]').textContent();
console.log(`Application submitted successfully. Confirmation: ${confirmationNumber}`);
```

---

## 🔧 CREDIT-SPECIFIC HELPER FUNCTIONS

```javascript
// Credit Calculator specific helpers

async function calculateMonthlyPayment(principal, annualRate, months) {
  const monthlyRate = annualRate / 100 / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
  return payment;
}

async function testCreditTypeBusinessRules(page) {
  const creditTypes = [
    { type: 'Personal Loan', maxAmount: 100000, maxTerm: 60, minRate: 7.5 },
    { type: 'Car Loan', maxAmount: 500000, maxTerm: 84, minRate: 5.5 },
    { type: 'Home Improvement', maxAmount: 200000, maxTerm: 120, minRate: 6.5 },
    { type: 'Debt Consolidation', maxAmount: 150000, maxTerm: 72, minRate: 8.0 }
  ];
  
  for (const credit of creditTypes) {
    await selectReactDropdown(page, 'credit-type-dropdown', credit.type);
    
    // Test maximum amount
    await page.locator('[data-testid="loan-amount-input"]').fill(credit.maxAmount.toString());
    await page.locator('[data-testid="loan-amount-input"]').blur();
    
    // Verify no error for max amount
    await expect(page.locator('[data-testid="amount-error"]')).not.toBeVisible();
    
    // Test over maximum
    await page.locator('[data-testid="loan-amount-input"]').fill((credit.maxAmount + 1000).toString());
    await page.locator('[data-testid="loan-amount-input"]').blur();
    
    // Verify error appears
    await expect(page.locator('[data-testid="amount-error"]')).toBeVisible();
  }
}

async function validateDTIThresholds(page) {
  const thresholds = [
    { dti: 30, status: 'Excellent', color: 'green' },
    { dti: 40, status: 'Good', color: 'yellow' },
    { dti: 50, status: 'Fair', color: 'orange' },
    { dti: 60, status: 'Poor', color: 'red' }
  ];
  
  for (const threshold of thresholds) {
    // Set income and obligations to achieve specific DTI
    const income = 10000;
    const obligations = (income * threshold.dti / 100);
    
    await page.locator('[data-testid="monthly-income"]').fill(income.toString());
    await page.locator('[data-testid="monthly-obligations-amount"]').fill(obligations.toString());
    
    // Verify DTI indicator color/status
    const dtiIndicator = page.locator('[data-testid="dti-indicator"]');
    await expect(dtiIndicator).toHaveClass(new RegExp(threshold.color));
    await expect(dtiIndicator).toContainText(threshold.status);
  }
}

async function testCoBorrowerImpact(page) {
  // Test without co-borrower
  await page.locator('[data-testid="monthly-income"]').fill('10000');
  const singleDTI = await page.locator('[data-testid="dti-ratio-display"]').textContent();
  
  // Add co-borrower
  await page.locator('[data-testid="add-co-borrower-toggle"]').click();
  await page.locator('[data-testid="co-borrower-income"]').fill('8000');
  
  // Verify DTI improves with co-borrower
  const combinedDTI = await page.locator('[data-testid="dti-ratio-display"]').textContent();
  expect(parseFloat(combinedDTI)).toBeLessThan(parseFloat(singleDTI));
}
```

---

## 📝 CREDIT CALCULATOR TEST EXECUTION SCRIPT

```javascript
const { chromium } = require('playwright');

async function testCreditCalculator() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('💳 Starting Credit Calculator React Component Testing');
  
  try {
    // STEP 1: Credit Type & Amount
    await page.goto('http://localhost:5173/services/calculate-credit/1');
    await page.waitForLoadState('networkidle');
    
    await selectReactDropdown(page, 'credit-type-dropdown', 'Personal Loan');
    await fillReactInput(page, 'loan-amount-input', '50000');
    await selectReactDropdown(page, 'loan-purpose-dropdown', 'Debt Consolidation');
    await selectReactDropdown(page, 'loan-term-dropdown', '36 months');
    
    await page.locator('[data-testid="continue-button"]').click();
    await page.waitForURL('**/calculate-credit/2');
    
    // STEP 2: Personal Information
    await fillReactInput(page, 'first-name', 'Jane');
    await fillReactInput(page, 'last-name', 'Smith');
    await fillReactInput(page, 'israeli-id', '987654321');
    await fillReactInput(page, 'email', 'jane.smith@example.com');
    
    await page.locator('[data-testid="marital-status-single"]').click();
    await fillReactInput(page, 'dependents-input', '0');
    
    await page.locator('[data-testid="continue-button"]').click();
    await page.waitForURL('**/calculate-credit/3');
    
    // STEP 3: Income & Obligations
    await selectReactDropdown(page, 'employment-type-dropdown', 'Full-time Employee');
    await fillReactInput(page, 'monthly-income', '15000');
    await selectReactDropdown(page, 'employment-years-dropdown', '3-5 years');
    
    await selectMultipleOptions(page, 'obligations-dropdown', ['Credit Cards', 'Car Loan']);
    await fillReactInput(page, 'monthly-obligations-amount', '3000');
    
    await selectReactDropdown(page, 'primary-bank-dropdown', 'Bank Hapoalim');
    
    await page.locator('[data-testid="continue-button"]').click();
    await page.waitForURL('**/calculate-credit/4');
    
    // STEP 4: Review & Submit
    await verifyApplicationSummary(page);
    
    // Select bank offer
    await page.locator('[data-testid="bank-offer-card-0"]').click();
    
    // Accept terms
    await page.locator('[data-testid="accept-terms-checkbox"]').click();
    
    // Submit application
    await page.locator('[data-testid="submit-credit-application"]').click();
    await page.waitForSelector('[data-testid="application-success-modal"]');
    
    console.log('✅ Credit Calculator Testing Complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'credit-calc-error.png' });
  } finally {
    await browser.close();
  }
}

// Helper functions
async function selectReactDropdown(page, testId, optionText) {
  await page.locator(`[data-testid="${testId}"]`).click();
  await page.waitForSelector('[role="option"]');
  await page.locator(`[role="option"]:has-text("${optionText}")`).first().click();
}

async function fillReactInput(page, testId, value) {
  await page.locator(`[data-testid="${testId}"]`).clear();
  await page.locator(`[data-testid="${testId}"]`).fill(value);
}

async function selectMultipleOptions(page, testId, options) {
  await page.locator(`[data-testid="${testId}"]`).click();
  for (const option of options) {
    await page.locator(`[role="option"]:has-text("${option}")`).click();
  }
  await page.keyboard.press('Escape');
}

async function verifyApplicationSummary(page) {
  console.log('Verifying application summary...');
  // Add verification logic
}

// Run test
testCreditCalculator();
```

---

## 🚨 CRITICAL CREDIT CALCULATOR VALIDATIONS

1. **Credit Type Limits**
   - ✅ Each type has correct max amount
   - ✅ Term limits enforced per type
   - ✅ Interest rates vary by type

2. **DTI Ratio Thresholds**
   - ✅ < 30% = Excellent (green)
   - ✅ 30-40% = Good (yellow)
   - ✅ 40-50% = Fair (orange)
   - ✅ > 50% = Poor (red)

3. **Co-Borrower Logic**
   - ✅ Combined income calculated
   - ✅ DTI improves with co-borrower
   - ✅ Both borrowers validated

4. **Bank Offer Ranking**
   - ✅ Offers sorted by rate
   - ✅ Monthly payment accurate
   - ✅ Total interest calculated

5. **Insurance Impact**
   - ✅ Premium added to payment
   - ✅ Coverage amounts correct
   - ✅ Recalculation works

---

## 📊 SUCCESS CRITERIA

All credit calculator tests pass when:
1. ✅ Credit type limits enforced correctly
2. ✅ DTI calculations accurate
3. ✅ All React dropdowns functional
4. ✅ Form validation works properly
5. ✅ State persists between steps
6. ✅ Bank offers load and display
7. ✅ Co-borrower logic works
8. ✅ Application submits successfully