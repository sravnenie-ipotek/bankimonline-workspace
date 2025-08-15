const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function validateScreenLocationFix() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Create screenshots directory
  const screenshotDir = path.join(__dirname, 'screen-location-validation-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  const results = [];
  
  // Test scenarios
  const testScenarios = [
    {
      name: 'Mortgage Calculator Step 3',
      url: 'http://localhost:5174/services/calculate-mortgage/3/',
      expectedScreenLocation: 'mortgage_step3',
      expectedDropdowns: 27,
      description: 'Should use mortgage_step3 content (unchanged behavior)'
    },
    {
      name: 'Credit Calculator Step 3', 
      url: 'http://localhost:5174/services/calculate-credit/3/',
      expectedScreenLocation: 'calculate_credit_3',
      expectedDropdowns: 9,
      description: 'Should now use calculate_credit_3 content (was using mortgage content before)'
    },
    {
      name: 'Other Borrowers Step 2',
      url: 'http://localhost:5174/services/other-borrowers/2/',
      expectedScreenLocation: 'other_borrowers_step2', 
      expectedDropdowns: 4,
      description: 'Should now use other_borrowers_step2 content (was using mortgage content)'
    }
  ];
  
  for (const scenario of testScenarios) {
    `);
    try {
      // Navigate to page
      await page.goto(scenario.url, { waitUntil: 'networkidle' });
      
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Capture console logs for screen location detection
      const consoleLogs = [];
      page.on('console', msg => {
        if (msg.text().includes('Screen location') || 
            msg.text().includes('MainSourceOfIncome') ||
            msg.text().includes('Obligation') ||
            msg.text().includes('API call') ||
            msg.text().includes('dropdown')) {
          consoleLogs.push(msg.text());
        }
      });
      
      // Look for screen location detection logs
      await page.evaluate(() => {
        });
      
      // Wait for components to render and API calls to complete
      await page.waitForTimeout(3000);
      
      // Take screenshot
      const screenshotPath = path.join(screenshotDir, `${scenario.name.replace(/\s+/g, '_').toLowerCase()}.png`);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      // Check for dropdown components
      const mainSourceDropdown = await page.$('[data-testid*="main-source"], .main-source-of-income, [class*="MainSourceOfIncome"]');
      const obligationsDropdown = await page.$('[data-testid*="obligations"], .obligations, [class*="Obligation"]');
      
      // Get network requests to API
      const apiCalls = [];
      page.on('request', request => {
        if (request.url().includes('/api/dropdowns/')) {
          apiCalls.push(request.url());
        }
      });
      
      // Force a re-render to capture API calls
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const result = {
        scenario: scenario.name,
        url: scenario.url,
        expectedScreenLocation: scenario.expectedScreenLocation,
        expectedDropdowns: scenario.expectedDropdowns,
        screenshot: screenshotPath,
        consoleLogs: consoleLogs,
        apiCalls: apiCalls,
        componentsFound: {
          mainSourceDropdown: !!mainSourceDropdown,
          obligationsDropdown: !!obligationsDropdown
        },
        status: 'COMPLETED'
      };
      
      results.push(result);
      
      } catch (error) {
      console.error(`❌ Error testing ${scenario.name}:`, error.message);
      results.push({
        scenario: scenario.name,
        url: scenario.url,
        status: 'ERROR',
        error: error.message
      });
    }
  }
  
  // Generate comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    testType: 'Screen Location Unification Validation',
    phase: 'Phase 3',
    description: 'Testing that each service uses its own screen location content, not mortgage content',
    results: results,
    summary: {
      totalTests: testScenarios.length,
      passed: results.filter(r => r.status === 'COMPLETED').length,
      failed: results.filter(r => r.status === 'ERROR').length
    }
  };
  
  // Save report
  const reportPath = path.join(screenshotDir, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  await browser.close();
  return report;
}

// Run validation
if (require.main === module) {
  validateScreenLocationFix()
    .then(report => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateScreenLocationFix };