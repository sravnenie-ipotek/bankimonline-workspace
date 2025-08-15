const { test, expect } = require('@playwright/test');

test('Take screenshots of Refinance Credit pages', async ({ page }) => {
  const steps = [
    { url: 'http://localhost:5174/services/refinance-credit/1', name: 'step1' },
    { url: 'http://localhost:5174/services/refinance-credit/2', name: 'step2' },
    { url: 'http://localhost:5174/services/refinance-credit/3', name: 'step3' },
    { url: 'http://localhost:5174/services/refinance-credit/4', name: 'step4' }
  ];

  for (const step of steps) {
    console.log(`Taking screenshot of ${step.name}...`);
    try {
      await page.goto(step.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ 
        path: `/Users/michaelmishayev/Projects/bankDev2_standalone/refinance-credit-${step.name}.png`,
        fullPage: true 
      });
      console.log(`✅ Screenshot saved for ${step.name}`);
      
      // Get page title and URL for logging
      const title = await page.title();
      const currentUrl = page.url();
      console.log(`   Title: ${title}`);
      console.log(`   URL: ${currentUrl}`);
      
    } catch (error) {
      console.log(`❌ Failed to screenshot ${step.name}: ${error.message}`);
    }
  }
});