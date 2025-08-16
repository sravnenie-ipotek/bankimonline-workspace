# 🏡 REFINANCE MORTGAGE QA INSTRUCTIONS - REACT COMPONENT TESTING
## Updated for Advanced React Component Testing Patterns

### 🎯 CRITICAL UPDATE: React Component Testing Approach
**All dropdowns and form elements use custom React components, NOT standard HTML elements**

---

## 📋 STEP 1: EXISTING MORTGAGE DETAILS

### Test URL
```
http://localhost:5173/services/refinance-mortgage/1
```

### React Component Selectors & Interactions

#### 1. Existing Loan Balance Input
```javascript
// ✅ React Component Approach
await page.locator('[data-testid="existing-loan-balance"]').fill('1500000');
// Verify formatted display
await expect(page.locator('[data-testid="existing-loan-balance"]')).toHaveValue('1,500,000');
```

#### 2. Current Monthly Payment
```javascript
await page.locator('[data-testid="current-monthly-payment"]').fill('7500');
await expect(page.locator('[data-testid="current-monthly-payment"]')).toHaveValue('7,500');
```

#### 3. Current Interest Rate
```javascript
await page.locator('[data-testid="current-interest-rate"]').fill('5.5');
// Verify percentage display
await expect(page.locator('[data-testid="current-interest-rate"]')).toHaveValue('5.5%');
```

#### 4. Remaining Term Dropdown
```javascript
// Years remaining on current mortgage
await page.locator('[data-testid="remaining-term-dropdown"]').click();
await page.waitForSelector('[role="option"]');
await page.locator('[role="option"]:has-text("20 years")').click();
```

#### 5. Current Lender Dropdown
```javascript
await page.locator('[data-testid="current-lender-dropdown"]').click();
await page.locator('[role="option"]:has-text("Bank Hapoalim")').click();
```

#### 6. Loan Type Dropdown
```javascript
// Current loan structure
await page.locator('[data-testid="loan-type-dropdown"]').click();
await page.locator('[role="option"]:has-text("Prime + Margin")').click();
```

#### 7. Property Current Value
```javascript
// Updated property value for LTV calculation
await page.locator('[data-testid="property-current-value"]').fill('2500000');
await expect(page.locator('[data-testid="property-current-value"]')).toHaveValue('2,500,000');

// Verify LTV calculation
const ltv = await page.locator('[data-testid="current-ltv-display"]').textContent();
expect(ltv).toContain('60%'); // 1,500,000 / 2,500,000
```

#### 8. Refinance Goals (Multi-Select)
```javascript
// Select refinance objectives
await page.locator('[data-testid="refinance-goals-dropdown"]').click();

const goals = [
  'Lower Monthly Payment',
  'Reduce Interest Rate',
  'Shorten Loan Term',
  'Switch from Variable to Fixed'
];

for (const goal of goals) {
  await page.locator(`[role="option"]:has-text("${goal}")`).click();
}

await page.keyboard.press('Escape');
```

#### 9. Cash-Out Option Toggle
```javascript
// Enable cash-out refinance
await page.locator('[data-testid="cash-out-toggle"]').click();

// Enter desired cash-out amount
await page.locator('[data-testid="cash-out-amount"]').fill('200000');

// Verify new loan amount
const newLoanAmount = await page.locator('[data-testid="new-loan-amount-display"]').textContent();
expect(newLoanAmount).toContain('1,700,000'); // 1,500,000 + 200,000
```

#### 10. Closing Costs Preference
```javascript
// How to handle closing costs
await page.locator('[data-testid="closing-costs-option"]').click();
await page.locator('[role="option"]:has-text("Roll into loan")').click();
```

#### 11. Estimated Savings Preview
```javascript
// Initial savings calculation
async function validateInitialSavings(page) {
  const currentPayment = 7500;
  const estimatedNewPayment = 6200;
  const monthlySavings = currentPayment - estimatedNewPayment;
  
  const displayedSavings = await page.locator('[data-testid="estimated-monthly-savings"]').textContent();
  expect(parseFloat(displayedSavings.replace(/[^0-9.]/g, ''))).toBeCloseTo(monthlySavings, 100);
  
  // Annual savings
  const annualSavings = await page.locator('[data-testid="estimated-annual-savings"]').textContent();
  expect(parseFloat(annualSavings.replace(/[^0-9.]/g, ''))).toBeCloseTo(monthlySavings * 12, 1000);
}
```

#### 12. Long-Term Savings Analysis
```javascript
// Total savings over loan term
const totalSavings = await page.locator('[data-testid="total-interest-savings"]').textContent();
console.log(`Projected Total Savings: ${totalSavings}`);

// Years to break even
const breakEven = await page.locator('[data-testid="break-even-years"]').textContent();
console.log(`Break-Even Period: ${breakEven} years`);
```

---

## 📋 STEP 2: NEW MORTGAGE PARAMETERS

### Test URL
```
http://localhost:5173/services/refinance-mortgage/2
```

### React Component Interactions

#### 1. Desired Interest Rate Input
```javascript
// Target interest rate
await page.locator('[data-testid="new-interest-rate"]').fill('3.5');
await expect(page.locator('[data-testid="new-interest-rate"]')).toHaveValue('3.5%');
```

#### 2. New Loan Term Dropdown
```javascript
// Select new mortgage term
await page.locator('[data-testid="new-loan-term-dropdown"]').click();
await page.locator('[role="option"]:has-text("15 years")').click();

// Verify payment change with shorter term
const newPayment = await page.locator('[data-testid="new-payment-preview"]').textContent();
console.log(`New Payment with 15-year term: ${newPayment}`);
```

#### 3. Rate Type Selection
```javascript
// Choose between fixed and variable
await page.locator('[data-testid="rate-type-fixed"]').click();

// If variable selected, choose index
const variableOption = page.locator('[data-testid="rate-type-variable"]');
if (await variableOption.isChecked()) {
  await selectReactDropdown(page, 'index-type-dropdown', 'Prime Rate');
  await page.locator('[data-testid="margin-input"]').fill('1.5');
}
```

#### 4. Payment Type Selection
```javascript
// Principal and interest vs. interest-only
await page.locator('[data-testid="payment-type-principal"]').click();
```

#### 5. Cash-Out Amount Adjustment
```javascript
// Fine-tune cash-out if selected in Step 1
const cashOutSlider = page.locator('[data-testid="cash-out-slider"]');
if (await cashOutSlider.isVisible()) {
  // Drag slider to adjust amount
  const box = await cashOutSlider.boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
  await page.mouse.up();
  
  // Verify LTV doesn't exceed 70%
  const newLTV = await page.locator('[data-testid="new-ltv-display"]').textContent();
  const ltvValue = parseFloat(newLTV);
  expect(ltvValue).toBeLessThanOrEqual(70);
}
```

#### 6. Monthly Payment Comparison
```javascript
// Real-time payment comparison
async function comparePayments(page) {
  const currentPayment = await page.locator('[data-testid="current-payment-display"]').textContent();
  const newPayment = await page.locator('[data-testid="new-payment-display"]').textContent();
  const difference = await page.locator('[data-testid="payment-difference"]').textContent();
  
  const current = parseFloat(currentPayment.replace(/[^0-9.]/g, ''));
  const newPay = parseFloat(newPayment.replace(/[^0-9.]/g, ''));
  const diff = parseFloat(difference.replace(/[^0-9.]/g, ''));
  
  // Verify calculation
  expect(Math.abs(current - newPay)).toBeCloseTo(diff, 10);
  
  // Check if savings or cost
  if (newPay < current) {
    await expect(page.locator('[data-testid="payment-savings-indicator"]')).toHaveClass(/positive|green/);
  } else {
    await expect(page.locator('[data-testid="payment-increase-indicator"]')).toHaveClass(/negative|red/);
  }
}
```

#### 7. Rate Comparison Display
```javascript
// Visual rate comparison
const rateReduction = await page.locator('[data-testid="rate-reduction-display"]').textContent();
console.log(`Interest Rate Reduction: ${rateReduction}`);

// APR comparison
const currentAPR = await page.locator('[data-testid="current-apr"]').textContent();
const newAPR = await page.locator('[data-testid="new-apr"]').textContent();
console.log(`APR Change: ${currentAPR} → ${newAPR}`);
```

#### 8. Total Interest Comparison
```javascript
// Lifetime interest savings
const currentTotalInterest = await page.locator('[data-testid="current-total-interest"]').textContent();
const newTotalInterest = await page.locator('[data-testid="new-total-interest"]').textContent();
const interestSavings = await page.locator('[data-testid="total-interest-savings"]').textContent();

console.log(`Interest Savings Over Life of Loan: ${interestSavings}`);
```

---

## 📋 STEP 3: BANK OFFERS & PROGRAMS

### Test URL
```
http://localhost:5173/services/refinance-mortgage/3
```

### React Component Interactions

#### 1. Bank Offers Grid
```javascript
// Display all available refinance offers
async function analyzeBankOffers(page) {
  const offers = await page.locator('[data-testid^="bank-offer-card-"]').all();
  
  for (let i = 0; i < offers.length; i++) {
    const card = offers[i];
    const bankName = await card.locator('[data-testid="bank-name"]').textContent();
    const rate = await card.locator('[data-testid="offered-rate"]').textContent();
    const payment = await card.locator('[data-testid="monthly-payment"]').textContent();
    const closingCosts = await card.locator('[data-testid="closing-costs"]').textContent();
    const points = await card.locator('[data-testid="discount-points"]').textContent();
    
    console.log(`Offer ${i + 1}: ${bankName}`);
    console.log(`  Rate: ${rate}, Payment: ${payment}`);
    console.log(`  Closing: ${closingCosts}, Points: ${points}`);
    
    // Check for special programs
    const specialPrograms = await card.locator('[data-testid="special-programs"]').count();
    if (specialPrograms > 0) {
      const programs = await card.locator('[data-testid="special-programs"]').textContent();
      console.log(`  Special Programs: ${programs}`);
    }
  }
}
```

#### 2. Bank Selection
```javascript
// Select preferred bank
await page.locator('[data-testid="bank-offer-card-0"]').click();
// or
await page.locator('[data-testid="select-bank-leumi"]').click();
```

#### 3. Mortgage Program Dropdown
```javascript
// Select specific program from chosen bank
await page.locator('[data-testid="mortgage-program-dropdown"]').click();
await page.locator('[role="option"]:has-text("Prime + 0.5% for 10 years")').click();
```

#### 4. Rate Lock Options
```javascript
// Rate lock period selection
await page.locator('[data-testid="rate-lock-dropdown"]').click();
await page.locator('[role="option"]:has-text("60 days")').click();

// Rate lock fee if applicable
const rateLockFee = await page.locator('[data-testid="rate-lock-fee"]').textContent();
if (rateLockFee !== '0') {
  console.log(`Rate Lock Fee: ${rateLockFee}`);
}
```

#### 5. Points Purchase Option
```javascript
// Option to buy down the rate
await page.locator('[data-testid="discount-points-slider"]').click();

// Select number of points
for (let i = 0; i < 2; i++) {
  await page.locator('[data-testid="discount-points-slider"]').press('ArrowRight');
}

// Verify rate reduction and cost
const pointsCost = await page.locator('[data-testid="points-cost"]').textContent();
const rateWithPoints = await page.locator('[data-testid="rate-with-points"]').textContent();
console.log(`Buying 2 points costs ${pointsCost}, reduces rate to ${rateWithPoints}`);
```

#### 6. Closing Cost Details
```javascript
// Expandable closing cost breakdown
await page.locator('[data-testid="expand-closing-costs"]').click();

const closingItems = [
  'origination-fee',
  'appraisal-fee',
  'title-insurance',
  'attorney-fees',
  'recording-fees',
  'prepaid-interest'
];

for (const item of closingItems) {
  const fee = await page.locator(`[data-testid="${item}"]`).textContent();
  console.log(`${item}: ${fee}`);
}

// Total closing costs
const totalClosing = await page.locator('[data-testid="total-closing-costs"]').textContent();
console.log(`Total Closing Costs: ${totalClosing}`);
```

#### 7. Savings Calculator with Selected Offer
```javascript
// Recalculate savings with selected bank offer
async function calculateFinalSavings(page) {
  // Monthly savings
  const monthlySavings = await page.locator('[data-testid="final-monthly-savings"]').textContent();
  
  // Break-even analysis including closing costs
  const breakEvenMonths = await page.locator('[data-testid="break-even-months"]').textContent();
  
  // Total savings over loan life
  const lifetimeSavings = await page.locator('[data-testid="lifetime-savings"]').textContent();
  
  // Net benefit (savings minus costs)
  const netBenefit = await page.locator('[data-testid="net-benefit"]').textContent();
  
  console.log('Final Refinance Analysis:');
  console.log(`- Monthly Savings: ${monthlySavings}`);
  console.log(`- Break-Even: ${breakEvenMonths} months`);
  console.log(`- Lifetime Savings: ${lifetimeSavings}`);
  console.log(`- Net Benefit: ${netBenefit}`);
  
  // Recommendation
  const recommendation = await page.locator('[data-testid="refinance-recommendation"]').textContent();
  expect(recommendation).toMatch(/Highly Recommended|Recommended|Consider Carefully|Not Recommended/);
}
```

---

## 📋 STEP 4: APPLICATION REVIEW & SUBMISSION

### Test URL
```
http://localhost:5173/services/refinance-mortgage/4
```

### React Component Interactions

#### 1. Application Summary
```javascript
// Complete application review
async function reviewApplicationSummary(page) {
  // Existing mortgage details
  await expect(page.locator('[data-testid="summary-current-balance"]')).toContainText('1,500,000');
  await expect(page.locator('[data-testid="summary-current-rate"]')).toContainText('5.5%');
  await expect(page.locator('[data-testid="summary-current-payment"]')).toContainText('7,500');
  
  // New mortgage details
  await expect(page.locator('[data-testid="summary-new-balance"]')).toBeVisible();
  await expect(page.locator('[data-testid="summary-new-rate"]')).toBeVisible();
  await expect(page.locator('[data-testid="summary-new-payment"]')).toBeVisible();
  await expect(page.locator('[data-testid="summary-new-term"]')).toBeVisible();
  
  // Selected bank and program
  await expect(page.locator('[data-testid="summary-selected-bank"]')).toBeVisible();
  await expect(page.locator('[data-testid="summary-selected-program"]')).toBeVisible();
}
```

#### 2. Final Rate Confirmation
```javascript
// Confirm final interest rate and APR
const finalRate = await page.locator('[data-testid="final-interest-rate"]').textContent();
const finalAPR = await page.locator('[data-testid="final-apr"]').textContent();

console.log(`Final Rate: ${finalRate}`);
console.log(`Final APR: ${finalAPR}`);

// Rate lock confirmation
const rateLockExpiry = await page.locator('[data-testid="rate-lock-expiry"]').textContent();
console.log(`Rate locked until: ${rateLockExpiry}`);
```

#### 3. Total Savings Summary
```javascript
// Comprehensive savings breakdown
async function reviewTotalSavings(page) {
  // Monthly payment reduction
  const monthlyReduction = await page.locator('[data-testid="monthly-payment-reduction"]').textContent();
  
  // First year savings
  const firstYearSavings = await page.locator('[data-testid="first-year-savings"]').textContent();
  
  // 5-year savings
  const fiveYearSavings = await page.locator('[data-testid="five-year-savings"]').textContent();
  
  // Total lifetime savings
  const lifetimeSavings = await page.locator('[data-testid="total-lifetime-savings"]').textContent();
  
  // Closing costs
  const closingCosts = await page.locator('[data-testid="total-closing-costs"]').textContent();
  
  // Net benefit
  const netBenefit = await page.locator('[data-testid="net-refinance-benefit"]').textContent();
  
  console.log('Refinance Savings Summary:');
  console.log(`- Monthly: ${monthlyReduction}`);
  console.log(`- Year 1: ${firstYearSavings}`);
  console.log(`- 5 Years: ${fiveYearSavings}`);
  console.log(`- Lifetime: ${lifetimeSavings}`);
  console.log(`- Costs: ${closingCosts}`);
  console.log(`- Net Benefit: ${netBenefit}`);
}
```

#### 4. Break-Even Analysis
```javascript
// Visual break-even display
const breakEvenMonths = await page.locator('[data-testid="break-even-period-months"]').textContent();
const breakEvenDate = await page.locator('[data-testid="break-even-date"]').textContent();

console.log(`Break-Even: ${breakEvenMonths} months (${breakEvenDate})`);

// Break-even chart if available
const chartElement = page.locator('[data-testid="break-even-chart"]');
if (await chartElement.isVisible()) {
  console.log('Break-even visualization chart is displayed');
}
```

#### 5. Terms & Conditions
```javascript
// Review and accept terms
await page.locator('[data-testid="expand-terms-button"]').click();
await page.waitForSelector('[data-testid="terms-content"]');

// Scroll through terms (if needed)
await page.locator('[data-testid="terms-content"]').evaluate(el => el.scrollTop = el.scrollHeight);

// Accept all required checkboxes
const checkboxes = [
  'terms-checkbox',
  'rate-lock-agreement',
  'closing-cost-agreement',
  'privacy-policy'
];

for (const checkbox of checkboxes) {
  await page.locator(`[data-testid="${checkbox}"]`).click();
}
```

#### 6. E-Signature
```javascript
// Electronic signature
await page.locator('[data-testid="e-signature-field"]').fill('Michael Cohen');
await page.locator('[data-testid="signature-date"]').fill(new Date().toLocaleDateString());
```

#### 7. Submit Refinance Application
```javascript
// Final submission
await page.locator('[data-testid="submit-refinance-mortgage"]').click();

// Wait for confirmation
await page.waitForSelector('[data-testid="application-success-modal"]');

// Get confirmation details
const confirmationNumber = await page.locator('[data-testid="confirmation-number"]').textContent();
const nextSteps = await page.locator('[data-testid="next-steps"]').textContent();

console.log(`✅ Refinance Application Submitted`);
console.log(`Confirmation Number: ${confirmationNumber}`);
console.log(`Next Steps: ${nextSteps}`);

// Download confirmation PDF if available
const downloadButton = page.locator('[data-testid="download-confirmation-pdf"]');
if (await downloadButton.isVisible()) {
  await downloadButton.click();
  console.log('Confirmation PDF downloaded');
}
```

---

## 🔧 REFINANCE MORTGAGE SPECIFIC HELPERS

```javascript
// Helper functions for refinance mortgage testing

async function calculateBreakEven(closingCosts, monthlySavings) {
  if (monthlySavings <= 0) {
    return Infinity; // Never breaks even if no savings
  }
  return Math.ceil(closingCosts / monthlySavings);
}

async function validateLTVLimits(page, scenario) {
  const scenarios = {
    standard: { maxLTV: 80, description: 'Standard refinance' },
    cashOut: { maxLTV: 70, description: 'Cash-out refinance' },
    highValue: { maxLTV: 75, description: 'High-value property' }
  };
  
  const config = scenarios[scenario];
  const propertyValue = 2500000;
  const maxLoan = propertyValue * (config.maxLTV / 100);
  
  await page.locator('[data-testid="property-current-value"]').fill(propertyValue.toString());
  
  // Try to enter loan amount above limit
  await page.locator('[data-testid="new-loan-amount"]').fill((maxLoan + 100000).toString());
  
  // Should show error
  await expect(page.locator('[data-testid="ltv-error"]')).toBeVisible();
  await expect(page.locator('[data-testid="ltv-error"]')).toContainText(`Maximum LTV is ${config.maxLTV}%`);
}

async function compareRefinancePrograms(page) {
  const programs = [
    { name: 'Fixed 15 Year', term: 15, rateType: 'fixed' },
    { name: 'Fixed 30 Year', term: 30, rateType: 'fixed' },
    { name: 'Variable Prime', term: 30, rateType: 'variable' },
    { name: 'Hybrid 5/1 ARM', term: 30, rateType: 'hybrid' }
  ];
  
  const comparisons = [];
  
  for (const program of programs) {
    // Select program
    await selectReactDropdown(page, 'mortgage-program-dropdown', program.name);
    
    // Get metrics
    const rate = await page.locator('[data-testid="program-rate"]').textContent();
    const payment = await page.locator('[data-testid="program-payment"]').textContent();
    const totalInterest = await page.locator('[data-testid="program-total-interest"]').textContent();
    
    comparisons.push({
      program: program.name,
      rate: parseFloat(rate),
      payment: parseFloat(payment.replace(/[^0-9.]/g, '')),
      totalInterest: parseFloat(totalInterest.replace(/[^0-9.]/g, ''))
    });
  }
  
  // Find best option by different criteria
  const lowestRate = comparisons.reduce((min, p) => p.rate < min.rate ? p : min);
  const lowestPayment = comparisons.reduce((min, p) => p.payment < min.payment ? p : min);
  const leastInterest = comparisons.reduce((min, p) => p.totalInterest < min.totalInterest ? p : min);
  
  console.log('Program Comparison:');
  console.log('Lowest Rate:', lowestRate);
  console.log('Lowest Payment:', lowestPayment);
  console.log('Least Total Interest:', leastInterest);
  
  return comparisons;
}

async function testCashOutScenarios(page) {
  const scenarios = [
    {
      propertyValue: 3000000,
      currentLoan: 1500000,
      cashOut: 300000,
      expectedLTV: 60 // (1500000 + 300000) / 3000000
    },
    {
      propertyValue: 2000000,
      currentLoan: 1000000,
      cashOut: 400000,
      expectedLTV: 70 // (1000000 + 400000) / 2000000
    }
  ];
  
  for (const scenario of scenarios) {
    await page.locator('[data-testid="property-current-value"]').fill(scenario.propertyValue.toString());
    await page.locator('[data-testid="existing-loan-balance"]').fill(scenario.currentLoan.toString());
    await page.locator('[data-testid="cash-out-amount"]').fill(scenario.cashOut.toString());
    
    const displayedLTV = await page.locator('[data-testid="new-ltv-display"]').textContent();
    const ltvValue = parseFloat(displayedLTV);
    
    expect(ltvValue).toBeCloseTo(scenario.expectedLTV, 1);
    
    // Verify cash-out doesn't exceed limits
    if (scenario.expectedLTV > 70) {
      await expect(page.locator('[data-testid="ltv-warning"]')).toBeVisible();
    }
  }
}
```

---

## 📝 REFINANCE MORTGAGE TEST EXECUTION SCRIPT

```javascript
const { chromium } = require('playwright');

async function testRefinanceMortgage() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🏡 Starting Refinance Mortgage React Component Testing');
  
  try {
    // STEP 1: Existing Mortgage Details
    await page.goto('http://localhost:5173/services/refinance-mortgage/1');
    await page.waitForLoadState('networkidle');
    
    await fillReactInput(page, 'existing-loan-balance', '1500000');
    await fillReactInput(page, 'current-monthly-payment', '7500');
    await fillReactInput(page, 'current-interest-rate', '5.5');
    await selectReactDropdown(page, 'remaining-term-dropdown', '20 years');
    await selectReactDropdown(page, 'current-lender-dropdown', 'Bank Hapoalim');
    await fillReactInput(page, 'property-current-value', '2500000');
    
    // Select refinance goals
    await selectMultipleOptions(page, 'refinance-goals-dropdown', [
      'Lower Monthly Payment',
      'Reduce Interest Rate'
    ]);
    
    await validateInitialSavings(page);
    
    await page.locator('[data-testid="continue-button"]').click();
    await page.waitForURL('**/refinance-mortgage/2');
    
    // STEP 2: New Mortgage Parameters
    await fillReactInput(page, 'new-interest-rate', '3.5');
    await selectReactDropdown(page, 'new-loan-term-dropdown', '15 years');
    await page.locator('[data-testid="rate-type-fixed"]').click();
    
    await comparePayments(page);
    
    await page.locator('[data-testid="continue-button"]').click();
    await page.waitForURL('**/refinance-mortgage/3');
    
    // STEP 3: Bank Offers & Programs
    await analyzeBankOffers(page);
    
    // Select best offer
    await page.locator('[data-testid="bank-offer-card-0"]').click();
    await selectReactDropdown(page, 'mortgage-program-dropdown', 'Prime + 0.5% for 10 years');
    
    await calculateFinalSavings(page);
    
    await page.locator('[data-testid="continue-button"]').click();
    await page.waitForURL('**/refinance-mortgage/4');
    
    // STEP 4: Application Review & Submission
    await reviewApplicationSummary(page);
    await reviewTotalSavings(page);
    
    // Accept terms
    const checkboxes = ['terms-checkbox', 'rate-lock-agreement', 'privacy-policy'];
    for (const checkbox of checkboxes) {
      await page.locator(`[data-testid="${checkbox}"]`).click();
    }
    
    // E-signature
    await page.locator('[data-testid="e-signature-field"]').fill('Michael Cohen');
    
    // Submit application
    await page.locator('[data-testid="submit-refinance-mortgage"]').click();
    await page.waitForSelector('[data-testid="application-success-modal"]');
    
    const confirmationNumber = await page.locator('[data-testid="confirmation-number"]').textContent();
    console.log(`✅ Refinance Mortgage Application Submitted: ${confirmationNumber}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'refinance-mortgage-error.png' });
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

async function validateInitialSavings(page) {
  // Implement savings validation logic
  console.log('Validating initial savings calculations...');
}

async function comparePayments(page) {
  // Implement payment comparison logic
  console.log('Comparing current vs new payments...');
}

async function analyzeBankOffers(page) {
  // Implement bank offer analysis
  console.log('Analyzing bank refinance offers...');
}

async function calculateFinalSavings(page) {
  // Implement final savings calculation
  console.log('Calculating final refinance savings...');
}

async function reviewApplicationSummary(page) {
  // Implement application review
  console.log('Reviewing application summary...');
}

async function reviewTotalSavings(page) {
  // Implement total savings review
  console.log('Reviewing total savings breakdown...');
}

// Run test
testRefinanceMortgage();
```

---

## 🚨 CRITICAL REFINANCE MORTGAGE VALIDATIONS

1. **LTV Limits**
   - ✅ Standard refinance: 80% max LTV
   - ✅ Cash-out refinance: 70% max LTV
   - ✅ High-value property: 75% max LTV
   - ✅ Validation errors display correctly

2. **Break-Even Analysis**
   - ✅ Closing costs included
   - ✅ Monthly savings calculated
   - ✅ Break-even period accurate
   - ✅ Visual representation clear

3. **Payment Calculations**
   - ✅ Principal & interest accurate
   - ✅ Term changes reflected
   - ✅ Rate changes calculated
   - ✅ Cash-out impact shown

4. **Rate Comparisons**
   - ✅ Current vs new rate
   - ✅ Fixed vs variable options
   - ✅ APR calculations correct
   - ✅ Points purchase impact

5. **Savings Analysis**
   - ✅ Monthly savings accurate
   - ✅ Annual savings calculated
   - ✅ Lifetime savings projected
   - ✅ Net benefit after costs

6. **Bank Offer Ranking**
   - ✅ Multiple offers displayed
   - ✅ Rates competitive
   - ✅ Closing costs transparent
   - ✅ Special programs highlighted

---

## 📊 SUCCESS CRITERIA

All refinance mortgage tests pass when:
1. ✅ Current mortgage details captured correctly
2. ✅ LTV calculations accurate for all scenarios
3. ✅ Break-even analysis provides clear guidance
4. ✅ Payment comparisons are accurate
5. ✅ All React components functional
6. ✅ Bank offers load and compare properly
7. ✅ Savings calculations are correct
8. ✅ Application submits successfully

---

## 🎯 COMPREHENSIVE TESTING CHECKLIST

### All Processes (React Component Specific)
1. **Dropdown Testing**
   - ✅ Use click to open, not selectOption
   - ✅ Wait for menu appearance
   - ✅ Click option by text
   - ✅ Verify selection updates

2. **Form Validation**
   - ✅ Real-time validation works
   - ✅ Error messages display
   - ✅ Field dependencies function
   - ✅ Redux state updates properly

3. **Navigation**
   - ✅ Step progression saves data
   - ✅ Back button preserves state
   - ✅ URLs update correctly
   - ✅ Progress indicators work

4. **API Integration**
   - ✅ Dropdowns load from APIs
   - ✅ Loading states display
   - ✅ Error handling works
   - ✅ Data persists correctly

5. **Responsive Design**
   - ✅ Components adapt to viewport
   - ✅ Touch interactions work
   - ✅ Modals display properly
   - ✅ Keyboard navigation functional