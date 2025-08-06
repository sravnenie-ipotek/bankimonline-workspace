/// <reference types="cypress" />

describe('Phase 1: Compliance Report', () => {
  const API_BASE = 'http://localhost:8003/api'
  
  it('should generate comprehensive Phase 1 compliance report', () => {
    const report = {
      timestamp: new Date().toISOString(),
      phase: 'Phase 1: Database Structure',
      compliance: {
        screenLocations: { target: 100, actual: 0, status: 'pending' },
        componentTypes: { target: 100, actual: 0, status: 'pending' },
        categories: { target: 100, actual: 0, status: 'pending' },
        namingConventions: { target: 100, actual: 0, status: 'pending' }
      },
      details: {
        screenLocationAlignment: {} as any,
        componentTypeStandardization: {} as any,
        categoryCompliance: {} as any,
        numericNamingViolations: [] as any[]
      },
      summary: {
        totalContentItems: 0,
        dropdownContainers: 0,
        options: 0,
        labels: 0,
        placeholders: 0
      }
    }
    
    // Test 1: Screen Location Alignment
    cy.request(`${API_BASE}/content/mortgage_calculation/en`).then(response => {
      const remainingInOldLocation = response.body.content ? Object.keys(response.body.content).length : 0
      
      // Should have minimal content in old location
      if (remainingInOldLocation < 60) {
        report.compliance.screenLocations.actual = 100
        report.compliance.screenLocations.status = 'passed'
      } else {
        report.compliance.screenLocations.actual = 50
        report.compliance.screenLocations.status = 'failed'
      }
      
      report.details.screenLocationAlignment = {
        mortgage_calculation_remaining: remainingInOldLocation,
        expected: 'less than 60 non-dropdown items'
      }
    })
    
    // Test 2: Component Type Standardization
    const checkComponentTypes = () => {
      return cy.request(`${API_BASE}/content/mortgage_step1/en`).then(response => {
        const content = response.body.content || {}
        const componentTypes = new Set<string>()
        let violations = 0
        
        Object.values(content).forEach((item: any) => {
          componentTypes.add(item.component_type)
          
          // Check for old component types
          if (['field_label', 'field_option', 'field_placeholder', 'dropdown_option'].includes(item.component_type)) {
            violations++
          }
        })
        
        if (violations === 0) {
          report.compliance.componentTypes.actual = 100
          report.compliance.componentTypes.status = 'passed'
        } else {
          report.compliance.componentTypes.actual = 0
          report.compliance.componentTypes.status = 'failed'
        }
        
        report.details.componentTypeStandardization = {
          found_types: Array.from(componentTypes),
          violations: violations,
          expected_types: ['dropdown', 'option', 'label', 'placeholder', 'text', 'button', 'title']
        }
      })
    }
    
    // Test 3: Category Compliance
    const checkCategories = () => {
      return cy.request(`${API_BASE}/content/mortgage_step2/en`).then(response => {
        const content = response.body.content || {}
        let formItems = 0
        let correctCategories = 0
        
        Object.values(content).forEach((item: any) => {
          if (['dropdown', 'option', 'label', 'placeholder'].includes(item.component_type)) {
            formItems++
            if (item.category === 'form') {
              correctCategories++
            }
          }
        })
        
        const categoryCompliance = formItems > 0 ? (correctCategories / formItems * 100) : 0
        report.compliance.categories.actual = Math.round(categoryCompliance)
        report.compliance.categories.status = categoryCompliance >= 95 ? 'passed' : 'failed'
        
        report.details.categoryCompliance = {
          form_items: formItems,
          correct_categories: correctCategories,
          compliance_percentage: categoryCompliance
        }
      })
    }
    
    // Test 4: Naming Convention Check
    const checkNamingConventions = () => {
      const screens = ['mortgage_step1', 'mortgage_step2', 'mortgage_step3']
      const violations: string[] = []
      
      return Promise.all(
        screens.map(screen => 
          cy.request(`${API_BASE}/content/${screen}/en`).then(response => {
            const content = response.body.content || {}
            
            Object.entries(content).forEach(([key, item]: [string, any]) => {
              if (item.component_type === 'option' && key.match(/option_\d+$/)) {
                violations.push(`${screen}: ${key}`)
              }
            })
          })
        )
      ).then(() => {
        report.details.numericNamingViolations = violations
        
        if (violations.length === 0) {
          report.compliance.namingConventions.actual = 100
          report.compliance.namingConventions.status = 'passed'
        } else {
          report.compliance.namingConventions.actual = 0
          report.compliance.namingConventions.status = 'failed'
        }
      })
    }
    
    // Test 5: Summary Statistics
    const generateSummary = () => {
      const screens = ['mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4']
      
      return Promise.all(
        screens.map(screen =>
          cy.request(`${API_BASE}/content/${screen}/en`).then(response => {
            const content = response.body.content || {}
            
            Object.values(content).forEach((item: any) => {
              report.summary.totalContentItems++
              
              switch (item.component_type) {
                case 'dropdown':
                  report.summary.dropdownContainers++
                  break
                case 'option':
                  report.summary.options++
                  break
                case 'label':
                  report.summary.labels++
                  break
                case 'placeholder':
                  report.summary.placeholders++
                  break
              }
            })
          })
        )
      )
    }
    
    // Execute all checks
    cy.wrap(null).then(() => checkComponentTypes())
      .then(() => checkCategories())
      .then(() => checkNamingConventions())
      .then(() => generateSummary())
      .then(() => {
        // Calculate overall compliance
        const complianceScores = Object.values(report.compliance).map(c => c.actual)
        const overallCompliance = complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length
        
        // Generate final report
        cy.log('=================================')
        cy.log('PHASE 1 COMPLIANCE REPORT')
        cy.log('=================================')
        cy.log(`Generated: ${report.timestamp}`)
        cy.log('')
        
        // Compliance Summary
        cy.log('COMPLIANCE SUMMARY:')
        Object.entries(report.compliance).forEach(([key, value]) => {
          const status = value.status === 'passed' ? '✅' : '❌'
          cy.log(`${status} ${key}: ${value.actual}% (target: ${value.target}%)`)
        })
        
        cy.log('')
        cy.log(`OVERALL COMPLIANCE: ${Math.round(overallCompliance)}%`)
        
        // Details
        cy.log('')
        cy.log('DETAILED FINDINGS:')
        cy.log(`- Content items in old location: ${report.details.screenLocationAlignment.mortgage_calculation_remaining}`)
        cy.log(`- Component type violations: ${report.details.componentTypeStandardization.violations}`)
        cy.log(`- Category compliance: ${Math.round(report.details.categoryCompliance.compliance_percentage)}%`)
        cy.log(`- Numeric naming violations: ${report.details.numericNamingViolations.length}`)
        
        // Summary Statistics
        cy.log('')
        cy.log('CONTENT STATISTICS:')
        cy.log(`- Total content items: ${report.summary.totalContentItems}`)
        cy.log(`- Dropdown containers: ${report.summary.dropdownContainers}`)
        cy.log(`- Options: ${report.summary.options}`)
        cy.log(`- Labels: ${report.summary.labels}`)
        cy.log(`- Placeholders: ${report.summary.placeholders}`)
        
        // Final verdict
        cy.log('')
        cy.log('=================================')
        if (overallCompliance >= 95) {
          cy.log('✅ PHASE 1 COMPLETE - Database structure is compliant')
        } else {
          cy.log('❌ PHASE 1 INCOMPLETE - Further work required')
        }
        cy.log('=================================')
        
        // Assert overall compliance
        expect(overallCompliance).to.be.at.least(95, 
          'Phase 1 overall compliance should be at least 95%')
      })
  })
})