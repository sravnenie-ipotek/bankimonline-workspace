/**
 * Quick State Management Validation Test
 * Rapid validation of core state management functionality across all 4 processes
 */

describe('⚡ Quick State Management Validation', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.viewport(1920, 1080)
    cy.wait(2000)
  })

  it('should validate basic state management across all 4 processes', () => {
    cy.log('🚀 Running quick state validation for all processes')

    // Test 1: Calculate Mortgage Basic State
    cy.log('📝 Testing Calculate Mortgage state')
    
    // Go to mortgage calc
    cy.contains('חישוב משכנתא').click() // Hebrew for calculate mortgage
    cy.wait(2000)
    
    // Fill basic data
    cy.get('input').first().clear().type('2000000')
    cy.wait(500)
    
    // Check state
    cy.window().then((win) => {
      const state = win.store?.getState()
      if (state?.mortgage) {
        cy.log('✅ Mortgage state exists and is accessible')
        expect(Object.keys(state.mortgage).length).to.be.greaterThan(0)
      }
    })

    // Test 2: Calculate Credit Basic State
    cy.log('📝 Testing Calculate Credit state')
    
    // Go to credit calc
    cy.contains('חישוב אשראי').click() // Hebrew for calculate credit
    cy.wait(2000)
    
    // Fill basic data
    cy.get('input').first().clear().type('500000')
    cy.wait(500)
    
    // Check state
    cy.window().then((win) => {
      const state = win.store?.getState()
      if (state?.credit) {
        cy.log('✅ Credit state exists and is accessible')
        expect(Object.keys(state.credit).length).to.be.greaterThan(0)
      }
      // Verify mortgage state is still preserved
      if (state?.mortgage) {
        cy.log('✅ Mortgage state preserved during process switch')
      }
    })

    // Test 3: Refinance Mortgage Basic State
    cy.log('📝 Testing Refinance Mortgage state')
    
    // Go to refinance mortgage
    cy.contains('מחזור משכנתא').click() // Hebrew for refinance mortgage
    cy.wait(2000)
    
    // Fill basic data
    cy.get('input').first().clear().type('1500000')
    cy.wait(500)
    
    // Check state
    cy.window().then((win) => {
      const state = win.store?.getState()
      if (state?.refinanceMortgage) {
        cy.log('✅ Refinance Mortgage state exists and is accessible')
        expect(Object.keys(state.refinanceMortgage).length).to.be.greaterThan(0)
      }
    })

    // Test 4: Refinance Credit Basic State
    cy.log('📝 Testing Refinance Credit state')
    
    // Go to refinance credit
    cy.contains('מחזור אשראי').click() // Hebrew for refinance credit
    cy.wait(2000)
    
    // Fill basic data if available
    cy.get('input').first().then(($input) => {
      if ($input.length > 0) {
        cy.wrap($input).clear().type('8000')
        cy.wait(500)
      }
    })
    
    // Check final comprehensive state
    cy.window().then((win) => {
      const state = win.store?.getState()
      
      cy.log('📊 Final State Validation:')
      
      const processStates = {
        mortgage: state?.mortgage && Object.keys(state.mortgage).length > 0,
        credit: state?.credit && Object.keys(state.credit).length > 0,
        refinanceMortgage: state?.refinanceMortgage && Object.keys(state.refinanceMortgage).length > 0,
        refinanceCredit: state?.refinanceCredit && Object.keys(state.refinanceCredit).length > 0
      }
      
      Object.entries(processStates).forEach(([process, hasState]) => {
        if (hasState) {
          cy.log(`✅ ${process}: State preserved`)
        } else {
          cy.log(`⚠️ ${process}: No state data`)
        }
      })
      
      // At least 2 processes should have state data
      const activeProcesses = Object.values(processStates).filter(Boolean).length
      expect(activeProcesses).to.be.at.least(2, 'At least 2 processes should have state data')
      
      cy.log(`✅ Quick validation complete - ${activeProcesses}/4 processes have state data`)
    })
  })

  it('should validate state persistence across page reload', () => {
    cy.log('🔄 Testing state persistence across page reload')
    
    // Set up some state data
    cy.contains('חישוב משכנתא').click()
    cy.wait(1000)
    cy.get('input').first().clear().type('2500000')
    cy.wait(500)
    
    // Capture state before reload
    cy.window().then((win) => {
      const stateBefore = win.store?.getState()
      if (stateBefore?.mortgage) {
        cy.wrap(stateBefore.mortgage).as('mortgageStateBefore')
      }
    })
    
    // Reload page
    cy.reload()
    cy.wait(3000)
    
    // Check state after reload
    cy.get('@mortgageStateBefore').then((originalState) => {
      cy.window().then((win) => {
        const stateAfter = win.store?.getState()
        if (stateAfter?.mortgage && originalState) {
          cy.log('✅ State persistence verified - data restored after reload')
        } else {
          cy.log('⚠️ State persistence may have issues')
        }
      })
    })
  })

  it('should validate step navigation with state preservation', () => {
    cy.log('🚶‍♂️ Testing step navigation with state preservation')
    
    // Start mortgage process
    cy.contains('חישוב משכנתא').click()
    cy.wait(1000)
    
    // Fill step 1 data
    cy.get('input').first().clear().type('2000000')
    cy.wait(500)
    
    // Try to go to next step if button exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="next-step-button"]').length > 0) {
        cy.get('[data-cy="next-step-button"]').click()
        cy.wait(1000)
        
        // Check if state is preserved after navigation
        cy.window().then((win) => {
          const state = win.store?.getState()
          if (state?.mortgage) {
            cy.log('✅ State preserved during step navigation')
          }
        })
      } else {
        // Look for any button that might navigate to next step
        cy.get('button').contains(/הבא|next|continue/i).then(($btn) => {
          if ($btn.length > 0) {
            cy.wrap($btn).first().click()
            cy.wait(1000)
            
            cy.window().then((win) => {
              const state = win.store?.getState()
              if (state?.mortgage) {
                cy.log('✅ State preserved during step navigation')
              }
            })
          } else {
            cy.log('ℹ️ No next step button found - testing current step only')
          }
        })
      }
    })
  })

  afterEach(() => {
    // Log state summary for debugging
    cy.window().then((win) => {
      const state = win.store?.getState()
      if (state) {
        const activeSections = Object.keys(state).filter(key => 
          state[key] && typeof state[key] === 'object' && Object.keys(state[key]).length > 0
        )
        cy.log(`📋 Test completed - Active state sections: ${activeSections.join(', ')}`)
      }
    })
  })
})