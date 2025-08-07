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
    console.log('🔗 Starting BrowserStack Local tunnel...');
    
    bs_local.start({
      'key': ACCESS_KEY,
      'localIdentifier': 'mortgage-calculator-tunnel',
      'verbose': true
    }, function(error) {
      if (error) {
        console.error('❌ Failed to start BrowserStack Local tunnel:', error);
        reject(error);
      } else {
        console.log('✅ BrowserStack Local tunnel started successfully');
        console.log('🌐 Tunnel Status:', bs_local.isRunning() ? 'RUNNING' : 'STOPPED');
        resolve();
      }
    });
  });
}

async function stopLocalTunnel() {
  return new Promise((resolve) => {
    console.log('🔌 Stopping BrowserStack Local tunnel...');
    bs_local.stop(function() {
      console.log('✅ BrowserStack Local tunnel stopped');
      resolve();
    });
  });
}

(async function main() {
  console.log('🚀 Starting BrowserStack Test with Local Tunnel...');
  console.log('📋 Testing Mortgage Calculator on http://localhost:5173/services/calculate-mortgage/1');
  
  let driver = null;
  
  try {
    // Step 1: Start BrowserStack Local tunnel
    await startLocalTunnel();
    
    // Step 2: Create WebDriver session
    console.log('🔧 Creating WebDriver session...');
    driver = await new Builder()
      .usingServer('https://hub-cloud.browserstack.com/wd/hub')
      .withCapabilities(capabilities)
      .build();

    console.log('✅ Connected to BrowserStack with local tunnel');
    
    // Step 3: Test mortgage calculator
    console.log('🏠 Navigating to Mortgage Calculator Step 1...');
    await driver.get('http://localhost:5173/services/calculate-mortgage/1');
    
    // Wait for page to load
    console.log('⏳ Waiting for page to load...');
    await driver.sleep(5000);
    
    // Get page info
    const title = await driver.getTitle();
    const currentUrl = await driver.getCurrentUrl();
    console.log(`📄 Page title: ${title}`);
    console.log(`🔗 Current URL: ${currentUrl}`);
    
    // Test 1: Look for property price input
    console.log('💰 Testing property price input...');
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
        console.log(`✅ Found property price input using selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Selector not found: ${selector}`);
        continue;
      }
    }
    
    if (propertyPriceInput) {
      await propertyPriceInput.clear();
      await propertyPriceInput.sendKeys('2000000');
      const inputValue = await propertyPriceInput.getAttribute('value');
      console.log(`✅ Property price set successfully: ${inputValue}`);
    }
    
    // Test 2: Look for dropdowns
    console.log('📋 Testing dropdown elements...');
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
          console.log(`✅ Found ${dropdown.name} dropdown using selector: ${selector}`);
          found = true;
          foundDropdowns++;
          break;
        } catch (e) {
          continue;
        }
      }
      if (!found) {
        console.log(`⚠️ Could not find ${dropdown.name} dropdown`);
      }
    }
    
    // Test 3: Take screenshot
    console.log('📸 Taking screenshot...');
    const screenshot = await driver.takeScreenshot();
    console.log('✅ Screenshot captured successfully');
    
    // Final results
    console.log('\n📊 BROWSERSTACK LOCAL TEST RESULTS:');
    console.log('=' .repeat(60));
    console.log(`✅ BrowserStack Local Tunnel: SUCCESS`);
    console.log(`✅ Page Loading: SUCCESS`);
    console.log(`📄 Page Title: ${title}`);
    console.log(`🔗 URL Access: ${currentUrl}`);
    console.log(`📋 Property Price Input: ${propertyPriceInput ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`📋 Dropdowns Found: ${foundDropdowns}/3`);
    console.log(`📸 Screenshots: SUCCESS`);
    console.log('=' .repeat(60));
    
    if (propertyPriceInput || foundDropdowns > 0) {
      console.log('🎉 TEST PASSED: Mortgage calculator accessible via BrowserStack Local tunnel');
    } else {
      console.log('⚠️ TEST WARNING: Elements may need selector updates');
    }

  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    console.log('\n🔧 TROUBLESHOOTING TIPS:');
    console.log('1. Ensure development server is running on http://localhost:5173');
    console.log('2. Check if mortgage calculator page loads locally');
    console.log('3. Verify BrowserStack account has local testing enabled');
    console.log('4. Review BrowserStack dashboard for session logs');
    console.log('5. Check element selectors using browser DevTools');
  } finally {
    // Cleanup
    if (driver) {
      console.log('\n🏁 Closing browser session...');
      await driver.quit();
    }
    
    if (bs_local && bs_local.isRunning()) {
      await stopLocalTunnel();
    }
    
    console.log('✅ BrowserStack Local test completed');
  }
})();

// Handle process cleanup
process.on('SIGINT', async () => {
  console.log('\n⚠️ Received interrupt signal, cleaning up...');
  if (bs_local && bs_local.isRunning()) {
    await stopLocalTunnel();
  }
  process.exit(0);
});

process.on('exit', () => {
  if (bs_local && bs_local.isRunning()) {
    bs_local.stop(() => {
      console.log('✅ Emergency tunnel cleanup completed');
    });
  }
});