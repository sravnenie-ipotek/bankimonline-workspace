const { chromium } = require('playwright');

(async () => {
  console.log('🌐 Testing Language Support...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5175/services/application-submitted');
    await page.waitForTimeout(2000);
    
    // Test Hebrew (default)
    console.log('✅ Test 1: Hebrew (default language)');
    const heTitle = await page.locator('h2').textContent();
    const heBodyClass = await page.locator('body').getAttribute('class');
    console.log(`   Title: "${heTitle}"`);
    console.log(`   Body class: ${heBodyClass}`);
    console.log(`   Hebrew working: ${heTitle?.includes('הבקשה') && heBodyClass?.includes('rtl') ? '✅ YES' : '❌ NO'}`);
    
    // Test English
    console.log('\n✅ Test 2: Switching to English');
    await page.evaluate(() => {
      window.i18n.changeLanguage('en');
    });
    await page.waitForTimeout(1000);
    
    const enTitle = await page.locator('h2').textContent();
    const enBodyClass = await page.locator('body').getAttribute('class');
    console.log(`   Title: "${enTitle}"`);
    console.log(`   Body class: ${enBodyClass}`);
    console.log(`   English working: ${enTitle?.includes('Application Submitted') && enBodyClass?.includes('ltr') ? '✅ YES' : '❌ NO'}`);
    
    // Test Russian
    console.log('\n✅ Test 3: Switching to Russian');
    await page.evaluate(() => {
      window.i18n.changeLanguage('ru');
    });
    await page.waitForTimeout(1000);
    
    const ruTitle = await page.locator('h2').textContent();
    const ruBodyClass = await page.locator('body').getAttribute('class');
    console.log(`   Title: "${ruTitle}"`);
    console.log(`   Body class: ${ruBodyClass}`);
    console.log(`   Russian working: ${ruTitle?.includes('Заявка успешно') && ruBodyClass?.includes('ltr') ? '✅ YES' : '❌ NO'}`);
    
    // Back to Hebrew
    console.log('\n✅ Test 4: Back to Hebrew');
    await page.evaluate(() => {
      window.i18n.changeLanguage('he');
    });
    await page.waitForTimeout(1000);
    
    const backHeTitle = await page.locator('h2').textContent();
    const backHeBodyClass = await page.locator('body').getAttribute('class');
    console.log(`   Title: "${backHeTitle}"`);
    console.log(`   Body class: ${backHeBodyClass}`);
    console.log(`   Back to Hebrew working: ${backHeTitle?.includes('הבקשה') && backHeBodyClass?.includes('rtl') ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n🌐 Language testing completed!');
    
  } catch (error) {
    console.error('❌ Language test failed:', error.message);
  } finally {
    await browser.close();
  }
})();