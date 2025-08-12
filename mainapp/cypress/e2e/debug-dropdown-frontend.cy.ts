describe('Debug Frontend Dropdown Issues', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('.container', { timeout: 10000 }).should('be.visible')
  })

  it('should test mortgage step 3 dropdowns with detailed logging', () => {
    // Navigate to mortgage calculator
    cy.contains('חישוב משכנתא', { timeout: 10000 }).click()
    
    // Go through steps to reach step 3
    cy.get('input[placeholder*="ערך"]').type('1000000')
    cy.get('input[placeholder*="הון"]').type('250000')
    cy.contains('המשך').click()
    
    // Fill step 2
    cy.get('input[placeholder*="שם פרטי"]', { timeout: 10000 }).type('John')
    cy.get('input[placeholder*="שם משפחה"]').type('Doe')
    cy.get('input[type="email"]').type('john@example.com')
    
    // Click date field and select a date
    cy.get('input[placeholder*="תאריך"]').click()
    cy.get('[data-testid="calendar"]').should('be.visible')
    cy.get('.calendar-day').contains('15').click()
    
    cy.contains('המשך').click()
    
    // Now we're on step 3 - check the dropdowns
    cy.url().should('include', '/3')
    
    // Debug: Log current page HTML
    cy.get('body').then(($body) => {
      cy.log('=== CURRENT PAGE HTML ===')
      cy.log($body.html())
    })
    
    // Look for Field of Activity dropdown
    cy.get('body').then(($body) => {
      const fieldActivityElements = $body.find('*:contains("תחום פעילות")')
      cy.log(`Found ${fieldActivityElements.length} elements containing "תחום פעילות"`)
      
      fieldActivityElements.each((index, element) => {
        cy.log(`Element ${index}: ${element.tagName} - ${element.textContent}`)
      })
    })
    
    // Check what placeholder text is actually showing
    cy.get('[data-testid="dropdown-field-activity"], [placeholder*="תחום"], [placeholder*="פעילות"], [placeholder*="Select field"]').then(($elements) => {
      if ($elements.length > 0) {
        $elements.each((index, element) => {
          cy.log(`Dropdown ${index}: placeholder="${element.placeholder || 'none'}", text="${element.textContent || 'none'}"`)
        })
      } else {
        cy.log('❌ No field of activity dropdown found!')
      }
    })
    
    // Check for Obligations dropdown
    cy.get('[data-testid="dropdown-obligations"], [placeholder*="התחייבות"], [placeholder*="obligation"]').then(($elements) => {
      if ($elements.length > 0) {
        $elements.each((index, element) => {
          cy.log(`Obligations ${index}: placeholder="${element.placeholder || 'none'}", text="${element.textContent || 'none'}"`)
        })
      } else {
        cy.log('❌ No obligations dropdown found!')
      }
    })
    
    // Check browser console for errors
    cy.window().then((win) => {
      const logs = []
      const originalLog = win.console.log
      win.console.log = function(...args) {
        logs.push(args.join(' '))
        originalLog.apply(win.console, args)
      }
      
      // Wait a moment for any async operations
      cy.wait(2000)
      cy.log('=== CONSOLE LOGS ===')
      logs.forEach(log => cy.log(log))
    })
    
    // Check network requests to dropdown API
    cy.intercept('GET', '/api/dropdowns/**').as('dropdownRequests')
    
    // Reload to trigger fresh API calls
    cy.reload()
    
    cy.wait('@dropdownRequests', { timeout: 10000 }).then((interception) => {
      cy.log(`API Request: ${interception.request.url}`)
      cy.log(`API Response Status: ${interception.response.statusCode}`)
      cy.log(`API Response Body:`, interception.response.body)
    })
  })
  
  it('should test other-borrowers step 2 dropdowns', () => {
    // Navigate to other borrowers (would need to go through mortgage flow first)
    cy.visit('/services/other-borrowers/2/?pageId=2')
    
    // Check current URL and page content
    cy.url().then(url => cy.log(`Current URL: ${url}`))
    
    // Look for dropdowns on this page
    cy.get('body').then(($body) => {
      const dropdowns = $body.find('select, [role="combobox"], [data-testid*="dropdown"]')
      cy.log(`Found ${dropdowns.length} potential dropdown elements`)
      
      dropdowns.each((index, element) => {
        cy.log(`Dropdown ${index}: ${element.tagName}, placeholder="${element.placeholder || 'none'}"`)
      })
    })
    
    // Check for specific field names
    cy.get('body').contains('Field of Activity', { timeout: 5000 }).should('exist').then(() => {
      cy.log('✅ Found Field of Activity text')
    }).catch(() => {
      cy.log('❌ Field of Activity text not found')
    })
    
    cy.get('body').contains('תחום פעילות', { timeout: 5000 }).should('exist').then(() => {
      cy.log('✅ Found Hebrew Field of Activity')
    }).catch(() => {
      cy.log('❌ Hebrew Field of Activity not found')
    })
  })
})