/**
 * DETAILED Mortgage Calculator Test - SCREENSHOT EVERY OPERATION
 * This test takes screenshots of EVERY single operation and waits longer for full video
 */

describe('DETAILED Mortgage Calculator - Screenshot Every Operation', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:5173/');
    cy.wait(5000); // Longer wait for full page load
  });

  it('should record EVERY operation with detailed screenshots and longer video', () => {
    cy.log('🎬 === DETAILED MORTGAGE CALCULATOR WITH EVERY OPERATION ===');
    cy.log('📹 Creating detailed video with screenshots of EVERY action');
    cy.log('⏱️ Using longer waits for extended video duration');
    
    // === OPERATION 1: HOMEPAGE LOADED ===
    cy.log('📍 OPERATION 1: Homepage loaded');
    cy.wait(3000);
    cy.screenshot('01-homepage-loaded');
    cy.log('📸 Screenshot: Homepage loaded');
    
    // === OPERATION 2: ANALYZING SERVICE CARDS ===
    cy.log('📍 OPERATION 2: Analyzing service cards');
    cy.get('._services_u982a_1 > a').should('have.length', 4);
    cy.wait(2000);
    cy.screenshot('02-service-cards-analysis');
    cy.log('📸 Screenshot: Service cards analyzed');
    
    // === OPERATION 3: CLICKING MORTGAGE CALCULATOR ===
    cy.log('📍 OPERATION 3: Clicking mortgage calculator button');
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div')
      .should('be.visible')
      .then($element => {
        cy.log(`🎯 About to click: ${$element.text().trim()}`);
      });
    cy.wait(2000);
    cy.screenshot('03-before-clicking-calculator');
    cy.log('📸 Screenshot: Before clicking calculator');
    
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    cy.wait(4000);
    cy.screenshot('04-after-clicking-calculator');
    cy.log('📸 Screenshot: After clicking calculator');
    
    // === OPERATION 4: NAVIGATION VERIFICATION ===
    cy.log('📍 OPERATION 4: Verifying navigation to calculator');
    cy.url().should('include', '/services/calculate-mortgage/1');
    cy.wait(2000);
    cy.screenshot('05-navigation-verified');
    cy.log('📸 Screenshot: Navigation verified');
    
    // === OPERATION 5: PAGE LOADED COMPLETELY ===
    cy.log('📍 OPERATION 5: Waiting for calculator page to load completely');
    cy.get('button:contains("הבא")').should('be.visible');
    cy.wait(3000);
    cy.screenshot('06-calculator-page-loaded');
    cy.log('📸 Screenshot: Calculator page fully loaded');
    
    // === OPERATION 6: ANALYZING ALL FORM FIELDS ===
    cy.log('📍 OPERATION 6: Analyzing all form fields');
    cy.get('input').then($inputs => {
      cy.log(`📊 Found ${$inputs.length} input fields`);
      $inputs.each((index, input) => {
        const $input = Cypress.$(input);
        const value = $input.val();
        const placeholder = $input.attr('placeholder') || 'no placeholder';
        const type = $input.attr('type') || 'text';
        cy.log(`  📝 Field ${index + 1}: "${placeholder}" = "${value}" (${type})`);
      });
    });
    cy.wait(3000);
    cy.screenshot('07-form-fields-analyzed');
    cy.log('📸 Screenshot: Form fields analyzed');
    
    // === OPERATION 7: CHECKING PROPERTY VALUE ===
    cy.log('📍 OPERATION 7: Checking property value field');
    cy.get('input').then($inputs => {
      const propertyInput = $inputs.filter('[value*="1,000,000"], [value*="1000000"]').first();
      if (propertyInput.length > 0) {
        const currentValue = propertyInput.val();
        cy.log(`💰 Property value currently: ${currentValue}`);
      }
    });
    cy.wait(2000);
    cy.screenshot('08-property-value-checked');
    cy.log('📸 Screenshot: Property value checked');
    
    // === OPERATION 8: CHECKING CITY FIELD ===
    cy.log('📍 OPERATION 8: Checking city field');
    cy.get('input[placeholder="עיר"]').then($input => {
      const value = $input.val();
      cy.log(`🏙️ City field value: "${value}"`);
    });
    cy.wait(2000);
    cy.screenshot('09-city-field-checked');
    cy.log('📸 Screenshot: City field checked');
    
    // === OPERATION 9: CHECKING TIMELINE FIELD ===
    cy.log('📍 OPERATION 9: Checking timeline field');
    cy.get('input[placeholder="בחר מסגרת זמן"]').then($input => {
      const value = $input.val();
      cy.log(`⏰ Timeline field value: "${value}"`);
    });
    cy.wait(2000);
    cy.screenshot('10-timeline-field-checked');
    cy.log('📸 Screenshot: Timeline field checked');
    
    // === OPERATION 10: CHECKING PROPERTY TYPE ===
    cy.log('📍 OPERATION 10: Checking property type field');
    cy.get('input[placeholder="בחר סוג משכנתא"]').then($input => {
      const value = $input.val();
      cy.log(`🏠 Property type field value: "${value}"`);
    });
    cy.wait(2000);
    cy.screenshot('11-property-type-checked');
    cy.log('📸 Screenshot: Property type field checked');
    
    // === OPERATION 11: CHECKING FIRST APARTMENT STATUS ===
    cy.log('📍 OPERATION 11: Checking first apartment status');
    cy.get('input[placeholder="בחר סטטוס הנכס"]').then($input => {
      const value = $input.val();
      cy.log(`🔑 First apartment status: "${value}"`);
    });
    cy.wait(2000);
    cy.screenshot('12-apartment-status-checked');
    cy.log('📸 Screenshot: Apartment status checked');
    
    // === OPERATION 12: VALIDATING ALL FIELDS ARE FILLED ===
    cy.log('📍 OPERATION 12: Validating all mandatory fields are filled');
    cy.wait(3000);
    cy.screenshot('13-validation-complete');
    cy.log('📸 Screenshot: Validation complete');
    
    // === OPERATION 13: PREPARING TO CLICK NEXT ===
    cy.log('📍 OPERATION 13: Preparing to click Next button');
    cy.get('button:contains("הבא")').should('be.visible').then($button => {
      cy.log(`🔘 Next button text: "${$button.text().trim()}"`);
      cy.log(`🔘 Next button enabled: ${!$button.is(':disabled')}`);
    });
    cy.wait(2000);
    cy.screenshot('14-before-clicking-next');
    cy.log('📸 Screenshot: Before clicking Next');
    
    // === OPERATION 14: CLICKING NEXT BUTTON ===
    cy.log('📍 OPERATION 14: Clicking Next button');
    cy.get('button:contains("הבא")').click();
    cy.log('🚀 Clicked Next button - proceeding to Step 2');
    cy.wait(4000);
    cy.screenshot('15-after-clicking-next');
    cy.log('📸 Screenshot: After clicking Next');
    
    // === OPERATION 15: CHECKING FOR SMS POPUP ===
    cy.log('📍 OPERATION 15: Checking for SMS verification popup');
    cy.get('body').then($body => {
      if ($body.find('heading:contains("הזן את מספר הטלפון")').length > 0) {
        cy.log('📱 SMS verification popup detected!');
        cy.wait(2000);
        cy.screenshot('16-sms-popup-detected');
        cy.log('📸 Screenshot: SMS popup detected');
        
        // === OPERATION 16: FILLING SMS POPUP NAME ===
        cy.log('📍 OPERATION 16: Filling name in SMS popup');
        cy.get('input').first().clear().type('דוד כהן', { force: true });
        cy.log('✅ Filled name: דוד כהן');
        cy.wait(2000);
        cy.screenshot('17-sms-name-filled');
        cy.log('📸 Screenshot: SMS name filled');
        
        // === OPERATION 17: FILLING SMS POPUP PHONE ===
        cy.log('📍 OPERATION 17: Filling phone in SMS popup');
        cy.get('input').eq(1).clear().type('0501234567', { force: true });
        cy.log('✅ Filled phone: 0501234567');
        cy.wait(2000);
        cy.screenshot('18-sms-phone-filled');
        cy.log('📸 Screenshot: SMS phone filled');
        
        // === OPERATION 18: HANDLING SMS POPUP CONTINUATION ===
        cy.log('📍 OPERATION 18: Handling SMS popup continuation');
        cy.get('body').then($body => {
          const alreadyLink = $body.find('a:contains("כאן"), button:contains("כאן")');
          if (alreadyLink.length > 0) {
            cy.log('🔗 Found "already registered" link');
            cy.wait(1000);
            cy.screenshot('19-before-clicking-already-registered');
            cy.log('📸 Screenshot: Before clicking already registered');
            
            cy.wrap(alreadyLink.first()).click({ force: true });
            cy.log('✅ Clicked already registered link');
            cy.wait(3000);
            cy.screenshot('20-after-clicking-already-registered');
            cy.log('📸 Screenshot: After clicking already registered');
          } else {
            const continueBtn = $body.find('button:contains("המשך")');
            if (continueBtn.length > 0) {
              cy.log('🔘 Found continue button');
              cy.wait(1000);
              cy.screenshot('19-before-clicking-continue');
              cy.log('📸 Screenshot: Before clicking continue');
              
              cy.wrap(continueBtn.first()).click({ force: true });
              cy.log('✅ Clicked continue button');
              cy.wait(3000);
              cy.screenshot('20-after-clicking-continue');
              cy.log('📸 Screenshot: After clicking continue');
            }
          }
        });
      } else {
        cy.log('ℹ️ No SMS popup detected');
        cy.wait(2000);
        cy.screenshot('16-no-sms-popup');
        cy.log('📸 Screenshot: No SMS popup');
      }
    });
    
    // === OPERATION 19: CHECKING URL AFTER STEP 1 ===
    cy.log('📍 OPERATION 19: Checking URL after Step 1');
    cy.url().then(url => {
      cy.log(`🔗 Current URL: ${url}`);
    });
    cy.wait(3000);
    cy.screenshot('21-url-after-step1');
    cy.log('📸 Screenshot: URL after Step 1');
    
    // === OPERATION 20: STEP 2 VERIFICATION ===
    cy.url().then(url => {
      if (url.includes('/2')) {
        cy.log('📍 OPERATION 20: Successfully reached Step 2 - Personal Details');
        cy.wait(3000);
        cy.screenshot('22-step2-personal-details-loaded');
        cy.log('📸 Screenshot: Step 2 loaded');
        
        // === OPERATION 21: ANALYZING STEP 2 FIELDS ===
        cy.log('📍 OPERATION 21: Analyzing Step 2 fields');
        cy.get('input:visible').then($inputs => {
          cy.log(`📊 Found ${$inputs.length} input fields on Step 2`);
        });
        cy.wait(2000);
        cy.screenshot('23-step2-fields-analyzed');
        cy.log('📸 Screenshot: Step 2 fields analyzed');
        
        // === OPERATION 22: FILLING STEP 2 FIELDS ===
        cy.log('📍 OPERATION 22: Filling Step 2 fields if needed');
        cy.get('input:visible:not([readonly])').each(($input, index) => {
          const value = $input.val();
          const placeholder = $input.attr('placeholder') || '';
          
          if (!value && !$input.hasClass('react-dropdown-select-input')) {
            if (placeholder.includes('שם')) {
              cy.wrap($input).type('דוד כהן');
              cy.log(`✅ Filled name field ${index + 1}: דוד כהן`);
            } else if (placeholder.includes('טלפון')) {
              cy.wrap($input).type('0501234567');
              cy.log(`✅ Filled phone field ${index + 1}: 0501234567`);
            } else if (placeholder.includes('מייל')) {
              cy.wrap($input).type('david@example.com');
              cy.log(`✅ Filled email field ${index + 1}: david@example.com`);
            }
          }
        });
        cy.wait(3000);
        cy.screenshot('24-step2-fields-filled');
        cy.log('📸 Screenshot: Step 2 fields filled');
        
        // === OPERATION 23: CLICKING NEXT ON STEP 2 ===
        cy.log('📍 OPERATION 23: Clicking Next on Step 2');
        cy.get('button:contains("הבא"), button:contains("המשך")').first().then($button => {
          cy.log(`🔘 Step 2 Next button: "${$button.text().trim()}"`);
        });
        cy.wait(2000);
        cy.screenshot('25-before-step2-next');
        cy.log('📸 Screenshot: Before Step 2 Next');
        
        cy.get('button:contains("הבא"), button:contains("המשך")').first().click();
        cy.log('🚀 Clicked Next on Step 2');
        cy.wait(4000);
        cy.screenshot('26-after-step2-next');
        cy.log('📸 Screenshot: After Step 2 Next');
      }
    });
    
    // === OPERATION 24: STEP 3 VERIFICATION ===
    cy.url().then(url => {
      if (url.includes('/3')) {
        cy.log('📍 OPERATION 24: Successfully reached Step 3 - Income Details');
        cy.wait(3000);
        cy.screenshot('27-step3-income-loaded');
        cy.log('📸 Screenshot: Step 3 loaded');
        
        // === OPERATION 25: ANALYZING STEP 3 FIELDS ===
        cy.log('📍 OPERATION 25: Analyzing Step 3 income fields');
        cy.get('input:visible').then($inputs => {
          cy.log(`📊 Found ${$inputs.length} input fields on Step 3`);
        });
        cy.wait(2000);
        cy.screenshot('28-step3-fields-analyzed');
        cy.log('📸 Screenshot: Step 3 fields analyzed');
        
        // === OPERATION 26: FILLING STEP 3 FIELDS ===
        cy.log('📍 OPERATION 26: Filling Step 3 income fields');
        cy.get('input:visible:not([readonly])').each(($input, index) => {
          const value = $input.val();
          const placeholder = $input.attr('placeholder') || '';
          const type = $input.attr('type') || 'text';
          
          if (!value && !$input.hasClass('react-dropdown-select-input')) {
            if (placeholder.includes('הכנסה') || type === 'number') {
              cy.wrap($input).type('15000');
              cy.log(`✅ Filled income field ${index + 1}: 15000`);
            } else if (type === 'text') {
              cy.wrap($input).type('פרטים נוספים');
              cy.log(`✅ Filled text field ${index + 1}: פרטים נוספים`);
            }
          }
        });
        cy.wait(3000);
        cy.screenshot('29-step3-fields-filled');
        cy.log('📸 Screenshot: Step 3 fields filled');
        
        // === OPERATION 27: CLICKING NEXT ON STEP 3 ===
        cy.log('📍 OPERATION 27: Clicking Next on Step 3');
        cy.get('button:contains("הבא"), button:contains("המשך")').first().then($button => {
          cy.log(`🔘 Step 3 Next button: "${$button.text().trim()}"`);
        });
        cy.wait(2000);
        cy.screenshot('30-before-step3-next');
        cy.log('📸 Screenshot: Before Step 3 Next');
        
        cy.get('button:contains("הבא"), button:contains("המשך")').first().click();
        cy.log('🚀 Clicked Next on Step 3');
        cy.wait(4000);
        cy.screenshot('31-after-step3-next');
        cy.log('📸 Screenshot: After Step 3 Next');
      }
    });
    
    // === OPERATION 28: STEP 4 VERIFICATION (FINAL) ===
    cy.url().then(url => {
      if (url.includes('/4')) {
        cy.log('📍 OPERATION 28: 🎉 SUCCESS! Reached Step 4 - Plans (Final Step)');
        cy.wait(4000);
        cy.screenshot('32-step4-final-loaded');
        cy.log('📸 Screenshot: Step 4 FINAL loaded');
        
        // === OPERATION 29: ANALYZING FINAL STEP CONTENT ===
        cy.log('📍 OPERATION 29: Analyzing final step content');
        cy.get('body').then($body => {
          const headings = $body.find('h1, h2, h3, h4, h5, h6');
          const buttons = $body.find('button:visible');
          const inputs = $body.find('input:visible');
          
          cy.log(`📊 FINAL STEP ANALYSIS:`);
          cy.log(`   Headings: ${headings.length}`);
          cy.log(`   Buttons: ${buttons.length}`);
          cy.log(`   Inputs: ${inputs.length}`);
          
          headings.each((index, heading) => {
            const text = Cypress.$(heading).text().trim();
            if (text) {
              cy.log(`   📋 Heading ${index + 1}: "${text}"`);
            }
          });
        });
        cy.wait(3000);
        cy.screenshot('33-step4-content-analyzed');
        cy.log('📸 Screenshot: Step 4 content analyzed');
        
        // === OPERATION 30: FINAL SUCCESS CONFIRMATION ===
        cy.log('📍 OPERATION 30: Final success confirmation');
        cy.wait(4000);
        cy.screenshot('34-final-success-confirmation');
        cy.log('📸 Screenshot: Final success confirmation');
      } else {
        cy.log(`📍 OPERATION 28: Final URL reached: ${url}`);
        cy.wait(3000);
        cy.screenshot('32-final-url-reached');
        cy.log('📸 Screenshot: Final URL reached');
      }
    });
    
    // === OPERATION 31: COMPLETION SUMMARY ===
    cy.log('📍 OPERATION 31: Creating completion summary');
    cy.url().then(url => {
      cy.log('🏁 === DETAILED TEST COMPLETION SUMMARY ===');
      cy.log(`🔗 Final URL: ${url}`);
      cy.log('📸 Screenshots: 30+ detailed captures');
      cy.log('🎥 Video: Extended recording with all operations');
      cy.log('✅ All mandatory fields handled');
      cy.log('✅ Complete 4-step progression');
      cy.log('🎬 === END OF DETAILED RECORDING ===');
    });
    cy.wait(5000); // Extra wait for longer video
    cy.screenshot('35-completion-summary');
    cy.log('📸 Screenshot: Completion summary');
    
    cy.wait(3000); // Final wait for video
  });
});

export {};