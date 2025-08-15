import { test, expect } from '@playwright/test';

test('🔍 Simple Mortgage Calculator Investigation', async ({ page }) => {
  console.log('🚀 Starting investigation...');
  
  // Navigate with longer timeout
  await page.goto('http://localhost:5173/services/calculate-mortgage/1', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  console.log('📄 Current URL:', page.url());
  
  // Wait for React app to load - look for the root div to have content
  await page.waitForFunction(
    () => document.querySelector('#root')?.innerHTML.length > 100,
    { timeout: 15000 }
  );
  
  console.log('✅ React app loaded');
  
  // Take screenshot for visual inspection
  await page.screenshot({ path: 'test-results/mortgage-step1-actual.png', fullPage: true });
  console.log('📷 Screenshot taken');
  
  // Get page title
  const title = await page.title();
  console.log('📝 Page Title:', title);
  
  // Check for any text on the page
  const bodyText = await page.textContent('body');
  const hasContent = bodyText && bodyText.length > 10;
  console.log('📝 Page has content:', hasContent);
  console.log('📝 Body text length:', bodyText?.length);
  
  if (bodyText) {
    const firstWords = bodyText.trim().substring(0, 200);
    console.log('📝 First 200 characters:', firstWords);
  }
  
  // Look for form elements without waiting for specific selectors
  try {
    const inputs = await page.$$('input');
    console.log(`📝 Found ${inputs.length} input elements`);
    
    for (let i = 0; i < Math.min(inputs.length, 5); i++) {
      const type = await inputs[i].getAttribute('type');
      const name = await inputs[i].getAttribute('name');
      const placeholder = await inputs[i].getAttribute('placeholder');
      console.log(`  Input ${i + 1}: type=${type}, name=${name}, placeholder="${placeholder}"`);
    }
  } catch (e) {
    console.log('❌ Error finding inputs:', e);
  }
  
  try {
    const selects = await page.$$('select');
    console.log(`📝 Found ${selects.length} select elements`);
    
    for (let i = 0; i < selects.length; i++) {
      const name = await selects[i].getAttribute('name');
      const options = await selects[i].$$('option');
      console.log(`  Select ${i + 1}: name=${name}, options=${options.length}`);
      
      for (let j = 0; j < Math.min(options.length, 3); j++) {
        const optionText = await options[j].textContent();
        console.log(`    Option ${j + 1}: "${optionText}"`);
      }
    }
  } catch (e) {
    console.log('❌ Error finding selects:', e);
  }
  
  try {
    const buttons = await page.$$('button');
    console.log(`📝 Found ${buttons.length} button elements`);
    
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      const text = await buttons[i].textContent();
      console.log(`  Button ${i + 1}: "${text?.trim()}"`);
    }
  } catch (e) {
    console.log('❌ Error finding buttons:', e);
  }
  
  // Look for specific mortgage-related text
  const containsProperty = bodyText?.toLowerCase().includes('property') || bodyText?.toLowerCase().includes('נכס');
  const containsMortgage = bodyText?.toLowerCase().includes('mortgage') || bodyText?.toLowerCase().includes('משכנתא');
  const containsLoan = bodyText?.toLowerCase().includes('loan') || bodyText?.toLowerCase().includes('הלוואה');
  
  console.log('🔍 Content Analysis:');
  console.log('  Contains property:', containsProperty);
  console.log('  Contains mortgage:', containsMortgage);
  console.log('  Contains loan:', containsLoan);
  
  // Check if page is showing error or loading state
  const hasError = bodyText?.toLowerCase().includes('error') || bodyText?.toLowerCase().includes('not found');
  const hasLoading = bodyText?.toLowerCase().includes('loading') || bodyText?.toLowerCase().includes('טוען');
  
  console.log('  Has error:', hasError);
  console.log('  Has loading:', hasLoading);
  
  console.log('✅ Investigation complete');
});