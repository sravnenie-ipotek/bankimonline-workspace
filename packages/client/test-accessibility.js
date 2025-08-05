const { chromium } = require('playwright');

(async () => {
  console.log('♿ Testing Accessibility...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5175/services/application-submitted');
    await page.waitForTimeout(2000);
    
    // Test 1: ARIA attributes
    console.log('✅ Test 1: ARIA attributes');
    const successIcon = await page.locator('[role="img"][aria-label="Success"]');
    const iconExists = await successIcon.count() > 0;
    const iconLabel = await successIcon.getAttribute('aria-label');
    console.log(`   Success icon has role and aria-label: ${iconExists ? '✅ YES' : '❌ NO'}`);
    console.log(`   Aria-label text: "${iconLabel}"`);
    
    // Test 2: Heading structure
    console.log('\n✅ Test 2: Heading structure');
    const h2Count = await page.locator('h2').count();
    const h1Count = await page.locator('h1').count();
    console.log(`   H2 headings present: ${h2Count > 0 ? '✅ YES' : '❌ NO'} (${h2Count})`);
    console.log(`   H1 headings: ${h1Count} (should be 0 for component)`);
    
    // Test 3: Keyboard navigation
    console.log('\n✅ Test 3: Keyboard navigation');
    const button = page.locator('a[href="/personal-cabinet"]');
    
    // Test if button is focusable
    await button.focus();
    const isFocused = await button.evaluate(el => document.activeElement === el);
    console.log(`   Button is focusable: ${isFocused ? '✅ YES' : '❌ NO'}`);
    
    // Test if button has visible focus indicator
    const focusOutline = await button.evaluate(el => {
      const style = window.getComputedStyle(el, ':focus');
      return style.outline !== 'none' || style.boxShadow !== 'none';
    });
    console.log(`   Button has focus indicator: ${focusOutline ? '✅ YES' : '❌ NO'}`);
    
    // Test 4: Color contrast (basic check)
    console.log('\n✅ Test 4: Color contrast');
    const titleColor = await page.locator('h2').evaluate(el => {
      const style = window.getComputedStyle(el);
      return { color: style.color, backgroundColor: style.backgroundColor };
    });
    
    const buttonColors = await button.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { color: style.color, backgroundColor: style.backgroundColor };
    });
    
    console.log(`   Title colors: ${JSON.stringify(titleColor)}`);
    console.log(`   Button colors: ${JSON.stringify(buttonColors)}`);
    console.log(`   High contrast design: ${titleColor.color.includes('255') && buttonColors.backgroundColor.includes('251') ? '✅ YES' : '⚠️  MANUAL CHECK NEEDED'}`);
    
    // Test 5: Semantic HTML
    console.log('\n✅ Test 5: Semantic HTML structure');
    const semanticElements = {
      main: await page.locator('main').count(),
      article: await page.locator('article').count(),
      section: await page.locator('section').count(),
      div: await page.locator('div').count(),
      h2: await page.locator('h2').count(),
      p: await page.locator('p').count()
    };
    
    console.log(`   Semantic structure: ${JSON.stringify(semanticElements)}`);
    console.log(`   Uses div containers: ${semanticElements.div > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`   Has heading hierarchy: ${semanticElements.h2 > 0 ? '✅ YES' : '❌ NO'}`);
    
    // Test 6: Text readability
    console.log('\n✅ Test 6: Text readability');
    const titleText = await page.locator('h2').textContent();
    const descText = await page.locator('p').textContent();
    const buttonText = await button.textContent();
    
    console.log(`   Title length: ${titleText?.length || 0} chars`);
    console.log(`   Description length: ${descText?.length || 0} chars`);
    console.log(`   Button text length: ${buttonText?.length || 0} chars`);
    console.log(`   Text content appropriate: ${(titleText?.length || 0) > 5 && (descText?.length || 0) > 10 ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n♿ Accessibility testing completed!');
    
  } catch (error) {
    console.error('❌ Accessibility test failed:', error.message);
  } finally {
    await browser.close();
  }
})();