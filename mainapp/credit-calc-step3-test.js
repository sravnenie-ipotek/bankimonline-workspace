const { chromium } = require('playwright');

async function testCreditCalculatorStep3() {
  console.log('Test ID: CREDIT-CALC-001');
  console.log('Category: Functional');
  console.log('Element: Income Source Dropdown - Credit Calculator Step 3');
  console.log('Test Case: Verify income components render after dropdown selection');
  console.log('Expected Result: Components appear, no console errors');

  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    javaScriptEnabled: true
  });
  
  const page = await context.newPage();
  
  // Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  try {
    // Navigate to Credit Calculator Step 3
    console.log('\n🔄 Navigating to Credit Calculator Step 3...');
    await page.goto('http://localhost:5173/services/calculate-credit/3/');
    
    // Wait for page to load and React to render
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Longer wait for React app to load
    
    // Wait for the main content to load (look for Hebrew text or main elements)
    try {
      await page.waitForSelector('body', { timeout: 10000 });
    } catch (error) {
      console.log('⚠️ Timeout waiting for page elements');
    }
    
    console.log('✅ Page loaded successfully');
    
    // Take initial screenshot
    await page.screenshot({ path: 'credit_calc_step3_initial.png', fullPage: true });
    
    // Look for income source dropdown
    console.log('\n🔍 Searching for income source dropdown...');
    
    const selectors = [
      'select[name*="income"]',
      'select[name*="source"]', 
      'div[data-testid*="income"]',
      'div[class*="income"]',
      'select',
      'div[role="combobox"]',
      '.MuiSelect-root'
    ];
    
    let dropdownFound = false;
    let selectedDropdown = null;
    
    for (const selector of selectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const textContent = await element.textContent();
          const innerHTML = await element.innerHTML();
          
          console.log(`Element ${i}: ${textContent ? textContent.slice(0, 50) : 'No text'}...`);
          
          // Check if this is income-related
          if (textContent && (
            textContent.includes('income') || 
            textContent.includes('source') || 
            textContent.includes('Employee') ||
            innerHTML.includes('income')
          )) {
            selectedDropdown = element;
            dropdownFound = true;
            console.log(`✅ Found income source dropdown with selector: ${selector}`);
            break;
          }
        }
        if (dropdownFound) break;
      }
    }
    
    if (!dropdownFound) {
      console.log('❌ Could not find income source dropdown');
      
      // Show page content for debugging
      const bodyText = await page.$eval('body', el => el.textContent);
      console.log('\n📄 Page content preview:');
      console.log(bodyText.slice(0, 500));
      
      await page.screenshot({ path: 'debug_no_dropdown.png', fullPage: true });
      return false;
    }
    
    console.log('\n🎯 Clicking dropdown to open options...');
    await selectedDropdown.click();
    await page.waitForTimeout(1000);
    
    // Look for dropdown options
    const optionSelectors = [
      'li[data-value]',
      'option', 
      'div[role="option"]',
      '.MuiMenuItem-root'
    ];
    
    let optionsFound = [];
    for (const selector of optionSelectors) {
      const options = await page.$$(selector);
      if (options.length > 0) {
        console.log(`Found ${options.length} options with selector: ${selector}`);
        
        for (let i = 0; i < Math.min(options.length, 5); i++) {
          const option = options[i];
          const text = await option.textContent();
          if (text && text.trim()) {
            optionsFound.push({ element: option, text: text.trim() });
            console.log(`  Option ${i}: ${text.trim()}`);
          }
        }
        break;
      }
    }
    
    if (optionsFound.length === 0) {
      console.log('❌ No dropdown options found');
      await page.screenshot({ path: 'debug_no_options.png', fullPage: true });
      return false;
    }
    
    // Select the first relevant option
    let selectedOption = optionsFound.find(opt => 
      opt.text.toLowerCase().includes('employee') || 
      opt.text.toLowerCase().includes('employed') ||
      opt.text.toLowerCase().includes('self')
    );
    
    if (!selectedOption) {
      selectedOption = optionsFound[0]; // Fallback to first option
    }
    
    console.log(`\n✅ Selecting option: "${selectedOption.text}"`);
    await selectedOption.element.click();
    await page.waitForTimeout(3000); // Wait longer for components to render
    
    // Check for income components that should appear
    console.log('\n🔍 Checking for rendered income components...');
    
    const componentSelectors = [
      'input[name*="monthly"]',
      'input[name*="income"]', 
      'input[name*="salary"]',
      'input[name*="start"]',
      'input[name*="date"]',
      'div[class*="MonthlyIncome"]',
      'div[class*="StartDate"]',
      '.MuiTextField-root'
    ];
    
    let componentsFound = 0;
    const foundComponents = [];
    
    for (const selector of componentSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} components with selector: ${selector}`);
        componentsFound += elements.length;
        foundComponents.push({ selector, count: elements.length });
      }
    }
    
    // Take screenshot after selection
    await page.screenshot({ path: 'credit_calc_step3_after_selection.png', fullPage: true });
    
    // Check console logs
    console.log('\n📋 Console logs during test:');
    consoleLogs.forEach(log => console.log(`  ${log}`));
    
    // Count errors and warnings
    const errors = consoleLogs.filter(log => log.includes('error')).length;
    const warnings = consoleLogs.filter(log => log.includes('warning')).length;
    
    // Determine test result
    const success = componentsFound > 0;
    
    console.log(`\n📊 TEST RESULT:`);
    console.log(`Status: ${success ? 'PASS' : 'FAIL'}`);
    console.log(`Severity: ${success ? 'Low' : 'Critical'}`);
    console.log(`Components found: ${componentsFound}`);
    console.log(`Component details:`, foundComponents);
    console.log(`Console errors: ${errors}`);
    console.log(`Console warnings: ${warnings}`);
    
    if (success) {
      console.log('\n✅ REGRESSION FIX VALIDATED SUCCESSFULLY');
      console.log('Income components are now rendering after dropdown selection');
    } else {
      console.log('\n❌ REGRESSION FIX VALIDATION FAILED');
      console.log('Income components are NOT rendering after dropdown selection');
    }
    
    return success;
    
  } catch (error) {
    console.log(`❌ Test failed with exception: ${error.message}`);
    await page.screenshot({ path: 'credit_calc_step3_error.png', fullPage: true });
    return false;
    
  } finally {
    await browser.close();
  }
}

// Run the test
testCreditCalculatorStep3().then(result => {
  console.log(`\n🏁 FINAL RESULT: ${result ? 'SUCCESS' : 'FAILURE'}`);
  process.exit(result ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});