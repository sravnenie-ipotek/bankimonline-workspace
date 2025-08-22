/**
 * Quick Diagnostic - Capture Step 1 Issues Only
 * Focused test to identify the exact problem
 */

describe('QUICK DIAGNOSTIC: Step 1 Problem Identification', () => {
  it('Capture Step 1 form state and issues', () => {
    cy.viewport(1920, 1080)
    
    // Go directly to mortgage Step 1
    cy.visit('/services/calculate-mortgage/1')
    cy.wait(3000)
    
    // Snapshot 1: Initial state
    cy.percySnapshot('QUICK-01-Step1-Loaded')
    cy.screenshot('quick-01-loaded')
    
    // Log what we find
    cy.get('body').then($body => {
      // Count form elements
      const inputs = $body.find('input:visible').length
      const selects = $body.find('select:visible').length
      const dropdowns = $body.find('[data-testid*="dropdown"]:visible').length
      const buttons = $body.find('button:visible').length
      
      cy.log(`FORM ELEMENTS FOUND:`)
      cy.log(`- Inputs: ${inputs}`)
      cy.log(`- Selects: ${selects}`)
      cy.log(`- Dropdowns with data-testid: ${dropdowns}`)
      cy.log(`- Buttons: ${buttons}`)
      
      // Log all data-testids found
      $body.find('[data-testid]').each((i, el) => {
        cy.log(`data-testid found: ${el.getAttribute('data-testid')}`)
      })
    })
    
    // Try to fill property value
    cy.get('input:visible').first().then($input => {
      cy.wrap($input).clear().type('2000000')
      cy.log(`✅ Filled first input: ${$input.attr('name') || $input.attr('data-testid') || 'unknown'}`)
    })
    cy.percySnapshot('QUICK-02-After-Property-Value')
    
    // Try each dropdown approach
    cy.log('TESTING DROPDOWN SELECTION METHODS:')
    
    // Method 1: data-testid
    cy.get('[data-testid="property-ownership-dropdown"]').then($el => {
      if ($el.length > 0) {
        cy.log('✅ Found property-ownership via data-testid')
        cy.wrap($el).click({ force: true })
        cy.wait(500)
        cy.percySnapshot('QUICK-03-Property-Dropdown-Open')
        
        // Look for options
        cy.get('li, [role="option"], [data-testid*="item"]').then($options => {
          cy.log(`Found ${$options.length} options`)
          if ($options.length > 0) {
            cy.wrap($options.first()).click({ force: true })
            cy.log('✅ Selected first option')
          }
        })
      } else {
        cy.log('❌ No property-ownership dropdown with data-testid')
      }
    })
    
    // Method 2: Try all selects
    cy.get('select:visible').each(($select, index) => {
      cy.log(`Select ${index + 1}: ${$select.attr('name') || 'unnamed'}`)
      if ($select.children('option').length > 1) {
        cy.wrap($select).select(1)
        cy.log(`✅ Selected option in select ${index + 1}`)
      }
    })
    
    // Method 3: Class-based dropdowns
    cy.get('[class*="dropdown"]:visible').each(($dropdown, index) => {
      cy.log(`Dropdown ${index + 1} found with class: ${$dropdown.attr('class')}`)
    })
    
    cy.percySnapshot('QUICK-04-After-Dropdown-Attempts')
    
    // Check for Next button
    cy.get('button:visible').then($buttons => {
      cy.log(`BUTTONS FOUND: ${$buttons.length}`)
      $buttons.each((i, btn) => {
        const text = btn.textContent?.trim() || ''
        cy.log(`Button ${i + 1}: "${text}"`)
        
        if (text.includes('Next') || text.includes('הבא') || text.includes('Continue')) {
          cy.log(`✅ NEXT BUTTON FOUND: "${text}"`)
          cy.percySnapshot('QUICK-05-Next-Button-Found')
          
          // Click it
          cy.wrap(btn).click({ force: true })
          cy.wait(3000)
          cy.percySnapshot('QUICK-06-After-Next-Click')
          
          // Check result
          cy.url().then(url => {
            cy.log(`URL after click: ${url}`)
            if (url.includes('/2')) {
              cy.log('✅ SUCCESS: Reached Step 2')
              cy.percySnapshot('QUICK-07-Step2-Success')
            } else {
              cy.log('❌ FAILED: Still on Step 1')
              cy.percySnapshot('QUICK-07-Still-Step1')
              
              // Check for errors
              cy.get('[class*="error"], .error, [role="alert"]').then($errors => {
                if ($errors.length > 0) {
                  cy.log(`VALIDATION ERRORS FOUND: ${$errors.length}`)
                  $errors.each((i, err) => {
                    cy.log(`Error: "${err.textContent}"`)
                  })
                  cy.percySnapshot('QUICK-08-Validation-Errors')
                }
              })
              
              // Check for modal
              cy.get('[class*="modal"], [role="dialog"], input[type="tel"]').then($modal => {
                if ($modal.length > 0) {
                  cy.log('MODAL/AUTH DETECTED')
                  cy.percySnapshot('QUICK-08-Modal-Detected')
                }
              })
            }
          })
          
          return false // Stop after first Next button
        }
      })
    })
    
    // Final snapshot
    cy.percySnapshot('QUICK-09-Final-State')
    cy.screenshot('quick-final-state')
    
    // Log page HTML structure for debugging
    cy.get('form, [class*="form"]').first().then($form => {
      cy.log('FORM STRUCTURE:')
      cy.log(`Tag: ${$form.prop('tagName')}`)
      cy.log(`Classes: ${$form.attr('class')}`)
    })
  })
})