# Mortgage Calculator Test Guide

## 🎯 Test Overview

This Cypress test automates the complete mortgage calculator flow starting from the homepage.

## 🚀 Running the Test

### Quick Start
```bash
cd /Users/michaelmishayev/Projects/bankDev2_standalone/mainapp

# Make sure the app is running
npm run dev

# Open Cypress to run the test interactively
npm run cypress
```

### Command Line Execution
```bash
# Run the specific mortgage test
npm run cypress:run -- --spec "cypress/e2e/mortgage-calculator/mortgage-flow.cy.ts"

# Run with visible browser
npm run cypress:run -- --spec "cypress/e2e/mortgage-calculator/mortgage-flow.cy.ts" --headed
```

## 📋 What the Test Does

### Step 1: Navigate to Mortgage Calculator
- Opens http://localhost:5173/
- Clicks on: `#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div`
- This should open the mortgage calculation service

### Step 2: Fill All Form Fields
The test automatically fills:

**Text Inputs:**
- Price/Amount fields → `500000`
- Income fields → `15000`
- Name fields → `John Doe`
- Phone fields → `0501234567`
- Email fields → `test@example.com`
- Other text fields → `Test Value`

**Number Inputs:**
- Price/Amount → `500000`
- Income → `15000`
- Percentage/Rate → `3.5`
- Years → `25`
- Other numbers → `100`

**Dropdowns:**
- Selects the first available option in each dropdown

**Radio Buttons:**
- Selects the first option in each radio group

**Checkboxes:**
- Checks all required checkboxes

### Step 3: Navigate Through Steps
- Automatically clicks continue/next buttons
- Handles up to 10 steps in the flow
- Supports Hebrew (`המשך`, `חשב`) and English (`Continue`, `Next`, `Submit`, `Calculate`) buttons

### Step 4: Verify Completion
- Checks for result/calculation content
- Takes a screenshot of the final result

## 🔧 Custom Commands

The test uses custom Cypress commands for efficiency:

```typescript
// Fill all form fields automatically
cy.fillAllFormFields();

// Click continue/next button
cy.clickContinueButton();
```

## 🐛 Troubleshooting

### Common Issues

**Element not found:**
- Check if the selector `#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div` is correct
- Use browser developer tools to verify the correct selector

**Test fails on form fields:**
- The test handles various input types automatically
- Check browser console for JavaScript errors

**Continue button not found:**
- The test looks for multiple button variations
- Add custom button selectors if needed

### Debugging Steps

1. **Run in interactive mode:**
   ```bash
   npm run cypress
   ```
   
2. **Watch the test execute step by step**

3. **Check screenshots** in `/cypress/screenshots/` for failures

4. **Modify selectors** if the UI structure changed

## 📊 Test Results

### Success Indicators
- ✅ Homepage loads successfully
- ✅ Mortgage calculator opens
- ✅ All form fields are filled
- ✅ Navigation through all steps
- ✅ Final results page displays

### Failure Scenarios
- ❌ Wrong selector for mortgage calculator button
- ❌ Form validation prevents progression
- ❌ API errors during form submission
- ❌ Missing required fields

## 🔄 Customizing the Test

### Adding Specific Field Values
Edit the test to target specific form fields:

```typescript
// Target specific field by name
cy.get('input[name="propertyPrice"]').type('750000');
cy.get('input[name="monthlyIncome"]').type('20000');
```

### Adding New Button Types
Add new continue button selectors:

```typescript
const continueButtons = [
  'button:contains("המשך")',
  'button:contains("Continue")',
  '.your-custom-button-class'  // Add custom selector
];
```

### Handling Special Form Elements
```typescript
// Custom dropdown handling
cy.get('.react-select').click();
cy.get('.react-select__option').first().click();

// Date picker handling
cy.get('.date-picker').click();
cy.get('.date-picker__day--today').click();
```

## 📁 File Locations

- **Test File:** `/cypress/e2e/mortgage-calculator/mortgage-flow.cy.ts`
- **Custom Commands:** `/cypress/support/commands.ts`
- **Screenshots:** `/cypress/screenshots/`
- **Videos:** `/cypress/videos/`

## 🎯 Next Steps

1. **Run the test** to see the current behavior
2. **Adjust selectors** if elements are not found
3. **Add specific validations** for your mortgage calculator
4. **Extend the test** to cover more scenarios
5. **Add assertions** for calculated results