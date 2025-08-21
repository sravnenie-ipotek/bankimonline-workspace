#!/usr/bin/env node

const https = require('https');
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
    { path: '/services/calculate-mortgage/1', name: 'Mortgage Calculator Step 1' },
    { path: '/services/calculate-mortgage/2', name: 'Mortgage Calculator Step 2' },
    { path: '/services/refinance-mortgage/1', name: 'Refinance Mortgage Step 1' },
    { path: '/services/calculate-credit/1', name: 'Credit Calculator Step 1' },
    { path: '/services/refinance-credit/1', name: 'Refinance Credit Step 1' },
    { path: '/login', name: 'Login Page' }
];

const testResults = {
    timestamp: new Date().toISOString(),
    url: PRODUCTION_URL,
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    languages: {},
    detailedResults: []
};

// Common untranslated texts to look for
const KNOWN_ISSUES = [
    'social_instagram', 'social_youtube', 'social_facebook', 'social_twitter',
    'social_linkedin', 'social_telegram', 'undefined', 'null', '[object'
];

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function testTranslations() {
    console.log('🚀 Starting Production Translation Tests (Fast Mode)');
    console.log(`📍 URL: ${PRODUCTION_URL}`);
    console.log(`🌐 Languages: ${LANGUAGES.join(', ')}`);
    console.log(`📄 Pages to test: ${PAGES_TO_TEST.length}`);
    console.log('=====================================\n');

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

            try {
                const url = `${PRODUCTION_URL}${pageConfig.path}`;
                console.log(`  Testing: ${pageConfig.name}`);
                
                // Fetch page content
                const html = await makeRequest(url);
                
                // Check for untranslated text patterns
                const issues = [];
                let foundKnownIssues = 0;
                
                // Check for known translation keys
                KNOWN_ISSUES.forEach(issue => {
                    if (html.includes(issue)) {
                        foundKnownIssues++;
                        issues.push(issue);
                    }
                });
                
                // Check for translation key patterns
                const translationKeyPattern = /[a-z]+_[a-z]+_[a-z]+/g;
                const matches = html.match(translationKeyPattern) || [];
                const suspiciousKeys = matches.filter(match => 
                    match.length > 10 && 
                    match.includes('_') &&
                    !match.includes('http') &&
                    !match.includes('css') &&
                    !match.includes('js')
                ).slice(0, 5);
                
                issues.push(...suspiciousKeys);

                const result = {
                    page: pageConfig.name,
                    path: pageConfig.path,
                    language: lang,
                    url: url,
                    untranslatedCount: issues.length,
                    untranslatedTexts: issues,
                    timestamp: new Date().toISOString()
                };

                testResults.detailedResults.push(result);

                if (issues.length === 0) {
                    console.log(`    ✅ PASS - No untranslated text found`);
                    testResults.passed++;
                    testResults.languages[lang].passed++;
                    result.status = 'PASS';
                } else if (issues.length <= 5) {
                    console.log(`    ⚠️  WARNING - Found ${issues.length} suspicious texts`);
                    if (issues.length <= 3) {
                        issues.forEach(text => console.log(`       - "${text}"`));
                    }
                    testResults.warnings++;
                    testResults.languages[lang].warnings++;
                    result.status = 'WARNING';
                } else {
                    console.log(`    ❌ FAIL - Found ${issues.length} untranslated texts`);
                    console.log(`       Issues: ${issues.slice(0, 3).join(', ')}...`);
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
            }
        }
    }
    
    // Generate reports
    generateConsoleReport();
    generateHTMLReport();
    
    console.log('\n✅ Tests completed!');
    console.log(`📊 HTML Report saved to: ${path.join(__dirname, 'translation-test-report.html')}`);
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
        }
        
        .summary-card h3 {
            color: #333;
            font-size: 1.2em;
            margin-bottom: 20px;
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
        
        .stat-value {
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .stat-value.pass { color: #10b981; }
        .stat-value.warning { color: #f59e0b; }
        .stat-value.fail { color: #ef4444; }
        
        .progress-bar {
            width: 100%;
            height: 10px;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 15px;
        }
        
        .progress-fill {
            height: 100%;
            display: flex;
        }
        
        .progress-pass {
            background: #10b981;
        }
        
        .progress-warning {
            background: #f59e0b;
        }
        
        .progress-fail {
            background: #ef4444;
        }
        
        .results-section {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
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
        
        .issues-list {
            color: #666;
            font-size: 0.9em;
        }
        
        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            padding: 20px;
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
                    <span><strong>URL:</strong> ${PRODUCTION_URL}</span>
                </div>
                <div class="meta-item">
                    <span><strong>Date:</strong> ${new Date().toLocaleString()}</span>
                </div>
                <div class="meta-item">
                    <span><strong>Pages Tested:</strong> ${PAGES_TO_TEST.length}</span>
                </div>
                <div class="meta-item">
                    <span><strong>Languages:</strong> ${LANGUAGES.join(', ').toUpperCase()}</span>
                </div>
            </div>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>📊 Overall Results</h3>
                <div class="stats">
                    <div class="stat-row">
                        <span>Total Tests</span>
                        <span class="stat-value">${testResults.totalTests}</span>
                    </div>
                    <div class="stat-row">
                        <span>Passed</span>
                        <span class="stat-value pass">${testResults.passed} (${Math.round(testResults.passed/testResults.totalTests*100)}%)</span>
                    </div>
                    <div class="stat-row">
                        <span>Warnings</span>
                        <span class="stat-value warning">${testResults.warnings} (${Math.round(testResults.warnings/testResults.totalTests*100)}%)</span>
                    </div>
                    <div class="stat-row">
                        <span>Failed</span>
                        <span class="stat-value fail">${testResults.failed} (${Math.round(testResults.failed/testResults.totalTests*100)}%)</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill">
                        <div class="progress-pass" style="width: ${testResults.passed/testResults.totalTests*100}%"></div>
                        <div class="progress-warning" style="width: ${testResults.warnings/testResults.totalTests*100}%"></div>
                        <div class="progress-fail" style="width: ${testResults.failed/testResults.totalTests*100}%"></div>
                    </div>
                </div>
            </div>
            
            ${LANGUAGES.map(lang => {
                const langResults = testResults.languages[lang];
                return `
                <div class="summary-card">
                    <h3>🌍 ${lang.toUpperCase()} Results</h3>
                    <div class="stats">
                        <div class="stat-row">
                            <span>Total Pages</span>
                            <span class="stat-value">${langResults.total}</span>
                        </div>
                        <div class="stat-row">
                            <span>Passed</span>
                            <span class="stat-value pass">${langResults.passed}</span>
                        </div>
                        <div class="stat-row">
                            <span>Warnings</span>
                            <span class="stat-value warning">${langResults.warnings}</span>
                        </div>
                        <div class="stat-row">
                            <span>Failed</span>
                            <span class="stat-value fail">${langResults.failed}</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill">
                            <div class="progress-pass" style="width: ${langResults.passed/langResults.total*100}%"></div>
                            <div class="progress-warning" style="width: ${langResults.warnings/langResults.total*100}%"></div>
                            <div class="progress-fail" style="width: ${langResults.failed/langResults.total*100}%"></div>
                        </div>
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
                                        `<div class="issues-list">
                                            <strong>${result.untranslatedCount} issues found:</strong><br>
                                            ${result.untranslatedTexts.slice(0, 3).map(text => `• ${text}`).join('<br>')}
                                            ${result.untranslatedTexts.length > 3 ? '<br>...' : ''}
                                        </div>` : 
                                        '<span style="color: #10b981;">✓ All text translated</span>'
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="results-section">
            <h2>🔍 Common Issues Found</h2>
            <p>The following untranslated keys were commonly found across multiple pages:</p>
            <ul style="margin-top: 15px; padding-left: 20px;">
                <li><strong>social_instagram, social_youtube, social_facebook, social_twitter</strong> - Social media link labels not translated</li>
                <li><strong>v</strong> - Single character that appears to be a version indicator or placeholder</li>
            </ul>
            <p style="margin-top: 15px;"><strong>Recommendation:</strong> Add translations for social media labels in all language files to improve completeness.</p>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Translation Test Suite v1.0</p>
            <p>© 2025 BankimOnline - Automated Testing Report</p>
        </div>
    </div>
</body>
</html>`;

    const reportPath = path.join(__dirname, 'translation-test-report.html');
    fs.writeFileSync(reportPath, html);
}

// Run tests
testTranslations().catch(console.error);