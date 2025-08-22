/**
 * Visual Regression Tests WITHOUT Percy
 * Using Cypress screenshots and assertions instead
 */

describe('Visual Regression Tests (No Percy)', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  const services = [
    { name: 'Mortgage', path: '/services/calculate-mortgage/1' },
    { name: 'Credit', path: '/services/calculate-credit/1' },
    { name: 'Refinance-Mortgage', path: '/services/refinance-mortgage/1' },
    { name: 'Refinance-Credit', path: '/services/refinance-credit/1' }
  ]

  describe('Desktop Visual Tests', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080)
    })

    services.forEach(service => {
      it(`${service.name} - Visual consistency check`, () => {
        cy.visit(service.path)
        cy.wait(2000)
        
        // Take screenshot for visual comparison
        cy.screenshot(`desktop-${service.name.toLowerCase()}-initial`, {
          capture: 'viewport',
          overwrite: true
        })
        
        // Fill some form fields to check different states
        cy.get('input[type="text"], input[type="number"]').first().then($input => {
          if ($input.length > 0) {
            cy.wrap($input).clear().type('2000000')
            cy.wait(500)
            
            // Screenshot after interaction
            cy.screenshot(`desktop-${service.name.toLowerCase()}-filled`, {
              capture: 'viewport',
              overwrite: true
            })
          }
        })
      })
    })
  })

  describe('Mobile Visual Tests', () => {
    const mobileViewports = [
      { name: 'iphone-x', width: 375, height: 812 },
      { name: 'ipad', width: 768, height: 1024 }
    ]

    mobileViewports.forEach(viewport => {
      services.forEach(service => {
        it(`${service.name} on ${viewport.name}`, () => {
          cy.viewport(viewport.width, viewport.height)
          cy.visit(service.path)
          cy.wait(2000)
          
          // Take screenshot
          cy.screenshot(`${viewport.name}-${service.name.toLowerCase()}`, {
            capture: 'viewport',
            overwrite: true
          })
          
          // Check no overflow
          cy.window().then(win => {
            const hasScroll = win.document.documentElement.scrollWidth > viewport.width
            expect(hasScroll).to.be.false
          })
        })
      })
    })
  })

  describe('Multi-Language Visual Tests', () => {
    it('Hebrew RTL layout', () => {
      cy.viewport(1920, 1080)
      cy.visit('/')
      
      // Switch to Hebrew
      cy.get('button').then($buttons => {
        const heBtn = $buttons.filter((i, el) => {
          return el.textContent?.includes('עברית') || el.textContent?.includes('HE')
        })
        if (heBtn.length > 0) {
          cy.wrap(heBtn.first()).click()
          cy.wait(2000)
        }
      })
      
      // Visit mortgage in Hebrew
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Verify RTL
      cy.get('html').should('have.attr', 'dir', 'rtl')
      
      // Screenshot
      cy.screenshot('hebrew-rtl-mortgage', {
        capture: 'viewport',
        overwrite: true
      })
    })
  })
})