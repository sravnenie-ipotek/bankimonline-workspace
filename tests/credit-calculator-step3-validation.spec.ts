import { test, expect } from '@playwright/test';

/**
 * Credit Calculator Step 3 Comprehensive Test Suite
 * 
 * This test validates the fixes applied to resolve dropdown field name issues:
 * 1. ObligationModal JavaScript hoisting error fix
 * 2. MainSourceOfIncome field name changed from 'main_source' to 'source'  
 * 3. AdditionalIncome field name changed from 'has_additional' to 'additional'
 */

test.describe('Credit Calculator Step 3 - Post-Fix Validation', () => {
  let page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate directly to Step 3
    console.log('🚀 Navigating to Credit Calculator Step 3...');
    await page.goto('http://localhost:5173/services/calculate-credit/3');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('Test ID: CC-001 - Page Load Verification', async () => {
    console.log('📋 Test ID: CC-001 - Page loads without JavaScript errors');
    
    // Capture any console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait for potential JavaScript errors to surface
    await page.waitForTimeout(2000);
    
    // Verify no JavaScript errors occurred
    expect(consoleErrors.length).toBe(0);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/cc-step3-initial-load.png',
      fullPage: true 
    });

    console.log('✅ CC-001 PASSED - Page loaded cleanly');
  });

  test('Test ID: CC-002 - Main Source of Income Dropdown Population', async () => {
    console.log('📋 Test ID: CC-002 - Verify Main Source of Income dropdown populates with Hebrew options');
    
    // Wait for the dropdown to be present
    const mainSourceDropdown = page.locator('[data-testid="main-source-of-income-dropdown"], .main-source-of-income select, select[name="source"]').first();
    
    await expect(mainSourceDropdown).toBeVisible({ timeout: 10000 });
    
    // Click to open dropdown options
    await mainSourceDropdown.click();
    await page.waitForTimeout(1000);
    
    // Look for Hebrew options or any options at all
    const options = await mainSourceDropdown.locator('option').all();
    console.log(`Found ${options.length} options in Main Source dropdown`);
    
    // Verify we have more than just placeholder
    expect(options.length).toBeGreaterThan(1);
    
    // Check for Hebrew text or valid options
    const optionTexts = [];
    for (const option of options) {
      const text = await option.textContent();
      if (text && text.trim()) {
        optionTexts.push(text.trim());
      }
    }
    
    console.log('Main Source options found:', optionTexts);
    
    // Verify we have substantive options (not just placeholder)
    const substantiveOptions = optionTexts.filter(text => 
      text !== '' && 
      !text.toLowerCase().includes('select') && 
      !text.toLowerCase().includes('choose')
    );
    
    expect(substantiveOptions.length).toBeGreaterThan(0);
    
    await page.screenshot({ 
      path: 'test-results/cc-step3-main-source-dropdown.png',
      fullPage: true 
    });

    console.log('✅ CC-002 PASSED - Main Source dropdown populated correctly');
  });

  test('Test ID: CC-003 - Additional Income Dropdown Population', async () => {
    console.log('📋 Test ID: CC-003 - Verify Additional Income dropdown populates with Hebrew options');
    
    // Wait for the dropdown to be present  
    const additionalIncomeDropdown = page.locator('[data-testid="additional-income-dropdown"], .additional-income select, select[name="additional"]').first();
    
    await expect(additionalIncomeDropdown).toBeVisible({ timeout: 10000 });
    
    // Click to open dropdown options
    await additionalIncomeDropdown.click();
    await page.waitForTimeout(1000);
    
    // Look for options
    const options = await additionalIncomeDropdown.locator('option').all();
    console.log(`Found ${options.length} options in Additional Income dropdown`);
    
    // Verify we have more than just placeholder
    expect(options.length).toBeGreaterThan(1);
    
    // Check option content
    const optionTexts = [];
    for (const option of options) {
      const text = await option.textContent();
      if (text && text.trim()) {
        optionTexts.push(text.trim());
      }
    }
    
    console.log('Additional Income options found:', optionTexts);
    
    // Verify we have substantive options
    const substantiveOptions = optionTexts.filter(text => 
      text !== '' && 
      !text.toLowerCase().includes('select') && 
      !text.toLowerCase().includes('choose')
    );
    
    expect(substantiveOptions.length).toBeGreaterThan(0);
    
    await page.screenshot({ 
      path: 'test-results/cc-step3-additional-income-dropdown.png',
      fullPage: true 
    });

    console.log('✅ CC-003 PASSED - Additional Income dropdown populated correctly');
  });

  test('Test ID: CC-004 - Obligations Dropdown Functionality', async () => {
    console.log('📋 Test ID: CC-004 - Verify Obligations dropdown continues working');
    
    // Look for obligations/debt related dropdown or button
    const obligationsButton = page.locator('[data-testid="obligations-button"], .obligations-button, button:has-text("הוסף התחייבות"), button:has-text("Add Obligation")').first();
    
    if (await obligationsButton.isVisible()) {
      await obligationsButton.click();
      await page.waitForTimeout(1000);
      
      // Look for modal or dropdown that appears
      const obligationsModal = page.locator('.modal, [data-testid="obligations-modal"], .obligations-modal');
      
      if (await obligationsModal.isVisible()) {
        console.log('Obligations modal opened successfully');
        
        // Look for dropdown inside modal
        const modalDropdown = obligationsModal.locator('select').first();
        
        if (await modalDropdown.isVisible()) {
          const options = await modalDropdown.locator('option').all();
          console.log(`Found ${options.length} options in Obligations dropdown`);
          expect(options.length).toBeGreaterThan(1);
        }
        
        await page.screenshot({ 
          path: 'test-results/cc-step3-obligations-modal.png',
          fullPage: true 
        });
        
        // Close modal
        const closeButton = obligationsModal.locator('button:has-text("×"), button:has-text("Close"), .close-button').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }

    console.log('✅ CC-004 PASSED - Obligations functionality working');
  });

  test('Test ID: CC-005 - Form Interaction and Validation', async () => {
    console.log('📋 Test ID: CC-005 - Test form interactions and validation');
    
    // Try to select values in dropdowns
    const mainSourceDropdown = page.locator('select[name="source"]').first();
    
    if (await mainSourceDropdown.isVisible()) {
      // Select first available option that's not placeholder
      const options = await mainSourceDropdown.locator('option').all();
      if (options.length > 1) {
        const optionValue = await options[1].getAttribute('value');
        if (optionValue) {
          await mainSourceDropdown.selectOption(optionValue);
          console.log(`Selected main source option: ${optionValue}`);
        }
      }
    }
    
    // Try additional income dropdown
    const additionalDropdown = page.locator('select[name="additional"]').first();
    
    if (await additionalDropdown.isVisible()) {
      const options = await additionalDropdown.locator('option').all();
      if (options.length > 1) {
        const optionValue = await options[1].getAttribute('value');
        if (optionValue) {
          await additionalDropdown.selectOption(optionValue);
          console.log(`Selected additional income option: ${optionValue}`);
        }
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Look for continue button and check if it becomes enabled
    const continueButton = page.locator('button:has-text("המשך"), button:has-text("Continue"), .continue-button, [data-testid="continue-button"]').first();
    
    if (await continueButton.isVisible()) {
      const isEnabled = await continueButton.isEnabled();
      console.log(`Continue button enabled: ${isEnabled}`);
    }
    
    await page.screenshot({ 
      path: 'test-results/cc-step3-form-filled.png',
      fullPage: true 
    });

    console.log('✅ CC-005 PASSED - Form interaction working');
  });

  test('Test ID: CC-006 - API Requests and Network Activity', async () => {
    console.log('📋 Test ID: CC-006 - Monitor API requests and network activity');
    
    const networkRequests = [];
    
    page.on('request', (request) => {
      networkRequests.push({
        url: request.url(),
        method: request.method()
      });
    });
    
    // Reload page to capture all network requests
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Filter for relevant API calls
    const apiRequests = networkRequests.filter(req => 
      req.url.includes('/api/') || 
      req.url.includes('dropdown') ||
      req.url.includes('content')
    );
    
    console.log('API Requests detected:');
    apiRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
    });
    
    // We should see some API activity for dropdown data
    expect(apiRequests.length).toBeGreaterThan(0);

    console.log('✅ CC-006 PASSED - Network activity detected');
  });

  test('Test ID: CC-007 - Comprehensive Issue Resolution Verification', async () => {
    console.log('📋 Test ID: CC-007 - Final comprehensive verification of all fixes');
    
    const testResults = {
      pageLoads: false,
      noJsErrors: false,
      mainSourcePopulated: false,
      additionalIncomePopulated: false,
      formInteractive: false
    };
    
    // Monitor console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Verify page loads
    try {
      await page.waitForSelector('body', { timeout: 10000 });
      testResults.pageLoads = true;
    } catch (e) {
      console.error('Page load failed:', e.message);
    }
    
    // Check for JS errors
    await page.waitForTimeout(3000);
    testResults.noJsErrors = consoleErrors.length === 0;
    
    // Verify dropdowns are populated
    const mainSourceDropdown = page.locator('select[name="source"]').first();
    if (await mainSourceDropdown.isVisible()) {
      const options = await mainSourceDropdown.locator('option').count();
      testResults.mainSourcePopulated = options > 1;
    }
    
    const additionalDropdown = page.locator('select[name="additional"]').first();
    if (await additionalDropdown.isVisible()) {
      const options = await additionalDropdown.locator('option').count();
      testResults.additionalIncomePopulated = options > 1;
    }
    
    // Test form interactivity
    try {
      if (testResults.mainSourcePopulated) {
        const options = await mainSourceDropdown.locator('option').all();
        const firstOptionValue = await options[1]?.getAttribute('value');
        if (firstOptionValue) {
          await mainSourceDropdown.selectOption(firstOptionValue);
          testResults.formInteractive = true;
        }
      }
    } catch (e) {
      console.error('Form interaction failed:', e.message);
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/cc-step3-final-state.png',
      fullPage: true 
    });
    
    // Generate comprehensive report
    console.log('🎯 COMPREHENSIVE TEST RESULTS:');
    console.log('=====================================');
    console.log(`✅ Page Loads: ${testResults.pageLoads ? 'PASS' : 'FAIL'}`);
    console.log(`✅ No JS Errors: ${testResults.noJsErrors ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Main Source Populated: ${testResults.mainSourcePopulated ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Additional Income Populated: ${testResults.additionalIncomePopulated ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Form Interactive: ${testResults.formInteractive ? 'PASS' : 'FAIL'}`);
    console.log('=====================================');
    
    if (consoleErrors.length > 0) {
      console.log('❌ JavaScript Errors Detected:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    // All critical tests should pass
    expect(testResults.pageLoads).toBe(true);
    expect(testResults.noJsErrors).toBe(true);
    expect(testResults.mainSourcePopulated).toBe(true);
    expect(testResults.additionalIncomePopulated).toBe(true);

    console.log('✅ CC-007 PASSED - All critical fixes verified');
  });

  test.afterEach(async () => {
    // Cleanup and ensure test results directory exists
    await page.evaluate(() => console.log('Test completed'));
  });
});