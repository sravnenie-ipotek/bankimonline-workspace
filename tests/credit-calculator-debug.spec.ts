import { test, expect } from '@playwright/test';

test.describe('Credit Calculator Step 3 Investigation', () => {
  test('investigate step 3 form issues', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
    
    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('api')) {
        console.log('REQUEST:', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('api')) {
        console.log('RESPONSE:', response.status(), response.url());
      }
    });
    
    // Navigate to the credit calculator step 3
    await page.goto('http://localhost:5174/services/calculate-credit/3');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'step3-initial.png', fullPage: true });
    
    // Check form elements
    console.log('=== FORM ELEMENTS ===');
    
    // Look for dropdowns
    const dropdowns = await page.locator('select, [role="combobox"], .dropdown').all();
    console.log('Found dropdowns:', dropdowns.length);
    
    for (let i = 0; i < dropdowns.length; i++) {
      const dropdown = dropdowns[i];
      const text = await dropdown.textContent();
      const value = await dropdown.getAttribute('value');
      console.log(`Dropdown ${i}:`, { text, value });
    }
    
    // Check for error messages
    const errors = await page.locator('.error, [class*="error"], .invalid').all();
    console.log('Found error elements:', errors.length);
    
    for (let i = 0; i < errors.length; i++) {
      const errorText = await errors[i].textContent();
      console.log(`Error ${i}:`, errorText);
    }
    
    // Check Redux state via window object
    const reduxState = await page.evaluate(() => {
      return window.__REDUX_DEVTOOLS_EXTENSION__ ? 
        window.store?.getState() : 
        'Redux DevTools not available';
    });
    
    console.log('=== REDUX STATE ===', JSON.stringify(reduxState, null, 2));
    
    // Check localStorage
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        items[key] = window.localStorage.getItem(key);
      }
      return items;
    });
    
    console.log('=== LOCAL STORAGE ===', JSON.stringify(localStorage, null, 2));
    
    // Check API endpoints manually
    const apiTests = [
      'http://localhost:8003/api/v1/locales',
      'http://localhost:8003/api/v1/params',
      'http://localhost:8003/api/v1/banks'
    ];
    
    for (const apiUrl of apiTests) {
      try {
        const response = await page.request.get(apiUrl);
        console.log(`API Test ${apiUrl}:`, response.status());
        if (response.ok()) {
          const data = await response.json();
          console.log(`API Data length:`, Array.isArray(data) ? data.length : Object.keys(data).length);
        }
      } catch (error) {
        console.log(`API Error ${apiUrl}:`, error.message);
      }
    }
  });
});
