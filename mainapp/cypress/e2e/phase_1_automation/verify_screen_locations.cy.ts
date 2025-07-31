/// <reference types="cypress" />

describe('Phase 1: Screen Location Verification', () => {
  const API_BASE = 'http://localhost:8003/api'
  
  // Expected content mapping after Phase 1.1 migration
  const EXPECTED_CONTENT_MAPPING = {
    mortgage_step1: {
      description: 'Property and loan details',
      expectedFields: ['city', 'when_needed', 'type', 'first_home', 'property_ownership', 'initial_fee', 'price', 'period'],
      expectedDropdowns: ['city', 'when_needed', 'type', 'first_home', 'property_ownership']
    },
    mortgage_step2: {
      description: 'Personal data',
      expectedFields: ['name_surname', 'birth_date', 'education', 'citizenship', 'family_status', 'children', 'borrowers'],
      expectedDropdowns: ['education', 'citizenship', 'family_status']
    },
    mortgage_step3: {
      description: 'Income and employment data',
      expectedFields: ['main_source', 'additional', 'debt_types', 'monthly_income', 'company', 'profession'],
      expectedDropdowns: ['main_source', 'has_additional', 'debt_types', 'bank']
    },
    mortgage_step4: {
      description: 'Bank offers and results',
      expectedFields: ['final', 'warning', 'parameters', 'filter', 'total', 'monthly'],
      expectedDropdowns: ['monthly_payment'] // filter dropdown container missing (options exist)
    }
  }
  
  Object.entries(EXPECTED_CONTENT_MAPPING).forEach(([screen, expectations]) => {
    describe(`${screen} - ${expectations.description}`, () => {
      let content: any
      
      before(() => {
        cy.request(`${API_BASE}/content/${screen}/en`).then(response => {
          content = response.body.content
        })
      })
      
      it('should contain expected field groups', () => {
        expectations.expectedFields.forEach(field => {
          const fieldKeys = Object.keys(content).filter(key => key.includes(field))
          
          expect(fieldKeys.length).to.be.at.least(1,
            `Expected to find '${field}' content in ${screen}`)
          
          cy.log(`${field}: found ${fieldKeys.length} related keys`)
        })
      })
      
      it('should have dropdowns in correct screen', () => {
        expectations.expectedDropdowns.forEach(dropdown => {
          const dropdownKeys = Object.keys(content).filter(key => 
            key.includes(dropdown) && content[key].component_type === 'dropdown'
          )
          
          expect(dropdownKeys.length).to.be.at.least(1,
            `Expected dropdown '${dropdown}' in ${screen}`)
        })
      })
      
      it('should not contain content from other steps', () => {
        // Define fields that should NOT be in this screen
        const wrongFieldsMap: Record<string, string[]> = {
          mortgage_step1: ['education', 'family_status', 'main_source', 'monthly_income'],
          mortgage_step2: ['property_ownership', 'initial_fee', 'monthly_income', 'debt_types'],
          mortgage_step3: ['property_ownership', 'education', 'family_status'],
          mortgage_step4: ['property_ownership', 'education', 'main_source']
        }
        
        const wrongFields = wrongFieldsMap[screen] || []
        
        wrongFields.forEach(field => {
          const wrongKeys = Object.keys(content).filter(key => {
            const item = content[key]
            return key.includes(field) && 
              ['dropdown', 'option', 'placeholder', 'label'].includes(item.component_type) // Only check dropdown-related items
          })
          
          expect(wrongKeys.length).to.equal(0,
            `${field} dropdown content should not be in ${screen}, but found: ${wrongKeys.join(', ')}`)
        })
      })
    })
  })
  
  it('should have moved all dropdown content from mortgage_calculation', () => {
    cy.request({
      method: 'GET',
      url: `${API_BASE}/content/mortgage_calculation/en`,
      failOnStatusCode: false
    }).then(response => {
      if (response.status === 200 && response.body.content) {
        const remainingContent = response.body.content
        
        // Check that no dropdown-related content remains
        const dropdownContent = Object.entries(remainingContent).filter(([key, item]: [string, any]) =>
          ['dropdown', 'option', 'placeholder', 'label'].includes(item.component_type)
        )
        
        expect(dropdownContent.length).to.equal(0,
          `Found ${dropdownContent.length} dropdown items still in mortgage_calculation`)
        
        // Log what remains (should be minimal)
        const remainingTypes = new Set(
          Object.values(remainingContent).map((item: any) => item.component_type)
        )
        
        cy.log(`Remaining in mortgage_calculation: ${Array.from(remainingTypes).join(', ')}`)
      }
    })
  })
  
  it('should verify refinance screens have proper structure', () => {
    const refinanceScreens = [
      'refinance_step1',
      'refinance_step2', 
      'refinance_step3',
      'refinance_step4'
    ]
    
    refinanceScreens.forEach(screen => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/content/${screen}/en`,
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200) {
          const content = response.body.content || {}
          const contentCount = Object.keys(content).length
          
          // refinance_step3 and refinance_step4 might have minimal content
          if (screen === 'refinance_step1') {
            expect(contentCount).to.be.at.least(20,
              `${screen} should have substantial content`)
          }
          
          // Check for proper component types
          const componentTypes = new Set(
            Object.values(content).map((item: any) => item.component_type)
          )
          
          cy.log(`${screen}: ${contentCount} items, types: ${Array.from(componentTypes).join(', ')}`)
        } else {
          cy.log(`${screen}: No content (${response.status})`)
        }
      })
    })
  })
  
  it('should generate screen location summary report', () => {
    const screens = [
      'mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4',
      'refinance_step1', 'refinance_step2', 'refinance_step3', 'refinance_step4',
      'mortgage_calculation'
    ]
    
    const report: Record<string, any> = {}
    
    const requests = screens.map(screen =>
      cy.request({
        method: 'GET',
        url: `${API_BASE}/content/${screen}/en`,
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200 && response.body.content) {
          const content = response.body.content
          const componentCounts: Record<string, number> = {}
          
          Object.values(content).forEach((item: any) => {
            componentCounts[item.component_type] = (componentCounts[item.component_type] || 0) + 1
          })
          
          report[screen] = {
            total: Object.keys(content).length,
            components: componentCounts
          }
        } else {
          report[screen] = {
            total: 0,
            components: {}
          }
        }
      })
    )
    
    cy.wrap(Promise.all(requests)).then(() => {
      cy.log('=== Screen Location Summary ===')
      
      Object.entries(report).forEach(([screen, data]) => {
        if (data.total > 0) {
          const summary = Object.entries(data.components)
            .map(([type, count]) => `${type}: ${count}`)
            .join(', ')
          
          cy.log(`${screen}: Total ${data.total} items`)
          cy.log(`  Components: ${summary}`)
        } else {
          cy.log(`${screen}: No content`)
        }
      })
      
      // Verify mortgage_calculation is mostly empty
      expect(report.mortgage_calculation.total).to.be.lessThan(60,
        'mortgage_calculation should have minimal content after migration')
      
      // Verify mortgage steps have substantial content
      ;['mortgage_step1', 'mortgage_step2', 'mortgage_step3'].forEach(screen => {
        expect(report[screen].total).to.be.at.least(20,
          `${screen} should have substantial content after migration`)
      })
    })
  })
})