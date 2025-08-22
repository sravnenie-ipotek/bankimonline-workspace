#!/usr/bin/env node

/**
 * BrowserStack Production Mobile Testing
 * Tests mobile button fixes on production/staging URLs
 * ONLY for non-localhost URLs that BrowserStack can access
 */

const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME || 'bankim_bDR9eZP4Bb2';
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || 'DwWqjFesqgUNTZqrddhV';

// Production/Staging URLs (NOT localhost)
const PRODUCTION_URLS = {
  // Add your actual production URLs here
  production: 'https://your-railway-app.up.railway.app',
  staging: 'https://your-staging-url.com',
  preview: 'https://your-preview-deploy.netlify.app',
  ngrok: 'https://abcd1234.ngrok.io' // If using ngrok tunnel
};

const CRITICAL_MOBILE_DEVICES = [
  {
    name: 'iPhone 15 Pro',
    os: 'ios',
    osVersion: '17',
    deviceName: 'iPhone 15 Pro',
    browserName: 'safari',
    viewport: { width: 393, height: 852 },
    critical: true
  },
  {
    name: 'iPhone SE 2022',
    os: 'ios', 
    osVersion: '15',
    deviceName: 'iPhone SE 2022',
    browserName: 'safari',
    viewport: { width: 375, height: 667 },
    critical: true,
    note: 'Smallest screen - most likely to show overflow'
  },
  {
    name: 'Samsung Galaxy S23',
    os: 'android',
    osVersion: '13.0',
    deviceName: 'Samsung Galaxy S23',
    browserName: 'chrome',
    viewport: { width: 360, height: 780 },
    critical: true
  }
];

const BANKING_TEST_PATHS = [
  '/services/calculate-mortgage/1',
  '/services/calculate-credit/1', 
  '/personal-cabinet',
  '/' // Homepage
];

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

async function createDriver(device) {
  const capabilities = {
    'bstack:options': {
      os: device.os,
      osVersion: device.osVersion,
      deviceName: device.deviceName,
      realMobile: 'true',
      projectName: 'Banking App - Production Mobile Testing',
      buildName: 'Mobile Button Overflow Fixes - Production',
      sessionName: \`\${device.name} - Production Button Validation\`,
      userName: BROWSERSTACK_USERNAME,
      accessKey: BROWSERSTACK_ACCESS_KEY,
      debug: 'true',
      consoleLogs: 'verbose',
      networkLogs: 'true'
    },
    browserName: device.browserName
  };

  return new Builder()
    .usingServer('https://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();
}

async function testProductionURL(baseUrl, environment = 'production') {
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    throw new Error('❌ BrowserStack cannot access localhost URLs. Use production/staging URLs only.');
  }

  log(\`🌐 Testing Production URL: \${baseUrl}\`, '\x1b[1m\x1b[34m');
  log(\`📱 Environment: \${environment.toUpperCase()}\`, '\x1b[36m');
  
  const results = [];
  
  for (const device of CRITICAL_MOBILE_DEVICES) {
    if (!device.critical) continue;
    
    log(\`\\n📱 Testing \${device.name} (\${device.viewport.width}x\${device.viewport.height})\`, '\x1b[1m\x1b[36m');
    
    let driver = null;
    
    try {
      driver = await createDriver(device);
      log('  ✅ BrowserStack session created', '\x1b[32m');
      
      for (const testPath of BANKING_TEST_PATHS) {
        const fullUrl = \`\${baseUrl}\${testPath}\`;
        
        try {
          log(\`  🧪 Testing: \${testPath}\`, '\x1b[33m');
          
          // Navigate to page
          await driver.get(fullUrl);
          
          // Wait for page load (with timeout)
          try {
            await driver.wait(until.titleContains('בנק'), 5000);
          } catch {
            // Title might be different, continue anyway
            log('    ⚠️  Title check skipped', '\x1b[33m');
          }
          
          // Allow page to fully render
          await driver.sleep(3000);
          
          // Analyze button positioning
          const buttonAnalysis = await driver.executeScript(\`
            const viewport = { width: window.innerWidth, height: window.innerHeight };
            
            // Find buttons with common selectors
            const buttonSelectors = [
              'button[type="submit"]',
              '.single-button button', 
              'button:contains("המשך")',
              'button:contains("שמור והמשך")',
              '.mobile-button button',
              '[class*="button"]:last-child'
            ];
            
            const buttonResults = [];
            
            for (const selector of buttonSelectors) {
              try {
                const buttons = document.querySelectorAll(selector);
                
                buttons.forEach((button, index) => {
                  const rect = button.getBoundingClientRect();
                  const style = window.getComputedStyle(button);
                  
                  if (rect.width > 0 && rect.height > 0) { // Visible button
                    buttonResults.push({
                      selector: selector,
                      index: index,
                      text: button.textContent.trim().substring(0, 30),
                      position: {
                        x: Math.round(rect.x),
                        y: Math.round(rect.y), 
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                        bottom: Math.round(rect.bottom),
                        right: Math.round(rect.right)
                      },
                      style: {
                        position: style.position,
                        bottom: style.bottom,
                        zIndex: style.zIndex
                      },
                      isOverflow: rect.bottom > viewport.height || rect.right > viewport.width,
                      isTooSmall: rect.width < 44 || rect.height < 44,
                      isVisible: style.visibility !== 'hidden' && style.opacity !== '0'
                    });
                  }
                });
              } catch (e) {
                // Selector failed, continue
              }
            }
            
            return {
              viewport: viewport,
              buttonsFound: buttonResults.length,
              buttons: buttonResults,
              url: window.location.href
            };
          \`);
          
          // Analyze results
          const overflowButtons = buttonAnalysis.buttons.filter(b => b.isOverflow);
          const tooSmallButtons = buttonAnalysis.buttons.filter(b => b.isTooSmall);
          const passed = overflowButtons.length === 0 && tooSmallButtons.length === 0;
          
          const testResult = {
            device: device.name,
            url: fullUrl,
            viewport: buttonAnalysis.viewport,
            buttonsAnalyzed: buttonAnalysis.buttonsFound,
            passed: passed,
            issues: {
              overflow: overflowButtons.length,
              tooSmall: tooSmallButtons.length
            },
            timestamp: new Date().toISOString()
          };
          
          results.push(testResult);
          
          if (passed) {
            log(\`    ✅ PASSED - \${buttonAnalysis.buttonsFound} buttons OK\`, '\x1b[32m');
          } else {
            log(\`    ❌ FAILED - \${overflowButtons.length} overflow, \${tooSmallButtons.length} too small\`, '\x1b[31m');
            
            overflowButtons.forEach(btn => {
              log(\`      📱 Overflow: "\${btn.text}" bottom=\${btn.position.bottom}px (viewport=\${buttonAnalysis.viewport.height}px)\`, '\x1b[31m');
            });
          }
          
        } catch (error) {
          log(\`    ❌ Page test failed: \${error.message}\`, '\x1b[31m');
          results.push({
            device: device.name,
            url: fullUrl,
            passed: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
      
    } catch (error) {
      log(\`  ❌ Device test failed: \${error.message}\`, '\x1b[31m');
    } finally {
      if (driver) {
        await driver.quit();
        log('  🔚 Session closed', '\x1b[33m');
      }
    }
  }
  
  // Generate summary report
  const summary = {
    environment: environment,
    url: baseUrl,
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    failedTests: results.filter(r => !r.passed).length,
    devices: CRITICAL_MOBILE_DEVICES.filter(d => d.critical).map(d => d.name),
    results: results
  };
  
  summary.passRate = summary.totalTests > 0 ? ((summary.passedTests / summary.totalTests) * 100).toFixed(1) : 0;
  
  // Save report
  const reportPath = \`automation/reports/browserstack-production-\${environment}-report.json\`;
  if (!fs.existsSync(path.dirname(reportPath))) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  
  // Display results
  log(\`\\n📊 PRODUCTION TESTING RESULTS - \${environment.toUpperCase()}\`, '\x1b[1m\x1b[34m');
  log('=' * 60, '\x1b[1m');
  log(\`🌐 URL Tested: \${baseUrl}\`, '\x1b[36m');
  log(\`📱 Devices: \${summary.devices.join(', ')}\`, '\x1b[36m');
  log(\`🧪 Total Tests: \${summary.totalTests}\`, '\x1b[36m');
  log(\`✅ Passed: \${summary.passedTests}\`, '\x1b[32m');
  log(\`❌ Failed: \${summary.failedTests}\`, summary.failedTests > 0 ? '\x1b[31m' : '\x1b[33m');
  log(\`📈 Pass Rate: \${summary.passRate}%\`, summary.passRate > 90 ? '\x1b[32m' : '\x1b[33m');
  log(\`📋 Report: \${reportPath}\`, '\x1b[36m');
  
  if (summary.passRate === 100) {
    log('\\n🎉 ALL MOBILE BUTTON TESTS PASSED ON PRODUCTION!', '\x1b[1m\x1b[32m');
    log('✨ Your mobile fixes work perfectly on real devices', '\x1b[32m');
  } else if (summary.passRate > 80) {
    log('\\n🟡 MOSTLY SUCCESSFUL - Minor issues detected', '\x1b[1m\x1b[33m');
  } else {
    log('\\n🔴 SIGNIFICANT ISSUES DETECTED', '\x1b[1m\x1b[31m');
    log('🔧 Mobile button fixes need additional work', '\x1b[31m');
  }
  
  return summary;
}

async function main() {
  const args = process.argv.slice(2);
  const url = args[0];
  const environment = args[1] || 'production';
  
  if (!url) {
    log('❌ Usage: node browserstack-production-test.js <URL> [environment]', '\x1b[31m');
    log('Examples:', '\x1b[36m');
    log('  node browserstack-production-test.js https://your-app.railway.app production', '\x1b[36m');
    log('  node browserstack-production-test.js https://abc123.ngrok.io local', '\x1b[36m');
    process.exit(1);
  }
  
  try {
    const summary = await testProductionURL(url, environment);
    process.exit(summary.passRate > 90 ? 0 : 1);
  } catch (error) {
    log(\`❌ Testing failed: \${error.message}\`, '\x1b[31m');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testProductionURL, CRITICAL_MOBILE_DEVICES };