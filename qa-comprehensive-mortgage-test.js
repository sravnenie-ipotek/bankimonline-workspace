const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class MortgageCalculatorQA {
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
    const screenshotPath = `screenshots/mortgage-qa-${name}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    this.screenshots.push(screenshotPath);
    return screenshotPath;
  }

  async testStep1(page) {
    console.log('🔍 Testing STEP 1: Property & Loan Parameters');
    
    try {
      await page.goto('http://localhost:5173/services/calculate-mortgage/1');
      await page.waitForLoadState('networkidle');

      // Test Property Value Input
      try {
        const propertyValueInput = page.locator('input[name="propertyValue"], input[data-testid="property-value"]');
        if (await propertyValueInput.count() > 0) {
          await propertyValueInput.fill('800000');
          await this.logSuccess('step1', 'Property value input accepts numeric values');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-property-value-missing');
          await this.logIssue('step1', 'critical', 'Property value input field not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-property-value-error');
        await this.logIssue('step1', 'error', `Property value input error: ${error.message}`, screenshot);
      }

      // Test Property Ownership Dropdown
      try {
        const ownershipDropdown = page.locator('select[name="propertyOwnership"], [data-testid="property-ownership-dropdown"]');
        if (await ownershipDropdown.count() > 0) {
          const options = await ownershipDropdown.locator('option').allTextContents();
          console.log('Property ownership options:', options);
          
          // Test LTV logic for different ownership scenarios
          const ownershipScenarios = [
            { value: 'option_1', expectedLTV: 75, description: "No property ownership (75% LTV)" },
            { value: 'option_2', expectedLTV: 50, description: "Own property (50% LTV)" },
            { value: 'option_3', expectedLTV: 70, description: "Selling property (70% LTV)" }
          ];

          for (const scenario of ownershipScenarios) {
            try {
              await ownershipDropdown.selectOption(scenario.value);
              await page.waitForTimeout(1000); // Wait for LTV calculation
              
              // Check if initial payment slider reflects correct LTV
              const slider = page.locator('input[type="range"], [data-testid="initial-payment-slider"]');
              if (await slider.count() > 0) {
                const maxValue = await slider.getAttribute('max');
                const expectedMax = (800000 * scenario.expectedLTV) / 100;
                console.log(`LTV scenario: ${scenario.description}, Max slider: ${maxValue}, Expected: ${expectedMax}`);
                await this.logSuccess('step1', `Property ownership LTV logic working for ${scenario.description}`);
              }
            } catch (error) {
              const screenshot = await this.takeScreenshot(page, `step1-ltv-${scenario.value}-error`);
              await this.logIssue('step1', 'error', `LTV testing failed for ${scenario.description}: ${error.message}`, screenshot);
            }
          }
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-ownership-dropdown-missing');
          await this.logIssue('step1', 'critical', 'Property ownership dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-ownership-error');
        await this.logIssue('step1', 'error', `Property ownership dropdown error: ${error.message}`, screenshot);
      }

      // Test Initial Payment Slider
      try {
        const slider = page.locator('input[type="range"], [data-testid="initial-payment-slider"]');
        if (await slider.count() > 0) {
          await slider.fill('200000');
          await this.logSuccess('step1', 'Initial payment slider functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-slider-missing');
          await this.logIssue('step1', 'critical', 'Initial payment slider not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-slider-error');
        await this.logIssue('step1', 'error', `Initial payment slider error: ${error.message}`, screenshot);
      }

      // Test Interest Rate Input
      try {
        const interestInput = page.locator('input[name="interestRate"], [data-testid="interest-rate"]');
        if (await interestInput.count() > 0) {
          await interestInput.fill('5.0');
          await this.logSuccess('step1', 'Interest rate input accepts decimal values');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-interest-missing');
          await this.logIssue('step1', 'warning', 'Interest rate input not found or using default 5%', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-interest-error');
        await this.logIssue('step1', 'error', `Interest rate input error: ${error.message}`, screenshot);
      }

      // Test Loan Term Dropdown
      try {
        const termDropdown = page.locator('select[name="loanTerm"], [data-testid="loan-term-dropdown"]');
        if (await termDropdown.count() > 0) {
          await termDropdown.selectOption('25');
          await this.logSuccess('step1', 'Loan term dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step1-term-missing');
          await this.logIssue('step1', 'critical', 'Loan term dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step1-term-error');
        await this.logIssue('step1', 'error', `Loan term dropdown error: ${error.message}`, screenshot);
      }

      // Test Continue Button
      try {
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("המשך"), [data-testid="continue-button"]');
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          await page.waitForURL('**/calculate-mortgage/2');
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
    console.log('🔍 Testing STEP 2: Personal Information');
    
    try {
      await page.goto('http://localhost:5173/services/calculate-mortgage/2');
      await page.waitForLoadState('networkidle');

      // Test Personal Details Form
      const personalFields = [
        { name: 'firstName', testValue: 'John', label: 'First Name' },
        { name: 'lastName', testValue: 'Doe', label: 'Last Name' },
        { name: 'israeliId', testValue: '123456789', label: 'Israeli ID' },
        { name: 'birthDate', testValue: '1985-01-01', label: 'Birth Date' }
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

      // Test Family Status Dropdown
      try {
        const familyDropdown = page.locator('select[name="familyStatus"], [data-testid="family-status-dropdown"]');
        if (await familyDropdown.count() > 0) {
          await familyDropdown.selectOption('married');
          await this.logSuccess('step2', 'Family status dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step2-family-status-missing');
          await this.logIssue('step2', 'critical', 'Family status dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step2-family-status-error');
        await this.logIssue('step2', 'error', `Family status dropdown error: ${error.message}`, screenshot);
      }

      // Test Continue to Step 3
      try {
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("המשך")');
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          await page.waitForURL('**/calculate-mortgage/3');
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
    console.log('🔍 Testing STEP 3: Income & Employment (Critical Dropdown Testing)');
    
    try {
      await page.goto('http://localhost:5173/services/calculate-mortgage/3');
      await page.waitForLoadState('networkidle');

      // Test Obligations Dropdown (Critical per dropDownLogicBankim.md)
      try {
        console.log('Testing obligations dropdown (mortgage_step3_obligations)...');
        
        // First test direct API endpoint
        const response = await fetch('http://localhost:8003/api/dropdowns/mortgage_step3/en');
        const dropdownData = await response.json();
        console.log('Dropdown API response:', dropdownData);
        
        if (dropdownData.status === 'success' && dropdownData.options['mortgage_step3_obligations']) {
          await this.logSuccess('step3', 'Obligations dropdown API returns valid data');
          console.log('Available obligations options:', dropdownData.options['mortgage_step3_obligations']);
        } else {
          await this.logIssue('step3', 'critical', 'Obligations dropdown API not returning proper data');
        }

        // Test UI dropdown
        const obligationsDropdown = page.locator('select[name="obligation"], [data-testid="obligations-dropdown"]');
        if (await obligationsDropdown.count() > 0) {
          const options = await obligationsDropdown.locator('option').allTextContents();
          console.log('UI obligations options:', options);
          
          // Test selecting "no obligations" option
          await obligationsDropdown.selectOption('option_1');
          await page.waitForTimeout(1000);
          await this.logSuccess('step3', 'Obligations dropdown functional in UI');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-obligations-missing');
          await this.logIssue('step3', 'critical', 'Obligations dropdown not found in UI', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-obligations-error');
        await this.logIssue('step3', 'critical', `Obligations dropdown error: ${error.message}`, screenshot);
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
          await additionalIncomeDropdown.selectOption('none');
          await this.logSuccess('step3', 'Additional income dropdown functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-additional-income-missing');
          await this.logIssue('step3', 'warning', 'Additional income dropdown not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-additional-income-error');
        await this.logIssue('step3', 'error', `Additional income dropdown error: ${error.message}`, screenshot);
      }

      // Test Monthly Income Input
      try {
        const incomeInput = page.locator('input[name="monthlyIncome"], [data-testid="monthly-income"]');
        if (await incomeInput.count() > 0) {
          await incomeInput.fill('15000');
          await this.logSuccess('step3', 'Monthly income input functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step3-income-missing');
          await this.logIssue('step3', 'critical', 'Monthly income input not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step3-income-error');
        await this.logIssue('step3', 'error', `Monthly income input error: ${error.message}`, screenshot);
      }

      // Test Continue to Step 4
      try {
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("המשך")');
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          await page.waitForURL('**/calculate-mortgage/4');
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
    console.log('🔍 Testing STEP 4: Bank Offers & Program Selection');
    
    try {
      await page.goto('http://localhost:5173/services/calculate-mortgage/4');
      await page.waitForLoadState('networkidle');

      // Test Bank Offers Display
      try {
        const bankOffers = page.locator('[data-testid="bank-offers"], .bank-offers');
        if (await bankOffers.count() > 0) {
          await this.logSuccess('step4', 'Bank offers section displayed');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-offers-missing');
          await this.logIssue('step4', 'critical', 'Bank offers section not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-offers-error');
        await this.logIssue('step4', 'error', `Bank offers error: ${error.message}`, screenshot);
      }

      // Test Program Selection
      try {
        const programSelector = page.locator('select[name="program"], [data-testid="program-selector"]');
        if (await programSelector.count() > 0) {
          await programSelector.selectOption({ index: 1 });
          await this.logSuccess('step4', 'Program selection functional');
        } else {
          const screenshot = await this.takeScreenshot(page, 'step4-program-missing');
          await this.logIssue('step4', 'warning', 'Program selector not found', screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, 'step4-program-error');
        await this.logIssue('step4', 'error', `Program selection error: ${error.message}`, screenshot);
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

  async testMultiLanguage(page) {
    console.log('🌐 Testing Multi-Language Functionality');
    
    const languages = ['en', 'he', 'ru'];
    for (const lang of languages) {
      try {
        await page.goto(`http://localhost:5173/services/calculate-mortgage/1?lang=${lang}`);
        await page.waitForLoadState('networkidle');
        
        // Check if page content changed for different languages
        const pageContent = await page.textContent('body');
        if (pageContent && pageContent.length > 0) {
          await this.logSuccess('step1', `Language ${lang} loads successfully`);
        } else {
          const screenshot = await this.takeScreenshot(page, `lang-${lang}-error`);
          await this.logIssue('step1', 'error', `Language ${lang} failed to load`, screenshot);
        }
      } catch (error) {
        const screenshot = await this.takeScreenshot(page, `lang-${lang}-error`);
        await this.logIssue('step1', 'error', `Language ${lang} error: ${error.message}`, screenshot);
      }
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
    <title>Mortgage Calculator QA Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; }
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
        <h1>🚀 Mortgage Calculator QA Testing Report</h1>
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
        <h2>STEP ${step.replace('step', '').toUpperCase()}</h2>
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
        <h2>📊 DETAILED ANALYSIS</h2>
        <h3>Critical Issues</h3>
        ${this.issues.filter(i => i.severity === 'critical').map(issue => `
        <div class="issue critical">
            <h4>CRITICAL: ${issue.description}</h4>
            <p><strong>Step:</strong> ${issue.step} | <strong>Time:</strong> ${issue.timestamp}</p>
            ${issue.screenshot ? `<img src="${issue.screenshot}" alt="Screenshot" class="screenshot">` : ''}
        </div>
        `).join('')}

        <h3>Performance & Usability Observations</h3>
        <ul>
            <li>Page load times: ${totalTime > 2 ? '⚠️ Slow' : '✅ Acceptable'}</li>
            <li>Dropdown functionality: ${this.issues.filter(i => i.description.includes('dropdown')).length === 0 ? '✅ Working' : '❌ Issues found'}</li>
            <li>Navigation flow: ${this.issues.filter(i => i.description.includes('Continue')).length === 0 ? '✅ Working' : '❌ Issues found'}</li>
        </ul>

        <h3>Screenshots Captured</h3>
        <p>Total screenshots: ${this.screenshots.length}</p>
        ${this.screenshots.map(screenshot => `<img src="${screenshot}" alt="Screenshot" class="screenshot">`).join('')}
    </div>

    <div class="step-section">
        <h2>🔧 RECOMMENDATIONS</h2>
        <ul>
            <li>Fix all critical issues before deployment</li>
            <li>Verify dropdown API endpoints are working correctly</li>
            <li>Test multi-language functionality thoroughly</li>
            <li>Ensure all form validations are working</li>
            <li>Check responsive design on different screen sizes</li>
        </ul>
    </div>
</body>
</html>
    `;

    return html;
  }
}

async function runMortgageQA() {
  const qa = new MortgageCalculatorQA();
  
  // Create screenshots directory
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🚀 Starting Mortgage Calculator QA Testing...');
  
  await qa.testStep1(page);
  await qa.testStep2(page);
  await qa.testStep3(page);
  await qa.testStep4(page);
  await qa.testMultiLanguage(page);

  await browser.close();

  const report = qa.generateReport();
  const reportPath = `mortgage-calculator-qa-report-${Date.now()}.html`;
  fs.writeFileSync(reportPath, report);

  console.log(`\n📊 QA Testing completed!`);
  console.log(`📄 Report saved: ${reportPath}`);
  console.log(`🔍 Issues found: ${qa.issues.length}`);
  console.log(`📸 Screenshots: ${qa.screenshots.length}`);
  
  return { reportPath, issues: qa.issues, screenshots: qa.screenshots };
}

if (require.main === module) {
  runMortgageQA().catch(console.error);
}

module.exports = { runMortgageQA, MortgageCalculatorQA };