const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Log all console messages from the page
  page.on('console', msg => {
    const text = msg.text();
    console.log('BROWSER:', text);
  });
  
  // Navigate directly to refinance mortgage form
  await page.goto('http://localhost:5174/services/refinance-mortgage');
  
  console.log('✅ Page loaded. Check browser manually and look for debug logs in console.');
  console.log('ℹ️  This script will run for 2 minutes. Press Ctrl+C to stop.');
  
  // Keep running for manual testing
  await page.waitForTimeout(120000);
  
  await browser.close();
})();