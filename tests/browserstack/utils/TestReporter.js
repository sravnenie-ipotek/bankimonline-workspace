/**
 * Professional Test Reporter for BrowserStack Automation
 * Generates comprehensive test reports with metrics, screenshots, and analysis
 */

const fs = require('fs');
const path = require('path');

class TestReporter {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.startTime = new Date();
    this.results = {
      suiteName: suiteName,
      startTime: this.startTime.toISOString(),
      endTime: null,
      duration: 0,
      browser: process.env.BROWSER || 'unknown',
      environment: process.env.TEST_ENV || 'unknown',
      tests: [],
      assertions: [],
      data: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        passRate: 0
      },
      errors: [],
      warnings: []
    };
    
    this.currentTest = null;
    this.reportDir = path.join(__dirname, '../reports');
    
    // Ensure reports directory exists
    this.ensureReportDirectory();
  }
  
  /**
   * Ensure reports directory exists
   */
  ensureReportDirectory() {
    const dirs = [
      this.reportDir,
      path.join(this.reportDir, 'screenshots'),
      path.join(this.reportDir, 'data'),
      path.join(this.reportDir, 'html')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  /**
   * Start a new test
   * @param {string} testName - Name of the test
   */
  startTest(testName) {
    this.currentTest = {
      name: testName,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      status: 'running',
      assertions: [],
      data: {},
      errors: [],
      screenshots: []
    };
    
    console.log(`📝 Starting test: ${testName}`);
  }
  
  /**
   * End current test
   * @param {Object} testResult - Test result object
   */
  endTest(testResult) {
    if (!this.currentTest) {
      console.warn('⚠️ No current test to end');
      return;
    }
    
    this.currentTest.endTime = new Date();
    this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
    this.currentTest.status = testResult.status || 'unknown';
    
    if (testResult.error) {
      this.currentTest.errors.push({
        message: testResult.error,
        timestamp: new Date().toISOString()
      });
    }
    
    this.results.tests.push({ ...this.currentTest });
    
    // Update summary
    this.results.summary.total++;
    switch (this.currentTest.status) {
      case 'passed':
        this.results.summary.passed++;
        break;
      case 'failed':
        this.results.summary.failed++;
        break;
      default:
        this.results.summary.skipped++;
    }
    
    this.results.summary.passRate = 
      this.results.summary.total > 0 
        ? (this.results.summary.passed / this.results.summary.total) * 100 
        : 0;
    
    console.log(`✅ Test completed: ${this.currentTest.name} - ${this.currentTest.status}`);
    this.currentTest = null;
  }
  
  /**
   * Add assertion result
   * @param {string} description - Assertion description
   * @param {boolean} passed - Whether assertion passed
   * @param {string} error - Error message if failed
   */
  addAssertion(description, passed, error = null) {
    const assertion = {
      description: description,
      passed: passed,
      error: error,
      timestamp: new Date().toISOString(),
      testName: this.currentTest?.name || 'unknown'
    };
    
    this.results.assertions.push(assertion);
    
    if (this.currentTest) {
      this.currentTest.assertions.push(assertion);
    }
    
    console.log(`${passed ? '✅' : '❌'} Assertion: ${description}`);
  }
  
  /**
   * Add test data
   * @param {string} key - Data key
   * @param {any} value - Data value
   */
  addData(key, value) {
    const dataEntry = {
      key: key,
      value: value,
      timestamp: new Date().toISOString(),
      testName: this.currentTest?.name || 'global'
    };
    
    if (!this.results.data[key]) {
      this.results.data[key] = [];
    }
    this.results.data[key].push(dataEntry);
    
    if (this.currentTest) {
      this.currentTest.data[key] = value;
    }
    
    console.log(`📊 Data added: ${key}`);
  }
  
  /**
   * Add warning
   * @param {string} message - Warning message
   */
  addWarning(message) {
    const warning = {
      message: message,
      timestamp: new Date().toISOString(),
      testName: this.currentTest?.name || 'global'
    };
    
    this.results.warnings.push(warning);
    console.log(`⚠️ Warning: ${message}`);
  }
  
  /**
   * Add error
   * @param {string} message - Error message
   */
  addError(message) {
    const error = {
      message: message,
      timestamp: new Date().toISOString(),
      testName: this.currentTest?.name || 'global'
    };
    
    this.results.errors.push(error);
    console.log(`❌ Error: ${message}`);
  }
  
  /**
   * Add screenshot reference
   * @param {string} screenshotPath - Path to screenshot
   */
  addScreenshot(screenshotPath) {
    const screenshot = {
      path: screenshotPath,
      timestamp: new Date().toISOString(),
      testName: this.currentTest?.name || 'global'
    };
    
    if (this.currentTest) {
      this.currentTest.screenshots.push(screenshot);
    }
    
    console.log(`📸 Screenshot added: ${screenshotPath}`);
  }
  
  /**
   * Generate comprehensive test report
   */
  async generateReport() {
    this.results.endTime = new Date().toISOString();
    this.results.duration = new Date() - this.startTime;
    
    console.log('📊 Generating comprehensive test report...');
    
    // Generate JSON report
    await this.generateJsonReport();
    
    // Generate HTML report
    await this.generateHtmlReport();
    
    // Generate summary report
    await this.generateSummaryReport();
    
    // Generate CSV data export
    await this.generateCsvExport();
    
    console.log('✅ Test reports generated successfully');
    this.logReportSummary();
  }
  
  /**
   * Generate JSON report
   */
  async generateJsonReport() {
    const jsonPath = path.join(this.reportDir, `${this.suiteName}-report.json`);
    
    const detailedResults = {
      ...this.results,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'BrowserStack Professional QA Suite',
        nodeVersion: process.version,
        platform: process.platform,
        reporterVersion: '1.0.0'
      },
      statistics: this.calculateStatistics(),
      insights: this.generateInsights()
    };
    
    fs.writeFileSync(jsonPath, JSON.stringify(detailedResults, null, 2));
    console.log(`📄 JSON report saved: ${jsonPath}`);
  }
  
  /**
   * Generate HTML report
   */
  async generateHtmlReport() {
    const htmlPath = path.join(this.reportDir, 'html', `${this.suiteName}-report.html`);
    
    const html = this.generateHtmlContent();
    fs.writeFileSync(htmlPath, html);
    
    console.log(`🌐 HTML report saved: ${htmlPath}`);
  }
  
  /**
   * Generate HTML content
   */
  generateHtmlContent() {
    const passRate = this.results.summary.passRate.toFixed(1);
    const duration = (this.results.duration / 1000).toFixed(1);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BrowserStack Test Report - ${this.suiteName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; background: #f5f7fa; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; }
        .stat-label { color: #666; font-size: 0.9rem; }
        .passed { color: #10b981; }
        .failed { color: #ef4444; }
        .tests-table { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .tests-table th, .tests-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .tests-table th { background: #f9fafb; font-weight: 600; }
        .status { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
        .status.passed { background: #d1fae5; color: #065f46; }
        .status.failed { background: #fee2e2; color: #991b1b; }
        .section { background: white; margin-bottom: 1rem; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .section h3 { margin-top: 0; color: #374151; }
        .data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .data-item { background: #f9fafb; padding: 1rem; border-radius: 4px; border-left: 4px solid #667eea; }
        .error-item { background: #fef2f2; padding: 1rem; border-radius: 4px; border-left: 4px solid #ef4444; margin-bottom: 0.5rem; }
        .footer { text-align: center; padding: 2rem; color: #666; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏦 BankiMonline Test Report</h1>
        <h2>${this.suiteName}</h2>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="container">
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${this.results.summary.total}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-number passed">${this.results.summary.passed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number failed">${this.results.summary.failed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${passRate}%</div>
                <div class="stat-label">Pass Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${duration}s</div>
                <div class="stat-label">Duration</div>
            </div>
        </div>
        
        <div class="section">
            <h3>📋 Test Results</h3>
            <table class="tests-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Assertions</th>
                        <th>Errors</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.results.tests.map(test => `
                        <tr>
                            <td>${test.name}</td>
                            <td><span class="status ${test.status}">${test.status.toUpperCase()}</span></td>
                            <td>${(test.duration / 1000).toFixed(2)}s</td>
                            <td>${test.assertions.length}</td>
                            <td>${test.errors.length}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h3>📊 Test Data Summary</h3>
            <div class="data-grid">
                ${Object.entries(this.results.data).map(([key, entries]) => `
                    <div class="data-item">
                        <h4>${key}</h4>
                        <p>Entries: ${entries.length}</p>
                        <p>Latest: ${entries[entries.length - 1]?.timestamp}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${this.results.errors.length > 0 ? `
        <div class="section">
            <h3>❌ Errors</h3>
            ${this.results.errors.map(error => `
                <div class="error-item">
                    <strong>${error.testName}:</strong> ${error.message}
                    <br><small>${error.timestamp}</small>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="section">
            <h3>🔧 Environment Information</h3>
            <div class="data-grid">
                <div class="data-item">
                    <h4>Browser</h4>
                    <p>${this.results.browser}</p>
                </div>
                <div class="data-item">
                    <h4>Environment</h4>
                    <p>${this.results.environment}</p>
                </div>
                <div class="data-item">
                    <h4>Node Version</h4>
                    <p>${process.version}</p>
                </div>
                <div class="data-item">
                    <h4>Platform</h4>
                    <p>${process.platform}</p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>Generated by BrowserStack Professional QA Automation Suite</p>
        <p>🤖 Powered by Claude Code & BankiMonline Testing Framework</p>
    </div>
</body>
</html>`;
  }
  
  /**
   * Generate summary report
   */
  async generateSummaryReport() {
    const summaryPath = path.join(this.reportDir, `${this.suiteName}-summary.txt`);
    
    const summary = `
BrowserStack Professional QA Test Summary
==========================================
Suite: ${this.suiteName}
Browser: ${this.results.browser}
Environment: ${this.results.environment}
Generated: ${new Date().toLocaleString()}

RESULTS OVERVIEW
----------------
Total Tests: ${this.results.summary.total}
Passed: ${this.results.summary.passed}
Failed: ${this.results.summary.failed}
Skipped: ${this.results.summary.skipped}
Pass Rate: ${this.results.summary.passRate.toFixed(1)}%
Duration: ${(this.results.duration / 1000).toFixed(1)} seconds

DETAILED RESULTS
----------------
${this.results.tests.map(test => `
${test.status === 'passed' ? '✅' : '❌'} ${test.name}
   Duration: ${(test.duration / 1000).toFixed(2)}s
   Assertions: ${test.assertions.length}
   ${test.errors.length > 0 ? `Errors: ${test.errors.map(e => e.message).join(', ')}` : ''}
`).join('')}

${this.results.errors.length > 0 ? `
ERRORS SUMMARY
--------------
${this.results.errors.map(error => `- ${error.testName}: ${error.message}`).join('\n')}
` : ''}

DATA COLLECTED
--------------
${Object.keys(this.results.data).map(key => `- ${key}: ${this.results.data[key].length} entries`).join('\n')}
`;
    
    fs.writeFileSync(summaryPath, summary);
    console.log(`📋 Summary report saved: ${summaryPath}`);
  }
  
  /**
   * Generate CSV export
   */
  async generateCsvExport() {
    const csvPath = path.join(this.reportDir, `${this.suiteName}-data.csv`);
    
    const csvHeader = 'Test Name,Status,Duration (ms),Start Time,End Time,Assertions,Errors\n';
    const csvRows = this.results.tests.map(test => 
      `"${test.name}","${test.status}","${test.duration}","${test.startTime?.toISOString() || ''}","${test.endTime?.toISOString() || ''}","${test.assertions.length}","${test.errors.length}"`
    ).join('\n');
    
    fs.writeFileSync(csvPath, csvHeader + csvRows);
    console.log(`📊 CSV export saved: ${csvPath}`);
  }
  
  /**
   * Calculate detailed statistics
   */
  calculateStatistics() {
    const durations = this.results.tests.map(t => t.duration);
    const assertionsPerTest = this.results.tests.map(t => t.assertions.length);
    
    return {
      averageTestDuration: durations.reduce((a, b) => a + b, 0) / durations.length || 0,
      minTestDuration: Math.min(...durations) || 0,
      maxTestDuration: Math.max(...durations) || 0,
      totalAssertions: this.results.assertions.length,
      averageAssertionsPerTest: assertionsPerTest.reduce((a, b) => a + b, 0) / assertionsPerTest.length || 0,
      passedAssertions: this.results.assertions.filter(a => a.passed).length,
      failedAssertions: this.results.assertions.filter(a => !a.passed).length
    };
  }
  
  /**
   * Generate insights based on test results
   */
  generateInsights() {
    const insights = [];
    
    // Performance insights
    const stats = this.calculateStatistics();
    if (stats.averageTestDuration > 30000) {
      insights.push({
        type: 'performance',
        level: 'warning',
        message: `Average test duration (${(stats.averageTestDuration / 1000).toFixed(1)}s) is high. Consider optimizing test execution.`
      });
    }
    
    // Pass rate insights
    if (this.results.summary.passRate < 80) {
      insights.push({
        type: 'quality',
        level: 'error',
        message: `Pass rate (${this.results.summary.passRate.toFixed(1)}%) is below recommended threshold of 80%.`
      });
    } else if (this.results.summary.passRate >= 95) {
      insights.push({
        type: 'quality',
        level: 'success',
        message: `Excellent pass rate (${this.results.summary.passRate.toFixed(1)}%). Test suite is highly stable.`
      });
    }
    
    // Error pattern analysis
    if (this.results.errors.length > 0) {
      const errorPatterns = {};
      this.results.errors.forEach(error => {
        const pattern = error.message.split(':')[0];
        errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1;
      });
      
      const mostCommonError = Object.entries(errorPatterns)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mostCommonError) {
        insights.push({
          type: 'errors',
          level: 'warning',
          message: `Most common error pattern: "${mostCommonError[0]}" (${mostCommonError[1]} occurrences)`
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Log report summary to console
   */
  logReportSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Suite: ${this.suiteName}`);
    console.log(`Browser: ${this.results.browser}`);
    console.log(`Environment: ${this.results.environment}`);
    console.log(`Duration: ${(this.results.duration / 1000).toFixed(1)}s`);
    console.log('');
    console.log(`📋 Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⏭️ Skipped: ${this.results.summary.skipped}`);
    console.log(`📊 Pass Rate: ${this.results.summary.passRate.toFixed(1)}%`);
    console.log('');
    console.log(`📝 Total Assertions: ${this.results.assertions.length}`);
    console.log(`❌ Total Errors: ${this.results.errors.length}`);
    console.log(`⚠️ Total Warnings: ${this.results.warnings.length}`);
    console.log('='.repeat(60));
    
    // Report file locations
    console.log('\n📁 Report Files Generated:');
    console.log(`• JSON Report: ${this.reportDir}/${this.suiteName}-report.json`);
    console.log(`• HTML Report: ${this.reportDir}/html/${this.suiteName}-report.html`);
    console.log(`• Summary: ${this.reportDir}/${this.suiteName}-summary.txt`);
    console.log(`• CSV Data: ${this.reportDir}/${this.suiteName}-data.csv`);
  }
  
  /**
   * Get current test results
   */
  getResults() {
    return { ...this.results };
  }
}

module.exports = TestReporter;