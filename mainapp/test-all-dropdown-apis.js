const fetch = require('node-fetch');

// Test all dropdown API endpoints to find issues
async function testAllDropdownAPIs() {
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

        console.log(`     Parsed ${Object.keys(response.data).length} dropdowns, ${totalOptions} total options`);
        
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
        }
    }
  }

  // Print comprehensive summary
  );
  );
  }%)`);
  }%)`);
  if (allIssues.length > 0) {
    );
    
    // Group by severity
    const highSeverity = allIssues.filter(i => i.severity === 'HIGH');
    const mediumSeverity = allIssues.filter(i => i.severity === 'MEDIUM');
    
    if (highSeverity.length > 0) {
      :`);
      highSeverity.forEach((issue, index) => {
        : ${issue.issue}`);
        });
    }
    
    if (mediumSeverity.length > 0) {
      :`);
      mediumSeverity.forEach((issue, index) => {
        : ${issue.issue}`);
        if (issue.emptyDropdowns) {
          }`);
        }
      });
    }

    // Group by screen
    const issuesByScreen = {};
    allIssues.forEach(issue => {
      if (!issuesByScreen[issue.screen]) {
        issuesByScreen[issue.screen] = [];
      }
      issuesByScreen[issue.screen].push(issue);
    });
    
    Object.keys(issuesByScreen).forEach(screen => {
      issuesByScreen[screen].forEach(issue => {
        });
    });

    // Critical issues that need immediate attention
    const criticalIssues = allIssues.filter(i => 
      i.issue.includes('All dropdowns are empty') || 
      i.issue.includes('HTTP 500') || 
      i.issue.includes('No options object')
    );
    
    if (criticalIssues.length > 0) {
      criticalIssues.forEach((issue, index) => {
        : ${issue.issue}`);
      });
    }

  } else {
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