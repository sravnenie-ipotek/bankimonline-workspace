/// <reference types="cypress" />

describe('Phase 4: Multi-Language Support Tests', () => {
  const API_BASE = 'http://localhost:8003/api'
  const LANGUAGES = [
    { code: 'en', name: 'English', dir: 'ltr', sample: 'Select' },
    { code: 'he', name: 'Hebrew', dir: 'rtl', sample: 'בחר' },
    { code: 'ru', name: 'Russian', dir: 'ltr', sample: 'Выбрать' }
  ]
  
  beforeEach(() => {
    cy.intercept('GET', `${API_BASE}/dropdowns/**`).as('dropdownAPI')
  })

  describe('Language-Specific Dropdown Data', () => {
    LANGUAGES.forEach(language => {
      it(`should load dropdown data correctly in ${language.name} (${language.code})`, () => {
        // Set language before visiting page
        cy.window().then((win) => {
          win.localStorage.setItem('i18nextLng', language.code)
        })
        
        cy.visit('/services/calculate-mortgage')
        
        // Wait for API call with correct language
        cy.wait('@dropdownAPI').then((interception) => {
          const url = interception.request.url
          expect(url).to.include(`/${language.code}`)
          
          const response = interception.response?.body
          expect(response).to.have.property('status', 'success')
          expect(response).to.have.property('language_code', language.code)
          
          // Verify dropdown options are in correct language
          const propertyOwnershipKey = 'mortgage_step1_property_ownership'
          if (response.options[propertyOwnershipKey]) {
            const options = response.options[propertyOwnershipKey]
            expect(options).to.be.an('array').and.have.length.at.least(3)
            
            // Verify text content matches language expectations
            options.forEach((option: any) => {
              expect(option.label).to.be.a('string').and.not.be.empty
              
              if (language.code === 'he') {
                // Hebrew text should contain Hebrew characters
                expect(option.label).to.match(/[\u0590-\u05FF]/)
              } else if (language.code === 'ru') {
                // Russian text should contain Cyrillic characters
                expect(option.label).to.match(/[\u0400-\u04FF]/)
              } else if (language.code === 'en') {
                // English text should contain only Latin characters
                expect(option.label).to.match(/^[a-zA-Z0-9\s'"-.,!?]+$/)
              }
            })
          }
        })
      })
    })
  })

  describe('Dynamic Language Switching', () => {
    it('should handle language switching in dropdown components', () => {
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Get initial dropdown options in English
      let englishOptions: string[] = []
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select[aria-label*="ownership"]')
        .should('exist')
        .click()
      
      cy.get('.MuiMenuItem-root, option, [role="option"]').then($options => {
        englishOptions = $options.toArray().map(el => el.textContent || '')
        cy.get('body').click(0, 0) // Close dropdown
      })
      
      // Change language to Hebrew
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'he')
        win.location.reload()
      })
      
      cy.wait('@dropdownAPI')
      
      // Verify new API call was made for Hebrew
      cy.get('@dropdownAPI.all').should('have.length', 2)
      
      // Verify dropdown now shows Hebrew options
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select[aria-label*="ownership"]')
        .should('exist')
        .click()
      
      cy.get('.MuiMenuItem-root, option, [role="option"]').then($hebrewOptions => {
        const hebrewOptions = $hebrewOptions.toArray().map(el => el.textContent || '')
        
        // Options should be different from English
        expect(hebrewOptions).to.not.deep.equal(englishOptions)
        
        // Hebrew options should contain Hebrew characters
        hebrewOptions.forEach(option => {
          if (option.trim()) {
            expect(option).to.match(/[\u0590-\u05FF]/)
          }
        })
      })
    })

    it('should handle language switching with hook caching', () => {
      // Start with English
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'en')
      })
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Switch to Hebrew
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'he')
        win.location.reload()
      })
      
      cy.wait('@dropdownAPI')
      
      // Switch back to English - should use cache
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'en')
        win.location.reload()
      })
      
      // Should make new API call for English (cache per language)
      cy.wait('@dropdownAPI')
      
      // Total: 3 API calls (en, he, en again)
      cy.get('@dropdownAPI.all').should('have.length', 3)
    })
  })

  describe('RTL (Right-to-Left) Support', () => {
    it('should properly handle Hebrew RTL layout', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'he')
      })
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Check for RTL styling
      cy.get('body, html, .app, [dir="rtl"]').should('exist')
      
      // Dropdown should have RTL styling
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select[aria-label*="ownership"]')
        .should('exist')
        .and('have.css', 'direction')
        .and('match', /rtl/)
        .or('have.attr', 'dir', 'rtl')
      
      // Click and verify options display correctly in RTL
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select[aria-label*="ownership"]')
        .click()
      
      cy.get('.MuiMenuItem-root, option, [role="option"]').should('exist')
        .and('have.length.at.least', 2)
    })

    it('should maintain proper RTL alignment for all dropdown components', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'he')
      })
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Check multiple dropdown fields for RTL support
      const dropdownSelectors = [
        '[data-testid="property-ownership-select"], [name="property_ownership"]',
        '[data-testid="when-needed-select"], [name="when_needed"]',
        '[data-testid="type-select"], [name="type"]'
      ]
      
      dropdownSelectors.forEach(selector => {
        cy.get('body').then($body => {
          const selectors = selector.split(', ')
          const foundSelector = selectors.find(sel => $body.find(sel).length > 0)
          
          if (foundSelector) {
            cy.get(foundSelector)
              .should('exist')
              .then($el => {
                const direction = $el.css('direction') || $el.attr('dir')
                expect(direction === 'rtl' || $body.css('direction') === 'rtl').to.be.true
              })
          }
        })
      })
    })
  })

  describe('Language Consistency Validation', () => {
    it('should maintain consistent option count across languages', () => {
      const languageData: { [key: string]: number } = {}
      
      // Test each language
      LANGUAGES.forEach(language => {
        cy.window().then((win) => {
          win.localStorage.setItem('i18nextLng', language.code)
        })
        
        cy.visit('/services/calculate-mortgage')
        cy.wait('@dropdownAPI').then((interception) => {
          const response = interception.response?.body
          const propertyOwnershipKey = 'mortgage_step1_property_ownership'
          
          if (response.options[propertyOwnershipKey]) {
            languageData[language.code] = response.options[propertyOwnershipKey].length
          }
        })
      })
      
      cy.then(() => {
        // All languages should have same number of options
        const counts = Object.values(languageData)
        const uniqueCounts = [...new Set(counts)]
        expect(uniqueCounts).to.have.length(1, 
          `Inconsistent option counts across languages: ${JSON.stringify(languageData)}`)
      })
    })

    it('should validate all dropdown fields have translations in all languages', () => {
      const dropdownFields = ['property_ownership', 'when_needed', 'type', 'first_home']
      const missingTranslations: { [key: string]: string[] } = {}
      
      LANGUAGES.forEach(language => {
        cy.window().then((win) => {
          win.localStorage.setItem('i18nextLng', language.code)
        })
        
        cy.visit('/services/calculate-mortgage')
        cy.wait('@dropdownAPI').then((interception) => {
          const response = interception.response?.body
          
          dropdownFields.forEach(field => {
            const dropdownKey = `mortgage_step1_${field}`
            
            if (!response.options[dropdownKey] || response.options[dropdownKey].length === 0) {
              if (!missingTranslations[language.code]) {
                missingTranslations[language.code] = []
              }
              missingTranslations[language.code].push(field)
            }
          })
        })
      })
      
      cy.then(() => {
        expect(Object.keys(missingTranslations)).to.have.length(0, 
          `Missing translations detected: ${JSON.stringify(missingTranslations)}`)
      })
    })
  })

  describe('Language-Specific Placeholder and Label Support', () => {
    it('should load language-specific placeholders and labels', () => {
      LANGUAGES.forEach(language => {
        cy.window().then((win) => {
          win.localStorage.setItem('i18nextLng', language.code)
        })
        
        cy.visit('/services/calculate-mortgage')
        cy.wait('@dropdownAPI').then((interception) => {
          const response = interception.response?.body
          
          // Check placeholders exist for this language
          expect(response).to.have.property('placeholders').that.is.an('object')
          expect(response).to.have.property('labels').that.is.an('object')
          
          // Verify specific field placeholders/labels
          const propertyOwnershipKey = 'mortgage_step1_property_ownership'
          
          if (response.placeholders[propertyOwnershipKey]) {
            const placeholder = response.placeholders[propertyOwnershipKey]
            expect(placeholder).to.be.a('string').and.not.be.empty
            
            // Language-specific validation
            if (language.code === 'he') {
              expect(placeholder).to.match(/[\u0590-\u05FF]/)
            } else if (language.code === 'ru') {
              expect(placeholder).to.match(/[\u0400-\u04FF]/)
            }
          }
        })
      })
    })

    it('should display placeholders correctly in form components', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'he')
      })
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Find dropdown input field and verify placeholder
      cy.get('[data-testid="property-ownership-select"] input, [name="property_ownership"], input[placeholder*="בחר"]')
        .should('exist')
        .then($input => {
          const placeholder = $input.attr('placeholder') || $input.val()
          if (placeholder) {
            // Hebrew placeholder should contain Hebrew characters
            expect(placeholder.toString()).to.match(/[\u0590-\u05FF]/)
          }
        })
    })
  })

  describe('Performance with Multiple Languages', () => {
    it('should efficiently cache different language versions', () => {
      // Load English first
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'en')
      })
      cy.visit('/services/calculate-mortgage')
      cy.wait('@dropdownAPI')
      
      // Load Hebrew
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'he')
        win.location.reload()
      })
      cy.wait('@dropdownAPI')
      
      // Load Russian
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'ru')
        win.location.reload()
      })
      cy.wait('@dropdownAPI')
      
      // Go back to English - should use cache
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'en')
        win.location.reload()
      })
      
      // Should load quickly from cache
      cy.get('[data-testid="property-ownership-select"], [name="property_ownership"], select[aria-label*="ownership"]', { timeout: 2000 })
        .should('exist')
    })
  })

  describe('Error Handling with Multiple Languages', () => {
    it('should show error messages in appropriate language', () => {
      // Mock API error
      cy.intercept('GET', `${API_BASE}/dropdowns/**`, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('apiError')
      
      // Test error in Hebrew
      cy.window().then((win) => {
        win.localStorage.setItem('i18nextLng', 'he')
      })
      
      cy.visit('/services/calculate-mortgage')
      cy.wait('@apiError')
      
      // Should show error in Hebrew or fallback gracefully
      cy.get('body').should('not.contain.text', 'undefined')
        .and('not.contain.text', 'null')
      
      // Form should still be usable
      cy.get('form, .form-container').should('exist')
    })
  })
})