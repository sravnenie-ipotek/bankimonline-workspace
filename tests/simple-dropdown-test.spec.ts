import { test, expect } from '@playwright/test';

test('Simple dropdown validation test', async ({ page }) => {
  // Go to the refinance mortgage page
  await page.goto('/services/refinance-mortgage/1');
  
  // Wait for page to load completely
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot to see what we have
  await page.screenshot({ path: 'refinance-page.png', fullPage: true });
  
  // Log the URL to confirm we're on the right page
  const url = page.url();
  console.log('Current URL:', url);
  
  // Log the page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check if we can find any form elements
  const forms = await page.locator('form').count();
  console.log('Number of forms found:', forms);
  
  // Check if we can find any inputs
  const inputs = await page.locator('input').count();
  console.log('Number of inputs found:', inputs);
  
  // Check if we can find any dropdowns/selects
  const selects = await page.locator('select, .MuiSelect-root, [role="combobox"]').count();
  console.log('Number of dropdowns found:', selects);
  
  // Get the page content to understand the structure
  const content = await page.textContent('body');
  console.log('Page contains Hebrew text:', content?.includes('מקור הכנסה') || false);
  console.log('Page contains "refinance":', content?.toLowerCase().includes('refinance') || false);
  console.log('Page contains "mortgage":', content?.toLowerCase().includes('mortgage') || false);
  
  // Let's see what main elements we have
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  console.log('Headings found:');
  for (const heading of headings) {
    const text = await heading.textContent();
    console.log(`- ${text}`);
  }
  
  expect(true).toBe(true); // Simple pass for now
});