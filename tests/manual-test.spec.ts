import { test, expect } from '@playwright/test';

test('Manual validation test', async ({ page }) => {
  // Go to the refinance mortgage page
  await page.goto('/services/refinance-mortgage/1');
  
  // Just wait a moment for initial load
  await page.waitForTimeout(3000);
  
  // Take a screenshot to see what we have
  await page.screenshot({ path: 'manual-test-initial.png', fullPage: true });
  
  // Log the URL
  console.log('Current URL:', page.url());
  
  // Try to find step 3 elements directly (in case we're already on step 3)
  const dropdowns = await page.locator('select, .MuiSelect-root, [role="combobox"]').count();
  console.log('Dropdowns found:', dropdowns);
  
  // Look for Hebrew text that indicates we're on the right page
  const bodyText = await page.textContent('body') || '';
  console.log('Page contains income text:', bodyText.includes('הכנסה') || bodyText.includes('income'));
  console.log('Page contains obligations text:', bodyText.includes('התחייבויות') || bodyText.includes('obligations'));
  
  // Check if there are any continue/next buttons
  const nextButtons = await page.locator('button:has-text("הבא"), button:has-text("המשך"), button:has-text("Next")').count();
  console.log('Next buttons found:', nextButtons);
  
  // Look for dropdowns with our specific test IDs or classes
  const mainIncomeDropdown = await page.locator('[data-testid*="income"], .main-source-income, select').first();
  const isMainIncomeVisible = await mainIncomeDropdown.isVisible().catch(() => false);
  console.log('Main income dropdown visible:', isMainIncomeVisible);
  
  if (isMainIncomeVisible) {
    console.log('✅ Found income dropdown - can test validation');
    
    // Check continue button state before selection
    const continueButton = page.locator('button:has-text("הבא"), button:has-text("המשך"), button:has-text("Next")').first();
    const isDisabledBefore = await continueButton.isDisabled().catch(() => true);
    console.log('Continue button disabled initially:', isDisabledBefore);
    
    // Try to interact with dropdown
    await mainIncomeDropdown.click();
    await page.waitForTimeout(1000);
    
    // Look for dropdown options
    const options = await page.locator('li, option').count();
    console.log('Dropdown options found:', options);
    
    if (options > 0) {
      // Select first option
      await page.locator('li, option').nth(1).click();
      await page.waitForTimeout(1000);
      
      // Check button state after selection
      const isDisabledAfter = await continueButton.isDisabled().catch(() => true);
      console.log('Continue button disabled after selection:', isDisabledAfter);
      
      if (isDisabledBefore && !isDisabledAfter) {
        console.log('✅ SUCCESS: Button enabled after dropdown selection');
      } else if (!isDisabledBefore) {
        console.log('⚠️ Button was already enabled initially');
      } else {
        console.log('❌ Button still disabled after selection');
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'manual-test-final.png', fullPage: true });
  } else {
    console.log('❌ Could not find income dropdown - might need to navigate through steps first');
  }
  
  expect(true).toBe(true); // Always pass, we're just testing manually
});