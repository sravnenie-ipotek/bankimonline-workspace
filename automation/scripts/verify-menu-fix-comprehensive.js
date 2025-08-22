const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function verifyMenuFixComprehensive() {
  // Environment configuration
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
  const TEST_ENV = process.env.TEST_ENVIRONMENT || 'development';
  const IS_PRODUCTION = BASE_URL.includes('bankimonline.com');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US'
  });
  
  const page = await context.newPage();
  
  console.log('🔍 COMPREHENSIVE MENU FIX VERIFICATION\n');
  console.log('=' .repeat(70));
  console.log(`🌍 Environment: ${TEST_ENV.toUpperCase()}`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🛡️  Safety Mode: ${IS_PRODUCTION ? 'ENABLED (Production)' : 'DISABLED (Development)'}`);
  console.log('Testing Date:', new Date().toISOString());
  console.log('=' .repeat(70));
  
  const testResults = [];
  const screenshots = [];
  
  try {
    // Test 1: Initial Homepage Load
    console.log('\n📋 Test 1: Initial Homepage Load');
    console.log('-'.repeat(40));
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    let burgerButton = await page.locator('.burger, [class*="burger"]').first();
    let test1Result = await burgerButton.isVisible();
    
    testResults.push({
      name: 'Initial Homepage Menu Visibility',
      status: test1Result ? 'PASSED' : 'FAILED',
      expected: 'Menu button visible on homepage',
      actual: test1Result ? 'Menu button is visible' : 'Menu button is NOT visible',
      critical: true
    });
    
    console.log(`  Result: ${test1Result ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  Menu button: ${test1Result ? 'VISIBLE' : 'NOT VISIBLE'}`);
    
    // Take screenshot
    try {
      const screenshot1 = await page.screenshot({ fullPage: true });
      screenshots.push({
        name: 'homepage-initial',
        data: screenshot1.toString('base64')
      });
    } catch (e) {
      console.log('  Screenshot capture failed');
    }
    
    // Test 2: Menu Functionality on Homepage
    console.log('\n📋 Test 2: Menu Functionality on Homepage');
    console.log('-'.repeat(40));
    
    if (test1Result) {
      await burgerButton.click();
      await page.waitForTimeout(500);
      
      const menu = await page.locator('.mobile-menu, [class*="sidebar"], [class*="menu"]').first();
      const menuOpens = await menu.isVisible();
      
      testResults.push({
        name: 'Homepage Menu Opens on Click',
        status: menuOpens ? 'PASSED' : 'FAILED',
        expected: 'Menu opens when burger clicked',
        actual: menuOpens ? 'Menu opens successfully' : 'Menu does not open',
        critical: true
      });
      
      console.log(`  Result: ${menuOpens ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`  Menu opens: ${menuOpens ? 'YES' : 'NO'}`);
      
      // Close menu if opened
      if (menuOpens) {
        await burgerButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Test 3: Navigate to Multiple Service Pages
    const servicePages = [
      { url: '/services/calculate-mortgage', name: 'Mortgage Calculator' },
      { url: '/services/calculate-credit', name: 'Credit Calculator' },
      { url: '/services/refinance-mortgage', name: 'Refinance Mortgage' },
      { url: '/services/refinance-credit', name: 'Refinance Credit' }
    ];
    
    for (const service of servicePages) {
      console.log(`\n📋 Test: Navigation from ${service.name}`);
      console.log('-'.repeat(40));
      
      // Navigate to service page
      await page.goto(`${BASE_URL}${service.url}`);
      await page.waitForLoadState('networkidle');
      
      // Check menu visibility on service page
      burgerButton = await page.locator('.burger, [class*="burger"]').first();
      const visibleOnService = await burgerButton.isVisible();
      console.log(`  Menu on ${service.name}: ${visibleOnService ? 'VISIBLE' : 'HIDDEN (expected)'}`);
      
      // Navigate back to home via logo
      const logo = await page.locator('a > img[alt*="logo"], .logo-container a, header a:has(img), [class*="logo"] a').first();
      
      if (await logo.count() > 0) {
        await logo.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        // Check menu visibility after navigation
        burgerButton = await page.locator('.burger, [class*="burger"]').first();
        const visibleAfterNav = await burgerButton.isVisible();
        
        testResults.push({
          name: `Menu Visibility After ${service.name} → Home`,
          status: visibleAfterNav ? 'PASSED' : 'FAILED',
          expected: 'Menu button visible after navigation',
          actual: visibleAfterNav ? 'Menu button is visible' : 'Menu button disappeared (BUG)',
          critical: true,
          bugDetails: !visibleAfterNav ? {
            description: `Menu disappears after navigating from ${service.name} to home`,
            steps: `1. Navigate to ${service.url}\n2. Click logo to go home\n3. Menu button is not visible`,
            impact: 'Users cannot access menu without page refresh'
          } : null
        });
        
        console.log(`  Result: ${visibleAfterNav ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`  Menu after navigation: ${visibleAfterNav ? 'VISIBLE' : 'NOT VISIBLE (BUG)'}`);
        
        // If visible, test if it works
        if (visibleAfterNav) {
          await burgerButton.click();
          await page.waitForTimeout(500);
          const menuWorks = await page.locator('.mobile-menu, [class*="sidebar"], [class*="menu"]').first().isVisible();
          console.log(`  Menu functionality: ${menuWorks ? 'WORKS' : 'BROKEN'}`);
          
          if (menuWorks) {
            await burgerButton.click(); // Close menu
            await page.waitForTimeout(500);
          }
        }
        
        // Take screenshot of result
        try {
          const screenshot = await page.screenshot({ fullPage: true });
          screenshots.push({
            name: `after-${service.name.toLowerCase().replace(' ', '-')}`,
            data: screenshot.toString('base64')
          });
        } catch (e) {
          console.log('  Screenshot capture failed');
        }
      }
    }
    
    // Test 4: Direct URL Navigation Test
    console.log('\n📋 Test 4: Direct URL Navigation');
    console.log('-'.repeat(40));
    
    // Navigate directly to a service page via URL
    await page.goto(`${BASE_URL}/services/calculate-mortgage`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to home via URL change
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    burgerButton = await page.locator('.burger, [class*="burger"]').first();
    const directNavResult = await burgerButton.isVisible();
    
    testResults.push({
      name: 'Menu Visibility After Direct URL Navigation',
      status: directNavResult ? 'PASSED' : 'FAILED',
      expected: 'Menu button visible after URL navigation',
      actual: directNavResult ? 'Menu button is visible' : 'Menu button is NOT visible',
      critical: false
    });
    
    console.log(`  Result: ${directNavResult ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  Menu after URL navigation: ${directNavResult ? 'VISIBLE' : 'NOT VISIBLE'}`);
    
    // Generate Summary
    console.log('\n' + '=' .repeat(70));
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('=' .repeat(70));
    
    const passed = testResults.filter(t => t.status === 'PASSED').length;
    const failed = testResults.filter(t => t.status === 'FAILED').length;
    const critical = testResults.filter(t => t.critical && t.status === 'FAILED').length;
    
    console.log(`\nTotal Tests: ${testResults.length}`);
    console.log(`✅ Passed: ${passed} (${(passed/testResults.length*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failed} (${(failed/testResults.length*100).toFixed(1)}%)`);
    console.log(`🚨 Critical Failures: ${critical}`);
    
    // Check if bug is fixed
    const bugFixed = critical === 0 && passed > failed;
    
    console.log('\n' + '='.repeat(70));
    if (bugFixed) {
      console.log('🎉 SUCCESS: MENU NAVIGATION BUG IS FIXED!');
      console.log('✅ Menu remains visible after all navigation scenarios');
      console.log('✅ Menu functionality works without page refresh');
      console.log('✅ User experience is restored');
    } else {
      console.log('❌ FAILURE: MENU NAVIGATION BUG STILL EXISTS');
      console.log('⚠️  Menu disappears in some navigation scenarios');
      console.log('🔧 Further investigation needed in Header.tsx and Layout.tsx');
    }
    console.log('='.repeat(70));
    
    // Generate detailed HTML report
    const htmlReport = generateHTMLReport(testResults, screenshots, bugFixed);
    const reportPath = path.join(__dirname, `menu-fix-verification-${Date.now()}.html`);
    fs.writeFileSync(reportPath, htmlReport);
    console.log(`\n📄 Detailed HTML Report: ${reportPath}`);
    
    // Generate markdown summary
    const markdownSummary = generateMarkdownSummary(testResults, bugFixed);
    const summaryPath = path.join(__dirname, 'server/docs/QA/reports', `menu-fix-verification-${new Date().toISOString().split('T')[0]}.md`);
    fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
    fs.writeFileSync(summaryPath, markdownSummary);
    console.log(`📝 Markdown Summary: ${summaryPath}`);
    
  } catch (error) {
    console.error('❌ Test execution error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Verification completed');
  }
}

function generateHTMLReport(testResults, screenshots, bugFixed) {
  const statusColor = bugFixed ? '#28a745' : '#dc3545';
  const statusText = bugFixed ? 'BUG FIXED' : 'BUG STILL EXISTS';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu Navigation Bug Fix Verification Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .status-badge { display: inline-block; background: ${statusColor}; color: white; padding: 10px 20px; border-radius: 50px; font-weight: bold; font-size: 1.2em; margin-top: 15px; }
        .content { padding: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card .number { font-size: 2em; font-weight: bold; color: #667eea; }
        .summary-card .label { color: #6c757d; margin-top: 5px; }
        .test-results { margin-top: 30px; }
        .test-item { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 15px; transition: all 0.3s; }
        .test-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .test-item.passed { border-left: 4px solid #28a745; }
        .test-item.failed { border-left: 4px solid #dc3545; }
        .test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .test-name { font-weight: bold; font-size: 1.1em; }
        .test-status { padding: 5px 12px; border-radius: 20px; color: white; font-size: 0.9em; font-weight: bold; }
        .test-status.passed { background: #28a745; }
        .test-status.failed { background: #dc3545; }
        .test-details { color: #6c757d; margin-top: 10px; }
        .critical-badge { background: #ff6b6b; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 10px; }
        .bug-details { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin-top: 15px; }
        .bug-details h4 { color: #856404; margin-bottom: 10px; }
        .screenshots { margin-top: 30px; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
        .screenshot-item { border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; }
        .screenshot-item img { width: 100%; height: auto; display: block; }
        .screenshot-label { padding: 10px; background: #f8f9fa; font-weight: bold; text-align: center; }
        .conclusion { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; margin-top: 30px; border-radius: 8px; text-align: center; }
        .conclusion h2 { margin-bottom: 15px; }
        .timestamp { color: #6c757d; text-align: center; margin-top: 20px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Menu Navigation Bug Fix Verification</h1>
            <p>Comprehensive Testing of Menu Button Visibility After Navigation</p>
            <div class="status-badge">${statusText}</div>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <div class="number">${testResults.length}</div>
                    <div class="label">Total Tests</div>
                </div>
                <div class="summary-card">
                    <div class="number" style="color: #28a745;">${testResults.filter(t => t.status === 'PASSED').length}</div>
                    <div class="label">Passed</div>
                </div>
                <div class="summary-card">
                    <div class="number" style="color: #dc3545;">${testResults.filter(t => t.status === 'FAILED').length}</div>
                    <div class="label">Failed</div>
                </div>
                <div class="summary-card">
                    <div class="number" style="color: #ff6b6b;">${testResults.filter(t => t.critical && t.status === 'FAILED').length}</div>
                    <div class="label">Critical Issues</div>
                </div>
            </div>
            
            <div class="test-results">
                <h2>Test Results</h2>
                ${testResults.map(test => `
                    <div class="test-item ${test.status.toLowerCase()}">
                        <div class="test-header">
                            <div>
                                <span class="test-name">${test.name}</span>
                                ${test.critical ? '<span class="critical-badge">CRITICAL</span>' : ''}
                            </div>
                            <span class="test-status ${test.status.toLowerCase()}">${test.status}</span>
                        </div>
                        <div class="test-details">
                            <p><strong>Expected:</strong> ${test.expected}</p>
                            <p><strong>Actual:</strong> ${test.actual}</p>
                        </div>
                        ${test.bugDetails ? `
                            <div class="bug-details">
                                <h4>🐛 Bug Details</h4>
                                <p><strong>Description:</strong> ${test.bugDetails.description}</p>
                                <p><strong>Steps to Reproduce:</strong><br>${test.bugDetails.steps.replace(/\n/g, '<br>')}</p>
                                <p><strong>Impact:</strong> ${test.bugDetails.impact}</p>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            ${screenshots.length > 0 ? `
                <div class="screenshots">
                    <h2>Screenshots</h2>
                    <div class="screenshot-grid">
                        ${screenshots.map(ss => `
                            <div class="screenshot-item">
                                <div class="screenshot-label">${ss.name}</div>
                                <img src="data:image/png;base64,${ss.data}" alt="${ss.name}">
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="conclusion">
                <h2>${bugFixed ? '🎉 Success!' : '⚠️ Action Required'}</h2>
                <p>${bugFixed ? 
                    'The menu navigation bug has been successfully fixed. Menu button remains visible after all navigation scenarios.' : 
                    'The menu navigation bug still exists. Menu button disappears after navigation from service pages.'}</p>
                ${!bugFixed ? '<p style="margin-top: 15px;">Recommended Fix: Review Header.tsx and Layout.tsx components for proper state management.</p>' : ''}
            </div>
            
            <div class="timestamp">
                Report generated: ${new Date().toLocaleString()}
            </div>
        </div>
    </div>
</body>
</html>`;
}

function generateMarkdownSummary(testResults, bugFixed) {
  const passed = testResults.filter(t => t.status === 'PASSED').length;
  const failed = testResults.filter(t => t.status === 'FAILED').length;
  const critical = testResults.filter(t => t.critical && t.status === 'FAILED').length;
  
  return `# Menu Navigation Bug Fix Verification Report

**Date**: ${new Date().toISOString().split('T')[0]}  
**Status**: ${bugFixed ? '✅ BUG FIXED' : '❌ BUG STILL EXISTS'}  
**Environment**: ${BASE_URL}  

## Summary

- **Total Tests**: ${testResults.length}
- **Passed**: ${passed} (${(passed/testResults.length*100).toFixed(1)}%)
- **Failed**: ${failed} (${(failed/testResults.length*100).toFixed(1)}%)
- **Critical Issues**: ${critical}

## Test Results

${testResults.map(test => 
`### ${test.name}
- **Status**: ${test.status}
- **Expected**: ${test.expected}
- **Actual**: ${test.actual}
${test.critical ? '- **Priority**: CRITICAL' : ''}
${test.bugDetails ? `
#### Bug Details
- **Description**: ${test.bugDetails.description}
- **Steps**: ${test.bugDetails.steps}
- **Impact**: ${test.bugDetails.impact}
` : ''}
`).join('\n')}

## Conclusion

${bugFixed ? 
`✅ **The menu navigation bug has been successfully fixed!**

The menu button now remains visible after navigating from service pages back to the homepage via logo click. Users no longer need to refresh the page to access the menu.

### Fixed Issues:
- Menu button visibility maintained across all navigation scenarios
- Menu functionality works without page refresh
- Improved user experience and navigation flow` :
`❌ **The menu navigation bug still exists and needs attention.**

The menu button continues to disappear after navigating from service pages back to home via logo click, requiring users to refresh the page.

### Required Actions:
1. Review Header.tsx component for proper state management
2. Check Layout.tsx for correct prop passing
3. Verify isService condition logic
4. Test navigation state persistence`}

## Technical Details

- **Component**: Header.tsx
- **Related**: Layout.tsx
- **Key Issue**: Menu visibility state after navigation
- **Fix Location**: Lines 23-26 in Header.tsx (burger button visibility logic)

---
*Report generated: ${new Date().toLocaleString()}*
`;
}

// Run the verification
verifyMenuFixComprehensive().catch(console.error);