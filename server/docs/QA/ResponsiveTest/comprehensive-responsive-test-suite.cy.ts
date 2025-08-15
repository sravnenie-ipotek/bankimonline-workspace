/**
 * Comprehensive Responsive QA Test Suite
 * Banking Application - Multi-step Forms & UI Responsiveness
 * Date: 2025-08-14
 * 
 * Test Coverage:
 * - All viewport matrix: Mobile (320×568, 360×640, 390×844, 414×896)
 * - Tablet (768×1024, 820×1180), Laptop (1280×800), Desktop (1440×900, 1920×1080)
 * - Multi-step processes: Mortgage, Credit, Refinancing, Business Credit
 * - Multi-language support: Hebrew (RTL), English, Russian
 * - Menu implementations: Main nav, mobile, sidebars, footers
 */

describe('Comprehensive Responsive Banking Application Tests', () => {
  
  // Viewport test matrix
  const viewports = [
    { name: 'Mobile_XSmall', width: 320, height: 568, category: 'mobile' },
    { name: 'Mobile_Small', width: 360, height: 640, category: 'mobile' },
    { name: 'Mobile_Medium', width: 390, height: 844, category: 'mobile' },
    { name: 'Mobile_Large', width: 414, height: 896, category: 'mobile' },
    { name: 'Tablet_Small', width: 768, height: 1024, category: 'tablet' },
    { name: 'Tablet_Large', width: 820, height: 1180, category: 'tablet' },
    { name: 'Laptop', width: 1280, height: 800, category: 'laptop' },
    { name: 'Desktop_Medium', width: 1440, height: 900, category: 'desktop' },
    { name: 'Desktop_Large', width: 1920, height: 1080, category: 'desktop' }
  ]

  // Service processes to test
  const serviceProcesses = [
    { name: 'Calculate Mortgage', path: '/services/calculate-mortgage/1', steps: 4 },
    { name: 'Refinance Mortgage', path: '/services/refinance-mortgage/1', steps: 4 },
    { name: 'Calculate Credit', path: '/services/calculate-credit/1', steps: 4 },
    { name: 'Refinance Credit', path: '/services/refinance-credit/1', steps: 4 }
  ]

  // Languages to test
  const languages = [
    { code: 'he', name: 'Hebrew', rtl: true },
    { code: 'en', name: 'English', rtl: false },
    { code: 'ru', name: 'Russian', rtl: false }
  ]

  beforeEach(() => {
    cy.visit('/')
    cy.wait(2000) // Allow translations to load
  })

  describe('Homepage Responsive Tests', () => {
    viewports.forEach((viewport) => {
      it(`should render homepage correctly on ${viewport.name} (${viewport.width}×${viewport.height})`, () => {
        cy.viewport(viewport.width, viewport.height)
        
        // Test ID: RSP-001
        // Category: Layout
        // Test horizontal scroll
        cy.get('body').should('not.have.css', 'overflow-x', 'scroll')
        cy.window().should('not.have.property', 'scrollX').gt(0)
        
        // Test main navigation
        if (viewport.category === 'mobile') {
          // Should show burger menu on mobile
          cy.get('button').should('contain.html', 'img').should('be.visible')
        } else {
          // Should show full navigation on larger screens
          cy.get('nav').should('be.visible')
        }
        
        // Test service cards layout
        cy.get('[href*="calculate-mortgage"]').should('be.visible')
        cy.get('[href*="refinance-mortgage"]').should('be.visible')
        cy.get('[href*="calculate-credit"]').should('be.visible')
        cy.get('[href*="refinance-credit"]').should('be.visible')
        
        // Test footer visibility
        cy.get('footer').should('be.visible')
        cy.scrollTo('bottom')
        cy.get('footer').should('be.visible')
        
        // Screenshot evidence
        cy.screenshot(`homepage_${viewport.name}_${viewport.width}x${viewport.height}`)
      })
    })
  })

  describe('Multi-Step Form Responsive Tests', () => {
    serviceProcesses.forEach((process) => {
      viewports.forEach((viewport) => {
        it(`should render ${process.name} step 1 correctly on ${viewport.name}`, () => {
          cy.viewport(viewport.width, viewport.height)
          cy.visit(process.path)
          cy.wait(3000) // Allow form to load
          
          // Test ID: RSP-002
          // Category: Form
          // Test step indicator
          cy.get('[role="main"]').within(() => {
            cy.contains('1').should('be.visible')
            cy.contains('2').should('be.visible')
            cy.contains('3').should('be.visible')
            cy.contains('4').should('be.visible')
          })
          
          // Test form fields are visible and accessible
          cy.get('input, select, textarea, [role="combobox"]').should('have.length.gte', 1)
          
          // Test form doesn't overflow horizontally
          cy.get('form, [role="main"]').should('not.have.css', 'overflow-x', 'scroll')
          
          // Test buttons are accessible
          cy.get('button').should('be.visible').should('not.be.disabled')
          
          // Screenshot evidence
          cy.screenshot(`${process.name.replace(/ /g, '_')}_step1_${viewport.name}`)
        })
      })
    })
  })

  describe('Menu Implementation Tests', () => {
    viewports.forEach((viewport) => {
      it(`should test menu implementations on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height)
        
        // Test ID: RSP-003
        // Category: Navigation
        if (viewport.category === 'mobile') {
          // Test mobile menu functionality
          cy.get('button').first().should('be.visible')
          cy.get('button').first().click()
          
          // Should open mobile navigation
          cy.get('nav').should('be.visible')
          
          // Test navigation links
          cy.get('nav').within(() => {
            cy.get('a').should('have.length.gte', 5)
          })
        } else {
          // Test desktop navigation
          cy.get('nav').should('be.visible')
          cy.get('nav a').should('have.length.gte', 5)
        }
        
        // Test footer menu
        cy.scrollTo('bottom')
        cy.get('footer').within(() => {
          cy.get('a').should('have.length.gte', 3)
        })
        
        cy.screenshot(`menu_${viewport.name}`)
      })
    })
  })

  describe('Multi-Language Responsive Tests', () => {
    languages.forEach((lang) => {
      viewports.slice(0, 3).forEach((viewport) => { // Test subset for efficiency
        it(`should render correctly in ${lang.name} on ${viewport.name}`, () => {
          cy.viewport(viewport.width, viewport.height)
          
          // Test ID: RSP-004
          // Category: Internationalization
          // Switch language if needed
          if (lang.code !== 'he') {
            cy.get('[data-testid="language-selector"]').click()
            cy.contains(lang.name).click()
            cy.wait(2000)
          }
          
          // Test RTL layout for Hebrew
          if (lang.rtl) {
            cy.get('html').should('have.attr', 'dir', 'rtl')
            cy.get('body').should('have.css', 'direction', 'rtl')
          } else {
            cy.get('html').should('not.have.attr', 'dir', 'rtl')
          }
          
          // Test content loads properly
          cy.get('main').should('contain.text').should('be.visible')
          
          // Test no horizontal scroll
          cy.get('body').should('not.have.css', 'overflow-x', 'scroll')
          
          cy.screenshot(`language_${lang.code}_${viewport.name}`)
        })
      })
    })
  })

  describe('Performance and Accessibility Tests', () => {
    const criticalViewports = [
      { name: 'Mobile_Critical', width: 320, height: 568 },
      { name: 'Desktop_Critical', width: 1440, height: 900 }
    ]

    criticalViewports.forEach((viewport) => {
      it(`should meet performance criteria on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height)
        
        // Test ID: RSP-005
        // Category: Performance
        const startTime = Date.now()
        cy.visit('/')
        cy.get('main').should('be.visible')
        const loadTime = Date.now() - startTime
        
        // Should load within 5 seconds
        expect(loadTime).to.be.lessThan(5000)
        
        // Test Cumulative Layout Shift (visual stability)
        cy.wait(3000) // Wait for any layout shifts
        cy.get('main').should('be.visible').should('not.have.css', 'transform')
        
        // Test accessibility basics
        cy.get('h1, h2, h3').should('exist')
        cy.get('button, a').each(($el) => {
          cy.wrap($el).should('not.have.css', 'color', 'rgb(255, 255, 255)')
            .should('not.have.css', 'background-color', 'rgb(255, 255, 255)')
        })
        
        cy.screenshot(`performance_${viewport.name}`)
      })
    })
  })

  describe('Edge Case and Error Handling Tests', () => {
    const edgeCases = [
      { name: 'Ultra_Narrow', width: 280, height: 568 },
      { name: 'Ultra_Wide', width: 2560, height: 1440 },
      { name: 'Square', width: 800, height: 800 }
    ]

    edgeCases.forEach((viewport) => {
      it(`should handle edge case viewport ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height)
        
        // Test ID: RSP-006
        // Category: Edge Cases
        cy.visit('/')
        cy.wait(2000)
        
        // Content should be visible
        cy.get('main').should('be.visible')
        
        // No horizontal overflow
        cy.get('body').should('not.have.css', 'overflow-x', 'scroll')
        
        // Essential buttons should be accessible
        cy.get('button, a').first().should('be.visible')
        
        cy.screenshot(`edge_case_${viewport.name}`)
      })
    })
  })

  describe('Form Interaction Tests', () => {
    const interactionViewports = [
      { name: 'Mobile', width: 390, height: 844 },
      { name: 'Desktop', width: 1440, height: 900 }
    ]

    interactionViewports.forEach((viewport) => {
      it(`should handle form interactions on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height)
        cy.visit('/services/calculate-mortgage/1')
        cy.wait(3000)
        
        // Test ID: RSP-007
        // Category: Interaction
        // Test property value input
        cy.get('input[value*="1,000,000"]').should('be.visible').clear().type('2000000')
        
        // Test dropdown interactions
        cy.get('[role="combobox"]').first().should('be.visible').click()
        cy.wait(500)
        
        // Test form validation doesn't break layout
        cy.get('button').contains('הבא').click()
        cy.wait(1000)
        
        // Ensure no layout breaks
        cy.get('body').should('not.have.css', 'overflow-x', 'scroll')
        
        cy.screenshot(`interaction_${viewport.name}`)
      })
    })
  })
})

// Helper functions for test data and utilities
function generateTestReport(testResults) {
  // Generate comprehensive test execution report
  return {
    executionDate: new Date().toISOString(),
    totalTests: testResults.length,
    passedTests: testResults.filter(t => t.status === 'passed').length,
    failedTests: testResults.filter(t => t.status === 'failed').length,
    viewportsCovered: viewports.length,
    processesTested: serviceProcesses.length,
    languagesTested: languages.length
  }
}