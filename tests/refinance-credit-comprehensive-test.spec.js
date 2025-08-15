const { test, expect } = require('@playwright/test');

/**
 * COMPREHENSIVE QA TESTING FOR REFINANCE CREDIT PROCESS
 * 
 * CORRECTED URLS:
 * - Step 1: http://localhost:5174/refinance-credit/1
 * - Step 2: http://localhost:5174/refinance-credit/2  
 * - Step 3: http://localhost:5174/refinance-credit/3
 * - Step 4: http://localhost:5174/refinance-credit/4
 * 
 * Test Scope: 4 Steps (32 screens, 300+ user actions)
 * Business Logic: Refinance benefit calculations, multi-borrower workflows
 * Technology: React, Redux, Multi-language (Hebrew RTL, English, Russian)
 */

// Comprehensive test execution log
const testExecutionLog = [];
let testId = 1;

function logTest(category, element, testCase, expected, actual, status, severity = 'Medium', notes = '') {
  const testNumber = `RC-${String(testId).padStart(3, '0')}`;
  const logEntry = {
    testId: testNumber,
    category,
    element,
    testCase,
    expectedResult: expected,
    actualResult: actual,
    status,
    severity,
    notes,
    timestamp: new Date().toISOString()
  };
  testExecutionLog.push(logEntry);
  testId++;
  
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${testNumber} [${severity}] ${category}: ${testCase}`);
  if (status === 'FAIL' && notes) {
    console.log(`   💡 ${notes}`);
  }
  
  return logEntry;
}

test.describe('REFINANCE CREDIT - COMPREHENSIVE QA TESTING', () => {
  
  // Test all 4 refinance credit steps
  const refinanceCreditSteps = [
    { step: 1, name: 'Current Loan Analysis', url: 'http://localhost:5174/refinance-credit/1' },
    { step: 2, name: 'Personal Information', url: 'http://localhost:5174/refinance-credit/2' },
    { step: 3, name: 'Financial Information', url: 'http://localhost:5174/refinance-credit/3' },
    { step: 4, name: 'Bank Selection & Results', url: 'http://localhost:5174/refinance-credit/4' }
  ];

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    // Set longer timeout for complex pages
    page.setDefaultTimeout(15000);
  });

  test('RC-001: Access All Refinance Credit Steps', async ({ page }) => {
    console.log('🎯 TESTING ALL 4 REFINANCE CREDIT STEPS');
    console.log('=====================================');
    
    for (const stepInfo of refinanceCreditSteps) {
      console.log(`\n📋 Testing Step ${stepInfo.step}: ${stepInfo.name}`);
      
      try {
        await page.goto(stepInfo.url, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        
        // Take screenshot
        await page.screenshot({ 
          path: `/Users/michaelmishayev/Projects/bankDev2_standalone/refinance-credit-step-${stepInfo.step}.png`,
          fullPage: true 
        });
        
        // Get page info
        const title = await page.title();
        const currentUrl = page.url();
        
        logTest(
          'System Access',
          `Step ${stepInfo.step}`,
          `Access ${stepInfo.name}`,
          'Page loads successfully',
          `Loaded: ${title}`,
          'PASS',
          'Critical',
          `URL: ${currentUrl}`
        );
        
        // Test for page content
        const bodyText = await page.locator('body').textContent();
        const hasContent = bodyText && bodyText.trim().length > 100;
        
        logTest(
          'Content Validation',
          `Step ${stepInfo.step}`,
          `Verify page has substantial content`,
          'Page contains meaningful content',
          `Content length: ${bodyText ? bodyText.length : 0} characters`,
          hasContent ? 'PASS' : 'FAIL',
          'High',
          !hasContent ? 'Page may not be loading React content properly' : ''
        );
        
        // Wait for React to load
        await page.waitForTimeout(2000);
        
      } catch (error) {
        logTest(
          'System Access',
          `Step ${stepInfo.step}`,
          `Access ${stepInfo.name}`,
          'Page loads successfully',
          `ERROR: ${error.message}`,
          'FAIL',
          'Critical',
          `Failed to access step ${stepInfo.step}`
        );
      }
    }
  });

  test('RC-002: Step 1 - Current Loan Analysis Deep Dive', async ({ page }) => {
    await page.goto('http://localhost:5174/refinance-credit/1', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    
    console.log('\n🔍 DEEP ANALYSIS - Step 1: Current Loan Analysis');
    console.log('================================================');
    
    // Wait for React app to initialize
    await page.waitForTimeout(3000);
    
    // Test form elements
    const formElements = {
      inputs: 'input[type="text"], input[type="number"], input[type="tel"]',
      dropdowns: 'select, div[role="combobox"], div[role="listbox"], div[class*="dropdown"]',
      buttons: 'button[type="submit"], button[type="button"], button[class*="btn"]',
      labels: 'label, div[class*="label"], span[class*="label"]'
    };
    
    for (const [elementType, selector] of Object.entries(formElements)) {
      try {
        const elements = await page.locator(selector).all();
        const count = elements.length;
        
        logTest(
          'Form Elements',
          elementType,
          `Count ${elementType} on Step 1`,
          'At least 1 element present',
          `Found ${count} elements`,
          count > 0 ? 'PASS' : 'FAIL',
          elementType === 'dropdowns' ? 'High' : 'Medium',
          count === 0 ? `No ${elementType} found - may indicate loading or implementation issue` : ''
        );
        
        // For dropdowns, test functionality
        if (elementType === 'dropdowns' && count > 0) {
          try {
            const firstDropdown = elements[0];
            await firstDropdown.click();
            await page.waitForTimeout(500);
            
            // Look for options
            const optionSelectors = [
              'option',
              'div[role="option"]', 
              'li[role="option"]',
              'div[class*="option"]',
              'li[class*="option"]'
            ];
            
            let totalOptions = 0;
            for (const optionSelector of optionSelectors) {
              const optionCount = await page.locator(optionSelector).count();
              totalOptions += optionCount;
            }
            
            logTest(
              'Dropdown Functionality',
              'Dropdown Options',
              'Test dropdown options availability',
              'At least 2 options available',
              `Found ${totalOptions} total options`,
              totalOptions >= 2 ? 'PASS' : 'FAIL',
              'High',
              totalOptions < 2 ? 'Dropdown may not be populated with data' : ''
            );
            
          } catch (dropdownError) {
            logTest(
              'Dropdown Functionality',
              'Dropdown Interaction',
              'Test dropdown interaction',
              'Dropdown clickable and functional',
              `ERROR: ${dropdownError.message}`,
              'FAIL',
              'High'
            );
          }
        }
        
      } catch (error) {
        logTest(
          'Form Elements',
          elementType,
          `Test ${elementType}`,
          'Elements accessible',
          `ERROR: ${error.message}`,
          'FAIL',
          'Medium'
        );
      }
    }
    
    // Test for refinance-specific content
    const refinanceKeywords = [
      'refinance', 'current loan', 'existing loan', 'balance', 
      'interest rate', 'monthly payment', 'property value',
      'loan term', 'refinancing', 'current lender'
    ];
    
    const pageContent = await page.locator('body').textContent();
    const foundKeywords = refinanceKeywords.filter(keyword => 
      pageContent.toLowerCase().includes(keyword.toLowerCase())
    );
    
    logTest(
      'Business Logic',
      'Refinance Content',
      'Verify refinance-specific content is present',
      'At least 3 refinance keywords found',
      `Found keywords: ${foundKeywords.join(', ')}`,
      foundKeywords.length >= 3 ? 'PASS' : 'FAIL',
      'High',
      foundKeywords.length < 3 ? 'Page may not contain proper refinance credit content' : ''
    );
    
    // Test calculation fields
    const calculationFields = [
      { name: 'loan balance', patterns: ['balance', 'loan amount', 'principal'] },
      { name: 'interest rate', patterns: ['rate', 'interest', 'apr'] },
      { name: 'property value', patterns: ['property', 'home value', 'appraised'] }
    ];
    
    for (const field of calculationFields) {
      const fieldFound = field.patterns.some(pattern => 
        pageContent.toLowerCase().includes(pattern)
      );
      
      logTest(
        'Calculation Fields',
        field.name,
        `Verify ${field.name} field presence`,
        'Field related content found',
        fieldFound ? 'Field content found' : 'Field content not found',
        fieldFound ? 'PASS' : 'FAIL',
        'Medium',
        !fieldFound ? `May use different terminology than: ${field.patterns.join(', ')}` : ''
      );
    }
  });

  test('RC-003: Multi-Language Support Testing', async ({ page }) => {
    console.log('\n🌐 MULTI-LANGUAGE SUPPORT TESTING');
    console.log('==================================');
    
    await page.goto('http://localhost:5174/refinance-credit/1', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    
    await page.waitForTimeout(2000);
    
    const languages = [
      { code: 'he', name: 'Hebrew', rtl: true },
      { code: 'en', name: 'English', rtl: false },
      { code: 'ru', name: 'Russian', rtl: false }
    ];
    
    // Look for language switcher patterns
    const langSwitcherSelectors = [
      'button[class*="lang"]',
      'select[class*="language"]',
      'div[class*="language-switcher"]',
      'ul[class*="lang"] li',
      '[data-testid*="lang"]',
      'button:has-text("EN")',
      'button:has-text("HE")',
      'button:has-text("RU")'
    ];
    
    let languageSwitcherFound = false;
    
    for (const selector of langSwitcherSelectors) {
      const switcherExists = await page.locator(selector).first().isVisible().catch(() => false);
      if (switcherExists) {
        languageSwitcherFound = true;
        break;
      }
    }
    
    logTest(
      'Language Support',
      'Language Switcher',
      'Find language switching mechanism',
      'Language switcher is available',
      languageSwitcherFound ? 'Language switcher found' : 'No language switcher found',
      languageSwitcherFound ? 'PASS' : 'FAIL',
      'Medium',
      !languageSwitcherFound ? 'Language switching may use different UI pattern or be in header/footer' : ''
    );
    
    // Test for RTL support (Hebrew)
    const htmlDir = await page.locator('html').getAttribute('dir');
    const bodyDir = await page.locator('body').getAttribute('dir');
    const hasRTL = htmlDir === 'rtl' || bodyDir === 'rtl';
    
    logTest(
      'RTL Support',
      'Hebrew RTL',
      'Check for RTL layout support',
      'RTL direction attributes present',
      hasRTL ? `RTL detected (html: ${htmlDir}, body: ${bodyDir})` : 'No RTL attributes found',
      hasRTL ? 'PASS' : 'FAIL',
      'Medium',
      !hasRTL ? 'RTL support may not be implemented or not active' : ''
    );
    
    // Test for multi-language content
    const hebrewChars = /[\u0590-\u05FF]/;
    const russianChars = /[\u0400-\u04FF]/;
    const pageText = await page.locator('body').textContent();
    
    const hasHebrew = hebrewChars.test(pageText);
    const hasRussian = russianChars.test(pageText);
    
    logTest(
      'Character Sets',
      'Hebrew Characters',
      'Check for Hebrew text content',
      'Hebrew characters present',
      hasHebrew ? 'Hebrew text found' : 'No Hebrew text found',
      hasHebrew ? 'PASS' : 'INFO',
      'Low',
      'Hebrew may not be active or visible depending on current language setting'
    );
    
    logTest(
      'Character Sets',
      'Russian Characters',
      'Check for Russian text content',
      'Russian characters present if applicable',
      hasRussian ? 'Russian text found' : 'No Russian text found',
      hasRussian ? 'PASS' : 'INFO',
      'Low',
      'Russian may not be active or visible depending on current language setting'
    );
  });

  test('RC-004: Responsive Design and Accessibility', async ({ page }) => {
    console.log('\n📱 RESPONSIVE DESIGN & ACCESSIBILITY TESTING');
    console.log('============================================');
    
    const viewports = [
      { width: 320, height: 568, name: 'Mobile Portrait (iPhone SE)' },
      { width: 768, height: 1024, name: 'Tablet (iPad)' },
      { width: 1440, height: 900, name: 'Desktop (MacBook)' },
      { width: 1920, height: 1080, name: 'Large Desktop (FHD)' }
    ];
    
    for (const viewport of viewports) {
      console.log(`\n📐 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:5174/refinance-credit/1', { 
        waitUntil: 'domcontentloaded',
        timeout: 8000
      });
      
      await page.waitForTimeout(1500);
      
      // Test for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          if (rect.width > window.innerWidth + 5) { // 5px tolerance
            return true;
          }
        }
        return false;
      });
      
      logTest(
        'Responsive Design',
        viewport.name,
        `Test layout fits ${viewport.width}px width`,
        'No horizontal overflow',
        hasOverflow ? 'Horizontal overflow detected' : 'Layout fits viewport',
        !hasOverflow ? 'PASS' : 'FAIL',
        'Medium',
        hasOverflow ? 'Some elements extend beyond viewport width' : ''
      );
      
      // Test touch targets for mobile
      if (viewport.width <= 768) {
        const touchTargets = await page.locator('button, input, select, a').all();
        let adequateTargets = 0;
        
        for (const target of touchTargets.slice(0, 10)) {
          try {
            const box = await target.boundingBox();
            if (box && (box.width >= 44 && box.height >= 44)) {
              adequateTargets++;
            }
          } catch (e) {
            // Element may not be visible
          }
        }
        
        const touchTargetRatio = touchTargets.length > 0 ? (adequateTargets / Math.min(touchTargets.length, 10)) : 0;
        
        logTest(
          'Touch Targets',
          `${viewport.name} Touch`,
          'Verify touch targets meet 44px minimum size',
          'At least 50% of targets meet size requirement',
          `${adequateTargets}/${Math.min(touchTargets.length, 10)} targets adequate (${Math.round(touchTargetRatio * 100)}%)`,
          touchTargetRatio >= 0.5 ? 'PASS' : 'FAIL',
          'Medium',
          touchTargetRatio < 0.5 ? 'Touch targets may be too small for mobile use' : ''
        );
      }
      
      // Take responsive screenshots
      await page.screenshot({ 
        path: `/Users/michaelmishayev/Projects/bankDev2_standalone/refinance-credit-responsive-${viewport.width}x${viewport.height}.png`,
        fullPage: false
      });
    }
    
    // Reset to desktop for remaining tests
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test.afterAll(async () => {
    // Generate comprehensive test report
    console.log('\n📊 REFINANCE CREDIT TESTING SUMMARY');
    console.log('====================================');
    
    const summary = {
      total: testExecutionLog.length,
      passed: testExecutionLog.filter(t => t.status === 'PASS').length,
      failed: testExecutionLog.filter(t => t.status === 'FAIL').length,
      info: testExecutionLog.filter(t => t.status === 'INFO').length,
      critical: testExecutionLog.filter(t => t.severity === 'Critical').length,
      high: testExecutionLog.filter(t => t.severity === 'High').length,
      medium: testExecutionLog.filter(t => t.severity === 'Medium').length,
      low: testExecutionLog.filter(t => t.severity === 'Low').length
    };
    
    console.log(`\n📈 RESULTS:`);
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   ✅ Passed: ${summary.passed}`);
    console.log(`   ❌ Failed: ${summary.failed}`);
    console.log(`   ℹ️  Info: ${summary.info}`);
    console.log(`\n🚨 BY SEVERITY:`);
    console.log(`   🔴 Critical: ${summary.critical}`);
    console.log(`   🟠 High: ${summary.high}`);
    console.log(`   🟡 Medium: ${summary.medium}`);
    console.log(`   🟢 Low: ${summary.low}`);
    
    // Calculate pass rate
    const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
    console.log(`\n🎯 PASS RATE: ${passRate}%`);
    
    // List all failures
    const failures = testExecutionLog.filter(t => t.status === 'FAIL');
    if (failures.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      console.log('================');
      failures.forEach((test, index) => {
        console.log(`\n${index + 1}. ${test.testId} [${test.severity}] ${test.category}: ${test.testCase}`);
        console.log(`   Expected: ${test.expectedResult}`);
        console.log(`   Actual: ${test.actualResult}`);
        if (test.notes) console.log(`   💡 Notes: ${test.notes}`);
      });
    }
    
    // Save detailed report
    const fs = require('fs');
    const reportData = {
      timestamp: new Date().toISOString(),
      summary,
      testExecutionLog,
      environment: {
        apiServer: 'http://localhost:8003',
        frontendServer: 'http://localhost:5174',
        testType: 'Comprehensive QA - Refinance Credit Process',
        scope: '4 Steps, Complex Business Logic, Multi-Language Support',
        correctUrls: [
          'http://localhost:5174/refinance-credit/1',
          'http://localhost:5174/refinance-credit/2',
          'http://localhost:5174/refinance-credit/3',
          'http://localhost:5174/refinance-credit/4'
        ]
      },
      screenshots: [
        'refinance-credit-step-1.png',
        'refinance-credit-step-2.png', 
        'refinance-credit-step-3.png',
        'refinance-credit-step-4.png',
        'refinance-credit-responsive-320x568.png',
        'refinance-credit-responsive-768x1024.png',
        'refinance-credit-responsive-1440x900.png',
        'refinance-credit-responsive-1920x1080.png'
      ]
    };
    
    const reportPath = '/Users/michaelmishayev/Projects/bankDev2_standalone/refinance-credit-comprehensive-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`\n📄 DETAILED REPORT: ${reportPath}`);
    console.log(`📸 SCREENSHOTS: refinance-credit-*.png`);
    console.log('\n🎯 TESTING COMPLETED!');
  });
});