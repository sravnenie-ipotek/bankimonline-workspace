describe('Translation Checker - Find Untranslated Text', () => {
  // Configuration
  const LANGUAGES = ['he', 'ru']; // Languages to check (skip 'en' as it's the base)
  const WAIT_TIME = 1500; // Time to wait for page load
  
  // Patterns that indicate untranslated content
  const UNTRANSLATED_PATTERNS = [
    // Translation keys
    /^[a-z_]+$/i,  // Single word with underscores
    /_[a-z]+_[a-z]+/i,  // Multiple underscores pattern
    /^calculate_|^refinance_|^sidebar_|^app\.|^mortgage_/i,  // Common key prefixes
    
    // Development artifacts
    /^TODO|FIXME|DEBUG|TEST/i,
    /^undefined$|^null$|^\[object/i,
    
    // Missing content
    /^\.{3,}$|^-{3,}$|^_{3,}$/,  // Repeated dots, dashes, underscores
  ];

  // Quick check for all main routes
  const ROUTES = [
    '/',
    '/about',
    '/services',
    '/services/calculate-mortgage/1',
    '/services/calculate-mortgage/2',
    '/services/calculate-mortgage/3',
    '/services/refinance-mortgage/1',
    '/services/calculate-credit/1',
    '/services/other-borrowers/1',
  ];

  LANGUAGES.forEach(lang => {
    context(`Checking ${lang.toUpperCase()} translations`, () => {
      ROUTES.forEach(route => {
        it(`Should check ${route}`, () => {
          // Visit page with language
          cy.visit(`${route}?lang=${lang}`, { failOnStatusCode: false });
          cy.wait(WAIT_TIME);
          
          // Collect all text content
          const issues: string[] = [];
          
          cy.get('body').within(() => {
            // Check visible text in common elements
            cy.get('h1, h2, h3, h4, h5, h6, button, label, span, p, a, td, th')
              .each($el => {
                const text = $el.text().trim();
                
                // Skip empty or very long text
                if (!text || text.length > 50) return;
                
                // Check for untranslated patterns
                UNTRANSLATED_PATTERNS.forEach(pattern => {
                  if (pattern.test(text)) {
                    issues.push(text);
                    // Highlight the element
                    cy.wrap($el).then($element => {
                      $element.css({
                        'border': '3px solid red',
                        'background-color': 'yellow'
                      });
                    });
                  }
                });
                
                // Language-specific checks
                if (lang === 'he' && /^[a-zA-Z\s]+$/.test(text) && text.length > 3) {
                  // Check for English text in Hebrew mode
                  const allowedEnglish = ['SMS', 'Email', 'OK', 'FAQ'];
                  if (!allowedEnglish.some(allowed => text.includes(allowed))) {
                    issues.push(`English in Hebrew: ${text}`);
                    cy.wrap($el).then($element => {
                      $element.css({
                        'border': '3px solid orange',
                        'background-color': '#ffeb3b'
                      });
                    });
                  }
                }
                
                if (lang === 'ru' && /^[a-zA-Z\s]+$/.test(text) && text.length > 3) {
                  // Check for English text in Russian mode
                  const allowedEnglish = ['SMS', 'Email', 'OK', 'FAQ'];
                  if (!allowedEnglish.some(allowed => text.includes(allowed))) {
                    issues.push(`English in Russian: ${text}`);
                    cy.wrap($el).then($element => {
                      $element.css({
                        'border': '3px solid orange',
                        'background-color': '#ffeb3b'
                      });
                    });
                  }
                }
              });
            
            // Check placeholders
            cy.get('[placeholder]').each($el => {
              const placeholder = $el.attr('placeholder') || '';
              UNTRANSLATED_PATTERNS.forEach(pattern => {
                if (pattern.test(placeholder)) {
                  issues.push(`Placeholder: ${placeholder}`);
                  cy.wrap($el).then($element => {
                    $element.css({
                      'border': '3px solid purple',
                      'background-color': '#e1bee7'
                    });
                  });
                }
              });
            });
          });
          
          // Take screenshot if issues found
          cy.then(() => {
            if (issues.length > 0) {
              const pageName = route.replace(/\//g, '_') || 'home';
              cy.screenshot(`untranslated-${lang}-${pageName}`, { capture: 'viewport' });
              cy.log(`❌ Found ${issues.length} issues:`, issues.slice(0, 10).join(', '));
            } else {
              cy.log(`✅ No translation issues found`);
            }
          });
        });
      });
    });
  });
});