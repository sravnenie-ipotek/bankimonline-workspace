const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting targeted validation test for step 3 debug logs...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture console logs to look for our debug messages
  let validationLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔍 MainSourceOfIncome debug:') || 
        text.includes('🔍 AdditionalIncome debug:') || 
        text.includes('🔍 Obligation debug:') ||
        text.includes('Applied validation bypass') ||
        text.includes('Suppressing validation error')) {
      validationLogs.push(text);
      console.log('✅ VALIDATION LOG:', text);
    }
  });
  
  try {
    console.log('📍 Starting from step 1 and filling form to reach step 3...');
    await page.goto('http://localhost:5174/services/refinance-mortgage/1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // === STEP 1: Basic loan details ===
    console.log('📝 Filling Step 1...');
    
    // Fill property value
    const propertyValueInput = page.locator('input[type="text"], input[type="number"]').first();
    await propertyValueInput.fill('1000000');
    await page.waitForTimeout(500);
    console.log('✅ Filled property value: 1,000,000');
    
    // Fill down payment - look for second input field
    const inputs = page.locator('input[type="text"], input[type="number"]');
    const inputCount = await inputs.count();
    
    if (inputCount >= 2) {
      const downPaymentInput = inputs.nth(1);
      await downPaymentInput.fill('300000');
      await page.waitForTimeout(500);
      console.log('✅ Filled down payment: 300,000');
    }
    
    // Handle any dropdowns on step 1
    const dropdowns = page.locator('select, .MuiSelect-root');
    const dropdownCount = await dropdowns.count();
    
    for (let i = 0; i < Math.min(dropdownCount, 3); i++) {
      try {
        const dropdown = dropdowns.nth(i);
        if (await dropdown.isVisible()) {
          await dropdown.click();
          await page.waitForTimeout(300);
          
          // Click first option
          const firstOption = page.locator('li[role="option"], .MuiMenuItem-root').first();
          if (await firstOption.isVisible()) {
            await firstOption.click();
            console.log(`✅ Selected dropdown ${i + 1} option`);
            await page.waitForTimeout(300);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not select dropdown ${i + 1}:`, error.message);
      }
    }
    
    // Navigate to step 2
    await page.waitForTimeout(1000);
    const continueBtn1 = page.locator('button:has-text("המשך"), button:has-text("Continue"), button[type="submit"]').last();
    
    if (await continueBtn1.isEnabled()) {
      await continueBtn1.click();
      console.log('✅ Proceeded to Step 2');
      await page.waitForTimeout(2000);
    } else {
      console.log('❌ Step 1 continue button not enabled');
    }
    
    // === STEP 2: Personal information ===
    console.log('📝 Filling Step 2...');
    
    // Fill text inputs
    const textInputs = page.locator('input[type="text"]');
    const textInputCount = await textInputs.count();
    
    for (let i = 0; i < Math.min(textInputCount, 3); i++) {
      try {
        const input = textInputs.nth(i);
        if (await input.isVisible()) {
          await input.fill(`Value${i + 1}`);
          await page.waitForTimeout(200);
          console.log(`✅ Filled text input ${i + 1}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not fill text input ${i + 1}`);
      }
    }
    
    // Handle dropdowns on step 2
    const step2Dropdowns = page.locator('select, .MuiSelect-root');
    const step2DropdownCount = await step2Dropdowns.count();
    
    for (let i = 0; i < Math.min(step2DropdownCount, 3); i++) {
      try {
        const dropdown = step2Dropdowns.nth(i);
        if (await dropdown.isVisible()) {
          await dropdown.click();
          await page.waitForTimeout(300);
          
          const firstOption = page.locator('li[role="option"], .MuiMenuItem-root').first();
          if (await firstOption.isVisible()) {
            await firstOption.click();
            console.log(`✅ Selected step 2 dropdown ${i + 1} option`);
            await page.waitForTimeout(300);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not select step 2 dropdown ${i + 1}`);
      }
    }
    
    // Navigate to step 3
    await page.waitForTimeout(1000);
    const continueBtn2 = page.locator('button:has-text("המשך"), button:has-text("Continue"), button[type="submit"]').last();
    
    if (await continueBtn2.isEnabled()) {
      await continueBtn2.click();
      console.log('✅ Proceeded to Step 3');
      await page.waitForTimeout(3000);
    } else {
      console.log('❌ Step 2 continue button not enabled');
    }
    
    // === STEP 3: Income validation testing ===
    console.log('🧪 NOW TESTING STEP 3 VALIDATION FIXES...');
    console.log('📍 Current URL:', page.url());
    
    if (page.url().includes('step/3') || page.url().includes('/3')) {
      console.log('✅ Successfully reached Step 3!');
      
      // Wait for components to load and debug logs to appear
      await page.waitForTimeout(2000);
      
      // Test all dropdowns on step 3
      const step3Dropdowns = page.locator('select, .MuiSelect-root');
      const step3DropdownCount = await step3Dropdowns.count();
      console.log(`🔍 Found ${step3DropdownCount} dropdowns on step 3`);
      
      for (let i = 0; i < step3DropdownCount; i++) {
        console.log(`\n🧪 Testing dropdown ${i + 1}...`);
        
        try {
          const dropdown = step3Dropdowns.nth(i);
          if (await dropdown.isVisible()) {
            console.log(`📝 Dropdown ${i + 1} is visible - clicking...`);
            await dropdown.click();
            await page.waitForTimeout(500);
            
            // Select first option
            const options = page.locator('li[role="option"], .MuiMenuItem-root');
            const optionCount = await options.count();
            
            if (optionCount > 0) {
              const firstOption = options.first();
              await firstOption.click();
              console.log(`✅ Selected option in dropdown ${i + 1}`);
              
              // Wait for validation logs to appear
              await page.waitForTimeout(1000);
              
              // Check continue button status
              const continueBtn = page.locator('button:has-text("המשך"), button:has-text("Continue"), button[type="submit"]').last();
              const isEnabled = await continueBtn.isEnabled();
              console.log(`📊 Continue button enabled after dropdown ${i + 1}: ${isEnabled}`);
              
            } else {
              console.log(`⚠️ No options found in dropdown ${i + 1}`);
            }
          } else {
            console.log(`⚠️ Dropdown ${i + 1} not visible`);
          }
        } catch (error) {
          console.log(`❌ Error testing dropdown ${i + 1}:`, error.message);
        }
        
        await page.waitForTimeout(500);
      }
      
      // Final summary
      console.log('\n📊 VALIDATION TEST SUMMARY:');
      console.log(`Total validation logs captured: ${validationLogs.length}`);
      validationLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
      
      // Final continue button check
      await page.waitForTimeout(1000);
      const finalContinueBtn = page.locator('button:has-text("המשך"), button:has-text("Continue"), button[type="submit"]').last();
      const finalEnabled = await finalContinueBtn.isEnabled();
      console.log(`\n🎯 FINAL RESULT - Continue button enabled: ${finalEnabled}`);
      
      if (finalEnabled) {
        console.log('✅ SUCCESS: Validation fixes are working! Button is enabled.');
      } else {
        console.log('❌ ISSUE: Continue button still disabled despite selections.');
      }
      
    } else {
      console.log('❌ Could not reach step 3. Current URL:', page.url());
    }
    
    // Keep browser open briefly for inspection
    console.log('\n⏸️ Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
})();