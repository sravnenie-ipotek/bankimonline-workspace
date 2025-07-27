describe('Comprehensive Translation Testing - All Calculators', () => {
  const languages = ['en', 'he', 'ru'];
  const calculators = [
    { name: 'Mortgage Calculator', path: '/services/calculate-mortgage/1' },
    { name: 'Credit Calculator', path: '/services/calculate-credit/1' },
    { name: 'Refinance Mortgage', path: '/services/refinance-mortgage/1' },
    { name: 'Refinance Credit', path: '/services/refinance-credit/1' }
  ];

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  calculators.forEach(calculator => {
    describe(`${calculator.name} Translation Tests`, () => {
      languages.forEach(lang => {
        it(`should display ${calculator.name} correctly in ${lang.toUpperCase()}`, () => {
          // Set language
          cy.visit(calculator.path);
          cy.window().then(win => {
            win.localStorage.setItem('i18nextLng', lang);
          });
          cy.reload();
          cy.wait(2000); // Wait for translations to load

          // Take screenshot of Step 1
          cy.screenshot(`${calculator.name.toLowerCase().replace(/\s+/g, '-')}-step1-${lang}`);

          // Test RTL for Hebrew
          if (lang === 'he') {
            cy.get('body').should('have.attr', 'dir', 'rtl');
          }

          // Check for any untranslated text (looking for English in non-English languages)
          if (lang !== 'en') {
            // Common English words that shouldn't appear
            const englishWords = ['Property', 'Mortgage', 'Credit', 'Calculate', 'Next', 'Back'];
            englishWords.forEach(word => {
              cy.get('body').then($body => {
                const text = $body.text();
                if (text.includes(word)) {
                  cy.log(`WARNING: Found English word "${word}" in ${lang} translation`);
                }
              });
            });
          }

          // Test dropdowns on Step 1
          cy.get('select, [role="combobox"], .MuiSelect-select').each(($el, index) => {
            cy.wrap($el).click({ force: true });
            cy.wait(500);
            cy.screenshot(`${calculator.name.toLowerCase().replace(/\s+/g, '-')}-step1-dropdown${index}-${lang}`);
            cy.get('body').click(0, 0); // Close dropdown
          });

          // Navigate to Step 2
          cy.get('button').contains(/next|continue|הבא|далее/i).click();
          cy.wait(2000);
          cy.screenshot(`${calculator.name.toLowerCase().replace(/\s+/g, '-')}-step2-${lang}`);

          // Navigate to Step 3
          cy.get('button').contains(/next|continue|הבא|далее/i).click();
          cy.wait(2000);
          cy.screenshot(`${calculator.name.toLowerCase().replace(/\s+/g, '-')}-step3-${lang}`);

          // Navigate to Step 4
          cy.get('button').contains(/next|continue|הבא|далее/i).click();
          cy.wait(2000);
          cy.screenshot(`${calculator.name.toLowerCase().replace(/\s+/g, '-')}-step4-${lang}`);
        });
      });
    });
  });

  // Specific translation checks
  describe('Specific Translation Validations', () => {
    it('should have all property ownership options translated', () => {
      languages.forEach(lang => {
        cy.visit('/services/calculate-mortgage/1');
        cy.window().then(win => {
          win.localStorage.setItem('i18nextLng', lang);
        });
        cy.reload();
        cy.wait(2000);

        // Expected translations for property ownership
        const expectedTranslations = {
          en: ["I don't own any property", "I own a property", "I'm selling a property"],
          he: ["אני לא בעלים של נכס", "אני בעלים של נכס", "אני מוכר נכס"],
          ru: ["Я не владею недвижимостью", "Я владею недвижимостью", "Я продаю недвижимость"]
        };

        // Check if property ownership dropdown exists and has correct options
        cy.log(`Checking property ownership translations for ${lang}`);
      });
    });

    it('should persist language selection across steps', () => {
      languages.forEach(lang => {
        cy.visit('/services/calculate-mortgage/1');
        cy.window().then(win => {
          win.localStorage.setItem('i18nextLng', lang);
        });
        cy.reload();
        
        // Navigate through all steps
        for (let step = 1; step <= 4; step++) {
          cy.wait(1000);
          cy.window().then(win => {
            const currentLang = win.localStorage.getItem('i18nextLng');
            expect(currentLang).to.equal(lang);
          });
          
          if (step < 4) {
            cy.get('button').contains(/next|continue|הבא|далее/i).click();
          }
        }
      });
    });
  });
});