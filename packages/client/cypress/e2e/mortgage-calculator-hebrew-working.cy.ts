/**
 * Mortgage Calculator - Working Test for Hebrew Interface
 * Navigates through all 4 steps to reach bank offers
 */

describe('Mortgage Calculator - Complete 4 Steps Journey', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.viewport(1920, 1080);
  });

  it('should navigate through all steps and reach bank offers (step 4)', () => {
    // Visit Step 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(5000); // Wait for full page load
    cy.screenshot('01-step1-initial-state');
    
    cy.log('📋 Step 1: Property and Loan Details');
    
    // 1. Property value - first input field
    cy.get('input[type="text"]').first()
      .should('be.visible')
      .clear()
      .type('2500000');
    cy.wait(500);
    cy.screenshot('02-property-value-entered');
    
    // 2. City dropdown - "עיר בה נמצא הנכס?"
    cy.log('Selecting city...');
    // Find and click the dropdown by looking for the arrow/chevron icon
    cy.get('.react-dropdown-select, [class*="dropdown"]').first().click();
    cy.wait(1500); // Wait for cities to load
    
    // Type to search for Tel Aviv
    cy.get('input[placeholder*="חיפוש"], .react-dropdown-select-search input, input[type="search"]')
      .should('be.visible')
      .type('תל אביב');
    cy.wait(1000);
    
    // Click on Tel Aviv from results
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]')
      .contains('תל אביב')
      .click();
    cy.wait(500);
    cy.screenshot('03-city-selected');
    
    // 3. When do you need the mortgage - "מתי תזדקק למשכנתא?"
    cy.log('Selecting when needed...');
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(1).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').first().click();
    cy.wait(500);
    cy.screenshot('04-when-needed-selected');
    
    // 4. Property ownership - "האם מחזיק ברירת ראשונה?"
    cy.log('Selecting property ownership...');
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(2).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').first().click();
    cy.wait(500);
    cy.screenshot('05-property-ownership-selected');
    
    // 5. Property type - "סוג משכנתא"
    cy.log('Selecting property type...');
    cy.get('.react-dropdown-select, [class*="dropdown"]').eq(3).click();
    cy.wait(500);
    cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').first().click();
    cy.wait(500);
    cy.screenshot('06-property-type-selected');
    
    // 6. Check if there's another dropdown (first home buyer)
    cy.get('.react-dropdown-select, [class*="dropdown"]').then($dropdowns => {
      if ($dropdowns.length > 4) {
        cy.wrap($dropdowns.eq(4)).click();
        cy.wait(500);
        cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').first().click();
        cy.wait(500);
        cy.screenshot('07-additional-dropdown-selected');
      }
    });
    
    // 7. Initial payment - second text input
    cy.log('Setting initial payment...');
    cy.get('input[type="text"]').eq(1)
      .clear()
      .type('625000'); // 25% down payment
    cy.wait(500);
    cy.screenshot('08-initial-payment-set');
    
    // 8. Adjust sliders if visible
    cy.get('input[type="range"]').then($sliders => {
      if ($sliders.length > 0) {
        // Monthly payment slider
        cy.wrap($sliders[0])
          .invoke('val', 10000)
          .trigger('input')
          .trigger('change');
        
        // Loan period slider
        if ($sliders.length > 1) {
          cy.wrap($sliders[1])
            .invoke('val', 25)
            .trigger('input')
            .trigger('change');
        }
        cy.wait(500);
        cy.screenshot('09-sliders-adjusted');
      }
    });
    
    // Click the yellow continue button - "הבא"
    cy.log('🚀 Clicking continue button...');
    cy.get('button').contains('הבא').should('be.visible').click();
    cy.wait(3000);
    cy.screenshot('10-after-continue-clicked');
    
    // Handle authentication modal
    cy.get('body').then($body => {
      const hasModal = $body.find('.modal, .modal-content, [role="dialog"]').length > 0;
      const hasPhoneInput = $body.find('input[type="tel"]').length > 0;
      
      if (hasModal || hasPhoneInput) {
        cy.log('🔐 Authentication modal appeared');
        
        // Enter phone number
        cy.get('input[type="tel"], input').first()
          .should('be.visible')
          .clear()
          .type(testPhone);
        cy.screenshot('11-phone-number-entered');
        
        // Click send/get code button
        cy.get('button').filter((i, el) => {
          const text = el.textContent || '';
          return text.includes('קבל') || text.includes('שלח') || text.includes('קוד');
        }).first().click();
        cy.wait(2000);
        
        // Enter OTP code
        cy.get('input').last().clear().type(testOTP);
        cy.screenshot('12-otp-code-entered');
        
        // Click verify button
        cy.get('button').filter((i, el) => {
          const text = el.textContent || '';
          return text.includes('אמת') || text.includes('אישור') || text.includes('המשך');
        }).first().click();
        cy.wait(3000);
      }
    });
    
    // Step 2: Personal Information
    cy.url().then(url => {
      if (url.includes('/services/calculate-mortgage/2')) {
        cy.log('✅ Step 2 reached - Personal Information');
        cy.screenshot('13-step2-reached');
        
        // Quick fill Step 2
        // Name
        cy.get('input[type="text"]').first().type('ישראל ישראלי');
        
        // Birthday
        cy.get('input').then($inputs => {
          const dateInput = Array.from($inputs).find(input => 
            input.type === 'date' || 
            (input.placeholder && input.placeholder.includes('תאריך'))
          );
          
          if (dateInput) {
            cy.wrap(dateInput).type('1985-05-15');
          } else {
            cy.get('input[type="text"]').eq(1).type('15/05/1985');
          }
        });
        
        // Education dropdown
        cy.get('.react-dropdown-select, [class*="dropdown"]').first().click();
        cy.wait(300);
        cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').eq(1).click();
        
        // Radio buttons - select "No" (לא) for all
        cy.get('input[type="radio"]').then($radios => {
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
        
        cy.screenshot('14-step2-filled');
        
        // Continue to Step 3
        cy.get('button').contains(/הבא|המשך/).click();
        cy.wait(3000);
      }
    });
    
    // Step 3: Income Information
    cy.url().then(url => {
      if (url.includes('/services/calculate-mortgage/3')) {
        cy.log('✅ Step 3 reached - Income Information');
        cy.screenshot('15-step3-reached');
        
        // Employment type
        cy.get('.react-dropdown-select, [class*="dropdown"]').first().click();
        cy.wait(500);
        cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').contains('שכיר').click();
        
        // Monthly income
        cy.get('input[type="text"], input[type="number"]').first().clear().type('25000');
        
        // Additional income - None
        cy.get('.react-dropdown-select, [class*="dropdown"]').eq(1).click();
        cy.wait(300);
        cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').last().click();
        
        // Obligations - None
        cy.get('.react-dropdown-select, [class*="dropdown"]').eq(2).click();
        cy.wait(300);
        cy.get('.react-dropdown-select-item, [class*="dropdown-item"]').first().click();
        
        cy.screenshot('16-step3-filled');
        
        // Continue to Step 4
        cy.get('button').contains(/הבא|המשך/).click();
        cy.wait(6000); // Longer wait for bank calculations
      }
    });
    
    // Verify we reached Step 4
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.log('🎉 SUCCESS! Step 4 reached - Bank Offers!');
    cy.screenshot('17-step4-SUCCESS');
    
    // Verify bank offers are visible
    cy.get('.bank-card, [class*="bank"], [class*="offer"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible');
    cy.screenshot('18-bank-offers-displayed');
    
    // Final success screenshot
    cy.screenshot('19-FINAL-ALL-4-STEPS-COMPLETE');
    
    cy.log('🎊 Test completed! Successfully navigated through all 4 steps!');
  });
});