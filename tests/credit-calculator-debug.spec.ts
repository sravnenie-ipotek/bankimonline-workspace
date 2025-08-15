import { test, expect } from '@playwright/test';

test.describe('Credit Calculator Step 3 Investigation', () => {
  test('investigate step 3 form issues', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => , msg.text()));
    
    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('api')) {
        , request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('api')) {
        , response.url());
      }
    });
    
    // Navigate to the credit calculator step 3
    await page.goto('http://localhost:5174/services/calculate-credit/3');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'step3-initial.png', fullPage: true });
    
    // Check form elements
    // Look for dropdowns
    const dropdowns = await page.locator('select, [role="combobox"], .dropdown').all();
    for (let i = 0; i < dropdowns.length; i++) {
      const dropdown = dropdowns[i];
      const text = await dropdown.textContent();
      const value = await dropdown.getAttribute('value');
      }
    
    // Check for error messages
    const errors = await page.locator('.error, [class*="error"], .invalid').all();
    for (let i = 0; i < errors.length; i++) {
      const errorText = await errors[i].textContent();
      }
    
    // Check Redux state via window object
    const reduxState = await page.evaluate(() => {
      return window.__REDUX_DEVTOOLS_EXTENSION__ ? 
        window.store?.getState() : 
        'Redux DevTools not available';
    });
    
    );
    
    // Check localStorage
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        items[key] = window.localStorage.getItem(key);
      }
      return items;
    });
    
    );
    
    // Check API endpoints manually
    const apiTests = [
      'http://localhost:8003/api/v1/locales',
      'http://localhost:8003/api/v1/params',
      'http://localhost:8003/api/v1/banks'
    ];
    
    for (const apiUrl of apiTests) {
      try {
        const response = await page.request.get(apiUrl);
        );
        if (response.ok()) {
          const data = await response.json();
          ? data.length : Object.keys(data).length);
        }
      } catch (error) {
        }
    }
  });
});
