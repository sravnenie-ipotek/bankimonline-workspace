describe('TemporaryFranchise - Database-Only Content Validation', () => {
  beforeEach(() => {
    cy.visit('/Real-Estate-Brokerage', { timeout: 15000 })
    cy.wait(3000)
  })

  it('should display all main sections with database content', () => {
    // Main hero section
    cy.get('[class*="main-hero-section"]').should('be.visible')
    cy.get('[class*="main-hero-title"]').should('be.visible').and('not.be.empty')
    
    // Secondary hero section
    cy.get('[class*="hero-section"]').should('be.visible')
    cy.get('[class*="hero-title"]').should('be.visible').and('not.be.empty')
    
    // Client sources section
    cy.get('[class*="client-sources-section"]').should('be.visible')
    cy.get('[class*="client-sources-title"]').should('be.visible').and('not.be.empty')
    
    // Partnership section
    cy.get('[class*="partnership-section"]').should('be.visible')
    cy.get('[class*="partnership-title"]').should('be.visible').and('not.be.empty')
    
    // Franchise includes section
    cy.get('[class*="franchise-includes-section"]').should('be.visible')
    cy.get('[class*="franchise-includes-title"]').should('be.visible').and('not.be.empty')
    
    // Process steps section
    cy.get('[class*="how-to-open-section"]').should('be.visible')
    cy.get('[class*="how-to-open-title"]').should('be.visible').and('not.be.empty')
    
    // Pricing section
    cy.get('[class*="franchise-pricing-section"]').should('be.visible')
    cy.get('[class*="pricing-main-title"]').should('be.visible').and('not.be.empty')
    
    // Final CTA section
    cy.get('[class*="final-cta-section"]').should('be.visible')
    cy.get('[class*="final-cta-title"]').should('be.visible').and('not.be.empty')
  })

  it('should validate accordion functionality with database content', () => {
    // Verify all 3 accordion items exist
    cy.get('[class*="accordion-item"]').should('have.length', 3)
    
    // Test first accordion
    cy.get('[class*="accordion-item"]').first().within(() => {
      cy.get('[class*="accordion-title"]').should('be.visible').and('not.be.empty')
      cy.get('[class*="accordion-header"]').click()
      cy.get('[class*="accordion-content"]').should('be.visible')
      cy.get('[class*="benefit-item"]').should('have.length', 4)
    })
    
    // Test second accordion
    cy.get('[class*="accordion-item"]').eq(1).within(() => {
      cy.get('[class*="accordion-title"]').should('be.visible').and('not.be.empty')
      cy.get('[class*="accordion-header"]').click()
      cy.get('[class*="accordion-content"]').should('be.visible')
      cy.get('[class*="benefit-item"]').should('have.length', 3)
    })
    
    // Test third accordion
    cy.get('[class*="accordion-item"]').eq(2).within(() => {
      cy.get('[class*="accordion-title"]').should('be.visible').and('not.be.empty')
      cy.get('[class*="accordion-header"]').click()  
      cy.get('[class*="accordion-content"]').should('be.visible')
      cy.get('[class*="benefit-item"]').should('have.length', 3)
    })
  })

  it('should display all 5 process steps with database content', () => {
    cy.get('[class*="franchise-steps-container"]').within(() => {
      cy.get('[class*="franchise-step-card"]').should('have.length', 5)
      
      // Verify each step has title and description from database
      cy.get('[class*="franchise-step-card"]').each(($card, index) => {
        cy.wrap($card).within(() => {
          cy.get('[class*="franchise-step-number"]').should('contain.text', (index + 1).toString())
          cy.get('[class*="franchise-step-title"]').should('be.visible').and('not.be.empty')
          cy.get('[class*="franchise-step-description"]').should('be.visible').and('not.be.empty')
        })
      })
    })
  })

  it('should display pricing metrics from database', () => {
    cy.get('[class*="pricing-metrics-card"]').within(() => {
      // Should have 3 pricing metrics
      cy.get('[class*="pricing-metric-item"]').should('have.length', 3)
      
      cy.get('[class*="pricing-metric-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[class*="metric-label"]').should('be.visible').and('not.be.empty')
          cy.get('[class*="metric-value"]').should('be.visible').and('not.be.empty')
        })
      })
      
      // Pricing note and CTA
      cy.get('[class*="pricing-note-text"]').should('be.visible').and('not.be.empty')
      cy.get('[class*="pricing-cta-button"]').should('be.visible').and('not.be.empty')
    })
  })

  it('should validate no t() fallback keys are visible (database-only)', () => {
    // Verify no translation keys are showing as text
    cy.get('body')
      .should('not.contain.text', 'franchise_main_hero_title')
      .and('not.contain.text', 'franchise_hero_title')
      .and('not.contain.text', 'franchise_includes_turnkey_title')
      .and('not.contain.text', 'franchise_step_1_title')
      .and('not.contain.text', 'franchise_pricing_title')
      .and('not.contain.text', 'franchise_final_cta_title')
  })

  it('should handle all CTA buttons correctly', () => {
    const ctaSelectors = [
      '[class*="main-hero-cta-button"]',
      '[class*="hero-cta-button"]', 
      '[class*="partnership-cta-button"]',
      '[class*="franchise-cta-button"]',
      '[class*="pricing-cta-button"]',
      '[class*="final-cta-button"]'
    ]
    
    ctaSelectors.forEach(selector => {
      cy.get(selector)
        .should('be.visible')
        .and('not.be.empty')
        .and('not.be.disabled')
    })
  })

  it('should validate substantial content exists', () => {
    cy.get('body').then(($body) => {
      const text = $body.text()
      expect(text).to.not.include('undefined')
      expect(text).to.not.include('null')
      expect(text).to.not.include('[object Object]')
      expect(text.trim()).to.have.length.greaterThan(1000) // Substantial content from database
    })
  })
})