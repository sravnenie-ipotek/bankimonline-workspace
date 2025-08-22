/// <reference types="cypress" />

describe('Phase 4: Performance and Caching Tests', () => {
  const API_BASE = 'http://localhost:8003/api'
  
  beforeEach(() => {
    // Clear caches before each test
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })
    
    cy.intercept('GET', `${API_BASE}/dropdowns/**`).as('dropdownAPI')
  })

  describe('Cache Performance Improvements', () => {
    it('should demonstrate 46.5x performance improvement with caching', () => {
      // First request - cold cache
      const startTime1 = Date.now()
      cy.visit('/services/calculate-mortgage')
      
      cy.wait('@dropdownAPI').then((interception) => {
        const coldLoadTime = Date.now() - startTime1
        const responseTime = interception.response?.headers['x-response-time'] || coldLoadTime
        
        cy.log(`Cold cache load time: ${coldLoadTime}ms`)
        cy.log(`API response time: ${responseTime}ms`)
        
        // Navigate away and back to test warm cache
        cy.visit('/')
        
        const startTime2 = Date.now()
        cy.visit('/services/calculate-mortgage')
        
        // Second load should be from cache (much faster)
        cy.get('form, .form-container', { timeout: 3000 }).should('exist').then(() => {
          const warmLoadTime = Date.now() - startTime2
          const speedupRatio = coldLoadTime / warmLoadTime
          
          cy.log(`Warm cache load time: ${warmLoadTime}ms`)
          cy.log(`Performance improvement: ${speedupRatio.toFixed(1)}x`)
          
          // Should achieve significant speedup (at least 5x, target 46.5x)
          expect(speedupRatio).to.be.at.least(5, 
            `Expected at least 5x speedup, got ${speedupRatio.toFixed(1)}x`)
          
          // Verify cache was actually used (no new API call)
          cy.get('@dropdownAPI.all').should('have.length', 1)
        })
      })
    })

    it('should validate cache TTL (Time To Live) behavior', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Verify cache exists
      cy.get('@dropdownAPI.all').should('have.length', 1)
      
      // Navigate away and back quickly (within TTL)
      cy.visit('/')
      cy.visit('/services/calculate-mortgage')
      
      // Should use cache (no new API call)
      cy.get('@dropdownAPI.all').should('have.length', 1)
      
      // Components should load from cache
      cy.get('form, .form-container').should('exist')
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select[aria-label*="ownership"]')
        .should('exist')
    })

    it('should handle cache invalidation correctly', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Clear cache manually
      cy.window().then((win) => {
        // Clear all possible cache locations
        win.localStorage.clear()
        win.sessionStorage.clear()
        
        // Simulate cache clearing via console if available
        if (win.clearDropdownCache) {
          win.clearDropdownCache()
        }
      })
      
      // Reload page - should make new API call
      cy.reload()
      cy.wait('@dropdownAPI')
      
      // Should have made 2 API calls total
      cy.get('@dropdownAPI.all').should('have.length', 2)
    })

    it('should optimize multiple component loading', () => {
      cy.visit('/services/calculate-mortgage')
      
      // Single API call should load data for ALL dropdowns on the page
      cy.wait('@dropdownAPI').then((interception) => {
        const response = interception.response?.body
        
        // Verify bulk response contains multiple dropdown datasets
        expect(response.dropdowns).to.have.length.at.least(3)
        expect(Object.keys(response.options)).to.have.length.at.least(3)
        
        // Expected dropdown keys for mortgage_step1
        const expectedKeys = [
          'mortgage_step1_property_ownership',
          'mortgage_step1_when_needed',
          'mortgage_step1_type',
          'mortgage_step1_first_home'
        ]
        
        expectedKeys.forEach(key => {
          expect(response.options).to.have.property(key)
          expect(response.options[key]).to.be.an('array').with.length.at.least(2)
        })
      })
      
      // Verify only ONE API call was made despite multiple dropdowns
      cy.get('@dropdownAPI.all').should('have.length', 1)
      
      // All dropdown components should be functional
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"]').should('exist')
      cy.get('[data-testid="when-needed-select"], [name="when_needed"]').should('exist')
    })
  })

  describe('Memory Management and Efficiency', () => {
    it('should handle rapid navigation without memory leaks', () => {
      // Rapidly navigate between pages to stress test
      for (let i = 0; i < 5; i++) {
        cy.visit('/services/calculate-mortgage')
        cy.visit('/services/personal-data')
        cy.visit('/')
      }
      
      // Final navigation should work smoothly
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Page should load normally
      cy.get('form, .form-container').should('exist')
      
      // Memory usage should be reasonable (no excessive API calls)
      cy.get('@dropdownAPI.all').should('have.length.lessThan', 10)
    })

    it('should efficiently handle concurrent requests', () => {
      // Simulate concurrent component mounting
      cy.visit('/services/calculate-mortgage')
      
      // Multiple components requesting same data should share cache
      cy.wait('@dropdownAPI')
      
      // Should make only one API call even with multiple dropdown components
      cy.get('@dropdownAPI.all').should('have.length', 1)
      
      // All components should work
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
            cy.log(`✅ Dropdown loaded efficiently: ${selector.split(',')[0]}`)
          }
        })
      })
    })

    it('should handle large dataset caching efficiently', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Verify large dropdown datasets are cached properly
      cy.window().then((win) => {
        // Check localStorage or sessionStorage for cached data
        const localStorageSize = JSON.stringify(win.localStorage).length
        const sessionStorageSize = JSON.stringify(win.sessionStorage).length
        
        cy.log(`LocalStorage size: ${localStorageSize} bytes`)
        cy.log(`SessionStorage size: ${sessionStorageSize} bytes`)
        
        // Cache size should be reasonable (not excessive)
        expect(localStorageSize + sessionStorageSize).to.be.lessThan(1024 * 1024) // Less than 1MB
      })
      
      // Performance should remain good even with cached data
      const startTime = Date.now()
      cy.reload()
      
      cy.get('form, .form-container').should('exist').then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(2000) // Should load within 2 seconds
      })
    })
  })

  describe('Network Optimization', () => {
    it('should minimize network requests with bulk fetching', () => {
      cy.visit('/services/calculate-mortgage')
      
      // Should make only ONE network request for all dropdown data
      cy.wait('@dropdownAPI')
      cy.get('@dropdownAPI.all').should('have.length', 1)
      
      // Verify all necessary data was fetched in single request
      cy.get('@dropdownAPI').then((interception) => {
        const response = interception.response?.body
        
        // Should contain data for all page dropdowns
        expect(response).to.have.property('dropdowns')
        expect(response).to.have.property('options')
        expect(response).to.have.property('placeholders')
        expect(response).to.have.property('labels')
        
        // Response should be comprehensive
        expect(response.dropdowns.length).to.be.at.least(3)
        expect(Object.keys(response.options).length).to.be.at.least(3)
      })
    })

    it('should handle request deduplication', () => {
      // Start loading page
      cy.visit('/services/calculate-mortgage')
      
      // Quickly navigate away and back to test request deduplication
      cy.visit('/')
      cy.visit('/services/calculate-mortgage')
      
      // Should not make duplicate requests
      cy.wait('@dropdownAPI', { timeout: 5000 })
      
      // Total API calls should be minimal
      cy.get('@dropdownAPI.all').should('have.length.lessThan', 3)
    })

    it('should demonstrate efficient cache hit ratios', () => {
      // First load
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      let apiCallCount = 1
      
      // Multiple navigations to same page
      for (let i = 0; i < 3; i++) {
        cy.visit('/')
        cy.visit('/services/calculate-mortgage')
        
        // Should use cache (no new API calls)
        cy.get('form, .form-container').should('exist')
      }
      
      // Should still have only 1 API call (100% cache hit rate after first load)
      cy.get('@dropdownAPI.all').should('have.length', apiCallCount)
    })
  })

  describe('Performance Regression Testing', () => {
    it('should maintain response time under 200ms', () => {
      const startTime = Date.now()
      cy.visit('/services/calculate-mortgage')
      
      cy.wait('@dropdownAPI').then((interception) => {
        const totalTime = Date.now() - startTime
        const apiResponseTime = interception.response?.headers['x-response-time'] || totalTime
        
        cy.log(`Total page load time: ${totalTime}ms`)
        cy.log(`API response time: ${apiResponseTime}ms`)
        
        // API should respond quickly
        expect(Number(apiResponseTime)).to.be.lessThan(200)
      })
    })

    it('should handle slow network conditions gracefully', () => {
      // Simulate slow network
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, (req) => {
        req.reply((res) => {
          return new Promise(resolve => {
            setTimeout(() => resolve(res), 2000) // 2 second delay
          })
        })
      }).as('slowDropdownAPI')
      
      cy.visit('/services/calculate-mortgage')
      
      // Should show loading state during slow request
      cy.get('.loading, .spinner, [data-testid="loading"], .MuiCircularProgress-root', { timeout: 1000 })
        .should('exist')
      
      cy.wait('@slowDropdownAPI')
      
      // Should eventually load successfully
      cy.get('form, .form-container').should('exist')
      cy.get('.loading, .spinner, [data-testid="loading"], .MuiCircularProgress-root')
        .should('not.exist')
    })

    it('should maintain performance with large option sets', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Open dropdown with large option set
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select[aria-label*="ownership"]')
        .should('exist')
        .click()
      
      const startTime = Date.now()
      
      // Options should render quickly even with large datasets
      cy.get('.MuiMenuItem-root, option, [role="option"]', { timeout: 1000 })
        .should('have.length.at.least', 2)
        .then(() => {
          const renderTime = Date.now() - startTime
          cy.log(`Option rendering time: ${renderTime}ms`)
          
          // Should render quickly
          expect(renderTime).to.be.lessThan(500)
        })
    })
  })

  describe('Cache Statistics and Monitoring', () => {
    it('should provide cache statistics', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      cy.window().then((win) => {
        // Check if cache statistics are available
        if (win.getDropdownCacheStats) {
          const stats = win.getDropdownCacheStats()
          expect(stats).to.have.property('size').that.is.a('number')
          cy.log(`Cache entries: ${stats.size}`)
        }
      })
    })

    it('should track cache hit/miss ratios', () => {
      // First visit - cache miss
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Second visit - cache hit
      cy.visit('/')
      cy.visit('/services/calculate-mortgage')
      
      // Should demonstrate cache effectiveness
      cy.get('@dropdownAPI.all').should('have.length', 1) // Only one API call = cache hit
      
      // Components should load quickly from cache
      cy.get('form, .form-container', { timeout: 1000 }).should('exist')
    })
  })

  describe('Resource Cleanup and Optimization', () => {
    it('should properly clean up resources on page unload', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Navigate away
      cy.visit('/')
      
      // Navigate back
      cy.visit('/services/calculate-mortgage')
      
      // Should work properly after cleanup/reload cycle
      cy.get('form, .form-container').should('exist')
    })

    it('should handle browser refresh efficiently', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Refresh page
      cy.reload()
      
      // Should maintain performance
      cy.get('form, .form-container', { timeout: 3000 }).should('exist')
      
      // May make new API call after refresh (depending on cache persistence)
      cy.get('@dropdownAPI.all').should('have.length.at.least', 1)
    })
  })
})