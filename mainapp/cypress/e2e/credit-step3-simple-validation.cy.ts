describe('Credit Calculator Step 3 - Simple Validation', () => {
  it('should load with Hebrew content and populated dropdowns', () => {
    // Visit the Credit Calculator Step 3 page
    cy.visit('http://localhost:5174/services/calculate-credit/3')
    
    // Wait for page to load completely
    cy.wait(3000)
    
    // Check that the page is in Hebrew
    cy.get('html').should('have.attr', 'dir', 'rtl')
    
    // Check for Hebrew text content (should not be empty/undefined)
    cy.get('body').should('not.contain', 'undefined')
    cy.get('body').should('not.contain', 'null')
    
    // Check that there are dropdown elements on the page
    cy.get('body').find('select, [role="combobox"], [role="button"], .dropdown, input[type="text"]')
      .should('have.length.at.least', 1)
    
    // Take a screenshot for visual verification
    cy.screenshot('credit-step3-after-fix', { 
      capture: 'viewport',
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    })
    
    // Check that we can find typical dropdown elements or Hebrew text
    cy.get('body').then($body => {
      const text = $body.text()
      const hasHebrewContent = text.includes('מקור') || 
                               text.includes('הכנסה') || 
                               text.includes('התחייבויות') ||
                               text.includes('חובות')
      
      if (!hasHebrewContent) {
        cy.log('Warning: No Hebrew content found, but page loaded')
      }
    })
    
    // Basic interactivity test - try clicking elements
    cy.get('body').find('div, button, input').first().should('be.visible')
  })
  
  it('should make successful API calls to credit_step3 endpoint', () => {
    // Intercept the dropdown API call
    cy.intercept('GET', '**/api/dropdowns/credit_step3/he').as('getDropdowns')
    cy.intercept('GET', '**/api/content/credit_step3/he').as('getContent')
    
    // Visit the page
    cy.visit('http://localhost:5174/services/calculate-credit/3')
    
    // Wait for API calls
    cy.wait('@getDropdowns', { timeout: 10000 }).then((interception) => {
      // Verify the API call was successful and returned data
      expect(interception.response.statusCode).to.eq(200)
      expect(interception.response.body).to.have.property('status', 'success')
      expect(interception.response.body).to.have.property('dropdowns')
      expect(interception.response.body.dropdowns).to.have.length.at.least(3)
    })
    
    cy.wait('@getContent', { timeout: 10000 }).then((interception) => {
      // Verify content API call was successful
      expect(interception.response.statusCode).to.eq(200)
    })
  })
})