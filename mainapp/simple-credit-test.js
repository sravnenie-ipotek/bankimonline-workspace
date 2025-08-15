const { chromium } = require('playwright');

async function quickCreditCalculatorTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => }`));
  page.on('pageerror', error => );
  
  try {
    // Navigate to the page
    await page.goto('http://localhost:5173/services/calculate-credit/3/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for React to load - look for specific elements
    // Wait for either the form or an error message
    try {
      await page.waitForFunction(() => {
        const body = document.body.textContent || '';
        return !body.includes('You need to enable JavaScript') && body.length > 100;
      }, { timeout: 15000 });
      
      } catch (error) {
      await page.screenshot({ path: 'react_load_failed.png', fullPage: true });
      return false;
    }
    
    // Take a full page screenshot to see what we have
    await page.screenshot({ path: 'credit_calc_full_page.png', fullPage: true });
    
    // Look for any dropdowns on the page
    const allSelects = await page.$$('select, div[role="combobox"], .MuiSelect-root, div[class*="dropdown"], div[class*="select"]');
    for (let i = 0; i < allSelects.length; i++) {
      const element = allSelects[i];
      const tagName = await element.evaluate(el => el.tagName);
      const className = await element.evaluate(el => el.className);
      const textContent = await element.textContent();
      const innerHTML = await element.innerHTML();
      
      : 'No text'}`);
      
      // Check if this could be the income source dropdown
      if (textContent && (
        textContent.includes('income') || 
        textContent.includes('הכנס') || // Hebrew for income
        textContent.includes('source') ||
        textContent.includes('עובד') || // Hebrew for employee
        textContent.includes('Employee')
      )) {
        // Try clicking it
        try {
          await element.click();
          await page.waitForTimeout(2000);
          
          // Look for options that appeared
          const options = await page.$$('option, li[data-value], div[role="option"], .MuiMenuItem-root');
          if (options.length > 0) {
            // Click the first option
            await options[0].click();
            await page.waitForTimeout(3000);
            
            // Check if components appeared
            const inputs = await page.$$('input, .MuiTextField-root');
            await page.screenshot({ path: 'after_dropdown_selection.png', fullPage: true });
            
            if (inputs.length > 3) { // Expecting multiple income-related inputs
              return true;
            }
          }
        } catch (clickError) {
          }
      }
    }
    
    // If we get here, try to find any form elements
    const allInputs = await page.$$('input, select, textarea, button');
    for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
      const element = allInputs[i];
      const tagName = await element.evaluate(el => el.tagName);
      const type = await element.evaluate(el => el.type || 'N/A');
      const name = await element.evaluate(el => el.name || 'N/A');
      const placeholder = await element.evaluate(el => el.placeholder || 'N/A');
      
      }
    
    return false;
    
  } catch (error) {
    await page.screenshot({ path: 'test_error.png', fullPage: true });
    return false;
    
  } finally {
    await browser.close();
  }
}

// Run the test
quickCreditCalculatorTest().then(success => {
  if (success) {
    } else {
    }
  
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});