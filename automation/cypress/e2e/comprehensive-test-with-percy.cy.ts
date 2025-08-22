/**
 * Comprehensive Test Suite with Percy Visual Testing
 * Tests all 4 services with visual snapshots
 */

describe('Comprehensive Banking Services Test', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
  })

  const services = [
    { name: 'Mortgage', path: 'calculate-mortgage' },
    { name: 'Credit', path: 'calculate-credit' },
    { name: 'Refinance-Mortgage', path: 'refinance-mortgage' },
    { name: 'Refinance-Credit', path: 'refinance-credit' }
  ]

  it('Homepage Visual Test', () => {
    cy.visit('/')
    cy.wait(2000)
    cy.switchToEnglish()
    cy.wait(1000)
    
    // Percy snapshot of homepage
    cy.percySnapshot('Homepage - English')
    
    // Verify services are visible
    cy.get('a[href*="/services"]').should('be.visible')
    cy.screenshot('homepage-services')
  })

  services.forEach(service => {
    it(`${service.name} - Step 1 Visual and Functional Test`, () => {
      cy.log(`🚀 Testing ${service.name} Step 1`)
      
      // Navigate directly to service
      cy.visit(`/services/${service.path}/1`)
      cy.wait(3000)
      
      // Switch to English for consistency
      cy.switchToEnglish()
      cy.wait(1000)
      
      // Percy snapshot of initial state
      cy.percySnapshot(`${service.name} - Step 1 Initial`)
      
      // Fill form with data-testid selectors where available
      cy.log('📝 Filling form fields')
      
      // Property/Loan value
      cy.get('[data-testid*="property"], [data-testid*="loan"], input[type="text"]')
        .first()
        .clear()
        .type('2500000')
      
      // Try to interact with dropdowns using data-testid
      const dropdownTestIds = [
        'city-dropdown',
        'when-needed-dropdown', 
        'property-type-dropdown',
        'first-home-dropdown',
        'property-ownership-dropdown'
      ]
      
      dropdownTestIds.forEach(testId => {
        cy.get('body').then($body => {
          if ($body.find(`[data-testid="${testId}"]`).length > 0) {
            cy.get(`[data-testid="${testId}"]`).click({ force: true })
            cy.wait(300)
            // Select first option
            cy.get(`[data-testid^="${testId}-item"], li, [role="option"]`)
              .first()
              .click({ force: true })
            cy.log(`✅ Selected ${testId}`)
          }
        })
      })
      
      // Initial fee if present
      cy.get('body').then($body => {
        if ($body.find('[data-testid="initial-fee-input"]').length > 0) {
          cy.get('[data-testid="initial-fee-input"]').clear().type('750000')
        }
      })
      
      // Percy snapshot after filling
      cy.percySnapshot(`${service.name} - Step 1 Filled`)
      
      // Regular screenshot for backup
      cy.screenshot(`${service.name}-step1-filled`)
      
      // Verify form is filled
      cy.get('input').filter(':visible').then($inputs => {
        const filledInputs = $inputs.filter((i, el) => el.value !== '')
        cy.log(`✅ Filled ${filledInputs.length} inputs`)
        expect(filledInputs.length).to.be.greaterThan(0)
      })
    })
  })

  it('Font Consistency Visual Check', () => {
    cy.log('🔤 Checking font consistency')
    
    const pagesToCheck = [
      '/',
      '/services/calculate-mortgage/1',
      '/services/calculate-credit/1'
    ]
    
    pagesToCheck.forEach((page, index) => {
      cy.visit(page)
      cy.wait(2000)
      
      // Take Percy snapshot for font comparison
      cy.percySnapshot(`Font Check - Page ${index + 1}`)
      
      // Check computed font
      cy.get('body').then($body => {
        const font = window.getComputedStyle($body[0]).fontFamily
        cy.log(`Page ${page}: Font = ${font}`)
        
        // Verify font contains expected families
        expect(font).to.match(/Rubik|Open Sans|Arial/i)
      })
    })
  })

  it('Dropdown Functionality Test', () => {
    cy.log('🔽 Testing dropdown functionality')
    
    cy.visit('/services/calculate-mortgage/1')
    cy.wait(2000)
    cy.switchToEnglish()
    
    // Test each dropdown with data-testid
    const dropdowns = [
      { testId: 'property-ownership-dropdown', name: 'Property Ownership' },
      { testId: 'city-dropdown', name: 'City' },
      { testId: 'when-needed-dropdown', name: 'When Needed' },
      { testId: 'property-type-dropdown', name: 'Property Type' },
      { testId: 'first-home-dropdown', name: 'First Home' }
    ]
    
    dropdowns.forEach(dropdown => {
      cy.get('body').then($body => {
        if ($body.find(`[data-testid="${dropdown.testId}"]`).length > 0) {
          cy.log(`Testing ${dropdown.name}`)
          
          // Click dropdown
          cy.get(`[data-testid="${dropdown.testId}"]`).click({ force: true })
          cy.wait(300)
          
          // Verify options appear
          cy.get('li, [role="option"], [data-testid*="item"]').should('have.length.greaterThan', 0)
          
          // Select first option
          cy.get('li, [role="option"], [data-testid*="item"]').first().click({ force: true })
          
          // Percy snapshot of dropdown state
          cy.percySnapshot(`Dropdown - ${dropdown.name}`)
          
          cy.log(`✅ ${dropdown.name} dropdown works`)
        } else {
          cy.log(`⚠️ ${dropdown.name} dropdown not found`)
        }
      })
    })
  })

  it('Mobile Responsive Test', () => {
    cy.log('📱 Testing mobile responsiveness')
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 812 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ]
    
    viewports.forEach(viewport => {
      cy.viewport(viewport.width, viewport.height)
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Percy snapshot for each viewport
      cy.percySnapshot(`Responsive - ${viewport.name}`)
      
      // Verify mobile button positioning
      if (viewport.width < 768) {
        cy.get('[class*="mobileButton"], [class*="mobile-button"]').then($btn => {
          if ($btn.length > 0) {
            const position = window.getComputedStyle($btn[0]).position
            cy.log(`Mobile button position: ${position}`)
            expect(position).to.equal('fixed')
          }
        })
      }
    })
  })
})