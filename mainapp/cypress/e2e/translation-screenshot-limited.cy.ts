describe('Translation Issues Screenshots - Limited Scope', () => {
  const LANGUAGES = ['he'];
  const WAIT_TIME = 1000;
  
  // Patterns that indicate untranslated content
  const UNTRANSLATED_PATTERNS = [
    // Translation keys
    /^[a-z_]+$/i,
    /_[a-z]+_[a-z]+/i,
    /^calculate_|^refinance_|^sidebar_|^app\.|^mortgage_/i,
    /^INSTAGRAM$|^FACEBOOK$|^TWITTER$|^YOUTUBE$/,
    
    // Development artifacts
    /^TODO|FIXME|DEBUG|TEST/i,
    /^undefined$|^null$|^\[object/i,
    
    // Missing content
    /^\.{3,}$|^-{3,}$|^_{3,}$/,
  ];

  // Limited routes to check (just a few key pages)
  const ROUTES = [
    { path: '/', name: 'Home' },
    { path: '/services/calculate-mortgage/1', name: 'Mortgage-Step1' },
    { path: '/services/calculate-mortgage/2', name: 'Mortgage-Step2' },
    { path: '/services/calculate-mortgage/3', name: 'Mortgage-Step3' },
  ];

  LANGUAGES.forEach(lang => {
    context(`${lang.toUpperCase()} - Limited Screenshot Test`, () => {
      ROUTES.forEach(route => {
        it(`Check ${route.name}`, () => {
          cy.visit(`${route.path}?lang=${lang}`, { failOnStatusCode: false });
          cy.wait(WAIT_TIME);
          
          let issueCount = 0;
          const pageIssues: any[] = [];
          
          // First pass - identify all issues (limited to first 5)
          cy.get('body').then($body => {
            // Check all text elements
            const selectors = 'h1, h2, h3, h4, h5, h6, button, label, span, p, a';
            const elements = $body.find(selectors).toArray();
            
            elements.forEach(el => {
              const text = el.textContent?.trim() || '';
              if (!text || text.length > 50 || pageIssues.length >= 5) return; // Limit to 5 issues per page
              
              // Check for untranslated patterns
              let isIssue = false;
              let issueType = '';
              
              UNTRANSLATED_PATTERNS.forEach(pattern => {
                if (pattern.test(text)) {
                  isIssue = true;
                  issueType = 'Translation key';
                }
              });
              
              // Language-specific checks
              if (lang === 'he' && /^[a-zA-Z\s]+$/.test(text) && text.length > 3) {
                const allowedEnglish = ['SMS', 'Email', 'OK', 'FAQ', 'WhatsApp'];
                if (!allowedEnglish.some(allowed => text.includes(allowed))) {
                  isIssue = true;
                  issueType = 'English in Hebrew';
                }
              }
              
              if (isIssue) {
                pageIssues.push({
                  element: el,
                  text: text,
                  type: issueType,
                  selector: el.tagName.toLowerCase()
                });
              }
            });
          });
          
          // Second pass - screenshot each issue individually
          cy.then(() => {
            if (pageIssues.length === 0) {
              cy.log(`✅ No issues found on ${route.name}`);
              return;
            }
            
            cy.log(`📸 Found ${pageIssues.length} issues, taking screenshots...`);
            
            // Process each issue
            pageIssues.forEach((issue, index) => {
              issueCount++;
              
              // Highlight the specific element
              cy.wrap(issue.element).scrollIntoView({ duration: 0 });
              cy.wait(100);
              
              cy.wrap(issue.element).then($el => {
                // Apply highlight styles
                $el.css({
                  'border': '4px solid red',
                  'background-color': 'yellow',
                  'box-shadow': '0 0 20px red',
                  'position': 'relative',
                  'z-index': '9999'
                });
              });
              
              // Wait a bit for styles to apply
              cy.wait(100);
              
              // Take screenshot with descriptive filename
              const safeText = issue.text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
              const filename = `translation-issues/${lang}-${route.name}-${index + 1}-${safeText}`;
              
              cy.log(`📸 Screenshot: ${filename}`);
              
              cy.screenshot(filename, {
                capture: 'viewport',
                overwrite: true
              });
              
              // Reset styles
              cy.wrap(issue.element).then($el => {
                $el.removeAttr('style');
              });
            });
            
            // Take summary screenshot
            if (pageIssues.length > 0) {
              cy.log(`Taking summary screenshot with ${pageIssues.length} issues highlighted`);
              
              // Highlight all issues at once
              pageIssues.forEach(issue => {
                cy.wrap(issue.element).then($el => {
                  $el.css({
                    'border': '3px solid red',
                    'background-color': 'yellow'
                  });
                });
              });
              
              cy.screenshot(`translation-issues/${lang}-${route.name}-SUMMARY`, {
                capture: 'fullPage',
                overwrite: true
              });
            }
          });
        });
      });
    });
  });
  
  after(() => {
    cy.log('================================================');
    cy.log('Screenshot capture complete!');
    cy.log('Check cypress/screenshots/translation-issues/ folder');
    cy.log('================================================');
  });
});