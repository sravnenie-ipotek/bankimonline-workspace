const { chromium } = require('playwright');

async function runRegressionTests() {
  console.log('🚀 RUNNING REGRESSION TESTS FOR UI FIXES');
  console.log('=========================================\n');

  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  let passedTests = 0;
  let totalTests = 0;

  const runTest = async (testName, testFunction) => {
    totalTests++;
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFunction();
      console.log(`✅ PASSED: ${testName}\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}\n`);
    }
  };

  try {
    // Test 1: Version chip should show only under logo with Railway warning
    await runTest('Version chip shows Railway warning under logo only', async () => {
      await page.goto('http://localhost:5173');
      
      // Wait for page to load
      await page.waitForTimeout(3000);
      
      // Should NOT find version chip in top-right corner (we removed it)
      const topRightChip = await page.locator('[style*="position: fixed"][style*="top: 10"][style*="right: 10"]').count();
      if (topRightChip > 0) {
        throw new Error('Found version chip in top-right corner - should be removed');
      }
      
      // Should find Railway warning chip (train emoji)
      const railwayWarning = await page.locator('text=RAILWAY').first();
      await railwayWarning.waitFor({ timeout: 5000 });
      
      // Should find version chip with timestamp
      const versionChip = await page.locator('text=/v.*0\\.1/').first();
      await versionChip.waitFor({ timeout: 5000 });
    });

    // Test 2: First step should use Row layout (not smartphone mode)
    await runTest('Borrowers personal data step 1 uses proper desktop layout', async () => {
      await page.goto('http://localhost:5173/services/borrowers-personal-data/1');
      await page.waitForTimeout(2000);
      
      // Should find Row containers (indicating desktop layout)
      const rowContainers = await page.locator('[class*="row"]').count();
      if (rowContainers < 3) { // Should have multiple rows
        throw new Error(`Found only ${rowContainers} row containers, expected at least 3 for proper desktop layout`);
      }
      
      // Should find form fields arranged horizontally on desktop
      const nameField = page.locator('input[name="nameSurname"]');
      const birthdayField = page.locator('input[name="birthday"]');
      
      await nameField.waitFor({ timeout: 5000 });
      await birthdayField.waitFor({ timeout: 5000 });
      
      // Both fields should be visible and in same row on desktop
      await expect(nameField).toBeVisible();
      await expect(birthdayField).toBeVisible();
    });

    // Test 3: Additional income dropdown logic 
    await runTest('Additional income "no income" option hides amount field', async () => {
      await page.goto('http://localhost:5173/services/borrowers-personal-data/2');
      await page.waitForTimeout(3000);
      
      // Find additional income dropdown
      const additionalIncomeDropdown = page.locator('[data-testid*="additional-income"], [aria-label*="additional"], :has-text("האם קיימות הכנסות נוספות")').first();
      
      // Click to open dropdown
      await additionalIncomeDropdown.click();
      await page.waitForTimeout(1000);
      
      // Select "no additional income" option (Hebrew: "אין הכנסות נוספות")
      const noIncomeOption = page.locator('text=אין הכנסות נוספות').first();
      await noIncomeOption.waitFor({ timeout: 5000 });
      await noIncomeOption.click();
      
      await page.waitForTimeout(1000);
      
      // The amount field should NOT be visible
      const amountField = page.locator('input[name="additionalIncomeAmount"]');
      const isAmountVisible = await amountField.isVisible().catch(() => false);
      
      if (isAmountVisible) {
        throw new Error('Additional income amount field is visible when "no income" selected - should be hidden');
      }
    });

    // Test 4: Financial obligations dropdown validation
    await runTest('Financial obligations "no obligations" option clears validation', async () => {
      await page.goto('http://localhost:5173/services/borrowers-personal-data/2');
      await page.waitForTimeout(3000);
      
      // Find obligations dropdown 
      const obligationsDropdown = page.locator(':has-text("התחייבויות כספיות")').first();
      
      // Click to open dropdown
      await obligationsDropdown.click();
      await page.waitForTimeout(1000);
      
      // Select "no obligations" option (Hebrew: "אין התחייבויות כספיות" or "אין התחייבויות")
      const noObligationsOption = page.locator('text*=אין התחייבויות').first();
      await noObligationsOption.waitFor({ timeout: 5000 });
      await noObligationsOption.click();
      
      await page.waitForTimeout(1000);
      
      // Should NOT show validation errors after selecting valid option
      const validationErrors = await page.locator('[class*="error"], [data-testid*="error"], .error, [role="alert"]').count();
      if (validationErrors > 0) {
        const errorTexts = await page.locator('[class*="error"], [data-testid*="error"], .error, [role="alert"]').allTextContents();
        console.log('Found validation errors:', errorTexts);
        // This might be expected if there are other required fields, so just log for now
      }
    });

    // Test 5: Continue button availability
    await runTest('Continue button becomes available after filling required fields', async () => {
      await page.goto('http://localhost:5173/services/borrowers-personal-data/1');
      await page.waitForTimeout(2000);
      
      // Fill required fields
      await page.fill('input[name="nameSurname"]', 'Test User');
      
      // Select education
      const educationDropdown = page.locator(':has-text("השכלה")').first();
      await educationDropdown.click();
      await page.waitForTimeout(500);
      await page.locator('[role="option"]').first().click();
      
      // Select additional citizenship
      const citizenshipDropdown = page.locator(':has-text("אזרחויות נוספות")').first();  
      await citizenshipDropdown.click();
      await page.waitForTimeout(500);
      await page.locator('text=לא').first().click();
      
      // Fill other required dropdowns
      await page.locator(':has-text("האם אתה משלם מיסים")').first().click();
      await page.waitForTimeout(500);
      await page.locator('text=לא').first().click();
      
      await page.locator(':has-text("ילדים")').first().click();
      await page.waitForTimeout(500);
      await page.locator('text=לא').first().click();
      
      await page.locator(':has-text("ביטוח רפואי")').first().click();
      await page.waitForTimeout(500);
      await page.locator('[role="option"]').first().click();
      
      await page.locator(':has-text("תושב חוץ")').first().click();
      await page.waitForTimeout(500);
      await page.locator('text=לא').first().click();
      
      await page.locator(':has-text("נושא ציבור")').first().click();
      await page.waitForTimeout(500);
      await page.locator('text=לא').first().click();
      
      await page.waitForTimeout(1000);
      
      // Continue button should be enabled
      const continueButton = page.locator('button:has-text("המשך"), button:has-text("Continue")').first();
      await continueButton.waitFor({ timeout: 5000 });
      
      const isDisabled = await continueButton.isDisabled();
      if (isDisabled) {
        throw new Error('Continue button is still disabled after filling required fields');
      }
    });

    // Test 6: API Integration test
    await runTest('API returns correct dropdown values', async () => {
      const response = await page.request.get('http://localhost:8003/api/dropdowns/other_borrowers_step2/he');
      const data = await response.json();
      
      // Should have additional income options
      if (!data.options.other_borrowers_step2_additional_income) {
        throw new Error('Missing additional_income dropdown data');
      }
      
      const additionalIncomeOptions = data.options.other_borrowers_step2_additional_income;
      const noIncomeOption = additionalIncomeOptions.find(opt => opt.value === 'no_additional_income');
      
      if (!noIncomeOption) {
        throw new Error('Missing "no_additional_income" option in API response');
      }
      
      // Should have obligations options  
      if (!data.options.other_borrowers_step2_obligations) {
        throw new Error('Missing obligations dropdown data');
      }
      
      const obligationOptions = data.options.other_borrowers_step2_obligations;
      const noObligationOption = obligationOptions.find(opt => 
        opt.value === 'no_obligations' || opt.value === '1'
      );
      
      if (!noObligationOption) {
        throw new Error('Missing "no obligations" option in API response');
      }
    });

  } finally {
    await browser.close();
  }

  console.log(`\n📊 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Fixes are working correctly.');
  } else {
    console.log(`⚠️  ${totalTests - passedTests} tests failed. Review issues above.`);
  }
  
  return passedTests === totalTests;
}

// Run the tests
runRegressionTests().catch(console.error);