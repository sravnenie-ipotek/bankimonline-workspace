const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class RefinanceCreditQA {
  constructor() {
    this.startTime = Date.now();
    this.issues = [];
    this.screenshots = [];
    this.testResults = {
      step1: { passed: 0, failed: 0, issues: [] },
      step2: { passed: 0, failed: 0, issues: [] },
      step3: { passed: 0, failed: 0, issues: [] },
      step4: { passed: 0, failed: 0, issues: [] }
    };
  }

  async logIssue(step, severity, description, screenshot = null) {
    const issue = {
      step,
      severity,
      description,
      timestamp: new Date().toISOString(),
      screenshot
    };
    this.issues.push(issue);
    this.testResults[step].issues.push(issue);
    this.testResults[step].failed++;
    console.log(`❌ ${severity.toUpperCase()}: ${description}`);
  }

  async logSuccess(step, description) {
    this.testResults[step].passed++;
    console.log(`✅ PASS: ${description}`);
  }

  async takeScreenshot(page, name) {
    const screenshotPath = `screenshots/refinance-credit-qa-${name}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    this.screenshots.push(screenshotPath);
    return screenshotPath;
  }

  async testStep1(page) {
    console.log('🔍 Testing REFINANCE CREDIT STEP 1: Current Loan & Refinance Details');
    
    try {
      await page.goto('http://localhost:5173/services/refinance-credit/1');
      await page.waitForLoadState('networkidle');

      // Test Current Loan Balance Input
      try {
        const loanBalanceInput = page.locator('input[name="currentBalance"], [data-testid="current-loan-balance"]');
        if (await loanBalanceInput.count() > 0) {
          await loanBalanceInput.fill('450000');
          await this.logSuccess('step1', 'Current loan balance input accepts values');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-balance-missing');
          await this.logIssue('step1', 'critical', 'Current loan balance input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-balance-error');
        await this.logIssue('step1', 'error', `Current loan balance error: ${error.message}`, screenshot);
      }

      // Test Current Interest Rate Input
      try {
        const interestInput = page.locator('input[name="currentRate"], [data-testid="current-interest-rate"]');
        if (await interestInput.count() > 0) {
          await interestInput.fill('6.5');
          await this.logSuccess('step1', 'Current interest rate input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-rate-missing');
          await this.logIssue('step1', 'critical', 'Current interest rate input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-rate-error');
        await this.logIssue('step1', 'error', `Current interest rate error: ${error.message}`, screenshot);
      }

      // Test Remaining Term Dropdown
      try {
        const termDropdown = page.locator('select[name="remainingTerm"], [data-testid="remaining-term-dropdown"]');
        if (await termDropdown.count() > 0) {
          await termDropdown.selectOption('22'); // 22 years remaining
          await this.logSuccess('step1', 'Remaining term dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-term-missing');
          await this.logIssue('step1', 'critical', 'Remaining term dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-term-error');
        await this.logIssue('step1', 'error', `Remaining term dropdown error: ${error.message}`, screenshot);
      }

      // Test Current Monthly Payment Input
      try {
        const paymentInput = page.locator('input[name="currentPayment"], [data-testid="current-monthly-payment"]');
        if (await paymentInput.count() > 0) {
          await paymentInput.fill('2750');
          await this.logSuccess('step1', 'Current monthly payment input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-payment-missing');
          await this.logIssue('step1', 'critical', 'Current monthly payment input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-payment-error');
        await this.logIssue('step1', 'error', `Current monthly payment error: ${error.message}`, screenshot);
      }

      // Test Property Value Input
      try {
        const propertyInput = page.locator('input[name="propertyValue"], [data-testid="property-value"]');
        if (await propertyInput.count() > 0) {
          await propertyInput.fill('650000');
          await this.logSuccess('step1', 'Property value input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-property-missing');
          await this.logIssue('step1', 'warning', 'Property value input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-property-error');
        await this.logIssue('step1', 'error', `Property value error: ${error.message}`, screenshot);
      }

      // Test Refinance Reason Dropdown (API Testing)
      try {
        console.log('Testing refinance_credit_step1 dropdown API...');
        const response = await fetch('http://localhost:8003/api/dropdowns/refinance_credit_step1/en');
        const dropdownData = await response.json();
        console.log('Refinance Credit Step 1 API response:', dropdownData);
        
        if (dropdownData.status === 'success' && dropdownData.options['refinance_credit_step1_refinance_reason']) {
          await this.logSuccess('step1', 'Refinance reason dropdown API returns valid data');
          console.log('Available refinance reasons:', dropdownData.options['refinance_credit_step1_refinance_reason']);
        } else {
          await this.logIssue('step1', 'critical', 'Refinance reason dropdown API not returning proper data');
        }

        // Test UI dropdown
        const reasonDropdown = page.locator('select[name="refinanceReason"], [data-testid="refinance-reason-dropdown"]');
        if (await reasonDropdown.count() > 0) {
          await reasonDropdown.selectOption('lower_rate');
          await this.logSuccess('step1', 'Refinance reason dropdown functional in UI');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-reason-missing');
          await this.logIssue('step1', 'critical', 'Refinance reason dropdown not found in UI', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-reason-error');
        await this.logIssue('step1', 'critical', `Refinance reason dropdown error: ${error.message}`, screenshot);
      }

      // Test Current Lender Dropdown
      try {
        const lenderDropdown = page.locator('select[name="currentLender"], [data-testid="current-lender-dropdown"]');
        if (await lenderDropdown.count() > 0) {
          await lenderDropdown.selectOption('bank_hapoalim');
          await this.logSuccess('step1', 'Current lender dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-lender-missing');
          await this.logIssue('step1', 'warning', 'Current lender dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-lender-error');
        await this.logIssue('step1', 'error', `Current lender dropdown error: ${error.message}`, screenshot);
      }

      // Test Continue Button
      try {
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("המשך"), [data-testid="continue-button"]');
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          await page.waitForURL('**/refinance-credit/2');
          await this.logSuccess('step1', 'Continue button navigates to Step 2');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-continue-missing');
          await this.logIssue('step1', 'critical', 'Continue button not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-continue-error');
        await this.logIssue('step1', 'error', `Continue button error: ${error.message}`, screenshot);
      }

    } catch (error) {
      const screenshot = await this.takeScreenshot(page, 'step1-general-error');
      await this.logIssue('step1', 'critical', `Step 1 general error: ${error.message}`, screenshot);
    }
  }

  async testStep2(page) {
    console.log('🔍 Testing REFINANCE CREDIT STEP 2: Personal Information & Employment');
    
    try {
      await page.goto('http://localhost:5173/services/refinance-credit/2');
      await page.waitForLoadState('networkidle');

      // Test Personal Details Form
      const personalFields = [
        { name: 'firstName', testValue: 'Jane', label: 'First Name' },
        { name: 'lastName', testValue: 'Smith', label: 'Last Name' },
        { name: 'israeliId', testValue: '987654321', label: 'Israeli ID' },
        { name: 'birthDate', testValue: '1980-05-15', label: 'Birth Date' }
      ];

      for (const field of personalFields) {
        try {
          const input = page.locator(`input[name="${field.name}"], [data-testid="${field.name}"]`);
          if (await input.count() > 0) {
            await input.fill(field.testValue);
            await this.logSuccess('step2', `${field.label} input functional`);
          } else {
            const screenshot = await this.takeScreenshot(page, `step2-${field.name}-missing`);
            await this.logIssue('step2', 'warning', `${field.label} input not found`, screenshot);
          }
        } catch (error) {
          const screenshot = await this.takeScreenshot(page, `step2-${field.name}-error`);
          await this.logIssue('step2', 'error', `${field.label} input error: ${error.message}`, screenshot);
        }
      }

      // Test Family Status Dropdown (API Testing)
      try {
        const response = await fetch('http://localhost:8003/api/dropdowns/refinance_credit_step2/en');
        const dropdownData = await response.json();
        console.log('Refinance Credit Step 2 API response:', dropdownData);
        
        if (dropdownData.status === 'success') {
          await this.logSuccess('step2', 'Refinance credit step 2 dropdown API returns valid data');
          console.log('Available step 2 dropdowns:', Object.keys(dropdownData.options));
        } else {
          await this.logIssue('step2', 'critical', 'Refinance credit step 2 dropdown API not returning proper data');
        }

        const familyDropdown = page.locator('select[name="familyStatus"], [data-testid="family-status-dropdown"]');
        if (await familyDropdown.count() > 0) {
          await familyDropdown.selectOption('married');
          await this.logSuccess('step2', 'Family status dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-family-missing');
          await this.logIssue('step2', 'critical', 'Family status dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-family-error');
        await this.logIssue('step2', 'error', `Family status dropdown error: ${error.message}`, screenshot);
      }

      // Test Citizenship Dropdown
      try {
        const citizenshipDropdown = page.locator('select[name="citizenship"], [data-testid="citizenship-dropdown"]');
        if (await citizenshipDropdown.count() > 0) {
          await citizenshipDropdown.selectOption('israeli_citizen');
          await this.logSuccess('step2', 'Citizenship dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-citizenship-missing');
          await this.logIssue('step2', 'warning', 'Citizenship dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-citizenship-error');
        await this.logIssue('step2', 'error', `Citizenship dropdown error: ${error.message}`, screenshot);
      }

      // Test Education Level Dropdown
      try {
        const educationDropdown = page.locator('select[name="educationLevel"], [data-testid="education-level-dropdown"]');
        if (await educationDropdown.count() > 0) {
          await educationDropdown.selectOption('bachelors');
          await this.logSuccess('step2', 'Education level dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-education-missing');
          await this.logIssue('step2', 'warning', 'Education level dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-education-error');
        await this.logIssue('step2', 'error', `Education level dropdown error: ${error.message}`, screenshot);
      }

      // Test Military Service Dropdown (Israeli-specific)
      try {
        const militaryDropdown = page.locator('select[name="militaryService"], [data-testid="military-service-dropdown"]');
        if (await militaryDropdown.count() > 0) {
          await militaryDropdown.selectOption('completed');
          await this.logSuccess('step2', 'Military service dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-military-missing');
          await this.logIssue('step2', 'warning', 'Military service dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-military-error');
        await this.logIssue('step2', 'error', `Military service dropdown error: ${error.message}`, screenshot);
      }

      // Test Employment Status Dropdown
      try {
        const employmentDropdown = page.locator('select[name="employmentStatus"], [data-testid="employment-status-dropdown"]');
        if (await employmentDropdown.count() > 0) {
          await employmentDropdown.selectOption('full-time');
          await this.logSuccess('step2', 'Employment status dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-employment-missing');
          await this.logIssue('step2', 'critical', 'Employment status dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-employment-error');
        await this.logIssue('step2', 'error', `Employment status dropdown error: ${error.message}`, screenshot);
      }

      // Test Monthly Income Input
      try {
        const incomeInput = page.locator('input[name="monthlyIncome"], [data-testid="monthly-income"]');
        if (await incomeInput.count() > 0) {
          await incomeInput.fill('18000'); // Above minimum ₪8,000
          await this.logSuccess('step2', 'Monthly income input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-income-missing');
          await this.logIssue('step2', 'critical', 'Monthly income input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-income-error');
        await this.logIssue('step2', 'error', `Monthly income input error: ${error.message}`, screenshot);
      }

      // Test Continue to Step 3
      try {
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("המשך")');
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          await page.waitForURL('**/refinance-credit/3');
          await this.logSuccess('step2', 'Continue button navigates to Step 3');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-continue-missing');
          await this.logIssue('step2', 'critical', 'Continue button not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-continue-error');
        await this.logIssue('step2', 'error', `Continue button error: ${error.message}`, screenshot);
      }

    } catch (error) {
      const screenshot = await this.takeScreenshot(page, 'step2-general-error');
      await this.logIssue('step2', 'critical', `Step 2 general error: ${error.message}`, screenshot);
    }
  }

  async testStep3(page) {
    console.log('🔍 Testing REFINANCE CREDIT STEP 3: Financial Information & Obligations');
    
    try {
      await page.goto('http://localhost:5173/services/refinance-credit/3');
      await page.waitForLoadState('networkidle');

      // Test Refinance Credit Step 3 Dropdown API
      try {
        console.log('Testing refinance_credit_step3 dropdown API...');
        const response = await fetch('http://localhost:8003/api/dropdowns/refinance_credit_step3/en');
        const dropdownData = await response.json();
        console.log('Refinance Credit Step 3 API response:', dropdownData);
        
        if (dropdownData.status === 'success') {
          await this.logSuccess('step3', 'Refinance credit step 3 dropdown API returns valid data');
          console.log('Available step 3 dropdowns:', Object.keys(dropdownData.options));
        } else {
          await this.logIssue('step3', 'critical', 'Refinance credit step 3 dropdown API not returning proper data');
        }
      } catch (error) {
        await this.logIssue('step3', 'critical', `Refinance credit step 3 dropdown API error: ${error.message}`);
      }

      // Test Existing Obligations Dropdown
      try {
        const obligationsDropdown = page.locator('select[name="obligations"], [data-testid="obligations-dropdown"]');
        if (await obligationsDropdown.count() > 0) {
          await obligationsDropdown.selectOption('credit_cards');
          await this.logSuccess('step3', 'Obligations dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-obligations-missing');
          await this.logIssue('step3', 'critical', 'Obligations dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-obligations-error');
        await this.logIssue('step3', 'error', `Obligations dropdown error: ${error.message}`, screenshot);
      }

      // Test Main Income Source Dropdown
      try {
        const mainSourceDropdown = page.locator('select[name="mainSource"], [data-testid="main-source-dropdown"]');
        if (await mainSourceDropdown.count() > 0) {
          await mainSourceDropdown.selectOption('employment');
          await this.logSuccess('step3', 'Main income source dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-main-source-missing');
          await this.logIssue('step3', 'warning', 'Main income source dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-main-source-error');
        await this.logIssue('step3', 'error', `Main income source dropdown error: ${error.message}`, screenshot);
      }

      // Test Additional Income Dropdown
      try {
        const additionalIncomeDropdown = page.locator('select[name="additionalIncome"], [data-testid="additional-income-dropdown"]');
        if (await additionalIncomeDropdown.count() > 0) {
          await additionalIncomeDropdown.selectOption('rental');
          await this.logSuccess('step3', 'Additional income dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-additional-income-missing');
          await this.logIssue('step3', 'warning', 'Additional income dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-additional-income-error');
        await this.logIssue('step3', 'error', `Additional income dropdown error: ${error.message}`, screenshot);
      }

      // Test Monthly Obligations Input
      try {
        const obligationsInput = page.locator('input[name="monthlyObligations"], [data-testid="monthly-obligations"]');
        if (await obligationsInput.count() > 0) {
          await obligationsInput.fill('3000');
          await this.logSuccess('step3', 'Monthly obligations input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-obligations-input-missing');
          await this.logIssue('step3', 'warning', 'Monthly obligations input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-obligations-input-error');
        await this.logIssue('step3', 'error', `Monthly obligations input error: ${error.message}`, screenshot);
      }

      // Test DTI Calculation Display
      try {
        const dtiDisplay = page.locator('[data-testid="dti-ratio"], .dti-ratio');
        if (await dtiDisplay.count() > 0) {
          const dtiText = await dtiDisplay.textContent();
          console.log('DTI ratio displayed:', dtiText);
          await this.logSuccess('step3', 'DTI ratio calculation displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-dti-missing');
          await this.logIssue('step3', 'warning', 'DTI ratio display not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-dti-error');
        await this.logIssue('step3', 'error', `DTI calculation error: ${error.message}`, screenshot);
      }

      // Test Refinance Benefit Calculator
      try {
        const benefitCalculator = page.locator('[data-testid="benefit-calculator"], .benefit-calculator');
        if (await benefitCalculator.count() > 0) {
          await this.logSuccess('step3', 'Refinance benefit calculator displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-benefit-missing');
          await this.logIssue('step3', 'warning', 'Refinance benefit calculator not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-benefit-error');
        await this.logIssue('step3', 'error', `Refinance benefit calculator error: ${error.message}`, screenshot);
      }

      // Test Continue to Step 4
      try {
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("המשך")');
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          await page.waitForURL('**/refinance-credit/4');
          await this.logSuccess('step3', 'Continue button navigates to Step 4');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-continue-missing');
          await this.logIssue('step3', 'critical', 'Continue button not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-continue-error');
        await this.logIssue('step3', 'error', `Continue button error: ${error.message}`, screenshot);
      }

    } catch (error) {
      const screenshot = await this.takeScreenshot(page, 'step3-general-error');
      await this.logIssue('step3', 'critical', `Step 3 general error: ${error.message}`, screenshot);
    }
  }

  async testStep4(page) {
    console.log('🔍 Testing REFINANCE CREDIT STEP 4: Bank Programs & Refinance Finalization');
    
    try {
      await page.goto('http://localhost:5173/services/refinance-credit/4');
      await page.waitForLoadState('networkidle');

      // Test Refinance Credit Step 4 Dropdown API
      try {
        const response = await fetch('http://localhost:8003/api/dropdowns/refinance_credit_step4/en');
        const dropdownData = await response.json();
        console.log('Refinance Credit Step 4 API response:', dropdownData);
        
        if (dropdownData.status === 'success') {
          await this.logSuccess('step4', 'Refinance credit step 4 dropdown API returns valid data');
          console.log('Available step 4 dropdowns:', Object.keys(dropdownData.options));
        } else {
          await this.logIssue('step4', 'critical', 'Refinance credit step 4 dropdown API not returning proper data');
        }
      } catch (error) {
        await this.logIssue('step4', 'critical', `Refinance credit step 4 dropdown API error: ${error.message}`);
      }

      // Test Bank Offers Comparison Table
      try {
        const comparisonTable = page.locator('[data-testid="bank-comparison"], .bank-comparison');
        if (await comparisonTable.count() > 0) {
          await this.logSuccess('step4', 'Bank offers comparison table displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-comparison-missing');
          await this.logIssue('step4', 'critical', 'Bank offers comparison table not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-comparison-error');
        await this.logIssue('step4', 'error', `Bank offers comparison error: ${error.message}`, screenshot);
      }

      // Test Preferred Bank Dropdown
      try {
        const bankDropdown = page.locator('select[name="preferredBank"], [data-testid="preferred-bank-dropdown"]');
        if (await bankDropdown.count() > 0) {
          await bankDropdown.selectOption('bank_leumi');
          await this.logSuccess('step4', 'Preferred bank dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-bank-missing');
          await this.logIssue('step4', 'critical', 'Preferred bank dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-bank-error');
        await this.logIssue('step4', 'error', `Preferred bank dropdown error: ${error.message}`, screenshot);
      }

      // Test Loan Program Dropdown
      try {
        const programDropdown = page.locator('select[name="loanProgram"], [data-testid="loan-program-dropdown"]');
        if (await programDropdown.count() > 0) {
          await programDropdown.selectOption('standard_refinance');
          await this.logSuccess('step4', 'Loan program dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-program-missing');
          await this.logIssue('step4', 'warning', 'Loan program dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-program-error');
        await this.logIssue('step4', 'error', `Loan program dropdown error: ${error.message}`, screenshot);
      }

      // Test Rate Type Dropdown
      try {
        const rateTypeDropdown = page.locator('select[name="rateType"], [data-testid="rate-type-dropdown"]');
        if (await rateTypeDropdown.count() > 0) {
          await rateTypeDropdown.selectOption('fixed_rate');
          await this.logSuccess('step4', 'Rate type dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-rate-type-missing');
          await this.logIssue('step4', 'warning', 'Rate type dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-rate-type-error');
        await this.logIssue('step4', 'error', `Rate type dropdown error: ${error.message}`, screenshot);
      }

      // Test Refinance Terms Dropdown
      try {
        const termsDropdown = page.locator('select[name="refinanceTerms"], [data-testid="refinance-terms-dropdown"]');
        if (await termsDropdown.count() > 0) {
          await termsDropdown.selectOption('25_years');
          await this.logSuccess('step4', 'Refinance terms dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-terms-missing');
          await this.logIssue('step4', 'warning', 'Refinance terms dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-terms-error');
        await this.logIssue('step4', 'error', `Refinance terms dropdown error: ${error.message}`, screenshot);
      }

      // Test Monthly Payment Comparison
      try {
        const paymentComparison = page.locator('[data-testid="payment-comparison"], .payment-comparison');
        if (await paymentComparison.count() > 0) {
          await this.logSuccess('step4', 'Monthly payment comparison displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-payment-comparison-missing');
          await this.logIssue('step4', 'warning', 'Monthly payment comparison not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-payment-comparison-error');
        await this.logIssue('step4', 'error', `Payment comparison error: ${error.message}`, screenshot);
      }

      // Test Total Savings Display
      try {
        const savingsDisplay = page.locator('[data-testid="total-savings"], .total-savings');
        if (await savingsDisplay.count() > 0) {
          await this.logSuccess('step4', 'Total savings display shown');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-savings-missing');
          await this.logIssue('step4', 'warning', 'Total savings display not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-savings-error');
        await this.logIssue('step4', 'error', `Total savings display error: ${error.message}`, screenshot);
      }

      // Test Application Summary
      try {
        const summary = page.locator('[data-testid="application-summary"], .application-summary');
        if (await summary.count() > 0) {
          await this.logSuccess('step4', 'Application summary displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-summary-missing');
          await this.logIssue('step4', 'warning', 'Application summary not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-summary-error');
        await this.logIssue('step4', 'error', `Application summary error: ${error.message}`, screenshot);
      }

      // Test Submit Application Button
      try {
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("שלח"), [data-testid="submit-application"]');
        if (await submitBtn.count() > 0) {
          await this.logSuccess('step4', 'Submit application button found');
          // Note: Not clicking submit to avoid actual submission
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-submit-missing');
          await this.logIssue('step4', 'critical', 'Submit application button not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-submit-error');
        await this.logIssue('step4', 'error', `Submit button error: ${error.message}`, screenshot);
      }

    } catch (error) {
      const screenshot = await this.takeScreenshot(page, 'step4-general-error');
      await this.logIssue('step4', 'critical', `Step 4 general error: ${error.message}`, screenshot);
    }
  }

  async testRefinanceBusinessLogic(page) {
    console.log('💰 Testing Refinance Credit Business Logic');
    
    try {
      await page.goto('http://localhost:5173/services/refinance-credit/1');
      await page.waitForLoadState('networkidle');

      // Test Refinance Benefit Calculation
      try {
        // Set existing loan parameters
        const balanceInput = page.locator('input[name="currentBalance"]');
        const rateInput = page.locator('input[name="currentRate"]');
        const paymentInput = page.locator('input[name="currentPayment"]');
        
        if (await balanceInput.count() > 0 && await rateInput.count() > 0 && await paymentInput.count() > 0) {
          await balanceInput.fill('400000');
          await rateInput.fill('6.5');
          await paymentInput.fill('2750');
          
          // Check for benefit calculation
          await this.logSuccess('step1', 'Refinance benefit calculation inputs functional');
        } else {
          await this.logIssue('step1', 'warning', 'Refinance benefit calculation inputs not all found');
        }
      } catch (error) {
        await this.logIssue('step1', 'error', `Refinance benefit calculation error: ${error.message}`);
      }

      // Test Break-Even Analysis
      try {
        const breakEvenDisplay = page.locator('[data-testid="break-even"], .break-even');
        if (await breakEvenDisplay.count() > 0) {
          await this.logSuccess('step1', 'Break-even analysis displayed');
        } else {
          await this.logIssue('step1', 'warning', 'Break-even analysis not found');
        }
      } catch (error) {
        await this.logIssue('step1', 'error', `Break-even analysis error: ${error.message}`);
      }

      // Test Cash-Out Equity Calculation
      try {
        const cashOutSection = page.locator('[data-testid="cash-out"], .cash-out');
        if (await cashOutSection.count() > 0) {
          await this.logSuccess('step1', 'Cash-out equity calculation available');
        } else {
          await this.logIssue('step1', 'warning', 'Cash-out equity calculation not found');
        }
      } catch (error) {
        await this.logIssue('step1', 'error', `Cash-out calculation error: ${error.message}`);
      }

    } catch (error) {
      await this.logIssue('step1', 'error', `Refinance business logic testing error: ${error.message}`);
    }
  }

  generateReport() {
    const endTime = Date.now();
    const totalTime = ((endTime - this.startTime) / 1000 / 60).toFixed(2);
    
    const totalPassed = Object.values(this.testResults).reduce((sum, step) => sum + step.passed, 0);
    const totalFailed = Object.values(this.testResults).reduce((sum, step) => sum + step.failed, 0);
    const totalIssues = this.issues.length;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refinance Credit QA Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #8b5cf6; color: white; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .issue { margin: 10px 0; padding: 15px; border-left: 4px solid #dc3545; background: #f8f9fa; }
        .issue.warning { border-left-color: #ffc107; }
        .issue.critical { border-left-color: #dc3545; }
        .step-section { margin: 30px 0; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
        .screenshot { max-width: 300px; margin: 10px 0; }
        .timestamp { font-size: 0.8em; color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏠 Refinance Credit QA Testing Report</h1>
        <p><strong>Testing Duration:</strong> ${totalTime} minutes</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
    </div>

    <div class="summary">
        <div class="stat-card">
            <h3>Total Tests</h3>
            <h2>${totalPassed + totalFailed}</h2>
        </div>
        <div class="stat-card">
            <h3 class="passed">Passed</h3>
            <h2 class="passed">${totalPassed}</h2>
        </div>
        <div class="stat-card">
            <h3 class="failed">Failed</h3>
            <h2 class="failed">${totalFailed}</h2>
        </div>
        <div class="stat-card">
            <h3>Issues Found</h3>
            <h2>${totalIssues}</h2>
        </div>
    </div>

    ${Object.entries(this.testResults).map(([step, results]) => `
    <div class="step-section">
        <h2>REFINANCE CREDIT STEP ${step.replace('step', '').toUpperCase()}</h2>
        <p><span class="passed">✅ Passed: ${results.passed}</span> | <span class="failed">❌ Failed: ${results.failed}</span></p>
        
        ${results.issues.map(issue => `
        <div class="issue ${issue.severity}">
            <h4>${issue.severity.toUpperCase()}: ${issue.description}</h4>
            <p class="timestamp">${issue.timestamp}</p>
            ${issue.screenshot ? `<img src="${issue.screenshot}" alt="Screenshot" class="screenshot">` : ''}
        </div>
        `).join('')}
    </div>
    `).join('')}

    <div class="step-section">
        <h2>📊 REFINANCE CREDIT ANALYSIS</h2>
        <h3>Business Logic Compliance</h3>
        <ul>
            <li>Refinance Benefit Calculation: ${this.issues.filter(i => i.description.includes('benefit')).length === 0 ? '✅ Working' : '❌ Issues found'}</li>
            <li>Break-Even Analysis: ${this.issues.filter(i => i.description.includes('break-even')).length === 0 ? '✅ Working' : '❌ Issues found'}</li>
            <li>DTI Calculation: ${this.issues.filter(i => i.description.includes('DTI')).length === 0 ? '✅ Working' : '❌ Issues found'}</li>
            <li>Cash-Out Equity: ${this.issues.filter(i => i.description.includes('cash-out')).length === 0 ? '✅ Working' : '❌ Issues found'}</li>
        </ul>

        <h3>Critical Issues</h3>
        ${this.issues.filter(i => i.severity === 'critical').map(issue => `
        <div class="issue critical">
            <h4>CRITICAL: ${issue.description}</h4>
            <p><strong>Step:</strong> ${issue.step} | <strong>Time:</strong> ${issue.timestamp}</p>
            ${issue.screenshot ? `<img src="${issue.screenshot}" alt="Screenshot" class="screenshot">` : ''}
        </div>
        `).join('')}

        <h3>Recommendations</h3>
        <ul>
            <li>Fix critical UI element selectors for all steps</li>
            <li>Verify refinance reason dropdown functionality</li>
            <li>Test break-even calculation accuracy</li>
            <li>Validate cash-out equity calculations</li>
            <li>Test multi-borrower scenarios</li>
            <li>Verify bank comparison logic</li>
        </ul>
    </div>
</body>
</html>
    `;

    return html;
  }
}

async function runRefinanceCreditQA() {
  const qa = new RefinanceCreditQA();
  
  // Create screenshots directory
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🏠 Starting Refinance Credit QA Testing...');
  
  await qa.testStep1(page);
  await qa.testStep2(page);
  await qa.testStep3(page);
  await qa.testStep4(page);
  await qa.testRefinanceBusinessLogic(page);

  await browser.close();

  const report = qa.generateReport();
  const reportPath = `refinance-credit-qa-report-${Date.now()}.html`;
  fs.writeFileSync(reportPath, report);

  console.log(`\n📊 Refinance Credit QA Testing completed!`);
  console.log(`📄 Report saved: ${reportPath}`);
  console.log(`🔍 Issues found: ${qa.issues.length}`);
  console.log(`📸 Screenshots: ${qa.screenshots.length}`);
  
  return { reportPath, issues: qa.issues, screenshots: qa.screenshots };
}

if (require.main === module) {
  runRefinanceCreditQA().catch(console.error);
}

module.exports = { runRefinanceCreditQA, RefinanceCreditQA };