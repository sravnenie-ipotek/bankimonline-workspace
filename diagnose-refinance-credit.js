const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * REFINANCE CREDIT SYSTEM DIAGNOSTIC TOOL
 * 
 * This script captures comprehensive diagnostic information about
 * the refinance credit system failures.
 * 
 * CRITICAL: DIAGNOSIS ONLY - DOES NOT FIX PROBLEMS
 */

async function diagnoseRefinanceCredit() {
  console.log('\n🔍 STARTING REFINANCE CREDIT DIAGNOSTIC INVESTIGATION');
  console.log('====================================================');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  // Storage for diagnostic data
  const diagnosticData = {
    steps: {},
    consoleErrors: [],
    networkErrors: [],
    apiCalls: [],
    loadingStates: [],
    dropdownStates: []
  };

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const error = msg.text();
      diagnosticData.consoleErrors.push(error);
      console.log('🚨 CONSOLE ERROR:', error);
    }
  });

  // Capture network failures
  page.on('response', response => {
    if (!response.ok()) {
      const networkError = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      };
      diagnosticData.networkErrors.push(networkError);
      console.log('🌐 NETWORK ERROR:', `${networkError.url} - ${networkError.status} ${networkError.statusText}`);
    }
  });

  // Capture all API calls
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      const apiCall = request.url();
      diagnosticData.apiCalls.push(apiCall);
      console.log('📡 API CALL:', apiCall);
    }
  });

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'diagnostic-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Test each step
  const steps = [1, 2, 3, 4];
  
  for (const stepNumber of steps) {
    console.log(`\n📋 DIAGNOSING REFINANCE CREDIT STEP ${stepNumber}`);
    console.log('='.repeat(50));
    
    // Reset error counters for this step
    const stepErrors = [];
    const stepNetworkErrors = [];
    const stepApiCalls = [];
    
    // Navigate to the step
    const url = `http://localhost:5173/services/refinance-credit/${stepNumber}`;
    console.log(`🔗 Navigating to: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      console.log(`⚠️  Navigation error for step ${stepNumber}:`, error.message);
    }

    // Wait for page to settle
    await page.waitForTimeout(3000);

    // Capture full page screenshot
    const screenshotPath = path.join(screenshotsDir, `refinance-credit-step${stepNumber}-full-page.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    // Check for specific dropdown selectors
    const dropdownSelectors = [
      '[data-testid="property-ownership-dropdown"]',
      '[data-testid="purpose-dropdown"]',
      'select',
      '.dropdown',
      '.form-control',
      '.MuiSelect-root'
    ];

    const dropdownInfo = [];
    for (const selector of dropdownSelectors) {
      try {
        const count = await page.locator(selector).count();
        const isVisible = count > 0 ? await page.locator(selector).first().isVisible() : false;
        dropdownInfo.push({
          selector,
          count,
          visible: isVisible
        });
        if (count > 0) {
          console.log(`🔽 Found ${count} elements for selector: ${selector} (visible: ${isVisible})`);
        }
      } catch (error) {
        console.log(`❌ Error checking selector ${selector}:`, error.message);
      }
    }

    // Check for loading indicators
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '[data-loading="true"]',
      '.MuiCircularProgress-root',
      '.loading-indicator'
    ];

    let loadingCount = 0;
    for (const selector of loadingSelectors) {
      try {
        const count = await page.locator(selector).count();
        loadingCount += count;
      } catch (error) {
        // Ignore selector errors
      }
    }
    console.log(`⏳ Loading indicators found: ${loadingCount}`);

    // Check page content for specific issues
    const pageContent = await page.content();
    const contentChecks = {
      hasDropdownData: pageContent.includes('dropdownData'),
      hasUndefined: pageContent.includes('undefined'),
      hasErrorMessages: pageContent.includes('error') || pageContent.includes('Error'),
      hasLoading: pageContent.includes('loading') || pageContent.includes('Loading')
    };

    console.log('📄 Page Content Analysis:');
    Object.entries(contentChecks).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    // Store step diagnostic data
    diagnosticData.steps[stepNumber] = {
      url,
      dropdowns: dropdownInfo,
      loadingCount,
      contentChecks,
      screenshotPath,
      consoleErrorCount: diagnosticData.consoleErrors.length,
      networkErrorCount: diagnosticData.networkErrors.length,
      apiCallCount: diagnosticData.apiCalls.length
    };

    // Take a screenshot with dev tools if possible
    try {
      await page.keyboard.press('F12'); // Open dev tools
      await page.waitForTimeout(1000);
      const devToolsScreenshot = path.join(screenshotsDir, `refinance-credit-step${stepNumber}-devtools.png`);
      await page.screenshot({
        path: devToolsScreenshot,
        fullPage: true
      });
      console.log(`🛠️  Dev tools screenshot: ${devToolsScreenshot}`);
      await page.keyboard.press('F12'); // Close dev tools
    } catch (error) {
      console.log('⚠️  Could not capture dev tools screenshot');
    }

    console.log(`✅ Step ${stepNumber} diagnosis complete\n`);
  }

  // Save comprehensive diagnostic report
  const reportPath = path.join(__dirname, 'refinance-credit-diagnostic-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(diagnosticData, null, 2));
  console.log(`📊 Diagnostic report saved: ${reportPath}`);

  // Print summary
  console.log('\n📋 DIAGNOSTIC SUMMARY');
  console.log('===================');
  console.log(`Total Console Errors: ${diagnosticData.consoleErrors.length}`);
  console.log(`Total Network Errors: ${diagnosticData.networkErrors.length}`);
  console.log(`Total API Calls: ${diagnosticData.apiCalls.length}`);
  
  console.log('\n🚨 CONSOLE ERRORS:');
  diagnosticData.consoleErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`);
  });

  console.log('\n🌐 NETWORK ERRORS:');
  diagnosticData.networkErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.url} - ${error.status} ${error.statusText}`);
  });

  console.log('\n📡 API CALLS MADE:');
  diagnosticData.apiCalls.forEach((call, index) => {
    console.log(`${index + 1}. ${call}`);
  });

  await browser.close();
  
  console.log('\n🏁 DIAGNOSTIC INVESTIGATION COMPLETE');
  console.log('Check the diagnostic-screenshots folder for visual evidence');
  console.log('Check refinance-credit-diagnostic-report.json for detailed data');
}

// Run the diagnostic
diagnoseRefinanceCredit().catch(console.error);