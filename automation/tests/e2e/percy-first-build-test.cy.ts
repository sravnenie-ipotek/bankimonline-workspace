/**
 * Percy First Build Test
 * Simple test to trigger the first Percy build and validate mobile button fixes
 */

describe('Percy First Build - Banking App Visual Tests', () => {
  beforeEach(() => {
    // Ensure clean state
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Set Hebrew as default language for banking tests
    cy.window().then((win) => {
      win.localStorage.setItem('language', 'he')
    })
  })

  it('should capture homepage - first Percy build', () => {
    cy.visit('/')
    
    // Wait for page to load completely
    cy.get('body').should('be.visible')
    
    // Capture desktop view
    cy.percySnapshot('Banking Homepage - Desktop', {
      widths: [1920, 1280, 1024]
    })
  })

  it('should capture mobile homepage - button overflow validation', () => {
    // Set mobile viewport (iPhone X)
    cy.viewport(375, 812)
    
    cy.visit('/')
    cy.get('body').should('be.visible')
    
    // Capture mobile view to validate button fixes
    cy.percySnapshot('Banking Homepage - Mobile iPhone X', {
      widths: [375]
    })
  })

  it('should capture mortgage calculator step 1 - Hebrew RTL', () => {
    cy.visit('/services/calculate-mortgage/1')
    
    // Wait for mortgage form to load
    cy.get('body').should('be.visible')
    cy.wait(2000) // Allow form to fully render
    
    // Capture Hebrew RTL layout
    cy.percySnapshot('Mortgage Calculator Step 1 - Hebrew RTL', {
      widths: [375, 768, 1024, 1920]
    })
  })

  it('should capture mobile button positioning across viewports', () => {
    const viewports = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 812, name: 'iPhone X' },
      { width: 414, height: 896, name: 'iPhone 12 Pro Max' }
    ]

    viewports.forEach((viewport) => {
      cy.viewport(viewport.width, viewport.height)
      cy.visit('/services/calculate-mortgage/1')
      
      // Wait for form and buttons to render
      cy.get('body').should('be.visible')
      
      // Look for common button selectors (adjust if needed)
      cy.get('button', { timeout: 10000 }).should('exist')
      
      // Capture this viewport
      cy.percySnapshot(`Mortgage Step 1 - ${viewport.name} (${viewport.width}x${viewport.height})`, {
        widths: [viewport.width]
      })
    })
  })

  it('should capture Hebrew language switching', () => {
    cy.visit('/')
    
    // Switch to Hebrew if not already
    cy.get('body').then(($body) => {
      // Look for language selector
      if ($body.find('[data-testid="language-selector"]').length > 0) {
        cy.get('[data-testid="language-selector"]').click()
        cy.contains('עברית').click()
        cy.wait(1000)
      }
    })
    
    // Capture Hebrew layout
    cy.percySnapshot('Homepage - Hebrew RTL Layout', {
      widths: [375, 768, 1024, 1920]
    })
  })
})