describe('Translation Spot Check', () => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'he', name: 'Hebrew' },
    { code: 'ru', name: 'Russian' }
  ];

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  languages.forEach(lang => {
    it(`should check Mortgage Calculator Step 1 in ${lang.name}`, () => {
      // Visit and set language
      cy.visit('/services/calculate-mortgage/1');
      cy.window().then(win => {
        win.localStorage.setItem('i18nextLng', lang.code);
      });
      cy.reload();
      cy.wait(3000); // Wait for translations

      // Take screenshot
      cy.screenshot(`mortgage-step1-${lang.code}-final`);

      // Check specific elements for translations
      cy.get('body').then($body => {
        const bodyText = $body.text();
        
        // Log what we find
        cy.log(`Language: ${lang.name} (${lang.code})`);
        cy.log(`Body contains: ${bodyText.substring(0, 200)}...`);

        // Check for RTL in Hebrew
        if (lang.code === 'he') {
          cy.get('html').should('have.attr', 'dir', 'rtl');
          cy.log('✅ RTL layout detected for Hebrew');
        }

        // Check for language-specific text
        const expectedTexts = {
          en: ['Property price', 'Mortgage amount', 'Calculate'],
          he: ['שווי הנכס', 'סכום משכנתא', 'חישוב'],
          ru: ['Стоимость недвижимости', 'Сумма ипотеки', 'Рассчитать']
        };

        expectedTexts[lang.code].forEach(text => {
          if (bodyText.includes(text)) {
            cy.log(`✅ Found expected text: "${text}"`);
          } else {
            cy.log(`❌ Missing expected text: "${text}"`);
          }
        });

        // Check for wrong language contamination
        if (lang.code !== 'en') {
          const englishContamination = ['Property', 'Mortgage', 'Calculate', 'Next'];
          englishContamination.forEach(word => {
            if (bodyText.includes(word)) {
              cy.log(`⚠️ WARNING: Found English word "${word}" in ${lang.name} version`);
            }
          });
        }
      });

      // Try to capture dropdown content
      cy.get('select, [role="combobox"], .MuiSelect-select').first().then($dropdown => {
        if ($dropdown.length > 0) {
          cy.wrap($dropdown).click({ force: true });
          cy.wait(1000);
          cy.screenshot(`mortgage-step1-${lang.code}-dropdown`);
          
          // Check dropdown options
          cy.get('[role="option"], option').then($options => {
            const optionTexts = [];
            $options.each((i, el) => {
              optionTexts.push(Cypress.$(el).text());
            });
            cy.log(`Dropdown options found: ${optionTexts.join(', ')}`);
          });
        }
      });
    });
  });

  it('should navigate through all 4 steps in Hebrew', () => {
    cy.visit('/services/calculate-mortgage/1');
    cy.window().then(win => {
      win.localStorage.setItem('i18nextLng', 'he');
    });
    cy.reload();
    cy.wait(3000);

    // Step 1
    cy.screenshot('hebrew-step1');
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(2000);

    // Step 2
    cy.screenshot('hebrew-step2');
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(2000);

    // Step 3
    cy.screenshot('hebrew-step3');
    cy.get('button').contains(/הבא|המשך/).click();
    cy.wait(2000);

    // Step 4
    cy.screenshot('hebrew-step4');
  });
});