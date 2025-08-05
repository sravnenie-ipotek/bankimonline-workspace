describe('Mortgage Calculator - Hebrew Automation', () => {
  it('completes all 4 steps of mortgage application automatically', () => {
    // Start at Step 1
    cy.visit('/services/calculate-mortgage/1')
    
    // ========== STEP 1: Property Details ==========
    cy.log('🏠 Step 1: Property Details')
    
    // Wait for page load and verify we have the form
    cy.wait(2000)
    cy.get('input[type="text"]').should('be.visible')
    
    // Property value - the first text input with the shekel symbol
    cy.get('input[type="text"]').first().clear().type('2000000')
    
    // Click dropdowns in order and select first option for each
    // City dropdown
    cy.get('.dropdown-menu').eq(0).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').first().within(() => {
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    // When needed dropdown
    cy.get('.dropdown-menu').eq(1).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').eq(1).within(() => {
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    // Property type dropdown
    cy.get('.dropdown-menu').eq(2).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').eq(2).within(() => {
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    // Property ownership dropdown
    cy.get('.dropdown-menu').eq(3).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').eq(3).within(() => {
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    // Sliders - Initial payment, Period, Monthly payment
    cy.get('input[type="range"]').eq(0).invoke('val', 500000).trigger('input').trigger('change')
    cy.get('input[type="range"]').eq(1).invoke('val', 20).trigger('input').trigger('change')
    cy.get('input[type="range"]').eq(2).invoke('val', 7000).trigger('input').trigger('change')
    
    // Click Next button (הבא)
    cy.get('button').contains('הבא').click()
    
    // ========== STEP 2: Personal Details ==========
    cy.log('👤 Step 2: Personal Details')
    
    // Wait for step 2 to load
    cy.url().should('include', '/services/calculate-mortgage/2')
    cy.wait(2000)
    
    // Name
    cy.get('input[name="nameSurname"]').type('Test Automation User')
    
    // Birthday
    cy.get('input[name="birthday"]').type('15/05/1985')
    
    // Fill all dropdowns - selecting appropriate options
    // Education
    cy.get('.dropdown-menu').eq(0).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Additional citizenships - No (לא)
    cy.get('.dropdown-menu').eq(1).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').contains('לא').click()
    
    // Pay taxes - No (לא)
    cy.get('.dropdown-menu').eq(2).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').contains('לא').click()
    
    // Children - Yes (כן)
    cy.get('.dropdown-menu').eq(3).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').contains('כן').click()
    
    // Number of children (appears after selecting Yes)
    cy.wait(500)
    cy.get('input[name="howMuchChildrens"]').clear().type('2')
    
    // Medical insurance - Yes (כן)
    cy.get('.dropdown-menu').eq(4).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').contains('כן').click()
    
    // Foreigner - No (לא)
    cy.get('.dropdown-menu').eq(5).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').contains('לא').click()
    
    // Public person - No (לא)
    cy.get('.dropdown-menu').eq(6).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').contains('לא').click()
    
    // Number of borrowers
    cy.get('input[name="borrowers"]').clear().type('1')
    
    // Family status
    cy.get('.dropdown-menu').eq(7).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Click Next
    cy.get('button').contains('הבא').click()
    
    // ========== STEP 3: Income & Employment ==========
    cy.log('💰 Step 3: Income & Employment')
    
    // Wait for step 3 to load
    cy.url().should('include', '/services/calculate-mortgage/3')
    cy.wait(2000)
    
    // Income source
    cy.get('.dropdown-menu').first().click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Monthly income
    cy.get('input[name="monthlyIncome"]').type('20000')
    
    // Start date
    cy.get('input[name="startDate"]').type('01/01/2018')
    
    // Field of activity
    cy.get('.dropdown-menu').eq(1).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Profession
    cy.get('input[name="profession"]').type('Software Engineer')
    
    // Company name
    cy.get('input[name="companyName"]').type('Tech Solutions Ltd')
    
    // Additional income - No
    cy.get('.dropdown-menu').eq(2).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').contains('לא').click()
    
    // Obligations - No
    cy.get('.dropdown-menu').eq(3).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').contains('לא').click()
    
    // Click Next
    cy.get('button').contains('הבא').click()
    
    // ========== STEP 4: Bank Offers & Submit ==========
    cy.log('🏦 Step 4: Bank Offers & Submit')
    
    // Wait for step 4 to load with bank offers
    cy.url().should('include', '/services/calculate-mortgage/4')
    cy.wait(5000) // Give time for bank offers to load
    
    // Click the continue/submit button
    cy.get('button').last().click()
    
    // ========== VERIFY SUCCESS ==========
    cy.log('✅ Verifying Success')
    
    // Should redirect to application submitted page
    cy.wait(3000)
    cy.url().should('include', '/services/application-submitted')
    
    cy.log('🎉 Mortgage automation completed successfully!')
  })
})