/**
 * BrowserStack Test with Local Tunnel - Complete localhost testing solution
 * This test automatically sets up BrowserStack Local tunnel and runs mortgage calculator tests
 */

const { Builder, By, until } = require('selenium-webdriver');
const browserstack = require('browserstack-local');

// BrowserStack credentials
const USERNAME = 'qabankimonline@gmail.com';
const ACCESS_KEY = '1sPgh89g81AybDayLQtz';

const capabilities = {
  'browserName': 'chrome',
  'bstack:options': {
    'userName': USERNAME,
    'accessKey': ACCESS_KEY,
    'os': 'Windows',
    'osVersion': '10',
    'buildName': 'E2E-BankimOnline-Calculator-LocalTunnel',
    'sessionName': 'Mortgage Calculator with Local Tunnel',
    'debug': true,
    'seleniumVersion': '4.0.0',
    'local': true,
    'localIdentifier': 'mortgage-calculator-tunnel'
  }
};

// BrowserStack Local instance
const bs_local = new browserstack.Local();

async function startLocalTunnel() {
  return new Promise((resolve, reject) => {
    bs_local.start({
      'key': ACCESS_KEY,
      'localIdentifier': 'mortgage-calculator-tunnel',
      'verbose': true
    }, function(error) {
      if (error) {
        console.error('❌ Failed to start BrowserStack Local tunnel:', error);
        reject(error);
      } else {
        ? 'RUNNING' : 'STOPPED');
        resolve();
      }
    });
  });
}

async function stopLocalTunnel() {
  return new Promise((resolve) => {
    bs_local.stop(function() {
      resolve();
    });
  });
}

(async function main() {
  let driver = null;
  
  try {
    // Step 1: Start BrowserStack Local tunnel
    await startLocalTunnel();
    
    // Step 2: Create WebDriver session
    driver = await new Builder()
      .usingServer('https://hub-cloud.browserstack.com/wd/hub')
      .withCapabilities(capabilities)
      .build();

    // Step 3: Test mortgage calculator
    await driver.get('http://localhost:5173/services/calculate-mortgage/1');
    
    // Wait for page to load
    await driver.sleep(5000);
    
    // Get page info
    const title = await driver.getTitle();
    const currentUrl = await driver.getCurrentUrl();
    // Test 1: Look for property price input
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
      }
    
    // Test 2: Look for dropdowns
    const dropdownSelectors = [
      { name: 'property-ownership', selectors: ['[data-testid="property-ownership-dropdown"]', 'select[name*="ownership"]', '[placeholder*="בעלות"]'] },
      { name: 'city', selectors: ['[data-testid="city-dropdown"]', 'select[name*="city"]', '[placeholder*="עיר"]'] },
      { name: 'property-type', selectors: ['[data-testid="property-type-dropdown"]', 'select[name*="type"]', '[placeholder*="סוג"]'] }
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
    
    // Test 3: Take screenshot
    const screenshot = await driver.takeScreenshot();
    // Final results
    );
    );
    
    if (propertyPriceInput || foundDropdowns > 0) {
      } else {
      }

  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    } finally {
    // Cleanup
    if (driver) {
      await driver.quit();
    }
    
    if (bs_local && bs_local.isRunning()) {
      await stopLocalTunnel();
    }
    
    }
})();

// Handle process cleanup
process.on('SIGINT', async () => {
  if (bs_local && bs_local.isRunning()) {
    await stopLocalTunnel();
  }
  process.exit(0);
});

process.on('exit', () => {
  if (bs_local && bs_local.isRunning()) {
    bs_local.stop(() => {
      });
  }
});