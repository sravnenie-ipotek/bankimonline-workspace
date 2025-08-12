const { chromium } = require('playwright');

async function quickCreditCalculatorTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
  page.on('pageerror', error => console.log(`PAGE ERROR: ${error.message}`));
  
  try {
    console.log('🔄 Loading Credit Calculator Step 3...');
    
    // Navigate to the page
    await page.goto('http://localhost:5173/services/calculate-credit/3/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for React to load - look for specific elements
    console.log('⏳ Waiting for React app to load...');
    
    // Wait for either the form or an error message
    try {
      await page.waitForFunction(() => {
        const body = document.body.textContent || '';
        return !body.includes('You need to enable JavaScript') && body.length > 100;
      }, { timeout: 15000 });
      
      console.log('✅ React app loaded successfully');
    } catch (error) {
      console.log('❌ React app failed to load properly');
      await page.screenshot({ path: 'react_load_failed.png', fullPage: true });
      return false;
    }
    
    // Take a full page screenshot to see what we have
    await page.screenshot({ path: 'credit_calc_full_page.png', fullPage: true });
    
    // Look for any dropdowns on the page
    console.log('🔍 Searching for ALL dropdown elements...');
    
    const allSelects = await page.$$('select, div[role="combobox"], .MuiSelect-root, div[class*="dropdown"], div[class*="select"]');
    console.log(`Found ${allSelects.length} potential dropdown elements`);
    
    for (let i = 0; i < allSelects.length; i++) {
      const element = allSelects[i];
      const tagName = await element.evaluate(el => el.tagName);
      const className = await element.evaluate(el => el.className);
      const textContent = await element.textContent();
      const innerHTML = await element.innerHTML();
      
      console.log(`Dropdown ${i}: ${tagName} | Class: ${className} | Text: ${textContent ? textContent.slice(0, 50) : 'No text'}`);
      
      // Check if this could be the income source dropdown
      if (textContent && (
        textContent.includes('income') || 
        textContent.includes('הכנס') || // Hebrew for income
        textContent.includes('source') ||
        textContent.includes('עובד') || // Hebrew for employee
        textContent.includes('Employee')
      )) {
        console.log(`🎯 Found potential income dropdown: Element ${i}`);
        
        // Try clicking it
        try {
          await element.click();
          await page.waitForTimeout(2000);
          
          // Look for options that appeared
          const options = await page.$$('option, li[data-value], div[role="option"], .MuiMenuItem-root');
          console.log(`Found ${options.length} options after clicking`);
          
          if (options.length > 0) {
            // Click the first option
            await options[0].click();
            await page.waitForTimeout(3000);
            
            // Check if components appeared
            const inputs = await page.$$('input, .MuiTextField-root');
            console.log(`Components after selection: ${inputs.length} input fields found`);
            
            await page.screenshot({ path: 'after_dropdown_selection.png', fullPage: true });
            
            if (inputs.length > 3) { // Expecting multiple income-related inputs
              console.log('✅ SUCCESS: Components rendered after dropdown selection!');
              return true;
            }
          }
        } catch (clickError) {
          console.log(`Failed to interact with dropdown ${i}: ${clickError.message}`);
        }
      }
    }
    
    // If we get here, try to find any form elements
    console.log('\n🔍 Looking for ANY form elements on the page...');
    const allInputs = await page.$$('input, select, textarea, button');
    console.log(`Total form elements found: ${allInputs.length}`);
    
    for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
      const element = allInputs[i];
      const tagName = await element.evaluate(el => el.tagName);
      const type = await element.evaluate(el => el.type || 'N/A');
      const name = await element.evaluate(el => el.name || 'N/A');
      const placeholder = await element.evaluate(el => el.placeholder || 'N/A');
      
      console.log(`Form element ${i}: ${tagName}[${type}] name="${name}" placeholder="${placeholder}"`);
    }
    
    return false;
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
    await page.screenshot({ path: 'test_error.png', fullPage: true });
    return false;
    
  } finally {
    await browser.close();
  }
}

// Run the test
quickCreditCalculatorTest().then(success => {
  if (success) {
    console.log('\n🎉 REGRESSION FIX VALIDATION: SUCCESS');
    console.log('✅ Income components are rendering after dropdown selection');
  } else {
    console.log('\n❌ REGRESSION FIX VALIDATION: FAILED');
    console.log('❌ Income components are NOT rendering after dropdown selection');
  }
  
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});