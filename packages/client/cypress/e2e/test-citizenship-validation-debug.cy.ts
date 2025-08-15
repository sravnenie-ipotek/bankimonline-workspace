describe('Citizenship Validation Debug Test', () => {
  it('should debug citizenship validation behavior', () => {
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
    
    // Click "Yes" on additional citizenships question
    cy.contains('כן').click()
    
    // Wait for dropdown to appear
    cy.wait(1000)
    
    // Open citizenship dropdown
    cy.get('input[placeholder="בחר אזרחות"]').click()
    
    // Wait for options to load
    cy.wait(500)
    
    // Log all console messages to see our debug output
    cy.window().then((win) => {
      // Override console.log to capture all logs
      const originalLog = win.console.log
      const logs: string[] = []
      
      win.console.log = (...args: any[]) => {
        logs.push(args.join(' '))
        originalLog.apply(win.console, args)
      }
      
      // Try to select Israel
      cy.contains('ישראל').click()
      
      // Wait for state to update
      cy.wait(500)
      
      // Try to select USA
      cy.contains('ארצות הברית').click()
      
      // Wait for state to update
      cy.wait(500)
      
      // Click apply button
      cy.contains('החל').click()
      
      // Wait for validation
      cy.wait(1000)
      
      // Print all captured logs
      cy.then(() => {
        logs.forEach(log => )
        })
      
      // Check if validation error appears
      cy.get('span').then(($spans) => {
        const errorSpan = Array.from($spans).find(span => 
          span.textContent?.includes('אנא בחר לפחות מדינת אזרחות אחת')
        )
        
        if (errorSpan) {
          // Get Formik state
          cy.window().then((win) => {
            // Access React component to check Formik state
            const formikElement = win.document.querySelector('form')
            if (formikElement) {
              // Log the form data
              const formData = new FormData(formikElement as HTMLFormElement)
              ))
            }
          })
        } else {
          }
      })
      
      // Check what values are showing as selected
      cy.get('.multiselect_tag').then(($tags) => {
        .map(tag => tag.textContent))
      })
    })
  })
})