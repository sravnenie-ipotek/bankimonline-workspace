/**
 * Mortgage Calculator Test - Final Working Version
 * Uses correct field names and component structure
 */

describe('Mortgage Calculator - Complete Flow to Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  it('should fill all fields and reach step 4 bank offers', () => {
    // Navigate to Step 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(3000); // Wait for React to fully load
    
    cy.screenshot('01-step1-initial-load');
    
    // STEP 1: Fill all property details
    
    // 1. Property Value - name="priceOfEstate"
    cy.get('[name="priceOfEstate"]').should('be.visible').clear().type('2500000');
    cy.screenshot('02-property-value-filled');
    
    // 2. City Selection - name="cityWhereYouBuy"
    cy.get('[name="cityWhereYouBuy"]').should('be.visible').click();
    cy.wait(1000); // Wait for dropdown to open
    // Type to search for Tel Aviv
    cy.get('.dropdown-search input').type('תל');
    cy.wait(500);
    // Click first result
    cy.get('.dropdown-item').first().click();
    cy.screenshot('03-city-selected');
    
    // 3. When do you need money - name="whenDoYouNeedMoney"
    cy.get('[name="whenDoYouNeedMoney"]').should('be.visible').click();
    cy.wait(500);
    // Select first option (within a month)
    cy.get('[data-value="option_1"]').click();
    cy.screenshot('04-timeline-selected');
    
    // 4. Property Ownership - name="propertyOwnership"
    cy.get('[name="propertyOwnership"]').should('be.visible').click();
    cy.wait(500);
    // Select "no_property" (75% financing)
    cy.get('[data-value="option_1"]').click();
    cy.screenshot('05-property-ownership-selected');
    
    // 5. Initial Fee/Down Payment - name="initialFee"
    cy.get('[name="initialFee"]').should('be.visible').clear().type('625000'); // 25% of 2.5M
    cy.screenshot('06-down-payment-entered');
    
    // 6. Property Type - name="typeSelect"
    cy.get('[name="typeSelect"]').should('be.visible').click();
    cy.wait(500);
    // Select new property
    cy.get('[data-value="option_1"]').click();
    cy.screenshot('07-property-type-selected');
    
    // 7. First Home Buyer - name="willBeYourFirst"
    cy.get('[name="willBeYourFirst"]').should('be.visible').click();
    cy.wait(500);
    // Select Yes
    cy.get('[data-value="option_1"]').click();
    cy.screenshot('08-first-home-selected');
    
    // 8. Loan Term Slider - part of CreditParams
    cy.get('[data-qa="loan-term-slider"] input[type="range"], input[type="range"]').eq(1)
      .invoke('val', 25)
      .trigger('input')
      .trigger('change');
    cy.screenshot('09-loan-term-set');
    
    // 9. Monthly Payment Slider
    cy.get('[data-qa="monthly-payment-slider"] input[type="range"], input[type="range"]').eq(0)
      .invoke('val', 12000)
      .trigger('input')
      .trigger('change');
    cy.screenshot('10-monthly-payment-set');
    
    // Final screenshot of completed Step 1
    cy.screenshot('11-step1-all-fields-complete');
    
    // Click Continue button
    cy.contains('button', 'הבא').should('be.visible').click();
    cy.wait(2000);
    
    // Handle Authentication Modal
    cy.get('body').then($body => {
      if ($body.find('.modal, [role="dialog"], input[name="phone"]').length > 0) {
        cy.log('Authentication modal detected');
        cy.screenshot('12-auth-modal-appeared');
        
        // Enter phone number
        cy.get('input[name="phone"], input[type="tel"]').type(testPhone);
        cy.screenshot('13-phone-entered');
        
        // Click send code button
        cy.contains('button', /קבל קוד|שלח/).click();
        cy.wait(1500);
        
        // Enter OTP
        cy.get('input[name="otp"], input[placeholder*="קוד"]').type(testOTP);
        cy.screenshot('14-otp-entered');
        
        // Click verify button
        cy.contains('button', /אמת|אישור/).click();
        cy.wait(2000);
      }
    });
    
    // Verify we reached Step 2
    cy.url().should('include', '/services/calculate-mortgage/2');
    cy.screenshot('15-step2-reached');
    
    // STEP 2: Personal Information (Quick fill)
    
    // Name
    cy.get('[name="nameSurname"]').type('ישראל ישראלי');
    
    // Birthday
    cy.get('[name="birthday"]').type('1985-05-15');
    
    // Education
    cy.get('[name="education"]').click();
    cy.wait(500);
    cy.get('.dropdown-item').eq(2).click(); // Bachelor's degree
    
    // Radio buttons - select No for most options
    cy.get('input[name="additionalCitizenships"][value="option_2"]').check({force: true});
    cy.get('input[name="taxes"][value="option_2"]').check({force: true});
    cy.get('input[name="childrens"][value="option_2"]').check({force: true});
    cy.get('input[name="medicalInsurance"][value="option_1"]').check({force: true});
    cy.get('input[name="isForeigner"][value="option_2"]').check({force: true});
    cy.get('input[name="publicPerson"][value="option_2"]').check({force: true});
    
    // Number of borrowers
    cy.get('[name="borrowers"]').click();
    cy.wait(500);
    cy.get('.dropdown-item').contains('1').click();
    
    // Family status
    cy.get('[name="familyStatus"]').click();
    cy.wait(500);
    cy.get('.dropdown-item').first().click();
    
    cy.screenshot('16-step2-filled');
    
    // Continue to Step 3
    cy.contains('button', 'הבא').click();
    cy.wait(2000);
    
    // Verify we reached Step 3
    cy.url().should('include', '/services/calculate-mortgage/3');
    cy.screenshot('17-step3-reached');
    
    // STEP 3: Income Information
    
    // Main income source
    cy.get('[name="mainSourceOfIncome"]').click();
    cy.wait(500);
    cy.get('.dropdown-item').contains('שכיר').click(); // Employed
    
    // Monthly income
    cy.get('[name="monthlyIncome"]').type('25000');
    
    // Start date (if visible)
    cy.get('[name="startDate"]').should('exist').then($el => {
      if ($el.is(':visible')) {
        cy.wrap($el).type('2020-01-01');
      }
    });
    
    // Additional income
    cy.get('[name="additionalIncome"]').click();
    cy.wait(500);
    cy.get('.dropdown-item').contains('אין').click(); // None
    
    // Obligations
    cy.get('[name="obligation"]').click();
    cy.wait(500);
    cy.get('[data-value="option_1"]').click(); // No obligations
    
    cy.screenshot('18-step3-filled');
    
    // Continue to Step 4
    cy.contains('button', 'הבא').click();
    cy.wait(5000); // Wait longer for bank offers to load
    
    // FINAL VERIFICATION - Step 4
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.log('🎉 SUCCESS! Reached Step 4 - Bank Offers!');
    cy.screenshot('19-step4-reached-SUCCESS');
    
    // Wait for bank offers to appear
    cy.get('.bank-card, [class*="bank"], [class*="card"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible');
    
    cy.screenshot('20-bank-offers-visible');
    
    // Check for filter dropdown
    cy.get('.filter-dropdown, select').should('exist');
    cy.screenshot('21-filter-visible');
    
    // Take final screenshot
    cy.screenshot('22-FINAL-STEP4-COMPLETE');
    
    cy.log('✅ Test Complete! Successfully navigated through all 4 steps!');
  });
});