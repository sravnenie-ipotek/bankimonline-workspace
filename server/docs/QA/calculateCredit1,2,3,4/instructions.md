# <� BULLETPROOF CREDIT CALCULATOR TESTING INSTRUCTIONS
**Generated:** August 15, 2025  
**Target Application:** http://localhost:5173/services/calculate-credit/1,2,3,4  
**Confluence Specification:** https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/20414700/5.1.+  
**Testing Framework:** Cypress E2E + Playwright Cross-Browser + Figma Comparison  

---

## <� EXECUTIVE SUMMARY

This document provides comprehensive testing instructions for the **Calculate Credit** process (Steps 1-4) comparing live application behavior against documented specifications, Figma designs, and business logic requirements. The testing covers:

- **Confluence Business Specifications** with 22 specific action requirements
- **Figma Design System** comparison and visual validation  
- **Credit Amount & Income Logic** (DTI ratio, income validation, credit scoring)
- **Cross-Browser Compatibility** with screenshot comparison
- **Multi-Language Testing** including Hebrew RTL validation
- **Responsive Design** across 9 viewport matrix
- **Performance & Accessibility** compliance validation
- **State Management Deep Analysis** with Redux validation

---

## <� BUSINESS LOGIC REQUIREMENTS (FROM CONFLUENCE)

### Critical Credit Calculation Logic
Based on Confluence specification (5.1.  0AAG8B0BL :@548B), the credit calculator MUST implement these exact calculations:

```yaml
Credit Amount Validation:
  1. "Personal Credit":
     - Maximum Amount: �500,000
     - Minimum Amount: �10,000
     - DTI Ratio: d42% of monthly income
     - Term Range: 12-84 months
     
  2. "Renovation Credit":  
     - Maximum Amount: �300,000
     - Minimum Amount: �15,000
     - DTI Ratio: d35% of monthly income
     - Term Range: 24-120 months
     
  3. "Business Credit":
     - Maximum Amount: �1,000,000
     - Minimum Amount: �50,000
     - DTI Ratio: d38% of monthly income
     - Term Range: 12-180 months

Income Requirements:
  - Minimum Monthly Income: �8,000
  - Employment Period: e6 months current job
  - Credit Score: e650 (Bank of Israel rating)
  - Age Requirements: 21-70 years
```

### Confluence-Specified Actions (22 Requirements)
1. **Credit Type Selection** - Personal/Renovation/Business credit options
2. **Credit Amount Input** - Numeric validation with min/max limits
3. **Loan Term Selection** - Dropdown with credit-type specific ranges
4. **Interest Rate Display** - Dynamic rate based on credit type and amount
5. **Monthly Payment Calculation** - Real-time payment calculation display
6. **Income Validation** - Monthly income vs DTI ratio checking
7. **Employment Information** - Job type, employer, tenure validation
8. **Borrower Personal Data** - ID, name, address, contact details
9. **Bank Account Information** - Account details for fund transfer
10. **Co-borrower Option** - Add co-borrower with separate income validation
11. **Debt Information** - Existing credit obligations input
12. **DTI Ratio Calculation** - Debt-to-income ratio real-time display
13. **Credit Score Check** - Integration with credit bureau validation
14. **Document Upload** - Required documents based on credit type
15. **Bank Program Comparison** - Display available bank credit programs
16. **Program Selection Interface** - Allow user to select preferred program
17. **Application Review** - Summary of all entered data
18. **Terms & Conditions** - Legal agreements and disclosures
19. **Electronic Signature** - Digital signature for application
20. **Submission Process** - Final application submission to banks
21. **Confirmation Display** - Success confirmation with reference number
22. **Next Steps Information** - Timeline and expected bank responses

---

## <� FIGMA DESIGN VALIDATION REQUIREMENTS

### Step 1: Credit Type & Amount Parameters
**Figma Reference:** Credit Calculator Step 1 Design  
**Live URL:** http://localhost:5173/services/calculate-credit/1

#### Visual Components to Validate:
- **Progress Indicator:** 4-step progress bar showing Step 1 active
- **Credit Type Selection:** Radio buttons or dropdown (Personal/Renovation/Business)
- **Credit Amount Input:** Numeric input with � symbol, proper formatting
- **Amount Slider:** Interactive slider with dynamic min/max based on credit type
- **Loan Term Dropdown:** Term options specific to selected credit type
- **Interest Rate Display:** Calculated rate with percentage formatting
- **Monthly Payment Display:** Real-time calculated payment with emphasis styling
- **DTI Information:** Debt-to-income ratio explanation tooltip
- **Continue Button:** Prominent CTA button, properly styled

#### Design System Validation:
```css
/* Color Palette Verification */
Primary Blue: #0066CC
Secondary Gold: #FFD700
Success Green: #28A745
Warning Orange: #FF8C00
Error Red: #FF4444
Background: #FFFFFF
Text Primary: #333333
Text Secondary: #666666

/* Typography Verification */
Headings: Inter/Roboto Bold 24px/28px/32px
Body Text: Inter/Roboto Regular 16px
Labels: Inter/Roboto Medium 14px
Input Text: Inter/Roboto Regular 16px
Financial Numbers: Roboto Mono Bold 18px

/* Hebrew RTL Fonts */
Hebrew Headings: Arimo Bold 24px/28px/32px
Hebrew Body: Arimo Regular 16px
Hebrew Labels: Arimo Medium 14px
Hebrew Financial: Arimo Mono Bold 18px
```

### Step 2: Personal Information & Employment
**Figma Reference:** Credit Calculator Step 2 Design  
**Live URL:** http://localhost:5173/services/calculate-credit/2

#### Components to Validate:
- **Progress Indicator:** Step 2 active, Step 1 completed
- **Personal Details Form:** Name, ID, Date of Birth, Phone, Email
- **Employment Section:** Job type dropdown, employer name, position
- **Income Information:** Monthly income input with validation
- **Employment Duration:** Tenure at current job dropdown
- **Bank Account Details:** Account number, bank selection
- **Address Fields:** Comprehensive address form with city dropdown
- **Form Validation:** Real-time validation with error states
- **Back/Continue Navigation:** Consistent button styling

### Step 3: Financial Information & Co-borrower
**Figma Reference:** Credit Calculator Step 3 Design  
**Live URL:** http://localhost:5173/services/calculate-credit/3

#### Components to Validate:
- **Progress Indicator:** Step 3 active, Steps 1-2 completed
- **Monthly Income Details:** Salary, bonuses, additional income
- **Expense Information:** Monthly expenses, existing debt payments
- **DTI Calculation Display:** Real-time debt-to-income ratio
- **Co-borrower Toggle:** Option to add co-borrower
- **Co-borrower Form:** Complete personal and income data for co-borrower
- **Debt Information Table:** Existing credit obligations with details
- **Financial Summary:** Total income vs total obligations
- **Document Upload:** Required financial documents

### Step 4: Bank Programs & Application Finalization
**Figma Reference:** Credit Calculator Step 4 Design  
**Live URL:** http://localhost:5173/services/calculate-credit/4

#### Components to Validate:
- **Progress Indicator:** Step 4 active, all previous completed
- **Bank Programs Table:** Comparison table with multiple bank options
- **Program Details:** Interest rates, terms, fees, monthly payments
- **Selection Interface:** Radio buttons for program selection
- **Program Details Modal:** Detailed view of selected program
- **Application Summary:** Complete review of all entered information
- **Terms & Conditions:** Expandable legal text with checkbox
- **Electronic Signature:** Digital signature field
- **Submit Application:** Final submission CTA with loading state
- **Privacy Notice:** Data usage and sharing disclosures

---

## >� COMPREHENSIVE TEST EXECUTION PLAN

### Phase 0: CRITICAL CREDIT CALCULATION LOGIC VALIDATION =�

**PRIORITY**: This phase MUST be executed first to validate the foundation of the credit calculation system across all steps.

#### Architecture Integration
Based on `/server/docs/Architecture/dropDownLogicBankim.md` and credit-specific business logic, the credit calculator uses:
- **Credit Bureau Integration**: Real-time credit score checking
- **Bank Program Database**: Dynamic credit program loading from multiple banks
- **DTI Calculation Engine**: Real-time debt-to-income ratio calculations
- **Multi-Language Support**: Hebrew, English, Russian with financial terminology
- **Conditional Logic**: Credit type determines available amounts, terms, and rates

#### =� CRITICAL TESTING APPROACH: Credit-Specific vs Generic Form Testing

**MANDATORY UNDERSTANDING**: Credit applications have specific financial validation logic that differs from standard form testing. Tests must validate BOTH UI functionality AND financial calculations.

##### Common Testing Mistakes (What Causes Failures):
```typescript
// L WRONG: Testing form without financial logic validation
cy.get('[data-testid="amount"]').type('50000')  // � Missing DTI validation
cy.get('[data-testid="income"]').type('10000')  // � Missing credit score check
cy.get('button').click()  // � No calculation verification
```

##### Reality: What Credit Applications Actually Require:
- **Financial Calculations** that update in real-time
- **Credit Bureau Integration** for score validation
- **Bank Program Loading** with dynamic rate calculations
- **DTI Ratio Validation** preventing over-borrowing
- **Multi-Step Data Persistence** across navigation

##### =� BULLETPROOF CREDIT TESTING STRATEGY:
```typescript
//  COMPREHENSIVE: Test financial logic AND UI interactions
describe('Credit Calculation Logic Validation', () => {
  it('should validate DTI ratio in real-time', () => {
    // Set up test scenario
    const creditAmount = 200000;
    const monthlyIncome = 15000;
    const existingDebt = 3000;
    const expectedDTI = ((creditAmount / 60) + existingDebt) / monthlyIncome * 100;
    
    // Test credit amount input
    cy.get('[data-testid="credit-amount"]').type(creditAmount.toString());
    cy.get('[data-testid="monthly-income"]').type(monthlyIncome.toString());
    cy.get('[data-testid="existing-debt"]').type(existingDebt.toString());
    
    // Verify DTI calculation
    cy.get('[data-testid="dti-ratio"]')
      .should('contain', expectedDTI.toFixed(1) + '%');
    
    // Verify DTI limits enforcement
    if (expectedDTI > 42) {
      cy.get('[data-testid="dti-warning"]')
        .should('be.visible')
        .and('contain', 'DTI ratio exceeds maximum');
    }
  });
});
```

#### Test 0.1: Credit Type Logic Validation
```typescript
describe('Credit Type Business Logic', () => {
  const creditTypes = [
    {
      type: 'personal',
      maxAmount: 500000,
      minAmount: 10000,
      maxDTI: 42,
      termRange: [12, 84],
      baseRate: 8.5
    },
    {
      type: 'renovation', 
      maxAmount: 300000,
      minAmount: 15000,
      maxDTI: 35,
      termRange: [24, 120],
      baseRate: 7.2
    },
    {
      type: 'business',
      maxAmount: 1000000,
      minAmount: 50000,
      maxDTI: 38,
      termRange: [12, 180],
      baseRate: 9.8
    }
  ];

  creditTypes.forEach(credit => {
    it(`should enforce ${credit.type} credit limits and calculations`, () => {
      cy.visit('/services/calculate-credit/1');
      
      // Select credit type
      cy.get(`[data-testid="credit-type-${credit.type}"]`).click();
      
      // Test maximum amount enforcement
      cy.get('[data-testid="credit-amount"]')
        .type((credit.maxAmount + 1000).toString())
        .blur();
      
      cy.get('[data-testid="amount-error"]')
        .should('be.visible')
        .and('contain', `Maximum amount for ${credit.type} credit is �${credit.maxAmount.toLocaleString()}`);
      
      // Test minimum amount enforcement
      cy.get('[data-testid="credit-amount"]')
        .clear()
        .type((credit.minAmount - 1000).toString())
        .blur();
      
      cy.get('[data-testid="amount-error"]')
        .should('be.visible')
        .and('contain', `Minimum amount for ${credit.type} credit is �${credit.minAmount.toLocaleString()}`);
      
      // Test valid amount
      const validAmount = (credit.maxAmount + credit.minAmount) / 2;
      cy.get('[data-testid="credit-amount"]')
        .clear()
        .type(validAmount.toString())
        .blur();
      
      // Verify term options are correct for credit type
      cy.get('[data-testid="loan-term"]').click();
      cy.get('[data-testid="loan-term"] option')
        .first()
        .should('have.value', credit.termRange[0].toString());
      cy.get('[data-testid="loan-term"] option')
        .last()
        .should('have.value', credit.termRange[1].toString());
      
      // Test interest rate display
      cy.get('[data-testid="interest-rate"]')
        .should('contain', credit.baseRate + '%');
      
      cy.screenshot(`credit-${credit.type}-validation`);
    });
  });
});
```

#### Test 0.2: DTI Ratio Calculation Engine
```typescript
describe('>� THINK HARD: DTI Ratio Calculation Engine', () => {
  it('should calculate DTI ratio with complex scenarios', () => {
    cy.visit('/services/calculate-credit/1');
    
    // Complex scenario: Multiple income sources and existing debts
    const testScenario = {
      creditAmount: 250000,
      loanTerm: 60, // months
      primaryIncome: 18000,
      secondaryIncome: 3000,
      existingMortgage: 4500,
      existingCreditCard: 800,
      existingPersonalLoan: 1200,
      expectedNewPayment: null
    };
    
    // Calculate expected monthly payment for new credit
    const monthlyRate = 0.085 / 12; // 8.5% annual rate
    const numPayments = testScenario.loanTerm;
    testScenario.expectedNewPayment = 
      (testScenario.creditAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Calculate expected DTI
    const totalIncome = testScenario.primaryIncome + testScenario.secondaryIncome;
    const totalDebt = testScenario.existingMortgage + 
                     testScenario.existingCreditCard + 
                     testScenario.existingPersonalLoan + 
                     testScenario.expectedNewPayment;
    const expectedDTI = (totalDebt / totalIncome) * 100;
    
    // Input credit details
    cy.get('[data-testid="credit-type-personal"]').click();
    cy.get('[data-testid="credit-amount"]').type(testScenario.creditAmount.toString());
    cy.get('[data-testid="loan-term"]').select(testScenario.loanTerm.toString());
    
    // Navigate to income step
    cy.get('[data-testid="continue-button"]').click();
    cy.url().should('include', '/calculate-credit/2');
    
    // Input income information
    cy.get('[data-testid="primary-income"]').type(testScenario.primaryIncome.toString());
    cy.get('[data-testid="secondary-income"]').type(testScenario.secondaryIncome.toString());
    
    // Input existing debt information
    cy.get('[data-testid="existing-mortgage"]').type(testScenario.existingMortgage.toString());
    cy.get('[data-testid="existing-credit-card"]').type(testScenario.existingCreditCard.toString());
    cy.get('[data-testid="existing-personal-loan"]').type(testScenario.existingPersonalLoan.toString());
    
    // Verify monthly payment calculation
    cy.get('[data-testid="monthly-payment"]')
      .should('contain', testScenario.expectedNewPayment.toFixed(0));
    
    // Verify DTI calculation
    cy.get('[data-testid="dti-ratio"]')
      .should('contain', expectedDTI.toFixed(1) + '%');
    
    // Verify DTI status indication
    if (expectedDTI <= 42) {
      cy.get('[data-testid="dti-status"]')
        .should('have.class', 'acceptable')
        .and('contain', 'Within acceptable range');
    } else {
      cy.get('[data-testid="dti-status"]')
        .should('have.class', 'exceeds-limit')
        .and('contain', 'Exceeds maximum DTI ratio');
    }
    
    cy.screenshot('dti-calculation-complex-scenario');
  });
});
```

### Phase 1: Business Logic Validation Tests

#### Test 1.1: Credit Amount and Term Validation
```typescript
describe('Credit Amount and Term Business Logic', () => {
  const creditScenarios = [
    {
      type: 'personal',
      amount: 150000,
      term: 48,
      income: 20000,
      expectedPayment: 3800,
      shouldPass: true
    },
    {
      type: 'renovation',
      amount: 200000,
      term: 84,
      income: 15000,
      expectedPayment: 2850,
      shouldPass: true
    },
    {
      type: 'business',
      amount: 750000,
      term: 120,
      income: 45000,
      expectedPayment: 8950,
      shouldPass: true
    }
  ];

  creditScenarios.forEach(scenario => {
    it(`should validate ${scenario.type} credit calculation correctly`, () => {
      cy.visit('/services/calculate-credit/1');
      
      // Select credit type and input amount
      cy.get(`[data-testid="credit-type-${scenario.type}"]`).click();
      cy.get('[data-testid="credit-amount"]').type(scenario.amount.toString());
      cy.get('[data-testid="loan-term"]').select(scenario.term.toString());
      
      // Verify monthly payment calculation
      cy.get('[data-testid="monthly-payment"]')
        .should('contain', scenario.expectedPayment.toString());
      
      // Navigate and input income
      cy.get('[data-testid="continue-button"]').click();
      cy.get('[data-testid="monthly-income"]').type(scenario.income.toString());
      
      // Verify DTI calculation and approval status
      const dtiRatio = (scenario.expectedPayment / scenario.income) * 100;
      cy.get('[data-testid="dti-ratio"]')
        .should('contain', dtiRatio.toFixed(1) + '%');
      
      if (scenario.shouldPass) {
        cy.get('[data-testid="approval-status"]')
          .should('contain', 'Pre-approved')
          .and('have.class', 'approved');
      } else {
        cy.get('[data-testid="approval-status"]')
          .should('contain', 'Requires review')
          .and('have.class', 'review-required');
      }
      
      cy.screenshot(`credit-${scenario.type}-validation`);
    });
  });
});
```

#### Test 1.2: Income Validation and Employment Verification
```typescript
describe('Income and Employment Validation Logic', () => {
  it('should validate employment and income requirements', () => {
    cy.visit('/services/calculate-credit/2');
    
    // Test minimum income requirement
    const minimumIncome = 8000;
    cy.get('[data-testid="monthly-income"]').type((minimumIncome - 1000).toString());
    cy.get('[data-testid="income-error"]')
      .should('be.visible')
      .and('contain', `Minimum monthly income required: �${minimumIncome.toLocaleString()}`);
    
    // Test valid income
    cy.get('[data-testid="monthly-income"]')
      .clear()
      .type('15000');
    
    // Test employment duration requirement
    cy.get('[data-testid="employment-duration"]').select('3'); // 3 months
    cy.get('[data-testid="employment-error"]')
      .should('be.visible')
      .and('contain', 'Minimum employment period: 6 months');
    
    // Test valid employment duration
    cy.get('[data-testid="employment-duration"]').select('12'); // 12 months
    cy.get('[data-testid="employment-error"]').should('not.exist');
    
    // Test employment type validation
    cy.get('[data-testid="employment-type"]').select('employee');
    cy.get('[data-testid="employer-name"]')
      .should('be.visible')
      .and('have.attr', 'required');
    
    cy.get('[data-testid="employment-type"]').select('self-employed');
    cy.get('[data-testid="business-registration"]')
      .should('be.visible')
      .and('have.attr', 'required');
      
    cy.screenshot('employment-validation');
  });
});
```

### Phase 2: Multi-Language and RTL Testing

#### Test 2.1: Hebrew RTL Credit Interface
```typescript
describe('Hebrew RTL Credit Calculator Interface', () => {
  it('should display proper Hebrew financial terminology and RTL layout', () => {
    cy.visit('/services/calculate-credit/1');
    
    // Switch to Hebrew
    cy.get('[data-testid="language-selector"]').click();
    cy.get('[data-testid="language-he"]').click();
    
    // Verify Hebrew financial terms
    cy.get('[data-testid="credit-amount-label"]')
      .should('contain', '���� ������')
      .and('have.css', 'direction', 'rtl');
    
    cy.get('[data-testid="monthly-payment-label"]')
      .should('contain', '����� �����')
      .and('have.css', 'direction', 'rtl');
    
    cy.get('[data-testid="interest-rate-label"]')
      .should('contain', '����� �����')
      .and('have.css', 'direction', 'rtl');
    
    // Test RTL form layout
    cy.get('.form-container')
      .should('have.css', 'direction', 'rtl');
    
    // Test Hebrew credit type options
    cy.get('[data-testid="credit-type-personal"]')
      .should('contain', '����� ����');
    cy.get('[data-testid="credit-type-renovation"]')
      .should('contain', '����� ��������');
    cy.get('[data-testid="credit-type-business"]')
      .should('contain', '����� ����');
    
    // Verify Hebrew number formatting
    cy.get('[data-testid="credit-amount"]').type('150000');
    cy.get('[data-testid="amount-display"]')
      .should('contain', '�150,000')
      .and('have.css', 'direction', 'ltr'); // Numbers should be LTR even in RTL layout
      
    cy.screenshot('hebrew-rtl-interface');
  });
});
```

### Phase 3: Cross-Browser Compatibility Testing

#### Test 3.1: Playwright Cross-Browser Credit Calculations
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/credit-calculator',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } }
  ]
});

// tests/credit-calculator/cross-browser.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Credit Calculator Cross-Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`Credit calculation should work correctly in ${browserName}`, async ({ page, browserName: browser }) => {
      if (browser !== browserName) return;
      
      await page.goto('http://localhost:5173/services/calculate-credit/1');
      
      // Test credit calculation across all browsers
      await page.selectOption('[data-testid="credit-type"]', 'personal');
      await page.fill('[data-testid="credit-amount"]', '200000');
      await page.selectOption('[data-testid="loan-term"]', '60');
      
      // Verify calculation consistency across browsers
      const monthlyPayment = await page.textContent('[data-testid="monthly-payment"]');
      expect(monthlyPayment).toContain('�4,');
      
      // Take browser-specific screenshot
      await page.screenshot({ 
        path: `screenshots/${browserName}/credit-step1-calculation.png`,
        fullPage: true
      });
      
      // Test form navigation
      await page.click('[data-testid="continue-button"]');
      await expect(page).toHaveURL(/.*calculate-credit\/2/);
      
      // Test mobile responsiveness
      if (browserName === 'chromium') {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ 
          path: `screenshots/${browserName}/credit-mobile-step2.png`,
          fullPage: true
        });
      }
    });
  });
});
```

### Phase 4: Performance and Accessibility Testing

#### Test 4.1: Credit Calculator Performance Metrics
```typescript
describe('Credit Calculator Performance Testing', () => {
  it('should meet performance benchmarks for financial calculations', () => {
    cy.visit('/services/calculate-credit/1', {
      onBeforeLoad: (win) => {
        win.performance.mark('credit-start');
      }
    });
    
    // Test calculation speed
    cy.get('[data-testid="credit-amount"]').type('250000');
    cy.get('[data-testid="loan-term"]').select('72');
    
    // Verify calculation completes within performance budget
    cy.window().then((win) => {
      win.performance.mark('calculation-complete');
      win.performance.measure('calculation-time', 'credit-start', 'calculation-complete');
      
      const measure = win.performance.getEntriesByName('calculation-time')[0];
      expect(measure.duration).to.be.lessThan(500); // 500ms budget
    });
    
    // Test form submission performance
    cy.get('[data-testid="continue-button"]').click();
    cy.url().should('include', '/calculate-credit/2');
    
    // Verify page transition speed
    cy.window().then((win) => {
      const navigationEntries = win.performance.getEntriesByType('navigation');
      const loadTime = navigationEntries[0].loadEventEnd - navigationEntries[0].loadEventStart;
      expect(loadTime).to.be.lessThan(2000); // 2s budget
    });
  });
});
```

### Phase 5: Accessibility Compliance Testing

#### Test 5.1: Credit Form Accessibility Validation
```typescript
describe('Credit Calculator Accessibility Compliance', () => {
  it('should meet WCAG 2.1 AA standards for financial forms', () => {
    cy.visit('/services/calculate-credit/1');
    cy.injectAxe();
    
    // Test keyboard navigation
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-testid', 'credit-type-personal');
    
    cy.tab();
    cy.focused().should('have.attr', 'data-testid', 'credit-amount');
    
    // Test screen reader support
    cy.get('[data-testid="credit-amount"]')
      .should('have.attr', 'aria-label')
      .and('contain', 'Credit amount in Israeli Shekels');
    
    cy.get('[data-testid="monthly-payment"]')
      .should('have.attr', 'aria-live', 'polite')
      .and('have.attr', 'aria-label', 'Calculated monthly payment');
    
    // Test color contrast
    cy.checkA11y('[data-testid="dti-ratio"]', {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
    
    // Test error message accessibility
    cy.get('[data-testid="credit-amount"]').type('5000000'); // Exceeds maximum
    cy.get('[data-testid="amount-error"]')
      .should('have.attr', 'role', 'alert')
      .and('have.attr', 'aria-live', 'assertive');
  });
});
```

### Phase 6: Advanced State Management Validation (THINK HARD ANALYSIS)

**>� CRITICAL STATE MANAGEMENT VALIDATION**: This phase implements ultra-deep state management testing with "think hard" level analysis to ensure bulletproof data integrity, persistence, and synchronization across the entire credit calculator application.

#### =, State Architecture Analysis Framework

**Redux Store Architecture Validation**:
- **calculateCreditSlice**: Primary credit calculation state
- **borrowersSlice**: Borrower personal information state  
- **borrowersPersonalDataSlice**: Extended borrower details state
- **creditApplicationSlice**: Application-specific state
- **bankProgramsSlice**: Available bank programs state
- **dtiCalculationSlice**: Debt-to-income ratio calculation state
- **employmentSlice**: Employment and income data state
- **modalSlice**: UI modal state management
- **activeField**: Current form field focus state
- **languageSlice**: Internationalization state
- **authSlice**: Authentication state

#### Test 6.1: Redux State Integrity and Credit Persistence Validation
```typescript
describe('>� THINK HARD: Credit Redux State Management Deep Analysis', () => {
  
  it('should maintain credit state integrity across all calculator steps', () => {
    cy.visit('/services/calculate-credit/1');
    
    // = DEEP CREDIT STATE INSPECTION: Validate initial state structure
    cy.window().its('store').invoke('getState').then((state) => {
      // CRITICAL: Verify all required credit slices exist and are properly initialized
      const requiredCreditSlices = [
        'calculateCredit',
        'creditApplication',
        'bankPrograms',
        'dtiCalculation',
        'employment',
        'borrowers', 
        'modal',
        'activeField',
        'language',
        'auth'
      ];
      
      requiredCreditSlices.forEach(slice => {
        expect(state).to.have.property(slice, `Credit Redux slice ${slice} must exist`);
        expect(state[slice]).to.not.be.undefined;
        cy.log(` Credit Redux slice verified: ${slice}`);
      });
      
      // CRITICAL: Validate initial credit state values are not corrupted
      expect(state.calculateCredit.currentStep).to.equal(1);
      expect(state.creditApplication.type).to.be.oneOf(['personal', 'renovation', 'business', null]);
      expect(state.dtiCalculation.ratio).to.be.a('number');
      expect(state.language.currentLanguage).to.be.oneOf(['en', 'he', 'ru']);
      
      cy.log(`>� Initial Credit Redux state validated: ${Object.keys(state).length} slices`);
    });
    
    // <� CREDIT STEP 1: Test credit calculation state changes and persistence
    cy.get('[data-testid="credit-type-personal"]').click();
    cy.get('[data-testid="credit-amount"]').type('250000');
    cy.get('[data-testid="loan-term"]').select('60');
    
    // CRITICAL: Verify credit state updates immediately reflect in Redux store
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateCredit.type).to.equal('personal');
      expect(state.calculateCredit.amount).to.equal(250000);
      expect(state.calculateCredit.term).to.equal(60);
      expect(state.calculateCredit.monthlyPayment).to.be.greaterThan(0);
      
      cy.log(` Credit Step 1 state changes validated in Redux store`);
    });
    
    // = CRITICAL: Test state persistence across navigation
    cy.get('[data-testid="continue-button"]').click();
    cy.url().should('include', '/calculate-credit/2');
    
    // Verify state persisted after navigation
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateCredit.type).to.equal('personal');
      expect(state.calculateCredit.amount).to.equal(250000);
      expect(state.calculateCredit.term).to.equal(60);
      
      cy.log(`= Credit state persistence verified across navigation`);
    });
    
    // <� CREDIT STEP 2: Test employment and income state management
    cy.get('[data-testid="monthly-income"]').type('18000');
    cy.get('[data-testid="employment-type"]').select('employee');
    cy.get('[data-testid="employment-duration"]').select('24');
    
    // CRITICAL: Verify employment state updates and DTI calculation
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.employment.monthlyIncome).to.equal(18000);
      expect(state.employment.type).to.equal('employee');
      expect(state.employment.duration).to.equal(24);
      
      // Verify DTI calculation state
      const expectedDTI = (state.calculateCredit.monthlyPayment / 18000) * 100;
      expect(state.dtiCalculation.ratio).to.be.closeTo(expectedDTI, 0.1);
      expect(state.dtiCalculation.status).to.be.oneOf(['acceptable', 'warning', 'exceeds']);
      
      cy.log(` Employment and DTI state validated`);
    });
  });
  
  it('should handle complex credit state scenarios with race conditions', () => {
    cy.visit('/services/calculate-credit/1');
    
    // <�B RACE CONDITION TESTING: Rapid user interactions
    cy.get('[data-testid="credit-amount"]').type('100000');
    cy.get('[data-testid="loan-term"]').select('36');
    cy.get('[data-testid="credit-amount"]').clear().type('200000');
    cy.get('[data-testid="loan-term"]').select('72');
    cy.get('[data-testid="credit-amount"]').clear().type('150000');
    
    // Wait for state to stabilize
    cy.wait(500);
    
    // Verify final state is correct despite rapid changes
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateCredit.amount).to.equal(150000);
      expect(state.calculateCredit.term).to.equal(72);
      
      // Verify monthly payment was recalculated correctly
      const monthlyRate = 0.085 / 12; // 8.5% annual rate
      const numPayments = 72;
      const expectedPayment = (150000 * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                             (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      expect(state.calculateCredit.monthlyPayment).to.be.closeTo(expectedPayment, 10);
      
      cy.log(`<�B Race condition handling verified: Final amount ${state.calculateCredit.amount}`);
    });
  });
  
  it('should maintain state integrity during browser refresh and localStorage persistence', () => {
    cy.visit('/services/calculate-credit/1');
    
    // Fill out complete credit application
    cy.get('[data-testid="credit-type-business"]').click();
    cy.get('[data-testid="credit-amount"]').type('500000');
    cy.get('[data-testid="loan-term"]').select('120');
    
    cy.get('[data-testid="continue-button"]').click();
    cy.get('[data-testid="monthly-income"]').type('35000');
    cy.get('[data-testid="employment-type"]').select('self-employed');
    
    // =� Verify localStorage persistence
    cy.window().then((win) => {
      const persistedState = JSON.parse(win.localStorage.getItem('redux-persist-root') || '{}');
      expect(persistedState.calculateCredit?.amount).to.equal(500000);
      expect(persistedState.employment?.monthlyIncome).to.equal(35000);
      
      cy.log(`=� State persisted to localStorage successfully`);
    });
    
    // = Test browser refresh state recovery
    cy.reload();
    
    // Verify state recovered from localStorage
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateCredit.amount).to.equal(500000);
      expect(state.calculateCredit.type).to.equal('business');
      expect(state.employment.monthlyIncome).to.equal(35000);
      
      cy.log(`= State successfully recovered after browser refresh`);
    });
  });
});
```

#### Test 6.2: Credit Form State Management Deep Analysis
```typescript
describe('>� THINK HARD: Credit Form State Management Deep Analysis', () => {
  
  it('should manage complex form state with conditional fields and validation', () => {
    cy.visit('/services/calculate-credit/2');
    
    // Test conditional field state management
    cy.get('[data-testid="employment-type"]').select('employee');
    
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.employment.conditionalFields).to.include('employerName');
      expect(state.employment.conditionalFields).to.include('position');
      expect(state.employment.conditionalFields).to.not.include('businessRegistration');
    });
    
    // Switch to self-employed and verify state changes
    cy.get('[data-testid="employment-type"]').select('self-employed');
    
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.employment.conditionalFields).to.include('businessRegistration');
      expect(state.employment.conditionalFields).to.include('businessType');
      expect(state.employment.conditionalFields).to.not.include('employerName');
    });
    
    // Test form validation state integration
    cy.get('[data-testid="monthly-income"]').type('5000'); // Below minimum
    
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.employment.validationErrors).to.have.property('monthlyIncome');
      expect(state.employment.isValid).to.be.false;
      expect(state.calculateCredit.canProceed).to.be.false;
    });
  });
});
```

#### Test 6.3: Credit API State Synchronization Deep Analysis
```typescript
describe('>� THINK HARD: Credit API State Synchronization Deep Analysis', () => {
  
  it('should synchronize state with bank programs API and handle loading states', () => {
    // Mock API responses for testing
    cy.intercept('GET', '/api/v1/bank-programs?creditType=personal', {
      fixture: 'bank-programs-personal.json'
    }).as('getBankPrograms');
    
    cy.visit('/services/calculate-credit/4');
    
    // Verify loading state management
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.bankPrograms.loading).to.be.true;
      expect(state.bankPrograms.programs).to.be.an('array').that.is.empty;
    });
    
    cy.wait('@getBankPrograms');
    
    // Verify state updated with API data
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.bankPrograms.loading).to.be.false;
      expect(state.bankPrograms.programs).to.have.length.greaterThan(0);
      expect(state.bankPrograms.error).to.be.null;
      
      // Verify each program has required fields
      state.bankPrograms.programs.forEach(program => {
        expect(program).to.have.property('bankName');
        expect(program).to.have.property('interestRate');
        expect(program).to.have.property('monthlyPayment');
        expect(program).to.have.property('totalCost');
      });
    });
  });
});
```

#### Test 6.4: Credit Cross-Component State Communication
```typescript
describe('>� THINK HARD: Credit Cross-Component State Communication', () => {
  
  it('should maintain state consistency across all credit calculator components', () => {
    cy.visit('/services/calculate-credit/1');
    
    // Test state communication between amount input and payment display
    cy.get('[data-testid="credit-amount"]').type('300000');
    cy.get('[data-testid="loan-term"]').select('84');
    
    // Verify immediate state propagation to all connected components
    cy.get('[data-testid="monthly-payment"]').should('contain', '�');
    cy.get('[data-testid="total-interest"]').should('contain', '�');
    cy.get('[data-testid="total-cost"]').should('contain', '�');
    
    // Navigate to step 2 and verify state carried forward
    cy.get('[data-testid="continue-button"]').click();
    
    // Verify credit summary shows correct values from step 1
    cy.get('[data-testid="credit-summary-amount"]').should('contain', '�300,000');
    cy.get('[data-testid="credit-summary-term"]').should('contain', '84');
    
    // Add income and verify DTI calculation updates
    cy.get('[data-testid="monthly-income"]').type('20000');
    
    // Verify DTI calculation reflects across all components
    cy.get('[data-testid="dti-percentage"]').should('be.visible');
    cy.get('[data-testid="dti-status-indicator"]').should('be.visible');
    cy.get('[data-testid="affordability-meter"]').should('be.visible');
    
    // Navigate to step 3 and verify comprehensive state retention
    cy.get('[data-testid="continue-button"]').click();
    
    // Verify all previous data is correctly displayed
    cy.get('[data-testid="application-summary"]').should('contain', '�300,000');
    cy.get('[data-testid="application-summary"]').should('contain', '84 months');
    cy.get('[data-testid="application-summary"]').should('contain', '�20,000');
  });
});
```

---

## =' EXECUTION INSTRUCTIONS

### Setup Requirements

#### 1. Development Environment
```bash
# Ensure API server is running on port 8003
node server/server-db.js

# Ensure frontend development server is running on port 5173
cd mainapp && npm run dev

# Start QA server for screenshot serving
npm run qa:server
```

#### 2. Test Data Setup
```bash
# Prepare test database with credit programs
node scripts/setup-credit-test-data.js

# Verify API endpoints
curl http://localhost:8003/api/v1/bank-programs?creditType=personal
curl http://localhost:8003/api/v1/credit-parameters
```

#### 3. Screenshot Configuration
```bash
# Ensure screenshots directory exists
mkdir -p mainapp/cypress/screenshots/credit-calculator

# Generate credit calculator reports
npm run qa:generate-credit

# View reports with working screenshots
open http://localhost:3002/reports
```

### Execution Order

1. **Phase 0**: Critical Credit Logic Validation (MANDATORY FIRST)
2. **Phase 1**: Business Logic Validation Tests
3. **Phase 2**: Multi-Language and RTL Testing
4. **Phase 3**: Cross-Browser Compatibility Testing
5. **Phase 4**: Performance and Accessibility Testing
6. **Phase 5**: State Management Deep Analysis

### Expected Results

- **100% Credit Logic Validation**: All financial calculations must be mathematically correct
- **DTI Ratio Compliance**: All scenarios must respect maximum DTI ratios by credit type
- **Multi-Language Support**: Hebrew RTL interface must display properly with financial terminology
- **Cross-Browser Compatibility**: Consistent behavior across Chrome, Firefox, Safari
- **Performance Standards**: <500ms calculation time, <2s page load
- **Accessibility Compliance**: WCAG 2.1 AA standards for financial forms
- **State Management Integrity**: Redux state must persist correctly across all interactions

---

## =� SUCCESS CRITERIA

### Functional Requirements
-  All credit calculations mathematically accurate
-  DTI ratios enforced per credit type
-  Income and employment validation working
-  Bank program integration functional
-  Multi-step form data persistence

### Technical Requirements  
-  Hebrew RTL interface properly rendered
-  Cross-browser compatibility confirmed
-  Mobile responsiveness validated
-  Performance benchmarks met
-  Accessibility standards compliant

### Quality Assurance
-  State management integrity verified
-  Error handling comprehensive
-  Edge cases covered
-  Security validation passed
-  Documentation complete

---

**<� CRITICAL SUCCESS INDICATOR**: Credit calculator must demonstrate production-ready quality with bulletproof financial calculations, comprehensive state management, and flawless user experience across all supported platforms and languages.## 🧪 COMPREHENSIVE EDGE CASE TESTING - EXTREME SCENARIOS & BOUNDARY CONDITIONS

### 🎯 THINK HARD: Critical Edge Case Analysis Framework

**MISSION:** Implement systematic testing of extreme scenarios that stress-test system boundaries, expose calculation flaws, and validate resilience under abnormal conditions.

#### 🔬 Edge Case Testing Philosophy

Edge cases reveal system weaknesses that normal testing misses. Financial applications must handle:
- **Mathematical Extremes**: Maximum/minimum values that break calculations
- **Input Combinations**: Unexpected parameter combinations that cause logic conflicts
- **Boundary Conditions**: Values at the exact limits of acceptable ranges
- **Cultural Variations**: Region-specific financial practices and constraints
- **System Stress**: High-load scenarios and resource exhaustion conditions

---

### 📊 FINANCIAL CALCULATION EDGE CASES

#### Extreme Value Testing Matrix

```typescript
// CREDIT CALCULATOR EXTREME SCENARIOS
const creditEdgeCases = {
  extremeAmounts: {
    minimum: 1, // Single shekel
    maximum: 99999999, // Beyond system limits
    boundary: [999, 1000, 49999, 50000, 999999, 1000000], // Around thresholds
    invalid: [-1000, 0, "not_a_number", Infinity, NaN]
  },
  
  extremeIncome: {
    minimum: 1, // Minimal income
    maximum: 50000000, // Ultra-high earners
    unemployed: 0, // No income scenarios
    inconsistent: [1000, 0, 5000, 0], // Irregular income patterns
    multipleSources: ["salary + freelance + investments + rental"] // Complex income
  },
  
  extremeDTI: {
    perfect: 0, // No existing debt
    boundary: [34.9, 35.0, 35.1, 41.9, 42.0, 42.1], // Around DTI limits
    extreme: [99, 150, 500], // Impossible DTI ratios
    calculation: "Include ALL debt types: credit cards, loans, alimony, etc."
  }
};

// MORTGAGE CALCULATOR EXTREME SCENARIOS  
const mortgageEdgeCases = {
  propertyValues: {
    minimum: 50000, // Lowest possible property
    maximum: 100000000, // Ultra-luxury properties
    boundary: [199999, 200000, 999999, 1000000], // Around tax/regulation thresholds
    invalid: [-500000, 0, "expensive", null]
  },
  
  downPayments: {
    zeroDown: 0, // No down payment scenarios
    fullCash: "100% property value", // Cash purchase
    overPayment: "110% property value", // More than property value
    negativeEquity: "Owing more than property worth"
  },
  
  ltvScenarios: {
    noProperty: [74.9, 75.0, 75.1], // Around 75% LTV limit
    hasProperty: [49.9, 50.0, 50.1], // Around 50% LTV limit  
    sellingProperty: [69.9, 70.0, 70.1], // Around 70% LTV limit
    invalid: [-10, 0, 100, 150] // Invalid LTV values
  }
};

// REFINANCE MORTGAGE EXTREME SCENARIOS
const refinanceEdgeCases = {
  existingLoans: {
    newLoan: "Just originated (0-6 months)", // Too new to refinance
    almostPaidOff: "2-3 months remaining", // Almost complete
    underwater: "Loan balance > property value", // Negative equity
    multipleLoans: "First + second mortgage + HELOC" // Complex debt structure
  },
  
  rateScenarios: {
    massiveImprovement: "Current: 8%, New: 2%", // Unlikely improvement
    marginalImprovement: "Current: 5.1%, New: 5.0%", // Tiny improvement
    rateIncrease: "Current: 3%, New: 6%", // Rising rates
    identicalRates: "Current rate = New rate" // No improvement
  },
  
  breakEvenAnalysis: {
    immediateBreakEven: "Savings > closing costs (Month 1)",
    neverBreakEven: "Closing costs > total potential savings",
    extremelyLongBreakEven: "Break-even in 30+ years",
    negativeBreakEven: "Costs exceed any possible savings"
  }
};
```

#### 🚨 Critical System Stress Tests

```typescript
const systemStressTests = {
  concurrentUsers: {
    scenario: "100+ users calculating simultaneously",
    validation: "Response time < 3 seconds, no calculation errors",
    tools: ["Artillery.js load testing", "Browser network throttling"]
  },
  
  memoryExhaustion: {
    scenario: "Large calculation datasets, complex amortization schedules",
    validation: "Graceful degradation, no browser crashes",
    tools: ["Chrome DevTools Memory tab", "Performance monitoring"]
  },
  
  networkFailures: {
    scenario: "API timeouts, partial responses, connection drops",
    validation: "Retry logic, error recovery, state preservation",
    tools: ["Network throttling", "API mocking with failures"]
  },
  
  browserCompatibility: {
    scenario: "Legacy browsers (IE11, old Safari), JavaScript disabled",
    validation: "Graceful fallbacks, accessibility maintained",
    tools: ["BrowserStack", "Progressive enhancement testing"]
  }
};
```

---

### 🔍 INPUT VALIDATION EXTREME TESTING

#### Malicious Input Protection

```typescript
const securityEdgeCases = {
  sqlInjection: [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "UNION SELECT * FROM credit_applications"
  ],
  
  xssAttempts: [
    "<script>alert('XSS')</script>",
    "javascript:alert('XSS')",
    "<img src=x onerror=alert('XSS')>"
  ],
  
  oversizedInputs: [
    "A".repeat(10000), // 10KB string
    "1".repeat(100), // 100-digit number
    new Array(1000).fill("test").join(",") // Massive array
  ],
  
  unicodeEdgeCases: [
    "🏠💰₪💸", // Emoji in financial inputs
    "١٢٣٤٥", // Arabic numerals  
    "Ⅰ Ⅱ Ⅲ Ⅳ", // Roman numerals
    "𝟏𝟐𝟑𝟒𝟓" // Mathematical alphanumeric symbols
  ]
};
```

#### 🧮 Mathematical Edge Cases

```typescript
const mathematicalEdgeCases = {
  floatingPointPrecision: {
    issue: "0.1 + 0.2 !== 0.3 in JavaScript",
    tests: [
      { input: [999999.99, 0.01], expected: 1000000.00 },
      { input: [1000000, 0.001], expected: 1000000.00 }, // Rounding
      { input: [999.999], expected: "How many decimal places?" }
    ]
  },
  
  divisionByZero: {
    scenarios: [
      "Monthly payment calculation with 0% interest",
      "DTI calculation with $0 income", 
      "LTV calculation with $0 property value"
    ]
  },
  
  infiniteLoops: {
    scenarios: [
      "Amortization schedule with negative payment",
      "Break-even calculation that never breaks even",
      "Interest-only loans with calculation errors"
    ]
  },
  
  numberOverflow: {
    tests: [
      "Number.MAX_SAFE_INTEGER calculations",
      "Exponential notation handling",
      "BigInt vs Number precision"
    ]
  }
};
```

---

### 🎭 USER BEHAVIOR EDGE CASES

#### Unusual Usage Patterns

```typescript
const behavioralEdgeCases = {
  rapidFormSubmission: {
    scenario: "User submits form 50+ times rapidly",
    validation: "Rate limiting, duplicate prevention, performance"
  },
  
  browserBackButton: {
    scenario: "Complex navigation: Step 4 → Back → Step 1 → Forward",
    validation: "State preservation, form data integrity"
  },
  
  tabSwitching: {
    scenario: "Multiple calculator tabs open simultaneously",
    validation: "Independent state, no cross-contamination"
  },
  
  sessionTimeout: {
    scenario: "User leaves form open for 8+ hours, returns",
    validation: "Session handling, data preservation vs security"
  },
  
  mobileInterruptions: {
    scenario: "Phone calls, app switching, screen rotation mid-calculation",
    validation: "State preservation, responsive recalculation"
  }
};
```

#### 🌐 Browser Environment Edge Cases

```typescript
const environmentEdgeCases = {
  javascriptDisabled: {
    test: "Turn off JavaScript completely",
    expectation: "Graceful degradation with server-side validation"
  },
  
  cookiesDisabled: {
    test: "Block all cookies and localStorage",
    expectation: "Functional calculator without persistence"
  },
  
  adBlockers: {
    test: "uBlock Origin, AdBlock Plus active",
    expectation: "No interference with financial calculations"
  },
  
  privacyMode: {
    test: "Incognito/Private browsing mode",
    expectation: "Full functionality, no persistence errors"
  },
  
  lowBandwidth: {
    test: "2G network simulation",
    expectation: "Progressive loading, offline-first approach"
  }
};
```

---

### 🔧 IMPLEMENTATION STRATEGY

#### Test Execution Framework

```typescript
// Comprehensive edge case test suite
describe('🧪 EDGE CASE VALIDATION SUITE', () => {
  
  beforeEach(() => {
    // Reset application state
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/services/calculate-credit/1');
  });

  describe('💥 EXTREME VALUE TESTING', () => {
    
    it('should handle maximum credit amount boundary', () => {
      // Test credit amount at system maximum
      cy.get('[data-testid="credit-amount"]').type('999999999');
      cy.get('[data-testid="continue-btn"]').click();
      
      // Validate error handling or graceful degradation
      cy.get('[data-testid="error-message"]')
        .should('contain', 'Maximum credit amount exceeded')
        .and('be.visible');
    });
    
    it('should handle DTI ratio edge cases', () => {
      const edgeDTIValues = [34.9, 35.0, 35.1, 41.9, 42.0, 42.1];
      
      edgeDTIValues.forEach(dtiValue => {
        // Calculate required income for specific DTI
        const monthlyPayment = 5000;
        const requiredIncome = monthlyPayment / (dtiValue / 100);
        
        cy.get('[data-testid="monthly-income"]').clear().type(requiredIncome.toString());
        cy.get('[data-testid="existing-debt"]').clear().type('0');
        cy.get('[data-testid="credit-amount"]').clear().type('300000');
        
        // Validate DTI calculation and approval logic
        cy.get('[data-testid="dti-ratio"]').should('contain', dtiValue.toString());
        
        if (dtiValue <= 35) {
          cy.get('[data-testid="approval-status"]').should('contain', 'Pre-approved');
        } else if (dtiValue <= 42) {
          cy.get('[data-testid="approval-status"]').should('contain', 'Review required');
        } else {
          cy.get('[data-testid="approval-status"]').should('contain', 'Not eligible');
        }
      });
    });
  });

  describe('🛡️ SECURITY EDGE CASES', () => {
    
    it('should sanitize malicious input attempts', () => {
      const maliciousInputs = [
        "<script>alert('XSS')</script>",
        "'; DROP TABLE applications; --",
        "javascript:alert('hack')"
      ];
      
      maliciousInputs.forEach(maliciousInput => {
        cy.get('[data-testid="credit-amount"]').clear().type(maliciousInput);
        cy.get('[data-testid="continue-btn"]').click();
        
        // Validate input sanitization
        cy.get('body').should('not.contain', 'XSS');
        cy.get('[data-testid="error-message"]')
          .should('contain', 'Invalid input format');
      });
    });
  });

  describe('⚡ PERFORMANCE EDGE CASES', () => {
    
    it('should handle rapid form submissions', () => {
      // Fill form with valid data
      cy.get('[data-testid="credit-amount"]').type('100000');
      
      // Rapidly submit form multiple times
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="continue-btn"]').click();
        cy.wait(100);
      }
      
      // Validate no duplicate submissions or errors
      cy.get('[data-testid="step-indicator"]').should('contain', 'Step 2');
      cy.get('[data-testid="error-message"]').should('not.exist');
    });
  });
});
```

#### 📊 Edge Case Reporting

```typescript
const edgeCaseReporting = {
  testCategories: [
    'Extreme Values',
    'Boundary Conditions', 
    'Input Validation',
    'System Stress',
    'Security Tests',
    'Performance Tests',
    'Browser Compatibility',
    'User Behavior'
  ],
  
  reportingMetrics: [
    'Pass/Fail Rate per Category',
    'Critical vs Non-Critical Failures',
    'Performance Impact Analysis',
    'Browser-Specific Issues',
    'Accessibility Impact Assessment'
  ],
  
  priorityMatrix: {
    P0: 'Critical failures that prevent core functionality',
    P1: 'Major issues affecting user experience',
    P2: 'Minor issues with workarounds available',
    P3: 'Enhancement opportunities'
  }
};
```

---

### 🎯 SUCCESS CRITERIA

#### Edge Case Coverage Goals

- **100% Boundary Condition Testing**: Every input field tested at min/max values
- **95+ Security Test Coverage**: All common attack vectors validated
- **Performance Baseline Maintained**: <3s response time under stress
- **Cross-Browser Consistency**: Identical behavior across all supported browsers
- **Accessibility Preservation**: WCAG compliance maintained under edge conditions
- **Error Recovery Validation**: Graceful handling of all failure scenarios

#### 📋 Edge Case Checklist

- [ ] **Extreme Value Testing**: Min/max/boundary value validation
- [ ] **Input Sanitization**: XSS, SQL injection, malicious input protection  
- [ ] **Mathematical Precision**: Floating point, division by zero, overflow handling
- [ ] **Performance Stress**: Concurrent users, memory exhaustion, network failures
- [ ] **Browser Edge Cases**: JavaScript disabled, cookies blocked, ad blockers
- [ ] **User Behavior**: Rapid clicks, navigation patterns, session management
- [ ] **Security Validation**: Authentication bypass, data exposure, CSRF protection
- [ ] **Accessibility Edge**: Screen readers with complex forms, keyboard-only navigation

**REMEMBER**: Edge cases are where real-world applications fail. Comprehensive edge case testing separates enterprise-grade financial software from basic web forms.
## 🌍 COMPREHENSIVE MULTILINGUAL TESTING - HEBREW/RUSSIAN/ENGLISH WITH CULTURAL CONSIDERATIONS

### 🎯 THINK HARD: Cross-Cultural Financial Interface Analysis

**MISSION:** Validate seamless multi-language experience with deep cultural understanding of financial terminology, behavioral patterns, and interface expectations across Hebrew (RTL), Russian (Cyrillic), and English (LTR) markets.

#### 🧠 Cultural Intelligence Framework

Financial applications must respect cultural nuances beyond simple translation:
- **Hebrew (עברית)**: Right-to-left reading, religious financial considerations, Israeli banking norms
- **Russian (Русский)**: Post-Soviet banking psychology, formal language patterns, Cyrillic typography
- **English**: International standard, multiple regional variants (US, UK, AU financial terms)

---

### 🔤 LANGUAGE-SPECIFIC FINANCIAL TERMINOLOGY VALIDATION

#### Hebrew Financial Language Testing (עברית - RTL)

```typescript
const hebrewFinancialTerms = {
  // Core Banking Terms
  bankingCore: {
    bank: "בנק",
    credit: "אשראי", 
    loan: "הלוואה",
    mortgage: "משכנתא",
    refinance: "מימון מחדש",
    interestRate: "שיעור ריבית",
    monthlyPayment: "תשלום חודשי",
    downPayment: "מקדמה",
    collateral: "בטוחה"
  },
  
  // Credit-Specific Terms
  creditTerms: {
    creditScore: "ניקוד אשראי",
    debtToIncomeRatio: "יחס חוב להכנסה", 
    creditLimit: "מסגרת אשראי",
    personalCredit: "אשראי אישי",
    businessCredit: "אשראי עסקי",
    creditHistory: "היסטוריית אשראי",
    guarantor: "ערב",
    creditCommittee: "ועדת אשראי"
  },
  
  // Mortgage-Specific Terms  
  mortgageTerms: {
    propertyValue: "שווי הנכס",
    loanToValue: "יחס הלוואה לשווי",
    fixedRate: "ריבית קבועה", 
    variableRate: "ריבית משתנה",
    primeRate: "ריבית בסיס",
    amortization: "פירעון הדרגתי",
    prepayment: "פרעון מוקדם",
    propertyTax: "ארנונה"
  },
  
  // UI Elements in Hebrew
  interfaceElements: {
    continue: "המשך",
    back: "חזור", 
    calculate: "חשב",
    submit: "שלח",
    save: "שמור",
    edit: "ערוך",
    cancel: "בטל",
    confirm: "אשר",
    required: "שדה חובה",
    optional: "אופציונלי"
  },
  
  // Validation Messages
  validationMessages: {
    required: "שדה זה הוא חובה",
    invalidFormat: "פורמט לא תקין",
    amountTooHigh: "הסכום גבוה מדי", 
    amountTooLow: "הסכום נמוך מדי",
    phoneInvalid: "מספר טלפון לא תקין",
    emailInvalid: "כתובת אימייל לא תקינה"
  }
};

// RTL Layout Testing Requirements
const hebrewRTLValidation = {
  layoutDirection: {
    htmlDir: 'dir="rtl"',
    cssDirection: 'direction: rtl',
    textAlign: 'text-align: right',
    floatDirection: 'float: right'
  },
  
  formElements: {
    inputAlignment: 'Text inputs right-aligned',
    labelPosition: 'Labels to the right of inputs',
    buttonPosition: 'Submit buttons on the left',
    checkboxAlignment: 'Checkboxes and radio buttons right-aligned'
  },
  
  navigationFlow: {
    breadcrumbs: 'Right to left navigation',
    stepIndicator: 'Progress flows right to left',
    tabOrder: 'Tab navigation follows RTL pattern',
    modalDirection: 'Modals open from right side'
  },
  
  numericalDisplay: {
    currencySymbol: '₪ 1,000.00 (shekel symbol placement)',
    percentages: '%35.5 (percentage after number)',
    dates: '15/08/2025 (DD/MM/YYYY format)',
    phoneNumbers: '050-123-4567 (Israeli format)'
  }
};
```

#### Russian Financial Language Testing (Русский - Cyrillic)

```typescript
const russianFinancialTerms = {
  // Banking Core Terms
  bankingCore: {
    bank: "банк",
    credit: "кредит",
    loan: "заём",
    mortgage: "ипотека", 
    refinance: "рефинансирование",
    interestRate: "процентная ставка",
    monthlyPayment: "ежемесячный платёж",
    downPayment: "первоначальный взнос",
    collateral: "залог"
  },
  
  // Financial Status Terms
  financialStatus: {
    income: "доходы",
    salary: "заработная плата",
    employment: "трудоустройство",
    unemployed: "безработный",
    pensioner: "пенсионер",
    entrepreneur: "предприниматель",
    creditHistory: "кредитная история",
    creditRating: "кредитный рейтинг"
  },
  
  // Formal vs Informal Address
  addressForms: {
    formal: {
      you: "Вы",
      yourName: "Ваше имя",
      yourIncome: "Ваш доход",
      pleaseEnter: "Пожалуйста, введите"
    },
    informal: {
      you: "ты", 
      yourName: "твоё имя",
      yourIncome: "твой доход",
      pleaseEnter: "введи"
    }
  },
  
  // Cultural Financial Concepts
  culturalConcepts: {
    blackSalary: "чёрная зарплата", // Undeclared income
    whiteSalary: "белая зарплата", // Officially declared income  
    matCapital: "материнский капитал", // Maternity capital program
    socialMortgage: "социальная ипотека", // Government housing program
    veteranBenefits: "льготы ветеранам", // Veteran financial benefits
  }
};

// Cyrillic Typography Considerations
const russianTypography = {
  fontRequirements: {
    cyrillicSupport: 'Full Cyrillic character set support',
    fontFallback: 'Fallback fonts for missing Cyrillic glyphs',
    readability: 'Optimized for Cyrillic reading patterns',
    webFonts: 'Roboto, Open Sans with Cyrillic subsets'
  },
  
  textFormatting: {
    capitalization: 'Proper Russian capitalization rules',
    punctuation: 'Russian punctuation marks (— vs -)',
    quotes: '«Russian quotes» vs "English quotes"',
    numbers: 'Space thousands separator: 1 000 000'
  }
};
```

#### English Financial Language Testing (Multi-Regional)

```typescript
const englishFinancialTerms = {
  // US Financial Terms
  usTerms: {
    zipCode: "Zip Code",
    socialSecurity: "Social Security Number", 
    fico: "FICO Score",
    apr: "APR (Annual Percentage Rate)",
    hoa: "HOA (Homeowners Association)",
    pmi: "PMI (Private Mortgage Insurance)",
    heloc: "HELOC (Home Equity Line of Credit)"
  },
  
  // UK Financial Terms  
  ukTerms: {
    postcode: "Postcode",
    nationalInsurance: "National Insurance Number",
    creditScore: "Credit Score", 
    baseRate: "Bank of England Base Rate",
    stampDuty: "Stamp Duty",
    councilTax: "Council Tax",
    buildingSociety: "Building Society"
  },
  
  // International Financial Terms
  international: {
    iban: "IBAN (International Bank Account Number)",
    swift: "SWIFT Code",
    forex: "Foreign Exchange",
    crossBorder: "Cross-border Transfer",
    compliance: "Regulatory Compliance",
    kyc: "KYC (Know Your Customer)"
  }
};
```

---

### 🎨 CULTURAL USER EXPERIENCE TESTING

#### Hebrew Cultural Considerations (Israeli Market)

```typescript
const hebrewCulturalTesting = {
  religiousConsiderations: {
    sabbathMode: {
      test: "Friday evening to Saturday evening functionality",
      expectation: "Read-only mode or restricted functionality",
      validation: "No financial transactions during Sabbath"
    },
    
    kosherFinance: {
      interestConcerns: "Avoid language suggesting usury (נשך)",
      islamicFinance: "Consider halal finance options",
      charitableGiving: "Integration with tzedakah (צדקה) concepts"
    }
  },
  
  israeliFinancialNorms: {
    currencyDisplay: {
      primary: "₪ (New Israeli Shekel)",
      format: "₪1,234.56 or 1,234.56 ₪",
      thousands: "Comma separator: ₪1,000,000",
      decimals: "Two decimal places standard"
    },
    
    paymentSchedules: {
      monthlyDue: "1st of month common",
      biMonthly: "15th and 30th options",
      holidayAdjustment: "Payments adjusted for Jewish holidays",
      armyService: "Military service payment deferrals"
    },
    
    documentRequirements: {
      idNumber: "Israeli ID (תעודת זהות) - 9 digits",
      paySlips: "Recent 3 months salary slips",
      bankStatements: "6 months bank statements",
      taxReturns: "Annual income tax returns"
    }
  },
  
  hebrewInterface: {
    readingFlow: "Right-to-left reading pattern",
    visualHierarchy: "Information priority flows RTL",
    ctaPlacement: "Call-to-action buttons on left side",
    menuBehavior: "Dropdown menus expand to the left"
  }
};
```

#### Russian Cultural Considerations (Post-Soviet Market)

```typescript
const russianCulturalTesting = {
  bankingPsychology: {
    trustFactors: {
      governmentBacking: "Emphasis on government guarantees",
      bankHistory: "Established banks vs new institutions",
      physicalBranches: "Preference for physical bank presence",
      cashTransactions: "Cash still preferred for large amounts"
    },
    
    documentCulture: {
      paperworkExpectation: "Extensive documentation expected",
      officialStamps: "Official stamps and seals importance",
      notarization: "Notarized document requirements",
      bureaucracy: "Multi-step approval processes accepted"
    }
  },
  
  communicationStyle: {
    formalAddress: {
      businessContext: "Always use 'Вы' (formal you)",
      titleUsage: "Proper titles and formal language",
      respectfulTone: "Polite, professional communication",
      directness: "Clear, straightforward information"
    },
    
    informationDensity: {
      detailedExplanations: "Comprehensive information preferred",
      legalDisclosures: "Full legal text expected",
      comparisons: "Detailed comparison tables",
      riskDisclosure: "Thorough risk explanations"
    }
  },
  
  financialConcepts: {
    inflationMemory: "Historical inflation sensitivity",
    currencyStability: "Multi-currency thinking",
    longTermPlanning: "Cautious long-term commitments",
    familyFinance: "Multi-generational financial planning"
  }
};
```

#### English Cultural Considerations (International Standards)

```typescript
const englishCulturalTesting = {
  regionalVariations: {
    americanEnglish: {
      currency: "$1,234.56 (dollar before amount)",
      dateFormat: "MM/DD/YYYY",
      measurements: "Imperial system integration",
      terminology: "Zip Code, SSN, FICO Score"
    },
    
    britishEnglish: {
      currency: "£1,234.56",
      dateFormat: "DD/MM/YYYY", 
      measurements: "Metric system",
      terminology: "Postcode, National Insurance Number"
    }
  },
  
  accessibilityStandards: {
    wcagCompliance: "WCAG 2.1 AA minimum",
    screenReaders: "JAWS, NVDA, VoiceOver compatibility",
    keyboardNavigation: "Full keyboard accessibility",
    colorContrast: "4.5:1 minimum contrast ratio"
  }
};
```

---

### 🧪 COMPREHENSIVE MULTILINGUAL TEST SCENARIOS

#### Cross-Language Form Validation Testing

```typescript
describe('🌍 MULTILINGUAL VALIDATION SUITE', () => {
  
  const languages = ['he', 'ru', 'en'];
  
  languages.forEach(lang => {
    describe(`Testing in ${lang.toUpperCase()}`, () => {
      
      beforeEach(() => {
        cy.visit(`/services/calculate-credit/1?lang=${lang}`);
        cy.get('[data-testid="language-selector"]').select(lang);
      });

      it(`should display proper ${lang} financial terminology`, () => {
        // Verify core financial terms are properly translated
        const termMapping = {
          he: {
            credit: 'אשראי',
            monthlyPayment: 'תשלום חודשי',
            interestRate: 'שיעור ריבית'
          },
          ru: {
            credit: 'кредит', 
            monthlyPayment: 'ежемесячный платёж',
            interestRate: 'процентная ставка'
          },
          en: {
            credit: 'Credit',
            monthlyPayment: 'Monthly Payment', 
            interestRate: 'Interest Rate'
          }
        };
        
        Object.entries(termMapping[lang]).forEach(([key, translation]) => {
          cy.get(`[data-testid="${key}-label"]`).should('contain', translation);
        });
      });

      it(`should handle ${lang} number formatting correctly`, () => {
        const amount = 150000;
        cy.get('[data-testid="credit-amount"]').type(amount.toString());
        
        if (lang === 'he') {
          cy.get('[data-testid="formatted-amount"]').should('contain', '₪150,000');
        } else if (lang === 'ru') {
          cy.get('[data-testid="formatted-amount"]').should('contain', '150 000');
        } else {
          cy.get('[data-testid="formatted-amount"]').should('contain', '$150,000');
        }
      });

      if (lang === 'he') {
        it('should maintain RTL layout integrity', () => {
          // Verify RTL-specific layout
          cy.get('html').should('have.attr', 'dir', 'rtl');
          cy.get('[data-testid="main-form"]').should('have.css', 'direction', 'rtl');
          cy.get('[data-testid="submit-btn"]').should('have.css', 'float', 'left');
          
          // Test RTL navigation flow
          cy.get('[data-testid="step-indicator"]').within(() => {
            cy.get('.step').first().should('be.visible').and('contain', '4');
            cy.get('.step').last().should('be.visible').and('contain', '1');
          });
        });
      }

      it(`should validate ${lang} phone number format`, () => {
        const phoneFormats = {
          he: '050-123-4567',
          ru: '+7 (999) 123-45-67', 
          en: '(555) 123-4567'
        };
        
        cy.get('[data-testid="phone-number"]').type(phoneFormats[lang]);
        cy.get('[data-testid="phone-validation"]').should('contain', 'Valid');
      });
    });
  });

  describe('🔄 LANGUAGE SWITCHING BEHAVIOR', () => {
    
    it('should preserve form data when switching languages', () => {
      // Fill form in English
      cy.visit('/services/calculate-credit/1?lang=en');
      cy.get('[data-testid="credit-amount"]').type('100000');
      cy.get('[data-testid="first-name"]').type('John');
      
      // Switch to Hebrew
      cy.get('[data-testid="language-selector"]').select('he');
      
      // Verify data preservation
      cy.get('[data-testid="credit-amount"]').should('have.value', '100000');
      cy.get('[data-testid="first-name"]').should('have.value', 'John');
      
      // Verify UI language changed
      cy.get('[data-testid="credit-label"]').should('contain', 'אשראי');
    });

    it('should handle language-specific validation messages', () => {
      const validationTests = [
        { lang: 'he', expected: 'שדה זה הוא חובה' },
        { lang: 'ru', expected: 'Это поле обязательно' },
        { lang: 'en', expected: 'This field is required' }
      ];
      
      validationTests.forEach(({ lang, expected }) => {
        cy.visit(`/services/calculate-credit/1?lang=${lang}`);
        cy.get('[data-testid="continue-btn"]').click();
        cy.get('[data-testid="credit-amount-error"]').should('contain', expected);
      });
    });
  });

  describe('📱 RESPONSIVE MULTILINGUAL TESTING', () => {
    
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];
    
    viewports.forEach(viewport => {
      languages.forEach(lang => {
        it(`should display properly in ${lang} on ${viewport.name}`, () => {
          cy.viewport(viewport.width, viewport.height);
          cy.visit(`/services/calculate-credit/1?lang=${lang}`);
          
          // Verify responsive layout
          cy.get('[data-testid="main-form"]').should('be.visible');
          cy.get('[data-testid="language-selector"]').should('be.visible');
          
          if (lang === 'he') {
            // RTL mobile-specific tests
            cy.get('[data-testid="mobile-menu"]').should('have.css', 'right', '0px');
          }
          
          // Test mobile form interaction
          cy.get('[data-testid="credit-amount"]').type('50000');
          cy.get('[data-testid="continue-btn"]').should('be.visible').click();
        });
      });
    });
  });
});
```

#### Cultural Behavior Testing Scenarios

```typescript
const culturalBehaviorTests = {
  hebrewUserJourney: {
    religiousUserFlow: [
      'Check for Sabbath-compatible interface',
      'Validate kosher finance terminology', 
      'Test Hebrew date picker (Hebrew calendar integration)',
      'Verify right-to-left form completion flow'
    ],
    
    israeliFinancialNorms: [
      'Test shekel currency calculations',
      'Validate Israeli ID number format',
      'Check Israeli phone number validation',
      'Test integration with Israeli banking holidays'
    ]
  },
  
  russianUserJourney: {
    formalityExpectations: [
      'Verify formal address usage (Вы vs ты)',
      'Test extensive documentation upload flow',
      'Validate detailed explanation preferences',
      'Check multi-step verification processes'
    ],
    
    trustBuildingElements: [
      'Display bank licenses and certifications',
      'Show government backing information',
      'Provide extensive legal disclosures',
      'Offer physical branch contact information'
    ]
  },
  
  englishUserJourney: {
    accessibilityFirst: [
      'Screen reader compatibility testing',
      'Keyboard-only navigation validation',
      'High contrast mode testing',
      'Voice control interface testing'
    ],
    
    internationalStandards: [
      'Multi-currency display options',
      'International phone number formats',
      'Global accessibility compliance',
      'Cross-border regulation awareness'
    ]
  }
};
```

---

### 📊 MULTILINGUAL QUALITY ASSURANCE METRICS

#### Language Quality Assessment Framework

```typescript
const qualityMetrics = {
  translationAccuracy: {
    financialTerminology: '100% accuracy for banking terms',
    legalCompliance: 'Regulatory-compliant translations',
    culturalAdaptation: 'Culturally appropriate expressions',
    consistencyScore: 'Consistent terminology across all screens'
  },
  
  uiLayoutIntegrity: {
    rtlLayoutScore: 'Perfect RTL layout for Hebrew',
    textExpansion: 'Handle 30% text expansion for Russian',
    responsiveDesign: 'Consistent across all viewports',
    fontFallbacks: 'Proper fallback fonts for all scripts'
  },
  
  userExperienceMetrics: {
    taskCompletionRate: '>95% for all languages',
    errorRecoveryTime: '<30 seconds average',
    languageSwitchingTime: '<3 seconds',
    overallSatisfaction: '>4.5/5 rating across cultures'
  },
  
  performanceMetrics: {
    loadTimeWithFonts: '<2 seconds including web fonts',
    memoryUsage: 'No memory leaks with script switching',
    cacheEfficiency: 'Optimized font and translation caching',
    networkOptimization: 'Minimal bandwidth for language assets'
  }
};
```

#### 🎯 CULTURAL SUCCESS CRITERIA

- **Hebrew (עברית)**: Perfect RTL layout, religious sensitivity, Israeli financial norms compliance
- **Russian (Русский)**: Formal communication style, comprehensive documentation, trust-building elements
- **English**: International accessibility standards, multi-regional terminology, cross-cultural inclusivity

#### 📋 MULTILINGUAL TESTING CHECKLIST

- [ ] **Translation Accuracy**: 100% accurate financial terminology in all languages
- [ ] **RTL Layout Integrity**: Perfect Hebrew right-to-left interface flow
- [ ] **Cultural Appropriateness**: Culturally sensitive financial concepts and terminology
- [ ] **Font and Typography**: Proper script support and readable typography
- [ ] **Form Validation**: Language-appropriate error messages and help text
- [ ] **Number Formatting**: Correct currency, date, and number formats per locale
- [ ] **Accessibility**: WCAG compliance maintained across all languages
- [ ] **Performance**: Optimized loading for multilingual assets
- [ ] **Cross-Language Navigation**: Seamless language switching with data preservation
- [ ] **Mobile Responsiveness**: Consistent experience across devices and languages

**REMEMBER**: True multilingual support goes beyond translation - it requires deep cultural understanding and technical excellence in internationalization.