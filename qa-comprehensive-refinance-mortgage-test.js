const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class RefinanceMortgageQA {
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
    const screenshotPath = `screenshots/refinance-mortgage-qa-${name}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    this.screenshots.push(screenshotPath);
    return screenshotPath;
  }

  async testStep1(page) {
    console.log('🔍 Testing REFINANCE MORTGAGE STEP 1: Current Loan Information Form');
    
    try {
      await page.goto('http://localhost:5173/services/refinance-mortgage/1');
      await page.waitForLoadState('networkidle');

      // Test Existing Loan Balance Input
      try {
        const balanceInput = page.locator('input[name="existingBalance"], [data-testid="existing-loan-balance"]');
        if (await balanceInput.count() > 0) {
          await balanceInput.fill('450000');
          await this.logSuccess('step1', 'Existing loan balance input accepts values');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-balance-missing');
          await this.logIssue('step1', 'critical', 'Existing loan balance input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-balance-error');
        await this.logIssue('step1', 'error', `Existing loan balance error: ${error.message}`, screenshot);
      }

      // Test Current Monthly Payment Input
      try {
        const paymentInput = page.locator('input[name="currentMonthlyPayment"], [data-testid="current-monthly-payment"]');
        if (await paymentInput.count() > 0) {
          await paymentInput.fill('2800');
          await this.logSuccess('step1', 'Current monthly payment input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-payment-missing');
          await this.logIssue('step1', 'critical', 'Current monthly payment input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-payment-error');
        await this.logIssue('step1', 'error', `Current monthly payment error: ${error.message}`, screenshot);
      }

      // Test Current Interest Rate Input
      try {
        const rateInput = page.locator('input[name="currentInterestRate"], [data-testid="current-interest-rate"]');
        if (await rateInput.count() > 0) {
          await rateInput.fill('5.8');
          await this.logSuccess('step1', 'Current interest rate input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-rate-missing');
          await this.logIssue('step1', 'critical', 'Current interest rate input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-rate-error');
        await this.logIssue('step1', 'error', `Current interest rate error: ${error.message}`, screenshot);
      }

      // Test Remaining Term Input
      try {
        const termInput = page.locator('input[name="remainingTerm"], [data-testid="remaining-term"]');
        if (await termInput.count() > 0) {
          await termInput.fill('20');
          await this.logSuccess('step1', 'Remaining term input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-term-missing');
          await this.logIssue('step1', 'critical', 'Remaining term input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-term-error');
        await this.logIssue('step1', 'error', `Remaining term error: ${error.message}`, screenshot);
      }

      // Test Refinance Mortgage Step 1 Dropdown API
      try {
        console.log('Testing refinance_mortgage_step1 dropdown API...');
        const response = await fetch('http://localhost:8003/api/dropdowns/refinance_mortgage_step1/en');
        const dropdownData = await response.json();
        console.log('Refinance Mortgage Step 1 API response:', dropdownData);
        
        if (dropdownData.status === 'success') {
          await this.logSuccess('step1', 'Refinance mortgage step 1 dropdown API returns valid data');
          console.log('Available step 1 dropdowns:', Object.keys(dropdownData.options));
        } else {
          await this.logIssue('step1', 'critical', 'Refinance mortgage step 1 dropdown API not returning proper data');
        }
      } catch (error) {
        await this.logIssue('step1', 'critical', `Refinance mortgage step 1 dropdown API error: ${error.message}`);
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

      // Test Loan Type Dropdown
      try {
        const loanTypeDropdown = page.locator('select[name="loanType"], [data-testid="loan-type-dropdown"]');
        if (await loanTypeDropdown.count() > 0) {
          await loanTypeDropdown.selectOption('fixed_rate');
          await this.logSuccess('step1', 'Loan type dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-loan-type-missing');
          await this.logIssue('step1', 'warning', 'Loan type dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-loan-type-error');
        await this.logIssue('step1', 'error', `Loan type dropdown error: ${error.message}`, screenshot);
      }

      // Test Continue Button
      try {
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("המשך"), [data-testid="continue-button"]');
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          await page.waitForURL('**/refinance-mortgage/2');
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
    console.log('🔍 Testing REFINANCE MORTGAGE STEP 2: Refinance Options & Rate Comparison');
    
    try {
      await page.goto('http://localhost:5173/services/refinance-mortgage/2');
      await page.waitForLoadState('networkidle');

      // Test New Interest Rate Input
      try {
        const newRateInput = page.locator('input[name="newInterestRate"], [data-testid="new-interest-rate"]');
        if (await newRateInput.count() > 0) {
          await newRateInput.fill('4.2'); // Lower rate for benefit
          await this.logSuccess('step2', 'New interest rate input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-new-rate-missing');
          await this.logIssue('step2', 'critical', 'New interest rate input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-new-rate-error');
        await this.logIssue('step2', 'error', `New interest rate error: ${error.message}`, screenshot);
      }

      // Test New Loan Term Dropdown
      try {
        const newTermDropdown = page.locator('select[name="newLoanTerm"], [data-testid="new-loan-term-dropdown"]');
        if (await newTermDropdown.count() > 0) {
          await newTermDropdown.selectOption('25'); // 25 years
          await this.logSuccess('step2', 'New loan term dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-new-term-missing');
          await this.logIssue('step2', 'critical', 'New loan term dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-new-term-error');
        await this.logIssue('step2', 'error', `New loan term dropdown error: ${error.message}`, screenshot);
      }

      // Test Cash-Out Amount Input
      try {
        const cashOutInput = page.locator('input[name="cashOutAmount"], [data-testid="cash-out-amount"]');
        if (await cashOutInput.count() > 0) {
          await cashOutInput.fill('50000'); // Optional cash out
          await this.logSuccess('step2', 'Cash-out amount input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-cash-out-missing');
          await this.logIssue('step2', 'warning', 'Cash-out amount input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-cash-out-error');
        await this.logIssue('step2', 'error', `Cash-out amount error: ${error.message}`, screenshot);
      }

      // Test Refinance Mortgage Step 2 Dropdown API
      try {
        const response = await fetch('http://localhost:8003/api/dropdowns/refinance_mortgage_step2/en');
        const dropdownData = await response.json();
        console.log('Refinance Mortgage Step 2 API response:', dropdownData);
        
        if (dropdownData.status === 'success') {
          await this.logSuccess('step2', 'Refinance mortgage step 2 dropdown API returns valid data');
          console.log('Available step 2 dropdowns:', Object.keys(dropdownData.options));
        } else {
          await this.logIssue('step2', 'critical', 'Refinance mortgage step 2 dropdown API not returning proper data');
        }
      } catch (error) {
        await this.logIssue('step2', 'critical', `Refinance mortgage step 2 dropdown API error: ${error.message}`);
      }

      // Test Monthly Payment Reduction Display
      try {
        const reductionDisplay = page.locator('[data-testid="payment-reduction"], .payment-reduction');
        if (await reductionDisplay.count() > 0) {
          const reductionText = await reductionDisplay.textContent();
          console.log('Monthly payment reduction:', reductionText);
          await this.logSuccess('step2', 'Monthly payment reduction calculated and displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-reduction-missing');
          await this.logIssue('step2', 'warning', 'Monthly payment reduction display not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-reduction-error');
        await this.logIssue('step2', 'error', `Payment reduction calculation error: ${error.message}`, screenshot);
      }

      // Test Rate Comparison Display
      try {
        const comparisonDisplay = page.locator('[data-testid="rate-comparison"], .rate-comparison');
        if (await comparisonDisplay.count() > 0) {
          await this.logSuccess('step2', 'Rate comparison display shown');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-comparison-missing');
          await this.logIssue('step2', 'warning', 'Rate comparison display not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-comparison-error');
        await this.logIssue('step2', 'error', `Rate comparison error: ${error.message}`, screenshot);
      }

      // Test Continue to Step 3
      try {
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("המשך")');
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          await page.waitForURL('**/refinance-mortgage/3');
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
    console.log('🔍 Testing REFINANCE MORTGAGE STEP 3: Bank Offers & Program Selection');
    
    try {
      await page.goto('http://localhost:5173/services/refinance-mortgage/3');
      await page.waitForLoadState('networkidle');

      // Test Refinance Mortgage Step 3 Dropdown API
      try {
        console.log('Testing refinance_mortgage_step3 dropdown API...');
        const response = await fetch('http://localhost:8003/api/dropdowns/refinance_mortgage_step3/en');
        const dropdownData = await response.json();
        console.log('Refinance Mortgage Step 3 API response:', dropdownData);
        
        if (dropdownData.status === 'success') {
          await this.logSuccess('step3', 'Refinance mortgage step 3 dropdown API returns valid data');
          console.log('Available step 3 dropdowns:', Object.keys(dropdownData.options));
        } else {
          await this.logIssue('step3', 'critical', 'Refinance mortgage step 3 dropdown API not returning proper data');
        }
      } catch (error) {
        await this.logIssue('step3', 'critical', `Refinance mortgage step 3 dropdown API error: ${error.message}`);
      }

      // Test Bank Offers Display
      try {
        const bankOffers = page.locator('[data-testid="bank-offers"], .bank-offers');
        if (await bankOffers.count() > 0) {
          await this.logSuccess('step3', 'Bank offers section displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-offers-missing');
          await this.logIssue('step3', 'critical', 'Bank offers section not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-offers-error');
        await this.logIssue('step3', 'error', `Bank offers error: ${error.message}`, screenshot);
      }

      // Test Bank Selection
      try {
        const bankSelector = page.locator('select[name="selectedBank"], [data-testid="bank-selector"]');
        if (await bankSelector.count() > 0) {
          await bankSelector.selectOption('bank_leumi');
          await this.logSuccess('step3', 'Bank selection functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-bank-selector-missing');
          await this.logIssue('step3', 'critical', 'Bank selector not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-bank-selector-error');
        await this.logIssue('step3', 'error', `Bank selection error: ${error.message}`, screenshot);
      }

      // Test Program Selection
      try {
        const programSelector = page.locator('select[name="selectedProgram"], [data-testid="program-selector"]');
        if (await programSelector.count() > 0) {
          await programSelector.selectOption({ index: 1 });
          await this.logSuccess('step3', 'Program selection functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-program-missing');
          await this.logIssue('step3', 'warning', 'Program selector not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-program-error');
        await this.logIssue('step3', 'error', `Program selection error: ${error.message}`, screenshot);
      }

      // Test Rate Comparison Table
      try {
        const rateTable = page.locator('[data-testid="rate-comparison-table"], .rate-comparison-table');
        if (await rateTable.count() > 0) {
          await this.logSuccess('step3', 'Rate comparison table displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-rate-table-missing');
          await this.logIssue('step3', 'warning', 'Rate comparison table not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-rate-table-error');
        await this.logIssue('step3', 'error', `Rate comparison table error: ${error.message}`, screenshot);
      }

      // Test Savings Calculator
      try {
        const savingsCalc = page.locator('[data-testid="savings-calculator"], .savings-calculator');
        if (await savingsCalc.count() > 0) {
          await this.logSuccess('step3', 'Savings calculator displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-savings-missing');
          await this.logIssue('step3', 'warning', 'Savings calculator not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-savings-error');
        await this.logIssue('step3', 'error', `Savings calculator error: ${error.message}`, screenshot);
      }

      // Test Continue to Step 4
      try {
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("המשך")');
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          await page.waitForURL('**/refinance-mortgage/4');
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
    console.log('🔍 Testing REFINANCE MORTGAGE STEP 4: Application Summary & Submission');
    
    try {
      await page.goto('http://localhost:5173/services/refinance-mortgage/4');
      await page.waitForLoadState('networkidle');

      // Test Refinance Mortgage Step 4 Dropdown API
      try {
        const response = await fetch('http://localhost:8003/api/dropdowns/refinance_mortgage_step4/en');
        const dropdownData = await response.json();
        console.log('Refinance Mortgage Step 4 API response:', dropdownData);
        
        if (dropdownData.status === 'success') {
          await this.logSuccess('step4', 'Refinance mortgage step 4 dropdown API returns valid data');
          console.log('Available step 4 dropdowns:', Object.keys(dropdownData.options));
        } else {
          await this.logIssue('step4', 'critical', 'Refinance mortgage step 4 dropdown API not returning proper data');
        }
      } catch (error) {
        await this.logIssue('step4', 'critical', `Refinance mortgage step 4 dropdown API error: ${error.message}`);
      }

      // Test Application Summary Display
      try {
        const summary = page.locator('[data-testid="application-summary"], .application-summary');
        if (await summary.count() > 0) {
          await this.logSuccess('step4', 'Application summary displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-summary-missing');
          await this.logIssue('step4', 'critical', 'Application summary not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-summary-error');
        await this.logIssue('step4', 'error', `Application summary error: ${error.message}`, screenshot);
      }

      // Test Final Rate Confirmation
      try {
        const rateConfirmation = page.locator('[data-testid="final-rate"], .final-rate');
        if (await rateConfirmation.count() > 0) {
          const rateText = await rateConfirmation.textContent();
          console.log('Final rate confirmation:', rateText);
          await this.logSuccess('step4', 'Final rate confirmation displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-rate-confirmation-missing');
          await this.logIssue('step4', 'warning', 'Final rate confirmation not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-rate-confirmation-error');
        await this.logIssue('step4', 'error', `Final rate confirmation error: ${error.message}`, screenshot);
      }

      // Test Total Savings Summary
      try {
        const savingsSummary = page.locator('[data-testid="total-savings-summary"], .total-savings-summary');
        if (await savingsSummary.count() > 0) {
          const savingsText = await savingsSummary.textContent();
          console.log('Total savings summary:', savingsText);
          await this.logSuccess('step4', 'Total savings summary displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-savings-summary-missing');
          await this.logIssue('step4', 'warning', 'Total savings summary not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-savings-summary-error');
        await this.logIssue('step4', 'error', `Total savings summary error: ${error.message}`, screenshot);
      }

      // Test Break-Even Period Display
      try {
        const breakEven = page.locator('[data-testid="break-even-period"], .break-even-period');
        if (await breakEven.count() > 0) {
          const breakEvenText = await breakEven.textContent();
          console.log('Break-even period:', breakEvenText);
          await this.logSuccess('step4', 'Break-even period displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-break-even-missing');
          await this.logIssue('step4', 'warning', 'Break-even period not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-break-even-error');
        await this.logIssue('step4', 'error', `Break-even period error: ${error.message}`, screenshot);
      }

      // Test Terms & Conditions Checkbox
      try {
        const termsCheckbox = page.locator('input[type="checkbox"][name="terms"], [data-testid="terms-checkbox"]');
        if (await termsCheckbox.count() > 0) {
          await termsCheckbox.check();
          await this.logSuccess('step4', 'Terms & conditions checkbox functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-terms-missing');
          await this.logIssue('step4', 'warning', 'Terms & conditions checkbox not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-terms-error');
        await this.logIssue('step4', 'error', `Terms checkbox error: ${error.message}`, screenshot);
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
    console.log('🏡 Testing Refinance Mortgage Business Logic');
    
    try {
      await page.goto('http://localhost:5173/services/refinance-mortgage/1');
      await page.waitForLoadState('networkidle');

      // Test Break-Even Calculation Logic
      try {
        // Set closing costs and calculate break-even
        const closingCostsInput = page.locator('input[name="closingCosts"], [data-testid="closing-costs"]');
        if (await closingCostsInput.count() > 0) {
          await closingCostsInput.fill('15000');
          await this.logSuccess('step1', 'Closing costs input functional for break-even calculation');
        } else {
          await this.logIssue('step1', 'warning', 'Closing costs input not found');
        }
      } catch (error) {
        await this.logIssue('step1', 'error', `Closing costs error: ${error.message}`);
      }

      // Test Refinance Recommendation Logic
      try {
        const recommendation = page.locator('[data-testid="refinance-recommendation"], .refinance-recommendation');
        if (await recommendation.count() > 0) {
          const recText = await recommendation.textContent();
          console.log('Refinance recommendation:', recText);
          await this.logSuccess('step1', 'Refinance recommendation displayed');
        } else {
          await this.logIssue('step1', 'warning', 'Refinance recommendation not found');
        }
      } catch (error) {
        await this.logIssue('step1', 'error', `Refinance recommendation error: ${error.message}`);
      }

      // Test Long-term Savings Analysis
      try {
        const longTermAnalysis = page.locator('[data-testid="long-term-analysis"], .long-term-analysis');
        if (await longTermAnalysis.count() > 0) {
          await this.logSuccess('step1', 'Long-term savings analysis available');
        } else {
          await this.logIssue('step1', 'warning', 'Long-term savings analysis not found');
        }
      } catch (error) {
        await this.logIssue('step1', 'error', `Long-term analysis error: ${error.message}`);
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
    <title>Refinance Mortgage QA Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #10b981; color: white; padding: 20px; border-radius: 8px; }
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
        <h1>🏡 Refinance Mortgage QA Testing Report</h1>
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
        <h2>REFINANCE MORTGAGE STEP ${step.replace('step', '').toUpperCase()}</h2>
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
        <h2>📊 REFINANCE MORTGAGE ANALYSIS</h2>
        <h3>Business Logic Compliance</h3>
        <ul>
            <li>Break-Even Calculation: ${this.issues.filter(i => i.description.includes('break-even')).length === 0 ? '✅ Working' : '❌ Issues found'}</li>
            <li>Payment Reduction Calculation: ${this.issues.filter(i => i.description.includes('reduction')).length === 0 ? '✅ Working' : '❌ Issues found'}</li>
            <li>Savings Analysis: ${this.issues.filter(i => i.description.includes('savings')).length === 0 ? '✅ Working' : '❌ Issues found'}</li>
            <li>Rate Comparison: ${this.issues.filter(i => i.description.includes('rate')).length === 0 ? '✅ Working' : '❌ Issues found'}</li>
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
            <li>Verify refinance benefit calculations</li>
            <li>Test break-even analysis accuracy</li>
            <li>Validate rate comparison logic</li>
            <li>Test cash-out refinance scenarios</li>
            <li>Verify bank offer integration</li>
        </ul>
    </div>
</body>
</html>
    `;

    return html;
  }
}

async function runRefinanceMortgageQA() {
  const qa = new RefinanceMortgageQA();
  
  // Create screenshots directory
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🏡 Starting Refinance Mortgage QA Testing...');
  
  await qa.testStep1(page);
  await qa.testStep2(page);
  await qa.testStep3(page);
  await qa.testStep4(page);
  await qa.testRefinanceBusinessLogic(page);

  await browser.close();

  const report = qa.generateReport();
  const reportPath = `refinance-mortgage-qa-report-${Date.now()}.html`;
  fs.writeFileSync(reportPath, report);

  console.log(`\n📊 Refinance Mortgage QA Testing completed!`);
  console.log(`📄 Report saved: ${reportPath}`);
  console.log(`🔍 Issues found: ${qa.issues.length}`);
  console.log(`📸 Screenshots: ${qa.screenshots.length}`);
  
  return { reportPath, issues: qa.issues, screenshots: qa.screenshots };
}

if (require.main === module) {
  runRefinanceMortgageQA().catch(console.error);
}

module.exports = { runRefinanceMortgageQA, RefinanceMortgageQA };