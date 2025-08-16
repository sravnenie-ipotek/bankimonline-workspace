const { chromium } = require('playwright');
const fs = require('fs');

async function quickMortgageQA() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  
  const findings = [];
  const screenshots = [];
  
  // Create screenshot directory
  const screenshotDir = './qa-mortgage-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  function addFinding(severity, description, step) {
    findings.push({ severity, description, step, timestamp: new Date().toISOString() });
    console.log(`[${severity}] ${step}: ${description}`);
  }
  
  async function takeScreenshot(name, description) {
    const filename = `${name}_${Date.now()}.png`;
    const filepath = `${screenshotDir}/${filename}`;
    await page.screenshot({ path: filepath, fullPage: true });
    screenshots.push({ name, description, filename, filepath });
    console.log(`📸 Screenshot: ${filename}`);
    return filepath;
  }
  
  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      addFinding('ERROR', `Console Error: ${msg.text()}`, 'Browser Console');
    }
  });
  
  // Track network failures
  page.on('response', response => {
    if (!response.ok() && response.url().includes('localhost')) {
      addFinding('ERROR', `Network Error: ${response.status()} ${response.url()}`, 'Network');
    }
  });
  
  try {
    console.log('🚀 Starting Manual Mortgage Calculator QA Testing...\n');
    
    // === STEP 1 TESTING ===
    console.log('=== TESTING STEP 1: Property & Loan Parameters ===');
    const startTime = Date.now();
    await page.goto('http://localhost:5173/services/calculate-mortgage/1');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    addFinding(loadTime > 5000 ? 'ERROR' : loadTime > 3000 ? 'WARNING' : 'PASS', 
              `Step 1 load time: ${loadTime}ms`, 'Performance');
    
    await takeScreenshot('step1_initial', 'Step 1 initial load');
    
    // Check for key elements
    const propertyValueInput = page.locator('input[name*="propertyValue"], input[name*="property_value"], input[placeholder*="property"]');
    if (await propertyValueInput.count() > 0) {
      addFinding('PASS', 'Property value input found', 'Step 1');
      await propertyValueInput.fill('1000000');
      await takeScreenshot('step1_property_filled', 'Property value filled');
    } else {
      addFinding('ERROR', 'Property value input not found', 'Step 1');
    }
    
    // Check for property ownership dropdown
    const ownershipDropdown = page.locator('select, .MuiSelect-root, div[role="combobox"]').first();
    if (await ownershipDropdown.count() > 0) {
      addFinding('PASS', 'Dropdown element found', 'Step 1');
      await ownershipDropdown.click();
      await takeScreenshot('step1_dropdown_open', 'Dropdown opened');
      
      // Check for options
      const options = page.locator('li, option, .MuiMenuItem-root');
      if (await options.count() > 0) {
        addFinding('PASS', `Found ${await options.count()} dropdown options`, 'Step 1');
        // Select first option
        await options.first().click();
        await takeScreenshot('step1_option_selected', 'Option selected');
      } else {
        addFinding('ERROR', 'No dropdown options found', 'Step 1');
      }
    } else {
      addFinding('ERROR', 'Property ownership dropdown not found', 'Step 1');
    }
    
    // Check for slider
    const slider = page.locator('input[type="range"], .MuiSlider-root');
    if (await slider.count() > 0) {
      addFinding('PASS', 'Initial payment slider found', 'Step 1');
    } else {
      addFinding('WARNING', 'Initial payment slider not found', 'Step 1');
    }
    
    // Check for interest rate input
    const interestInput = page.locator('input[name*="interest"], input[name*="rate"]');
    if (await interestInput.count() > 0) {
      const value = await interestInput.inputValue();
      addFinding('PASS', `Interest rate input found with value: ${value}`, 'Step 1');
    } else {
      addFinding('WARNING', 'Interest rate input not found', 'Step 1');
    }
    
    // Check for continue button
    const continueBtn = page.locator('button:has-text("Continue"), button:has-text("המשך"), button[type="submit"]');
    if (await continueBtn.count() > 0) {
      const isEnabled = await continueBtn.first().isEnabled();
      addFinding(isEnabled ? 'PASS' : 'WARNING', 
                `Continue button found, enabled: ${isEnabled}`, 'Step 1');
    } else {
      addFinding('ERROR', 'Continue button not found', 'Step 1');
    }
    
    await takeScreenshot('step1_complete', 'Step 1 testing complete');
    
    // === STEP 2 TESTING ===
    console.log('\n=== TESTING STEP 2: Personal Information ===');
    await page.goto('http://localhost:5173/services/calculate-mortgage/2');
    await page.waitForLoadState('networkidle');
    await takeScreenshot('step2_initial', 'Step 2 initial load');
    
    // Check for form fields
    const formFields = ['first_name', 'last_name', 'phone', 'email'];
    for (const field of formFields) {
      const input = page.locator(`input[name*="${field}"], input[placeholder*="${field}"]`);
      if (await input.count() > 0) {
        addFinding('PASS', `${field} input found`, 'Step 2');
      } else {
        addFinding('WARNING', `${field} input not found`, 'Step 2');
      }
    }
    
    await takeScreenshot('step2_complete', 'Step 2 testing complete');
    
    // === STEP 3 TESTING ===
    console.log('\n=== TESTING STEP 3: Income & Employment ===');
    await page.goto('http://localhost:5173/services/calculate-mortgage/3');
    await page.waitForLoadState('networkidle');
    await takeScreenshot('step3_initial', 'Step 3 initial load');
    
    // Check for employment dropdowns
    const dropdowns = page.locator('select, .MuiSelect-root, div[role="combobox"]');
    const dropdownCount = await dropdowns.count();
    addFinding(dropdownCount > 0 ? 'PASS' : 'ERROR', 
              `Found ${dropdownCount} dropdowns in Step 3`, 'Step 3');
    
    await takeScreenshot('step3_complete', 'Step 3 testing complete');
    
    // === STEP 4 TESTING ===
    console.log('\n=== TESTING STEP 4: Bank Offers & Program Selection ===');
    await page.goto('http://localhost:5173/services/calculate-mortgage/4');
    await page.waitForLoadState('networkidle');
    await takeScreenshot('step4_initial', 'Step 4 initial load');
    
    // Check for bank offers
    const bankOffers = page.locator('.bank-offer, .offer-card, .MuiCard-root');
    const offerCount = await bankOffers.count();
    addFinding(offerCount > 0 ? 'PASS' : 'WARNING', 
              `Found ${offerCount} bank offers in Step 4`, 'Step 4');
    
    await takeScreenshot('step4_complete', 'Step 4 testing complete');
    
    // === LANGUAGE TESTING ===
    console.log('\n=== TESTING MULTI-LANGUAGE ===');
    
    // Check for language switcher
    const langSwitcher = page.locator('[data-testid*="lang"], .language-switcher, button:has-text("עברית")');
    if (await langSwitcher.count() > 0) {
      addFinding('PASS', 'Language switcher found', 'Multi-Language');
      await langSwitcher.first().click();
      await page.waitForTimeout(1000);
      await takeScreenshot('hebrew_interface', 'Hebrew interface');
      
      // Check RTL
      const bodyDir = await page.locator('body').getAttribute('dir');
      addFinding(bodyDir === 'rtl' ? 'PASS' : 'WARNING', 
                `Body direction: ${bodyDir}`, 'Multi-Language');
    } else {
      addFinding('WARNING', 'Language switcher not found', 'Multi-Language');
    }
    
    // === API TESTING ===
    console.log('\n=== TESTING API ENDPOINTS ===');
    
    const apiEndpoints = [
      '/api/v1/calculation-parameters?business_path=mortgage',
      '/api/v1/dropdowns',
      '/api/v1/banks'
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await page.request.get(`http://localhost:8003${endpoint}`);
        addFinding(response.ok() ? 'PASS' : 'ERROR', 
                  `API ${endpoint}: ${response.status()}`, 'API');
      } catch (error) {
        addFinding('ERROR', `API ${endpoint} failed: ${error.message}`, 'API');
      }
    }
    
  } catch (error) {
    addFinding('CRITICAL', `QA testing failed: ${error.message}`, 'Framework');
    console.error('QA testing error:', error);
  } finally {
    await browser.close();
  }
  
  // === GENERATE REPORT ===
  console.log('\n=== GENERATING REPORT ===');
  
  const stats = {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'CRITICAL').length,
    errors: findings.filter(f => f.severity === 'ERROR').length,
    warnings: findings.filter(f => f.severity === 'WARNING').length,
    passes: findings.filter(f => f.severity === 'PASS').length
  };
  
  const report = {
    timestamp: new Date().toISOString(),
    testSuite: 'Mortgage Calculator Manual QA',
    summary: stats,
    findings,
    screenshots,
    baseUrl: 'http://localhost:5173'
  };
  
  // Save JSON report
  const reportPath = `./mortgage-qa-manual-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Create simplified HTML report
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Mortgage Calculator QA Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: flex; gap: 20px; justify-content: center; margin-bottom: 30px; }
        .stat { padding: 15px; border-radius: 8px; text-align: center; min-width: 100px; }
        .stat-pass { background: #d4edda; color: #155724; }
        .stat-warning { background: #fff3cd; color: #856404; }
        .stat-error { background: #f8d7da; color: #721c24; }
        .stat-critical { background: #ff0000; color: white; }
        .finding { padding: 10px; margin: 10px 0; border-left: 4px solid; border-radius: 4px; }
        .finding-PASS { background: #d4edda; border-color: #28a745; }
        .finding-WARNING { background: #fff3cd; border-color: #ffc107; }
        .finding-ERROR { background: #f8d7da; border-color: #dc3545; }
        .finding-CRITICAL { background: #ffebee; border-color: #f44336; }
        .step-section { margin: 20px 0; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .screenshot-card { border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏦 Mortgage Calculator QA Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Base URL: http://localhost:5173</p>
    </div>
    
    <div class="stats">
        <div class="stat stat-pass">
            <h2>${stats.passes}</h2>
            <p>✅ Passes</p>
        </div>
        <div class="stat stat-warning">
            <h2>${stats.warnings}</h2>
            <p>⚠️ Warnings</p>
        </div>
        <div class="stat stat-error">
            <h2>${stats.errors}</h2>
            <p>❌ Errors</p>
        </div>
        <div class="stat stat-critical">
            <h2>${stats.critical}</h2>
            <p>🚨 Critical</p>
        </div>
    </div>
    
    <div class="findings">
        <h2>📋 Detailed Findings</h2>
        ${findings.map(f => `
            <div class="finding finding-${f.severity}">
                <strong>${f.severity}:</strong> ${f.description}
                <br><small>Step: ${f.step} | Time: ${new Date(f.timestamp).toLocaleTimeString()}</small>
            </div>
        `).join('')}
    </div>
    
    <div class="screenshots">
        <h2>📸 Screenshots (${screenshots.length})</h2>
        <div class="screenshot-grid">
            ${screenshots.map(s => `
                <div class="screenshot-card">
                    <h4>${s.name}</h4>
                    <p>${s.description}</p>
                    <small>File: ${s.filename}</small>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `;
  
  const htmlPath = `./mortgage-qa-manual-report-${Date.now()}.html`;
  fs.writeFileSync(htmlPath, htmlReport);
  
  console.log(`\n📊 QA REPORT GENERATED:`);
  console.log(`📄 HTML Report: ${htmlPath}`);
  console.log(`📄 JSON Report: ${reportPath}`);
  console.log(`📁 Screenshots: ${screenshotDir}/`);
  console.log(`\n📈 SUMMARY:`);
  console.log(`✅ Passes: ${stats.passes}`);
  console.log(`⚠️  Warnings: ${stats.warnings}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log(`🚨 Critical: ${stats.critical}`);
  
  return { htmlPath, reportPath, stats, findings };
}

// Run the manual QA
quickMortgageQA().catch(console.error);