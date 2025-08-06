/// <reference types="cypress" />

describe('Phase 3: Enhanced Content API Verification', () => {
  const API_BASE = 'http://localhost:8003/api'
  const LANGUAGES = ['en', 'he', 'ru']
  const MORTGAGE_SCREENS = ['mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4']
  const COMPONENT_TYPES = ['dropdown', 'option', 'placeholder', 'label']

  // Test enhanced content endpoint with type filtering
  describe('Enhanced Content Endpoint (/api/content/:screen/:lang)', () => {
    MORTGAGE_SCREENS.forEach(screen => {
      LANGUAGES.forEach(lang => {
        it(`should return all content for ${screen} in ${lang} (no type filter)`, () => {
          cy.request({
            method: 'GET',
            url: `${API_BASE}/content/${screen}/${lang}`,
            failOnStatusCode: false
          }).then(response => {
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('status', 'success')
            expect(response.body).to.have.property('screen_location', screen)
            expect(response.body).to.have.property('language_code', lang)
            expect(response.body).to.have.property('content')
            
            // Content should be an object with items
            expect(response.body.content).to.be.an('object')
            const contentCount = Object.keys(response.body.content).length
            cy.log(`${screen}/${lang}: ${contentCount} total content items`)
            
            // Verify metadata
            if (response.body.metadata) {
              expect(response.body.metadata).to.have.property('total_items', contentCount)
              expect(response.body.metadata).to.have.property('cache_hit').to.be.a('boolean')
            }
          })
        })

        // Test type filtering for each component type
        COMPONENT_TYPES.forEach(componentType => {
          it(`should filter ${componentType} content for ${screen} in ${lang}`, () => {
            cy.request({
              method: 'GET',
              url: `${API_BASE}/content/${screen}/${lang}?type=${componentType}`,
              failOnStatusCode: false
            }).then(response => {
              expect(response.status).to.equal(200)
              expect(response.body).to.have.property('status', 'success')
              expect(response.body).to.have.property('content')
              
              const content = response.body.content
              const contentCount = Object.keys(content).length
              
              // All returned items should match the requested type
              if (contentCount > 0) {
                Object.values(content).forEach((item: any) => {
                  expect(item.component_type).to.equal(componentType)
                })
                cy.log(`${screen}/${lang} ${componentType}: ${contentCount} items`)
              } else {
                cy.log(`${screen}/${lang} ${componentType}: No items found`)
              }
            })
          })
        })
      })
    })

    // Test backward compatibility (no type parameter)
    it('should maintain backward compatibility without type parameter', () => {
      cy.request(`${API_BASE}/content/mortgage_step1/en`).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('content')
        
        const content = response.body.content
        const componentTypes = new Set()
        
        Object.values(content).forEach((item: any) => {
          componentTypes.add(item.component_type)
        })
        
        // Should include multiple component types (not filtered)
        expect(componentTypes.size).to.be.greaterThan(1)
        cy.log(`Backward compatibility: ${componentTypes.size} different component types found`)
      })
    })

    // Test invalid type parameter
    it('should handle invalid type parameter gracefully', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/content/mortgage_step1/en?type=invalid_type`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('content')
        
        // Should return empty content for invalid type
        const contentCount = Object.keys(response.body.content).length
        expect(contentCount).to.equal(0)
        cy.log('Invalid type parameter returns empty content as expected')
      })
    })
  })

  // Test caching functionality
  describe('Content API Caching', () => {
    it('should show cache miss on first request and cache hit on second', () => {
      const testUrl = `${API_BASE}/content/mortgage_step1/en`
      
      // Clear cache first
      cy.request({
        method: 'POST',
        url: `${API_BASE}/content/cache/clear`,
        failOnStatusCode: false
      })

      // First request - should be cache miss
      cy.request(testUrl).then(response => {
        expect(response.status).to.equal(200)
        if (response.body.metadata) {
          expect(response.body.metadata.cache_hit).to.be.false
          cy.log('First request: Cache miss as expected')
        }
      })

      // Second request - should be cache hit
      cy.request(testUrl).then(response => {
        expect(response.status).to.equal(200)
        if (response.body.metadata) {
          expect(response.body.metadata.cache_hit).to.be.true
          cy.log('Second request: Cache hit as expected')
        }
      })
    })
  })

  // Test error handling
  describe('Error Handling', () => {
    it('should handle invalid screen location gracefully', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/content/invalid_screen/en`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('content')
        
        // Should return empty content for invalid screen
        const contentCount = Object.keys(response.body.content).length
        expect(contentCount).to.equal(0)
        cy.log('Invalid screen returns empty content as expected')
      })
    })

    it('should handle invalid language code gracefully', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/content/mortgage_step1/invalid`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('content')
        
        // Should return empty content for invalid language
        const contentCount = Object.keys(response.body.content).length
        expect(contentCount).to.equal(0)
        cy.log('Invalid language returns empty content as expected')
      })
    })
  })

  // Test data integrity
  describe('Data Integrity', () => {
    it('should have consistent data structure across all responses', () => {
      let allResults: any[] = []
      
      // Process screens sequentially to avoid Promise.all issues
      const processScreen = (screenIndex: number) => {
        if (screenIndex >= MORTGAGE_SCREENS.length) {
          // All screens processed, verify results
          const totalItems = allResults.reduce((sum, result) => sum + result.count, 0)
          cy.log(`Data integrity verified across ${allResults.length} screens, ${totalItems} total items`)
          
          allResults.forEach(result => {
            cy.log(`${result.screen}: ${result.count} items`)
          })
          return
        }
        
        const screen = MORTGAGE_SCREENS[screenIndex]
        cy.request(`${API_BASE}/content/${screen}/en`).then(response => {
          expect(response.body.content).to.be.an('object')
          
          // Verify all content items have required properties
          Object.entries(response.body.content).forEach(([key, item]: [string, any]) => {
            expect(item).to.have.property('value')
            expect(item).to.have.property('component_type')
            expect(item).to.have.property('category')
            expect(item).to.have.property('language', 'en')
            expect(item).to.have.property('status', 'approved')
            
            // Verify key matches expected pattern
            expect(key).to.be.a('string').and.not.be.empty
          })
          
          allResults.push({ screen, count: Object.keys(response.body.content).length })
          
          // Process next screen
          processScreen(screenIndex + 1)
        })
      }
      
      // Start processing from first screen
      processScreen(0)
    })
  })
})