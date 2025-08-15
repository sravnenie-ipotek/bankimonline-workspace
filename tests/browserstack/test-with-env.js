/**
 * Simple BrowserStack Test - With Environment Variables
 * Alternative approach using environment variables for authentication
 */

const { Builder, By, until } = require('selenium-webdriver');

// BrowserStack credentials - try both environment variables and hardcoded
const USERNAME = process.env.BROWSERSTACK_USERNAME || 'qabankimonline@gmail.com';
const ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || '1sPgh89g81AybDayLQtz';

}...${ACCESS_KEY.substring(ACCESS_KEY.length - 4)}`);

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
    'console': 'errors',
    'seleniumVersion': '4.0.0'
  }
};

(async function main() {
  let driver;
  
  try {
    driver = await new Builder()
      .usingServer('https://hub-cloud.browserstack.com/wd/hub')
      .withCapabilities(capabilities)
      .build();

    // Step 1: Open mortgage calculator Step 1
    await driver.get('http://localhost:5173/services/calculate-mortgage/1');
    
    // Wait for page to load
    await driver.sleep(5000);
    
    // Get page title and URL to verify we're connected
    const title = await driver.getTitle();
    const currentUrl = await driver.getCurrentUrl();
    
    // Simple success test
    );
    );
    
    } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    
    if (err.message.includes('Authorization required')) {
      } else {
      }
  } finally {
    if (driver) {
      await driver.quit();
      }
  }
})();

module.exports = {
  USERNAME,
  ACCESS_KEY,
  capabilities
};