/**
 * Phase 6: Feature Flag Testing
 * 
 * Comprehensive tests for feature flag functionality, gradual rollout,
 * and A/B testing capabilities for the dropdown migration.
 */

describe('Phase 6: Feature Flag Validation', () => {
  const FEATURE_FLAG_KEY = 'USE_DB_DROPDOWNS';
  const TEST_USER_COHORTS = 100; // Number of users to test for percentage rollout
  
  beforeEach(() => {
    cy.viewport(1920, 1080);
    // Reset feature flags to known state
    cy.request('POST', '/api/admin/feature-flags/reset');
  });

  describe('Feature Flag Configuration', () => {
    it('should validate feature flag structure', () => {
      cy.request('GET', '/api/v1/params').then((response) => {
        expect(response.status).to.eq(200);
        
        const params = response.body.data || {};
        expect(params).to.have.property('feature_flags');
        
        const featureFlags = params.feature_flags || {};
        expect(featureFlags).to.have.property(FEATURE_FLAG_KEY);
        
        // Validate flag structure
        const flag = featureFlags[FEATURE_FLAG_KEY];
        expect(flag).to.have.all.keys([
          'enabled',
          'description',
          'rollout_percentage',
          'created_at',
          'updated_at'
        ]);
      });
    });

    it('should test feature flag toggle functionality', () => {
      // Test OFF state
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
      });

      // Verify OFF state
      cy.request('GET', `/api/v1/params/feature-flags/${FEATURE_FLAG_KEY}`).then((response) => {
        expect(response.body.enabled).to.be.false;
      });

      // Test ON state
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: true
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
      });

      // Verify ON state
      cy.request('GET', `/api/v1/params/feature-flags/${FEATURE_FLAG_KEY}`).then((response) => {
        expect(response.body.enabled).to.be.true;
      });
    });

    it('should validate percentage-based rollout', () => {
      const testPercentages = [0, 10, 25, 50, 75, 90, 100];
      
      testPercentages.forEach(percentage => {
        cy.request('POST', '/api/admin/feature-flags', {
          flag: FEATURE_FLAG_KEY,
          enabled: true,
          rollout_percentage: percentage
        }).then((response) => {
          expect(response.status).to.eq(200);
          
          // Verify percentage is set correctly
          cy.request('GET', `/api/v1/params/feature-flags/${FEATURE_FLAG_KEY}`).then((getResponse) => {
            expect(getResponse.body.rollout_percentage).to.eq(percentage);
          });
        });
      });
    });

    it('should test user cohort assignment for percentage rollout', () => {
      // Set 50% rollout
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: true,
        rollout_percentage: 50
      });

      let enabledCount = 0;
      let disabledCount = 0;

      // Test multiple user sessions
      for (let i = 0; i < TEST_USER_COHORTS; i++) {
        cy.request({
          url: '/api/feature-flags/check',
          headers: {
            'X-User-Id': `test-user-${i}`
          }
        }).then((response) => {
          if (response.body[FEATURE_FLAG_KEY]) {
            enabledCount++;
          } else {
            disabledCount++;
          }
        });
      }

      cy.then(() => {
        // Verify distribution is roughly 50/50 (allowing 10% variance)
        const enabledPercentage = (enabledCount / TEST_USER_COHORTS) * 100;
        expect(enabledPercentage).to.be.within(40, 60);
      });
    });
  });

  describe('Feature Flag Impact on Application', () => {
    it('should test legacy mode when flag is OFF', () => {
      // Disable feature flag
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: false
      });

      // Visit application
      cy.visit('/services/calculate-mortgage');

      // Intercept API calls to ensure they don't happen
      cy.intercept('GET', '/api/dropdowns/**', (req) => {
        throw new Error('Dropdown API should not be called when feature flag is OFF');
      }).as('dropdownApi');

      // Interact with dropdowns
      cy.get('[data-testid="property-ownership-dropdown"]').click();
      
      // Verify dropdown has options (from legacy source)
      cy.get('[role="option"]').should('have.length.greaterThan', 0);
      
      // Verify values are legacy format
      cy.get('[role="option"]').first().should('have.attr', 'data-value')
        .and('match', /^(option_1|option1|1)$/); // Legacy numeric pattern
    });

    it('should test database mode when flag is ON', () => {
      // Enable feature flag
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: true
      });

      // Visit application
      cy.visit('/services/calculate-mortgage');

      // Intercept API calls
      cy.intercept('GET', '/api/dropdowns/**').as('dropdownApi');

      // Wait for dropdown data to load
      cy.wait('@dropdownApi');

      // Interact with dropdowns
      cy.get('[data-testid="property-ownership-dropdown"]').click();
      
      // Verify dropdown has options (from database)
      cy.get('[role="option"]').should('have.length.greaterThan', 0);
      
      // Verify values are database format (descriptive)
      cy.get('[role="option"]').first().should('have.attr', 'data-value')
        .and('match', /^mortgage_step1_property_ownership_/);
    });

    it('should test feature flag persistence across sessions', () => {
      // Enable feature flag
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: true,
        rollout_percentage: 100
      });

      // First session
      cy.visit('/services/calculate-mortgage');
      cy.intercept('GET', '/api/dropdowns/**').as('dropdownApi1');
      cy.wait('@dropdownApi1');

      // Clear session and revisit
      cy.clearCookies();
      cy.clearLocalStorage();
      
      // Second session should still have flag enabled
      cy.visit('/services/calculate-mortgage');
      cy.intercept('GET', '/api/dropdowns/**').as('dropdownApi2');
      cy.wait('@dropdownApi2');
    });
  });

  describe('Feature Flag Safety Mechanisms', () => {
    it('should handle feature flag API failures gracefully', () => {
      // Simulate feature flag API failure
      cy.intercept('GET', '/api/v1/params/feature-flags/**', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('flagError');

      // Application should default to safe mode (legacy)
      cy.visit('/services/calculate-mortgage');
      
      // Should still render without errors
      cy.get('[data-testid="property-ownership-dropdown"]').should('exist');
    });

    it('should test feature flag override capabilities', () => {
      // Set flag to OFF globally
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: false
      });

      // Test query parameter override
      cy.visit('/services/calculate-mortgage?feature_USE_DB_DROPDOWNS=true');
      
      // Should use database dropdowns despite global flag
      cy.intercept('GET', '/api/dropdowns/**').as('overrideApi');
      cy.wait('@overrideApi');
    });

    it('should validate feature flag logging', () => {
      // Enable with 50% rollout
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: true,
        rollout_percentage: 50
      });

      // Make multiple requests
      const requests = Array.from({ length: 10 }, (_, i) => i);
      
      requests.forEach(i => {
        cy.request({
          url: '/api/feature-flags/check',
          headers: {
            'X-User-Id': `log-test-user-${i}`
          }
        });
      });

      // Check logs for feature flag decisions
      cy.request('/api/admin/logs/feature-flags').then((response) => {
        expect(response.body.logs).to.be.an('array');
        expect(response.body.logs.length).to.be.greaterThan(0);
        
        // Verify log structure
        const log = response.body.logs[0];
        expect(log).to.have.all.keys([
          'timestamp',
          'user_id',
          'flag_name',
          'decision',
          'rollout_percentage',
          'reason'
        ]);
      });
    });
  });

  describe('Feature Flag A/B Testing', () => {
    it('should track metrics for control vs treatment groups', () => {
      // Enable flag for 50% of users
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: true,
        rollout_percentage: 50
      });

      // Simulate users in control group (legacy)
      cy.request({
        url: '/api/metrics/track',
        method: 'POST',
        body: {
          event: 'dropdown_interaction',
          user_id: 'control-user-1',
          feature_flag: false,
          performance_ms: 150
        }
      });

      // Simulate users in treatment group (database)
      cy.request({
        url: '/api/metrics/track',
        method: 'POST',
        body: {
          event: 'dropdown_interaction',
          user_id: 'treatment-user-1',
          feature_flag: true,
          performance_ms: 50
        }
      });

      // Verify metrics collection
      cy.request('/api/admin/metrics/feature-flag-comparison').then((response) => {
        expect(response.body).to.have.property('control_group');
        expect(response.body).to.have.property('treatment_group');
        
        // Treatment group should show better performance
        expect(response.body.treatment_group.avg_performance_ms)
          .to.be.lessThan(response.body.control_group.avg_performance_ms);
      });
    });

    it('should validate gradual rollout progression', () => {
      const rolloutPlan = [
        { day: 1, percentage: 10 },
        { day: 2, percentage: 25 },
        { day: 3, percentage: 50 },
        { day: 4, percentage: 75 },
        { day: 5, percentage: 100 }
      ];

      rolloutPlan.forEach(({ day, percentage }) => {
        cy.log(`Day ${day}: Rolling out to ${percentage}%`);
        
        cy.request('POST', '/api/admin/feature-flags', {
          flag: FEATURE_FLAG_KEY,
          enabled: true,
          rollout_percentage: percentage,
          metadata: {
            rollout_day: day,
            rollout_started: new Date().toISOString()
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          
          // Verify metrics at each stage
          cy.request('/api/admin/metrics/rollout-health').then((metricsResponse) => {
            expect(metricsResponse.body.error_rate).to.be.lessThan(0.01); // <1% errors
            expect(metricsResponse.body.performance_improvement).to.be.greaterThan(0);
          });
        });
      });
    });
  });

  describe('Feature Flag Emergency Controls', () => {
    it('should test emergency kill switch', () => {
      // Enable feature flag
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: true,
        rollout_percentage: 100
      });

      // Trigger emergency kill switch
      cy.request('POST', '/api/admin/feature-flags/emergency-disable', {
        flag: FEATURE_FLAG_KEY,
        reason: 'High error rate detected'
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
      });

      // Verify flag is disabled
      cy.request('GET', `/api/v1/params/feature-flags/${FEATURE_FLAG_KEY}`).then((response) => {
        expect(response.body.enabled).to.be.false;
        expect(response.body.emergency_disabled).to.be.true;
        expect(response.body.disabled_reason).to.include('High error rate');
      });
    });

    it('should validate rollback with audit trail', () => {
      // Enable and then rollback
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: true,
        rollout_percentage: 100
      });

      cy.wait(1000); // Simulate some time passing

      cy.request('POST', '/api/admin/feature-flags/rollback', {
        flag: FEATURE_FLAG_KEY,
        reason: 'Performance degradation observed',
        rolled_back_by: 'cypress-test'
      });

      // Check audit trail
      cy.request('/api/admin/audit/feature-flags').then((response) => {
        const auditLogs = response.body.logs;
        expect(auditLogs).to.be.an('array');
        
        const rollbackLog = auditLogs.find(log => log.action === 'rollback');
        expect(rollbackLog).to.exist;
        expect(rollbackLog.reason).to.include('Performance degradation');
        expect(rollbackLog.user).to.eq('cypress-test');
      });
    });
  });
});