describe('Full Translation Scan', () => {
  const results: any = {
    he: { issues: [], summary: {} },
    ru: { issues: [], summary: {} }
  };

  // Complete list of all application routes
  const ALL_ROUTES = [
    // Public pages
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/contacts', name: 'Contacts' },
    { path: '/vacancies', name: 'Vacancies' },
    { path: '/services', name: 'Services' },
    { path: '/cooperation', name: 'Cooperation' },
    { path: '/tenders-for-brokers', name: 'Brokers' },
    { path: '/tenders-for-lawyers', name: 'Lawyers' },
    { path: '/Real-Estate-Brokerage', name: 'Real Estate' },
    
    // Service flows - Mortgage
    { path: '/services/calculate-mortgage/1', name: 'Mortgage Step 1' },
    { path: '/services/calculate-mortgage/2', name: 'Mortgage Step 2' },
    { path: '/services/calculate-mortgage/3', name: 'Mortgage Step 3' },
    { path: '/services/calculate-mortgage/4', name: 'Mortgage Step 4' },
    
    // Service flows - Refinance Mortgage
    { path: '/services/refinance-mortgage/1', name: 'Refinance Mortgage 1' },
    { path: '/services/refinance-mortgage/2', name: 'Refinance Mortgage 2' },
    { path: '/services/refinance-mortgage/3', name: 'Refinance Mortgage 3' },
    
    // Service flows - Credit
    { path: '/services/calculate-credit/1', name: 'Credit Step 1' },
    { path: '/services/calculate-credit/2', name: 'Credit Step 2' },
    { path: '/services/calculate-credit/3', name: 'Credit Step 3' },
    
    // Service flows - Refinance Credit
    { path: '/services/refinance-credit/1', name: 'Refinance Credit 1' },
    { path: '/services/refinance-credit/2', name: 'Refinance Credit 2' },
    { path: '/services/refinance-credit/3', name: 'Refinance Credit 3' },
    
    // Other borrowers
    { path: '/services/other-borrowers/1/?pageId=1', name: 'Other Borrowers 1' },
    { path: '/services/other-borrowers/2/?pageId=1', name: 'Other Borrowers 2' },
    
    // Auth pages
    { path: '/login', name: 'Login' },
    { path: '/registration', name: 'Registration' },
  ];

  const checkForUntranslated = (text: string, lang: string): string | null => {
    if (!text || text.length === 0 || text.length > 100) return null;
    
    // Pattern checks
    if (/^[a-z_]+$/i.test(text)) return 'Translation key';
    if (/calculate_|refinance_|sidebar_|mortgage_/.test(text)) return 'Untranslated key';
    if (/^(undefined|null|\[object)/.test(text)) return 'Error text';
    if (/^\.{3,}$|^-{3,}$/.test(text)) return 'Placeholder';
    
    // Language-specific checks
    if (lang === 'he' && /^[a-zA-Z\s]+$/.test(text) && text.length > 3) {
      const allowed = ['SMS', 'Email', 'WhatsApp', 'Facebook', 'OK', 'FAQ'];
      if (!allowed.some(a => text.includes(a))) {
        return 'English in Hebrew';
      }
    }
    
    if (lang === 'ru' && /^[a-zA-Z\s]+$/.test(text) && text.length > 3) {
      const allowed = ['SMS', 'Email', 'WhatsApp', 'Facebook', 'OK', 'FAQ'];
      if (!allowed.some(a => text.includes(a))) {
        return 'English in Russian';
      }
    }
    
    return null;
  };

  ['he', 'ru'].forEach(lang => {
    describe(`Scanning ${lang.toUpperCase()} language`, () => {
      ALL_ROUTES.forEach((route, index) => {
        it(`${index + 1}/${ALL_ROUTES.length}: ${route.name}`, () => {
          cy.visit(`${route.path}?lang=${lang}`, { 
            failOnStatusCode: false,
            timeout: 15000 
          });
          
          // Wait for content to load
          cy.wait(1000);
          
          // Check all text elements
          cy.document().then(doc => {
            const textElements = doc.querySelectorAll(
              'h1, h2, h3, h4, h5, h6, p, span, label, button, a, td, th, li, option'
            );
            
            textElements.forEach(el => {
              const text = el.textContent?.trim() || '';
              const issueType = checkForUntranslated(text, lang);
              
              if (issueType) {
                results[lang].issues.push({
                  page: route.name,
                  path: route.path,
                  text: text.substring(0, 50),
                  type: issueType,
                  element: el.tagName.toLowerCase()
                });
                
                // Update summary
                if (!results[lang].summary[route.name]) {
                  results[lang].summary[route.name] = 0;
                }
                results[lang].summary[route.name]++;
              }
            });
            
            // Check placeholders
            const inputs = doc.querySelectorAll('[placeholder]');
            inputs.forEach(el => {
              const placeholder = el.getAttribute('placeholder') || '';
              const issueType = checkForUntranslated(placeholder, lang);
              
              if (issueType) {
                results[lang].issues.push({
                  page: route.name,
                  path: route.path,
                  text: placeholder,
                  type: 'Placeholder: ' + issueType,
                  element: 'input'
                });
              }
            });
          });
          
          // Log progress
          cy.log(`✓ Scanned ${route.name} (${results[lang].issues.length} total issues)`);
        });
      });
    });
  });

  after(() => {
    // Generate comprehensive report
    let report = '# TRANSLATION SCAN REPORT\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    ['he', 'ru'].forEach(lang => {
      report += `## ${lang.toUpperCase()} Language\n\n`;
      report += `Total issues: ${results[lang].issues.length}\n\n`;
      
      // Summary by page
      report += '### Issues by Page:\n';
      Object.entries(results[lang].summary)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .forEach(([page, count]) => {
          report += `- ${page}: ${count} issues\n`;
        });
      
      // Most common issues
      report += '\n### Most Common Issues:\n';
      const typeCount: Record<string, number> = {};
      results[lang].issues.forEach((issue: any) => {
        typeCount[issue.type] = (typeCount[issue.type] || 0) + 1;
      });
      
      Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([type, count]) => {
          report += `- ${type}: ${count} occurrences\n`;
        });
      
      // Sample issues
      report += '\n### Sample Issues:\n';
      results[lang].issues.slice(0, 20).forEach((issue: any) => {
        report += `- [${issue.page}] "${issue.text}" (${issue.type})\n`;
      });
      
      report += '\n---\n\n';
    });
    
    // Save reports
    cy.writeFile('cypress/reports/translation-scan-report.md', report);
    cy.writeFile('cypress/reports/translation-scan-data.json', results);
    
    // Console summary
    cy.task('log', '========================================');
    cy.task('log', 'TRANSLATION SCAN COMPLETE');
    cy.task('log', '========================================');
    cy.task('log', `Hebrew issues: ${results.he.issues.length}`);
    cy.task('log', `Russian issues: ${results.ru.issues.length}`);
    cy.task('log', `Total issues: ${results.he.issues.length + results.ru.issues.length}`);
    cy.task('log', 'Reports saved to cypress/reports/');
    cy.task('log', '========================================');
  });
});