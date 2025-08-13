#!/usr/bin/env node

/**
 * Debug Credit Step 3 - Check actual page state and console errors
 */

const { chromium } = require('playwright');

async function debugCreditStep3() {
  console.log('🔍 Debug Credit Calculator Step 3 - Check actual state\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('🔍') || msg.text().includes('🚨')) {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
    }
  });

  // Listen to network errors
  page.on('requestfailed', request => {
    console.log(`[NETWORK ERROR]: ${request.url()} - ${request.failure()?.errorText}`);
  });
  
  try {
    console.log('1️⃣ Navigating to Credit Calculator Step 3...');
    await page.goto('http://localhost:5173/services/calculate-credit/3', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check page title and content
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Check if page loaded properly
    const pageContent = await page.textContent('body');
    const hasError = pageContent.includes('error') || pageContent.includes('Error');
    console.log(`📄 Page has errors: ${hasError}`);
    
    // List all visible dropdowns/selects
    console.log('\n2️⃣ Finding all dropdown elements on page...');
    const allDropdowns = await page.locator('select, [role="button"][aria-haspopup], .MuiSelect-root, [data-testid*="dropdown"]').all();
    console.log(`Found ${allDropdowns.length} dropdown elements`);
    
    for (let i = 0; i < allDropdowns.length; i++) {
      const dropdown = allDropdowns[i];
      const isVisible = await dropdown.isVisible();
      const text = await dropdown.textContent();
      const placeholder = await dropdown.getAttribute('placeholder');
      const ariaLabel = await dropdown.getAttribute('aria-label');
      
      console.log(`Dropdown ${i + 1}:`);
      console.log(`  - Visible: ${isVisible}`);
      console.log(`  - Text: ${(text || '').substring(0, 50)}...`);
      console.log(`  - Placeholder: ${placeholder}`);
      console.log(`  - Aria-label: ${ariaLabel}`);
    }
    
    // Check form state by looking at Formik debug logs
    console.log('\n3️⃣ Waiting for form state logs...');
    await page.waitForTimeout(3000);
    
    // Try to select main income source first
    console.log('\n4️⃣ Testing main income source selection...');
    const mainIncomeDropdown = await page.locator('[role="button"]:has([placeholder*="מקור"]), [role="button"]:has([placeholder*="בחר"])').first();
    
    if (await mainIncomeDropdown.isVisible()) {
      console.log('✅ Main income dropdown found - clicking...');
      await mainIncomeDropdown.click();
      await page.waitForTimeout(2000);
      
      // Look for options
      const options = await page.locator('[role="option"], .MuiMenuItem-root').all();
      console.log(`Found ${options.length} income source options`);
      
      if (options.length > 0) {
        // Select employee option
        const employeeOption = options[0]; // First option should be "משכורת"
        const optionText = await employeeOption.textContent();
        console.log(`Selecting option: ${optionText}`);
        await employeeOption.click();
        await page.waitForTimeout(3000);
        
        // Now check if additional fields appeared
        console.log('\n5️⃣ Checking if additional fields appeared after selection...');
        const afterDropdowns = await page.locator('select, [role="button"][aria-haspopup], .MuiSelect-root').all();
        console.log(`Now have ${afterDropdowns.length} dropdown elements (was ${allDropdowns.length})`);
        
        if (afterDropdowns.length > allDropdowns.length) {
          console.log('✅ Additional dropdowns appeared - checking Field of Activity...');
          
          // Look specifically for Field of Activity
          for (let i = 0; i < afterDropdowns.length; i++) {
            const dropdown = afterDropdowns[i];
            const placeholder = await dropdown.getAttribute('placeholder');
            const ariaLabel = await dropdown.getAttribute('aria-label');
            
            if ((placeholder && placeholder.includes('מקצועי')) || (ariaLabel && ariaLabel.includes('professional'))) {
              console.log('✅ Field of Activity dropdown found!');
              console.log(`  - Placeholder: ${placeholder}`);
              console.log(`  - Aria-label: ${ariaLabel}`);
              break;
            }
          }
        }
      }
    } else {
      console.log('❌ Main income dropdown not found');
    }
    
    console.log('\n🎯 Debug completed - check console logs above');
    
  } catch (error) {
    console.error('❌ Debug Error:', error.message);
  } finally {
    await page.waitForTimeout(5000); // Keep browser open to see state
    await browser.close();
  }
}

if (require.main === module) {
  debugCreditStep3().catch(console.error);
}