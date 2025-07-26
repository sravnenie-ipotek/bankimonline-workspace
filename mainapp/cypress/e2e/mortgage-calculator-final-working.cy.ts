/**
 * Mortgage Calculator - Final Working Test
 * Based on actual page structure from screenshots
 */

describe('Mortgage Calculator - Navigate to Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    // Clear all storage
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.viewport(1920, 1080);
  });

  it('should fill all fields and reach step 4 with bank offers', () => {
    // Visit Step 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(5000); // Wait for page load and API calls
    cy.screenshot('01-step1-initial');
    
    cy.log('🏠 Step 1: Property and Loan Details');
    
    // Fill property value (first text input)
    cy.get('input[type="text"]').first()
      .should('be.visible')
      .clear()
      .type('2500000');
    cy.wait(500);
    cy.screenshot('02-property-value');
    
    // Handle dropdowns - they appear to have dropdown icons (arrow down)
    // Based on the Hebrew text visible in screenshot, fill each dropdown
    
    // 1. City dropdown - "עיר בה נמצא הנכס?"
    cy.log('Selecting city...');
    // Click the first dropdown arrow
    cy.get('[class*="arrow"], [class*="dropdown"], svg').first().parent().click();
    cy.wait(1500); // Wait for dropdown to open
    
    // Try to find and click Tel Aviv or any city
    cy.get('[class*="item"], [class*="option"], li').then($items => {
      if ($items.length > 0) {
        // Look for Tel Aviv first
        const telAviv = Array.from($items).find(el => 
          el.textContent && el.textContent.includes('תל אביב')
        );
        if (telAviv) {
          cy.wrap(telAviv).click();
        } else {
          // Click first available option
          cy.wrap($items.first()).click();
        }
      }
    });
    cy.wait(500);
    cy.screenshot('03-city-selected');
    
    // 2. "מתי תזדקק למשכנתא?" - When do you need mortgage
    cy.log('Selecting when needed...');
    cy.get('[class*="arrow"], [class*="dropdown"], svg').eq(1).parent().click();
    cy.wait(500);
    cy.get('[class*="item"], [class*="option"], li').first().click();
    cy.wait(500);
    cy.screenshot('04-when-needed');
    
    // 3. "האם מחזיק ברירת ראשונה?" - Property ownership
    cy.log('Selecting property ownership...');
    cy.get('[class*="arrow"], [class*="dropdown"], svg').eq(2).parent().click();
    cy.wait(500);
    cy.get('[class*="item"], [class*="option"], li').first().click();
    cy.wait(500);
    cy.screenshot('05-property-ownership');
    
    // 4. "סוג משכנתא" - Mortgage type
    cy.log('Selecting mortgage type...');
    cy.get('[class*="arrow"], [class*="dropdown"], svg').eq(3).parent().click();
    cy.wait(500);
    cy.get('[class*="item"], [class*="option"], li').first().click();
    cy.wait(500);
    cy.screenshot('06-mortgage-type');
    
    // 5. Additional dropdown if exists
    cy.get('[class*="arrow"], [class*="dropdown"], svg').then($dropdowns => {
      if ($dropdowns.length > 4) {
        cy.wrap($dropdowns.eq(4)).parent().click();
        cy.wait(500);
        cy.get('[class*="item"], [class*="option"], li').first().click();
        cy.wait(500);
      }
    });
    
    // Fill initial payment (second text input)
    cy.log('Setting initial payment...');
    cy.get('input[type="text"]').eq(1)
      .should('be.visible')
      .clear()
      .type('625000'); // 25% down payment
    cy.wait(500);
    cy.screenshot('07-initial-payment');
    
    // Handle sliders if they exist
    cy.get('input[type="range"]').then($sliders => {
      if ($sliders.length > 0) {
        // Monthly payment
        cy.wrap($sliders[0])
          .invoke('val', 10000)
          .trigger('input')
          .trigger('change');
        
        if ($sliders.length > 1) {
          // Loan term
          cy.wrap($sliders[1])
            .invoke('val', 25)
            .trigger('input')
            .trigger('change');
        }
      }
    });
    cy.screenshot('08-all-fields-filled');
    
    // Click continue button - it should be yellow "הבא" button
    cy.log('🚀 Clicking continue...');
    cy.get('button').then($buttons => {
      // Find the yellow continue button
      const continueBtn = Array.from($buttons).find(btn => {
        const text = btn.textContent || '';
        const hasText = text.includes('הבא') || text.includes('המשך');
        const bgColor = window.getComputedStyle(btn).backgroundColor;
        const isYellow = bgColor.includes('255, 193') || // rgb(255, 193, 7)
                        bgColor.includes('255, 204') || // Alternative yellow
                        bgColor.includes('ffc') || // Hex yellow
                        btn.classList.contains('btn-primary') ||
                        btn.classList.contains('btn-warning');
        return hasText && (isYellow || !btn.disabled);
      });
      
      if (continueBtn) {
        cy.wrap(continueBtn).click();
      } else {
        // Fallback: click any enabled button with continue text
        cy.contains('button', /הבא|המשך/)
          .should('not.be.disabled')
          .click();
      }
    });
    
    cy.wait(3000);
    cy.screenshot('09-after-continue');
    
    // Handle authentication if it appears
    cy.get('body').then($body => {
      const hasPhoneInput = $body.find('input[type="tel"]').length > 0;
      const hasModal = $body.find('.modal, [role="dialog"]').length > 0;
      
      if (hasPhoneInput || hasModal) {
        cy.log('🔐 Authentication modal detected');
        
        // Enter phone
        cy.get('input[type="tel"], input').first()
          .clear()
          .type(testPhone);
        cy.screenshot('10-phone-entered');
        
        // Send code
        cy.get('button').filter((i, el) => {
          const text = el.textContent || '';
          return text.includes('קבל') || text.includes('שלח');
        }).first().click();
        
        cy.wait(2000);
        
        // Enter OTP
        cy.get('input').last().type(testOTP);
        cy.screenshot('11-otp-entered');
        
        // Verify
        cy.get('button').filter((i, el) => {
          const text = el.textContent || '';
          return text.includes('אמת') || text.includes('אישור');
        }).first().click();
        
        cy.wait(3000);
      }
    });
    
    // Check if reached Step 2
    cy.url().then(url => {
      if (url.includes('/2')) {
        cy.log('✅ Step 2 reached');
        cy.screenshot('12-step2-reached');
        
        // Quick fill Step 2
        // Name
        cy.get('input[type="text"]').first().type('ישראל ישראלי');
        
        // Date
        cy.get('input[type="date"], input[type="text"]').eq(1).type('1985-05-15');
        
        // Fill all dropdowns with first option
        cy.get('[class*="arrow"], [class*="dropdown"], svg').each(($dropdown, index) => {
          cy.wrap($dropdown).parent().click();
          cy.wait(300);
          cy.get('[class*="item"], [class*="option"], li').first().click();
          cy.wait(300);
        });
        
        // Radio buttons - select No
        cy.get('input[type="radio"]').then($radios => {
          for (let i = 1; i < $radios.length; i += 2) {
            cy.wrap($radios[i]).check({ force: true });
          }
        });
        
        cy.screenshot('13-step2-filled');
        
        // Continue
        cy.contains('button', /הבא|המשך/).click();
        cy.wait(3000);
      }
    });
    
    // Check if reached Step 3
    cy.url().then(url => {
      if (url.includes('/3')) {
        cy.log('✅ Step 3 reached');
        cy.screenshot('14-step3-reached');
        
        // Employment type
        cy.get('[class*="arrow"], [class*="dropdown"], svg').first().parent().click();
        cy.wait(500);
        cy.contains('[class*="item"], [class*="option"], li', 'שכיר').click();
        
        // Income
        cy.get('input[type="text"], input[type="number"]').first().type('25000');
        
        // Fill remaining dropdowns
        cy.get('[class*="arrow"], [class*="dropdown"], svg').each(($dropdown, index) => {
          if (index > 0) {
            cy.wrap($dropdown).parent().click();
            cy.wait(300);
            cy.get('[class*="item"], [class*="option"], li').first().click();
            cy.wait(300);
          }
        });
        
        cy.screenshot('15-step3-filled');
        
        // Continue
        cy.contains('button', /הבא|המשך/).click();
        cy.wait(5000); // Longer wait for bank offers
      }
    });
    
    // Verify Step 4
    cy.url().should('include', '/services/calculate-mortgage/4');
    cy.log('🎉 SUCCESS! Step 4 reached!');
    cy.screenshot('16-step4-SUCCESS');
    
    // Verify bank offers
    cy.get('[class*="bank"], [class*="card"], .bank-item', { timeout: 10000 })
      .should('exist');
    cy.screenshot('17-bank-offers');
    
    // Final screenshot
    cy.screenshot('18-FINAL-ALL-STEPS-COMPLETE');
  });
});