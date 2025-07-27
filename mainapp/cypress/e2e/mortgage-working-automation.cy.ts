describe('Mortgage Working Automation', () => {
  it('completes mortgage flow automatically', () => {
    // Navigate directly to the mortgage calculator STEP 1
    cy.visit('http://localhost:5173/services/calculate-mortgage/1')
    
    // Wait for the page to fully load
    cy.wait(3000)
    
    // Check if we're on the right page
    cy.url().should('include', 'calculate-mortgage/1')
    
    // ========== STEP 1: Property Details ==========
    cy.log('Step 1: Filling Property Details')
    
    // Property value - find the formatted input and type
    cy.get('.formatted-input').first().within(() => {
      cy.get('input').clear().type('1500000')
    })
    
    // City dropdown - click and select first option
    cy.get('.dropdown-menu').eq(0).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // When needed dropdown
    cy.get('.dropdown-menu').eq(1).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Property type dropdown
    cy.get('.dropdown-menu').eq(2).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // First home dropdown
    cy.get('.dropdown-menu').eq(3).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Property ownership dropdown (important for LTV)
    cy.get('.dropdown-menu').eq(4).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Wait for calculations
    cy.wait(1000)
    
    // Click Next button
    cy.contains('button', /Next|הבא|Далее/i).click()
    
    // ========== STEP 2: Personal Details ==========
    cy.log('Step 2: Filling Personal Information')
    cy.wait(2000)
    
    // Name field
    cy.get('input[name="nameSurname"]').type('Test Automation User')
    
    // Birthday
    cy.get('input[name="birthday"]').type('15/05/1985')
    
    // Education dropdown
    cy.get('.dropdown-menu').first().click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Fill remaining dropdowns with first option
    cy.get('.dropdown-menu').each(($dropdown, index) => {
      if (index > 0) { // Skip first as we already did it
        cy.wrap($dropdown).click()
        cy.wait(300)
        cy.get('.dropdown-menu__list-item').first().click()
        cy.wait(300)
      }
    })
    
    // Number of borrowers
    cy.get('input[name="borrowers"]').clear().type('1')
    
    // Number of children (if field exists)
    cy.get('input[name="howMuchChildrens"]').then($el => {
      if ($el.length) {
        cy.wrap($el).clear().type('2')
      }
    })
    
    // Click Next
    cy.contains('button', /Next|הבא|Далее/i).click()
    
    // ========== STEP 3: Income Information ==========
    cy.log('Step 3: Filling Income Details')
    cy.wait(2000)
    
    // Select income source (first dropdown)
    cy.get('.dropdown-menu').first().click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Monthly income
    cy.get('input[name="monthlyIncome"]').type('15000')
    
    // Start date
    cy.get('input[name="startDate"]').type('01/01/2020')
    
    // Field of activity dropdown
    cy.get('.dropdown-menu').eq(1).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Profession
    cy.get('input[name="profession"]').type('Software Engineer')
    
    // Company name
    cy.get('input[name="companyName"]').type('Tech Corp')
    
    // Additional income dropdown (select No)
    cy.get('.dropdown-menu').eq(2).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Obligations dropdown (select No)
    cy.get('.dropdown-menu').eq(3).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Click Next
    cy.contains('button', /Next|הבא|Далее/i).click()
    
    // ========== STEP 4: Submit Application ==========
    cy.log('Step 4: Submitting Application')
    cy.wait(3000)
    
    // Click Submit/Continue button
    cy.get('button').last().click()
    
    // Verify we reached the success page
    cy.wait(2000)
    cy.url().should('include', 'application-submitted')
    
    cy.log('✅ Mortgage automation completed successfully!')
  })
})