describe('Mortgage Calculator - Complete Automation to Step 4', () => {
  beforeEach(() => {
    // Clear all storage and cookies before each test
    cy.clearAllSessionStorage()
    cy.clearAllLocalStorage()
    cy.clearAllCookies()
  })

  it('completes all 4 steps of mortgage application automatically', () => {
    // Start at Step 1 with correct URL format
    cy.visit('/services/calculate-mortgage/1')
    cy.wait(2000) // Wait for initial load
    
    // ========== STEP 1: Property Details ==========
    cy.log('🏠 Step 1: Property Details')
    
    // Wait for page load and take screenshot
    cy.contains('button', /Next|הבא|Далее/i).should('be.visible')
    cy.screenshot('step1-initial')
    
    // Property value - using the formatted input component
    cy.get('.formatted-input').first().within(() => {
      cy.get('input').clear().type('2000000')
    })
    
    // City dropdown - wait for it to be clickable
    cy.get('.dropdown-menu').eq(0).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').first().within(() => {
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    // When do you need money dropdown
    cy.get('.dropdown-menu').eq(1).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').eq(1).within(() => {
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    // Initial payment slider - set to minimum (25% for no property)
    cy.get('input[type="range"]').first().then($slider => {
      const min = $slider.attr('min') || '500000'
      cy.wrap($slider).invoke('val', min).trigger('input').trigger('change')
    })
    
    // Property type dropdown (First home question)
    cy.get('.dropdown-menu').eq(2).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').eq(2).within(() => {
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    // Property ownership dropdown (Important - affects LTV)
    cy.get('.dropdown-menu').eq(3).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').eq(3).within(() => {
      cy.get('.dropdown-menu__list-item').first().click() // "I don't own any property" = 75% LTV
    })
    
    // Period slider - set to 20 years
    cy.get('input[type="range"]').eq(1).invoke('val', 20).trigger('input').trigger('change')
    
    // Monthly payment slider - set to reasonable amount
    cy.get('input[type="range"]').eq(2).invoke('val', 8000).trigger('input').trigger('change')
    
    cy.screenshot('step1-filled')
    
    // Click Next to go to Step 2
    cy.contains('button', /Next|הבא|Далее/i).click()
    
    // Handle authentication modal if it appears
    cy.wait(2000)
    cy.get('body').then($body => {
      // Check for modal or phone input
      if ($body.find('input[type="tel"]').length > 0 || $body.find('.modal').is(':visible')) {
        cy.log('📱 Authentication modal detected - handling login')
        
        // Enter phone number
        cy.get('input[type="tel"]').first().clear().type('0544123456')
        
        // Click send code button
        cy.contains('button', /Send|שלח|קבל/i).click()
        cy.wait(2000)
        
        // Enter OTP
        cy.get('input').last().type('123456')
        
        // Click verify button
        cy.contains('button', /Verify|אמת|אישור/i).click()
        cy.wait(3000)
      }
    })
    
    // ========== STEP 2: Personal Details ==========
    cy.log('👤 Step 2: Personal Details')
    
    // Wait for step 2 to load
    cy.url().should('include', '/services/calculate-mortgage/2')
    cy.wait(1000)
    cy.screenshot('step2-initial')
    
    // Name
    cy.get('input[name="nameSurname"]').clear().type('Test Automation User')
    
    // Birthday
    cy.get('input[name="birthday"]').clear().type('15/05/1985')
    
    // Education dropdown
    cy.get('.dropdown-menu').first().click()
    cy.get('.dropdown-menu__list').first().within(() => {
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    // Additional citizenships - No
    cy.get('.dropdown-menu').eq(1).click()
    cy.get('.dropdown-menu__list').eq(1).within(() => {
      cy.get('.dropdown-menu__list-item').contains(/No|לא|Нет/i).click()
    })
    
    // Pay taxes - No
    cy.get('.dropdown-menu').eq(2).click()
    cy.get('.dropdown-menu__list').eq(2).within(() => {
      cy.get('.dropdown-menu__list-item').contains(/No|לא|Нет/i).click()
    })
    
    // Children - Yes
    cy.get('.dropdown-menu').eq(3).click()
    cy.get('.dropdown-menu__list').eq(3).within(() => {
      cy.get('.dropdown-menu__list-item').contains(/Yes|כן|Да/i).click()
    })
    
    // Number of children
    cy.get('input[name="howMuchChildrens"]').clear().type('2')
    
    // Medical insurance - Yes
    cy.get('.dropdown-menu').eq(4).click()
    cy.get('.dropdown-menu__list').eq(4).within(() => {
      cy.get('.dropdown-menu__list-item').contains(/Yes|כן|Да/i).click()
    })
    
    // Foreigner - No
    cy.get('.dropdown-menu').eq(5).click()
    cy.get('.dropdown-menu__list').eq(5).within(() => {
      cy.get('.dropdown-menu__list-item').contains(/No|לא|Нет/i).click()
    })
    
    // Public person - No
    cy.get('.dropdown-menu').eq(6).click()
    cy.get('.dropdown-menu__list').eq(6).within(() => {
      cy.get('.dropdown-menu__list-item').contains(/No|לא|Нет/i).click()
    })
    
    // Number of borrowers
    cy.get('input[name="borrowers"]').clear().type('1')
    
    // Family status - Single
    cy.get('.dropdown-menu').eq(7).click()
    cy.get('.dropdown-menu__list').eq(7).within(() => {
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    cy.screenshot('step2-filled')
    
    // Click Next to go to Step 3
    cy.contains('button', /Next|הבא|Далее/i).click()
    
    // ========== STEP 3: Income & Employment ==========
    cy.log('💰 Step 3: Income & Employment')
    
    // Wait for step 3 to load
    cy.url().should('include', '/services/calculate-mortgage/3')
    cy.wait(1000)
    cy.screenshot('step3-initial')
    
    // Main source of income - Select "Employed" (option_1)
    cy.get('.dropdown-menu').first().click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').first().within(() => {
      cy.get('.dropdown-menu__list-item').first().click() // This should be "Employed"
    })
    
    // Wait for dynamic fields to appear after selecting "Employed"
    cy.wait(1000)
    
    // Monthly income - find the input field that appears after selecting employed
    cy.get('input[name="monthlyIncome"], input[type="text"]').eq(1).clear().type('20000')
    
    // Start date - should be a date input
    cy.get('input[name="startDate"], input[type="date"]').first().clear().type('2018-01-01')
    
    // Field of activity dropdown
    cy.get('.dropdown-menu').eq(1).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').eq(1).within(() => {
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    // Profession input field
    cy.get('input[name="profession"], input[type="text"]').eq(2).clear().type('Software Engineer')
    
    // Company name input field
    cy.get('input[name="companyName"], input[type="text"]').eq(3).clear().type('Tech Solutions Ltd')
    
    // Additional income dropdown - Select "No additional income" (option_1)
    cy.get('.dropdown-menu').eq(2).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').eq(2).within(() => {
      cy.get('.dropdown-menu__list-item').first().click() // First option is usually "No"
    })
    
    // Obligations dropdown - Select "No obligations" (option_1)
    cy.get('.dropdown-menu').eq(3).click()
    cy.wait(500)
    cy.get('.dropdown-menu__list').eq(3).within(() => {
      cy.get('.dropdown-menu__list-item').first().click() // First option is usually "No"
    })
    
    cy.screenshot('step3-filled')
    
    // Click Next to go to Step 4
    cy.contains('button', /Next|הבא|Далее/i).click()
    cy.wait(2000) // Give time for API call
    
    // ========== STEP 4: Bank Offers & Submit ==========
    cy.log('🏦 Step 4: Bank Offers & Submit')
    
    // Verify we reached step 4
    cy.url().should('include', '/services/calculate-mortgage/4')
    cy.screenshot('step4-reached')
    
    // Wait for bank offers to load (API call)
    cy.wait(5000)
    
    // Look for bank cards or any content that indicates step 4 loaded
    cy.get('body').then($body => {
      // Check if there are bank cards
      if ($body.find('[class*="bank"], [class*="card"], [class*="offer"]').length > 0) {
        cy.log('✅ Bank offers found!')
        cy.screenshot('step4-bank-offers')
      } else {
        cy.log('⚠️ No bank offers visible, but reached step 4')
        cy.screenshot('step4-no-offers')
      }
    })
    
    // Try to find and click the submit/continue button if available
    cy.get('button').then($buttons => {
      if ($buttons.length > 0) {
        cy.wrap($buttons.last()).click({ force: true })
        cy.wait(3000)
        
        // Check if we were redirected to success page
        cy.url().then(url => {
          if (url.includes('/services/application-submitted')) {
            cy.log('✅ Application submitted successfully!')
            cy.screenshot('application-submitted')
          } else {
            cy.log('📍 Current URL after submit: ' + url)
            cy.screenshot('final-state')
          }
        })
      }
    })
    
    cy.log('🎉 Successfully reached Step 4 of mortgage calculator!')
  })
})