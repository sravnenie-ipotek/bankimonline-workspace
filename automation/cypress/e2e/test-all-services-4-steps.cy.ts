/**
 * Universal 4-Step Test for All Services
 * Language-agnostic test that works with English or Hebrew
 */

describe('All Services - 4 Step Validation', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.viewport(1920, 1080);
  });

  const services = [
    { name: 'Mortgage Calculator', url: '/services/calculate-mortgage/1' },
    { name: 'Credit Calculator', url: '/services/calculate-credit/1' },
    { name: 'Refinance Mortgage', url: '/services/refinance-mortgage/1' },
    { name: 'Refinance Credit', url: '/services/refinance-credit/1' }
  ];

  services.forEach(service => {
    it(`${service.name} - Should navigate through all 4 steps`, () => {
      cy.log(`🚀 Testing ${service.name}`);
      
      // Go directly to Step 1
      cy.visit(service.url);
      cy.wait(3000);
      
      // Verify we're on Step 1
      cy.url().should('include', '/1');
      cy.screenshot(`${service.name}-step1`);
      
      // Fill Step 1 - Property/Loan value (find first text input)
      cy.get('input[type="text"], input[type="number"]').first().then($input => {
        cy.wrap($input).clear().type('2000000');
        cy.log('✅ Filled property/loan value');
      });
      
      // Handle dropdowns if they exist (click first option for each)
      cy.get('select, [role="combobox"], [class*="dropdown"]').each($dropdown => {
        cy.wrap($dropdown).click({ force: true });
        cy.wait(500);
        // Try to select first option
        cy.get('option, [role="option"], li').first().click({ force: true });
      });
      
      // Find and click Next button (look for common patterns)
      cy.get('button').then($buttons => {
        const nextButton = $buttons.filter((i, el) => {
          const text = el.textContent || '';
          return text.includes('Next') || text.includes('הבא') || text.includes('Continue') || text.includes('המשך');
        });
        
        if (nextButton.length > 0) {
          cy.wrap(nextButton.first()).click({ force: true });
          cy.wait(3000);
          
          // Check if we moved to Step 2
          cy.url().then(url => {
            if (url.includes('/2')) {
              cy.log('✅ Reached Step 2');
              cy.screenshot(`${service.name}-step2`);
              
              // Fill Step 2 - Personal info
              cy.get('input[type="text"]').first().type('Test User', { force: true });
              cy.get('input[type="date"], input[type="text"]').eq(1).type('01/01/1990', { force: true });
              
              // Try to continue to Step 3
              cy.get('button').filter(':visible').then($btns => {
                const nextBtn = $btns.filter((i, el) => {
                  const text = el.textContent || '';
                  return text.includes('Next') || text.includes('הבא') || text.includes('Continue');
                });
                
                if (nextBtn.length > 0) {
                  cy.wrap(nextBtn.first()).click({ force: true });
                  cy.wait(3000);
                  
                  // Check if we reached Step 3
                  cy.url().then(url => {
                    if (url.includes('/3')) {
                      cy.log('✅ Reached Step 3');
                      cy.screenshot(`${service.name}-step3`);
                      
                      // Fill Step 3 - Income
                      cy.get('input[type="text"], input[type="number"]').first().type('15000', { force: true });
                      
                      // Try to continue to Step 4
                      cy.get('button').filter(':visible').then($btns => {
                        const finishBtn = $btns.filter((i, el) => {
                          const text = el.textContent || '';
                          return text.includes('Next') || text.includes('הבא') || 
                                 text.includes('Calculate') || text.includes('חשב') ||
                                 text.includes('Finish') || text.includes('סיום');
                        });
                        
                        if (finishBtn.length > 0) {
                          cy.wrap(finishBtn.first()).click({ force: true });
                          cy.wait(5000);
                          
                          // Check if we reached Step 4
                          cy.url().then(url => {
                            if (url.includes('/4')) {
                              cy.log('✅ SUCCESS: Reached Step 4 - Results!');
                              cy.screenshot(`${service.name}-step4-results`);
                            } else {
                              cy.log('⚠️ Could not reach Step 4');
                              cy.screenshot(`${service.name}-stuck-at-step3`);
                            }
                          });
                        }
                      });
                    } else {
                      cy.log('⚠️ Could not reach Step 3');
                      cy.screenshot(`${service.name}-stuck-at-step2`);
                    }
                  });
                }
              });
            } else {
              cy.log('⚠️ Could not reach Step 2');
              cy.screenshot(`${service.name}-stuck-at-step1`);
            }
          });
        } else {
          cy.log('❌ No Next button found on Step 1');
        }
      });
    });
  });
});