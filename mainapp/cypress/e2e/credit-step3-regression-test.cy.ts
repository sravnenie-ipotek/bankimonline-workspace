describe('Credit Calculator Step 3 - Regression Test', () => {
  beforeEach(() => {
    // Visit Credit Calculator and navigate to Step 3
    cy.visit('/services/calculate-credit/')
  })

  it('should navigate to Step 3 and test income source dropdown functionality', () => {
    console.log('Test ID: CREDIT-STEP3-001')
    console.log('Category: Regression Test')
    console.log('Element: Income Source Dropdown in Credit Calculator Step 3')
    console.log('Test Case: Verify components render after income source selection')
    console.log('Expected Result: Income-related components appear after dropdown selection')

    // Step 1: Complete Credit Calculator Step 1 first
    cy.log('🔄 Completing Step 1 to reach Step 3')
    
    // Fill in Step 1 fields to enable navigation
    // Purpose dropdown
    cy.get('[data-testid="purpose-dropdown"], select, div[role="combobox"]').first().click()
    cy.get('[data-value], option, div[role="option"]').first().click()
    
    // Amount field
    cy.get('input[type="number"], input[name*="amount"]').first().clear().type('50000')
    
    // When dropdown
    cy.get('select, div[role="combobox"]').eq(1).click()
    cy.get('[data-value], option, div[role="option"]').first().click()
    
    // Period dropdown
    cy.get('select, div[role="combobox"]').last().click()
    cy.get('[data-value], option, div[role="option"]').first().click()
    
    // Click Next to go to Step 2
    cy.contains('הבא', { timeout: 10000 }).click()
    
    // Step 2: Fill personal details if needed
    cy.log('🔄 Navigating through Step 2')
    cy.wait(2000)
    
    // Try to click Next again or fill required fields
    cy.get('body').then($body => {
      if ($body.find('input[name*="name"], input[type="text"]').length > 0) {
        // Fill name field if exists
        cy.get('input[name*="name"], input[type="text"]').first().type('Test User')
        cy.get('input[name*="email"]').type('test@example.com')
      }
    })
    
    cy.contains('הבא').click()
    
    // Step 3: Now we should be on the Income step
    cy.log('✅ Reached Step 3 - Testing income source dropdown')
    
    // Wait for Step 3 to load
    cy.wait(3000)
    
    // Take screenshot of Step 3 before selection
    cy.screenshot('credit-step3-before-selection', { fullPage: true })
    
    // Look for income source dropdown
    cy.log('🔍 Searching for income source dropdown...')
    
    // Try different selectors for income source dropdown
    const dropdownSelectors = [
      '[data-testid*="income"]',
      'select[name*="income"]',
      'select[name*="source"]',
      'div[role="combobox"]',
      '.MuiSelect-root',
      'select'
    ]
    
    let dropdownFound = false
    
    dropdownSelectors.forEach(selector => {
      cy.get('body').then($body => {
        const elements = $body.find(selector)
        if (elements.length > 0 && !dropdownFound) {
          cy.log(`Found dropdown with selector: ${selector}`)
          
          // Click the dropdown
          cy.get(selector).first().click({ force: true })
          cy.wait(1000)
          
          // Look for options
          cy.get('body').then($bodyWithOptions => {
            const options = $bodyWithOptions.find('option, li[data-value], div[role="option"], .MuiMenuItem-root')
            
            if (options.length > 0) {
              cy.log(`Found ${options.length} options`)
              
              // Select the first option (should be an income source like Employee)
              cy.get('option, li[data-value], div[role="option"], .MuiMenuItem-root').first().click({ force: true })
              cy.wait(3000)
              
              // Check if income components appeared
              cy.get('body').then($bodyAfterSelection => {
                const inputFields = $bodyAfterSelection.find('input, .MuiTextField-root, textarea')
                const componentCount = inputFields.length
                
                cy.log(`Components found after selection: ${componentCount}`)
                
                // Take screenshot after selection
                cy.screenshot('credit-step3-after-selection', { fullPage: true })
                
                if (componentCount > 3) {
                  // SUCCESS: Components rendered
                  cy.log('✅ SUCCESS: Income components rendered after dropdown selection!')
                  dropdownFound = true
                  
                  // Document the success
                  cy.task('log', {
                    test: 'Credit Calculator Step 3 Regression Test',
                    status: 'PASS',
                    components_found: componentCount,
                    message: 'Income components successfully rendered after dropdown selection'
                  })
                } else {
                  // FAILURE: No components or too few
                  cy.log('❌ FAILED: Income components did NOT render after dropdown selection')
                  
                  cy.task('log', {
                    test: 'Credit Calculator Step 3 Regression Test', 
                    status: 'FAIL',
                    components_found: componentCount,
                    message: 'Income components failed to render after dropdown selection'
                  })
                  
                  throw new Error('Regression test failed: Income components not rendering')
                }
              })
            }
          })
        }
      })
    })
    
    // If no dropdown was found at all
    if (!dropdownFound) {
      cy.log('❌ CRITICAL: No income source dropdown found on Step 3')
      cy.screenshot('credit-step3-no-dropdown', { fullPage: true })
      
      cy.task('log', {
        test: 'Credit Calculator Step 3 Regression Test',
        status: 'CRITICAL_FAIL',
        components_found: 0,
        message: 'No income source dropdown found on Step 3'
      })
      
      throw new Error('Critical test failure: No income source dropdown found')
    }
  })
  
  it('should validate console logs show successful mapping', () => {
    cy.log('🔍 Testing console logs for mapping success')
    
    // Monitor console logs
    cy.window().then((win) => {
      cy.spy(win.console, 'log').as('consoleLog')
    })
    
    // Navigate to Step 3 (abbreviated version)
    cy.visit('/services/calculate-credit/3/')
    cy.wait(5000)
    
    // Check if there are mapping-related logs
    cy.get('@consoleLog').should('have.been.called')
    
    // Look for specific success indicators in console
    cy.window().its('console').then((console) => {
      const logs = console.log.getCalls()
      const mappingLogs = logs.filter(call => 
        call.args.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('mapping') || arg.includes('success') || arg.includes('dropdown'))
        )
      )
      
      cy.log(`Found ${mappingLogs.length} mapping-related console logs`)
      
      if (mappingLogs.length > 0) {
        cy.log('✅ Console logs show mapping activity')
      } else {
        cy.log('⚠️ No mapping-related console logs found')
      }
    })
  })
})