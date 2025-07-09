describe('Broker Questionnaire', () => {
  beforeEach(() => {
    // Visit the broker questionnaire page
    cy.visit('/broker-questionnaire')
    cy.wait(1000) // Wait for page to load
  })

  it('should navigate to application-submitted page after successful form submission', () => {
    // Fill in all required fields
    
    // Contact Information
    cy.get('input[name="fullName"]').type('Test Broker')
    cy.get('input[name="phone"]').type('972544123456')
    cy.get('input[name="email"]').type('test@example.com')
    
    // Location - Click on dropdowns and select first option
    cy.contains('City').parent().find('[class*="dropdown"]').first().click()
    cy.get('[class*="dropdown-item"]').first().click()
    
    cy.contains('Desired region').parent().find('[class*="dropdown"]').first().click()
    cy.get('[class*="dropdown-item"]').first().click()
    
    // Professional Information
    cy.contains('Employment type').parent().find('[class*="dropdown"]').first().click()
    cy.contains('Employment').click()
    
    cy.contains('Monthly income').parent().find('[class*="dropdown"]').first().click()
    cy.contains('10000-20000').click()
    
    cy.contains('Work experience').parent().find('[class*="dropdown"]').first().click()
    cy.contains('3-5').click()
    
    // Additional Questions - Click Yes/No buttons
    cy.contains('Do you have client cases?').parent().parent().find('button').contains('No').click()
    cy.contains('Do you have debt cases?').parent().parent().find('button').contains('No').click()
    
    // Agreement checkbox
    cy.get('input[type="checkbox"][name="agreement"]').check()
    
    // Submit the form
    cy.contains('Submit').click()
    
    // Verify navigation to application-submitted page
    cy.url().should('include', '/services/application-submitted')
    cy.contains('Application Submitted').should('be.visible')
  })

  it('should show validation errors when submitting empty form', () => {
    // Try to submit without filling any fields
    cy.contains('Submit').should('be.disabled')
    
    // Check agreement to enable submit button (but form still invalid)
    cy.get('input[type="checkbox"][name="agreement"]').check()
    
    // Verify submit button is still disabled due to validation
    cy.contains('Submit').should('be.disabled')
  })

  it('should handle business employment type with additional fields', () => {
    // Fill basic fields
    cy.get('input[name="fullName"]').type('Business Owner')
    cy.get('input[name="phone"]').type('972544123456')
    cy.get('input[name="email"]').type('business@example.com')
    
    // Select business employment type
    cy.contains('Employment type').parent().find('[class*="dropdown"]').first().click()
    cy.contains('Business').click()
    
    // Verify additional business fields appear
    cy.contains('Organization number').should('be.visible')
    cy.contains('Organization name').should('be.visible')
    cy.contains('Average clients per month').should('be.visible')
    
    // Fill business fields
    cy.get('input[placeholder*="organization number"]').type('123456789')
    cy.get('input[name="organizationName"]').type('Test Business Ltd')
    cy.get('input[placeholder*="average clients"]').type('50')
    
    // Complete rest of form
    cy.contains('City').parent().find('[class*="dropdown"]').first().click()
    cy.get('[class*="dropdown-item"]').first().click()
    
    cy.contains('Desired region').parent().find('[class*="dropdown"]').first().click()
    cy.get('[class*="dropdown-item"]').first().click()
    
    cy.contains('Monthly income').parent().find('[class*="dropdown"]').first().click()
    cy.contains('20000-50000').click()
    
    cy.contains('Work experience').parent().find('[class*="dropdown"]').first().click()
    cy.contains('5-10').click()
    
    cy.contains('Do you have client cases?').parent().parent().find('button').contains('Yes').click()
    cy.contains('Do you have debt cases?').parent().parent().find('button').contains('No').click()
    
    cy.get('input[type="checkbox"][name="agreement"]').check()
    
    // Submit and verify navigation
    cy.contains('Submit').click()
    cy.url().should('include', '/services/application-submitted')
  })
})