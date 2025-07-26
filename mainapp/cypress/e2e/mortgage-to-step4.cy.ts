/**
 * Mortgage Calculator - Simple test to reach Step 4
 * Fills minimum required fields and navigates through all steps
 */

describe('Mortgage Calculator - Reach Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  it('should reach step 4 by filling required fields only', () => {
    // Clear session
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    
    // Visit Step 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(4000);
    cy.screenshot('step1-loaded');
    
    // Fill property value
    cy.get('input[type="text"]').first().clear().type('2000000');
    
    // Select city (click first dropdown and select first option)
    cy.get('[class*="dropdown"]').first().click();
    cy.wait(1000);
    cy.get('[class*="item"], [role="option"]').first().click();
    
    // Fill remaining dropdowns with first option
    for (let i = 1; i < 6; i++) {
      cy.get('[class*="dropdown"]').eq(i).click();
      cy.wait(500);
      cy.get('[class*="item"], [role="option"]').first().click();
    }
    
    cy.screenshot('step1-filled');
    
    // Click the yellow continue button
    cy.get('button').filter((index, element) => {
      const bgColor = window.getComputedStyle(element).backgroundColor;
      const text = element.textContent || '';
      return bgColor.includes('rgb(255') || // Yellow color
             bgColor.includes('#f') || 
             text.includes('הבא') ||
             text.includes('המשך');
    }).first().click({force: true});
    
    cy.wait(3000);
    cy.screenshot('after-continue-click');
    
    // Handle authentication modal if appears
    cy.get('body').then($body => {
      const modalVisible = $body.find('.modal, [role="dialog"]').is(':visible');
      const hasPhoneInput = $body.find('input[type="tel"]').length > 0;
      
      if (modalVisible || hasPhoneInput) {
        cy.log('Auth modal detected');
        
        // Phone
        cy.get('input').filter((i, el) => {
          return el.type === 'tel' || el.placeholder?.includes('טלפון') || i === 0;
        }).first().type(testPhone);
        
        // Send code
        cy.get('button').filter((i, el) => {
          const text = el.textContent || '';
          return text.includes('קבל') || text.includes('שלח');
        }).first().click();
        
        cy.wait(2000);
        
        // OTP
        cy.get('input').last().type(testOTP);
        
        // Verify
        cy.get('button').filter((i, el) => {
          const text = el.textContent || '';
          return text.includes('אמת') || text.includes('אישור');
        }).first().click();
        
        cy.wait(3000);
      }
    });
    
    // Check if on step 2
    cy.url().then(url => {
      if (url.includes('/2')) {
        cy.log('✓ Reached Step 2');
        cy.screenshot('step2-reached');
        
        // Fill Step 2 quickly
        cy.get('input[type="text"]').first().type('ישראל ישראלי');
        cy.get('input[type="date"]').first().type('1985-05-15');
        
        // Select first option in all dropdowns
        cy.get('[class*="dropdown"]').each($dropdown => {
          cy.wrap($dropdown).click();
          cy.wait(300);
          cy.get('[class*="item"], [role="option"]').first().click();
        });
        
        // Check all "No" radio buttons
        cy.get('input[type="radio"][value*="2"], input[type="radio"]:nth-of-type(even)')
          .each($radio => {
            cy.wrap($radio).check({force: true});
          });
        
        cy.screenshot('step2-filled');
        
        // Continue
        cy.get('button').contains(/הבא|המשך/).click({force: true});
        cy.wait(3000);
      }
    });
    
    // Check if on step 3
    cy.url().then(url => {
      if (url.includes('/3')) {
        cy.log('✓ Reached Step 3');
        cy.screenshot('step3-reached');
        
        // Select employed
        cy.get('[class*="dropdown"]').first().click();
        cy.wait(500);
        cy.get('[class*="item"]').contains('שכיר').click();
        
        // Income
        cy.get('input[type="text"], input[type="number"]').first().type('20000');
        
        // No additional income
        cy.get('[class*="dropdown"]').eq(1).click();
        cy.wait(500);
        cy.get('[class*="item"]').last().click(); // Usually "None" is last
        
        // No obligations
        cy.get('[class*="dropdown"]').eq(2).click();
        cy.wait(500);
        cy.get('[class*="item"]').first().click();
        
        cy.screenshot('step3-filled');
        
        // Continue
        cy.get('button').contains(/הבא|המשך/).click({force: true});
        cy.wait(5000);
      }
    });
    
    // Final check - Step 4
    cy.url().then(url => {
      if (url.includes('/4')) {
        cy.log('🎉 SUCCESS! Reached Step 4 - Bank Offers!');
        cy.screenshot('step4-SUCCESS');
        
        // Wait for bank cards
        cy.get('[class*="bank"], [class*="card"]', { timeout: 10000 })
          .should('be.visible');
        
        cy.screenshot('step4-banks-visible');
      } else {
        cy.log('Current URL: ' + url);
        cy.screenshot('final-url-state');
      }
    });
    
    // Assert we're on step 4
    cy.url().should('include', '/services/calculate-mortgage/4');
  });
});