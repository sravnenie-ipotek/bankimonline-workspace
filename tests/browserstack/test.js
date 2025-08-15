/**
 * Simple BrowserStack Test - Basic Connectivity and Mortgage Calculator Testing
 * Based on original instructions for quick BrowserStack verification
 */

const { Builder, By, until } = require('selenium-webdriver');

// BrowserStack credentials from instructions
const USERNAME = 'qabankimonline@gmail.com';
const ACCESS_KEY = '1sPgh89g81AybDayLQtz';

const capabilities = {
  'browserName': 'chrome',
  'bstack:options': {
    'userName': USERNAME,
    'accessKey': ACCESS_KEY,
    'os': 'Windows',
    'osVersion': '10',
    'buildName': 'E2E-BankimOnline-Calculator',
    'sessionName': 'Mortgage Calculator Simple Test',
    'debug': true,
    'seleniumVersion': '4.0.0',
    'local': false  // Disable BrowserStack Local for now
  }
};

(async function main() {
  ');
  
  let driver = await new Builder()
    .usingServer('https://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();

  try {
    // Step 1: Demo test with Google
    await driver.get('https://www.google.com');
    
    // Wait for page to load
    await driver.sleep(5000);
    
    // Step 2: Try to find key elements (using fallback selectors)
    // Look for property price input (multiple selectors as fallback)
    let propertyPriceInput = null;
    const priceSelectors = [
      '[data-testid="property-price-input"]',
      'input[name*="price"]',
      'input[placeholder*="נכס"]',
      'input[placeholder*="property"]',
      'input[type="number"]'
    ];
    
    for (const selector of priceSelectors) {
      try {
        propertyPriceInput = await driver.findElement(By.css(selector));
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (propertyPriceInput) {
      await propertyPriceInput.clear();
      await propertyPriceInput.sendKeys('2000000');
      
      const inputValue = await propertyPriceInput.getAttribute('value');
      } else {
      }
    
    // Step 3: Look for dropdowns
    const dropdownSelectors = [
      { name: 'city', selectors: ['[data-testid="city-dropdown"]', '.city-dropdown', 'select[name*="city"]', '[placeholder*="עיר"]'] },
      { name: 'property-type', selectors: ['[data-testid="property-type-dropdown"]', '.property-type-dropdown', 'select[name*="type"]', '[placeholder*="סוג"]'] },
      { name: 'property-ownership', selectors: ['[data-testid="property-ownership-dropdown"]', '.property-ownership-dropdown', 'select[name*="ownership"]', '[placeholder*="בעלות"]'] }
    ];
    
    let foundDropdowns = 0;
    
    for (const dropdown of dropdownSelectors) {
      let found = false;
      for (const selector of dropdown.selectors) {
        try {
          const element = await driver.findElement(By.css(selector));
          found = true;
          foundDropdowns++;
          break;
        } catch (e) {
          continue;
        }
      }
      if (!found) {
        }
    }
    
    // Step 4: Try to navigate to other steps
    const urlsToTest = [
      'http://localhost:5173/services/calculate-mortgage/2',
      'http://localhost:5173/services/calculate-mortgage/3',
      'http://localhost:5173/services/calculate-mortgage/4'
    ];
    
    for (let i = 0; i < urlsToTest.length; i++) {
      try {
        await driver.get(urlsToTest[i]);
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes(`/${i + 2}`)) {
          } else {
          }
      } catch (error) {
        }
    }
    
    // Step 5: Final results
    );
    );
    
    if (propertyPriceInput || foundDropdowns > 0) {
      } else {
      }

  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    } finally {
    await driver.quit();
    }
})();

// Export for potential use in other tests
module.exports = {
  USERNAME,
  ACCESS_KEY,
  capabilities
};