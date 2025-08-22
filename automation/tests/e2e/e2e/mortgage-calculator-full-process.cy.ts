/**
 * Mortgage Calculator Complete Process Test
 * Tests the full mortgage calculation flow from Step 1 through Step 4
 * Uses data-testid selectors and comprehensive validation
 */

describe('Mortgage Calculator - Complete Process (Steps 1-4)', () => {
  const testData = {
    phone: '0544123456',
    otp: '123456',
    // Step 1 - Property Details
    propertyPrice: 2500000,
    initialPayment: 625000, // 25% down payment
    monthlyPayment: 10000,
    loanPeriod: 25,
    // Step 2 - Personal Information
    fullName: 'ישראל ישראלי',
    birthday: '1985-05-15',
    // Step 3 - Income Information
    monthlyIncome: 25000,
  };

  beforeEach(() => {
    // Clear all browser state
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.viewport(1920, 1080);
    
    // Visit the mortgage calculator
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(3000); // Wait for initial load
  });

  it('should complete the entire mortgage calculation process through all 4 steps', () => {
    cy.log('🏠 Starting Mortgage Calculator Test - Full Process');
    
    // ========================================
    // STEP 1: PROPERTY AND LOAN DETAILS
    // ========================================
    cy.log('📝 Step 1: Property and Loan Details');
    cy.url().should('include', '/services/calculate-mortgage/1');
    cy.screenshot('step1-01-initial-load');
    
    // Fill property price
    cy.log('Filling property price...');
    cy.get('[data-testid="property-price-input"]')
      .should('be.visible')
      .clear()
      .type(testData.propertyPrice.toString());
    cy.wait(500);
    cy.screenshot('step1-02-property-price');
    
    // Select city
    cy.log('Selecting city...');
    cy.get('[data-testid="city-dropdown"]')
      .should('be.visible')
      .click();
    cy.wait(1500); // Wait for dropdown to open and cities to load
    
    // Try to find Tel Aviv or select the first city
    cy.get('[data-testid^="city-dropdown-item-"]')
      .first()
      .click();
    cy.wait(500);
    cy.screenshot('step1-03-city-selected');
    
    // Select when money is needed
    cy.log('Selecting when money is needed...');
    cy.get('[data-testid="when-needed-dropdown"]')
      .should('be.visible')
      .click();
    cy.wait(500);
    cy.get('[data-testid="when-needed-dropdown-item-1"]')
      .click();
    cy.wait(500);
    cy.screenshot('step1-04-when-needed');
    
    // Select property type
    cy.log('Selecting property type...');
    cy.get('[data-testid="property-type-dropdown"]')
      .should('be.visible')
      .click();
    cy.wait(500);
    cy.get('[data-testid="property-type-dropdown-item-1"]')
      .click();
    cy.wait(500);
    cy.screenshot('step1-05-property-type');
    
    // Select first home status
    cy.log('Selecting first home status...');
    cy.get('[data-testid="first-home-dropdown"]')
      .should('be.visible')
      .click();
    cy.wait(500);
    cy.get('[data-testid="first-home-dropdown-item-1"]')
      .click();
    cy.wait(500);
    cy.screenshot('step1-06-first-home');
    
    // Select property ownership status (important - affects LTV ratio)
    cy.log('Selecting property ownership status...');
    cy.get('[data-testid="property-ownership-dropdown"]')
      .should('be.visible')
      .click();
    cy.wait(500);
    // Select "no_property" for 75% LTV
    cy.get('[data-testid="property-ownership-dropdown-item-no_property"]')
      .click();
    cy.wait(500);
    cy.screenshot('step1-07-property-ownership');
    
    // Set initial payment (down payment)
    cy.log('Setting initial payment...');
    
    // First, use the slider to set a valid value
    cy.get('[data-testid="initial-fee-input-slider"]').then($slider => {
      if ($slider.length > 0) {
        // If slider exists, use it
        cy.wrap($slider)
          .invoke('val', testData.initialPayment)
          .trigger('input')
          .trigger('change');
      } else {
        // Otherwise, look for the range input within the SliderInput component
        cy.get('[data-testid="initial-fee-input"]').within(() => {
          cy.get('input[type="range"]')
            .invoke('val', testData.initialPayment)
            .trigger('input')
            .trigger('change');
        });
      }
    });
    
    // Then update the text input if needed
    cy.get('[data-testid="initial-fee-input"] input[type="text"]')
      .clear()
      .type(testData.initialPayment.toString());
    cy.wait(500);
    cy.screenshot('step1-08-initial-payment');
    
    // Adjust credit parameters using sliders
    cy.log('Adjusting credit parameters...');
    
    // Set monthly payment using the slider (assuming it's the first slider after initial fee)
    cy.get('input[type="range"]').eq(0).then($slider => {
      const maxValue = $slider.attr('max');
      const desiredValue = Math.min(testData.monthlyPayment, parseInt(maxValue || '15000'));
      cy.wrap($slider)
        .invoke('val', desiredValue)
        .trigger('input')
        .trigger('change');
    });
    cy.wait(500);
    
    // Set loan period using the slider (second slider)
    cy.get('input[type="range"]').eq(1)
      .invoke('val', testData.loanPeriod)
      .trigger('input')
      .trigger('change');
    cy.wait(500);
    cy.screenshot('step1-09-credit-params');
    
    // Click continue button (yellow button with text "הבא")
    cy.log('Clicking continue to next step...');
    cy.get('button')
      .contains('הבא')
      .should('be.visible')
      .click();
    cy.wait(3000);
    
    // ========================================
    // HANDLE AUTHENTICATION MODAL
    // ========================================
    cy.get('body').then($body => {
      const hasPhoneInput = $body.find('input[type="tel"]').length > 0;
      const hasModal = $body.find('.modal, [role="dialog"]').length > 0;
      
      if (hasPhoneInput || hasModal) {
        cy.log('🔐 Authentication modal detected');
        cy.screenshot('auth-01-modal-open');
        
        // Enter phone number
        cy.get('input[type="tel"], input[placeholder*="טלפון"], input[placeholder*="Phone"]')
          .first()
          .should('be.visible')
          .clear()
          .type(testData.phone);
        cy.wait(500);
        cy.screenshot('auth-02-phone-entered');
        
        // Click send code button
        cy.get('button')
          .contains(/קבל|שלח|Send|Get/i)
          .should('be.visible')
          .click();
        cy.wait(2000);
        
        // Enter OTP code
        cy.get('input[type="text"], input[type="number"]')
          .last()
          .should('be.visible')
          .type(testData.otp);
        cy.wait(500);
        cy.screenshot('auth-03-otp-entered');
        
        // Click verify button
        cy.get('button')
          .contains(/אמת|אישור|Verify|Confirm/i)
          .should('be.visible')
          .click();
        cy.wait(3000);
        cy.screenshot('auth-04-verified');
      }
    });
    
    // ========================================
    // STEP 2: PERSONAL INFORMATION
    // ========================================
    cy.log('📝 Step 2: Personal Information');
    cy.url().should('include', '/services/calculate-mortgage/2');
    cy.wait(2000);
    cy.screenshot('step2-01-initial-load');
    
    // Fill personal name
    cy.log('Filling personal details...');
    cy.get('input[type="text"], input[name*="name"], input[placeholder*="שם"]')
      .first()
      .should('be.visible')
      .clear()
      .type(testData.fullName);
    cy.wait(500);
    
    // Fill birthday
    cy.get('input[type="date"], input[name*="birth"], input[placeholder*="תאריך"]')
      .first()
      .should('be.visible')
      .clear()
      .type(testData.birthday);
    cy.wait(500);
    cy.screenshot('step2-02-personal-info');
    
    // Select education level
    cy.log('Selecting education level...');
    cy.get('[class*="dropdown"], select')
      .first()
      .click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"], option')
      .eq(2) // Select third option (usually Bachelor's degree)
      .click();
    cy.wait(500);
    
    // Handle citizenship and residency questions (radio buttons)
    cy.log('Answering citizenship questions...');
    cy.get('input[type="radio"]').then($radios => {
      // Select "No" for sensitive questions (every second radio button)
      for (let i = 1; i < $radios.length; i += 2) {
        cy.wrap($radios[i]).check({ force: true });
      }
    });
    cy.wait(500);
    cy.screenshot('step2-03-citizenship');
    
    // Select number of borrowers
    cy.log('Selecting number of borrowers...');
    cy.get('[class*="dropdown"], select')
      .eq(1)
      .click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"], option')
      .contains('1')
      .click();
    cy.wait(500);
    
    // Select family status
    cy.log('Selecting family status...');
    cy.get('[class*="dropdown"], select')
      .eq(2)
      .click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"], option')
      .first()
      .click();
    cy.wait(500);
    cy.screenshot('step2-04-complete');
    
    // Continue to Step 3
    cy.log('Continuing to Step 3...');
    cy.get('button')
      .contains(/הבא|Next|Continue|המשך/i)
      .should('be.visible')
      .click();
    cy.wait(3000);
    
    // ========================================
    // STEP 3: INCOME AND EMPLOYMENT
    // ========================================
    cy.log('💰 Step 3: Income and Employment Information');
    cy.url().should('include', '/services/calculate-mortgage/3');
    cy.wait(2000);
    cy.screenshot('step3-01-initial-load');
    
    // Select employment type
    cy.log('Selecting employment type...');
    cy.get('[class*="dropdown"], select')
      .first()
      .should('be.visible')
      .click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"], option')
      .contains(/שכיר|Employee|Employed/i)
      .click();
    cy.wait(500);
    cy.screenshot('step3-02-employment-type');
    
    // Enter monthly income
    cy.log('Entering monthly income...');
    cy.get('input[type="text"], input[type="number"], input[name*="income"]')
      .first()
      .should('be.visible')
      .clear()
      .type(testData.monthlyIncome.toString());
    cy.wait(500);
    cy.screenshot('step3-03-income');
    
    // Select additional income sources (None)
    cy.log('Selecting additional income...');
    cy.get('[class*="dropdown"], select')
      .eq(1)
      .click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"], option')
      .contains(/אין|None|No/i)
      .click();
    cy.wait(500);
    
    // Select financial obligations (None)
    cy.log('Selecting financial obligations...');
    cy.get('[class*="dropdown"], select')
      .eq(2)
      .click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"], option')
      .contains(/אין|None|No/i)
      .click();
    cy.wait(500);
    cy.screenshot('step3-04-complete');
    
    // Continue to Step 4 (Bank Offers)
    cy.log('Continuing to Step 4 - Bank Offers...');
    cy.get('button')
      .contains(/הבא|Next|Continue|המשך/i)
      .should('be.visible')
      .click();
    cy.wait(6000); // Longer wait for bank calculations
    
    // ========================================
    // STEP 4: BANK OFFERS
    // ========================================
    cy.log('🏦 Step 4: Bank Offers and Program Selection');
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.wait(3000); // Extra wait for offers to load
    cy.screenshot('step4-01-initial-load');
    
    // Verify we reached the bank offers page
    cy.get('[class*="bank"], [class*="offer"], [class*="card"]')
      .should('exist')
      .should('have.length.greaterThan', 0);
    
    // Check for essential elements
    cy.log('Verifying bank offers are displayed...');
    
    // Look for bank names or logos
    cy.get('[class*="bank-name"], [class*="bank-title"], img[alt*="bank"]')
      .should('exist');
    cy.screenshot('step4-02-bank-offers');
    
    // Check for interest rates
    cy.get('[class*="rate"], [class*="interest"], [class*="ריבית"]')
      .should('exist');
    
    // Check for monthly payment amounts
    cy.get('[class*="payment"], [class*="תשלום"]')
      .should('exist');
    cy.screenshot('step4-03-offer-details');
    
    // Verify filter/sort options exist
    cy.log('Checking for filter options...');
    cy.get('select, [class*="filter"], [class*="sort"], button[class*="filter"]')
      .should('exist');
    cy.screenshot('step4-04-filters');
    
    // Try to interact with the first bank offer
    cy.log('Interacting with bank offers...');
    cy.get('[class*="bank"], [class*="offer"], [class*="card"]')
      .first()
      .click({ force: true });
    cy.wait(1000);
    cy.screenshot('step4-05-offer-selected');
    
    // Final success validation
    cy.log('✅ SUCCESS! All 4 steps completed successfully!');
    cy.screenshot('step4-06-final-success');
    
    // Log summary
    cy.log('📊 Test Summary:');
    cy.log(`- Property Price: ₪${testData.propertyPrice.toLocaleString()}`);
    cy.log(`- Down Payment: ₪${testData.initialPayment.toLocaleString()}`);
    cy.log(`- Monthly Income: ₪${testData.monthlyIncome.toLocaleString()}`);
    cy.log(`- Loan Period: ${testData.loanPeriod} years`);
    cy.log('- Successfully navigated through all 4 steps');
    cy.log('- Bank offers received and displayed');
  });

  it('should handle validation errors properly', () => {
    cy.log('🧪 Testing validation error handling');
    
    // Try to continue without filling required fields
    cy.get('button')
      .contains(/הבא|Next|Continue|המשך/i)
      .click();
    cy.wait(1000);
    
    // Should show validation errors
    cy.get('[class*="error"], .error-message')
      .should('be.visible');
    cy.screenshot('validation-errors-displayed');
    
    // Fill only property price and try again
    cy.get('[data-testid="property-price-input"]')
      .clear()
      .type('1000000');
    
    cy.get('button')
      .contains(/הבא|Next|Continue|המשך/i)
      .click();
    cy.wait(1000);
    
    // Should still show errors for other required fields
    cy.get('[class*="error"], .error-message')
      .should('exist');
  });

  it('should handle property ownership LTV changes correctly', () => {
    cy.log('🏠 Testing property ownership LTV ratio changes');
    
    // Set property price
    cy.get('[data-testid="property-price-input"]')
      .clear()
      .type('1000000');
    cy.wait(500);
    
    // Test "no property" - 75% LTV (25% down payment minimum)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown-item-no_property"]').click();
    cy.wait(1000);
    
    // Verify minimum down payment is 250,000 (25%)
    cy.get('[data-testid="initial-fee-input"]')
      .should('have.attr', 'min')
      .and('equal', '250000');
    cy.screenshot('ltv-no-property-75');
    
    // Test "has property" - 50% LTV (50% down payment minimum)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown-item-has_property"]').click();
    cy.wait(1000);
    
    // Verify minimum down payment is 500,000 (50%)
    cy.get('[data-testid="initial-fee-input"]')
      .should('have.attr', 'min')
      .and('equal', '500000');
    cy.screenshot('ltv-has-property-50');
    
    // Test "selling property" - 70% LTV (30% down payment minimum)
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.get('[data-testid="property-ownership-dropdown-item-selling_property"]').click();
    cy.wait(1000);
    
    // Verify minimum down payment is 300,000 (30%)
    cy.get('[data-testid="initial-fee-input"]')
      .should('have.attr', 'min')
      .and('equal', '300000');
    cy.screenshot('ltv-selling-property-70');
  });
});