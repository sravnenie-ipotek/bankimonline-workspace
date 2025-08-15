import { test, expect } from '@playwright/test';

test('🔍 Mortgage Investigation - Wait for Translations', async ({ page }) => {
  console.log('🚀 Starting investigation with translation loading...');
  
  // Navigate to the page
  await page.goto('http://localhost:5173/services/calculate-mortgage/1', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  console.log('📄 Current URL:', page.url());
  
  // Wait for React app to show loading state
  await page.waitForFunction(
    () => document.querySelector('#root')?.innerHTML.length > 100,
    { timeout: 15000 }
  );
  
  console.log('✅ React app started loading');
  
  // Take screenshot of loading state
  await page.screenshot({ path: 'test-results/loading-state.png' });
  console.log('📷 Loading state captured');
  
  // Wait for translations to finish loading - look for the loading message to disappear
  try {
    console.log('⏳ Waiting for translations to load...');
    
    // Wait for the loading message to disappear (max 30 seconds)
    await page.waitForFunction(
      () => {
        const body = document.body.textContent;
        return body && !body.includes('Loading translations') && body.trim() !== 'You need to enable JavaScript to run this app.';
      },
      { timeout: 30000 }
    );
    
    console.log('✅ Translations loaded successfully');
    
  } catch (error) {
    console.log('⚠️ Timeout waiting for translations, continuing with current state...');
    
    // Take screenshot of stuck state
    await page.screenshot({ path: 'test-results/translation-timeout.png' });
  }
  
  // Wait a bit more for UI to stabilize
  await page.waitForTimeout(3000);
  
  // Take final screenshot
  await page.screenshot({ path: 'test-results/final-state.png', fullPage: true });
  console.log('📷 Final state captured');
  
  // Get current page content
  const bodyText = await page.textContent('body');
  console.log('📝 Body text length:', bodyText?.length);
  
  if (bodyText) {
    const firstWords = bodyText.trim().substring(0, 300);
    console.log('📝 First 300 characters:', firstWords);
    
    // Check for mortgage-related content
    const hasPropertyText = bodyText.toLowerCase().includes('property') || 
                           bodyText.includes('נכס') || 
                           bodyText.includes('недвижимость');
    const hasMortgageText = bodyText.toLowerCase().includes('mortgage') || 
                           bodyText.includes('משכנתא') || 
                           bodyText.includes('ипотека');
    
    console.log('🔍 Content Analysis:');
    console.log('  Contains property-related text:', hasPropertyText);
    console.log('  Contains mortgage-related text:', hasMortgageText);
  }
  
  // Now try to find form elements
  try {
    const inputs = await page.$$('input');
    console.log(`📝 Found ${inputs.length} input elements`);
    
    for (let i = 0; i < Math.min(inputs.length, 10); i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const testId = await input.getAttribute('data-testid');
      const id = await input.getAttribute('id');
      
      console.log(`  Input ${i + 1}: type=${type}, name=${name}, testId=${testId}, id=${id}, placeholder="${placeholder}"`);
    }
  } catch (e) {
    console.log('❌ Error finding inputs:', e);
  }
  
  try {
    const selects = await page.$$('select');
    console.log(`📝 Found ${selects.length} select elements`);
    
    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      const name = await select.getAttribute('name');
      const testId = await select.getAttribute('data-testid');
      const id = await select.getAttribute('id');
      
      console.log(`  Select ${i + 1}: name=${name}, testId=${testId}, id=${id}`);
      
      try {
        const options = await select.$$('option');
        console.log(`    Found ${options.length} options`);
        
        for (let j = 0; j < Math.min(options.length, 5); j++) {
          const optionText = await options[j].textContent();
          const optionValue = await options[j].getAttribute('value');
          console.log(`      Option ${j + 1}: value="${optionValue}", text="${optionText?.trim()}"`);
        }
      } catch (optionError) {
        console.log('    Error reading options');
      }
    }
  } catch (e) {
    console.log('❌ Error finding selects:', e);
  }
  
  try {
    const buttons = await page.$$('button');
    console.log(`📝 Found ${buttons.length} button elements`);
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const testId = await button.getAttribute('data-testid');
      
      console.log(`  Button ${i + 1}: type=${type}, testId=${testId}, text="${text?.trim()}"`);
    }
  } catch (e) {
    console.log('❌ Error finding buttons:', e);
  }
  
  // Look for slider/range inputs
  try {
    const ranges = await page.$$('input[type="range"]');
    console.log(`📝 Found ${ranges.length} range/slider inputs`);
  } catch (e) {
    console.log('❌ Error finding range inputs:', e);
  }
  
  // Check for common CSS class names or patterns
  try {
    const elementsWithClasses = await page.$$('[class*="mortgage"], [class*="property"], [class*="loan"], [class*="slider"]');
    console.log(`📝 Found ${elementsWithClasses.length} elements with mortgage/property/loan/slider in class names`);
  } catch (e) {
    console.log('❌ Error searching by class names:', e);
  }
  
  console.log('✅ Investigation complete with translation loading');
});