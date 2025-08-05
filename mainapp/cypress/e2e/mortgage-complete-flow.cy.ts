/**
 * Mortgage Calculator Complete Flow Test
 * Tests the complete mortgage calculation process through all 4 steps
 */

describe('Mortgage Calculator - Complete Flow', () => {
  const testData = {
    // Authentication
    phone: '0544123456',
    otp: '123456',
    // Step 1 - Property Details
    propertyPrice: '2000000',
    initialPayment: '500000',
    monthlyPayment: '10000',
    loanPeriod: '25',
    // Step 2 - Personal Info
    fullName: 'ישראל ישראלי',
    birthday: '1985-05-15',
    // Step 3 - Income
    monthlyIncome: '25000'
  };

  beforeEach(() => {
    // Clear all state
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.viewport(1920, 1080);
    
    // Visit mortgage calculator
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(3000);
  });

  it('should complete the entire mortgage process through all 4 steps', () => {
    cy.log('🏠 Starting Mortgage Calculator Complete Flow Test');
    
    // ========================================
    // STEP 1: PROPERTY AND LOAN DETAILS
    // ========================================
    cy.log('📝 Step 1: Property and Loan Details');
    
    // 1. Property price
    cy.get('[data-testid="property-price-input"]')
      .should('be.visible')
      .type(testData.propertyPrice);
    cy.wait(500);
    
    // 2. City selection - select first available
    cy.get('[data-testid="city-dropdown"]').click();
    cy.wait(2000); // Wait for cities to load
    cy.get('[data-testid^="city-dropdown-item-"]').first().click();
    cy.wait(500);
    
    // 3. When needed - select first option
    cy.get('[data-testid="when-needed-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid^="when-needed-dropdown-item-"]').first().click();
    cy.wait(500);
    
    // 4. Property type - select first option
    cy.get('[data-testid="property-type-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid^="property-type-dropdown-item-"]').first().click();
    cy.wait(500);
    
    // 5. First home - select first option
    cy.get('[data-testid="first-home-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid^="first-home-dropdown-item-"]').first().click();
    cy.wait(500);
    
    // 6. Property ownership - select "no property" for 75% LTV
    cy.get('[data-testid="property-ownership-dropdown"]').click();
    cy.wait(500);
    cy.get('[data-testid="property-ownership-dropdown-item-no_property"]').click();
    cy.wait(1000);
    
    // 7. Initial payment
    cy.get('[data-testid="initial-fee-input"]')
      .clear()
      .type(testData.initialPayment);
    cy.wait(500);
    
    // 8. Scroll down to see credit parameters
    cy.scrollTo('bottom');
    cy.wait(500);
    
    // 9. Set monthly payment using the credit params section
    // Look for the monthly payment input by its container
    cy.contains('תשלום חודשי').parent().parent().within(() => {
      cy.get('input[type="text"]')
        .clear()
        .type(testData.monthlyPayment);
    });
    cy.wait(500);
    
    // 10. Set loan period
    cy.contains('תקופת משכנתא').parent().parent().within(() => {
      cy.get('input[type="text"]')
        .clear()
        .type(testData.loanPeriod);
    });
    cy.wait(500);
    
    // Take screenshot before continuing
    cy.screenshot('step1-complete');
    
    // 11. Click continue button
    cy.get('button').contains('הבא').click();
    cy.wait(3000);
    
    // ========================================
    // HANDLE AUTHENTICATION IF REQUIRED
    // ========================================
    cy.get('body').then($body => {
      if ($body.find('input[type="tel"]').length > 0) {
        cy.log('🔐 Authentication modal detected');
        
        // Enter phone
        cy.get('input[type="tel"]').type(testData.phone);
        cy.wait(500);
        
        // Click send code
        cy.get('button').contains(/קבל|שלח/).click();
        cy.wait(2000);
        
        // Enter OTP
        cy.get('input').last().type(testData.otp);
        cy.wait(500);
        
        // Click verify
        cy.get('button').contains(/אמת|אישור/).click();
        cy.wait(3000);
      }
    });
    
    // ========================================
    // STEP 2: PERSONAL INFORMATION
    // ========================================
    cy.log('📝 Step 2: Personal Information');
    cy.url().should('include', '/services/calculate-mortgage/2');
    cy.wait(2000);
    
    // Fill name
    cy.get('input[type="text"]').first().type(testData.fullName);
    cy.wait(500);
    
    // Fill birthday
    cy.get('input[type="date"]').first().type(testData.birthday);
    cy.wait(500);
    
    // Select education - second option (Bachelor's)
    cy.get('.react-dropdown-select, [class*="dropdown"]').first().click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').eq(2).click();
    cy.wait(500);
    
    // Answer radio questions - select "No" for all
    cy.get('input[type="radio"]').then($radios => {
      for (let i = 1; i < $radios.length; i += 2) {
        cy.wrap($radios[i]).check({ force: true });
      }
    });
    cy.wait(500);
    
    // Number of borrowers - 1
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(1).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').contains('1').click();
    cy.wait(500);
    
    // Family status - first option
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(2).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').first().click();
    cy.wait(500);
    
    cy.screenshot('step2-complete');
    
    // Continue to Step 3
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(3000);
    
    // ========================================
    // STEP 3: INCOME AND EMPLOYMENT
    // ========================================
    cy.log('💰 Step 3: Income and Employment');
    cy.url().should('include', '/services/calculate-mortgage/3');
    cy.wait(2000);
    
    // Employment type - Employee
    cy.get('.react-dropdown-select, [class*="dropdown"]').first().click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]')
      .contains(/שכיר|Employee/)
      .click();
    cy.wait(500);
    
    // Monthly income
    cy.get('input[type="text"], input[type="number"]')
      .first()
      .clear()
      .type(testData.monthlyIncome);
    cy.wait(500);
    
    // Additional income - None
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(1).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]')
      .contains(/אין|None/)
      .click();
    cy.wait(500);
    
    // Financial obligations - None
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(2).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]')
      .contains(/אין|None/)
      .click();
    cy.wait(500);
    
    cy.screenshot('step3-complete');
    
    // Continue to Step 4
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(8000); // Longer wait for bank calculations
    
    // ========================================
    // STEP 4: BANK OFFERS
    // ========================================
    cy.log('🏦 Step 4: Bank Offers');
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.wait(3000);
    
    // Verify bank offers are displayed
    cy.get('[class*="bank"], [class*="offer"], [class*="card"]')
      .should('exist')
      .should('have.length.greaterThan', 0);
    
    // Take final screenshot
    cy.screenshot('step4-bank-offers');
    
    cy.log('✅ SUCCESS! Complete mortgage flow test passed!');
    cy.log('📊 Summary:');
    cy.log(`- Property: ₪${parseInt(testData.propertyPrice).toLocaleString()}`);
    cy.log(`- Down Payment: ₪${parseInt(testData.initialPayment).toLocaleString()}`);
    cy.log(`- Monthly Income: ₪${parseInt(testData.monthlyIncome).toLocaleString()}`);
    cy.log('- Successfully navigated through all 4 steps');
    cy.log('- Bank offers received');
  });

  it('should handle validation errors properly', () => {
    cy.log('🧪 Testing validation error handling');
    
    // Try to continue without filling fields
    cy.get('button').contains('הבא').click();
    cy.wait(1000);
    
    // Should see error messages
    cy.get('[class*="error"], .error-message, .text-red-500')
      .should('be.visible');
    cy.screenshot('validation-errors');
    
    // Fill only property price
    cy.get('[data-testid="property-price-input"]').type('1000000');
    cy.get('button').contains('הבא').click();
    cy.wait(1000);
    
    // Should still have errors
    cy.get('[class*="error"], .error-message, .text-red-500')
      .should('exist');
  });
});