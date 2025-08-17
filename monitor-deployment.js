#!/usr/bin/env node

const https = require('https');
const { execSync } = require('child_process');

let checkCount = 0;
const maxChecks = 20; // Check for up to 10 minutes (20 * 30 seconds)

function checkDeploymentStatus() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'dev2.bankimonline.com',
      path: '/services/calculate-credit/4',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'he,en'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      console.error('Request error:', err);
      resolve('');
    });
  });
}

async function monitorDeployment() {
  console.log('🔄 Monitoring Railway deployment status...\n');
  console.log('⏱️  Will check every 30 seconds for up to 10 minutes\n');
  console.log('=' .repeat(60));

  const startTime = new Date();

  const checkInterval = setInterval(async () => {
    checkCount++;
    const currentTime = new Date();
    const elapsedMinutes = Math.floor((currentTime - startTime) / 60000);
    const elapsedSeconds = Math.floor(((currentTime - startTime) % 60000) / 1000);
    
    console.log(`\n[Check ${checkCount}/${maxChecks}] - Elapsed: ${elapsedMinutes}m ${elapsedSeconds}s`);
    console.log('-'.repeat(40));

    try {
      // Check the page content
      const pageContent = await checkDeploymentStatus();
      
      // Look for indicators in the page
      const hasOldTitle = pageContent.includes('Credit Registration');
      const hasNewTitleHebrew = pageContent.includes('סיכום בקשת אשראי');
      const hasNewTitleEnglish = pageContent.includes('Credit Calculation Results');
      const hasCalculateCredit = pageContent.includes('calculate_credit_final');
      
      if (hasNewTitleHebrew || hasNewTitleEnglish) {
        console.log('✅ DEPLOYMENT COMPLETE!');
        console.log('✅ Page now shows correct title!');
        console.log('\n🎉 SUCCESS! The credit_step4 fix is live in production!');
        console.log('🌐 URL: https://dev2.bankimonline.com/services/calculate-credit/4');
        console.log('\n📱 What users will see:');
        console.log('  Hebrew: סיכום בקשת אשראי');
        console.log('  English: Credit Calculation Results');
        console.log('  Russian: Итоги заявки на кредит');
        clearInterval(checkInterval);
        process.exit(0);
      } else if (hasOldTitle) {
        console.log('⏳ Still showing "Credit Registration" - deployment in progress...');
        console.log('   Railway is building/deploying the new version');
      } else if (hasCalculateCredit) {
        console.log('🔄 Page using translation keys - waiting for new build...');
      } else {
        console.log('🔍 Checking page content...');
      }

      // Also check git deployment status
      try {
        const gitLog = execSync('git log --oneline -1 web/main 2>/dev/null', { encoding: 'utf8' });
        console.log(`   Latest commit: ${gitLog.trim()}`);
      } catch (e) {
        // Ignore git errors
      }

    } catch (error) {
      console.log('⚠️  Check failed:', error.message);
    }

    if (checkCount >= maxChecks) {
      console.log('\n⏱️  Timeout reached after 10 minutes');
      console.log('❓ Deployment may still be in progress or may need manual intervention');
      console.log('\n📋 Manual verification steps:');
      console.log('1. Clear browser cache completely');
      console.log('2. Visit: https://dev2.bankimonline.com/services/calculate-credit/4');
      console.log('3. Check Railway dashboard for deployment status');
      console.log('4. Check if CDN cache needs purging');
      clearInterval(checkInterval);
      process.exit(1);
    }
  }, 30000); // Check every 30 seconds

  // Initial check immediately
  console.log('\n[Initial Check]');
  console.log('-'.repeat(40));
  const initialContent = await checkDeploymentStatus();
  if (initialContent.includes('סיכום בקשת אשראי') || initialContent.includes('Credit Calculation Results')) {
    console.log('✅ DEPLOYMENT ALREADY COMPLETE!');
    console.log('✅ Page shows correct title!');
    clearInterval(checkInterval);
    process.exit(0);
  } else if (initialContent.includes('Credit Registration')) {
    console.log('⏳ Currently showing "Credit Registration"');
    console.log('🔄 Waiting for Railway deployment to complete...');
  } else {
    console.log('🔍 Monitoring deployment progress...');
  }
}

// Start monitoring
monitorDeployment().catch(console.error);