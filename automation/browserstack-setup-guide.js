#!/usr/bin/env node

/**
 * BrowserStack Setup Guide
 * Interactive guide to help find and configure BrowserStack credentials
 */

const readline = require('readline');
const fs = require('fs');

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

function createSetupGuide() {
  log('\n📱 BrowserStack Real Device Testing Setup Guide', '\x1b[1m\x1b[34m');
  log('='.repeat(60), '\x1b[1m');
  
  log('\n🔍 Step 1: Find Your BrowserStack Credentials', '\x1b[36m');
  log('1. In your BrowserStack dashboard, look for these options:', '\x1b[36m');
  log('   • Click "Settings" in top navigation', '\x1b[36m');
  log('   • OR click "Automate" in the main menu', '\x1b[36m');
  log('   • OR go to: https://automate.browserstack.com/dashboard', '\x1b[36m');
  
  log('\n💡 Quick Navigation URLs:', '\x1b[33m');
  log('• Account Settings: https://www.browserstack.com/accounts/settings', '\x1b[33m');
  log('• Automate Dashboard: https://automate.browserstack.com/dashboard', '\x1b[33m');
  log('• Access Key: https://www.browserstack.com/accounts/profile/automate', '\x1b[33m');
  
  log('\n🔑 Step 2: Copy Your Credentials', '\x1b[36m');
  log('Look for a section that shows:', '\x1b[36m');
  log('Username: [your_username]', '\x1b[32m');
  log('Access Key: [long_alphanumeric_string]', '\x1b[32m');
  
  log('\n⚠️  Important Notes:', '\x1b[33m');
  log('• Username is usually your email or a short string', '\x1b[33m');
  log('• Access Key is a long string with dashes (like a UUID)', '\x1b[33m');
  log('• Keep these credentials SECRET (like passwords)', '\x1b[33m');
  
  log('\n🚀 Step 3: Test Connection', '\x1b[36m');
  log('Once you have credentials, we can test the connection:', '\x1b[36m');
  log('export BROWSERSTACK_USERNAME=your_username', '\x1b[32m');
  log('export BROWSERSTACK_ACCESS_KEY=your_access_key', '\x1b[32m');
  log('node automation/test-browserstack-connection.js', '\x1b[32m');
}

function createTestScript() {
  const testScript = `#!/usr/bin/env node

/**
 * BrowserStack Connection Test
 * Tests if BrowserStack credentials work correctly
 */

const https = require('https');

const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME;
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;

function log(message, color = '\\x1b[0m') {
  console.log(\`\${color}\${message}\\x1b[0m\`);
}

function testBrowserStackConnection() {
  log('\\n🔍 Testing BrowserStack Connection...', '\\x1b[34m');
  
  if (!BROWSERSTACK_USERNAME || !BROWSERSTACK_ACCESS_KEY) {
    log('❌ Missing credentials!', '\\x1b[31m');
    log('Please set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY', '\\x1b[31m');
    return;
  }
  
  const auth = Buffer.from(\`\${BROWSERSTACK_USERNAME}:\${BROWSERSTACK_ACCESS_KEY}\`).toString('base64');
  
  const options = {
    hostname: 'api.browserstack.com',
    port: 443,
    path: '/automate/plan.json',
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${auth}\`,
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        const planInfo = JSON.parse(data);
        log('✅ BrowserStack connection successful!', '\\x1b[32m');
        log(\`📊 Plan: \${planInfo.automate_plan || 'Unknown'}\`, '\\x1b[36m');
        log(\`⏱️  Parallel sessions: \${planInfo.parallel_sessions_running || 0}/\${planInfo.parallel_sessions_max_allowed || 'unlimited'}\`, '\\x1b[36m');
        
        // Test device list
        testDeviceList();
      } else {
        log('❌ Authentication failed!', '\\x1b[31m');
        log(\`Status: \${res.statusCode}\`, '\\x1b[31m');
        log('Please check your username and access key', '\\x1b[31m');
      }
    });
  });
  
  req.on('error', (error) => {
    log('❌ Connection error:', '\\x1b[31m');
    console.error(error.message);
  });
  
  req.end();
}

function testDeviceList() {
  log('\\n📱 Testing Device Access...', '\\x1b[34m');
  
  const auth = Buffer.from(\`\${BROWSERSTACK_USERNAME}:\${BROWSERSTACK_ACCESS_KEY}\`).toString('base64');
  
  const options = {
    hostname: 'api.browserstack.com',
    port: 443,
    path: '/automate/browsers.json',
    method: 'GET',
    headers: {
      'Authorization': \`Basic \${auth}\`
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        const browsers = JSON.parse(data);
        const mobileBrowsers = browsers.filter(b => b.device && (b.device.includes('iPhone') || b.device.includes('Samsung')));
        
        log(\`✅ Device access confirmed! \${mobileBrowsers.length} mobile devices available\`, '\\x1b[32m');
        log('📱 Sample devices for your button tests:', '\\x1b[36m');
        
        mobileBrowsers.slice(0, 5).forEach(device => {
          log(\`   • \${device.device} (\${device.os} \${device.os_version})\`, '\\x1b[36m');
        });
        
        log('\\n🎉 BrowserStack is ready for real device testing!', '\\x1b[1m\\x1b[32m');
        log('Next: Run your mobile button overflow tests on real hardware', '\\x1b[32m');
      } else {
        log('❌ Device list access failed', '\\x1b[31m');
      }
    });
  });
  
  req.on('error', (error) => {
    log('❌ Device list error:', '\\x1b[31m');
    console.error(error.message);
  });
  
  req.end();
}

if (require.main === module) {
  testBrowserStackConnection();
}

module.exports = { testBrowserStackConnection };
`;

  fs.writeFileSync('/Users/michaelmishayev/Projects/bankDev2_standalone/automation/test-browserstack-connection.js', testScript);
  log('\n✅ Created test script: automation/test-browserstack-connection.js', '\x1b[32m');
}

function main() {
  createSetupGuide();
  createTestScript();
  
  log('\n📋 What to do next:', '\x1b[36m');
  log('1. Find your credentials in BrowserStack dashboard', '\x1b[36m');
  log('2. Set environment variables with your credentials', '\x1b[36m');
  log('3. Run: node automation/test-browserstack-connection.js', '\x1b[36m');
  log('4. Once connection works, we\'ll test your mobile button fixes!', '\x1b[36m');
}

if (require.main === module) {
  main();
}

module.exports = { createSetupGuide, createTestScript };