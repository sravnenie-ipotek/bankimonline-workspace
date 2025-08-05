const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Starting ApplicationSubmitted Manual Testing...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test 1: Navigate to the application submitted page
    console.log('✅ Test 1: Navigating to ApplicationSubmitted page...');
    await page.goto('http://localhost:5175/services/application-submitted');
    await page.waitForTimeout(2000);
    
    // Test 2: Check page title and basic elements
    console.log('✅ Test 2: Checking page elements...');
    const title = await page.title();
    console.log(`   Page title: ${title}`);
    
    // Check if success icon exists
    const successIcon = await page.locator('[role="img"][aria-label="Success"]').count();
    console.log(`   Success icon present: ${successIcon > 0 ? '✅ YES' : '❌ NO'}`);
    
    // Check if title exists
    const pageTitle = await page.locator('h2').count();
    console.log(`   H2 title present: ${pageTitle > 0 ? '✅ YES' : '❌ NO'}`);
    
    // Check if description exists
    const description = await page.locator('p').count();
    console.log(`   Description present: ${description > 0 ? '✅ YES' : '❌ NO'}`);
    
    // Check if button exists
    const button = await page.locator('a[href="/personal-cabinet"]').count();
    console.log(`   Navigation button present: ${button > 0 ? '✅ YES' : '❌ NO'}`);
    
    // Test 3: Check Hebrew RTL layout
    console.log('\n✅ Test 3: Checking RTL layout...');
    const bodyClass = await page.locator('body').getAttribute('class');
    const htmlDir = await page.locator('html').getAttribute('dir');
    console.log(`   Body class: ${bodyClass}`);
    console.log(`   HTML direction: ${htmlDir}`);
    console.log(`   RTL properly set: ${bodyClass?.includes('rtl') && htmlDir === 'rtl' ? '✅ YES' : '❌ NO'}`);
    
    // Test 4: Check text content (Hebrew)
    console.log('\n✅ Test 4: Checking Hebrew text content...');
    const titleText = await page.locator('h2').textContent();
    const descText = await page.locator('p').textContent();
    const buttonText = await page.locator('a[href="/personal-cabinet"]').textContent();
    
    console.log(`   Title text: "${titleText}"`);
    console.log(`   Description text: "${descText}"`);
    console.log(`   Button text: "${buttonText}"`);
    
    const hasHebrewTitle = titleText?.includes('הבקשה נשלחה בהצלחה');
    const hasHebrewDesc = descText?.includes('נציגינו יצרו איתך קשר בקרוב');
    const hasHebrewButton = buttonText?.includes('מעבר להתכתבויות');
    
    console.log(`   Hebrew title correct: ${hasHebrewTitle ? '✅ YES' : '❌ NO'}`);
    console.log(`   Hebrew description correct: ${hasHebrewDesc ? '✅ YES' : '❌ NO'}`);
    console.log(`   Hebrew button correct: ${hasHebrewButton ? '✅ YES' : '❌ NO'}`);
    
    // Test 5: Test button click navigation
    console.log('\n✅ Test 5: Testing button navigation...');
    await page.click('a[href="/personal-cabinet"]');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    const has404 = await page.locator('text=404 - Page Not Found').count();
    
    console.log(`   Current URL: ${currentUrl}`);
    console.log(`   Navigation successful: ${currentUrl.includes('/personal-cabinet') ? '✅ YES' : '❌ NO'}`);
    console.log(`   404 page shown (expected): ${has404 > 0 ? '✅ YES' : '❌ NO'}`);
    
    // Test 6: Mobile viewport test
    console.log('\n✅ Test 6: Testing mobile viewport...');
    await page.goto('http://localhost:5175/services/application-submitted');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileSuccessIcon = await page.locator('[role="img"][aria-label="Success"]').isVisible();
    const mobileTitle = await page.locator('h2').isVisible();
    const mobileButton = await page.locator('a[href="/personal-cabinet"]').isVisible();
    
    console.log(`   Mobile success icon visible: ${mobileSuccessIcon ? '✅ YES' : '❌ NO'}`);
    console.log(`   Mobile title visible: ${mobileTitle ? '✅ YES' : '❌ NO'}`);
    console.log(`   Mobile button visible: ${mobileButton ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n🎉 Manual testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();