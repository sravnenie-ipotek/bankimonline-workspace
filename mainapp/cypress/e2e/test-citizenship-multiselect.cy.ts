describe('Citizenship MultiSelect Dropdown Test', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080)
  })

  it('should allow selecting multiple citizenship options without closing', () => {
    // Navigate to mortgage calculator step 2
    cy.visit('/services/calculate-mortgage/2')
    cy.wait(2000)

    // Fill required fields first
    cy.get('input[name="firstName"]').type('Test')
    cy.get('input[name="lastName"]').type('User')
    
    // Set birthday
    cy.get('input[name="birthday"]').type('01/01/1990')

    // Find and click "Yes" for additional citizenship
    cy.contains('האם יש לך אזרחות נוספת?').parent().within(() => {
      cy.contains('כן').click()
    })

    // Wait for citizenship dropdown to appear
    cy.wait(1000)

    // Click on the citizenship dropdown to open it
    cy.contains('בחר אזרחות').parent().click()
    
    // Verify dropdown is open
    cy.get('.multiselect-select').should('be.visible')
    
    // Try to select multiple options
    cy.log('Selecting Canada')
    cy.contains('קנדה').click()
    
    // Verify dropdown is still open
    cy.get('.multiselect-select').should('be.visible')
    
    cy.log('Selecting France')
    cy.contains('צרפת').click()
    
    // Verify dropdown is still open
    cy.get('.multiselect-select').should('be.visible')
    
    cy.log('Selecting Germany')
    cy.contains('גרמניה').click()
    
    // Verify checkboxes are checked
    cy.get('input[type="checkbox"]:checked').should('have.length.at.least', 3)
    
    // Click Apply button
    cy.contains('החל').click()
    
    // Verify selections are displayed as tags
    cy.get('.multiselect-input__item').should('have.length.at.least', 3)
    cy.get('.multiselect-input__item').contains('קנדה').should('exist')
    cy.get('.multiselect-input__item').contains('צרפת').should('exist')
    cy.get('.multiselect-input__item').contains('גרמניה').should('exist')
    
    // Take screenshot of successful multi-selection
    cy.screenshot('citizenship-multiselect-success')
  })

  it('should allow removing selected items', () => {
    cy.visit('/services/calculate-mortgage/2')
    cy.wait(2000)

    // Fill required fields
    cy.get('input[name="firstName"]').type('Test')
    cy.get('input[name="lastName"]').type('User')
    cy.get('input[name="birthday"]').type('01/01/1990')

    // Enable additional citizenship
    cy.contains('האם יש לך אזרחות נוספת?').parent().within(() => {
      cy.contains('כן').click()
    })

    // Select some citizenships
    cy.contains('בחר אזרחות').parent().click()
    cy.contains('ישראל').click()
    cy.contains('ארצות הברית').click()
    cy.contains('החל').click()

    // Remove one item
    cy.get('.multiselect-input__item').contains('ישראל').parent().find('svg').click()
    
    // Verify item was removed
    cy.get('.multiselect-input__item').contains('ישראל').should('not.exist')
    cy.get('.multiselect-input__item').contains('ארצות הברית').should('exist')
  })

  it('should support search functionality', () => {
    cy.visit('/services/calculate-mortgage/2')
    cy.wait(2000)

    // Fill required fields
    cy.get('input[name="firstName"]').type('Test')
    cy.get('input[name="lastName"]').type('User')
    cy.get('input[name="birthday"]').type('01/01/1990')

    // Enable additional citizenship
    cy.contains('האם יש לך אזרחות נוספת?').parent().within(() => {
      cy.contains('כן').click()
    })

    // Open dropdown
    cy.contains('בחר אזרחות').parent().click()
    
    // Type in search
    cy.get('input[placeholder="חפש מדינה..."]').type('רוס')
    
    // Verify filtered results
    cy.contains('רוסיה').should('be.visible')
    cy.contains('קנדה').should('not.exist')
    
    // Select filtered result
    cy.contains('רוסיה').click()
    cy.contains('החל').click()
    
    // Verify selection
    cy.get('.multiselect-input__item').contains('רוסיה').should('exist')
  })
})