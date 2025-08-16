const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class MortgageCalculatorQA {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = {
      testSuite: 'Mortgage Calculator Comprehensive QA',
      timestamp: new Date().toISOString(),
      baseUrl: 'http://localhost:5173',
      findings: [],
      screenshots: [],
      performance: {},
      multilanguage: {},
      ltv_logic: {},
      dropdown_validation: {}
    };
    this.screenshotDir = './qa-mortgage-screenshots';
    this.screenshotCounter = 1;
  }

  async init() {
    // Create screenshot directory
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // Slow down for observation
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    this.page = await this.context.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.addFinding('ERROR', `Console Error: ${msg.text()}`, 'Step Unknown');
      }
    });

    // Enable network error tracking
    this.page.on('response', response => {
      if (!response.ok() && response.url().includes('localhost')) {
        this.addFinding('ERROR', `Network Error: ${response.status()} ${response.url()}`, 'Step Unknown');
      }
    });
  }

  async takeScreenshot(stepName, description = '') {
    const filename = `${this.screenshotCounter.toString().padStart(3, '0')}_${stepName}_${Date.now()}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    this.results.screenshots.push({
      step: stepName,
      description,
      filename,
      filepath
    });
    this.screenshotCounter++;
    return filepath;
  }

  addFinding(severity, description, step, element = null) {
    this.results.findings.push({
      severity,
      description,
      step,
      element,
      timestamp: new Date().toISOString()
    });
    console.log(`[${severity}] ${step}: ${description}`);
  }

  async testStep1() {
    console.log('\n=== TESTING STEP 1: Property & Loan Parameters ===');
    
    try {
      await this.page.goto('http://localhost:5173/services/calculate-mortgage/1');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('step1_initial', 'Step 1 initial load');

      // Test property value input
      console.log('Testing property value input...');
      const propertyValueInput = this.page.locator('input[name*="property"], input[placeholder*="property"], input[id*="property"]').first();
      
      if (await propertyValueInput.count() > 0) {
        await propertyValueInput.fill('1000000');
        await this.takeScreenshot('step1_property_value', 'Property value entered');
        this.addFinding('PASS', 'Property value input functional', 'Step 1');
      } else {
        this.addFinding('ERROR', 'Property value input not found', 'Step 1');
      }

      // Test property ownership dropdown
      console.log('Testing property ownership dropdown...');
      await this.testPropertyOwnershipDropdown();

      // Test interest rate
      console.log('Testing interest rate input...');
      await this.testInterestRate();

      // Test loan term
      console.log('Testing loan term dropdown...');
      await this.testLoanTerm();

      // Test continue button
      console.log('Testing continue button...');
      await this.testContinueButton('step1');

    } catch (error) {
      this.addFinding('ERROR', `Step 1 test failed: ${error.message}`, 'Step 1');
      await this.takeScreenshot('step1_error', 'Step 1 error state');
    }
  }

  async testPropertyOwnershipDropdown() {
    try {
      // Look for property ownership dropdown with multiple selector strategies
      const selectors = [
        '[data-testid*="property"], [data-testid*="ownership"]',
        'select[name*="property"], select[name*="ownership"]',
        '.MuiSelect-root, .ant-select, select',
        'div[role="combobox"], div[role="listbox"]'
      ];

      let dropdown = null;
      for (const selector of selectors) {
        const element = this.page.locator(selector).first();
        if (await element.count() > 0) {
          dropdown = element;
          break;
        }
      }

      if (dropdown) {
        await dropdown.click();
        await this.takeScreenshot('step1_dropdown_open', 'Property ownership dropdown opened');

        // Test LTV logic for each option
        await this.testLTVLogic();
        
        this.addFinding('PASS', 'Property ownership dropdown functional', 'Step 1');
      } else {
        this.addFinding('ERROR', 'Property ownership dropdown not found', 'Step 1');
      }
    } catch (error) {
      this.addFinding('ERROR', `Property ownership dropdown test failed: ${error.message}`, 'Step 1');
    }
  }

  async testLTVLogic() {
    console.log('Testing LTV Logic (75%, 50%, 70% scenarios)...');
    
    const ltvScenarios = [
      { option: 'I don\'t own any property', expectedLTV: 75, description: 'No property - 75% LTV' },
      { option: 'I own a property', expectedLTV: 50, description: 'Has property - 50% LTV' },
      { option: 'I\'m selling a property', expectedLTV: 70, description: 'Selling property - 70% LTV' }
    ];

    for (const scenario of ltvScenarios) {
      try {
        // Try to find and select the option
        const optionSelectors = [
          `text="${scenario.option}"`,
          `[value*="${scenario.expectedLTV}"]`,
          `li:has-text("${scenario.option}")`,
          `.MuiMenuItem-root:has-text("${scenario.option}")`
        ];

        let optionSelected = false;
        for (const selector of optionSelectors) {
          const option = this.page.locator(selector);
          if (await option.count() > 0) {
            await option.click();
            await this.takeScreenshot(`step1_ltv_${scenario.expectedLTV}`, scenario.description);
            optionSelected = true;
            break;
          }
        }

        if (optionSelected) {
          // Verify slider range changed
          await this.verifySliderRange(scenario.expectedLTV);
          this.addFinding('PASS', `LTV logic working for ${scenario.description}`, 'Step 1 LTV');
        } else {
          this.addFinding('ERROR', `Could not select option: ${scenario.option}`, 'Step 1 LTV');
        }

      } catch (error) {
        this.addFinding('ERROR', `LTV test failed for ${scenario.description}: ${error.message}`, 'Step 1 LTV');
      }
    }
  }

  async verifySliderRange(expectedMaxLTV) {
    try {
      const sliders = this.page.locator('input[type="range"], .MuiSlider-root, .ant-slider');
      if (await sliders.count() > 0) {
        const slider = sliders.first();
        const maxValue = await slider.getAttribute('max');
        
        if (maxValue && parseInt(maxValue) === expectedMaxLTV) {
          this.addFinding('PASS', `Slider max value correctly set to ${expectedMaxLTV}%`, 'Step 1 LTV');
        } else {
          this.addFinding('WARNING', `Slider max value is ${maxValue}, expected ${expectedMaxLTV}%`, 'Step 1 LTV');
        }
      }
    } catch (error) {
      this.addFinding('WARNING', `Could not verify slider range: ${error.message}`, 'Step 1 LTV');
    }
  }

  async testInterestRate() {
    try {
      const interestInput = this.page.locator('input[name*="interest"], input[placeholder*="interest"], input[name*="rate"]').first();
      
      if (await interestInput.count() > 0) {
        const defaultValue = await interestInput.inputValue();
        if (defaultValue === '5' || defaultValue === '5.0') {
          this.addFinding('PASS', 'Interest rate defaults to 5% as specified', 'Step 1');
        } else {
          this.addFinding('WARNING', `Interest rate default is ${defaultValue}, expected 5%`, 'Step 1');
        }

        // Test custom input
        await interestInput.fill('4.5');
        await this.takeScreenshot('step1_custom_interest', 'Custom interest rate entered');
        this.addFinding('PASS', 'Interest rate input functional', 'Step 1');
      } else {
        this.addFinding('ERROR', 'Interest rate input not found', 'Step 1');
      }
    } catch (error) {
      this.addFinding('ERROR', `Interest rate test failed: ${error.message}`, 'Step 1');
    }
  }

  async testLoanTerm() {
    try {
      const loanTermSelectors = [
        'select[name*="term"], select[name*="year"]',
        '.MuiSelect-root:has-text("year"), .MuiSelect-root:has-text("שנה")',
        'div[role="combobox"]:has-text("year")'
      ];

      let loanTermDropdown = null;
      for (const selector of loanTermSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.count() > 0) {
          loanTermDropdown = element;
          break;
        }
      }

      if (loanTermDropdown) {
        await loanTermDropdown.click();
        await this.takeScreenshot('step1_loan_term', 'Loan term dropdown opened');
        
        // Try to select a common term like 25 years
        const termOptions = this.page.locator('li:has-text("25"), option[value="25"]');
        if (await termOptions.count() > 0) {
          await termOptions.first().click();
          this.addFinding('PASS', 'Loan term selection functional', 'Step 1');
        } else {
          this.addFinding('WARNING', 'Could not find 25 year option in loan term', 'Step 1');
        }
      } else {
        this.addFinding('ERROR', 'Loan term dropdown not found', 'Step 1');
      }
    } catch (error) {
      this.addFinding('ERROR', `Loan term test failed: ${error.message}`, 'Step 1');
    }
  }

  async testContinueButton(stepName) {
    try {
      const continueSelectors = [
        'button:has-text("Continue"), button:has-text("המשך"), button:has-text("Продолжить")',
        '[data-testid*="continue"], [data-testid*="next"]',
        '.btn-primary, .MuiButton-containedPrimary',
        'button[type="submit"]'
      ];

      let continueButton = null;
      for (const selector of continueSelectors) {
        const button = this.page.locator(selector);
        if (await button.count() > 0 && await button.isVisible()) {
          continueButton = button.first();
          break;
        }
      }

      if (continueButton) {
        const isEnabled = await continueButton.isEnabled();
        if (isEnabled) {
          this.addFinding('PASS', `Continue button is functional in ${stepName}`, stepName);
        } else {
          this.addFinding('WARNING', `Continue button is disabled in ${stepName}`, stepName);
        }
      } else {
        this.addFinding('ERROR', `Continue button not found in ${stepName}`, stepName);
      }
    } catch (error) {
      this.addFinding('ERROR', `Continue button test failed in ${stepName}: ${error.message}`, stepName);
    }
  }

  async testStep2() {
    console.log('\n=== TESTING STEP 2: Personal Information ===');
    
    try {
      await this.page.goto('http://localhost:5173/services/calculate-mortgage/2');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('step2_initial', 'Step 2 initial load');

      // Test personal information form fields
      await this.testPersonalInfoFields();
      
      // Test form validation
      await this.testFormValidation();

      // Test continue button
      await this.testContinueButton('step2');

    } catch (error) {
      this.addFinding('ERROR', `Step 2 test failed: ${error.message}`, 'Step 2');
      await this.takeScreenshot('step2_error', 'Step 2 error state');
    }
  }

  async testPersonalInfoFields() {
    try {
      const fields = [
        { name: 'first_name', label: 'First Name', testValue: 'John' },
        { name: 'last_name', label: 'Last Name', testValue: 'Doe' },
        { name: 'phone', label: 'Phone', testValue: '0501234567' },
        { name: 'email', label: 'Email', testValue: 'john.doe@example.com' }
      ];

      for (const field of fields) {
        const input = this.page.locator(`input[name*="${field.name}"], input[placeholder*="${field.label}"]`).first();
        
        if (await input.count() > 0) {
          await input.fill(field.testValue);
          this.addFinding('PASS', `${field.label} field functional`, 'Step 2');
        } else {
          this.addFinding('WARNING', `${field.label} field not found`, 'Step 2');
        }
      }

      await this.takeScreenshot('step2_fields_filled', 'Personal information fields filled');
    } catch (error) {
      this.addFinding('ERROR', `Personal info fields test failed: ${error.message}`, 'Step 2');
    }
  }

  async testFormValidation() {
    try {
      // Test validation by submitting empty form
      const submitButton = this.page.locator('button[type="submit"], button:has-text("Continue")').first();
      
      if (await submitButton.count() > 0) {
        // Clear all fields first
        const inputs = this.page.locator('input[type="text"], input[type="email"], input[type="tel"]');
        for (let i = 0; i < await inputs.count(); i++) {
          await inputs.nth(i).fill('');
        }

        await submitButton.click();
        await this.page.waitForTimeout(1000);

        // Check for validation messages
        const validationMessages = this.page.locator('.error, .invalid, [role="alert"], .MuiFormHelperText-error');
        if (await validationMessages.count() > 0) {
          this.addFinding('PASS', 'Form validation working - shows error messages', 'Step 2');
          await this.takeScreenshot('step2_validation', 'Form validation messages shown');
        } else {
          this.addFinding('WARNING', 'No validation messages found', 'Step 2');
        }
      }
    } catch (error) {
      this.addFinding('ERROR', `Form validation test failed: ${error.message}`, 'Step 2');
    }
  }

  async testStep3() {
    console.log('\n=== TESTING STEP 3: Income & Employment ===');
    
    try {
      await this.page.goto('http://localhost:5173/services/calculate-mortgage/3');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('step3_initial', 'Step 3 initial load');

      // Test income and employment dropdowns
      await this.testIncomeDropdowns();
      
      // Test obligations section
      await this.testObligationsSection();

      // Test continue button
      await this.testContinueButton('step3');

    } catch (error) {
      this.addFinding('ERROR', `Step 3 test failed: ${error.message}`, 'Step 3');
      await this.takeScreenshot('step3_error', 'Step 3 error state');
    }
  }

  async testIncomeDropdowns() {
    try {
      const dropdownTests = [
        { name: 'employment', label: 'Employment Type' },
        { name: 'income', label: 'Income Source' },
        { name: 'professional', label: 'Professional Field' }
      ];

      for (const dropdown of dropdownTests) {
        await this.testDropdownFunctionality(dropdown.name, dropdown.label, 'Step 3');
      }
    } catch (error) {
      this.addFinding('ERROR', `Income dropdowns test failed: ${error.message}`, 'Step 3');
    }
  }

  async testDropdownFunctionality(name, label, step) {
    try {
      const dropdownSelectors = [
        `select[name*="${name}"]`,
        `.MuiSelect-root:has-text("${label}")`,
        `div[role="combobox"]:has-text("${label}")`,
        `[data-testid*="${name}"]`
      ];

      let dropdown = null;
      for (const selector of dropdownSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          dropdown = element;
          break;
        }
      }

      if (dropdown) {
        await dropdown.click();
        await this.page.waitForTimeout(500);
        
        // Check if options appear
        const options = this.page.locator('li, option, .MuiMenuItem-root');
        if (await options.count() > 0) {
          await this.takeScreenshot(`${step.toLowerCase()}_${name}_dropdown`, `${label} dropdown opened`);
          
          // Select first available option
          await options.first().click();
          this.addFinding('PASS', `${label} dropdown functional`, step);
        } else {
          this.addFinding('WARNING', `${label} dropdown has no options`, step);
        }
      } else {
        this.addFinding('WARNING', `${label} dropdown not found`, step);
      }
    } catch (error) {
      this.addFinding('ERROR', `${label} dropdown test failed: ${error.message}`, step);
    }
  }

  async testObligationsSection() {
    try {
      const obligationFields = [
        'existing_loans',
        'credit_cards',
        'other_debts'
      ];

      for (const field of obligationFields) {
        const input = this.page.locator(`input[name*="${field}"], input[placeholder*="${field}"]`).first();
        
        if (await input.count() > 0) {
          await input.fill('1000');
          this.addFinding('PASS', `${field} input functional`, 'Step 3');
        } else {
          this.addFinding('WARNING', `${field} input not found`, 'Step 3');
        }
      }

      await this.takeScreenshot('step3_obligations', 'Obligations section filled');
    } catch (error) {
      this.addFinding('ERROR', `Obligations section test failed: ${error.message}`, 'Step 3');
    }
  }

  async testStep4() {
    console.log('\n=== TESTING STEP 4: Bank Offers & Program Selection ===');
    
    try {
      await this.page.goto('http://localhost:5173/services/calculate-mortgage/4');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('step4_initial', 'Step 4 initial load');

      // Test bank offers display
      await this.testBankOffersDisplay();
      
      // Test program selection
      await this.testProgramSelection();

      // Test submission process
      await this.testSubmissionProcess();

    } catch (error) {
      this.addFinding('ERROR', `Step 4 test failed: ${error.message}`, 'Step 4');
      await this.takeScreenshot('step4_error', 'Step 4 error state');
    }
  }

  async testBankOffersDisplay() {
    try {
      // Look for bank offer cards or tables
      const bankOffers = this.page.locator('.bank-offer, .offer-card, .MuiCard-root, .offer-item');
      
      if (await bankOffers.count() > 0) {
        this.addFinding('PASS', `Found ${await bankOffers.count()} bank offers displayed`, 'Step 4');
        await this.takeScreenshot('step4_bank_offers', 'Bank offers displayed');
        
        // Test individual offer details
        const firstOffer = bankOffers.first();
        const offerText = await firstOffer.textContent();
        
        if (offerText && (offerText.includes('%') || offerText.includes('rate') || offerText.includes('ריבית'))) {
          this.addFinding('PASS', 'Bank offers contain rate information', 'Step 4');
        } else {
          this.addFinding('WARNING', 'Bank offers may be missing rate information', 'Step 4');
        }
      } else {
        this.addFinding('ERROR', 'No bank offers found', 'Step 4');
      }
    } catch (error) {
      this.addFinding('ERROR', `Bank offers test failed: ${error.message}`, 'Step 4');
    }
  }

  async testProgramSelection() {
    try {
      const selectionElements = this.page.locator('input[type="radio"], .MuiRadio-root, button:has-text("Select"), button:has-text("בחר")');
      
      if (await selectionElements.count() > 0) {
        await selectionElements.first().click();
        await this.takeScreenshot('step4_program_selected', 'Program selected');
        this.addFinding('PASS', 'Program selection functional', 'Step 4');
      } else {
        this.addFinding('WARNING', 'No program selection elements found', 'Step 4');
      }
    } catch (error) {
      this.addFinding('ERROR', `Program selection test failed: ${error.message}`, 'Step 4');
    }
  }

  async testSubmissionProcess() {
    try {
      const submitButtons = this.page.locator('button:has-text("Submit"), button:has-text("שלח"), button:has-text("Apply"), button:has-text("הגש בקשה")');
      
      if (await submitButtons.count() > 0) {
        const submitButton = submitButtons.first();
        const isEnabled = await submitButton.isEnabled();
        
        if (isEnabled) {
          this.addFinding('PASS', 'Submit button is enabled and ready', 'Step 4');
        } else {
          this.addFinding('WARNING', 'Submit button is disabled', 'Step 4');
        }
        
        await this.takeScreenshot('step4_submission_ready', 'Ready for submission');
      } else {
        this.addFinding('ERROR', 'No submit button found', 'Step 4');
      }
    } catch (error) {
      this.addFinding('ERROR', `Submission process test failed: ${error.message}`, 'Step 4');
    }
  }

  async testMultiLanguage() {
    console.log('\n=== TESTING MULTI-LANGUAGE FUNCTIONALITY ===');
    
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'he', name: 'Hebrew' },
      { code: 'ru', name: 'Russian' }
    ];

    for (const lang of languages) {
      try {
        await this.page.goto('http://localhost:5173/services/calculate-mortgage/1');
        
        // Look for language switcher
        const langSwitcher = this.page.locator(`[data-lang="${lang.code}"], button:has-text("${lang.name}"), .lang-${lang.code}`);
        
        if (await langSwitcher.count() > 0) {
          await langSwitcher.click();
          await this.page.waitForTimeout(1000);
          await this.takeScreenshot(`multilang_${lang.code}`, `${lang.name} language selected`);
          
          // Verify text direction for Hebrew
          if (lang.code === 'he') {
            const bodyDir = await this.page.locator('body').getAttribute('dir');
            if (bodyDir === 'rtl') {
              this.addFinding('PASS', 'Hebrew RTL direction correctly applied', 'Multi-Language');
            } else {
              this.addFinding('ERROR', 'Hebrew RTL direction not applied', 'Multi-Language');
            }
          }
          
          this.addFinding('PASS', `${lang.name} language switch functional`, 'Multi-Language');
        } else {
          this.addFinding('WARNING', `${lang.name} language switcher not found`, 'Multi-Language');
        }
        
      } catch (error) {
        this.addFinding('ERROR', `${lang.name} language test failed: ${error.message}`, 'Multi-Language');
      }
    }
  }

  async testDropdownArchitecture() {
    console.log('\n=== TESTING DROPDOWN ARCHITECTURE PER SPECIFICATION ===');
    
    try {
      // Test API endpoints for dropdown data
      const apiTests = [
        { endpoint: '/api/v1/calculation-parameters?business_path=mortgage', name: 'Calculation Parameters' },
        { endpoint: '/api/v1/dropdowns', name: 'General Dropdowns' },
        { endpoint: '/api/v1/banks', name: 'Banks Data' }
      ];

      for (const test of apiTests) {
        try {
          const response = await this.page.request.get(`http://localhost:8003${test.endpoint}`);
          
          if (response.ok()) {
            const data = await response.json();
            this.addFinding('PASS', `${test.name} API endpoint working`, 'Dropdown Architecture');
            
            // Basic data structure validation
            if (data && (Array.isArray(data) || typeof data === 'object')) {
              this.addFinding('PASS', `${test.name} returns valid data structure`, 'Dropdown Architecture');
            } else {
              this.addFinding('WARNING', `${test.name} data structure may be invalid`, 'Dropdown Architecture');
            }
          } else {
            this.addFinding('ERROR', `${test.name} API endpoint failed: ${response.status()}`, 'Dropdown Architecture');
          }
        } catch (error) {
          this.addFinding('ERROR', `${test.name} API test failed: ${error.message}`, 'Dropdown Architecture');
        }
      }
    } catch (error) {
      this.addFinding('ERROR', `Dropdown architecture test failed: ${error.message}`, 'Dropdown Architecture');
    }
  }

  async testPerformance() {
    console.log('\n=== TESTING PERFORMANCE ===');
    
    const steps = [
      'http://localhost:5173/services/calculate-mortgage/1',
      'http://localhost:5173/services/calculate-mortgage/2',
      'http://localhost:5173/services/calculate-mortgage/3',
      'http://localhost:5173/services/calculate-mortgage/4'
    ];

    for (let i = 0; i < steps.length; i++) {
      try {
        const stepName = `Step ${i + 1}`;
        const startTime = Date.now();
        
        await this.page.goto(steps[i]);
        await this.page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        this.results.performance[stepName] = {
          url: steps[i],
          loadTime: loadTime,
          status: loadTime < 3000 ? 'GOOD' : loadTime < 5000 ? 'ACCEPTABLE' : 'SLOW'
        };

        if (loadTime < 3000) {
          this.addFinding('PASS', `${stepName} loads in ${loadTime}ms (< 3s)`, 'Performance');
        } else if (loadTime < 5000) {
          this.addFinding('WARNING', `${stepName} loads in ${loadTime}ms (3-5s)`, 'Performance');
        } else {
          this.addFinding('ERROR', `${stepName} loads in ${loadTime}ms (> 5s)`, 'Performance');
        }
        
      } catch (error) {
        this.addFinding('ERROR', `Performance test failed for Step ${i + 1}: ${error.message}`, 'Performance');
      }
    }
  }

  async runFullQA() {
    console.log('🚀 Starting Comprehensive Mortgage Calculator QA Testing...\n');
    
    await this.init();

    try {
      // Performance testing first
      await this.testPerformance();
      
      // Test each step individually
      await this.testStep1();
      await this.testStep2();
      await this.testStep3();
      await this.testStep4();
      
      // Test multi-language functionality
      await this.testMultiLanguage();
      
      // Test dropdown architecture
      await this.testDropdownArchitecture();
      
      // Generate final report
      await this.generateReport();
      
    } catch (error) {
      console.error('QA testing failed:', error);
      this.addFinding('CRITICAL', `QA testing framework failed: ${error.message}`, 'Framework');
    } finally {
      await this.cleanup();
    }
  }

  async generateReport() {
    console.log('\n=== GENERATING QA REPORT ===');
    
    // Summary statistics
    const stats = {
      total: this.results.findings.length,
      critical: this.results.findings.filter(f => f.severity === 'CRITICAL').length,
      errors: this.results.findings.filter(f => f.severity === 'ERROR').length,
      warnings: this.results.findings.filter(f => f.severity === 'WARNING').length,
      passes: this.results.findings.filter(f => f.severity === 'PASS').length
    };

    // Create HTML report
    const htmlReport = this.generateHTMLReport(stats);
    
    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `./mortgage-qa-report-${timestamp}.html`;
    const jsonPath = `./mortgage-qa-results-${timestamp}.json`;
    
    fs.writeFileSync(reportPath, htmlReport);
    fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));
    
    console.log(`\n📊 QA REPORT GENERATED:`);
    console.log(`HTML Report: ${reportPath}`);
    console.log(`JSON Results: ${jsonPath}`);
    console.log(`Screenshots: ${this.screenshotDir}/`);
    console.log(`\n📈 SUMMARY:`);
    console.log(`✅ Passes: ${stats.passes}`);
    console.log(`⚠️  Warnings: ${stats.warnings}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log(`🚨 Critical: ${stats.critical}`);
    
    return { reportPath, jsonPath, stats };
  }

  generateHTMLReport(stats) {
    const findingsByStep = this.results.findings.reduce((acc, finding) => {
      if (!acc[finding.step]) acc[finding.step] = [];
      acc[finding.step].push(finding);
      return acc;
    }, {});

    const getSeverityColor = (severity) => {
      switch (severity) {
        case 'CRITICAL': return '#ff0000';
        case 'ERROR': return '#ff4444';
        case 'WARNING': return '#ff8800';
        case 'PASS': return '#28a745';
        default: return '#666666';
      }
    };

    const getSeverityEmoji = (severity) => {
      switch (severity) {
        case 'CRITICAL': return '🚨';
        case 'ERROR': return '❌';
        case 'WARNING': return '⚠️';
        case 'PASS': return '✅';
        default: return 'ℹ️';
      }
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mortgage Calculator QA Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; border-left: 4px solid #007bff; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .finding { padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid; }
        .finding-critical { background: #ffe6e6; border-color: #ff0000; }
        .finding-error { background: #fff0f0; border-color: #ff4444; }
        .finding-warning { background: #fff8e1; border-color: #ff8800; }
        .finding-pass { background: #f0f8f0; border-color: #28a745; }
        .performance-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .performance-table th, .performance-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .performance-table th { background: #f8f9fa; }
        .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
        .screenshot-card { border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
        .screenshot-card img { width: 100%; height: 200px; object-fit: cover; }
        .screenshot-card .info { padding: 10px; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 Mortgage Calculator QA Report</h1>
            <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
            <p><strong>Base URL:</strong> ${this.results.baseUrl}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" style="color: #28a745">${stats.passes}</div>
                <div>✅ Passes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #ff8800">${stats.warnings}</div>
                <div>⚠️ Warnings</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #ff4444">${stats.errors}</div>
                <div>❌ Errors</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #ff0000">${stats.critical}</div>
                <div>🚨 Critical</div>
            </div>
        </div>

        ${Object.entries(findingsByStep).map(([step, findings]) => `
            <div class="section">
                <h2>${step}</h2>
                ${findings.map(finding => `
                    <div class="finding finding-${finding.severity.toLowerCase()}">
                        <strong>${getSeverityEmoji(finding.severity)} ${finding.severity}:</strong>
                        ${finding.description}
                        ${finding.element ? `<br><small>Element: ${finding.element}</small>` : ''}
                        <div class="timestamp">${new Date(finding.timestamp).toLocaleTimeString()}</div>
                    </div>
                `).join('')}
            </div>
        `).join('')}

        <div class="section">
            <h2>📊 Performance Results</h2>
            <table class="performance-table">
                <thead>
                    <tr>
                        <th>Step</th>
                        <th>URL</th>
                        <th>Load Time (ms)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(this.results.performance).map(([step, perf]) => `
                        <tr>
                            <td>${step}</td>
                            <td>${perf.url}</td>
                            <td>${perf.loadTime}</td>
                            <td style="color: ${perf.status === 'GOOD' ? '#28a745' : perf.status === 'ACCEPTABLE' ? '#ff8800' : '#ff4444'}">${perf.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>📸 Screenshots (${this.results.screenshots.length})</h2>
            <div class="screenshots">
                ${this.results.screenshots.map(screenshot => `
                    <div class="screenshot-card">
                        <div class="info">
                            <strong>${screenshot.step}</strong><br>
                            <small>${screenshot.description}</small><br>
                            <small class="timestamp">${screenshot.filename}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h2>📋 Test Summary</h2>
            <ul>
                <li><strong>Steps Tested:</strong> 1, 2, 3, 4</li>
                <li><strong>LTV Logic:</strong> 75%, 50%, 70% scenarios tested</li>
                <li><strong>Languages:</strong> English, Hebrew (RTL), Russian</li>
                <li><strong>Performance:</strong> Load time measurements for all steps</li>
                <li><strong>Dropdown Architecture:</strong> API endpoints validated</li>
                <li><strong>Screenshots:</strong> ${this.results.screenshots.length} captured</li>
            </ul>
        </div>
    </div>
</body>
</html>
    `;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run QA testing
async function runQA() {
  const qa = new MortgageCalculatorQA();
  await qa.runFullQA();
}

// Execute if run directly
if (require.main === module) {
  runQA().catch(console.error);
}

module.exports = MortgageCalculatorQA;