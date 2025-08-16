const { chromium } = require('playwright');

async function testDropdownDebug() {
  // Environment configuration
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
  const TEST_ENV = process.env.TEST_ENVIRONMENT || 'development';
  const IS_PRODUCTION = BASE_URL.includes('bankimonline.com');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000,
    devtools: true // Open DevTools to see console errors
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US'
  });
  
  const page = await context.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[${msg.type().toUpperCase()}]:`, msg.text());
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]:', error.message);
  });
  
  console.log('🔍 DEBUGGING PROPERTY OWNERSHIP DROPDOWN\n');
  console.log('=' .repeat(60));
  console.log(`🌍 Environment: ${TEST_ENV.toUpperCase()}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🛡️  Safety Mode: ${IS_PRODUCTION ? 'ENABLED (Production)' : 'DISABLED (Development)'}`);
  console.log('=' .repeat(60));
  
  try {
    console.log('\n📋 Loading Mortgage Calculator Page...');
    await page.goto(`${BASE_URL}/services/calculate-mortgage`);
    await page.waitForLoadState('networkidle');
    
    console.log('\n📋 Waiting for React to render...');
    await page.waitForTimeout(5000);
    
    // Check if there are any elements with text containing "property"
    console.log('\n📋 Searching for elements with "property" text...');
    const propertyElements = await page.locator(':has-text("property")').all();
    console.log(`  Found ${propertyElements.length} elements containing "property"`);
    
    for (let i = 0; i < Math.min(propertyElements.length, 5); i++) {
      const tagName = await propertyElements[i].evaluate(el => el.tagName);
      const className = await propertyElements[i].getAttribute('class');
      const text = await propertyElements[i].textContent();
      console.log(`    ${i}: <${tagName}> class="${className}" text="${text?.substring(0, 50)}"`);
    }
    
    // Check for all dropdown components
    console.log('\n📋 Checking all dropdown components on page...');
    const dropdowns = await page.locator('.react-dropdown-select, [class*="dropdown"]').all();
    console.log(`  Found ${dropdowns.length} dropdown components`);
    
    for (let i = 0; i < dropdowns.length; i++) {
      const className = await dropdowns[i].getAttribute('class');
      const testId = await dropdowns[i].getAttribute('data-testid');
      const text = await dropdowns[i].textContent();
      console.log(`\n  Dropdown ${i}:`);
      console.log(`    Class: ${className}`);
      console.log(`    Test ID: ${testId || 'none'}`);
      console.log(`    Text: "${text?.substring(0, 100)}"`);
      
      // Check if it has options
      const options = await dropdowns[i].locator('[class*="option"], option').all();
      if (options.length > 0) {
        console.log(`    Has ${options.length} options`);
      }
    }
    
    // Try to find any form fields related to property ownership
    console.log('\n📋 Checking form structure...');
    const formFields = await page.locator('input, select, [class*="dropdown"]').all();
    console.log(`  Total form fields: ${formFields.length}`);
    
    // Execute JavaScript to check React props
    console.log('\n📋 Checking React component data...');
    const reactData = await page.evaluate(() => {
      // Try to find React fiber nodes
      const findReactFiber = (element) => {
        const keys = Object.keys(element);
        const reactKey = keys.find(key => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance'));
        return element[reactKey];
      };
      
      // Find all dropdown elements
      const dropdowns = document.querySelectorAll('.react-dropdown-select, [class*="dropdown"]');
      const results = [];
      
      dropdowns.forEach((dropdown, index) => {
        const fiber = findReactFiber(dropdown);
        if (fiber && fiber.memoizedProps) {
          results.push({
            index,
            props: {
              data: fiber.memoizedProps.data,
              placeholder: fiber.memoizedProps.placeholder,
              value: fiber.memoizedProps.value,
              title: fiber.memoizedProps.title
            }
          });
        }
      });
      
      return results;
    });
    
    if (reactData.length > 0) {
      console.log('\n📋 React Component Props:');
      reactData.forEach(item => {
        console.log(`\n  Component ${item.index}:`);
        console.log(`    Title: ${item.props.title || 'none'}`);
        console.log(`    Placeholder: ${item.props.placeholder || 'none'}`);
        console.log(`    Value: ${item.props.value || 'none'}`);
        if (item.props.data) {
          console.log(`    Data: ${JSON.stringify(item.props.data).substring(0, 200)}`);
        }
      });
    }
    
    // Check for any errors in the console
    console.log('\n📋 Checking for JavaScript errors...');
    const jsErrors = await page.evaluate(() => {
      return window.__errors || [];
    });
    
    if (jsErrors.length > 0) {
      console.log('  JavaScript errors found:');
      jsErrors.forEach(err => console.log(`    - ${err}`));
    } else {
      console.log('  No JavaScript errors detected');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🔍 Debug information collected. Check console output above.');
    console.log('=' .repeat(60));
    
    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Debug session completed');
  }
}

// Run the test
testDropdownDebug().catch(console.error);