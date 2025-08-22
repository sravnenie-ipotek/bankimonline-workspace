/**
 * Comprehensive E2E QA Test Suite for Refinance Mortgage Translation System
 * Professional Bug Report Generator
 * Tests all dropdown headers and translation fallback mechanisms
 */

describe('Refinance Mortgage Translation System - Full QA Report', () => {
  const baseUrl = 'http://localhost:5173';
  const apiUrl = 'http://localhost:8003';
  const refinanceUrl = '/services/refinance-mortgage/1';
  
  // Bug tracking array for professional report
  let bugs: Array<{
    id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    location: string;
    element: string;
    expected: string;
    actual: string;
    impact: string;
    steps: string[];
    screenshot?: string;
  }> = [];

  before(() => {
    // Clear cache before testing
    cy.request('POST', `${apiUrl}/api/cache/clear`);
    bugs = [];
  });

  describe('1. Initial Page Load & API Health Check', () => {
    it('should verify API endpoints are functioning', () => {
      // Test content API
      cy.request(`${apiUrl}/api/content/refinance_step1/en`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('success');
        
        if (response.body.content_count < 10) {
          bugs.push({
            id: 'BUG-001',
            severity: 'HIGH',
            location: 'API: /api/content/refinance_step1/en',
            element: 'Content API Response',
            expected: 'Minimum 10 content items',
            actual: `Only ${response.body.content_count} items found`,
            impact: 'Incomplete translations on page',
            steps: [
              'Call GET /api/content/refinance_step1/en',
              'Check response.body.content_count'
            ]
          });
        }
      });

      // Test dropdown API
      cy.request(`${apiUrl}/api/dropdowns/refinance_step1/en`).then((response) => {
        expect(response.status).to.eq(200);
        
        if (!response.body.dropdowns || response.body.dropdowns.length === 0) {
          bugs.push({
            id: 'BUG-002',
            severity: 'CRITICAL',
            location: 'API: /api/dropdowns/refinance_step1/en',
            element: 'Dropdown API Response',
            expected: 'Array of dropdown configurations',
            actual: 'Empty or missing dropdowns array',
            impact: 'Dropdowns will not render properly',
            steps: [
              'Call GET /api/dropdowns/refinance_step1/en',
              'Check response.body.dropdowns'
            ]
          });
        }
      });
    });
  });

  describe('2. Refinance Mortgage Page - Dropdown Headers', () => {
    beforeEach(() => {
      cy.visit(refinanceUrl);
      cy.wait(1000); // Wait for translations to load
    });

    it('should check "Why are you refinancing?" dropdown', () => {
      // Check for the dropdown container
      cy.get('body').then($body => {
        // Look for dropdown by various possible selectors
        const selectors = [
          'label:contains("Why")',
          'label:contains("Purpose")',
          'label:contains("refinancing")',
          '[data-testid="why-dropdown"]',
          'select:first',
          '.dropdown-menu:first'
        ];
        
        let found = false;
        for (const selector of selectors) {
          if ($body.find(selector).length > 0) {
            found = true;
            cy.get(selector).first().then($el => {
              const text = $el.text().trim();
              
              // Check for raw keys
              if (text.includes('mortgage_refinance_why') || 
                  text.includes('app.refinance') ||
                  text === '' || 
                  text === 'undefined') {
                bugs.push({
                  id: 'BUG-003',
                  severity: 'HIGH',
                  location: refinanceUrl,
                  element: 'Why Refinancing Dropdown Label',
                  expected: 'Why are you refinancing?',
                  actual: text || '(empty)',
                  impact: 'User cannot understand dropdown purpose',
                  steps: [
                    `Navigate to ${refinanceUrl}`,
                    'Locate first dropdown label',
                    'Check label text content'
                  ],
                  screenshot: 'why-dropdown-issue.png'
                });
                cy.screenshot('why-dropdown-issue');
              }
            });
            break;
          }
        }
        
        if (!found) {
          bugs.push({
            id: 'BUG-004',
            severity: 'CRITICAL',
            location: refinanceUrl,
            element: 'Why Refinancing Dropdown',
            expected: 'Dropdown element present',
            actual: 'Dropdown not found on page',
            impact: 'Core functionality missing',
            steps: [
              `Navigate to ${refinanceUrl}`,
              'Search for dropdown elements',
              'No dropdown found'
            ],
            screenshot: 'missing-why-dropdown.png'
          });
          cy.screenshot('missing-why-dropdown');
        }
      });
    });

    it('should check "Property Type" dropdown', () => {
      cy.get('body').then($body => {
        const propertySelectors = [
          'label:contains("Property")',
          'label:contains("Type")',
          '[data-testid="property-type-dropdown"]',
          'select:eq(1)',
          '.dropdown-menu:eq(1)'
        ];
        
        let found = false;
        for (const selector of propertySelectors) {
          if ($body.find(selector).length > 0) {
            found = true;
            cy.get(selector).first().then($el => {
              const text = $el.text().trim();
              
              if (text.includes('mortgage_refinance_type') || 
                  text.includes('property_type') ||
                  text === '' || 
                  text === 'undefined') {
                bugs.push({
                  id: 'BUG-005',
                  severity: 'HIGH',
                  location: refinanceUrl,
                  element: 'Property Type Dropdown Label',
                  expected: 'Property Type',
                  actual: text || '(empty)',
                  impact: 'User cannot identify property selection field',
                  steps: [
                    `Navigate to ${refinanceUrl}`,
                    'Locate property type dropdown',
                    'Check label text content'
                  ],
                  screenshot: 'property-type-issue.png'
                });
                cy.screenshot('property-type-issue');
              }
            });
            break;
          }
        }
      });
    });

    it('should check "Current Bank" dropdown', () => {
      cy.get('body').then($body => {
        const bankSelectors = [
          'label:contains("Bank")',
          'label:contains("Current")',
          '[data-testid="bank-dropdown"]',
          'select:contains("Hapoalim")',
          '.dropdown-menu:contains("Bank")'
        ];
        
        let found = false;
        for (const selector of bankSelectors) {
          if ($body.find(selector).length > 0) {
            found = true;
            cy.get(selector).first().then($el => {
              const text = $el.text().trim();
              
              if (text.includes('mortgage_refinance_bank') || 
                  text === '' || 
                  text === 'undefined') {
                bugs.push({
                  id: 'BUG-006',
                  severity: 'HIGH',
                  location: refinanceUrl,
                  element: 'Current Bank Dropdown Label',
                  expected: 'Current Bank',
                  actual: text || '(empty)',
                  impact: 'User cannot select their current bank',
                  steps: [
                    `Navigate to ${refinanceUrl}`,
                    'Locate bank dropdown',
                    'Check label text content'
                  ],
                  screenshot: 'bank-dropdown-issue.png'
                });
                cy.screenshot('bank-dropdown-issue');
              }
            });
            break;
          }
        }
      });
    });

    it('should check "Property Registration" dropdown', () => {
      cy.get('body').then($body => {
        const registrationSelectors = [
          'label:contains("Registration")',
          'label:contains("Registered")',
          '[data-testid="registration-dropdown"]',
          'select:contains("registered")',
          '.dropdown-menu:contains("Registration")'
        ];
        
        let found = false;
        for (const selector of registrationSelectors) {
          if ($body.find(selector).length > 0) {
            found = true;
            cy.get(selector).first().then($el => {
              const text = $el.text().trim();
              
              if (text.includes('mortgage_refinance_registered') || 
                  text === '' || 
                  text === 'undefined') {
                bugs.push({
                  id: 'BUG-007',
                  severity: 'HIGH',
                  location: refinanceUrl,
                  element: 'Property Registration Dropdown Label',
                  expected: 'Property Registration',
                  actual: text || '(empty)',
                  impact: 'User cannot specify registration status',
                  steps: [
                    `Navigate to ${refinanceUrl}`,
                    'Locate registration dropdown',
                    'Check label text content'
                  ],
                  screenshot: 'registration-dropdown-issue.png'
                });
                cy.screenshot('registration-dropdown-issue');
              }
            });
            break;
          }
        }
      });
    });
  });

  describe('3. Translation Fallback Mechanism', () => {
    it('should test fallback when API fails', () => {
      // Intercept API calls to simulate failure
      cy.intercept('GET', '/api/content/**', { statusCode: 500 });
      cy.intercept('GET', '/api/dropdowns/**', { statusCode: 500 });
      
      cy.visit(refinanceUrl);
      cy.wait(1000);
      
      // Check if fallback translations are working
      cy.get('body').then($body => {
        const bodyText = $body.text();
        
        // Check for raw translation keys
        const rawKeys = [
          'mortgage_refinance_',
          'app.refinance.',
          'undefined',
          'null',
          '{{',
          '}}'
        ];
        
        rawKeys.forEach(key => {
          if (bodyText.includes(key)) {
            bugs.push({
              id: `BUG-008-${key}`,
              severity: 'CRITICAL',
              location: refinanceUrl,
              element: 'Translation Fallback System',
              expected: 'Proper fallback to JSON translations',
              actual: `Raw key "${key}" visible on page`,
              impact: 'Complete translation failure when API is down',
              steps: [
                'Simulate API failure (500 error)',
                `Navigate to ${refinanceUrl}`,
                'Check page content for raw keys'
              ],
              screenshot: 'fallback-failure.png'
            });
          }
        });
        
        if (bugs.filter(b => b.id.startsWith('BUG-008')).length > 0) {
          cy.screenshot('fallback-failure');
        }
      });
    });
  });

  describe('4. Multi-Language Support', () => {
    const languages = ['en', 'he', 'ru'];
    
    languages.forEach(lang => {
      it(`should verify translations in ${lang}`, () => {
        cy.visit(`${refinanceUrl}?lang=${lang}`);
        cy.wait(1000);
        
        // Check for language-specific issues
        cy.get('body').then($body => {
          const bodyText = $body.text();
          
          // Language-specific checks
          if (lang === 'he' && !$body.attr('dir')?.includes('rtl')) {
            bugs.push({
              id: 'BUG-009',
              severity: 'HIGH',
              location: `${refinanceUrl}?lang=he`,
              element: 'RTL Support',
              expected: 'dir="rtl" attribute on body',
              actual: 'RTL not applied',
              impact: 'Hebrew text displays incorrectly',
              steps: [
                `Navigate to ${refinanceUrl}?lang=he`,
                'Check body dir attribute'
              ]
            });
          }
          
          // Check for untranslated content
          if (lang !== 'en' && bodyText.match(/Why are you refinancing|Property Type|Current Bank/i)) {
            bugs.push({
              id: `BUG-010-${lang}`,
              severity: 'MEDIUM',
              location: `${refinanceUrl}?lang=${lang}`,
              element: 'Language Translation',
              expected: `All content in ${lang}`,
              actual: 'English text still visible',
              impact: 'Mixed language experience',
              steps: [
                `Navigate to ${refinanceUrl}?lang=${lang}`,
                'Check for English text'
              ],
              screenshot: `mixed-language-${lang}.png`
            });
            cy.screenshot(`mixed-language-${lang}`);
          }
        });
      });
    });
  });

  describe('5. Console Error Check', () => {
    it('should check for translation errors in console', () => {
      cy.visit(refinanceUrl, {
        onBeforeLoad(win) {
          cy.spy(win.console, 'error');
          cy.spy(win.console, 'warn');
        }
      });
      
      cy.wait(2000);
      
      cy.window().then((win) => {
        const errors = win.console.error as any;
        const warnings = win.console.warn as any;
        
        // Check for translation-related errors
        if (errors.called) {
          errors.getCalls().forEach((call: any) => {
            const errorMsg = call.args.join(' ');
            if (errorMsg.includes('translation') || 
                errorMsg.includes('content') ||
                errorMsg.includes('dropdown')) {
              bugs.push({
                id: `BUG-011-${Date.now()}`,
                severity: 'HIGH',
                location: refinanceUrl,
                element: 'Console Errors',
                expected: 'No translation errors',
                actual: errorMsg,
                impact: 'System errors affecting functionality',
                steps: [
                  `Navigate to ${refinanceUrl}`,
                  'Open browser console',
                  'Check for errors'
                ]
              });
            }
          });
        }
        
        // Check for i18next warnings
        if (warnings.called) {
          warnings.getCalls().forEach((call: any) => {
            const warnMsg = call.args.join(' ');
            if (warnMsg.includes('missingKey') || 
                warnMsg.includes('i18next')) {
              bugs.push({
                id: `BUG-012-${Date.now()}`,
                severity: 'MEDIUM',
                location: refinanceUrl,
                element: 'i18next Warnings',
                expected: 'No missing translation keys',
                actual: warnMsg,
                impact: 'Missing translations',
                steps: [
                  `Navigate to ${refinanceUrl}`,
                  'Open browser console',
                  'Check for warnings'
                ]
              });
            }
          });
        }
      });
    });
  });

  after(() => {
    // Generate Professional QA Report
    cy.task('log', '\n' + '='.repeat(80));
    cy.task('log', '📊 PROFESSIONAL QA REPORT - REFINANCE MORTGAGE TRANSLATION SYSTEM');
    cy.task('log', '='.repeat(80));
    cy.task('log', `\nTest Date: ${new Date().toISOString()}`);
    cy.task('log', `Test URL: ${baseUrl}${refinanceUrl}`);
    cy.task('log', `Total Bugs Found: ${bugs.length}`);
    
    // Bug Summary by Severity
    const critical = bugs.filter(b => b.severity === 'CRITICAL');
    const high = bugs.filter(b => b.severity === 'HIGH');
    const medium = bugs.filter(b => b.severity === 'MEDIUM');
    const low = bugs.filter(b => b.severity === 'LOW');
    
    cy.task('log', '\n📈 BUG SUMMARY BY SEVERITY:');
    cy.task('log', `  🔴 CRITICAL: ${critical.length} bugs`);
    cy.task('log', `  🟠 HIGH: ${high.length} bugs`);
    cy.task('log', `  🟡 MEDIUM: ${medium.length} bugs`);
    cy.task('log', `  🟢 LOW: ${low.length} bugs`);
    
    // Detailed Bug Report
    cy.task('log', '\n📋 DETAILED BUG REPORT:\n');
    
    bugs.forEach((bug, index) => {
      cy.task('log', `${'-'.repeat(60)}`);
      cy.task('log', `BUG #${index + 1}: ${bug.id}`);
      cy.task('log', `Severity: ${bug.severity}`);
      cy.task('log', `Location: ${bug.location}`);
      cy.task('log', `Element: ${bug.element}`);
      cy.task('log', `Expected: ${bug.expected}`);
      cy.task('log', `Actual: ${bug.actual}`);
      cy.task('log', `Impact: ${bug.impact}`);
      cy.task('log', 'Steps to Reproduce:');
      bug.steps.forEach((step, i) => {
        cy.task('log', `  ${i + 1}. ${step}`);
      });
      if (bug.screenshot) {
        cy.task('log', `Screenshot: ${bug.screenshot}`);
      }
    });
    
    // Test Status
    cy.task('log', '\n' + '='.repeat(80));
    cy.task('log', '🎯 TEST STATUS:');
    if (bugs.length === 0) {
      cy.task('log', '✅ ALL TESTS PASSED - No bugs found!');
    } else if (critical.length > 0) {
      cy.task('log', '❌ CRITICAL ISSUES FOUND - Immediate action required!');
    } else if (high.length > 0) {
      cy.task('log', '⚠️ HIGH PRIORITY ISSUES - Should be fixed before deployment');
    } else {
      cy.task('log', '⚡ MINOR ISSUES - Can be addressed in next iteration');
    }
    
    // Recommendations
    cy.task('log', '\n📝 RECOMMENDATIONS:');
    if (critical.length > 0) {
      cy.task('log', '  1. Fix database-API integration immediately');
      cy.task('log', '  2. Ensure fallback mechanism is working');
    }
    if (high.length > 0) {
      cy.task('log', '  3. Add missing dropdown labels to database');
      cy.task('log', '  4. Update translation.json with all required keys');
    }
    cy.task('log', '  5. Implement comprehensive error handling');
    cy.task('log', '  6. Add monitoring for translation coverage');
    
    cy.task('log', '\n' + '='.repeat(80) + '\n');
    
    // Save report to file
    const reportContent = {
      testDate: new Date().toISOString(),
      url: `${baseUrl}${refinanceUrl}`,
      totalBugs: bugs.length,
      bugsBySeverity: {
        critical: critical.length,
        high: high.length,
        medium: medium.length,
        low: low.length
      },
      bugs: bugs
    };
    
    cy.writeFile('qa-reports/refinance-mortgage-qa-report.json', reportContent);
    cy.task('log', '📄 Report saved to: qa-reports/refinance-mortgage-qa-report.json');
  });
});

// Export for TypeScript
export {};