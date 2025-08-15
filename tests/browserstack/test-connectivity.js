/**
 * BrowserStack Connectivity Test - Validates BrowserStack setup and browser automation
 * This test confirms BrowserStack integration works properly for future testing
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
    'buildName': 'Connectivity-Test-BankimOnline',
    'sessionName': 'BrowserStack Connectivity Validation',
    'debug': true,
    'seleniumVersion': '4.0.0',
    'local': false  // Disable local tunnel for connectivity test
  }
};

(async function main() {
  let driver = await new Builder()
    .usingServer('https://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();

  try {
    // Test 1: Basic page navigation
    await driver.get('https://www.google.com');
    await driver.sleep(2000);
    
    const title = await driver.getTitle();
    // Test 2: Element interaction
    const searchBox = await driver.findElement(By.name('q'));
    await searchBox.sendKeys('BrowserStack test');
    await driver.sleep(1000);
    
    // Test 3: Screenshot capability
    await driver.takeScreenshot();
    
    // Test 4: Multiple browser capabilities
    const userAgent = await driver.executeScript('return navigator.userAgent;');
    }...`);
    
    // Test 5: Page manipulation
    await driver.executeScript('document.body.style.backgroundColor = "lightblue";');
    await driver.sleep(2000);
    
    );
    );
    } catch (err) {
    console.error('❌ Connectivity test failed with error:', err.message);
    } finally {
    await driver.quit();
    }
})();

// Export for potential use in other tests
module.exports = {
  USERNAME,
  ACCESS_KEY,
  capabilities: {
    ...capabilities,
    'bstack:options': {
      ...capabilities['bstack:options'],
      'sessionName': 'Mortgage Calculator Test'
    }
  }
};