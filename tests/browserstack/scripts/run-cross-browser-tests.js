/**
 * Cross-Browser Test Runner for BrowserStack
 * Professional QA automation orchestrator
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { getAllCapabilities } = require('../config/capabilities');
const config = require('../config/test-config');
const TestUtils = require('../utils/TestUtils');

class CrossBrowserTestRunner {
  constructor() {
    this.results = [];
    this.startTime = new Date();
    this.concurrent = parseInt(process.env.MAX_CONCURRENT) || 3;
    this.testSuites = [
      'mortgage-calculator-comprehensive.test.js',
      'mortgage-calculator-dropdown-validation.test.js'
    ];
  }

  /**
   * Run tests across multiple browsers
   * @param {string} category - Browser category (desktop, mobile, all)
   * @param {Array<string>} specificBrowsers - Specific browsers to test
   */
  async runCrossBrowserTests(category = 'desktop', specificBrowsers = null) {
    console.log('🚀 Starting Cross-Browser Test Execution');
    console.log('=' .repeat(60));
    
    const capabilities = specificBrowsers || 
      (category === 'all' ? this.getAllBrowserKeys() : this.getBrowserKeysForCategory(category));
    
    console.log(`📋 Testing on ${capabilities.length} browser configurations:`);
    capabilities.forEach(browser => console.log(`  • ${browser}`));
    console.log('');
    
    const testPromises = [];
    const semaphore = new Array(this.concurrent).fill(null);
    
    for (const browser of capabilities) {
      for (const testSuite of this.testSuites) {
        // Wait for available slot
        await this.waitForSlot(semaphore);
        
        const testPromise = this.runSingleTest(browser, testSuite)
          .finally(() => {
            // Free up the slot
            const index = semaphore.findIndex(p => p === testPromise);
            if (index !== -1) {
              semaphore[index] = null;
            }
          });
        
        // Occupy the slot
        const freeIndex = semaphore.findIndex(p => p === null);
        semaphore[freeIndex] = testPromise;
        testPromises.push(testPromise);
      }
    }
    
    console.log(`⚡ Running ${testPromises.length} test configurations with ${this.concurrent} concurrent executions...`);
    
    // Wait for all tests to complete
    const results = await Promise.allSettled(testPromises);
    
    // Process results
    await this.processResults(results);
    
    // Generate comprehensive report
    await this.generateCrossBrowserReport();
    
    console.log('\n🏁 Cross-browser testing completed!');
    return this.results;
  }
  
  /**
   * Wait for an available slot in semaphore
   * @param {Array} semaphore - Semaphore array
   */
  async waitForSlot(semaphore) {
    while (semaphore.every(slot => slot !== null)) {
      await TestUtils.sleep(1000);
    }
  }
  
  /**
   * Run single test configuration
   * @param {string} browser - Browser key
   * @param {string} testSuite - Test suite filename
   */
  async runSingleTest(browser, testSuite) {
    const testId = TestUtils.generateTestId(`${testSuite}-${browser}`, browser);
    const startTime = new Date();
    
    console.log(`🧪 Starting: ${testSuite} on ${browser}`);
    
    try {
      const result = await this.executeTest(browser, testSuite, testId);
      
      const testResult = {
        id: testId,
        browser: browser,
        testSuite: testSuite,
        status: result.exitCode === 0 ? 'PASSED' : 'FAILED',
        exitCode: result.exitCode,
        duration: new Date() - startTime,
        startTime: startTime,
        endTime: new Date(),
        stdout: result.stdout,
        stderr: result.stderr,
        reportPath: result.reportPath
      };
      
      this.results.push(testResult);
      
      const statusIcon = testResult.status === 'PASSED' ? '✅' : '❌';
      console.log(`${statusIcon} Completed: ${testSuite} on ${browser} (${(testResult.duration / 1000).toFixed(1)}s)`);
      
      return testResult;
      
    } catch (error) {
      const testResult = {
        id: testId,
        browser: browser,
        testSuite: testSuite,
        status: 'ERROR',
        error: error.message,
        duration: new Date() - startTime,
        startTime: startTime,
        endTime: new Date()
      };
      
      this.results.push(testResult);
      console.error(`❌ Error: ${testSuite} on ${browser} - ${error.message}`);
      
      return testResult;
    }
  }
  
  /**
   * Execute test using Mocha
   * @param {string} browser - Browser key
   * @param {string} testSuite - Test suite filename
   * @param {string} testId - Unique test identifier
   */
  async executeTest(browser, testSuite, testId) {
    return new Promise((resolve, reject) => {
      const testPath = path.join(__dirname, '../tests', testSuite);
      const reportPath = path.join(__dirname, '../reports', `${testId}-report.json`);
      
      const env = {
        ...process.env,
        BROWSER: browser,
        TEST_ID: testId,
        REPORT_PATH: reportPath
      };
      
      let stdout = '';
      let stderr = '';
      
      const testProcess = spawn('npx', [
        'mocha',
        testPath,
        '--reporter', 'json',
        '--timeout', '120000',
        '--bail'
      ], {
        env: env,
        cwd: path.join(__dirname, '..')
      });
      
      testProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      testProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      testProcess.on('close', (code) => {
        resolve({
          exitCode: code,
          stdout: stdout,
          stderr: stderr,
          reportPath: reportPath
        });
      });
      
      testProcess.on('error', (error) => {
        reject(error);
      });
      
      // Set timeout for individual test
      setTimeout(() => {
        testProcess.kill('SIGTERM');
        reject(new Error('Test execution timeout'));
      }, 300000); // 5 minute timeout per test
    });
  }
  
  /**
   * Process all test results
   * @param {Array} results - Array of Promise results
   */
  async processResults(results) {
    console.log('\n📊 Processing test results...');
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ Successful executions: ${successful}`);
    console.log(`❌ Failed executions: ${failed}`);
    
    // Analyze results by browser
    const browserResults = {};
    this.results.forEach(result => {
      if (!browserResults[result.browser]) {
        browserResults[result.browser] = [];
      }
      browserResults[result.browser].push(result);
    });
    
    console.log('\n🌐 Results by browser:');
    Object.entries(browserResults).forEach(([browser, results]) => {
      const passed = results.filter(r => r.status === 'PASSED').length;
      const total = results.length;
      const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
      
      console.log(`  ${browser}: ${passed}/${total} (${passRate}%)`);
    });
  }
  
  /**
   * Generate comprehensive cross-browser report
   */
  async generateCrossBrowserReport() {
    console.log('\n📋 Generating cross-browser report...');
    
    const endTime = new Date();
    const totalDuration = endTime - this.startTime;
    
    const report = {
      summary: {
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalDuration: totalDuration,
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.status === 'PASSED').length,
        failedTests: this.results.filter(r => r.status === 'FAILED').length,
        errorTests: this.results.filter(r => r.status === 'ERROR').length
      },
      
      browserAnalysis: this.analyzeBrowserResults(),
      testSuiteAnalysis: this.analyzeTestSuiteResults(),
      performanceAnalysis: this.analyzePerformance(),
      
      detailedResults: this.results,
      
      metadata: {
        ...TestUtils.getExecutionMetadata(),
        concurrent: this.concurrent,
        testSuites: this.testSuites,
        reportGeneratedAt: new Date().toISOString()
      }
    };
    
    // Save JSON report
    const reportPath = path.join(__dirname, '../reports', `cross-browser-report-${TestUtils.getTimestamp()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    await this.generateHtmlReport(report);
    
    // Generate summary table
    this.printSummaryTable(report);
    
    console.log(`📄 Cross-browser report saved: ${reportPath}`);
  }
  
  /**
   * Analyze results by browser
   */
  analyzeBrowserResults() {
    const browserStats = {};
    
    this.results.forEach(result => {
      if (!browserStats[result.browser]) {
        browserStats[result.browser] = {
          total: 0,
          passed: 0,
          failed: 0,
          errors: 0,
          totalDuration: 0,
          avgDuration: 0
        };
      }
      
      const stats = browserStats[result.browser];
      stats.total++;
      stats.totalDuration += result.duration || 0;
      
      switch (result.status) {
        case 'PASSED':
          stats.passed++;
          break;
        case 'FAILED':
          stats.failed++;
          break;
        case 'ERROR':
          stats.errors++;
          break;
      }
    });
    
    // Calculate averages and pass rates
    Object.values(browserStats).forEach(stats => {
      stats.avgDuration = stats.total > 0 ? Math.round(stats.totalDuration / stats.total) : 0;
      stats.passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
    });
    
    return browserStats;
  }
  
  /**
   * Analyze results by test suite
   */
  analyzeTestSuiteResults() {
    const suiteStats = {};
    
    this.results.forEach(result => {
      if (!suiteStats[result.testSuite]) {
        suiteStats[result.testSuite] = {
          total: 0,
          passed: 0,
          failed: 0,
          errors: 0,
          browsers: new Set(),
          totalDuration: 0
        };
      }
      
      const stats = suiteStats[result.testSuite];
      stats.total++;
      stats.browsers.add(result.browser);
      stats.totalDuration += result.duration || 0;
      
      switch (result.status) {
        case 'PASSED':
          stats.passed++;
          break;
        case 'FAILED':
          stats.failed++;
          break;
        case 'ERROR':
          stats.errors++;
          break;
      }
    });
    
    // Convert Sets to arrays and calculate rates
    Object.values(suiteStats).forEach(stats => {
      stats.browsers = Array.from(stats.browsers);
      stats.passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
      stats.avgDuration = stats.total > 0 ? Math.round(stats.totalDuration / stats.total) : 0;
    });
    
    return suiteStats;
  }
  
  /**
   * Analyze performance metrics
   */
  analyzePerformance() {
    const durations = this.results.map(r => r.duration || 0);
    
    return {
      totalExecutionTime: durations.reduce((a, b) => a + b, 0),
      averageTestDuration: durations.reduce((a, b) => a + b, 0) / durations.length || 0,
      fastestTest: Math.min(...durations),
      slowestTest: Math.max(...durations),
      
      performanceByBrowser: this.results.reduce((acc, result) => {
        if (!acc[result.browser]) {
          acc[result.browser] = [];
        }
        acc[result.browser].push(result.duration || 0);
        return acc;
      }, {}),
      
      timeToComplete: new Date() - this.startTime
    };
  }
  
  /**
   * Generate HTML cross-browser report
   */
  async generateHtmlReport(report) {
    const htmlPath = path.join(__dirname, '../reports/html', `cross-browser-report-${TestUtils.getTimestamp()}.html`);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BrowserStack Cross-Browser Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; background: #f5f7fa; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric { text-align: center; }
        .metric-value { font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem; }
        .metric-label { color: #666; font-size: 0.9rem; }
        .passed { color: #10b981; }
        .failed { color: #ef4444; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .table th { background: #f9fafb; font-weight: 600; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
        .status-passed { background: #d1fae5; color: #065f46; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .status-error { background: #fef3c7; color: #92400e; }
        h2 { color: #374151; margin-top: 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌐 Cross-Browser Test Report</h1>
        <p>BankiMonline Mortgage Calculator Testing</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="container">
        <div class="grid">
            <div class="card metric">
                <div class="metric-value">${report.summary.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="card metric">
                <div class="metric-value passed">${report.summary.passedTests}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="card metric">
                <div class="metric-value failed">${report.summary.failedTests}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="card metric">
                <div class="metric-value">${((report.summary.passedTests / report.summary.totalTests) * 100).toFixed(1)}%</div>
                <div class="metric-label">Pass Rate</div>
            </div>
            <div class="card metric">
                <div class="metric-value">${(report.summary.totalDuration / 1000 / 60).toFixed(1)}m</div>
                <div class="metric-label">Total Duration</div>
            </div>
        </div>
        
        <div class="card">
            <h2>Browser Compatibility Results</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Browser</th>
                        <th>Tests Run</th>
                        <th>Passed</th>
                        <th>Failed</th>
                        <th>Pass Rate</th>
                        <th>Avg Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(report.browserAnalysis).map(([browser, stats]) => `
                        <tr>
                            <td><strong>${browser}</strong></td>
                            <td>${stats.total}</td>
                            <td><span class="status-badge status-passed">${stats.passed}</span></td>
                            <td><span class="status-badge status-failed">${stats.failed}</span></td>
                            <td>${stats.passRate}%</td>
                            <td>${(stats.avgDuration / 1000).toFixed(1)}s</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="card">
            <h2>Test Suite Performance</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Test Suite</th>
                        <th>Browsers Tested</th>
                        <th>Total Executions</th>
                        <th>Pass Rate</th>
                        <th>Avg Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(report.testSuiteAnalysis).map(([suite, stats]) => `
                        <tr>
                            <td><strong>${suite}</strong></td>
                            <td>${stats.browsers.length}</td>
                            <td>${stats.total}</td>
                            <td>${stats.passRate}%</td>
                            <td>${(stats.avgDuration / 1000).toFixed(1)}s</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
    
    // Ensure HTML directory exists
    const htmlDir = path.dirname(htmlPath);
    if (!fs.existsSync(htmlDir)) {
      fs.mkdirSync(htmlDir, { recursive: true });
    }
    
    fs.writeFileSync(htmlPath, html);
    console.log(`🌐 HTML report saved: ${htmlPath}`);
  }
  
  /**
   * Print summary table to console
   */
  printSummaryTable(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🏆 CROSS-BROWSER TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${report.summary.totalTests} | Passed: ${report.summary.passedTests} | Failed: ${report.summary.failedTests}`);
    console.log(`Overall Pass Rate: ${((report.summary.passedTests / report.summary.totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Execution Time: ${(report.summary.totalDuration / 1000 / 60).toFixed(1)} minutes`);
    console.log('');
    console.log('Browser Compatibility:');
    console.log('-'.repeat(80));
    
    Object.entries(report.browserAnalysis).forEach(([browser, stats]) => {
      const passRateIcon = parseFloat(stats.passRate) >= 90 ? '✅' : parseFloat(stats.passRate) >= 70 ? '⚠️' : '❌';
      console.log(`${passRateIcon} ${browser.padEnd(20)} | ${stats.passed}/${stats.total} (${stats.passRate}%) | Avg: ${(stats.avgDuration / 1000).toFixed(1)}s`);
    });
    
    console.log('='.repeat(80));
  }
  
  /**
   * Get all browser keys
   */
  getAllBrowserKeys() {
    return [
      'chrome-latest',
      'firefox-latest', 
      'safari-latest',
      'edge-latest',
      'iphone-14-pro',
      'samsung-s23'
    ];
  }
  
  /**
   * Get browser keys for category
   */
  getBrowserKeysForCategory(category) {
    const categories = {
      desktop: ['chrome-latest', 'firefox-latest', 'safari-latest', 'edge-latest'],
      mobile: ['iphone-14-pro', 'samsung-s23'],
      chrome: ['chrome-latest'],
      firefox: ['firefox-latest'],
      safari: ['safari-latest', 'iphone-14-pro'],
      performance: ['chrome-slow-network', 'mobile-2g']
    };
    
    return categories[category] || categories.desktop;
  }
}

// CLI execution
if (require.main === module) {
  const runner = new CrossBrowserTestRunner();
  
  const category = process.argv[2] || 'desktop';
  const specificBrowsers = process.argv.slice(3).length > 0 ? process.argv.slice(3) : null;
  
  runner.runCrossBrowserTests(category, specificBrowsers)
    .then((results) => {
      const passedTests = results.filter(r => r.status === 'PASSED').length;
      const totalTests = results.length;
      const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
      
      console.log(`\n🎯 Final Results: ${passedTests}/${totalTests} tests passed (${passRate.toFixed(1)}%)`);
      
      // Exit with appropriate code
      process.exit(passRate >= 70 ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Cross-browser test execution failed:', error);
      process.exit(1);
    });
}

module.exports = CrossBrowserTestRunner;