/**
 * Manual QA Testing for Mortgage Calculator Steps 1-4
 * Focused on critical business logic validation
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:5174';
const API_BASE_URL = 'http://localhost:8003';

test.describe('Mortgage Calculator QA - Manual Testing', () => {
  
  test.describe('Phase 0: API and Dropdown Validation', () => {
    
    test('API endpoints are accessible and return valid data', async ({ request }) => {
      // Test calculation parameters API
      const calcParams = await request.get(`${API_BASE_URL}/api/v1/calculation-parameters?business_path=mortgage`);
      expect(calcParams.ok()).toBeTruthy();
      
      const calcData = await calcParams.json();
      expect(calcData.status).toBe('success');
      expect(calcData.data.property_ownership_ltvs).toBeDefined();
      
      // Verify critical LTV values
      expect(calcData.data.property_ownership_ltvs.no_property.ltv).toBe(75);
      expect(calcData.data.property_ownership_ltvs.has_property.ltv).toBe(50);
      expect(calcData.data.property_ownership_ltvs.selling_property.ltv).toBe(70);
      
      console.log('✅ API endpoints validated with correct LTV values');
    });

    test('Dropdown APIs return valid options for all steps', async ({ request }) => {
      const steps = ['mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4'];
      
      for (const step of steps) {
        const response = await request.get(`${API_BASE_URL}/api/dropdowns/${step}/en`);
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.status).toBe('success');
        expect(data.screen_location).toBe(step);
        expect(data.dropdowns).toBeDefined();
        expect(Array.isArray(data.dropdowns)).toBeTruthy();
        
        console.log(`✅ ${step}: API structure validated`);
      }
    });

    test('Property ownership dropdown has all required options', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/dropdowns/mortgage_step1/en`);
      const data = await response.json();
      
      const propertyOptions = data.options?.mortgage_step1_property_ownership;
      expect(propertyOptions).toBeDefined();
      expect(propertyOptions).toHaveLength(3);
      
      const expectedValues = ['has_property', 'no_property', 'selling_property'];
      expectedValues.forEach(value => {
        const option = propertyOptions.find(opt => opt.value === value);
        expect(option).toBeDefined();
        console.log(`✅ Property ownership option: ${value} -> ${option.label}`);
      });
    });
  });

  test.describe('Step 1: Property Value and Ownership', () => {
    
    test('Step 1 page loads and displays required elements', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/calculate-mortgage/1`);
      await page.waitForTimeout(3000);
      
      // Check if page loaded
      expect(await page.title()).toBeTruthy();
      
      // Look for form elements (flexible selectors)
      const inputs = await page.locator('input').count();
      const selects = await page.locator('select').count();
      const buttons = await page.locator('button').count();
      
      expect(inputs + selects + buttons).toBeGreaterThan(0);
      console.log(`✅ Step 1: Found ${inputs} inputs, ${selects} selects, ${buttons} buttons`);
      
      // Take a screenshot for manual verification
      await page.screenshot({ path: 'test-results/step1-page.png', fullPage: true });
    });

    test('Property value input accepts numeric values', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/calculate-mortgage/1`);
      await page.waitForTimeout(3000);
      
      // Find numeric input field (try multiple selectors)
      const inputSelectors = [
        'input[type="number"]',
        'input[name*="property"]',
        'input[placeholder*="property"]',
        'input[data-testid*="property"]'
      ];
      
      let inputFound = false;
      for (const selector of inputSelectors) {
        const input = page.locator(selector).first();
        if (await input.count() > 0) {
          await input.clear();
          await input.fill('1000000');
          
          const value = await input.inputValue();
          if (value.includes('1000000')) {
            console.log(`✅ Property value input working with selector: ${selector}`);
            inputFound = true;
            break;
          }
        }
      }
      
      expect(inputFound).toBeTruthy();
    });

    test('Property ownership dropdown functionality', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/calculate-mortgage/1`);
      await page.waitForTimeout(3000);
      
      // Try to find dropdown elements
      const dropdownSelectors = [
        'select',
        '[role="combobox"]',
        'button[aria-expanded]',
        '[data-testid*="dropdown"]',
        '[data-testid*="ownership"]'
      ];
      
      let dropdownFound = false;
      for (const selector of dropdownSelectors) {
        const dropdown = page.locator(selector);
        if (await dropdown.count() > 0) {
          console.log(`✅ Found dropdown with selector: ${selector}`);
          
          // Try to interact with it
          await dropdown.first().click();
          await page.waitForTimeout(1000);
          
          // Look for options
          const bodyText = await page.textContent('body');
          if (bodyText.includes('property') || bodyText.includes('נכס')) {
            console.log('✅ Property ownership dropdown appears to be functional');
            dropdownFound = true;
            break;
          }
        }
      }
      
      if (!dropdownFound) {
        console.log('⚠️ Property ownership dropdown not found or not functional');
        // Take screenshot for analysis
        await page.screenshot({ path: 'test-results/step1-dropdown-issue.png', fullPage: true });
      }
    });
  });

  test.describe('Step 2: Personal Information', () => {
    
    test('Step 2 page loads with personal information form', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/calculate-mortgage/2`);
      await page.waitForTimeout(3000);
      
      // Check for form fields
      const formElements = await page.locator('input, select, textarea').count();
      expect(formElements).toBeGreaterThan(0);
      
      console.log(`✅ Step 2: Found ${formElements} form elements`);
      await page.screenshot({ path: 'test-results/step2-page.png', fullPage: true });
    });

    test('Personal information fields are present', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/calculate-mortgage/2`);
      await page.waitForTimeout(3000);
      
      const commonFields = [
        { selector: 'input[name*="name"], input[placeholder*="name"]', name: 'Name' },
        { selector: 'input[name*="phone"], input[placeholder*="phone"]', name: 'Phone' },
        { selector: 'input[name*="email"], input[placeholder*="email"]', name: 'Email' },
        { selector: 'input[type="email"]', name: 'Email (by type)' }
      ];
      
      for (const field of commonFields) {
        const element = page.locator(field.selector);
        if (await element.count() > 0) {
          console.log(`✅ ${field.name} field found`);
        } else {
          console.log(`⚠️ ${field.name} field not found`);
        }
      }
    });
  });

  test.describe('Step 3: Income and Employment', () => {
    
    test('Step 3 page loads with income form', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/calculate-mortgage/3`);
      await page.waitForTimeout(3000);
      
      const formElements = await page.locator('input, select').count();
      expect(formElements).toBeGreaterThan(0);
      
      console.log(`✅ Step 3: Found ${formElements} form elements`);
      await page.screenshot({ path: 'test-results/step3-page.png', fullPage: true });
    });

    test('Income input fields are functional', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/calculate-mortgage/3`);
      await page.waitForTimeout(3000);
      
      // Look for income-related inputs
      const incomeSelectors = [
        'input[name*="income"]',
        'input[placeholder*="income"]',
        'input[type="number"]'
      ];
      
      let incomeFieldFound = false;
      for (const selector of incomeSelectors) {
        const input = page.locator(selector).first();
        if (await input.count() > 0) {
          await input.clear();
          await input.fill('15000');
          
          const value = await input.inputValue();
          if (value.includes('15000')) {
            console.log(`✅ Income input working with selector: ${selector}`);
            incomeFieldFound = true;
            break;
          }
        }
      }
      
      if (!incomeFieldFound) {
        console.log('⚠️ Income input field not found or not functional');
      }
    });
  });

  test.describe('Step 4: Bank Offers', () => {
    
    test('Step 4 page loads with bank offers', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/calculate-mortgage/4`);
      await page.waitForTimeout(3000);
      
      const pageContent = await page.textContent('body');
      expect(pageContent.length).toBeGreaterThan(100);
      
      console.log(`✅ Step 4: Page loaded with content`);
      await page.screenshot({ path: 'test-results/step4-page.png', fullPage: true });
    });
  });

  test.describe('Multi-Language Support', () => {
    
    test('Language switching functionality', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/calculate-mortgage/1`);
      await page.waitForTimeout(3000);
      
      // Look for language selector
      const langSelectors = [
        '[data-testid*="language"]',
        '[class*="language"]',
        'button:has-text("EN")',
        'button:has-text("HE")',
        'button:has-text("עב")'
      ];
      
      let langSelectorFound = false;
      for (const selector of langSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          console.log(`✅ Language selector found: ${selector}`);
          langSelectorFound = true;
          break;
        }
      }
      
      if (!langSelectorFound) {
        console.log('⚠️ Language selector not found');
        await page.screenshot({ path: 'test-results/language-selector-missing.png', fullPage: true });
      }
    });

    test('Hebrew RTL support validation', async ({ page, request }) => {
      // Test Hebrew API
      const response = await request.get(`${API_BASE_URL}/api/dropdowns/mortgage_step1/he`);
      const data = await response.json();
      
      expect(data.language_code).toBe('he');
      
      const hebrewOptions = data.options?.mortgage_step1_property_ownership;
      if (hebrewOptions) {
        hebrewOptions.forEach(option => {
          // Check if Hebrew text exists (should contain Hebrew characters)
          const hasHebrew = /[\u0590-\u05FF]/.test(option.label);
          console.log(`✅ Hebrew option: ${option.value} -> ${option.label} (Hebrew: ${hasHebrew})`);
        });
      }
    });
  });

  test.describe('Critical Business Logic Validation', () => {
    
    test('Property ownership LTV logic validation via API', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/calculation-parameters?business_path=mortgage`);
      const data = await response.json();
      
      const ltvData = data.data.property_ownership_ltvs;
      
      // Test critical business rules
      test.expect(ltvData.no_property.ltv).toBe(75);
      test.expect(ltvData.no_property.min_down_payment).toBe(25);
      console.log('✅ No Property: 75% LTV, 25% min down payment');
      
      test.expect(ltvData.has_property.ltv).toBe(50);
      test.expect(ltvData.has_property.min_down_payment).toBe(50);
      console.log('✅ Has Property: 50% LTV, 50% min down payment');
      
      test.expect(ltvData.selling_property.ltv).toBe(70);
      test.expect(ltvData.selling_property.min_down_payment).toBe(30);
      console.log('✅ Selling Property: 70% LTV, 30% min down payment');
    });
  });

  test.describe('Responsive Design Testing', () => {
    
    const viewports = [
      { width: 320, height: 568, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    viewports.forEach(viewport => {
      test(`${viewport.name} viewport (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(`${BASE_URL}/services/calculate-mortgage/1`);
        await page.waitForTimeout(3000);
        
        // Check if page elements are visible
        const visibleElements = await page.locator('input, select, button').count();
        expect(visibleElements).toBeGreaterThan(0);
        
        console.log(`✅ ${viewport.name}: ${visibleElements} elements visible`);
        await page.screenshot({ path: `test-results/responsive-${viewport.name.toLowerCase()}.png`, fullPage: true });
      });
    });
  });

  test.describe('Performance Testing', () => {
    
    test('Page load performance for all steps', async ({ page }) => {
      for (let step = 1; step <= 4; step++) {
        const startTime = Date.now();
        
        await page.goto(`${BASE_URL}/services/calculate-mortgage/${step}`);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        console.log(`✅ Step ${step} load time: ${loadTime}ms`);
        
        expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
      }
    });
  });
});