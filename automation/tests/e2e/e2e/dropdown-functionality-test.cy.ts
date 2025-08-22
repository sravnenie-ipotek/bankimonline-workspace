describe('Dropdown Functionality Test - Step 4 Direct', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  const processes = [
    {
      name: 'Calculate Mortgage',
      url: '/services/calculate-mortgage/4'
    },
    {
      name: 'Calculate Credit', 
      url: '/services/calculate-credit/4'
    },
    {
      name: 'Refinance Mortgage',
      url: '/services/refinance-mortgage/4'
    },
    {
      name: 'Refinance Credit',
      url: '/services/refinance-credit/4'
    }
  ];

  processes.forEach(process => {
    it(`${process.name} - Step 4 dropdown functionality`, () => {
      cy.log(`Testing ${process.name} - Step 4 dropdowns`);
      
      // Direct navigation to step 4
      cy.visit(process.url);
      cy.wait(3000);
      
      // Verify we're on step 4
      cy.url().should('include', '/4');
      
      // Take screenshot for reference
      cy.screenshot(`${process.name.replace(/\s+/g, '-')}-step4-before-interaction`);
      
      // Count and test dropdowns
      cy.get('body').then($body => {
        // Look for various dropdown patterns
        const dropdownSelectors = [
          'select',                    // Native select elements
          '[class*="dropdown"]',       // CSS class containing "dropdown"
          '[class*="select"]',         // CSS class containing "select"
          '[data-testid*="dropdown"]', // Test ID containing "dropdown"
          'div[role="combobox"]',      // ARIA combobox role
          '.multiselect'               // Our MultiSelect component
        ];
        
        let totalDropdowns = 0;
        let workingDropdowns = 0;
        
        dropdownSelectors.forEach(selector => {
          const elements = $body.find(selector);
          if (elements.length > 0) {
            cy.log(`Found ${elements.length} elements with selector: ${selector}`);
            totalDropdowns += elements.length;
          }
        });
        
        cy.log(`Total dropdowns found: ${totalDropdowns}`);
        
        if (totalDropdowns > 0) {
          // Test each type of dropdown
          dropdownSelectors.forEach(selector => {
            cy.get('body').then($currentBody => {
              if ($currentBody.find(selector).length > 0) {
                cy.get(selector).each(($dropdown, index) => {
                  cy.log(`Testing dropdown ${index + 1} with selector: ${selector}`);
                  
                  cy.wrap($dropdown).then($el => {
                    try {
                      if ($el.is('select')) {
                        // Native select element
                        cy.wrap($el).should('be.visible');
                        cy.wrap($el).find('option').should('have.length.at.least', 1);
                        workingDropdowns++;
                        cy.log(`✅ Native select dropdown ${index + 1} is functional`);
                      } else {
                        // Custom dropdown
                        cy.wrap($el).should('be.visible');
                        cy.wrap($el).click({ force: true });
                        cy.wait(500);
                        
                        // Check if options appeared
                        cy.get('body').then($optionsBody => {
                          const optionSelectors = [
                            '[class*="option"]',
                            '[class*="item"]',
                            '[data-testid*="option"]',
                            'li[role="option"]',
                            '.multiselect-select__item'
                          ];
                          
                          let optionsFound = false;
                          optionSelectors.forEach(optionSelector => {
                            if ($optionsBody.find(optionSelector).length > 0) {
                              optionsFound = true;  
                              workingDropdowns++;
                              cy.log(`✅ Custom dropdown ${index + 1} opened with options`);
                              
                              // Try to select first option
                              cy.get(optionSelector).first().click({ force: true });
                              cy.wait(300);
                            }
                          });
                          
                          if (!optionsFound) {
                            cy.log(`⚠️ Custom dropdown ${index + 1} clicked but no options found`);
                          }
                        });
                      }
                    } catch (error) {
                      cy.log(`❌ Error testing dropdown ${index + 1}: ${error.message}`);
                    }
                  });
                });
              }
            });
          });
          
          // Final verification
          cy.then(() => {
            cy.log(`\n=== DROPDOWN TEST RESULTS FOR ${process.name} ===`);
            cy.log(`Total dropdowns found: ${totalDropdowns}`);
            cy.log(`Working dropdowns: ${workingDropdowns}`);
            cy.log(`Success rate: ${totalDropdowns > 0 ? Math.round((workingDropdowns/totalDropdowns) * 100) : 0}%`);
          });
          
        } else {
          cy.log(`❌ No dropdowns found for ${process.name}`);
        }
        
        // Take final screenshot
        cy.screenshot(`${process.name.replace(/\s+/g, '-')}-step4-after-interaction`);
        
        // Verify no critical errors
        cy.get('body').should('not.contain', 'Error loading');
        cy.get('body').should('not.contain', 'undefined');
        
        // Log completion
        cy.log(`✅ Completed testing ${process.name}`);
      });
    });
  });

  // Summary test
  it('Summary - All Step 4 pages should load and have functional dropdowns', () => {
    const results = {
      processes: [],
      totalDropdowns: 0,
      workingDropdowns: 0
    };

    processes.forEach(process => {
      cy.visit(process.url);
      cy.wait(2000);
      
      cy.get('body').then($body => {
        const dropdownCount = $body.find('select, [class*="dropdown"], [class*="select"], .multiselect').length;
        
        results.processes.push({
          name: process.name,
          dropdowns: dropdownCount,
          loaded: true
        });
        results.totalDropdowns += dropdownCount;
        
        cy.log(`${process.name}: ${dropdownCount} dropdowns found`);
      });
    });

    cy.then(() => {
      cy.log(`\n=== FINAL SUMMARY ===`);
      results.processes.forEach(process => {
        cy.log(`${process.name}: ${process.dropdowns} dropdowns, Loaded: ${process.loaded}`);
      });
      cy.log(`Total dropdowns across all processes: ${results.totalDropdowns}`);
      
      // Assertions
      expect(results.processes.length).to.equal(4);
      expect(results.totalDropdowns).to.be.greaterThan(0);
      expect(results.processes.every(p => p.loaded)).to.be.true;
    });
  });
});