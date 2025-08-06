/// <reference types="cypress" />

describe('Phase 1: Translation Coverage Verification', () => {
  const API_BASE = 'http://localhost:8003/api'
  const LANGUAGES = ['en', 'he', 'ru']
  
  // Screens identified as missing translations in Phase 1.4
  const SCREENS_WITH_MISSING_TRANSLATIONS = {
    cooperation: 1,
    mortgage_step3: 3,
    mortgage_step4: 1,
    refinance_step1: 5
  }
  
  describe('Translation coverage for all screens', () => {
    const screens = [
      'mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4',
      'refinance_step1', 'refinance_step2', 'refinance_step3', 'refinance_step4',
      'cooperation'
    ]
    
    screens.forEach(screen => {
      it(`should check translation coverage for ${screen}`, () => {
        const missingTranslations: any[] = []
        const translationCoverage: Record<string, number> = {}
        
        // Get content for all languages
        const requests = LANGUAGES.map(lang => 
          cy.request({
            method: 'GET',
            url: `${API_BASE}/content/${screen}/${lang}`,
            failOnStatusCode: false
          }).then(response => {
            if (response.status === 200) {
              const contentCount = Object.keys(response.body.content || {}).length
              translationCoverage[lang] = contentCount
              
              // Track items that might be missing translations
              if (lang === 'en' && contentCount > 0) {
                Object.entries(response.body.content).forEach(([key, item]: [string, any]) => {
                  if (!item.value || item.value === key) {
                    missingTranslations.push({
                      key,
                      language: lang,
                      component_type: item.component_type
                    })
                  }
                })
              }
            } else {
              translationCoverage[lang] = 0
            }
          })
        )
        
        cy.wrap(Promise.all(requests)).then(() => {
          // Log coverage summary
          cy.log(`${screen} coverage - EN: ${translationCoverage.en || 0}, HE: ${translationCoverage.he || 0}, RU: ${translationCoverage.ru || 0}`)
          
          // Check if all languages have similar content count
          const counts = Object.values(translationCoverage)
          const maxCount = Math.max(...counts)
          const minCount = Math.min(...counts)
          
          if (maxCount > 0 && minCount < maxCount * 0.9) {
            cy.log(`⚠️ ${screen} has uneven translation coverage`)
          }
          
          // Check against expected missing translations
          if (SCREENS_WITH_MISSING_TRANSLATIONS[screen as keyof typeof SCREENS_WITH_MISSING_TRANSLATIONS]) {
            const expectedMissing = SCREENS_WITH_MISSING_TRANSLATIONS[screen as keyof typeof SCREENS_WITH_MISSING_TRANSLATIONS]
            cy.log(`📋 ${screen} expected to have ${expectedMissing} missing translations`)
          }
          
          // Report missing translations
          if (missingTranslations.length > 0) {
            cy.log(`❌ Found ${missingTranslations.length} potential missing translations in ${screen}`)
            missingTranslations.slice(0, 5).forEach(item => {
              cy.log(`  - ${item.key} (${item.component_type})`)
            })
          }
        })
      })
    })
  })
  
  it('should verify critical dropdown translations exist', () => {
    // Check that critical dropdowns have translations in all languages
    const criticalDropdowns = [
      { screen: 'mortgage_step1', field: 'property_ownership' },
      { screen: 'mortgage_step1', field: 'when_needed' },
      { screen: 'mortgage_step2', field: 'education' },
      { screen: 'mortgage_step3', field: 'main_source' }
    ]
    
    criticalDropdowns.forEach(({ screen, field }) => {
      LANGUAGES.forEach(lang => {
        cy.request(`${API_BASE}/content/${screen}/${lang}`).then(response => {
          const content = response.body.content
          
          // Check for translated options
          const options = Object.entries(content).filter(([key, item]: [string, any]) => 
            key.includes(field) && item.component_type === 'option'
          )
          
          options.forEach(([key, item]: [string, any]) => {
            expect(item.value).to.exist
            expect(item.value).to.not.equal(key, 
              `${field} option in ${lang} should have proper translation, not key`)
            
            // For Hebrew, check for RTL characters
            if (lang === 'he') {
              expect(item.value).to.match(/[\u0590-\u05FF]/,
                `Hebrew translation should contain Hebrew characters: ${item.value}`)
            }
            
            // For Russian, check for Cyrillic characters
            if (lang === 'ru') {
              expect(item.value).to.match(/[\u0400-\u04FF]/,
                `Russian translation should contain Cyrillic characters: ${item.value}`)
            }
          })
        })
      })
    })
  })
  
  it('should generate translation coverage report', () => {
    const coverageReport: Record<string, any> = {}
    const allScreens = [
      'mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4',
      'refinance_step1', 'refinance_step2', 'refinance_step3', 'refinance_step4'
    ]
    
    const requests = allScreens.flatMap(screen => 
      LANGUAGES.map(lang => 
        cy.request({
          method: 'GET',
          url: `${API_BASE}/content/${screen}/${lang}`,
          failOnStatusCode: false
        }).then(response => {
          if (!coverageReport[screen]) {
            coverageReport[screen] = {
              total_items: 0,
              languages: {},
              missing_count: 0
            }
          }
          
          if (response.status === 200) {
            const content = response.body.content || {}
            const itemCount = Object.keys(content).length
            
            coverageReport[screen].languages[lang] = itemCount
            
            if (lang === 'en') {
              coverageReport[screen].total_items = itemCount
            }
            
            // Count items with missing translations
            Object.values(content).forEach((item: any) => {
              if (!item.value || item.value === '' || item.value.startsWith('{{')) {
                coverageReport[screen].missing_count++
              }
            })
          } else {
            coverageReport[screen].languages[lang] = 0
          }
        })
      )
    )
    
    cy.wrap(Promise.all(requests)).then(() => {
      // Generate summary
      cy.log('=== Translation Coverage Report ===')
      
      let totalItems = 0
      let totalMissing = 0
      
      Object.entries(coverageReport).forEach(([screen, data]) => {
        const coverage = Object.entries(data.languages)
          .map(([lang, count]) => `${lang.toUpperCase()}: ${count}`)
          .join(', ')
        
        cy.log(`${screen}: ${coverage} | Missing: ${data.missing_count}`)
        
        totalItems += data.total_items
        totalMissing += data.missing_count
      })
      
      const coveragePercent = totalItems > 0 
        ? ((totalItems - totalMissing) / totalItems * 100).toFixed(1)
        : '0'
      
      cy.log(`=== Total Coverage: ${coveragePercent}% (${totalItems - totalMissing}/${totalItems}) ===`)
      
      // Assert high coverage
      expect(parseFloat(coveragePercent)).to.be.at.least(90, 
        'Translation coverage should be at least 90%')
    })
  })
})