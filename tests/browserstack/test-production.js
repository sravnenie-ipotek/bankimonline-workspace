/**
 * Simple BrowserStack Test - Production URL Testing
 * Tests against your live production server instead of localhost
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
    'buildName': 'E2E-BankimOnline-Calculator-Production',
    'sessionName': 'Mortgage Calculator Production Test',
    'debug': true,
    'seleniumVersion': '4.0.0'
  }
};

// Use your production URL instead of localhost
const BASE_URL = 'https://bankimonline.com';

(async function main() {
  let driver = await new Builder()
    .usingServer('https://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();

  try {
    // Step 1: Open mortgage calculator Step 1
    await driver.get(`${BASE_URL}/services/calculate-mortgage/1`);
    
    // Wait for page to load
    await driver.sleep(10000); // Longer wait for production server
    
    // Get page title and URL to verify we're connected
    const title = await driver.getTitle();
    const currentUrl = await driver.getCurrentUrl();
    
    // Test property price input
    const priceSelectors = [
      'input[type="number"]',
      'input[name*="price"]',
      '[data-testid*="price"]',
      'input[placeholder*="מחיר"]',
      'input[placeholder*="price"]'
    ];
    
    let propertyPriceInput = null;
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
      }
    
    // Simple success test
    );
    );
    
    } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    } finally {
    await driver.quit();
    }
})();

module.exports = {
  USERNAME,
  ACCESS_KEY,
  capabilities
};