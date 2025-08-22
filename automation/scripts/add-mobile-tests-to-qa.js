#!/usr/bin/env node

/**
 * Add Mobile Viewport Testing to Pre-Deployment QA
 * This adds mobile responsiveness checks to catch button overflow issues
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testMobileViewports() {
  console.log('📱 Testing Mobile Viewports...');
  
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone X', width: 375, height: 812 },
    { name: 'Galaxy S20', width: 412, height: 915 }
  ];
  
  const criticalPages = [
    '/services/refinance-mortgage/1',
    '/services/borrowers-personal-data/2'
  ];
  
  const results = [];
  
  for (const viewport of viewports) {
    for (const page of criticalPages) {
      try {
        // Run Puppeteer test for mobile viewport
        const testResult = await testMobilePage(page, viewport);
        results.push(testResult);
        
        if (!testResult.passed) {
          console.log(`❌ ${viewport.name} - ${page}: Button outside viewport!`);
          console.log(`   Button bottom: ${testResult.buttonBottom}px, Viewport: ${viewport.height}px`);
        } else {
          console.log(`✅ ${viewport.name} - ${page}: OK`);
        }
      } catch (error) {
        console.log(`❌ ${viewport.name} - ${page}: ${error.message}`);
        results.push({ viewport: viewport.name, page, passed: false, error: error.message });
      }
    }
  }
  
  // Summary
  const failures = results.filter(r => !r.passed);
  if (failures.length > 0) {
    console.log('\n🚨 Mobile Issues Found:');
    failures.forEach(f => {
      console.log(`  - ${f.viewport} on ${f.page}: ${f.error || 'Button overflow'}`);
    });
    return false;
  }
  
  return true;
}

async function testMobilePage(url, viewport) {
  const puppeteer = require('puppeteer');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  // Navigate to page
  await page.goto(`http://localhost:5173${url}`, { waitUntil: 'networkidle2' });
  
  // Wait for form to load
  await page.waitForSelector('form', { timeout: 5000 });
  
  // Check button position
  const buttonCheck = await page.evaluate((viewportHeight) => {
    // Find submit/continue buttons
    const buttons = Array.from(document.querySelectorAll(
      'button[type="submit"], button:contains("המשך"), button:contains("שמור")'
    ));
    
    // Also check by common class patterns
    const moreButtons = Array.from(document.querySelectorAll(
      '[class*="submit"], [class*="continue"], [class*="next"]'
    ));
    
    const allButtons = [...buttons, ...moreButtons];
    
    const results = allButtons.map(btn => {
      const rect = btn.getBoundingClientRect();
      return {
        text: btn.innerText || btn.textContent,
        bottom: rect.bottom,
        top: rect.top,
        isVisible: rect.bottom <= viewportHeight && rect.top >= 0,
        overflow: rect.bottom - viewportHeight
      };
    });
    
    // Find the main submit button (usually last or yellow)
    const submitButton = results.find(r => 
      r.text && (r.text.includes('המשך') || r.text.includes('שמור'))
    );
    
    return {
      buttons: results,
      submitButton,
      hasOverflow: submitButton ? submitButton.overflow > 0 : false,
      buttonBottom: submitButton ? submitButton.bottom : 0
    };
  }, viewport.height);
  
  await browser.close();
  
  return {
    viewport: viewport.name,
    page: url,
    passed: !buttonCheck.hasOverflow,
    buttonBottom: buttonCheck.buttonBottom,
    ...buttonCheck
  };
}

// Quick CSS fix suggestion
function generateCSSFix() {
  return `
/* Mobile Viewport Button Fix */
@media (max-width: 768px) {
  /* Fix container to ensure buttons stay in viewport */
  .form-container,
  form {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding-bottom: 100px; /* Space for fixed button */
  }
  
  /* Make submit button sticky at bottom */
  button[type="submit"],
  .submit-button,
  .continue-button {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    margin: 0;
    border-radius: 0;
    z-index: 1000;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }
  
  /* Ensure content doesn't go under button */
  .form-content {
    padding-bottom: 80px;
  }
  
  /* RTL support */
  html[dir="rtl"] button[type="submit"] {
    left: auto;
    right: 0;
  }
  
  /* Specific fix for refinance mortgage */
  .refinance-mortgage-form {
    padding-bottom: 120px !important;
  }
}

/* iPhone specific fixes */
@media (max-width: 414px) and (max-height: 896px) {
  .form-container {
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }
  
  button[type="submit"] {
    bottom: env(safe-area-inset-bottom, 0);
  }
}
`;
}

// Run test if executed directly
if (require.main === module) {
  testMobileViewports().then(passed => {
    if (!passed) {
      console.log('\n📝 Suggested CSS Fix:');
      console.log(generateCSSFix());
      process.exit(1);
    }
    console.log('\n✅ All mobile viewport tests passed!');
    process.exit(0);
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testMobileViewports, generateCSSFix };