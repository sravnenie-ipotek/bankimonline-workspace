describe('Translation Coverage Test - All Pages', () => {
  // Common untranslated patterns to look for
  const untranslatedPatterns = [
    // Translation keys that weren't replaced
    /^[a-z_]+[A-Z_]+[a-z_]*$/,  // camelCase or snake_case keys
    /^[A-Z_]+$/,  // ALL_CAPS keys
    /_option_\d+$/,  // option keys like calculate_mortgage_option_1
    /_ph$/,  // placeholder keys
    /_title$/,  // title keys
    /^sidebar_/,  // sidebar keys
    /^calculate_/,  // calculation keys
    /^refinance_/,  // refinance keys
    
    // Common English words that might indicate missing translations
    /^(Submit|Cancel|Next|Previous|Back|Save|Delete|Edit|Add|Remove|Close|Open)$/,
    
    // Debug/development text
    /^(TODO|FIXME|DEBUG|TEST|Lorem ipsum)$/i,
    /^undefined$/,
    /^null$/,
    /^\[object Object\]$/,
    
    // Empty or placeholder content
    /^\.{3,}$/,  // Multiple dots
    /^-{3,}$/,   // Multiple dashes
    /^_{3,}$/,   // Multiple underscores
  ];

  // All routes in the application
  const routes = [
    // Home and general pages
    { path: '/', name: 'Home Page' },
    { path: '/about', name: 'About Page' },
    { path: '/contacts', name: 'Contacts Page' },
    { path: '/vacancies', name: 'Vacancies Page' },
    { path: '/services', name: 'Services Overview' },
    
    // Mortgage calculation steps
    { path: '/services/calculate-mortgage/1', name: 'Calculate Mortgage Step 1' },
    { path: '/services/calculate-mortgage/2', name: 'Calculate Mortgage Step 2' },
    { path: '/services/calculate-mortgage/3', name: 'Calculate Mortgage Step 3' },
    { path: '/services/calculate-mortgage/4', name: 'Calculate Mortgage Step 4' },
    
    // Refinance mortgage steps
    { path: '/services/refinance-mortgage/1', name: 'Refinance Mortgage Step 1' },
    { path: '/services/refinance-mortgage/2', name: 'Refinance Mortgage Step 2' },
    { path: '/services/refinance-mortgage/3', name: 'Refinance Mortgage Step 3' },
    
    // Credit calculation steps
    { path: '/services/calculate-credit/1', name: 'Calculate Credit Step 1' },
    { path: '/services/calculate-credit/2', name: 'Calculate Credit Step 2' },
    { path: '/services/calculate-credit/3', name: 'Calculate Credit Step 3' },
    
    // Refinance credit steps
    { path: '/services/refinance-credit/1', name: 'Refinance Credit Step 1' },
    { path: '/services/refinance-credit/2', name: 'Refinance Credit Step 2' },
    { path: '/services/refinance-credit/3', name: 'Refinance Credit Step 3' },
    
    // Other borrowers
    { path: '/services/other-borrowers/1', name: 'Other Borrowers Step 1' },
    { path: '/services/other-borrowers/2', name: 'Other Borrowers Step 2' },
    
    // Business pages
    { path: '/cooperation', name: 'Cooperation Page' },
    { path: '/tenders-for-brokers', name: 'Tenders for Brokers' },
    { path: '/tenders-for-lawyers', name: 'Tenders for Lawyers' },
    { path: '/Real-Estate-Brokerage', name: 'Real Estate Brokerage' },
    
    // Personal cabinet (requires login)
    { path: '/personal-cabinet', name: 'Personal Cabinet', requiresAuth: true },
    
    // Auth pages
    { path: '/login', name: 'Login Page' },
    { path: '/registration', name: 'Registration Page' },
  ];

  // Languages to test
  const languages = ['he', 'ru', 'en'];
  
  // Store all found issues
  const allIssues: any[] = [];

  beforeEach(() => {
    // Set viewport to desktop size
    cy.viewport(1280, 720);
  });

  languages.forEach(lang => {
    describe(`Testing ${lang.toUpperCase()} language`, () => {
      routes.forEach(route => {
        it(`Should check translations on ${route.name} (${lang})`, () => {
          // Skip auth-required pages for now
          if (route.requiresAuth) {
            cy.log(`Skipping ${route.name} - requires authentication`);
            return;
          }

          // Visit the page with the language parameter
          cy.visit(`${route.path}?lang=${lang}`, { 
            failOnStatusCode: false,
            timeout: 30000 
          });
          
          // Wait for page to load
          cy.wait(2000);
          
          // Store issues for this page
          const pageIssues: any[] = [];
          
          // Check all visible text elements
          cy.get('body').then($body => {
            const checkElement = (element: Element, selector: string) => {
              const text = element.textContent?.trim() || '';
              
              // Skip empty elements
              if (!text) return;
              
              // Skip very long text (likely content, not UI labels)
              if (text.length > 100) return;
              
              // Check against untranslated patterns
              untranslatedPatterns.forEach(pattern => {
                if (pattern.test(text)) {
                  const issue = {
                    page: route.name,
                    path: route.path,
                    language: lang,
                    text: text,
                    selector: selector,
                    pattern: pattern.toString(),
                    element: element.tagName.toLowerCase()
                  };
                  
                  pageIssues.push(issue);
                  allIssues.push(issue);
                  
                  // Log to Cypress
                  cy.log(`🚨 Untranslated: "${text}"`);
                }
              });
              
              // Special check for Hebrew - should not contain only English letters
              if (lang === 'he' && /^[a-zA-Z\s]+$/.test(text) && text.length > 2) {
                // Exclude some expected English terms
                const allowedEnglish = ['OK', 'SMS', 'Email', 'WhatsApp', 'Facebook', 'Google', 'FAQ'];
                if (!allowedEnglish.includes(text)) {
                  const issue = {
                    page: route.name,
                    path: route.path,
                    language: lang,
                    text: text,
                    selector: selector,
                    pattern: 'English text in Hebrew mode',
                    element: element.tagName.toLowerCase()
                  };
                  
                  pageIssues.push(issue);
                  allIssues.push(issue);
                  
                  cy.log(`🚨 English in Hebrew: "${text}"`);
                }
              }
              
              // Special check for Russian - should contain Cyrillic
              if (lang === 'ru' && /^[a-zA-Z\s]+$/.test(text) && text.length > 2) {
                const allowedEnglish = ['OK', 'SMS', 'Email', 'WhatsApp', 'Facebook', 'Google', 'FAQ'];
                if (!allowedEnglish.includes(text)) {
                  const issue = {
                    page: route.name,
                    path: route.path,
                    language: lang,
                    text: text,
                    selector: selector,
                    pattern: 'English text in Russian mode',
                    element: element.tagName.toLowerCase()
                  };
                  
                  pageIssues.push(issue);
                  allIssues.push(issue);
                  
                  cy.log(`🚨 English in Russian: "${text}"`);
                }
              }
            };
            
            // Check various text elements
            const selectorsToCheck = [
              'h1', 'h2', 'h3', 'h4', 'h5', 'h6',  // Headers
              'button', 'a',  // Interactive elements
              'label', 'span', 'p',  // Text elements
              '[placeholder]',  // Placeholders
              'option',  // Dropdown options
              '.error', '.warning', '.info',  // Messages
              '[title]', '[alt]',  // Attributes
              'td', 'th',  // Table cells
            ];
            
            selectorsToCheck.forEach(selector => {
              const elements = $body.find(selector).toArray();
              elements.forEach(el => checkElement(el, selector));
            });
            
            // Check placeholders
            $body.find('[placeholder]').each((_, el) => {
              const placeholder = el.getAttribute('placeholder') || '';
              if (placeholder) {
                untranslatedPatterns.forEach(pattern => {
                  if (pattern.test(placeholder)) {
                    const issue = {
                      page: route.name,
                      path: route.path,
                      language: lang,
                      text: placeholder,
                      selector: 'placeholder',
                      pattern: pattern.toString(),
                      element: 'placeholder attribute'
                    };
                    
                    pageIssues.push(issue);
                    allIssues.push(issue);
                    
                    cy.log(`🚨 Untranslated placeholder: "${placeholder}"`);
                  }
                });
              }
            });
          });
          
          // Log summary for this page
          cy.then(() => {
            if (pageIssues.length > 0) {
              cy.log(`❌ Found ${pageIssues.length} issues on ${route.name} (${lang})`);
            } else {
              cy.log(`✅ No issues found on ${route.name} (${lang})`);
            }
          });
        });
      });
    });
  });

  // Final report
  after(() => {
    // Group issues by page
    const issuesByPage: Record<string, any[]> = {};
    allIssues.forEach(issue => {
      const key = `${issue.page} (${issue.language})`;
      if (!issuesByPage[key]) {
        issuesByPage[key] = [];
      }
      issuesByPage[key].push(issue);
    });
    
    // Create report
    let report = '# TRANSLATION ISSUES REPORT\n\n';
    report += `Total issues found: ${allIssues.length}\n\n`;
    
    Object.entries(issuesByPage).forEach(([page, issues]) => {
      report += `## ${page}\n`;
      report += `Found ${issues.length} issues:\n`;
      issues.forEach(issue => {
        report += `- "${issue.text}" (${issue.element}) - ${issue.pattern}\n`;
      });
      report += '\n';
    });
    
    // Save report to file
    cy.writeFile('cypress/reports/translation-issues.md', report);
    
    // Also create JSON report for further processing
    cy.writeFile('cypress/reports/translation-issues.json', JSON.stringify(allIssues, null, 2));
    
    cy.log(`📊 Translation check complete. Found ${allIssues.length} total issues.`);
    cy.log('Reports saved to cypress/reports/');
  });
});