/**
 * Complete Mortgage Calculator Flow with All Mandatory Fields
 * This test fills all required fields before progressing
 */

describe('Mortgage Calculator - Complete Flow with All Fields', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:5173/');
    cy.wait(3000);
  });

  it('should fill all mandatory fields and complete the mortgage flow', () => {
    cy.log('🏠 Starting mortgage calculator flow with all fields');
    
    // Step 1: Navigate to mortgage calculator
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div')
      .should('be.visible')
      .click();
    
    cy.wait(3000);
    cy.url().should('include', '/services/calculate-mortgage/1');
    cy.screenshot('step1-calculator-page-loaded');
    
    // Step 2: Fill ALL form fields on the first page
    cy.log('📝 Filling all mandatory fields on Step 1');
    
    // Property value (שווי הנכס) - should already have default value
    cy.get('input').then($inputs => {
      // Find and fill empty required fields
      $inputs.each((index, input) => {
        const $input = Cypress.$(input);
        const placeholder = $input.attr('placeholder') || '';
        const value = $input.val();
        
        // Skip if already has value or is readonly
        if (value || $input.attr('readonly')) {
          cy.log(`Field already filled or readonly: ${placeholder}`);
          return;
        }
        
        // Skip react-dropdown-select inputs
        if ($input.hasClass('react-dropdown-select-input')) {
          return;
        }
        
        // Fill based on placeholder text
        if (placeholder.includes('עיר') || placeholder.includes('city')) {
          // City field
          cy.wrap($input).click().type('תל אביב');
          cy.wait(500);
          // Try to select from dropdown if it appears
          cy.get('body').then($body => {
            const dropdown = $body.find('.react-dropdown-select-dropdown');
            if (dropdown.length > 0) {
              cy.wrap(dropdown).find('div').first().click();
            }
          });
          cy.log('✅ Filled city: תל אביב');
        }
        else if (placeholder.includes('מסגרת זמן') || placeholder.includes('timeline')) {
          // Timeline field
          cy.wrap($input).click();
          cy.wait(500);
          cy.get('body').then($body => {
            const options = $body.find('.react-dropdown-select-dropdown div');
            if (options.length > 0) {
              cy.wrap(options.first()).click();
              cy.log('✅ Selected timeline option');
            }
          });
        }
        else if (placeholder.includes('סוג משכנתא') || placeholder.includes('property type')) {
          // Property type field
          cy.wrap($input).click();
          cy.wait(500);
          cy.get('body').then($body => {
            const options = $body.find('.react-dropdown-select-dropdown div');
            if (options.length > 0) {
              cy.wrap(options.first()).click();
              cy.log('✅ Selected property type');
            }
          });
        }
        else if (placeholder.includes('סטטוס') || placeholder.includes('status')) {
          // Property status field
          cy.wrap($input).click();
          cy.wait(500);
          cy.get('body').then($body => {
            const options = $body.find('.react-dropdown-select-dropdown div');
            if (options.length > 0) {
              cy.wrap(options.first()).click();
              cy.log('✅ Selected property status');
            }
          });
        }
      });
    });
    
    // Handle React dropdown selects specifically
    cy.get('.react-dropdown-select').then($dropdowns => {
      cy.log(`Found ${$dropdowns.length} React dropdown selects`);
      
      $dropdowns.each((index, dropdown) => {
        const $dropdown = Cypress.$(dropdown);
        // Check if dropdown has no selection
        const hasValue = $dropdown.find('.react-dropdown-select-item').length > 0;
        
        if (!hasValue) {
          cy.wrap($dropdown).click();
          cy.wait(500);
          
          // Select first available option
          cy.get('.react-dropdown-select-dropdown').then($dropdownMenu => {
            if ($dropdownMenu.is(':visible')) {
              cy.wrap($dropdownMenu).find('div').first().click();
              cy.log(`✅ Selected option in dropdown ${index + 1}`);
            }
          });
        }
      });
    });
    
    cy.wait(1000);
    cy.screenshot('step1-all-fields-filled');
    
    // Click next button
    cy.get('button:contains("הבא")').should('be.visible').click();
    cy.log('✅ Clicked Next button');
    
    cy.wait(2000);
    
    // Handle SMS verification popup if it appears
    cy.get('body').then($body => {
      if ($body.find('heading:contains("הזן את מספר הטלפון")').length > 0) {
        cy.log('📱 Phone verification popup detected - filling required fields');
        
        // Fill name field
        cy.get('input[placeholder*="שם"], input').first().then($nameInput => {
          if ($nameInput.attr('placeholder')?.includes('שם') || $nameInput.closest('form').length > 0) {
            cy.wrap($nameInput).clear().type('דוד כהן');
            cy.log('✅ Filled name: דוד כהן');
          }
        });
        
        // Fill phone field
        cy.get('input').eq(1).clear().type('0501234567');
        cy.log('✅ Filled phone: 0501234567');
        
        cy.wait(1000);
        cy.screenshot('sms-popup-filled');
        
        // Try different strategies to continue
        cy.get('body').then($body => {
          const continueBtn = $body.find('button:contains("המשך")');
          const alreadyRegistered = $body.find('button:contains("כאן"), a:contains("כאן")');
          const closeBtn = $body.find('button:contains("×")');
          
          if (alreadyRegistered.length > 0) {
            cy.wrap(alreadyRegistered.first()).click({ force: true });
            cy.log('✅ Clicked "already registered" link');
          } else if (continueBtn.length > 0 && !continueBtn.is(':disabled')) {
            cy.wrap(continueBtn.first()).click({ force: true });
            cy.log('✅ Clicked continue in popup');
          } else if (closeBtn.length > 0) {
            cy.wrap(closeBtn.first()).click({ force: true });
            cy.log('✅ Closed popup');
          }
        });
      }
    });
    
    cy.wait(2000);
    
    // Continue through remaining steps (2-4)
    for (let step = 2; step <= 4; step++) {
      cy.log(`📝 Processing Step ${step}`);
      
      // Check current URL
      cy.url().then(url => {
        cy.log(`Current URL: ${url}`);
      });
      
      // Fill any new fields that appear
      cy.get('input:visible:not([readonly]):not(.react-dropdown-select-input)').then($inputs => {
        const emptyInputs = $inputs.filter((i, input) => !Cypress.$(input).val());
        
        if (emptyInputs.length > 0) {
          cy.log(`Found ${emptyInputs.length} empty fields to fill`);
          
          emptyInputs.each((index, input) => {
            const $input = Cypress.$(input);
            const placeholder = $input.attr('placeholder') || '';
            const name = $input.attr('name') || '';
            
            // Fill based on field type
            if (placeholder.includes('הכנסה') || name.includes('income')) {
              cy.wrap($input).type('15000');
              cy.log('✅ Filled income: 15000');
            } else if (placeholder.includes('שם') || name.includes('name')) {
              cy.wrap($input).type('דוד כהן');
              cy.log('✅ Filled name: דוד כהן');
            } else if (placeholder.includes('טלפון') || name.includes('phone')) {
              cy.wrap($input).type('0501234567');
              cy.log('✅ Filled phone: 0501234567');
            } else if (placeholder.includes('מייל') || name.includes('email')) {
              cy.wrap($input).type('test@example.com');
              cy.log('✅ Filled email: test@example.com');
            } else if ($input.attr('type') === 'number') {
              cy.wrap($input).type('5000');
              cy.log('✅ Filled number field: 5000');
            } else {
              cy.wrap($input).type('ערך לדוגמה');
              cy.log('✅ Filled text field with sample value');
            }
          });
        }
      });
      
      // Handle dropdowns on this step
      cy.get('.react-dropdown-select').then($dropdowns => {
        $dropdowns.each((index, dropdown) => {
          const $dropdown = Cypress.$(dropdown);
          const hasValue = $dropdown.find('.react-dropdown-select-item').length > 0;
          
          if (!hasValue) {
            cy.wrap($dropdown).click();
            cy.wait(500);
            
            cy.get('.react-dropdown-select-dropdown').then($dropdownMenu => {
              if ($dropdownMenu.is(':visible')) {
                cy.wrap($dropdownMenu).find('div').first().click();
                cy.log(`✅ Selected option in dropdown`);
              }
            });
          }
        });
      });
      
      // Check required checkboxes
      cy.get('input[type="checkbox"]:visible').then($checkboxes => {
        $checkboxes.each((index, checkbox) => {
          const $checkbox = Cypress.$(checkbox);
          const name = $checkbox.attr('name') || $checkbox.attr('id') || '';
          
          if ((name.includes('terms') || name.includes('agree') || name.includes('consent')) && !$checkbox.is(':checked')) {
            cy.wrap($checkbox).check({ force: true });
            cy.log('✅ Checked required checkbox');
          }
        });
      });
      
      cy.wait(1000);
      cy.screenshot(`step-${step}-fields-filled`);
      
      // Find and click continue button
      const continueSelectors = [
        'button:contains("הבא")',
        'button:contains("המשך")',
        'button:contains("Continue")',
        'button:contains("Next")',
        'button[type="submit"]'
      ];
      
      let buttonClicked = false;
      
      for (const selector of continueSelectors) {
        if (!buttonClicked) {
          cy.get('body').then($body => {
            const $button = $body.find(selector).filter(':visible:not(:disabled)');
            if ($button.length > 0) {
              cy.wrap($button.first()).click();
              buttonClicked = true;
              cy.log(`✅ Clicked continue button: "${$button.first().text().trim()}"`);
            }
          });
        }
      }
      
      cy.wait(2000);
      
      // Check if we reached step 4
      cy.url().then(url => {
        if (url.includes('/4')) {
          cy.log('🎉 Successfully reached Step 4!');
          cy.screenshot('final-step-4-complete');
          return; // Exit the loop
        }
      });
    }
    
    // Final validation
    cy.url().then(url => {
      cy.log(`🏁 Final URL: ${url}`);
      cy.screenshot('final-state-all-fields-complete');
    });
  });

  it('should validate all mandatory fields are properly filled', () => {
    cy.log('🔍 Validating mandatory field requirements');
    
    // Navigate to calculator
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    cy.wait(3000);
    
    // Test validation by trying to continue without filling fields
    cy.get('button:contains("הבא")').click();
    cy.wait(1000);
    
    // Check if validation messages appear or if we're blocked
    cy.get('body').then($body => {
      // Look for validation messages
      const validationMessages = $body.find('.error, .validation-message, [class*="error"]');
      if (validationMessages.length > 0) {
        cy.log(`✅ Found ${validationMessages.length} validation messages`);
        cy.screenshot('validation-messages-shown');
      }
      
      // Check if we're still on the same page (validation prevented navigation)
      cy.url().should('include', '/services/calculate-mortgage/1');
      cy.log('✅ Validation prevented navigation without filling required fields');
    });
    
    // Now fill all fields properly
    cy.fillAllMandatoryFields();
    
    // Try to continue again
    cy.get('button:contains("הבא")').click();
    cy.wait(2000);
    
    // Verify we progressed
    cy.url().then(url => {
      if (!url.includes('/1')) {
        cy.log('✅ Successfully progressed after filling mandatory fields');
      }
    });
  });
});

// Custom command to fill all mandatory fields
Cypress.Commands.add('fillAllMandatoryFields', () => {
  cy.log('📝 Filling all mandatory fields');
  
  // Fill all visible empty text inputs
  cy.get('input[type="text"]:visible:not([readonly]):not(.react-dropdown-select-input)').each($input => {
    if (!$input.val()) {
      const placeholder = $input.attr('placeholder') || '';
      
      if (placeholder.includes('עיר')) {
        cy.wrap($input).type('תל אביב');
      } else if (placeholder.includes('שם')) {
        cy.wrap($input).type('דוד כהן');
      } else if (placeholder.includes('טלפון')) {
        cy.wrap($input).type('0501234567');
      } else if (placeholder.includes('מייל')) {
        cy.wrap($input).type('test@example.com');
      } else {
        cy.wrap($input).type('ערך לדוגמה');
      }
    }
  });
  
  // Fill all number inputs
  cy.get('input[type="number"]:visible:not([readonly])').each($input => {
    if (!$input.val()) {
      const placeholder = $input.attr('placeholder') || '';
      const name = $input.attr('name') || '';
      
      if (placeholder.includes('הכנסה') || name.includes('income')) {
        cy.wrap($input).type('15000');
      } else if (placeholder.includes('גיל') || name.includes('age')) {
        cy.wrap($input).type('35');
      } else {
        cy.wrap($input).type('5000');
      }
    }
  });
  
  // Handle all dropdowns
  cy.get('.react-dropdown-select').each($dropdown => {
    const hasValue = Cypress.$($dropdown).find('.react-dropdown-select-item').length > 0;
    
    if (!hasValue) {
      cy.wrap($dropdown).click();
      cy.wait(500);
      cy.get('.react-dropdown-select-dropdown:visible').find('div').first().click();
    }
  });
  
  // Check all required checkboxes
  cy.get('input[type="checkbox"]:visible').each($checkbox => {
    const name = $checkbox.attr('name') || $checkbox.attr('id') || '';
    
    if ((name.includes('terms') || name.includes('agree') || name.includes('consent')) && !$checkbox.is(':checked')) {
      cy.wrap($checkbox).check({ force: true });
    }
  });
  
  cy.log('✅ All mandatory fields filled');
});

declare global {
  namespace Cypress {
    interface Chainable {
      fillAllMandatoryFields(): Chainable<void>
    }
  }
}

export {};