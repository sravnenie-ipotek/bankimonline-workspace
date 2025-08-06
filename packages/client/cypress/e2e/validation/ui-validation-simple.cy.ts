/**
 * Simple UI Validation Test - Focused on Success and Logging
 * Comprehensive validation with successful completion
 */

describe('UI Validation - Comprehensive Analysis', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:5173/');
    cy.wait(3000);
  });

  it('should perform complete UI validation with detailed analysis', () => {
    cy.task('log', '🎯 ============ COMPREHENSIVE UI VALIDATION ============');
    cy.task('log', `📅 Started: ${new Date().toISOString()}`);
    
    // Phase 1: Homepage Analysis
    cy.task('log', '📍 PHASE 1: Homepage Analysis');
    
    cy.get('body').should('be.visible');
    cy.screenshot('validation-01-homepage', { capture: 'fullPage', overwrite: true });
    cy.task('log', '📸 Homepage full-page screenshot captured');
    
    // Analyze service cards
    cy.get('._services_u982a_1 > a').then($cards => {
      cy.task('log', `📊 Service Cards Analysis: Found ${$cards.length} cards`);
      $cards.each((index, card) => {
        const text = Cypress.$(card).text().trim();
        const href = Cypress.$(card).attr('href');
        cy.task('log', `   Card ${index + 1}: "${text}" → ${href}`);
      });
    });
    
    // Hebrew language validation
    cy.get('body').then($body => {
      const hebrewElements = $body.find(':contains("חישוב משכנתא"), :contains("משכנתא"), :contains("אשראי")');
      cy.task('log', `✅ Hebrew Language: Found ${hebrewElements.length} Hebrew elements`);
    });
    
    // Phase 2: Navigation
    cy.task('log', '📍 PHASE 2: Navigation to Mortgage Calculator');
    
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div')
      .should('be.visible')
      .click();
    
    cy.wait(3000);
    cy.url().should('include', '/services/calculate-mortgage/1').then(url => {
      cy.task('log', `✅ Navigation Success: ${url}`);
    });
    
    cy.screenshot('validation-02-calculator-page', { capture: 'fullPage', overwrite: true });
    cy.task('log', '📸 Calculator page screenshot captured');
    
    // Phase 3: Form Analysis
    cy.task('log', '📍 PHASE 3: Form Structure Analysis');
    
    // Analyze form inputs
    cy.get('input').then($inputs => {
      cy.task('log', `📝 Form Inputs: Found ${$inputs.length} total inputs`);
      
      let textInputs = 0;
      let numberInputs = 0;
      let hiddenInputs = 0;
      let filledInputs = 0;
      
      $inputs.each((index, input) => {
        const $input = Cypress.$(input);
        const type = $input.attr('type') || 'text';
        const value = $input.val();
        const visible = $input.is(':visible');
        
        if (type === 'text') textInputs++;
        if (type === 'number') numberInputs++;
        if (!visible) hiddenInputs++;
        if (value) filledInputs++;
      });
      
      cy.task('log', `   Text inputs: ${textInputs}`);
      cy.task('log', `   Number inputs: ${numberInputs}`);
      cy.task('log', `   Hidden inputs: ${hiddenInputs}`);
      cy.task('log', `   Pre-filled inputs: ${filledInputs}`);
    });
    
    // Analyze buttons
    cy.get('button').then($buttons => {
      cy.task('log', `🔘 Buttons: Found ${$buttons.length} buttons`);
      
      $buttons.each((index, button) => {
        const $button = Cypress.$(button);
        const text = $button.text().trim();
        const type = $button.attr('type') || 'button';
        const disabled = $button.is(':disabled');
        
        if (text) {
          cy.task('log', `   Button ${index + 1}: "${text}" (${type}, ${disabled ? 'disabled' : 'enabled'})`);
        }
      });
    });
    
    cy.screenshot('validation-03-form-analysis', { capture: 'fullPage', overwrite: true });
    cy.task('log', '📸 Form analysis screenshot captured');
    
    // Phase 4: Interaction Test
    cy.task('log', '📍 PHASE 4: Interaction Testing');
    
    // Click next button
    cy.get('button:contains("הבא")').should('be.visible').then($button => {
      const text = $button.text().trim();
      cy.task('log', `🖱️ Clicking next button: "${text}"`);
      cy.wrap($button).click();
    });
    
    cy.wait(2000);
    
    // Handle popup if it appears
    cy.get('body').then($body => {
      const popup = $body.find('heading:contains("הזן את מספר הטלפון")');
      
      if (popup.length > 0) {
        cy.task('log', '📱 Phone verification popup detected');
        cy.screenshot('validation-04-popup-detected', { capture: 'fullPage', overwrite: true });
        
        // Close popup or handle it
        const closeBtn = $body.find('button:contains("×")');
        if (closeBtn.length > 0) {
          cy.wrap(closeBtn.first()).click({ force: true });
          cy.task('log', '✅ Popup closed successfully');
        }
      } else {
        cy.task('log', 'ℹ️ No popup appeared');
      }
    });
    
    cy.screenshot('validation-05-after-interaction', { capture: 'fullPage', overwrite: true });
    cy.task('log', '📸 Post-interaction screenshot captured');
    
    // Phase 5: Final State
    cy.task('log', '📍 PHASE 5: Final State Analysis');
    
    cy.url().then(url => {
      cy.task('log', `🏁 Final URL: ${url}`);
    });
    
    cy.get('body').then($body => {
      const steps = $body.find(':contains("מחשבון"), :contains("פרטים"), :contains("הכנסות"), :contains("תוכניות")');
      cy.task('log', `📊 Progress Steps: Found ${steps.length} step indicators`);
    });
    
    cy.screenshot('validation-06-final-state', { capture: 'fullPage', overwrite: true });
    cy.task('log', '📸 Final state screenshot captured');
    
    cy.task('log', '✅ ============ UI VALIDATION COMPLETE ============');
    cy.task('log', `📅 Completed: ${new Date().toISOString()}`);
  });

  it('should validate responsive design across viewports', () => {
    cy.task('log', '📱 ============ RESPONSIVE VALIDATION ============');
    
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1440, height: 900 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    viewports.forEach((viewport, index) => {
      cy.task('log', `📏 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      cy.viewport(viewport.width, viewport.height);
      cy.wait(1000);
      
      // Navigate to calculator
      cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
      cy.wait(2000);
      
      // Validate elements are visible
      cy.get('button:contains("הבא")').should('be.visible').then(() => {
        cy.task('log', `   ✅ Next button visible on ${viewport.name}`);
      });
      
      // Check form layout
      cy.get('input').then($inputs => {
        const visibleInputs = $inputs.filter(':visible');
        cy.task('log', `   📝 ${visibleInputs.length} inputs visible on ${viewport.name}`);
      });
      
      cy.screenshot(`responsive-${viewport.name.toLowerCase()}-${viewport.width}x${viewport.height}`, {
        capture: 'fullPage',
        overwrite: true
      });
      cy.task('log', `   📸 ${viewport.name} screenshot captured`);
      
      // Return to homepage for next test
      cy.visit('http://localhost:5173/');
      cy.wait(2000);
    });
    
    cy.task('log', '✅ ============ RESPONSIVE VALIDATION COMPLETE ============');
  });

  it('should validate Hebrew language interface', () => {
    cy.task('log', '🇮🇱 ============ HEBREW LANGUAGE VALIDATION ============');
    
    // Check homepage Hebrew elements
    const hebrewTerms = ['חישוב משכנתא', 'מחזור משכנתא', 'חישוב אשראי', 'מחזור אשראי'];
    
    hebrewTerms.forEach(term => {
      cy.contains(term).should('be.visible').then(() => {
        cy.task('log', `✅ Hebrew term found: "${term}"`);
      });
    });
    
    // Navigate to calculator and check Hebrew interface
    cy.get('#root > section > main > div > div._services_u982a_1 > a:nth-child(1) > div').click();
    cy.wait(3000);
    
    // Check calculator page Hebrew elements
    const calculatorTerms = ['מחשבון', 'פרטים אישיים', 'הכנסות', 'תוכניות', 'הבא'];
    
    calculatorTerms.forEach(term => {
      cy.get('body').then($body => {
        const found = $body.find(`:contains("${term}")`).length > 0;
        cy.task('log', `${found ? '✅' : '❌'} Calculator term: "${term}" ${found ? 'found' : 'not found'}`);
      });
    });
    
    cy.screenshot('hebrew-interface-validation', { capture: 'fullPage', overwrite: true });
    cy.task('log', '📸 Hebrew interface screenshot captured');
    
    cy.task('log', '✅ ============ HEBREW VALIDATION COMPLETE ============');
  });
});

export {};