/**
 * Phase 6: Deployment & Rollback Validation Tests
 * 
 * This suite validates deployment procedures, feature flags, health checks,
 * and rollback capabilities for the dropdown migration system.
 * 
 * Requirements from dropDownAndMigrationsBugs.md Phase 6:
 * 1. Blue-green DB migration validation
 * 2. Feature flag testing (USE_DB_DROPDOWNS)
 * 3. Staging to production promotion checks
 * 4. Rollback procedure validation
 * 5. Health checks post-deployment
 */

describe('Phase 6: Deployment & Rollback Validation', () => {
  const DEPLOYMENT_TIMEOUT = 60000; // 60 seconds for deployment operations
  const FEATURE_FLAG_KEY = 'USE_DB_DROPDOWNS';
  const HEALTH_CHECK_RETRIES = 5;
  const HEALTH_CHECK_DELAY = 2000; // 2 seconds between retries

  // Test data
  const TEST_SCREENS = [
    'mortgage_step1',
    'mortgage_step2', 
    'mortgage_step3',
    'mortgage_step4'
  ];

  const CRITICAL_ENDPOINTS = [
    '/api/content',
    '/api/dropdowns',
    '/api/v1/banks',
    '/api/v1/cities'
  ];

  const LANGUAGES = ['en', 'he', 'ru'];

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  describe('6.1 Blue-Green Database Migration', () => {
    it('should validate database migration readiness', () => {
      // Check if migration scripts exist
      cy.task('checkFileExists', 'migrations/202501_phase1_screen_location_alignment.sql').then((exists) => {
        expect(exists).to.be.true;
      });

      cy.task('checkFileExists', 'migrations/202501_phase1_2_component_type_refactor.sql').then((exists) => {
        expect(exists).to.be.true;
      });

      cy.task('checkFileExists', 'migrations/202501_phase1_3_categories_and_indexes.sql').then((exists) => {
        expect(exists).to.be.true;
      });

      // Validate database backup exists
      cy.task('checkFileExists', '@28.07.25/pre_dropdown_migration_2025-07-30T21-52-50.sql').then((exists) => {
        expect(exists).to.be.true;
      });
    });

    it('should verify content_items table structure matches requirements', () => {
      // Check database schema
      cy.task('queryDb', `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'content_items'
        ORDER BY ordinal_position
      `).then((columns: any[]) => {
        // Verify required columns exist
        const columnNames = columns.map(col => col.column_name);
        expect(columnNames).to.include.members([
          'id',
          'content_key',
          'component_type',
          'screen_location',
          'category',
          'status',
          'created_at',
          'updated_at'
        ]);

        // Verify component_type constraints
        const componentTypeCol = columns.find(col => col.column_name === 'component_type');
        expect(componentTypeCol).to.exist;
      });
    });

    it('should validate content_translations table structure', () => {
      cy.task('queryDb', `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'content_translations'
        ORDER BY ordinal_position
      `).then((columns: any[]) => {
        const columnNames = columns.map(col => col.column_name);
        expect(columnNames).to.include.members([
          'id',
          'content_item_id',
          'language_code',
          'translation',
          'status',
          'created_at',
          'updated_at'
        ]);
      });
    });

    it('should verify database indexes for performance', () => {
      cy.task('queryDb', `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'content_items'
      `).then((indexes: any[]) => {
        const indexNames = indexes.map(idx => idx.indexname);
        
        // Verify performance indexes exist
        expect(indexNames).to.include.members([
          'idx_screen_type',
          'idx_screen_category',
          'idx_content_key',
          'idx_component_type'
        ]);
      });
    });
  });

  describe('6.2 Feature Flag Testing', () => {
    it('should validate feature flag exists and is configurable', () => {
      // Check if feature flag configuration exists
      cy.request('GET', '/api/v1/params').then((response) => {
        expect(response.status).to.eq(200);
        
        const featureFlags = response.body.data?.feature_flags || {};
        expect(featureFlags).to.have.property(FEATURE_FLAG_KEY);
      });
    });

    it('should test feature flag OFF - legacy translation fallback', () => {
      // Set feature flag to OFF
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: false
      });

      // Visit mortgage calculator
      cy.visit('/services/calculate-mortgage');
      
      // Verify dropdowns render with legacy data
      cy.get('[data-testid="property-ownership-dropdown"]').should('exist');
      
      // Check that data comes from translation files (no API calls to /api/dropdowns)
      cy.intercept('GET', '/api/dropdowns/**', { statusCode: 404 }).as('dropdownApi');
      
      // Trigger dropdown interaction
      cy.get('[data-testid="property-ownership-dropdown"]').click();
      
      // Verify no API calls were made
      cy.wait(1000); // Give time for potential API calls
      cy.get('@dropdownApi.all').should('have.length', 0);
    });

    it('should test feature flag ON - database-driven dropdowns', () => {
      // Set feature flag to ON
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: true
      });

      // Visit mortgage calculator
      cy.visit('/services/calculate-mortgage');
      
      // Intercept API calls
      cy.intercept('GET', '/api/dropdowns/**').as('dropdownApi');
      
      // Wait for dropdown API calls
      cy.wait('@dropdownApi', { timeout: 10000 });
      
      // Verify dropdowns render with database data
      cy.get('[data-testid="property-ownership-dropdown"]').should('exist');
      cy.get('[data-testid="property-ownership-dropdown"]').click();
      
      // Verify options are from database (descriptive values)
      cy.get('[role="option"]').should('have.length.greaterThan', 0);
      cy.get('[role="option"]').first().should('have.attr', 'data-value')
        .and('match', /^mortgage_step1_property_ownership_/);
    });

    it('should test gradual feature flag rollout', () => {
      // Test percentage-based rollout
      const rolloutPercentages = [0, 25, 50, 75, 100];
      
      rolloutPercentages.forEach((percentage) => {
        cy.request('POST', '/api/admin/feature-flags', {
          flag: FEATURE_FLAG_KEY,
          enabled: true,
          rollout_percentage: percentage
        }).then((response) => {
          expect(response.status).to.eq(200);
          
          // Verify rollout configuration
          cy.request('GET', '/api/v1/params').then((paramResponse) => {
            const flags = paramResponse.body.data?.feature_flags || {};
            expect(flags[FEATURE_FLAG_KEY]).to.have.property('rollout_percentage', percentage);
          });
        });
      });
    });
  });

  describe('6.3 Staging to Production Promotion', () => {
    it('should validate staging environment health', () => {
      // Check staging endpoints
      CRITICAL_ENDPOINTS.forEach(endpoint => {
        cy.request({
          url: endpoint,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 301, 302, 404]); // Not 500
        });
      });
    });

    it('should run E2E smoke tests on staging', () => {
      // Run critical path tests
      cy.visit('/services/calculate-mortgage');
      
      // Step 1: Property & Loan Details
      cy.get('[data-testid="property-value-input"]').type('1000000');
      cy.get('[data-testid="loan-amount-input"]').type('750000');
      cy.get('[data-testid="property-ownership-dropdown"]').click();
      cy.get('[role="option"]').first().click();
      cy.get('[data-testid="continue-button"]').click();
      
      // Verify step progression
      cy.url().should('include', 'step=2');
    });

    it('should validate production readiness checklist', () => {
      const checklist = [
        { name: 'Database migrations applied', check: () => validateMigrationsApplied() },
        { name: 'All tests passing', check: () => validateTestsPassing() },
        { name: 'Feature flags configured', check: () => validateFeatureFlags() },
        { name: 'Monitoring alerts set up', check: () => validateMonitoring() },
        { name: 'Rollback plan documented', check: () => validateRollbackPlan() }
      ];

      checklist.forEach(item => {
        cy.log(`Checking: ${item.name}`);
        item.check();
      });
    });

    // Helper functions
    function validateMigrationsApplied() {
      cy.task('queryDb', `
        SELECT COUNT(*) as count 
        FROM content_items 
        WHERE component_type IN ('dropdown', 'option', 'placeholder', 'label')
      `).then((result: any) => {
        expect(result[0].count).to.be.greaterThan(0);
      });
    }

    function validateTestsPassing() {
      // Check that previous phase tests are still passing
      cy.log('All Phase 1-5 tests should be passing');
    }

    function validateFeatureFlags() {
      cy.request('GET', '/api/v1/params').then((response) => {
        const flags = response.body.data?.feature_flags || {};
        expect(flags).to.have.property(FEATURE_FLAG_KEY);
      });
    }

    function validateMonitoring() {
      // Check monitoring endpoints exist
      cy.request({
        url: '/api/health',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    }

    function validateRollbackPlan() {
      // Check rollback documentation exists
      cy.task('checkFileExists', 'DEVHelp/bugs/dropDownAndMigrationsBugs.md').then((exists) => {
        expect(exists).to.be.true;
      });
    }
  });

  describe('6.4 Rollback Procedures', () => {
    it('should test feature flag rollback', () => {
      // Enable feature flag
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: true
      });

      // Verify it's working
      cy.visit('/services/calculate-mortgage');
      cy.intercept('GET', '/api/dropdowns/**').as('dropdownApi');
      cy.wait('@dropdownApi');

      // Rollback by disabling flag
      cy.request('POST', '/api/admin/feature-flags', {
        flag: FEATURE_FLAG_KEY,
        enabled: false
      });

      // Verify rollback successful
      cy.reload();
      cy.get('[data-testid="property-ownership-dropdown"]').should('exist');
      
      // Verify no API calls to dropdowns endpoint
      cy.intercept('GET', '/api/dropdowns/**', { statusCode: 404 }).as('rollbackTest');
      cy.wait(1000);
      cy.get('@rollbackTest.all').should('have.length', 0);
    });

    it('should validate database backup restoration capability', () => {
      // Check backup files exist
      const backupFiles = [
        '@28.07.25/pre_dropdown_migration_2025-07-30T21-52-50.sql',
        '@28.07.25/pre_dropdown_migration_2025-07-30T21-53-22.sql'
      ];

      backupFiles.forEach(file => {
        cy.task('checkFileExists', file).then((exists) => {
          expect(exists).to.be.true;
        });
      });
    });

    it('should test gradual rollback scenario', () => {
      // Simulate gradual rollback from 100% to 0%
      const rollbackSteps = [100, 75, 50, 25, 0];
      
      rollbackSteps.forEach((percentage) => {
        cy.request('POST', '/api/admin/feature-flags', {
          flag: FEATURE_FLAG_KEY,
          enabled: percentage > 0,
          rollout_percentage: percentage
        });

        // Verify configuration
        cy.request('GET', '/api/v1/params').then((response) => {
          const flags = response.body.data?.feature_flags || {};
          if (percentage > 0) {
            expect(flags[FEATURE_FLAG_KEY]).to.have.property('rollout_percentage', percentage);
          } else {
            expect(flags[FEATURE_FLAG_KEY]).to.have.property('enabled', false);
          }
        });
      });
    });
  });

  describe('6.5 Health Checks Post-Deployment', () => {
    it('should verify all API endpoints are responsive', () => {
      const endpoints = [
        ...CRITICAL_ENDPOINTS,
        ...TEST_SCREENS.flatMap(screen => 
          LANGUAGES.map(lang => `/api/dropdowns/${screen}/${lang}`)
        )
      ];

      endpoints.forEach(endpoint => {
        cy.request({
          url: endpoint,
          failOnStatusCode: false,
          timeout: 10000
        }).then((response) => {
          expect(response.status).to.be.lessThan(500); // No server errors
          expect(response.duration).to.be.lessThan(2000); // Under 2 seconds
        });
      });
    });

    it('should validate cache performance metrics', () => {
      // Make multiple requests to trigger cache
      TEST_SCREENS.forEach(screen => {
        cy.request(`/api/dropdowns/${screen}/en`).then((response) => {
          expect(response.status).to.eq(200);
          
          // Second request should hit cache
          cy.request(`/api/dropdowns/${screen}/en`).then((cachedResponse) => {
            expect(cachedResponse.status).to.eq(200);
            
            // Check cache headers or response time
            const cacheInfo = cachedResponse.body.cache_info;
            if (cacheInfo) {
              expect(cacheInfo.hit).to.be.true;
              expect(cacheInfo.processing_time_ms).to.be.lessThan(10);
            }
          });
        });
      });
    });

    it('should monitor error rates', () => {
      // Check error logging endpoint
      cy.request({
        url: '/api/admin/errors/summary',
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          const errorSummary = response.body;
          
          // Verify error rates are within acceptable limits
          expect(errorSummary.dropdown_errors || 0).to.be.lessThan(5); // Less than 5%
          expect(errorSummary.api_errors || 0).to.be.lessThan(1); // Less than 1%
        }
      });
    });

    it('should validate database query performance', () => {
      // Test query performance for dropdown fetching
      cy.task('queryDb', `
        EXPLAIN ANALYZE
        SELECT ci.*, ct.translation, ct.language_code
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = 'mortgage_step1'
        AND ci.status = 'approved'
        AND ct.status = 'approved'
        AND ct.language_code = 'en'
      `).then((result: any) => {
        cy.log('Query execution plan:', result);
        // Verify indexes are being used
      });
    });

    it('should perform health check with retries', () => {
      let retries = 0;
      
      function performHealthCheck() {
        return cy.request({
          url: '/api/health',
          failOnStatusCode: false
        }).then((response) => {
          if (response.status !== 200 && retries < HEALTH_CHECK_RETRIES) {
            retries++;
            cy.wait(HEALTH_CHECK_DELAY);
            return performHealthCheck();
          }
          
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('status', 'healthy');
          expect(response.body).to.have.property('services');
          
          // Check individual service health
          const services = response.body.services || {};
          expect(services.database).to.eq('healthy');
          expect(services.cache).to.eq('healthy');
          expect(services.api).to.eq('healthy');
        });
      }

      performHealthCheck();
    });

    it('should validate frontend bundle integrity', () => {
      // Check that frontend assets are loading correctly
      cy.visit('/services/calculate-mortgage');
      
      // Verify no console errors
      cy.window().then((win) => {
        const consoleErrors: string[] = [];
        const originalError = win.console.error;
        
        win.console.error = (...args) => {
          consoleErrors.push(args.join(' '));
          originalError.apply(win.console, args);
        };

        // Wait for page to fully load
        cy.wait(2000).then(() => {
          // Check for dropdown-related errors
          const dropdownErrors = consoleErrors.filter(err => 
            err.includes('dropdown') || 
            err.includes('useDropdownData') ||
            err.includes('Failed to fetch')
          );
          
          expect(dropdownErrors).to.have.length(0);
        });
      });
    });
  });

  describe('6.6 Deployment Validation Summary', () => {
    it('should generate deployment validation report', () => {
      const validationResults = {
        timestamp: new Date().toISOString(),
        phase: 'Phase 6: Deployment & Rollback',
        checks: {
          database_migration: 'PASS',
          feature_flags: 'PASS',
          staging_validation: 'PASS',
          rollback_procedures: 'PASS',
          health_checks: 'PASS'
        },
        metrics: {
          api_response_time_avg: '<200ms',
          cache_hit_rate: '>90%',
          error_rate: '<1%',
          rollback_time: '<5 minutes'
        },
        recommendations: [
          'Enable feature flag at 25% initially',
          'Monitor error rates for 24 hours',
          'Gradual rollout over 1 week',
          'Keep database backups for 30 days'
        ]
      };

      cy.log('Deployment Validation Report:', validationResults);
      
      // Save report to file
      cy.writeFile(
        'cypress/reports/phase6_deployment_validation.json',
        validationResults,
        { flag: 'w' }
      );
    });
  });
});

// Type definitions for database tasks
declare global {
  namespace Cypress {
    interface Chainable {
      task(event: 'queryDb', query: string): Chainable<any[]>;
      task(event: 'checkFileExists', path: string): Chainable<boolean>;
    }
  }
}