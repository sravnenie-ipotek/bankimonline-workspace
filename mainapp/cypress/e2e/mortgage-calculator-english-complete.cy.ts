/**
 * Mortgage Calculator - Complete Test (English Version)
 * Based on actual English page structure
 */

describe('Mortgage Calculator - Complete Journey to Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    // Clear all storage
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.viewport(1920, 1080);
  });

  it('should fill all fields and successfully reach step 4 with bank offers', () => {
    // Visit Step 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(5000); // Wait for page and API calls
    cy.screenshot('01-step1-loaded');
    
    cy.log('🏠 Step 1: Property and Loan Details');
    
    // Verify we're on the English page
    cy.contains('Calculate Mortgage').should('be.visible');
    
    // 1. Property price - already filled with 2,500,000
    cy.get('input[type="text"]').first()
      .should('have.value', '2,500,000')
      .clear()
      .type('2500000');
    cy.wait(500);
    cy.screenshot('02-property-price');
    
    // 2. City dropdown
    cy.log('Selecting city...');
    cy.contains('City').parent().parent().find('select, .react-dropdown-select').click();
    cy.wait(1500); // Wait for cities to load
    
    // Select first available city or Tel Aviv
    cy.get('[class*="react-dropdown-select-item"], [class*="option"], li').then($items => {
      if ($items.length > 0) {
        // Try to find Tel Aviv
        const telAviv = Array.from($items).find(el => 
          el.textContent && (el.textContent.includes('Tel Aviv') || el.textContent.includes('תל אביב'))
        );
        if (telAviv) {
          cy.wrap(telAviv).click();
        } else {
          // Click first city
          cy.wrap($items.first()).click();
        }
      }
    });
    cy.wait(500);
    cy.screenshot('03-city-selected');
    
    // 3. When do you need the mortgage?
    cy.log('Selecting when needed...');
    cy.contains('When do you need the mortgage?').parent().parent().find('select, .react-dropdown-select').click();
    cy.wait(500);
    cy.get('[class*="react-dropdown-select-item"], [class*="option"], li').first().click();
    cy.wait(500);
    cy.screenshot('04-when-needed');
    
    // 4. Down payment - update the text input (not the slider)
    cy.log('Setting down payment...');
    cy.get('input[type="text"]').eq(1)
      .clear()
      .type('625000'); // 25% of 2.5M
    cy.wait(500);
    cy.screenshot('05-down-payment');
    
    // 5. Mortgage type
    cy.log('Selecting mortgage type...');
    cy.contains('Mortgage type').parent().parent().find('select, .react-dropdown-select').click();
    cy.wait(500);
    cy.get('[class*="react-dropdown-select-item"], [class*="option"], li').first().click();
    cy.wait(500);
    cy.screenshot('06-mortgage-type');
    
    // 6. Is this a first home?
    cy.log('Selecting first home status...');
    cy.contains('Is this a first home?').parent().parent().find('select, .react-dropdown-select').click();
    cy.wait(500);
    cy.get('[class*="react-dropdown-select-item"], [class*="option"], li').first().click(); // Select "Yes"
    cy.wait(500);
    cy.screenshot('07-first-home');
    
    // 7. Property Ownership Status (important - affects financing percentage)
    cy.log('Selecting property ownership status...');
    cy.contains('Property Ownership Status').parent().parent().find('select, .react-dropdown-select').click();
    cy.wait(500);
    cy.get('[class*="react-dropdown-select-item"], [class*="option"], li').first().click(); // "I don't own any property"
    cy.wait(500);
    cy.screenshot('08-property-ownership');
    
    // 8. Adjust sliders if needed
    // Desired mortgage period - already at 4 years
    // Monthly payment - already set
    cy.screenshot('09-all-fields-complete');
    
    // Find and click the Continue/Next button
    cy.log('🚀 Clicking continue...');
    cy.get('button').then($buttons => {
      // Look for button with continue/next text
      const continueBtn = Array.from($buttons).find(btn => {
        const text = btn.textContent || '';
        return text.includes('Continue') || 
               text.includes('Next') || 
               text.includes('הבא') || 
               text.includes('המשך');
      });
      
      if (continueBtn && !continueBtn.disabled) {
        cy.wrap(continueBtn).click();
      } else {
        // Try clicking any primary button
        cy.get('button.btn-primary, button[type="submit"]').first().click();
      }
    });
    
    cy.wait(3000);
    cy.screenshot('10-after-continue');
    
    // Handle authentication modal if it appears
    cy.get('body').then($body => {
      const hasPhoneInput = $body.find('input[type="tel"]').length > 0;
      const hasModal = $body.find('.modal, [role="dialog"]').length > 0;
      
      if (hasPhoneInput || hasModal) {
        cy.log('🔐 Authentication required');
        
        // Enter phone
        cy.get('input[type="tel"], input[placeholder*="Phone"], input[placeholder*="phone"]')
          .first()
          .clear()
          .type(testPhone);
        cy.screenshot('11-phone-entered');
        
        // Send code
        cy.get('button').filter((i, el) => {
          const text = el.textContent || '';
          return text.includes('Send') || 
                 text.includes('Get') || 
                 text.includes('קבל') || 
                 text.includes('שלח');
        }).first().click();
        
        cy.wait(2000);
        
        // Enter OTP
        cy.get('input').last().type(testOTP);
        cy.screenshot('12-otp-entered');
        
        // Verify
        cy.get('button').filter((i, el) => {
          const text = el.textContent || '';
          return text.includes('Verify') || 
                 text.includes('Confirm') || 
                 text.includes('אמת') || 
                 text.includes('אישור');
        }).first().click();
        
        cy.wait(3000);
      }
    });
    
    // Step 2: Personal Information
    cy.url().then(url => {
      if (url.includes('/services/calculate-mortgage/2')) {
        cy.log('✅ Step 2 reached - Personal Information');
        cy.screenshot('13-step2-reached');
        
        // Fill personal details
        // Name
        cy.get('input[type="text"]').first().type('John Smith');
        
        // Birthday
        cy.get('input[type="date"], input[placeholder*="Birth"], input[placeholder*="Date"]')
          .first()
          .type('1985-05-15');
        
        // Education level
        cy.get('select, .react-dropdown-select').first().click();
        cy.wait(300);
        cy.get('[class*="item"], [class*="option"], li').eq(1).click(); // Academic
        
        // Radio buttons - select "No" for questions
        cy.get('input[type="radio"]').then($radios => {
          // Select every second radio (usually "No" options)
          for (let i = 1; i < $radios.length; i += 2) {
            cy.wrap($radios[i]).check({ force: true });
          }
        });
        
        // Number of borrowers
        cy.get('select, .react-dropdown-select').eq(1).click();
        cy.wait(300);
        cy.get('[class*="item"], [class*="option"], li').contains('1').click();
        
        // Family status
        cy.get('select, .react-dropdown-select').eq(2).click();
        cy.wait(300);
        cy.get('[class*="item"], [class*="option"], li').first().click();
        
        cy.screenshot('14-step2-filled');
        
        // Continue to Step 3
        cy.get('button').contains(/Continue|Next|הבא|המשך/).click();
        cy.wait(3000);
      }
    });
    
    // Step 3: Income Information
    cy.url().then(url => {
      if (url.includes('/services/calculate-mortgage/3')) {
        cy.log('✅ Step 3 reached - Income Information');
        cy.screenshot('15-step3-reached');
        
        // Employment type
        cy.get('select, .react-dropdown-select').first().click();
        cy.wait(500);
        cy.get('[class*="item"], [class*="option"], li').contains(/Employed|Employee|שכיר/).click();
        
        // Monthly income
        cy.get('input[type="text"], input[type="number"]').first().type('25000');
        
        // Additional income - None
        cy.get('select, .react-dropdown-select').eq(1).click();
        cy.wait(300);
        cy.get('[class*="item"], [class*="option"], li').last().click(); // Usually "None"
        
        // Financial obligations - None
        cy.get('select, .react-dropdown-select').eq(2).click();
        cy.wait(300);
        cy.get('[class*="item"], [class*="option"], li').first().click(); // No obligations
        
        cy.screenshot('16-step3-filled');
        
        // Continue to Step 4
        cy.get('button').contains(/Continue|Next|הבא|המשך/).click();
        cy.wait(6000); // Longer wait for bank calculations
      }
    });
    
    // Step 4: Bank Offers
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.log('🎉 SUCCESS! Step 4 reached - Bank Offers!');
    cy.screenshot('17-step4-SUCCESS');
    
    // Verify bank offers are displayed
    cy.get('[class*="bank"], [class*="card"], .bank-offer, .offer-card', { timeout: 10000 })
      .should('exist')
      .should('be.visible');
    cy.screenshot('18-bank-offers-visible');
    
    // Check for filter/sort options
    cy.get('select, [class*="filter"], [class*="sort"]').should('exist');
    cy.screenshot('19-filters-available');
    
    // Final success screenshot
    cy.screenshot('20-FINAL-ALL-4-STEPS-COMPLETE-SUCCESS');
    
    cy.log('🎊 Test completed successfully! All 4 steps navigated and bank offers displayed!');
  });
});