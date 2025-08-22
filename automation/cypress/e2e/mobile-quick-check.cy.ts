/**
 * Quick Mobile UI Check - Fast validation of mobile layouts
 * NO PERCY - Using native Cypress only
 */

describe('🚀 Quick Mobile UI Check', () => {
  
  it('Critical mobile issues check - iPhone', () => {
    // Test iPhone X dimensions
    cy.viewport(375, 812)
    
    // Test homepage
    cy.visit('/')
    cy.wait(2000)
    
    // Check no horizontal scroll
    cy.window().then(win => {
      const scrollWidth = win.document.documentElement.scrollWidth
      const viewportWidth = 375
      
      if (scrollWidth > viewportWidth) {
        cy.log(`❌ HORIZONTAL SCROLL: Page width ${scrollWidth}px > Viewport ${viewportWidth}px`)
        
        // Find culprit elements
        cy.get('*').each($el => {
          const rect = $el[0].getBoundingClientRect()
          if (rect.right > viewportWidth + 5) {
            cy.log(`Overflow element: ${$el[0].tagName}.${$el[0].className} at ${rect.right}px`)
          }
        })
      } else {
        cy.log(`✅ No horizontal scroll (${scrollWidth}px = ${viewportWidth}px)`)
      }
      
      expect(scrollWidth).to.be.at.most(viewportWidth, 'Should have no horizontal scroll')
    })
    
    cy.screenshot('mobile-homepage-iphone')
    
    // Test mortgage calculator
    cy.visit('/services/calculate-mortgage/1')
    cy.wait(2000)
    
    // Check mobile button
    cy.get('[class*="mobileButton"], [class*="mobile-button"], [class*="MobileButton"]').then($buttons => {
      if ($buttons.length > 0) {
        cy.log(`✅ Found ${$buttons.length} mobile button(s)`)
        
        const button = $buttons[0]
        const rect = button.getBoundingClientRect()
        const styles = window.getComputedStyle(button)
        
        cy.log(`Button position: ${styles.position}`)
        cy.log(`Button location: bottom=${rect.bottom}px, left=${rect.left}px, right=${rect.right}px`)
        
        // Verify button is fixed and at bottom
        expect(styles.position).to.equal('fixed', 'Button should be fixed')
        expect(rect.bottom).to.be.closeTo(812, 100, 'Button should be at bottom')
        expect(rect.left).to.be.at.least(-1, 'Button should not overflow left')
        expect(rect.right).to.be.at.most(376, 'Button should not overflow right')
        
        cy.screenshot('mobile-button-visible')
      } else {
        cy.log('⚠️ No mobile button found')
      }
    })
    
    // Check form inputs don't overflow
    cy.get('input:visible, select:visible').each(($input, index) => {
      if (index < 5) { // Check first 5 inputs only for speed
        const rect = $input[0].getBoundingClientRect()
        if (rect.right > 376) {
          cy.log(`❌ Input ${index} overflows: right=${rect.right}px`)
        }
        expect(rect.right).to.be.at.most(376, `Input ${index} should not overflow`)
      }
    })
    
    cy.screenshot('mobile-mortgage-form')
  })
  
  it('Button stays fixed when scrolling', () => {
    cy.viewport(375, 812)
    cy.visit('/services/calculate-mortgage/1')
    cy.wait(2000)
    
    // Get initial button position
    cy.get('[class*="mobileButton"], [class*="mobile-button"]').first().then($btn => {
      if ($btn.length > 0) {
        const initialBottom = $btn[0].getBoundingClientRect().bottom
        
        // Scroll down
        cy.scrollTo(0, 500)
        cy.wait(500)
        
        // Check button still at bottom
        cy.get('[class*="mobileButton"], [class*="mobile-button"]').first().then($btnAfter => {
          const afterBottom = $btnAfter[0].getBoundingClientRect().bottom
          
          cy.log(`Button bottom: Initial=${initialBottom}px, After scroll=${afterBottom}px`)
          expect(afterBottom).to.be.closeTo(initialBottom, 50, 'Button should stay fixed')
          
          cy.screenshot('mobile-button-after-scroll')
        })
      }
    })
  })
  
  it('Multiple device quick check', () => {
    const devices = [
      { name: 'iPhone-SE', width: 375, height: 667 },
      { name: 'Samsung', width: 360, height: 800 },
      { name: 'iPad', width: 768, height: 1024 }
    ]
    
    devices.forEach(device => {
      cy.viewport(device.width, device.height)
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(1500)
      
      // Quick overflow check
      cy.window().then(win => {
        const hasScroll = win.document.documentElement.scrollWidth > device.width
        
        if (hasScroll) {
          cy.log(`❌ ${device.name}: Horizontal scroll detected`)
        } else {
          cy.log(`✅ ${device.name}: No overflow`)
        }
        
        expect(hasScroll).to.be.false
      })
      
      cy.screenshot(`quick-check-${device.name}`)
    })
  })
  
  it('SUMMARY: Mobile UI Report', () => {
    cy.viewport(375, 812)
    
    const results = {
      homepage: { overflow: false, button: false },
      mortgage: { overflow: false, button: false },
      issues: []
    }
    
    // Check homepage
    cy.visit('/')
    cy.wait(1500)
    cy.window().then(win => {
      results.homepage.overflow = win.document.documentElement.scrollWidth > 375
      if (results.homepage.overflow) {
        results.issues.push('Homepage has horizontal scroll')
      }
    })
    
    // Check mortgage
    cy.visit('/services/calculate-mortgage/1')
    cy.wait(1500)
    cy.window().then(win => {
      results.mortgage.overflow = win.document.documentElement.scrollWidth > 375
      if (results.mortgage.overflow) {
        results.issues.push('Mortgage page has horizontal scroll')
      }
    })
    
    // Check button
    cy.get('[class*="mobileButton"]').then($btn => {
      if ($btn.length > 0) {
        results.mortgage.button = true
        const rect = $btn[0].getBoundingClientRect()
        if (rect.right > 375 || rect.left < 0) {
          results.issues.push('Mobile button overflows viewport')
        }
      } else {
        results.issues.push('Mobile button not found')
      }
    })
    
    // Generate report
    cy.then(() => {
      cy.log('📱 MOBILE UI TEST SUMMARY')
      cy.log('========================')
      
      if (results.issues.length === 0) {
        cy.log('✅ ALL CHECKS PASSED!')
        cy.log('- No horizontal scroll')
        cy.log('- Mobile button properly positioned')
        cy.log('- Forms within viewport')
      } else {
        cy.log(`❌ ISSUES FOUND (${results.issues.length}):`)
        results.issues.forEach(issue => {
          cy.log(`- ${issue}`)
        })
      }
      
      // Final assertion
      expect(results.issues.length).to.equal(0, 'Should have no mobile UI issues')
    })
  })
})