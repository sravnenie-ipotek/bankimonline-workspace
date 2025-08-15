import { test } from '@playwright/test';

/**
 * REFINANCE CREDIT SYSTEM DIAGNOSTIC TEST
 * DIAGNOSIS ONLY - Documents exact technical failures
 */

test('DIAGNOSIS: Refinance Credit Step 1 - API Failures', async ({ page }) => {
  const consoleErrors: string[] = [];
  const networkErrors: any[] = [];
  const apiCalls: string[] = [];

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

  // Capture API calls
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiCalls.push(request.url());
      console.log('API CALL:', request.url());
    }
  });

  console.log('\n=== DIAGNOSING REFINANCE CREDIT STEP 1 ===');
  
  // Navigate to refinance credit step 1
  await page.goto('http://localhost:5173/services/refinance-credit/1');
  await page.waitForTimeout(3000);

  // Capture full page screenshot
  await page.screenshot({
    path: 'screenshots/refinance-credit-step1-diagnosis.png',
    fullPage: true
  });

  // Log diagnostic results
  console.log('Console Errors Found:', consoleErrors.length);
  consoleErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`);
  });

  console.log('Network Errors Found:', networkErrors.length);
  networkErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.url} - ${error.status} ${error.statusText}`);
  });

  console.log('API Calls Made:', apiCalls.length);
  apiCalls.forEach((call, index) => {
    console.log(`${index + 1}. ${call}`);
  });
});

test('DIAGNOSIS: Refinance Credit Step 2 - API Failures', async ({ page }) => {
  const consoleErrors: string[] = [];
  const networkErrors: any[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push({
        url: response.url(),
        status: response.status()
      });
    }
  });

  console.log('\n=== DIAGNOSING REFINANCE CREDIT STEP 2 ===');
  
  await page.goto('http://localhost:5173/services/refinance-credit/2');
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: 'screenshots/refinance-credit-step2-diagnosis.png',
    fullPage: true
  });

  console.log('Step 2 Console Errors:', consoleErrors.length);
  console.log('Step 2 Network Errors:', networkErrors.length);
});

test('DIAGNOSIS: Refinance Credit Step 3 - API Failures', async ({ page }) => {
  const consoleErrors: string[] = [];
  const networkErrors: any[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push({
        url: response.url(),
        status: response.status()
      });
    }
  });

  console.log('\n=== DIAGNOSING REFINANCE CREDIT STEP 3 ===');
  
  await page.goto('http://localhost:5173/services/refinance-credit/3');
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: 'screenshots/refinance-credit-step3-diagnosis.png',
    fullPage: true
  });

  console.log('Step 3 Console Errors:', consoleErrors.length);
  console.log('Step 3 Network Errors:', networkErrors.length);
});

test('DIAGNOSIS: Refinance Credit Step 4 - API Failures', async ({ page }) => {
  const consoleErrors: string[] = [];
  const networkErrors: any[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push({
        url: response.url(),
        status: response.status()
      });
    }
  });

  console.log('\n=== DIAGNOSING REFINANCE CREDIT STEP 4 ===');
  
  await page.goto('http://localhost:5173/services/refinance-credit/4');
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: 'screenshots/refinance-credit-step4-diagnosis.png',
    fullPage: true
  });

  console.log('Step 4 Console Errors:', consoleErrors.length);
  console.log('Step 4 Network Errors:', networkErrors.length);
});