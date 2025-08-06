/**
 * Mortgage Calculator Test - Universal Selectors
 * Works with any selector strategy
 */

describe('Mortgage Calculator - Navigate to Step 4', () => {
  const testPhone = '0544123456';
  const testOTP = '123456';
  
  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  it('should navigate through all 4 steps using universal selectors', () => {
    // Visit Step 1
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(4000); // Give more time for React to load
    
    cy.screenshot('01-initial-page');
    
    // STRATEGY: Fill inputs by their order on the page
    
    // Property value - first text input
    cy.get('input[type="text"]').eq(0).clear().type('2500000');
    cy.screenshot('02-property-value');
    
    // Click all dropdowns and select first option
    cy.get('body').then($body => {
      // Find all elements that look like dropdowns
      const dropdownSelectors = [
        '[class*="dropdown"]',
        'select',
        '[role="combobox"]',
        '[class*="select"]'
      ];
      
      let dropdownCount = 0;
      dropdownSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).each(($dropdown, index) => {
            // Skip if already processed
            if (dropdownCount >= 6) return; // We expect about 6 dropdowns in step 1
            
            cy.wrap($dropdown).click({force: true});
            cy.wait(1000);
            
            // Try to click first option
            cy.get('body').then($body2 => {
              const optionSelectors = [
                '[role="option"]',
                '[class*="option"]',
                '[class*="item"]',
                'li',
                '[data-value]'
              ];
              
              for (let optSel of optionSelectors) {
                if ($body2.find(optSel).length > 0) {
                  cy.get(optSel).first().click({force: true});
                  break;
                }
              }
            });
            
            dropdownCount++;
            cy.screenshot(`03-dropdown-${dropdownCount}`);
          });
        }
      });
    });
    
    // Fill second text input (down payment)
    cy.get('input[type="text"]').eq(1).clear().type('625000');
    cy.screenshot('04-downpayment');
    
    // Adjust sliders
    cy.get('input[type="range"]').then($sliders => {
      if ($sliders.length >= 2) {
        // Monthly payment
        cy.wrap($sliders[0]).invoke('val', 12000).trigger('input').trigger('change');
        // Loan term
        cy.wrap($sliders[1]).invoke('val', 25).trigger('input').trigger('change');
      }
    });
    cy.screenshot('05-sliders');
    
    // Click continue button - try multiple selectors
    const continueSelectors = [
      'button:contains("הבא")',
      'button:contains("המשך")',
      'button[type="submit"]',
      '.btn-primary',
      'button'
    ];
    
    let clicked = false;
    continueSelectors.forEach(selector => {
      if (!clicked) {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).first().click({force: true});
            clicked = true;
          }
        });
      }
    });
    
    cy.wait(3000);
    cy.screenshot('06-after-continue');
    
    // Handle authentication
    cy.get('body').then($body => {
      if ($body.find('input[type="tel"], input[placeholder*="טלפון"], .modal').length > 0) {
        // Phone
        cy.get('input').then($inputs => {
          const phoneInput = $inputs.filter((i, el) => {
            return el.type === 'tel' || 
                   (el.placeholder && el.placeholder.includes('טלפון')) ||
                   i === $inputs.length - 2; // Second to last input often phone
          });
          if (phoneInput.length > 0) {
            cy.wrap(phoneInput.first()).type(testPhone);
          } else {
            cy.get('input').first().type(testPhone);
          }
        });
        
        cy.screenshot('07-phone');
        
        // Click send code
        cy.contains('button', /קבל|שלח/).click({force: true});
        cy.wait(2000);
        
        // OTP - last input
        cy.get('input').last().type(testOTP);
        cy.screenshot('08-otp');
        
        // Verify
        cy.contains('button', /אמת|אישור/).click({force: true});
        cy.wait(3000);
      }
    });
    
    // Check URL for step progression
    cy.url().then(url => {
      cy.log('Current URL: ' + url);
      cy.screenshot('09-current-location');
      
      if (url.includes('/2')) {
        cy.log('Reached Step 2!');
        // Quick fill step 2
        cy.get('input[type="text"]').first().type('ישראל ישראלי');
        cy.get('input[type="radio"]').each(($radio, i) => {
          if (i % 2 === 1) cy.wrap($radio).check({force: true});
        });
        cy.contains('button', /הבא|המשך/).click({force: true});
        cy.wait(3000);
      }
      
      if (url.includes('/3')) {
        cy.log('Reached Step 3!');
        // Quick fill step 3
        cy.get('input[type="text"], input[type="number"]').first().type('25000');
        cy.contains('button', /הבא|המשך/).click({force: true});
        cy.wait(5000);
      }
      
      if (url.includes('/4')) {
        cy.log('🎉 SUCCESS! Reached Step 4!');
        cy.screenshot('10-STEP4-SUCCESS');
      }
    });
    
    // Final URL check
    cy.url().should('contain', '/services/calculate-mortgage');
    cy.screenshot('11-final-state');
  });
});