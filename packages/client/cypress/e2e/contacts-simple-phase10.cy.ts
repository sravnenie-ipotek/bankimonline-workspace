describe('Contacts - Phase 10 Quick Validation', () => {
  it('should load the page and display basic database content in Hebrew', () => {
    // Set Hebrew language
    cy.window().then((win) => {
      win.localStorage.setItem('i18nextLng', 'he')
    })
    
    cy.visit('/contacts', { timeout: 15000 })
    cy.wait(3000)
    
    // Verify page loads
    cy.url().should('include', '/contacts')
    
    // Verify main title exists with database content
    cy.get('[class*="title"]').should('be.visible').and('not.be.empty')
    
    // Verify main office section
    cy.get('[class*="office-title"]').should('be.visible').and('not.be.empty')
    
    // Verify address section
    cy.get('[class*="address"]').should('be.visible').and('not.be.empty')
    
    // Verify all 4 tabs exist
    cy.get('[class*="category-tabs"] button').should('have.length', 4)
    
    // Test tab switching
    cy.get('button[class*="tab"]').contains(/Service|שירות/).click()
    cy.wait(1000)
    cy.get('[class*="contact-grid"]').should('be.visible')
    
    // Test credit calculator card (newly created)
    cy.get('[class*="contact-card"]')
      .contains(/Credit Calculator|מחשבון אשראי/)
      .should('be.visible')
    
    // Verify database content is working (no fallback keys visible)
    cy.get('body').should('not.contain.text', 'contacts_title')
    cy.get('body').should('not.contain.text', 'contacts_cooperation')
    cy.get('body').should('not.contain.text', 't(')
    
    // Verify substantial content from database
    cy.get('body').then(($body) => {
      const text = $body.text().trim()
      expect(text).to.have.length.greaterThan(800)
      expect(text).to.not.include('undefined')
      expect(text).to.not.include('null')
    })
    
    // Take screenshot for verification
    cy.screenshot('contacts-phase10-loaded')
  })
})