describe('Test Homepage Loads', () => {
  it('should load homepage without getting stuck on loading', () => {
    cy.visit('/')
    
    // Wait for the page to load
    cy.wait(5000)
    
    // Take screenshot to see current state
    cy.screenshot('homepage-test')
    
    // Check if we're still stuck on loading
    cy.get('body').then($body => {
      const text = $body.text()
      
      if (text.includes('Loading translations')) {
        cy.log('❌ Still stuck on loading translations')
        throw new Error('App is still stuck on loading translations')
      } else {
        cy.log('✅ App loaded successfully!')
        cy.log('Page content:', text.substring(0, 200) + '...')
        
        // Look for key UI elements that should be present
        if (text.includes('חישוב משכנתא') || text.includes('Calculate Mortgage')) {
          cy.log('✅ Mortgage calculator option found')
        }
        
        if (text.includes('השוואה רמיונים') || text.includes('Compare')) {
          cy.log('✅ Compare options found')  
        }
      }
    })
    
    // Try to navigate to mortgage calculator step 3 directly
    cy.visit('/services/calculate-mortgage/3')
    cy.wait(3000)
    cy.screenshot('step3-direct-test')
    
    // Check if step 3 loads properly
    cy.get('body').then($body => {
      const text = $body.text()
      cy.log('Step 3 content:', text.substring(0, 300))
      
      // Look for the dropdown elements we're trying to fix
      if (text.includes('תחום פעילות') || text.includes('Field of Activity')) {
        cy.log('✅ Field of Activity found on step 3')
      } else {
        cy.log('❌ Field of Activity NOT found on step 3')
      }
      
      if (text.includes('התחייבות') || text.includes('obligation')) {
        cy.log('✅ Obligations found on step 3')
      } else {
        cy.log('❌ Obligations NOT found on step 3')
      }
      
      // Check for the English fallback placeholders that were the original issue
      if (text.includes('Select field of activity')) {
        cy.log('🚨 FOUND ENGLISH FALLBACK: "Select field of activity"')
      } else {
        cy.log('✅ No English fallback for field of activity')
      }
      
      if (text.includes('Select obligation')) {
        cy.log('🚨 FOUND ENGLISH FALLBACK: "Select obligation"')
      } else {
        cy.log('✅ No English fallback for obligations')
      }
    })
  })
})