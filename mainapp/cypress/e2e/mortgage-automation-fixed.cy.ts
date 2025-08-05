describe('Mortgage Calculator - Fixed Automation', () => {
  it('completes all 4 steps of mortgage application automatically', () => {
    // Start at Step 1 with correct URL format
    cy.visit('/services/calculate-mortgage/1')
    
    // ========== STEP 1: Property Details ==========
    cy.log('🏠 Step 1: Property Details')
    
    // Wait for page load
    cy.contains('button', /הבא/i).should('be.visible')
    
    // Property value - using the input with shekel symbol
    cy.get('input[type="text"]').first().clear().type('2000000')
    
    // City dropdown - "עיר בא נמצא הנכס"
    cy.contains('Select city').parent().click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // When do you need money dropdown - "מתי תזדקק למשכנתא?"
    cy.contains('בחר מסגרת זמן').parent().click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Initial payment slider - set to 25% (minimum for no property)
    cy.get('input[type="range"]').first().then($slider => {
      cy.wrap($slider).invoke('val', 500000).trigger('input').trigger('change')
    })
    
    // Property type dropdown - "האם מדובר בדירה ראשונה?"
    cy.contains('בחר סטטוס נכס').parent().click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Property ownership dropdown - "סטטוס בעלות על נכס"
    cy.contains('בחר את סטטוס הנכס').parent().click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Period slider - set to 20 years
    cy.get('input[type="range"]').eq(1).invoke('val', 20).trigger('input').trigger('change')
    
    // Monthly payment slider
    cy.get('input[type="range"]').eq(2).invoke('val', 7000).trigger('input').trigger('change')
    
    // Click Next to go to Step 2
    cy.contains('button', /הבא/i).click()
    
    // ========== STEP 2: Personal Details ==========
    cy.log('👤 Step 2: Personal Details')
    
    // Wait for step 2 to load
    cy.url().should('include', '/services/calculate-mortgage/2')
    cy.wait(2000)
    
    // Name
    cy.get('input[name="nameSurname"]').type('Test Automation User')
    
    // Birthday
    cy.get('input[name="birthday"]').type('15/05/1985')
    
    // Education dropdown
    cy.get('.dropdown-menu').first().click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Additional citizenships - No
    cy.get('.dropdown-menu').eq(1).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').contains(/לא/i).click()
    
    // Pay taxes - No
    cy.get('.dropdown-menu').eq(2).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').contains(/לא/i).click()
    
    // Children - Yes
    cy.get('.dropdown-menu').eq(3).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').contains(/כן/i).click()
    
    // Number of children
    cy.get('input[name="howMuchChildrens"]').clear().type('2')
    
    // Medical insurance - Yes
    cy.get('.dropdown-menu').eq(4).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').contains(/כן/i).click()
    
    // Foreigner - No
    cy.get('.dropdown-menu').eq(5).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').contains(/לא/i).click()
    
    // Public person - No
    cy.get('.dropdown-menu').eq(6).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').contains(/לא/i).click()
    
    // Number of borrowers
    cy.get('input[name="borrowers"]').clear().type('1')
    
    // Family status - Single
    cy.get('.dropdown-menu').eq(7).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Click Next to go to Step 3
    cy.contains('button', /הבא/i).click()
    
    // ========== STEP 3: Income & Employment ==========
    cy.log('💰 Step 3: Income & Employment')
    
    // Wait for step 3 to load
    cy.url().should('include', '/services/calculate-mortgage/3')
    cy.wait(2000)
    
    // Main source of income - Employed
    cy.get('.dropdown-menu').first().click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Monthly income
    cy.get('input[name="monthlyIncome"]').type('20000')
    
    // Start date
    cy.get('input[name="startDate"]').type('01/01/2018')
    
    // Field of activity
    cy.get('.dropdown-menu').eq(1).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Profession
    cy.get('input[name="profession"]').type('Software Engineer')
    
    // Company name
    cy.get('input[name="companyName"]').type('Tech Solutions Ltd')
    
    // Additional income - No
    cy.get('.dropdown-menu').eq(2).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').contains(/לא/i).click()
    
    // Obligations - No
    cy.get('.dropdown-menu').eq(3).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').contains(/לא/i).click()
    
    // Click Next to go to Step 4
    cy.contains('button', /הבא/i).click()
    
    // ========== STEP 4: Bank Offers & Submit ==========
    cy.log('🏦 Step 4: Bank Offers & Submit')
    
    // Wait for step 4 to load
    cy.url().should('include', '/services/calculate-mortgage/4')
    cy.wait(3000)
    
    // Wait for any bank offers to load
    cy.wait(3000)
    
    // Click Submit/Continue - the final button
    cy.contains('button', /הבא|המשך/i).click()
    
    // ========== VERIFY SUCCESS ==========
    cy.log('✅ Verifying Success')
    
    // Should redirect to application submitted page
    cy.url().should('include', '/services/application-submitted')
    
    // Look for success indicators
    cy.get('body').should('contain.text', /הצלחה|נשלח|תודה/i)
    
    cy.log('🎉 Mortgage automation completed successfully!')
  })
})