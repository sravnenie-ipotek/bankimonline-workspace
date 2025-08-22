describe('Find ALL Dropdown Issues - Complete Analysis', () => {
  const dropdownIssues = [];
  
  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  // Test all steps of all processes
  const testScenarios = [
    // Step 1 - Initial form
    { process: 'Calculate Mortgage', step: 1, url: '/services/calculate-mortgage/1' },
    { process: 'Calculate Credit', step: 1, url: '/services/calculate-credit/1' },
    { process: 'Refinance Mortgage', step: 1, url: '/services/refinance-mortgage/1' },
    { process: 'Refinance Credit', step: 1, url: '/services/refinance-credit/1' },
    
    // Step 2 - Personal details (citizenship dropdown here)
    { process: 'Calculate Mortgage', step: 2, url: '/services/calculate-mortgage/2' },
    { process: 'Calculate Credit', step: 2, url: '/services/calculate-credit/2' },
    { process: 'Refinance Mortgage', step: 2, url: '/services/refinance-mortgage/2' },
    { process: 'Refinance Credit', step: 2, url: '/services/refinance-credit/2' },
    
    // Step 3 - Income details
    { process: 'Calculate Mortgage', step: 3, url: '/services/calculate-mortgage/3' },
    { process: 'Calculate Credit', step: 3, url: '/services/calculate-credit/3' },
    { process: 'Refinance Mortgage', step: 3, url: '/services/refinance-mortgage/3' },
    { process: 'Refinance Credit', step: 3, url: '/services/refinance-credit/3' },
  ];

  testScenarios.forEach(scenario => {
    it(`${scenario.process} Step ${scenario.step} - Dropdown Analysis`, () => {
      cy.log(`\n=== ANALYZING ${scenario.process} STEP ${scenario.step} ===`);
      
      // Visit the page
      cy.visit(scenario.url);
      cy.wait(2000);
      
      // Take screenshot for reference
      cy.screenshot(`${scenario.process.replace(/\s+/g, '-')}-step${scenario.step}-analysis`);
      
      // Comprehensive dropdown detection
      cy.get('body').then($body => {
        const dropdownSelectors = [
          'select',                           // Native select
          '[class*="dropdown"]',              // Any class containing "dropdown"
          '[class*="select"]',                // Any class containing "select"  
          '[class*="multiselect"]',           // MultiSelect components
          '.react-dropdown-select',           // React dropdown select
          '[data-testid*="dropdown"]',        // Test ID dropdowns
          'div[role="combobox"]',            // ARIA combobox
          'div[role="listbox"]',             // ARIA listbox
          '.MuiSelect-root',                 // Material UI selects
          '.ant-select',                     // Ant Design selects
          '[class*="Select"]',               // Capitalized Select classes
        ];
        
        let totalDropdowns = 0;
        let emptyDropdowns = 0;
        let errorDropdowns = 0;
        let workingDropdowns = 0;
        
        const pageIssues = [];
        
        dropdownSelectors.forEach(selector => {
          const elements = $body.find(selector);
          if (elements.length > 0) {
            cy.log(`Found ${elements.length} elements with selector: ${selector}`);
            totalDropdowns += elements.length;
            
            // Test each dropdown
            cy.get(selector).each(($dropdown, index) => {
              const dropdownId = `${scenario.process}-Step${scenario.step}-${selector}-${index}`;
              
              cy.wrap($dropdown).then($el => {
                try {
                  // Check if dropdown is visible
                  if (!$el.is(':visible')) {
                    pageIssues.push({
                      id: dropdownId,
                      issue: 'Not visible',
                      element: selector,
                      position: index
                    });
                    return;
                  }
                  
                  if ($el.is('select')) {
                    // Native select testing
                    const optionCount = $el.find('option').length;
                    cy.log(`Native select has ${optionCount} options`);
                    
                    if (optionCount <= 1) {
                      emptyDropdowns++;
                      pageIssues.push({
                        id: dropdownId,
                        issue: 'No options or only placeholder',
                        element: selector,
                        position: index,
                        optionCount: optionCount
                      });
                    } else {
                      workingDropdowns++;
                    }
                  } else {
                    // Custom dropdown testing
                    cy.wrap($el).click({ force: true });
                    cy.wait(300);
                    
                    // Look for opened dropdown options
                    cy.get('body').then($bodyAfterClick => {
                      const optionSelectors = [
                        '[class*="option"]',
                        '[class*="item"]',
                        'li[role="option"]',
                        '.react-dropdown-select-item',
                        '.multiselect-select__item',
                        '[data-testid*="option"]'
                      ];
                      
                      let optionsFound = false;
                      let optionCount = 0;
                      
                      optionSelectors.forEach(optionSelector => {
                        const options = $bodyAfterClick.find(optionSelector + ':visible');
                        if (options.length > 0) {
                          optionsFound = true;
                          optionCount = options.length;
                          cy.log(`Custom dropdown opened with ${optionCount} options`);
                        }
                      });
                      
                      if (!optionsFound) {
                        emptyDropdowns++;
                        pageIssues.push({
                          id: dropdownId,
                          issue: 'Custom dropdown opens but no options visible',
                          element: selector,
                          position: index
                        });
                      } else if (optionCount === 0) {
                        emptyDropdowns++;
                        pageIssues.push({
                          id: dropdownId,
                          issue: 'Dropdown opens but 0 options found',
                          element: selector,
                          position: index
                        });
                      } else {
                        workingDropdowns++;
                        
                        // Try to click first option to test functionality
                        optionSelectors.forEach(optionSelector => {
                          const options = $bodyAfterClick.find(optionSelector + ':visible');
                          if (options.length > 0) {
                            cy.get(optionSelector + ':visible').first().click({ force: true });
                            cy.wait(200);
                            return false; // Break out of forEach
                          }
                        });
                      }
                    });
                  }
                } catch (error) {
                  errorDropdowns++;
                  pageIssues.push({
                    id: dropdownId,
                    issue: `Error testing dropdown: ${error.message}`,
                    element: selector,
                    position: index
                  });
                }
              });
            });
          }
        });
        
        // Log results for this page
        cy.then(() => {
          cy.log(`\n=== RESULTS FOR ${scenario.process} STEP ${scenario.step} ===`);
          cy.log(`Total dropdowns: ${totalDropdowns}`);
          cy.log(`Working dropdowns: ${workingDropdowns}`);
          cy.log(`Empty dropdowns: ${emptyDropdowns}`);
          cy.log(`Error dropdowns: ${errorDropdowns}`);
          cy.log(`Issues found: ${pageIssues.length}`);
          
          if (pageIssues.length > 0) {
            cy.log(`\n--- ISSUES DETECTED ---`);
            pageIssues.forEach(issue => {
              cy.log(`❌ ${issue.id}: ${issue.issue}`);
            });
          }
          
          // Store issues globally
          if (pageIssues.length > 0) {
            pageIssues.forEach(issue => {
              issue.page = `${scenario.process} Step ${scenario.step}`;
              issue.url = scenario.url;
            });
            dropdownIssues.push(...pageIssues);
          }
        });
      });
    });
  });

  // Final summary test
  it('FINAL SUMMARY - All Dropdown Issues Found', () => {
    cy.then(() => {
      cy.log(`\n\n=== COMPREHENSIVE DROPDOWN ANALYSIS COMPLETE ===`);
      cy.log(`Total pages analyzed: ${testScenarios.length}`);
      cy.log(`Total issues found: ${dropdownIssues.length}`);
      
      if (dropdownIssues.length > 0) {
        cy.log(`\n=== ALL DROPDOWN ISSUES SUMMARY ===`);
        
        // Group issues by type
        const issuesByType = {};
        const issuesByPage = {};
        
        dropdownIssues.forEach(issue => {
          // By type
          if (!issuesByType[issue.issue]) {
            issuesByType[issue.issue] = [];
          }
          issuesByType[issue.issue].push(issue);
          
          // By page
          if (!issuesByPage[issue.page]) {
            issuesByPage[issue.page] = [];
          }
          issuesByPage[issue.page].push(issue);
        });
        
        cy.log(`\n--- ISSUES BY TYPE ---`);
        Object.keys(issuesByType).forEach(issueType => {
          cy.log(`${issueType}: ${issuesByType[issueType].length} occurrences`);
          issuesByType[issueType].forEach(issue => {
            cy.log(`  - ${issue.page}: ${issue.element}[${issue.position}]`);
          });
        });
        
        cy.log(`\n--- ISSUES BY PAGE ---`);
        Object.keys(issuesByPage).forEach(page => {
          cy.log(`${page}: ${issuesByPage[page].length} issues`);
          issuesByPage[page].forEach(issue => {
            cy.log(`  - ${issue.issue} (${issue.element}[${issue.position}])`);
          });
        });
        
      } else {
        cy.log(`\n🎉 NO DROPDOWN ISSUES FOUND! All dropdowns are working correctly.`);
      }
    });
  });
});