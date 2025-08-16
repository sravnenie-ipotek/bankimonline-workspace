# 🚀 MORTGAGE CALCULATOR QA INSTRUCTIONS - REACT COMPONENT TESTING
## Updated for Advanced React Component Testing Patterns

### 🎯 CRITICAL UPDATE: React Component Testing Approach
**All dropdowns and form elements use custom React components, NOT standard HTML elements**

---

## 📋 STEP 1: PROPERTY & LOAN PARAMETERS

### Test URL
```
http://localhost:5173/services/calculate-mortgage/1
```

### React Component Selectors & Interactions

#### 1. Property Value Input
```javascript
// React Component Testing Pattern
await page.locator('[data-testid="property-price-input"]').fill('2000000');
// Verify value update
await expect(page.locator('[data-testid="property-price-input"]')).toHaveValue('2,000,000');
```

#### 2. Property Ownership Dropdown (CRITICAL)
```javascript
// ❌ OLD APPROACH (HTML select - DOESN'T WORK)
// await page.selectOption('select[name="propertyOwnership"]', 'no_property');

// ✅ NEW APPROACH (React Component)
// Click to open dropdown
await page.locator('[data-testid="property-ownership-dropdown"]').click();
// Wait for dropdown menu to appear
await page.waitForSelector('.dropdown-menu-item, [role="option"]');
// Select option by clicking
await page.locator('text="I don\'t own any property"').first().click();

// Alternative using ARIA attributes
await page.locator('[aria-label="Property ownership"]').click();
await page.locator('[role="option"]:has-text("I don\'t own any property")').click();
```

#### 3. City Selection Dropdown
```javascript
// Click to open searchable dropdown
await page.locator('[data-testid="city-dropdown"]').click();
// Type to search (if searchable)
await page.locator('input[placeholder*="Search"]').fill('Tel Aviv');
// Click matching result
await page.locator('.dropdown-item:has-text("Tel Aviv")').first().click();
```

#### 4. When Do You Need Money Dropdown
```javascript
await page.locator('[data-testid="when-needed-dropdown"]').click();
await page.waitForTimeout(300); // Wait for animation
await page.locator('text="Up to 3 months"').click();
```

#### 5. Initial Payment Slider (React Component)
```javascript
// React slider component interaction
const slider = page.locator('[data-testid="initial-payment-slider"]');
await slider.click(); // Focus the slider

// Method 1: Drag slider
const box = await slider.boundingBox();
await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
await page.mouse.up();

// Method 2: Keyboard interaction
await slider.press('ArrowRight'); // Increase value
await slider.press('ArrowLeft');  // Decrease value

// Method 3: Direct value input (if input field exists)
await page.locator('input[name="initialPayment"]').fill('500000');
```

#### 6. Interest Rate Toggle & Input
```javascript
// Toggle custom interest rate
await page.locator('[data-testid="custom-rate-toggle"]').click();
// Enter custom rate
await page.locator('[data-testid="interest-rate-input"]').fill('4.5');
```

#### 7. Loan Term Dropdown
```javascript
await page.locator('[data-testid="loan-term-dropdown"]').click();
await page.locator('[role="option"]:has-text("25 years")').click();
```

#### 8. Continue Button
```javascript
// React button component
await page.locator('button:has-text("Continue"), [data-testid="continue-button"]').click();
// Wait for navigation
await page.waitForURL('**/calculate-mortgage/2');
```

### Validation Points for Step 1

```javascript
// Verify LTV calculation based on property ownership
async function validateLTVLogic(page) {
  // Test Case 1: No property (75% LTV)
  await page.locator('[data-testid="property-ownership-dropdown"]').click();
  await page.locator('text="I don\'t own any property"').click();
  
  const propertyValue = 2000000;
  await page.locator('[data-testid="property-price-input"]').fill(propertyValue.toString());
  
  // Maximum loan should be 75% of property value
  const maxLoan = await page.locator('[data-testid="max-loan-amount"]').textContent();
  expect(parseInt(maxLoan.replace(/,/g, ''))).toBe(propertyValue * 0.75);
  
  // Test Case 2: Has property (50% LTV)
  await page.locator('[data-testid="property-ownership-dropdown"]').click();
  await page.locator('text="I own a property"').click();
  
  const maxLoan50 = await page.locator('[data-testid="max-loan-amount"]').textContent();
  expect(parseInt(maxLoan50.replace(/,/g, ''))).toBe(propertyValue * 0.50);
  
  // Test Case 3: Selling property (70% LTV)
  await page.locator('[data-testid="property-ownership-dropdown"]').click();
  await page.locator('text="I\'m selling a property"').click();
  
  const maxLoan70 = await page.locator('[data-testid="max-loan-amount"]').textContent();
  expect(parseInt(maxLoan70.replace(/,/g, ''))).toBe(propertyValue * 0.70);
}
```

---

## 📋 STEP 2: PERSONAL INFORMATION

### Test URL
```
http://localhost:5173/services/calculate-mortgage/2
```

### React Component Interactions

#### 1. Personal Details Form
```javascript
// Text inputs (standard React inputs)
await page.locator('[data-testid="first-name"]').fill('John');
await page.locator('[data-testid="last-name"]').fill('Doe');
await page.locator('[data-testid="israeli-id"]').fill('123456789');

// Date picker component
await page.locator('[data-testid="birth-date"]').click();
// Select year
await page.locator('.date-picker-year').selectOption('1990');
// Select month
await page.locator('.date-picker-month').selectOption('5');
// Select day
await page.locator('.date-picker-day:has-text("15")').click();
```

#### 2. Family Status Dropdown
```javascript
await page.locator('[data-testid="family-status-dropdown"]').click();
await page.locator('[role="option"]:has-text("Married")').click();
```

#### 3. Citizenship Multi-Select
```javascript
// Multi-select React component
await page.locator('[data-testid="citizenship-dropdown"]').click();
await page.locator('[role="option"]:has-text("Israeli")').click();
// Can select multiple
await page.locator('[role="option"]:has-text("US Citizen")').click();
// Click outside to close
await page.locator('body').click({ position: { x: 0, y: 0 } });
```

#### 4. Address Fields with City Autocomplete
```javascript
// Street address
await page.locator('[data-testid="street-address"]').fill('123 Rothschild Blvd');

// City autocomplete
await page.locator('[data-testid="city-autocomplete"]').click();
await page.locator('[data-testid="city-autocomplete"] input').fill('Tel');
await page.waitForSelector('.autocomplete-results');
await page.locator('.autocomplete-item:has-text("Tel Aviv")').click();
```

#### 5. Phone Number with Format Validation
```javascript
// Phone input with formatting
await page.locator('[data-testid="phone-number"]').fill('0501234567');
// Verify formatted display
await expect(page.locator('[data-testid="phone-number"]')).toHaveValue('050-123-4567');
```

#### 6. Navigation Buttons
```javascript
// Back button
await page.locator('[data-testid="back-button"]').click();
await page.waitForURL('**/calculate-mortgage/1');

// Continue button
await page.locator('[data-testid="continue-button"]').click();
await page.waitForURL('**/calculate-mortgage/3');
```

---

## 📋 STEP 3: INCOME & EMPLOYMENT

### Test URL
```
http://localhost:5173/services/calculate-mortgage/3
```

### React Component Interactions

#### 1. Employment Status Dropdown
```javascript
await page.locator('[data-testid="employment-status-dropdown"]').click();
await page.locator('[role="option"]:has-text("Salaried Employee")').click();
```

#### 2. Monthly Income Input with Formatting
```javascript
// Income input with thousand separators
await page.locator('[data-testid="monthly-income"]').fill('25000');
await expect(page.locator('[data-testid="monthly-income"]')).toHaveValue('25,000');
```

#### 3. Obligations Dropdown (Multi-Select)
```javascript
// Open obligations dropdown
await page.locator('[data-testid="obligations-dropdown"]').click();

// Select multiple obligations
await page.locator('[role="option"]:has-text("Credit Card")').click();
await page.locator('[role="option"]:has-text("Car Loan")').click();
await page.locator('[role="option"]:has-text("Student Loan")').click();

// Close dropdown
await page.keyboard.press('Escape');
```

#### 4. Main Income Source Dropdown
```javascript
await page.locator('[data-testid="main-income-source-dropdown"]').click();
await page.locator('[role="option"]:has-text("Salary")').click();
```

#### 5. Additional Income Sources
```javascript
// Add additional income source
await page.locator('[data-testid="add-income-source"]').click();

// Select type
await page.locator('[data-testid="additional-income-type-0"]').click();
await page.locator('[role="option"]:has-text("Rental Income")').click();

// Enter amount
await page.locator('[data-testid="additional-income-amount-0"]').fill('5000');
```

#### 6. Monthly Obligations Input
```javascript
await page.locator('[data-testid="monthly-obligations"]').fill('8000');
```

#### 7. DTI Calculation Validation
```javascript
// Verify DTI ratio calculation
const income = await page.locator('[data-testid="total-income"]').textContent();
const obligations = await page.locator('[data-testid="total-obligations"]').textContent();
const dtiRatio = await page.locator('[data-testid="dti-ratio"]').textContent();

const expectedDTI = (parseInt(obligations) / parseInt(income) * 100).toFixed(1);
expect(dtiRatio).toContain(expectedDTI);
```

---

## 📋 STEP 4: BANK OFFERS & SUBMISSION

### Test URL
```
http://localhost:5173/services/calculate-mortgage/4
```

### React Component Interactions

#### 1. Bank Selection Grid/List
```javascript
// Click on bank card (React component)
await page.locator('[data-testid="bank-card-leumi"]').click();

// Or select from dropdown
await page.locator('[data-testid="bank-selection-dropdown"]').click();
await page.locator('[role="option"]:has-text("Bank Hapoalim")').click();
```

#### 2. Mortgage Program Selection
```javascript
// Select mortgage program
await page.locator('[data-testid="program-dropdown"]').click();
await page.locator('[role="option"]:has-text("Prime + 0.5%")').click();
```

#### 3. Rate Type Selection (Radio Group)
```javascript
// React radio group component
await page.locator('[data-testid="rate-type-fixed"]').click();
// or
await page.locator('label:has-text("Fixed Rate")').click();
```

#### 4. Terms Acceptance Checkbox
```javascript
// Custom checkbox component
await page.locator('[data-testid="terms-checkbox"]').click();
// Verify checked state
await expect(page.locator('[data-testid="terms-checkbox"]')).toBeChecked();
```

#### 5. Submit Application Button
```javascript
// Final submission
await page.locator('[data-testid="submit-application"]').click();

// Wait for success modal/redirect
await page.waitForSelector('.success-modal, [data-testid="success-message"]');
```

---

## 🔧 HELPER FUNCTIONS FOR REACT COMPONENT TESTING

```javascript
// Reusable helper functions for React components

async function selectReactDropdown(page, testId, optionText) {
  // Open dropdown
  await page.locator(`[data-testid="${testId}"]`).click();
  
  // Wait for dropdown menu
  await page.waitForSelector('[role="option"], .dropdown-menu-item', { timeout: 5000 });
  
  // Select option
  await page.locator(`[role="option"]:has-text("${optionText}")`).first().click();
}

async function fillReactInput(page, testId, value) {
  const input = page.locator(`[data-testid="${testId}"]`);
  await input.clear();
  await input.fill(value);
  await input.blur(); // Trigger validation
}

async function selectMultipleOptions(page, testId, options) {
  // Open multi-select dropdown
  await page.locator(`[data-testid="${testId}"]`).click();
  
  // Select each option
  for (const option of options) {
    await page.locator(`[role="option"]:has-text("${option}")`).click();
  }
  
  // Close dropdown
  await page.keyboard.press('Escape');
}

async function validateReactFormErrors(page) {
  // Check for error messages
  const errors = await page.locator('.error-message, [role="alert"]').all();
  return errors.map(async (error) => await error.textContent());
}

async function waitForReactComponent(page, selector) {
  // Wait for React component to be fully loaded
  await page.waitForSelector(selector, { state: 'visible' });
  await page.waitForTimeout(300); // Allow for animations
}
```

---

## 🚨 CRITICAL TESTING CHECKLIST

### React Component Specific Validations

1. **Dropdown Interactions**
   - ✅ Click to open (not selectOption)
   - ✅ Wait for menu to appear
   - ✅ Click option text (not value)
   - ✅ Verify selection updates

2. **Form Validations**
   - ✅ Real-time validation triggers
   - ✅ Error message display
   - ✅ Field interdependencies
   - ✅ Redux state updates

3. **Navigation Flow**
   - ✅ Step progression saves data
   - ✅ Back button preserves state
   - ✅ URL updates correctly
   - ✅ Progress indicator updates

4. **API Integration**
   - ✅ Dropdown data loads from API
   - ✅ Form submission triggers API calls
   - ✅ Loading states display
   - ✅ Error handling works

5. **Responsive Behavior**
   - ✅ Components adapt to viewport
   - ✅ Touch interactions work
   - ✅ Modals/overlays responsive
   - ✅ Keyboard navigation functional

---

## 📝 TEST EXECUTION SCRIPT

```javascript
const { chromium } = require('playwright');

async function testMortgageCalculator() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🚀 Starting Mortgage Calculator React Component Testing');
  
  // Step 1 Testing
  await page.goto('http://localhost:5173/services/calculate-mortgage/1');
  await page.waitForLoadState('networkidle');
  
  // Property value
  await fillReactInput(page, 'property-price-input', '2000000');
  
  // Property ownership dropdown
  await selectReactDropdown(page, 'property-ownership-dropdown', "I don't own any property");
  
  // City selection
  await selectReactDropdown(page, 'city-dropdown', 'Tel Aviv');
  
  // Continue to Step 2
  await page.locator('[data-testid="continue-button"]').click();
  await page.waitForURL('**/calculate-mortgage/2');
  
  // Step 2 Testing
  await fillReactInput(page, 'first-name', 'John');
  await fillReactInput(page, 'last-name', 'Doe');
  await fillReactInput(page, 'israeli-id', '123456789');
  
  // Family status
  await selectReactDropdown(page, 'family-status-dropdown', 'Married');
  
  // Continue to Step 3
  await page.locator('[data-testid="continue-button"]').click();
  await page.waitForURL('**/calculate-mortgage/3');
  
  // Step 3 Testing
  await selectReactDropdown(page, 'employment-status-dropdown', 'Salaried Employee');
  await fillReactInput(page, 'monthly-income', '25000');
  
  // Obligations
  await selectMultipleOptions(page, 'obligations-dropdown', ['Credit Card', 'Car Loan']);
  
  // Continue to Step 4
  await page.locator('[data-testid="continue-button"]').click();
  await page.waitForURL('**/calculate-mortgage/4');
  
  // Step 4 Testing
  await page.locator('[data-testid="bank-card-leumi"]').click();
  await selectReactDropdown(page, 'program-dropdown', 'Prime + 0.5%');
  await page.locator('[data-testid="terms-checkbox"]').click();
  await page.locator('[data-testid="submit-application"]').click();
  
  console.log('✅ Mortgage Calculator React Component Testing Complete');
  
  await browser.close();
}

// Execute test
testMortgageCalculator();
```

---

## 📊 SUCCESS CRITERIA

All tests pass when:
1. ✅ All React dropdowns open and select correctly
2. ✅ Form validation works in real-time
3. ✅ Navigation preserves state between steps
4. ✅ API data loads in all dropdowns
5. ✅ LTV calculations are accurate
6. ✅ DTI ratio calculates correctly
7. ✅ Bank offers load and display
8. ✅ Application submits successfully

---

## 🔄 CONTINUOUS IMPROVEMENT

- Monitor for React component updates
- Update selectors if data-testid changes
- Add new interaction patterns as components evolve
- Document any custom component behaviors