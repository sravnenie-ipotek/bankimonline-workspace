/**
 * Mortgage Calculator - Final Solution
 * This test successfully navigates through all 4 steps
 */

describe('Mortgage Calculator - Complete Journey', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  it('should complete all 4 steps and reach bank offers', () => {
    // Setup
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.viewport(1920, 1080);
    
    // Step 1: Property Details
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(5000);
    cy.screenshot('01-step1-loaded');
    
    // 1. Property value
    cy.get('input[type="text"]').first().clear().type('2500000');
    cy.wait(500);
    
    // 2. City - First dropdown
    cy.get('.react-dropdown-select').first().click();
    cy.wait(1500);
    // Select first city in the list (avoid search issues)
    cy.get('.react-dropdown-select-item').first().click();
    cy.wait(500);
    cy.screenshot('02-city-selected');
    
    // 3. When needed - Second dropdown
    cy.get('.react-dropdown-select').eq(1).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item').first().click();
    cy.wait(500);
    
    // 4. Property ownership - Third dropdown
    cy.get('.react-dropdown-select').eq(2).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item').first().click();
    cy.wait(500);
    
    // 5. Property type - Fourth dropdown
    cy.get('.react-dropdown-select').eq(3).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item').first().click();
    cy.wait(500);
    
    // 6. First home - Fifth dropdown (if exists)
    cy.get('.react-dropdown-select').then($dropdowns => {
      if ($dropdowns.length > 4) {
        cy.wrap($dropdowns.eq(4)).click();
        cy.wait(500);
        cy.get('.react-dropdown-select-item').first().click();
        cy.wait(500);
      }
    });
    
    // 7. Down payment amount
    cy.get('input[type="text"]').eq(1).clear().type('625000');
    cy.wait(500);
    
    // 8. Sliders - adjust if needed
    cy.get('input[type="range"]').then($sliders => {
      if ($sliders.length >= 2) {
        // Monthly payment
        cy.wrap($sliders[0]).invoke('val', 10000).trigger('change');
        // Loan period
        cy.wrap($sliders[1]).invoke('val', 25).trigger('change');
      }
    });
    
    cy.screenshot('03-all-fields-filled');
    
    // Click continue button
    cy.get('button').contains('הבא').click();
    cy.wait(3000);
    cy.screenshot('04-after-continue');
    
    // Handle authentication
    cy.get('body').then($body => {
      if ($body.find('input[type="tel"]').length > 0 || $body.find('.modal').length > 0) {
        cy.log('Authentication required');
        
        // Phone
        cy.get('input').first().type(testPhone);
        cy.wait(500);
        
        // Send code
        cy.get('button').contains(/קבל|שלח/).click();
        cy.wait(2000);
        
        // OTP
        cy.get('input').last().type(testOTP);
        cy.wait(500);
        
        // Verify
        cy.get('button').contains(/אמת|אישור/).click();
        cy.wait(3000);
        cy.screenshot('05-auth-complete');
      }
    });
    
    // Step 2: Personal Details
    cy.url().should('include', '/2');
    cy.log('Step 2 reached');
    cy.screenshot('06-step2-loaded');
    
    // Name
    cy.get('input[type="text"]').first().type('ישראל ישראלי');
    
    // Birthday
    cy.get('input').eq(1).type('15/05/1985');
    
    // Education - first dropdown
    cy.get('.react-dropdown-select').first().click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item').eq(1).click();
    
    // Radio buttons - select No
    cy.get('input[type="radio"][value="2"], input[type="radio"]:nth-child(2)')
      .check({ force: true });
    
    // Number of borrowers
    cy.get('.react-dropdown-select').eq(1).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item').contains('1').click();
    
    // Family status
    cy.get('.react-dropdown-select').eq(2).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item').first().click();
    
    cy.screenshot('07-step2-complete');
    
    // Continue
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(3000);
    
    // Step 3: Income
    cy.url().should('include', '/3');
    cy.log('Step 3 reached');
    cy.screenshot('08-step3-loaded');
    
    // Employment type
    cy.get('.react-dropdown-select').first().click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item').contains('שכיר').click();
    
    // Income
    cy.get('input[type="text"]').first().type('25000');
    
    // Additional income - None
    cy.get('.react-dropdown-select').eq(1).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item').last().click();
    
    // Obligations - None
    cy.get('.react-dropdown-select').eq(2).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item').first().click();
    
    cy.screenshot('09-step3-complete');
    
    // Continue
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(6000);
    
    // Step 4: Bank Offers
    cy.url().should('include', '/4');
    cy.log('🎉 Step 4 reached - Bank Offers!');
    cy.screenshot('10-step4-SUCCESS');
    
    // Verify bank offers
    cy.get('[class*="bank"], [class*="offer"], .bank-card').should('exist');
    cy.screenshot('11-bank-offers-visible');
    
    cy.screenshot('12-FINAL-SUCCESS-ALL-STEPS');
  });
});