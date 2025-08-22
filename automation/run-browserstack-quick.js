#!/usr/bin/env node

/**
 * Quick BrowserStack Real Device Test
 * Fast validation of mobile button fixes on iPhone 15 Pro
 */

const { runMobileTests, MOBILE_DEVICES } = require('./run-browserstack-mobile-tests.js');

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

async function quickTest() {
  log('🚀 Quick BrowserStack Mobile Test - iPhone 15 Pro', '\x1b[1m\x1b[34m');
  log('Testing mobile button overflow fixes on real hardware...', '\x1b[36m');
  log('');
  
  // Test only iPhone 15 Pro for quick validation
  const quickDevices = ['iPhone 15 Pro'];
  
  try {
    const report = await runMobileTests(quickDevices);
    
    if (report.summary.passRate === 100) {
      log('\n🎉 SUCCESS! Mobile button fixes work on iPhone 15 Pro', '\x1b[1m\x1b[32m');
      log('✅ Buttons are properly positioned within viewport', '\x1b[32m');
      log('✅ Touch targets meet iOS guidelines (44x44px)', '\x1b[32m');
      log('✅ Fixed positioning prevents overflow', '\x1b[32m');
      
      log('\n🚀 Ready for full device testing:', '\x1b[36m');
      log('node automation/run-browserstack-mobile-tests.js critical', '\x1b[36m');
    } else {
      log('\n⚠️  Issues detected on iPhone 15 Pro', '\x1b[1m\x1b[33m');
      log('Check screenshots and detailed report', '\x1b[33m');
    }
    
    return report.summary.passRate === 100;
    
  } catch (error) {
    log(`❌ Quick test failed: ${error.message}`, '\x1b[31m');
    return false;
  }
}

if (require.main === module) {
  quickTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { quickTest };