/**
 * Mortgage Calculator Test - Using data-testid Selectors
 * This test uses the newly added data-testid attributes for reliable element selection
 */

describe('Mortgage Calculator - Complete Journey with Test IDs', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.viewport(1920, 1080);
  });

  it('should complete all 4 steps using data-testid selectors', () => {
    // Step 1: Property and Loan Details
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(5000); // Wait for page load
    cy.screenshot('01-step1-loaded');
    
    cy.log('📝 Step 1: Property and Loan Details');
    
    // 1. Property price
    cy.get('[data-testid="property-price-input"]').clear().type('2500000');
    cy.wait(500);
    cy.screenshot('02-property-price-filled');
    
    // 2. City dropdown
    cy.log('Selecting city...');
    cy.get('[data-testid="city-dropdown"]').click();
    cy.wait(1500); // Wait for cities to load
    // Select first city or search for Tel Aviv
    cy.get('[data-testid^="city-dropdown-item-"]').first().click();
    cy.wait(500);
    cy.screenshot('03-city-selected');
    
    // 3. When do you need the money
    cy.log('Selecting when needed...');
    cy.get('[data-testid="when-needed-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid^="when-needed-dropdown-item-"]').first().click();
    cy.wait(500);
    cy.screenshot('04-when-needed-selected');
    
    // 4. Property type
    cy.log('Selecting property type...');
    cy.get('[data-testid="property-type-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid^="property-type-dropdown-item-"]').first().click();
    cy.wait(500);
    cy.screenshot('05-property-type-selected');
    
    // 5. First home buyer
    cy.log('Selecting first home status...');
    cy.get('[data-testid="first-home-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid^="first-home-dropdown-item-"]').first().click();
    cy.wait(500);
    cy.screenshot('06-first-home-selected');
    
    // 6. Property ownership status
    cy.log('Selecting property ownership...');
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid^="property-ownership-dropdown-item-"]').first().click();
    cy.wait(500);
    cy.screenshot('07-property-ownership-selected');
    
    // 7. Initial payment (down payment)
    cy.log('Setting initial payment...');
    // The SliderInput might have an input field we can type into
    cy.get('[data-testid="initial-fee-input"] input[type="text"], input[name="InitialFee"]')
      .clear()
      .type('625000');
    cy.wait(500);
    cy.screenshot('08-initial-payment-set');
    
    // 8. Adjust credit parameters (sliders)
    // Monthly payment slider
    cy.get('input[type="range"]').eq(0)
      .invoke('val', 10000)
      .trigger('input')
      .trigger('change');
    
    // Loan period slider
    cy.get('input[type="range"]').eq(1)
      .invoke('val', 25)
      .trigger('input')
      .trigger('change');
    
    cy.screenshot('09-all-fields-complete');
    
    // Click continue button
    cy.log('🚀 Clicking continue...');
    cy.get('button').contains(/הבא|Next|Continue|המשך/).click();
    cy.wait(3000);
    cy.screenshot('10-after-continue');
    
    // Handle authentication modal
    cy.get('body').then($body => {
      if ($body.find('input[type="tel"]').length > 0 || $body.find('.modal').length > 0) {
        cy.log('🔐 Authentication required');
        
        // Phone number
        cy.get('input[type="tel"], input[placeholder*="טלפון"], input[placeholder*="Phone"]')
          .first()
          .clear()
          .type(testPhone);
        cy.screenshot('11-phone-entered');
        
        // Send code button
        cy.get('button').contains(/קבל|שלח|Send|Get/).click();
        cy.wait(2000);
        
        // OTP
        cy.get('input').last().type(testOTP);
        cy.screenshot('12-otp-entered');
        
        // Verify
        cy.get('button').contains(/אמת|אישור|Verify|Confirm/).click();
        cy.wait(3000);
      }
    });
    
    // Step 2: Personal Information
    cy.url().should('include', '/services/calculate-mortgage/2');
    cy.log('✅ Step 2 reached - Personal Information');
    cy.screenshot('13-step2-loaded');
    
    // Fill personal details
    // Name
    cy.get('input[type="text"]').first().type('ישראל ישראלי');
    
    // Birthday
    cy.get('input[type="date"], input[placeholder*="תאריך"], input[placeholder*="Birth"]')
      .first()
      .type('1985-05-15');
    
    // Education level dropdown
    cy.get('.react-dropdown-select, [class*="dropdown"]').first().click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').eq(1).click();
    
    // Radio buttons - select "No" for questions
    cy.get('input[type="radio"]').then($radios => {
      // Select every second radio (usually "No" options)
      for (let i = 1; i < $radios.length; i += 2) {
        cy.wrap($radios[i]).check({ force: true });
      }
    });
    
    // Number of borrowers
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(1).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').contains('1').click();
    
    // Family status
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(2).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').first().click();
    
    cy.screenshot('14-step2-complete');
    
    // Continue to Step 3
    cy.get('button').contains(/הבא|Next|Continue|המשך/).click();
    cy.wait(3000);
    
    // Step 3: Income Information
    cy.url().should('include', '/services/calculate-mortgage/3');
    cy.log('✅ Step 3 reached - Income Information');
    cy.screenshot('15-step3-loaded');
    
    // Employment type
    cy.get('.react-dropdown-select, [class*="dropdown"]').first().click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]')
      .contains(/שכיר|Employee|Employed/)
      .click();
    
    // Monthly income
    cy.get('input[type="text"], input[type="number"]').first().clear().type('25000');
    
    // Additional income - None
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(1).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').last().click();
    
    // Financial obligations - None
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(2).click();
    cy.wait(300);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').first().click();
    
    cy.screenshot('16-step3-complete');
    
    // Continue to Step 4
    cy.get('button').contains(/הבא|Next|Continue|המשך/).click();
    cy.wait(6000); // Longer wait for bank calculations
    
    // Step 4: Bank Offers
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.log('🎉 SUCCESS! Step 4 reached - Bank Offers!');
    cy.screenshot('17-step4-SUCCESS');
    
    // Verify bank offers are displayed
    cy.get('[class*="bank"], [class*="card"], .bank-offer').should('exist');
    cy.screenshot('18-bank-offers-visible');
    
    // Check for filter options
    cy.get('select, [class*="filter"], [class*="sort"]').should('exist');
    cy.screenshot('19-filters-available');
    
    // Final success screenshot
    cy.screenshot('20-FINAL-SUCCESS-ALL-4-STEPS');
    
    cy.log('🎊 Test completed successfully! All 4 steps navigated with test IDs!');
  });
});