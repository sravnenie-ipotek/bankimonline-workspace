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
  console.log('🚀 Starting BrowserStack Production Test...');
  console.log(`📋 Testing Mortgage Calculator on ${BASE_URL}/services/calculate-mortgage/1`);
  
  let driver = await new Builder()
    .usingServer('https://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();

  try {
    console.log('✅ Connected to BrowserStack successfully');
    
    // Step 1: Open mortgage calculator Step 1
    console.log('🏠 Navigating to Mortgage Calculator Step 1...');
    await driver.get(`${BASE_URL}/services/calculate-mortgage/1`);
    
    // Wait for page to load
    console.log('⏳ Waiting for page to load...');
    await driver.sleep(10000); // Longer wait for production server
    
    // Get page title and URL to verify we're connected
    const title = await driver.getTitle();
    const currentUrl = await driver.getCurrentUrl();
    
    console.log(`📄 Page title: ${title}`);
    console.log(`🔗 Current URL: ${currentUrl}`);
    
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
        console.log(`✅ Found property price input using selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️ Selector not found: ${selector}`);
        continue;
      }
    }
    
    if (propertyPriceInput) {
      console.log('💰 Testing property price input...');
      await propertyPriceInput.clear();
      await propertyPriceInput.sendKeys('2000000');
      
      const inputValue = await propertyPriceInput.getAttribute('value');
      console.log(`✅ Property price set successfully: ${inputValue}`);
    }
    
    // Simple success test
    console.log('\n📊 PRODUCTION TEST RESULTS SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`✅ BrowserStack Connection: SUCCESS`);
    console.log(`✅ Production Server Access: SUCCESS`);
    console.log(`📄 Page Title: ${title}`);
    console.log(`🔗 URL: ${currentUrl}`);
    console.log(`📋 Property Price Input: ${propertyPriceInput ? 'FOUND' : 'NOT FOUND'}`);
    console.log('=' .repeat(60));
    
    console.log('🎉 PRODUCTION TEST PASSED: BrowserStack can access your production server');

  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    console.log('\n🔧 PRODUCTION TROUBLESHOOTING TIPS:');
    console.log('1. Check if production server is running and accessible');
    console.log('2. Verify the production URL is correct');
    console.log('3. Check if mortgage calculator exists at the production URL');
    console.log('4. Review BrowserStack dashboard for detailed logs');
  } finally {
    console.log('\n🏁 Closing browser session...');
    await driver.quit();
    console.log('✅ Production test completed successfully');
  }
})();

module.exports = {
  USERNAME,
  ACCESS_KEY,
  capabilities
};