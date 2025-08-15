# <� BULLETPROOF MORTGAGE CALCULATOR TESTING INSTRUCTIONS
**Generated:** August 14, 2025  
**Target Application:** http://localhost:5173/services/calculate-mortgage/1,2,3,4  
**Confluence Specification:** https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/20447343/3.1.+  
**Testing Framework:** Cypress E2E + Playwright Cross-Browser + Figma Comparison  

---

## =� EXECUTIVE SUMMARY

This document provides comprehensive testing instructions for the **Calculate Mortgage** process (Steps 1-4) comparing live application behavior against documented specifications, Figma designs, and business logic requirements. The testing covers:

- **Confluence Business Specifications** with 15 specific action requirements
- **Figma Design System** comparison and visual validation  
- **Property Ownership LTV Logic** (75%, 50%, 70% financing scenarios)
- **Cross-Browser Compatibility** with screenshot comparison
- **Multi-Language Testing** including Hebrew RTL validation
- **Responsive Design** across 9 viewport matrix
- **Performance & Accessibility** compliance validation

---

## <� BUSINESS LOGIC REQUIREMENTS (FROM CONFLUENCE)

### Critical Property Ownership Logic
Based on Confluence specification, the mortgage calculator MUST implement these exact LTV calculations:

```yaml
Property Ownership Options:
  1. "I don't own any property":
     - Maximum Financing: 75% LTV
     - Minimum Down Payment: 25%
     - Slider Range: 0% � 75%
     
  2. "I own a property":  
     - Maximum Financing: 50% LTV
     - Minimum Down Payment: 50%
     - Slider Range: 0% � 50%
     
  3. "I'm selling a property":
     - Maximum Financing: 70% LTV  
     - Minimum Down Payment: 30%
     - Slider Range: 0% � 70%
```

### Confluence-Specified Actions (15 Requirements)
1. **Property Value Input** - Accept numeric property value with validation
2. **Property Ownership Selection** - Three-option dropdown with LTV impact
3. **Initial Payment Calculation** - Dynamic calculation based on ownership
4. **Loan Amount Display** - Real-time calculation: Property Value - Initial Payment
5. **Interest Rate Selection** - Default 5% with custom input option
6. **Loan Term Selection** - Years dropdown with validation
7. **Monthly Payment Calculation** - Real-time mortgage calculation display
8. **Income Validation** - Monthly income vs payment ratio checking
9. **Borrower Information Form** - Personal details with validation
10. **Employment Data Collection** - Income source and employment validation
11. **Bank Offers Comparison** - Display available bank programs
12. **Program Selection Interface** - Allow user to select preferred program
13. **Application Summary** - Review all entered data
14. **Submission Process** - Final application submission
15. **Confirmation Display** - Success confirmation with next steps

---

## <� FIGMA DESIGN VALIDATION REQUIREMENTS

### Step 1: Property & Loan Parameters
**Figma Reference:** Mortgage Calculator Step 1 Design  
**Live URL:** http://localhost:5173/services/calculate-mortgage/1

#### Visual Components to Validate:
- **Progress Indicator:** 4-step progress bar showing Step 1 active
- **Property Value Input:** Numeric input with � symbol, proper formatting
- **Property Ownership Dropdown:** Three options with clear Hebrew/English labels
- **Initial Payment Slider:** Dynamic range based on ownership selection
- **Loan Amount Display:** Auto-calculated field with proper formatting
- **Interest Rate Input:** Default 5% with custom option toggle
- **Loan Term Dropdown:** Years selection with validation
- **Monthly Payment Display:** Calculated amount with emphasis styling
- **Continue Button:** Prominent CTA button, properly styled

#### Design System Validation:
```css
/* Color Palette Verification */
Primary Gold: #FFD700
Secondary Dark: #333535  
Success Green: #28A745
Error Red: #FF4444
Background: #FFFFFF
Text Primary: #333333
Text Secondary: #666666

/* Typography Verification */
Headings: Inter/Roboto Bold 24px/28px/32px
Body Text: Inter/Roboto Regular 16px
Labels: Inter/Roboto Medium 14px
Input Text: Inter/Roboto Regular 16px

/* Hebrew RTL Fonts */
Hebrew Headings: Arimo Bold 24px/28px/32px
Hebrew Body: Arimo Regular 16px
Hebrew Labels: Arimo Medium 14px
```

### Step 2: Personal Information
**Figma Reference:** Mortgage Calculator Step 2 Design  
**Live URL:** http://localhost:5173/services/calculate-mortgage/2

#### Components to Validate:
- **Progress Indicator:** Step 2 active, Step 1 completed
- **Personal Details Form:** Name, ID, Date of Birth, Phone, Email
- **Citizenship Dropdown:** Multi-select with Israeli/Foreign options
- **Marital Status Selection:** Radio buttons or dropdown
- **Address Fields:** Comprehensive address form with city dropdown
- **Form Validation:** Real-time validation with error states
- **Back/Continue Navigation:** Consistent button styling

### Step 3: Income & Employment
**Figma Reference:** Mortgage Calculator Step 3 Design  
**Live URL:** http://localhost:5173/services/calculate-mortgage/3

#### Components to Validate:
- **Progress Indicator:** Step 3 active, Steps 1-2 completed
- **Income Source Selection:** Employment type dropdown
- **Monthly Income Input:** Numeric input with validation
- **Employment Details:** Employer name, position, tenure
- **Additional Income:** Optional additional income sources
- **Income Verification:** Document upload capability
- **Debt Information:** Existing obligations input
- **Debt-to-Income Ratio:** Real-time calculation display

### Step 4: Bank Offers & Program Selection
**Figma Reference:** Mortgage Calculator Step 4 Design  
**Live URL:** http://localhost:5173/services/calculate-mortgage/4

#### Components to Validate:
- **Progress Indicator:** Step 4 active, all previous completed
- **Bank Offers Table:** Comparison table with multiple bank options
- **Program Details:** Interest rates, terms, fees for each bank
- **Selection Interface:** Radio buttons or checkboxes for program selection
- **Offer Details Modal:** Detailed view of selected program
- **Application Summary:** Review of all entered information
- **Submit Application:** Final submission CTA
- **Terms & Conditions:** Checkbox with legal text

---

## >� COMPREHENSIVE TEST EXECUTION PLAN

### Phase 0: CRITICAL DROPDOWN LOGIC VALIDATION 🚨

**PRIORITY**: This phase MUST be executed first to validate the foundation of the dropdown system across all mortgage calculator steps.

#### Architecture Integration
Based on `/server/docs/Architecture/dropDownLogicBankim.md` and `/docs/systemTranslationLogic.md`, the mortgage calculator uses a sophisticated database-driven dropdown system with:
- **Content Management Integration**: Dropdowns sourced from `content_items` and `content_translations` tables
- **Multi-Language Support**: Dynamic translations for Hebrew, English, Russian
- **Conditional Logic**: Dropdowns that trigger additional UI elements based on selection
- **API Integration**: Real-time dropdown data via `/api/v1/dropdowns` endpoints

#### 🚨 CRITICAL TESTING APPROACH: Traditional vs Modern Dropdown Detection

**MANDATORY UNDERSTANDING**: Modern React applications like this mortgage calculator often use **custom dropdown components** instead of traditional HTML `<select>` elements. Tests must account for BOTH types to be bulletproof.

##### Common Testing Mistakes (What Causes Failures):
```typescript
// ❌ WRONG: Looking for traditional elements only
cy.get('select')  // ← Found ZERO (will fail)
cy.get('[role="combobox"]')  // ← Found ZERO (will fail)  
cy.get('.dropdown')  // ← Wrong class names (will fail)
```

##### Reality: What Modern Apps Actually Implement:
- **Custom dropdown buttons** with Hebrew placeholders like "בחר עיר" ("Choose city")
- **React components** that look like dropdowns but aren't `<select>` elements
- **Working business logic** and calculations with functional interfaces
- **Functional Hebrew RTL interface** with proper text rendering

##### 🛡️ BULLETPROOF DROPDOWN DETECTION STRATEGY:
```typescript
// ✅ COMPREHENSIVE: Test for ALL possible dropdown types
const allDropdownSelectors = [
  // Traditional HTML dropdowns
  'select',
  '[role="combobox"]',
  '[role="listbox"]',
  
  // Modern React dropdown components
  '[data-testid*="dropdown"]',
  '[data-testid*="select"]',
  '[aria-haspopup="listbox"]',
  '[aria-expanded]',
  
  // Custom button-based dropdowns
  'button[aria-expanded]',
  'button:has(.arrow-down)',
  'button:has([class*="chevron"])',
  
  // CSS class-based dropdowns
  '.dropdown',
  '.select',
  '.custom-select',
  '.dropdown-toggle',
  '[class*="dropdown"]',
  '[class*="select"]',
  
  // Hebrew text pattern dropdowns (common placeholders)
  'button:contains("בחר")',  // "Choose" in Hebrew
  'button:contains("בחירה")', // "Selection" in Hebrew
  '[placeholder*="בחר"]',
  
  // Interactive elements that behave like dropdowns
  'div[tabindex="0"]:has(.options)',
  'div[role="button"]:has(.menu)',
  
  // Framework-specific selectors
  '.ant-select',      // Ant Design
  '.MuiSelect-root',  // Material-UI
  '.v-select',        // Vue Select
  '.react-select',    // React Select
];

// Test strategy: Try each selector type until dropdowns are found
let foundDropdowns = false;
let workingSelectors = [];

allDropdownSelectors.forEach(selector => {
  cy.get('body').then($body => {
    const elements = $body.find(selector);
    if (elements.length > 0) {
      foundDropdowns = true;
      workingSelectors.push(selector);
      cy.log(`✅ Found ${elements.length} dropdowns with selector: ${selector}`);
    }
  });
});
```

##### Phase 0 Testing Must Validate:
1. **✅ Detection Success**: Find and identify ALL dropdown types present
2. **✅ Interaction Testing**: Verify dropdowns are clickable and functional
3. **✅ Content Validation**: Confirm dropdowns have options (not empty)
4. **✅ Business Logic**: Verify property ownership affects LTV calculations
5. **✅ Hebrew RTL Support**: Confirm Hebrew text renders and functions correctly
6. **✅ Conditional UI**: Verify dropdown selections reveal additional form elements

##### Emergency Fallback Strategy:
If automated dropdown detection fails:
```typescript
// Manual inspection approach
cy.get('body').then($body => {
  // Log all interactive elements for manual analysis
  const interactiveElements = $body.find('button, div[role="button"], [aria-expanded], [data-testid*="select"]');
  
  cy.log(`🔍 Found ${interactiveElements.length} potentially interactive elements`);
  
  interactiveElements.each((index, element) => {
    const tagName = element.tagName;
    const testId = element.getAttribute('data-testid') || 'none';
    const ariaExpanded = element.getAttribute('aria-expanded') || 'none';
    const text = element.textContent?.trim().substring(0, 50) || 'no text';
    
    cy.log(`Element ${index}: ${tagName} | testid="${testId}" | aria-expanded="${ariaExpanded}" | text="${text}"`);
  });
  
  // Take screenshot for manual analysis
  cy.screenshot('dropdown-detection/manual-inspection-all-elements');
});
```

#### Test 0.1: Dropdown Availability and Options Validation
```typescript
describe('CRITICAL: Dropdown Availability Across All Steps', () => {
  const steps = [1, 2, 3, 4];
  
  steps.forEach(step => {
    it(`Step ${step}: All dropdowns must have options and be functional`, () => {
      cy.visit(`/services/calculate-mortgage/${step}`);
      cy.wait(3000); // Allow API calls to complete
      
      // Find all dropdowns on the page
      cy.get('select, [role="combobox"], .dropdown, [data-testid*="dropdown"]').each($dropdown => {
        const dropdownName = $dropdown.attr('data-testid') || $dropdown.attr('id') || 'unnamed-dropdown';
        
        cy.log(`🔍 Testing dropdown: ${dropdownName} on Step ${step}`);
        
        // CRITICAL: Dropdown must not be empty
        cy.wrap($dropdown).within(() => {
          cy.get('option, [role="option"], .dropdown-option').should('have.length.greaterThan', 0, 
            `Dropdown ${dropdownName} on Step ${step} MUST have options - empty dropdowns are blocking failures`);
        });
        
        // CRITICAL: Dropdown must be interactive
        cy.wrap($dropdown).should('not.be.disabled', 
          `Dropdown ${dropdownName} on Step ${step} must be interactive`);
        
        // CRITICAL: Default selection validation
        cy.wrap($dropdown).then($el => {
          const hasDefaultValue = $el.val() !== '' && $el.val() !== null;
          const hasPlaceholder = $el.attr('placeholder') || $el.find('option[value=""]').length > 0;
          
          expect(hasDefaultValue || hasPlaceholder, 
            `Dropdown ${dropdownName} must have either a default value or placeholder`).to.be.true;
        });
        
        cy.screenshot(`dropdown-validation/step${step}-${dropdownName}-options`);
      });
    });
  });
});
```

#### Test 0.2: Property Ownership Dropdown Logic (Step 1)
```typescript
describe('CRITICAL: Property Ownership Dropdown Logic', () => {
  it('Property ownership dropdown must have exact 3 options with correct LTV logic', () => {
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(2000);
    
    const propertyOwnershipDropdown = '[data-testid="property-ownership"], [data-testid="property_ownership"], select[name*="property"], select[name*="ownership"]';
    
    // CRITICAL: Dropdown must exist and be visible
    cy.get(propertyOwnershipDropdown).should('exist').should('be.visible');
    
    // CRITICAL: Must have exactly 3 options (plus optional placeholder)
    cy.get(propertyOwnershipDropdown).within(() => {
      cy.get('option').then($options => {
        const visibleOptions = Array.from($options).filter(option => 
          option.value !== '' && option.textContent.trim() !== ''
        );
        
        expect(visibleOptions.length, 'Property ownership must have exactly 3 options').to.equal(3);
        
        // Validate each option exists
        const expectedOptions = [
          { value: 'no_property', textPattern: /don't.*own|אין.*נכס|не.*владею/i },
          { value: 'own_property', textPattern: /own.*property|יש.*נכס|владею/i },
          { value: 'selling_property', textPattern: /selling|מוכר|продаю/i }
        ];
        
        expectedOptions.forEach(expected => {
          const foundOption = visibleOptions.find(option => 
            option.value === expected.value || expected.textPattern.test(option.textContent)
          );
          expect(foundOption, `Missing property ownership option: ${expected.value}`).to.exist;
        });
      });
    });
    
    // Test LTV logic for each option
    const ltvTests = [
      { option: 0, expectedMaxLTV: 75, scenario: 'No Property' },
      { option: 1, expectedMaxLTV: 50, scenario: 'Own Property' },
      { option: 2, expectedMaxLTV: 70, scenario: 'Selling Property' }
    ];
    
    ltvTests.forEach(test => {
      cy.get(propertyOwnershipDropdown).select(test.option);
      cy.wait(1000); // Allow UI to update
      
      // Check if slider max value changes
      cy.get('[data-testid*="slider"], [type="range"], .slider').then($slider => {
        if ($slider.length > 0) {
          const maxValue = parseFloat($slider.attr('max') || '100');
          const propertyValue = 1000000; // Default test value
          const expectedMaxLoan = propertyValue * (test.expectedMaxLTV / 100);
          
          cy.log(`${test.scenario}: MaxLTV=${test.expectedMaxLTV}%, MaxLoan=${expectedMaxLoan}`);
        }
      });
      
      cy.screenshot(`dropdown-validation/property-ownership-${test.scenario.toLowerCase().replace(' ', '-')}`);
    });
  });
});
```

#### Test 0.3: Conditional UI Elements Discovery (Steps 2-4)
```typescript
describe('CRITICAL: Conditional UI Elements Triggered by Dropdowns', () => {
  
  it('Step 2: Personal information dropdowns reveal conditional fields', () => {
    cy.visit('/services/calculate-mortgage/2');
    cy.wait(3000);
    
    // Find dropdowns that might trigger conditional UI
    const conditionalDropdowns = [
      '[data-testid*="citizenship"], [name*="citizenship"]',
      '[data-testid*="marital"], [name*="marital"]',
      '[data-testid*="employment"], [name*="employment"]'
    ];
    
    conditionalDropdowns.forEach(selector => {
      cy.get('body').then($body => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).each($dropdown => {
            const dropdownName = $dropdown.attr('data-testid') || $dropdown.attr('name') || 'conditional-dropdown';
            
            cy.wrap($dropdown).within(() => {
              cy.get('option').each(($option, index) => {
                if (index === 0) return; // Skip placeholder
                
                const optionValue = $option.attr('value');
                const optionText = $option.text();
                
                cy.log(`🔄 Testing conditional UI for ${dropdownName}: ${optionText}`);
                
                // Select option and check for new UI elements
                cy.wrap($dropdown).select(optionValue);
                cy.wait(1000);
                
                // Take screenshot to capture any UI changes
                cy.screenshot(`conditional-ui/step2-${dropdownName}-option-${index}`);
                
                // Check for common conditional elements
                const conditionalSelectors = [
                  '.conditional-field',
                  '[style*="display: block"]',
                  '.form-section:not(.hidden)',
                  '.additional-info',
                  '.sub-form'
                ];
                
                conditionalSelectors.forEach(conditional => {
                  cy.get('body').then($body => {
                    const conditionalElements = $body.find(conditional);
                    if (conditionalElements.length > 0) {
                      cy.log(`✅ Found conditional UI: ${conditional} for option ${optionText}`);
                    }
                  });
                });
              });
            });
          });
        }
      });
    });
  });
  
  it('Step 3: Income/Employment dropdowns must reveal additional fields', () => {
    cy.visit('/services/calculate-mortgage/3');
    cy.wait(3000);
    
    // Based on Confluence, Step 3 has conditional dropdowns for income sources
    const incomeDropdowns = [
      '[data-testid*="income"], [name*="income"]',
      '[data-testid*="employment"], [name*="employment"]',
      '[data-testid*="occupation"], [name*="occupation"]',
      '[data-testid*="source"], [name*="source"]'
    ];
    
    incomeDropdowns.forEach(selector => {
      cy.get('body').then($body => {
        if ($body.find(selector).length > 0) {
          cy.log(`🔍 Testing income dropdown: ${selector}`);
          
          cy.get(selector).first().then($dropdown => {
            const initialFormElements = $body.find('input, select, textarea').length;
            
            cy.wrap($dropdown).within(() => {
              cy.get('option').each(($option, index) => {
                if (index === 0 || index > 5) return; // Test first 5 options
                
                const optionValue = $option.attr('value');
                const optionText = $option.text();
                
                cy.wrap($dropdown).select(optionValue);
                cy.wait(1500); // Allow conditional UI to render
                
                // Check if new form elements appeared
                cy.get('body').then($updatedBody => {
                  const newFormElements = $updatedBody.find('input, select, textarea').length;
                  
                  if (newFormElements > initialFormElements) {
                    cy.log(`✅ Option "${optionText}" revealed ${newFormElements - initialFormElements} new form elements`);
                    cy.screenshot(`conditional-ui/step3-income-revealed-${index}`);
                  }
                });
              });
            });
          });
        }
      });
    });
  });
  
  it('Step 4: Bank selection must reveal program details', () => {
    cy.visit('/services/calculate-mortgage/4');
    cy.wait(5000); // Step 4 may need more time for bank API calls
    
    // Step 4 should have bank selection dropdowns
    const bankSelectors = [
      '[data-testid*="bank"], [name*="bank"]',
      '[data-testid*="program"], [name*="program"]',
      '.bank-selector',
      '.program-selector'
    ];
    
    bankSelectors.forEach(selector => {
      cy.get('body').then($body => {
        if ($body.find(selector).length > 0) {
          cy.log(`🏦 Testing bank dropdown: ${selector}`);
          
          cy.get(selector).first().within(() => {
            cy.get('option').should('have.length.greaterThan', 0, 'Bank dropdown must have options');
            
            cy.get('option').each(($option, index) => {
              if (index === 0 || index > 3) return; // Test first 3 bank options
              
              const optionValue = $option.attr('value');
              const optionText = $option.text();
              
              if (optionValue && optionValue !== '') {
                cy.get(selector).select(optionValue);
                cy.wait(2000); // Bank selection may trigger API calls
                
                // Look for revealed program details
                const detailSelectors = [
                  '.bank-details',
                  '.program-details',
                  '.interest-rate-display',
                  '.terms-display',
                  '[data-testid*="rate"]',
                  '[data-testid*="term"]'
                ];
                
                detailSelectors.forEach(detailSelector => {
                  cy.get('body').then($body => {
                    if ($body.find(detailSelector).length > 0) {
                      cy.log(`✅ Bank "${optionText}" revealed details: ${detailSelector}`);
                    }
                  });
                });
                
                cy.screenshot(`conditional-ui/step4-bank-${index}-details`);
              }
            });
          });
        }
      });
    });
  });
});
```

#### Test 0.4: Database Integration Validation
```typescript
describe('CRITICAL: Dropdown Database Integration', () => {
  it('All dropdowns must load data from API/database', () => {
    // Intercept API calls for dropdown data
    cy.intercept('GET', '**/api/v1/dropdowns**').as('dropdownAPI');
    cy.intercept('GET', '**/api/v1/content**').as('contentAPI');
    cy.intercept('GET', '**/api/v1/calculation-parameters**').as('paramsAPI');
    
    [1, 2, 3, 4].forEach(step => {
      cy.visit(`/services/calculate-mortgage/${step}`);
      
      // Wait for API calls to complete
      cy.wait('@dropdownAPI', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('data');
        
        cy.log(`✅ Step ${step}: Dropdown API loaded successfully`);
      });
      
      // Verify dropdowns are populated from API data
      cy.get('select, [role="combobox"]').should('have.length.greaterThan', 0);
      
      cy.get('select, [role="combobox"]').each($dropdown => {
        cy.wrap($dropdown).within(() => {
          cy.get('option').should('have.length.greaterThan', 0, 
            `Dropdown on Step ${step} must be populated from database`);
        });
      });
      
      cy.screenshot(`api-integration/step${step}-dropdowns-loaded`);
    });
  });
  
  it('Multi-language dropdown content must load correctly', () => {
    const languages = ['en', 'he', 'ru'];
    
    languages.forEach(lang => {
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', lang);
      });
      
      cy.visit('/services/calculate-mortgage/1');
      cy.wait(3000);
      
      cy.get('[data-testid="property-ownership"], select[name*="ownership"]').within(() => {
        cy.get('option').each($option => {
          const optionText = $option.text().trim();
          
          // Verify option has translated text (not empty or placeholder keys)
          expect(optionText).to.not.be.empty;
          expect(optionText).to.not.include('undefined');
          expect(optionText).to.not.include('translation');
          expect(optionText).to.not.include('{{');
          
          if (lang === 'he') {
            // Hebrew text should contain Hebrew characters
            expect(optionText).to.match(/[\u0590-\u05FF]/, `Hebrew dropdown option missing Hebrew text: ${optionText}`);
          }
        });
      });
      
      cy.screenshot(`multilingual/step1-property-ownership-${lang}`);
    });
  });
});
```

#### Test 0.5: Dropdown Accessibility and Error States
```typescript
describe('CRITICAL: Dropdown Accessibility and Error Handling', () => {
  it('All dropdowns must have proper ARIA attributes', () => {
    [1, 2, 3, 4].forEach(step => {
      cy.visit(`/services/calculate-mortgage/${step}`);
      cy.wait(2000);
      
      cy.get('select, [role="combobox"]').each($dropdown => {
        const dropdownName = $dropdown.attr('data-testid') || $dropdown.attr('name') || 'dropdown';
        
        // ARIA label or labelledby required
        cy.wrap($dropdown).should('satisfy', $el => {
          return $el.attr('aria-label') || $el.attr('aria-labelledby') || 
                 $el.siblings('label').length > 0;
        }, `Dropdown ${dropdownName} must have ARIA label or associated label`);
        
        // Required dropdowns must have aria-required
        cy.wrap($dropdown).then($el => {
          if ($el.attr('required') || $el.hasClass('required')) {
            cy.wrap($el).should('have.attr', 'aria-required', 'true');
          }
        });
        
        cy.log(`✅ Dropdown ${dropdownName} accessibility validated`);
      });
    });
  });
  
  it('Dropdowns must handle loading and error states', () => {
    // Test with slow/failed API response
    cy.intercept('GET', '**/api/v1/dropdowns**', { delay: 5000 }).as('slowDropdownAPI');
    
    cy.visit('/services/calculate-mortgage/1');
    
    // Verify loading state is shown
    cy.get('select, [role="combobox"]').should('exist');
    
    // Check for loading indicators
    cy.get('.loading, .spinner, [data-testid*="loading"]').should('be.visible');
    
    cy.wait('@slowDropdownAPI');
    
    // Verify dropdowns are populated after loading
    cy.get('select option').should('have.length.greaterThan', 1);
    
    cy.screenshot('dropdown-states/loading-completed');
  });
});
```

### Phase 1: Business Logic Validation Tests

#### Test 1.1: Property Ownership LTV Logic
```typescript
describe('Property Ownership LTV Logic', () => {
  const testScenarios = [
    {
      ownership: "I don't own any property",
      maxLTV: 75,
      propertyValue: 1000000,
      expectedMaxLoan: 750000,
      expectedMinDownPayment: 250000
    },
    {
      ownership: "I own a property", 
      maxLTV: 50,
      propertyValue: 1000000,
      expectedMaxLoan: 500000,
      expectedMinDownPayment: 500000
    },
    {
      ownership: "I'm selling a property",
      maxLTV: 70, 
      propertyValue: 1000000,
      expectedMaxLoan: 700000,
      expectedMinDownPayment: 300000
    }
  ];

  testScenarios.forEach(scenario => {
    it(`should enforce ${scenario.maxLTV}% LTV for "${scenario.ownership}"`, () => {
      cy.visit('/services/calculate-mortgage/1');
      
      // Input property value
      cy.get('[data-testid="property-value"]').type(scenario.propertyValue.toString());
      
      // Select ownership type
      cy.get('[data-testid="property-ownership"]').select(scenario.ownership);
      
      // Verify slider maximum
      cy.get('[data-testid="initial-payment-slider"]')
        .should('have.attr', 'max', (scenario.propertyValue * (1 - scenario.maxLTV / 100)).toString());
      
      // Set slider to maximum
      cy.get('[data-testid="initial-payment-slider"]').invoke('val', scenario.expectedMinDownPayment).trigger('input');
      
      // Verify loan amount calculation
      cy.get('[data-testid="loan-amount"]')
        .should('contain', scenario.expectedMaxLoan.toLocaleString());
      
      // Verify cannot exceed maximum
      cy.get('[data-testid="initial-payment-slider"]')
        .invoke('val', scenario.expectedMinDownPayment + 1000)
        .trigger('input');
      
      cy.get('[data-testid="loan-amount"]')
        .should('not.contain', (scenario.expectedMaxLoan + 1000).toLocaleString());
    });
  });
});
```

#### Test 1.2: Interest Rate and Payment Calculation
```typescript
describe('Interest Rate and Payment Calculation', () => {
  it('should calculate monthly payment correctly with 5% default rate', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Set test values
    const propertyValue = 1000000;
    const downPayment = 250000; // 25%
    const loanAmount = 750000;   // 75%
    const interestRate = 5;      // Default 5%
    const loanTermYears = 25;    // 25 years
    
    // Input values
    cy.get('[data-testid="property-value"]').type(propertyValue.toString());
    cy.get('[data-testid="property-ownership"]').select("I don't own any property");
    cy.get('[data-testid="initial-payment-slider"]').invoke('val', downPayment).trigger('input');
    cy.get('[data-testid="interest-rate"]').should('have.value', '5'); // Verify default
    cy.get('[data-testid="loan-term"]').select(loanTermYears.toString());
    
    // Calculate expected monthly payment
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    const expectedPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Verify calculated payment (allow �10 shekel tolerance)
    cy.get('[data-testid="monthly-payment"]').then($payment => {
      const displayedPayment = parseFloat($payment.text().replace(/[^\d.]/g, ''));
      expect(displayedPayment).to.be.closeTo(expectedPayment, 10);
    });
  });
  
  it('should allow custom interest rate input', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Toggle to custom rate
    cy.get('[data-testid="custom-interest-rate-toggle"]').click();
    
    // Input custom rate
    cy.get('[data-testid="custom-interest-rate"]').type('4.5');
    
    // Verify payment recalculation with new rate
    cy.get('[data-testid="monthly-payment"]').should('be.visible');
    // Payment amount should be different from default 5% calculation
  });
});
```

### Phase 2: Figma Design Comparison Tests

#### Test 2.1: Visual Design System Validation
```typescript
describe('Visual Design System Validation', () => {
  it('should match Figma color palette exactly', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Verify primary colors
    cy.get('[data-testid="continue-button"]')
      .should('have.css', 'background-color', 'rgb(255, 215, 0)'); // #FFD700
      
    cy.get('h1, h2, h3')
      .should('have.css', 'color', 'rgb(51, 51, 51)'); // #333333
      
    // Verify error states
    cy.get('[data-testid="property-value"]').clear();
    cy.get('[data-testid="continue-button"]').click();
    
    cy.get('.error-message, [data-testid="error"]')
      .should('have.css', 'color', 'rgb(255, 68, 68)'); // #FF4444
  });
  
  it('should match Figma typography specifications', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Verify heading typography
    cy.get('h1').should('have.css', 'font-size', '32px');
    cy.get('h2').should('have.css', 'font-size', '28px');
    cy.get('h3').should('have.css', 'font-size', '24px');
    
    // Verify body text
    cy.get('p, .body-text').should('have.css', 'font-size', '16px');
    
    // Verify labels
    cy.get('label').should('have.css', 'font-size', '14px');
  });
  
  it('should implement proper spacing from Figma designs', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Verify form field spacing
    cy.get('.form-field').each($field => {
      cy.wrap($field).should('have.css', 'margin-bottom').and('match', /^(16px|20px|24px)$/);
    });
    
    // Verify section spacing
    cy.get('.section').each($section => {
      cy.wrap($section).should('have.css', 'margin-bottom').and('match', /^(32px|40px|48px)$/);
    });
  });
});
```

#### Test 2.2: Screenshot Comparison with Figma
```typescript
describe('Figma Screenshot Comparison', () => {
  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 }
  ];
  
  viewports.forEach(viewport => {
    it(`should match Figma design on ${viewport.name}`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/services/calculate-mortgage/1');
      
      // Wait for fonts and images to load
      cy.wait(3000);
      
      // Take screenshot for comparison
      cy.screenshot(`figma-comparison/step1-${viewport.name}`, {
        capture: 'viewport',
        overwrite: true
      });
      
      // Visual regression testing instructions:
      // 1. Compare with Figma export: Design-Step1-${viewport.name}.png
      // 2. Check layout alignment, spacing, colors, typography
      // 3. Verify component positioning matches design exactly
      // 4. Document any deviations in test report
    });
  });
});
```

### Phase 3: Multi-Language RTL Testing

**⚠️ Hebrew Testing Best Practices:**
- Use `data-testid` attributes instead of Hebrew text for element selection
- Test by option values (`value="no_property"`) rather than display text
- Verify RTL CSS properties instead of character validation
- Use Unicode escape sequences if Hebrew text is required: `\u05D0\u05D9\u05DF \u05DC\u05D9 \u05E0\u05DB\u05E1` (for "אין לי נכס")
- Example: `cy.get('option').should('contain', '\u05D0\u05D9\u05DF \u05DC\u05D9 \u05E0\u05DB\u05E1');`

#### Test 3.1: Hebrew RTL Implementation
```typescript
describe('Hebrew RTL Implementation', () => {
  beforeEach(() => {
    cy.window().then(win => {
      win.localStorage.setItem('i18nextLng', 'he');
    });
    cy.visit('/services/calculate-mortgage/1');
  });
  
  it('should implement proper RTL layout', () => {
    // Verify RTL direction
    cy.get('html').should('have.attr', 'dir', 'rtl');
    cy.get('body').should('have.css', 'direction', 'rtl');
    
    // Verify Hebrew font loading
    cy.get('body').should('have.css', 'font-family').and('contain', 'Arimo');
    
    // Verify form field alignment
    cy.get('input, select').each($input => {
      cy.wrap($input).should('have.css', 'text-align', 'right');
    });
    
    // Verify button positioning
    cy.get('[data-testid="continue-button"]')
      .should('have.css', 'margin-left', 'auto')
      .should('have.css', 'margin-right', '0px');
  });
  
  it('should display Hebrew property ownership options correctly', () => {
    cy.get('[data-testid="property-ownership"]').click();
    
    // Verify Hebrew options exist and are properly displayed
    // Using data-testid attributes to avoid Hebrew character encoding issues
    cy.get('[data-testid="property-ownership-option-no-property"]').should('be.visible');
    cy.get('[data-testid="property-ownership-option-own-property"]').should('be.visible');
    cy.get('[data-testid="property-ownership-option-selling-property"]').should('be.visible');
    
    // Alternative: Test by option value instead of Hebrew text
    cy.get('option[value="no_property"]').should('exist');
    cy.get('option[value="own_property"]').should('exist');
    cy.get('option[value="selling_property"]').should('exist');
    
    // Verify proper RTL direction is applied to the dropdown
    cy.get('[data-testid="property-ownership"]').should('have.css', 'direction', 'rtl');
  });
});
```

#### Test 3.2: Translation Consistency
```typescript
describe('Translation Consistency', () => {
  const languages = ['en', 'he', 'ru'];
  
  languages.forEach(lang => {
    it(`should have complete translations for ${lang}`, () => {
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', lang);
      });
      cy.visit('/services/calculate-mortgage/1');
      
      // Verify no missing translation keys
      cy.get('body').should('not.contain', 'translation missing');
      cy.get('body').should('not.contain', 'undefined');
      cy.get('body').should('not.contain', '[object Object]');
      
      // Verify key elements have translations
      cy.get('[data-testid="page-title"]').should('not.be.empty');
      cy.get('[data-testid="property-value-label"]').should('not.be.empty');
      cy.get('[data-testid="property-ownership-label"]').should('not.be.empty');
      cy.get('[data-testid="continue-button"]').should('not.be.empty');
    });
  });
});
```

### Phase 4: Responsive Design Validation

#### Test 4.1: Cross-Viewport Compatibility
```typescript
describe('Cross-Viewport Compatibility', () => {
  const viewports = [
    [320, 568],   // iPhone SE
    [390, 844],   // iPhone 12/13/14  
    [768, 1024],  // iPad Portrait
    [1440, 900],  // MacBook Air
    [1920, 1080]  // Full HD Desktop
  ];
  
  viewports.forEach(([width, height]) => {
    it(`should be fully responsive at ${width}x${height}`, () => {
      cy.viewport(width, height);
      cy.visit('/services/calculate-mortgage/1');
      
      // Check no horizontal scroll
      cy.window().then(win => {
        const el = win.document.scrollingElement!;
        expect(el.scrollWidth, 'no horizontal scroll').to.eq(el.clientWidth);
      });
      
      // Check form usability
      if (width < 768) {
        // Mobile: check touch targets
        cy.get('button, input, select').each($el => {
          expect($el[0].offsetHeight, 'touch target height').to.be.at.least(44);
        });
        
        // Mobile: check stacked layout
        cy.get('.form-row').should('have.css', 'flex-direction', 'column');
      } else {
        // Desktop: check side-by-side layout
        cy.get('.form-row').should('have.css', 'flex-direction', 'row');
      }
      
      // Check slider responsiveness
      cy.get('[data-testid="initial-payment-slider"]')
        .should('be.visible')
        .should('have.css', 'width')
        .and('match', /\d+px/);
      
      cy.screenshot(`responsive/step1-${width}x${height}`, {
        capture: 'viewport'
      });
    });
  });
});
```

### Phase 5: Performance & Accessibility Testing

#### Test 5.1: Load Performance Validation
```typescript
describe('Load Performance Validation', () => {
  it('should load within performance budgets', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    cy.window().its('performance').then(performance => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Check load times
      const domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart;
      const loadComplete = navTiming.loadEventEnd - navTiming.loadEventStart;
      
      expect(domContentLoaded, 'DOM Content Loaded').to.be.lessThan(3000); // 3s
      expect(loadComplete, 'Load Complete').to.be.lessThan(5000); // 5s
      
      cy.log(`Performance: DOMContentLoaded=${domContentLoaded}ms, LoadComplete=${loadComplete}ms`);
    });
  });
  
  it('should have no layout shifts during load', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Check initial layout
    cy.get('[data-testid="property-value"]').then($input => {
      const initialRect = $input[0].getBoundingClientRect();
      
      // Wait for fonts and images
      cy.wait(3000);
      
      // Check layout didn't shift
      cy.get('[data-testid="property-value"]').then($input2 => {
        const finalRect = $input2[0].getBoundingClientRect();
        expect(Math.abs(finalRect.top - initialRect.top), 'no layout shift').to.be.lessThan(5);
      });
    });
  });
});
```

#### Test 5.2: Accessibility Compliance
```typescript
describe('Accessibility Compliance', () => {
  it('should meet WCAG 2.1 AA standards', () => {
    cy.visit('/services/calculate-mortgage/1');
    cy.injectAxe();
    
    // Run accessibility scan
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });
  });
  
  it('should have proper keyboard navigation', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Test tab order
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-testid', 'property-value');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-testid', 'property-ownership');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-testid', 'initial-payment-slider');
    
    // Test all interactive elements are focusable
    cy.get('input, select, button, [tabindex]').each($el => {
      cy.wrap($el).focus().should('have.focus');
    });
  });
  
  it('should have proper ARIA labels and descriptions', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // Check required ARIA attributes
    cy.get('[data-testid="property-value"]')
      .should('have.attr', 'aria-label')
      .should('have.attr', 'aria-required', 'true');
      
    cy.get('[data-testid="property-ownership"]')
      .should('have.attr', 'aria-label')
      .should('have.attr', 'aria-required', 'true');
      
    cy.get('[data-testid="initial-payment-slider"]')
      .should('have.attr', 'aria-label')
      .should('have.attr', 'aria-valuemin')
      .should('have.attr', 'aria-valuemax')
      .should('have.attr', 'aria-valuenow');
  });
});
```

### Phase 6: Advanced State Management Validation (THINK HARD ANALYSIS)

**🧠 CRITICAL STATE MANAGEMENT VALIDATION**: This phase implements ultra-deep state management testing with "think hard" level analysis to ensure bulletproof data integrity, persistence, and synchronization across the entire mortgage calculator application.

#### 🔬 State Architecture Analysis Framework

**Redux Store Architecture Validation**:
- **calculateMortgageSlice**: Primary mortgage calculation state
- **borrowersSlice**: Borrower personal information state  
- **borrowersPersonalDataSlice**: Extended borrower details state
- **otherBorrowersSlice**: Co-borrower information state
- **modalSlice**: UI modal state management
- **activeField**: Current form field focus state
- **languageSlice**: Internationalization state
- **authSlice**: Authentication state
- **loginSlice**: Login flow state

#### Test 6.1: Redux State Integrity and Persistence Validation
```typescript
describe('🧠 THINK HARD: Redux State Management Deep Analysis', () => {
  
  it('should maintain state integrity across all mortgage calculator steps', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // 🔍 DEEP STATE INSPECTION: Validate initial state structure
    cy.window().its('store').invoke('getState').then((state) => {
      // CRITICAL: Verify all required slices exist and are properly initialized
      const requiredSlices = [
        'calculateMortgage',
        'borrowers', 
        'borrowersPersonalData',
        'otherBorrowers',
        'modal',
        'activeField',
        'language',
        'auth'
      ];
      
      requiredSlices.forEach(slice => {
        expect(state).to.have.property(slice, `Redux slice ${slice} must exist`);
        expect(state[slice]).to.not.be.undefined;
        cy.log(`✅ Redux slice verified: ${slice}`);
      });
      
      // CRITICAL: Validate initial state values are not corrupted
      expect(state.calculateMortgage.currentStep).to.equal(1);
      expect(state.borrowers.mainBorrower).to.be.an('object');
      expect(state.language.currentLanguage).to.be.oneOf(['en', 'he', 'ru']);
      
      cy.log(`🧠 Initial Redux state validated: ${Object.keys(state).length} slices`);
    });
    
    // 🎯 STEP 1: Test state changes and persistence
    cy.get('[data-testid="property-value"]').type('1000000');
    cy.get('[data-testid="property-ownership"]').select("I don't own any property");
    cy.get('[data-testid="initial-payment-slider"]').invoke('val', 250000).trigger('input');
    
    // CRITICAL: Verify state updates immediately reflect in Redux store
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateMortgage.propertyValue).to.equal(1000000);
      expect(state.calculateMortgage.propertyOwnership).to.equal('no_property');
      expect(state.calculateMortgage.initialPayment).to.equal(250000);
      expect(state.calculateMortgage.loanAmount).to.equal(750000);
      
      cy.log(`✅ Step 1 state changes validated in Redux store`);
    });
    
    // 🚀 NAVIGATION: Test state persistence across step transitions
    cy.get('[data-testid="continue-button"]').click();
    cy.url().should('include', '/calculate-mortgage/2');
    
    // CRITICAL: Verify state persisted after navigation
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateMortgage.propertyValue).to.equal(1000000);
      expect(state.calculateMortgage.currentStep).to.equal(2);
      
      cy.log(`✅ State persistence validated across step 1→2 navigation`);
    });
    
    // 🎯 STEP 2: Test complex borrower state management
    cy.get('[data-testid="first-name"]').type('John');
    cy.get('[data-testid="last-name"]').type('Doe');
    cy.get('[data-testid="email"]').type('john.doe@example.com');
    
    // CRITICAL: Verify borrower state updates
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.borrowers.mainBorrower.firstName).to.equal('John');
      expect(state.borrowers.mainBorrower.lastName).to.equal('Doe');
      expect(state.borrowers.mainBorrower.email).to.equal('john.doe@example.com');
      
      cy.log(`✅ Borrower state updates validated`);
    });
    
    // 🔄 BACKWARDS NAVIGATION: Test state preservation going backwards
    cy.get('[data-testid="back-button"]').click();
    cy.url().should('include', '/calculate-mortgage/1');
    
    // CRITICAL: Verify all previous data is still present
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateMortgage.propertyValue).to.equal(1000000);
      expect(state.borrowers.mainBorrower.firstName).to.equal('John');
      
      cy.log(`✅ Backward navigation state preservation validated`);
    });
    
    cy.screenshot('state-management/redux-integrity-validation');
  });
  
  it('should handle concurrent state updates without race conditions', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // 🔄 RAPID FIRE TESTING: Simulate rapid user interactions
    const rapidInputs = [
      { field: '[data-testid="property-value"]', value: '500000' },
      { field: '[data-testid="property-value"]', value: '750000' },
      { field: '[data-testid="property-value"]', value: '1000000' },
      { field: '[data-testid="property-value"]', value: '1250000' },
      { field: '[data-testid="property-value"]', value: '1500000' }
    ];
    
    // Execute rapid inputs to test for race conditions
    rapidInputs.forEach((input, index) => {
      cy.get(input.field).clear().type(input.value);
      cy.wait(50); // Minimal wait to simulate rapid typing
      
      // Verify each update is properly captured
      cy.window().its('store').invoke('getState').then((state) => {
        expect(state.calculateMortgage.propertyValue).to.equal(parseInt(input.value));
        cy.log(`🔄 Rapid input ${index + 1} validated: ${input.value}`);
      });
    });
    
    // 🧮 CALCULATION CONSISTENCY: Verify final calculations are correct
    cy.window().its('store').invoke('getState').then((state) => {
      const expectedLoanAmount = state.calculateMortgage.propertyValue - state.calculateMortgage.initialPayment;
      expect(state.calculateMortgage.loanAmount).to.equal(expectedLoanAmount);
      
      cy.log(`🧮 Final calculation consistency validated`);
    });
    
    cy.screenshot('state-management/race-condition-testing');
  });
  
  it('should validate state synchronization with localStorage persistence', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // 💾 PERSISTENCE TESTING: Input data and verify localStorage sync
    const testData = {
      propertyValue: 2000000,
      propertyOwnership: 'own_property',
      initialPayment: 1000000
    };
    
    cy.get('[data-testid="property-value"]').type(testData.propertyValue.toString());
    cy.get('[data-testid="property-ownership"]').select('I own a property');
    cy.get('[data-testid="initial-payment-slider"]').invoke('val', testData.initialPayment).trigger('input');
    
    // CRITICAL: Verify localStorage contains persisted state
    cy.window().then((win) => {
      const persistedState = JSON.parse(win.localStorage.getItem('persist:root') || '{}');
      
      expect(persistedState).to.have.property('calculateMortgage');
      
      const mortgageState = JSON.parse(persistedState.calculateMortgage);
      expect(mortgageState.propertyValue).to.equal(testData.propertyValue);
      expect(mortgageState.propertyOwnership).to.equal('own_property');
      expect(mortgageState.initialPayment).to.equal(testData.initialPayment);
      
      cy.log(`💾 localStorage persistence validated`);
    });
    
    // 🔄 REFRESH TESTING: Reload page and verify state restoration
    cy.reload();
    cy.wait(2000); // Allow state rehydration
    
    // CRITICAL: Verify state was restored from localStorage
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateMortgage.propertyValue).to.equal(testData.propertyValue);
      expect(state.calculateMortgage.propertyOwnership).to.equal('own_property');
      expect(state.calculateMortgage.initialPayment).to.equal(testData.initialPayment);
      
      cy.log(`🔄 State restoration from localStorage validated`);
    });
    
    // 🧹 CLEANUP TESTING: Verify state can be cleared
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    
    cy.reload();
    cy.wait(2000);
    
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateMortgage.propertyValue).to.equal(0);
      expect(state.calculateMortgage.propertyOwnership).to.equal('');
      
      cy.log(`🧹 State cleanup validated`);
    });
    
    cy.screenshot('state-management/localStorage-persistence');
  });
});
```

#### Test 6.2: Form State and Component State Integration
```typescript
describe('🧠 THINK HARD: Form State Management Deep Analysis', () => {
  
  it('should validate Formik form state integration with Redux store', () => {
    cy.visit('/services/calculate-mortgage/2');
    
    // 📝 FORMIK INTEGRATION: Test form state management
    cy.window().then((win) => {
      // Check if Formik is properly initialized
      cy.get('form').should('exist');
      
      // Input values and track both Formik and Redux state
      cy.get('[data-testid="first-name"]').type('Test');
      cy.get('[data-testid="last-name"]').type('User');
      cy.get('[data-testid="email"]').type('test.user@example.com');
      
      // CRITICAL: Verify Formik validation state
      cy.get('[data-testid="first-name"]').should('not.have.class', 'error');
      cy.get('[data-testid="email"]').should('not.have.class', 'error');
      
      // Test invalid email validation
      cy.get('[data-testid="email"]').clear().type('invalid-email');
      cy.get('[data-testid="first-name"]').focus(); // Trigger validation
      
      cy.get('.error-message, [data-testid="email-error"]').should('be.visible');
      
      // Fix email and verify validation clears
      cy.get('[data-testid="email"]').clear().type('valid@example.com');
      cy.get('[data-testid="first-name"]').focus();
      
      cy.get('.error-message, [data-testid="email-error"]').should('not.exist');
      
      cy.log(`📝 Formik validation state validated`);
    });
    
    // 🔄 STEP TRANSITION: Verify form state persists across steps
    cy.get('[data-testid="continue-button"]').click();
    cy.get('[data-testid="back-button"]').click();
    
    // CRITICAL: Verify form values are restored
    cy.get('[data-testid="first-name"]').should('have.value', 'Test');
    cy.get('[data-testid="last-name"]').should('have.value', 'User');
    cy.get('[data-testid="email"]').should('have.value', 'valid@example.com');
    
    cy.log(`🔄 Form state persistence across navigation validated`);
    
    cy.screenshot('state-management/formik-integration');
  });
  
  it('should handle complex component state for mortgage calculator slider', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // 🎚️ SLIDER STATE: Test complex slider component state management
    cy.get('[data-testid="property-value"]').type('1000000');
    cy.get('[data-testid="property-ownership"]').select("I don't own any property");
    
    // CRITICAL: Test slider constraints are properly managed
    cy.get('[data-testid="initial-payment-slider"]').then($slider => {
      const maxValue = $slider.attr('max');
      expect(parseInt(maxValue)).to.equal(750000); // 75% of 1M for no property
      
      cy.log(`🎚️ Slider max constraint validated: ${maxValue}`);
    });
    
    // Test property ownership change updates slider constraints
    cy.get('[data-testid="property-ownership"]').select('I own a property');
    cy.wait(1000); // Allow state update
    
    cy.get('[data-testid="initial-payment-slider"]').then($slider => {
      const maxValue = $slider.attr('max');
      expect(parseInt(maxValue)).to.equal(500000); // 50% of 1M for owned property
      
      cy.log(`🎚️ Slider constraint update validated: ${maxValue}`);
    });
    
    // 🧮 REAL-TIME CALCULATION: Test calculation updates
    cy.get('[data-testid="initial-payment-slider"]').invoke('val', 400000).trigger('input');
    
    cy.get('[data-testid="loan-amount"]').should('contain', '600,000');
    
    // Verify Redux state is synchronized
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateMortgage.initialPayment).to.equal(400000);
      expect(state.calculateMortgage.loanAmount).to.equal(600000);
      
      cy.log(`🧮 Real-time calculation state sync validated`);
    });
    
    cy.screenshot('state-management/slider-component-state');
  });
});
```

#### Test 6.3: API State Synchronization and Error State Management
```typescript
describe('🧠 THINK HARD: API State Synchronization Deep Analysis', () => {
  
  it('should validate API loading states and error state management', () => {
    // 🌐 API MOCKING: Test different API response scenarios
    cy.intercept('GET', '**/api/v1/calculation-parameters**', { 
      delay: 2000,
      statusCode: 200,
      body: { data: { rates: [3.5, 4.0, 4.5, 5.0] } }
    }).as('slowAPI');
    
    cy.intercept('GET', '**/api/v1/banks**', { 
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('errorAPI');
    
    cy.visit('/services/calculate-mortgage/1');
    
    // CRITICAL: Verify loading state is properly managed
    cy.get('[data-testid="loading"], .loading-spinner').should('be.visible');
    cy.wait('@slowAPI');
    cy.get('[data-testid="loading"], .loading-spinner').should('not.exist');
    
    // Test Redux loading state
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateMortgage.isLoading).to.be.false;
      cy.log(`🌐 API loading state validated in Redux`);
    });
    
    // Navigate to step with error API
    cy.get('[data-testid="continue-button"]').click();
    cy.get('[data-testid="continue-button"]').click();
    cy.get('[data-testid="continue-button"]').click(); // Navigate to step 4
    
    cy.wait('@errorAPI');
    
    // CRITICAL: Verify error state is properly handled
    cy.get('[data-testid="error-message"], .error-banner').should('be.visible');
    
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateMortgage.error).to.exist;
      cy.log(`🚨 API error state validated in Redux`);
    });
    
    cy.screenshot('state-management/api-error-state');
  });
  
  it('should validate state cleanup and memory management', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // 🧹 MEMORY TESTING: Fill form with large amount of data
    const largeTestData = {
      propertyValue: 5000000,
      firstName: 'A'.repeat(100),
      lastName: 'B'.repeat(100),
      email: 'test@example.com',
      phone: '1234567890',
      address: 'C'.repeat(200)
    };
    
    // Fill Step 1
    cy.get('[data-testid="property-value"]').type(largeTestData.propertyValue.toString());
    cy.get('[data-testid="continue-button"]').click();
    
    // Fill Step 2
    cy.get('[data-testid="first-name"]').type(largeTestData.firstName);
    cy.get('[data-testid="last-name"]').type(largeTestData.lastName);
    cy.get('[data-testid="email"]').type(largeTestData.email);
    
    // CRITICAL: Check memory usage doesn't grow excessively
    cy.window().then((win) => {
      if (win.performance && win.performance.memory) {
        const initialMemory = win.performance.memory.usedJSHeapSize;
        cy.log(`💾 Initial memory usage: ${Math.round(initialMemory / 1024 / 1024)}MB`);
        
        // Perform memory-intensive operations
        for (let i = 0; i < 100; i++) {
          cy.get('[data-testid="first-name"]').clear().type(`Test${i}`);
        }
        
        const finalMemory = win.performance.memory.usedJSHeapSize;
        const memoryIncrease = finalMemory - initialMemory;
        
        cy.log(`💾 Final memory usage: ${Math.round(finalMemory / 1024 / 1024)}MB`);
        cy.log(`💾 Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
        
        // CRITICAL: Memory increase should be reasonable (<50MB for form operations)
        expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024, 'Memory leak detected');
      }
    });
    
    // 🗑️ STATE CLEANUP: Test state reset functionality
    cy.window().its('store').invoke('dispatch', { 
      type: 'calculateMortgage/resetState' 
    });
    
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateMortgage.propertyValue).to.equal(0);
      expect(state.borrowers.mainBorrower.firstName).to.equal('');
      
      cy.log(`🗑️ State cleanup validated`);
    });
    
    cy.screenshot('state-management/memory-management');
  });
});
```

#### Test 6.4: Cross-Component State Communication
```typescript
describe('🧠 THINK HARD: Cross-Component State Communication', () => {
  
  it('should validate state communication between mortgage calculator components', () => {
    cy.visit('/services/calculate-mortgage/1');
    
    // 🔗 COMPONENT COMMUNICATION: Test property value affects multiple components
    cy.get('[data-testid="property-value"]').type('2000000');
    
    // CRITICAL: Verify multiple components update simultaneously
    cy.get('[data-testid="loan-amount-display"]').should('be.visible');
    cy.get('[data-testid="down-payment-percentage"]').should('be.visible');
    cy.get('[data-testid="monthly-payment-estimate"]').should('be.visible');
    
    // Test property ownership affects slider and loan calculations
    cy.get('[data-testid="property-ownership"]').select("I don't own any property");
    
    cy.get('[data-testid="initial-payment-slider"]').should('have.attr', 'max', '1500000');
    cy.get('[data-testid="max-loan-amount"]').should('contain', '1,500,000');
    
    // CRITICAL: Verify state changes propagate to all dependent components
    cy.get('[data-testid="initial-payment-slider"]').invoke('val', 500000).trigger('input');
    
    cy.get('[data-testid="loan-amount"]').should('contain', '1,500,000');
    cy.get('[data-testid="down-payment-percentage"]').should('contain', '25%');
    
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.calculateMortgage.loanAmount).to.equal(1500000);
      expect(state.calculateMortgage.downPaymentPercentage).to.equal(25);
      
      cy.log(`🔗 Cross-component state communication validated`);
    });
    
    cy.screenshot('state-management/cross-component-communication');
  });
  
  it('should validate modal state management integration', () => {
    cy.visit('/services/calculate-mortgage/2');
    
    // 🪟 MODAL STATE: Test modal component state integration
    cy.get('[data-testid="help-button"], [data-testid="info-button"]').first().click();
    
    // CRITICAL: Verify modal state is tracked in Redux
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.modal.isOpen).to.be.true;
      expect(state.modal.modalType).to.exist;
      
      cy.log(`🪟 Modal state validated in Redux`);
    });
    
    // Verify modal content is displayed
    cy.get('[data-testid="modal"], .modal').should('be.visible');
    
    // Close modal and verify state cleanup
    cy.get('[data-testid="modal-close"], .modal-close').click();
    
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.modal.isOpen).to.be.false;
      
      cy.log(`🪟 Modal state cleanup validated`);
    });
    
    cy.screenshot('state-management/modal-state-integration');
  });
});
```

### Phase 7: Cross-Browser Testing with Playwright

#### Test 7.1: Multi-Browser Validation
```typescript
// playwright/mortgage-calculator.spec.ts
import { test, expect, devices } from '@playwright/test';

const browsers = ['chromium', 'firefox', 'webkit'];
const steps = [1, 2, 3, 4];

browsers.forEach(browserName => {
  test.describe(`Mortgage Calculator - ${browserName}`, () => {
    
    steps.forEach(step => {
      test(`Step ${step} should work correctly in ${browserName}`, async ({ page, browserName }) => {
        await page.goto(`http://localhost:5173/services/calculate-mortgage/${step}`);
        
        // Wait for page load
        await page.waitForLoadState('networkidle');
        
        // Check basic functionality
        await expect(page.locator('[data-testid="progress-step-' + step + '"]')).toBeVisible();
        
        if (step === 1) {
          // Test property value input
          await page.fill('[data-testid="property-value"]', '1000000');
          
          // Test property ownership selection
          await page.selectOption('[data-testid="property-ownership"]', { label: "I don't own any property" });
          
          // Test slider interaction
          await page.locator('[data-testid="initial-payment-slider"]').fill('250000');
          
          // Verify loan amount calculation
          await expect(page.locator('[data-testid="loan-amount"]')).toContainText('750,000');
          
          // Take screenshot with enhanced metadata
          const screenshotPath = `screenshots/${browserName}/step${step}-completed.png`;
          await page.screenshot({ 
            path: screenshotPath,
            fullPage: true
          });
          
          // Log screenshot info for report generation
          console.log(`📸 Screenshot saved: ${screenshotPath}`);
          console.log(`🔗 Absolute path: ${path.resolve(screenshotPath)}`);
        }
        
        // Test navigation to next step
        await page.click('[data-testid="continue-button"]');
        await page.waitForURL(`**/calculate-mortgage/${step + 1}`);
      });
    });
    
    test(`Should work on mobile viewport in ${browserName}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('http://localhost:5173/services/calculate-mortgage/1');
      
      // Test mobile interactions
      await page.fill('[data-testid="property-value"]', '1000000');
      await page.selectOption('[data-testid="property-ownership"]', { index: 1 });
      
      // Test mobile slider
      const slider = page.locator('[data-testid="initial-payment-slider"]');
      await slider.hover();
      await slider.fill('250000');
      
      // Take mobile screenshot with enhanced metadata
      const mobileScreenshotPath = `screenshots/${browserName}/mobile-step1.png`;
      await page.screenshot({ 
        path: mobileScreenshotPath,
        fullPage: true
      });
      
      // Log mobile screenshot info for report generation
      console.log(`📱 Mobile screenshot saved: ${mobileScreenshotPath}`);
      console.log(`🔗 Absolute path: ${path.resolve(mobileScreenshotPath)}`);
    });
  });
});
```

---

## <� EXECUTION INSTRUCTIONS

### Setup Requirements

#### 1. Development Environment
```bash
# Ensure servers are running
npm run dev                    # Backend API (port 8003)
cd mainapp && npm run dev     # Frontend (port 5173)

# Install testing dependencies
npm install --save-dev @playwright/test axe-core cypress-axe
```

#### 2. Figma Design Assets
```bash
# Create screenshots directory structure
mkdir -p cypress/screenshots/figma-comparison
mkdir -p playwright/screenshots
mkdir -p design-assets/figma-exports

# Export Figma designs as PNG:
# 1. Navigate to Figma mortgage calculator designs
# 2. Export each step at 1x, 2x resolution
# 3. Name files: Design-Step1-mobile.png, Design-Step1-tablet.png, etc.
# 4. Place in design-assets/figma-exports/
```

#### 3. Test Execution Commands

#### Cypress E2E Testing
```bash
cd mainapp

# Run all mortgage calculator tests
npx cypress run --spec "cypress/e2e/mortgage-calculator-comprehensive.cy.ts"

# Run specific test categories
npx cypress run --spec "cypress/e2e/mortgage-calculator-comprehensive.cy.ts" --grep "Business Logic"
npx cypress run --spec "cypress/e2e/mortgage-calculator-comprehensive.cy.ts" --grep "Figma Design"
npx cypress run --spec "cypress/e2e/mortgage-calculator-comprehensive.cy.ts" --grep "Hebrew RTL"

# Interactive testing with Cypress UI
npx cypress open
```

#### Playwright Cross-Browser Testing
```bash
# Install browsers
npx playwright install

# Run cross-browser tests
npx playwright test mortgage-calculator.spec.ts

# Run specific browser
npx playwright test mortgage-calculator.spec.ts --project=chromium
npx playwright test mortgage-calculator.spec.ts --project=firefox
npx playwright test mortgage-calculator.spec.ts --project=webkit

# Debug mode
npx playwright test mortgage-calculator.spec.ts --debug

# Generate HTML report
npx playwright test mortgage-calculator.spec.ts --reporter=html
```

#### Accessibility Testing
```bash
# Install axe-core CLI
npm install -g @axe-core/cli

# Run accessibility audit
axe http://localhost:5173/services/calculate-mortgage/1 --tags wcag2a,wcag2aa

# Generate accessibility report
axe http://localhost:5173/services/calculate-mortgage/1 --save results.json
```

### Test Data Configuration

#### Required Test Scenarios
```yaml
Property Value Scenarios:
  - minimum: 100000    # 100K NIS
  - typical: 1000000   # 1M NIS  
  - maximum: 10000000  # 10M NIS

Property Ownership Scenarios:
  - no_property: "I don't own any property"
  - own_property: "I own a property"
  - selling_property: "I'm selling a property"

Interest Rate Scenarios:
  - default: 5.0
  - low: 3.5
  - high: 7.0

Loan Term Scenarios:
  - short: 15 years
  - typical: 25 years
  - long: 30 years

User Profile Scenarios:
  - single_borrower: One applicant
  - joint_application: Two applicants
  - high_income: Monthly income > 20,000 NIS
  - moderate_income: Monthly income 10,000-20,000 NIS
```

---

## =� VALIDATION CHECKLIST

### Business Logic Validation 
- [ ] Property ownership LTV calculations (75%, 50%, 70%)
- [ ] Initial payment slider range validation
- [ ] Loan amount real-time calculation
- [ ] Interest rate default and custom input
- [ ] Monthly payment calculation accuracy
- [ ] Income vs payment ratio validation
- [ ] Form field validation and error states
- [ ] Step progression logic
- [ ] Data persistence between steps
- [ ] Final application submission

### Figma Design Compliance 
- [ ] Color palette exact match (#FFD700, #333535, etc.)
- [ ] Typography specifications (font sizes, weights)
- [ ] Component spacing and layout
- [ ] Progress indicator design
- [ ] Button styling and states
- [ ] Form field design consistency
- [ ] Modal and dropdown styling
- [ ] Responsive layout breakpoints
- [ ] Visual hierarchy and emphasis
- [ ] Icon usage and placement

### Multi-Language Support 
- [ ] English (LTR) complete translation
- [ ] Hebrew (RTL) layout and translation
- [ ] Russian (LTR) complete translation
- [ ] RTL text alignment and direction
- [ ] Hebrew font loading (Arimo)
- [ ] Number formatting localization
- [ ] Date format localization
- [ ] Currency symbol display
- [ ] Form placeholder translations
- [ ] Error message translations

### Responsive Design 
- [ ] Mobile viewport (320-414px) functionality
- [ ] Tablet viewport (768-820px) layout
- [ ] Desktop viewport (1280-1920px) optimization
- [ ] Touch target sizing (44px minimum)
- [ ] Horizontal scroll prevention
- [ ] Image responsiveness
- [ ] Typography scaling
- [ ] Navigation adaptation
- [ ] Form layout optimization
- [ ] Modal viewport boundaries

### Performance & Accessibility 
- [ ] Page load time < 3 seconds
- [ ] DOM Content Loaded < 2 seconds
- [ ] No layout shifts during load
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Focus indicator visibility
- [ ] Color contrast ratios (4.5:1)
- [ ] Alternative text for images
- [ ] Form label associations

### Cross-Browser Compatibility 
- [ ] Chrome/Chromium functionality
- [ ] Firefox compatibility
- [ ] Safari/WebKit testing
- [ ] Edge browser support
- [ ] iOS Safari mobile testing
- [ ] Android Chrome testing
- [ ] JavaScript feature support
- [ ] CSS property compatibility
- [ ] Form input behavior
- [ ] Event handling consistency

---

## =� CRITICAL FAILURE CRITERIA

### Blocking Issues (Must Fix Before Release)
1. **Property Ownership LTV Logic Failure** - Incorrect loan-to-value calculations
2. **Payment Calculation Errors** - Wrong monthly payment amounts
3. **Step Progression Blocking** - Users cannot advance through steps
4. **Data Loss Between Steps** - Form data not persisted
5. **Hebrew RTL Layout Broken** - RTL text not displaying correctly
6. **Mobile Unusability** - Touch targets too small or forms not functional
7. **Accessibility Violations** - WCAG AA failures blocking users
8. **Cross-Browser Failures** - Core functionality broken in major browsers

### Warning Issues (Should Fix)
1. **Minor Figma Design Deviations** - Colors or spacing slightly off
2. **Performance Optimizations** - Load times could be improved
3. **Translation Gaps** - Some text not translated in all languages
4. **Enhanced Accessibility** - Improvements beyond minimum compliance

### Enhancement Opportunities
1. **Advanced Animations** - Smooth transitions and micro-interactions
2. **Progressive Enhancement** - Offline functionality
3. **Advanced Validation** - Real-time bank API validation
4. **Analytics Integration** - User behavior tracking

---

## =� REPORTING REQUIREMENTS

### Test Execution Report Template
```markdown
# Mortgage Calculator Testing Report
**Date:** [Date]
**Tester:** [Name]
**Environment:** [Local/Staging/Production]

## Executive Summary
- **Total Tests:** [X]
- **Passed:** [X]
- **Failed:** [X]
- **Blocking Issues:** [X]
- **Overall Status:** [PASS/FAIL/CONDITIONAL]

## Business Logic Results
[Detailed results of LTV calculations, payment calculations, etc.]

## Figma Design Compliance
[Visual comparison results with design system validation]

## Multi-Language Testing
[Translation completeness and RTL implementation results]

## Performance Metrics
[Load times, accessibility scores, Core Web Vitals]

## Cross-Browser Matrix
[Compatibility results across all tested browsers]

## Critical Issues Found
[List of blocking and warning issues with severity levels]

## Recommendations
[Prioritized list of fixes and improvements]
```

### Evidence Collection Requirements
- **Screenshots:** All test steps across all viewports and languages
- **Videos:** Critical user flows and interaction testing
- **Performance Data:** Load times, metrics, accessibility scores
- **Browser Compatibility:** Matrix of all browser/device combinations
- **Design Comparison:** Side-by-side Figma vs implementation screenshots

---

## <� SUCCESS CRITERIA

### Minimum Viable Release Criteria
1.  **100% Business Logic Tests Pass** - All LTV calculations correct
2.  **95% Figma Design Match** - Critical design elements accurate
3.  **Complete Multi-Language Support** - All three languages functional
4.  **Full Responsive Design** - All viewports properly supported
5.  **WCAG 2.1 AA Compliance** - Accessibility standards met
6.  **Cross-Browser Compatibility** - Chrome, Firefox, Safari working
7.  **Performance Benchmarks** - Load times under 3 seconds
8.  **Zero Blocking Issues** - No critical failures preventing use

### Excellence Criteria (Stretch Goals)
1. <� **Pixel-Perfect Figma Match** - Exact visual implementation
2. <� **Sub-2-Second Load Times** - Exceptional performance
3. <� **WCAG 2.1 AAA Features** - Enhanced accessibility
4. <� **Advanced Animations** - Smooth micro-interactions
5. <� **Progressive Web App** - Offline functionality
6. <� **Real-Time Validation** - Bank API integration
7. <� **Analytics Integration** - User behavior insights
8. <� **A/B Testing Framework** - Optimization capability

---

## 🚨 PHASE 0 EXECUTION SUMMARY

### CRITICAL DROPDOWN VALIDATION REQUIREMENTS
**MANDATORY**: Before any other testing phases, execute Phase 0 to validate:

1. **✅ ALL DROPDOWNS HAVE OPTIONS**: No empty dropdowns across steps 1-4
2. **✅ PROPERTY OWNERSHIP LTV LOGIC**: Exact 3 options with correct 75%/50%/70% calculations
3. **✅ CONDITIONAL UI ELEMENTS**: Dropdowns in steps 2-4 that reveal additional form fields
4. **✅ DATABASE INTEGRATION**: All dropdown data loads from API/content management system
5. **✅ MULTI-LANGUAGE SUPPORT**: Hebrew/English/Russian dropdown translations
6. **✅ ACCESSIBILITY COMPLIANCE**: ARIA attributes and keyboard navigation
7. **✅ ERROR STATE HANDLING**: Loading states and failed API responses

### BLOCKING FAILURE CRITERIA
- **🚫 EMPTY DROPDOWNS**: Any dropdown without options = immediate test failure
- **🚫 MISSING LTV LOGIC**: Property ownership not affecting loan calculations = blocking issue
- **🚫 BROKEN CONDITIONAL UI**: Dropdown selections not revealing expected UI elements = critical failure
- **🚫 API INTEGRATION FAILURE**: Dropdowns not loading from database = system failure

### EXECUTION COMMAND
```bash
# Execute Phase 0 FIRST before any other testing
cd mainapp
npx cypress run --spec "cypress/e2e/mortgage-dropdown-validation.cy.ts"

# Only proceed to other phases if Phase 0 passes 100%
```

---

## 📊 HTML REPORT GENERATION

### Automated HTML Test Report Creation

After completing all testing phases, generate a comprehensive HTML report with timestamp for documentation and stakeholder review.

#### Report Generation Commands

```bash
# Generate timestamped HTML report for all phases
cd mainapp

# Set timestamp variable
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_NAME="mortgage_calculator_validation_report_${TIMESTAMP}"

# Run all test phases and generate HTML report
npx cypress run \
  --spec "cypress/e2e/mortgage-dropdown-validation.cy.ts,cypress/e2e/mortgage-calculator-comprehensive.cy.ts" \
  --reporter mochawesome \
  --reporter-options "reportDir=../server/docs/QA/mortgageStep1,2,3,4/reports,reportFilename=${REPORT_NAME},overwrite=false,html=true,json=true,timestamp=mmddyyyy_HHMMss"

# Alternative: Generate report with Playwright
npx playwright test mortgage-calculator.spec.ts \
  --reporter=html \
  --output="../server/docs/QA/mortgageStep1,2,3,4/reports/playwright_${REPORT_NAME}.html"

# Combine Cypress and Playwright reports
npm run generate-combined-report ${TIMESTAMP}
```

#### Custom HTML Report Template

Create comprehensive report with the following structure:

```typescript
// cypress/support/report-generator.ts
export function generateTimestampedReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportName = `mortgage_calculator_bulletproof_validation_${timestamp}`;
  
  const reportTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏦 Mortgage Calculator Validation Report - ${timestamp}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: #f5f7fa; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .phase { background: white; margin: 1rem 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .phase-header { background: #4CAF50; color: white; padding: 1rem; border-radius: 8px 8px 0 0; }
        .phase-header.failed { background: #f44336; }
        .phase-header.warning { background: #ff9800; }
        .phase-content { padding: 1.5rem; }
        .test-result { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
        .status-pass { color: #4CAF50; font-weight: bold; }
        .status-fail { color: #f44336; font-weight: bold; }
        .status-skip { color: #ff9800; font-weight: bold; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .metric-card { background: white; padding: 1rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2rem; font-weight: bold; color: #667eea; }
        .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .screenshot { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .screenshot img { width: 100%; height: auto; }
        .screenshot-caption { padding: 0.5rem; background: #f8f9fa; font-size: 0.9rem; }
        .executive-summary { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 2rem; border-radius: 8px; margin: 1rem 0; }
        .critical-issues { background: #ffebee; border-left: 4px solid #f44336; padding: 1rem; margin: 1rem 0; }
        .timestamp { font-family: monospace; background: #e3f2fd; padding: 0.5rem; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏦 MORTGAGE CALCULATOR BULLETPROOF VALIDATION</h1>
        <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
        <p>Target: http://localhost:5173/services/calculate-mortgage/1,2,3,4</p>
    </div>
    
    <div class="container">
        <!-- Executive Summary -->
        <div class="executive-summary">
            <h2>📋 Executive Summary</h2>
            <div id="summary-content">
                <!-- Populated by test results -->
            </div>
        </div>

        <!-- Test Metrics -->
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value" id="total-tests">0</div>
                <div>Total Tests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="passed-tests">0</div>
                <div>Passed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="failed-tests">0</div>
                <div>Failed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="test-duration">0</div>
                <div>Duration (ms)</div>
            </div>
        </div>

        <!-- Phase 0: Critical Dropdown Validation -->
        <div class="phase">
            <div class="phase-header" id="phase0-header">
                <h3>🚨 Phase 0: Critical Dropdown Logic Validation</h3>
            </div>
            <div class="phase-content" id="phase0-content">
                <!-- Dropdown validation results -->
            </div>
        </div>

        <!-- Phase 1: Business Logic -->
        <div class="phase">
            <div class="phase-header" id="phase1-header">
                <h3>💰 Phase 1: Business Logic Validation</h3>
            </div>
            <div class="phase-content" id="phase1-content">
                <!-- Business logic test results -->
            </div>
        </div>

        <!-- Phase 2: Figma Design Comparison -->
        <div class="phase">
            <div class="phase-header" id="phase2-header">
                <h3>🎨 Phase 2: Figma Design Comparison</h3>
            </div>
            <div class="phase-content" id="phase2-content">
                <!-- Design comparison results -->
            </div>
        </div>

        <!-- Phase 3: Multi-Language RTL -->
        <div class="phase">
            <div class="phase-header" id="phase3-header">
                <h3>🌍 Phase 3: Multi-Language RTL Testing</h3>
            </div>
            <div class="phase-content" id="phase3-content">
                <!-- RTL and translation results -->
            </div>
        </div>

        <!-- Phase 4: Responsive Design -->
        <div class="phase">
            <div class="phase-header" id="phase4-header">
                <h3>📱 Phase 4: Responsive Design Validation</h3>
            </div>
            <div class="phase-content" id="phase4-content">
                <!-- Responsive design results -->
            </div>
        </div>

        <!-- Phase 5: Performance & Accessibility -->
        <div class="phase">
            <div class="phase-header" id="phase5-header">
                <h3>⚡ Phase 5: Performance & Accessibility</h3>
            </div>
            <div class="phase-content" id="phase5-content">
                <!-- Performance and accessibility results -->
            </div>
        </div>

        <!-- Phase 6: Cross-Browser Testing -->
        <div class="phase">
            <div class="phase-header" id="phase6-header">
                <h3>🌐 Phase 6: Cross-Browser Testing</h3>
            </div>
            <div class="phase-content" id="phase6-content">
                <!-- Cross-browser results -->
            </div>
        </div>

        <!-- Screenshots Gallery -->
        <div class="phase">
            <div class="phase-header">
                <h3>📸 Evidence Screenshots</h3>
            </div>
            <div class="phase-content">
                <div class="screenshots" id="screenshots-gallery">
                    <!-- Screenshots populated dynamically -->
                </div>
            </div>
        </div>

        <!-- Critical Issues -->
        <div class="critical-issues" id="critical-issues" style="display: none;">
            <h3>🚨 Critical Issues Found</h3>
            <div id="issues-content">
                <!-- Critical issues listed here -->
            </div>
        </div>

        <!-- Recommendations -->
        <div class="phase">
            <div class="phase-header">
                <h3>💡 Recommendations</h3>
            </div>
            <div class="phase-content" id="recommendations">
                <!-- Recommendations for improvements -->
            </div>
        </div>
    </div>

    <script>
        // Report data populated by test runner
        const reportData = {
            timestamp: '${timestamp}',
            phases: [],
            metrics: {},
            screenshots: [],
            issues: [],
            recommendations: []
        };

        // Function to populate report with test data
        function populateReport(data) {
            // Update metrics
            document.getElementById('total-tests').textContent = data.metrics.total || 0;
            document.getElementById('passed-tests').textContent = data.metrics.passed || 0;
            document.getElementById('failed-tests').textContent = data.metrics.failed || 0;
            document.getElementById('test-duration').textContent = data.metrics.duration || 0;

            // Populate phase results
            data.phases.forEach((phase, index) => {
                const phaseContent = document.getElementById(\`phase\${index}-content\`);
                const phaseHeader = document.getElementById(\`phase\${index}-header\`);
                
                if (phase.status === 'failed') {
                    phaseHeader.classList.add('failed');
                } else if (phase.status === 'warning') {
                    phaseHeader.classList.add('warning');
                }

                phaseContent.innerHTML = phase.tests.map(test => \`
                    <div class="test-result">
                        <span>\${test.title}</span>
                        <span class="status-\${test.status}">\${test.status.toUpperCase()}</span>
                    </div>
                \`).join('');
            });

            // Populate screenshots
            const screenshotsGallery = document.getElementById('screenshots-gallery');
            screenshotsGallery.innerHTML = data.screenshots.map(screenshot => \`
                <div class="screenshot">
                    <img src="\${screenshot.path}" alt="\${screenshot.description}" loading="lazy">
                    <div class="screenshot-caption">\${screenshot.description}</div>
                </div>
            \`).join('');

            // Show critical issues if any
            if (data.issues.length > 0) {
                const issuesSection = document.getElementById('critical-issues');
                const issuesContent = document.getElementById('issues-content');
                issuesSection.style.display = 'block';
                issuesContent.innerHTML = data.issues.map(issue => \`
                    <div style="margin: 0.5rem 0;">
                        <strong>\${issue.severity}:</strong> \${issue.description}
                    </div>
                \`).join('');
            }

            // Populate recommendations
            const recommendationsContent = document.getElementById('recommendations');
            recommendationsContent.innerHTML = data.recommendations.map(rec => \`
                <div style="margin: 0.5rem 0;">• \${rec}</div>
            \`).join('');
        }

        // Auto-refresh capability for live reporting
        function enableLiveReporting() {
            setInterval(() => {
                fetch('./report-data.json')
                    .then(response => response.json())
                    .then(data => populateReport(data))
                    .catch(err => console.log('Live update failed:', err));
            }, 5000);
        }

        // Initialize report
        document.addEventListener('DOMContentLoaded', () => {
            // Enable live reporting if in development
            if (window.location.hostname === 'localhost') {
                enableLiveReporting();
            }
        });
    </script>
</body>
</html>`;

  return { reportName, reportTemplate };
}
```

#### Report Generation Script

```javascript
// package.json script addition
{
  "scripts": {
    "generate-report": "node scripts/generate-html-report.js",
    "test:mortgage:report": "npm run test:mortgage && npm run generate-report"
  }
}

// scripts/generate-html-report.js
const fs = require('fs');
const path = require('path');

function generateTimestampedHTMLReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportDir = path.join(__dirname, '../server/docs/QA/mortgageStep1,2,3,4/reports');
  const reportName = `mortgage_calculator_validation_${timestamp}.html`;
  const reportPath = path.join(reportDir, reportName);

  // Ensure report directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Read test results from Cypress/Playwright outputs
  const cypressResults = readCypressResults();
  const playwrightResults = readPlaywrightResults();
  
  // Generate comprehensive HTML report
  const htmlContent = generateHTMLReport({
    timestamp,
    cypressResults,
    playwrightResults,
    screenshots: collectScreenshots(),
    metrics: calculateMetrics()
  });

  // Write HTML report
  fs.writeFileSync(reportPath, htmlContent);
  
  console.log(`\n📊 HTML Report Generated:`);
  console.log(`📂 Location: ${reportPath}`);
  console.log(`🌐 Open in browser: file://${reportPath}`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  
  return reportPath;
}

function readCypressResults() {
  // Read from mochawesome-report/mochawesome.json
  try {
    const resultsPath = path.join(__dirname, '../mainapp/mochawesome-report/mochawesome.json');
    return JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  } catch (error) {
    console.warn('Cypress results not found:', error.message);
    return null;
  }
}

function readPlaywrightResults() {
  // Read from playwright-report/results.json
  try {
    const resultsPath = path.join(__dirname, '../playwright-report/results.json');
    return JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  } catch (error) {
    console.warn('Playwright results not found:', error.message);
    return null;
  }
}

function collectScreenshots() {
  const screenshotDirs = [
    path.join(__dirname, '../mainapp/cypress/screenshots'),
    path.join(__dirname, '../test-results')
  ];
  
  const screenshots = [];
  
  screenshotDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true });
      files.forEach(file => {
        if (file.endsWith('.png')) {
          screenshots.push({
            path: path.join(dir, file),
            name: file,
            description: file.replace(/[-_]/g, ' ').replace('.png', '')
          });
        }
      });
    }
  });
  
  return screenshots;
}

function calculateMetrics() {
  // Calculate comprehensive test metrics
  return {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    duration: 0,
    coverage: 0
  };
}

// Execute if called directly
if (require.main === module) {
  generateTimestampedHTMLReport();
}

module.exports = { generateTimestampedHTMLReport };
```

#### Execute Report Generation

```bash
# Complete testing workflow with timestamped HTML report
cd /Users/michaelmishayev/Projects/bankDev2_standalone

# Set timestamp for all artifacts
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
echo "🕐 Starting mortgage calculator validation at: $TIMESTAMP"

# Execute all test phases
cd mainapp
npx cypress run --spec "cypress/e2e/mortgage-dropdown-validation.cy.ts,cypress/e2e/mortgage-calculator-comprehensive.cy.ts" --reporter mochawesome

# Generate timestamped HTML report
cd ..
node scripts/generate-html-report.js

# Open report in browser (macOS)
open "server/docs/QA/mortgageStep1,2,3,4/reports/mortgage_calculator_validation_${TIMESTAMP}.html"

echo "✅ Complete validation report generated with timestamp: $TIMESTAMP"
```

### Report Features

The generated HTML report includes:

- **📊 Real-time Metrics**: Test counts, pass/fail rates, execution time
- **🚨 Phase 0 Priority**: Critical dropdown validation results prominently displayed
- **📸 Screenshot Gallery**: All evidence screenshots with descriptions
- **🎯 Executive Summary**: High-level validation status
- **⚠️ Critical Issues**: Blocking failures highlighted
- **💡 Recommendations**: Actionable next steps
- **⏰ Timestamp**: Exact execution time in filename and content
- **🔄 Live Updates**: Real-time updates during test execution
- **📱 Responsive Design**: Report viewable on all devices

**This comprehensive testing instruction ensures bulletproof validation of the mortgage calculator against all specifications, designs, and business requirements. Execute Phase 0 FIRST and systematically document all findings for production-ready confidence.**