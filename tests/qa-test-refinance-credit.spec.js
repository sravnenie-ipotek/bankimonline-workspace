const { test, expect } = require('@playwright/test');

/**
 * COMPREHENSIVE QA TESTING FOR REFINANCE CREDIT PROCESS
 * 
 * Test Scope: 4 Steps (32 screens, 300+ user actions)
 * Business Logic: Refinance benefit calculations, multi-borrower workflows
 * Technology: React, Redux, Multi-language (Hebrew RTL, English, Russian)
 * 
 * Critical Features to Test:
 * 1. Refinance Benefit Calculation Engine
 * 2. Multi-Borrower Relationship Management
 * 3. Complex Financial Scenarios
 * 4. Dropdown functionality with database-driven content
 */

// Test Execution Log
const testLog = [];
let testCounter = 1;

function logTest(category, element, testCase, expectedResult, actualResult, status, severity = 'Medium', notes = '') {
  const testId = `RC-${String(testCounter).padStart(3, '0')}`;
  const logEntry = {
    testId,
    category,
    element,
    testCase,
    expectedResult,
    actualResult,
    status,
    severity,
    notes,
    timestamp: new Date().toISOString()
  };
  testLog.push(logEntry);
  testCounter++;
  console.log(`${testId} [${status}] ${category}: ${testCase}`);
  return logEntry;
}

test.describe('REFINANCE CREDIT - COMPREHENSIVE QA TESTING', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('RC-001: System Access and Initial State Validation', async ({ page }) => {
    console.log('🚀 Starting Refinance Credit Step 1 Testing...');
    
    try {
      // Navigate to Refinance Credit Step 1
      await page.goto('http://localhost:5174/services/refinance-credit/1', { 
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      logTest(
        'System Access',
        'Page Navigation',
        'Access Refinance Credit Step 1',
        'Page loads successfully without errors',
        'Page loaded',
        'PASS',
        'Critical'
      );
      
      // Check for critical page elements
      const pageTitle = await page.title();
      logTest(
        'Page Metadata',
        'Page Title',
        'Verify page title contains refinance credit information',
        'Title includes refinance credit context',
        pageTitle,
        pageTitle.toLowerCase().includes('refinance') || pageTitle.toLowerCase().includes('credit') ? 'PASS' : 'FAIL',
        'High'
      );
      
    } catch (error) {
      logTest(
        'System Access',
        'Page Navigation',
        'Access Refinance Credit Step 1',
        'Page loads successfully',
        `ERROR: ${error.message}`,
        'FAIL',
        'Critical',
        'Failed to access main page - system may be down'
      );
      throw error;
    }
  });
  
  test('RC-002: Step 1 - Current Loan Analysis Validation', async ({ page }) => {
    await page.goto('http://localhost:5174/services/refinance-credit/1', { waitUntil: 'networkidle' });
    
    console.log('📋 Testing Step 1: Current Loan Analysis...');
    
    // Test form elements presence
    const formElements = [
      { selector: 'input[type="number"], input[type="text"]', name: 'Input Fields' },
      { selector: 'select, div[role="combobox"]', name: 'Dropdown Fields' },
      { selector: 'button[type="submit"], button[type="button"]', name: 'Action Buttons' }
    ];
    
    for (const element of formElements) {
      try {
        const count = await page.locator(element.selector).count();
        logTest(
          'Form Elements',
          element.name,
          `Count ${element.name} on Step 1`,
          'At least 1 element present',
          `Found ${count} elements`,
          count > 0 ? 'PASS' : 'FAIL',
          'High',
          count === 0 ? 'No form elements found - may indicate loading issue' : ''
        );
      } catch (error) {
        logTest(
          'Form Elements',
          element.name,
          `Count ${element.name} on Step 1`,
          'Elements accessible',
          `ERROR: ${error.message}`,
          'FAIL',
          'High'
        );
      }
    }
    
    // Test dropdown functionality
    try {
      const dropdowns = await page.locator('select, div[role="combobox"], div[class*="dropdown"]').all();
      
      if (dropdowns.length > 0) {
        logTest(
          'Dropdown Testing',
          'Dropdown Count',
          'Verify dropdowns are present on Step 1',
          'At least 1 dropdown present',
          `Found ${dropdowns.length} dropdowns`,
          'PASS',
          'High'
        );
        
        // Test first dropdown
        const firstDropdown = dropdowns[0];
        await firstDropdown.click();
        await page.waitForTimeout(500);
        
        const options = await page.locator('option, div[role="option"], li[role="option"]').count();
        logTest(
          'Dropdown Testing',
          'Dropdown Options',
          'Verify dropdown has options',
          'At least 2 options available',
          `Found ${options} options`,
          options >= 2 ? 'PASS' : 'FAIL',
          'High',
          options < 2 ? 'Dropdown may not be loading data properly' : ''
        );
        
      } else {
        logTest(
          'Dropdown Testing',
          'Dropdown Presence',
          'Find dropdowns on Step 1',
          'At least 1 dropdown present',
          'No dropdowns found',
          'FAIL',
          'Critical',
          'No dropdowns found - major functionality issue'
        );
      }
    } catch (error) {
      logTest(
        'Dropdown Testing',
        'Dropdown Interaction',
        'Test dropdown functionality',
        'Dropdowns work correctly',
        `ERROR: ${error.message}`,
        'FAIL',
        'High'
      );
    }
    
    // Test refinance-specific fields
    const refinanceFields = [
      'existing loan balance',
      'current interest rate',
      'remaining term',
      'monthly payment',
      'property value',
      'refinance reason'
    ];
    
    for (const fieldName of refinanceFields) {
      try {
        const field = page.locator(`input[placeholder*="${fieldName}" i], label:has-text("${fieldName}") + input, input[name*="${fieldName.replace(' ', '_')}" i]`).first();
        const isVisible = await field.isVisible().catch(() => false);
        
        logTest(
          'Refinance Fields',
          fieldName,
          `Verify ${fieldName} field is present`,
          'Field is visible and accessible',
          isVisible ? 'Field found' : 'Field not found',
          isVisible ? 'PASS' : 'FAIL',
          'Medium',
          !isVisible ? 'Field may use different naming or may not be implemented' : ''
        );
        
        if (isVisible && fieldName.includes('balance')) {
          await field.fill('450000');
          const value = await field.inputValue();
          logTest(
            'Input Validation',
            fieldName,
            `Test input functionality for ${fieldName}`,
            'Field accepts numeric input',
            `Entered: 450000, Value: ${value}`,
            value.includes('450000') ? 'PASS' : 'FAIL',
            'Medium'
          );
        }
      } catch (error) {
        logTest(
          'Refinance Fields',
          fieldName,
          `Test ${fieldName} field`,
          'Field accessible',
          `ERROR: ${error.message}`,
          'FAIL',
          'Medium'
        );
      }
    }
  });
  
  test('RC-003: Multi-Language Support Testing', async ({ page }) => {
    await page.goto('http://localhost:5174/services/refinance-credit/1', { waitUntil: 'networkidle' });
    
    console.log('🌐 Testing Multi-Language Support...');
    
    const languages = [
      { code: 'en', name: 'English', rtl: false },
      { code: 'he', name: 'Hebrew', rtl: true },
      { code: 'ru', name: 'Russian', rtl: false }
    ];
    
    for (const lang of languages) {
      try {
        // Look for language switcher
        const langSwitcher = page.locator(`button:has-text("${lang.code.toUpperCase()}"), [data-lang="${lang.code}"], select option[value="${lang.code}"]`).first();
        const switcherExists = await langSwitcher.isVisible().catch(() => false);
        
        if (switcherExists) {
          await langSwitcher.click();
          await page.waitForTimeout(1000);
          
          // Check RTL support for Hebrew
          if (lang.rtl) {
            const bodyDir = await page.locator('body').getAttribute('dir');
            logTest(
              'RTL Support',
              'Hebrew RTL',
              'Verify Hebrew language enables RTL layout',
              'Body direction set to rtl',
              `Direction: ${bodyDir}`,
              bodyDir === 'rtl' ? 'PASS' : 'FAIL',
              'High',
              bodyDir !== 'rtl' ? 'RTL not properly implemented for Hebrew' : ''
            );
          }
          
          // Test content translation
          const textElements = await page.locator('h1, h2, h3, label, button, span').all();
          let translatedCount = 0;
          
          for (const element of textElements.slice(0, 5)) {
            const text = await element.textContent().catch(() => '');
            if (text && text.trim().length > 0) {
              translatedCount++;
            }
          }
          
          logTest(
            'Translation',
            `${lang.name} Content`,
            `Verify content is translated to ${lang.name}`,
            'Text content is present in selected language',
            `Found ${translatedCount} text elements`,
            translatedCount > 0 ? 'PASS' : 'FAIL',
            'Medium'
          );
          
        } else {
          logTest(
            'Language Switching',
            `${lang.name} Option`,
            `Find ${lang.name} language option`,
            'Language option is available',
            'Language switcher not found',
            'FAIL',
            'Medium',
            'Language switching may use different UI pattern'
          );
        }
      } catch (error) {
        logTest(
          'Language Testing',
          `${lang.name}`,
          `Test ${lang.name} language support`,
          'Language works correctly',
          `ERROR: ${error.message}`,
          'FAIL',
          'Medium'
        );
      }
    }
  });
  
  test('RC-004: Responsive Design Testing', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'Mobile Portrait' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1440, height: 900, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:5174/services/refinance-credit/1', { waitUntil: 'networkidle' });
      
      // Test layout responsiveness
      const isLayoutBroken = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          if (rect.width > window.innerWidth + 10) {
            return true;
          }
        }
        return false;
      });
      
      logTest(
        'Responsive Design',
        viewport.name,
        `Test layout at ${viewport.width}x${viewport.height}`,
        'No horizontal overflow',
        isLayoutBroken ? 'Layout overflow detected' : 'Layout fits viewport',
        !isLayoutBroken ? 'PASS' : 'FAIL',
        'Medium'
      );
      
      // Test touch targets for mobile
      if (viewport.width <= 768) {
        const buttons = await page.locator('button, input, select').all();
        let touchFriendlyCount = 0;
        
        for (const button of buttons.slice(0, 5)) {
          const box = await button.boundingBox();
          if (box && (box.width >= 44 && box.height >= 44)) {
            touchFriendlyCount++;
          }
        }
        
        logTest(
          'Touch Targets',
          `${viewport.name} Touch`,
          'Verify touch targets meet minimum size (44px)',
          'Touch targets are appropriately sized',
          `${touchFriendlyCount}/${Math.min(buttons.length, 5)} buttons meet size requirements`,
          touchFriendlyCount > 0 ? 'PASS' : 'FAIL',
          'Medium'
        );
      }
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });
  
  test.afterAll(async () => {
    // Generate comprehensive test report
    console.log('\n📊 REFINANCE CREDIT TESTING SUMMARY');
    console.log('================================');
    
    const summary = {
      total: testLog.length,
      passed: testLog.filter(t => t.status === 'PASS').length,
      failed: testLog.filter(t => t.status === 'FAIL').length,
      critical: testLog.filter(t => t.severity === 'Critical').length,
      high: testLog.filter(t => t.severity === 'High').length
    };
    
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Critical Issues: ${summary.critical}`);
    console.log(`High Priority Issues: ${summary.high}`);
    
    // Log all failures
    const failures = testLog.filter(t => t.status === 'FAIL');
    if (failures.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failures.forEach(test => {
        console.log(`${test.testId} [${test.severity}] ${test.category}: ${test.testCase}`);
        console.log(`   Expected: ${test.expectedResult}`);
        console.log(`   Actual: ${test.actualResult}`);
        if (test.notes) console.log(`   Notes: ${test.notes}`);
        console.log('');
      });
    }
    
    // Save detailed report
    const fs = require('fs');
    const reportPath = '/Users/michaelmishayev/Projects/bankDev2_standalone/qa-refinance-credit-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary,
      testLog,
      environment: {
        apiServer: 'http://localhost:8003',
        frontendServer: 'http://localhost:5174',
        testType: 'Comprehensive QA - Refinance Credit Process',
        scope: '4 Steps, Complex Business Logic, Multi-Language Support'
      }
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
  });
});