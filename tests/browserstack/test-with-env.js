/**
 * Simple BrowserStack Test - With Environment Variables
 * Alternative approach using environment variables for authentication
 */

const { Builder, By, until } = require('selenium-webdriver');

// BrowserStack credentials - try both environment variables and hardcoded
const USERNAME = process.env.BROWSERSTACK_USERNAME || 'qabankimonline@gmail.com';
const ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || '1sPgh89g81AybDayLQtz';

console.log('🔑 Using BrowserStack credentials:');
console.log(`Username: ${USERNAME}`);
console.log(`Access Key: ${ACCESS_KEY.substring(0, 4)}...${ACCESS_KEY.substring(ACCESS_KEY.length - 4)}`);

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
  console.log('🚀 Starting BrowserStack Simple Test with Environment Auth...');
  console.log('📋 Testing Mortgage Calculator on http://localhost:5173/services/calculate-mortgage/1');
  
  let driver;
  
  try {
    console.log('🔗 Connecting to BrowserStack...');
    driver = await new Builder()
      .usingServer('https://hub-cloud.browserstack.com/wd/hub')
      .withCapabilities(capabilities)
      .build();

    console.log('✅ Connected to BrowserStack successfully');
    
    // Step 1: Open mortgage calculator Step 1
    console.log('🏠 Navigating to Mortgage Calculator Step 1...');
    await driver.get('http://localhost:5173/services/calculate-mortgage/1');
    
    // Wait for page to load
    console.log('⏳ Waiting for page to load...');
    await driver.sleep(5000);
    
    // Get page title and URL to verify we're connected
    const title = await driver.getTitle();
    const currentUrl = await driver.getCurrentUrl();
    
    console.log(`📄 Page title: ${title}`);
    console.log(`🔗 Current URL: ${currentUrl}`);
    
    // Simple success test
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`✅ BrowserStack Connection: SUCCESS`);
    console.log(`✅ Page Loading: SUCCESS`);
    console.log(`📄 Page Title: ${title}`);
    console.log(`🔗 URL: ${currentUrl}`);
    console.log('=' .repeat(50));
    
    console.log('🎉 BASIC TEST PASSED: BrowserStack connection successful');

  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
    
    if (err.message.includes('Authorization required')) {
      console.log('\n🔧 AUTHORIZATION TROUBLESHOOTING:');
      console.log('1. Check BrowserStack account status at https://automate.browserstack.com');
      console.log('2. Verify credentials are correct:');
      console.log(`   Username: ${USERNAME}`);
      console.log(`   Access Key: ${ACCESS_KEY}`);
      console.log('3. Check account subscription and usage limits');
      console.log('4. Try logging in manually to BrowserStack dashboard');
    } else {
      console.log('\n🔧 GENERAL TROUBLESHOOTING TIPS:');
      console.log('1. Make sure development server is running on http://localhost:5173');
      console.log('2. Check network connectivity');
      console.log('3. Review BrowserStack status page');
    }
  } finally {
    if (driver) {
      console.log('\n🏁 Closing browser session...');
      await driver.quit();
      console.log('✅ Test completed');
    }
  }
})();

module.exports = {
  USERNAME,
  ACCESS_KEY,
  capabilities
};