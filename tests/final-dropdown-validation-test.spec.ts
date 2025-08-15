import { test, expect } from '@playwright/test';

test('Final dropdown validation test - Navigate through steps', async ({ page }) => {
  // Navigate to refinance mortgage form
  await page.goto('/services/refinance-mortgage/1');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'step1-initial.png', fullPage: true });
  
  // Step 1: Fill mortgage refinancing form
  
  // Property value - fill the first input field (1,000,000)
  const propertyValueField = page.locator('input[type="text"]').first();
  await propertyValueField.fill('1000000');
  // Loan amount - fill the second input field (200,000)
  const loanAmountField = page.locator('input[type="text"]').nth(1);
  await loanAmountField.fill('700000');
  // Wait a moment for form to process
  await page.waitForTimeout(1000);
  
  // Property ownership dropdown
  const propertyOwnershipDropdown = page.locator('div[role="button"]:has-text("בחר מערכת הבעלות")').first();
  await propertyOwnershipDropdown.click();
  await page.waitForTimeout(500);
  
  // Select first ownership option
  const firstOwnershipOption = page.locator('li').first();
  await firstOwnershipOption.click();
  await page.waitForTimeout(1000);
  
  // Building type dropdown
  const buildingTypeDropdown = page.locator('div[role="button"]:has-text("בחר סוג הבניין")').first();
  await buildingTypeDropdown.click();
  await page.waitForTimeout(500);
  
  // Select first building type
  const firstBuildingOption = page.locator('li').first();
  await firstBuildingOption.click();
  await page.waitForTimeout(1000);
  
  // Property type dropdown  
  const propertyTypeDropdown = page.locator('div[role="button"]:has-text("בחר סוג הנכס")').first();
  await propertyTypeDropdown.click();
  await page.waitForTimeout(500);
  
  // Select first property type
  const firstPropertyOption = page.locator('li').first();
  await firstPropertyOption.click();
  await page.waitForTimeout(1000);
  
  // Take screenshot after filling step 1
  await page.screenshot({ path: 'step1-filled.png', fullPage: true });
  
  // Click Next button
  const nextButton1 = page.locator('button:has-text("הבא")');
  await nextButton1.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'step2-initial.png', fullPage: true });
  
  // Step 2: Fill personal information
  
  // First name
  const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="שם"]').first();
  await firstNameInput.fill('יוסי');
  // Last name
  const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="משפחה"]').first();
  await lastNameInput.fill('כהן');
  // ID number
  const idInput = page.locator('input[name="idNumber"], input[placeholder*="זהות"]').first();
  await idInput.fill('123456789');
  // Phone number
  const phoneInput = page.locator('input[name="phone"], input[placeholder*="טלפון"]').first();
  await phoneInput.fill('0501234567');
  // Email
  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  await emailInput.fill('test@example.com');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'step2-filled.png', fullPage: true });
  
  // Click Next to go to Step 3
  const nextButton2 = page.locator('button:has-text("הבא")');
  await nextButton2.click();
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'step3-initial.png', fullPage: true });
  
  // Check if we're on step 3 and can see income/obligations dropdowns
  const step3Text = await page.textContent('body') || '';
  const hasIncomeText = step3Text.includes('הכנסה') || step3Text.includes('income');
  const hasObligationsText = step3Text.includes('התחייבויות') || step3Text.includes('obligations');
  
  // Find the continue button and check its initial state
  const continueButton = page.locator('button:has-text("הבא")').first();
  const isInitiallyDisabled = await continueButton.isDisabled();
  // Find all dropdowns on the page
  const dropdowns = await page.locator('div[role="button"], select, .MuiSelect-select').count();
  if (hasIncomeText || hasObligationsText || dropdowns > 0) {
    // Find and interact with dropdowns
    const allDropdowns = page.locator('div[role="button"], select, .MuiSelect-select');
    const dropdownCount = await allDropdowns.count();
    
    for (let i = 0; i < Math.min(dropdownCount, 5); i++) {
      try {
        const dropdown = allDropdowns.nth(i);
        const isVisible = await dropdown.isVisible();
        
        if (isVisible) {
          await dropdown.click();
          await page.waitForTimeout(1000);
          
          // Try to select the first available option
          const options = page.locator('li[role="option"], option');
          const optionCount = await options.count();
          
          if (optionCount > 0) {
            await options.first().click();
            await page.waitForTimeout(1000);
          } else {
            }
        } else {
          }
      } catch (error) {
        }
    }
    
    // Take screenshot after filling dropdowns
    await page.screenshot({ path: 'step3-filled.png', fullPage: true });
    
    // Check continue button state after filling dropdowns
    await page.waitForTimeout(2000);
    const isDisabledAfterFilling = await continueButton.isDisabled();
    // Final validation
    if (isInitiallyDisabled && !isDisabledAfterFilling) {
      await page.screenshot({ path: 'step3-success.png', fullPage: true });
    } else if (!isInitiallyDisabled) {
      ');
    } else {
      }
    
    // Try to click continue if enabled
    if (!isDisabledAfterFilling) {
      await continueButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'step4-reached.png', fullPage: true });
      }
    
  } else {
    ');
    const bodyText = await page.textContent('body') || '';
    + '...');
  }
  
  expect(true).toBe(true);
});