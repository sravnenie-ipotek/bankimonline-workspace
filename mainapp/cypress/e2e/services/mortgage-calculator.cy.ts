describe('Mortgage Calculator Flow', () => {
  beforeEach(() => {
    // Login first
    cy.window().then((win) => {
      win.localStorage.setItem('ACCESS_TOKEN', 'test-token')
      win.localStorage.setItem('USER_DATA', JSON.stringify({
        name: 'Test User',
        phone: '972544123456'
      }))
    })
    
    cy.visit('/services/calculate-mortgage')
  })

  it('should display mortgage calculator form', () => {
    cy.contains('חישוב משכנתא').should('be.visible')
    cy.get('[class*="step-indicator"]').should('contain', '1')
  })

  it('should validate required fields on first step', () => {
    // Try to proceed without filling anything
    cy.get('button').contains('המשך').click()
    
    // Should show validation errors
    cy.get('[class*="error"]').should('have.length.greaterThan', 0)
  })

  it('should calculate mortgage with valid inputs', () => {
    cy.fixture('testUser.json').then((testData) => {
      // Step 1: Property details
      cy.fillFormField('propertyValue', testData.mortgageApplication.propertyValue)
      cy.fillFormField('loanAmount', testData.mortgageApplication.loanAmount)
      
      // Select purpose
      cy.get('[name="purpose"]').parent().click()
      cy.get('[class*="react-dropdown-select-item"]').contains('דירה ראשונה').click()
      
      // Select property type
      cy.get('[name="propertyType"]').parent().click()
      cy.get('[class*="react-dropdown-select-item"]').contains('דירה').click()
      
      cy.get('button').contains('המשך').click()
      
      // Step 2: Personal details
      cy.get('[class*="step-indicator"]').should('contain', '2')
      
      // Fill income
      cy.fillFormField('monthlyIncome', testData.mortgageApplication.monthlyIncome)
      
      // Select employment type
      cy.get('[name="employmentType"]').parent().click()
      cy.get('[class*="react-dropdown-select-item"]').contains('שכיר').click()
      
      cy.get('button').contains('המשך').click()
      
      // Step 3: Additional details
      cy.get('[class*="step-indicator"]').should('contain', '3')
      
      // Select loan period
      cy.get('[name="loanPeriod"]').parent().click()
      cy.get('[class*="react-dropdown-select-item"]').contains('25 שנים').click()
      
      cy.get('button').contains('חשב משכנתא').click()
      
      // Should show results
      cy.get('[class*="results"]', { timeout: 10000 }).should('be.visible')
      cy.contains('תוצאות החישוב').should('be.visible')
    })
  })

  it('should handle property value limits', () => {
    // Test minimum value
    cy.fillFormField('propertyValue', '100000')
    cy.get('[class*="error"]').should('contain', 'ערך הנכס חייב להיות לפחות')
    
    // Test maximum value
    cy.fillFormField('propertyValue', '99999999')
    cy.get('[class*="error"]').should('contain', 'ערך הנכס לא יכול לעלות על')
  })

  it('should calculate loan-to-value ratio correctly', () => {
    cy.fillFormField('propertyValue', '2000000')
    cy.fillFormField('loanAmount', '1500000')
    
    // Should show 75% LTV
    cy.get('[data-cy="ltv-display"]').should('contain', '75%')
    
    // Change loan amount
    cy.fillFormField('loanAmount', '1600000')
    
    // Should update to 80% and possibly show warning
    cy.get('[data-cy="ltv-display"]').should('contain', '80%')
    cy.get('[class*="warning"]').should('be.visible')
  })

  it('should save progress and restore on return', () => {
    // Fill first step
    cy.fillFormField('propertyValue', '2000000')
    cy.fillFormField('loanAmount', '1500000')
    
    // Navigate away
    cy.visit('/')
    
    // Come back
    cy.visit('/services/calculate-mortgage')
    
    // Values should be restored
    cy.get('input[name="propertyValue"]').should('have.value', '2,000,000')
    cy.get('input[name="loanAmount"]').should('have.value', '1,500,000')
  })

  it('should handle API errors gracefully', () => {
    cy.mockApiResponse('calculate-mortgage', { 
      success: false, 
      error: 'Service temporarily unavailable' 
    })
    
    // Fill and submit form
    cy.fillFormField('propertyValue', '2000000')
    cy.fillFormField('loanAmount', '1500000')
    cy.get('button').contains('המשך').click()
    
    // Continue through steps...
    // (abbreviated for brevity)
    
    cy.get('button').contains('חשב משכנתא').click()
    
    // Should show error message
    cy.contains('שירות זמנית לא זמין').should('be.visible')
    cy.get('button').contains('נסה שוב').should('be.visible')
  })

  it('should export results as PDF', () => {
    // Complete calculation first
    cy.fillFormField('propertyValue', '2000000')
    cy.fillFormField('loanAmount', '1500000')
    // ... complete form
    
    cy.get('button').contains('חשב משכנתא').click()
    
    // Wait for results
    cy.get('[class*="results"]').should('be.visible')
    
    // Click export
    cy.get('button').contains('הורד כ-PDF').click()
    
    // Verify download started
    cy.readFile('cypress/downloads/mortgage-calculation.pdf').should('exist')
  })

  it('should handle multiple borrowers', () => {
    // Add co-borrower
    cy.get('button').contains('הוסף לווה נוסף').click()
    
    // Fill co-borrower details
    cy.get('[data-cy="co-borrower-name"]').type('לווה נוסף')
    cy.get('[data-cy="co-borrower-income"]').type('15000')
    
    // Continue with calculation
    cy.get('button').contains('המשך').click()
    
    // Should show combined income in summary
    cy.get('[data-cy="total-income"]').should('contain', '40,000')
  })

  it('should validate income vs loan amount', () => {
    cy.fillFormField('propertyValue', '5000000')
    cy.fillFormField('loanAmount', '4000000')
    cy.get('button').contains('המשך').click()
    
    // Enter low income
    cy.fillFormField('monthlyIncome', '10000')
    cy.get('button').contains('המשך').click()
    
    // Should show warning about debt-to-income ratio
    cy.get('[class*="warning"]').should('contain', 'יחס החזר')
  })
})