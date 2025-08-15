import { test, expect } from '@playwright/test';

/**
 * REFINANCE CREDIT SYSTEM DIAGNOSTIC TEST
 * 
 * This test is for DIAGNOSIS ONLY - it captures screenshots and documents
 * the exact technical failures in the refinance credit system.
 * 
 * CRITICAL: DO NOT FIX - ONLY DOCUMENT THE PROBLEMS
 */
let consoleErrors: string[] = [];
let networkErrors: any[] = [];

test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('CONSOLE ERROR:', msg.text());
      }
    });

    // Capture network failures
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log('NETWORK ERROR:', response.url(), response.status());
      }
    });

    // Navigate to home page first
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('DIAGNOSIS: Refinance Credit Step 1 - API Endpoint Failures', async ({ page }) => {
    console.log('\n=== DIAGNOSING REFINANCE CREDIT STEP 1 ===');
    
    // Clear previous errors
    consoleErrors = [];
    networkErrors = [];

    // Navigate to refinance credit step 1
    await page.goto('http://localhost:5173/services/refinance-credit/1');
    
    // Wait for page to attempt loading
    await page.waitForTimeout(3000);

    // Capture full page screenshot with browser dev tools
    await page.screenshot({
      path: 'screenshots/refinance-credit-step1-full-page.png',
      fullPage: true
    });

    // Open dev tools and capture console errors
    await page.evaluate(() => {
      console.log('=== CURRENT CONSOLE ERRORS ===');
    });

    // Capture network tab view
    await page.screenshot({
      path: 'screenshots/refinance-credit-step1-console-errors.png',
      fullPage: true
    });

    // Log diagnostic information
    console.log('Console Errors Found:', consoleErrors.length);
    consoleErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });

    console.log('Network Errors Found:', networkErrors.length);
    networkErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.url} - ${error.status} ${error.statusText}`);
    });

    // Look for specific components that should be loading dropdowns
    const dropdownSelectors = [
      '[data-testid="property-ownership-dropdown"]',
      '[data-testid="purpose-dropdown"]',
      '.dropdown-container',
      '.form-control',
      'select'
    ];

    for (const selector of dropdownSelectors) {
      try {
        const elements = await page.locator(selector).count();
        if (elements > 0) {
          await page.screenshot({
            path: `screenshots/refinance-credit-step1-dropdown-${selector.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
            fullPage: true
          });
          console.log(`Found ${elements} elements for selector: ${selector}`);
        }
      } catch (error) {
        console.log(`No elements found for selector: ${selector}`);
      }
    }

    // Check for loading states
    const loadingIndicators = await page.locator('.loading, .spinner, [data-loading="true"]').count();
    console.log(`Loading indicators found: ${loadingIndicators}`);

    // Document the current state
    const pageContent = await page.content();
    console.log('Page contains "dropdownData":', pageContent.includes('dropdownData'));
    console.log('Page contains "undefined":', pageContent.includes('undefined'));
  });

  test('DIAGNOSIS: Refinance Credit Step 2 - API Endpoint Failures', async ({ page }) => {
    console.log('\n=== DIAGNOSING REFINANCE CREDIT STEP 2 ===');
    
    consoleErrors = [];
    networkErrors = [];

    await page.goto('http://localhost:5173/services/refinance-credit/2');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'screenshots/refinance-credit-step2-full-page.png',
      fullPage: true
    });

    console.log('Step 2 - Console Errors:', consoleErrors.length);
    console.log('Step 2 - Network Errors:', networkErrors.length);
  });

  test('DIAGNOSIS: Refinance Credit Step 3 - API Endpoint Failures', async ({ page }) => {
    console.log('\n=== DIAGNOSING REFINANCE CREDIT STEP 3 ===');
    
    consoleErrors = [];
    networkErrors = [];

    await page.goto('http://localhost:5173/services/refinance-credit/3');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'screenshots/refinance-credit-step3-full-page.png',
      fullPage: true
    });

    console.log('Step 3 - Console Errors:', consoleErrors.length);
    console.log('Step 3 - Network Errors:', networkErrors.length);
  });

  test('DIAGNOSIS: Refinance Credit Step 4 - API Endpoint Failures', async ({ page }) => {
    console.log('\n=== DIAGNOSING REFINANCE CREDIT STEP 4 ===');
    
    consoleErrors = [];
    networkErrors = [];

    await page.goto('http://localhost:5173/services/refinance-credit/4');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'screenshots/refinance-credit-step4-full-page.png',
      fullPage: true
    });

    console.log('Step 4 - Console Errors:', consoleErrors.length);
    console.log('Step 4 - Network Errors:', networkErrors.length);
  });

  test('DIAGNOSIS: API Endpoint Investigation', async ({ page }) => {
    console.log('\n=== INVESTIGATING API ENDPOINTS ===');

    // Test what endpoints are actually being called
    const apiCalls: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push(request.url());
        console.log('API CALL:', request.url());
      }
    });

    // Navigate through each step and capture API calls
    for (let step = 1; step <= 4; step++) {
      console.log(`\n--- Testing Step ${step} ---`);
      await page.goto(`http://localhost:5173/services/refinance-credit/${step}`);
      await page.waitForTimeout(2000);
    }

    console.log('\nAll API calls captured:');
    apiCalls.forEach((call, index) => {
      console.log(`${index + 1}. ${call}`);
    });
  });