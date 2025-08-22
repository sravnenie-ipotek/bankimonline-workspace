/**
 * State Management Test Runner
 * Executes comprehensive state management tests for all 4 processes
 * Provides centralized reporting and performance metrics
 */

describe('🚀 State Management Test Suite Runner', () => {
  let testResults: any = {}
  let performanceMetrics: any = {}

  before(() => {
    cy.log('🎯 Starting comprehensive state management test suite')
    cy.log('Testing 4 processes: Mortgage, Refinance Mortgage, Credit, Refinance Credit')
  })

  beforeEach(() => {
    cy.visit('/')
    cy.viewport(1920, 1080)
    cy.get('[data-cy="app-ready"]', { timeout: 10000 }).should('exist')
    cy.wait(1000)
  })

  describe('📊 Process-Specific State Management Tests', () => {
    const processes = [
      {
        name: 'Calculate Mortgage',
        nav: '[data-cy="sidebar-calculate-mortgage"]',
        url: '/services/mortgage-calculation',
        slice: 'mortgage',
        testData: {
          step1: { priceOfEstate: 2000000, propertyOwnership: 'option_1' },
          step2: { nameSurname: 'Test Mortgage User', education: 'bachelors' },
          step3: { monthlyIncome: 20000, mainSourceOfIncome: 'salary' },
          step4: { expectedBankOffers: true }
        }
      },
      {
        name: 'Refinance Mortgage', 
        nav: '[data-cy="sidebar-refinance-mortgage"]',
        url: '/services/refinance-mortgage',
        slice: 'refinanceMortgage',
        testData: {
          step1: { mortgageBalance: 1500000, priceOfEstate: 2200000 },
          step2: { nameSurname: 'Test Refinance User', education: 'masters' },
          step3: { monthlyIncome: 25000, mainSourceOfIncome: 'salary' },
          step4: { expectedCalculations: true }
        }
      },
      {
        name: 'Calculate Credit',
        nav: '[data-cy="sidebar-calculate-credit"]',
        url: '/services/credit-calculation', 
        slice: 'credit',
        testData: {
          step1: { loanAmount: 500000, purposeOfLoan: 'option_1' },
          step2: { nameSurname: 'Test Credit User', education: 'bachelors' },
          step3: { monthlyIncome: 15000, mainSourceOfIncome: 'salary' },
          step4: { expectedPrograms: true }
        }
      },
      {
        name: 'Refinance Credit',
        nav: '[data-cy="sidebar-refinance-credit"]',
        url: '/services/refinance-credit',
        slice: 'refinanceCredit', 
        testData: {
          step1: { desiredMonthlyPayment: 8000, refinancingCredit: 'option_1' },
          step2: { nameSurname: 'Test Refinance Credit User', education: 'masters' },
          step3: { monthlyIncome: 22000, mainSourceOfIncome: 'salary' },
          step4: { expectedSavings: true }
        }
      }
    ]

    processes.forEach((process) => {
      it(`should manage ${process.name} state correctly through all 4 steps`, () => {
        const startTime = performance.now()
        
        cy.log(`🎯 Testing ${process.name} state management`)
        
        // Navigate to process
        cy.get(process.nav).click()
        cy.url().should('include', process.url)
        cy.wait(2000)

        // Test Step 1
        cy.log(`📝 ${process.name} - Step 1`)
        Object.entries(process.testData.step1).forEach(([field, value]) => {
          if (typeof value === 'string' && field.includes('option')) {
            // Handle dropdown selections
            const dropdownField = field.replace(/([A-Z])/g, '-$1').toLowerCase()
            cy.get(`[data-cy="${dropdownField}-dropdown"]`).click()
            cy.get(`[data-cy="${dropdownField}-${value}"]`).click()
          } else if (typeof value === 'number') {
            // Handle numeric inputs
            cy.get(`input[name="${field}"]`).clear().type(value.toString())
          }
        })

        // Verify Step 1 state
        cy.window().its('store').invoke('getState').then((state: any) => {
          Object.entries(process.testData.step1).forEach(([field, value]) => {
            if (typeof value === 'number') {
              expect(state[process.slice][field]).to.equal(value)
            } else {
              expect(state[process.slice][field]).to.exist
            }
          })
          cy.log(`✅ ${process.name} - Step 1 state verified`)
        })

        // Navigate to Step 2
        cy.get('[data-cy="next-step-button"]').click()
        cy.wait(1500)

        // Test Step 2
        cy.log(`📝 ${process.name} - Step 2`)
        cy.get('input[name="nameSurname"]').clear().type(process.testData.step2.nameSurname)
        
        if (process.testData.step2.education) {
          cy.get('[data-cy="education-dropdown"]').click()
          cy.get(`[data-cy="education-option-${process.testData.step2.education}"]`).click()
        }

        // Verify Step 2 state accumulation
        cy.window().its('store').invoke('getState').then((state: any) => {
          // Step 1 data should still exist
          const step1Keys = Object.keys(process.testData.step1)
          step1Keys.forEach((key) => {
            expect(state[process.slice][key]).to.exist
          })
          
          // Step 2 data should be added
          expect(state[process.slice].nameSurname).to.equal(process.testData.step2.nameSurname)
          cy.log(`✅ ${process.name} - Step 2 state accumulated`)
        })

        // Navigate to Step 3
        cy.get('[data-cy="next-step-button"]').click()
        cy.wait(1500)

        // Test Step 3
        cy.log(`📝 ${process.name} - Step 3`)
        cy.get('input[name="monthlyIncome"]').clear().type(process.testData.step3.monthlyIncome.toString())
        
        cy.get('[data-cy="main-income-dropdown"]').click()
        cy.get(`[data-cy="main-income-option-${process.testData.step3.mainSourceOfIncome}"]`).click()

        // Verify Step 3 state accumulation
        cy.window().its('store').invoke('getState').then((state: any) => {
          // All previous data should exist
          expect(state[process.slice].nameSurname).to.equal(process.testData.step2.nameSurname)
          expect(state[process.slice].monthlyIncome).to.equal(process.testData.step3.monthlyIncome)
          cy.log(`✅ ${process.name} - Step 3 state accumulated`)
        })

        // Navigate to Step 4
        cy.get('[data-cy="next-step-button"]').click()
        cy.wait(3000)

        // Test Step 4 - Final validation
        cy.log(`📝 ${process.name} - Step 4`)
        cy.window().its('store').invoke('getState').then((state: any) => {
          // Comprehensive final state validation
          const step1Keys = Object.keys(process.testData.step1)
          step1Keys.forEach((key) => {
            if (typeof process.testData.step1[key] === 'number') {
              expect(state[process.slice][key]).to.equal(process.testData.step1[key])
            } else {
              expect(state[process.slice][key]).to.exist
            }
          })
          
          expect(state[process.slice].nameSurname).to.equal(process.testData.step2.nameSurname)
          expect(state[process.slice].monthlyIncome).to.equal(process.testData.step3.monthlyIncome)
          
          const endTime = performance.now()
          const testDuration = endTime - startTime
          
          testResults[process.name] = {
            passed: true,
            duration: testDuration,
            stateSize: JSON.stringify(state[process.slice]).length
          }
          
          cy.log(`✅ ${process.name} - All 4 steps completed successfully`)
          cy.log(`⏱️ Test duration: ${testDuration.toFixed(2)}ms`)
        })
      })
    })
  })

  describe('🔄 Cross-Process State Isolation Tests', () => {
    it('should maintain state isolation between all 4 processes', () => {
      cy.log('🚧 Testing comprehensive state isolation')

      const isolationTestData = [
        { nav: '[data-cy="sidebar-calculate-mortgage"]', field: 'priceOfEstate', value: 1500000, slice: 'mortgage' },
        { nav: '[data-cy="sidebar-refinance-mortgage"]', field: 'mortgageBalance', value: 1200000, slice: 'refinanceMortgage' },
        { nav: '[data-cy="sidebar-calculate-credit"]', field: 'loanAmount', value: 400000, slice: 'credit' },
        { nav: '[data-cy="sidebar-refinance-credit"]', field: 'desiredMonthlyPayment', value: 6000, slice: 'refinanceCredit' }
      ]

      // Fill data for each process
      isolationTestData.forEach((test, index) => {
        cy.log(`Setting data for process ${index + 1}: ${test.slice}`)
        cy.get(test.nav).click()
        cy.wait(1000)
        cy.get(`input[name="${test.field}"]`).clear().type(test.value.toString())
      })

      // Verify all process states are isolated and preserved
      cy.window().its('store').invoke('getState').then((state: any) => {
        isolationTestData.forEach((test) => {
          expect(state[test.slice][test.field]).to.equal(test.value)
          cy.log(`✓ ${test.slice}: ${test.field} = ${test.value}`)
        })
        
        cy.log('✅ All 4 processes maintain state isolation')
      })
    })
  })

  describe('💾 Advanced Persistence Tests', () => {
    it('should handle complex persistence scenarios', () => {
      cy.log('🔄 Testing complex persistence scenarios')

      // Fill comprehensive data across multiple processes
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(1000)
      cy.get('input[name="priceOfEstate"]').clear().type('2500000')

      cy.get('[data-cy="next-step-button"]').click()
      cy.wait(1000)
      cy.get('input[name="nameSurname"]').clear().type('Persistence Test User')

      cy.get('[data-cy="sidebar-calculate-credit"]').click()
      cy.wait(1000)
      cy.get('input[name="loanAmount"]').clear().type('750000')

      // Capture state before persistence test
      cy.window().its('store').invoke('getState').then((stateBefore: any) => {
        expect(stateBefore.mortgage.priceOfEstate).to.equal(2500000)
        expect(stateBefore.mortgage.nameSurname).to.equal('Persistence Test User')
        expect(stateBefore.credit.loanAmount).to.equal(750000)

        // Simulate session interruption
        cy.reload()
        cy.wait(3000)

        // Verify state restoration
        cy.window().its('store').invoke('getState').then((stateAfter: any) => {
          expect(stateAfter.mortgage.priceOfEstate).to.equal(2500000)
          expect(stateAfter.mortgage.nameSurname).to.equal('Persistence Test User')
          expect(stateAfter.credit.loanAmount).to.equal(750000)
          
          cy.log('✅ Complex persistence scenario verified')
        })
      })
    })
  })

  describe('⚡ Performance Benchmarks', () => {
    it('should meet performance benchmarks for state operations', () => {
      cy.log('🏃‍♂️ Running performance benchmarks')

      const benchmarks = {
        stateAccess: { limit: 50, actual: 0 },
        stateUpdate: { limit: 100, actual: 0 },
        processSwitch: { limit: 200, actual: 0 }
      }

      // Test state access performance
      const accessStart = performance.now()
      cy.window().its('store').invoke('getState').then(() => {
        benchmarks.stateAccess.actual = performance.now() - accessStart
        expect(benchmarks.stateAccess.actual).to.be.lessThan(benchmarks.stateAccess.limit)
        cy.log(`✅ State access: ${benchmarks.stateAccess.actual.toFixed(2)}ms (limit: ${benchmarks.stateAccess.limit}ms)`)
      })

      // Test state update performance
      cy.get('[data-cy="sidebar-calculate-mortgage"]').click()
      cy.wait(500)
      
      const updateStart = performance.now()
      cy.get('input[name="priceOfEstate"]').clear().type('2000000')
      
      cy.window().its('store').invoke('getState').then(() => {
        benchmarks.stateUpdate.actual = performance.now() - updateStart
        expect(benchmarks.stateUpdate.actual).to.be.lessThan(benchmarks.stateUpdate.limit)
        cy.log(`✅ State update: ${benchmarks.stateUpdate.actual.toFixed(2)}ms (limit: ${benchmarks.stateUpdate.limit}ms)`)
      })

      // Test process switch performance
      const switchStart = performance.now()
      cy.get('[data-cy="sidebar-calculate-credit"]').click()
      cy.wait(100)
      
      cy.window().its('store').invoke('getState').then(() => {
        benchmarks.processSwitch.actual = performance.now() - switchStart
        expect(benchmarks.processSwitch.actual).to.be.lessThan(benchmarks.processSwitch.limit)
        cy.log(`✅ Process switch: ${benchmarks.processSwitch.actual.toFixed(2)}ms (limit: ${benchmarks.processSwitch.limit}ms)`)
        
        // Store performance metrics
        performanceMetrics = benchmarks
      })
    })
  })

  after(() => {
    // Generate comprehensive test report
    cy.log('📊 State Management Test Suite Complete')
    cy.log('=' .repeat(50))
    
    Object.entries(testResults).forEach(([processName, result]: [string, any]) => {
      cy.log(`${processName}:`)
      cy.log(`  Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
      cy.log(`  Duration: ${result.duration.toFixed(2)}ms`)
      cy.log(`  State Size: ${result.stateSize} characters`)
    })

    if (Object.keys(performanceMetrics).length > 0) {
      cy.log('\n🏃‍♂️ Performance Metrics:')
      Object.entries(performanceMetrics).forEach(([metric, data]: [string, any]) => {
        const status = data.actual < data.limit ? '✅' : '❌'
        cy.log(`  ${metric}: ${data.actual.toFixed(2)}ms ${status} (limit: ${data.limit}ms)`)
      })
    }

    cy.log('=' .repeat(50))
    cy.log('🎯 State management testing completed successfully!')
  })
})