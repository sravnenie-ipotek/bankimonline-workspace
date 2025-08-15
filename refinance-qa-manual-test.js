/**
 * 🎯 MANUAL REFINANCE MORTGAGE QA TESTING SCRIPT
 * 
 * This script performs manual validation of the refinance mortgage process
 * by making direct HTTP requests and analyzing the returned HTML content
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:5174';
const REFINANCE_STEPS = [1, 2, 3, 4];
const REPORT_FILE = path.join(__dirname, 'refinance-qa-report.html');

// Test results storage
let testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  criticalFailures: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      
      response.on('data', chunk => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test function
function createTest(id, name, category, isCritical = false) {
  return {
    id,
    name,
    category,
    isCritical,
    status: 'pending',
    result: null,
    error: null,
    notes: [],
    screenshots: []
  };
}

// Add test result
function recordTest(test, passed, notes = [], error = null) {
  test.status = passed ? 'passed' : 'failed';
  test.result = passed;
  test.notes = Array.isArray(notes) ? notes : [notes];
  test.error = error;
  
  testResults.totalTests++;
  if (passed) {
    testResults.passedTests++;
  } else {
    testResults.failedTests++;
    if (test.isCritical) {
      testResults.criticalFailures++;
    }
  }
  
  testResults.tests.push(test);
  console.log(`${passed ? '✅' : '❌'} ${test.id}: ${test.name}`);
  if (notes.length > 0) {
    notes.forEach(note => console.log(`   📝 ${note}`));
  }
}

// Main testing function
async function runRefinanceQATests() {
  console.log('🏦 Starting Refinance Mortgage QA Testing...\n');
  
  // Test 1: Basic page availability
  for (const step of REFINANCE_STEPS) {
    const test = createTest(
      `RF-AVAIL-${step}`,
      `Step ${step} - Page Availability`,
      'Basic Functionality',
      true
    );
    
    try {
      const url = `${BASE_URL}/services/refinance-mortgage/${step}`;
      const response = await makeRequest(url);
      
      const passed = response.statusCode === 200;
      const notes = [
        `Status Code: ${response.statusCode}`,
        `Content Length: ${response.body.length} characters`,
        `Content Type: ${response.headers['content-type'] || 'unknown'}`
      ];
      
      recordTest(test, passed, notes);
    } catch (error) {
      recordTest(test, false, [`Error: ${error.message}`], error);
    }
  }
  
  console.log('\n🔍 Analyzing page content for refinance-specific elements...\n');
  
  // Test 2: Content analysis for each step
  for (const step of REFINANCE_STEPS) {
    const test = createTest(
      `RF-CONTENT-${step}`,
      `Step ${step} - Refinance Content Analysis`,
      'Content Validation',
      step === 4 // Step 4 is critical for break-even analysis
    );
    
    try {
      const url = `${BASE_URL}/services/refinance-mortgage/${step}`;
      const response = await makeRequest(url);
      
      if (response.statusCode === 200) {
        const html = response.body.toLowerCase();
        const notes = [];
        let score = 0;
        
        // Step-specific content validation
        switch (step) {
          case 1:
            const step1Keywords = ['current', 'existing', 'loan', 'balance', 'rate'];
            step1Keywords.forEach(keyword => {
              if (html.includes(keyword)) {
                notes.push(`✓ Found Step 1 keyword: ${keyword}`);
                score++;
              }
            });
            break;
            
          case 2:
            const step2Keywords = ['new', 'rate', 'comparison', 'savings', 'payment'];
            step2Keywords.forEach(keyword => {
              if (html.includes(keyword)) {
                notes.push(`✓ Found Step 2 keyword: ${keyword}`);
                score++;
              }
            });
            break;
            
          case 3:
            const step3Keywords = ['income', 'employment', 'cash', 'debt', 'qualify'];
            step3Keywords.forEach(keyword => {
              if (html.includes(keyword)) {
                notes.push(`✓ Found Step 3 keyword: ${keyword}`);
                score++;
              }
            });
            break;
            
          case 4:
            // CRITICAL: Break-even analysis
            const step4Keywords = ['break', 'even', 'comparison', 'summary', 'savings'];
            step4Keywords.forEach(keyword => {
              if (html.includes(keyword)) {
                notes.push(`✓ Found Step 4 keyword: ${keyword}`);
                score++;
              }
            });
            
            // Extra validation for break-even (CRITICAL)
            const breakEvenIndicators = ['break-even', 'breakeven', 'payback', 'roi'];
            let foundBreakEven = false;
            breakEvenIndicators.forEach(indicator => {
              if (html.includes(indicator)) {
                notes.push(`🎯 CRITICAL: Found break-even indicator: ${indicator}`);
                foundBreakEven = true;
                score += 2;
              }
            });
            
            if (!foundBreakEven) {
              notes.push(`❌ CRITICAL FAILURE: No break-even analysis found on Step 4`);
            }
            break;
        }
        
        // Check for form elements
        const formElements = ['<input', '<select', '<button'];
        formElements.forEach(element => {
          const matches = (html.match(new RegExp(element, 'g')) || []).length;
          if (matches > 0) {
            notes.push(`Found ${matches} ${element} elements`);
            score++;
          }
        });
        
        // Check for dropdown/select elements (important for refinance)
        const dropdownIndicators = ['<select', 'role="combobox"', 'dropdown', 'data-testid'];
        let dropdownScore = 0;
        dropdownIndicators.forEach(indicator => {
          const matches = (html.match(new RegExp(indicator, 'g')) || []).length;
          if (matches > 0) {
            notes.push(`Found ${matches} instances of ${indicator}`);
            dropdownScore++;
          }
        });
        
        if (dropdownScore > 0) {
          notes.push(`✓ Dropdown elements detected (score: ${dropdownScore})`);
          score += dropdownScore;
        } else {
          notes.push(`⚠️ No dropdown elements found`);
        }
        
        // Determine if test passed
        const minScore = step === 4 ? 8 : 5; // Higher requirements for Step 4
        const passed = score >= minScore;
        notes.unshift(`Content Analysis Score: ${score}/${minScore} (${passed ? 'PASS' : 'FAIL'})`);
        
        recordTest(test, passed, notes);
      } else {
        recordTest(test, false, [`Page not accessible: ${response.statusCode}`]);
      }
    } catch (error) {
      recordTest(test, false, [`Error: ${error.message}`], error);
    }
  }
  
  console.log('\n🌐 Testing multi-language support...\n');
  
  // Test 3: Multi-language support
  const languages = ['en', 'he', 'ru'];
  for (const lang of languages) {
    const test = createTest(
      `RF-LANG-${lang.toUpperCase()}`,
      `Multi-language Support - ${lang.toUpperCase()}`,
      'Internationalization',
      false
    );
    
    try {
      const url = `${BASE_URL}/services/refinance-mortgage/1?lang=${lang}`;
      const response = await makeRequest(url);
      
      if (response.statusCode === 200) {
        const html = response.body;
        const notes = [];
        let score = 0;
        
        // Check for translation issues
        const translationErrors = ['translation missing', 'undefined', '{{'];
        translationErrors.forEach(error => {
          if (html.includes(error)) {
            notes.push(`❌ Translation error found: ${error}`);
          } else {
            score++;
          }
        });
        
        // Language-specific checks
        if (lang === 'he') {
          const hasHebrew = /[\u0590-\u05FF]/.test(html);
          const hasRTL = html.includes('dir="rtl"') || html.includes('rtl');
          
          if (hasHebrew) {
            notes.push('✓ Hebrew characters detected');
            score++;
          }
          if (hasRTL) {
            notes.push('✓ RTL direction detected');
            score++;
          }
        } else if (lang === 'ru') {
          const hasRussian = /[\u0400-\u04FF]/.test(html);
          if (hasRussian) {
            notes.push('✓ Russian characters detected');
            score++;
          }
        }
        
        const passed = score >= 2;
        notes.unshift(`Language support score: ${score} (${passed ? 'PASS' : 'FAIL'})`);
        
        recordTest(test, passed, notes);
      } else {
        recordTest(test, false, [`Page not accessible: ${response.statusCode}`]);
      }
    } catch (error) {
      recordTest(test, false, [`Error: ${error.message}`], error);
    }
  }
  
  console.log('\n🔍 Testing API integration...\n');
  
  // Test 4: API endpoint availability
  const apiEndpoints = [
    '/api/v1/calculation-parameters?business_path=mortgage_refinance',
    '/api/v1/dropdowns',
    '/api/v1/banks'
  ];
  
  for (const endpoint of apiEndpoints) {
    const test = createTest(
      `RF-API-${endpoint.split('/').pop().split('?')[0]}`,
      `API Endpoint - ${endpoint}`,
      'API Integration',
      endpoint.includes('calculation-parameters')
    );
    
    try {
      const url = `http://localhost:8003${endpoint}`;
      const response = await makeRequest(url);
      
      const passed = response.statusCode === 200;
      const notes = [
        `Status Code: ${response.statusCode}`,
        `Response Length: ${response.body.length} characters`
      ];
      
      if (response.statusCode === 200 && response.body.includes('"status":"success"')) {
        notes.push('✓ API response format appears valid');
      } else if (response.statusCode === 200) {
        notes.push('⚠️ API response format unclear');
      }
      
      recordTest(test, passed, notes);
    } catch (error) {
      recordTest(test, false, [`Error: ${error.message}`], error);
    }
  }
  
  console.log('\n📊 Generating test report...\n');
  
  // Generate HTML report
  generateHTMLReport();
  
  console.log('🏁 Refinance Mortgage QA Testing Complete!\n');
  console.log('='.repeat(60));
  console.log(`📈 FINAL RESULTS:`);
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`✅ Passed: ${testResults.passedTests}`);
  console.log(`❌ Failed: ${testResults.failedTests}`);
  console.log(`🚨 Critical Failures: ${testResults.criticalFailures}`);
  console.log(`📊 Pass Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (testResults.criticalFailures > 0) {
    console.log('\n🚨 CRITICAL ISSUES DETECTED:');
    testResults.tests
      .filter(test => test.isCritical && !test.result)
      .forEach(test => {
        console.log(`   ❌ ${test.id}: ${test.name}`);
        test.notes.forEach(note => console.log(`      • ${note}`));
      });
  }
  
  console.log(`\n📄 Detailed report saved to: ${REPORT_FILE}`);
}

function generateHTMLReport() {
  const timestamp = new Date().toISOString();
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refinance Mortgage QA Test Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        .pass { color: #27ae60; }
        .fail { color: #e74c3c; }
        .critical { color: #e74c3c; background-color: #fdf2f2; }
        .warning { color: #f39c12; }
        
        .tests {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .test {
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .test-header {
            padding: 15px 20px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-status {
            padding: 5px 15px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
        }
        .status-passed { background-color: #27ae60; }
        .status-failed { background-color: #e74c3c; }
        .test-content {
            padding: 20px;
        }
        .test-notes {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
        }
        .test-notes ul {
            margin: 0;
            padding-left: 20px;
        }
        .critical-badge {
            background-color: #e74c3c;
            color: white;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 0.8em;
            margin-left: 10px;
        }
        
        .recommendations {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏦 Refinance Mortgage QA Test Report</h1>
        <p>Generated on: ${timestamp}</p>
        <p>Target System: http://localhost:5174/services/refinance-mortgage/</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Total Tests</h3>
            <div class="number">${testResults.totalTests}</div>
        </div>
        <div class="summary-card">
            <h3>Passed</h3>
            <div class="number pass">${testResults.passedTests}</div>
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <div class="number fail">${testResults.failedTests}</div>
        </div>
        <div class="summary-card">
            <h3>Critical Failures</h3>
            <div class="number critical">${testResults.criticalFailures}</div>
        </div>
        <div class="summary-card">
            <h3>Pass Rate</h3>
            <div class="number ${testResults.passedTests === testResults.totalTests ? 'pass' : 'fail'}">
                ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%
            </div>
        </div>
    </div>
    
    <div class="tests">
        <h2>Detailed Test Results</h2>
        ${testResults.tests.map(test => `
            <div class="test ${test.isCritical ? 'critical' : ''}">
                <div class="test-header">
                    <div>
                        <strong>${test.id}: ${test.name}</strong>
                        ${test.isCritical ? '<span class="critical-badge">CRITICAL</span>' : ''}
                        <br>
                        <small>${test.category}</small>
                    </div>
                    <span class="test-status ${test.result ? 'status-passed' : 'status-failed'}">
                        ${test.result ? 'PASSED' : 'FAILED'}
                    </span>
                </div>
                <div class="test-content">
                    ${test.error ? `<p><strong>Error:</strong> ${test.error.message}</p>` : ''}
                    ${test.notes.length > 0 ? `
                        <div class="test-notes">
                            <strong>Notes:</strong>
                            <ul>
                                ${test.notes.map(note => `<li>${note}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('')}
    </div>
    
    ${testResults.criticalFailures > 0 ? `
        <div class="recommendations">
            <h3>🚨 Critical Issues Requiring Immediate Attention:</h3>
            <ul>
                ${testResults.tests
                  .filter(test => test.isCritical && !test.result)
                  .map(test => `<li><strong>${test.name}:</strong> ${test.notes.join('; ')}</li>`)
                  .join('')}
            </ul>
            <p><strong>Recommendation:</strong> Address all critical failures before proceeding to production.</p>
        </div>
    ` : ''}
    
    <div class="recommendations">
        <h3>📋 Testing Summary & Recommendations:</h3>
        <ul>
            <li><strong>Page Availability:</strong> All refinance mortgage steps should be accessible</li>
            <li><strong>Break-Even Analysis:</strong> Step 4 must display break-even calculations (CRITICAL for refinancing)</li>
            <li><strong>Multi-Language Support:</strong> Hebrew RTL and Russian text should display properly</li>
            <li><strong>API Integration:</strong> Backend APIs should provide refinance-specific data</li>
            <li><strong>Form Elements:</strong> Dropdowns and input fields should be functional</li>
        </ul>
    </div>
    
    <div class="footer">
        <p>This report was generated automatically by the Refinance Mortgage QA Testing Suite.</p>
        <p>For manual validation, review the screenshot evidence and perform user acceptance testing.</p>
    </div>
</body>
</html>`;

  fs.writeFileSync(REPORT_FILE, html, 'utf8');
}

// Run the tests
runRefinanceQATests().catch(console.error);