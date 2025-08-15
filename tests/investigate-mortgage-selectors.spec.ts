import { test, expect } from '@playwright/test';

test('🔍 Investigate Mortgage Calculator Selectors', async ({ page }) => {
  console.log('🚀 Navigating to mortgage calculator step 1...');
  
  await page.goto('http://localhost:5173/services/calculate-mortgage/1');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  console.log('📄 Current URL:', page.url());
  
  // Take screenshot for visual inspection
  await page.screenshot({ path: 'test-results/page-inspection.png', fullPage: true });
  
  // Get page title and main content
  const title = await page.title();
  console.log('📝 Page Title:', title);
  
  // Check for form elements
  const inputs = await page.locator('input').all();
  console.log(`📝 Found ${inputs.length} input elements:`);
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const testId = await input.getAttribute('data-testid');
    const id = await input.getAttribute('id');
    const placeholder = await input.getAttribute('placeholder');
    const className = await input.getAttribute('class');
    
    console.log(`  Input ${i + 1}:`, {
      type,
      name,
      testId,
      id,
      placeholder,
      className: className?.substring(0, 50) + (className && className.length > 50 ? '...' : '')
    });
  }
  
  // Check for select elements
  const selects = await page.locator('select').all();
  console.log(`📝 Found ${selects.length} select elements:`);
  
  for (let i = 0; i < selects.length; i++) {
    const select = selects[i];
    const name = await select.getAttribute('name');
    const testId = await select.getAttribute('data-testid');
    const id = await select.getAttribute('id');
    const className = await select.getAttribute('class');
    
    console.log(`  Select ${i + 1}:`, {
      name,
      testId,
      id,
      className: className?.substring(0, 50) + (className && className.length > 50 ? '...' : '')
    });
    
    // Get options
    const options = await select.locator('option').all();
    console.log(`    Options: ${options.length}`);
    for (let j = 0; j < Math.min(options.length, 5); j++) {
      const optionText = await options[j].textContent();
      const optionValue = await options[j].getAttribute('value');
      console.log(`      ${j + 1}: "${optionText}" (value: ${optionValue})`);
    }
  }
  
  // Check for buttons
  const buttons = await page.locator('button').all();
  console.log(`📝 Found ${buttons.length} button elements:`);
  
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const button = buttons[i];
    const text = await button.textContent();
    const type = await button.getAttribute('type');
    const testId = await button.getAttribute('data-testid');
    const className = await button.getAttribute('class');
    
    console.log(`  Button ${i + 1}:`, {
      text: text?.trim(),
      type,
      testId,
      className: className?.substring(0, 50) + (className && className.length > 50 ? '...' : '')
    });
  }
  
  // Check for any elements with data-testid
  const testIdElements = await page.locator('[data-testid]').all();
  console.log(`📝 Found ${testIdElements.length} elements with data-testid:`);
  
  for (let i = 0; i < Math.min(testIdElements.length, 20); i++) {
    const element = testIdElements[i];
    const testId = await element.getAttribute('data-testid');
    const tagName = await element.evaluate(el => el.tagName);
    const text = await element.textContent();
    
    console.log(`  TestID ${i + 1}: data-testid="${testId}" (${tagName}) - "${text?.trim().substring(0, 50)}"`);
  }
  
  // Check for slider/range inputs specifically
  const rangeInputs = await page.locator('input[type="range"]').all();
  console.log(`📝 Found ${rangeInputs.length} range/slider inputs`);
  
  // Check for labels
  const labels = await page.locator('label').all();
  console.log(`📝 Found ${labels.length} label elements`);
  
  for (let i = 0; i < Math.min(labels.length, 10); i++) {
    const label = labels[i];
    const text = await label.textContent();
    const forAttr = await label.getAttribute('for');
    
    console.log(`  Label ${i + 1}: "${text?.trim()}" (for: ${forAttr})`);
  }
  
  // Check if we can find any property/mortgage related text
  const bodyText = await page.textContent('body');
  const hasPropertyText = bodyText?.includes('property') || bodyText?.includes('Property');
  const hasMortgageText = bodyText?.includes('mortgage') || bodyText?.includes('Mortgage');
  const hasLoanText = bodyText?.includes('loan') || bodyText?.includes('Loan');
  
  console.log('🔍 Content Analysis:');
  console.log('  Contains "property":', hasPropertyText);
  console.log('  Contains "mortgage":', hasMortgageText);
  console.log('  Contains "loan":', hasLoanText);
  
  // Check specific elements by text content
  const propertyElements = await page.locator(':has-text("property")').all();
  console.log(`📝 Found ${propertyElements.length} elements containing "property"`);
  
  const mortgageElements = await page.locator(':has-text("mortgage")').all();
  console.log(`📝 Found ${mortgageElements.length} elements containing "mortgage"`);
});