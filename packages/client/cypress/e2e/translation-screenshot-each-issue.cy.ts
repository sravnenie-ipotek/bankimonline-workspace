describe('Translation Issues with Individual Screenshots', () => {
  const LANGUAGES = ['he', 'ru'];
  const WAIT_TIME = 1500;
  
  // Patterns that indicate untranslated content
  const UNTRANSLATED_PATTERNS = [
    // Translation keys
    /^[a-z_]+$/i,
    /_[a-z]+_[a-z]+/i,
    /^calculate_|^refinance_|^sidebar_|^app\.|^mortgage_/i,
    // Removed social media patterns since they're now properly translated
    
    // Development artifacts
    /^TODO|FIXME|DEBUG|TEST/i,
    /^undefined$|^null$|^\[object/i,
    
    // Missing content
    /^\.{3,}$|^-{3,}$|^_{3,}$/,
  ];

  // All routes to check
  const ROUTES = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/contacts', name: 'Contacts' },
    { path: '/vacancies', name: 'Vacancies' },
    { path: '/services', name: 'Services' },
    { path: '/cooperation', name: 'Cooperation' },
    { path: '/tenders-for-brokers', name: 'Brokers' },
    { path: '/tenders-for-lawyers', name: 'Lawyers' },
    { path: '/Real-Estate-Brokerage', name: 'RealEstate' },
    { path: '/services/calculate-mortgage/1', name: 'Mortgage-Step1' },
    { path: '/services/calculate-mortgage/2', name: 'Mortgage-Step2' },
    { path: '/services/calculate-mortgage/3', name: 'Mortgage-Step3' },
    { path: '/services/calculate-mortgage/4', name: 'Mortgage-Step4' },
    { path: '/services/refinance-mortgage/1', name: 'Refinance-Mortgage-1' },
    { path: '/services/refinance-mortgage/2', name: 'Refinance-Mortgage-2' },
    { path: '/services/refinance-mortgage/3', name: 'Refinance-Mortgage-3' },
    { path: '/services/calculate-credit/1', name: 'Credit-Step1' },
    { path: '/services/calculate-credit/2', name: 'Credit-Step2' },
    { path: '/services/calculate-credit/3', name: 'Credit-Step3' },
    { path: '/services/refinance-credit/1', name: 'Refinance-Credit-1' },
    { path: '/services/refinance-credit/2', name: 'Refinance-Credit-2' },
    { path: '/services/refinance-credit/3', name: 'Refinance-Credit-3' },
    { path: '/services/other-borrowers/1/?pageId=1', name: 'Other-Borrowers-1' },
    { path: '/services/other-borrowers/2/?pageId=1', name: 'Other-Borrowers-2' },
    { path: '/login', name: 'Login' },
    { path: '/registration', name: 'Registration' },
  ];

  LANGUAGES.forEach(lang => {
    context(`${lang.toUpperCase()} - Screenshot Each Issue`, () => {
      ROUTES.forEach(route => {
        it(`Check ${route.name}`, () => {
          cy.visit(`${route.path}?lang=${lang}`, { failOnStatusCode: false });
          cy.wait(WAIT_TIME);
          
          let issueCount = 0;
          const pageIssues: any[] = [];
          
          // First pass - identify all issues
          cy.get('body').then($body => {
            // Check all text elements
            const selectors = 'h1, h2, h3, h4, h5, h6, button, label, span, p, a, td, th, li, option';
            const elements = $body.find(selectors).toArray();
            
            elements.forEach(el => {
              const text = el.textContent?.trim() || '';
              if (!text || text.length > 50) return;
              
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
                const allowedEnglish = ['SMS', 'Email', 'OK', 'FAQ', 'WhatsApp', 'Instagram', 'Facebook', 'YouTube', 'Twitter', 'Telegram'];
                if (!allowedEnglish.some(allowed => text.includes(allowed))) {
                  isIssue = true;
                  issueType = 'English in Hebrew';
                }
              }
              
              if (lang === 'ru' && /^[a-zA-Z\s]+$/.test(text) && text.length > 3) {
                const allowedEnglish = ['SMS', 'Email', 'OK', 'FAQ', 'WhatsApp', 'Instagram', 'Facebook', 'YouTube', 'Twitter', 'Telegram'];
                if (!allowedEnglish.some(allowed => text.includes(allowed))) {
                  isIssue = true;
                  issueType = 'English in Russian';
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
            
            // Check placeholders
            const inputs = $body.find('[placeholder]').toArray();
            inputs.forEach(el => {
              const placeholder = el.getAttribute('placeholder') || '';
              UNTRANSLATED_PATTERNS.forEach(pattern => {
                if (pattern.test(placeholder)) {
                  pageIssues.push({
                    element: el,
                    text: placeholder,
                    type: 'Placeholder issue',
                    selector: 'input[placeholder]'
                  });
                }
              });
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
              cy.wrap(issue.element).then($el => {
                // Store original styles
                const originalStyle = $el.attr('style') || '';
                
                // Apply highlight styles
                $el.css({
                  'border': '4px solid red !important',
                  'background-color': 'yellow !important',
                  'box-shadow': '0 0 20px red !important',
                  'position': 'relative',
                  'z-index': '9999'
                });
                
                // Scroll element into view
                $el[0].scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
              });
              
              // Wait a bit for scroll and styles to apply
              cy.wait(200);
              
              // Take screenshot with descriptive filename
              const safeText = issue.text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
              // Simplify filename to avoid issues
              const filename = `translation-issues/${lang}-${route.name}-issue-${index + 1}-${safeText}`;
              
              // Log before taking screenshot
              cy.log(`📸 Taking screenshot: ${filename}`);
              
              cy.screenshot(filename, {
                capture: 'viewport',
                overwrite: true,
                onAfterScreenshot: ($el, props) => {
                  cy.log(`✅ Screenshot saved: ${props.path}`);
                }
              });
              
              // Log the issue
              cy.log(`Issue ${index + 1}: "${issue.text}" (${issue.type})`);
              
              // Reset styles
              cy.wrap(issue.element).then($el => {
                $el.attr('style', '');
              });
            });
          });
          
          // Summary for this page
          cy.then(() => {
            if (issueCount > 0) {
              cy.log(`❌ Total: ${issueCount} issues on ${route.name}`);
              
              // Also take one final screenshot with all issues highlighted
              cy.get('body').then($body => {
                pageIssues.forEach(issue => {
                  cy.wrap(issue.element).then($el => {
                    $el.css({
                      'border': '3px solid red',
                      'background-color': 'yellow',
                      'box-shadow': '0 0 10px red'
                    });
                  });
                });
              });
              
              cy.screenshot(`translation-issues/${lang}-${route.name}-ALL-ISSUES-SUMMARY`, {
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
    cy.log('Check cypress/screenshots/ folder for results');
    cy.log('Screenshots are organized by language/page/issue');
    cy.log('================================================');
  });
});