#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

/**
 * Cross-platform function to auto-open HTML reports
 */
function autoOpenReport(reportPath) {
  const platform = os.platform();
  
  console.log('\n🌐 Auto-opening HTML report...');
  
  let command;
  switch (platform) {
    case 'darwin': // macOS
      command = `open "${reportPath}"`;
      break;
    case 'win32': // Windows
      command = `start "${reportPath}"`;
      break;
    case 'linux': // Linux
      command = `xdg-open "${reportPath}"`;
      break;
    default:
      command = `open "${reportPath}"`; // fallback to macOS command
  }
  
  exec(command, (error) => {
    if (error) {
      console.log('⚠️  Could not auto-open report. Please open manually:');
      console.log(`   ${reportPath}`);
      console.log(`   Platform: ${platform}`);
      console.log(`   Command attempted: ${command}`);
    } else {
      console.log('✅ HTML report opened automatically!');
      console.log(`   Platform: ${platform}`);
    }
  });
}

module.exports = autoOpenReport;
