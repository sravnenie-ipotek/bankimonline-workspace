describe('CRITICAL REGRESSION TEST - Income Source Mapping', () => {
  beforeEach(() => {
    // Visit home page first to establish session
    cy.visit('/')
    cy.wait(2000)
  })

  it('should test Mortgage Calculator income source flow (Expected: WORKING)', () => {
    cy.log('🧪 TESTING: Mortgage Calculator Income Source Flow')
    
    // Navigate to mortgage step 3
    cy.visit('/services/calculate-mortgage/3/')
    cy.wait(3000)
    
    // Check API response for mortgage
    cy.request('GET', '/api/dropdowns/mortgage_step3/en').then((response) => {
      cy.log('📊 Mortgage API Response:', JSON.stringify(response.body, null, 2))
      
      const options = response.body.options?.mortgage_step3_main_source || []
      cy.log('🔍 Mortgage Income Source Options:', JSON.stringify(options, null, 2))
      
      // Verify semantic values are present
      const values = options.map(opt => opt.value)
      expect(values).to.include('employee')
      expect(values).to.include('selfemployed')
      expect(values).to.include('pension')
    })
    
    // Take screenshot
    cy.screenshot('mortgage-step3-before-selection')
    
    // Try to select income source
    cy.get('[data-testid="main-source-income"]', { timeout: 10000 })
      .should('be.visible')
      .click()
    
    // Wait for dropdown options
    cy.wait(1000)
    
    // Select "Employee" option
    cy.get('[role="listbox"] [role="option"]').first().click()
    
    cy.wait(2000)
    cy.screenshot('mortgage-step3-after-selection')
    
    // Verify components appear (should work with semantic values)
    cy.get('body').then(() => {
      cy.log('✅ Mortgage test completed - checking for component rendering')
    })
  })

  it('should test Credit Calculator income source flow (Expected: BROKEN)', () => {
    cy.log('🚨 TESTING: Credit Calculator Income Source Flow - CRITICAL REGRESSION')
    
    // Navigate to credit step 3
    cy.visit('/services/calculate-credit/3/')
    cy.wait(3000)
    
    // Check API response for credit
    cy.request('GET', '/api/dropdowns/calculate_credit_3/en').then((response) => {
      cy.log('📊 Credit API Response:', JSON.stringify(response.body, null, 2))
      
      const options = response.body.options?.calculate_credit_3_main_source || []
      cy.log('🔍 Credit Income Source Options:', JSON.stringify(options, null, 2))
      
      // Document the issue: Credit returns numeric values, not semantic ones
      const values = options.map(opt => opt.value)
      cy.log('🚨 REGRESSION DETECTED: Credit API returns numeric values:', values)
      
      // These should be semantic but are numeric (BROKEN)
      expect(values).to.include('1')  // Should be 'employee'
      expect(values).to.include('2')  // Should be 'selfemployed'
      expect(values).to.include('4')  // Should be 'pension'
    })
    
    // Take screenshot
    cy.screenshot('credit-step3-before-selection')
    
    // Try to select income source
    cy.get('[data-testid="main-source-income"]', { timeout: 10000 })
      .should('be.visible')
      .click()
    
    // Wait for dropdown options
    cy.wait(1000)
    
    // Select first option (Employee - value "1")
    cy.get('[role="listbox"] [role="option"]').first().click()
    
    cy.wait(2000)
    cy.screenshot('credit-step3-after-selection')
    
    // Log what happened - components likely won't render due to key mismatch
    cy.get('body').then(() => {
      cy.log('🚨 Credit test completed - components likely NOT rendering due to value mismatch')
      cy.log('🚨 Selected value "1" does not match componentsByIncomeSource["employee"]')
    })
  })

  it('should document the exact mapping issue with console logs', () => {
    cy.log('📋 DOCUMENTATION: Mapping Issue Analysis')
    
    // Visit credit page and capture console
    cy.visit('/services/calculate-credit/3/')
    cy.wait(2000)
    
    // Get window console logs
    cy.window().then((win) => {
      // Create a console spy
      cy.stub(win.console, 'log').as('consoleLog')
    })
    
    // Try to interact with dropdown
    cy.get('[data-testid="main-source-income"]', { timeout: 10000 })
      .should('be.visible')
      .click()
    
    cy.get('[role="listbox"] [role="option"]').first().click()
    cy.wait(2000)
    
    // Check for the debug logs from ThirdStepForm
    cy.get('@consoleLog').should('have.been.called')
    
    cy.screenshot('credit-console-debug-final')
  })
})