/**
 * Mortgage Calculator - Working Test to Reach Step 4
 * This test properly fills all required fields based on the actual component structure
 */

describe('Mortgage Calculator - Complete Journey to Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    // Clear all storage and cookies
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    
    // Set viewport
    cy.viewport(1920, 1080);
  });

  it('should successfully navigate through all 4 steps to bank offers', () => {
    // Visit Step 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(5000); // Wait for React app and API calls to complete
    cy.screenshot('01-step1-loaded');
    
    // Step 1: Property and Loan Details
    cy.log('📝 Filling Step 1 - Property Details');
    
    // 1. Property Price (FormattedInput with name="PriceOfEstate")
    cy.get('input[type="text"]').first().should('be.visible');
    cy.get('input[type="text"]').first().clear().type('2500000');
    cy.wait(500);
    cy.screenshot('02-property-price-filled');
    
    // 2. City Dropdown (first dropdown - has search functionality)
    cy.log('Selecting city...');
    cy.get('.dropdown-menu').first().should('be.visible').click();
    cy.wait(1500); // Wait for cities to load from API
    
    // Type in search to filter cities
    cy.get('.dropdown-search input').should('be.visible').type('תל');
    cy.wait(1000);
    
    // Click on Tel Aviv
    cy.get('.dropdown-item').contains('תל אביב').click();
    cy.wait(500);
    cy.screenshot('03-city-selected');
    
    // 3. When do you need the money? (second dropdown)
    cy.log('Selecting when money needed...');
    cy.get('.dropdown-menu').eq(1).click();
    cy.wait(500);
    cy.get('.dropdown-item').first().click(); // Select first option
    cy.wait(500);
    cy.screenshot('04-when-needed-selected');
    
    // 4. Property ownership (third dropdown - affects LTV ratio)
    cy.log('Selecting property ownership...');
    cy.get('.dropdown-menu').eq(2).click();
    cy.wait(500);
    cy.get('.dropdown-item').first().click(); // "I don't own any property" (75% LTV)
    cy.wait(500);
    cy.screenshot('05-property-ownership-selected');
    
    // 5. Property type (fourth dropdown)
    cy.log('Selecting property type...');
    cy.get('.dropdown-menu').eq(3).click();
    cy.wait(500);
    cy.get('.dropdown-item').first().click(); // Select first option
    cy.wait(500);
    cy.screenshot('06-property-type-selected');
    
    // 6. First home buyer (fifth dropdown)
    cy.log('Selecting first home buyer...');
    cy.get('.dropdown-menu').eq(4).click();
    cy.wait(500);
    cy.get('.dropdown-item').first().click(); // Select "Yes"
    cy.wait(500);
    cy.screenshot('07-first-home-selected');
    
    // 7. Initial payment (second text input - FormattedInput)
    cy.log('Setting initial payment...');
    cy.get('input[type="text"]').eq(1).should('be.visible');
    cy.get('input[type="text"]').eq(1).clear().type('625000'); // 25% down payment
    cy.wait(500);
    cy.screenshot('08-initial-payment-filled');
    
    // 8. Monthly payment slider (first range input)
    cy.log('Adjusting monthly payment...');
    cy.get('input[type="range"]').first().should('exist');
    cy.get('input[type="range"]').first()
      .invoke('val', 10000)
      .trigger('input')
      .trigger('change');
    cy.wait(500);
    
    // 9. Loan term slider (second range input)
    cy.log('Adjusting loan term...');
    cy.get('input[type="range"]').eq(1).should('exist');
    cy.get('input[type="range"]').eq(1)
      .invoke('val', 25)
      .trigger('input')
      .trigger('change');
    cy.wait(500);
    cy.screenshot('09-all-fields-completed');
    
    // Continue to Step 2
    cy.log('🚀 Clicking continue button...');
    // Find the yellow button with "הבא" text
    cy.get('button').then($buttons => {
      const continueBtn = Array.from($buttons).find(btn => {
        const text = btn.textContent || '';
        const bgColor = window.getComputedStyle(btn).backgroundColor;
        const isYellow = bgColor.includes('255, 193') || bgColor.includes('rgb(255'); // Yellow color
        const hasText = text.includes('הבא') || text.includes('המשך');
        return isYellow && hasText && !btn.disabled;
      });
      
      if (continueBtn) {
        cy.wrap(continueBtn).click();
      } else {
        // Fallback - click any button with continue text
        cy.get('button').contains('הבא').click();
      }
    });
    
    cy.wait(3000);
    cy.screenshot('10-after-continue-click');
    
    // Handle Authentication Modal
    cy.get('body').then($body => {
      // Check if modal or phone input is visible
      const hasModal = $body.find('.modal-content').length > 0;
      const hasPhoneInput = $body.find('input[type="tel"]').length > 0;
      
      if (hasModal || hasPhoneInput) {
        cy.log('🔐 Handling authentication modal...');
        
        // Enter phone number
        cy.get('input[type="tel"], input[placeholder*="טלפון"]').first()
          .should('be.visible')
          .type(testPhone);
        cy.screenshot('11-phone-entered');
        
        // Click send code button
        cy.get('button').contains(/קבל|שלח/).click();
        cy.wait(2000);
        
        // Enter OTP
        cy.get('input').last().should('be.visible').type(testOTP);
        cy.screenshot('12-otp-entered');
        
        // Click verify button
        cy.get('button').contains(/אמת|אישור/).click();
        cy.wait(3000);
      }
    });
    
    // Step 2: Personal Information
    cy.url().should('include', '/services/calculate-mortgage/2');
    cy.log('✅ Step 2 reached - Personal Information');
    cy.screenshot('13-step2-loaded');
    
    // Fill Step 2
    cy.log('📝 Filling Step 2 - Personal Details');
    
    // Name
    cy.get('input[type="text"]').first().type('ישראל ישראלי');
    
    // Birthday - try both date input and text input
    cy.get('input').then($inputs => {
      const dateInput = Array.from($inputs).find(input => 
        input.type === 'date' || 
        (input.placeholder && input.placeholder.includes('תאריך'))
      );
      
      if (dateInput && dateInput.type === 'date') {
        cy.wrap(dateInput).type('1985-05-15');
      } else {
        // Fallback for text input
        cy.get('input[type="text"]').eq(1).click().type('15/05/1985');
      }
    });
    
    // Education dropdown
    cy.get('.dropdown-menu').first().click();
    cy.wait(500);
    cy.get('.dropdown-item').eq(1).click(); // Second option (usually "Academic")
    
    // Radio buttons - Select "No" for each question
    cy.get('input[type="radio"]').then($radios => {
      // Click every second radio button (typically the "No" options)
      for (let i = 1; i < $radios.length; i += 2) {
        cy.wrap($radios[i]).check({ force: true });
      }
    });
    
    // Number of borrowers dropdown
    cy.get('.dropdown-menu').eq(1).click();
    cy.wait(500);
    cy.get('.dropdown-item').contains('1').click();
    
    // Family status dropdown
    cy.get('.dropdown-menu').eq(2).click();
    cy.wait(500);
    cy.get('.dropdown-item').first().click();
    
    cy.screenshot('14-step2-completed');
    
    // Continue to Step 3
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(3000);
    
    // Step 3: Income Information
    cy.url().should('include', '/services/calculate-mortgage/3');
    cy.log('✅ Step 3 reached - Income Information');
    cy.screenshot('15-step3-loaded');
    
    // Fill Step 3
    cy.log('📝 Filling Step 3 - Income Details');
    
    // Main income source dropdown
    cy.get('.dropdown-menu').first().click();
    cy.wait(500);
    cy.get('.dropdown-item').contains('שכיר').click(); // "Employed"
    
    // Monthly income
    cy.get('input[type="text"], input[type="number"]').first()
      .clear()
      .type('25000');
    
    // Additional income dropdown
    cy.get('.dropdown-menu').eq(1).click();
    cy.wait(500);
    cy.get('.dropdown-item').last().click(); // Usually "None"
    
    // Financial obligations dropdown
    cy.get('.dropdown-menu').eq(2).click();
    cy.wait(500);
    cy.get('.dropdown-item').first().click(); // "No obligations"
    
    cy.screenshot('16-step3-completed');
    
    // Continue to Step 4
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(6000); // Longer wait for bank offers to load
    
    // Step 4: Bank Offers
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.log('🎉 SUCCESS! Step 4 reached - Bank Offers!');
    cy.screenshot('17-step4-SUCCESS');
    
    // Verify bank offers are visible
    cy.get('.bank-card, [class*="bank"], [class*="card"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible');
    cy.screenshot('18-bank-offers-visible');
    
    // Check that filter dropdown exists
    cy.get('select, .dropdown-menu, [class*="filter"]').should('exist');
    cy.screenshot('19-filters-available');
    
    // Take final success screenshot
    cy.screenshot('20-FINAL-SUCCESS-ALL-4-STEPS-COMPLETE');
    
    // Log success
    cy.log('🎊 Test completed successfully! All 4 steps navigated!');
  });
});