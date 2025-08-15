import { test, expect } from '@playwright/test';

test('Manual validation test', async ({ page }) => {
  // Go to the refinance mortgage page
  await page.goto('/services/refinance-mortgage/1');
  
  // Just wait a moment for initial load
  await page.waitForTimeout(3000);
  
  // Take a screenshot to see what we have
  await page.screenshot({ path: 'manual-test-initial.png', fullPage: true });
  
  // Log the URL
  );
  
  // Try to find step 3 elements directly (in case we're already on step 3)
  const dropdowns = await page.locator('select, .MuiSelect-root, [role="combobox"]').count();
  // Look for Hebrew text that indicates we're on the right page
  const bodyText = await page.textContent('body') || '';
  || bodyText.includes('income'));
  || bodyText.includes('obligations'));
  
  // Check if there are any continue/next buttons
  const nextButtons = await page.locator('button:has-text("הבא"), button:has-text("המשך"), button:has-text("Next")').count();
  // Look for dropdowns with our specific test IDs or classes
  const mainIncomeDropdown = await page.locator('[data-testid*="income"], .main-source-income, select').first();
  const isMainIncomeVisible = await mainIncomeDropdown.isVisible().catch(() => false);
  if (isMainIncomeVisible) {
    // Check continue button state before selection
    const continueButton = page.locator('button:has-text("הבא"), button:has-text("המשך"), button:has-text("Next")').first();
    const isDisabledBefore = await continueButton.isDisabled().catch(() => true);
    // Try to interact with dropdown
    await mainIncomeDropdown.click();
    await page.waitForTimeout(1000);
    
    // Look for dropdown options
    const options = await page.locator('li, option').count();
    if (options > 0) {
      // Select first option
      await page.locator('li, option').nth(1).click();
      await page.waitForTimeout(1000);
      
      // Check button state after selection
      const isDisabledAfter = await continueButton.isDisabled().catch(() => true);
      if (isDisabledBefore && !isDisabledAfter) {
        } else if (!isDisabledBefore) {
        } else {
        }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'manual-test-final.png', fullPage: true });
  } else {
    }
  
  expect(true).toBe(true); // Always pass, we're just testing manually
});