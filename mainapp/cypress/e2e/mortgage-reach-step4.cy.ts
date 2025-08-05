describe('Mortgage Calculator - Reach Step 4', () => {
  const testPhone = '0544123456'
  const testOTP = '123456'

  beforeEach(() => {
    cy.clearAllSessionStorage()
    cy.clearAllLocalStorage()
    cy.clearAllCookies()
  })

  it('should successfully navigate through all steps to reach Step 4', () => {
    // ========== STEP 1: Property Details ==========
    cy.visit('/services/calculate-mortgage/1')
    cy.wait(2000)
    
    cy.log('📍 Step 1: Filling property details')
    
    // Property value
    cy.get('.formatted-input input, input[type="text"]').first().clear().type('2500000')
    
    // Fill all dropdowns with first option
    cy.get('.dropdown-menu').each(($dropdown, index) => {
      cy.wrap($dropdown).click()
      cy.wait(300)
      cy.get('.dropdown-menu__list-item').first().click()
      cy.wait(300)
    })
    
    // Set sliders to reasonable values
    cy.get('input[type="range"]').then($sliders => {
      if ($sliders.length >= 3) {
        // Initial payment (25% minimum)
        cy.wrap($sliders[0]).invoke('val', 625000).trigger('input').trigger('change')
        // Period (20 years)
        cy.wrap($sliders[1]).invoke('val', 20).trigger('input').trigger('change')
        // Monthly payment
        cy.wrap($sliders[2]).invoke('val', 10000).trigger('input').trigger('change')
      }
    })
    
    // Click Next
    cy.get('button').contains(/Next|הבא|Далее/i).click()
    
    // ========== HANDLE AUTHENTICATION ==========
    cy.wait(2000)
    cy.get('body').then($body => {
      if ($body.find('input[type="tel"]').is(':visible')) {
        cy.log('🔐 Handling authentication')
        
        // Phone
        cy.get('input[type="tel"]').type(testPhone)
        
        // Send code
        cy.contains('button', /Send|שלח|קבל/i).click()
        cy.wait(1500)
        
        // OTP
        cy.get('input').filter((i, el) => {
          return el.value === '' && el.type !== 'tel'
        }).first().type(testOTP)
        
        // Verify
        cy.contains('button', /Verify|אמת|אישור/i).click()
        cy.wait(2000)
      }
    })
    
    // ========== STEP 2: Personal Details ==========
    cy.url().should('include', '/2')
    cy.log('📍 Step 2: Filling personal details')
    
    // Name
    cy.get('input[name="nameSurname"]').type('Automated Test User')
    
    // Birthday
    cy.get('input[name="birthday"]').type('01/01/1990')
    
    // All dropdowns - select appropriate options
    cy.get('.dropdown-menu').then($dropdowns => {
      // Education
      if ($dropdowns.length > 0) cy.wrap($dropdowns[0]).click().wait(300)
      cy.get('.dropdown-menu__list-item').first().click()
      
      // Citizenship - No
      if ($dropdowns.length > 1) cy.wrap($dropdowns[1]).click().wait(300)
      cy.get('.dropdown-menu__list-item').filter(':contains("No"), :contains("לא")').first().click()
      
      // Tax - No
      if ($dropdowns.length > 2) cy.wrap($dropdowns[2]).click().wait(300)
      cy.get('.dropdown-menu__list-item').filter(':contains("No"), :contains("לא")').first().click()
      
      // Children - No
      if ($dropdowns.length > 3) cy.wrap($dropdowns[3]).click().wait(300)
      cy.get('.dropdown-menu__list-item').filter(':contains("No"), :contains("לא")').first().click()
      
      // Medical insurance - Yes
      if ($dropdowns.length > 4) cy.wrap($dropdowns[4]).click().wait(300)
      cy.get('.dropdown-menu__list-item').filter(':contains("Yes"), :contains("כן")').first().click()
      
      // Foreigner - No
      if ($dropdowns.length > 5) cy.wrap($dropdowns[5]).click().wait(300)
      cy.get('.dropdown-menu__list-item').filter(':contains("No"), :contains("לא")').first().click()
      
      // Public figure - No
      if ($dropdowns.length > 6) cy.wrap($dropdowns[6]).click().wait(300)
      cy.get('.dropdown-menu__list-item').filter(':contains("No"), :contains("לא")').first().click()
      
      // Family status
      if ($dropdowns.length > 7) cy.wrap($dropdowns[7]).click().wait(300)
      cy.get('.dropdown-menu__list-item').first().click()
    })
    
    // Number of borrowers
    cy.get('input[name="borrowers"]').clear().type('1')
    
    // Click Next
    cy.get('button').contains(/Next|הבא|Далее/i).click()
    
    // ========== STEP 3: Income & Employment ==========
    cy.url().should('include', '/3')
    cy.log('📍 Step 3: Filling income details')
    cy.wait(1000)
    
    // Main source - Employed (first option)
    cy.get('.dropdown-menu').first().click()
    cy.wait(500)
    cy.get('.dropdown-menu__list-item').first().click()
    cy.wait(1000) // Wait for dynamic fields
    
    // Fill employment details
    cy.get('input').then($inputs => {
      // Monthly income
      const incomeInput = Array.from($inputs).find(el => 
        el.name === 'monthlyIncome' || el.placeholder?.includes('income') || el.type === 'number'
      )
      if (incomeInput) cy.wrap(incomeInput).type('25000')
      
      // Start date
      const dateInput = Array.from($inputs).find(el => 
        el.name === 'startDate' || el.type === 'date'
      )
      if (dateInput) cy.wrap(dateInput).type('2020-01-01')
      
      // Profession
      const profInput = Array.from($inputs).find(el => 
        el.name === 'profession' || el.placeholder?.includes('profession')
      )
      if (profInput) cy.wrap(profInput).type('Software Developer')
      
      // Company
      const companyInput = Array.from($inputs).find(el => 
        el.name === 'companyName' || el.placeholder?.includes('company')
      )
      if (companyInput) cy.wrap(companyInput).type('Tech Corp Ltd')
    })
    
    // Field of activity
    cy.get('.dropdown-menu').eq(1).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Additional income - No (first option)
    cy.get('.dropdown-menu').eq(2).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Obligations - No (first option)
    cy.get('.dropdown-menu').eq(3).click()
    cy.wait(300)
    cy.get('.dropdown-menu__list-item').first().click()
    
    // Click Next to Step 4
    cy.get('button').contains(/Next|הבא|Далее/i).click()
    cy.wait(3000) // Wait for API call
    
    // ========== VERIFY STEP 4 ==========
    cy.url().should('include', '/4')
    cy.log('✅ SUCCESS! Reached Step 4 - Bank Offers')
    
    // Take screenshot as proof
    cy.screenshot('step4-success')
    
    // Check for bank content
    cy.get('body').then($body => {
      const hasContent = $body.text().includes('bank') || 
                        $body.text().includes('בנק') ||
                        $body.find('[class*="bank"]').length > 0 ||
                        $body.find('[class*="card"]').length > 0
      
      if (hasContent) {
        cy.log('✅ Bank content visible on Step 4')
      } else {
        cy.log('⚠️ Step 4 reached but no bank content visible yet')
      }
    })
  })
})