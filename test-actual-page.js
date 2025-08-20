const puppeteer = require('puppeteer');

async function testActualPage() {
    console.log('🔍 Testing Actual Page Content for Translation Issues\n');
    console.log('=' .repeat(60));
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Navigate to refinance page
        await page.goto('http://localhost:5173/services/refinance-mortgage/1', {
            waitUntil: 'networkidle2'
        });
        
        await page.waitForTimeout(2000);
        
        // Get all text content
        const pageContent = await page.evaluate(() => {
            return document.body.innerText;
        });
        
        // Check for untranslated keys
        console.log('\n📋 Checking for untranslated keys...\n');
        
        const untranslatedKeys = [
            'app.refinance.step1.title',
            'app.refinance.step1.property_value_label',
            'app.refinance.step1.balance_label'
        ];
        
        const foundIssues = [];
        
        untranslatedKeys.forEach(key => {
            if (pageContent.includes(key)) {
                foundIssues.push(key);
                console.log(`❌ FOUND UNTRANSLATED KEY: ${key}`);
            }
        });
        
        // Get all elements that might contain translation keys
        const elementsWithKeys = await page.evaluate(() => {
            const elements = [];
            const allElements = document.querySelectorAll('*');
            
            allElements.forEach(el => {
                const text = el.textContent?.trim();
                if (text && text.includes('app.') && text.includes('.step1.')) {
                    elements.push({
                        tag: el.tagName.toLowerCase(),
                        class: el.className,
                        text: text.substring(0, 100)
                    });
                }
            });
            
            return elements;
        });
        
        if (elementsWithKeys.length > 0) {
            console.log('\n📋 Elements with translation keys:');
            elementsWithKeys.forEach(el => {
                console.log(`  - <${el.tag} class="${el.class}">`);
                console.log(`    Text: "${el.text}"`);
            });
        }
        
        // Check specific labels
        const labels = await page.evaluate(() => {
            const labelElements = document.querySelectorAll('label, .form-caption, h1, h2, h3');
            const labelTexts = [];
            
            labelElements.forEach(el => {
                const text = el.textContent?.trim();
                if (text) {
                    labelTexts.push(text);
                }
            });
            
            return labelTexts;
        });
        
        console.log('\n📋 All labels found on page:');
        labels.forEach((label, i) => {
            if (label.includes('app.') || label.includes('refinance')) {
                console.log(`  ${i + 1}. "${label}" ${label.includes('app.') ? '❌ UNTRANSLATED' : ''}`);
            }
        });
        
        // Take screenshot
        await page.screenshot({ 
            path: 'refinance-page-actual.png',
            fullPage: true
        });
        
        console.log('\n📸 Screenshot saved: refinance-page-actual.png');
        
        if (foundIssues.length > 0) {
            console.log('\n⚠️ CRITICAL ISSUES FOUND:');
            console.log(`  - ${foundIssues.length} untranslated keys visible on page`);
            console.log('  - These should be showing Hebrew translations instead');
            console.log('\n❌ TEST SHOULD HAVE FAILED!');
        } else {
            console.log('\n✅ No untranslated keys found in page content');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

testActualPage();