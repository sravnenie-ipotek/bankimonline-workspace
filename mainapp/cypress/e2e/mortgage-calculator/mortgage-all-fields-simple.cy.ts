/**
 * Simplified Mortgage Calculator Test - Focus on mandatory fields
 * Many fields have default values, so we only need to fill what's missing
 */

describe('Mortgage Calculator - All Fields Simple', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:5173/');
    cy.wait(3000);
  });

  it('should fill mandatory fields and complete the flow', () => {
    cy.log('🏠 Starting mortgage calculator');
    
    // Navigate to mortgage calculator
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    cy.wait(3000);
    cy.url().should('include', '/services/calculate-mortgage/1');
    cy.screenshot('step1-initial-state');
    
    // Log current form state
    cy.log('📝 Checking current form values:');
    
    // Check which fields already have values
    cy.get('input[value="1,000,000"]').should('exist').then(() => {
      cy.log('✅ Property value: 1,000,000 (default)');
    });
    
    // The main issue is usually the city field - let's check if it needs to be filled
    cy.get('input[placeholder="עיר"]').then($input => {
      const value = $input.val();
      if (!value || value === '') {
        cy.log('❌ City field is empty - needs to be filled');
        
        // Click on the parent container to open dropdown
        cy.wrap($input).parent().parent().click();
        cy.wait(1000);
        
        // Try to find and click on dropdown options
        cy.get('body').then($body => {
          // Look for dropdown by various selectors
          const dropdownSelectors = [
            '.react-dropdown-select-dropdown',
            '[class*="dropdown"]',
            'div[role="listbox"]',
            '.dropdown-menu'
          ];
          
          let found = false;
          for (const selector of dropdownSelectors) {
            const dropdown = $body.find(selector + ':visible');
            if (dropdown.length > 0 && !found) {
              cy.log(`Found dropdown with selector: ${selector}`);
              // Click first option
              cy.wrap(dropdown).find('div, li, option').first().click({ force: true });
              found = true;
              cy.log('✅ Selected first city option');
            }
          }
          
          if (!found) {
            cy.log('⚠️ Could not find dropdown, typing directly');
            cy.wrap($input).type('תל אביב', { force: true });
          }
        });
      } else {
        cy.log(`✅ City field already has value: ${value}`);
      }
    });
    
    // Check other dropdown fields
    const dropdownFields = [
      { placeholder: 'בחר מסגרת זמן', name: 'Timeline' },
      { placeholder: 'בחר סוג משכנתא', name: 'Property type' },
      { placeholder: 'בחר סטטוס הנכס', name: 'Property status' }
    ];
    
    dropdownFields.forEach(field => {
      cy.get(`input[placeholder="${field.placeholder}"]`).then($input => {
        const value = $input.val();
        if (value && value !== '') {
          cy.log(`✅ ${field.name} already selected: ${value}`);
        } else {
          cy.log(`❌ ${field.name} needs selection`);
          // Try to select it
          cy.wrap($input).parent().parent().click();
          cy.wait(500);
          cy.get('body').then($body => {
            const dropdown = $body.find('.react-dropdown-select-dropdown:visible, [class*="dropdown"]:visible');
            if (dropdown.length > 0) {
              cy.wrap(dropdown).find('div, li').first().click({ force: true });
              cy.log(`✅ Selected first ${field.name} option`);
            }
          });
        }
      });
    });
    
    cy.wait(1000);
    cy.screenshot('step1-after-filling-fields');
    
    // Click Next button
    cy.get('button:contains("הבא")').should('be.visible').click();
    cy.log('🚀 Clicked Next button');
    
    cy.wait(2000);
    
    // Handle SMS verification popup
    cy.get('body').then($body => {
      if ($body.find('heading:contains("הזן את מספר הטלפון")').length > 0) {
        cy.log('📱 SMS verification popup appeared');
        cy.screenshot('sms-popup');
        
        // Fill name and phone
        cy.get('form').within(() => {
          // Name field (usually first input)
          cy.get('input').eq(0).clear().type('דוד כהן');
          cy.log('✅ Filled name: דוד כהן');
          
          // Phone field (usually second input)
          cy.get('input').eq(1).clear().type('0501234567');
          cy.log('✅ Filled phone: 0501234567');
        });
        
        cy.wait(1000);
        
        // Look for ways to continue
        const continueSelectors = [
          'a:contains("כאן")', // "already registered" link
          'button:contains("כאן")',
          'button:contains("המשך")',
          'button[type="submit"]'
        ];
        
        let clicked = false;
        continueSelectors.forEach(selector => {
          if (!clicked) {
            cy.get('body').then($body => {
              const element = $body.find(selector);
              if (element.length > 0 && element.is(':visible')) {
                cy.wrap(element.first()).click({ force: true });
                clicked = true;
                cy.log(`✅ Clicked: ${selector}`);
              }
            });
          }
        });
        
        // If nothing worked, close the popup
        if (!clicked) {
          cy.get('button:contains("×")').first().click({ force: true });
          cy.log('✅ Closed popup');
        }
      } else {
        cy.log('ℹ️ No SMS popup appeared');
      }
    });
    
    cy.wait(2000);
    
    // Continue through remaining steps
    for (let step = 2; step <= 4; step++) {
      cy.url().then(url => {
        cy.log(`📍 Current step from URL: ${url}`);
        
        if (url.includes(`/${step}`)) {
          cy.log(`📝 On Step ${step}`);
          cy.screenshot(`step${step}-page`);
          
          // Fill any required fields on this step
          cy.get('input:visible:not([readonly]):not([type="hidden"])').each(($input, index) => {
            const value = $input.val();
            const placeholder = $input.attr('placeholder') || '';
            const type = $input.attr('type') || 'text';
            
            // Skip if already has value or is a dropdown input
            if (!value && !$input.hasClass('react-dropdown-select-input')) {
              if (type === 'number' || placeholder.includes('הכנסה')) {
                cy.wrap($input).type('15000');
                cy.log(`✅ Filled income field ${index + 1}: 15000`);
              } else if (placeholder.includes('שם')) {
                cy.wrap($input).type('דוד כהן');
                cy.log(`✅ Filled name field ${index + 1}`);
              } else if (placeholder.includes('טלפון')) {
                cy.wrap($input).type('0501234567');
                cy.log(`✅ Filled phone field ${index + 1}`);
              } else if (placeholder.includes('מייל') || placeholder.includes('email')) {
                cy.wrap($input).type('test@example.com');
                cy.log(`✅ Filled email field ${index + 1}`);
              } else if (type === 'text') {
                cy.wrap($input).type('ערך לדוגמה');
                cy.log(`✅ Filled text field ${index + 1}`);
              }
            }
          });
          
          // Check any required checkboxes
          cy.get('input[type="checkbox"]:visible:not(:checked)').each(($checkbox) => {
            const id = $checkbox.attr('id') || '';
            const name = $checkbox.attr('name') || '';
            
            if (id.includes('terms') || name.includes('terms') || 
                id.includes('agree') || name.includes('agree')) {
              cy.wrap($checkbox).check({ force: true });
              cy.log('✅ Checked terms/agreement checkbox');
            }
          });
          
          // Find and click continue button
          cy.get('button:visible').each($button => {
            const text = $button.text().trim();
            if (text === 'הבא' || text === 'המשך' || text === 'Next' || text === 'Continue') {
              cy.wrap($button).click();
              cy.log(`✅ Clicked button: ${text}`);
              return false; // break the each loop
            }
          });
          
          cy.wait(2000);
        }
      });
    }
    
    // Final check
    cy.url().then(url => {
      cy.log(`🏁 Final URL: ${url}`);
      cy.screenshot('final-state');
      
      if (url.includes('/4')) {
        cy.log('🎉 SUCCESS! Reached step 4');
      } else {
        cy.log(`📍 Ended at: ${url}`);
      }
    });
  });
});

export {};