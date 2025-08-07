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
  console.log('🚀 Starting BrowserStack Connectivity Test...');
  console.log('🔗 Testing with publicly accessible website for connectivity validation');
  
  let driver = await new Builder()
    .usingServer('https://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();

  try {
    console.log('✅ Connected to BrowserStack successfully');
    
    // Test 1: Basic page navigation
    console.log('🌐 Testing basic page navigation...');
    await driver.get('https://www.google.com');
    await driver.sleep(2000);
    
    const title = await driver.getTitle();
    console.log(`📄 Page title: ${title}`);
    
    // Test 2: Element interaction
    console.log('🔍 Testing element interaction...');
    const searchBox = await driver.findElement(By.name('q'));
    await searchBox.sendKeys('BrowserStack test');
    await driver.sleep(1000);
    
    // Test 3: Screenshot capability
    console.log('📸 Testing screenshot capability...');
    await driver.takeScreenshot();
    
    // Test 4: Multiple browser capabilities
    console.log('🖥️ Testing browser information...');
    const userAgent = await driver.executeScript('return navigator.userAgent;');
    console.log(`🔧 User Agent: ${userAgent.substring(0, 100)}...`);
    
    // Test 5: Page manipulation
    console.log('⚙️ Testing page manipulation...');
    await driver.executeScript('document.body.style.backgroundColor = "lightblue";');
    await driver.sleep(2000);
    
    console.log('\n📊 BROWSERSTACK CONNECTIVITY TEST RESULTS:');
    console.log('=' .repeat(60));
    console.log('✅ BrowserStack Connection: SUCCESS');
    console.log('✅ Page Navigation: SUCCESS'); 
    console.log('✅ Element Interaction: SUCCESS');
    console.log('✅ Screenshot Capability: SUCCESS');
    console.log('✅ JavaScript Execution: SUCCESS');
    console.log('✅ Page Manipulation: SUCCESS');
    console.log('=' .repeat(60));
    console.log('🎉 CONNECTIVITY TEST PASSED: BrowserStack is ready for mortgage calculator testing');
    console.log('');
    console.log('🔧 NEXT STEPS FOR MORTGAGE CALCULATOR TESTING:');
    console.log('1. Set up BrowserStack Local tunnel for localhost testing');
    console.log('2. Or deploy frontend to publicly accessible URL');
    console.log('3. Update mortgage calculator selectors if needed');
    console.log('4. Run comprehensive mortgage calculator test suite');
    
  } catch (err) {
    console.error('❌ Connectivity test failed with error:', err.message);
    console.log('\n🔧 TROUBLESHOOTING TIPS:');
    console.log('1. Verify BrowserStack credentials are correct');
    console.log('2. Check BrowserStack account status and limits');
    console.log('3. Verify internet connectivity');
    console.log('4. Check BrowserStack service status');
    console.log('5. Review BrowserStack dashboard for session logs');
  } finally {
    console.log('\n🏁 Closing browser session...');
    await driver.quit();
    console.log('✅ Connectivity test completed');
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