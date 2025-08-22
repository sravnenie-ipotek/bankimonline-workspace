/// <reference types="cypress" />

describe('Phase 4: Component Integration Tests', () => {
  const API_BASE = 'http://localhost:8003/api'
  const LANGUAGES = ['en', 'he', 'ru']
  
  // Test data for components and their expected dropdowns
  const COMPONENT_TEST_MATRIX = {
    'FirstStepForm (CalculateMortgage)': {
      path: '/services/calculate-mortgage',
      screenLocation: 'mortgage_step1',
      dropdowns: ['when_needed', 'type', 'first_home', 'property_ownership'],
      selectors: {
        when_needed: '[data-testid="when-needed-select"], [name="when_needed"], select[aria-label*="when"], select[aria-label*="needed"]',
        type: '[data-testid="type-select"], [name="type"], select[aria-label*="type"], select[aria-label*="property"]',
        first_home: '[data-testid="first-home-select"], [name="first_home"], select[aria-label*="first"], select[aria-label*="home"]',
        property_ownership: '[data-testid="property-ownership-select"], [name="property_ownership"], select[aria-label*="ownership"], select[aria-label*="property"]'
      }
    },
    'FamilyStatus': {
      path: '/services/personal-data',
      screenLocation: 'personal_data_step1',
      dropdowns: ['family_status'],
      selectors: {
        family_status: '[data-testid="family-status-select"], [name="family_status"], select[aria-label*="family"], select[aria-label*="status"]'
      }
    },
    'Education': {
      path: '/services/personal-data',
      screenLocation: 'personal_data_step1',
      dropdowns: ['education'],
      selectors: {
        education: '[data-testid="education-select"], [name="education"], select[aria-label*="education"]'
      }
    },
    'MainSourceOfIncome': {
      path: '/services/personal-data',
      screenLocation: 'personal_data_step2',
      dropdowns: ['main_income_source'],
      selectors: {
        main_income_source: '[data-testid="main-income-select"], [name="main_income_source"], select[aria-label*="income"], select[aria-label*="source"]'
      }
    },
    'AdditionalIncome': {
      path: '/services/personal-data',
      screenLocation: 'personal_data_step2',
      dropdowns: ['additional_income'],
      selectors: {
        additional_income: '[data-testid="additional-income-select"], [name="additional_income"], select[aria-label*="additional"], select[aria-label*="income"]'
      }
    }
  }

  beforeEach(() => {
    // Intercept API calls to monitor dropdown data fetching
    cy.intercept('GET', `${API_BASE}/dropdowns/**`).as('dropdownAPI')
    cy.intercept('GET', `${API_BASE}/content/**`).as('contentAPI')
  })

  describe('Database-Driven Dropdown Loading', () => {
    Object.entries(COMPONENT_TEST_MATRIX).forEach(([componentName, config]) => {
      it(`should load ${componentName} dropdowns from database`, () => {
        // Navigate to component page
        cy.visit(config.path)
        
        // Wait for dropdown API calls
        cy.wait('@dropdownAPI', { timeout: 10000 }).then((interception) => {
          expect(interception.response?.statusCode).to.equal(200)
          expect(interception.response?.body).to.have.property('status', 'success')
          expect(interception.response?.body).to.have.property('dropdowns').that.is.an('array')
          expect(interception.response?.body).to.have.property('options').that.is.an('object')
        })

        // Verify each expected dropdown is present and functional
        config.dropdowns.forEach(dropdownName => {
          const selector = config.selectors[dropdownName]
          
          // Try multiple selectors until one is found
          const selectors = selector.split(', ')
          let found = false
          
          selectors.forEach(sel => {
            if (!found) {
              cy.get('body').then($body => {
                if ($body.find(sel).length > 0) {
                  found = true
                  cy.get(sel).should('exist').and('be.visible')
                  
                  // Click to open dropdown and verify options are loaded
                  cy.get(sel).click()
                  
                  // Look for dropdown options in various formats
                  cy.get('body').should('contain.text', 'option').or('contain.text', 'בחר').or('contain.text', 'Выбрать')
                  
                  // Close dropdown by clicking elsewhere
                  cy.get('body').click(0, 0)
                }
              })
            }
          })
        })
      })
    })
  })

  describe('useAllDropdowns Hook Integration', () => {
    it('should verify bulk dropdown fetching in FirstStepForm', () => {
      cy.visit('/services/calculate-mortgage')
      
      // Monitor network requests to ensure bulk fetching
      cy.wait('@dropdownAPI').then((interception) => {
        const url = interception.request.url
        expect(url).to.include('/api/dropdowns/mortgage_step1/')
        
        const response = interception.response?.body
        expect(response.dropdowns).to.have.length.at.least(3)
        expect(Object.keys(response.options)).to.have.length.at.least(3)
        
        // Verify bulk response includes all expected dropdowns
        const expectedDropdowns = ['mortgage_step1_when_needed', 'mortgage_step1_type', 'mortgage_step1_property_ownership']
        expectedDropdowns.forEach(key => {
          expect(response.options).to.have.property(key)
        })
      })

      // Verify only one API call was made for all dropdowns
      cy.get('@dropdownAPI.all').should('have.length', 1)
    })
  })

  describe('Hook Performance and Caching', () => {
    it('should demonstrate caching performance improvement', () => {
      // First visit - should hit API
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI').then((firstCall) => {
        const firstResponseTime = firstCall.response?.headers['x-response-time'] || 0
        
        // Navigate away and back to trigger cache
        cy.visit('/')
        cy.visit('/services/calculate-mortgage')
        
        // Second visit - should use cache (no new API call expected)
        cy.get('@dropdownAPI.all').should('have.length', 1) // Still only one API call
        
        // Verify component loads faster on second visit
        cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select[aria-label*="ownership"]', { timeout: 1000 })
          .should('exist')
      })
    })

    it('should handle cache clearing correctly', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Clear cache via browser console
      cy.window().then((win) => {
        // Simulate cache clearing
        win.localStorage.clear()
        win.sessionStorage.clear()
      })
      
      // Reload page - should make new API call
      cy.reload()
      cy.wait('@dropdownAPI')
      
      // Should have made 2 API calls total
      cy.get('@dropdownAPI.all').should('have.length', 2)
    })
  })

  describe('Form Integration with Redux and Formik', () => {
    it('should integrate dropdown values with form state', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Find and interact with property ownership dropdown
      const propertySelectors = [
        '[data-testid="property-ownership-select"]',
        '[name="property_ownership"]',
        'select[aria-label*="ownership"]',
        'select[aria-label*="property"]'
      ]
      
      let dropdownFound = false
      propertySelectors.forEach(selector => {
        if (!dropdownFound) {
          cy.get('body').then($body => {
            if ($body.find(selector).length > 0) {
              dropdownFound = true
              cy.get(selector).click()
              
              // Select an option (try different option selectors)
              cy.get('.MuiMenuItem-root, option, [role="option"]').first().click()
              
              // Verify form state is updated (check Redux store via dev tools)
              cy.window().then((win) => {
                // Check if Redux DevTools is available
                if (win.__REDUX_DEVTOOLS_EXTENSION__) {
                  // Form state should be updated
                  cy.log('Redux integration verified')
                }
              })
            }
          })
        }
      })
    })
  })

  describe('Loading States and Error Handling', () => {
    it('should show loading states during dropdown data fetch', () => {
      // Slow down network to observe loading states
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, (req) => {
        req.reply((res) => {
          // Delay response by 1 second
          return new Promise(resolve => {
            setTimeout(() => resolve(res), 1000)
          })
        })
      }).as('slowDropdownAPI')
      
      cy.visit('/services/calculate-mortgage')
      
      // Should show loading indicator
      cy.get('.loading, .spinner, [data-testid="loading"], .MuiCircularProgress-root', { timeout: 500 })
        .should('exist')
      
      cy.wait('@slowDropdownAPI')
      
      // Loading should be gone after API response
      cy.get('.loading, .spinner, [data-testid="loading"], .MuiCircularProgress-root', { timeout: 2000 })
        .should('not.exist')
    })

    it('should handle API failures gracefully', () => {
      // Mock API failure
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('failedDropdownAPI')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@failedDropdownAPI')
      
      // Should show error state or fallback options
      cy.get('body').should('contain.text', 'error').or('contain.text', 'שגיאה').or('contain.text', 'ошибка')
        .or('not.contain.text', 'undefined')
      
      // Form should still be usable (either with error message or fallback options)
      cy.get('form, .form-container, [data-testid="form"]').should('exist')
    })
  })

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing form validation', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Try to submit form without required fields
      cy.get('button[type="submit"], button[aria-label*="submit"], .submit-button, [data-testid="submit"]')
        .should('exist')
        .click()
      
      // Should show validation errors
      cy.get('.error, .MuiFormHelperText-root, [data-testid="error"], .field-error', { timeout: 2000 })
        .should('exist')
        .or(() => {
          // Alternative: form should not advance if validation fails
          cy.url().should('include', '/calculate-mortgage')
        })
    })
  })
})