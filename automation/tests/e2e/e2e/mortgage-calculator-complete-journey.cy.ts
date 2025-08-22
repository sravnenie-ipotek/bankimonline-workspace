/**
 * Mortgage Calculator - Complete Journey to Step 4
 * Handles validation and fills all required fields properly
 */

describe('Mortgage Calculator - Complete Journey', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  it('should navigate through all 4 steps and reach bank offers', () => {
    // Setup
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    
    // STEP 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(4000);
    cy.screenshot('01-step1-initial');
    
    // Fill property value
    cy.get('input[type="text"]').first().clear().type('2500000');
    
    // Click city dropdown and select
    cy.get('[class*="dropdown"]').eq(0).click();
    cy.wait(1000);
    // Search for Tel Aviv
    cy.get('input[placeholder*="חיפוש"], .dropdown-search input').type('תל אביב');
    cy.wait(1000);
    cy.get('[class*="item"]').contains('תל אביב').click();
    
    // When do you need money
    cy.get('[class*="dropdown"]').eq(1).click();
    cy.wait(500);
    cy.get('[class*="item"], [data-value]').first().click();
    
    // Property ownership
    cy.get('[class*="dropdown"]').eq(2).click();
    cy.wait(500);
    cy.get('[class*="item"], [data-value]').first().click();
    
    // Property type
    cy.get('[class*="dropdown"]').eq(3).click();
    cy.wait(500);
    cy.get('[class*="item"], [data-value]').first().click();
    
    // First home buyer
    cy.get('[class*="dropdown"]').eq(4).click();
    cy.wait(500);
    cy.get('[class*="item"], [data-value]').first().click();
    
    // Fill down payment (second input)
    cy.get('input[type="text"]').eq(1).clear().type('625000');
    
    cy.screenshot('02-step1-complete');
    
    // Click continue - look for the yellow button
    cy.get('button').then($buttons => {
      const continueBtn = $buttons.filter((i, el) => {
        const text = el.textContent || '';
        const styles = window.getComputedStyle(el);
        return text.includes('הבא') && styles.backgroundColor.includes('255'); // Yellow
      });
      cy.wrap(continueBtn.first()).click();
    });
    
    cy.wait(3000);
    cy.screenshot('03-after-continue');
    
    // Handle auth modal
    cy.get('body').then($body => {
      if ($body.find('.modal, input[type="tel"]').length > 0) {
        cy.log('Auth modal appeared');
        
        // Phone
        cy.get('input').filter((i, el) => {
          return el.type === 'tel' || i === 0;
        }).first().clear().type(testPhone);
        
        // Send code
        cy.get('button').contains(/קבל|שלח/).click();
        cy.wait(2000);
        
        // OTP
        cy.get('input').last().clear().type(testOTP);
        
        // Verify
        cy.get('button').contains(/אמת|אישור/).click();
        cy.wait(3000);
      }
    });
    
    // STEP 2 - Personal Info
    cy.url().should('include', '/2');
    cy.log('✓ Step 2 reached');
    cy.screenshot('04-step2-reached');
    
    // Name
    cy.get('input[type="text"]').first().type('ישראל ישראלי');
    
    // Birthday - try different date formats
    cy.get('input').then($inputs => {
      const dateInput = $inputs.filter((i, el) => {
        return el.type === 'date' || el.placeholder?.includes('תאריך');
      });
      if (dateInput.length > 0) {
        cy.wrap(dateInput.first()).type('1985-05-15');
      } else {
        cy.get('input').eq(1).click().type('15/05/1985');
      }
    });
    
    // Education dropdown
    cy.get('[class*="dropdown"]').first().click();
    cy.wait(500);
    cy.get('[class*="item"]').eq(1).click(); // Second option
    
    // Radio buttons - select No for all
    cy.get('input[type="radio"]').then($radios => {
      // Select every second radio (usually No options)
      for (let i = 1; i < $radios.length; i += 2) {
        cy.wrap($radios[i]).check({force: true});
      }
    });
    
    // Number of borrowers
    cy.get('[class*="dropdown"]').eq(1).click();
    cy.wait(500);
    cy.get('[class*="item"]').contains('1').click();
    
    // Family status
    cy.get('[class*="dropdown"]').eq(2).click();
    cy.wait(500);
    cy.get('[class*="item"]').first().click();
    
    cy.screenshot('05-step2-complete');
    
    // Continue to step 3
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(3000);
    
    // STEP 3 - Income
    cy.url().should('include', '/3');
    cy.log('✓ Step 3 reached');
    cy.screenshot('06-step3-reached');
    
    // Main income source
    cy.get('[class*="dropdown"]').first().click();
    cy.wait(500);
    cy.get('[class*="item"]').contains('שכיר').click();
    
    // Monthly income
    cy.get('input[type="text"], input[type="number"]').first().clear().type('25000');
    
    // Additional income
    cy.get('[class*="dropdown"]').eq(1).click();
    cy.wait(500);
    cy.get('[class*="item"]').last().click(); // None
    
    // Obligations
    cy.get('[class*="dropdown"]').eq(2).click();
    cy.wait(500);
    cy.get('[class*="item"], [data-value]').first().click(); // No obligations
    
    cy.screenshot('07-step3-complete');
    
    // Continue to step 4
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(6000); // Longer wait for bank offers
    
    // STEP 4 - Bank Offers
    cy.url().should('include', '/4');
    cy.log('🎉 SUCCESS! Step 4 reached - Bank Offers!');
    cy.screenshot('08-step4-SUCCESS');
    
    // Verify bank offers loaded
    cy.get('[class*="bank"], [class*="card"], .bank-card').should('exist');
    cy.screenshot('09-bank-offers-visible');
    
    // Check filter exists
    cy.get('select, [class*="filter"]').should('exist');
    cy.screenshot('10-filter-dropdown');
    
    // Final success screenshot
    cy.screenshot('11-FINAL-SUCCESS-ALL-STEPS-COMPLETE');
  });
});