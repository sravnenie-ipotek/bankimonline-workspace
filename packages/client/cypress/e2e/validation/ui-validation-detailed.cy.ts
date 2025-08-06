/**
 * Comprehensive UI Validation Test with Detailed Logs and Snapshots
 * This test provides extensive logging and UI validation for the mortgage calculator flow
 */

describe('Comprehensive UI Validation - Mortgage Calculator', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Enable detailed logging
    cy.task('log', '🚀 Starting UI Validation Test Suite');
    cy.task('log', `📅 Test started at: ${new Date().toISOString()}`);
    
    cy.visit('http://localhost:5173/');
    cy.wait(3000);
  });

  it('should perform comprehensive UI validation with detailed logging', () => {
    cy.task('log', '==================== UI VALIDATION START ====================');
    
    // PHASE 1: Homepage Validation
    cy.task('log', '📍 PHASE 1: Homepage UI Validation');
    
    cy.get('body').should('be.visible').then(() => {
      cy.task('log', '✅ Page body loaded successfully');
    });
    
    // Take initial homepage snapshot
    cy.screenshot('01-homepage-initial', { 
      capture: 'fullPage',
      overwrite: true 
    });
    cy.task('log', '📸 Homepage snapshot captured');
    
    // Validate Hebrew language is active
    cy.get('body').then($body => {
      const hebrewText = $body.find(':contains("חישוב משכנתא")');
      if (hebrewText.length > 0) {
        cy.task('log', '✅ Hebrew language detected on homepage');
      } else {
        cy.task('log', '⚠️ Hebrew text not found on homepage');
      }
    });
    
    // Log all service cards
    cy.get('._services_u982a_1 > a').then($cards => {
      cy.task('log', `📊 Found ${$cards.length} service cards on homepage`);
      $cards.each((index, card) => {
        const text = Cypress.$(card).text().trim();
        cy.task('log', `   Service ${index + 1}: "${text}"`);
      });
    });
    
    // PHASE 2: Navigation to Mortgage Calculator
    cy.task('log', '📍 PHASE 2: Navigation to Mortgage Calculator');
    
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div')
      .should('be.visible')
      .then($element => {
        const text = $element.text().trim();
        cy.task('log', `🎯 Clicking on mortgage calculator: "${text}"`);
        return cy.wrap($element);
      })
      .click();
    
    cy.wait(3000);
    
    // Validate navigation success
    cy.url().should('include', '/services/calculate-mortgage/1').then(url => {
      cy.task('log', `✅ Navigation successful. Current URL: ${url}`);
    });
    
    cy.screenshot('02-mortgage-calculator-loaded', { 
      capture: 'fullPage',
      overwrite: true 
    });
    cy.task('log', '📸 Mortgage calculator page snapshot captured');
    
    // PHASE 3: Form Structure Validation
    cy.task('log', '📍 PHASE 3: Form Structure Validation');
    
    // Validate 4-step progress indicator
    cy.get('main').within(() => {
      const steps = ['מחשבון', 'פרטים אישיים', 'הכנסות', 'תוכניות'];
      steps.forEach((step, index) => {
        cy.contains(step).should('be.visible').then(() => {
          cy.task('log', `✅ Step ${index + 1} found: "${step}"`);
        });
      });
    });
    
    // Log all form fields and their values
    cy.get('input').then($inputs => {
      cy.task('log', `📝 Form Analysis - Found ${$inputs.length} input fields:`);
      $inputs.each((index, input) => {
        const $input = Cypress.$(input);
        const type = $input.attr('type') || 'text';
        const name = $input.attr('name') || 'unnamed';
        const placeholder = $input.attr('placeholder') || 'no-placeholder';
        const value = $input.val() || 'empty';
        const visible = $input.is(':visible') ? 'visible' : 'hidden';
        
        cy.task('log', `   Input ${index + 1}: type="${type}", name="${name}", placeholder="${placeholder}", value="${value}", ${visible}`);
      });
    });
    
    // Log all dropdown/select elements
    cy.get('body').then($body => {
      const selects = $body.find('select');
      const reactDropdowns = $body.find('[class*="react-dropdown"], [class*="dropdown-select"]');
      
      cy.task('log', `🔽 Dropdown Analysis:`);
      cy.task('log', `   Traditional selects: ${selects.length}`);
      cy.task('log', `   React dropdowns: ${reactDropdowns.length}`);
      
      // Log select options
      selects.each((index, select) => {
        const $select = Cypress.$(select);
        const options = $select.find('option');
        cy.task('log', `   Select ${index + 1}: ${options.length} options`);
      });
    });
    
    cy.screenshot('03-form-structure-analysis', { 
      capture: 'fullPage',
      overwrite: true 
    });
    cy.task('log', '📸 Form structure analysis snapshot captured');
    
    // PHASE 4: Form Interaction Validation
    cy.task('log', '📍 PHASE 4: Form Interaction Validation');
    
    // Test form field interactions
    cy.get('input[type="text"]:visible:not([readonly]):not(.react-dropdown-select-input)').then($inputs => {
      if ($inputs.length > 0) {
        cy.task('log', `🖊️ Testing ${$inputs.length} editable text inputs`);
        
        $inputs.each((index, input) => {
          const $input = Cypress.$(input);
          const name = $input.attr('name') || $input.attr('placeholder') || `input-${index}`;
          
          // Test if input is interactable
          cy.wrap($input).clear().type('Test', { force: true }).then(() => {
            cy.task('log', `   ✅ Input "${name}" is editable`);
          });
          
          // Clear for next test
          cy.wrap($input).clear();
        });
      } else {
        cy.task('log', 'ℹ️ No editable text inputs found');
      }
    });
    
    // Test number inputs
    cy.get('input[type="number"]:visible:not(:disabled)').then($inputs => {
      if ($inputs.length > 0) {
        cy.task('log', `🔢 Testing ${$inputs.length} number inputs`);
        
        $inputs.each((index, input) => {
          const $input = Cypress.$(input);
          const name = $input.attr('name') || $input.attr('placeholder') || `number-${index}`;
          const originalValue = $input.val();
          
          cy.wrap($input).clear().type('12345', { force: true }).then(() => {
            cy.task('log', `   ✅ Number input "${name}" accepts numeric input`);
          });
          
          // Restore original value
          if (originalValue) {
            cy.wrap($input).clear().type(originalValue.toString(), { force: true });
          }
        });
      } else {
        cy.task('log', 'ℹ️ No number inputs found');
      }
    });
    
    cy.screenshot('04-form-interaction-test', { 
      capture: 'fullPage',
      overwrite: true 
    });
    cy.task('log', '📸 Form interaction test snapshot captured');
    
    // PHASE 5: Next Button Validation
    cy.task('log', '📍 PHASE 5: Next Button Validation');
    
    cy.get('button:contains("הבא")').should('be.visible').then($button => {
      const text = $button.text().trim();
      const enabled = !$button.is(':disabled');
      const classes = $button.attr('class') || 'no-classes';
      
      cy.task('log', `🔘 Next button found: "${text}"`);
      cy.task('log', `   Enabled: ${enabled}`);
      cy.task('log', `   Classes: ${classes}`);
      
      // Click the next button
      cy.wrap($button).click();
      cy.task('log', '✅ Next button clicked successfully');
    });
    
    cy.wait(2000);
    
    // PHASE 6: Popup/Modal Validation
    cy.task('log', '📍 PHASE 6: Popup/Modal Validation');
    
    cy.get('body').then($body => {
      // Check for phone verification popup
      const phonePopup = $body.find('heading:contains("הזן את מספר הטלפון")');
      
      if (phonePopup.length > 0) {
        cy.task('log', '📱 Phone verification popup detected');
        
        cy.screenshot('05-phone-verification-popup', { 
          capture: 'fullPage',
          overwrite: true 
        });
        cy.task('log', '📸 Phone verification popup snapshot captured');
        
        // Analyze popup fields
        const nameInput = $body.find('input[placeholder*="שם"], input').first();
        const phoneInput = $body.find('input').eq(1);
        const continueBtn = $body.find('button:contains("המשך")');
        const closeBtn = $body.find('button:contains("×")');
        
        cy.task('log', `   Name input found: ${nameInput.length > 0}`);
        cy.task('log', `   Phone input found: ${phoneInput.length > 0}`);
        cy.task('log', `   Continue button found: ${continueBtn.length > 0}`);
        cy.task('log', `   Close button found: ${closeBtn.length > 0}`);
        
        // Test popup interaction
        if (nameInput.length > 0) {
          cy.wrap(nameInput).type('דוד כהן', { force: true });
          cy.task('log', '✅ Hebrew name entered in popup');
        }
        
        if (phoneInput.length > 0) {
          cy.wrap(phoneInput).clear().type('050-123-4567', { force: true });
          cy.task('log', '✅ Phone number entered in popup');
        }
        
        cy.wait(1000);
        
        // Try to continue or close popup
        cy.get('body').then($body => {
          const continueBtn = $body.find('button:contains("המשך")');
          const alreadyRegistered = $body.find('button:contains("כאן")');
          const closeBtn = $body.find('button:contains("×")');
          
          if (continueBtn.length > 0 && !continueBtn.is(':disabled')) {
            cy.wrap(continueBtn.first()).click({ force: true });
            cy.task('log', '✅ Continue button clicked in popup');
          } else if (alreadyRegistered.length > 0) {
            cy.wrap(alreadyRegistered.first()).click({ force: true });
            cy.task('log', '✅ "Already registered" clicked in popup');
          } else if (closeBtn.length > 0) {
            cy.wrap(closeBtn.first()).click({ force: true });
            cy.task('log', '✅ Popup closed');
          }
        });
        
        cy.screenshot('06-popup-interaction-complete', { 
          capture: 'fullPage',
          overwrite: true 
        });
        cy.task('log', '📸 Popup interaction complete snapshot captured');
        
      } else {
        cy.task('log', 'ℹ️ No phone verification popup found');
      }
    });
    
    // PHASE 7: Multi-Step Progression Validation
    cy.task('log', '📍 PHASE 7: Multi-Step Progression Validation');
    
    cy.wait(3000);
    
    // Continue through additional steps
    for (let step = 2; step <= 4; step++) {
      cy.task('log', `🔄 Attempting progression to step ${step}`);
      
      // Check current URL and step
      cy.url().then(url => {
        cy.task('log', `   Current URL: ${url}`);
      });
      
      // Look for continue buttons
      cy.get('body').then($body => {
        const continueButtons = [
          'button:contains("הבא")',
          'button:contains("המשך")',
          'button:contains("Continue")',
          'button:contains("Next")'
        ];
        
        let buttonFound = false;
        
        continueButtons.forEach(selector => {
          if (!buttonFound) {
            const elements = $body.find(selector);
            if (elements.length > 0) {
              const visibleElements = elements.filter(':visible:not(:disabled)');
              if (visibleElements.length > 0) {
                const element = visibleElements.first();
                const text = element.text().trim();
                cy.task('log', `   Found continue button: "${text}"`);
                cy.wrap(element).click({ force: true });
                buttonFound = true;
                
                cy.screenshot(`07-step-${step}-progression`, { 
                  capture: 'fullPage',
                  overwrite: true 
                });
                cy.task('log', `📸 Step ${step} progression snapshot captured`);
              }
            }
          }
        });
        
        if (!buttonFound) {
          cy.task('log', `   No continue button found at step ${step}`);
        }
      });
      
      cy.wait(2000);
      
      // Fill any new form fields that appear
      cy.fillNewFormFieldsWithLogging();
    }
    
    // PHASE 8: Final State Validation
    cy.task('log', '📍 PHASE 8: Final State Validation');
    
    cy.url().then(url => {
      cy.task('log', `🏁 Final URL: ${url}`);
      
      if (url.includes('calculate-mortgage/4') || url.includes('/4')) {
        cy.task('log', '🎉 SUCCESS: Reached calculate-mortgage/4!');
      } else {
        cy.task('log', `📍 Final state reached: ${url}`);
      }
    });
    
    // Analyze final page content
    cy.get('body').then($body => {
      const buttons = $body.find('button');
      const inputs = $body.find('input');
      const links = $body.find('a');
      const headings = $body.find('h1, h2, h3, h4, h5, h6');
      
      cy.task('log', '📊 Final page analysis:');
      cy.task('log', `   Buttons: ${buttons.length}`);
      cy.task('log', `   Inputs: ${inputs.length}`);
      cy.task('log', `   Links: ${links.length}`);
      cy.task('log', `   Headings: ${headings.length}`);
      
      // Log main headings
      headings.each((index, heading) => {
        const text = Cypress.$(heading).text().trim();
        if (text) {
          cy.task('log', `   Heading: "${text}"`);
        }
      });
    });
    
    cy.screenshot('08-final-state-complete', { 
      capture: 'fullPage',
      overwrite: true 
    });
    cy.task('log', '📸 Final state snapshot captured');
    
    cy.task('log', '==================== UI VALIDATION COMPLETE ====================');
    cy.task('log', `📅 Test completed at: ${new Date().toISOString()}`);
  });

  it('should validate responsive design across different viewports', () => {
    cy.task('log', '📱 Starting responsive design validation');
    
    const viewports = [
      { name: 'Desktop', width: 1440, height: 900 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    viewports.forEach(viewport => {
      cy.task('log', `📏 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
      
      cy.viewport(viewport.width, viewport.height);
      cy.wait(1000);
      
      // Navigate to mortgage calculator
      cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
      cy.wait(2000);
      
      // Take responsive snapshot
      cy.screenshot(`responsive-${viewport.name.toLowerCase()}-${viewport.width}x${viewport.height}`, {
        capture: 'fullPage',
        overwrite: true
      });
      cy.task('log', `📸 ${viewport.name} viewport snapshot captured`);
      
      // Validate elements are still visible and clickable
      cy.get('button:contains("הבא")').should('be.visible').then(() => {
        cy.task('log', `✅ Next button visible on ${viewport.name}`);
      });
      
      // Go back to homepage for next test
      cy.visit('http://localhost:5173/');
      cy.wait(2000);
    });
    
    cy.task('log', '✅ Responsive design validation complete');
  });
});

// Custom command for form filling with detailed logging
Cypress.Commands.add('fillNewFormFieldsWithLogging', () => {
  cy.task('log', '📝 Scanning for new form fields to fill');
  
  cy.get('body').then($body => {
    // Find empty text inputs
    const emptyTextInputs = $body.find('input[type="text"]:visible:not(:disabled):not(.react-dropdown-select-input)').filter((i, input) => {
      return !Cypress.$(input).val();
    });
    
    if (emptyTextInputs.length > 0) {
      cy.task('log', `   Found ${emptyTextInputs.length} empty text inputs`);
      emptyTextInputs.each((index, input) => {
        const $input = Cypress.$(input);
        const name = $input.attr('name') || $input.attr('placeholder') || `text-input-${index}`;
        
        let value = 'Test Value';
        if (name.includes('שם') || name.includes('name')) value = 'דוד כהן';
        else if (name.includes('טלפון') || name.includes('phone')) value = '050-123-4567';
        else if (name.includes('מייל') || name.includes('email')) value = 'test@example.com';
        
        cy.wrap($input).type(value, { force: true });
        cy.task('log', `   ✅ Filled "${name}" with "${value}"`);
        cy.wait(200);
      });
    } else {
      cy.task('log', '   No empty text inputs found');
    }
    
    // Find empty number inputs
    const emptyNumberInputs = $body.find('input[type="number"]:visible:not(:disabled)').filter((i, input) => {
      return !Cypress.$(input).val();
    });
    
    if (emptyNumberInputs.length > 0) {
      cy.task('log', `   Found ${emptyNumberInputs.length} empty number inputs`);
      emptyNumberInputs.each((index, input) => {
        const $input = Cypress.$(input);
        const name = $input.attr('name') || $input.attr('placeholder') || `number-input-${index}`;
        
        let value = '100';
        if (name.includes('price') || name.includes('amount')) value = '500000';
        else if (name.includes('income')) value = '15000';
        else if (name.includes('percent') || name.includes('rate')) value = '3.5';
        
        cy.wrap($input).type(value, { force: true });
        cy.task('log', `   ✅ Filled number input "${name}" with "${value}"`);
        cy.wait(200);
      });
    } else {
      cy.task('log', '   No empty number inputs found');
    }
    
    // Handle unchecked required checkboxes
    const requiredCheckboxes = $body.find('input[type="checkbox"]:visible').filter((i, checkbox) => {
      const $checkbox = Cypress.$(checkbox);
      const name = $checkbox.attr('name') || $checkbox.attr('id') || '';
      return (name.includes('terms') || name.includes('agree')) && !$checkbox.is(':checked');
    });
    
    if (requiredCheckboxes.length > 0) {
      cy.task('log', `   Found ${requiredCheckboxes.length} unchecked required checkboxes`);
      requiredCheckboxes.each((index, checkbox) => {
        const name = Cypress.$(checkbox).attr('name') || `checkbox-${index}`;
        cy.wrap(checkbox).check({ force: true });
        cy.task('log', `   ✅ Checked checkbox "${name}"`);
        cy.wait(200);
      });
    } else {
      cy.task('log', '   No unchecked required checkboxes found');
    }
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      fillNewFormFieldsWithLogging(): Chainable<void>
    }
  }
}

export {};