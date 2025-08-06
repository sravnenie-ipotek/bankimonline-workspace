/// <reference types="cypress" />

describe('Phase 3: Performance Verification', () => {
  const API_BASE = 'http://localhost:8003/api'
  const PERFORMANCE_TARGET = 200 // milliseconds
  const CACHE_SPEEDUP_TARGET = 10 // minimum speedup expected
  const LANGUAGES = ['en', 'he', 'ru']
  const MORTGAGE_SCREENS = ['mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4']

  // Test API response time requirements
  describe('Response Time Requirements (<200ms)', () => {
    MORTGAGE_SCREENS.forEach(screen => {
      it(`should respond within ${PERFORMANCE_TARGET}ms for content API on ${screen}`, () => {
        const startTime = Date.now()
        
        cy.request(`${API_BASE}/content/${screen}/en`).then(response => {
          const responseTime = Date.now() - startTime
          
          expect(response.status).to.equal(200)
          expect(responseTime).to.be.lessThan(PERFORMANCE_TARGET, 
            `Response time was ${responseTime}ms, should be <${PERFORMANCE_TARGET}ms`)
          
          cy.log(`${screen} content API: ${responseTime}ms`)
        })
      })

      it(`should respond within ${PERFORMANCE_TARGET}ms for dropdowns API on ${screen}`, () => {
        const startTime = Date.now()
        
        cy.request({
          method: 'GET',
          url: `${API_BASE}/dropdowns/${screen}/en`,
          failOnStatusCode: false
        }).then(response => {
          if (response.status === 200) {
            const responseTime = Date.now() - startTime
            
            expect(responseTime).to.be.lessThan(PERFORMANCE_TARGET, 
              `Response time was ${responseTime}ms, should be <${PERFORMANCE_TARGET}ms`)
            
            cy.log(`${screen} dropdowns API: ${responseTime}ms`)
          } else {
            cy.log(`${screen} dropdowns API: No content available (${response.status})`)
          }
        })
      })
    })
  })

  // Test cache performance improvement
  describe('Cache Performance Validation', () => {
    it('should achieve significant speedup with caching', () => {
      const testUrl = `${API_BASE}/content/mortgage_step1/en`
      
      // Clear cache first
      cy.request({
        method: 'POST',
        url: `${API_BASE}/content/cache/clear`,
        failOnStatusCode: false
      })

      // Measure cold cache performance
      const coldStart = Date.now()
      cy.request(testUrl).then(response1 => {
        const coldTime = Date.now() - coldStart
        
        expect(response1.status).to.equal(200)
        
        // Measure warm cache performance
        const warmStart = Date.now()
        cy.request(testUrl).then(response2 => {
          const warmTime = Date.now() - warmStart
          
          expect(response2.status).to.equal(200)
          
          // Calculate speedup
          const speedup = coldTime / warmTime
          
          expect(speedup).to.be.greaterThan(CACHE_SPEEDUP_TARGET, 
            `Cache speedup should be >${CACHE_SPEEDUP_TARGET}x. Cold: ${coldTime}ms, Warm: ${warmTime}ms, Speedup: ${speedup.toFixed(1)}x`)
          
          cy.log(`Cache Performance: ${coldTime}ms → ${warmTime}ms (${speedup.toFixed(1)}x speedup)`)
          
          // Log achievement of manual test benchmark
          if (speedup > 40) {
            cy.log(`🚀 Excellent! Achieved ${speedup.toFixed(1)}x speedup (manual test achieved 46.5x)`)
          } else if (speedup > 20) {
            cy.log(`✅ Good speedup of ${speedup.toFixed(1)}x`)
          }
        })
      })
    })

    it('should maintain performance across all screens', () => {
      // Test performance for each screen with caching
      const performanceResults: Array<{screen: string, coldTime: number, warmTime: number, speedup: number}> = []
      
      // Clear cache first
      cy.request({
        method: 'POST',
        url: `${API_BASE}/content/cache/clear`,
        failOnStatusCode: false
      })

      // Test each screen sequentially to get accurate measurements
      const testScreen = (screenIndex: number) => {
        if (screenIndex >= MORTGAGE_SCREENS.length) {
          // All screens tested, analyze results
          cy.wrap(performanceResults).then((results) => {
            const avgSpeedup = results.reduce((sum, r) => sum + r.speedup, 0) / results.length
            const minSpeedup = Math.min(...results.map(r => r.speedup))
            
            expect(avgSpeedup).to.be.greaterThan(5, `Average speedup should be >5x, got ${avgSpeedup.toFixed(1)}x`)
            expect(minSpeedup).to.be.greaterThan(2, `Minimum speedup should be >2x, got ${minSpeedup.toFixed(1)}x`)
            
            cy.log(`Performance Summary - Avg Speedup: ${avgSpeedup.toFixed(1)}x, Min: ${minSpeedup.toFixed(1)}x`)
            
            results.forEach(result => {
              cy.log(`  ${result.screen}: ${result.coldTime}ms → ${result.warmTime}ms (${result.speedup.toFixed(1)}x)`)
            })
          })
          return
        }

        const screen = MORTGAGE_SCREENS[screenIndex]
        const testUrl = `${API_BASE}/content/${screen}/en`
        
        // Cold request
        const coldStart = Date.now()
        cy.request(testUrl).then(response1 => {
          const coldTime = Date.now() - coldStart
          
          if (response1.status === 200) {
            // Warm request
            const warmStart = Date.now()
            cy.request(testUrl).then(response2 => {
              const warmTime = Date.now() - warmStart
              const speedup = coldTime / warmTime
              
              performanceResults.push({ screen, coldTime, warmTime, speedup })
              
              // Test next screen
              testScreen(screenIndex + 1)
            })
          } else {
            // Skip screen with no content
            testScreen(screenIndex + 1)
          }
        })
      }

      testScreen(0)
    })
  })

  // Test concurrent performance
  describe('Concurrent Request Performance', () => {
    it('should handle multiple concurrent requests efficiently', () => {
      const testUrl = `${API_BASE}/content/mortgage_step1/en`
      const concurrentCount = 10
      
      // Clear cache first
      cy.request({
        method: 'POST',
        url: `${API_BASE}/content/cache/clear`,
        failOnStatusCode: false
      })

      // Create concurrent requests
      const concurrentRequests = Array(concurrentCount).fill(null).map((_, index) => {
        const start = Date.now()
        return cy.request(testUrl).then(response => {
          const time = Date.now() - start
          expect(response.status).to.equal(200)
          return { index, time, dataSize: JSON.stringify(response.body).length }
        })
      })

      cy.wrap(Promise.all(concurrentRequests)).then((results: any[]) => {
        const times = results.map(r => r.time)
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
        const maxTime = Math.max(...times)
        const minTime = Math.min(...times)
        
        // Under concurrent load, average should still be reasonable
        expect(avgTime).to.be.lessThan(PERFORMANCE_TARGET * 2, 
          `Average concurrent response time should be <${PERFORMANCE_TARGET * 2}ms, got ${avgTime.toFixed(1)}ms`)
        
        // Most requests should complete quickly due to caching after first
        const fastRequests = times.filter(t => t < 100).length
        expect(fastRequests).to.be.greaterThan(concurrentCount * 0.7, 
          `At least 70% of requests should be fast (<100ms), got ${fastRequests}/${concurrentCount}`)
        
        cy.log(`Concurrent Performance (${concurrentCount} requests):`)
        cy.log(`  Average: ${avgTime.toFixed(1)}ms`)
        cy.log(`  Range: ${minTime}ms - ${maxTime}ms`)
        cy.log(`  Fast requests (<100ms): ${fastRequests}/${concurrentCount}`)
      })
    })

    it('should maintain performance across different languages', () => {
      const testScreen = 'mortgage_step1'
      
      // Clear cache first
      cy.request({
        method: 'POST',
        url: `${API_BASE}/content/cache/clear`,
        failOnStatusCode: false
      })

      // Test each language
      const languageTests = LANGUAGES.map(lang => {
        const start = Date.now()
        return cy.request(`${API_BASE}/content/${testScreen}/${lang}`).then(response => {
          const time = Date.now() - start
          expect(response.status).to.equal(200)
          return { lang, time }
        })
      })

      cy.wrap(Promise.all(languageTests)).then((results: any[]) => {
        const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length
        
        expect(avgTime).to.be.lessThan(PERFORMANCE_TARGET, 
          `Average multi-language response time should be <${PERFORMANCE_TARGET}ms, got ${avgTime.toFixed(1)}ms`)
        
        results.forEach(result => {
          expect(result.time).to.be.lessThan(PERFORMANCE_TARGET * 1.5, 
            `${result.lang} response time should be reasonable`)
        })
        
        cy.log(`Multi-language Performance:`)
        results.forEach(result => {
          cy.log(`  ${result.lang}: ${result.time}ms`)
        })
        cy.log(`  Average: ${avgTime.toFixed(1)}ms`)
      })
    })
  })

  // Test memory and payload efficiency
  describe('Payload Efficiency', () => {
    it('should return reasonably sized payloads', () => {
      cy.request(`${API_BASE}/content/mortgage_step1/en`).then(response => {
        const payloadSize = JSON.stringify(response.body).length
        const payloadKB = (payloadSize / 1024).toFixed(1)
        
        // Payload should be reasonable (not too large)
        expect(payloadSize).to.be.lessThan(100000, 
          `Payload size should be <100KB, got ${payloadKB}KB`)
        
        // Should have substantial content
        expect(payloadSize).to.be.greaterThan(1000, 
          `Payload should have substantial content, got ${payloadKB}KB`)
        
        cy.log(`Content API payload size: ${payloadKB}KB`)
      })
    })

    it('should have efficient dropdowns API payload', () => {
      cy.request(`${API_BASE}/dropdowns/mortgage_step1/en`).then(response => {
        const payloadSize = JSON.stringify(response.body).length
        const payloadKB = (payloadSize / 1024).toFixed(1)
        
        // Structured format should be reasonably efficient
        expect(payloadSize).to.be.lessThan(50000, 
          `Dropdowns payload should be <50KB, got ${payloadKB}KB`)
        
        const { dropdowns, options } = response.body
        const dropdownCount = dropdowns.length
        const totalOptions = Object.values(options).reduce((sum: number, opts: any) => sum + opts.length, 0)
        
        cy.log(`Dropdowns API payload: ${payloadKB}KB for ${dropdownCount} dropdowns, ${totalOptions} total options`)
        cy.log(`Efficiency: ${(payloadSize / totalOptions).toFixed(0)} bytes per option`)
      })
    })
  })

  // Test cache efficiency
  describe('Cache Efficiency Metrics', () => {
    it('should achieve high cache hit rates', () => {
      const testUrls = [
        `${API_BASE}/content/mortgage_step1/en`,
        `${API_BASE}/content/mortgage_step2/en`,
        `${API_BASE}/dropdowns/mortgage_step1/en`
      ]
      
      // Clear cache and get baseline
      cy.request({
        method: 'POST',
        url: `${API_BASE}/content/cache/clear`,
        failOnStatusCode: false
      })

      // Make requests to populate cache
      const populateRequests = testUrls.map(url => cy.request(url))
      
      cy.wrap(Promise.all(populateRequests)).then(() => {
        // Make same requests again (should hit cache)
        const cacheHitRequests = testUrls.map(url => cy.request(url))
        
        cy.wrap(Promise.all(cacheHitRequests)).then(() => {
          // Check cache statistics
          cy.request(`${API_BASE}/content/cache/stats`).then(response => {
            const stats = response.body.cache_stats
            
            // Should have reasonable hit rate
            expect(stats.hit_rate).to.be.greaterThan(0.5, 
              `Cache hit rate should be >50%, got ${(stats.hit_rate * 100).toFixed(1)}%`)
            
            cy.log(`Cache Efficiency Metrics:`)
            cy.log(`  Hit Rate: ${(stats.hit_rate * 100).toFixed(1)}%`)
            cy.log(`  Hits: ${stats.hits}, Misses: ${stats.misses}`)
            cy.log(`  Keys: ${stats.keys}`)
          })
        })
      })
    })
  })
})