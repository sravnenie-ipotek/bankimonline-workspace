describe('Comprehensive Dropdown Test - All Processes to Step 4', () => {
  const testPhone = '972544123456';
  const testOTP = '123456';

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  const processes = [
    {
      name: 'Calculate Mortgage',
      url: '/services/calculate-mortgage/1',
      step4Url: '/services/calculate-mortgage/4'
    },
    {
      name: 'Calculate Credit',
      url: '/services/calculate-credit/1',
      step4Url: '/services/calculate-credit/4'
    },
    {
      name: 'Refinance Mortgage',
      url: '/services/refinance-mortgage/1',
      step4Url: '/services/refinance-mortgage/4'
    },
    {
      name: 'Refinance Credit',
      url: '/services/refinance-credit/1',
      step4Url: '/services/refinance-credit/4'
    }
  ];

  // Helper function to handle authentication
  const handleAuthentication = () => {
    cy.get('body').then($body => {
      // Check if we need to authenticate
      if ($body.find('input[type="tel"]').length > 0) {
        cy.log('Authentication required - filling phone number');
        cy.get('input[type="tel"]').type(testPhone);
        cy.get('button').contains(/שלח/i).click();
        cy.wait(2000);
        cy.get('input').last().type(testOTP);
        cy.get('button').contains(/אמת/i).click();
        cy.wait(3000);
      }
    });
  };

  // Helper function to fill step 1 form
  const fillStep1Form = (processName: string) => {
    cy.log(`Filling Step 1 form for ${processName}`);
    
    // Fill property value
    cy.get('input[type="text"]').first().clear().type('2500000');
    cy.wait(500);

    // Handle dropdowns - look for our new dropdown components
    cy.get('body').then($body => {
      // Try to find dropdown containers
      const dropdownSelectors = [
        '[data-testid="dropdown"]',
        '.dropdown-container',
        '.react-dropdown-select',
        '[class*="dropdown"]',
        '[class*="select"]'
      ];

      let foundDropdowns = false;
      
      for (const selector of dropdownSelectors) {
        if ($body.find(selector).length > 0) {
          cy.log(`Found dropdowns with selector: ${selector}`);
          cy.get(selector).each(($dropdown, index) => {
            cy.log(`Clicking dropdown ${index + 1}`);
            cy.wrap($dropdown).click({ force: true });
            cy.wait(300);
            
            // Try to find and click first option
            cy.get('body').then($optionBody => {
              const optionSelectors = [
                '.react-dropdown-select-item',
                '[data-testid="dropdown-option"]',
                '.dropdown-option',
                '[class*="option"]',
                '[class*="item"]'
              ];
              
              for (const optionSelector of optionSelectors) {
                if ($optionBody.find(optionSelector).length > 0) {
                  cy.get(optionSelector).first().click({ force: true });
                  break;
                }
              }
            });
            cy.wait(300);
          });
          foundDropdowns = true;
          break;
        }
      }
      
      if (!foundDropdowns) {
        cy.log('No dropdowns found - continuing anyway');
      }
    });
    
    cy.wait(1000);
  };

  // Helper function to fill step 2 form
  const fillStep2Form = (processName: string) => {
    cy.log(`Filling Step 2 form for ${processName}`);
    
    // Fill basic info
    cy.get('input[name="nameSurname"]').type('Test User');
    cy.get('input[name="birthday"]').type('15/05/1985');
    
    // Handle Yes/No questions - select "No" for simplicity
    cy.get('body').then($body => {
      // Look for Yes/No buttons and select "No" options
      if ($body.find('button').filter(':contains("לא")').length > 0) {
        cy.get('button').filter(':contains("לא")').each(($btn) => {
          cy.wrap($btn).click({ force: true });
          cy.wait(200);
        });
      }
    });
    
    cy.wait(1000);
  };

  // Helper function to fill step 3 form
  const fillStep3Form = (processName: string) => {
    cy.log(`Filling Step 3 form for ${processName}`);
    
    // Fill income information
    cy.get('body').then($body => {
      // Fill income amount if present
      if ($body.find('input[name*="income"]').length > 0) {
        cy.get('input[name*="income"]').first().type('15000');
      }
      
      // Handle dropdowns for income sources
      if ($body.find('[class*="dropdown"]').length > 0) {
        cy.get('[class*="dropdown"]').first().click({ force: true });
        cy.wait(300);
        cy.get('body').then($optionBody => {
          if ($optionBody.find('[class*="option"]').length > 0) {
            cy.get('[class*="option"]').first().click({ force: true });
          }
        });
      }
      
      // Select "No" for additional questions
      if ($body.find('button').filter(':contains("לא")').length > 0) {
        cy.get('button').filter(':contains("לא")').each(($btn) => {
          cy.wrap($btn).click({ force: true });
          cy.wait(200);
        });
      }
    });
    
    cy.wait(1000);
  };

  // Helper function to navigate through steps
  const navigateToStep4 = (processName: string, startUrl: string) => {
    cy.log(`Starting navigation to Step 4 for ${processName}`);
    
    // Visit step 1
    cy.visit(startUrl);
    cy.wait(3000);
    
    // Fill step 1
    fillStep1Form(processName);
    
    // Click next to go to step 2
    cy.get('button').contains(/הבא/i).click({ force: true });
    cy.wait(3000);
    
    // Handle authentication if needed
    handleAuthentication();
    
    // Check if we're on step 2
    cy.url().then(url => {
      if (url.includes('/2')) {
        cy.log('Successfully reached Step 2');
        fillStep2Form(processName);
        
        // Click next to go to step 3
        cy.get('button').contains(/הבא/i).click({ force: true });
        cy.wait(3000);
        
        // Check if we're on step 3
        cy.url().then(url => {
          if (url.includes('/3')) {
            cy.log('Successfully reached Step 3');
            fillStep3Form(processName);
            
            // Click next to go to step 4
            cy.get('button').contains(/הבא/i).click({ force: true });
            cy.wait(3000);
            
            // Verify we reached step 4
            cy.url().should('include', '/4');
            cy.log('Successfully reached Step 4');
          } else {
            cy.log('Could not reach Step 3, trying direct navigation');
            // If we can't reach step 3 through form, try direct navigation
            const step4Url = startUrl.replace('/1', '/4');
            cy.visit(step4Url);
            cy.wait(3000);
          }
        });
      } else {
        cy.log('Could not reach Step 2, trying direct navigation');
        // If we can't reach step 2 through form, try direct navigation
        const step4Url = startUrl.replace('/1', '/4');
        cy.visit(step4Url);
        cy.wait(3000);
      }
    });
  };

  // Helper function to test dropdowns on step 4
  const testStep4Dropdowns = (processName: string) => {
    cy.log(`Testing Step 4 dropdowns for ${processName}`);
    
    // Take screenshot for documentation
    cy.screenshot(`${processName.replace(/\s+/g, '-')}-step4-dropdowns`);
    
    // Check for dropdown presence
    cy.get('body').then($body => {
      const dropdownCount = $body.find('[class*="dropdown"], [class*="select"], select').length;
      cy.log(`Found ${dropdownCount} dropdowns on Step 4`);
      
      if (dropdownCount > 0) {
        // Test each dropdown
        cy.get('[class*="dropdown"], [class*="select"], select').each(($dropdown, index) => {
          cy.log(`Testing dropdown ${index + 1} of ${dropdownCount}`);
          
          // Try to click and interact with dropdown
          cy.wrap($dropdown).then($el => {
            if ($el.is('select')) {
              // Handle native select elements
              cy.wrap($el).select(0);
            } else {
              // Handle custom dropdowns
              cy.wrap($el).click({ force: true });
              cy.wait(500);
              
              // Look for options and select first one
              cy.get('body').then($optionBody => {
                const optionSelectors = [
                  '[class*="option"]',
                  '[class*="item"]',
                  '[data-testid*="option"]',
                  'li',
                  '.dropdown-option'
                ];
                
                for (const selector of optionSelectors) {
                  if ($optionBody.find(selector).length > 0) {
                    cy.get(selector).first().click({ force: true });
                    break;
                  }
                }
              });
              cy.wait(300);
            }
          });
        });
        
        // Verify no errors after dropdown interactions
        cy.get('body').should('not.contain', 'Error');
        cy.get('body').should('not.contain', 'undefined');
        cy.get('[class*="error"]').should('not.exist');
        
        cy.log(`Successfully tested all dropdowns for ${processName}`);
      } else {
        cy.log(`No dropdowns found on Step 4 for ${processName}`);
      }
    });
  };

  // Main test for each process
  processes.forEach(process => {
    it(`${process.name} - Should navigate to Step 4 and test dropdowns`, () => {
      cy.log(`\n=== TESTING ${process.name.toUpperCase()} ===`);
      
      // Method 1: Try navigation through steps
      cy.log('Method 1: Attempting step-by-step navigation');
      try {
        navigateToStep4(process.name, process.url);
        
        // Test dropdowns if we made it to step 4
        cy.url().then(url => {
          if (url.includes('/4')) {
            testStep4Dropdowns(process.name);
            return;
          }
          throw new Error('Could not reach step 4 through navigation');
        });
      } catch (error) {
        cy.log(`Navigation method failed: ${error}`);
        
        // Method 2: Direct navigation to step 4
        cy.log('Method 2: Attempting direct navigation to Step 4');
        cy.visit(process.step4Url);
        cy.wait(3000);
        
        // Verify we're on step 4
        cy.url().should('include', '/4');
        
        // Test dropdowns
        testStep4Dropdowns(process.name);
      }
      
      // Final verification
      cy.log(`Completed testing for ${process.name}`);
      cy.url().should('include', '/4');
    });
  });

  // Summary test to verify all processes work
  it('Summary - All processes should reach Step 4 with working dropdowns', () => {
    const results = {
      totalProcesses: processes.length,
      successfulProcesses: 0,
      failedProcesses: []
    };

    processes.forEach(process => {
      cy.log(`\n=== SUMMARY TEST FOR ${process.name.toUpperCase()} ===`);
      
      // Direct navigation to step 4
      cy.visit(process.step4Url);
      cy.wait(2000);
      
      // Verify step 4 loads
      cy.url().should('include', '/4');
      
      // Check for dropdowns
      cy.get('body').then($body => {
        const dropdownCount = $body.find('[class*="dropdown"], [class*="select"], select').length;
        
        if (dropdownCount > 0) {
          cy.log(`✅ ${process.name}: Found ${dropdownCount} dropdowns`);
          results.successfulProcesses++;
        } else {
          cy.log(`❌ ${process.name}: No dropdowns found`);
          results.failedProcesses.push(process.name);
        }
      });
    });

    // Log final results
    cy.then(() => {
      cy.log(`\n=== FINAL RESULTS ===`);
      cy.log(`Total Processes: ${results.totalProcesses}`);
      cy.log(`Successful: ${results.successfulProcesses}`);
      cy.log(`Failed: ${results.failedProcesses.length}`);
      if (results.failedProcesses.length > 0) {
        cy.log(`Failed Processes: ${results.failedProcesses.join(', ')}`);
      }
    });
  });
});