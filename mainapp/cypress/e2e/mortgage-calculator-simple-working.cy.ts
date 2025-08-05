/**
 * Mortgage Calculator - Simple Working Test
 * Uses generic selectors to navigate through all 4 steps
 */

describe('Mortgage Calculator - Simple Path to Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  it('should reach step 4 with minimal required fields', () => {
    // Clear storage
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    
    // Visit Step 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(5000); // Wait for page load
    cy.screenshot('01-step1-loaded');
    
    // Fill property value
    cy.get('input[type="text"]').first().clear().type('2000000');
    cy.wait(500);
    
    // Strategy: Click all visible dropdowns and select first option
    // This avoids selector issues
    let dropdownCount = 0;
    
    // Function to handle dropdowns
    const fillDropdown = (index) => {
      cy.get('body').then($body => {
        // Find all elements that could be dropdowns
        const possibleDropdowns = $body.find('.react-dropdown-select, [class*="dropdown"], select').not('.filled');
        
        if (possibleDropdowns.length > index) {
          cy.wrap(possibleDropdowns[index]).click();
          cy.wait(1000);
          
          // Try to select first item
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li')
            .not('[disabled]')
            .first()
            .click({ force: true });
          
          cy.wait(500);
          dropdownCount++;
          cy.screenshot(`02-dropdown-${dropdownCount}-filled`);
        }
      });
    };
    
    // Fill 5-6 dropdowns (typical for step 1)
    for (let i = 0; i < 6; i++) {
      fillDropdown(i);
    }
    
    // Fill initial payment (second text input)
    cy.get('input[type="text"]').eq(1).clear().type('500000');
    cy.wait(500);
    cy.screenshot('03-initial-payment');
    
    // Try to find and click continue button
    cy.get('button').then($buttons => {
      // Find yellow button or button with continue text
      const continueBtn = Array.from($buttons).find(btn => {
        const text = btn.textContent || '';
        const bgColor = window.getComputedStyle(btn).backgroundColor;
        return (text.includes('הבא') || text.includes('המשך') || text.includes('Next')) && 
               !btn.disabled;
      });
      
      if (continueBtn) {
        cy.wrap(continueBtn).click();
      } else {
        // Click last button (usually continue)
        cy.wrap($buttons.last()).click();
      }
    });
    
    cy.wait(3000);
    cy.screenshot('04-after-continue');
    
    // Handle auth if needed
    cy.get('body').then($body => {
      if ($body.find('input[type="tel"]').length > 0) {
        cy.log('Auth modal detected');
        
        // Phone
        cy.get('input').first().type(testPhone);
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
    
    // Check URL and quick fill remaining steps
    cy.url().then(url => {
      cy.log('Current URL: ' + url);
      
      // Step 2
      if (url.includes('/2')) {
        cy.log('Step 2 reached');
        cy.screenshot('05-step2-reached');
        
        // Name
        cy.get('input[type="text"]').first().type('Test User');
        
        // Date
        cy.get('input').eq(1).type('01/01/1990');
        
        // Fill all visible dropdowns
        cy.get('.react-dropdown-select, [class*="dropdown"], select').each(($el, index) => {
          if (index < 3) { // Limit to 3 dropdowns
            cy.wrap($el).click();
            cy.wait(300);
            cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li')
              .first()
              .click({ force: true });
            cy.wait(300);
          }
        });
        
        // Radio buttons - select second option (No)
        cy.get('input[type="radio"]').then($radios => {
          if ($radios.length >= 2) {
            cy.wrap($radios[1]).check({ force: true });
          }
          if ($radios.length >= 4) {
            cy.wrap($radios[3]).check({ force: true });
          }
        });
        
        // Continue
        cy.get('button').last().click();
        cy.wait(3000);
      }
      
      // Step 3
      cy.url().then(url2 => {
        if (url2.includes('/3')) {
          cy.log('Step 3 reached');
          cy.screenshot('06-step3-reached');
          
          // Fill first dropdown
          cy.get('.react-dropdown-select, [class*="dropdown"], select').first().click();
          cy.wait(500);
          cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li')
            .contains(/שכיר|Employed|Employee/)
            .click({ force: true });
          
          // Income
          cy.get('input[type="text"], input[type="number"]').first().type('20000');
          
          // Fill remaining dropdowns with first option
          cy.get('.react-dropdown-select, [class*="dropdown"], select').each(($el, index) => {
            if (index > 0 && index < 3) {
              cy.wrap($el).click();
              cy.wait(300);
              cy.get('.react-dropdown-select-item, [class*="dropdown-item"], option, li')
                .first()
                .click({ force: true });
              cy.wait(300);
            }
          });
          
          // Continue
          cy.get('button').last().click();
          cy.wait(5000);
        }
      });
    });
    
    // Final check for Step 4
    cy.wait(2000);
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.log('🎉 SUCCESS! Step 4 reached!');
    cy.screenshot('07-step4-SUCCESS');
    
    // Verify bank offers
    cy.get('[class*="bank"], [class*="card"], [class*="offer"]', { timeout: 10000 })
      .should('exist');
    cy.screenshot('08-bank-offers-visible');
    
    cy.screenshot('09-FINAL-SUCCESS');
  });
});