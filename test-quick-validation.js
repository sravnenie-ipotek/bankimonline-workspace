const { chromium } = require('playwright');

async function quickValidationTest() {
  console.log('🚀 QUICK VALIDATION TEST');
  console.log('======================\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  try {
    // Test 1: Check if frontend loads and Railway chip appears
    console.log('🧪 Test 1: Frontend loads with Railway warning');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);
    
    // Look for Railway text anywhere on page
    const railwayText = await page.locator('text=RAILWAY').count();
    const trainEmoji = await page.locator('text=🚂').count();
    
    console.log(`   - Railway text found: ${railwayText > 0 ? '✅' : '❌'}`);
    console.log(`   - Train emoji found: ${trainEmoji > 0 ? '✅' : '❌'}`);
    
    // Test 2: Check if step 1 page loads
    console.log('\n🧪 Test 2: Step 1 page loads');
    await page.goto('http://localhost:5173/services/borrowers-personal-data/1');
    await page.waitForTimeout(2000);
    
    // Look for any form elements
    const inputs = await page.locator('input').count();
    const dropdowns = await page.locator('[role="combobox"], [role="listbox"], select').count();
    const buttons = await page.locator('button').count();
    
    console.log(`   - Form inputs found: ${inputs}`);
    console.log(`   - Dropdowns found: ${dropdowns}`);
    console.log(`   - Buttons found: ${buttons}`);
    console.log(`   - Page loaded: ${inputs > 0 ? '✅' : '❌'}`);
    
    // Test 3: Check if step 2 page loads  
    console.log('\n🧪 Test 3: Step 2 page loads');
    await page.goto('http://localhost:5173/services/borrowers-personal-data/2');
    await page.waitForTimeout(2000);
    
    const step2Inputs = await page.locator('input').count();
    const step2Dropdowns = await page.locator('[role="combobox"], [role="listbox"], select').count();
    
    console.log(`   - Form inputs found: ${step2Inputs}`);
    console.log(`   - Dropdowns found: ${step2Dropdowns}`);
    console.log(`   - Page loaded: ${step2Inputs > 0 || step2Dropdowns > 0 ? '✅' : '❌'}`);
    
    // Test 4: API validation
    console.log('\n🧪 Test 4: API responds correctly');
    const response = await page.request.get('http://localhost:8003/api/v1/health');
    const healthData = await response.json();
    
    console.log(`   - Server status: ${healthData.status}`);
    console.log(`   - Database: ${healthData.database}`);
    console.log(`   - Railway DB: ${healthData.database === 'railway' ? '✅' : '❌'}`);
    
    // Test 5: Dropdown API validation
    console.log('\n🧪 Test 5: Dropdown API works');
    const dropdownResponse = await page.request.get('http://localhost:8003/api/dropdowns/other_borrowers_step2/he');
    const dropdownData = await dropdownResponse.json();
    
    const hasAdditionalIncome = !!dropdownData.options?.other_borrowers_step2_additional_income;
    const hasObligations = !!dropdownData.options?.other_borrowers_step2_obligations;
    
    console.log(`   - Additional income dropdown: ${hasAdditionalIncome ? '✅' : '❌'}`);
    console.log(`   - Obligations dropdown: ${hasObligations ? '✅' : '❌'}`);
    
    if (hasAdditionalIncome) {
      const noIncomeOption = dropdownData.options.other_borrowers_step2_additional_income
        .find(opt => opt.value === 'no_additional_income');
      console.log(`   - "No additional income" option exists: ${noIncomeOption ? '✅' : '❌'}`);
    }
    
    // Take a screenshot for manual verification
    await page.screenshot({ path: 'validation-screenshot.png' });
    console.log('\n📸 Screenshot saved as validation-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n✅ Quick validation completed!');
}

quickValidationTest().catch(console.error);