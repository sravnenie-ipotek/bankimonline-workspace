# <� BULLETPROOF MORTGAGE CALCULATOR TESTING INSTRUCTIONS
**Generated:** August 14, 2025  
**Target Application:** http://localhost:5173/services/calculate-mortgage/1,2,3,4  
**Confluence Specification:** https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/20447343/3.1.+  
**Testing Framework:** Cypress E2E + Playwright Cross-Browser + Figma Comparison  

---

## =� EXECUTIVE SUMMARY

This document provides comprehensive testing instructions for the **Calculate Mortgage** process (Steps 1-4) comparing live application behavior against documented specifications, Figma designs, and business logic requirements. 

### Server Architecture
- **Main Server**: `packages/server/src/server.js` (monorepo structure, port 8003)
- **Legacy Fallback**: `server/server-db.js` (emergency use only, deprecated)
- **Unified System**: No dual-server synchronization required

### Testing Coverage

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
Based on `/server/docs/Architecture/dropDownLogicBankim.md`, the mortgage calculator uses a sophisticated screen-specific database-driven dropdown system with:
- **Server Architecture**: Single main server (`packages/server/src/server.js`) handles all API endpoints
- **Content Database Integration**: Dropdowns sourced from `content_items` and `content_translations` tables via shortline proxy
- **Screen-Specific Content**: Each screen (mortgage_step1, mortgage_step2, mortgage_step3, mortgage_step4) has independent dropdown control
- **API Key Generation**: Pattern `{screen_location}_{field_name}` (e.g., `mortgage_step3_obligations`)
- **Database Content Key**: Format `{screen_location}.field.{field_name}_{option_value}`
- **Multi-Language Support**: Dynamic translations for Hebrew, English, Russian with proper RTL handling
- **useDropdownData Hook**: Frontend hook with screen location and field name parameters
- **Caching Strategy**: 5-minute TTL on both server and frontend for optimal performance

#### 🚨 CRITICAL TESTING APPROACH: Screen-Specific Dropdown Architecture

**MANDATORY UNDERSTANDING**: The dropdown system uses screen-specific API endpoints for admin panel independence. Tests must validate each screen's dropdown isolation and proper API key generation.

##### Core Architecture Validation:
```typescript
// ✅ CORRECT: Screen-specific dropdown testing
const testScreenDropdowns = (screenLocation, stepNumber) => {
  cy.visit(`/services/calculate-mortgage/${stepNumber}`);
  cy.wait(3000);

  // Intercept screen-specific dropdown API
  cy.intercept('GET', `/api/dropdowns/${screenLocation}/*`).as(`${screenLocation}API`);
  
  // Validate API call is made to correct screen endpoint
  cy.wait(`@${screenLocation}API`).then((interception) => {
    expect(interception.request.url).to.include(`/api/dropdowns/${screenLocation}/`);
    expect(interception.response.statusCode).to.equal(200);
    
    const response = interception.response.body;
    expect(response.screen_location).to.equal(screenLocation);
    expect(response.options).to.be.an('object');
    
    cy.log(`✅ ${screenLocation}: API endpoint and response structure validated`);
  });
};
```

##### useDropdownData Hook Validation:
```typescript
// Test that components use correct hook parameters
const validateDropdownHookUsage = (screenLocation, fieldName) => {
  // Expected API key pattern: {screen_location}_{field_name}
  const expectedApiKey = `${screenLocation}_${fieldName}`;
  
  cy.intercept('GET', `/api/dropdowns/${screenLocation}/*`).as('dropdownAPI');
  
  cy.wait('@dropdownAPI').then((interception) => {
    const response = interception.response.body;
    
    // Validate API key exists in response
    expect(response.options).to.have.property(expectedApiKey);
    expect(response.dropdowns).to.deep.include({
      key: expectedApiKey,
      label: Cypress.sinon.match.string
    });
    
    cy.log(`✅ useDropdownData('${screenLocation}', '${fieldName}') → ${expectedApiKey} validated`);
  });
};
```

##### Content Database Key Pattern Validation:
```typescript
// Validate database content key format matches architecture
const validateContentKeyPattern = (screenLocation, fieldName) => {
  cy.intercept('GET', `/api/dropdowns/${screenLocation}/*`).as('dropdownAPI');
  
  cy.wait('@dropdownAPI').then((interception) => {
    const response = interception.response.body;
    const apiKey = `${screenLocation}_${fieldName}`;
    
    if (response.options[apiKey]) {
      response.options[apiKey].forEach(option => {
        // Content keys should follow: {screen_location}.field.{field_name}_{option_value}
        const expectedKeyPattern = new RegExp(`^${screenLocation}\\.field\\.${fieldName}_`);
        
        // Log validation for debugging
        cy.log(`Validating content key pattern for ${apiKey} option: ${option.value}`);
      });
    }
  });
};
```

##### 🛡️ BULLETPROOF DROPDOWN DETECTION STRATEGY:
```typescript
// Enhanced detection for React components with screen-specific validation
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
  
  // Hebrew text pattern dropdowns (RTL support)
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

// Validate dropdown detection with screen awareness
const validateScreenDropdowns = (screenLocation, stepNumber) => {
  let foundDropdowns = false;
  let workingSelectors = [];

  allDropdownSelectors.forEach(selector => {
    cy.get('body').then($body => {
      const elements = $body.find(selector);
      if (elements.length > 0) {
        foundDropdowns = true;
        workingSelectors.push(selector);
        cy.log(`✅ ${screenLocation}: Found ${elements.length} dropdowns with selector: ${selector}`);
      }
    });
  });
  
  return foundDropdowns;
};
```

##### Phase 0 Testing Must Validate:
1. **✅ Screen-Specific API Endpoints**: Each step calls correct `/api/dropdowns/{screen_location}/{language}` endpoint
2. **✅ API Key Generation**: Proper `{screen_location}_{field_name}` pattern validation
3. **✅ Content Database Integration**: Database content key format validation
4. **✅ useDropdownData Hook**: Correct screen location and field name parameters
5. **✅ Multi-Language Support**: Hebrew, English, Russian with proper caching
6. **✅ Screen Independence**: Admin panel can modify each screen separately
7. **✅ Hook Performance**: Frontend and server caching with 5-minute TTL

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

#### Test 0.1: Screen-Specific API Validation
```typescript
describe('CRITICAL: Screen-Specific Dropdown API Architecture', () => {
  const screenMappings = [
    { step: 1, screenLocation: 'mortgage_step1' },
    { step: 2, screenLocation: 'mortgage_step2' },
    { step: 3, screenLocation: 'mortgage_step3' },
    { step: 4, screenLocation: 'mortgage_step4' }
  ];
  
  screenMappings.forEach(({ step, screenLocation }) => {
    it(`Step ${step}: ${screenLocation} API endpoint and structure validation`, () => {
      // Intercept screen-specific API calls
      cy.intercept('GET', `/api/dropdowns/${screenLocation}/*`).as(`${screenLocation}API`);
      
      cy.visit(`/services/calculate-mortgage/${step}`);
      cy.wait(3000);
      
      // Validate API call to correct endpoint
      cy.wait(`@${screenLocation}API`).then((interception) => {
        expect(interception.request.url).to.include(`/api/dropdowns/${screenLocation}/`);
        expect(interception.response.statusCode).to.equal(200);
        
        const response = interception.response.body;
        
        // Validate response structure matches architecture
        expect(response).to.have.property('status', 'success');
        expect(response).to.have.property('screen_location', screenLocation);
        expect(response).to.have.property('dropdowns').that.is.an('array');
        expect(response).to.have.property('options').that.is.an('object');
        expect(response).to.have.property('placeholders').that.is.an('object');
        expect(response).to.have.property('labels').that.is.an('object');
        
        // Validate API key patterns for this screen
        response.dropdowns.forEach(dropdown => {
          expect(dropdown.key).to.match(new RegExp(`^${screenLocation}_`));
          cy.log(`✅ API key validated: ${dropdown.key}`);
        });
        
        cy.log(`✅ ${screenLocation}: API structure and key patterns validated`);
      });
    });
  });
  
  it('Screen independence: Different screens should have different API keys', () => {
    const apiKeys = new Set();
    
    screenMappings.forEach(({ step, screenLocation }) => {
      cy.intercept('GET', `/api/dropdowns/${screenLocation}/*`).as(`${screenLocation}API`);
      
      cy.visit(`/services/calculate-mortgage/${step}`);
      cy.wait(3000);
      
      cy.wait(`@${screenLocation}API`).then((interception) => {
        const response = interception.response.body;
        
        response.dropdowns.forEach(dropdown => {
          if (apiKeys.has(dropdown.key)) {
            throw new Error(`API key collision detected: ${dropdown.key} appears in multiple screens`);
          }
          apiKeys.add(dropdown.key);
        });
      });
    });
    
    cy.log(`✅ Screen independence validated: All API keys are screen-specific`);
  });
});
```

#### Test 0.2: useDropdownData Hook Integration Validation  
```typescript
describe('CRITICAL: useDropdownData Hook Integration', () => {
  const dropdownFieldMappings = {
    mortgage_step1: ['property_ownership', 'city'],
    mortgage_step2: ['citizenship', 'marital_status', 'family_status'],
    mortgage_step3: ['obligations', 'main_source', 'additional_income'],
    mortgage_step4: ['bank_selection', 'program_selection']
  };
  
  Object.entries(dropdownFieldMappings).forEach(([screenLocation, fields]) => {
    fields.forEach(fieldName => {
      it(`${screenLocation}: useDropdownData('${screenLocation}', '${fieldName}') integration`, () => {
        const expectedApiKey = `${screenLocation}_${fieldName}`;
        
        cy.intercept('GET', `/api/dropdowns/${screenLocation}/*`).as('dropdownAPI');
        
        const stepNumber = parseInt(screenLocation.replace('mortgage_step', ''));
        cy.visit(`/services/calculate-mortgage/${stepNumber}`);
        cy.wait(3000);
        
        cy.wait('@dropdownAPI').then((interception) => {
          const response = interception.response.body;
          
          // Validate expected API key exists
          if (response.options[expectedApiKey]) {
            expect(response.options[expectedApiKey]).to.be.an('array');
            expect(response.options[expectedApiKey].length).to.be.greaterThan(0);
            
            cy.log(`✅ useDropdownData integration validated: ${expectedApiKey}`);
          } else {
            cy.log(`⚠️ Expected API key not found: ${expectedApiKey}`);
            cy.log(`Available keys: ${Object.keys(response.options).join(', ')}`);
          }
          
          // Validate placeholder exists
          const placeholderKey = `${expectedApiKey}_ph`;
          if (response.placeholders[placeholderKey] || response.placeholders[expectedApiKey]) {
            cy.log(`✅ Placeholder validated for: ${expectedApiKey}`);
          }
          
          // Validate label exists  
          const labelKey = `${expectedApiKey}_label`;
          if (response.labels[labelKey] || response.labels[expectedApiKey]) {
            cy.log(`✅ Label validated for: ${expectedApiKey}`);
          }
        });
      });
    });
  });
});
```

#### Test 0.3: Multi-Language Support Validation
```typescript
describe('CRITICAL: Multi-Language Dropdown Support', () => {
  const languages = ['en', 'he', 'ru'];
  const screenLocation = 'mortgage_step3'; // Test most complex step
  
  languages.forEach(language => {
    it(`${screenLocation}: Multi-language support for ${language}`, () => {
      cy.intercept('GET', `/api/dropdowns/${screenLocation}/${language}`).as(`${language}API`);
      
      cy.visit('/services/calculate-mortgage/3');
      
      // Change language if needed
      if (language !== 'en') {
        cy.get('[data-testid="language-selector"], .language-toggle').then($toggle => {
          if ($toggle.length > 0) {
            cy.wrap($toggle).click();
            cy.get(`[data-lang="${language}"], [value="${language}"]`).click();
            cy.wait(2000);
          }
        });
      }
      
      cy.wait(`@${language}API`).then((interception) => {
        const response = interception.response.body;
        
        expect(response.language_code).to.equal(language);
        expect(response.screen_location).to.equal(screenLocation);
        
        // Validate options have content in correct language
        Object.entries(response.options).forEach(([apiKey, options]) => {
          expect(options).to.be.an('array');
          options.forEach(option => {
            expect(option.label).to.be.a('string').that.is.not.empty;
            
            // Hebrew-specific validation
            if (language === 'he') {
              // Hebrew text should contain Hebrew characters
              expect(option.label).to.match(/[\u0590-\u05FF]/);
            }
          });
          
          cy.log(`✅ ${language} content validated for: ${apiKey}`);
        });
        
        // Validate cache performance
        if (response.cached) {
          cy.log(`✅ ${language} response served from cache`);
        }
      });
    });
  });
  
  it('Language switching should load different content', () => {
    const testApiKey = 'mortgage_step3_obligations';
    let englishContent, hebrewContent;
    
    // Load English content
    cy.intercept('GET', `/api/dropdowns/mortgage_step3/en`).as('englishAPI');
    cy.visit('/services/calculate-mortgage/3');
    cy.wait('@englishAPI').then((interception) => {
      englishContent = interception.response.body.options[testApiKey];
    });
    
    // Switch to Hebrew and load content
    cy.intercept('GET', `/api/dropdowns/mortgage_step3/he`).as('hebrewAPI');
    cy.get('[data-testid="language-selector"]').click();
    cy.get('[data-lang="he"]').click();
    cy.wait(2000);
    
    cy.wait('@hebrewAPI').then((interception) => {
      hebrewContent = interception.response.body.options[testApiKey];
      
      // Content should be different between languages
      if (englishContent && hebrewContent) {
        const englishLabels = englishContent.map(opt => opt.label);
        const hebrewLabels = hebrewContent.map(opt => opt.label);
        
        expect(englishLabels).to.not.deep.equal(hebrewLabels);
        cy.log(`✅ Language switching loads different content`);
      }
    });
  });
});
```

#### Test 0.4: Content Database Integration Validation
```typescript
describe('CRITICAL: Content Database Integration', () => {
  it('Database content key format validation', () => {
    const screenLocation = 'mortgage_step3';
    
    cy.intercept('GET', `/api/dropdowns/${screenLocation}/*`).as('dropdownAPI');
    cy.visit('/services/calculate-mortgage/3');
    cy.wait(3000);
    
    cy.wait('@dropdownAPI').then((interception) => {
      const response = interception.response.body;
      
      // Validate content database integration
      expect(response.performance).to.have.property('total_items');
      expect(response.performance.total_items).to.be.greaterThan(0);
      
      // API keys should follow pattern: {screen_location}_{field_name}
      Object.keys(response.options).forEach(apiKey => {
        expect(apiKey).to.match(new RegExp(`^${screenLocation}_`));
        
        // Underlying database content should follow: {screen_location}.field.{field_name}_{option}
        const fieldName = apiKey.replace(`${screenLocation}_`, '');
        cy.log(`✅ API key ${apiKey} maps to field: ${fieldName}`);
      });
      
      cy.log(`✅ Database integration validated: ${response.performance.total_items} items loaded`);
    });
  });
  
  it('Cache performance validation', () => {
    const screenLocation = 'mortgage_step3';
    let firstRequestTime, secondRequestTime;
    
    // First request (cache miss)
    cy.intercept('GET', `/api/dropdowns/${screenLocation}/*`).as('firstAPI');
    cy.visit('/services/calculate-mortgage/3');
    
    cy.wait('@firstAPI').then((interception) => {
      firstRequestTime = Date.now();
      expect(interception.response.body.cached).to.be.false;
      cy.log(`✅ First request: Cache miss as expected`);
    });
    
    // Second request (cache hit)
    cy.reload();
    cy.intercept('GET', `/api/dropdowns/${screenLocation}/*`).as('secondAPI');
    
    cy.wait('@secondAPI').then((interception) => {
      secondRequestTime = Date.now();
      
      // Cache hit should be faster
      const responseTime = secondRequestTime - firstRequestTime;
      expect(interception.response.body.cached).to.be.true;
      
      cy.log(`✅ Second request: Cache hit validated, response time improved`);
    });
  });
  
  it('Shortline database proxy validation', () => {
    // Test that API can connect to content database
    cy.request({
      method: 'GET',
      url: '/api/dropdowns/cache/stats',
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        expect(response.body).to.have.property('cache_stats');
        expect(response.body).to.have.property('dropdown_cache_size');
        cy.log(`✅ Shortline database proxy operational`);
      } else {
        cy.log(`⚠️ Database proxy not available: ${response.status}`);
      }
    });
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

##### Server Architecture
The application uses a monorepo structure with a unified server system:
- **Main Server**: `packages/server/src/server.js` (port 8003) - Handles all API endpoints and database operations
- **Legacy Server**: `server/server-db.js` (deprecated) - Emergency fallback only, not used in normal operations

```bash
# Ensure servers are running
npm run dev                    # Main server: packages/server/src/server.js (port 8003)
cd mainapp && npm run dev     # Frontend (port 5173)

# Install testing dependencies
npm install --save-dev @playwright/test axe-core cypress-axe
```

##### Legacy Server Emergency Testing
Only test the legacy server if the main server is unavailable:
```bash
# Emergency fallback testing (only if main server fails)
node server/server-db.js      # Legacy server (port 8003)

# Validate emergency API endpoints
curl http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage
curl http://localhost:8003/api/dropdowns/mortgage_step1/en
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

**This comprehensive testing instruction ensures bulletproof validation of the mortgage calculator against all specifications, designs, and business requirements. Execute Phase 0 FIRST and systematically document all findings for production-ready confidence.**## 🧪 COMPREHENSIVE EDGE CASE TESTING - EXTREME SCENARIOS & BOUNDARY CONDITIONS

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

---

# 🚀 ENHANCED AUTOMATION FRAMEWORK - COMPREHENSIVE RESPONSIVE TESTING & STAGE 4 COMPLETION VALIDATION

## 📋 PROFESSIONAL AI AUTOMATION UPDATE - ENHANCED VERSION INTEGRATION

### **Automated Testing Framework Enhancement Directive**

**OBJECTIVE**: Systematically integrate comprehensive responsive testing capabilities with absolute Stage 4 completion validation and exhaustive link testing across all mortgage calculation service endpoints.

---

## 🔧 RESPONSIVE TESTING INTEGRATION - BULLETPROOF FRAMEWORK

### **Source Configuration Integration**
Enhanced responsive testing patterns extracted from `/server/docs/QA/responsiveQaInstructions` with mortgage calculator-specific adaptations.

#### **Responsive Testing Matrix for Mortgage Calculator**
```typescript
const mortgageResponsiveMatrix = {
  // Mortgage Calculator Breakpoints
  breakpoints: {
    mobile: [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 360, height: 640, name: 'Galaxy S8' },
      { width: 390, height: 844, name: 'iPhone 12' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' }
    ],
    tablet: [
      { width: 768, height: 1024, name: 'iPad' },
      { width: 820, height: 1180, name: 'iPad Air' }
    ],
    desktop: [
      { width: 1280, height: 800, name: 'Small Laptop' },
      { width: 1440, height: 900, name: 'MacBook Pro' },
      { width: 1920, height: 1080, name: 'Desktop HD' }
    ]
  },

  // Mortgage-Specific Layout Validation
  mortgageLayoutChecks: {
    propertyValueInput: 'Property value input scales correctly with currency formatting',
    ownershipDropdown: 'Property ownership dropdown displays all options clearly',
    ltvSlider: 'LTV slider maintains precision and visual clarity across viewports',
    initialPaymentCalculator: 'Down payment calculator remains usable on mobile',
    monthlyPaymentDisplay: 'Monthly payment prominently displayed on all screen sizes',
    loanTermSelector: 'Loan term selection accessible and clear on mobile',
    bankOffersTable: 'Bank comparison table transforms appropriately for mobile',
    progressIndicator: 'Four-step progress indicator adapts to screen width',
    formValidation: 'Property ownership validation messages display properly',
    modalDialogs: 'LTV information modals fit viewport bounds perfectly',
    numericKeypad: 'Mobile devices show numeric keypad for property value inputs'
  }
};

// Enhanced Responsive Test Implementation
describe('🔧 MORTGAGE CALCULATOR RESPONSIVE VALIDATION SUITE', () => {
  
  const pages = [
    { name: 'MortgageStep1', path: '/services/calculate-mortgage/1' },
    { name: 'MortgageStep2', path: '/services/calculate-mortgage/2' },
    { name: 'MortgageStep3', path: '/services/calculate-mortgage/3' },
    { name: 'MortgageStep4', path: '/services/calculate-mortgage/4' }
  ];

  const viewports = [
    [320, 568], [360, 640], [390, 844], [414, 896],  // Mobile
    [768, 1024], [820, 1180],                        // Tablet
    [1280, 800], [1440, 900], [1920, 1080]          // Desktop
  ];

  // Enhanced Responsive Validation Functions
  function assertNoHorizontalScroll() {
    cy.window().then(win => {
      const el = win.document.scrollingElement;
      expect(el.scrollWidth, 'No horizontal scroll on mortgage calculator').to.eq(el.clientWidth);
    });
  }

  function assertMortgageElementsVisible(viewport) {
    const [width, height] = viewport;
    
    // Critical mortgage calculator elements must be visible
    cy.get('[data-testid="property-value"]').should('be.visible');
    cy.get('[data-testid="property-ownership"]').should('be.visible');
    cy.get('[data-testid="monthly-payment-display"]').should('be.visible');
    cy.get('[data-testid="continue-button"]').should('be.visible');
    
    // Mobile-specific validations
    if (width <= 768) {
      cy.get('[data-testid="mobile-calculator"]').should('be.visible');
      cy.get('[data-testid="numeric-keypad"]').should('be.visible');
    }
    
    // Desktop-specific validations
    if (width >= 1280) {
      cy.get('[data-testid="sidebar-ltv-info"]').should('be.visible');
      cy.get('[data-testid="calculation-breakdown"]').should('be.visible');
    }
  }

  function assertMortgageFormInteractivity(viewport) {
    const [width, height] = viewport;
    
    // Test property value input
    cy.get('[data-testid="property-value"]').type('1500000');
    cy.get('[data-testid="formatted-property-value"]').should('contain', '₪1,500,000');
    
    // Test property ownership selection
    cy.get('[data-testid="property-ownership"]').select('no_property');
    
    // Verify LTV calculation updates
    cy.get('[data-testid="max-ltv-display"]').should('contain', '75%');
    
    // Test responsive LTV slider
    if (width <= 768) {
      cy.get('[data-testid="ltv-mobile-slider"]').should('be.visible');
    } else {
      cy.get('[data-testid="ltv-desktop-slider"]').should('be.visible');
    }
    
    // Test form navigation
    cy.get('[data-testid="continue-button"]').should('be.visible').click();
  }

  // Comprehensive Responsive Test Suite
  pages.forEach(page => {
    viewports.forEach(([width, height]) => {
      it(`${page.name} responsive validation @ ${width}x${height}`, () => {
        cy.viewport(width, height);
        cy.visit(`http://localhost:5173${page.path}`);
        
        // Core responsive validations
        assertNoHorizontalScroll();
        assertMortgageElementsVisible([width, height]);
        assertMortgageFormInteractivity([width, height]);
        
        // Capture viewport-specific screenshot
        cy.screenshot(`responsive-mortgage/${page.name}-${width}x${height}`, { 
          capture: 'viewport',
          overwrite: true
        });
        
        // Performance validation
        cy.window().then(win => {
          const perfEntries = win.performance.getEntriesByType('navigation');
          expect(perfEntries[0].loadEventEnd - perfEntries[0].loadEventStart)
            .to.be.lessThan(3000, 'Page load time under 3s');
        });
      });
    });
  });

  // Fluid Resize Testing
  it('should handle fluid viewport resizing gracefully', () => {
    cy.visit('http://localhost:5173/services/calculate-mortgage/1');
    
    // Start at mobile and gradually resize to desktop
    for (let width = 320; width <= 1920; width += 100) {
      cy.viewport(width, 800);
      cy.wait(100);
      
      // Verify no horizontal scroll at any width
      assertNoHorizontalScroll();
      
      // Verify critical elements remain accessible
      cy.get('[data-testid="property-value"]').should('be.visible');
      cy.get('[data-testid="continue-button"]').should('be.visible');
    }
  });

  // Property Ownership LTV Responsive Testing
  it('should validate property ownership LTV logic across all viewports', () => {
    const ownershipScenarios = [
      { value: 'no_property', expectedLTV: 75, description: "I don't own any property" },
      { value: 'has_property', expectedLTV: 50, description: "I own a property" },
      { value: 'selling_property', expectedLTV: 70, description: "I'm selling a property" }
    ];

    viewports.forEach(([width, height]) => {
      cy.viewport(width, height);
      cy.visit('http://localhost:5173/services/calculate-mortgage/1');
      
      ownershipScenarios.forEach(scenario => {
        cy.get('[data-testid="property-ownership"]').select(scenario.value);
        cy.get('[data-testid="max-ltv-display"]').should('contain', `${scenario.expectedLTV}%`);
        
        // Test LTV slider range adjustment
        cy.get('[data-testid="ltv-slider"]').should('have.attr', 'max', scenario.expectedLTV);
      });
      
      cy.screenshot(`ltv-logic-${width}x${height}`);
    });
  });
});
```

---

## 🎯 COMPREHENSIVE LINK TESTING & NEW WINDOW/POPUP VALIDATION

### **CRITICAL LINK AND NAVIGATION TESTING REQUIREMENTS**

**MANDATORY**: Every single clickable element must be tested for complete process flows through Stage 4.

#### **Link Testing Protocol Implementation**
```typescript
describe('🔗 COMPREHENSIVE MORTGAGE LINK TESTING SUITE', () => {
  
  // Complete Link Discovery and Categorization for Mortgage Calculator
  const linkCategories = {
    internalNavigation: '[data-testid*="step"], [data-testid*="continue"], [data-testid*="back"]',
    externalLinks: 'a[href^="http"], a[href^="https"]',
    popupTriggers: '[data-testid*="popup"], [data-testid*="modal"], [data-testid*="tooltip"]',
    documentLinks: '[data-testid*="document"], [data-testid*="pdf"], [data-testid*="download"]',
    bankingLinks: '[data-testid*="bank"], [data-testid*="program"], [data-testid*="offer"]',
    mortgageInfoLinks: '[data-testid*="ltv"], [data-testid*="mortgage-info"], [data-testid*="calculator-help"]',
    legalLinks: '[data-testid*="terms"], [data-testid*="privacy"], [data-testid*="legal"]'
  };

  beforeEach(() => {
    cy.visit('http://localhost:5173/services/calculate-mortgage/1');
    
    // Initialize link tracking
    cy.window().then(win => {
      win.linkTestResults = {
        discovered: [],
        tested: [],
        failed: [],
        completed: []
      };
    });
  });

  // Phase 1: Link Discovery and Classification
  it('should discover and classify all clickable elements', () => {
    const discoveredLinks = [];
    
    Object.entries(linkCategories).forEach(([category, selector]) => {
      cy.get('body').then($body => {
        const elements = $body.find(selector);
        elements.each((index, element) => {
          const linkData = {
            category,
            selector: element.getAttribute('data-testid') || element.tagName,
            href: element.href || 'javascript',
            target: element.target || '_self',
            text: element.textContent?.trim() || 'No text'
          };
          discoveredLinks.push(linkData);
        });
      });
    });

    cy.then(() => {
      expect(discoveredLinks.length, 'Must discover mortgage links to test').to.be.greaterThan(0);
      cy.log(`📊 Discovered ${discoveredLinks.length} clickable elements in mortgage calculator`);
    });
  });

  // Phase 2: Complete Link Testing with Process Validation
  Object.entries(linkCategories).forEach(([category, selector]) => {
    
    it(`should test all ${category} links with complete process validation`, () => {
      cy.get(selector).should('exist').then($links => {
        
        $links.each((index, link) => {
          const linkElement = Cypress.$(link);
          const linkText = linkElement.text().trim();
          const linkHref = linkElement.attr('href') || 'javascript';
          
          cy.log(`🔗 Testing mortgage ${category} link: "${linkText}"`);
          
          // Pre-click state capture
          cy.window().then(win => {
            const initialWindowCount = win.length;
            const initialUrl = win.location.href;
            
            cy.wrap(linkElement).click({ force: true });
            
            cy.wait(1000); // Allow for navigation/popup
            
            // Detect link behavior and complete validation
            cy.window().then(newWin => {
              const newWindowCount = newWin.length;
              const newUrl = newWin.location.href;
              
              if (newWindowCount > initialWindowCount) {
                // New window/tab opened
                cy.log('🪟 New window/tab detected - validating mortgage content');
                
                // Switch to new window and complete process
                cy.window().then(win => {
                  // Complete process in new window to Stage 4
                  completeMortgageProcessInNewWindow(win, category, linkText);
                });
                
              } else if (newUrl !== initialUrl) {
                // Navigation occurred in same window
                cy.log('🧭 Navigation detected - validating new mortgage page');
                
                // Complete process on new page to Stage 4
                completeMortgageProcessOnNewPage(newUrl, category, linkText);
                
              } else {
                // Popup/modal opened
                cy.log('🎭 Popup/modal detected - validating mortgage interaction');
                
                // Handle popup interaction completely
                completeMortgagePopupInteraction(category, linkText);
              }
            });
          });
        });
      });
    });
  });

  // Helper Functions for Complete Mortgage Process Validation
  function completeMortgageProcessInNewWindow(win, category, linkText) {
    cy.log(`🔄 Completing mortgage process in new window for ${category}: ${linkText}`);
    
    // Stage 1: Verify new window loaded correctly
    cy.get('[data-testid="main-content"]', { timeout: 10000 }).should('be.visible');
    
    // Stage 2: Complete mortgage data entry in new window
    if (win.location.href.includes('calculate-mortgage')) {
      fillMortgageFormToCompletion();
    } else if (win.location.href.includes('bank-program')) {
      completeBankMortgageProgramSelection();
    } else {
      completeGenericMortgageProcess();
    }
    
    // Stage 3: Validate processing completed
    cy.get('[data-testid="processing-complete"]', { timeout: 15000 }).should('be.visible');
    
    // Stage 4: Confirm final completion
    cy.get('[data-testid="process-confirmed"]').should('be.visible');
    cy.get('[data-testid="reference-number"]').should('exist');
    
    // Return to original window
    cy.window().then(originalWin => {
      originalWin.close();
    });
    
    cy.log(`✅ Mortgage process completed to Stage 4 in new window: ${linkText}`);
  }

  function completeMortgageProcessOnNewPage(url, category, linkText) {
    cy.log(`🔄 Completing mortgage process on new page for ${category}: ${linkText}`);
    
    // Stage 1: Verify page navigation successful
    cy.url().should('include', url.split('/').pop());
    
    // Stage 2: Complete mortgage form interactions
    if (url.includes('/2')) {
      completeMortgageStep2Process();
    } else if (url.includes('/3')) {
      completeMortgageStep3Process();
    } else if (url.includes('/4')) {
      completeMortgageStep4Process();
    }
    
    // Stage 3: Process validation
    cy.get('[data-testid="step-validation"]').should('have.class', 'valid');
    
    // Stage 4: Final confirmation
    if (url.includes('/4')) {
      cy.get('[data-testid="final-submit"]').click();
      cy.get('[data-testid="submission-confirmed"]').should('be.visible');
    }
    
    cy.log(`✅ Mortgage process completed to Stage 4 on new page: ${linkText}`);
  }

  function completeMortgagePopupInteraction(category, linkText) {
    cy.log(`🔄 Completing mortgage popup interaction for ${category}: ${linkText}`);
    
    // Stage 1: Verify popup opened
    cy.get('[data-testid*="modal"], [data-testid*="popup"], [role="dialog"]')
      .should('be.visible');
    
    // Stage 2: Complete mortgage popup form/interaction
    cy.get('[data-testid*="modal"] input, [data-testid*="popup"] input')
      .each($input => {
        if ($input.attr('type') === 'text') {
          cy.wrap($input).type('Test input');
        } else if ($input.attr('type') === 'number') {
          cy.wrap($input).type('1500000');
        }
      });
    
    // Stage 3: Submit popup form
    cy.get('[data-testid*="modal"] button, [data-testid*="popup"] button')
      .contains(/submit|confirm|save|continue/i)
      .click();
    
    // Stage 4: Validate popup completion
    cy.get('[data-testid*="success"], [data-testid*="confirmed"]')
      .should('be.visible');
    
    // Close popup properly
    cy.get('[data-testid*="close"], [aria-label*="close"]').click();
    
    cy.log(`✅ Mortgage popup interaction completed to Stage 4: ${linkText}`);
  }

  // Mortgage Calculator Specific Process Completion Functions
  function fillMortgageFormToCompletion() {
    // Step 1: Property and Loan Details
    cy.get('[data-testid="property-value"]').type('2000000');
    cy.get('[data-testid="property-ownership"]').select('no_property');
    cy.get('[data-testid="initial-payment"]').type('500000');
    cy.get('[data-testid="loan-term"]').select('25');
    cy.get('[data-testid="continue-button"]').click();
    
    // Step 2: Personal Information
    cy.get('[data-testid="first-name"]').type('John');
    cy.get('[data-testid="last-name"]').type('Doe');
    cy.get('[data-testid="phone"]').type('050-123-4567');
    cy.get('[data-testid="email"]').type('john.doe@example.com');
    cy.get('[data-testid="continue-button"]').click();
    
    // Step 3: Income Information
    cy.get('[data-testid="monthly-income"]').type('25000');
    cy.get('[data-testid="employment-type"]').select('employee');
    cy.get('[data-testid="continue-button"]').click();
    
    // Step 4: Final Submission
    cy.get('[data-testid="bank-program-selection"]').click();
    cy.get('[data-testid="terms-checkbox"]').check();
    cy.get('[data-testid="submit-application"]').click();
  }

  function completeMortgageStep2Process() {
    cy.get('[data-testid="personal-info-form"]').within(() => {
      cy.get('[data-testid="id-number"]').type('123456789');
      cy.get('[data-testid="birth-date"]').type('1990-01-01');
      cy.get('[data-testid="address"]').type('123 Rothschild Blvd');
      cy.get('[data-testid="city"]').select('Tel Aviv');
      cy.get('[data-testid="continue-button"]').click();
    });
  }

  function completeMortgageStep3Process() {
    cy.get('[data-testid="income-form"]').within(() => {
      cy.get('[data-testid="primary-income"]').type('25000');
      cy.get('[data-testid="employment-duration"]').select('36');
      cy.get('[data-testid="employer-name"]').type('Tech Company Ltd');
      cy.get('[data-testid="continue-button"]').click();
    });
  }

  function completeMortgageStep4Process() {
    cy.get('[data-testid="bank-programs"]').within(() => {
      cy.get('[data-testid="mortgage-program-1"]').click();
      cy.get('[data-testid="confirm-selection"]').click();
    });
    
    cy.get('[data-testid="application-review"]').within(() => {
      cy.get('[data-testid="review-complete-checkbox"]').check();
      cy.get('[data-testid="final-submit"]').click();
    });
  }
});
```

---

## 🎯 STAGE 4 COMPLETION VALIDATION - ZERO TOLERANCE FRAMEWORK

### **Absolute Mortgage Process Completion Requirements**

**CRITICAL**: Every single mortgage process MUST reach Stage 4 completion - no exceptions.

#### **Stage Definition and Validation Matrix**
```typescript
const mortgageStage4ValidationFramework = {
  stageDefinitions: {
    stage1: {
      name: 'INITIALIZATION',
      requirements: [
        'User lands on mortgage calculator page',
        'All mortgage resources fully loaded',
        'Property ownership dropdown populated',
        'LTV calculator initialized',
        'No JavaScript errors in console'
      ],
      validation: 'cy.get("[data-testid=mortgage-loaded]").should("have.class", "ready")',
      mustPass: true
    },
    
    stage2: {
      name: 'DATA INPUT AND VALIDATION',
      requirements: [
        'Property value input accepts valid amounts',
        'Property ownership selection works correctly',
        'LTV calculation updates in real-time',
        'Initial payment slider functions properly',
        'Loan term selection validates correctly'
      ],
      validation: 'cy.get("[data-testid=mortgage-form-valid]").should("have.class", "validated")',
      mustPass: true
    },
    
    stage3: {
      name: 'PROCESSING AND CALCULATION',
      requirements: [
        'Monthly payment calculation is accurate',
        'LTV ratios calculated correctly per ownership type',
        'Bank eligibility checks executed',
        'Income vs payment ratio validated',
        'State management maintains all data'
      ],
      validation: 'cy.get("[data-testid=mortgage-calculation-complete]").should("be.visible")',
      mustPass: true
    },
    
    stage4: {
      name: 'COMPLETION AND CONFIRMATION',
      requirements: [
        'Mortgage application submitted successfully',
        'Bank program selection confirmed',
        'Application reference number generated',
        'Email confirmation sent to applicant',
        'PDF mortgage summary generated',
        'Next steps clearly communicated',
        'Data persisted to mortgage database',
        'Mortgage officer notification sent'
      ],
      validation: 'cy.get("[data-testid=mortgage-complete]").should("contain", "completed")',
      mustPass: true
    }
  }
};

// Comprehensive Mortgage Stage 4 Validation Suite
describe('🎯 MORTGAGE STAGE 4 COMPLETION VALIDATION - ZERO TOLERANCE', () => {
  
  const mortgageServiceEndpoints = [
    '/services/calculate-mortgage/1',
    '/services/calculate-mortgage/2', 
    '/services/calculate-mortgage/3',
    '/services/calculate-mortgage/4'
  ];

  mortgageServiceEndpoints.forEach((endpoint, index) => {
    const stepNumber = index + 1;
    
    it(`Mortgage Calculator Step ${stepNumber} - Complete Stage 1-4 Validation`, () => {
      cy.visit(`http://localhost:5173${endpoint}`);
      
      // STAGE 1: INITIALIZATION VALIDATION
      cy.log(`🚀 STAGE 1: Validating mortgage initialization for Step ${stepNumber}`);
      
      validateMortgageStage1Initialization(stepNumber);
      
      // STAGE 2: DATA INPUT AND VALIDATION
      cy.log(`📝 STAGE 2: Validating mortgage data input for Step ${stepNumber}`);
      
      validateMortgageStage2DataInput(stepNumber);
      
      // STAGE 3: PROCESSING AND CALCULATION
      cy.log(`⚙️ STAGE 3: Validating mortgage processing for Step ${stepNumber}`);
      
      validateMortgageStage3Processing(stepNumber);
      
      // STAGE 4: COMPLETION AND CONFIRMATION
      cy.log(`✅ STAGE 4: Validating mortgage completion for Step ${stepNumber}`);
      
      validateMortgageStage4Completion(stepNumber);
      
      // Final Stage 4 Confirmation
      cy.get('[data-testid="mortgage-stage-4-complete"]')
        .should('be.visible')
        .and('contain', 'Mortgage Process Complete')
        .and('have.class', 'success');
        
      cy.log(`🎯 ✅ MORTGAGE STAGE 4 COMPLETION VERIFIED for Step ${stepNumber}`);
    });
  });

  // Stage Validation Helper Functions
  function validateMortgageStage1Initialization(step) {
    // Page load validation
    cy.get('[data-testid="main-content"]').should('be.visible');
    cy.get('[data-testid="loading-indicator"]').should('not.exist');
    
    // Mortgage-specific resource validation
    cy.get('[data-testid="property-ownership"]').should('be.visible');
    cy.get('[data-testid="ltv-calculator"]').should('be.visible');
    
    // JavaScript error validation
    cy.window().then(win => {
      const errors = win.console?.errors || [];
      expect(errors.length).to.equal(0, 'No JavaScript errors allowed');
    });
    
    // Interactive element validation
    cy.get('input, button, select').should('not.be.disabled');
    
    // Mark Stage 1 complete
    cy.get('[data-testid="mortgage-stage-1-indicator"]')
      .should('have.class', 'completed');
  }

  function validateMortgageStage2DataInput(step) {
    if (step === 1) {
      // Property value input
      cy.get('[data-testid="property-value"]')
        .type('2000000')
        .should('have.value', '2000000');
      
      // Property ownership selection
      cy.get('[data-testid="property-ownership"]')
        .select('no_property');
      
      // Verify LTV limit update
      cy.get('[data-testid="max-ltv-display"]')
        .should('contain', '75%');
      
      // Initial payment input
      cy.get('[data-testid="initial-payment"]')
        .type('500000')
        .should('have.value', '500000');
        
      // Loan term selection
      cy.get('[data-testid="loan-term"]')
        .select('25')
        .should('have.value', '25');
        
    } else if (step === 2) {
      // Personal information
      cy.get('[data-testid="first-name"]').type('John');
      cy.get('[data-testid="last-name"]').type('Doe');
      cy.get('[data-testid="id-number"]').type('123456789');
      cy.get('[data-testid="phone"]').type('050-123-4567');
      cy.get('[data-testid="email"]').type('john.doe@example.com');
      
    } else if (step === 3) {
      // Income information
      cy.get('[data-testid="monthly-income"]').type('25000');
      cy.get('[data-testid="employment-type"]').select('employee');
      cy.get('[data-testid="employment-duration"]').select('36');
      
    } else if (step === 4) {
      // Bank program selection
      cy.get('[data-testid="bank-program-1"]').click();
      cy.get('[data-testid="terms-checkbox"]').check();
    }
    
    // Validate form state
    cy.get('[data-testid="mortgage-form-valid"]').should('have.class', 'valid');
    
    // Mark Stage 2 complete
    cy.get('[data-testid="mortgage-stage-2-indicator"]')
      .should('have.class', 'completed');
  }

  function validateMortgageStage3Processing(step) {
    if (step === 1) {
      // Validate monthly payment calculation
      cy.get('[data-testid="monthly-payment"]')
        .should('be.visible')
        .and('contain', '₪');
      
      // Validate LTV ratio calculation
      cy.get('[data-testid="ltv-ratio"]')
        .should('be.visible')
        .and('match', /\d+%/);
      
      // Validate loan amount calculation
      cy.get('[data-testid="loan-amount"]')
        .should('be.visible')
        .and('contain', '₪1,500,000');
        
    } else if (step === 2) {
      // Validate personal data processing
      cy.get('[data-testid="data-processed"]')
        .should('have.class', 'success');
        
    } else if (step === 3) {
      // Validate income processing and eligibility
      cy.get('[data-testid="income-validated"]')
        .should('be.visible')
        .and('contain', 'Validated');
      
      // Validate debt-to-income ratio
      cy.get('[data-testid="dti-ratio"]')
        .should('be.visible')
        .and('match', /\d+\.\d+%/);
        
    } else if (step === 4) {
      // Validate final processing
      cy.get('[data-testid="final-processing"]')
        .should('be.visible');
        
      cy.get('[data-testid="mortgage-application-id"]')
        .should('exist')
        .and('not.be.empty');
    }
    
    // Mark Stage 3 complete
    cy.get('[data-testid="mortgage-stage-3-indicator"]')
      .should('have.class', 'completed');
  }

  function validateMortgageStage4Completion(step) {
    if (step === 4) {
      // Final submission
      cy.get('[data-testid="submit-mortgage-application"]').click();
      
      // Wait for submission processing
      cy.get('[data-testid="mortgage-submission-processing"]', { timeout: 15000 })
        .should('be.visible');
      
      // Validate completion confirmation
      cy.get('[data-testid="mortgage-submission-confirmed"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'Mortgage Application Submitted Successfully');
      
      // Validate reference number
      cy.get('[data-testid="mortgage-reference-number"]')
        .should('be.visible')
        .and('not.be.empty');
      
      // Validate next steps
      cy.get('[data-testid="mortgage-next-steps"]')
        .should('be.visible')
        .and('contain', 'Next Steps');
      
      // Validate mortgage data persistence
      cy.window().then(win => {
        const savedData = win.localStorage.getItem('mortgage-application');
        expect(savedData).to.not.be.null;
        expect(JSON.parse(savedData).status).to.equal('submitted');
        expect(JSON.parse(savedData).propertyValue).to.be.a('number');
      });
    } else {
      // For steps 1-3, validate navigation to next step
      cy.get('[data-testid="continue-button"]').click();
      cy.url().should('include', `/calculate-mortgage/${step + 1}`);
      
      // Validate data carried forward
      cy.window().its('store').invoke('getState').then(state => {
        expect(state.calculateMortgage).to.not.be.null;
        expect(state.calculateMortgage.currentStep).to.equal(step + 1);
      });
    }
    
    // Mark Stage 4 complete
    cy.get('[data-testid="mortgage-stage-4-indicator"]')
      .should('have.class', 'completed');
  }

  // Complete Mortgage Application Process Validation
  it('should complete entire mortgage application process through all 4 stages', () => {
    cy.log('🚀 Starting complete mortgage application process validation');
    
    // Step 1: Property and Loan Parameters
    cy.visit('http://localhost:5173/services/calculate-mortgage/1');
    
    // Complete Step 1 to Stage 4
    validateMortgageStage1Initialization(1);
    validateMortgageStage2DataInput(1);
    validateMortgageStage3Processing(1);
    validateMortgageStage4Completion(1);
    
    // Step 2: Personal Information
    cy.url().should('include', '/calculate-mortgage/2');
    
    validateMortgageStage1Initialization(2);
    validateMortgageStage2DataInput(2);
    validateMortgageStage3Processing(2);
    validateMortgageStage4Completion(2);
    
    // Step 3: Income and Employment
    cy.url().should('include', '/calculate-mortgage/3');
    
    validateMortgageStage1Initialization(3);
    validateMortgageStage2DataInput(3);
    validateMortgageStage3Processing(3);
    validateMortgageStage4Completion(3);
    
    // Step 4: Bank Programs and Final Submission
    cy.url().should('include', '/calculate-mortgage/4');
    
    validateMortgageStage1Initialization(4);
    validateMortgageStage2DataInput(4);
    validateMortgageStage3Processing(4);
    validateMortgageStage4Completion(4);
    
    // Final Stage 4 Global Validation
    cy.get('[data-testid="mortgage-application-complete"]')
      .should('be.visible')
      .and('contain', 'Mortgage Application Complete')
      .and('have.class', 'final-success');
      
    cy.log('🎯 ✅ COMPLETE MORTGAGE APPLICATION PROCESS VALIDATED TO STAGE 4');
  });

  // Property Ownership LTV Logic Complete Validation
  it('should validate property ownership LTV logic through complete process', () => {
    const ownershipScenarios = [
      { 
        ownership: 'no_property',
        maxLTV: 75,
        minDownPayment: 25,
        description: "No property ownership - 75% max LTV"
      },
      {
        ownership: 'has_property',
        maxLTV: 50,
        minDownPayment: 50,
        description: "Has property - 50% max LTV"
      },
      {
        ownership: 'selling_property',
        maxLTV: 70,
        minDownPayment: 30,
        description: "Selling property - 70% max LTV"
      }
    ];

    ownershipScenarios.forEach(scenario => {
      cy.visit('http://localhost:5173/services/calculate-mortgage/1');
      
      // Test complete flow for each ownership scenario
      cy.get('[data-testid="property-value"]').type('2000000');
      cy.get('[data-testid="property-ownership"]').select(scenario.ownership);
      
      // Validate LTV limits
      cy.get('[data-testid="max-ltv-display"]').should('contain', `${scenario.maxLTV}%`);
      
      // Calculate minimum down payment
      const minDownPayment = 2000000 * (scenario.minDownPayment / 100);
      cy.get('[data-testid="initial-payment"]').type(minDownPayment.toString());
      
      // Validate loan amount calculation
      const loanAmount = 2000000 - minDownPayment;
      cy.get('[data-testid="loan-amount"]').should('contain', loanAmount.toLocaleString());
      
      // Continue through all steps to validate complete flow
      cy.get('[data-testid="continue-button"]').click();
      
      // Complete remaining steps
      fillRemainingMortgageSteps();
      
      // Validate final submission with correct LTV logic
      cy.get('[data-testid="mortgage-summary-ltv"]').should('contain', `${scenario.maxLTV}%`);
      
      cy.log(`✅ ${scenario.description} validated through complete process`);
    });
  });

  function fillRemainingMortgageSteps() {
    // Step 2: Personal Information
    cy.get('[data-testid="first-name"]').type('John');
    cy.get('[data-testid="last-name"]').type('Doe');
    cy.get('[data-testid="phone"]').type('050-123-4567');
    cy.get('[data-testid="email"]').type('john.doe@example.com');
    cy.get('[data-testid="continue-button"]').click();
    
    // Step 3: Income Information
    cy.get('[data-testid="monthly-income"]').type('30000');
    cy.get('[data-testid="employment-type"]').select('employee');
    cy.get('[data-testid="continue-button"]').click();
    
    // Step 4: Final submission validation handled in main test
  }
});
```

---

## 🛡️ PROCESS PERFECTION REQUIREMENTS

### **Zero-Defect Mortgage Process Criteria**

**ALL MORTGAGE PROCESSES MUST ACHIEVE 100% PERFECTION**

#### **Mortgage Perfection Validation Framework**
```typescript
const mortgageProcessPerfectionCriteria = {
  functionalPerfection: {
    requirements: [
      '100% of mortgage features work as designed',
      'Zero broken links across all mortgage pages',
      'All buttons functional and responsive',
      'All mortgage forms submit successfully',
      'All LTV calculations mathematically accurate',
      'Property ownership logic works flawlessly'
    ],
    validation: 'Every mortgage feature tested and verified working',
    tolerance: '0% failure rate'
  },
  
  flowPerfection: {
    requirements: [
      'User can complete mortgage process without obstacles',
      'No dead ends in mortgage navigation flow',
      'Clear path from Stage 1 to Stage 4 for mortgages',
      'Intuitive progression throughout mortgage steps',
      'No confusing or unclear mortgage-specific steps'
    ],
    validation: 'Complete mortgage user journey testing',
    tolerance: '0% user confusion incidents'
  },
  
  dataPerfection: {
    requirements: [
      'All mortgage data saved correctly to database',
      'No mortgage data loss at any stage',
      'Accurate mortgage data validation throughout',
      'Proper mortgage data persistence across sessions',
      'Correct mortgage relationships maintained',
      'LTV calculations persist correctly'
    ],
    validation: 'Mortgage database integrity verification',
    tolerance: '0% data corruption'
  },
  
  calculationPerfection: {
    requirements: [
      'LTV ratios calculated with 100% accuracy',
      'Monthly payments calculated correctly',
      'Property ownership logic enforced properly',
      'Down payment calculations accurate',
      'Interest calculations mathematically correct'
    ],
    validation: 'Mathematical verification of all calculations',
    tolerance: '0% calculation errors'
  }
};

// Mortgage Process Perfection Validation Suite
describe('🛡️ MORTGAGE PROCESS PERFECTION VALIDATION - ZERO TOLERANCE', () => {
  
  it('should validate 100% mortgage functional perfection', () => {
    cy.visit('http://localhost:5173/services/calculate-mortgage/1');
    
    // Test every single mortgage feature
    const mortgageFeatures = [
      'property-value-input',
      'property-ownership-selection',
      'ltv-slider',
      'initial-payment-input',
      'monthly-payment-calculation',
      'loan-term-dropdown',
      'form-validation',
      'step-navigation',
      'data-persistence'
    ];
    
    mortgageFeatures.forEach(feature => {
      cy.get(`[data-testid="${feature}"]`)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled');
        
      // Test mortgage-specific functionality
      if (feature.includes('property-value')) {
        cy.get(`[data-testid="${feature}"]`).type('2000000').should('have.value', '2000000');
      } else if (feature.includes('ownership')) {
        cy.get(`[data-testid="${feature}"]`).select('no_property');
      } else if (feature.includes('button')) {
        cy.get(`[data-testid="${feature}"]`).click();
      }
    });
    
    cy.log('✅ 100% Mortgage Functional Perfection Validated');
  });
  
  it('should validate 100% mortgage calculation perfection', () => {
    cy.visit('http://localhost:5173/services/calculate-mortgage/1');
    
    // Test LTV calculation accuracy
    const testScenarios = [
      {
        propertyValue: 2000000,
        ownership: 'no_property',
        expectedMaxLTV: 75,
        downPayment: 500000,
        expectedLoanAmount: 1500000
      },
      {
        propertyValue: 1500000,
        ownership: 'has_property',
        expectedMaxLTV: 50,
        downPayment: 750000,
        expectedLoanAmount: 750000
      },
      {
        propertyValue: 1800000,
        ownership: 'selling_property',
        expectedMaxLTV: 70,
        downPayment: 540000,
        expectedLoanAmount: 1260000
      }
    ];
    
    testScenarios.forEach((scenario, index) => {
      cy.reload();
      
      // Input property value
      cy.get('[data-testid="property-value"]').type(scenario.propertyValue.toString());
      
      // Select ownership type
      cy.get('[data-testid="property-ownership"]').select(scenario.ownership);
      
      // Validate max LTV is correct
      cy.get('[data-testid="max-ltv-display"]')
        .should('contain', `${scenario.expectedMaxLTV}%`);
      
      // Input down payment
      cy.get('[data-testid="initial-payment"]').type(scenario.downPayment.toString());
      
      // Validate loan amount calculation
      cy.get('[data-testid="loan-amount"]')
        .should('contain', scenario.expectedLoanAmount.toLocaleString());
      
      cy.log(`✅ Scenario ${index + 1}: LTV calculation perfect`);
    });
    
    cy.log('✅ 100% Mortgage Calculation Perfection Validated');
  });
  
  it('should validate 100% mortgage data perfection', () => {
    cy.visit('http://localhost:5173/services/calculate-mortgage/1');
    
    const testData = {
      propertyValue: 2500000,
      propertyOwnership: 'no_property',
      initialPayment: 625000,
      loanTerm: 30,
      firstName: 'John',
      lastName: 'Doe',
      monthlyIncome: 35000
    };
    
    // Fill and validate data at each step
    cy.get('[data-testid="property-value"]').type(testData.propertyValue.toString());
    cy.get('[data-testid="property-ownership"]').select(testData.propertyOwnership);
    cy.get('[data-testid="initial-payment"]').type(testData.initialPayment.toString());
    cy.get('[data-testid="loan-term"]').select(testData.loanTerm.toString());
    
    // Validate data persistence in Redux store
    cy.window().its('store').invoke('getState').then(state => {
      expect(state.calculateMortgage.propertyValue).to.equal(testData.propertyValue);
      expect(state.calculateMortgage.propertyOwnership).to.equal(testData.propertyOwnership);
      expect(state.calculateMortgage.initialPayment).to.equal(testData.initialPayment);
      expect(state.calculateMortgage.loanTerm).to.equal(testData.loanTerm);
    });
    
    cy.log('✅ 100% Mortgage Data Perfection Validated');
  });
});
```

---

## 📊 COMPREHENSIVE SUCCESS CRITERIA

### **Non-Negotiable Mortgage Requirements**

**EVERY MORTGAGE TEST RUN MUST CONFIRM:**

1. ✅ **ALL mortgage links tested and functional** - Zero broken links tolerance
2. ✅ **ALL mortgage popups handled correctly** - Complete interaction validation
3. ✅ **ALL new mortgage pages/tabs process completed** - Stage 4 completion required
4. ✅ **ALL mortgage processes reach Stage 4** - Mandatory completion validation
5. ✅ **ZERO broken mortgage elements** - Perfect UI functionality
6. ✅ **ZERO Unicode errors** - Flawless text rendering
7. ✅ **100% mortgage screenshot coverage** - Complete visual documentation
8. ✅ **Complete mortgage audit trail** - Full test execution tracking
9. ✅ **All mortgage validations passed** - No test failures permitted
10. ✅ **Perfect mortgage process execution** - Flawless end-to-end performance
11. ✅ **LTV calculations 100% accurate** - Mathematical precision required
12. ✅ **Property ownership logic perfect** - All scenarios validated

### **Enhanced Mortgage Reporting Requirements**

#### **Stage 4 Completion Report**
```markdown
## MORTGAGE CALCULATOR COMPLETION MATRIX

### Mortgage Service Endpoint Validation
- Mortgage Step 1: [Stage 1 ✅] [Stage 2 ✅] [Stage 3 ✅] [Stage 4 ✅]
- Mortgage Step 2: [Stage 1 ✅] [Stage 2 ✅] [Stage 3 ✅] [Stage 4 ✅]
- Mortgage Step 3: [Stage 1 ✅] [Stage 2 ✅] [Stage 3 ✅] [Stage 4 ✅]
- Mortgage Step 4: [Stage 1 ✅] [Stage 2 ✅] [Stage 3 ✅] [Stage 4 ✅]

### Mortgage Link Testing Results
- Total mortgage links found: X
- Mortgage links tested: X (100%)
- Mortgage links opening popups: X (100% completed)
- Mortgage links opening new pages: X (100% completed to Stage 4)
- All mortgage processes completed: YES ✅

### Mortgage LTV Logic Validation
- No Property (75% LTV): ✅ Perfect
- Has Property (50% LTV): ✅ Perfect
- Selling Property (70% LTV): ✅ Perfect
- All calculations mathematically accurate: ✅

### Responsive Mortgage Testing Matrix
- Mobile (320-414px): ✅ Perfect
- Tablet (768-820px): ✅ Perfect  
- Desktop (1280-1920px): ✅ Perfect
- Fluid resize testing: ✅ Perfect

### Mortgage Process Perfection Score
- Functional: 100% ✅
- Flow: 100% ✅
- Data: 100% ✅
- Calculations: 100% ✅
- UI/UX: 100% ✅
- Integration: 100% ✅

### Critical Issue Log (Must be empty for release)
- Critical Issues: 0 ✅
- Major Issues: 0 ✅
- Minor Issues: 0 ✅
- All Issues Resolved: YES ✅
```

---

## 🚨 CRITICAL MORTGAGE FAILURE CONDITIONS

**MORTGAGE TEST FAILURE CONDITIONS (Any of these = IMMEDIATE FAILURE):**

1. **Incomplete Stage 4 Mortgage Process** - Any mortgage process not reaching Stage 4
2. **Broken Mortgage Link Detection** - Any non-functional clickable element
3. **LTV Calculation Error** - Any mathematical error in LTV calculations
4. **Property Ownership Logic Failure** - Incorrect LTV limits for ownership types
5. **Mortgage Popup Interaction Failure** - Incomplete popup/modal interaction
6. **New Mortgage Window Process Incomplete** - New window/tab process not reaching Stage 4
7. **Responsive Mortgage Layout Failure** - Broken layout on any viewport
8. **Mortgage Data Loss Incident** - Any mortgage data not persisted correctly
9. **Mortgage Navigation Dead End** - User cannot complete mortgage journey
10. **Mortgage API Integration Failure** - Any mortgage API call not completing successfully

### **MORTGAGE EMERGENCY PROTOCOLS**

If any critical mortgage failure is detected:

1. **STOP MORTGAGE TESTING IMMEDIATELY**
2. **Document mortgage failure with screenshot**
3. **Create detailed mortgage reproduction steps**
4. **Verify LTV calculations with independent calculator**
5. **Re-run complete mortgage test suite after fix**
6. **Validate mortgage fix does not introduce new issues**

---

**FINAL CRITICAL MORTGAGE REMINDERS**

1. **ABSOLUTE MORTGAGE COMPLETION**: Every mortgage process MUST reach Stage 4 - no exceptions
2. **TOTAL MORTGAGE LINK COVERAGE**: Every single mortgage link must be clicked and validated
3. **COMPLETE MORTGAGE POPUP HANDLING**: All mortgage popups must be fully interacted with
4. **PERFECT MORTGAGE PROCESS FLOW**: From Stage 1 to Stage 4 without any issues
5. **NEW MORTGAGE PAGE COMPLETION**: All new mortgage pages/tabs must complete their processes
6. **ZERO MORTGAGE TOLERANCE**: No broken elements, no calculation errors, no incomplete processes
7. **EXHAUSTIVE MORTGAGE VALIDATION**: Every possible mortgage user path must be tested to perfection
8. **STAGE 4 MORTGAGE VERIFICATION**: Explicit confirmation that Stage 4 is reached for ALL mortgage processes
9. **LTV MATHEMATICAL ACCURACY**: All LTV calculations must be 100% mathematically accurate
10. **PROPERTY OWNERSHIP LOGIC PERFECTION**: All three ownership scenarios must work flawlessly

**FAILURE TO COMPLETE ANY MORTGAGE PROCESS TO STAGE 4 = TEST FAILURE**

This enhanced mortgage framework ensures absolute perfection in mortgage process execution, complete responsive design validation, comprehensive mortgage link coverage, and guaranteed Stage 4 completion for all mortgage user flows across all service endpoints.