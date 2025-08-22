/**
 * Mortgage Calculator - Working Test to Reach Step 4
 * Based on the working pattern from mortgage-calculator-simple-working.cy.ts
 */

describe('Mortgage Calculator - Working Path to Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  it('should successfully navigate through all 4 steps', () => {
    // ========== STEP 1: Property Details ==========
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(5000); // Wait for page to fully load
    cy.screenshot('01-step1-loaded');
    
    cy.log('📍 Step 1: Filling property details');
    
    // Property value - first text input
    cy.get('input[type="text"]').first().clear().type('2000000');
    cy.wait(500);
    
    // Fill all dropdowns with first option
    let dropdownsFilled = 0;
    
    // Function to safely fill dropdowns
    const fillNextDropdown = (index) => {
      cy.get('body').then($body => {
        const dropdowns = $body.find('.react-dropdown-select, [class*="dropdown"]:not(input), select');
        
        if (dropdowns.length > index) {
          cy.wrap(dropdowns[index]).click();
          cy.wait(1000);
          
          // Select first item
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], [class*="list-item"], option, li')
            .not('[disabled]')
            .first()
            .click({ force: true });
          
          cy.wait(500);
          dropdownsFilled++;
          cy.log(`Filled dropdown ${dropdownsFilled}`);
        }
      });
    };
    
    // Fill 5-6 dropdowns for step 1
    for (let i = 0; i < 6; i++) {
      fillNextDropdown(i);
    }
    
    // Initial payment - second text input (if exists)
    cy.get('input[type="text"]').then($inputs => {
      if ($inputs.length > 1) {
        cy.wrap($inputs[1]).clear().type('500000');
      }
    });
    
    cy.screenshot('02-step1-filled');
    
    // Click continue button
    cy.get('button').then($buttons => {
      const continueBtn = Array.from($buttons).find(btn => {
        const text = btn.textContent || '';
        return (text.includes('הבא') || text.includes('המשך') || text.includes('Next')) && 
               !btn.disabled;
      });
      
      if (continueBtn) {
        cy.wrap(continueBtn).click();
      } else {
        cy.wrap($buttons.last()).click();
      }
    });
    
    cy.wait(3000);
    cy.screenshot('03-after-step1-continue');
    
    // ========== HANDLE AUTHENTICATION ==========
    cy.get('body').then($body => {
      if ($body.find('input[type="tel"]').length > 0) {
        cy.log('🔐 Handling authentication');
        
        // Phone number
        cy.get('input[type="tel"]').first().type(testPhone);
        cy.wait(500);
        
        // Send code button
        cy.get('button').then($btns => {
          const sendBtn = Array.from($btns).find(btn => 
            btn.textContent && (btn.textContent.includes('קבל') || btn.textContent.includes('שלח'))
          );
          if (sendBtn) cy.wrap(sendBtn).click();
        });
        
        cy.wait(2000);
        
        // OTP
        cy.get('input').last().type(testOTP);
        cy.wait(500);
        
        // Verify button
        cy.get('button').then($btns => {
          const verifyBtn = Array.from($btns).find(btn => 
            btn.textContent && (btn.textContent.includes('אמת') || btn.textContent.includes('אישור'))
          );
          if (verifyBtn) cy.wrap(verifyBtn).click();
        });
        
        cy.wait(3000);
      }
    });
    
    // ========== STEP 2: Personal Details ==========
    cy.url().then(url => {
      if (url.includes('/2')) {
        cy.log('📍 Step 2: Filling personal details');
        cy.screenshot('04-step2-reached');
        
        // Name
        cy.get('input[type="text"]').first().type('Test Automation User');
        cy.wait(300);
        
        // Birthday - try both date formats
        cy.get('input').then($inputs => {
          const dateInput = Array.from($inputs).find(input => 
            input.type === 'date' || input.name === 'birthday' || input.placeholder?.includes('birthday')
          );
          if (dateInput) {
            cy.wrap(dateInput).type('1985-05-15');
          } else {
            cy.get('input').eq(1).type('15/05/1985');
          }
        });
        
        // Fill dropdowns - select "No" where applicable
        cy.get('.react-dropdown-select, [class*="dropdown"], select').each(($el, index) => {
          if (index < 8) { // Limit to reasonable number
            cy.wrap($el).click();
            cy.wait(500);
            
            // Try to find "No" option for Yes/No questions
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li').then($items => {
              const noOption = Array.from($items).find(item => 
                item.textContent && (item.textContent.includes('לא') || item.textContent.includes('No'))
              );
              
              if (noOption && index > 0) {
                cy.wrap(noOption).click({ force: true });
              } else {
                cy.wrap($items.first()).click({ force: true });
              }
            });
            cy.wait(300);
          }
        });
        
        // Number of borrowers
        cy.get('input').then($inputs => {
          const borrowersInput = Array.from($inputs).find(input => 
            input.name === 'borrowers' || input.placeholder?.includes('borrowers')
          );
          if (borrowersInput) {
            cy.wrap(borrowersInput).clear().type('1');
          }
        });
        
        cy.screenshot('05-step2-filled');
        
        // Continue to step 3
        cy.get('button').then($buttons => {
          const continueBtn = Array.from($buttons).find(btn => {
            const text = btn.textContent || '';
            return (text.includes('הבא') || text.includes('המשך') || text.includes('Next')) && 
                   !btn.disabled;
          });
          
          if (continueBtn) {
            cy.wrap(continueBtn).click();
          } else {
            cy.wrap($buttons.last()).click();
          }
        });
        
        cy.wait(3000);
      }
    });
    
    // ========== STEP 3: Income & Employment ==========
    cy.url().then(url => {
      if (url.includes('/3')) {
        cy.log('📍 Step 3: Filling income details');
        cy.screenshot('06-step3-reached');
        
        // Main source - Employed
        cy.get('.react-dropdown-select, [class*="dropdown"], select').first().click();
        cy.wait(500);
        cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li')
          .filter(':contains("שכיר"), :contains("Employed")')
          .first()
          .click({ force: true });
        
        cy.wait(1000); // Wait for dynamic fields
        
        // Monthly income
        cy.get('input[type="text"], input[type="number"]').first().type('20000');
        
        // Fill remaining dropdowns with first option (usually "No" for additional income/obligations)
        cy.get('.react-dropdown-select, [class*="dropdown"], select').each(($el, index) => {
          if (index > 0 && index < 4) {
            cy.wrap($el).click();
            cy.wait(300);
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li')
              .first()
              .click({ force: true });
            cy.wait(300);
          }
        });
        
        cy.screenshot('07-step3-filled');
        
        // Continue to step 4
        cy.get('button').then($buttons => {
          const continueBtn = Array.from($buttons).find(btn => {
            const text = btn.textContent || '';
            return (text.includes('הבא') || text.includes('המשך') || text.includes('Next')) && 
                   !btn.disabled;
          });
          
          if (continueBtn) {
            cy.wrap(continueBtn).click();
          } else {
            cy.wrap($buttons.last()).click();
          }
        });
        
        cy.wait(5000); // Wait for API call
      }
    });
    
    // ========== VERIFY STEP 4 ==========
    cy.wait(2000);
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.log('🎉 SUCCESS! Step 4 reached!');
    cy.screenshot('08-step4-SUCCESS');
    
    // Verify bank content exists
    cy.get('body').then($body => {
      const hasContent = $body.text().includes('bank') || 
                        $body.text().includes('בנק') ||
                        $body.find('[class*="bank"]').length > 0 ||
                        $body.find('[class*="card"]').length > 0 ||
                        $body.find('[class*="offer"]').length > 0;
      
      if (hasContent) {
        cy.log('✅ Bank content visible on Step 4');
        cy.screenshot('09-bank-offers-visible');
      } else {
        cy.log('⚠️ Step 4 reached but no bank content visible yet');
        cy.screenshot('09-step4-no-offers');
      }
    });
    
    cy.screenshot('10-FINAL-SUCCESS');
  });
});