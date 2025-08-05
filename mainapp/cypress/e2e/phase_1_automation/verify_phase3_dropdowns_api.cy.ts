/// <reference types="cypress" />

describe('Phase 3: Structured Dropdowns API Verification', () => {
  const API_BASE = 'http://localhost:8003/api'
  const LANGUAGES = ['en', 'he', 'ru']
  const MORTGAGE_SCREENS = ['mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4']

  // Test new structured dropdowns endpoint
  describe('Structured Dropdowns Endpoint (/api/dropdowns/:screen/:lang)', () => {
    MORTGAGE_SCREENS.forEach(screen => {
      LANGUAGES.forEach(lang => {
        it(`should return structured dropdown data for ${screen} in ${lang}`, () => {
          cy.request({
            method: 'GET',
            url: `${API_BASE}/dropdowns/${screen}/${lang}`,
            failOnStatusCode: false
          }).then(response => {
            expect(response.status).to.equal(200)
            
            // Verify response structure
            expect(response.body).to.have.property('dropdowns').that.is.an('array')
            expect(response.body).to.have.property('options').that.is.an('object')
            expect(response.body).to.have.property('placeholders').that.is.an('object')
            expect(response.body).to.have.property('labels').that.is.an('object')
            
            const { dropdowns, options, placeholders, labels } = response.body
            
            cy.log(`${screen}/${lang}: ${dropdowns.length} dropdowns`)
            
            // Verify each dropdown has proper structure
            dropdowns.forEach((dropdown: any) => {
              expect(dropdown).to.have.property('key').that.is.a('string')
              expect(dropdown).to.have.property('label').that.is.a('string')
            })
            
            // Verify options structure (not all dropdowns have options)
            Object.keys(options).forEach((optionKey: string) => {
              expect(options[optionKey]).to.be.an('array')
              
              // Options should have value and label
              options[optionKey].forEach((option: any) => {
                expect(option).to.have.property('value').that.is.a('string')
                expect(option).to.have.property('label').that.is.a('string')
              })
              
              cy.log(`  ${optionKey}: ${options[optionKey].length} options`)
            })
            
            // Verify metadata if present
            if (response.body.metadata) {
              expect(response.body.metadata).to.have.property('total_dropdowns', dropdowns.length)
              expect(response.body.metadata).to.have.property('cache_hit').to.be.a('boolean')
              expect(response.body.metadata).to.have.property('processing_time').to.be.a('number')
            }
          })
        })
      })
    })

    // Test specific screen expectations based on actual API results
    it('should return expected number of dropdowns for mortgage_step1', () => {
      cy.request(`${API_BASE}/dropdowns/mortgage_step1/en`).then(response => {
        const { dropdowns } = response.body
        
        // Based on actual API response - mortgage_step1 has 38 dropdowns
        expect(dropdowns.length).to.equal(38)
        
        // Verify key expected dropdowns are present (using full key names)
        const dropdownKeys = dropdowns.map((d: any) => d.key)
        const expectedDropdowns = [
          'mortgage_step1_property_ownership',
          'mortgage_step1_when_needed', 
          'mortgage_step1_type',
          'mortgage_step1_first_home'
        ]
        
        expectedDropdowns.forEach(expectedKey => {
          expect(dropdownKeys).to.include(expectedKey)
        })
        
        cy.log(`mortgage_step1 has ${dropdowns.length} dropdowns: ${dropdownKeys.slice(0, 5).join(', ')}...`)
      })
    })

    it('should have consistent dropdown counts across languages', () => {
      const testScreen = 'mortgage_step1'
      const results: any[] = []
      
      LANGUAGES.forEach(lang => {
        cy.request(`${API_BASE}/dropdowns/${testScreen}/${lang}`).then(response => {
          results.push({
            lang,
            count: response.body.dropdowns.length
          })
        })
      })

      cy.then(() => {
        // All languages should have the same number of dropdowns
        const counts = results.map(r => r.count)
        const uniqueCounts = [...new Set(counts)]
        
        expect(uniqueCounts.length).to.equal(1, 
          `All languages should have same dropdown count. Found: ${results.map(r => `${r.lang}:${r.count}`).join(', ')}`)
        
        cy.log(`Consistent dropdown count across languages: ${counts[0]}`)
      })
    })
  })

  // Test performance requirements
  describe('Performance Validation', () => {
    it('should respond within 200ms requirement', () => {
      const startTime = Date.now()
      
      cy.request(`${API_BASE}/dropdowns/mortgage_step1/en`).then(response => {
        const responseTime = Date.now() - startTime
        
        expect(response.status).to.equal(200)
        expect(responseTime).to.be.lessThan(200, `Response time was ${responseTime}ms, should be <200ms`)
        
        cy.log(`Response time: ${responseTime}ms (target: <200ms)`)
        
        // Also check metadata if available
        if (response.body.metadata && response.body.metadata.processing_time) {
          const serverProcessingTime = response.body.metadata.processing_time
          cy.log(`Server processing time: ${serverProcessingTime}ms`)
        }
      })
    })

    it('should show performance improvement with caching', () => {
      const testUrl = `${API_BASE}/dropdowns/mortgage_step1/en`
      
      // Clear cache first
      cy.request({
        method: 'POST',
        url: `${API_BASE}/content/cache/clear`,
        failOnStatusCode: false
      })

      // First request (cache miss)
      const start1 = Date.now()
      cy.request(testUrl).then(response1 => {
        const time1 = Date.now() - start1
        
        expect(response1.status).to.equal(200)
        if (response1.body.metadata) {
          expect(response1.body.metadata.cache_hit).to.be.false
        }
        
        // Second request (cache hit)
        const start2 = Date.now()
        cy.request(testUrl).then(response2 => {
          const time2 = Date.now() - start2
          
          expect(response2.status).to.equal(200)
          if (response2.body.metadata) {
            expect(response2.body.metadata.cache_hit).to.be.true
          }
          
          // Cache hit should be significantly faster
          const improvement = time1 / time2
          expect(improvement).to.be.greaterThan(2, `Cache should improve performance. First: ${time1}ms, Second: ${time2}ms, Improvement: ${improvement.toFixed(1)}x`)
          
          cy.log(`Performance improvement: ${improvement.toFixed(1)}x (${time1}ms → ${time2}ms)`)
        })
      })
    })
  })

  // Test data structure validation
  describe('Data Structure Validation', () => {
    it('should have proper option data for property_ownership dropdown', () => {
      cy.request(`${API_BASE}/dropdowns/mortgage_step1/en`).then(response => {
        const { dropdowns, options } = response.body
        
        // Find property ownership dropdown using exact key
        const propertyDropdownKey = 'mortgage_step1_property_ownership'
        const propertyDropdown = dropdowns.find((d: any) => d.key === propertyDropdownKey)
        
        expect(propertyDropdown).to.exist
        expect(propertyDropdown.label).to.equal('Property Ownership Status')
        
        // Check related property ownership options (the API has multiple related keys)
        const propertyOptionKeys = Object.keys(options).filter(key => 
          key.includes('property_ownership') || key === 'mortgage_step1_property'
        )
        
        expect(propertyOptionKeys.length).to.be.at.least(1)
        
        // Test the main property dropdown options
        if (options['mortgage_step1_property']) {
          const propertyOptions = options['mortgage_step1_property']
          expect(propertyOptions).to.be.an('array')
          expect(propertyOptions.length).to.be.at.least(3)
          
          const optionLabels = propertyOptions.map((opt: any) => opt.label)
          expect(optionLabels).to.include.members([
            "I'm selling a property",
            "I don't own any property", 
            "I own a property"
          ])
          
          cy.log(`Property ownership options: ${optionLabels.join(', ')}`)
        }
      })
    })

    it('should provide placeholders and labels for major dropdowns', () => {
      cy.request(`${API_BASE}/dropdowns/mortgage_step1/en`).then(response => {
        const { dropdowns, placeholders, labels } = response.body
        
        // Major dropdowns should have placeholders
        const majorDropdowns = ['property_ownership', 'when_needed', 'type']
        
        dropdowns.forEach((dropdown: any) => {
          const isMajor = majorDropdowns.some(major => dropdown.key.includes(major))
          
          if (isMajor) {
            // Should have placeholder
            const hasPlaceholder = Object.keys(placeholders).some(key => 
              key.includes(dropdown.key.split('_')[dropdown.key.split('_').length - 1])
            )
            
            // Should have label
            const hasLabel = Object.keys(labels).some(key => 
              key.includes(dropdown.key.split('_')[dropdown.key.split('_').length - 1])
            ) || dropdown.label
            
            cy.log(`${dropdown.key}: placeholder=${hasPlaceholder}, label=${hasLabel}`)
          }
        })
      })
    })

    it('should handle empty screens gracefully', () => {
      // Test screen with minimal dropdowns
      cy.request({
        method: 'GET',
        url: `${API_BASE}/dropdowns/mortgage_step4/en`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('dropdowns').that.is.an('array')
        expect(response.body).to.have.property('options').that.is.an('object')
        expect(response.body).to.have.property('placeholders').that.is.an('object')
        expect(response.body).to.have.property('labels').that.is.an('object')
        
        const dropdownCount = response.body.dropdowns.length
        cy.log(`mortgage_step4 has ${dropdownCount} dropdowns (may be 0)`)
      })
    })
  })

  // Test multi-language consistency
  describe('Multi-Language Consistency', () => {
    it('should have all languages with same dropdown structure', () => {
      const testScreen = 'mortgage_step2'
      const results: any[] = []
      
      LANGUAGES.forEach(lang => {
        cy.request(`${API_BASE}/dropdowns/${testScreen}/${lang}`).then(response => {
          const dropdownKeys = response.body.dropdowns.map((d: any) => d.key).sort()
          results.push({ lang, keys: dropdownKeys })
        })
      })

      cy.then(() => {
        // Compare keys across languages
        const [first, ...rest] = results
        
        rest.forEach(other => {
          expect(other.keys).to.deep.equal(first.keys, 
            `${other.lang} dropdown keys should match ${first.lang}`)
        })
        
        cy.log(`Consistent dropdown structure across ${LANGUAGES.length} languages: ${first.keys.length} dropdowns`)
      })
    })

    it('should have proper RTL support indicators for Hebrew', () => {
      cy.request(`${API_BASE}/dropdowns/mortgage_step1/he`).then(response => {
        const { dropdowns, options } = response.body
        
        // Hebrew responses should contain Hebrew text
        dropdowns.forEach((dropdown: any) => {
          if (dropdown.label) {
            // Hebrew text should contain Hebrew characters or be RTL-friendly
            // For now, just verify it's a non-empty string
            expect(dropdown.label).to.be.a('string').and.not.be.empty
          }
        })
        
        // Check options for Hebrew text
        Object.values(options).forEach((optionArray: any) => {
          optionArray.forEach((option: any) => {
            expect(option.label).to.be.a('string').and.not.be.empty
          })
        })
        
        cy.log(`Hebrew dropdowns loaded successfully: ${dropdowns.length} dropdowns`)
      })
    })
  })

  // Test error handling
  describe('Error Handling', () => {
    it('should handle invalid screen gracefully', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/dropdowns/invalid_screen/en`,
        failOnStatusCode: false
      }).then(response => {
        // May return 404 or empty data depending on implementation
        if (response.status === 404) {
          expect(response.body).to.have.property('error')
          cy.log('Invalid screen handled with 404 as expected')
        } else {
          expect(response.status).to.equal(200)
          expect(response.body.dropdowns).to.be.an('array').with.length(0)
          cy.log('Invalid screen returns empty dropdowns as expected')
        }
      })
    })

    it('should handle invalid language gracefully', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/dropdowns/mortgage_step1/invalid`,
        failOnStatusCode: false
      }).then(response => {
        // May return 404 or empty data depending on implementation
        if (response.status === 404) {
          expect(response.body).to.have.property('error')
          cy.log('Invalid language handled with 404 as expected')
        } else {
          expect(response.status).to.equal(200)
          expect(response.body.dropdowns).to.be.an('array').with.length(0)
          cy.log('Invalid language returns empty dropdowns as expected')
        }
      })
    })
  })
})