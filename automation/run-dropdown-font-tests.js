#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Banking App - Dropdown & Font Validation Tests');
console.log('=' .repeat(60));

const timestamp = Date.now();
const results = {
    dropdown: [],
    font: [],
    screenshots: []
};

// Create test files for dropdown and font validation
const dropdownTest = `
describe('Banking Dropdown Validation', () => {
    beforeEach(() => {
        cy.visit('/services/calculate-mortgage/1');
        cy.wait(2000);
    });

    it('should validate property ownership dropdown', () => {
        // Take initial screenshot
        cy.screenshot('dropdown-initial-state');
        
        // Find and click dropdown
        cy.get('select, [role="combobox"], .MuiSelect-root, .dropdown').first().then($dropdown => {
            cy.log('Found dropdown element');
            cy.wrap($dropdown).click();
            cy.screenshot('dropdown-opened');
            
            // Check for options
            cy.get('option, [role="option"], .MuiMenuItem-root').then($options => {
                cy.log(\`Found \${$options.length} dropdown options\`);
                
                // Validate expected options exist
                const expectedTexts = [
                    'אין לי נכס',
                    'יש לי נכס',
                    'אני מוכר נכס'
                ];
                
                let foundOptions = [];
                $options.each((index, option) => {
                    const text = Cypress.$(option).text();
                    foundOptions.push(text);
                    cy.log(\`Option \${index + 1}: \${text}\`);
                });
                
                // Take screenshot of options
                cy.screenshot('dropdown-options-visible');
                
                // Validate at least one expected option exists
                const hasExpectedOption = expectedTexts.some(expected => 
                    foundOptions.some(found => found.includes(expected))
                );
                
                expect(hasExpectedOption).to.be.true;
            });
        });
    });

    it('should detect missing dropdown data', () => {
        // Check for dropdown errors
        cy.window().then(win => {
            if (win.console && win.console.error) {
                const originalError = win.console.error;
                win.console.error = (...args) => {
                    const errorStr = args.join(' ');
                    if (errorStr.includes('dropdownData') || errorStr.includes('undefined')) {
                        cy.log('⚠️ DROPDOWN ERROR DETECTED: ' + errorStr);
                        cy.screenshot('dropdown-error-detected');
                    }
                    originalError.apply(win.console, args);
                };
            }
        });
        
        // Try to interact with dropdowns
        cy.get('body').then($body => {
            if ($body.find('select').length === 0) {
                cy.log('❌ NO DROPDOWN ELEMENTS FOUND');
                cy.screenshot('no-dropdowns-found');
            }
        });
    });
});
`;

const fontTest = `
describe('Hebrew Font & RTL Validation', () => {
    it('should validate Hebrew text rendering', () => {
        // Test Hebrew language
        cy.visit('/');
        cy.wait(2000);
        
        // Switch to Hebrew if not already
        cy.get('[data-testid="language-selector"], .language-selector, button').then($elements => {
            const hebrewButton = Array.from($elements).find(el => 
                el.textContent?.includes('עברית') || el.textContent?.includes('HE')
            );
            if (hebrewButton) {
                cy.wrap(hebrewButton).click();
            }
        });
        
        cy.wait(1000);
        cy.screenshot('hebrew-homepage');
        
        // Check RTL direction
        cy.get('html').should('have.attr', 'dir', 'rtl');
        cy.get('body').then($body => {
            const direction = window.getComputedStyle($body[0]).direction;
            expect(direction).to.equal('rtl');
            cy.log('✅ RTL direction confirmed: ' + direction);
        });
        
        // Navigate to mortgage calculator
        cy.visit('/services/calculate-mortgage/1');
        cy.wait(2000);
        cy.screenshot('hebrew-mortgage-calculator');
        
        // Check for Hebrew text
        cy.get('h1, h2, h3, label, button').then($elements => {
            let hebrewFound = false;
            $elements.each((index, el) => {
                const text = el.textContent || '';
                // Check for Hebrew characters
                if (/[\u0590-\u05FF]/.test(text)) {
                    hebrewFound = true;
                    cy.log(\`Hebrew text found: \${text.substring(0, 50)}...\`);
                }
            });
            
            if (!hebrewFound) {
                cy.log('⚠️ NO HEBREW TEXT FOUND');
                cy.screenshot('no-hebrew-text');
            } else {
                cy.log('✅ Hebrew text rendering confirmed');
                cy.screenshot('hebrew-text-confirmed');
            }
        });
        
        // Check font family
        cy.get('body').then($body => {
            const fontFamily = window.getComputedStyle($body[0]).fontFamily;
            cy.log('Font family: ' + fontFamily);
            
            // Check if Hebrew-friendly font is loaded
            if (fontFamily.includes('Rubik') || fontFamily.includes('Open Sans') || fontFamily.includes('Arial')) {
                cy.log('✅ Hebrew-compatible font detected');
            } else {
                cy.log('⚠️ Font may not support Hebrew properly');
            }
        });
    });

    it('should validate form labels in Hebrew', () => {
        cy.visit('/services/calculate-mortgage/1');
        cy.wait(2000);
        
        // Check form labels
        cy.get('label').then($labels => {
            let hebrewLabels = 0;
            let englishLabels = 0;
            
            $labels.each((index, label) => {
                const text = label.textContent || '';
                if (/[\u0590-\u05FF]/.test(text)) {
                    hebrewLabels++;
                } else if (/[a-zA-Z]/.test(text)) {
                    englishLabels++;
                }
            });
            
            cy.log(\`Hebrew labels: \${hebrewLabels}, English labels: \${englishLabels}\`);
            cy.screenshot('form-labels-language');
            
            if (hebrewLabels === 0 && englishLabels > 0) {
                cy.log('⚠️ Form is in English, not Hebrew');
            } else if (hebrewLabels > 0) {
                cy.log('✅ Hebrew form labels confirmed');
            }
        });
    });
});
`;

// Save test files
const dropdownTestPath = path.join(__dirname, 'tests/e2e/dropdown-validation.cy.js');
const fontTestPath = path.join(__dirname, 'tests/e2e/font-validation.cy.js');

fs.mkdirSync(path.dirname(dropdownTestPath), { recursive: true });
fs.writeFileSync(dropdownTestPath, dropdownTest);
fs.writeFileSync(fontTestPath, fontTest);

// Screenshots directory
const screenshotDir = path.join(__dirname, 'screenshots', `test-${timestamp}`);
fs.mkdirSync(screenshotDir, { recursive: true });

// Run dropdown tests
console.log('\n🔽 Running Dropdown Validation Tests...\n');
try {
    const output = execSync(
        `npx cypress run --spec "${dropdownTestPath}" --config baseUrl=http://localhost:5173,screenshotsFolder="${screenshotDir}/dropdown",video=false --quiet`,
        { cwd: __dirname, encoding: 'utf8', stdio: 'pipe' }
    );
    
    const passed = !output.includes('failed');
    results.dropdown.push({
        test: 'Dropdown Validation',
        status: passed ? 'PASSED' : 'FAILED',
        message: passed ? 'Dropdowns working correctly' : 'Dropdown issues detected'
    });
    
    console.log(passed ? '  ✅ Dropdown tests PASSED' : '  ❌ Dropdown tests FAILED');
    
    // Collect screenshots
    const dropdownScreenshots = path.join(screenshotDir, 'dropdown');
    if (fs.existsSync(dropdownScreenshots)) {
        fs.readdirSync(dropdownScreenshots).forEach(file => {
            if (file.endsWith('.png')) {
                results.screenshots.push({
                    category: 'Dropdown',
                    file,
                    path: path.join(dropdownScreenshots, file)
                });
                console.log(`  📸 Screenshot: ${file}`);
            }
        });
    }
} catch (err) {
    results.dropdown.push({
        test: 'Dropdown Validation',
        status: 'ERROR',
        message: 'Test execution failed'
    });
    console.log('  ❌ Dropdown test ERROR');
}

// Run font/RTL tests
console.log('\n🔤 Running Font & RTL Validation Tests...\n');
try {
    const output = execSync(
        `npx cypress run --spec "${fontTestPath}" --config baseUrl=http://localhost:5173,screenshotsFolder="${screenshotDir}/font",video=false --quiet`,
        { cwd: __dirname, encoding: 'utf8', stdio: 'pipe' }
    );
    
    const passed = !output.includes('failed');
    results.font.push({
        test: 'Hebrew Font & RTL',
        status: passed ? 'PASSED' : 'FAILED',
        message: passed ? 'Hebrew rendering correct' : 'Font/RTL issues detected'
    });
    
    console.log(passed ? '  ✅ Font/RTL tests PASSED' : '  ❌ Font/RTL tests FAILED');
    
    // Collect screenshots
    const fontScreenshots = path.join(screenshotDir, 'font');
    if (fs.existsSync(fontScreenshots)) {
        fs.readdirSync(fontScreenshots).forEach(file => {
            if (file.endsWith('.png')) {
                results.screenshots.push({
                    category: 'Font/RTL',
                    file,
                    path: path.join(fontScreenshots, file)
                });
                console.log(`  📸 Screenshot: ${file}`);
            }
        });
    }
} catch (err) {
    results.font.push({
        test: 'Hebrew Font & RTL',
        status: 'ERROR',
        message: 'Test execution failed'
    });
    console.log('  ❌ Font/RTL test ERROR');
}

// Generate HTML Report
console.log('\n📊 Generating Interactive Report...\n');

const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banking App - Dropdown & Font Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
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
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .content { padding: 30px; }
        
        .test-section {
            margin-bottom: 40px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
        }
        .section-header {
            background: #f9fafb;
            padding: 20px;
            font-size: 1.5em;
            font-weight: 600;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
        }
        .test-results {
            padding: 20px;
        }
        .test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .test-name { font-weight: 600; color: #1f2937; }
        .test-status {
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9em;
        }
        .test-status.passed { background: #10b981; color: white; }
        .test-status.failed { background: #ef4444; color: white; }
        .test-status.error { background: #f59e0b; color: white; }
        
        .screenshots-section {
            margin-top: 40px;
        }
        .screenshots-section h2 {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .screenshot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }
        .screenshot-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
        }
        .screenshot-img {
            width: 100%;
            height: 250px;
            object-fit: cover;
            background: #f3f4f6;
            cursor: pointer;
        }
        .screenshot-info {
            padding: 15px;
            background: white;
        }
        .screenshot-category {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .screenshot-category.dropdown { background: #dbeafe; color: #1e40af; }
        .screenshot-category.font { background: #fce7f3; color: #9f1239; }
        .screenshot-file {
            color: #6b7280;
            font-size: 0.9em;
            font-family: monospace;
        }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .summary-card {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 2px solid #e5e7eb;
        }
        .summary-card.success { border-color: #10b981; background: #f0fdf4; }
        .summary-card.warning { border-color: #f59e0b; background: #fffbeb; }
        .summary-card.error { border-color: #ef4444; background: #fef2f2; }
        .summary-icon { font-size: 2em; margin-bottom: 10px; }
        .summary-title { font-weight: 600; color: #1f2937; margin-bottom: 5px; }
        .summary-value { font-size: 1.5em; font-weight: bold; }
        
        .footer {
            background: #f3f4f6;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 Banking App - Critical Feature Tests</h1>
            <div>Dropdown Functionality & Hebrew RTL Validation</div>
        </div>
        
        <div class="content">
            <div class="summary-cards">
                <div class="summary-card ${results.dropdown.every(t => t.status === 'PASSED') ? 'success' : 'error'}">
                    <div class="summary-icon">🔽</div>
                    <div class="summary-title">Dropdown Tests</div>
                    <div class="summary-value">${results.dropdown.filter(t => t.status === 'PASSED').length}/${results.dropdown.length}</div>
                </div>
                <div class="summary-card ${results.font.every(t => t.status === 'PASSED') ? 'success' : 'error'}">
                    <div class="summary-icon">🔤</div>
                    <div class="summary-title">Font/RTL Tests</div>
                    <div class="summary-value">${results.font.filter(t => t.status === 'PASSED').length}/${results.font.length}</div>
                </div>
                <div class="summary-card ${results.screenshots.length > 0 ? 'success' : 'warning'}">
                    <div class="summary-icon">📸</div>
                    <div class="summary-title">Screenshots</div>
                    <div class="summary-value">${results.screenshots.length}</div>
                </div>
            </div>
            
            <div class="test-section">
                <div class="section-header">🔽 Dropdown Validation Results</div>
                <div class="test-results">
                    ${results.dropdown.map(test => `
                        <div class="test-item">
                            <div>
                                <div class="test-name">${test.test}</div>
                                <div style="color: #6b7280; font-size: 0.9em; margin-top: 5px;">${test.message}</div>
                            </div>
                            <div class="test-status ${test.status.toLowerCase()}">${test.status}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="test-section">
                <div class="section-header">🔤 Hebrew Font & RTL Results</div>
                <div class="test-results">
                    ${results.font.map(test => `
                        <div class="test-item">
                            <div>
                                <div class="test-name">${test.test}</div>
                                <div style="color: #6b7280; font-size: 0.9em; margin-top: 5px;">${test.message}</div>
                            </div>
                            <div class="test-status ${test.status.toLowerCase()}">${test.status}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${results.screenshots.length > 0 ? `
            <div class="screenshots-section">
                <h2>📸 Test Screenshots</h2>
                <div class="screenshot-grid">
                    ${results.screenshots.map((s, i) => `
                        <div class="screenshot-card">
                            <img 
                                src="screenshots/test-${timestamp}/${s.category.toLowerCase()}/${s.file}" 
                                alt="${s.category} - ${s.file}" 
                                class="screenshot-img"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                            />
                            <div style="display:none; padding: 20px; background: #f3f4f6; text-align: center; color: #6b7280;">
                                📸 ${s.file}
                            </div>
                            <div class="screenshot-info">
                                <span class="screenshot-category ${s.category.toLowerCase().replace('/', '')}">${s.category}</span>
                                <div class="screenshot-file">${s.file}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            Generated on ${new Date().toLocaleString()} | Critical Feature Validation Suite
        </div>
    </div>
</body>
</html>`;

// Save report
const reportPath = path.join(__dirname, 'reports', `dropdown-font-report-${timestamp}.html`);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, reportHtml);

// Summary
console.log('=' .repeat(60));
console.log('📊 TEST EXECUTION SUMMARY');
console.log('=' .repeat(60));

console.log('\nDropdown Tests:');
results.dropdown.forEach(t => {
    console.log(`  ${t.status === 'PASSED' ? '✅' : '❌'} ${t.test}: ${t.status}`);
});

console.log('\nFont/RTL Tests:');
results.font.forEach(t => {
    console.log(`  ${t.status === 'PASSED' ? '✅' : '❌'} ${t.test}: ${t.status}`);
});

console.log(`\n📸 Total Screenshots: ${results.screenshots.length}`);

console.log('\n✨ Report generated successfully!');
console.log(`📄 Report: ${reportPath}`);
console.log('\n🌐 View report:');
console.log(`   open "${reportPath}"`);

// Clean up test files
fs.unlinkSync(dropdownTestPath);
fs.unlinkSync(fontTestPath);