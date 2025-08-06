import { test, expect } from '@playwright/test';

test('Test dropdown validation race condition fix', async ({ page }) => {
  // Navigate to refinance mortgage form
  await page.goto('/services/refinance-mortgage/1');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Step 1: Fill basic loan information to proceed to step 2
  // Wait for property value input and fill it
  await page.waitForSelector('input[data-testid="property-value-input"], input[name="propertyValue"], input[placeholder*="נכס"], input[placeholder*="property"]', { timeout: 10000 });
  
  // Try multiple selectors for property value input
  const propertyValueInput = await page.locator('input[data-testid="property-value-input"], input[name="propertyValue"], input[placeholder*="נכס"], input[placeholder*="property"]').first();
  await propertyValueInput.fill('1000000');
  
  // Fill loan amount
  const loanAmountInput = await page.locator('input[data-testid="loan-amount-input"], input[name="loanAmount"], input[placeholder*="הלוואה"], input[placeholder*="loan"]').first();
  await loanAmountInput.fill('750000');
  
  // Continue to next step
  let nextButton = await page.locator('button:has-text("הבא"), button:has-text("המשך"), button:has-text("Next")');
  await nextButton.click();
  
  // Step 2: Fill personal information to proceed to step 3
  await page.waitForTimeout(1000);
  
  // Fill first name
  const firstNameInput = await page.locator('input[name="firstName"], input[placeholder*="שם פרטי"], input[placeholder*="first"]').first();
  await firstNameInput.fill('יוסי');
  
  // Fill last name
  const lastNameInput = await page.locator('input[name="lastName"], input[placeholder*="שם משפחה"], input[placeholder*="last"]').first();
  await lastNameInput.fill('כהן');
  
  // Fill ID number
  const idInput = await page.locator('input[name="idNumber"], input[placeholder*="תעודת זהות"], input[placeholder*="ID"]').first();
  await idInput.fill('123456789');
  
  // Fill phone
  const phoneInput = await page.locator('input[name="phone"], input[placeholder*="טלפון"], input[placeholder*="phone"]').first();
  await phoneInput.fill('0501234567');
  
  // Continue to step 3
  nextButton = await page.locator('button:has-text("הבא"), button:has-text("המשך"), button:has-text("Next")');
  await nextButton.click();
  
  // Step 3: Test dropdown validation
  await page.waitForTimeout(2000);
  console.log('Reached step 3 - Testing dropdown validation');
  
  // Take initial screenshot
  await page.screenshot({ path: 'step3-initial.png', fullPage: true });
  
  // Check initial state of continue button - should be disabled
  const continueButton = await page.locator('button:has-text("הבא"), button:has-text("המשך"), button:has-text("Next")');
  const isInitiallyDisabled = await continueButton.isDisabled();
  console.log('Continue button initially disabled:', isInitiallyDisabled);
  
  // Find and select main source of income dropdown
  const mainIncomeDropdown = await page.locator('[data-testid="main-source-of-income-dropdown"], select, .MuiSelect-select').first();
  await mainIncomeDropdown.click();
  
  // Wait for options to appear and select "עובד שכיר" (Employee)
  await page.waitForTimeout(500);
  const employeeOption = await page.locator('li:has-text("עובד שכיר"), option:has-text("עובד שכיר")').first();
  await employeeOption.click();
  
  console.log('Selected main income source');
  await page.waitForTimeout(1000);
  
  // Find and select additional income dropdown
  const additionalIncomeDropdown = await page.locator('[data-testid="additional-income-dropdown"], select').nth(1);
  await additionalIncomeDropdown.click();
  await page.waitForTimeout(500);
  
  // Select first available option
  const additionalIncomeOption = await page.locator('li, option').nth(1);
  await additionalIncomeOption.click();
  
  console.log('Selected additional income');
  await page.waitForTimeout(1000);
  
  // Find and select obligations dropdown
  const obligationsDropdown = await page.locator('[data-testid="obligations-dropdown"], select').nth(2);
  await obligationsDropdown.click();
  await page.waitForTimeout(500);
  
  // Select first available option
  const obligationsOption = await page.locator('li, option').nth(1);
  await obligationsOption.click();
  
  console.log('Selected obligations');
  await page.waitForTimeout(2000);
  
  // Take screenshot after filling dropdowns
  await page.screenshot({ path: 'step3-filled.png', fullPage: true });
  
  // Check if continue button is now enabled
  const isEnabledAfterFilling = await continueButton.isDisabled();
  console.log('Continue button disabled after filling:', isEnabledAfterFilling);
  
  // Verify the fix worked
  if (!isEnabledAfterFilling) {
    console.log('✅ SUCCESS: Continue button is now enabled after filling dropdowns');
    // Take final success screenshot
    await page.screenshot({ path: 'step3-success.png', fullPage: true });
  } else {
    console.log('❌ ISSUE: Continue button is still disabled after filling dropdowns');
  }
  
  // Additional validation - check form state
  const formData = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      return data;
    }
    return {};
  });
  
  console.log('Form data:', formData);
  
  expect(!isEnabledAfterFilling).toBe(true);
});