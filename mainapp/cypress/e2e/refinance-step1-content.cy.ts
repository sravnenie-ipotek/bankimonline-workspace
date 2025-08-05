describe('Refinance Mortgage Step 1 - Content Migration QA', () => {
  beforeEach(() => {
    // Visit the refinance mortgage step 1 page
    cy.visit('/services/refinance-mortgage/1')
    // Wait for the page to load and API calls to complete
    cy.wait(3000)
  })

  it('should display migrated content from database API', () => {
    // Check page title/sidebar
    cy.contains('Mortgage Refinancing').should('be.visible')
    
    // Check form field labels are displayed
    cy.contains('Purpose of Mortgage Refinance').should('be.visible')
    cy.contains('Remaining Mortgage Balance').should('be.visible')
    cy.contains('Current Property Value').should('be.visible')
    cy.contains('Property Type').should('be.visible')
    cy.contains('Current Mortgage Bank').should('be.visible')
    cy.contains('Is the Mortgage Registered in Land Registry?').should('be.visible')
    cy.contains('Mortgage Start Date').should('be.visible')
    
    // Check mortgage details section
    cy.contains('Enter Mortgage Details').should('be.visible')
    cy.contains('Program').should('be.visible')
    cy.contains('Balance').should('be.visible')
    cy.contains('End Date').should('be.visible')
    cy.contains('Interest Rate').should('be.visible')
    cy.contains('Add Program').should('be.visible')
  })

  it('should display dropdown options from database', () => {
    // Test why refinance dropdown
    cy.get('[data-testid="whyRefinancingMortgage"]').click({ force: true })
    cy.contains('Lower Interest Rate').should('be.visible')
    cy.contains('Reduce Monthly Payment').should('be.visible')
    cy.contains('Shorten Mortgage Term').should('be.visible')
    cy.contains('Cash Out Refinance').should('be.visible')
    cy.contains('Consolidate Debts').should('be.visible')
    
    // Test property type dropdown
    cy.get('[data-testid="typeSelect"]').click({ force: true })
    cy.contains('Apartment').should('be.visible')
    cy.contains('Private House').should('be.visible')
    cy.contains('Penthouse').should('be.visible')
    cy.contains('Villa').should('be.visible')
    cy.contains('Other').should('be.visible')
    
    // Test registration status dropdown
    cy.get('[data-testid="propertyRegistered"]').click({ force: true })
    cy.contains('Yes, Registered in Land Registry').should('be.visible')
    cy.contains('No, Not Registered').should('be.visible')
    
    // Test bank dropdown
    cy.get('[data-testid="bank"]').click({ force: true })
    cy.contains('Bank Hapoalim').should('be.visible')
    cy.contains('Bank Leumi').should('be.visible')
    cy.contains('Discount Bank').should('be.visible')
    cy.contains('Massad Bank').should('be.visible')
  })

  it('should display mortgage program dropdown options', () => {
    // Check if mortgage data table is visible
    cy.contains('Enter Mortgage Details').should('be.visible')
    
    // Click on program dropdown in the table
    cy.get('[data-testid="program-dropdown"]').first().click({ force: true })
    
    // Verify program options are displayed from database
    cy.contains('Fixed Interest').should('be.visible')
    cy.contains('Variable Interest').should('be.visible') 
    cy.contains('Prime Interest').should('be.visible')
    cy.contains('Mixed Interest').should('be.visible')
    cy.contains('Other').should('be.visible')
  })

  it('should work in Hebrew language', () => {
    // Switch to Hebrew
    cy.get('[data-testid="language-selector"]').click({ force: true })
    cy.contains('עברית').click({ force: true })
    cy.wait(2000)
    
    // Check Hebrew content is displayed
    cy.contains('מחזור משכנתא').should('be.visible')
    cy.contains('מטרת מחזור המשכנתא').should('be.visible')
    cy.contains('יתרת המשכנתא').should('be.visible')
    cy.contains('שווי הנכס הנוכחי').should('be.visible')
    cy.contains('הזן פרטי המשכנתא').should('be.visible')
  })

  it('should work in Russian language', () => {
    // Switch to Russian
    cy.get('[data-testid="language-selector"]').click({ force: true })
    cy.contains('Русский').click({ force: true })
    cy.wait(2000)
    
    // Check Russian content is displayed
    cy.contains('Рефинансирование ипотеки').should('be.visible')
    cy.contains('Цель рефинансирования ипотеки').should('be.visible')
    cy.contains('Остаток по ипотеке').should('be.visible')
    cy.contains('Текущая стоимость недвижимости').should('be.visible')
    cy.contains('Введите данные ипотеки').should('be.visible')
  })

  it('should handle content API errors gracefully', () => {
    // Intercept content API and simulate error
    cy.intercept('GET', '/api/content/refinance_step1/*', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('contentApiError')
    
    cy.visit('/services/refinance-mortgage/1')
    cy.wait('@contentApiError')
    
    // Should still display something (fallback to translations)
    cy.get('body').should('contain.text', 'refinance')
  })
})