#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Essential E2E Test Suite with Screenshot Capture');
console.log('=' .repeat(60));

// Test results storage
const results = {
    desktop: [],
    tablet: [],
    mobile: [],
    dropdown: [],
    rtl: [],
    screenshots: []
};

// Start servers
console.log('\n📦 Starting Development Servers...');
try {
    execSync('pkill -f "vite" || true', { stdio: 'ignore' });
    execSync('pkill -f "server-db.js" || true', { stdio: 'ignore' });
    
    // Start backend
    execSync('cd .. && node server/server-db.js > /dev/null 2>&1 &', { shell: true });
    console.log('✅ Backend started on port 8003');
    
    // Start frontend
    execSync('cd ../mainapp && npm run dev > /dev/null 2>&1 &', { shell: true });
    console.log('✅ Frontend started on port 5173');
    
    // Wait for servers
    execSync('sleep 5');
} catch (err) {
    console.log('⚠️ Server startup warning (may already be running)');
}

// Essential test files to run
const ESSENTIAL_TESTS = {
    mobile: [
        'mobile-validation-simple.cy.ts'
    ],
    dropdown: [
        'comprehensive-dropdown-test.cy.ts'
    ],
    rtl: [
        'hebrew-rtl-percy.cy.ts'
    ],
    mortgage: [
        'mortgage-calculator-simple-working.cy.ts'
    ]
};

// Run test with proper error handling
function runTest(testFile, viewport, category) {
    const viewportFlag = viewport === 'mobile' ? '--config viewportWidth=375,viewportHeight=812' :
                        viewport === 'tablet' ? '--config viewportWidth=768,viewportHeight=1024' :
                        '--config viewportWidth=1920,viewportHeight=1080';
    
    const screenshotDir = path.join(__dirname, 'screenshots', category, viewport);
    fs.mkdirSync(screenshotDir, { recursive: true });
    
    try {
        console.log(`\n🧪 Running ${testFile} @ ${viewport}`);
        const output = execSync(
            `npx cypress run --spec "tests/e2e/${testFile}" ${viewportFlag} --config screenshotsFolder="${screenshotDir}" --reporter json`,
            { 
                cwd: __dirname,
                encoding: 'utf8',
                timeout: 60000
            }
        );
        
        // Parse results
        try {
            const jsonOutput = JSON.parse(output);
            const result = {
                test: testFile,
                viewport,
                status: 'passed',
                duration: jsonOutput.stats?.duration || 0,
                tests: jsonOutput.stats?.tests || 0,
                passes: jsonOutput.stats?.passes || 0,
                failures: jsonOutput.stats?.failures || 0
            };
            
            if (jsonOutput.stats?.failures > 0) {
                result.status = 'failed';
                result.error = jsonOutput.failures?.[0]?.err?.message || 'Test failed';
                
                // Capture screenshot path
                const screenshots = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
                if (screenshots.length > 0) {
                    result.screenshot = path.join(screenshotDir, screenshots[0]);
                    results.screenshots.push({
                        test: testFile,
                        viewport,
                        path: result.screenshot,
                        category
                    });
                }
            }
            
            results[category] = results[category] || [];
            results[category].push(result);
            
            console.log(result.status === 'passed' ? '✅ PASSED' : '❌ FAILED');
            return result;
        } catch (parseErr) {
            console.log('⚠️ Could not parse JSON output');
            return { test: testFile, viewport, status: 'error', error: 'JSON parse error' };
        }
    } catch (err) {
        console.log('❌ FAILED');
        const errorResult = {
            test: testFile,
            viewport,
            status: 'failed',
            error: err.message || 'Test execution failed'
        };
        
        // Try to capture any screenshots
        try {
            const screenshots = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
            if (screenshots.length > 0) {
                errorResult.screenshot = path.join(screenshotDir, screenshots[0]);
                results.screenshots.push({
                    test: testFile,
                    viewport,
                    path: errorResult.screenshot,
                    category
                });
            }
        } catch (screenshotErr) {
            // Ignore screenshot errors
        }
        
        results[category] = results[category] || [];
        results[category].push(errorResult);
        return errorResult;
    }
}

// Main test execution
console.log('\n🏃 Running Essential Tests...\n');

// Mobile tests
console.log('📱 MOBILE TESTS');
console.log('-'.repeat(40));
ESSENTIAL_TESTS.mobile.forEach(test => {
    runTest(test, 'mobile', 'mobile');
});

// Dropdown tests on desktop
console.log('\n🔽 DROPDOWN TESTS');
console.log('-'.repeat(40));
ESSENTIAL_TESTS.dropdown.forEach(test => {
    runTest(test, 'desktop', 'dropdown');
});

// RTL tests on desktop
console.log('\n🌍 RTL/HEBREW TESTS');
console.log('-'.repeat(40));
ESSENTIAL_TESTS.rtl.forEach(test => {
    runTest(test, 'desktop', 'rtl');
});

// Mortgage tests on all viewports
console.log('\n🏦 MORTGAGE CALCULATOR TESTS');
console.log('-'.repeat(40));
ESSENTIAL_TESTS.mortgage.forEach(test => {
    runTest(test, 'desktop', 'mortgage');
    runTest(test, 'tablet', 'mortgage');
    runTest(test, 'mobile', 'mortgage');
});

// Generate HTML Report
console.log('\n📊 Generating Interactive HTML Report...');

const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banking App - Essential E2E Test Report</title>
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
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .summary-card.passed { border-left: 4px solid #10b981; }
        .summary-card.failed { border-left: 4px solid #ef4444; }
        .summary-card.warning { border-left: 4px solid #f59e0b; }
        .summary-card h3 {
            color: #6b7280;
            font-size: 0.9em;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
        }
        .summary-card.passed .number { color: #10b981; }
        .summary-card.failed .number { color: #ef4444; }
        .content {
            padding: 30px;
        }
        .test-category {
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
        }
        .category-header {
            background: #f3f4f6;
            padding: 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.3s;
        }
        .category-header:hover {
            background: #e5e7eb;
        }
        .category-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #1f2937;
        }
        .category-stats {
            display: flex;
            gap: 15px;
        }
        .stat {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
        }
        .stat.passed {
            background: #10b981;
            color: white;
        }
        .stat.failed {
            background: #ef4444;
            color: white;
        }
        .category-content {
            padding: 20px;
            display: none;
        }
        .category-content.active {
            display: block;
        }
        .test-result {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }
        .test-result.passed {
            border-left: 4px solid #10b981;
        }
        .test-result.failed {
            border-left: 4px solid #ef4444;
        }
        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .test-name {
            font-weight: 600;
            color: #1f2937;
        }
        .test-status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .test-status.passed {
            background: #d1fae5;
            color: #065f46;
        }
        .test-status.failed {
            background: #fee2e2;
            color: #991b1b;
        }
        .test-details {
            color: #6b7280;
            font-size: 0.9em;
        }
        .error-message {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 10px;
            margin-top: 10px;
            color: #991b1b;
            font-family: monospace;
            font-size: 0.85em;
        }
        .screenshots-section {
            margin-top: 40px;
            padding: 30px;
            background: #f9fafb;
            border-radius: 10px;
        }
        .screenshots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .screenshot-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .screenshot-img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-bottom: 1px solid #e5e7eb;
        }
        .screenshot-info {
            padding: 15px;
        }
        .screenshot-test {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .screenshot-viewport {
            color: #6b7280;
            font-size: 0.9em;
        }
        .footer {
            background: #f3f4f6;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
        }
    </style>
    <script>
        function toggleCategory(id) {
            const content = document.getElementById(id);
            content.classList.toggle('active');
        }
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 Banking App - Essential E2E Test Report</h1>
            <div class="subtitle">Comprehensive testing across Desktop, Tablet, and Mobile viewports</div>
        </div>
        
        <div class="summary">
            ${Object.entries(results).filter(([k,v]) => k !== 'screenshots').map(([category, tests]) => {
                const passed = tests.filter(t => t.status === 'passed').length;
                const failed = tests.filter(t => t.status === 'failed').length;
                const total = tests.length;
                const statusClass = failed === 0 ? 'passed' : failed > passed ? 'failed' : 'warning';
                return `
                    <div class="summary-card ${statusClass}">
                        <h3>${category.toUpperCase()}</h3>
                        <div class="number">${passed}/${total}</div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="content">
            ${Object.entries(results).filter(([k,v]) => k !== 'screenshots').map(([category, tests]) => {
                const passed = tests.filter(t => t.status === 'passed').length;
                const failed = tests.filter(t => t.status === 'failed').length;
                return `
                    <div class="test-category">
                        <div class="category-header" onclick="toggleCategory('${category}')">
                            <div class="category-title">📁 ${category.toUpperCase()} TESTS</div>
                            <div class="category-stats">
                                <span class="stat passed">✅ ${passed}</span>
                                <span class="stat failed">❌ ${failed}</span>
                            </div>
                        </div>
                        <div class="category-content" id="${category}">
                            ${tests.map(test => `
                                <div class="test-result ${test.status}">
                                    <div class="test-header">
                                        <div class="test-name">${test.test} @ ${test.viewport}</div>
                                        <div class="test-status ${test.status}">${test.status}</div>
                                    </div>
                                    <div class="test-details">
                                        ${test.duration ? `Duration: ${test.duration}ms` : ''}
                                        ${test.tests ? ` | Tests: ${test.tests}` : ''}
                                        ${test.passes ? ` | Passed: ${test.passes}` : ''}
                                        ${test.failures ? ` | Failed: ${test.failures}` : ''}
                                    </div>
                                    ${test.error ? `<div class="error-message">${test.error}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
            
            ${results.screenshots.length > 0 ? `
                <div class="screenshots-section">
                    <h2 style="margin-bottom: 20px;">📸 Test Screenshots</h2>
                    <div class="screenshots-grid">
                        ${results.screenshots.map(screenshot => `
                            <div class="screenshot-card">
                                <img src="${screenshot.path}" alt="Screenshot" class="screenshot-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"300\" height=\"200\" viewBox=\"0 0 300 200\"%3E%3Crect fill=\"%23f3f4f6\" width=\"300\" height=\"200\"/%3E%3Ctext x=\"50%25\" y=\"50%25\" text-anchor=\"middle\" dy=\".3em\" fill=\"%236b7280\" font-family=\"sans-serif\" font-size=\"14\"%3EScreenshot Not Available%3C/text%3E%3C/svg%3E'">
                                <div class="screenshot-info">
                                    <div class="screenshot-test">${screenshot.test}</div>
                                    <div class="screenshot-viewport">${screenshot.viewport} • ${screenshot.category}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
        
        <div class="footer">
            Generated on ${new Date().toLocaleString()} | Banking App E2E Testing Suite
        </div>
    </div>
</body>
</html>`;

const reportPath = path.join(__dirname, 'reports', `essential-e2e-report-${Date.now()}.html`);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, reportHtml);

// Generate summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST EXECUTION SUMMARY');
console.log('='.repeat(60));

let totalPassed = 0;
let totalFailed = 0;

Object.entries(results).filter(([k,v]) => k !== 'screenshots').forEach(([category, tests]) => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    totalPassed += passed;
    totalFailed += failed;
    
    console.log(`\n${category.toUpperCase()}:`);
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
});

console.log('\n' + '-'.repeat(60));
console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
console.log(`Screenshots captured: ${results.screenshots.length}`);

console.log('\n✨ Report generated successfully!');
console.log(`📄 View report: file://${reportPath}`);
console.log('\nTo open the report:');
console.log(`  open "${reportPath}"`);