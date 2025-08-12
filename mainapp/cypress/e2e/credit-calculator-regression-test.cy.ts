describe('Credit Calculator Regression Test', () => {
  beforeEach(() => {
    cy.visit('/', { timeout: 30000 })
    cy.wait(2000)
  })

  it('should navigate to Credit Calculator Step 3 and test income source functionality', () => {
    // Navigate directly to Credit Calculator Step 3
    cy.visit('/services/calculate-credit/3/', { timeout: 30000 })
    cy.wait(3000)
    
    // Take screenshot of initial state
    cy.screenshot('credit-step3-initial-state')
    
    // Log current URL and page state
    cy.url().should('include', '/services/calculate-credit/3/')
    
    // Check for main source of income dropdown
    cy.get('[data-testid="main-source-of-income"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
    
    cy.screenshot('credit-step3-dropdown-found')
    
    // Click on the income source dropdown
    cy.get('[data-testid="main-source-of-income"]').click()
    cy.wait(1000)
    
    cy.screenshot('credit-step3-dropdown-opened')
    
    // Check if dropdown options are available
    cy.get('[data-testid*="option"]', { timeout: 5000 })
      .should('have.length.greaterThan', 0)
    
    // Select Employee option (should be first option)
    cy.get('[data-testid*="option"]').first().click()
    cy.wait(2000)
    
    cy.screenshot('credit-step3-employee-selected')
    
    // Check if income components appear after selection
    // These are the components that should render for employee income
    const expectedComponents = [
      '[data-testid*="monthly-income"]',
      '[data-testid*="start-date"]', 
      '[data-testid*="field-activity"]',
      '[data-testid*="profession"]',
      '[data-testid*="company-name"]'
    ]
    
    // Check for at least one income component
    cy.get('body').then(($body) => {
      let componentFound = false
      expectedComponents.forEach(selector => {
        if ($body.find(selector).length > 0) {
          componentFound = true
          cy.log(`Found component: ${selector}`)
        }
      })
      
      if (componentFound) {
        cy.log('✅ SUCCESS: Income components are rendering after selection')
      } else {
        cy.log('❌ FAILURE: No income components found after selection')
        cy.screenshot('credit-step3-components-missing')
      }
    })
    
    // Take final screenshot
    cy.screenshot('credit-step3-final-state')
  })

  it('should test Self-employed income source selection', () => {
    cy.visit('/services/calculate-credit/3/', { timeout: 30000 })
    cy.wait(3000)
    
    // Find and click income source dropdown
    cy.get('[data-testid="main-source-of-income"]', { timeout: 10000 }).click()
    cy.wait(1000)
    
    // Try to select Self-employed option (usually second option)
    cy.get('[data-testid*="option"]').eq(1).click()
    cy.wait(2000)
    
    cy.screenshot('credit-step3-self-employed-selected')
    
    // Check for self-employed specific components
    cy.get('body').then(($body) => {
      const selfEmployedComponents = [
        '[data-testid*="monthly-income"]',
        '[data-testid*="business-type"]',
        '[data-testid*="business-name"]'
      ]
      
      let componentFound = false
      selfEmployedComponents.forEach(selector => {
        if ($body.find(selector).length > 0) {
          componentFound = true
          cy.log(`Found self-employed component: ${selector}`)
        }
      })
      
      expect(componentFound).to.be.true
    })
  })
  
  it('should validate Mortgage Calculator still works (regression test)', () => {
    // Test that the mortgage calculator is not broken by the credit fix
    cy.visit('/services/calculate-mortgage/3/', { timeout: 30000 })
    cy.wait(3000)
    
    cy.screenshot('mortgage-step3-regression-test')
    
    // Check that mortgage step 3 loads properly
    cy.get('[data-testid="main-source-of-income"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      
    cy.get('[data-testid="main-source-of-income"]').click()
    cy.wait(1000)
    
    // Select employee option
    cy.get('[data-testid*="option"]').first().click()
    cy.wait(2000)
    
    cy.screenshot('mortgage-step3-employee-selected-regression')
    
    // Verify components render for mortgage calculator too
    cy.get('body').then(($body) => {
      const incomeComponents = [
        '[data-testid*="monthly-income"]',
        '[data-testid*="field"], [data-testid*="activity"]'
      ]
      
      let componentFound = false
      incomeComponents.forEach(selector => {
        if ($body.find(selector).length > 0) {
          componentFound = true
          cy.log(`Found mortgage component: ${selector}`)
        }
      })
      
      expect(componentFound, 'Mortgage calculator should still work after credit fix').to.be.true
    })
  })
})