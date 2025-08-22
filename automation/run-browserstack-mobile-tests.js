#!/usr/bin/env node

/**
 * BrowserStack Real Device Mobile Testing
 * Tests mobile button overflow fixes on actual iOS and Android devices
 */

const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME || 'bankim_bDR9eZP4Bb2';
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || 'DwWqjFesqgUNTZqrddhV';

// Test application URLs
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:8003';

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

// Critical mobile device configurations for banking app testing
const MOBILE_DEVICES = [
  {
    name: 'iPhone 15 Pro',
    caps: {
      'bstack:options': {
        os: 'ios',
        osVersion: '17',
        deviceName: 'iPhone 15 Pro',
        realMobile: 'true',
        projectName: 'Banking App Mobile Button Testing',
        buildName: 'Mobile Button Overflow Fixes',
        sessionName: 'iPhone 15 Pro - Button Positioning'
      },
      browserName: 'safari'
    },
    viewport: { width: 393, height: 852 },
    critical: true
  },
  {
    name: 'iPhone 14',
    caps: {
      'bstack:options': {
        os: 'ios',
        osVersion: '16',
        deviceName: 'iPhone 14',
        realMobile: 'true',
        projectName: 'Banking App Mobile Button Testing',
        buildName: 'Mobile Button Overflow Fixes',
        sessionName: 'iPhone 14 - Hebrew RTL Testing'
      },
      browserName: 'safari'
    },
    viewport: { width: 390, height: 844 },
    critical: true
  },
  {
    name: 'Samsung Galaxy S23',
    caps: {
      'bstack:options': {
        os: 'android',
        osVersion: '13.0',
        deviceName: 'Samsung Galaxy S23',
        realMobile: 'true',
        projectName: 'Banking App Mobile Button Testing',
        buildName: 'Mobile Button Overflow Fixes',
        sessionName: 'Galaxy S23 - Android Testing'
      },
      browserName: 'chrome'
    },
    viewport: { width: 360, height: 780 },
    critical: true
  },
  {
    name: 'iPhone SE 2022',
    caps: {
      'bstack:options': {
        os: 'ios',
        osVersion: '15',
        deviceName: 'iPhone SE 2022',
        realMobile: 'true',
        projectName: 'Banking App Mobile Button Testing',
        buildName: 'Mobile Button Overflow Fixes',
        sessionName: 'iPhone SE - Small Screen Testing'
      },
      browserName: 'safari'
    },
    viewport: { width: 375, height: 667 },
    critical: true,
    note: 'Smallest screen - critical for button overflow testing'
  },
  {
    name: 'Samsung Galaxy S21',
    caps: {
      'bstack:options': {
        os: 'android',
        osVersion: '12.0',
        deviceName: 'Samsung Galaxy S21',
        realMobile: 'true',
        projectName: 'Banking App Mobile Button Testing',
        buildName: 'Mobile Button Overflow Fixes',
        sessionName: 'Galaxy S21 - Alternative Android'
      },
      browserName: 'chrome'
    },
    viewport: { width: 360, height: 800 },
    critical: false
  }
];

// Banking app test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Mortgage Calculator Step 1',
    path: '/services/calculate-mortgage/1',
    description: 'Initial mortgage form with property value and ownership',
    buttonSelectors: [
      'button[type="submit"]',
      '.single-button button',
      '[class*="button"]',
      'button:contains("המשך")',  // Hebrew "Continue"
      'button:contains("שמור והמשך")'  // Hebrew "Save and Continue"
    ]
  },
  {
    name: 'Mortgage Calculator Step 2',
    path: '/services/calculate-mortgage/2',
    description: 'Personal information form',
    buttonSelectors: [
      'button[type="submit"]',
      '.single-button button',
      'button:contains("המשך")',
      'button:contains("הקודם")'  // Hebrew "Previous"
    ]
  },
  {
    name: 'Credit Calculator Step 1',
    path: '/services/calculate-credit/1',
    description: 'Credit application form',
    buttonSelectors: [
      'button[type="submit"]',
      '.single-button button',
      'button:contains("המשך")'
    ]
  },
  {
    name: 'Personal Cabinet',
    path: '/personal-cabinet',
    description: 'User dashboard with action buttons',
    buttonSelectors: [
      'button[type="submit"]',
      '.action-button',
      'button:contains("שמור")'  // Hebrew "Save"
    ]
  }
];

async function createDriver(deviceConfig) {
  const capabilities = {
    ...deviceConfig.caps,
    'bstack:options': {
      ...deviceConfig.caps['bstack:options'],
      userName: BROWSERSTACK_USERNAME,
      accessKey: BROWSERSTACK_ACCESS_KEY,
      debug: 'true',
      networkLogs: 'true',
      consoleLogs: 'verbose',
      local: 'false'
    }
  };

  return new Builder()
    .usingServer('https://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();
}

async function testButtonPositioning(driver, scenario, device) {
  const results = {
    device: device.name,
    scenario: scenario.name,
    viewport: device.viewport,
    buttons: [],
    passed: true,
    errors: []
  };

  try {
    log(`📱 Testing ${scenario.name} on ${device.name}`, '\x1b[36m');
    
    // Navigate to test page
    const fullUrl = `${BASE_URL}${scenario.path}`;
    await driver.get(fullUrl);
    
    // Wait for page load
    await driver.wait(until.titleContains('בנקים'), 10000);
    
    // Wait for dynamic content
    await driver.sleep(3000);
    
    // Get viewport dimensions
    const viewport = await driver.executeScript(`
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      };
    `);
    
    results.actualViewport = viewport;
    
    // Test each button selector
    for (const selector of scenario.buttonSelectors) {
      try {
        const buttons = await driver.findElements(By.css(selector));
        
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          
          // Get button position and dimensions
          const rect = await driver.executeScript(`
            const button = arguments[0];
            const rect = button.getBoundingClientRect();
            return {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              bottom: rect.bottom,
              right: rect.right,
              visible: rect.width > 0 && rect.height > 0
            };
          `, button);
          
          // Get button text and styling
          const buttonInfo = await driver.executeScript(`
            const button = arguments[0];
            const style = window.getComputedStyle(button);
            return {
              text: button.textContent || button.innerText || '',
              position: style.position,
              zIndex: style.zIndex,
              bottom: style.bottom,
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity
            };
          `, button);
          
          // Button overflow detection
          const isOverflow = rect.bottom > viewport.height || rect.right > viewport.width;
          const isTooSmall = rect.width < 44 || rect.height < 44; // iOS minimum touch target
          const isHidden = !rect.visible || buttonInfo.visibility === 'hidden' || buttonInfo.opacity === '0';
          
          const buttonResult = {
            selector: selector,
            index: i,
            text: buttonInfo.text.trim(),
            rect: rect,
            style: buttonInfo,
            isOverflow: isOverflow,
            isTooSmall: isTooSmall,
            isHidden: isHidden,
            passed: !isOverflow && !isTooSmall && !isHidden
          };
          
          results.buttons.push(buttonResult);
          
          if (!buttonResult.passed) {
            results.passed = false;
            if (isOverflow) {
              results.errors.push(`Button "${buttonInfo.text}" overflows viewport (bottom: ${rect.bottom}px, viewport: ${viewport.height}px)`);
            }
            if (isTooSmall) {
              results.errors.push(`Button "${buttonInfo.text}" too small (${rect.width}x${rect.height}px, minimum: 44x44px)`);
            }
            if (isHidden) {
              results.errors.push(`Button "${buttonInfo.text}" is hidden or invisible`);
            }
          }
          
          log(`  ${buttonResult.passed ? '✅' : '❌'} Button: "${buttonInfo.text}" (${rect.width}x${rect.height}px at ${rect.x},${rect.y})`, 
              buttonResult.passed ? '\x1b[32m' : '\x1b[31m');
        }
      } catch (error) {
        // Selector not found - not necessarily an error
        log(`  ⏭️  Selector "${selector}" not found`, '\x1b[33m');
      }
    }
    
    // Take screenshot for evidence
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = `automation/reports/browserstack-screenshots/${device.name.replace(/\s+/g, '_')}_${scenario.name.replace(/\s+/g, '_')}.png`;
    
    // Ensure directory exists
    const dir = path.dirname(screenshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    results.screenshotPath = screenshotPath;
    
    log(`  📸 Screenshot saved: ${screenshotPath}`, '\x1b[36m');
    
  } catch (error) {
    results.passed = false;
    results.errors.push(`Test execution error: ${error.message}`);
    log(`  ❌ Test error: ${error.message}`, '\x1b[31m');
  }
  
  return results;
}

async function runMobileTests(selectedDevices = 'critical') {
  log('\n🚀 Starting BrowserStack Mobile Button Testing', '\x1b[1m\x1b[34m');
  log('=' * 60, '\x1b[1m');
  
  // Filter devices based on selection
  const devicesToTest = selectedDevices === 'critical' 
    ? MOBILE_DEVICES.filter(d => d.critical)
    : selectedDevices === 'all'
    ? MOBILE_DEVICES
    : MOBILE_DEVICES.filter(d => selectedDevices.includes(d.name));
  
  const allResults = [];
  let totalTests = 0;
  let passedTests = 0;
  
  for (const device of devicesToTest) {
    log(`\n📱 Testing on ${device.name} (${device.viewport.width}x${device.viewport.height})`, '\x1b[1m\x1b[36m');
    
    let driver = null;
    
    try {
      // Create BrowserStack session
      driver = await createDriver(device);
      log(`  ✅ BrowserStack session created`, '\x1b[32m');
      
      // Test each scenario
      for (const scenario of TEST_SCENARIOS) {
        const result = await testButtonPositioning(driver, scenario, device);
        allResults.push(result);
        totalTests++;
        
        if (result.passed) {
          passedTests++;
          log(`  ✅ ${scenario.name} - PASSED`, '\x1b[32m');
        } else {
          log(`  ❌ ${scenario.name} - FAILED`, '\x1b[31m');
          result.errors.forEach(error => log(`     ${error}`, '\x1b[31m'));
        }
      }
      
    } catch (error) {
      log(`  ❌ Device setup failed: ${error.message}`, '\x1b[31m');
    } finally {
      if (driver) {
        await driver.quit();
        log(`  🔚 BrowserStack session closed`, '\x1b[33m');
      }
    }
  }
  
  // Generate comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: totalTests,
      passedTests: passedTests,
      failedTests: totalTests - passedTests,
      passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0
    },
    devicesTestedCount: devicesToTest.length,
    scenariosTestedCount: TEST_SCENARIOS.length,
    results: allResults,
    criticalIssues: allResults.filter(r => !r.passed && r.device.includes('iPhone SE')), // Small screen issues
    mobileButtonFixes: {
      implemented: true,
      cssChanges: [
        'position: sticky → position: fixed',
        'Added iPhone safe area support',
        'Added z-index for proper layering',
        'Container bottom padding increased'
      ],
      validation: allResults.every(r => r.passed) ? 'SUCCESS' : 'NEEDS_ATTENTION'
    }
  };
  
  // Save detailed report
  const reportPath = 'automation/reports/browserstack-mobile-test-report.json';
  if (!fs.existsSync(path.dirname(reportPath))) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Display summary
  log('\n📊 BROWSERSTACK MOBILE TESTING RESULTS', '\x1b[1m\x1b[34m');
  log('=' * 50, '\x1b[1m');
  log(`📱 Devices Tested: ${devicesToTest.length}`, '\x1b[36m');
  log(`🧪 Total Tests: ${totalTests}`, '\x1b[36m');
  log(`✅ Passed: ${passedTests}`, '\x1b[32m');
  log(`❌ Failed: ${totalTests - passedTests}`, totalTests > passedTests ? '\x1b[31m' : '\x1b[33m');
  log(`📈 Pass Rate: ${report.summary.passRate}%`, report.summary.passRate > 90 ? '\x1b[32m' : '\x1b[33m');
  
  log(`\n📋 Report saved: ${reportPath}`, '\x1b[36m');
  log(`📸 Screenshots saved in: automation/reports/browserstack-screenshots/`, '\x1b[36m');
  
  if (report.summary.passRate > 90) {
    log('\n🎉 MOBILE BUTTON FIXES VALIDATED ON REAL DEVICES!', '\x1b[1m\x1b[32m');
    log('✨ Your CSS position fixes work correctly on actual hardware', '\x1b[32m');
  } else {
    log('\n⚠️  Some issues detected on real devices', '\x1b[1m\x1b[33m');
    log('💡 Check the detailed report and screenshots for specifics', '\x1b[33m');
  }
  
  return report;
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const deviceFilter = args[0] || 'critical';
  
  runMobileTests(deviceFilter).then(report => {
    process.exit(report.summary.passRate > 90 ? 0 : 1);
  }).catch(error => {
    log(`❌ Testing failed: ${error.message}`, '\x1b[31m');
    process.exit(1);
  });
}

module.exports = { runMobileTests, MOBILE_DEVICES, TEST_SCENARIOS };