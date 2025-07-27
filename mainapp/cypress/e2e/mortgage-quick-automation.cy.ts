describe('Mortgage Quick Automation', () => {
  it('runs complete mortgage flow automatically in under 30 seconds', () => {
    // Start at mortgage calculator
    cy.visit('/services/calculate-mortgage')
    
    // STEP 1 - Quick fill with minimal required fields
    cy.get('input').first().type('1000000') // Property value
    cy.get('.dropdown-menu').first().click()
    cy.get('.dropdown-menu__list-item').first().click() // City
    cy.get('button:contains("Next")').click()
    
    // STEP 2 - Personal info (minimal)
    cy.url().should('include', '/2')
    cy.get('input[name="nameSurname"]').type('Auto Test')
    cy.get('input[name="birthday"]').type('01/01/1990')
    cy.get('input[name="borrowers"]').clear().type('1')
    // Click all dropdowns and select first option
    cy.get('.dropdown-menu').each(($el) => {
      cy.wrap($el).click()
      cy.wrap($el).find('.dropdown-menu__list-item').first().click()
    })
    cy.get('button:contains("Next")').click()
    
    // STEP 3 - Income (minimal)
    cy.url().should('include', '/3')
    cy.get('input[name="monthlyIncome"]').type('10000')
    cy.get('input[name="startDate"]').type('01/01/2020')
    cy.get('input[name="profession"]').type('Engineer')
    cy.get('input[name="companyName"]').type('Company')
    // Select first option in all dropdowns
    cy.get('.dropdown-menu').each(($el) => {
      cy.wrap($el).click()
      cy.wrap($el).find('.dropdown-menu__list-item').first().click()
    })
    cy.get('button:contains("Next")').click()
    
    // STEP 4 - Submit
    cy.url().should('include', '/4')
    cy.wait(1000) // Wait for any API calls
    cy.get('button').last().click() // Click submit
    
    // Verify completion
    cy.url().should('include', 'application-submitted')
    cy.log('✅ Automation completed!')
  })
})