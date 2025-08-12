describe('Direct Dropdown Test', () => {
  it('should check mortgage step 3 dropdowns directly', () => {
    // Go directly to step 3 with some mock data
    cy.visit('/services/calculate-mortgage/3')
    
    // Wait for page to load and log everything we see
    cy.wait(3000)
    
    // Take screenshot
    cy.screenshot('step3-direct-visit')
    
    // Log current URL
    cy.url().then(url => cy.log(`Current URL: ${url}`))
    
    // Log page content
    cy.get('body').then(($body) => {
      cy.log('=== PAGE CONTENT ===')
      cy.log($body.text())
    })
    
    // Look for any dropdown elements
    cy.get('body').find('*').then($elements => {
      $elements.each((index, element) => {
        const $el = Cypress.$(element)
        const text = $el.text().trim()
        
        // Log elements containing key terms
        if (text.includes('תחום פעילות') || text.includes('Field of Activity') || 
            text.includes('Select field') || text.includes('התחייבות') || 
            text.includes('obligation') || text.includes('Select obligation')) {
          cy.log(`DROPDOWN ELEMENT: ${element.tagName} - "${text}" - placeholder: "${element.placeholder || 'none'}"`)
        }
      })
    })
    
    // Check for FieldOfActivity component specifically
    cy.get('[data-testid*="field"], [data-testid*="activity"]').then($elements => {
      cy.log(`Found ${$elements.length} field/activity elements`)
      $elements.each((i, el) => {
        cy.log(`Element ${i}: ${el.tagName}, textContent: "${el.textContent}", placeholder: "${el.placeholder || 'none'}"`)
      })
    })
    
    // Check network requests
    cy.intercept('GET', '**/api/dropdowns/**').as('dropdownAPI')
    
    // Reload to trigger API calls
    cy.reload()
    cy.wait('@dropdownAPI', { timeout: 10000 }).then((interception) => {
      cy.log(`API URL: ${interception.request.url}`)
      cy.log(`API Status: ${interception.response.statusCode}`)
      
      if (interception.response.body) {
        const body = interception.response.body
        cy.log(`API Placeholders:`, JSON.stringify(body.placeholders || {}, null, 2))
        cy.log(`API Options Count:`, Object.keys(body.options || {}).map(key => `${key}: ${(body.options[key] || []).length}`))
      }
    })
    
    // Wait and take final screenshot
    cy.wait(2000)
    cy.screenshot('step3-after-reload')
  })
  
  it('should check other-borrowers step 2 directly', () => {
    cy.visit('/services/other-borrowers/2/?pageId=2')
    cy.wait(3000)
    
    cy.screenshot('other-borrowers-step2')
    
    // Check for dropdowns on this page
    cy.get('body').then($body => {
      const text = $body.text()
      cy.log('PAGE TEXT:', text.substring(0, 500) + '...')
      
      if (text.includes('תחום פעילות') || text.includes('Field of Activity')) {
        cy.log('✅ Found Field of Activity text')
      } else {
        cy.log('❌ Field of Activity text NOT found')
      }
      
      if (text.includes('התחייבות') || text.includes('obligation')) {
        cy.log('✅ Found obligations text')  
      } else {
        cy.log('❌ Obligations text NOT found')
      }
    })
    
    // Check for English fallback text specifically
    if (Cypress.$('body:contains("Select field of activity")').length > 0) {
      cy.log('🚨 FOUND ENGLISH FALLBACK: "Select field of activity"')
    }
    
    if (Cypress.$('body:contains("Select obligation")').length > 0) {
      cy.log('🚨 FOUND ENGLISH FALLBACK: "Select obligation"')
    }
  })
})