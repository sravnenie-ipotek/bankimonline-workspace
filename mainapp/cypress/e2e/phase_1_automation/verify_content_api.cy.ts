/// <reference types="cypress" />

describe('Phase 1: Content API Verification', () => {
  const API_BASE = 'http://localhost:8003/api'
  const LANGUAGES = ['en', 'he', 'ru']
  const MORTGAGE_SCREENS = ['mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4']
  
  MORTGAGE_SCREENS.forEach(screen => {
    LANGUAGES.forEach(lang => {
      it(`should return proper content structure for ${screen} in ${lang}`, () => {
        cy.request({
          method: 'GET',
          url: `${API_BASE}/content/${screen}/${lang}`,
          failOnStatusCode: false
        }).then(response => {
          // API should return 200 OK
          expect(response.status).to.equal(200)
          
          // Response should have proper structure
          expect(response.body).to.have.property('status')
          expect(response.body).to.have.property('screen_location', screen)
          expect(response.body).to.have.property('language_code', lang)
          expect(response.body).to.have.property('content')
          
          // Content should be an object with items
          expect(response.body.content).to.be.an('object')
          
          // Log content count for verification
          const contentCount = Object.keys(response.body.content).length
          cy.log(`${screen}/${lang}: ${contentCount} content items`)
          
          // Verify content has expected component types
          if (contentCount > 0) {
            const componentTypes = new Set()
            Object.values(response.body.content).forEach((item: any) => {
              expect(item).to.have.property('component_type')
              expect(item).to.have.property('category')
              expect(item).to.have.property('value')
              componentTypes.add(item.component_type)
            })
            
            cy.log(`Component types found: ${Array.from(componentTypes).join(', ')}`)
            
            // Verify standardized component types (no field_label, field_option, etc.)
            expect(Array.from(componentTypes)).to.not.include.members([
              'field_label',
              'field_option',
              'field_placeholder',
              'dropdown_option'
            ])
          }
        })
      })
    })
  })
  
  it('should have proper dropdown structure in mortgage_step1', () => {
    cy.request(`${API_BASE}/content/mortgage_step1/en`).then(response => {
      const content = response.body.content
      
      // Expected dropdowns in step 1
      const expectedDropdowns = [
        // 'city', // Skip - city options come from separate API
        'when_needed',
        'type',
        'first_home',
        'property_ownership'
      ]
      
      expectedDropdowns.forEach(dropdown => {
        // Check for dropdown container
        const dropdownKeys = Object.keys(content).filter(key => 
          key.includes(dropdown) && content[key].component_type === 'dropdown'
        )
        
        expect(dropdownKeys.length).to.be.at.least(1, 
          `Expected dropdown container for ${dropdown}`)
        
        // Check for options
        const optionKeys = Object.keys(content).filter(key => 
          key.includes(dropdown) && content[key].component_type === 'option'
        )
        
        expect(optionKeys.length).to.be.at.least(2, 
          `Expected at least 2 options for ${dropdown}`)
        
        // Check for label
        const labelKeys = Object.keys(content).filter(key => 
          key.includes(dropdown) && content[key].component_type === 'label'
        )
        
        // Note: Some dropdowns might not have separate labels yet
        cy.log(`${dropdown}: ${dropdownKeys.length} containers, ${optionKeys.length} options, ${labelKeys.length} labels`)
      })
    })
  })
  
  it('should have all form items categorized correctly', () => {
    cy.request(`${API_BASE}/content/mortgage_step2/en`).then(response => {
      const content = response.body.content
      
      // All dropdown-related items should have category='form'
      Object.values(content).forEach((item: any) => {
        if (['dropdown', 'option', 'label', 'placeholder'].includes(item.component_type)) {
          expect(item.category).to.equal('form', 
            `${item.component_type} should have category='form'`)
        }
      })
    })
  })
  
  it('should not have any dropdown content in mortgage_calculation', () => {
    // This should have minimal content since we moved dropdown items
    cy.request({
      method: 'GET',
      url: `${API_BASE}/content/mortgage_calculation/en`,
      failOnStatusCode: false
    }).then(response => {
      if (response.status === 200) {
        // If it returns 200, content should be minimal (only non-form items)
        const contentCount = Object.keys(response.body.content || {}).length
        cy.log(`mortgage_calculation has ${contentCount} remaining items`)
        
        // Check that no dropdown-related content remains
        if (contentCount > 0) {
          const dropdownContent = Object.values(response.body.content).filter((item: any) => 
            ['dropdown', 'option', 'label', 'placeholder'].includes(item.component_type)
          )
          
          expect(dropdownContent.length).to.equal(0, 
            'mortgage_calculation should not have dropdown-related content')
          
          // Log what types remain (should be text, header, help_text, button)
          const remainingTypes = new Set(
            Object.values(response.body.content).map((item: any) => item.component_type)
          )
          cy.log(`Remaining content types: ${Array.from(remainingTypes).join(', ')}`)
        }
      }
    })
  })
})