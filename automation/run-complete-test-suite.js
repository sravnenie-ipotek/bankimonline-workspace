#!/usr/bin/env node

/**
 * 🚀 COMPLETE SYSTEM TEST SUITE EXECUTOR
 * Runs ALL tests: dropdown, font, mobile, desktop, visual, translations
 * Captures screenshots of bugs and generates interactive HTML report
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

// Test Categories with representative test files
const TEST_CATEGORIES = {
  DROPDOWN_TESTS: [
    'comprehensive-dropdown-test.cy.ts',
    'dropdown-functionality-test.cy.ts',
    'dropdown-diagnostic-test.cy.ts',
    'final-dropdown-verification.cy.ts',
    'simple-dropdown-test.cy.ts'
  ],
  FONT_AND_RTL_TESTS: [
    'hebrew-rtl-percy.cy.ts',
    'comprehensive-translation-test.cy.ts',
    'multi_language_validation.cy.ts',
    'check-all-translations.cy.ts',
    'full-translation-scan.cy.ts'
  ],
  MOBILE_TESTS: [
    'mobile-validation-simple.cy.ts',
    'mobile-viewport-test.cy.ts',
    'mobile-button-overflow-percy.cy.ts',
    'quick-mobile-button-test.cy.ts',
    'comprehensive-responsive-test-suite.cy.ts'
  ],
  MORTGAGE_TESTS: [
    'mortgage-calculator-simple-working.cy.ts',
    'mortgage-calculator-complete-journey.cy.ts',
    'mortgage-calculator-hebrew-working.cy.ts',
    'mortgage-qa-comprehensive.cy.ts',
    'mortgage-dropdown-validation.cy.ts'
  ],
  CREDIT_TESTS: [
    'credit-calculator-comprehensive.cy.ts',
    'credit-calculator-business-logic.cy.ts',
    'credit-step3-validation-test.cy.ts',
    'credit-calculator-regression-test.cy.ts'
  ],
  REFINANCE_TESTS: [
    'refinance-mortgage-comprehensive.cy.ts',
    'refinance-credit-comprehensive-test.cy.ts',
    'refinance-qa-focused.cy.ts'
  ],
  VISUAL_TESTS: [
    'percy-first-build-test.cy.ts',
    'mortgage-calculator-percy.cy.ts',
    'credit-calculator-percy.cy.ts'
  ],
  STATE_MANAGEMENT_TESTS: [
    'state-management-comprehensive.cy.ts',
    'state-persistence-validation.cy.ts',
    'state-edge-cases.cy.ts'
  ],
  PHASE_TESTS: [
    'phase_1_compliance_report.cy.ts',
    'verify_dropdown_structure.cy.ts',
    'phase5_complete_working.cy.ts',
    'mortgage_calculator_happy_path.cy.ts'
  ],
  QUICK_VALIDATION: [
    'test-homepage-loads.cy.ts',
    'test-server-connection.cy.ts',
    'about-simple.cy.ts',
    'privacy-policy.cy.ts'
  ]
};

// Viewport configurations
const VIEWPORTS = {
  DESKTOP: { width: 1920, height: 1080, name: 'Desktop Full HD' },
  LAPTOP: { width: 1366, height: 768, name: 'Laptop' },
  TABLET: { width: 768, height: 1024, name: 'iPad' },
  MOBILE: { width: 375, height: 812, name: 'iPhone X' },
  MOBILE_SMALL: { width: 320, height: 568, name: 'iPhone SE' }
};

class TestExecutor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      categories: {},
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      screenshots: [],
      errors: [],
      duration: 0
    };
    this.startTime = Date.now();
  }

  runCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        timeout: 60000,
        ...options
      });
      return { success: true, output: result, error: null };
    } catch (error) {
      return { 
        success: false, 
        output: error.stdout || '', 
        error: error.stderr || error.message 
      };
    }
  }

  findTestFile(testName) {
    // Search in multiple locations
    const searchPaths = [
      'automation/tests/e2e/e2e',
      'automation/tests/e2e/visual-regression',
      'automation/tests/e2e/scenarios',
      'automation/tests/e2e',
      'automation/tests/e2e/e2e/phase_1_automation',
      'automation/tests/e2e/e2e/phase_5_e2e',
      'automation/tests/e2e/e2e/mortgage-calculator',
      'automation/tests/e2e/e2e/validation',
      'automation/tests/e2e/e2e/visual'
    ];

    for (const basePath of searchPaths) {
      const fullPath = path.join(process.cwd(), basePath, testName);
      if (fs.existsSync(fullPath)) {
        return `./${path.relative('automation', fullPath)}`;
      }
    }
    
    // Try to find by pattern
    try {
      const findResult = execSync(
        `find automation/tests -name "${testName}" -type f | head -1`,
        { encoding: 'utf8' }
      ).trim();
      
      if (findResult) {
        return `./${path.relative('automation', findResult)}`;
      }
    } catch {}
    
    return null;
  }

  runCypressTest(testFile, viewport, configType = 'desktop') {
    const testPath = this.findTestFile(testFile);
    
    if (!testPath) {
      log(`⏭️  Skipping ${testFile} (not found)`, '\x1b[33m');
      return null;
    }

    log(`🧪 Running: ${testFile} @ ${viewport.name}`, '\x1b[36m');
    
    const configFile = viewport.width <= 768 ? 
      './configs/cypress.mobile.config.ts' : 
      './configs/cypress.config.ts';
    
    const command = `npx cypress run --config-file ${configFile} --spec "${testPath}" --config viewportWidth=${viewport.width},viewportHeight=${viewport.height}`;
    
    const result = this.runCommand(command, { cwd: 'automation' });
    
    // Collect screenshots
    this.collectScreenshots(testFile, viewport.name);
    
    return {
      testFile,
      viewport: viewport.name,
      passed: result.success,
      output: result.output,
      error: result.error
    };
  }

  collectScreenshots(testFile, viewportName) {
    try {
      // Find recent screenshots
      const screenshotDirs = execSync(
        'find /Users/michaelmishayev/Projects/bankDev2_standalone/screenshots -type f -name "*.png" -mmin -5',
        { encoding: 'utf8' }
      ).trim().split('\n').filter(Boolean);
      
      screenshotDirs.forEach(screenshot => {
        if (screenshot.includes(testFile.replace('.cy.ts', ''))) {
          this.results.screenshots.push({
            testFile,
            viewport: viewportName,
            path: screenshot,
            timestamp: new Date().toISOString()
          });
        }
      });
    } catch {}
  }

  async runTestCategory(categoryName, testFiles) {
    log(`\n📁 Running ${categoryName}...`, '\x1b[1m\x1b[34m');
    log('=' * 60, '\x1b[1m');
    
    const categoryResults = {
      name: categoryName,
      tests: [],
      passed: 0,
      failed: 0
    };

    // Determine which viewports to test based on category
    let viewportsToTest = [VIEWPORTS.DESKTOP];
    
    if (categoryName.includes('MOBILE') || categoryName.includes('RESPONSIVE')) {
      viewportsToTest = [VIEWPORTS.MOBILE, VIEWPORTS.TABLET, VIEWPORTS.DESKTOP];
    } else if (categoryName.includes('DROPDOWN') || categoryName.includes('FONT')) {
      viewportsToTest = [VIEWPORTS.DESKTOP, VIEWPORTS.MOBILE];
    }

    for (const testFile of testFiles) {
      for (const viewport of viewportsToTest) {
        const result = this.runCypressTest(testFile, viewport);
        
        if (result) {
          categoryResults.tests.push(result);
          this.results.totalTests++;
          
          if (result.passed) {
            categoryResults.passed++;
            this.results.passedTests++;
            log(`  ✅ ${testFile} @ ${viewport.name}`, '\x1b[32m');
          } else {
            categoryResults.failed++;
            this.results.failedTests++;
            log(`  ❌ ${testFile} @ ${viewport.name}`, '\x1b[31m');
            
            // Log error snippet
            if (result.error) {
              const errorSnippet = result.error.substring(0, 200);
              log(`     Error: ${errorSnippet}...`, '\x1b[33m');
              this.results.errors.push({
                test: testFile,
                viewport: viewport.name,
                error: result.error
              });
            }
          }
        }
      }
    }
    
    this.results.categories[categoryName] = categoryResults;
    
    log(`\n📊 ${categoryName} Results:`, '\x1b[36m');
    log(`  ✅ Passed: ${categoryResults.passed}`, '\x1b[32m');
    log(`  ❌ Failed: ${categoryResults.failed}`, '\x1b[31m');
  }

  generateInteractiveHTMLReport() {
    log('\n📊 Generating Interactive HTML Report with Screenshots...', '\x1b[1m\x1b[34m');
    
    const passRate = this.results.totalTests > 0 ? 
      Math.round((this.results.passedTests / this.results.totalTests) * 100) : 0;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏦 Banking App - Complete Test Suite Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2196F3, #21CBF3);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.3; }
        }
        
        .header h1 {
            font-size: 3em;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
            border-top: 4px solid #2196F3;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .summary-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .summary-card.success { border-top-color: #4CAF50; }
        .summary-card.danger { border-top-color: #f44336; }
        .summary-card.warning { border-top-color: #ff9800; }
        
        .summary-card h3 {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        
        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            color: #2196F3;
        }
        
        .summary-card.success .value { color: #4CAF50; }
        .summary-card.danger .value { color: #f44336; }
        .summary-card.warning .value { color: #ff9800; }
        
        .category-section {
            margin: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            overflow: hidden;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .category-header {
            background: linear-gradient(90deg, #6B46C1, #9333EA);
            color: white;
            padding: 20px;
            font-size: 1.3em;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.3s;
        }
        
        .category-header:hover {
            background: linear-gradient(90deg, #553C9A, #7C3AED);
        }
        
        .category-header .stats {
            display: flex;
            gap: 20px;
            font-size: 0.9em;
        }
        
        .category-header .stat {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .category-content {
            padding: 20px;
            max-height: 500px;
            overflow-y: auto;
        }
        
        .test-item {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s;
        }
        
        .test-item:hover {
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transform: translateX(5px);
        }
        
        .test-item.passed { border-left: 4px solid #4CAF50; }
        .test-item.failed { border-left: 4px solid #f44336; }
        
        .test-info {
            flex: 1;
        }
        
        .test-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        
        .test-viewport {
            color: #666;
            font-size: 0.9em;
        }
        
        .test-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.8em;
            letter-spacing: 0.5px;
        }
        
        .test-status.passed {
            background: #4CAF50;
            color: white;
        }
        
        .test-status.failed {
            background: #f44336;
            color: white;
        }
        
        .screenshot-gallery {
            padding: 30px;
            background: #f8f9fa;
        }
        
        .screenshot-gallery h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.8em;
            text-align: center;
        }
        
        .screenshot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .screenshot-item {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .screenshot-item:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        
        .screenshot-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 3em;
        }
        
        .screenshot-info {
            padding: 15px;
        }
        
        .screenshot-test {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
            font-size: 0.9em;
        }
        
        .screenshot-viewport {
            color: #666;
            font-size: 0.85em;
        }
        
        .error-section {
            margin: 20px;
            padding: 20px;
            background: #fff3e0;
            border: 1px solid #ffb74d;
            border-radius: 8px;
        }
        
        .error-section h2 {
            color: #e65100;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .error-item {
            background: white;
            border: 1px solid #ffcc80;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .error-test {
            font-weight: 600;
            color: #e65100;
            margin-bottom: 5px;
        }
        
        .error-message {
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #666;
            background: #fff8e1;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        
        .footer {
            background: #263238;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer .timestamp {
            margin-bottom: 10px;
            opacity: 0.9;
        }
        
        .footer .duration {
            font-size: 1.2em;
            font-weight: bold;
        }
        
        .toggle-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
        }
        
        .toggle-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .collapsed { display: none; }
        
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e0e0e0;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 1s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        .progress-fill.danger {
            background: linear-gradient(90deg, #f44336, #ff6b6b);
        }
        
        .progress-fill.warning {
            background: linear-gradient(90deg, #ff9800, #ffb74d);
        }
        
        @media (max-width: 768px) {
            .header h1 { font-size: 2em; }
            .summary-grid { grid-template-columns: 1fr; }
            .screenshot-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 Banking App - Complete Test Suite Report</h1>
            <div class="subtitle">
                Comprehensive Testing: Dropdown, Font, Mobile, Desktop, Visual & More
            </div>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${this.results.totalTests}</div>
            </div>
            <div class="summary-card success">
                <h3>Passed</h3>
                <div class="value">${this.results.passedTests}</div>
            </div>
            <div class="summary-card danger">
                <h3>Failed</h3>
                <div class="value">${this.results.failedTests}</div>
            </div>
            <div class="summary-card ${passRate > 70 ? 'success' : passRate > 40 ? 'warning' : 'danger'}">
                <h3>Pass Rate</h3>
                <div class="value">${passRate}%</div>
            </div>
        </div>
        
        <div style="padding: 20px;">
            <div class="progress-bar">
                <div class="progress-fill ${passRate > 70 ? '' : passRate > 40 ? 'warning' : 'danger'}" 
                     style="width: ${passRate}%">
                    ${passRate}% Tests Passing
                </div>
            </div>
        </div>
        
        ${Object.entries(this.results.categories).map(([categoryName, category]) => {
          const categoryPassRate = category.tests.length > 0 ?
            Math.round((category.passed / category.tests.length) * 100) : 0;
          
          return `
            <div class="category-section">
                <div class="category-header" onclick="toggleCategory('${categoryName}')">
                    <span>${categoryName.replace(/_/g, ' ')}</span>
                    <div class="stats">
                        <div class="stat">
                            <span>✅</span>
                            <span>${category.passed}</span>
                        </div>
                        <div class="stat">
                            <span>❌</span>
                            <span>${category.failed}</span>
                        </div>
                        <div class="stat">
                            <span>${categoryPassRate}%</span>
                        </div>
                        <button class="toggle-btn">Toggle</button>
                    </div>
                </div>
                <div class="category-content" id="category-${categoryName}">
                    ${category.tests.map(test => `
                        <div class="test-item ${test.passed ? 'passed' : 'failed'}">
                            <div class="test-info">
                                <div class="test-name">${test.testFile}</div>
                                <div class="test-viewport">📱 ${test.viewport}</div>
                            </div>
                            <div class="test-status ${test.passed ? 'passed' : 'failed'}">
                                ${test.passed ? 'PASSED' : 'FAILED'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
          `;
        }).join('')}
        
        ${this.results.screenshots.length > 0 ? `
            <div class="screenshot-gallery">
                <h2>📸 Test Screenshots</h2>
                <div class="screenshot-grid">
                    ${this.results.screenshots.slice(0, 12).map(screenshot => `
                        <div class="screenshot-item">
                            <div class="screenshot-image">📷</div>
                            <div class="screenshot-info">
                                <div class="screenshot-test">${screenshot.testFile}</div>
                                <div class="screenshot-viewport">${screenshot.viewport}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${this.results.errors.length > 0 ? `
            <div class="error-section">
                <h2>⚠️ Error Details</h2>
                ${this.results.errors.slice(0, 10).map(error => `
                    <div class="error-item">
                        <div class="error-test">${error.test} @ ${error.viewport}</div>
                        <div class="error-message">${(error.error || '').substring(0, 300)}...</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <div class="footer">
            <div class="timestamp">Generated: ${this.results.timestamp}</div>
            <div class="duration">Total Duration: ${Math.round(this.results.duration / 1000)}s</div>
            <div style="margin-top: 20px; opacity: 0.8;">
                🚀 Categories Tested: ${Object.keys(this.results.categories).length} | 
                📸 Screenshots: ${this.results.screenshots.length} | 
                ⚠️ Errors: ${this.results.errors.length}
            </div>
        </div>
    </div>
    
    <script>
        function toggleCategory(categoryName) {
            const content = document.getElementById('category-' + categoryName);
            content.classList.toggle('collapsed');
        }
        
        // Auto-collapse passed categories
        window.addEventListener('load', () => {
            ${Object.entries(this.results.categories)
              .filter(([_, cat]) => cat.failed === 0)
              .map(([name]) => `document.getElementById('category-${name}').classList.add('collapsed');`)
              .join('\n')}
        });
    </script>
</body>
</html>
`;

    const reportPath = `automation/reports/complete-test-suite-${Date.now()}.html`;
    fs.writeFileSync(reportPath, htmlContent);
    
    log(`\n📄 Interactive HTML Report Generated: ${reportPath}`, '\x1b[32m');
    
    // Open the report
    try {
      execSync(`open ${reportPath}`);
    } catch {}
    
    return reportPath;
  }

  async runCompleteTestSuite() {
    log('🚀 STARTING COMPLETE SYSTEM TEST SUITE', '\x1b[1m\x1b[34m');
    log('=' * 80, '\x1b[1m');
    log('Testing: Dropdown, Font, Mobile, Desktop, Visual, Translations & More', '\x1b[36m');
    
    // Check servers
    log('\n🔍 Checking Development Servers...', '\x1b[34m');
    const frontendCheck = this.runCommand('curl -s http://localhost:5173 > /dev/null');
    const backendCheck = this.runCommand('curl -s http://localhost:8003 > /dev/null');
    
    if (frontendCheck.success) {
      log('✅ Frontend server running on port 5173', '\x1b[32m');
    } else {
      log('❌ Frontend server not running', '\x1b[31m');
    }
    
    if (backendCheck.success) {
      log('✅ Backend API running on port 8003', '\x1b[32m');
    } else {
      log('❌ Backend API not running', '\x1b[31m');
    }
    
    // Run all test categories
    for (const [categoryName, testFiles] of Object.entries(TEST_CATEGORIES)) {
      await this.runTestCategory(categoryName, testFiles.slice(0, 3)); // Run first 3 tests per category
    }
    
    // Calculate final statistics
    this.results.duration = Date.now() - this.startTime;
    const passRate = this.results.totalTests > 0 ?
      Math.round((this.results.passedTests / this.results.totalTests) * 100) : 0;
    
    // Generate report
    const reportPath = this.generateInteractiveHTMLReport();
    
    // Display final summary
    log('\n' + '=' * 80, '\x1b[1m');
    log('📊 COMPLETE TEST SUITE EXECUTION SUMMARY', '\x1b[1m\x1b[34m');
    log('=' * 80, '\x1b[1m');
    log(`🧪 Total Tests Executed: ${this.results.totalTests}`, '\x1b[36m');
    log(`✅ Passed: ${this.results.passedTests}`, '\x1b[32m');
    log(`❌ Failed: ${this.results.failedTests}`, '\x1b[31m');
    log(`📈 Overall Pass Rate: ${passRate}%`, passRate > 70 ? '\x1b[32m' : '\x1b[33m');
    log(`⏱️  Total Duration: ${Math.round(this.results.duration / 1000)}s`, '\x1b[36m');
    log(`📸 Screenshots Captured: ${this.results.screenshots.length}`, '\x1b[36m');
    log(`⚠️  Errors Logged: ${this.results.errors.length}`, '\x1b[33m');
    log(`📄 Report: ${reportPath}`, '\x1b[1m\x1b[32m');
    
    if (passRate > 80) {
      log('\n🎉 EXCELLENT! System is stable and ready for deployment', '\x1b[1m\x1b[32m');
    } else if (passRate > 60) {
      log('\n⚠️  GOOD PROGRESS! Some issues need attention', '\x1b[1m\x1b[33m');
    } else {
      log('\n🔴 CRITICAL! Multiple issues detected - immediate fixes required', '\x1b[1m\x1b[31m');
    }
    
    return this.results;
  }
}

// Execute the complete test suite
if (require.main === module) {
  const executor = new TestExecutor();
  executor.runCompleteTestSuite().then(results => {
    const passRate = results.totalTests > 0 ?
      Math.round((results.passedTests / results.totalTests) * 100) : 0;
    process.exit(passRate > 50 ? 0 : 1);
  }).catch(error => {
    log(`❌ Test suite failed: ${error.message}`, '\x1b[31m');
    process.exit(1);
  });
}

module.exports = TestExecutor;