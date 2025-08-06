/**
 * Fixed Mortgage Calculator Test - Fills ALL fields and reaches Step 4
 * Based on actual form structure from screenshots
 */

describe('Mortgage Calculator - Complete Flow to Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  it('should fill ALL fields and reach step 4', () => {
    // Start at Step 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(2000); // Give React time to load
    
    // Take screenshot of initial page
    cy.screenshot('step1-initial');
    
    // STEP 1: Fill all property and loan details
    
    // 1. Property Value (שווי הנכס)
    cy.get('input[type="text"]').eq(0).clear().type('2500000');
    cy.screenshot('step1-property-value');
    
    // 2. City where you buy (עיר בא נמצא הנכס) - Click dropdown
    cy.get('[class*="dropdown"]').eq(0).click();
    cy.wait(500);
    // Select first city from dropdown
    cy.get('[class*="dropdown-item"]').first().click();
    cy.screenshot('step1-city-selected');
    
    // 3. When do you need the money (מתי תזדקק למשכנתא)
    cy.get('[class*="dropdown"]').eq(1).click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"]').first().click();
    cy.screenshot('step1-timeline-selected');
    
    // 4. Property ownership (האם מחזיק בדירה ראשונה)
    cy.get('[class*="dropdown"]').eq(2).click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"]').first().click();
    cy.screenshot('step1-ownership-selected');
    
    // 5. Initial payment (הון עצמי) - Use the input field
    cy.get('input[type="text"]').eq(1).clear().type('500000');
    cy.screenshot('step1-downpayment');
    
    // 6. Property type dropdown (סוג משכנתא)
    cy.get('[class*="dropdown"]').eq(3).click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"]').first().click();
    cy.screenshot('step1-property-type');
    
    // 7. Loan term slider - Set to 20 years
    cy.get('input[type="range"]').eq(1).invoke('val', 20).trigger('input').trigger('change');
    cy.screenshot('step1-loan-term');
    
    // 8. Monthly payment slider - Set to 10000
    cy.get('input[type="range"]').eq(0).invoke('val', 10000).trigger('input').trigger('change');
    cy.screenshot('step1-monthly-payment');
    
    // Take final screenshot of completed Step 1
    cy.screenshot('step1-all-fields-filled');
    
    // Click Continue button (המשך)
    cy.get('button').contains('המשך').click();
    cy.wait(2000);
    
    // Handle authentication modal if it appears
    cy.get('body').then($body => {
      if ($body.find('[class*="modal"]').length > 0) {
        cy.log('Authentication modal appeared');
        // Phone input
        cy.get('input[type="tel"], input[placeholder*="טלפון"]').type(testPhone);
        cy.screenshot('auth-phone-entered');
        
        // Click get code button
        cy.get('button').contains(/קבל קוד|שלח/).click();
        cy.wait(1000);
        
        // OTP input
        cy.get('input[placeholder*="קוד"], input[type="text"]').last().type(testOTP);
        cy.screenshot('auth-otp-entered');
        
        // Click verify button
        cy.get('button').contains(/אמת|אישור/).click();
        cy.wait(2000);
      }
    });
    
    // Verify we reached Step 2
    cy.url().should('include', '/services/calculate-mortgage/2');
    cy.screenshot('step2-reached');
    
    // STEP 2: Fill personal information
    
    // Name and surname
    cy.get('input[type="text"]').first().type('ישראל ישראלי');
    cy.screenshot('step2-name');
    
    // Birthday - use date input
    cy.get('input[type="date"], input[placeholder*="תאריך"]').first().type('1985-05-15');
    cy.screenshot('step2-birthday');
    
    // Education dropdown
    cy.get('[class*="dropdown"]').first().click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"]').eq(2).click(); // Select third option
    cy.screenshot('step2-education');
    
    // Additional citizenships - Click No radio button
    cy.get('input[type="radio"]').eq(1).check({force: true});
    
    // Pay taxes in other countries - Click No
    cy.get('input[type="radio"]').eq(3).check({force: true});
    
    // Have children - Click No
    cy.get('input[type="radio"]').eq(5).check({force: true});
    
    // Medical insurance - Click Yes
    cy.get('input[type="radio"]').eq(6).check({force: true});
    
    // Foreign resident - Click No
    cy.get('input[type="radio"]').eq(9).check({force: true});
    
    // Public person - Click No
    cy.get('input[type="radio"]').eq(11).check({force: true});
    
    // Number of borrowers dropdown
    cy.get('[class*="dropdown"]').eq(1).click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"]').first().click(); // Select 1
    cy.screenshot('step2-borrowers');
    
    // Family status dropdown
    cy.get('[class*="dropdown"]').eq(2).click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"]').first().click();
    cy.screenshot('step2-family-status');
    
    // Take screenshot of completed Step 2
    cy.screenshot('step2-all-fields-filled');
    
    // Click Continue to Step 3
    cy.get('button').contains('המשך').click();
    cy.wait(2000);
    
    // Verify we reached Step 3
    cy.url().should('include', '/services/calculate-mortgage/3');
    cy.screenshot('step3-reached');
    
    // STEP 3: Fill income information
    
    // Main source of income dropdown
    cy.get('[class*="dropdown"]').first().click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"]').first().click(); // Select employed
    cy.screenshot('step3-income-source');
    
    // Monthly income
    cy.get('input[type="text"], input[type="number"]').first().type('25000');
    cy.screenshot('step3-income-amount');
    
    // Additional income dropdown
    cy.get('[class*="dropdown"]').eq(1).click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"]').last().click(); // Select "None"
    cy.screenshot('step3-additional-income');
    
    // Obligations dropdown
    cy.get('[class*="dropdown"]').eq(2).click();
    cy.wait(500);
    cy.get('[class*="dropdown-item"]').first().click(); // Select no obligations
    cy.screenshot('step3-obligations');
    
    // Take screenshot of completed Step 3
    cy.screenshot('step3-all-fields-filled');
    
    // Click Continue to Step 4
    cy.get('button').contains('המשך').click();
    cy.wait(3000); // Give time for bank offers to load
    
    // Verify we reached Step 4
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.screenshot('step4-reached-bank-offers');
    
    // STEP 4: Interact with bank offers
    
    // Wait for bank offers to load
    cy.get('[class*="bank"], [class*="card"]', { timeout: 10000 }).should('be.visible');
    cy.screenshot('step4-banks-loaded');
    
    // Check if filter dropdown exists
    cy.get('select, [class*="filter"]').should('exist');
    cy.screenshot('step4-filter-visible');
    
    // Take final screenshot showing we reached step 4
    cy.screenshot('step4-final-success');
    
    cy.log('SUCCESS! Reached Step 4 - Bank Offers');
  });
});