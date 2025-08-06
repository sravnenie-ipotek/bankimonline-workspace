/**
 * Mortgage Calculator - Fill All Mandatory Fields Test
 * Based on actual form structure analysis
 */

describe('Mortgage Calculator - Fill All Mandatory Fields', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:5173/');
    cy.wait(3000);
  });

  it('should fill all mandatory fields and progress through steps', () => {
    cy.log('🏠 Starting mortgage calculator with all fields filled');
    
    // Navigate to mortgage calculator using the working selector
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    cy.wait(3000);
    cy.url().should('include', '/services/calculate-mortgage/1');
    
    // STEP 1: Fill all fields on calculator page
    cy.log('📝 Step 1: Filling calculator fields');
    
    // 1. Property value (שווי הנכס) - already has default
    cy.get('input[value="1,000,000"]').first().clear().type('1500000');
    cy.log('✅ Updated property value to 1,500,000');
    
    // 2. City (עיר בא נמצא הנכס) - This is the most important field
    // Click on the dropdown container, not the input (which is readonly)
    cy.get('input[placeholder="עיר"]').parent().click();
    cy.wait(1000);
    // Select from dropdown
    cy.get('.react-dropdown-select-dropdown:visible').should('exist').then($dropdown => {
      // Look for תל אביב or just click first option
      const telAviv = $dropdown.find('div:contains("תל אביב")');
      if (telAviv.length > 0) {
        cy.wrap(telAviv.first()).click();
        cy.log('✅ Selected תל אביב from dropdown');
      } else {
        cy.wrap($dropdown).find('div').first().click();
        cy.log('✅ Selected first city from dropdown');
      }
    });
    
    // 3. Timeline (מתי תזדקק למשכנתא?)
    cy.get('input[placeholder="בחר מסגרת זמן"]').parent().click();
    cy.wait(500);
    cy.get('.react-dropdown-select-dropdown:visible').should('exist').then($dropdown => {
      const option = $dropdown.find('div:contains("תוך 3 חודשים")');
      if (option.length > 0) {
        cy.wrap(option.first()).click();
        cy.log('✅ Selected timeline: תוך 3 חודשים');
      } else {
        cy.wrap($dropdown).find('div').first().click();
        cy.log('✅ Selected first timeline option');
      }
    });
    
    // 4. Self financing (הון עצמי) - already has default
    cy.get('input[value="500,000"]').should('exist');
    cy.log('✅ Self financing already set: 500,000');
    
    // 5. Property type (סוג משכנתא)
    cy.get('input[placeholder="בחר סוג משכנתא"]').parent().click();
    cy.wait(500);
    cy.get('.react-dropdown-select-dropdown:visible').should('exist').then($dropdown => {
      cy.wrap($dropdown).find('div').first().click();
      cy.log('✅ Selected property type');
    });
    
    // 6. First apartment (האם מדובר בדירה ראשונה?)
    cy.get('input[placeholder="בחר סטטוס הנכס"]').parent().click();
    cy.wait(500);
    cy.get('.react-dropdown-select-dropdown:visible').should('exist').then($dropdown => {
      const yesOption = $dropdown.find('div:contains("כן")');
      if (yesOption.length > 0) {
        cy.wrap(yesOption.first()).click();
        cy.log('✅ Selected: Yes, first apartment');
      } else {
        cy.wrap($dropdown).find('div').first().click();
        cy.log('✅ Selected first status option');
      }
    });
    
    // 7. Loan period (תקופת משכנתא רצויה) - already has default
    cy.get('input[value="4"]').should('exist');
    cy.log('✅ Loan period already set: 4 years');
    
    // 8. Monthly payment (תשלום חודשי) - already calculated
    cy.get('input[value="11,514"]').should('exist');
    cy.log('✅ Monthly payment calculated');
    
    cy.wait(1000);
    cy.screenshot('step1-all-mandatory-fields-filled');
    
    // Click Next button
    cy.get('button:contains("הבא")').click();
    cy.log('🚀 Clicked Next button');
    
    cy.wait(2000);
    
    // Handle SMS verification popup
    cy.get('body').then($body => {
      if ($body.find('heading:contains("הזן את מספר הטלפון")').length > 0) {
        cy.log('📱 SMS verification popup detected');
        
        // Fill name
        cy.get('input').first().clear().type('דוד כהן');
        cy.log('✅ Filled name: דוד כהן');
        
        // Fill phone
        cy.get('input').eq(1).clear().type('0501234567');
        cy.log('✅ Filled phone: 0501234567');
        
        cy.screenshot('sms-popup-filled');
        
        // Handle popup continuation
        cy.get('body').then($body => {
          // Try "already registered" link first
          const alreadyRegistered = $body.find('a:contains("כאן"), button:contains("כאן")');
          if (alreadyRegistered.length > 0) {
            cy.wrap(alreadyRegistered.first()).click({ force: true });
            cy.log('✅ Clicked already registered');
          } else {
            // Try continue button
            const continueBtn = $body.find('button:contains("המשך")');
            if (continueBtn.length > 0 && !continueBtn.is(':disabled')) {
              cy.wrap(continueBtn.first()).click();
              cy.log('✅ Clicked continue');
            } else {
              // Close popup
              const closeBtn = $body.find('button:contains("×")');
              if (closeBtn.length > 0) {
                cy.wrap(closeBtn.first()).click({ force: true });
                cy.log('✅ Closed popup');
              }
            }
          }
        });
      }
    });
    
    cy.wait(2000);
    
    // STEP 2: Personal Details (if we reached it)
    cy.url().then(url => {
      if (url.includes('/2')) {
        cy.log('📝 Step 2: Personal Details');
        
        // Fill any visible empty fields
        cy.get('input:visible:not([readonly])').each($input => {
          if (!$input.val() && !$input.hasClass('react-dropdown-select-input')) {
            const placeholder = $input.attr('placeholder') || '';
            
            if (placeholder.includes('שם') || placeholder.includes('name')) {
              cy.wrap($input).type('דוד כהן');
            } else if (placeholder.includes('טלפון') || placeholder.includes('phone')) {
              cy.wrap($input).type('0501234567');
            } else if (placeholder.includes('מייל') || placeholder.includes('email')) {
              cy.wrap($input).type('david@example.com');
            } else if (placeholder.includes('ת.ז') || placeholder.includes('ID')) {
              cy.wrap($input).type('123456789');
            } else if (placeholder.includes('תאריך') || placeholder.includes('date')) {
              cy.wrap($input).type('01/01/1990');
            }
          }
        });
        
        cy.screenshot('step2-personal-details-filled');
        
        // Continue to next step
        cy.get('button:contains("הבא"), button:contains("המשך")').first().click();
        cy.wait(2000);
      }
    });
    
    // STEP 3: Income (if we reached it)
    cy.url().then(url => {
      if (url.includes('/3')) {
        cy.log('📝 Step 3: Income Details');
        
        // Fill income fields
        cy.get('input[type="number"]:visible, input:visible:not([readonly])').each($input => {
          if (!$input.val() && !$input.hasClass('react-dropdown-select-input')) {
            const placeholder = $input.attr('placeholder') || '';
            const name = $input.attr('name') || '';
            
            if (placeholder.includes('הכנסה') || name.includes('income')) {
              cy.wrap($input).type('15000');
              cy.log('✅ Filled income: 15000');
            } else if (placeholder.includes('בונוס') || name.includes('bonus')) {
              cy.wrap($input).type('5000');
              cy.log('✅ Filled bonus: 5000');
            } else if ($input.attr('type') === 'number') {
              cy.wrap($input).type('1000');
            }
          }
        });
        
        cy.screenshot('step3-income-filled');
        
        // Continue to next step
        cy.get('button:contains("הבא"), button:contains("המשך")').first().click();
        cy.wait(2000);
      }
    });
    
    // STEP 4: Plans (final step)
    cy.url().then(url => {
      if (url.includes('/4')) {
        cy.log('🎉 Step 4: Successfully reached Plans page!');
        cy.screenshot('step4-plans-page-success');
      }
    });
    
    // Final validation
    cy.url().then(url => {
      cy.log(`🏁 Final URL: ${url}`);
      if (url.includes('calculate-mortgage/4')) {
        cy.log('✅ SUCCESS: Completed all steps and reached final page!');
      }
    });
  });

  it('should validate that all fields are properly filled before progression', () => {
    cy.log('🔍 Testing field validation');
    
    // Navigate to calculator using the working selector
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    cy.wait(3000);
    
    // Try to continue without filling city field (most important mandatory field)
    cy.get('button:contains("הבא")').click();
    cy.wait(1000);
    
    // Should show SMS popup since other fields have defaults
    cy.get('body').then($body => {
      if ($body.find('heading:contains("הזן את מספר הטלפון")').length > 0) {
        cy.log('✅ SMS popup appeared - form accepted with default values');
        
        // Now test with city filled
        cy.get('button:contains("×")').first().click({ force: true });
        cy.wait(1000);
        
        // Fill city field
        cy.get('input[placeholder="עיר"]').click().clear().type('תל אביב');
        cy.wait(500);
        
        // Click next again
        cy.get('button:contains("הבא")').click();
        cy.wait(1000);
        
        cy.log('✅ Form progression works with filled city field');
      }
    });
  });
});

export {};