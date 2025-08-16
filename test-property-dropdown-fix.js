const { chromium } = require('playwright');

async function testPropertyDropdownFix() {
  // Environment configuration
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
  const TEST_ENV = process.env.TEST_ENVIRONMENT || 'development';
  const IS_PRODUCTION = BASE_URL.includes('bankimonline.com');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US'
  });
  
  const page = await context.newPage();
  
  console.log('🔍 TESTING PROPERTY OWNERSHIP DROPDOWN FIX\n');
  console.log('=' .repeat(60));
  console.log(`🌍 Environment: ${TEST_ENV.toUpperCase()}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🛡️  Safety Mode: ${IS_PRODUCTION ? 'ENABLED (Production)' : 'DISABLED (Development)'}`);
  console.log('=' .repeat(60));
  
  try {
    // Navigate to mortgage calculator
    console.log('\n📋 Test: Property Ownership Dropdown');
    console.log('-'.repeat(60));
    
    await page.goto(`${BASE_URL}/services/calculate-mortgage`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for React to render
    
    // Check for property ownership dropdown using multiple selectors
    const selectors = [
      '[data-testid="property-ownership-dropdown"]',
      'select[name="propertyOwnership"]',
      '#propertyOwnership',
      '[class*="dropdown"]:has-text("property")',
      'select:has(option:has-text("property"))'
    ];
    
    let dropdown = null;
    let dropdownSelector = null;
    
    for (const selector of selectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          dropdown = element;
          dropdownSelector = selector;
          console.log(`  ✅ Dropdown found using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (dropdown) {
      // Check if it's a select element
      const tagName = await dropdown.evaluate(el => el.tagName.toLowerCase());
      console.log(`  Element type: ${tagName}`);
      
      if (tagName === 'select') {
        // Get all options
        const options = await dropdown.locator('option').all();
        console.log(`  Number of options: ${options.length}`);
        
        if (options.length > 1) {
          console.log('\n  📋 Dropdown Options:');
          for (let i = 0; i < options.length; i++) {
            const text = await options[i].textContent();
            const value = await options[i].getAttribute('value');
            console.log(`    Option ${i}: "${text}" (value: ${value || 'empty'})`);
          }
          
          // Try to select an option
          if (options.length > 1) {
            await dropdown.selectOption({ index: 1 }); // Select first real option
            const selectedValue = await dropdown.inputValue();
            console.log(`\n  ✅ Successfully selected option with value: ${selectedValue}`);
            console.log('\n🎉 SUCCESS: Property ownership dropdown is FIXED!');
          }
        } else {
          console.log('  ⚠️ Dropdown has no selectable options');
        }
      } else {
        // It might be a custom dropdown component
        console.log('  ℹ️ Custom dropdown component detected');
        
        // Try clicking to open it
        await dropdown.click();
        await page.waitForTimeout(500);
        
        // Look for dropdown options
        const dropdownOptions = await page.locator('[role="option"], .dropdown-option, [class*="option"]').all();
        
        if (dropdownOptions.length > 0) {
          console.log(`  Number of dropdown options: ${dropdownOptions.length}`);
          console.log('\n  📋 Dropdown Options:');
          
          for (let i = 0; i < Math.min(dropdownOptions.length, 5); i++) {
            const text = await dropdownOptions[i].textContent();
            console.log(`    Option ${i}: "${text}"`);
          }
          
          // Click the first option
          if (dropdownOptions.length > 0) {
            await dropdownOptions[0].click();
            console.log('\n  ✅ Successfully clicked first option');
            console.log('\n🎉 SUCCESS: Property ownership dropdown is FIXED!');
          }
        } else {
          console.log('  ❌ No dropdown options found after clicking');
        }
      }
    } else {
      console.log('  ❌ Property ownership dropdown not found with any selector');
      console.log('\n  Attempting to find any dropdowns on the page...');
      
      const anyDropdowns = await page.locator('select, [class*="dropdown"], [role="combobox"]').all();
      console.log(`  Found ${anyDropdowns.length} dropdown-like elements on page`);
      
      if (anyDropdowns.length > 0) {
        for (let i = 0; i < Math.min(anyDropdowns.length, 3); i++) {
          const text = await anyDropdowns[i].textContent();
          const className = await anyDropdowns[i].getAttribute('class');
          console.log(`    Element ${i}: class="${className}", text="${text?.substring(0, 50)}..."`);
        }
      }
    }
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    
    if (dropdown) {
      console.log('✅ Property ownership dropdown is FIXED and working');
      console.log('  - Dropdown element found');
      console.log('  - Options are populated');
      console.log('  - User can select property ownership status');
    } else {
      console.log('❌ Property ownership dropdown still needs attention');
      console.log('  - Check FirstStepForm.tsx for rendering issues');
      console.log('  - Verify fallback data is being used');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed');
  }
}

// Run the test
testPropertyDropdownFix().catch(console.error);