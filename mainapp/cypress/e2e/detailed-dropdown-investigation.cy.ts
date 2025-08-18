describe('Detailed Dropdown Investigation', () => {
    const processes = [
        { name: 'Calculate Mortgage', path: '/calculate-mortgage', steps: ['step1', 'step2', 'step3', 'step4'] },
        { name: 'Calculate Credit', path: '/calculate-credit', steps: ['step1', 'step2', 'step3'] },
        { name: 'Refinance Mortgage', path: '/refinance-mortgage', steps: ['step1', 'step2', 'step3'] },
        { name: 'Refinance Credit', path: '/refinance-credit', steps: ['step1', 'step2', 'step3'] }
    ];
    
    const apiResults: any[] = [];
    const dropdownResults: any[] = [];
    
    beforeEach(() => {
        cy.viewport(1920, 1080);
        
        // Intercept all dropdown API calls
        cy.intercept('GET', '/api/dropdowns/**', (req) => {
            req.continue((res) => {
                const url = req.url;
                const screen = url.split('/').slice(-2, -1)[0];
                const lang = url.split('/').pop();
                
                apiResults.push({
                    url,
                    screen,
                    lang,
                    statusCode: res.statusCode,
                    hasBody: !!res.body,
                    bodyKeys: res.body ? Object.keys(res.body) : [],
                    options: res.body?.options || {},
                    optionCount: res.body?.options ? Object.keys(res.body.options).length : 0
                });
                
                console.log('API Response:', {
                    url,
                    optionCount: res.body?.options ? Object.keys(res.body.options).length : 0,
                    sampleOptions: res.body?.options ? Object.keys(res.body.options).slice(0, 3) : []
                });
            });
        }).as('dropdownApi');
        
        // Also intercept calculation parameters
        cy.intercept('GET', '/api/v1/calculation-parameters*').as('calcParams');
    });
    
    processes.forEach((process) => {
        it(`Investigates ${process.name} dropdowns in detail`, () => {
            cy.visit(process.path);
            cy.wait(2000); // Wait for initial load
            
            const processResults: any = {
                process: process.name,
                path: process.path,
                steps: []
            };
            
            process.steps.forEach((step, stepIndex) => {
                const stepResults: any = {
                    step: step,
                    dropdowns: [],
                    apiCalls: []
                };
                
                // Wait for any API calls to complete
                cy.wait(1000);
                
                // Find all select elements (dropdowns)
                cy.get('select').then($selects => {
                    const dropdownCount = $selects.length;
                    console.log(`Step ${stepIndex + 1}: Found ${dropdownCount} select elements`);
                    
                    $selects.each((index, select) => {
                        const $select = Cypress.$(select);
                        const id = $select.attr('id') || '';
                        const name = $select.attr('name') || '';
                        const className = $select.attr('class') || '';
                        const options = $select.find('option');
                        const optionCount = options.length;
                        const hasRealOptions = options.filter((i, opt) => {
                            const value = Cypress.$(opt).val();
                            const text = Cypress.$(opt).text();
                            return value !== '' && value !== undefined && 
                                   text !== '' && text !== 'Select' && 
                                   !text.includes('בחר') && !text.includes('Choose');
                        }).length;
                        
                        const dropdownInfo = {
                            index,
                            id,
                            name,
                            className,
                            totalOptions: optionCount,
                            realOptions: hasRealOptions,
                            isEmpty: hasRealOptions === 0,
                            options: options.toArray().map(opt => ({
                                value: Cypress.$(opt).val(),
                                text: Cypress.$(opt).text()
                            })).slice(0, 5) // First 5 options for debugging
                        };
                        
                        stepResults.dropdowns.push(dropdownInfo);
                        
                        if (dropdownInfo.isEmpty) {
                            console.log(`❌ Empty dropdown: ${id || name || 'unknown'}`);
                            console.log('   Options:', dropdownInfo.options);
                        }
                    });
                });
                
                // Also check for any MUI or custom dropdowns
                cy.get('[role="combobox"], [role="listbox"], .MuiSelect-root, .custom-dropdown').then($customs => {
                    if ($customs.length > 0) {
                        console.log(`Found ${$customs.length} custom dropdowns`);
                        stepResults.customDropdowns = $customs.length;
                    }
                });
                
                processResults.steps.push(stepResults);
                
                // Navigate to next step if not the last one
                if (stepIndex < process.steps.length - 1) {
                    cy.get('button').contains(/Continue|Next|המשך|הבא/i).first().click({ force: true });
                    cy.wait(2000);
                }
            });
            
            dropdownResults.push(processResults);
        });
    });
    
    after(() => {
        // Save detailed results
        const detailedAnalysis = {
            timestamp: new Date().toISOString(),
            apiCalls: apiResults,
            dropdownResults: dropdownResults,
            summary: {
                totalProcesses: dropdownResults.length,
                totalApiCalls: apiResults.length,
                apiCallsByScreen: apiResults.reduce((acc, call) => {
                    acc[call.screen] = (acc[call.screen] || 0) + 1;
                    return acc;
                }, {} as any),
                emptyDropdownsByProcess: dropdownResults.map(p => ({
                    process: p.process,
                    emptyCount: p.steps.reduce((sum: number, s: any) => 
                        sum + s.dropdowns.filter((d: any) => d.isEmpty).length, 0)
                }))
            }
        };
        
        cy.writeFile('cypress/results/detailed-investigation.json', detailedAnalysis);
        
        // Generate investigation report
        const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Dropdown Investigation Report</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .header { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .process { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .step { margin-left: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; margin-bottom: 10px; }
        .dropdown { margin-left: 40px; padding: 10px; background: white; border-left: 3px solid #ddd; margin-bottom: 5px; }
        .empty { border-left-color: #ff4444; background: #fff5f5; }
        .filled { border-left-color: #44ff44; }
        .api-call { padding: 10px; background: #e3f2fd; border-radius: 5px; margin: 10px 0; }
        h1 { color: #333; }
        h2 { color: #666; }
        h3 { color: #999; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .metric { background: white; padding: 15px; border-radius: 10px; text-align: center; }
        .metric-value { font-size: 2rem; font-weight: bold; color: #667eea; }
        .metric-label { color: #999; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Dropdown Investigation Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${dropdownResults.length}</div>
                <div class="metric-label">Processes Tested</div>
            </div>
            <div class="metric">
                <div class="metric-value">${apiResults.length}</div>
                <div class="metric-label">API Calls Made</div>
            </div>
            <div class="metric">
                <div class="metric-value">${dropdownResults.reduce((sum, p) => 
                    sum + p.steps.reduce((s: number, step: any) => 
                        s + step.dropdowns.length, 0), 0)}</div>
                <div class="metric-label">Total Dropdowns</div>
            </div>
            <div class="metric">
                <div class="metric-value">${dropdownResults.reduce((sum, p) => 
                    sum + p.steps.reduce((s: number, step: any) => 
                        s + step.dropdowns.filter((d: any) => d.isEmpty).length, 0), 0)}</div>
                <div class="metric-label">Empty Dropdowns</div>
            </div>
        </div>
    </div>
    
    ${dropdownResults.map((process: any) => `
        <div class="process">
            <h2>${process.process}</h2>
            <p>Path: ${process.path}</p>
            
            ${process.steps.map((step: any, idx: number) => `
                <div class="step">
                    <h3>Step ${idx + 1}: ${step.step}</h3>
                    <p>Dropdowns found: ${step.dropdowns.length}</p>
                    <p>Empty dropdowns: ${step.dropdowns.filter((d: any) => d.isEmpty).length}</p>
                    
                    ${step.dropdowns.filter((d: any) => d.isEmpty).map((dropdown: any) => `
                        <div class="dropdown empty">
                            <strong>Empty Dropdown:</strong> 
                            ID: ${dropdown.id || 'none'} | 
                            Name: ${dropdown.name || 'none'} | 
                            Options: ${dropdown.totalOptions} (${dropdown.realOptions} real)
                            <br>
                            Sample: ${JSON.stringify(dropdown.options.slice(0, 2))}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `).join('')}
    
    <div class="process">
        <h2>API Calls Summary</h2>
        ${Object.entries(detailedAnalysis.summary.apiCallsByScreen).map(([screen, count]) => `
            <div class="api-call">
                Screen: <strong>${screen}</strong> - ${count} calls
            </div>
        `).join('')}
    </div>
</body>
</html>`;
        
        cy.writeFile('cypress/results/investigation-report.html', reportHtml);
        console.log('Investigation complete! Check cypress/results/ for detailed reports');
    });
});