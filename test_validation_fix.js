const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting validation test for refinance mortgage step 3...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Enable console logging to capture debug messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔍') || text.includes('MainSourceOfIncome') || text.includes('AdditionalIncome') || text.includes('Obligation')) {
      console.log('🔍 BROWSER:', text);
    }
  });
  
  try {
    console.log('📍 Navigating to http://localhost:5174/services/refinance-mortgage/3');
    await page.goto('http://localhost:5174/services/refinance-mortgage/3', { waitUntil: 'networkidle' });
    
    // Wait a moment for any redirects
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('📍 Current URL after navigation:', currentUrl);
    
    if (!currentUrl.includes('/services/refinance-mortgage/3')) {
      console.log('⚠️ Page redirected, likely enforcing form flow. Need to complete previous steps.');
      
      // If redirected to step 1, fill minimum required fields
      if (currentUrl.includes('/services/refinance-mortgage/1')) {
        console.log('📝 Filling step 1 to reach step 3...');
        
        // Fill property value
        const propertyValueInput = page.locator('input[name="property_value"], input[placeholder*="ערך"], input[placeholder*="value"]').first();
        if (await propertyValueInput.isVisible()) {
          await propertyValueInput.fill('1000000');
          console.log('✅ Filled property value');
        }
        
        // Fill down payment
        const downPaymentInput = page.locator('input[name="down_payment"], input[name="initial_payment"]').first();
        if (await downPaymentInput.isVisible()) {
          await downPaymentInput.fill('200000');
          console.log('✅ Filled down payment');
        }
        
        // Select property ownership if present
        const propertyOwnershipDropdown = page.locator('select[name="property_ownership"], .MuiSelect-root').first();
        if (await propertyOwnershipDropdown.isVisible()) {
          await propertyOwnershipDropdown.click();
          await page.waitForTimeout(500);
          // Select first option
          await page.locator('li[role="option"], .MuiMenuItem-root').first().click();
          console.log('✅ Selected property ownership');
        }
        
        // Navigate to next step
        const continueButton = page.locator('button:has-text("המשך"), button:has-text("Continue"), button[type="submit"]').last();
        if (await continueButton.isEnabled()) {
          await continueButton.click();
          console.log('✅ Clicked continue to step 2');
          await page.waitForTimeout(2000);
        }
      }
      
      // If on step 2, fill minimal personal info
      if (page.url().includes('/services/refinance-mortgage/2')) {
        console.log('📝 Filling step 2 to reach step 3...');
        
        // Fill first name
        const firstNameInput = page.locator('input[name="first_name"], input[placeholder*="שם פרטי"]').first();
        if (await firstNameInput.isVisible()) {
          await firstNameInput.fill('John');
          console.log('✅ Filled first name');
        }
        
        // Fill last name
        const lastNameInput = page.locator('input[name="last_name"], input[placeholder*="שם משפחה"]').first();
        if (await lastNameInput.isVisible()) {
          await lastNameInput.fill('Doe');
          console.log('✅ Filled last name');
        }
        
        // Navigate to step 3
        const continueButton = page.locator('button:has-text("המשך"), button:has-text("Continue"), button[type="submit"]').last();
        if (await continueButton.isEnabled()) {
          await continueButton.click();
          console.log('✅ Clicked continue to step 3');
          await page.waitForTimeout(3000);
        }
      }
    }
    
    // Now we should be on step 3 - test the validation fixes
    console.log('🧪 Testing validation fixes on step 3...');
    console.log('📍 Final URL:', page.url());
    
    // Check if we're on step 3
    if (page.url().includes('/services/refinance-mortgage/3')) {
      console.log('✅ Successfully on step 3');
      
      // Look for the main source of income dropdown
      console.log('🔍 Looking for main source of income dropdown...');
      const mainIncomeDropdown = page.locator('select[name*="main"], select[name*="income"], .MuiSelect-root').first();
      
      if (await mainIncomeDropdown.isVisible()) {
        console.log('✅ Found main income dropdown');
        
        // Test selecting a value
        await mainIncomeDropdown.click();
        await page.waitForTimeout(500);
        
        // Select first valid option
        const firstOption = page.locator('li[role="option"], .MuiMenuItem-root').first();
        await firstOption.click();
        console.log('✅ Selected main income option');
        
        await page.waitForTimeout(1000);
        
        // Check if validation error disappeared and continue button is enabled
        const continueButton = page.locator('button:has-text("המשך"), button:has-text("Continue"), button[type="submit"]').last();
        const isEnabled = await continueButton.isEnabled();
        console.log('📊 Continue button enabled after selection:', isEnabled);
        
      } else {
        console.log('❌ Main income dropdown not found');
      }
      
      // Look for additional income dropdown
      console.log('🔍 Looking for additional income dropdown...');
      const additionalIncomeDropdown = page.locator('select[name*="additional"], select[name*="extra"]').first();
      
      if (await additionalIncomeDropdown.isVisible()) {
        console.log('✅ Found additional income dropdown');
        await additionalIncomeDropdown.click();
        await page.waitForTimeout(500);
        const firstOption = page.locator('li[role="option"], .MuiMenuItem-root').first();
        await firstOption.click();
        console.log('✅ Selected additional income option');
      }
      
      // Look for obligation dropdown
      console.log('🔍 Looking for obligation dropdown...');
      const obligationDropdown = page.locator('select[name*="obligation"], select[name*="debt"]').first();
      
      if (await obligationDropdown.isVisible()) {
        console.log('✅ Found obligation dropdown');
        await obligationDropdown.click();
        await page.waitForTimeout(500);
        const firstOption = page.locator('li[role="option"], .MuiMenuItem-root').first();
        await firstOption.click();
        console.log('✅ Selected obligation option');
      }
      
      await page.waitForTimeout(2000);
      
      // Final check of continue button
      const continueButton = page.locator('button:has-text("המשך"), button:has-text("Continue"), button[type="submit"]').last();
      const finalEnabled = await continueButton.isEnabled();
      console.log('🎯 Final continue button status:', finalEnabled ? 'ENABLED' : 'DISABLED');
      
    } else {
      console.log('❌ Could not reach step 3. Current URL:', page.url());
    }
    
    console.log('⏸️ Test completed. Keeping browser open for manual inspection...');
    // Keep browser open for manual inspection
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
    console.log('🏁 Test finished');
  }
})();