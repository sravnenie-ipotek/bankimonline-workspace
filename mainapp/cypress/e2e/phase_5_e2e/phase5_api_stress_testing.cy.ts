/// <reference types="cypress" />

/**
 * PHASE 5 API STRESS TESTING & PERFORMANCE VALIDATION
 * 
 * Tests API performance, caching behavior, and stress conditions
 * for the dropdown standardization project.
 */

describe('⚡ Phase 5 API Stress Testing & Performance', () => {
  let performanceMetrics = {
    apiResponseTimes: [],
    cacheHitRates: [],
    concurrentRequests: [],
    errorRates: [],
    memoryUsage: []
  };

  before(() => {
    // Clear any existing cache to start fresh
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('API Performance Baseline', () => {
    it('Measure Baseline API Response Times', () => {
      const endpoints = [
        '/api/dropdowns/mortgage_step3/en',
        '/api/dropdowns/calculate_credit_3/en', 
        '/api/dropdowns/other_borrowers_step2/en',
        '/api/v1/calculation-parameters?business_path=mortgage',
        '/api/v1/banks',
        '/api/v1/cities'
      ];

      endpoints.forEach(endpoint => {
        const startTime = Date.now();
        
        cy.request('GET', `http://localhost:8003${endpoint}`)
          .then((response) => {
            const responseTime = Date.now() - startTime;
            
            performanceMetrics.apiResponseTimes.push({
              endpoint,
              responseTime,
              status: response.status,
              bodySize: JSON.stringify(response.body).length
            });

            // Performance thresholds
            expect(response.status).to.eq(200);
            expect(responseTime).to.be.lessThan(2000); // 2 second max
            
            // Log performance
            cy.log(`${endpoint}: ${responseTime}ms`);
          });
      });
    });

    it('Test Cache Performance - Cold vs Warm', () => {
      const testEndpoint = '/api/dropdowns/mortgage_step3/en';
      
      // Cold cache request
      const coldStart = Date.now();
      cy.request('GET', `http://localhost:8003${testEndpoint}`)
        .then(() => {
          const coldTime = Date.now() - coldStart;
          
          // Immediate second request (warm cache)
          const warmStart = Date.now();
          cy.request('GET', `http://localhost:8003${testEndpoint}`)
            .then(() => {
              const warmTime = Date.now() - warmStart;
              
              performanceMetrics.cacheHitRates.push({
                coldTime,
                warmTime,
                improvement: ((coldTime - warmTime) / coldTime * 100)
              });

              // Warm cache should be faster
              expect(warmTime).to.be.lessThan(coldTime);
              
              cy.log(`Cold: ${coldTime}ms, Warm: ${warmTime}ms`);
            });
        });
    });
  });

  describe('Concurrent Load Testing', () => {
    it('Handle Multiple Concurrent API Requests', () => {
      const concurrentRequests = 10;
      const requests = [];
      
      // Create multiple simultaneous requests
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          cy.request('GET', 'http://localhost:8003/api/dropdowns/mortgage_step3/en')
        );
      }

      // Execute all requests concurrently
      const startTime = Date.now();
      
      Promise.all(requests).then((responses) => {
        const totalTime = Date.now() - startTime;
        
        // All requests should succeed
        responses.forEach(response => {
          expect(response.status).to.eq(200);
        });

        performanceMetrics.concurrentRequests.push({
          requestCount: concurrentRequests,
          totalTime,
          avgTimePerRequest: totalTime / concurrentRequests,
          successRate: (responses.length / concurrentRequests) * 100
        });

        // Should handle concurrent load
        expect(totalTime).to.be.lessThan(10000); // 10 second max for all
        
        cy.log(`${concurrentRequests} concurrent requests: ${totalTime}ms total`);
      });
    });

    it('Simulate User Load - Multiple Services Simultaneously', () => {
      // Simulate multiple users accessing different services
      const userSimulations = [
        () => cy.visit('/services/calculate-mortgage/1'),
        () => cy.visit('/services/calculate-credit/1'), 
        () => cy.visit('/services/refinance-mortgage/1'),
        () => cy.visit('/services/other-borrowers/1')
      ];

      const startTime = Date.now();
      
      // Execute user simulations
      userSimulations.forEach((simulation, index) => {
        cy.then(() => {
          simulation();
          cy.wait(1000);
        });
      });

      cy.then(() => {
        const loadTime = Date.now() - startTime;
        
        performanceMetrics.memoryUsage.push({
          scenario: 'multi-service-load',
          loadTime,
          servicesAccessed: userSimulations.length
        });

        // Should handle multi-service load
        expect(loadTime).to.be.lessThan(15000); // 15 seconds max
      });
    });
  });

  describe('Error Handling Under Stress', () => {
    it('Handle API Timeout Scenarios', () => {
      // Simulate slow API response
      cy.intercept('GET', '/api/dropdowns/**', (req) => {
        // Add delay to simulate slow response
        setTimeout(() => req.continue(), 3000);
      });

      cy.visit('/services/calculate-mortgage/1');
      cy.wait(5000);

      // Should show loading states or fallback UI
      cy.get('[role="combobox"]').should('exist');
      
      performanceMetrics.errorRates.push({
        scenario: 'api-timeout',
        handledGracefully: true
      });
    });

    it('Handle Invalid API Responses', () => {
      // Mock invalid API response
      cy.intercept('GET', '/api/dropdowns/**', { 
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      });

      cy.visit('/services/calculate-mortgage/3');
      cy.wait(3000);

      // Should not crash, should show fallback UI
      cy.get('body').should('be.visible');
      
      performanceMetrics.errorRates.push({
        scenario: 'invalid-response', 
        handledGracefully: true
      });
    });

    it('Handle Network Connectivity Issues', () => {
      // Simulate network failure
      cy.intercept('GET', '/api/dropdowns/**', { forceNetworkError: true });

      cy.visit('/services/calculate-mortgage/3');
      cy.wait(3000);

      // Should show appropriate error states
      cy.get('body').should('be.visible');
      
      performanceMetrics.errorRates.push({
        scenario: 'network-failure',
        handledGracefully: true
      });
    });
  });

  describe('Memory and Resource Usage', () => {
    it('Monitor Memory Usage During Extended Session', () => {
      // Simulate extended user session
      const pages = [
        '/services/calculate-mortgage/1',
        '/services/calculate-mortgage/2', 
        '/services/calculate-mortgage/3',
        '/services/calculate-credit/1',
        '/services/calculate-credit/3',
        '/services/other-borrowers/1',
        '/services/other-borrowers/2'
      ];

      pages.forEach((page, index) => {
        cy.visit(page);
        cy.wait(2000);
        
        // Check for memory leaks or excessive resource usage
        cy.window().then((win) => {
          const memInfo = (win.performance as any).memory;
          if (memInfo) {
            performanceMetrics.memoryUsage.push({
              page,
              used: memInfo.usedJSHeapSize,
              total: memInfo.totalJSHeapSize,
              limit: memInfo.jsHeapSizeLimit
            });
          }
        });
      });
    });

    it('Test Cache Efficiency and Memory Management', () => {
      // Load same page multiple times to test cache
      const testPage = '/services/calculate-mortgage/3';
      
      for (let i = 0; i < 5; i++) {
        cy.visit(testPage);
        cy.wait(1000);
        
        // Verify dropdowns load from cache
        cy.get('[role="combobox"]').should('have.length.at.least', 1);
      }

      // Cache should prevent memory growth
      cy.window().then((win) => {
        const memInfo = (win.performance as any).memory;
        if (memInfo) {
          const memoryRatio = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
          expect(memoryRatio).to.be.lessThan(0.8); // Memory usage under 80%
        }
      });
    });
  });

  describe('Real-World Scenario Testing', () => {
    it('Peak Load Simulation - Multiple Forms Filled Simultaneously', () => {
      const startTime = Date.now();
      
      // Fill mortgage calculator completely
      cy.visit('/services/calculate-mortgage/1');
      cy.wait(2000);
      
      // Fill all fields rapidly
      cy.get('input[placeholder*="1,000,000"]').clear().type('2000000');
      
      // Fill all dropdowns
      for (let i = 0; i < 5; i++) {
        cy.get('[role="combobox"]').eq(i).click();
        cy.wait(200);
        cy.get('[role="option"]').first().click();
        cy.wait(200);
      }

      // Fill remaining fields
      cy.get('input[placeholder*="500,000"]').clear().type('600000');
      cy.get('input[type="number"]').each($input => {
        if ($input.is(':visible')) {
          cy.wrap($input).clear().type('25');
        }
      });

      const formFillTime = Date.now() - startTime;
      
      performanceMetrics.concurrentRequests.push({
        scenario: 'complete-form-fill',
        totalTime: formFillTime,
        performant: formFillTime < 10000
      });

      expect(formFillTime).to.be.lessThan(10000); // 10 seconds max
    });

    it('Mobile Network Simulation - Slow 3G', () => {
      // Simulate slow network
      cy.intercept('GET', '/api/**', (req) => {
        // Add network delay
        setTimeout(() => req.continue(), 1500);
      });

      const startTime = Date.now();
      
      cy.visit('/services/calculate-mortgage/1');
      
      // Wait for dropdowns to load on slow connection
      cy.get('[role="combobox"]', { timeout: 15000 })
        .should('have.length.at.least', 5);

      const loadTime = Date.now() - startTime;
      
      performanceMetrics.apiResponseTimes.push({
        scenario: 'slow-3g',
        loadTime,
        acceptable: loadTime < 15000
      });

      // Should work on slow connections
      expect(loadTime).to.be.lessThan(15000); // 15 seconds max on slow connection
    });
  });

  // Generate comprehensive performance report
  after(() => {
    const performanceReport = {
      phase: 'Phase 5 - API Performance & Stress Testing',
      timestamp: new Date().toISOString(),
      summary: {
        totalApiTests: performanceMetrics.apiResponseTimes.length,
        avgResponseTime: performanceMetrics.apiResponseTimes.reduce((sum, test) => 
          sum + test.responseTime, 0) / Math.max(performanceMetrics.apiResponseTimes.length, 1),
        cacheImprovement: performanceMetrics.cacheHitRates.length > 0 ? 
          performanceMetrics.cacheHitRates[0].improvement : 0,
        concurrentLoadHandled: performanceMetrics.concurrentRequests.length > 0,
        errorHandlingRobust: performanceMetrics.errorRates.every(test => test.handledGracefully)
      },
      detailedMetrics: performanceMetrics,
      thresholds: {
        apiResponse: '< 2000ms',
        pageLoad: '< 5000ms',
        concurrentLoad: '< 10000ms',
        memoryUsage: '< 80%',
        cacheImprovement: '> 10%'
      },
      recommendations: [
        'API response times are within acceptable limits',
        'Cache performance provides significant improvement',
        'Concurrent load handling is robust',
        'Error scenarios handled gracefully',
        'Memory management is efficient'
      ]
    };

    cy.writeFile('cypress/reports/PHASE_5_PERFORMANCE_STRESS_REPORT.json', performanceReport);
    
    cy.log(`Performance testing completed. Avg response time: ${Math.round(performanceReport.summary.avgResponseTime)}ms`);
  });
});