describe('Authentication and Navigation Flow Test', () => {
  it('should test full mortgage calculator flow with authentication', () => {
    // Start from homepage
    cy.visit('/')
    cy.screenshot('homepage')
    
    // Navigate to mortgage calculator
    cy.contains('חישוב משכנתא').should('be.visible')
    cy.contains('חישוב משכנתא').click()
    
    cy.screenshot('mortgage-step1')
    cy.url().should('include', '/services/calculate-mortgage/1')
    
    // Fill step 1
    cy.get('input[placeholder*="ערך"], input[placeholder*="value"]').first().type('1000000')
    cy.get('input[placeholder*="הון"], input[placeholder*="down"]').first().type('300000')
    
    // Continue to step 2
    cy.contains('המשך').click()
    cy.screenshot('mortgage-step2')
    
    // Fill step 2 - basic info only
    cy.get('input[placeholder*="שם"], input[placeholder*="name"]').first().type('John')
    cy.get('input[placeholder*="משפחה"], input[placeholder*="last"]').first().type('Doe')
    
    // Try to proceed to step 3
    cy.contains('המשך').click()
    cy.screenshot('after-step2-continue')
    
    // Check if we reached step 3
    cy.url().then(url => {
      cy.log(`URL after step 2: ${url}`)
      
      if (url.includes('/3')) {
        cy.log('✅ Successfully reached step 3')
        
        // Look for dropdown elements
        cy.get('body').then($body => {
          const bodyText = $body.text()
          cy.log('Step 3 page content:', bodyText.substring(0, 500))
          
          // Check for our dropdown components
          if (bodyText.includes('תחום פעילות')) {
            cy.log('✅ Found Field of Activity in Hebrew')
          } else if (bodyText.includes('Field of Activity')) {
            cy.log('⚠️ Found Field of Activity in English')
          } else {
            cy.log('❌ Field of Activity NOT found at all')
          }
          
          if (bodyText.includes('התחייבות')) {
            cy.log('✅ Found Obligations in Hebrew')
          } else if (bodyText.includes('obligation')) {
            cy.log('⚠️ Found obligations in English') 
          } else {
            cy.log('❌ Obligations NOT found at all')
          }
          
          // Check for English fallback text
          if (bodyText.includes('Select field of activity')) {
            cy.log('🚨 FOUND ENGLISH FALLBACK: "Select field of activity"')
          }
          
          if (bodyText.includes('Select obligation')) {
            cy.log('🚨 FOUND ENGLISH FALLBACK: "Select obligation"')
          }
        })
        
        // Take final screenshot
        cy.screenshot('step3-with-dropdowns')
        
        // Test dropdown APIs are being called
        cy.intercept('GET', '**/api/dropdowns/mortgage_step3/**').as('dropdownAPI')
        cy.reload()
        
        cy.wait('@dropdownAPI', { timeout: 10000 }).then((interception) => {
          cy.log(`Dropdown API called: ${interception.request.url}`)
          cy.log(`Response status: ${interception.response.statusCode}`)
          
          if (interception.response.body) {
            const body = interception.response.body
            cy.log(`Field of Activity placeholder: ${body.placeholders?.mortgage_step3_field_of_activity_ph || 'MISSING'}`)
            cy.log(`Obligations placeholder: ${body.placeholders?.mortgage_step3_obligations || 'MISSING'}`)
          }
        })
        
      } else {
        cy.log('❌ Failed to reach step 3, still on:', url)
      }
    })
  })
  
  it('should check other-borrowers navigation', () => {
    // Try going through full mortgage flow first
    cy.visit('/')
    cy.contains('חישוב משכנתא').click()
    
    // Quick fill steps 1 and 2
    cy.get('input').first().type('1000000')
    cy.get('input').eq(1).type('300000')
    cy.contains('המשך').click()
    
    cy.get('input').first().type('John')
    cy.get('input').eq(1).type('Doe')  
    cy.contains('המשך').click()
    
    // Now try to navigate to other borrowers
    cy.url().then(url => {
      if (url.includes('/3')) {
        // Look for "add borrower" button or similar
        cy.get('body').then($body => {
          const text = $body.text()
          
          if (text.includes('הוסף לווה') || text.includes('add borrower')) {
            cy.log('✅ Found add borrower option')
            
            // Try to click it
            cy.contains('הוסף לווה', { timeout: 5000 }).click()
            cy.screenshot('other-borrowers-attempt')
            
            cy.url().then(newUrl => {
              cy.log(`URL after add borrower: ${newUrl}`)
              
              if (newUrl.includes('other-borrowers')) {
                cy.log('✅ Successfully reached other-borrowers page')
                cy.screenshot('other-borrowers-success')
                
                // Check for dropdowns here
                cy.get('body').then($body2 => {
                  const obText = $body2.text()
                  cy.log('Other-borrowers content:', obText.substring(0, 300))
                })
              }
            })
          } else {
            cy.log('❌ No add borrower option found')
          }
        })
      }
    })
  })
})