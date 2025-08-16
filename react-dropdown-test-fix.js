const { chromium } = require('playwright');

/**
 * React Dropdown Component Test Fix
 * 
 * This demonstrates how to properly interact with custom React dropdown components
 * that don't use standard HTML <select> elements.
 */

class ReactDropdownTester {
  
  async testPropertyOwnershipDropdown(page) {
    console.log('🔧 Testing Property Ownership with React Component approach...');
    
    try {
      // Navigate to mortgage calculator step 1
      await page.goto('http://localhost:5173/services/calculate-mortgage/1');
      await page.waitForLoadState('networkidle');
      
      // Method 1: Using data-testid (if available)
      const dropdownByTestId = page.locator('[data-testid="property-ownership-dropdown"]');
      if (await dropdownByTestId.count() > 0) {
        console.log('✅ Found dropdown by data-testid');
        
        // Click to open the dropdown
        await dropdownByTestId.click();
        
        // Wait for dropdown options to appear
        await page.waitForTimeout(500);
        
        // Select an option by clicking on it
        // Options are usually in a portal or dropdown menu
        const option = page.locator('text="I don\'t own any property"').first();
        if (await option.isVisible()) {
          await option.click();
          console.log('✅ Selected property ownership option');
        }
      }
      
      // Method 2: Using component structure
      // React dropdowns often have a trigger element and a menu
      const dropdownTrigger = page.locator('.dropdown-trigger, [role="combobox"], .custom-select__control').first();
      if (await dropdownTrigger.count() > 0) {
        console.log('✅ Found dropdown trigger element');
        
        // Click to open
        await dropdownTrigger.click();
        
        // Look for menu items
        const menuItems = page.locator('.dropdown-menu-item, [role="option"], .custom-select__option');
        const itemCount = await menuItems.count();
        console.log(`Found ${itemCount} dropdown options`);
        
        // Select first option as example
        if (itemCount > 0) {
          await menuItems.first().click();
          console.log('✅ Selected dropdown option');
        }
      }
      
      // Method 3: Using Formik field names (common in React forms)
      const formikDropdown = page.locator('[name="propertyOwnership"]');
      if (await formikDropdown.count() > 0) {
        console.log('✅ Found Formik-managed dropdown');
        
        // For Formik dropdowns, we might need to:
        // 1. Click the field
        await formikDropdown.click();
        
        // 2. Wait for options
        await page.waitForTimeout(300);
        
        // 3. Type to search (if searchable)
        await formikDropdown.type('property');
        
        // 4. Press Enter or click result
        await page.keyboard.press('Enter');
      }
      
      // Method 4: Using ARIA attributes (accessibility-focused components)
      const ariaDropdown = page.locator('[aria-haspopup="listbox"], [aria-expanded]').first();
      if (await ariaDropdown.count() > 0) {
        console.log('✅ Found ARIA-compliant dropdown');
        
        // Open dropdown
        await ariaDropdown.click();
        
        // Select from listbox
        const listOptions = page.locator('[role="option"]');
        if (await listOptions.count() > 0) {
          await listOptions.nth(1).click(); // Select second option
          console.log('✅ Selected ARIA option');
        }
      }
      
    } catch (error) {
      console.error('❌ Error testing React dropdown:', error);
    }
  }
  
  async testAllDropdownApproaches() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Test the property ownership dropdown with all methods
      await this.testPropertyOwnershipDropdown(page);
      
      // Additional debugging: log the actual HTML structure
      console.log('\n📋 Analyzing dropdown HTML structure...');
      
      // Get all elements that might be dropdowns
      const possibleDropdowns = await page.locator('select, [role="combobox"], .dropdown, .custom-select, [data-testid*="dropdown"]').all();
      
      console.log(`Found ${possibleDropdowns.length} potential dropdown elements`);
      
      for (let i = 0; i < Math.min(possibleDropdowns.length, 3); i++) {
        const element = possibleDropdowns[i];
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.evaluate(el => el.className);
        const testId = await element.getAttribute('data-testid');
        
        console.log(`Dropdown ${i + 1}:`);
        console.log(`  Tag: ${tagName}`);
        console.log(`  Class: ${className}`);
        console.log(`  TestId: ${testId || 'none'}`);
      }
      
      // Check if it's using Material-UI, Ant Design, or other libraries
      const muiSelects = await page.locator('.MuiSelect-root, .MuiAutocomplete-root').count();
      const antSelects = await page.locator('.ant-select, .ant-dropdown').count();
      const reactSelectCount = await page.locator('.react-select__control').count();
      
      console.log('\n📊 Component Library Detection:');
      console.log(`  Material-UI: ${muiSelects} components`);
      console.log(`  Ant Design: ${antSelects} components`);
      console.log(`  React-Select: ${reactSelectCount} components`);
      
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      await browser.close();
    }
  }
}

// Run the test
const tester = new ReactDropdownTester();
tester.testAllDropdownApproaches().then(() => {
  console.log('\n✅ React dropdown testing approach completed');
}).catch(error => {
  console.error('❌ Test execution failed:', error);
});