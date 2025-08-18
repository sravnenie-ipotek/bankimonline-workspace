describe('Custom Dropdown Validation - JSONB System', () => {
    const processes = [
        { 
            name: 'Calculate Mortgage', 
            path: '/calculate-mortgage',
            steps: [
                { name: 'Step 1', expectedDropdowns: ['when-needed', 'property-type', 'first-home', 'property-ownership'] },
                { name: 'Step 2', expectedDropdowns: [] }, // Will detect actual dropdowns
                { name: 'Step 3', expectedDropdowns: [] },
                { name: 'Step 4', expectedDropdowns: [] }
            ]
        },
        { 
            name: 'Calculate Credit', 
            path: '/calculate-credit',
            steps: [
                { name: 'Step 1', expectedDropdowns: [] },
                { name: 'Step 2', expectedDropdowns: [] },
                { name: 'Step 3', expectedDropdowns: [] }
            ]
        },
        { 
            name: 'Refinance Mortgage', 
            path: '/refinance-mortgage',
            steps: [
                { name: 'Step 1', expectedDropdowns: [] },
                { name: 'Step 2', expectedDropdowns: [] },
                { name: 'Step 3', expectedDropdowns: [] }
            ]
        },
        { 
            name: 'Refinance Credit', 
            path: '/refinance-credit',
            steps: [
                { name: 'Step 1', expectedDropdowns: [] },
                { name: 'Step 2', expectedDropdowns: [] },
                { name: 'Step 3', expectedDropdowns: [] }
            ]
        }
    ];
    
    const testResults: any[] = [];
    let totalDropdowns = 0;
    let emptyDropdowns = 0;
    let filledDropdowns = 0;
    
    beforeEach(() => {
        cy.viewport(1920, 1080);
        
        // Intercept dropdown API calls to track what's being fetched
        cy.intercept('GET', '/api/dropdowns/**', (req) => {
            req.continue((res) => {
                const url = req.url;
                console.log('📡 API Call:', url);
                console.log('   Response status:', res.statusCode);
                if (res.body?.options) {
                    const optionCount = Object.keys(res.body.options).length;
                    console.log('   Options returned:', optionCount);
                }
            });
        }).as('dropdownApi');
    });
    
    processes.forEach((process) => {
        it(`Validates ${process.name} dropdowns with custom components`, () => {
            const processResult = {
                process: process.name,
                path: process.path,
                timestamp: new Date().toISOString(),
                steps: [],
                totalDropdowns: 0,
                emptyDropdowns: 0,
                filledDropdowns: 0,
                missingDropdowns: []
            };
            
            cy.visit(process.path);
            cy.wait(3000); // Wait for initial load
            
            process.steps.forEach((step, stepIndex) => {
                const stepResult = {
                    step: step.name,
                    dropdowns: [],
                    emptyCount: 0,
                    filledCount: 0
                };
                
                // Look for custom dropdown components
                cy.get('[data-testid*="dropdown"], .dropdown, [class*="dropdown"]').then($dropdowns => {
                    console.log(`\n📋 ${process.name} - ${step.name}: Found ${$dropdowns.length} dropdown elements`);
                    
                    $dropdowns.each((index, dropdown) => {
                        const $dropdown = Cypress.$(dropdown);
                        const testId = $dropdown.attr('data-testid') || '';
                        const className = $dropdown.attr('class') || '';
                        
                        // Click to open the dropdown
                        cy.wrap($dropdown).click({ force: true });
                        cy.wait(500);
                        
                        // Look for dropdown options in the opened menu
                        cy.get('[role="option"], .dropdown-item, [class*="option"], li[role="menuitem"]').then($options => {
                            const optionCount = $options.length;
                            const hasOptions = optionCount > 0;
                            
                            const dropdownInfo = {
                                index,
                                testId,
                                className,
                                optionCount,
                                hasOptions,
                                isEmpty: !hasOptions,
                                sampleOptions: []
                            };
                            
                            // Collect sample options
                            $options.slice(0, 3).each((i, opt) => {
                                const text = Cypress.$(opt).text();
                                if (text && text.trim()) {
                                    dropdownInfo.sampleOptions.push(text.trim());
                                }
                            });
                            
                            stepResult.dropdowns.push(dropdownInfo);
                            
                            if (dropdownInfo.isEmpty) {
                                stepResult.emptyCount++;
                                processResult.emptyDropdowns++;
                                processResult.missingDropdowns.push({
                                    step: step.name,
                                    testId,
                                    className
                                });
                                console.log(`   ❌ Empty dropdown: ${testId || className}`);
                            } else {
                                stepResult.filledCount++;
                                processResult.filledDropdowns++;
                                console.log(`   ✅ Filled dropdown: ${testId || className} (${optionCount} options)`);
                                console.log(`      Sample: ${dropdownInfo.sampleOptions.join(', ')}`);
                            }
                            
                            processResult.totalDropdowns++;
                            totalDropdowns++;
                        });
                        
                        // Close the dropdown by clicking outside
                        cy.get('body').click(0, 0);
                        cy.wait(200);
                    });
                });
                
                // Also check for the custom Dropdown component wrapper
                cy.get('.dropdown-wrapper, [class*="dropdown-wrapper"]').then($wrappers => {
                    if ($wrappers.length > 0) {
                        console.log(`   Found ${$wrappers.length} dropdown wrappers`);
                        
                        $wrappers.each((index, wrapper) => {
                            const $wrapper = Cypress.$(wrapper);
                            const text = $wrapper.find('.dropdown-label, [class*="label"]').text() || 
                                       $wrapper.text().substring(0, 50);
                            console.log(`     Wrapper ${index + 1}: ${text}`);
                        });
                    }
                });
                
                processResult.steps.push(stepResult);
                
                // Navigate to next step if not the last one
                if (stepIndex < process.steps.length - 1) {
                    // Try different button selectors
                    cy.get('button').then($buttons => {
                        const continueButton = $buttons.filter((i, btn) => {
                            const text = Cypress.$(btn).text();
                            return /Continue|Next|המשך|הבא|המשך לשלב/i.test(text);
                        });
                        
                        if (continueButton.length > 0) {
                            cy.wrap(continueButton.first()).click({ force: true });
                            cy.wait(2000);
                        } else {
                            console.log('⚠️ No continue button found, skipping to next step');
                        }
                    });
                }
            });
            
            testResults.push(processResult);
            
            // Log process summary
            const successRate = processResult.totalDropdowns > 0 
                ? ((processResult.filledDropdowns / processResult.totalDropdowns) * 100).toFixed(1)
                : 0;
                
            console.log(`\n📊 ${process.name} Summary:`);
            console.log(`   Total dropdowns: ${processResult.totalDropdowns}`);
            console.log(`   Filled: ${processResult.filledDropdowns}`);
            console.log(`   Empty: ${processResult.emptyDropdowns}`);
            console.log(`   Success rate: ${successRate}%`);
            
            if (processResult.missingDropdowns.length > 0) {
                console.log(`   Missing dropdowns:`);
                processResult.missingDropdowns.forEach(missing => {
                    console.log(`     - ${missing.step}: ${missing.testId || missing.className}`);
                });
            }
        });
    });
    
    after(() => {
        // Generate comprehensive report
        const overallSuccessRate = totalDropdowns > 0 
            ? ((filledDropdowns / totalDropdowns) * 100).toFixed(1)
            : 0;
            
        const report = {
            testRun: {
                timestamp: new Date().toISOString(),
                duration: Date.now() - Date.parse(testResults[0]?.timestamp || new Date().toISOString()),
                environment: 'Development'
            },
            summary: {
                processesTested: testResults.length,
                totalDropdowns,
                filledDropdowns,
                emptyDropdowns,
                successRate: overallSuccessRate
            },
            processSummaries: testResults.map(r => ({
                process: r.process,
                totalDropdowns: r.totalDropdowns,
                filledDropdowns: r.filledDropdowns,
                emptyDropdowns: r.emptyDropdowns,
                successRate: r.totalDropdowns > 0 
                    ? ((r.filledDropdowns / r.totalDropdowns) * 100).toFixed(1) + '%'
                    : '0%',
                missingDropdowns: r.missingDropdowns
            })),
            detailedResults: testResults
        };
        
        // Save JSON report
        cy.writeFile('cypress/results/custom-dropdown-validation.json', report);
        
        // Generate HTML report
        const htmlReport = generateHTMLReport(report);
        cy.writeFile('cypress/results/custom-dropdown-validation.html', htmlReport);
        
        console.log('\n' + '='.repeat(80));
        console.log('📊 OVERALL TEST SUMMARY');
        console.log('='.repeat(80));
        console.log(`Total dropdowns tested: ${totalDropdowns}`);
        console.log(`Filled dropdowns: ${filledDropdowns}`);
        console.log(`Empty dropdowns: ${emptyDropdowns}`);
        console.log(`Overall success rate: ${overallSuccessRate}%`);
        console.log('\n✅ Reports saved to cypress/results/');
    });
    
    function generateHTMLReport(report: any) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Dropdown Validation Report - JSONB System</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #2d3748; font-size: 2.5rem; margin-bottom: 10px; }
        .subtitle { color: #718096; font-size: 1.1rem; }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
        }
        .metric-value {
            font-size: 3rem;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .metric-label {
            color: #718096;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 10px;
        }
        .process-card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .process-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
        }
        .process-name { font-size: 1.5rem; color: #2d3748; }
        .success-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1.1rem;
        }
        .success-high { background: #c6f6d5; color: #22543d; }
        .success-medium { background: #feebc8; color: #7c2d12; }
        .success-low { background: #fed7d7; color: #c53030; }
        .missing-dropdowns {
            margin-top: 20px;
            padding: 15px;
            background: #fff5f5;
            border-radius: 10px;
            border: 2px solid #feb2b2;
        }
        .missing-title { color: #c53030; font-weight: bold; margin-bottom: 10px; }
        .missing-item { color: #742a2a; margin-left: 20px; margin-bottom: 5px; }
        .timestamp { color: #a0aec0; font-size: 0.9rem; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Custom Dropdown Validation Report</h1>
            <div class="subtitle">JSONB Dropdown System - Comprehensive Testing</div>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${report.summary.totalDropdowns}</div>
                <div class="metric-label">Total Dropdowns</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.filledDropdowns}</div>
                <div class="metric-label">Filled Dropdowns</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.emptyDropdowns}</div>
                <div class="metric-label">Empty Dropdowns</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
        </div>
        
        ${report.processSummaries.map(p => {
            const rate = parseFloat(p.successRate);
            const badgeClass = rate >= 80 ? 'success-high' : rate >= 50 ? 'success-medium' : 'success-low';
            return `
            <div class="process-card">
                <div class="process-header">
                    <div class="process-name">${p.process}</div>
                    <div class="success-badge ${badgeClass}">${p.successRate}</div>
                </div>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${p.totalDropdowns}</div>
                        <div class="metric-label">Total</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${p.filledDropdowns}</div>
                        <div class="metric-label">Filled</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${p.emptyDropdowns}</div>
                        <div class="metric-label">Empty</div>
                    </div>
                </div>
                ${p.missingDropdowns.length > 0 ? `
                    <div class="missing-dropdowns">
                        <div class="missing-title">⚠️ Missing Dropdowns:</div>
                        ${p.missingDropdowns.map(m => `
                            <div class="missing-item">• ${m.step}: ${m.testId || m.className}</div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            `;
        }).join('')}
        
        <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
    </div>
</body>
</html>`;
    }
});