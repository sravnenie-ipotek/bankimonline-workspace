describe('Citizenship Validation Final Test', () => {
  it('should validate citizenship dropdown correctly with Hebrew messages', () => {
    // Visit mortgage calculator step 1
    cy.visit('http://localhost:5173/services/calculate-mortgage/1')
    
    // Wait for page to load
    cy.wait(2000)
    
    // Fill step 1 minimum required fields
    cy.get('input[name="priceOfEstate"]').clear().type('1000000')
    cy.get('input[name="initialFee"]').clear().type('500000')
    
    // Click next button
    cy.contains('button', 'הבא').click()
    
    // Wait for step 2 to load
    cy.wait(2000)
    
    // Fill required fields on step 2
    cy.get('input[name="nameSurname"]').type('Test User')
    
    // Click "Yes" on additional citizenships question
    cy.get('label').contains('כן').click()
    
    // Wait for dropdown to appear
    cy.wait(1000)
    
    // Try to click next without selecting citizenship
    cy.contains('button', 'הבא').click()
    
    // Check validation error appears
    cy.wait(500)
    
    // Look for the correct Hebrew validation message
    cy.contains('יש לבחור מדינות אזרחות נוספות').should('be.visible')
    
    // Now select some countries
    cy.get('input[placeholder="בחר אזרחות"]').click()
    cy.wait(500)
    
    // Select Israel
    cy.contains('ישראל').click()
    
    // Select USA
    cy.contains('ארצות הברית').click()
    
    // Click apply
    cy.contains('החל').click()
    cy.wait(500)
    
    // Verify tags are shown
    cy.get('.multiselect_tag').should('have.length', 2)
    cy.get('.multiselect_tag').first().should('contain', 'ישראל')
    cy.get('.multiselect_tag').last().should('contain', 'ארצות הברית')
    
    // Try to click next again
    cy.contains('button', 'הבא').click()
    
    // Validation error should NOT appear anymore
    cy.contains('יש לבחור מדינות אזרחות נוספות').should('not.exist')
    
    // We should move to step 3 or see other validation errors (not citizenship)
    cy.url().should('include', '/3').then(() => {
      cy.log('✅ Successfully moved to step 3 - citizenship validation passed!')
    }).catch(() => {
      // Check if we have other validation errors (not citizenship)
      cy.get('span').then(($spans) => {
        const hasOtherErrors = Array.from($spans).some(span => 
          span.textContent && 
          !span.textContent.includes('אזרחות') &&
          span.textContent.includes('שדה')
        )
        
        if (hasOtherErrors) {
          cy.log('✅ Citizenship validation passed! Other fields need to be filled.')
        } else {
          throw new Error('Unexpected state - should have moved to step 3 or shown other validation errors')
        }
      })
    })
  })
})