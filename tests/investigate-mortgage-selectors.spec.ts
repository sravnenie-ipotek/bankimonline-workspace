import { test, expect } from '@playwright/test';

test('🔍 Investigate Mortgage Calculator Selectors', async ({ page }) => {
  await page.goto('http://localhost:5173/services/calculate-mortgage/1');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  console.log('🔍 Starting investigation of mortgage calculator selectors');
  
  // Take screenshot for visual inspection
  await page.screenshot({ path: 'test-results/page-inspection.png', fullPage: true });
  
  // Get page title and main content
  const title = await page.title();
  // Check for form elements
  const inputs = await page.locator('input').all();
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const testId = await input.getAttribute('data-testid');
    const id = await input.getAttribute('id');
    const placeholder = await input.getAttribute('placeholder');
    const className = await input.getAttribute('class');
    
    console.log(`Input ${i}: type=${type}, name=${name}, testId=${testId}, id=${id}, placeholder=${placeholder}, class=${className ? (className.length > 50 ? className.substring(0, 50) + '...' : className) : 'none'}`);
  }
  
  // Check for select elements
  const selects = await page.locator('select').all();
  for (let i = 0; i < selects.length; i++) {
    const select = selects[i];
    const name = await select.getAttribute('name');
    const testId = await select.getAttribute('data-testid');
    const id = await select.getAttribute('id');
    const className = await select.getAttribute('class');
    
    console.log(`Select ${i}: name=${name}, testId=${testId}, id=${id}, class=${className ? (className.length > 50 ? className.substring(0, 50) + '...' : className) : 'none'}`);
    
    // Get options
    const options = await select.locator('option').all();
    for (let j = 0; j < Math.min(options.length, 5); j++) {
      const optionText = await options[j].textContent();
      const optionValue = await options[j].getAttribute('value');
      `);
    }
  }
  
  // Check for buttons
  const buttons = await page.locator('button').all();
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const button = buttons[i];
    const text = await button.textContent();
    const type = await button.getAttribute('type');
    const testId = await button.getAttribute('data-testid');
    const className = await button.getAttribute('class');
    
    ,
      type,
      testId,
      className: className?.substring(0, 50) + (className && className.length > 50 ? '...' : '')
    });
  }
  
  // Check for any elements with data-testid
  const testIdElements = await page.locator('[data-testid]').all();
  for (let i = 0; i < Math.min(testIdElements.length, 20); i++) {
    const element = testIdElements[i];
    const testId = await element.getAttribute('data-testid');
    const tagName = await element.evaluate(el => el.tagName);
    const text = await element.textContent();
    
    - "${text?.trim().substring(0, 50)}"`);
  }
  
  // Check for slider/range inputs specifically
  const rangeInputs = await page.locator('input[type="range"]').all();
  // Check for labels
  const labels = await page.locator('label').all();
  for (let i = 0; i < Math.min(labels.length, 10); i++) {
    const label = labels[i];
    const text = await label.textContent();
    const forAttr = await label.getAttribute('for');
    
    }" (for: ${forAttr})`);
  }
  
  // Check if we can find any property/mortgage related text
  const bodyText = await page.textContent('body');
  const hasPropertyText = bodyText?.includes('property') || bodyText?.includes('Property');
  const hasMortgageText = bodyText?.includes('mortgage') || bodyText?.includes('Mortgage');
  const hasLoanText = bodyText?.includes('loan') || bodyText?.includes('Loan');
  
  // Check specific elements by text content
  const propertyElements = await page.locator(':has-text("property")').all();
  const mortgageElements = await page.locator(':has-text("mortgage")').all();
  });