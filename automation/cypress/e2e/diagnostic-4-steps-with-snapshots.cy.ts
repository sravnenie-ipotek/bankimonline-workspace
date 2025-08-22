/**
 * Diagnostic 4-Step Test with Snapshots at Every Point
 * This test captures Percy snapshots and screenshots at each step to identify where timeout occurs
 */

describe('DIAGNOSTIC: 4-Step Flow with Detailed Snapshots', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
  })

  it('Mortgage Calculator - Capture Every Step Until Timeout', () => {
    cy.log('🔍 DIAGNOSTIC TEST - Capturing snapshots at every step')
    
    // SNAPSHOT 1: Homepage
    cy.visit('/')
    cy.wait(2000)
    cy.percySnapshot('DIAG-01-Homepage')
    cy.screenshot('diag-01-homepage')
    cy.log('✅ Snapshot 1: Homepage captured')
    
    // SNAPSHOT 2: After language switch attempt
    cy.switchToEnglish()
    cy.wait(1000)
    cy.percySnapshot('DIAG-02-After-Language-Switch')
    cy.screenshot('diag-02-after-language')
    cy.log('✅ Snapshot 2: After language switch')
    
    // SNAPSHOT 3: Navigate to mortgage
    cy.visit('/services/calculate-mortgage/1')
    cy.wait(2000)
    cy.percySnapshot('DIAG-03-Mortgage-Step1-Initial')
    cy.screenshot('diag-03-mortgage-initial')
    cy.log('✅ Snapshot 3: Mortgage Step 1 loaded')
    
    // SNAPSHOT 4: Before filling any fields
    cy.get('body').then($body => {
      const inputs = $body.find('input').length
      const dropdowns = $body.find('[data-testid*="dropdown"], select, [role="combobox"]').length
      cy.log(`Found ${inputs} inputs and ${dropdowns} dropdowns`)
    })
    cy.percySnapshot('DIAG-04-Before-Filling')
    cy.screenshot('diag-04-before-filling')
    
    // SNAPSHOT 5: Fill property value
    cy.get('[data-testid="property-price-input"], input[type="text"]').first().then($input => {
      cy.wrap($input).clear().type('2000000')
      cy.log('✅ Filled property value')
    })
    cy.wait(500)
    cy.percySnapshot('DIAG-05-After-Property-Value')
    cy.screenshot('diag-05-property-filled')
    
    // SNAPSHOT 6: Try city dropdown
    cy.get('body').then($body => {
      if ($body.find('[data-testid="city-dropdown"]').length > 0) {
        cy.get('[data-testid="city-dropdown"]').click({ force: true })
        cy.wait(500)
        cy.percySnapshot('DIAG-06-City-Dropdown-Open')
        cy.screenshot('diag-06-city-open')
        
        // Try to select option
        cy.get('[data-testid^="city-dropdown-item"], li, option').first().click({ force: true })
        cy.wait(500)
        cy.percySnapshot('DIAG-07-City-Selected')
        cy.screenshot('diag-07-city-selected')
        cy.log('✅ City selected')
      } else {
        cy.log('⚠️ City dropdown not found with data-testid')
        cy.percySnapshot('DIAG-06-No-City-Dropdown')
      }
    })
    
    // SNAPSHOT 8: Try when-needed dropdown
    cy.get('body').then($body => {
      if ($body.find('[data-testid="when-needed-dropdown"]').length > 0) {
        cy.get('[data-testid="when-needed-dropdown"]').click({ force: true })
        cy.wait(500)
        cy.percySnapshot('DIAG-08-When-Needed-Open')
        cy.screenshot('diag-08-when-needed-open')
        
        cy.get('li, option, [role="option"]').first().click({ force: true })
        cy.wait(500)
        cy.percySnapshot('DIAG-09-When-Needed-Selected')
        cy.log('✅ When needed selected')
      } else {
        cy.log('⚠️ When-needed dropdown not found')
        // Try alternate selector
        cy.get('select, [role="combobox"]').eq(1).then($el => {
          if ($el.length > 0) {
            cy.wrap($el).click({ force: true })
            cy.percySnapshot('DIAG-08-Alt-Dropdown')
          }
        })
      }
    })
    
    // SNAPSHOT 10: Property ownership dropdown
    cy.get('body').then($body => {
      if ($body.find('[data-testid="property-ownership-dropdown"]').length > 0) {
        cy.get('[data-testid="property-ownership-dropdown"]').click({ force: true })
        cy.wait(500)
        cy.percySnapshot('DIAG-10-Property-Ownership-Open')
        cy.screenshot('diag-10-property-ownership')
        
        cy.get('[data-testid^="property-ownership-dropdown-item"], li, option').first().click({ force: true })
        cy.wait(500)
        cy.percySnapshot('DIAG-11-Property-Ownership-Selected')
        cy.log('✅ Property ownership selected')
      } else {
        cy.log('⚠️ Property ownership dropdown not found')
        cy.percySnapshot('DIAG-10-No-Property-Ownership')
      }
    })
    
    // SNAPSHOT 12: Initial fee
    cy.get('[data-testid="initial-fee-input"], input[name*="initial"], input[name*="Initial"]').then($inputs => {
      if ($inputs.length > 0) {
        cy.wrap($inputs.first()).clear().type('600000')
        cy.wait(500)
        cy.percySnapshot('DIAG-12-Initial-Fee-Filled')
        cy.screenshot('diag-12-initial-fee')
        cy.log('✅ Initial fee filled')
      } else {
        cy.log('⚠️ Initial fee input not found')
        cy.percySnapshot('DIAG-12-No-Initial-Fee')
      }
    })
    
    // SNAPSHOT 13: All remaining dropdowns
    cy.get('select, [role="combobox"], [data-testid*="dropdown"]').each(($el, index) => {
      if (!$el.prop('disabled') && $el.is(':visible')) {
        cy.wrap($el).click({ force: true })
        cy.wait(300)
        cy.get('li, option, [role="option"]').first().click({ force: true })
        cy.log(`✅ Filled dropdown ${index + 1}`)
      }
    })
    cy.percySnapshot('DIAG-13-All-Dropdowns-Filled')
    cy.screenshot('diag-13-all-dropdowns')
    
    // SNAPSHOT 14: Before clicking Next
    cy.percySnapshot('DIAG-14-Before-Next-Button')
    cy.screenshot('diag-14-before-next')
    cy.log('📸 All Step 1 fields captured')
    
    // SNAPSHOT 15: Find and click Next button
    cy.get('button').then($buttons => {
      const nextButton = $buttons.filter((i, el) => {
        const text = el.textContent || ''
        return text.includes('Next') || text.includes('הבא') || 
               text.includes('Continue') || text.includes('המשך')
      })
      
      if (nextButton.length > 0) {
        cy.log(`✅ Found Next button: "${nextButton.first().text()}"`)
        cy.percySnapshot('DIAG-15-Next-Button-Found')
        cy.wrap(nextButton.first()).click({ force: true })
        cy.log('🔄 Clicked Next button')
      } else {
        cy.log('❌ No Next button found')
        cy.percySnapshot('DIAG-15-No-Next-Button')
        // Capture all buttons for debugging
        $buttons.each((i, btn) => {
          cy.log(`Button ${i}: "${btn.textContent}"`)
        })
      }
    })
    
    // SNAPSHOT 16: After clicking Next (wait for navigation/modal)
    cy.wait(3000)
    cy.percySnapshot('DIAG-16-After-Next-Click')
    cy.screenshot('diag-16-after-next')
    
    // SNAPSHOT 17: Check what happened
    cy.url().then(url => {
      cy.log(`Current URL: ${url}`)
      if (url.includes('/2')) {
        cy.log('✅ Reached Step 2!')
        cy.percySnapshot('DIAG-17-Step2-Success')
      } else if (url.includes('/1')) {
        cy.log('⚠️ Still on Step 1')
        cy.percySnapshot('DIAG-17-Still-Step1')
        
        // Check for auth modal
        cy.get('body').then($body => {
          if ($body.find('input[type="tel"]').length > 0) {
            cy.log('📱 Auth modal detected')
            cy.percySnapshot('DIAG-18-Auth-Modal')
            cy.screenshot('diag-18-auth-modal')
            
            // Try to fill auth
            cy.get('input[type="tel"]').type('972544123456')
            cy.percySnapshot('DIAG-19-Phone-Entered')
            
            cy.get('button').contains(/Send|שלח/i).click({ force: true })
            cy.wait(2000)
            cy.percySnapshot('DIAG-20-After-Send')
            
            // Enter OTP
            cy.get('input').last().type('123456')
            cy.percySnapshot('DIAG-21-OTP-Entered')
            
            cy.get('button').contains(/Verify|אמת/i).click({ force: true })
            cy.wait(2000)
            cy.percySnapshot('DIAG-22-After-Verify')
          } else {
            cy.log('❌ No auth modal found')
            cy.percySnapshot('DIAG-18-No-Auth-Modal')
            
            // Check for validation errors
            cy.get('[class*="error"], .error').then($errors => {
              if ($errors.length > 0) {
                cy.log(`❌ Found ${$errors.length} validation errors`)
                cy.percySnapshot('DIAG-18-Validation-Errors')
                $errors.each((i, err) => {
                  cy.log(`Error ${i + 1}: ${err.textContent}`)
                })
              }
            })
          }
        })
      }
    })
    
    // SNAPSHOT 23: Final state
    cy.wait(2000)
    cy.percySnapshot('DIAG-23-Final-State')
    cy.screenshot('diag-23-final')
    cy.log('📸 Diagnostic complete - check Percy dashboard for all snapshots')
  })
})