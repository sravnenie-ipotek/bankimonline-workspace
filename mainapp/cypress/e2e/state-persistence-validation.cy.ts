/**
 * State Persistence and Validation Tests
 * Tests Redux state persistence, redux-persist integration, and data validation
 * across browser sessions, page reloads, and process switches
 */

interface CompleteStateData {
  mortgage: any
  refinanceMortgage: any  
  credit: any
  refinanceCredit: any
  borrowers: any
  borrowersPersonalData: any
  otherBorrowers: any
  activeField: any
  language: any
  auth: any
}

describe('💾 State Persistence and Validation Tests', () => {
  let testData: any

  before(() => {
    cy.fixture('testData').then((data) => {
      testData = data
    })
  })

  beforeEach(() => {
    cy.visit('/')
    cy.viewport(1920, 1080)
    cy.get('[data-cy="app-ready"]', { timeout: 10000 }).should('exist')
    cy.wait(1000)
  })

  describe('🔄 Redux-Persist Integration Tests', () => {
    it('should persist and restore complete state across browser sessions', () => {
      cy.log('🔄 Testing complete state persistence across sessions')

      // Fill comprehensive data across all processes
      const testScenarios = [
        {
          process: 'mortgage',
          nav: '[data-cy="sidebar-calculate-mortgage"]',
          data: {
            priceOfEstate: 2500000,
            nameSurname: 'John Mortgage',
            monthlyIncome: 25000
          }
        },
        {
          process: 'refinanceMortgage', 
          nav: '[data-cy="sidebar-refinance-mortgage"]',
          data: {
            mortgageBalance: 1800000,
            nameSurname: 'Jane Refinance',
            monthlyIncome: 30000
          }
        },
        {
          process: 'credit',
          nav: '[data-cy="sidebar-calculate-credit"]', 
          data: {
            loanAmount: 600000,
            nameSurname: 'Bob Credit',
            monthlyIncome: 18000
          }
        },
        {
          process: 'refinanceCredit',
          nav: '[data-cy="sidebar-refinance-credit"]',
          data: {
            desiredMonthlyPayment: 8000,
            nameSurname: 'Alice RefinanceCredit',
            monthlyIncome: 22000
          }
        }
      ]

      // Fill data for each process
      testScenarios.forEach((scenario) => {
        cy.log(`📝 Filling data for ${scenario.process}`)
        cy.get(scenario.nav).click()
        cy.wait(1500)

        // Fill basic numerical field
        const firstDataKey = Object.keys(scenario.data)[0]
        const firstDataValue = scenario.data[firstDataKey]
        cy.get(`input[name="${firstDataKey}"]`).clear().type(firstDataValue.toString())

        // Navigate to step 2 if possible to fill name
        cy.get('[data-cy="next-step-button"]').then(($btn) => {
          if ($btn.length > 0 && $btn.is(':visible')) {
            cy.wrap($btn).click()
            cy.wait(1000)
            cy.get('input[name="nameSurname"]').clear().type(scenario.data.nameSurname)
            
            // Navigate to step 3 if possible to fill income
            cy.get('[data-cy="next-step-button"]').then(($btn2) => {
              if ($btn2.length > 0 && $btn2.is(':visible')) {
                cy.wrap($btn2).click()
                cy.wait(1000)
                cy.get('input[name="monthlyIncome"]').clear().type(scenario.data.monthlyIncome.toString())
              }
            })
          }
        })
      })

      // Capture complete state before session end
      cy.window().its('store').invoke('getState').then((stateBefore: CompleteStateData) => {
        cy.log('State before session end captured')

        // Verify all process data exists
        expect(stateBefore.mortgage.priceOfEstate).to.equal(2500000)
        expect(stateBefore.refinanceMortgage.mortgageBalance).to.equal(1800000) 
        expect(stateBefore.credit.loanAmount).to.equal(600000)
        expect(stateBefore.refinanceCredit.desiredMonthlyPayment).to.equal(8000)

        // Store state snapshot for verification
        cy.wrap(stateBefore).as('originalState')
      })

      // Simulate session end and new session
      cy.clearCookies()
      cy.reload()
      cy.wait(3000)

      // Verify state restoration
      cy.window().its('store').invoke('getState').then((stateAfter: CompleteStateData) => {
        cy.get('@originalState').then((originalState: CompleteStateData) => {
          // Verify critical data persistence
          expect(stateAfter.mortgage.priceOfEstate).to.equal(originalState.mortgage.priceOfEstate)
          expect(stateAfter.refinanceMortgage.mortgageBalance).to.equal(originalState.refinanceMortgage.mortgageBalance)
          expect(stateAfter.credit.loanAmount).to.equal(originalState.credit.loanAmount)
          expect(stateAfter.refinanceCredit.desiredMonthlyPayment).to.equal(originalState.refinanceCredit.desiredMonthlyPayment)
          
          cy.log('✅ Complete state persistence verified across sessions')
        })
      })
    })

    it('should handle partial state corruption gracefully', () => {
      cy.log('🛡️ Testing graceful handling of partial state corruption')

      // Set up initial valid state
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)
      cy.get('input[name="priceOfEstate"]').clear().type('1500000')

      // Verify initial state
      cy.window().its('store').invoke('getState').then((state: CompleteStateData) => {
        expect(state.mortgage.priceOfEstate).to.equal(1500000)
      })

      // Simulate partial localStorage corruption
      cy.window().then((win) => {
        const persistedState = win.localStorage.getItem('persist:root')
        if (persistedState) {
          const parsed = JSON.parse(persistedState)
          // Corrupt only the mortgage slice
          parsed.mortgage = '{"invalid": json}'
          win.localStorage.setItem('persist:root', JSON.stringify(parsed))
        }
      })

      // Reload to trigger state rehydration with corruption
      cy.reload()
      cy.wait(3000)

      // App should still function with corrupted slice
      cy.get('[data-cy="sidebar-calculate-mortgage"]').should('be.visible')
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Should be able to enter new data
      cy.get('input[name="priceOfEstate"]').should('be.visible')
      cy.get('input[name="priceOfEstate"]').clear().type('2000000')

      cy.window().its('store').invoke('getState').then((state: CompleteStateData) => {
        // New data should work despite corruption
        expect(state.mortgage.priceOfEstate).to.equal(2000000)
        cy.log('✅ Graceful recovery from partial corruption verified')
      })
    })

    it('should maintain state consistency across rapid process switches', () => {
      cy.log('⚡ Testing state consistency during rapid process switching')

      const switchSequence = [
        { nav: '[data-cy="sidebar-calculate-mortgage"]', field: 'priceOfEstate', value: '1000000' },
        { nav: '[data-cy="sidebar-calculate-credit"]', field: 'loanAmount', value: '500000' },
        { nav: '[data-cy="sidebar-refinance-mortgage"]', field: 'mortgageBalance', value: '800000' },
        { nav: '[data-cy="sidebar-refinance-credit"]', field: 'desiredMonthlyPayment', value: '7000' },
        { nav: '[data-cy="sidebar-calculate-mortgage"]', field: 'priceOfEstate', value: '1100000' }, // Return and modify
      ]

      // Perform rapid switches with data entry
      switchSequence.forEach((step, index) => {
        cy.log(`Switch ${index + 1}: ${step.nav}`)
        cy.get(step.nav).click()
        cy.wait(800) // Reduced wait for rapid switching
        cy.get(`input[name="${step.field}"]`).clear().type(step.value)
        cy.wait(300)
      })

      // Verify final state consistency
      cy.window().its('store').invoke('getState').then((state: CompleteStateData) => {
        expect(state.mortgage.priceOfEstate).to.equal(1100000) // Modified value
        expect(state.credit.loanAmount).to.equal(500000)
        expect(state.refinanceMortgage.mortgageBalance).to.equal(800000)
        expect(state.refinanceCredit.desiredMonthlyPayment).to.equal(7000)
        
        cy.log('✅ State consistency maintained during rapid switching')
      })
    })
  })

  describe('🎯 Step-by-Step State Validation', () => {
    it('should validate progressive state building in mortgage process', () => {
      cy.log('🏗️ Testing progressive state building through mortgage steps')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      const mortgageSteps = [
        {
          step: 1,
          data: { priceOfEstate: 2000000, propertyOwnership: 'option_1' },
          expectedFields: ['priceOfEstate', 'propertyOwnership'],
          description: 'Basic property information'
        },
        {
          step: 2, 
          data: { nameSurname: 'Test User', education: 'bachelors' },
          expectedFields: ['priceOfEstate', 'propertyOwnership', 'nameSurname', 'education'],
          description: 'Personal information added'
        },
        {
          step: 3,
          data: { monthlyIncome: 20000, mainSourceOfIncome: 'salary' },
          expectedFields: ['priceOfEstate', 'propertyOwnership', 'nameSurname', 'education', 'monthlyIncome', 'mainSourceOfIncome'],
          description: 'Income information added'
        }
      ]

      mortgageSteps.forEach((stepInfo) => {
        cy.log(`📋 Step ${stepInfo.step}: ${stepInfo.description}`)

        // Fill step data
        Object.entries(stepInfo.data).forEach(([field, value]) => {
          if (field.includes('dropdown') || field === 'propertyOwnership' || field === 'education' || field === 'mainSourceOfIncome') {
            // Handle dropdown fields
            cy.get(`[data-cy="${field.replace(/([A-Z])/g, '-$1').toLowerCase()}-dropdown"]`).click()
            cy.get(`[data-cy="${field.replace(/([A-Z])/g, '-$1').toLowerCase()}-option-${value}"]`).click()
          } else {
            // Handle input fields
            cy.get(`input[name="${field}"]`).clear().type(value.toString())
          }
        })

        // Validate state contains expected fields
        cy.window().its('store').invoke('getState').then((state: CompleteStateData) => {
          stepInfo.expectedFields.forEach((field) => {
            expect(state.mortgage[field]).to.exist
            cy.log(`✓ Field ${field} exists in state`)
          })
          
          // Validate specific values for current step
          Object.entries(stepInfo.data).forEach(([field, value]) => {
            if (typeof value === 'number') {
              expect(state.mortgage[field]).to.equal(value)
            } else {
              expect(state.mortgage[field]).to.equal(value)
            }
          })
          
          cy.log(`✅ Step ${stepInfo.step} state validation passed`)
        })

        // Move to next step if not the last one
        if (stepInfo.step < mortgageSteps.length) {
          cy.get('[data-cy="next-step-button"]').click()
          cy.wait(1500)
        }
      })
    })

    it('should preserve state when navigating back through steps', () => {
      cy.log('⬅️ Testing state preservation during backward navigation')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Fill all steps forward
      cy.get('input[name="priceOfEstate"]').clear().type('2500000')
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)

      cy.get('input[name="nameSurname"]').clear().type('Backward Test User')
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)

      cy.get('input[name="monthlyIncome"]').clear().type('25000')
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1500)

      // Capture state at final step
      cy.window().its('store').invoke('getState').then((forwardState: CompleteStateData) => {
        expect(forwardState.mortgage.priceOfEstate).to.equal(2500000)
        expect(forwardState.mortgage.nameSurname).to.equal('Backward Test User')
        expect(forwardState.mortgage.monthlyIncome).to.equal(25000)

        // Navigate backward
        cy.get('[data-cy="previous-step-button"]').click()
        cy.wait(1000)
        cy.get('[data-cy="previous-step-button"]').click()
        cy.wait(1000)
        cy.get('[data-cy="previous-step-button"]').click()
        cy.wait(1000)

        // Verify state preserved during backward navigation
        cy.window().its('store').invoke('getState').then((backwardState: CompleteStateData) => {
          expect(backwardState.mortgage.priceOfEstate).to.equal(2500000)
          expect(backwardState.mortgage.nameSurname).to.equal('Backward Test User')
          expect(backwardState.mortgage.monthlyIncome).to.equal(25000)
          
          cy.log('✅ State preserved during backward navigation')
        })
      })
    })

    it('should handle step validation errors without corrupting state', () => {
      cy.log('❌ Testing state integrity during validation errors')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Fill valid data initially
      cy.get('input[name="priceOfEstate"]').clear().type('2000000')
      
      // Verify valid state
      cy.window().its('store').invoke('getState').then((validState: CompleteStateData) => {
        expect(validState.mortgage.priceOfEstate).to.equal(2000000)
      })

      // Try to proceed without required fields to trigger validation
      cy.get('[data-cy="next-step-button"]').click()
      
      // Should see validation errors but state should remain intact
      cy.get('.error-message').should('be.visible')

      cy.window().its('store').invoke('getState').then((stateAfterError: CompleteStateData) => {
        expect(stateAfterError.mortgage.priceOfEstate).to.equal(2000000)
        cy.log('✅ State integrity maintained despite validation errors')
      })

      // Fill missing required field and proceed
      cy.get('[data-cy="property-ownership-dropdown"]').click()
      cy.get('[data-cy="property-ownership-option-1"]').click()
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)

      // Verify successful navigation and state
      cy.window().its('store').invoke('getState').then((finalState: CompleteStateData) => {
        expect(finalState.mortgage.priceOfEstate).to.equal(2000000)
        expect(finalState.mortgage.propertyOwnership).to.equal('option_1')
        cy.log('✅ Successful navigation after fixing validation errors')
      })
    })
  })

  describe('🔗 Complex State Relationships', () => {
    it('should handle borrowers and co-borrowers state relationships', () => {
      cy.log('👥 Testing borrowers and co-borrowers state management')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Navigate to personal data step
      cy.get('input[name="priceOfEstate"]').clear().type('2000000')
      cy.get('[data-cy="property-ownership-dropdown"]').click()
      cy.get('[data-cy="property-ownership-option-1"]').click()
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)

      // Fill borrowers information
      cy.get('input[name="nameSurname"]').clear().type('Main Borrower')
      cy.get('[data-cy="borrowers-dropdown"]').click()
      cy.get('[data-cy="borrowers-option-2"]').click() // 2 borrowers

      // Add co-borrower
      cy.get('[data-cy="add-partner-yes"]').click()
      cy.get('input[name="partnerName"]').clear().type('Co Borrower')

      // Verify complex state relationships
      cy.window().its('store').invoke('getState').then((state: CompleteStateData) => {
        expect(state.mortgage.nameSurname).to.equal('Main Borrower')
        expect(state.mortgage.borrowers).to.equal(2)
        expect(state.borrowers).to.exist
        expect(state.otherBorrowers).to.exist
        
        cy.log('✅ Complex borrowers state relationships managed correctly')
      })
    })

    it('should synchronize form data with modal data correctly', () => {
      cy.log('🔄 Testing form and modal data synchronization')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Navigate to income step
      cy.get('input[name="priceOfEstate"]').clear().type('2000000')
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)
      cy.get('input[name="nameSurname"]').clear().type('Modal Test User')
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)

      // Fill income data through main form
      cy.get('input[name="monthlyIncome"]').clear().type('20000')
      cy.get('[data-cy="main-income-dropdown"]').click()
      cy.get('[data-cy="main-income-option-salary"]').click()

      // Open income modal to add additional data
      cy.get('[data-cy="add-income-source-button"]').click()
      cy.wait(500)
      
      // Fill modal data
      cy.get('[data-cy="modal-income-amount"]').type('5000')
      cy.get('[data-cy="modal-income-type-dropdown"]').click()
      cy.get('[data-cy="modal-income-type-rental"]').click()
      cy.get('[data-cy="modal-save-button"]').click()

      // Verify both form and modal data in state
      cy.window().its('store').invoke('getState').then((state: CompleteStateData) => {
        expect(state.mortgage.monthlyIncome).to.equal(20000) // Main form data
        expect(state.modal).to.exist // Modal data should exist
        expect(state.modal.additionalIncomeModal).to.be.an('array')
        
        cy.log('✅ Form and modal data synchronization verified')
      })
    })
  })

  describe('⚡ Performance and Memory Tests', () => {
    it('should not cause memory leaks during extended state operations', () => {
      cy.log('🧠 Testing for memory leaks during extended operations')

      // Perform many state operations to test for leaks
      for (let i = 0; i < 10; i++) {
        cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
        cy.wait(200)
        cy.get(`input[name="priceOfEstate"]`).clear().type((1000000 + i * 100000).toString())
        
        cy.get('[data-cy="sidebar-calculate-credit"]').click()
        cy.wait(200)
        cy.get(`input[name="loanAmount"]`).clear().type((500000 + i * 50000).toString())
      }

      // Check final state is consistent
      cy.window().its('store').invoke('getState').then((state: CompleteStateData) => {
        expect(state.mortgage.priceOfEstate).to.equal(1900000) // Last iteration
        expect(state.credit.loanAmount).to.equal(950000) // Last iteration
        cy.log('✅ No apparent memory leaks - state consistent after extended operations')
      })
    })

    it('should handle large state objects efficiently', () => {
      cy.log('📊 Testing performance with large state objects')

      cy.get('[data-cy="sidebar-refinance-credit"]').click()
      cy.wait(1000)

      // Add many credit entries to test large arrays
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy="add-credit-button"]').click()
        cy.get(`input[name="creditData[${i}].bank"]`).type(`Bank ${i + 1}`)
        cy.get(`input[name="creditData[${i}].amount"]`).type((200000 + i * 100000).toString())
        cy.get(`input[name="creditData[${i}].monthlyPayment"]`).type((8000 + i * 1000).toString())
      }

      // Measure state access performance
      const startTime = performance.now()
      
      cy.window().its('store').invoke('getState').then((state: CompleteStateData) => {
        const endTime = performance.now()
        const accessTime = endTime - startTime
        
        expect(state.refinanceCredit.creditData).to.have.length(5)
        expect(accessTime).to.be.lessThan(100) // Should be very fast
        
        cy.log(`✅ Large state access time: ${accessTime.toFixed(2)}ms`)
      })
    })
  })

  afterEach(() => {
    // Capture final state metrics for monitoring
    cy.window().its('store').invoke('getState').then((state: CompleteStateData) => {
      const stateSize = JSON.stringify(state).length
      const processesWithData = [
        state.mortgage && Object.keys(state.mortgage).length > 0 ? 'mortgage' : null,
        state.credit && Object.keys(state.credit).length > 0 ? 'credit' : null,
        state.refinanceMortgage && Object.keys(state.refinanceMortgage).length > 0 ? 'refinanceMortgage' : null,
        state.refinanceCredit && Object.keys(state.refinanceCredit).length > 0 ? 'refinanceCredit' : null
      ].filter(Boolean)
      
      cy.log(`📊 Final state metrics:`)
      cy.log(`   Size: ${stateSize} characters`)
      cy.log(`   Processes with data: ${processesWithData.join(', ')}`)
      cy.log(`   Active processes: ${processesWithData.length}`)
    })
  })
})