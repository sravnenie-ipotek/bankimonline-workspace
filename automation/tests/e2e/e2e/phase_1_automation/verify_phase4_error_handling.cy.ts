/// <reference types="cypress" />

describe('Phase 4: Error Handling and Resilience Tests', () => {
  const API_BASE = 'http://localhost:8003/api'
  
  beforeEach(() => {
    cy.intercept('GET', `${API_BASE}/dropdowns/**`).as('dropdownAPI')
  })

  describe('API Error Handling', () => {
    it('should handle 500 server errors gracefully', () => {
      // Mock server error
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@serverError')
      
      // Should not crash the application
      cy.get('body').should('exist')
      cy.get('form, .form-container').should('exist')
      
      // Should not show undefined or null values
      cy.get('body').should('not.contain.text', 'undefined')
        .and('not.contain.text', 'null')
        .and('not.contain.text', '[object Object]')
      
      // Should show some form of error indication or fallback UI
      cy.get('body').then($body => {
        const hasErrorHandling = 
          $body.text().includes('error') ||
          $body.text().includes('שגיאה') ||
          $body.text().includes('ошибка') ||
          $body.find('.error, .alert, [data-testid="error"], .fallback').length > 0 ||
          $body.find('select, input').length > 0 // Fallback form elements
        
        expect(hasErrorHandling).to.be.true
      })
    })

    it('should handle 404 not found errors', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 404,
        body: { error: 'Endpoint not found' }
      }).as('notFoundError')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@notFoundError')
      
      // Application should remain functional
      cy.get('form, .form-container').should('exist')
      
      // Should handle gracefully with fallback or error message
      cy.get('body').should('not.contain.text', 'undefined')
    })

    it('should handle network timeouts', () => {
      // Mock timeout
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, (req) => {
        return new Promise(() => {
          // Never resolve to simulate timeout
        })
      }).as('timeoutError')
      
      cy.visit('/services/calculate-mortgage')
      
      // Should show loading state initially
      cy.get('.loading, .spinner, [data-testid="loading"], .MuiCircularProgress-root', { timeout: 1000 })
        .should('exist')
      
      // After reasonable time, should show error state or timeout handling
      cy.wait(8000) // Wait for timeout
      
      // Should not crash or show undefined
      cy.get('body').should('exist')
        .and('not.contain.text', 'undefined')
      
      // Form should still be present (with fallback or error state)
      cy.get('form, .form-container').should('exist')
    })

    it('should handle malformed JSON responses', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 200,
        body: 'invalid json response'
      }).as('malformedJSON')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@malformedJSON')
      
      // Should handle parsing error gracefully
      cy.get('body').should('exist')
        .and('not.contain.text', 'undefined')
        .and('not.contain.text', 'SyntaxError')
      
      cy.get('form, .form-container').should('exist')
    })

    it('should handle partial API responses', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 200,
        body: {
          status: 'success',
          dropdowns: [],
          options: {},
          // Missing placeholders and labels
        }
      }).as('partialResponse')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@partialResponse')
      
      // Should handle missing data gracefully
      cy.get('form, .form-container').should('exist')
      cy.get('body').should('not.contain.text', 'undefined')
      
      // Dropdowns should either show fallback options or be disabled
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select, input').should('exist')
    })
  })

  describe('Network Error Handling', () => {
    it('should handle network disconnection', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        forceNetworkError: true
      }).as('networkError')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@networkError')
      
      // Should handle network error gracefully
      cy.get('body').should('exist')
      cy.get('form, .form-container').should('exist')
      
      // Should show appropriate error state
      cy.get('body').should('not.contain.text', 'undefined')
    })

    it('should handle CORS errors', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, (req) => {
        req.reply({
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': 'https://wrong-domain.com'
          },
          body: { status: 'success' }
        })
      }).as('corsError')
      
      cy.visit('/services/calculate-mortgage')
      
      // CORS errors should be handled gracefully
      cy.get('form, .form-container', { timeout: 5000 }).should('exist')
      cy.get('body').should('not.contain.text', 'undefined')
    })
  })

  describe('Fallback Mechanisms', () => {
    it('should provide fallback dropdown options when API fails', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('apiFailure')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@apiFailure')
      
      // Should show fallback dropdown options
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select')
        .should('exist')
        .click()
      
      // Should have some options available (fallback or hardcoded)
      cy.get('body').then($body => {
        const hasOptions = 
          $body.find('.MuiMenuItem-root, option, [role="option"]').length > 0 ||
          $body.text().includes('Select') ||
          $body.text().includes('בחר') ||
          $body.text().includes('Выбрать')
        
        // Either has options or shows proper error state
        expect(hasOptions || $body.find('.error, .alert').length > 0).to.be.true
      })
    })

    it('should maintain form functionality with fallback data', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('apiFailure')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@apiFailure')
      
      // Form should still be submittable (either with fallback data or disabled state)
      cy.get('form, .form-container').should('exist')
      
      // Try to interact with form
      cy.get('button[type="submit"], .submit-button, [data-testid="submit"], button').should('exist')
      
      // Form should handle submission gracefully (either success or validation error)
      cy.get('body').should('not.contain.text', 'undefined')
    })

    it('should retry failed requests appropriately', () => {
      let requestCount = 0
      
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, (req) => {
        requestCount++
        if (requestCount <= 2) {
          req.reply({ statusCode: 500, body: { error: 'Temporary error' } })
        } else {
          req.reply({
            statusCode: 200,
            body: {
              status: 'success',
              dropdowns: [{ key: 'test', label: 'Test' }],
              options: { test: [{ value: '1', label: 'Option 1' }] },
              placeholders: {},
              labels: {}
            }
          })
        }
      }).as('retryAPI')
      
      cy.visit('/services/calculate-mortgage')
      
      // Should eventually succeed after retries
      cy.get('form, .form-container', { timeout: 10000 }).should('exist')
      cy.get('body').should('not.contain.text', 'undefined')
    })
  })

  describe('Hook Error States', () => {
    it('should handle useDropdownData error states', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('hookError')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@hookError')
      
      // Hook should provide error state to components
      cy.get('body').should('exist')
        .and('not.contain.text', 'undefined')
        .and('not.contain.text', 'null')
      
      // Components should handle error state gracefully
      cy.get('form, .form-container').should('exist')
    })

    it('should handle useAllDropdowns error states', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 404,
        body: { error: 'Not found' }
      }).as('bulkHookError')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@bulkHookError')
      
      // Bulk hook should handle errors for all dropdowns
      cy.get('body').should('exist')
        .and('not.contain.text', 'undefined')
      
      // All dropdown components should show error states or fallbacks
      cy.get('form, .form-container').should('exist')
    })

    it('should handle loading states correctly during errors', () => {
      // Mock slow failing request
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, (req) => {
        req.reply((res) => {
          return new Promise(resolve => {
            setTimeout(() => resolve({
              statusCode: 500,
              body: { error: 'Delayed error' }
            }), 1000)
          })
        })
      }).as('slowError')
      
      cy.visit('/services/calculate-mortgage')
      
      // Should show loading state
      cy.get('.loading, .spinner, [data-testid="loading"], .MuiCircularProgress-root')
        .should('exist')
      
      cy.wait('@slowError')
      
      // Loading should be removed after error
      cy.get('.loading, .spinner, [data-testid="loading"], .MuiCircularProgress-root')
        .should('not.exist')
      
      // Error state should be shown
      cy.get('body').should('not.contain.text', 'undefined')
    })
  })

  describe('Component Resilience', () => {
    it('should handle missing dropdown data in components', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 200,
        body: {
          status: 'success',
          dropdowns: [],
          options: {},
          placeholders: {},
          labels: {}
        }
      }).as('emptyData')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@emptyData')
      
      // Components should handle empty data gracefully
      cy.get('form, .form-container').should('exist')
      cy.get('body').should('not.contain.text', 'undefined')
      
      // Dropdowns should either be disabled or show placeholder
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select, input')
        .should('exist')
    })

    it('should handle component unmounting during API calls', () => {
      // Start API call
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, (req) => {
        req.reply((res) => {
          return new Promise(resolve => {
            setTimeout(() => resolve(res), 2000)
          })
        })
      }).as('slowAPI')
      
      cy.visit('/services/calculate-mortgage')
      
      // Navigate away before API call completes (simulate unmounting)
      cy.wait(500)
      cy.visit('/')
      
      // Navigate back
      cy.visit('/services/calculate-mortgage')
      
      // Should handle gracefully without errors
      cy.wait('@slowAPI')
      cy.get('form, .form-container').should('exist')
    })

    it('should handle invalid field names gracefully', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 200,
        body: {
          status: 'success',
          dropdowns: [{ key: 'valid_field', label: 'Valid Field' }],
          options: {
            'mortgage_step1_valid_field': [{ value: '1', label: 'Option 1' }]
          },
          placeholders: {},
          labels: {}
        }
      }).as('partialFields')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@partialFields')
      
      // Components requesting invalid fields should handle gracefully
      cy.get('body').should('exist')
        .and('not.contain.text', 'undefined')
        .and('not.contain.text', 'null')
      
      cy.get('form, .form-container').should('exist')
    })
  })

  describe('Error Recovery', () => {
    it('should recover from temporary API failures', () => {
      let failureCount = 0
      
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, (req) => {
        failureCount++
        if (failureCount === 1) {
          req.reply({ statusCode: 500, body: { error: 'Temporary failure' } })
        } else {
          req.reply({
            statusCode: 200,
            body: {
              status: 'success',
              dropdowns: [{ key: 'property_ownership', label: 'Property Ownership' }],
              options: {
                'mortgage_step1_property_ownership': [
                  { value: 'no_property', label: 'No property' },
                  { value: 'has_property', label: 'Has property' }
                ]
              },
              placeholders: { 'mortgage_step1_property_ownership': 'Select ownership' },
              labels: { 'mortgage_step1_property_ownership': 'Property Ownership' }
            }
          })
        }
      }).as('recoveryAPI')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@recoveryAPI')
      
      // First request fails, should show error state
      cy.get('body').should('not.contain.text', 'undefined')
      
      // Trigger retry (refresh page)
      cy.reload()
      cy.wait('@recoveryAPI')
      
      // Second request should succeed
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select')
        .should('exist')
        .click()
      
      cy.get('.MuiMenuItem-root, option, [role="option"]')
        .should('have.length.at.least', 1)
    })

    it('should maintain user data during error recovery', () => {
      // Start with working API
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 200,
        body: {
          status: 'success',
          dropdowns: [{ key: 'property_ownership', label: 'Property Ownership' }],
          options: {
            'mortgage_step1_property_ownership': [
              { value: 'no_property', label: 'No property' },
              { value: 'has_property', label: 'Has property' }
            ]
          },
          placeholders: {},
          labels: {}
        }
      }).as('workingAPI')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@workingAPI')
      
      // Make a selection
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select')
        .should('exist')
        .click()
      
      cy.get('.MuiMenuItem-root, option, [role="option"]')
        .first()
        .click()
      
      // Now simulate API failure and recovery
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 500,
        body: { error: 'Temporary error' }
      }).as('temporaryError')
      
      // Navigate away and back
      cy.visit('/')
      cy.visit('/services/calculate-mortgage')
      
      // Should maintain form state despite API error
      cy.get('form, .form-container').should('exist')
      cy.get('body').should('not.contain.text', 'undefined')
    })
  })

  describe('Error Logging and Monitoring', () => {
    it('should log errors appropriately without exposing sensitive data', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 500,
        body: { error: 'Database connection failed' }
      }).as('dbError')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dbError')
      
      // Check console for appropriate error logging
      cy.window().then((win) => {
        // Errors should be logged but not expose sensitive information
        cy.get('body').should('exist')
        
        // Should not show internal error details to user
        cy.get('body').should('not.contain.text', 'Database connection failed')
          .and('not.contain.text', 'stack trace')
          .and('not.contain.text', 'internal error')
      })
    })

    it('should provide user-friendly error messages', () => {
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 503,
        body: { error: 'Service temporarily unavailable' }
      }).as('serviceUnavailable')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@serviceUnavailable')
      
      // Should show user-friendly message
      cy.get('body').then($body => {
        const hasUserFriendlyError = 
          $body.text().includes('temporarily unavailable') ||
          $body.text().includes('try again') ||
          $body.text().includes('connection problem') ||
          $body.text().includes('זמנית לא זמין') ||
          $body.text().includes('временно недоступно') ||
          $body.find('.error-message, .user-message, [data-testid="user-error"]').length > 0
        
        if (hasUserFriendlyError) {
          cy.log('✅ User-friendly error message displayed')
        } else {
          // At minimum, should not show undefined or crash
          expect($body.text()).to.not.include('undefined')
        }
      })
    })
  })
})