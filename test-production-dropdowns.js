#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'https://dev2.bankimonline.com';

// Critical pages with dropdowns
const DROPDOWN_PAGES = [
    {
        path: '/services/calculate-mortgage/1',
        name: 'Mortgage Calculator Step 1',
        expectedDropdowns: ['property_ownership', 'mortgage_goal']
    },
    {
        path: '/services/calculate-mortgage/2',
        name: 'Mortgage Calculator Step 2',
        expectedDropdowns: ['family_status', 'citizenship_status']
    },
    {
        path: '/services/calculate-mortgage/3',
        name: 'Mortgage Calculator Step 3',
        expectedDropdowns: ['education', 'professional_field', 'employment_status', 'income_sources']
    },
    {
        path: '/services/refinance-mortgage/1',
        name: 'Refinance Mortgage Step 1',
        expectedDropdowns: ['property_ownership', 'refinance_goal']
    },
    {
        path: '/services/refinance-mortgage/2',
        name: 'Refinance Mortgage Step 2',
        expectedDropdowns: ['family_status', 'citizenship_status']
    },
    {
        path: '/services/refinance-mortgage/3',
        name: 'Refinance Mortgage Step 3',
        expectedDropdowns: ['education', 'professional_field', 'employment_status']
    },
    {
        path: '/services/calculate-credit/1',
        name: 'Credit Calculator Step 1',
        expectedDropdowns: ['credit_goal', 'credit_type']
    },
    {
        path: '/services/calculate-credit/2',
        name: 'Credit Calculator Step 2',
        expectedDropdowns: ['family_status', 'citizenship_status']
    },
    {
        path: '/services/calculate-credit/3',
        name: 'Credit Calculator Step 3',
        expectedDropdowns: ['education', 'professional_field', 'employment_status']
    },
    {
        path: '/services/refinance-credit/1',
        name: 'Refinance Credit Step 1',
        expectedDropdowns: ['credit_goal', 'refinance_type']
    },
    {
        path: '/services/refinance-credit/2',
        name: 'Refinance Credit Step 2',
        expectedDropdowns: ['family_status', 'citizenship_status']
    },
    {
        path: '/services/refinance-credit/3',
        name: 'Refinance Credit Step 3',
        expectedDropdowns: ['education', 'professional_field', 'employment_status']
    }
];

const testResults = {
    timestamp: new Date().toISOString(),
    url: PRODUCTION_URL,
    totalPages: 0,
    pagesWithErrors: 0,
    totalDropdowns: 0,
    workingDropdowns: 0,
    brokenDropdowns: 0,
    emptyDropdowns: 0,
    detailedResults: [],
    criticalIssues: []
};

async function testDropdowns() {
    console.log('🔍 PRODUCTION DROPDOWN TESTING');
    console.log('================================');
    console.log(`📍 URL: ${PRODUCTION_URL}`);
    console.log(`📄 Pages to test: ${DROPDOWN_PAGES.length}`);
    console.log('================================\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const pageConfig of DROPDOWN_PAGES) {
        testResults.totalPages++;
        console.log(`\n📄 Testing: ${pageConfig.name}`);
        console.log(`   URL: ${PRODUCTION_URL}${pageConfig.path}`);
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        const pageResult = {
            page: pageConfig.name,
            path: pageConfig.path,
            url: `${PRODUCTION_URL}${pageConfig.path}`,
            timestamp: new Date().toISOString(),
            dropdowns: [],
            errors: [],
            hasIssues: false
        };

        try {
            // Navigate to page
            await page.goto(`${PRODUCTION_URL}${pageConfig.path}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for page to load
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Find all dropdowns (select elements and custom dropdowns)
            const dropdownData = await page.evaluate(() => {
                const results = [];
                
                // Check standard select elements
                const selects = document.querySelectorAll('select');
                selects.forEach((select, index) => {
                    const options = Array.from(select.options);
                    const id = select.id || select.name || `select_${index}`;
                    const optionValues = options.map(opt => ({
                        text: opt.textContent.trim(),
                        value: opt.value
                    }));
                    
                    results.push({
                        type: 'select',
                        id: id,
                        elementFound: true,
                        optionCount: options.length,
                        options: optionValues,
                        hasPlaceholder: optionValues.some(opt => opt.value === '' || opt.text.includes('Select') || opt.text.includes('Choose')),
                        isEmpty: options.length <= 1,
                        visible: select.offsetParent !== null
                    });
                });

                // Check for custom dropdowns (divs with dropdown classes)
                const customDropdowns = document.querySelectorAll('[class*="dropdown"], [class*="select"], [role="combobox"], [role="listbox"]');
                customDropdowns.forEach((dropdown, index) => {
                    // Try to find options within custom dropdown
                    const customOptions = dropdown.querySelectorAll('[role="option"], [class*="option"], li');
                    const id = dropdown.id || dropdown.className.split(' ')[0] || `dropdown_${index}`;
                    
                    if (customOptions.length > 0) {
                        results.push({
                            type: 'custom',
                            id: id,
                            elementFound: true,
                            optionCount: customOptions.length,
                            options: Array.from(customOptions).map(opt => ({
                                text: opt.textContent.trim(),
                                value: opt.getAttribute('value') || opt.textContent.trim()
                            })),
                            isEmpty: customOptions.length === 0,
                            visible: dropdown.offsetParent !== null
                        });
                    }
                });

                // Check for input fields that might be dropdowns
                const inputs = document.querySelectorAll('input[list], input[role="combobox"]');
                inputs.forEach((input, index) => {
                    const datalistId = input.getAttribute('list');
                    if (datalistId) {
                        const datalist = document.getElementById(datalistId);
                        if (datalist) {
                            const options = datalist.querySelectorAll('option');
                            results.push({
                                type: 'datalist',
                                id: input.id || input.name || `datalist_${index}`,
                                elementFound: true,
                                optionCount: options.length,
                                options: Array.from(options).map(opt => ({
                                    text: opt.textContent.trim(),
                                    value: opt.value
                                })),
                                isEmpty: options.length === 0,
                                visible: input.offsetParent !== null
                            });
                        }
                    }
                });

                return results;
            });

            // Analyze dropdown data
            testResults.totalDropdowns += dropdownData.length;
            
            for (const dropdown of dropdownData) {
                const dropdownResult = {
                    id: dropdown.id,
                    type: dropdown.type,
                    status: 'UNKNOWN',
                    optionCount: dropdown.optionCount,
                    issues: []
                };

                if (!dropdown.elementFound) {
                    dropdownResult.status = 'NOT_FOUND';
                    dropdownResult.issues.push('Dropdown element not found');
                    testResults.brokenDropdowns++;
                } else if (dropdown.isEmpty) {
                    dropdownResult.status = 'EMPTY';
                    dropdownResult.issues.push('Dropdown has no options or only placeholder');
                    testResults.emptyDropdowns++;
                    pageResult.hasIssues = true;
                } else if (dropdown.optionCount < 2) {
                    dropdownResult.status = 'INSUFFICIENT';
                    dropdownResult.issues.push(`Only ${dropdown.optionCount} option(s) found`);
                    testResults.brokenDropdowns++;
                    pageResult.hasIssues = true;
                } else if (!dropdown.visible) {
                    dropdownResult.status = 'HIDDEN';
                    dropdownResult.issues.push('Dropdown is not visible');
                } else {
                    dropdownResult.status = 'OK';
                    testResults.workingDropdowns++;
                }

                // Check for untranslated options
                if (dropdown.options) {
                    const untranslatedOptions = dropdown.options.filter(opt => 
                        opt.text.includes('_') || 
                        opt.text === 'null' || 
                        opt.text === 'undefined' ||
                        opt.text === ''
                    );
                    
                    if (untranslatedOptions.length > 0) {
                        dropdownResult.issues.push(`${untranslatedOptions.length} untranslated options`);
                        dropdownResult.untranslatedOptions = untranslatedOptions;
                        pageResult.hasIssues = true;
                    }
                }

                pageResult.dropdowns.push(dropdownResult);
                
                // Log immediate results
                const statusIcon = dropdownResult.status === 'OK' ? '✅' : 
                                 dropdownResult.status === 'EMPTY' ? '🔴' : 
                                 dropdownResult.status === 'INSUFFICIENT' ? '⚠️' : '❌';
                console.log(`   ${statusIcon} ${dropdown.id}: ${dropdownResult.status} - ${dropdown.optionCount} options`);
                if (dropdownResult.issues.length > 0) {
                    dropdownResult.issues.forEach(issue => {
                        console.log(`      ⚠️  ${issue}`);
                    });
                }
            }

            // Check for expected dropdowns that are missing
            for (const expectedDropdown of pageConfig.expectedDropdowns) {
                const found = dropdownData.some(d => 
                    d.id.toLowerCase().includes(expectedDropdown.toLowerCase())
                );
                if (!found) {
                    pageResult.errors.push(`Expected dropdown '${expectedDropdown}' not found`);
                    pageResult.hasIssues = true;
                    console.log(`   ❌ MISSING: Expected dropdown '${expectedDropdown}' not found!`);
                    testResults.criticalIssues.push({
                        page: pageConfig.name,
                        issue: `Missing dropdown: ${expectedDropdown}`
                    });
                }
            }

            // Take screenshot
            const screenshotPath = path.join(__dirname, 'dropdown-screenshots', `${pageConfig.path.replace(/\//g, '_')}.png`);
            const screenshotDir = path.join(__dirname, 'dropdown-screenshots');
            if (!fs.existsSync(screenshotDir)) {
                fs.mkdirSync(screenshotDir, { recursive: true });
            }
            await page.screenshot({ path: screenshotPath, fullPage: true });
            pageResult.screenshot = screenshotPath;

        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            pageResult.errors.push(error.message);
            pageResult.hasIssues = true;
        } finally {
            await page.close();
        }

        if (pageResult.hasIssues) {
            testResults.pagesWithErrors++;
        }
        
        testResults.detailedResults.push(pageResult);
    }

    await browser.close();
    
    // Generate reports
    generateReport();
    generateHTMLReport();
}

function generateReport() {
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 DROPDOWN TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`🌐 Production URL: ${PRODUCTION_URL}`);
    console.log(`📅 Test Date: ${new Date().toLocaleString()}`);
    
    const successRate = testResults.totalDropdowns > 0 ? 
        Math.round(testResults.workingDropdowns / testResults.totalDropdowns * 100) : 0;
    
    console.log(`\n📈 Overall Results:`);
    console.log(`  Pages Tested: ${testResults.totalPages}`);
    console.log(`  Pages with Issues: ${testResults.pagesWithErrors}`);
    console.log(`  Total Dropdowns Found: ${testResults.totalDropdowns}`);
    console.log(`  ✅ Working Dropdowns: ${testResults.workingDropdowns} (${successRate}%)`);
    console.log(`  🔴 Empty Dropdowns: ${testResults.emptyDropdowns}`);
    console.log(`  ❌ Broken Dropdowns: ${testResults.brokenDropdowns}`);
    
    if (testResults.criticalIssues.length > 0) {
        console.log(`\n⚠️  CRITICAL ISSUES:`);
        testResults.criticalIssues.forEach(issue => {
            console.log(`  • ${issue.page}: ${issue.issue}`);
        });
    }
    
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    if (successRate < 50) {
        console.log('❌ CRITICAL: Less than 50% of dropdowns are working!');
    } else if (successRate < 80) {
        console.log('⚠️  WARNING: Significant dropdown issues detected');
    } else {
        console.log('✅ Dropdowns are mostly functional');
    }
}

function generateHTMLReport() {
    const successRate = testResults.totalDropdowns > 0 ? 
        Math.round(testResults.workingDropdowns / testResults.totalDropdowns * 100) : 0;
        
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dropdown Test Report - ${PRODUCTION_URL}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container { max-width: 1400px; margin: 0 auto; }
        
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
        
        .alert {
            background: #fee2e2;
            border-left: 5px solid #ef4444;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .alert h3 {
            color: #991b1b;
            margin-bottom: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        
        .success-rate {
            font-size: 4em;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            color: ${successRate > 80 ? '#10b981' : successRate > 50 ? '#f59e0b' : '#ef4444'};
        }
        
        .results-table {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background: #f8f9fa;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
        }
        
        td {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .status-ok { color: #10b981; font-weight: bold; }
        .status-empty { color: #ef4444; font-weight: bold; }
        .status-broken { color: #f59e0b; font-weight: bold; }
        
        .critical-issues {
            background: #fee2e2;
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .critical-issues h3 {
            color: #991b1b;
            margin-bottom: 15px;
        }
        
        .critical-issues ul {
            list-style: none;
            padding-left: 0;
        }
        
        .critical-issues li {
            padding: 10px;
            margin: 5px 0;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #ef4444;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Dropdown Functionality Test Report</h1>
            <p style="color: #666; font-size: 1.2em; margin-top: 10px;">Production Environment Analysis</p>
            
            ${successRate < 50 ? `
            <div class="alert">
                <h3>⚠️ CRITICAL ALERT</h3>
                <p>Only ${successRate}% of dropdowns are functioning properly. This indicates severe issues with the dropdown implementation.</p>
            </div>
            ` : ''}
            
            <div class="success-rate">
                ${successRate}% Success Rate
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Pages Tested</div>
                    <div class="stat-value">${testResults.totalPages}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Dropdowns</div>
                    <div class="stat-value">${testResults.totalDropdowns}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Working</div>
                    <div class="stat-value" style="color: #10b981">${testResults.workingDropdowns}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Empty</div>
                    <div class="stat-value" style="color: #ef4444">${testResults.emptyDropdowns}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Broken</div>
                    <div class="stat-value" style="color: #f59e0b">${testResults.brokenDropdowns}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Pages with Issues</div>
                    <div class="stat-value" style="color: #ef4444">${testResults.pagesWithErrors}</div>
                </div>
            </div>
        </div>
        
        ${testResults.criticalIssues.length > 0 ? `
        <div class="critical-issues">
            <h3>🚨 Critical Issues Found</h3>
            <ul>
                ${testResults.criticalIssues.map(issue => 
                    `<li><strong>${issue.page}:</strong> ${issue.issue}</li>`
                ).join('')}
            </ul>
        </div>
        ` : ''}
        
        <div class="results-table">
            <h2>📋 Detailed Results by Page</h2>
            <table>
                <thead>
                    <tr>
                        <th>Page</th>
                        <th>Dropdowns Found</th>
                        <th>Working</th>
                        <th>Issues</th>
                    </tr>
                </thead>
                <tbody>
                    ${testResults.detailedResults.map(result => {
                        const workingCount = result.dropdowns.filter(d => d.status === 'OK').length;
                        const issueCount = result.dropdowns.filter(d => d.status !== 'OK').length;
                        return `
                        <tr>
                            <td>
                                <strong>${result.page}</strong><br>
                                <small style="color: #666">${result.path}</small>
                            </td>
                            <td>${result.dropdowns.length}</td>
                            <td class="status-ok">${workingCount}</td>
                            <td>
                                ${issueCount > 0 ? `
                                    <span class="status-empty">${issueCount} issues</span><br>
                                    ${result.dropdowns.filter(d => d.status !== 'OK').map(d => 
                                        `<small>• ${d.id}: ${d.status}</small>`
                                    ).join('<br>')}
                                ` : '<span class="status-ok">None</span>'}
                                ${result.errors.length > 0 ? 
                                    `<br><span class="status-empty">Errors: ${result.errors.join(', ')}</span>` : 
                                    ''}
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="text-align: center; color: white; margin-top: 40px; padding: 20px;">
            <p>Generated on ${new Date().toLocaleString()} | Dropdown Test Suite v1.0</p>
            <p>© 2025 BankimOnline - Production Testing Report</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync('dropdown-test-report.html', html);
    console.log(`\n📊 HTML Report saved to: dropdown-test-report.html`);
}

// Run tests
testDropdowns().catch(console.error);