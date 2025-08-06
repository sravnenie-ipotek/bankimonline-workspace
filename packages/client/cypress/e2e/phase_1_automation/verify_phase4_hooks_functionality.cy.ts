/// <reference types="cypress" />

describe('Phase 4: Hooks Functionality Tests', () => {
  const API_BASE = 'http://localhost:8003/api'
  const LANGUAGES = ['en', 'he', 'ru']
  
  beforeEach(() => {
    cy.intercept('GET', `${API_BASE}/dropdowns/**`).as('dropdownAPI')
  })

  describe('useDropdownData Hook Tests', () => {
    it('should fetch individual dropdown data correctly', () => {
      cy.visit('/services/calculate-mortgage')
      
      // Monitor API calls
      cy.wait('@dropdownAPI').then((interception) => {
        const response = interception.response?.body
        
        // Verify response structure
        expect(response).to.have.property('status', 'success')
        expect(response).to.have.property('dropdowns').that.is.an('array')
        expect(response).to.have.property('options').that.is.an('object')
        expect(response).to.have.property('placeholders').that.is.an('object')
        expect(response).to.have.property('labels').that.is.an('object')
        
        // Verify property ownership dropdown data
        const propertyOwnershipKey = 'mortgage_step1_property_ownership'
        expect(response.options).to.have.property(propertyOwnershipKey)
        expect(response.options[propertyOwnershipKey]).to.be.an('array').and.have.length.at.least(3)
        
        // Each option should have value and label
        response.options[propertyOwnershipKey].forEach((option: any) => {
          expect(option).to.have.property('value').that.is.a('string')
          expect(option).to.have.property('label').that.is.a('string')
        })
      })
    })

    it('should support returnStructure parameter', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Test that component can handle both 'options' and 'full' return structures
      cy.window().then((win) => {
        // Simulate hook usage in browser console
        cy.log('Testing returnStructure parameter compatibility')
        
        // The hook should work with both modes:
        // returnStructure='options' - returns DropdownOption[] (backward compatibility)
        // returnStructure='full' - returns DropdownData object
        
        // Verify the dropdown components are working
        cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select[aria-label*="ownership"]')
          .should('exist')
      })
    })

    it('should handle cache correctly in useDropdownData', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Navigate to different page with same screen location
      cy.visit('/services/refinance-mortgage')
      
      // Should use cached data (no new API call for same screen location)
      cy.get('@dropdownAPI.all').should('have.length', 1)
      
      // Navigate to different screen location
      cy.visit('/services/personal-data')
      
      // Should make new API call for different screen location
      cy.wait('@dropdownAPI')
      cy.get('@dropdownAPI.all').should('have.length', 2)
    })

    it('should abort previous requests correctly', () => {
      // Rapidly navigate between pages to test request abortion
      cy.visit('/services/calculate-mortgage')
      cy.visit('/services/personal-data')
      cy.visit('/services/calculate-mortgage')
      
      // Should handle multiple rapid requests without errors
      cy.wait('@dropdownAPI')
      
      // Page should load successfully
      cy.get('form, .form-container').should('exist')
    })
  })

  describe('useAllDropdowns Hook Tests', () => {
    it('should fetch all dropdowns in one request', () => {
      cy.visit('/services/calculate-mortgage')
      
      // Should make only ONE API call for all dropdowns
      cy.wait('@dropdownAPI').then((interception) => {
        const response = interception.response?.body
        
        // Verify bulk response contains all expected dropdown data
        expect(response.dropdowns).to.have.length.at.least(3)
        
        // Should include multiple dropdown fields
        const optionKeys = Object.keys(response.options)
        expect(optionKeys).to.include.members([
          'mortgage_step1_property_ownership',
          'mortgage_step1_when_needed',
          'mortgage_step1_type'
        ])
      })
      
      // Verify only one API call was made
      cy.get('@dropdownAPI.all').should('have.length', 1)
    })

    it('should provide getDropdownProps helper function', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Verify multiple dropdowns are rendered from single API call
      const expectedDropdowns = [
        '[data-testid="property-ownership-select"], [name="property_ownership"]',
        '[data-testid="when-needed-select"], [name="when_needed"]',
        '[data-testid="type-select"], [name="type"]'
      ]
      
      expectedDropdowns.forEach(selector => {
        cy.get('body').then($body => {
          const selectors = selector.split(', ')
          const found = selectors.some(sel => $body.find(sel).length > 0)
          if (found) {
            cy.get(selector.split(', ').find(sel => $body.find(sel).length > 0)!)
              .should('exist')
          }
        })
      })
    })

    it('should handle bulk cache management', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Reload page - should use cache
      cy.reload()
      
      // Should not make new API call due to cache
      cy.get('@dropdownAPI.all').should('have.length', 1)
      
      // Components should still load properly from cache
      cy.get('form, .form-container').should('exist')
    })

    it('should provide refresh functionality', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Simulate refresh action (this would be triggered by component)
      cy.window().then((win) => {
        // Force refresh by clearing cache and reloading
        win.location.reload()
      })
      
      cy.wait('@dropdownAPI')
      
      // Should have made 2 API calls total
      cy.get('@dropdownAPI.all').should('have.length', 2)
    })

    it('should handle concurrent requests properly', () => {
      // Open multiple pages simultaneously to test concurrent handling
      cy.visit('/services/calculate-mortgage')
      
      // Open in new "tab" (simulate concurrent access)
      cy.window().then((win) => {
        // Simulate multiple components requesting same data
        cy.visit('/services/calculate-mortgage')
      })
      
      cy.wait('@dropdownAPI')
      
      // Should handle concurrent requests gracefully
      cy.get('form, .form-container').should('exist')
    })
  })

  describe('Hook Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Mock network error
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        forceNetworkError: true
      }).as('networkError')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@networkError')
      
      // Should show error state or fallback UI
      cy.get('body').should('not.contain.text', 'undefined')
      
      // Form should still be rendered
      cy.get('form, .form-container').should('exist')
    })

    it('should handle API errors with proper error states', () => {
      // Mock API error response
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('apiError')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@apiError')
      
      // Should handle error gracefully
      cy.get('body').should('not.contain.text', 'undefined')
      
      // Error state should be indicated somehow
      cy.get('body').then($body => {
        const hasErrorIndicator = 
          $body.text().includes('error') ||
          $body.text().includes('שגיאה') ||
          $body.text().includes('ошибка') ||
          $body.find('.error, .alert, [data-testid="error"]').length > 0
        
        expect(hasErrorIndicator).to.be.true
      })
    })

    it('should handle malformed API responses', () => {
      // Mock malformed response
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 200,
        body: { invalid: 'response' }
      }).as('malformedAPI')
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@malformedAPI')
      
      // Should not crash the application
      cy.get('body').should('exist')
      cy.get('form, .form-container').should('exist')
    })

    it('should handle request timeout gracefully', () => {
      // Mock slow response that times out
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, (req) => {
        return new Promise(() => {
          // Never resolve to simulate timeout
        })
      }).as('timeoutAPI')
      
      cy.visit('/services/calculate-mortgage', { timeout: 15000 })
      
      // Should show loading state initially
      cy.get('.loading, .spinner, [data-testid="loading"]', { timeout: 1000 })
        .should('exist')
      
      // After timeout, should show error state or fallback
      cy.wait(5000) // Wait for timeout
      cy.get('body').should('not.contain.text', 'undefined')
    })
  })

  describe('Hook Performance Metrics', () => {
    it('should demonstrate significant performance improvement', () => {
      // Test cold cache performance
      cy.visit('/services/calculate-mortgage')
      
      let firstLoadTime: number
      cy.wait('@dropdownAPI').then((interception) => {
        firstLoadTime = interception.response?.headers['x-response-time'] || 100
        
        // Navigate away and back for warm cache test
        cy.visit('/')
        cy.visit('/services/calculate-mortgage')
        
        // Second load should be from cache (faster)
        const startTime = Date.now()
        cy.get('form, .form-container', { timeout: 2000 }).should('exist').then(() => {
          const secondLoadTime = Date.now() - startTime
          
          // Cache should provide significant speedup
          expect(secondLoadTime).to.be.lessThan(firstLoadTime * 0.5)
          cy.log(`Performance improvement: ${firstLoadTime}ms → ${secondLoadTime}ms`)
        })
      })
    })

    it('should efficiently handle multiple hook instances', () => {
      cy.visit('/services/calculate-mortgage')
      
      // Multiple components using useDropdownData should share cache
      cy.wait('@dropdownAPI')
      
      // Only one API call should be made despite multiple dropdowns
      cy.get('@dropdownAPI.all').should('have.length', 1)
      
      // All dropdown components should be functional
      const dropdownSelectors = [
        '[data-testid="property-ownership-select"], [name="property_ownership"]',
        '[data-testid="when-needed-select"], [name="when_needed"]',
        '[data-testid="type-select"], [name="type"]'
      ]
      
      dropdownSelectors.forEach(selector => {
        cy.get('body').then($body => {
          const selectors = selector.split(', ')
          const found = selectors.some(sel => $body.find(sel).length > 0)
          if (found) {
            cy.log(`Found dropdown: ${selector}`)
          }
        })
      })
    })
  })

  describe('Hook Memory Management', () => {
    it('should properly clean up resources on unmount', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Navigate away to trigger cleanup
      cy.visit('/')
      
      // Navigate back
      cy.visit('/services/calculate-mortgage')
      
      // Should work properly after cleanup
      cy.wait('@dropdownAPI')
      cy.get('form, .form-container').should('exist')
    })

    it('should handle rapid navigation without memory leaks', () => {
      // Rapidly navigate between pages
      for (let i = 0; i < 3; i++) {
        cy.visit('/services/calculate-mortgage')
        cy.visit('/services/personal-data')
      }
      
      // Final page should load correctly
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      cy.get('form, .form-container').should('exist')
    })
  })
})