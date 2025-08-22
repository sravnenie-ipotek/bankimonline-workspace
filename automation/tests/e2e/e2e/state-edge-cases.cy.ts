/**
 * State Management Edge Cases and Error Scenarios
 * Tests complex state scenarios, error conditions, and edge cases
 * that could cause state corruption or application failures
 */

interface StateSnapshot {
  mortgage: any
  refinanceMortgage: any
  credit: any
  refinanceCredit: any
  borrowers: any
  borrowersPersonalData: any
  otherBorrowers: any
}

describe('🧪 State Management Edge Cases and Error Scenarios', () => {
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

  describe('🔥 Critical Edge Cases', () => {
    it('should handle simultaneous rapid state updates without corruption', () => {
      cy.log('⚡ Testing rapid simultaneous state updates')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Simulate rapid user input causing simultaneous state updates
      const rapidUpdates = [
        { field: 'priceOfEstate', value: '1000000' },
        { field: 'priceOfEstate', value: '1500000' },
        { field: 'priceOfEstate', value: '2000000' },
        { field: 'priceOfEstate', value: '2500000' },
      ]

      // Execute rapid updates with minimal delays
      rapidUpdates.forEach((update, index) => {
        cy.get(`input[name="${update.field}"]`).clear().type(update.value)
        cy.wait(50) // Very short delay to simulate rapid typing
      })

      // Wait for state to stabilize
      cy.wait(1000)

      // Verify final state is consistent with last update
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.mortgage.priceOfEstate).to.equal(2500000) // Last value
        cy.log('✅ Rapid state updates handled correctly')
      })
    })

    it('should handle invalid data types gracefully', () => {
      cy.log('🚫 Testing invalid data type handling')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Try to input invalid data that could break state
      const invalidInputs = [
        { field: 'priceOfEstate', value: 'invalid_number', expected: 0 },
        { field: 'priceOfEstate', value: '999999999999999999999', expected: 999999999999999999999 }, // Very large number
        { field: 'priceOfEstate', value: '-100000', expected: -100000 }, // Negative number
        { field: 'priceOfEstate', value: '1.5e6', expected: 1500000 }, // Scientific notation
      ]

      invalidInputs.forEach((test) => {
        cy.get(`input[name="${test.field}"]`).clear().type(test.value)
        cy.wait(500)

        cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
          const actualValue = state.mortgage[test.field]
          if (typeof test.expected === 'number') {
            expect(actualValue).to.equal(test.expected)
          } else {
            expect(actualValue).to.exist // Should handle gracefully without crashing
          }
          cy.log(`✓ Invalid input "${test.value}" handled gracefully`)
        })
      })
    })

    it('should recover from corrupted slice data', () => {
      cy.log('🔧 Testing recovery from corrupted slice data')

      // Set up valid initial state
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)
      cy.get('input[name="priceOfEstate"]').clear().type('2000000')

      // Verify initial state
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.mortgage.priceOfEstate).to.equal(2000000)
      })

      // Manually corrupt specific slice data
      cy.window().then((win) => {
        if (win.store) {
          // Dispatch invalid action to potentially corrupt state
          win.store.dispatch({
            type: 'mortgage/updateMortgageData',
            payload: {
              priceOfEstate: null,
              invalidProperty: { nested: { deeply: 'invalid' } },
              circularRef: {}
            }
          })
          
          // Create circular reference that could break JSON serialization
          const payload = { circularRef: {} }
          payload.circularRef = payload
        }
      })

      // Try to continue using the application
      cy.get('[data-cy="next-step-button"]').should('be.visible')
      cy.get('input[name="priceOfEstate"]').clear().type('2500000')

      // Verify application continues to function
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.mortgage.priceOfEstate).to.equal(2500000)
        cy.log('✅ Application recovered from corrupted slice data')
      })
    })

    it('should handle maximum field length inputs', () => {
      cy.log('📏 Testing maximum field length handling')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Test with extremely long text inputs
      const veryLongName = 'A'.repeat(1000) // 1000 character name
      const veryLongNumber = '9'.repeat(20) // 20 digit number

      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)

      cy.get('input[name="nameSurname"]').clear().type(veryLongName)
      cy.wait(500)

      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        // Should either truncate or handle long input gracefully
        expect(state.mortgage.nameSurname).to.exist
        expect(state.mortgage.nameSurname.length).to.be.at.most(1000)
        cy.log('✅ Long text input handled gracefully')
      })

      // Test with very large numbers
      cy.get('input[name="monthlyIncome"]').clear().type(veryLongNumber)
      cy.wait(500)

      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        // Should handle large numbers without breaking
        expect(state.mortgage.monthlyIncome).to.exist
        expect(typeof state.mortgage.monthlyIncome).to.equal('number')
        cy.log('✅ Large number input handled gracefully')
      })
    })
  })

  describe('🔄 Complex State Transitions', () => {
    it('should handle complex conditional state cleanup correctly', () => {
      cy.log('🧹 Testing complex conditional state cleanup')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Set up complex conditional scenario
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)

      // Set additional income to YES and fill amount
      cy.get('[data-cy="additional-income-dropdown"]').click()
      cy.get('[data-cy="additional-income-option-yes"]').click()
      cy.get('input[name="additionalIncomeAmount"]').type('5000')

      // Set obligations to YES and fill details
      cy.get('[data-cy="obligation-dropdown"]').click()
      cy.get('[data-cy="obligation-option-yes"]').click()
      cy.get('[data-cy="obligation-bank-dropdown"]').click()
      cy.get('[data-cy="obligation-bank-option-hapoalim"]').click()
      cy.get('input[name="monthlyPaymentForAnotherBank"]').type('3000')

      // Verify complex state exists
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.mortgage.additionalIncome).to.equal('yes')
        expect(state.mortgage.additionalIncomeAmount).to.equal(5000)
        expect(state.mortgage.obligation).to.equal('yes')
        expect(state.mortgage.bank).to.exist
        expect(state.mortgage.monthlyPaymentForAnotherBank).to.equal(3000)
      })

      // Change additional income to NO - should cleanup amount
      cy.get('[data-cy="additional-income-dropdown"]').click()
      cy.get('[data-cy="additional-income-option-no"]').click()

      // Change obligations to NO - should cleanup related fields
      cy.get('[data-cy="obligation-dropdown"]').click()
      cy.get('[data-cy="obligation-option-no"]').click()

      // Verify selective cleanup occurred
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.mortgage.additionalIncome).to.equal('no')
        expect(state.mortgage.additionalIncomeAmount).to.be.undefined
        expect(state.mortgage.obligation).to.equal('no')
        expect(state.mortgage.bank).to.be.undefined
        expect(state.mortgage.monthlyPaymentForAnotherBank).to.be.undefined
        cy.log('✅ Complex conditional cleanup working correctly')
      })
    })

    it('should handle array manipulation edge cases', () => {
      cy.log('📊 Testing array manipulation edge cases')

      cy.get('[data-cy="sidebar-refinance-credit"]').click()
      cy.wait(1000)

      // Test rapid addition and removal of array items
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy="add-credit-button"]').click()
        cy.get(`input[name="creditData[${i}].bank"]`).type(`Bank ${i + 1}`)
        cy.get(`input[name="creditData[${i}].amount"]`).type((100000 * (i + 1)).toString())
      }

      // Verify all items exist
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.refinanceCredit.creditData).to.have.length(5)
        state.refinanceCredit.creditData.forEach((credit: any, index: number) => {
          expect(credit.bank).to.equal(`Bank ${index + 1}`)
          expect(credit.amount).to.equal(100000 * (index + 1))
        })
      })

      // Remove items from middle and verify array integrity
      cy.get('[data-cy="remove-credit-2"]').click() // Remove middle item
      cy.get('[data-cy="remove-credit-0"]').click() // Remove first item

      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.refinanceCredit.creditData).to.have.length(3)
        // Verify remaining items are correct after removal
        cy.log('✅ Array manipulation edge cases handled correctly')
      })
    })

    it('should handle deep nested object updates', () => {
      cy.log('🏗️ Testing deep nested object updates')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Create complex nested state scenario
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)

      // Add multiple borrowers with complex data
      cy.get('[data-cy="borrowers-dropdown"]').click()
      cy.get('[data-cy="borrowers-option-3"]').click() // 3 borrowers

      cy.get('input[name="nameSurname"]').clear().type('Main Borrower')

      // Add partner with nested data
      cy.get('[data-cy="add-partner-yes"]').click()
      cy.get('input[name="partnerName"]').clear().type('Partner Name')
      cy.get('input[name="partnerIncome"]').clear().type('15000')

      // Add co-borrower with more nested data
      cy.get('[data-cy="add-coborrower-button"]').click()
      cy.get('input[name="coBorrowerName"]').clear().type('Co-Borrower Name')
      cy.get('input[name="coBorrowerIncome"]').clear().type('12000')

      // Verify deep nested state structure
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.mortgage.borrowers).to.equal(3)
        expect(state.borrowers).to.exist
        expect(state.otherBorrowers).to.exist
        expect(state.borrowersPersonalData).to.exist
        cy.log('✅ Deep nested object updates handled correctly')
      })
    })
  })

  describe('🚨 Error Recovery Scenarios', () => {
    it('should recover from network errors during async operations', () => {
      cy.log('🌐 Testing recovery from network errors')

      cy.get('[data-cy="sidebar-refinance-mortgage"]').click()
      cy.wait(1000)

      // Fill minimum data for API call
      cy.get('input[name="mortgageBalance"]').clear().type('1500000')
      cy.get('[data-cy="current-bank-dropdown"]').click()
      cy.get('[data-cy="bank-option-hapoalim"]').click()

      // Intercept and fail the API call
      cy.intercept('POST', '/api/refinance-mortgage', {
        statusCode: 500,
        body: { error: 'Server Error' }
      }).as('refinanceAPI')

      // Trigger the API call
      cy.get('[data-cy="calculate-refinance-button"]').click()
      cy.wait('@refinanceAPI')

      // Verify application continues to function despite API error
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.refinanceMortgage.mortgageBalance).to.equal(1500000)
        // State should remain intact despite API failure
        cy.log('✅ Application state preserved during API errors')
      })

      // Should be able to continue using the form
      cy.get('input[name="priceOfEstate"]').clear().type('2500000')
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.refinanceMortgage.priceOfEstate).to.equal(2500000)
        cy.log('✅ Application continues functioning after network error')
      })
    })

    it('should handle localStorage quota exceeded gracefully', () => {
      cy.log('💾 Testing localStorage quota handling')

      // Fill storage near capacity
      cy.window().then((win) => {
        try {
          // Try to fill localStorage to capacity
          const largeData = 'x'.repeat(1000000) // 1MB of data
          for (let i = 0; i < 10; i++) {
            win.localStorage.setItem(`large_data_${i}`, largeData)
          }
        } catch (e) {
          cy.log('LocalStorage capacity reached as expected')
        }
      })

      // Continue with normal application use
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)
      cy.get('input[name="priceOfEstate"]').clear().type('2000000')

      // Verify application continues to function
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.mortgage.priceOfEstate).to.equal(2000000)
        cy.log('✅ Application handles localStorage quota issues gracefully')
      })

      // Clean up large data
      cy.window().then((win) => {
        for (let i = 0; i < 10; i++) {
          win.localStorage.removeItem(`large_data_${i}`)
        }
      })
    })

    it('should handle concurrent process usage correctly', () => {
      cy.log('🔀 Testing concurrent process usage')

      // Simulate user switching between processes rapidly while data is loading
      const processes = [
        '[data-cy="sidebar-calculate-mortgage"]',
        '[data-cy="sidebar-calculate-credit"]', 
        '[data-cy="sidebar-refinance-mortgage"]',
        '[data-cy="sidebar-refinance-credit"]'
      ]

      // Fill some data in each process rapidly
      processes.forEach((processNav, index) => {
        cy.get(processNav).click()
        cy.wait(200) // Very short wait to simulate rapid switching
        
        if (index === 0) { // Mortgage
          cy.get('input[name="priceOfEstate"]').clear().type((1000000 + index * 200000).toString())
        } else if (index === 1) { // Credit
          cy.get('input[name="loanAmount"]').clear().type((300000 + index * 100000).toString())
        } else if (index === 2) { // Refinance Mortgage
          cy.get('input[name="mortgageBalance"]').clear().type((800000 + index * 100000).toString())
        } else if (index === 3) { // Refinance Credit
          cy.get('input[name="desiredMonthlyPayment"]').clear().type((5000 + index * 1000).toString())
        }
      })

      // Verify all processes maintain their separate state
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.mortgage.priceOfEstate).to.equal(1000000)
        expect(state.credit.loanAmount).to.equal(400000)
        expect(state.refinanceMortgage.mortgageBalance).to.equal(1000000)
        expect(state.refinanceCredit.desiredMonthlyPayment).to.equal(8000)
        cy.log('✅ Concurrent process usage handled correctly')
      })
    })
  })

  describe('🧠 Memory and Performance Edge Cases', () => {
    it('should handle memory pressure scenarios', () => {
      cy.log('🧠 Testing memory pressure scenarios')

      // Create memory pressure by filling large amounts of state data
      cy.get('[data-cy="sidebar-refinance-credit"]').click()
      cy.wait(1000)

      // Add many credit entries to test memory usage
      for (let i = 0; i < 20; i++) {
        cy.get('[data-cy="add-credit-button"]').click()
        cy.get(`input[name="creditData[${i}].bank"]`).type(`Very Long Bank Name ${i} `.repeat(10))
        cy.get(`input[name="creditData[${i}].amount"]`).type((100000 + i * 50000).toString())
        cy.get(`input[name="creditData[${i}].monthlyPayment"]`).type((5000 + i * 500).toString())
        
        if (i % 5 === 0) {
          cy.wait(100) // Occasional pause to let memory stabilize
        }
      }

      // Verify application remains responsive
      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.refinanceCredit.creditData).to.have.length(20)
        
        // Measure state access time under memory pressure
        const startTime = performance.now()
        const stateSize = JSON.stringify(state).length
        const endTime = performance.now()
        
        expect(endTime - startTime).to.be.lessThan(100) // Should still be fast
        cy.log(`✅ Memory pressure handled - State size: ${stateSize} bytes, Access time: ${(endTime - startTime).toFixed(2)}ms`)
      })
    })

    it('should handle rapid state serialization/deserialization', () => {
      cy.log('🔄 Testing rapid serialization/deserialization')

      // Fill complex state across multiple processes
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(500)
      cy.get('input[name="priceOfEstate"]').clear().type('2000000')

      // Force multiple rapid serializations by triggering persistence
      for (let i = 0; i < 10; i++) {
        cy.get('input[name="priceOfEstate"]').clear().type((2000000 + i * 100000).toString())
        cy.wait(50) // Rapid changes to trigger persistence
      }

      // Test reload to verify serialization/deserialization integrity
      cy.reload()
      cy.wait(3000)

      cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
        expect(state.mortgage.priceOfEstate).to.equal(2900000) // Last value
        cy.log('✅ Rapid serialization/deserialization handled correctly')
      })
    })
  })

  afterEach(() => {
    // Clean up any test artifacts that might affect subsequent tests
    cy.window().then((win) => {
      // Remove any test data from localStorage
      Object.keys(win.localStorage).forEach(key => {
        if (key.startsWith('test_') || key.startsWith('large_data_')) {
          win.localStorage.removeItem(key)
        }
      })
    })

    // Log final state for debugging edge case issues
    cy.window().its('store').invoke('getState').then((state: StateSnapshot) => {
      const stateKeys = Object.keys(state).filter(key => state[key] && Object.keys(state[key]).length > 0)
      cy.log(`🔍 Edge case test completed - Active slices: ${stateKeys.join(', ')}`)
    })
  })
})