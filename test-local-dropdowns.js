#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const LOCAL_URL = 'http://localhost:5173';
const LANGUAGES = ['en', 'he', 'ru'];

// Comprehensive dropdown pages with all expected dropdowns
const DROPDOWN_PAGES = [
    {
        path: '/services/calculate-mortgage/1',
        name: 'Mortgage Calculator Step 1',
        expectedDropdowns: [
            { id: 'property_ownership', minOptions: 3 },
            { id: 'mortgage_goal', minOptions: 2 }
        ]
    },
    {
        path: '/services/calculate-mortgage/2',
        name: 'Mortgage Calculator Step 2',
        expectedDropdowns: [
            { id: 'family_status', minOptions: 4 },
            { id: 'citizenship_status', minOptions: 3 }
        ]
    },
    {
        path: '/services/calculate-mortgage/3',
        name: 'Mortgage Calculator Step 3',
        expectedDropdowns: [
            { id: 'education', minOptions: 5 },
            { id: 'professional_field', minOptions: 10 },
            { id: 'employment_status', minOptions: 5 },
            { id: 'income_sources', minOptions: 5 },
            { id: 'main_income_source', minOptions: 5 }
        ]
    },
    {
        path: '/services/refinance-mortgage/1',
        name: 'Refinance Mortgage Step 1',
        expectedDropdowns: [
            { id: 'property_ownership', minOptions: 3 },
            { id: 'refinance_goal', minOptions: 3 }
        ]
    },
    {
        path: '/services/refinance-mortgage/2',
        name: 'Refinance Mortgage Step 2',
        expectedDropdowns: [
            { id: 'family_status', minOptions: 4 },
            { id: 'citizenship_status', minOptions: 3 }
        ]
    },
    {
        path: '/services/refinance-mortgage/3',
        name: 'Refinance Mortgage Step 3',
        expectedDropdowns: [
            { id: 'education', minOptions: 5 },
            { id: 'professional_field', minOptions: 10 },
            { id: 'employment_status', minOptions: 5 }
        ]
    },
    {
        path: '/services/calculate-credit/1',
        name: 'Credit Calculator Step 1',
        expectedDropdowns: [
            { id: 'credit_goal', minOptions: 4 },
            { id: 'credit_type', minOptions: 3 }
        ]
    },
    {
        path: '/services/calculate-credit/2',
        name: 'Credit Calculator Step 2',
        expectedDropdowns: [
            { id: 'family_status', minOptions: 4 },
            { id: 'citizenship_status', minOptions: 3 }
        ]
    },
    {
        path: '/services/calculate-credit/3',
        name: 'Credit Calculator Step 3',
        expectedDropdowns: [
            { id: 'education', minOptions: 5 },
            { id: 'professional_field', minOptions: 10 },
            { id: 'employment_status', minOptions: 5 },
            { id: 'main_income_source', minOptions: 5 }
        ]
    },
    {
        path: '/services/refinance-credit/1',
        name: 'Refinance Credit Step 1',
        expectedDropdowns: [
            { id: 'credit_goal', minOptions: 4 },
            { id: 'refinance_type', minOptions: 3 }
        ]
    },
    {
        path: '/services/refinance-credit/2',
        name: 'Refinance Credit Step 2',
        expectedDropdowns: [
            { id: 'family_status', minOptions: 4 },
            { id: 'citizenship_status', minOptions: 3 }
        ]
    },
    {
        path: '/services/refinance-credit/3',
        name: 'Refinance Credit Step 3',
        expectedDropdowns: [
            { id: 'education', minOptions: 5 },
            { id: 'professional_field', minOptions: 10 },
            { id: 'employment_status', minOptions: 5 }
        ]
    },
    {
        path: '/services/other-borrowers/1',
        name: 'Other Borrowers Step 1',
        expectedDropdowns: [
            { id: 'relationship', minOptions: 3 }
        ]
    },
    {
        path: '/services/other-borrowers/2',
        name: 'Other Borrowers Step 2',
        expectedDropdowns: [
            { id: 'family_status', minOptions: 4 },
            { id: 'citizenship_status', minOptions: 3 }
        ]
    },
    {
        path: '/services/other-borrowers/3',
        name: 'Other Borrowers Step 3',
        expectedDropdowns: [
            { id: 'education', minOptions: 5 },
            { id: 'professional_field', minOptions: 10 },
            { id: 'employment_status', minOptions: 5 },
            { id: 'main_income_source', minOptions: 5 }
        ]
    }
];

const testResults = {
    timestamp: new Date().toISOString(),
    url: LOCAL_URL,
    environment: 'LOCAL DEVELOPMENT',
    totalPages: 0,
    pagesWithErrors: 0,
    totalDropdowns: 0,
    workingDropdowns: 0,
    brokenDropdowns: 0,
    emptyDropdowns: 0,
    languageResults: {},
    detailedResults: [],
    criticalIssues: [],
    apiEndpoints: []
};

async function checkLocalServer() {
    console.log('🔌 Checking local server availability...');
    try {
        const response = await fetch(LOCAL_URL);
        if (response.ok) {
            console.log('✅ Local server is running\n');
            return true;
        }
    } catch (error) {
        console.log('❌ Local server is not running at ' + LOCAL_URL);
        console.log('Please start your development server with: npm run dev\n');
        return false;
    }
}

async function testDropdowns() {
    // Check if local server is running
    if (!await checkLocalServer()) {
        process.exit(1);
    }

    console.log('🔍 LOCAL DROPDOWN QA TESTING');
    console.log('=' .repeat(60));
    console.log(`📍 URL: ${LOCAL_URL}`);
    console.log(`🌐 Languages to test: ${LANGUAGES.join(', ')}`);
    console.log(`📄 Pages to test: ${DROPDOWN_PAGES.length}`);
    console.log(`📊 Expected dropdowns per page: 2-5`);
    console.log('=' .repeat(60) + '\n');

    const browser = await puppeteer.launch({
        headless: false, // Set to false to see the browser
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1920, height: 1080 }
    });

    // Test each language
    for (const lang of LANGUAGES) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🌍 Testing ${lang.toUpperCase()} Language`);
        console.log('='.repeat(60));
        
        testResults.languageResults[lang] = {
            total: 0,
            working: 0,
            broken: 0,
            empty: 0,
            pages: []
        };

        for (const pageConfig of DROPDOWN_PAGES) {
            testResults.totalPages++;
            console.log(`\n📄 Testing: ${pageConfig.name}`);
            console.log(`   URL: ${LOCAL_URL}${pageConfig.path}`);
            console.log(`   Language: ${lang.toUpperCase()}`);
            
            const page = await browser.newPage();
            
            // Set up request interception to log API calls
            await page.setRequestInterception(true);
            const apiCalls = [];
            
            page.on('request', request => {
                const url = request.url();
                if (url.includes('/api/') && url.includes('dropdown')) {
                    apiCalls.push({
                        url: url,
                        method: request.method(),
                        timestamp: new Date().toISOString()
                    });
                }
                request.continue();
            });
            
            const pageResult = {
                page: pageConfig.name,
                path: pageConfig.path,
                language: lang,
                url: `${LOCAL_URL}${pageConfig.path}`,
                timestamp: new Date().toISOString(),
                dropdowns: [],
                errors: [],
                apiCalls: [],
                hasIssues: false
            };

            try {
                // Navigate to page
                await page.goto(`${LOCAL_URL}${pageConfig.path}`, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                // Wait for page to load
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Change language
                const langChanged = await page.evaluate((targetLang) => {
                    // Try multiple methods to change language
                    
                    // Method 1: Click language button
                    const langButtons = document.querySelectorAll(`[data-lang="${targetLang}"], [data-language="${targetLang}"]`);
                    if (langButtons.length > 0) {
                        langButtons[0].click();
                        return true;
                    }
                    
                    // Method 2: Use i18next if available
                    if (window.i18n && window.i18n.changeLanguage) {
                        window.i18n.changeLanguage(targetLang);
                        return true;
                    }
                    
                    // Method 3: Set localStorage and reload
                    localStorage.setItem('i18nextLng', targetLang);
                    localStorage.setItem('language', targetLang);
                    return false;
                }, lang);

                if (!langChanged) {
                    await page.reload({ waitUntil: 'networkidle2' });
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Find all dropdowns
                const dropdownData = await page.evaluate(() => {
                    const results = [];
                    
                    // Method 1: Find standard select elements
                    const selects = document.querySelectorAll('select');
                    selects.forEach((select, index) => {
                        const options = Array.from(select.options);
                        const id = select.id || select.name || select.className || `select_${index}`;
                        const label = select.closest('.form-group')?.querySelector('label')?.textContent || 
                                    select.getAttribute('aria-label') || '';
                        
                        const optionData = options.map(opt => ({
                            text: opt.textContent.trim(),
                            value: opt.value,
                            isPlaceholder: opt.value === '' || opt.disabled
                        }));
                        
                        results.push({
                            type: 'select',
                            id: id,
                            label: label,
                            elementFound: true,
                            optionCount: options.length,
                            actualOptionCount: optionData.filter(o => !o.isPlaceholder).length,
                            options: optionData,
                            visible: select.offsetParent !== null,
                            disabled: select.disabled,
                            required: select.required
                        });
                    });

                    // Method 2: Find MUI/custom dropdowns
                    const muiSelects = document.querySelectorAll('[role="button"][aria-haspopup="listbox"], .MuiSelect-root, .MuiAutocomplete-root');
                    muiSelects.forEach((dropdown, index) => {
                        const id = dropdown.id || dropdown.getAttribute('name') || `mui_${index}`;
                        const label = dropdown.closest('.MuiFormControl-root')?.querySelector('label')?.textContent || '';
                        
                        // Try to click and get options
                        let optionCount = 0;
                        let options = [];
                        
                        // Check if it's an Autocomplete
                        const input = dropdown.querySelector('input');
                        if (input) {
                            const listId = input.getAttribute('aria-controls');
                            if (listId) {
                                const list = document.getElementById(listId);
                                if (list) {
                                    const listOptions = list.querySelectorAll('[role="option"]');
                                    optionCount = listOptions.length;
                                    options = Array.from(listOptions).map(opt => ({
                                        text: opt.textContent.trim(),
                                        value: opt.getAttribute('data-value') || opt.textContent.trim(),
                                        isPlaceholder: false
                                    }));
                                }
                            }
                        }
                        
                        results.push({
                            type: 'mui',
                            id: id,
                            label: label,
                            elementFound: true,
                            optionCount: optionCount,
                            actualOptionCount: optionCount,
                            options: options,
                            visible: dropdown.offsetParent !== null,
                            disabled: dropdown.hasAttribute('disabled')
                        });
                    });

                    // Method 3: Find custom dropdown implementations
                    const customDropdowns = document.querySelectorAll('.dropdown, .custom-select, [class*="select"]:not(select)');
                    customDropdowns.forEach((dropdown, index) => {
                        if (dropdown.tagName === 'SELECT') return; // Skip if it's actually a select element
                        
                        const id = dropdown.id || dropdown.className.split(' ')[0] || `custom_${index}`;
                        const options = dropdown.querySelectorAll('.option, .dropdown-item, [role="option"], li');
                        
                        if (options.length > 0) {
                            results.push({
                                type: 'custom',
                                id: id,
                                elementFound: true,
                                optionCount: options.length,
                                actualOptionCount: options.length,
                                options: Array.from(options).map(opt => ({
                                    text: opt.textContent.trim(),
                                    value: opt.getAttribute('data-value') || opt.textContent.trim(),
                                    isPlaceholder: false
                                })),
                                visible: dropdown.offsetParent !== null
                            });
                        }
                    });

                    return results;
                });

                // Store API calls
                pageResult.apiCalls = apiCalls;
                testResults.apiEndpoints.push(...apiCalls);

                // Analyze dropdown data
                console.log(`   Found ${dropdownData.length} dropdown(s)`);
                testResults.totalDropdowns += dropdownData.length;
                testResults.languageResults[lang].total += dropdownData.length;
                
                for (const dropdown of dropdownData) {
                    const dropdownResult = {
                        id: dropdown.id,
                        type: dropdown.type,
                        label: dropdown.label,
                        status: 'UNKNOWN',
                        optionCount: dropdown.optionCount,
                        actualOptionCount: dropdown.actualOptionCount,
                        issues: [],
                        options: dropdown.options
                    };

                    // Determine status
                    if (!dropdown.elementFound) {
                        dropdownResult.status = 'NOT_FOUND';
                        dropdownResult.issues.push('Dropdown element not found');
                        testResults.brokenDropdowns++;
                        testResults.languageResults[lang].broken++;
                    } else if (dropdown.actualOptionCount === 0) {
                        dropdownResult.status = 'EMPTY';
                        dropdownResult.issues.push('Dropdown has no valid options');
                        testResults.emptyDropdowns++;
                        testResults.languageResults[lang].empty++;
                        pageResult.hasIssues = true;
                    } else if (dropdown.actualOptionCount < 2) {
                        dropdownResult.status = 'INSUFFICIENT';
                        dropdownResult.issues.push(`Only ${dropdown.actualOptionCount} valid option(s)`);
                        testResults.brokenDropdowns++;
                        testResults.languageResults[lang].broken++;
                        pageResult.hasIssues = true;
                    } else if (!dropdown.visible) {
                        dropdownResult.status = 'HIDDEN';
                        dropdownResult.issues.push('Dropdown is not visible');
                        testResults.brokenDropdowns++;
                        testResults.languageResults[lang].broken++;
                    } else if (dropdown.disabled) {
                        dropdownResult.status = 'DISABLED';
                        dropdownResult.issues.push('Dropdown is disabled');
                    } else {
                        dropdownResult.status = 'OK';
                        testResults.workingDropdowns++;
                        testResults.languageResults[lang].working++;
                    }

                    // Check for untranslated options
                    if (dropdown.options && dropdown.options.length > 0) {
                        const untranslatedOptions = dropdown.options.filter(opt => 
                            opt.text.includes('_') || 
                            opt.text === 'null' || 
                            opt.text === 'undefined' ||
                            opt.text === '' ||
                            /^[a-z_]+$/.test(opt.text)
                        );
                        
                        if (untranslatedOptions.length > 0) {
                            dropdownResult.issues.push(`${untranslatedOptions.length} untranslated option(s)`);
                            dropdownResult.untranslatedOptions = untranslatedOptions;
                            pageResult.hasIssues = true;
                        }
                    }

                    pageResult.dropdowns.push(dropdownResult);
                    
                    // Log results
                    const statusIcon = dropdownResult.status === 'OK' ? '✅' : 
                                     dropdownResult.status === 'EMPTY' ? '🔴' : 
                                     dropdownResult.status === 'INSUFFICIENT' ? '⚠️' : 
                                     dropdownResult.status === 'HIDDEN' ? '👁️' :
                                     dropdownResult.status === 'DISABLED' ? '🔒' : '❌';
                    
                    console.log(`     ${statusIcon} ${dropdown.id}: ${dropdownResult.status} - ${dropdown.actualOptionCount} valid options`);
                    
                    if (dropdownResult.issues.length > 0) {
                        dropdownResult.issues.forEach(issue => {
                            console.log(`        ⚠️  ${issue}`);
                        });
                    }
                }

                // Check for expected dropdowns
                console.log(`   Checking expected dropdowns...`);
                for (const expected of pageConfig.expectedDropdowns) {
                    const found = dropdownData.some(d => 
                        d.id.toLowerCase().includes(expected.id.toLowerCase()) ||
                        (d.label && d.label.toLowerCase().includes(expected.id.toLowerCase()))
                    );
                    
                    if (!found) {
                        pageResult.errors.push(`Expected dropdown '${expected.id}' not found`);
                        pageResult.hasIssues = true;
                        console.log(`     ❌ MISSING: Expected dropdown '${expected.id}'`);
                        testResults.criticalIssues.push({
                            page: pageConfig.name,
                            language: lang,
                            issue: `Missing dropdown: ${expected.id}`
                        });
                    } else {
                        // Check if it has minimum required options
                        const dropdown = dropdownData.find(d => 
                            d.id.toLowerCase().includes(expected.id.toLowerCase())
                        );
                        if (dropdown && dropdown.actualOptionCount < expected.minOptions) {
                            console.log(`     ⚠️  ${expected.id} has only ${dropdown.actualOptionCount} options (expected min: ${expected.minOptions})`);
                            pageResult.errors.push(`${expected.id} has insufficient options`);
                        }
                    }
                }

                // Take screenshot
                const screenshotDir = path.join(__dirname, 'local-dropdown-screenshots');
                if (!fs.existsSync(screenshotDir)) {
                    fs.mkdirSync(screenshotDir, { recursive: true });
                }
                const screenshotPath = path.join(screenshotDir, `${lang}_${pageConfig.path.replace(/\//g, '_')}.png`);
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
            
            testResults.languageResults[lang].pages.push(pageResult);
            testResults.detailedResults.push(pageResult);
        }
    }

    await browser.close();
    
    // Generate reports
    generateReport();
    generateHTMLReport();
}

function generateReport() {
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 LOCAL DROPDOWN QA SUMMARY');
    console.log('='.repeat(60));
    console.log(`🌐 Local URL: ${LOCAL_URL}`);
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
    
    console.log(`\n🌍 Per Language Results:`);
    for (const lang of LANGUAGES) {
        const langResults = testResults.languageResults[lang];
        const langSuccess = langResults.total > 0 ? 
            Math.round(langResults.working / langResults.total * 100) : 0;
        console.log(`\n  ${lang.toUpperCase()}:`);
        console.log(`    Total Dropdowns: ${langResults.total}`);
        console.log(`    Working: ${langResults.working} (${langSuccess}%)`);
        console.log(`    Empty: ${langResults.empty}`);
        console.log(`    Broken: ${langResults.broken}`);
    }
    
    if (testResults.criticalIssues.length > 0) {
        console.log(`\n⚠️  CRITICAL ISSUES (${testResults.criticalIssues.length}):`);
        const uniqueIssues = [...new Set(testResults.criticalIssues.map(i => i.issue))];
        uniqueIssues.forEach(issue => {
            const count = testResults.criticalIssues.filter(i => i.issue === issue).length;
            console.log(`  • ${issue} (${count} occurrences)`);
        });
    }
    
    console.log(`\n🎯 Overall Success Rate: ${successRate}%`);
    if (successRate >= 90) {
        console.log('✅ EXCELLENT: Dropdowns are working great!');
    } else if (successRate >= 70) {
        console.log('⚠️  GOOD: Most dropdowns working, some issues to fix');
    } else if (successRate >= 50) {
        console.log('⚠️  WARNING: Significant dropdown issues detected');
    } else {
        console.log('❌ CRITICAL: Major dropdown functionality problems!');
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
    <title>Local Dropdown QA Report - ${LOCAL_URL}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container { max-width: 1600px; margin: 0 auto; }
        
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
        
        .environment-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
        }
        
        .success-meter {
            margin: 30px 0;
            padding: 30px;
            background: ${successRate >= 70 ? '#d1fae5' : successRate >= 50 ? '#fed7aa' : '#fee2e2'};
            border-radius: 15px;
            text-align: center;
        }
        
        .success-rate {
            font-size: 4em;
            font-weight: bold;
            color: ${successRate >= 70 ? '#10b981' : successRate >= 50 ? '#f59e0b' : '#ef4444'};
        }
        
        .success-label {
            font-size: 1.2em;
            color: #666;
            margin-top: 10px;
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
        
        .language-section {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        
        .language-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .language-title {
            font-size: 1.5em;
            font-weight: bold;
            color: #333;
        }
        
        .language-stats {
            display: flex;
            gap: 20px;
        }
        
        .language-stat {
            padding: 5px 15px;
            border-radius: 10px;
            font-size: 0.9em;
            font-weight: 600;
        }
        
        .stat-ok { background: #d1fae5; color: #065f46; }
        .stat-warning { background: #fed7aa; color: #92400e; }
        .stat-error { background: #fee2e2; color: #991b1b; }
        
        .page-results {
            margin-top: 20px;
        }
        
        .page-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
        }
        
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .page-title {
            font-weight: bold;
            color: #333;
        }
        
        .dropdown-list {
            display: grid;
            gap: 10px;
        }
        
        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #e5e7eb;
        }
        
        .dropdown-item.ok { border-left-color: #10b981; }
        .dropdown-item.empty { border-left-color: #ef4444; }
        .dropdown-item.broken { border-left-color: #f59e0b; }
        
        .dropdown-status {
            font-size: 1.2em;
        }
        
        .dropdown-details {
            flex: 1;
        }
        
        .dropdown-id {
            font-weight: 600;
            color: #333;
        }
        
        .dropdown-info {
            font-size: 0.9em;
            color: #666;
        }
        
        .issues-section {
            background: #fee2e2;
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .issues-title {
            color: #991b1b;
            font-size: 1.3em;
            margin-bottom: 15px;
        }
        
        .issue-list {
            display: grid;
            gap: 10px;
        }
        
        .issue-item {
            padding: 10px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #ef4444;
        }
        
        .api-section {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        
        .api-list {
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            max-height: 300px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Local Dropdown QA Report</h1>
            <span class="environment-badge">LOCAL DEVELOPMENT ENVIRONMENT</span>
            
            <div class="success-meter">
                <div class="success-rate">${successRate}%</div>
                <div class="success-label">Overall Success Rate</div>
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
            </div>
        </div>
        
        ${testResults.criticalIssues.length > 0 ? `
        <div class="issues-section">
            <h3 class="issues-title">⚠️ Critical Issues Found (${testResults.criticalIssues.length})</h3>
            <div class="issue-list">
                ${[...new Set(testResults.criticalIssues.map(i => i.issue))].map(issue => {
                    const count = testResults.criticalIssues.filter(i => i.issue === issue).length;
                    return `<div class="issue-item">${issue} (${count} occurrences across languages)</div>`;
                }).join('')}
            </div>
        </div>
        ` : ''}
        
        ${LANGUAGES.map(lang => {
            const langResults = testResults.languageResults[lang];
            const langSuccess = langResults.total > 0 ? 
                Math.round(langResults.working / langResults.total * 100) : 0;
            
            return `
            <div class="language-section">
                <div class="language-header">
                    <div class="language-title">🌍 ${lang.toUpperCase()} Language Results</div>
                    <div class="language-stats">
                        <span class="language-stat stat-ok">✅ ${langResults.working} Working</span>
                        <span class="language-stat stat-warning">⚠️ ${langResults.empty} Empty</span>
                        <span class="language-stat stat-error">❌ ${langResults.broken} Broken</span>
                    </div>
                </div>
                
                <div class="page-results">
                    ${langResults.pages.map(page => `
                        <div class="page-card">
                            <div class="page-header">
                                <div class="page-title">${page.page}</div>
                                <div>${page.dropdowns.length} dropdowns</div>
                            </div>
                            <div class="dropdown-list">
                                ${page.dropdowns.map(dd => `
                                    <div class="dropdown-item ${dd.status.toLowerCase()}">
                                        <div class="dropdown-status">
                                            ${dd.status === 'OK' ? '✅' : 
                                              dd.status === 'EMPTY' ? '🔴' : 
                                              dd.status === 'INSUFFICIENT' ? '⚠️' : 
                                              dd.status === 'HIDDEN' ? '👁️' : '❌'}
                                        </div>
                                        <div class="dropdown-details">
                                            <div class="dropdown-id">${dd.id}</div>
                                            <div class="dropdown-info">
                                                ${dd.actualOptionCount} options • ${dd.status}
                                                ${dd.issues.length > 0 ? `• ${dd.issues.join(', ')}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            ${page.errors.length > 0 ? `
                                <div style="margin-top: 10px; padding: 10px; background: #fee2e2; border-radius: 8px;">
                                    <strong>Errors:</strong> ${page.errors.join(', ')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            `;
        }).join('')}
        
        ${testResults.apiEndpoints.length > 0 ? `
        <div class="api-section">
            <h3>📡 API Endpoints Called</h3>
            <div class="api-list">
                ${testResults.apiEndpoints.map(api => 
                    `${api.method} ${api.url}`
                ).join('<br>')}
            </div>
        </div>
        ` : ''}
        
        <div style="text-align: center; color: white; margin-top: 40px; padding: 20px;">
            <p>Generated on ${new Date().toLocaleString()} | Local Dropdown QA Suite v1.0</p>
            <p>© 2025 BankimOnline - Development Testing Report</p>
        </div>
    </div>
</body>
</html>`;

    const reportPath = path.join(__dirname, 'local-dropdown-qa-report.html');
    fs.writeFileSync(reportPath, html);
    console.log(`\n📊 HTML Report saved to: ${reportPath}`);
}

// Run tests
testDropdowns().catch(console.error);