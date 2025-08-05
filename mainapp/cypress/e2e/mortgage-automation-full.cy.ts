describe('Mortgage Calculator Full Automation - Steps 1-4', () => {
  beforeEach(() => {
    // Visit the mortgage calculator page with proper base URL
    cy.visit('http://localhost:5173/services/calculate-mortgage')
    // Wait for page to load
    cy.wait(2000)
  })

  it('should complete entire mortgage application flow automatically', () => {
    // ========== STEP 1: Property Details ==========
    cy.log('📍 Step 1: Filling Property Details')
    
    // Fill property value - target the actual input inside FormattedInput
    cy.get('[data-testid="property-price-input"]').within(() => {
      cy.get('input[type="text"]').clear().type('1500000')
    })
    
    // Select city (first option)
    cy.get('[data-testid="city-dropdown"]').click()
    cy.get('[data-testid="city-dropdown"] .dropdown-menu__list-item').first().click()
    
    // Select when needed (first option)
    cy.get('[data-testid="when-needed-dropdown"]').click()
    cy.get('[data-testid="when-needed-dropdown"] .dropdown-menu__list-item').first().click()
    
    // Set initial payment using slider
    cy.get('[data-testid="initial-fee-input"] input[type="range"]').invoke('val', 500000).trigger('input')
    
    // Select property type (first option)
    cy.get('[data-testid="property-type-dropdown"]').click()
    cy.get('[data-testid="property-type-dropdown"] .dropdown-menu__list-item').first().click()
    
    // Select first home (Yes)
    cy.get('[data-testid="first-home-dropdown"]').click()
    cy.get('[data-testid="first-home-dropdown"] .dropdown-menu__list-item').first().click()
    
    // Select property ownership (No property - 75% LTV)
    cy.get('[data-testid="property-ownership-dropdown"]').click()
    cy.get('[data-testid="property-ownership-dropdown"] .dropdown-menu__list-item').first().click()
    
    // Click Next button
    cy.get('button').contains('Next').click()
    
    // ========== STEP 2: Personal Details ==========
    cy.log('📍 Step 2: Filling Personal Information')
    
    // Wait for step 2 to load
    cy.url().should('include', '/services/calculate-mortgage/2')
    
    // Fill name
    cy.get('input[name="nameSurname"]').type('Test User Automation')
    
    // Fill birthday
    cy.get('input[name="birthday"]').type('15/05/1985')
    
    // Select education (first option)
    cy.get('[data-testid="education-dropdown"]').click()
    cy.get('[data-testid="education-dropdown"] .dropdown-menu__list-item').first().click()
    
    // Select additional citizenships (No)
    cy.get('[data-testid="additional-citizenships-dropdown"]').click()
    cy.get('[data-testid="additional-citizenships-dropdown"] .dropdown-menu__list-item').contains('No').click()
    
    // Select pay taxes (No)
    cy.get('[data-testid="taxes-dropdown"]').click()
    cy.get('[data-testid="taxes-dropdown"] .dropdown-menu__list-item').contains('No').click()
    
    // Select children (Yes)
    cy.get('[data-testid="children-dropdown"]').click()
    cy.get('[data-testid="children-dropdown"] .dropdown-menu__list-item').contains('Yes').click()
    
    // Enter number of children
    cy.get('input[name="howMuchChildrens"]').type('2')
    
    // Select medical insurance (Yes)
    cy.get('[data-testid="medical-insurance-dropdown"]').click()
    cy.get('[data-testid="medical-insurance-dropdown"] .dropdown-menu__list-item').contains('Yes').click()
    
    // Select foreigner status (No)
    cy.get('[data-testid="foreigner-dropdown"]').click()
    cy.get('[data-testid="foreigner-dropdown"] .dropdown-menu__list-item').contains('No').click()
    
    // Select public person (No)
    cy.get('[data-testid="public-person-dropdown"]').click()
    cy.get('[data-testid="public-person-dropdown"] .dropdown-menu__list-item').contains('No').click()
    
    // Enter number of borrowers
    cy.get('input[name="borrowers"]').clear().type('1')
    
    // Select family status (Single)
    cy.get('[data-testid="family-status-dropdown"]').click()
    cy.get('[data-testid="family-status-dropdown"] .dropdown-menu__list-item').first().click()
    
    // Click Next button
    cy.get('button').contains('Next').click()
    
    // ========== STEP 3: Income & Employment ==========
    cy.log('📍 Step 3: Filling Income Information')
    
    // Wait for step 3 to load
    cy.url().should('include', '/services/calculate-mortgage/3')
    
    // Select main source of income (Employed)
    cy.get('[data-testid="income-source-dropdown"]').click()
    cy.get('[data-testid="income-source-dropdown"] .dropdown-menu__list-item').first().click()
    
    // Enter monthly income
    cy.get('input[name="monthlyIncome"]').type('15000')
    
    // Enter start date
    cy.get('input[name="startDate"]').type('01/01/2020')
    
    // Select field of activity
    cy.get('[data-testid="field-activity-dropdown"]').click()
    cy.get('[data-testid="field-activity-dropdown"] .dropdown-menu__list-item').first().click()
    
    // Enter profession
    cy.get('input[name="profession"]').type('Software Engineer')
    
    // Enter company name
    cy.get('input[name="companyName"]').type('Tech Company Ltd')
    
    // Select additional income (No)
    cy.get('[data-testid="additional-income-dropdown"]').click()
    cy.get('[data-testid="additional-income-dropdown"] .dropdown-menu__list-item').contains('No').click()
    
    // Select obligations (No)
    cy.get('[data-testid="obligations-dropdown"]').click()
    cy.get('[data-testid="obligations-dropdown"] .dropdown-menu__list-item').contains('No').click()
    
    // Click Next button
    cy.get('button').contains('Next').click()
    
    // ========== STEP 4: Bank Offers & Submission ==========
    cy.log('📍 Step 4: Reviewing Bank Offers and Submitting')
    
    // Wait for step 4 to load
    cy.url().should('include', '/services/calculate-mortgage/4')
    
    // Wait for bank offers to load (if any)
    cy.wait(2000)
    
    // Click Submit/Next button to complete the automation
    cy.get('button').contains(/Next|Submit|Continue/i).click()
    
    // ========== VERIFICATION: Application Submitted ==========
    cy.log('✅ Verifying Application Submission')
    
    // Should redirect to application submitted page
    cy.url().should('include', '/services/application-submitted')
    
    // Verify success message appears
    cy.contains(/application.*submitted|thank you|successfully/i).should('be.visible')
    
    cy.log('🎉 Mortgage automation completed successfully!')
  })

  it('should handle different property ownership scenarios', () => {
    // Test with "Has Property" option (50% LTV)
    cy.log('📍 Testing with Has Property option')
    
    // Fill step 1 with different property ownership
    cy.get('[data-testid="property-price-input"] input').clear().type('2000000')
    cy.get('[data-testid="property-ownership-dropdown"]').click()
    cy.get('[data-testid="property-ownership-dropdown"] .dropdown-menu__list-item').contains('property').click()
    
    // Verify initial payment minimum is adjusted (should be 50% = 1,000,000)
    cy.get('[data-testid="initial-fee-input"] input[type="range"]')
      .should('have.attr', 'min')
      .and('equal', '1000000')
  })
})