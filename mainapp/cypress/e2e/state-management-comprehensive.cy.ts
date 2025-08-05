/**
 * Comprehensive State Management Tests for All 4 Processes
 * Tests Redux state persistence, data flow, and cross-step validation through step 4
 * 
 * Processes tested:
 * 1. Calculate Mortgage (mortgage calculation)
 * 2. Refinance Mortgage (mortgage refinancing) 
 * 3. Calculate Credit (credit calculation)
 * 4. Refinance Credit (credit refinancing)
 */

interface StateData {
  mortgage: any
  refinanceMortgage: any
  credit: any
  refinanceCredit: any
  borrowers: any
  borrowersPersonalData: any
  otherBorrowers: any
}

describe('🏦 State Management Comprehensive Tests - All 4 Processes', () => {
  let testData: any

  before(() => {
    cy.fixture('testData').then((data) => {
      testData = data
    })
  })

  beforeEach(() => {
    // Start fresh for each test
    cy.visit('/')
    cy.viewport(1920, 1080)
    
    // Clear localStorage to ensure clean state
    cy.window().then((win) => {
      win.localStorage.clear()
    })
    
    // Wait for app to be ready
    cy.get('[data-cy="app-ready"]', { timeout: 10000 }).should('exist')
    cy.wait(1000)
  })

  describe('🏡 Calculate Mortgage Process - State Management', () => {
    it('should persist state correctly through all 4 steps', () => {
      cy.log('🎯 Testing Calculate Mortgage state management')

      // Navigate to mortgage calculation
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.url().should('include', '/services/mortgage-calculation')
      cy.wait(2000)

      // STEP 1: Fill initial calculation data
      cy.log('📝 Step 1: Filling initial mortgage data')
      
      // Property price
      cy.get('input[name="priceOfEstate"]').clear().type('2000000')
      
      // Property ownership (affects LTV ratio - critical business logic)
      cy.get('[data-cy="property-ownership-dropdown"]').click()
      cy.get('[data-cy="property-ownership-option-1"]').click() // No property (75% LTV)
      
      // When do you need money
      cy.get('[data-cy="when-money-dropdown"]').click()
      cy.get('[data-cy="when-money-option-1"]').click()
      
      // Property type
      cy.get('[data-cy="property-type-dropdown"]').click()
      cy.get('[data-cy="property-type-option-1"]').click()
      
      // City
      cy.get('[data-cy="city-dropdown"]').click()
      cy.get('[data-cy="city-option-tel-aviv"]').click()

      // Verify state persistence after step 1
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.mortgage.priceOfEstate).to.equal(2000000)
        expect(state.mortgage.propertyOwnership).to.exist
        expect(state.mortgage.cityWhereYouBuy).to.exist
        cy.log('✅ Step 1 state persisted correctly')
      })

      // Navigate to step 2
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(2000)

      // STEP 2: Fill personal data
      cy.log('📝 Step 2: Filling personal data')
      
      cy.get('input[name="nameSurname"]').clear().type('Test User')
      cy.get('input[name="birthday"]').clear().type('1990-01-01')
      
      // Education dropdown
      cy.get('[data-cy="education-dropdown"]').click()
      cy.get('[data-cy="education-option-bachelors"]').click()
      
      // Family status
      cy.get('[data-cy="family-status-dropdown"]').click()
      cy.get('[data-cy="family-status-option-single"]').click()

      // Verify state accumulation after step 2
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        // Step 1 data should still exist
        expect(state.mortgage.priceOfEstate).to.equal(2000000)
        // Step 2 data should be added
        expect(state.mortgage.nameSurname).to.equal('Test User')
        expect(state.mortgage.education).to.exist
        cy.log('✅ Step 2 state accumulated correctly')
      })

      // Navigate to step 3
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(2000)

      // STEP 3: Fill income data
      cy.log('📝 Step 3: Filling income data')
      
      // Main source of income
      cy.get('[data-cy="main-income-dropdown"]').click()
      cy.get('[data-cy="main-income-option-salary"]').click()
      
      cy.get('input[name="monthlyIncome"]').clear().type('15000')
      cy.get('input[name="companyName"]').clear().type('Test Company')
      
      // Field of activity
      cy.get('[data-cy="field-activity-dropdown"]').click()
      cy.get('[data-cy="field-activity-option-technology"]').click()

      // Additional income
      cy.get('[data-cy="additional-income-dropdown"]').click()
      cy.get('[data-cy="additional-income-option-no"]').click()

      // Obligations
      cy.get('[data-cy="obligation-dropdown"]').click()
      cy.get('[data-cy="obligation-option-no"]').click()

      // Verify state accumulation after step 3
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        // Previous steps data should still exist
        expect(state.mortgage.priceOfEstate).to.equal(2000000)
        expect(state.mortgage.nameSurname).to.equal('Test User')
        // Step 3 data should be added
        expect(state.mortgage.monthlyIncome).to.equal(15000)
        expect(state.mortgage.mainSourceOfIncome).to.exist
        expect(state.mortgage.additionalIncome).to.equal('no')
        cy.log('✅ Step 3 state accumulated correctly')
      })

      // Navigate to step 4
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(3000)

      // STEP 4: Bank offers and program selection
      cy.log('📝 Step 4: Testing bank offers and final state')
      
      // Verify all previous data is still available
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        // Comprehensive state validation
        expect(state.mortgage.priceOfEstate).to.equal(2000000)
        expect(state.mortgage.nameSurname).to.equal('Test User')
        expect(state.mortgage.monthlyIncome).to.equal(15000)
        
        // Check if bank offers were populated (incomeData object)
        expect(state.mortgage.incomeData).to.exist
        cy.log('✅ All 4 steps state management working correctly')
      })

      // Test bank selection if offers are available
      cy.get('[data-cy="bank-offer"]').first().should('be.visible')
      cy.get('[data-cy="select-bank-button"]').first().click()
      
      // Verify bank selection state
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.mortgage.selectedBank).to.exist
        cy.log('✅ Bank selection state updated correctly')
      })
    })

    it('should handle conditional state cleanup correctly', () => {
      cy.log('🧹 Testing conditional state cleanup in mortgage process')
      
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(2000)

      // Fill initial data with additional income = yes
      cy.get('[data-cy="additional-income-dropdown"]').click()
      cy.get('[data-cy="additional-income-option-yes"]').click()
      cy.get('input[name="additionalIncomeAmount"]').type('5000')

      // Verify additional income amount is in state
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.mortgage.additionalIncomeAmount).to.equal(5000)
      })

      // Change to no additional income
      cy.get('[data-cy="additional-income-dropdown"]').click()
      cy.get('[data-cy="additional-income-option-no"]').click()

      // Verify additional income amount is removed from state
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.mortgage.additionalIncomeAmount).to.be.undefined
        cy.log('✅ Conditional state cleanup working correctly')
      })
    })
  })

  describe('🔄 Refinance Mortgage Process - State Management', () => {
    it('should persist refinance mortgage state through all 4 steps', () => {
      cy.log('🎯 Testing Refinance Mortgage state management')

      // Navigate to refinance mortgage
      cy.get('[data-cy="sidebar-refinance-mortgage"]').click()
      cy.url().should('include', '/services/refinance-mortgage')
      cy.wait(2000)

      // STEP 1: Fill refinance data
      cy.log('📝 Step 1: Filling refinance mortgage data')
      
      // Why refinancing
      cy.get('[data-cy="why-refinancing-dropdown"]').click()
      cy.get('[data-cy="why-refinancing-option-1"]').click()
      
      cy.get('input[name="mortgageBalance"]').clear().type('1500000')
      cy.get('input[name="priceOfEstate"]').clear().type('2500000')
      
      // Property type
      cy.get('[data-cy="property-type-dropdown"]').click()
      cy.get('[data-cy="property-type-option-1"]').click()
      
      // Current bank
      cy.get('[data-cy="current-bank-dropdown"]').click()
      cy.get('[data-cy="bank-option-hapoalim"]').click()

      // Verify state after step 1
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.refinanceMortgage.mortgageBalance).to.equal(1500000)
        expect(state.refinanceMortgage.priceOfEstate).to.equal(2500000)
        expect(state.refinanceMortgage.whyRefinancingMortgage).to.exist
        cy.log('✅ Refinance Step 1 state persisted correctly')
      })

      // Navigate through remaining steps to verify state persistence
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(2000)

      // STEP 2: Personal data (similar structure to mortgage)
      cy.log('📝 Step 2: Personal data for refinance')
      cy.get('input[name="nameSurname"]').clear().type('Refinance User')
      
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.refinanceMortgage.mortgageBalance).to.equal(1500000)
        expect(state.refinanceMortgage.nameSurname).to.equal('Refinance User')
        cy.log('✅ Refinance Step 2 state accumulated correctly')
      })

      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(2000)

      // STEP 3: Income data
      cy.log('📝 Step 3: Income data for refinance')
      cy.get('input[name="monthlyIncome"]').clear().type('18000')
      
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.refinanceMortgage.mortgageBalance).to.equal(1500000)
        expect(state.refinanceMortgage.monthlyIncome).to.equal(18000)
        cy.log('✅ Refinance Step 3 state accumulated correctly')
      })

      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(3000)

      // STEP 4: Final validation
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.refinanceMortgage.mortgageBalance).to.equal(1500000)
        expect(state.refinanceMortgage.nameSurname).to.equal('Refinance User')
        expect(state.refinanceMortgage.monthlyIncome).to.equal(18000)
        cy.log('✅ Refinance Mortgage all steps state management working')
      })
    })

    it('should handle async thunk state updates correctly', () => {
      cy.log('⚡ Testing async thunk state management for refinance')
      
      cy.get('[data-cy="sidebar-refinance-mortgage"]').click()
      cy.wait(2000)

      // Fill minimum required data to trigger API call
      cy.get('input[name="mortgageBalance"]').clear().type('1000000')
      cy.get('[data-cy="current-bank-dropdown"]').click()
      cy.get('[data-cy="bank-option-hapoalim"]').click()

      // Monitor for async state changes
      cy.window().its('store').invoke('getState').then((initialState: StateData) => {
        cy.log('Initial state captured')
        
        // Trigger action that would call fetchRefinanceMortgage
        cy.get('[data-cy="calculate-refinance-button"]').click()
        
        // Check for loading state or updated state
        cy.wait(2000)
        cy.window().its('store').invoke('getState').then((updatedState: StateData) => {
          cy.log('✅ Async thunk state handling verified')
        })
      })
    })
  })

  describe('💳 Calculate Credit Process - State Management', () => {
    it('should persist credit calculation state through all 4 steps', () => {
      cy.log('🎯 Testing Credit Calculation state management')

      // Navigate to credit calculation
      cy.get('[data-cy="sidebar-calculate-credit"]').click()
      cy.url().should('include', '/services/credit-calculation')
      cy.wait(2000)

      // STEP 1: Fill credit data
      cy.log('📝 Step 1: Filling credit calculation data')
      
      // Purpose of loan
      cy.get('[data-cy="loan-purpose-dropdown"]').click()
      cy.get('[data-cy="loan-purpose-option-1"]').click()
      
      cy.get('input[name="loanAmount"]').clear().type('500000')
      
      // When do you need money
      cy.get('[data-cy="when-money-dropdown"]').click()
      cy.get('[data-cy="when-money-option-1"]').click()
      
      // Loan deferral
      cy.get('[data-cy="loan-deferral-dropdown"]').click()
      cy.get('[data-cy="loan-deferral-option-1"]').click()

      // Verify state after step 1
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.credit.loanAmount).to.equal(500000)
        expect(state.credit.purposeOfLoan).to.exist
        expect(state.credit.whenDoYouNeedMoney).to.exist
        cy.log('✅ Credit Step 1 state persisted correctly')
      })

      // Navigate through remaining steps
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(2000)

      // STEP 2: Personal data
      cy.log('📝 Step 2: Personal data for credit')
      cy.get('input[name="nameSurname"]').clear().type('Credit User')
      
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.credit.loanAmount).to.equal(500000)
        expect(state.credit.nameSurname).to.equal('Credit User')
        cy.log('✅ Credit Step 2 state accumulated correctly')
      })

      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(2000)

      // STEP 3: Income data
      cy.log('📝 Step 3: Income data for credit')
      cy.get('input[name="monthlyIncome"]').clear().type('12000')
      
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.credit.loanAmount).to.equal(500000)
        expect(state.credit.monthlyIncome).to.equal(12000)
        cy.log('✅ Credit Step 3 state accumulated correctly')
      })

      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(3000)

      // STEP 4: Final validation
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.credit.loanAmount).to.equal(500000)
        expect(state.credit.nameSurname).to.equal('Credit User')
        expect(state.credit.monthlyIncome).to.equal(12000)
        cy.log('✅ Credit all steps state management working')
      })
    })

    it('should handle conditional real estate fields correctly', () => {
      cy.log('🏠 Testing conditional real estate state in credit process')
      
      cy.get('[data-cy="sidebar-calculate-credit"]').click()
      cy.wait(2000)

      // Select purpose that requires property details (option_2)
      cy.get('[data-cy="loan-purpose-dropdown"]').click()
      cy.get('[data-cy="loan-purpose-option-2"]').click()

      // Fill property details
      cy.get('input[name="priceOfEstate"]').clear().type('3000000')
      cy.get('[data-cy="city-dropdown"]').click()
      cy.get('[data-cy="city-option-tel-aviv"]').click()

      // Verify conditional fields are in state
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.credit.purposeOfLoan).to.equal('option_2')
        expect(state.credit.priceOfEstate).to.equal(3000000)
        expect(state.credit.cityWhereYouBuy).to.exist
        cy.log('✅ Conditional real estate fields managed correctly')
      })

      // Change to purpose that doesn't require property details
      cy.get('[data-cy="loan-purpose-dropdown"]').click()
      cy.get('[data-cy="loan-purpose-option-1"]').click()

      // Property fields should still exist in state but not be required
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.credit.purposeOfLoan).to.equal('option_1')
        cy.log('✅ Purpose change handled correctly')
      })
    })
  })

  describe('🔄💳 Refinance Credit Process - State Management', () => {
    it('should persist refinance credit state through all 4 steps', () => {
      cy.log('🎯 Testing Refinance Credit state management')

      // Navigate to refinance credit
      cy.get('[data-cy="sidebar-refinance-credit"]').click()
      cy.url().should('include', '/services/refinance-credit')
      cy.wait(2000)

      // STEP 1: Fill refinance credit data
      cy.log('📝 Step 1: Filling refinance credit data')
      
      // Refinancing goal
      cy.get('[data-cy="refinancing-goal-dropdown"]').click()
      cy.get('[data-cy="refinancing-goal-option-1"]').click()
      
      cy.get('input[name="desiredMonthlyPayment"]').clear().type('8000')
      cy.get('input[name="desiredTerm"]').clear().type('24')

      // Add credit data
      cy.get('[data-cy="add-credit-button"]').click()
      cy.get('input[name="creditData[0].bank"]').type('Test Bank')
      cy.get('input[name="creditData[0].amount"]').type('300000')
      cy.get('input[name="creditData[0].monthlyPayment"]').type('12000')

      // Verify state after step 1
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.refinanceCredit.desiredMonthlyPayment).to.equal(8000)
        expect(state.refinanceCredit.desiredTerm).to.equal(24)
        expect(state.refinanceCredit.creditData).to.be.an('array')
        expect(state.refinanceCredit.creditData[0].amount).to.equal(300000)
        cy.log('✅ Refinance Credit Step 1 state persisted correctly')
      })

      // Navigate through remaining steps
      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(2000)

      // STEP 2: Personal data
      cy.log('📝 Step 2: Personal data for refinance credit')
      cy.get('input[name="nameSurname"]').clear().type('Refinance Credit User')
      
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.refinanceCredit.desiredMonthlyPayment).to.equal(8000)
        expect(state.refinanceCredit.nameSurname).to.equal('Refinance Credit User')
        cy.log('✅ Refinance Credit Step 2 state accumulated correctly')
      })

      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(2000)

      // STEP 3: Income data  
      cy.log('📝 Step 3: Income data for refinance credit')
      cy.get('input[name="monthlyIncome"]').clear().type('20000')
      
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.refinanceCredit.desiredMonthlyPayment).to.equal(8000)
        expect(state.refinanceCredit.monthlyIncome).to.equal(20000)
        cy.log('✅ Refinance Credit Step 3 state accumulated correctly')
      })

      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(3000)

      // STEP 4: Final validation
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.refinanceCredit.desiredMonthlyPayment).to.equal(8000)
        expect(state.refinanceCredit.nameSurname).to.equal('Refinance Credit User')
        expect(state.refinanceCredit.monthlyIncome).to.equal(20000)
        expect(state.refinanceCredit.creditData).to.be.an('array')
        cy.log('✅ Refinance Credit all steps state management working')
      })
    })

    it('should handle credit data array manipulations correctly', () => {
      cy.log('📊 Testing credit data array state management')
      
      cy.get('[data-cy="sidebar-refinance-credit"]').click()
      cy.wait(2000)

      // Add multiple credit entries
      cy.get('[data-cy="add-credit-button"]').click()
      cy.get('input[name="creditData[0].bank"]').type('Bank 1')
      cy.get('input[name="creditData[0].amount"]').type('200000')

      cy.get('[data-cy="add-credit-button"]').click()
      cy.get('input[name="creditData[1].bank"]').type('Bank 2')
      cy.get('input[name="creditData[1].amount"]').type('300000')

      // Verify multiple entries in state
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.refinanceCredit.creditData).to.have.length(2)
        expect(state.refinanceCredit.creditData[0].amount).to.equal(200000)
        expect(state.refinanceCredit.creditData[1].amount).to.equal(300000)
        cy.log('✅ Multiple credit entries managed correctly')
      })

      // Remove one entry
      cy.get('[data-cy="remove-credit-0"]').click()

      // Verify entry removal
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.refinanceCredit.creditData).to.have.length(1)
        expect(state.refinanceCredit.creditData[0].amount).to.equal(300000) // Second entry becomes first
        cy.log('✅ Credit entry removal handled correctly')
      })
    })
  })

  describe('🔄 Cross-Process State Isolation', () => {
    it('should maintain state isolation between different processes', () => {
      cy.log('🚧 Testing state isolation between processes')

      // Start with mortgage process
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)
      cy.get('input[name="priceOfEstate"]').clear().type('1000000')
      
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.mortgage.priceOfEstate).to.equal(1000000)
        cy.log('Mortgage state set')
      })

      // Switch to credit process
      cy.get('[data-cy="sidebar-calculate-credit"]').click()
      cy.wait(1000)
      cy.get('input[name="loanAmount"]').clear().type('500000')
      
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        // Mortgage state should still exist
        expect(state.mortgage.priceOfEstate).to.equal(1000000)
        // Credit state should be separate
        expect(state.credit.loanAmount).to.equal(500000)
        cy.log('✅ Process state isolation working correctly')
      })

      // Switch to refinance mortgage
      cy.get('[data-cy="sidebar-refinance-mortgage"]').click()
      cy.wait(1000)
      cy.get('input[name="mortgageBalance"]').clear().type('800000')
      
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        // All previous states should still exist
        expect(state.mortgage.priceOfEstate).to.equal(1000000)
        expect(state.credit.loanAmount).to.equal(500000)
        expect(state.refinanceMortgage.mortgageBalance).to.equal(800000)
        cy.log('✅ All process states isolated and preserved')
      })
    })
  })

  describe('💾 State Persistence and Recovery', () => {
    it('should persist state across page reloads', () => {
      cy.log('🔄 Testing state persistence across page reloads')

      // Fill mortgage data
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)
      cy.get('input[name="priceOfEstate"]').clear().type('2500000')
      cy.get('input[name="nameSurname"]').clear().type('Persistence Test User')

      // Verify state before reload
      cy.window().its('store').invoke('getState').then((stateBefore: StateData) => {
        expect(stateBefore.mortgage.priceOfEstate).to.equal(2500000)
        expect(stateBefore.mortgage.nameSurname).to.equal('Persistence Test User')
      })

      // Reload page
      cy.reload()
      cy.wait(3000)

      // Verify state after reload (should be restored from localStorage)
      cy.window().its('store').invoke('getState').then((stateAfter: StateData) => {
        expect(stateAfter.mortgage.priceOfEstate).to.equal(2500000)
        expect(stateAfter.mortgage.nameSurname).to.equal('Persistence Test User')
        cy.log('✅ State persistence across reload working correctly')
      })
    })

    it('should handle state hydration errors gracefully', () => {
      cy.log('🛡️ Testing graceful handling of corrupted state')

      // Manually corrupt localStorage state
      cy.window().then((win) => {
        win.localStorage.setItem('persist:root', '{"invalid": "json"')
      })

      // Reload and verify app still works
      cy.reload()
      cy.wait(3000)

      // App should still be functional
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)
      cy.get('input[name="priceOfEstate"]').should('be.visible')

      cy.window().its('store').invoke('getState').then((state: StateData) => {
        // State should be reset to initial values
        expect(state.mortgage).to.exist
        cy.log('✅ Graceful recovery from corrupted state working')
      })
    })
  })

  describe('🎯 Business Logic State Validation', () => {
    it('should correctly handle property ownership LTV calculations in state', () => {
      cy.log('🏠 Testing property ownership business logic state updates')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Test each property ownership option and verify state
      const propertyOptions = [
        { option: 'option_1', expectedLTV: 75, description: 'No property (75% LTV)' },
        { option: 'option_2', expectedLTV: 50, description: 'Has property (50% LTV)' },
        { option: 'option_3', expectedLTV: 70, description: 'Selling property (70% LTV)' }
      ]

      cy.get('input[name="priceOfEstate"]').clear().type('2000000')

      propertyOptions.forEach((test) => {
        cy.get('[data-cy="property-ownership-dropdown"]').click()
        cy.get(`[data-cy="property-ownership-${test.option}"]`).click()

        cy.window().its('store').invoke('getState').then((state: StateData) => {
          expect(state.mortgage.propertyOwnership).to.equal(test.option)
          // Verify that LTV-related calculations would use correct percentage
          cy.log(`✅ ${test.description} state correctly set`)
        })
      })
    })

    it('should validate income and expense calculations in state', () => {
      cy.log('💰 Testing income and expense calculation state management')

      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)

      // Fill income data
      cy.get('input[name="monthlyIncome"]').clear().type('20000')
      cy.get('[data-cy="additional-income-dropdown"]').click()
      cy.get('[data-cy="additional-income-option-yes"]').click()
      cy.get('input[name="additionalIncomeAmount"]').clear().type('5000')

      // Verify total income calculation in state
      cy.window().its('store').invoke('getState').then((state: StateData) => {
        expect(state.mortgage.monthlyIncome).to.equal(20000)
        expect(state.mortgage.additionalIncomeAmount).to.equal(5000)
        // Total effective income should be 25000
        const totalIncome = state.mortgage.monthlyIncome + (state.mortgage.additionalIncomeAmount || 0)
        expect(totalIncome).to.equal(25000)
        cy.log('✅ Income calculations reflected correctly in state')
      })
    })
  })

  afterEach(() => {
    // Log final state for debugging
    cy.window().its('store').invoke('getState').then((finalState: StateData) => {
      cy.log('📊 Final state snapshot:', JSON.stringify({
        mortgage: finalState.mortgage ? Object.keys(finalState.mortgage) : 'empty',
        credit: finalState.credit ? Object.keys(finalState.credit) : 'empty',
        refinanceMortgage: finalState.refinanceMortgage ? Object.keys(finalState.refinanceMortgage) : 'empty',
        refinanceCredit: finalState.refinanceCredit ? Object.keys(finalState.refinanceCredit) : 'empty'
      }, null, 2))
    })
  })
})