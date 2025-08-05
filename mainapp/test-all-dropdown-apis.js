const fetch = require('node-fetch');

// Test all dropdown API endpoints to find issues
async function testAllDropdownAPIs() {
  console.log('\n🔍 TESTING ALL DROPDOWN APIs - FINDING ALL ISSUES\n');
  
  const baseUrl = 'http://localhost:8003';
  const languages = ['en', 'he', 'ru'];
  const screens = [
    'mortgage_step1',
    'mortgage_step2', 
    'mortgage_step3',
    'credit_step1',
    'credit_step2',
    'credit_step3',
    'refinance_mortgage_step1',
    'refinance_mortgage_step2',
    'refinance_mortgage_step3',
    'refinance_credit_step1',
    'refinance_credit_step2',
    'refinance_credit_step3'
  ];

  const allIssues = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const screen of screens) {
    for (const lang of languages) {
      totalTests++;
      const endpoint = `${baseUrl}/api/dropdowns/${screen}/${lang}`;
      
      try {
        console.log(`\n📡 Testing: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          failedTests++;
          const issue = {
            screen,
            language: lang,
            endpoint,
            issue: `HTTP ${response.status}: ${response.statusText}`,
            severity: 'HIGH'
          };
          allIssues.push(issue);
          console.log(`❌ FAILED: ${issue.issue}`);
          continue;
        }

        const data = await response.json();
        
        // Analyze response
        if (!data.options) {
          failedTests++;
          const issue = {
            screen,
            language: lang,
            endpoint,
            issue: 'No options object in response',
            severity: 'HIGH'
          };
          allIssues.push(issue);
          console.log(`❌ FAILED: ${issue.issue}`);
          continue;
        }

        // Count total options
        let totalOptions = 0;
        let emptyDropdowns = [];
        
        Object.keys(data.options).forEach(key => {
          const options = data.options[key];
          if (Array.isArray(options)) {
            totalOptions += options.length;
            if (options.length === 0) {
              emptyDropdowns.push(key);
            }
          }
        });

        console.log(`✅ Response OK: ${Object.keys(data.options).length} dropdowns, ${totalOptions} total options`);
        
        if (emptyDropdowns.length > 0) {
          const issue = {
            screen,
            language: lang,
            endpoint,
            issue: `Empty dropdowns: ${emptyDropdowns.join(', ')}`,
            severity: 'MEDIUM',
            emptyDropdowns
          };
          allIssues.push(issue);
          console.log(`⚠️  WARNING: ${issue.issue}`);
        }

        if (totalOptions === 0) {
          failedTests++;
          const issue = {
            screen,
            language: lang,
            endpoint,
            issue: 'All dropdowns are empty (0 total options)',
            severity: 'HIGH'
          };
          allIssues.push(issue);
          console.log(`❌ CRITICAL: ${issue.issue}`);
        } else {
          passedTests++;
        }

      } catch (error) {
        failedTests++;
        const issue = {
          screen,
          language: lang,
          endpoint,
          issue: `Network/Parse Error: ${error.message}`,
          severity: 'HIGH'
        };
        allIssues.push(issue);
        console.log(`❌ ERROR: ${issue.issue}`);
      }
    }
  }

  // Print comprehensive summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE DROPDOWN API ANALYSIS COMPLETE');
  console.log('='.repeat(80));
  console.log(`Total API endpoints tested: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
  console.log(`Issues found: ${allIssues.length}`);

  if (allIssues.length > 0) {
    console.log('\n🚨 ALL DROPDOWN ISSUES FOUND:');
    console.log('='.repeat(50));
    
    // Group by severity
    const highSeverity = allIssues.filter(i => i.severity === 'HIGH');
    const mediumSeverity = allIssues.filter(i => i.severity === 'MEDIUM');
    
    if (highSeverity.length > 0) {
      console.log(`\n🔴 HIGH SEVERITY ISSUES (${highSeverity.length}):`);
      highSeverity.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.screen} (${issue.language}): ${issue.issue}`);
        console.log(`   Endpoint: ${issue.endpoint}`);
      });
    }
    
    if (mediumSeverity.length > 0) {
      console.log(`\n🟡 MEDIUM SEVERITY ISSUES (${mediumSeverity.length}):`);
      mediumSeverity.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.screen} (${issue.language}): ${issue.issue}`);
        if (issue.emptyDropdowns) {
          console.log(`   Empty dropdowns: ${issue.emptyDropdowns.join(', ')}`);
        }
      });
    }

    // Group by screen
    console.log('\n📱 ISSUES BY SCREEN:');
    const issuesByScreen = {};
    allIssues.forEach(issue => {
      if (!issuesByScreen[issue.screen]) {
        issuesByScreen[issue.screen] = [];
      }
      issuesByScreen[issue.screen].push(issue);
    });
    
    Object.keys(issuesByScreen).forEach(screen => {
      console.log(`\n${screen}:`);
      issuesByScreen[screen].forEach(issue => {
        console.log(`  - ${issue.language}: ${issue.issue}`);
      });
    });

    // Critical issues that need immediate attention
    const criticalIssues = allIssues.filter(i => 
      i.issue.includes('All dropdowns are empty') || 
      i.issue.includes('HTTP 500') || 
      i.issue.includes('No options object')
    );
    
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.screen} (${issue.language}): ${issue.issue}`);
      });
    }

  } else {
    console.log('\n🎉 NO DROPDOWN API ISSUES FOUND! All endpoints working correctly.');
  }

  return allIssues;
}

// Run the test
if (require.main === module) {
  testAllDropdownAPIs().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testAllDropdownAPIs };