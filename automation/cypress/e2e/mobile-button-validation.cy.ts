/**
 * Mobile Button Validation Test
 * Verifies the mobile button fix (position: fixed) prevents overflow
 */

describe('Mobile Button Fix Validation', () => {
  
  it('✅ Validates mobile button stays within viewport', () => {
    // Test on iPhone X dimensions
    cy.viewport(375, 812)
    
    // Visit mortgage calculator
    cy.visit('/services/calculate-mortgage/1')
    
    // Wait for page load
    cy.wait(3000)
    
    // Check for mobile button
    cy.get('[class*="mobileButton"], [class*="mobile-button"], button[class*="Button"]')
      .filter(':visible')
      .first()
      .then($button => {
        if ($button.length > 0) {
          const rect = $button[0].getBoundingClientRect()
          const styles = window.getComputedStyle($button[0])
          
          // Log button details
          cy.log('📱 Mobile Button Found')
          cy.log(`Position: ${styles.position}`)
          cy.log(`Bottom: ${rect.bottom}px`)
          cy.log(`Left: ${rect.left}px`) 
          cy.log(`Right: ${rect.right}px`)
          cy.log(`Width: ${rect.width}px`)
          
          // Take screenshot for visual confirmation
          cy.screenshot('mobile-button-position')
          
          // Validate button is fixed (not sticky)
          expect(styles.position).to.equal('fixed', 'Button should use position: fixed')
          
          // Validate button is within viewport
          expect(rect.left).to.be.at.least(-1, 'Button should not overflow left')
          expect(rect.right).to.be.at.most(376, 'Button should not overflow right')
          expect(rect.bottom).to.be.at.most(813, 'Button should be within viewport height')
          
          cy.log('✅ Mobile button is properly positioned!')
        } else {
          cy.log('⚠️ No mobile button found on this page')
        }
      })
    
    // Check for horizontal scroll (should not exist)
    cy.window().then(win => {
      const hasScroll = win.document.documentElement.scrollWidth > 375
      
      if (hasScroll) {
        cy.log(`❌ HORIZONTAL SCROLL DETECTED: ${win.document.documentElement.scrollWidth}px > 375px`)
        cy.screenshot('horizontal-scroll-detected')
      } else {
        cy.log('✅ No horizontal scroll - page fits mobile viewport')
      }
      
      expect(hasScroll).to.be.false
    })
  })
  
  it('✅ Button remains fixed when scrolling', () => {
    cy.viewport(375, 812)
    cy.visit('/services/calculate-mortgage/1')
    cy.wait(3000)
    
    // Get initial button position
    cy.get('[class*="mobileButton"], [class*="mobile-button"], button[class*="Button"]')
      .filter(':visible')
      .first()
      .then($button => {
        if ($button.length > 0) {
          const initialRect = $button[0].getBoundingClientRect()
          const initialBottom = initialRect.bottom
          
          cy.log(`Initial button bottom: ${initialBottom}px`)
          
          // Scroll down
          cy.scrollTo(0, 300)
          cy.wait(1000)
          
          // Check button position after scroll
          cy.get('[class*="mobileButton"], [class*="mobile-button"], button[class*="Button"]')
            .filter(':visible')
            .first()
            .then($buttonAfter => {
              const afterRect = $buttonAfter[0].getBoundingClientRect()
              const afterBottom = afterRect.bottom
              
              cy.log(`After scroll bottom: ${afterBottom}px`)
              
              // Button should stay at same position (fixed)
              expect(Math.abs(afterBottom - initialBottom)).to.be.lessThan(10, 'Button should remain fixed')
              
              cy.screenshot('button-after-scroll')
              cy.log('✅ Button stays fixed when scrolling!')
            })
        }
      })
  })
})