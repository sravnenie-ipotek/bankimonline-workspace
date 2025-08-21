#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'https://dev2.bankimonline.com';
const LANGUAGES = ['en', 'he', 'ru'];

// Pages to test
const PAGES_TO_TEST = [
    { path: '/', name: 'Home Page' },
    { path: '/about', name: 'About Us' },
    { path: '/contacts', name: 'Contact Page' },
    { path: '/services', name: 'Services' },
    { path: '/cooperation', name: 'Cooperation' },
    { path: '/services/calculate-mortgage/1', name: 'Mortgage Calculator Step 1' },
    { path: '/services/calculate-mortgage/2', name: 'Mortgage Calculator Step 2' },
    { path: '/services/calculate-mortgage/3', name: 'Mortgage Calculator Step 3' },
    { path: '/services/calculate-mortgage/4', name: 'Mortgage Calculator Step 4' },
    { path: '/services/refinance-mortgage/1', name: 'Refinance Mortgage Step 1' },
    { path: '/services/refinance-mortgage/2', name: 'Refinance Mortgage Step 2' },
    { path: '/services/refinance-mortgage/3', name: 'Refinance Mortgage Step 3' },
    { path: '/services/calculate-credit/1', name: 'Credit Calculator Step 1' },
    { path: '/services/calculate-credit/2', name: 'Credit Calculator Step 2' },
    { path: '/services/calculate-credit/3', name: 'Credit Calculator Step 3' },
    { path: '/services/refinance-credit/1', name: 'Refinance Credit Step 1' },
    { path: '/services/refinance-credit/2', name: 'Refinance Credit Step 2' },
    { path: '/services/refinance-credit/3', name: 'Refinance Credit Step 3' },
    { path: '/login', name: 'Login Page' },
    { path: '/registration', name: 'Registration Page' }
];

// Untranslated text patterns to look for
const UNTRANSLATED_PATTERNS = [
    /^[a-z_]+$/,  // Translation keys like "home_title"
    /^\{.*\}$/,    // Template variables
    /^undefined$/i, // Undefined values
    /^null$/i,      // Null values
    /^\[object/i,   // Object references
    /^NaN$/,        // Not a number
    /translation_missing/i,
    /key_not_found/i
];

const testResults = {
    timestamp: new Date().toISOString(),
    url: PRODUCTION_URL,
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    languages: {},
    detailedResults: [],
    screenshots: []
};

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testTranslations() {
    console.log('🚀 Starting Production Translation Tests');
    console.log(`📍 URL: ${PRODUCTION_URL}`);
    console.log(`🌐 Languages: ${LANGUAGES.join(', ')}`);
    console.log(`📄 Pages to test: ${PAGES_TO_TEST.length}`);
    console.log('=====================================\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const lang of LANGUAGES) {
        console.log(`\n🌍 Testing ${lang.toUpperCase()} translations...`);
        testResults.languages[lang] = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            issues: []
        };

        for (const pageConfig of PAGES_TO_TEST) {
            testResults.totalTests++;
            testResults.languages[lang].total++;

            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            try {
                // Navigate to page with language
                const url = `${PRODUCTION_URL}${pageConfig.path}`;
                console.log(`  Testing: ${pageConfig.name} (${url})`);
                
                // Go to page
                await page.goto(url, { 
                    waitUntil: 'networkidle2',
                    timeout: 30000 
                });

                // Wait a moment for page to load
                await delay(2000);

                // Change language
                const langButtonSelector = `button[data-lang="${lang}"], .language-switch[data-lang="${lang}"], [onclick*="changeLanguage('${lang}')"]`;
                try {
                    await page.click(langButtonSelector);
                    await delay(2000);
                } catch (e) {
                    // Try alternative method
                    await page.evaluate((language) => {
                        // Try to find and click language button
                        const buttons = document.querySelectorAll('button, a, div[role="button"]');
                        for (const btn of buttons) {
                            if (btn.textContent.toLowerCase().includes(language) || 
                                btn.getAttribute('data-lang') === language ||
                                btn.className.includes(language)) {
                                btn.click();
                                return true;
                            }
                        }
                        // Try to change via localStorage
                        localStorage.setItem('i18nextLng', language);
                        localStorage.setItem('language', language);
                        return false;
                    }, lang);
                    
                    // Reload to apply language change
                    await page.reload({ waitUntil: 'networkidle2' });
                    await delay(2000);
                }

                // Get all text content
                const pageText = await page.evaluate(() => {
                    const texts = [];
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_TEXT,
                        {
                            acceptNode: function(node) {
                                const parent = node.parentElement;
                                if (parent && (
                                    parent.tagName === 'SCRIPT' ||
                                    parent.tagName === 'STYLE' ||
                                    parent.tagName === 'NOSCRIPT'
                                )) {
                                    return NodeFilter.FILTER_REJECT;
                                }
                                return NodeFilter.FILTER_ACCEPT;
                            }
                        }
                    );

                    let node;
                    while (node = walker.nextNode()) {
                        const text = node.textContent.trim();
                        if (text && text.length > 0) {
                            texts.push(text);
                        }
                    }
                    return texts;
                });

                // Check for untranslated text
                const issues = [];
                const suspiciousTexts = new Set();

                for (const text of pageText) {
                    for (const pattern of UNTRANSLATED_PATTERNS) {
                        if (pattern.test(text)) {
                            suspiciousTexts.add(text);
                        }
                    }
                    
                    // Check for translation keys (underscore pattern)
                    if (text.includes('_') && /^[a-z0-9_]+$/.test(text)) {
                        suspiciousTexts.add(text);
                    }
                }

                // Take screenshot
                const screenshotName = `${lang}_${pageConfig.path.replace(/\//g, '_')}.png`;
                const screenshotPath = path.join(__dirname, 'translation-screenshots', screenshotName);
                
                // Create directory if it doesn't exist
                const screenshotDir = path.join(__dirname, 'translation-screenshots');
                if (!fs.existsSync(screenshotDir)) {
                    fs.mkdirSync(screenshotDir, { recursive: true });
                }
                
                await page.screenshot({ 
                    path: screenshotPath,
                    fullPage: true 
                });

                const result = {
                    page: pageConfig.name,
                    path: pageConfig.path,
                    language: lang,
                    url: url,
                    untranslatedCount: suspiciousTexts.size,
                    untranslatedTexts: Array.from(suspiciousTexts),
                    screenshot: screenshotPath,
                    timestamp: new Date().toISOString()
                };

                testResults.detailedResults.push(result);

                if (suspiciousTexts.size === 0) {
                    console.log(`    ✅ PASS - No untranslated text found`);
                    testResults.passed++;
                    testResults.languages[lang].passed++;
                    result.status = 'PASS';
                } else if (suspiciousTexts.size <= 3) {
                    console.log(`    ⚠️  WARNING - Found ${suspiciousTexts.size} suspicious texts`);
                    suspiciousTexts.forEach(text => console.log(`       - "${text}"`));
                    testResults.warnings++;
                    testResults.languages[lang].warnings++;
                    result.status = 'WARNING';
                } else {
                    console.log(`    ❌ FAIL - Found ${suspiciousTexts.size} untranslated texts`);
                    console.log(`       First 5: ${Array.from(suspiciousTexts).slice(0, 5).join(', ')}`);
                    testResults.failed++;
                    testResults.languages[lang].failed++;
                    result.status = 'FAIL';
                }

            } catch (error) {
                console.log(`    ❌ ERROR: ${error.message}`);
                testResults.failed++;
                testResults.languages[lang].failed++;
                
                testResults.detailedResults.push({
                    page: pageConfig.name,
                    path: pageConfig.path,
                    language: lang,
                    url: `${PRODUCTION_URL}${pageConfig.path}`,
                    error: error.message,
                    status: 'ERROR',
                    timestamp: new Date().toISOString()
                });
            } finally {
                await page.close();
            }
        }
    }

    await browser.close();
    
    // Generate reports
    generateConsoleReport();
    generateHTMLReport();
    
    console.log('\n✅ Tests completed!');
    console.log(`📊 HTML Report saved to: translation-test-report.html`);
}

function generateConsoleReport() {
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 TRANSLATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`🌐 Production URL: ${PRODUCTION_URL}`);
    console.log(`📅 Test Date: ${new Date().toLocaleString()}`);
    console.log(`\n📈 Overall Results:`);
    console.log(`  Total Tests: ${testResults.totalTests}`);
    console.log(`  ✅ Passed: ${testResults.passed} (${Math.round(testResults.passed/testResults.totalTests*100)}%)`);
    console.log(`  ⚠️  Warnings: ${testResults.warnings} (${Math.round(testResults.warnings/testResults.totalTests*100)}%)`);
    console.log(`  ❌ Failed: ${testResults.failed} (${Math.round(testResults.failed/testResults.totalTests*100)}%)`);
    
    console.log(`\n🌍 Per Language Results:`);
    for (const lang of LANGUAGES) {
        const langResults = testResults.languages[lang];
        console.log(`\n  ${lang.toUpperCase()}:`);
        console.log(`    Total: ${langResults.total}`);
        console.log(`    ✅ Passed: ${langResults.passed}`);
        console.log(`    ⚠️  Warnings: ${langResults.warnings}`);
        console.log(`    ❌ Failed: ${langResults.failed}`);
    }
}

function generateHTMLReport() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Translation Test Report - ${PRODUCTION_URL}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 1.2em;
            margin-bottom: 20px;
        }
        
        .meta-info {
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .meta-icon {
            width: 24px;
            height: 24px;
            background: #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .summary-card:hover {
            transform: translateY(-5px);
        }
        
        .summary-card h3 {
            color: #333;
            font-size: 1.2em;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stats {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.95em;
        }
        
        .stat-value {
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .stat-value.pass { color: #10b981; }
        .stat-value.warning { color: #f59e0b; }
        .stat-value.fail { color: #ef4444; }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 15px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #10b981 var(--pass), #f59e0b var(--pass), #f59e0b var(--warn), #ef4444 var(--warn), #ef4444 100%);
        }
        
        .results-section {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        
        .results-section h2 {
            color: #333;
            font-size: 1.8em;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .results-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .results-table th {
            background: #f8f9fa;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .results-table td {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .results-table tr:hover {
            background: #f8f9fa;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-badge.pass {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-badge.warning {
            background: #fed7aa;
            color: #92400e;
        }
        
        .status-badge.fail {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .status-badge.error {
            background: #fce7f3;
            color: #831843;
        }
        
        .language-badge {
            display: inline-block;
            padding: 4px 10px;
            background: #e5e7eb;
            color: #333;
            border-radius: 10px;
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .untranslated-list {
            margin-top: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 0.9em;
            color: #666;
            max-height: 100px;
            overflow-y: auto;
        }
        
        .untranslated-item {
            padding: 3px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .screenshot-link {
            color: #667eea;
            text-decoration: none;
            font-size: 0.9em;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        .screenshot-link:hover {
            text-decoration: underline;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .chart-container {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
        }
        
        .chart-title {
            color: #333;
            font-size: 1.1em;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .donut-chart {
            width: 150px;
            height: 150px;
            margin: 0 auto;
        }
        
        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            padding: 20px;
        }
        
        @media (max-width: 768px) {
            .summary-grid {
                grid-template-columns: 1fr;
            }
            
            .results-table {
                font-size: 0.9em;
            }
            
            .results-table th,
            .results-table td {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 Translation Test Report</h1>
            <div class="subtitle">Production Environment Testing</div>
            <div class="meta-info">
                <div class="meta-item">
                    <div class="meta-icon">🔗</div>
                    <span><strong>URL:</strong> ${PRODUCTION_URL}</span>
                </div>
                <div class="meta-item">
                    <div class="meta-icon">📅</div>
                    <span><strong>Date:</strong> ${new Date().toLocaleString()}</span>
                </div>
                <div class="meta-item">
                    <div class="meta-icon">📄</div>
                    <span><strong>Pages Tested:</strong> ${PAGES_TO_TEST.length}</span>
                </div>
                <div class="meta-item">
                    <div class="meta-icon">🌍</div>
                    <span><strong>Languages:</strong> ${LANGUAGES.join(', ').toUpperCase()}</span>
                </div>
            </div>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>📊 Overall Results</h3>
                <div class="stats">
                    <div class="stat-row">
                        <span class="stat-label">Total Tests</span>
                        <span class="stat-value">${testResults.totalTests}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Passed</span>
                        <span class="stat-value pass">${testResults.passed} (${Math.round(testResults.passed/testResults.totalTests*100)}%)</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Warnings</span>
                        <span class="stat-value warning">${testResults.warnings} (${Math.round(testResults.warnings/testResults.totalTests*100)}%)</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Failed</span>
                        <span class="stat-value fail">${testResults.failed} (${Math.round(testResults.failed/testResults.totalTests*100)}%)</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="--pass: ${testResults.passed/testResults.totalTests*100}%; --warn: ${(testResults.passed + testResults.warnings)/testResults.totalTests*100}%;"></div>
                </div>
            </div>
            
            ${LANGUAGES.map(lang => {
                const langResults = testResults.languages[lang];
                return `
                <div class="summary-card">
                    <h3>🌍 ${lang.toUpperCase()} Results</h3>
                    <div class="stats">
                        <div class="stat-row">
                            <span class="stat-label">Total Pages</span>
                            <span class="stat-value">${langResults.total}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Passed</span>
                            <span class="stat-value pass">${langResults.passed}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Warnings</span>
                            <span class="stat-value warning">${langResults.warnings}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Failed</span>
                            <span class="stat-value fail">${langResults.failed}</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="--pass: ${langResults.passed/langResults.total*100}%; --warn: ${(langResults.passed + langResults.warnings)/langResults.total*100}%;"></div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
        
        <div class="results-section">
            <h2>📋 Detailed Test Results</h2>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Page</th>
                        <th>Language</th>
                        <th>Status</th>
                        <th>Issues Found</th>
                        <th>Screenshot</th>
                    </tr>
                </thead>
                <tbody>
                    ${testResults.detailedResults.map(result => `
                        <tr>
                            <td>
                                <strong>${result.page}</strong><br>
                                <small style="color: #666;">${result.path}</small>
                            </td>
                            <td>
                                <span class="language-badge">${result.language}</span>
                            </td>
                            <td>
                                <span class="status-badge ${result.status.toLowerCase()}">${result.status}</span>
                            </td>
                            <td>
                                ${result.error ? 
                                    `<span style="color: #ef4444;">Error: ${result.error}</span>` :
                                    result.untranslatedCount ? 
                                        `<strong>${result.untranslatedCount} untranslated texts</strong>
                                        ${result.untranslatedTexts && result.untranslatedTexts.length > 0 ? 
                                            `<div class="untranslated-list">
                                                ${result.untranslatedTexts.slice(0, 5).map(text => 
                                                    `<div class="untranslated-item">• ${text}</div>`
                                                ).join('')}
                                                ${result.untranslatedTexts.length > 5 ? 
                                                    `<div class="untranslated-item">... and ${result.untranslatedTexts.length - 5} more</div>` : 
                                                    ''}
                                            </div>` : 
                                            ''
                                        }` : 
                                        '<span style="color: #10b981;">✓ All text translated</span>'
                                }
                            </td>
                            <td>
                                ${result.screenshot ? 
                                    `<a href="${result.screenshot}" class="screenshot-link" target="_blank">
                                        📸 View
                                    </a>` : 
                                    '-'
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="results-section">
            <h2>📈 Summary Statistics</h2>
            <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-title">Overall Test Results</div>
                    <canvas id="overallChart" class="donut-chart"></canvas>
                </div>
                ${LANGUAGES.map(lang => `
                    <div class="chart-container">
                        <div class="chart-title">${lang.toUpperCase()} Language Results</div>
                        <canvas id="${lang}Chart" class="donut-chart"></canvas>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Translation Test Suite v1.0</p>
            <p>© 2025 BankimOnline - Automated Testing Report</p>
        </div>
    </div>
    
    <script>
        // Simple chart drawing
        function drawDonutChart(canvasId, passed, warnings, failed) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 60;
            
            const total = passed + warnings + failed;
            if (total === 0) return;
            
            const segments = [
                { value: passed, color: '#10b981', label: 'Pass' },
                { value: warnings, color: '#f59e0b', label: 'Warn' },
                { value: failed, color: '#ef4444', label: 'Fail' }
            ];
            
            let currentAngle = -Math.PI / 2;
            
            segments.forEach(segment => {
                if (segment.value === 0) return;
                
                const angle = (segment.value / total) * Math.PI * 2;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
                ctx.arc(centerX, centerY, radius * 0.6, currentAngle + angle, currentAngle, true);
                ctx.closePath();
                ctx.fillStyle = segment.color;
                ctx.fill();
                
                currentAngle += angle;
            });
            
            // Draw center text
            ctx.fillStyle = '#333';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const percentage = Math.round((passed / total) * 100);
            ctx.fillText(percentage + '%', centerX, centerY);
        }
        
        // Draw charts
        drawDonutChart('overallChart', ${testResults.passed}, ${testResults.warnings}, ${testResults.failed});
        ${LANGUAGES.map(lang => {
            const lr = testResults.languages[lang];
            return `drawDonutChart('${lang}Chart', ${lr.passed}, ${lr.warnings}, ${lr.failed});`;
        }).join('\n        ')}
    </script>
</body>
</html>`;

    fs.writeFileSync('translation-test-report.html', html);
}

// Check if puppeteer is installed
try {
    require.resolve('puppeteer');
    testTranslations().catch(console.error);
} catch(e) {
    console.log('Installing puppeteer...');
    const { execSync } = require('child_process');
    execSync('npm install puppeteer', { stdio: 'inherit' });
    console.log('Puppeteer installed. Starting tests...\n');
    testTranslations().catch(console.error);
}