/// <reference types="cypress" />

describe('Phase 3: Cache Management Verification', () => {
  const API_BASE = 'http://localhost:8003/api'
  const CACHE_STATS_URL = `${API_BASE}/content/cache/stats`
  const CACHE_CLEAR_URL = `${API_BASE}/content/cache/clear`

  // Test cache statistics endpoint
  describe('Cache Statistics (/api/content/cache/stats)', () => {
    it('should return cache statistics or gracefully handle missing endpoint', () => {
      cy.request({
        method: 'GET',
        url: CACHE_STATS_URL,
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200) {
          // Verify response structure
          expect(response.body).to.have.property('cache_stats')
          const stats = response.body.cache_stats
          
          // Basic statistics should be present
          expect(stats).to.have.property('hits').that.is.a('number')
          expect(stats).to.have.property('misses').that.is.a('number')
          expect(stats).to.have.property('keys').that.is.a('number')
          expect(stats).to.have.property('hit_rate').that.is.a('number')
          
          // Hit rate should be between 0 and 1
          expect(stats.hit_rate).to.be.at.least(0).and.at.most(1)
          
          cy.log(`Cache Stats - Hits: ${stats.hits}, Misses: ${stats.misses}, Keys: ${stats.keys}, Hit Rate: ${(stats.hit_rate * 100).toFixed(1)}%`)
        } else if (response.status === 404) {
          cy.log('Cache statistics endpoint not implemented yet (404)')
        } else {
          cy.log(`Cache statistics returned status ${response.status}`)
        }
      })
    })

    it('should show cache statistics after some API usage', () => {
      // Make several API calls to generate cache activity
      const apiCalls = [
        `${API_BASE}/content/mortgage_step1/en`,
        `${API_BASE}/content/mortgage_step1/he`,
        `${API_BASE}/dropdowns/mortgage_step1/en`,
        `${API_BASE}/dropdowns/mortgage_step2/en`
      ]

      // Execute all API calls
      const requests = apiCalls.map(url => cy.request(url))
      
      cy.wrap(Promise.all(requests)).then(() => {
        // Check cache stats after usage
        cy.request(CACHE_STATS_URL).then(response => {
          expect(response.status).to.equal(200)
          const stats = response.body.cache_stats
          
          // Should have some activity
          const totalActivity = stats.hits + stats.misses
          expect(totalActivity).to.be.greaterThan(0, 'Cache should show some activity')
          
          cy.log(`Post-usage Cache Stats - Total Activity: ${totalActivity}, Hit Rate: ${(stats.hit_rate * 100).toFixed(1)}%`)
        })
      })
    })
  })

  // Test cache clearing endpoint
  describe('Cache Clearing (/api/content/cache/clear)', () => {
    it('should clear cache successfully or gracefully handle missing endpoint', () => {
      cy.request({
        method: 'POST',
        url: CACHE_CLEAR_URL,
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200) {
          expect(response.body).to.have.property('message')
          expect(response.body.message).to.include('cleared')
          cy.log('Cache cleared successfully')
        } else if (response.status === 404) {
          cy.log('Cache clearing endpoint not implemented yet (404)')
        } else {
          cy.log(`Cache clearing returned status ${response.status}`)
        }
      })
    })

    it('should reset cache statistics after clearing', () => {
      // Clear cache
      cy.request({
        method: 'POST',
        url: CACHE_CLEAR_URL
      }).then(() => {
        // Check stats immediately after clearing
        cy.request(CACHE_STATS_URL).then(response => {
          const stats = response.body.cache_stats
          
          // Keys should be 0 after clearing
          expect(stats.keys).to.equal(0, 'Cache keys should be 0 after clearing')
          
          cy.log(`Cache cleared - Keys: ${stats.keys}`)
        })
      })
    })

    it('should handle multiple clear requests gracefully', () => {
      // Clear cache multiple times
      const clearRequests = [
        cy.request({ method: 'POST', url: CACHE_CLEAR_URL }),
        cy.request({ method: 'POST', url: CACHE_CLEAR_URL }),
        cy.request({ method: 'POST', url: CACHE_CLEAR_URL })
      ]

      cy.wrap(Promise.all(clearRequests)).then((responses: any[]) => {
        responses.forEach(response => {
          expect(response.status).to.equal(200)
          expect(response.body).to.have.property('message')
        })
        
        cy.log('Multiple cache clear requests handled successfully')
      })
    })
  })

  // Test cache performance impact
  describe('Cache Performance Impact', () => {
    it('should demonstrate cache speedup', () => {
      const testUrl = `${API_BASE}/content/mortgage_step1/en`
      
      // Clear cache first
      cy.request({ method: 'POST', url: CACHE_CLEAR_URL })

      // First request (cache miss) - measure time
      const start1 = Date.now()
      cy.request(testUrl).then(response1 => {
        const time1 = Date.now() - start1
        
        expect(response1.status).to.equal(200)
        
        // Second request (cache hit) - measure time
        const start2 = Date.now()
        cy.request(testUrl).then(response2 => {
          const time2 = Date.now() - start2
          
          expect(response2.status).to.equal(200)
          
          // Calculate speedup
          const speedup = time1 / time2
          
          // Cache should provide significant speedup (at least 2x)
          expect(speedup).to.be.greaterThan(2, 
            `Cache speedup should be >2x. First: ${time1}ms, Second: ${time2}ms, Speedup: ${speedup.toFixed(1)}x`)
          
          cy.log(`Cache Performance - Miss: ${time1}ms, Hit: ${time2}ms, Speedup: ${speedup.toFixed(1)}x`)
          
          // Log if we achieved the manual test benchmark (46.5x)
          if (speedup > 40) {
            cy.log(`🚀 Excellent cache performance! Achieved ${speedup.toFixed(1)}x speedup (target was 46.5x)`)
          }
        })
      })
    })

    it('should maintain cache consistency across different endpoints', () => {
      const contentUrl = `${API_BASE}/content/mortgage_step1/en`
      const dropdownUrl = `${API_BASE}/dropdowns/mortgage_step1/en`
      
      // Clear cache first
      cy.request({ method: 'POST', url: CACHE_CLEAR_URL })

      // Make requests to both endpoints
      cy.request(contentUrl).then(response1 => {
        expect(response1.status).to.equal(200)
        
        cy.request(dropdownUrl).then(response2 => {
          expect(response2.status).to.equal(200)
          
          // Check cache stats - should show activity from both endpoints
          cy.request(CACHE_STATS_URL).then(statsResponse => {
            const stats = statsResponse.body.cache_stats
            const totalActivity = stats.hits + stats.misses
            
            expect(totalActivity).to.be.greaterThan(0)
            expect(stats.keys).to.be.greaterThan(0)
            
            cy.log(`Cache consistency check - Total Activity: ${totalActivity}, Keys: ${stats.keys}`)
          })
        })
      })
    })
  })

  // Test cache behavior under load
  describe('Cache Behavior Under Load', () => {
    it('should handle concurrent requests efficiently', () => {
      const testUrl = `${API_BASE}/content/mortgage_step1/en`
      
      // Clear cache first
      cy.request({ method: 'POST', url: CACHE_CLEAR_URL })

      // Make multiple concurrent requests
      const concurrentRequests = Array(10).fill(null).map(() => {
        const start = Date.now()
        return cy.request(testUrl).then(response => {
          const time = Date.now() - start
          expect(response.status).to.equal(200)
          return time
        })
      })

      cy.wrap(Promise.all(concurrentRequests)).then((times: number[]) => {
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
        const maxTime = Math.max(...times)
        const minTime = Math.min(...times)
        
        // Most requests should be fast due to caching
        const fastRequests = times.filter(t => t < 50).length
        expect(fastRequests).to.be.greaterThan(5, 'At least 5 requests should be fast due to caching')
        
        cy.log(`Concurrent requests - Avg: ${avgTime.toFixed(1)}ms, Min: ${minTime}ms, Max: ${maxTime}ms, Fast: ${fastRequests}/10`)
      })
    })

    it('should maintain cache across different languages', () => {
      const languages = ['en', 'he', 'ru']
      
      // Clear cache first
      cy.request({ method: 'POST', url: CACHE_CLEAR_URL })

      // Make requests for all languages
      const languageRequests = languages.map(lang => 
        cy.request(`${API_BASE}/content/mortgage_step1/${lang}`).then(response => {
          expect(response.status).to.equal(200)
          return lang
        })
      )

      cy.wrap(Promise.all(languageRequests)).then(() => {
        // Check cache stats - should have entries for all languages
        cy.request(CACHE_STATS_URL).then(response => {
          const stats = response.body.cache_stats
          
          expect(stats.keys).to.be.at.least(languages.length, 
            `Cache should have at least ${languages.length} keys for different languages`)
          
          cy.log(`Multi-language cache test - Keys: ${stats.keys}, Languages tested: ${languages.join(', ')}`)
        })
      })
    })
  })

  // Test cache invalidation scenarios
  describe('Cache Invalidation', () => {
    it('should handle cache invalidation correctly', () => {
      const testUrl = `${API_BASE}/content/mortgage_step1/en`
      
      // Clear cache and make initial request
      cy.request({ method: 'POST', url: CACHE_CLEAR_URL })
      cy.request(testUrl).then(() => {
        
        // Verify cache has content
        cy.request(CACHE_STATS_URL).then(response => {
          const initialStats = response.body.cache_stats
          expect(initialStats.keys).to.be.greaterThan(0)
          
          // Clear cache again
          cy.request({ method: 'POST', url: CACHE_CLEAR_URL }).then(() => {
            
            // Verify cache is empty
            cy.request(CACHE_STATS_URL).then(finalResponse => {
              const finalStats = finalResponse.body.cache_stats
              expect(finalStats.keys).to.equal(0)
              
              cy.log(`Cache invalidation test - Initial keys: ${initialStats.keys}, Final keys: ${finalStats.keys}`)
            })
          })
        })
      })
    })
  })
})