/**
 * Direct navigation test to step 4 for all processes
 * Checks if step 4 is accessible and for translation issues
 */

describe('Direct Step 4 Navigation - All Processes', () => {
  const processes = [
    { name: 'Calculate Mortgage', path: '/services/calculate-mortgage/4' },
    { name: 'Calculate Credit', path: '/services/calculate-credit/4' },
    { name: 'Refinance Mortgage', path: '/services/refinance-mortgage/4' },
    { name: 'Refinance Credit', path: '/services/refinance-credit/4' }
  ];

  const report = {
    timestamp: new Date().toISOString(),
    results: []
  };

  processes.forEach((process) => {
    it(`${process.name} - Direct navigation to step 4`, () => {
      const result = {
        process: process.name,
        accessible: false,
        redirected: false,
        finalUrl: '',
        translationIssues: [],
        errors: [],
        content: {
          hasEnglish: false,
          hasHebrew: false,
          hasRussian: false,
          mixedLanguages: false,
          untranslatedKeys: []
        }
      };

      // Try to navigate directly to step 4
      cy.visit(process.path, { failOnStatusCode: false });
      cy.wait(3000);

      // Check where we ended up
      cy.url().then(url => {
        result.finalUrl = url;
        
        if (url.includes('/4')) {
          result.accessible = true;
          cy.log(`✅ ${process.name} - Step 4 is directly accessible`);
        } else {
          result.redirected = true;
          cy.log(`⚠️ ${process.name} - Redirected from step 4 to: ${url}`);
        }
      });

      // Check page content for translation issues
      cy.get('body').then($body => {
        const bodyText = $body.text();
        const htmlContent = $body.html();
        
        // Check for language presence
        result.content.hasHebrew = /[\u0590-\u05FF]/.test(bodyText);
        result.content.hasEnglish = /[a-zA-Z]{5,}/.test(bodyText);
        result.content.hasRussian = /[\u0400-\u04FF]/.test(bodyText);
        
        // Check for mixed languages
        const languageCount = [
          result.content.hasHebrew,
          result.content.hasEnglish,
          result.content.hasRussian
        ].filter(Boolean).length;
        
        if (languageCount > 1) {
          result.content.mixedLanguages = true;
          result.translationIssues.push('Mixed languages detected on the same page');
        }
        
        // Look for untranslated keys
        const keyPattern = /[a-z]+_[a-z]+_[a-z]+/g;
        const matches = bodyText.match(keyPattern) || [];
        
        matches.forEach(match => {
          // Filter out common false positives
          if (!match.includes('class') && 
              !match.includes('data') && 
              !match.includes('test') &&
              !match.includes('src') &&
              !match.includes('alt')) {
            result.content.untranslatedKeys.push(match);
            result.translationIssues.push(`Possible untranslated key: ${match}`);
          }
        });
        
        // Check for translation file references
        if (htmlContent.includes('translation.json') || bodyText.includes('translation.json')) {
          result.errors.push('Translation file reference visible in UI');
        }
        
        // Check for error messages
        if (bodyText.includes('Error') || bodyText.includes('שגיאה') || bodyText.includes('Ошибка')) {
          result.errors.push('Error message detected on page');
        }
        
        // Check for missing content indicators
        if (bodyText.includes('undefined') || bodyText.includes('null')) {
          result.errors.push('Undefined or null values visible in UI');
        }
      });

      // Take screenshot for evidence
      cy.screenshot(`${process.name.replace(/\s/g, '-')}-step4-check`);

      // Add result to report
      report.results.push(result);
      
      // Log individual result
      cy.log(`📊 ${process.name} Result:`, JSON.stringify(result, null, 2));
    });
  });

  after(() => {
    // Generate final report
    cy.log('========== FINAL REPORT ==========');
    
    report.results.forEach(result => {
      cy.log(`\n${result.process}:`);
      cy.log(`  Step 4 Accessible: ${result.accessible ? 'YES ✅' : 'NO ❌'}`);
      cy.log(`  Redirected: ${result.redirected ? 'YES' : 'NO'}`);
      cy.log(`  Final URL: ${result.finalUrl}`);
      
      if (result.translationIssues.length > 0) {
        cy.log(`  Translation Issues:`);
        result.translationIssues.forEach(issue => {
          cy.log(`    - ${issue}`);
        });
      }
      
      if (result.errors.length > 0) {
        cy.log(`  Errors:`);
        result.errors.forEach(error => {
          cy.log(`    - ${error}`);
        });
      }
      
      cy.log(`  Languages detected:`);
      cy.log(`    - Hebrew: ${result.content.hasHebrew ? 'YES' : 'NO'}`);
      cy.log(`    - English: ${result.content.hasEnglish ? 'YES' : 'NO'}`);
      cy.log(`    - Russian: ${result.content.hasRussian ? 'YES' : 'NO'}`);
    });
    
    // Save report as JSON
    cy.writeFile('cypress/reports/process-check-report.json', report);
  });
});