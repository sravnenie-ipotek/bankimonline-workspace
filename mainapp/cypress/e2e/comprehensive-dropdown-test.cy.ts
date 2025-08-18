describe('Comprehensive Custom Dropdown Detection Test', () => {
    const dropdownMapping: any = {
        timestamp: new Date().toISOString(),
        processes: [],
        allDropdowns: [],
        summary: {
            totalProcesses: 0,
            totalPages: 0,
            totalDropdowns: 0,
            workingDropdowns: 0,
            emptyDropdowns: 0,
            dropdownsByType: {
                customDropdownMenu: 0,
                reactDropdownSelect: 0,
                nativeSelect: 0,
                unknown: 0
            }
        }
    };
    
    // Custom dropdown selectors based on actual component implementation
    const dropdownSelectors = {
        // Primary custom dropdown selectors from Dropdown.tsx component
        customDropdown: [
            '.dropdown',                          // Main dropdown container
            '[data-testid*="dropdown"]',         // Components with dropdown testid
            '.dropdown-wrapper',                  // Inner wrapper that's clickable
            '.dropdown-input',                    // The input that shows selected value
            '.dropdown-select',                   // The options container
            '.dropdown-select__item'              // Individual options
        ],
        // React-dropdown-select library
        reactDropdownSelect: [
            '.react-dropdown-select',
            '[class*="react-dropdown-select"]',
            '.react-dropdown-select-dropdown',
            '.react-dropdown-select-content'
        ],
        // Fallback selectors
        fallback: [
            '[role="combobox"]',
            '[role="listbox"]',
            '[aria-haspopup="listbox"]',
            'div[class*="select"]',
            'div[class*="dropdown"]'
        ]
    };
    
    before(() => {
        cy.viewport(1920, 1080);
    });
    
    const processes = [
        { name: 'Calculate Mortgage', path: '/calculate-mortgage', steps: 4 },
        { name: 'Calculate Credit', path: '/calculate-credit', steps: 3 },
        { name: 'Refinance Mortgage', path: '/refinance-mortgage', steps: 3 },
        { name: 'Refinance Credit', path: '/refinance-credit', steps: 3 }
    ];

    
    processes.forEach((process) => {
        it(`Maps all dropdowns in ${process.name}`, () => {
            const processResult: any = {
                name: process.name,
                path: process.path,
                steps: [],
                dropdowns: [],
                stats: {
                    total: 0,
                    working: 0,
                    empty: 0,
                    byType: {
                        customDropdownMenu: 0,
                        reactDropdownSelect: 0,
                        nativeSelect: 0,
                        unknown: 0
                    }
                }
            };
            
            // Intercept dropdown API calls
            cy.intercept('GET', '/api/dropdowns/**', (req) => {
                req.continue((res) => {
                    cy.log(`API Call: ${req.url} - Status: ${res.statusCode}`);
                });
            }).as('dropdownApi');
            
            cy.intercept('GET', '/api/v1/dropdowns/**', (req) => {
                req.continue((res) => {
                    cy.log(`API V1 Call: ${req.url} - Status: ${res.statusCode}`);
                });
            }).as('dropdownApiV1');
            
            cy.visit(process.path);
            cy.wait(3000); // Wait for initial load

            
            // Process each step
            for (let step = 1; step <= process.steps; step++) {
                cy.log(`📍 Processing Step ${step} of ${process.name}`);
                
                const stepResult: any = {
                    stepNumber: step,
                    dropdowns: []
                };
                
                // Method 1: Find custom dropdown components
                cy.get('body').then($body => {
                    // Look for custom dropdown components
                    const customDropdowns = $body.find('.dropdown').not('.dropdown-toggle');
                    cy.log(`Found ${customDropdowns.length} custom dropdown components`);
                    
                    customDropdowns.each((index, element) => {
                        const $el = Cypress.$(element);
                        const dropdownInfo: any = {
                            type: 'customDropdownMenu',
                            selector: '.dropdown',
                            index,
                            step,
                            testId: $el.attr('data-testid') || '',
                            className: $el.attr('class') || '',
                            hasWrapper: $el.find('.dropdown-wrapper').length > 0,
                            hasInput: $el.find('.dropdown-input').length > 0,
                            inputValue: $el.find('.dropdown-input').val() || '',
                            inputPlaceholder: $el.find('.dropdown-input').attr('placeholder') || '',
                            isOpen: $el.find('.dropdown-select').length > 0,
                            optionsCount: $el.find('.dropdown-select__item').length,
                            textContent: $el.text().trim().substring(0, 100),
                            isEmpty: false
                        };
                        
                        // Check if dropdown is empty
                        if (!dropdownInfo.inputValue && !dropdownInfo.optionsCount) {
                            dropdownInfo.isEmpty = true;
                            processResult.stats.empty++;
                        } else {
                            processResult.stats.working++;
                        }
                        
                        processResult.stats.total++;
                        processResult.stats.byType.customDropdownMenu++;
                        stepResult.dropdowns.push(dropdownInfo);
                        processResult.dropdowns.push(dropdownInfo);
                        dropdownMapping.allDropdowns.push({
                            ...dropdownInfo,
                            process: process.name,
                            path: process.path
                        });
                        
                        // Try to interact with dropdown to load options
                        if (dropdownInfo.hasWrapper && !dropdownInfo.isOpen) {
                            cy.wrap($el.find('.dropdown-wrapper')).click({ force: true });
                            cy.wait(500);
                            
                            // Check if options loaded
                            cy.wrap($el).then($dropdown => {
                                const optionsAfterClick = $dropdown.find('.dropdown-select__item').length;
                                if (optionsAfterClick > 0) {
                                    cy.log(`✅ Dropdown ${index} loaded ${optionsAfterClick} options after click`);
                                    dropdownInfo.optionsCount = optionsAfterClick;
                                    dropdownInfo.isEmpty = false;
                                    
                                    // Close dropdown
                                    cy.get('body').click(0, 0);
                                } else {
                                    cy.log(`⚠️ Dropdown ${index} has no options even after click`);
                                }
                            });
                        }
                    });
                });
                
                // Method 2: Find react-dropdown-select components
                cy.get('body').then($body => {
                    const reactSelects = $body.find('.react-dropdown-select');
                    cy.log(`Found ${reactSelects.length} react-dropdown-select components`);
                    
                    reactSelects.each((index, element) => {
                        const $el = Cypress.$(element);
                        const dropdownInfo: any = {
                            type: 'reactDropdownSelect',
                            selector: '.react-dropdown-select',
                            index,
                            step,
                            className: $el.attr('class') || '',
                            textContent: $el.text().trim().substring(0, 100),
                            hasContent: $el.text().trim().length > 0,
                            isEmpty: $el.text().trim().length === 0
                        };
                        
                        if (dropdownInfo.isEmpty) {
                            processResult.stats.empty++;
                        } else {
                            processResult.stats.working++;
                        }
                        
                        processResult.stats.total++;
                        processResult.stats.byType.reactDropdownSelect++;
                        stepResult.dropdowns.push(dropdownInfo);
                        processResult.dropdowns.push(dropdownInfo);
                        dropdownMapping.allDropdowns.push({
                            ...dropdownInfo,
                            process: process.name,
                            path: process.path
                        });
                    });
                });
                
                // Method 3: Find native select elements (as fallback)
                cy.get('body').then($body => {
                    const nativeSelects = $body.find('select');
                    if (nativeSelects.length > 0) {
                        cy.log(`Found ${nativeSelects.length} native select elements`);
                        
                        nativeSelects.each((index, element) => {
                            const $el = Cypress.$(element);
                            const dropdownInfo: any = {
                                type: 'nativeSelect',
                                selector: 'select',
                                index,
                                step,
                                name: $el.attr('name') || '',
                                id: $el.attr('id') || '',
                                optionsCount: $el.find('option').length,
                                selectedValue: $el.val() || '',
                                isEmpty: $el.find('option').length <= 1
                            };
                            
                            if (dropdownInfo.isEmpty) {
                                processResult.stats.empty++;
                            } else {
                                processResult.stats.working++;
                            }
                            
                            processResult.stats.total++;
                            processResult.stats.byType.nativeSelect++;
                            stepResult.dropdowns.push(dropdownInfo);
                            processResult.dropdowns.push(dropdownInfo);
                            dropdownMapping.allDropdowns.push({
                                ...dropdownInfo,
                                process: process.name,
                                path: process.path
                            });
                        });
                    }
                });
                
                processResult.steps.push(stepResult);
                
                // Try to navigate to next step
                if (step < process.steps) {
                    cy.get('button').then($buttons => {
                        const nextButton = Array.from($buttons).find(btn => 
                            /Continue|Next|המשך|הבא|Далее/i.test(btn.textContent || '')
                        );
                        
                        if (nextButton) {
                            cy.wrap(nextButton).click({ force: true });
                            cy.wait(2000);
                        } else {
                            cy.log(`⚠️ Could not find next button for step ${step}`);
                        }
                    });
                }
            }
            
            // Save process results
            processResult.summary = {
                totalDropdowns: processResult.stats.total,
                workingDropdowns: processResult.stats.working,
                emptyDropdowns: processResult.stats.empty,
                successRate: processResult.stats.total > 0 
                    ? ((processResult.stats.working / processResult.stats.total) * 100).toFixed(1)
                    : '0'
            };
            
            dropdownMapping.processes.push(processResult);
            dropdownMapping.summary.totalProcesses++;
            dropdownMapping.summary.totalDropdowns += processResult.stats.total;
            dropdownMapping.summary.workingDropdowns += processResult.stats.working;
            dropdownMapping.summary.emptyDropdowns += processResult.stats.empty;
            
            // Update type counts
            Object.keys(processResult.stats.byType).forEach(type => {
                dropdownMapping.summary.dropdownsByType[type] += processResult.stats.byType[type];
            });
        });
    });
    
    after(() => {
        // Calculate final statistics
        dropdownMapping.summary.successRate = dropdownMapping.summary.totalDropdowns > 0
            ? ((dropdownMapping.summary.workingDropdowns / dropdownMapping.summary.totalDropdowns) * 100).toFixed(1)
            : '0';
        
        // Save comprehensive mapping
        cy.writeFile('cypress/results/dropdown-mapping.json', dropdownMapping);
        
        // Generate detailed HTML report  
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>Comprehensive Dropdown Mapping Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 30px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        h1 { color: #333; margin: 0; font-size: 2.5rem; }
        .subtitle { color: #666; margin-top: 10px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
        .metric-value { font-size: 3rem; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .metric-label { color: #666; font-size: 0.9rem; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
        .process-card { background: white; padding: 25px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
        .process-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .process-name { font-size: 1.5rem; font-weight: bold; color: #333; }
        .process-stats { display: flex; gap: 30px; }
        .stat { text-align: center; }
        .stat-value { font-size: 1.8rem; font-weight: bold; color: #667eea; }
        .stat-label { color: #999; font-size: 0.8rem; text-transform: uppercase; }
        .dropdown-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .dropdown-item { display: grid; grid-template-columns: auto 1fr auto auto; gap: 15px; padding: 10px; border-bottom: 1px solid #e0e0e0; align-items: center; }
        .dropdown-type { padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
        .type-custom { background: #e3f2fd; color: #1976d2; }
        .type-react { background: #f3e5f5; color: #7b1fa2; }
        .type-native { background: #e8f5e9; color: #388e3c; }
        .dropdown-selector { font-family: monospace; color: #666; font-size: 0.9rem; }
        .status-badge { padding: 4px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: 600; }
        .status-working { background: #c8e6c9; color: #2e7d32; }
        .status-empty { background: #ffcdd2; color: #c62828; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 10px; overflow: hidden; }
        th { background: #f5f5f5; padding: 15px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #e0e0e0; }
        td { padding: 12px 15px; border-bottom: 1px solid #f0f0f0; }
        .success { color: #4caf50; font-weight: bold; }
        .warning { color: #ff9800; font-weight: bold; }
        .error { color: #f44336; font-weight: bold; }
        .chart { background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
        .chart-title { font-size: 1.3rem; font-weight: bold; color: #333; margin-bottom: 20px; }
        .progress-bar { width: 100%; height: 30px; background: #f0f0f0; border-radius: 15px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Comprehensive Dropdown Mapping Report</h1>
            <div class="subtitle">Complete analysis of all dropdown components across the application</div>
            <div class="subtitle">Generated: ${new Date().toLocaleString()}</div>
        </div>
        
        <div class="summary-grid">
            <div class="metric-card">
                <div class="metric-value">${dropdownMapping.summary.totalDropdowns}</div>
                <div class="metric-label">Total Dropdowns Found</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${dropdownMapping.summary.workingDropdowns}</div>
                <div class="metric-label">Working Dropdowns</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${dropdownMapping.summary.emptyDropdowns}</div>
                <div class="metric-label">Empty Dropdowns</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${dropdownMapping.summary.successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
        </div>
        
        <div class="chart">
            <div class="chart-title">Analysis Summary</div>
            <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <h3>Key Findings:</h3>
                <ul>
                    <li><strong>Dropdown Implementation:</strong> The application primarily uses custom React dropdown components</li>
                    <li><strong>Total Coverage:</strong> Tested ${dropdownMapping.summary.totalProcesses} processes</li>
                    <li><strong>Success Rate:</strong> ${dropdownMapping.summary.successRate}% of dropdowns are functioning correctly</li>
                </ul>
                
                <h3>Recommendations:</h3>
                <ul>
                    ${dropdownMapping.summary.emptyDropdowns > 0 ? '<li>🔴 <strong>Critical:</strong> ' + dropdownMapping.summary.emptyDropdowns + ' dropdowns are not displaying data and need immediate attention</li>' : ''}
                    <li>✅ <strong>Testing:</strong> Update all Cypress tests to use the identified selectors</li>
                    <li>📝 <strong>Documentation:</strong> Document the custom dropdown component patterns for future reference</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;
        
        cy.writeFile('cypress/results/dropdown-mapping-report.html', html);
        
        // Log summary to console
        console.log('\\n' + '='.repeat(80));
        console.log('📊 COMPREHENSIVE DROPDOWN MAPPING COMPLETE');
        console.log('='.repeat(80));
        console.log(`Total Dropdowns Found: ${dropdownMapping.summary.totalDropdowns}`);
        console.log(`Working: ${dropdownMapping.summary.workingDropdowns}`);
        console.log(`Empty: ${dropdownMapping.summary.emptyDropdowns}`);
        console.log(`Success Rate: ${dropdownMapping.summary.successRate}%`);
        console.log('\\n✅ Reports saved to:');
        console.log('  - cypress/results/dropdown-mapping.json');
        console.log('  - cypress/results/dropdown-mapping-report.html');
    });
});
