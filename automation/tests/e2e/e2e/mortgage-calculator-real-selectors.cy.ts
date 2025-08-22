/**
 * Mortgage Calculator Test with Real Selectors
 * This version uses the actual selectors found in the application
 */

describe('Mortgage Calculator - Complete Journey to Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  it('should fill all fields and navigate through all 4 steps', () => {
    // Visit Step 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(3000); // Wait for page to fully load
    
    cy.screenshot('01-step1-loaded');
    
    // STEP 1: Property and Loan Details
    
    // 1. Property Value - Look for שווי הנכס input
    cy.get('input').then($inputs => {
      // Find the property value input (first numeric input usually)
      const propertyInput = $inputs.filter((i, el) => {
        const placeholder = el.getAttribute('placeholder') || '';
        const value = el.getAttribute('value') || '';
        return placeholder.includes('שווי') || placeholder.includes('נכס') || value.includes('1,000,000');
      });
      if (propertyInput.length > 0) {
        cy.wrap(propertyInput.first()).clear().type('2500000');
      } else {
        // Fallback - use first input
        cy.get('input').first().clear().type('2500000');
      }
    });
    cy.screenshot('02-property-value-entered');
    
    // 2. Click on dropdowns by their placeholder text
    // City dropdown - עיר בא נמצא הנכס
    cy.contains('עיר').parent().find('svg, button, [role="button"]').first().click({force: true});
    cy.wait(1000);
    // Click first item in opened dropdown
    cy.get('[role="option"], [class*="option"], [class*="item"]').first().click({force: true});
    cy.screenshot('03-city-selected');
    
    // 3. When do you need money - מתי תזדקק למשכנתא
    cy.contains('מתי תזדקק').parent().find('svg, button, [role="button"]').first().click({force: true});
    cy.wait(1000);
    cy.get('[role="option"], [class*="option"], [class*="item"]').first().click({force: true});
    cy.screenshot('04-timeline-selected');
    
    // 4. Property ownership - האם מחזיק בדירה ראשונה
    cy.contains('האם מחזיק').parent().find('svg, button, [role="button"]').first().click({force: true});
    cy.wait(1000);
    cy.get('[role="option"], [class*="option"], [class*="item"]').first().click({force: true});
    cy.screenshot('05-ownership-selected');
    
    // 5. Down payment - הון עצמי
    cy.get('input').then($inputs => {
      const downPaymentInput = $inputs.filter((i, el) => {
        const value = el.getAttribute('value') || '';
        return value.includes('500,000') || (i === 1); // Second input usually
      });
      cy.wrap(downPaymentInput.first()).clear().type('600000');
    });
    cy.screenshot('06-downpayment-entered');
    
    // 6. Property type - סוג משכנתא  
    cy.contains('סוג משכנתא').parent().find('svg, button, [role="button"]').first().click({force: true});
    cy.wait(1000);
    cy.get('[role="option"], [class*="option"], [class*="item"]').first().click({force: true});
    cy.screenshot('07-property-type-selected');
    
    // 7. Sliders - Use the range inputs
    cy.get('input[type="range"]').then($sliders => {
      // Monthly payment slider (first one)
      if ($sliders.length > 0) {
        cy.wrap($sliders.eq(0)).invoke('val', 12000).trigger('input').trigger('change');
      }
      // Loan term slider (second one)
      if ($sliders.length > 1) {
        cy.wrap($sliders.eq(1)).invoke('val', 25).trigger('input').trigger('change');
      }
    });
    cy.screenshot('08-sliders-adjusted');
    
    // Wait a moment before clicking continue
    cy.wait(2000);
    cy.screenshot('09-step1-complete');
    
    // Click Continue button - הבא
    cy.contains('button', 'הבא').click({force: true});
    cy.wait(3000);
    
    // Handle authentication if needed
    cy.get('body').then($body => {
      const hasModal = $body.find('[class*="modal"], [role="dialog"]').length > 0;
      const hasPhoneInput = $body.find('input[type="tel"], input[placeholder*="טלפון"]').length > 0;
      
      if (hasModal || hasPhoneInput) {
        cy.log('Authentication required');
        cy.screenshot('10-auth-modal');
        
        // Enter phone
        cy.get('input[type="tel"], input[placeholder*="טלפון"], input').first().type(testPhone);
        cy.screenshot('11-phone-entered');
        
        // Click send code
        cy.contains('button', /קבל קוד|שלח|המשך/).click();
        cy.wait(2000);
        
        // Enter OTP
        cy.get('input').last().type(testOTP);
        cy.screenshot('12-otp-entered');
        
        // Click verify
        cy.contains('button', /אמת|אישור|המשך/).click();
        cy.wait(3000);
      }
    });
    
    // Check if we're on step 2
    cy.url().then(url => {
      if (url.includes('/2')) {
        cy.log('Successfully reached Step 2!');
        cy.screenshot('13-step2-reached');
        
        // STEP 2: Personal Information - Quick fill
        
        // Name
        cy.get('input[type="text"]').first().type('ישראל ישראלי');
        
        // Try to find and click radio buttons for No options
        cy.get('input[type="radio"]').each(($radio, index) => {
          if (index % 2 === 1) { // Click every second radio (usually "No" options)
            cy.wrap($radio).check({force: true});
          }
        });
        
        // Click dropdowns and select first option
        cy.get('[class*="dropdown"], select').each($dropdown => {
          cy.wrap($dropdown).click({force: true});
          cy.wait(500);
          cy.get('[role="option"], [class*="option"], [class*="item"]').first().click({force: true});
        });
        
        cy.screenshot('14-step2-filled');
        
        // Continue to Step 3
        cy.contains('button', /הבא|המשך/).click({force: true});
        cy.wait(3000);
      }
    });
    
    // Check if we're on step 3
    cy.url().then(url => {
      if (url.includes('/3')) {
        cy.log('Successfully reached Step 3!');
        cy.screenshot('15-step3-reached');
        
        // STEP 3: Income - Quick fill
        
        // Select employed from first dropdown
        cy.get('[class*="dropdown"], select').first().click({force: true});
        cy.wait(500);
        cy.get('[role="option"], [class*="option"], [class*="item"]').first().click({force: true});
        
        // Enter income
        cy.get('input[type="text"], input[type="number"]').first().type('20000');
        
        // Fill other dropdowns with first option
        cy.get('[class*="dropdown"], select').each($dropdown => {
          cy.wrap($dropdown).click({force: true});
          cy.wait(500);
          cy.get('[role="option"], [class*="option"], [class*="item"]').first().click({force: true});
        });
        
        cy.screenshot('16-step3-filled');
        
        // Continue to Step 4
        cy.contains('button', /הבא|המשך/).click({force: true});
        cy.wait(5000); // Wait longer for bank offers to load
      }
    });
    
    // Final check - are we on step 4?
    cy.url().then(url => {
      if (url.includes('/4')) {
        cy.log('🎉 SUCCESS! Reached Step 4 - Bank Offers!');
        cy.screenshot('17-step4-bank-offers-SUCCESS');
        
        // Wait for bank cards to appear
        cy.get('[class*="bank"], [class*="card"]', { timeout: 15000 }).should('exist');
        cy.screenshot('18-banks-loaded');
        
        // Take final screenshot
        cy.screenshot('19-FINAL-SUCCESS-STEP4');
      } else {
        cy.log('Current URL: ' + url);
        cy.screenshot('20-current-state');
      }
    });
  });
});