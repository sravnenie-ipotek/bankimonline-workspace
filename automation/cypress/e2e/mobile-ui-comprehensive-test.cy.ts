/**
 * Comprehensive Mobile UI Test Suite
 * Tests for overflow issues, button positioning, and responsive layouts
 * NO PERCY REQUIRED - Using native Cypress assertions
 */

describe('📱 Comprehensive Mobile UI Testing', () => {
  // Define test devices
  const mobileDevices = [
    { name: 'iPhone-SE', width: 375, height: 667, type: 'phone' },
    { name: 'iPhone-12-Pro', width: 390, height: 844, type: 'phone' },
    { name: 'iPhone-14-Pro-Max', width: 430, height: 932, type: 'phone' },
    { name: 'Samsung-Galaxy-S20', width: 360, height: 800, type: 'phone' },
    { name: 'Pixel-5', width: 393, height: 851, type: 'phone' },
    { name: 'iPad-Mini', width: 768, height: 1024, type: 'tablet' },
    { name: 'iPad-Pro', width: 1024, height: 1366, type: 'tablet' }
  ]

  // All pages to test
  const pagesToTest = [
    { url: '/', name: 'Homepage' },
    { url: '/services/calculate-mortgage/1', name: 'Mortgage-Step1' },
    { url: '/services/calculate-mortgage/2', name: 'Mortgage-Step2' },
    { url: '/services/calculate-mortgage/3', name: 'Mortgage-Step3' },
    { url: '/services/calculate-mortgage/4', name: 'Mortgage-Step4' },
    { url: '/services/calculate-credit/1', name: 'Credit-Step1' },
    { url: '/services/refinance-mortgage/1', name: 'Refinance-Mortgage' },
    { url: '/services/refinance-credit/1', name: 'Refinance-Credit' },
    { url: '/about', name: 'About' },
    { url: '/contact', name: 'Contact' }
  ]

  describe('🔍 Overflow Detection Tests', () => {
    mobileDevices.filter(d => d.type === 'phone').forEach(device => {
      it(`Should have NO horizontal overflow on ${device.name}`, () => {
        cy.viewport(device.width, device.height)
        
        pagesToTest.slice(0, 5).forEach(page => {
          cy.visit(page.url)
          cy.wait(2000)
          
          // Check for horizontal scroll
          cy.window().then(win => {
            const hasHorizontalScroll = win.document.documentElement.scrollWidth > device.width
            
            if (hasHorizontalScroll) {
              cy.log(`❌ HORIZONTAL SCROLL DETECTED on ${page.name}`)
              cy.log(`Page width: ${win.document.documentElement.scrollWidth}px, Device: ${device.width}px`)
              
              // Find elements causing overflow
              cy.get('body *').each($el => {
                const rect = $el[0].getBoundingClientRect()
                if (rect.right > device.width || rect.left < -10) {
                  const element = $el[0]
                  cy.log(`⚠️ OVERFLOW ELEMENT: <${element.tagName}> class="${element.className}"`)
                  cy.log(`   Position: left=${Math.round(rect.left)}, right=${Math.round(rect.right)}, width=${Math.round(rect.width)}`)
                }
              })
              
              // Take screenshot of overflow
              cy.screenshot(`overflow-${device.name}-${page.name}`)
            } else {
              cy.log(`✅ No horizontal scroll on ${page.name}`)
            }
            
            // Assert no horizontal scroll
            expect(hasHorizontalScroll, `${page.name} should not have horizontal scroll`).to.be.false
          })
        })
      })
    })
  })

  describe('🔘 Mobile Button Position Tests', () => {
    it('Mobile buttons should stay fixed at bottom on all devices', () => {
      mobileDevices.filter(d => d.type === 'phone').forEach(device => {
        cy.viewport(device.width, device.height)
        cy.visit('/services/calculate-mortgage/1')
        cy.wait(2000)
        
        // Find all mobile buttons
        cy.get('[class*="mobileButton"], [class*="mobile-button"], [class*="MobileButton"]').then($buttons => {
          if ($buttons.length > 0) {
            cy.log(`Found ${$buttons.length} mobile button(s) on ${device.name}`)
            
            $buttons.each((index, button) => {
              const rect = button.getBoundingClientRect()
              const styles = window.getComputedStyle(button)
              
              // Check position
              expect(styles.position).to.be.oneOf(['fixed', 'sticky'], 'Button should be fixed or sticky')
              
              // Check if button is at bottom
              const distanceFromBottom = device.height - rect.bottom
              expect(distanceFromBottom).to.be.lessThan(100, 'Button should be near bottom')
              
              // Check if button is within viewport
              expect(rect.left).to.be.at.least(-1, 'Button should not overflow left')
              expect(rect.right).to.be.at.most(device.width + 1, 'Button should not overflow right')
              
              // Check z-index for visibility
              const zIndex = styles.zIndex
              if (zIndex !== 'auto') {
                expect(parseInt(zIndex)).to.be.at.least(10, 'Button should have high z-index')
              }
              
              cy.log(`✅ Button ${index + 1} position OK: bottom=${rect.bottom}, z-index=${zIndex}`)
            })
            
            cy.screenshot(`button-position-${device.name}`)
          } else {
            cy.log(`No mobile buttons found on ${device.name}`)
          }
        })
      })
    })

    it('Buttons should remain visible when scrolling', () => {
      const testDevice = { name: 'iPhone-12', width: 390, height: 844 }
      cy.viewport(testDevice.width, testDevice.height)
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Get initial button position
      cy.get('[class*="mobileButton"], [class*="mobile-button"]').first().then($btn => {
        if ($btn.length > 0) {
          const initialRect = $btn[0].getBoundingClientRect()
          
          // Scroll to middle of page
          cy.scrollTo('center')
          cy.wait(500)
          
          // Check button still visible
          cy.get('[class*="mobileButton"], [class*="mobile-button"]').first().then($btnAfter => {
            const afterScrollRect = $btnAfter[0].getBoundingClientRect()
            
            // Button should stay at same position (fixed)
            expect(afterScrollRect.bottom).to.be.closeTo(initialRect.bottom, 50)
            cy.screenshot('button-after-scroll-middle')
          })
          
          // Scroll to bottom
          cy.scrollTo('bottom')
          cy.wait(500)
          
          // Check button still visible
          cy.get('[class*="mobileButton"], [class*="mobile-button"]').first().should('be.visible')
          cy.screenshot('button-after-scroll-bottom')
        }
      })
    })
  })

  describe('📱 Form Elements Mobile Layout', () => {
    it('Form inputs should be properly sized for mobile', () => {
      const phoneDevices = mobileDevices.filter(d => d.type === 'phone')
      
      phoneDevices.forEach(device => {
        cy.viewport(device.width, device.height)
        cy.visit('/services/calculate-mortgage/1')
        cy.wait(2000)
        
        // Check all inputs
        cy.get('input, select, textarea, [role="combobox"]').each($input => {
          const rect = $input[0].getBoundingClientRect()
          const styles = window.getComputedStyle($input[0])
          
          // Input should be within viewport
          if (rect.width > 0) { // Only check visible elements
            expect(rect.right).to.be.at.most(device.width + 1, `Input should not overflow on ${device.name}`)
            expect(rect.left).to.be.at.least(-1, `Input should not be cut off on ${device.name}`)
            
            // Check minimum touch target size (44x44 for iOS, 48x48 for Android)
            const minHeight = device.name.includes('iPhone') ? 44 : 48
            if (rect.height < minHeight) {
              cy.log(`⚠️ Input height ${rect.height}px is below recommended ${minHeight}px`)
            }
          }
        })
        
        cy.screenshot(`form-layout-${device.name}`)
      })
    })

    it('Dropdowns should open within viewport', () => {
      cy.viewport(375, 667) // iPhone SE
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Test each dropdown
      cy.get('[data-testid*="dropdown"], select, [role="combobox"]').each(($dropdown, index) => {
        if ($dropdown.is(':visible')) {
          // Click to open dropdown
          cy.wrap($dropdown).click({ force: true })
          cy.wait(500)
          
          // Check if dropdown options are visible
          cy.get('body').then($body => {
            const dropdownOptions = $body.find('li:visible, [role="option"]:visible, option:visible')
            
            if (dropdownOptions.length > 0) {
              dropdownOptions.each((i, option) => {
                const rect = option.getBoundingClientRect()
                
                // Options should be within viewport
                if (rect.width > 0) {
                  expect(rect.right).to.be.at.most(376, 'Dropdown option should not overflow')
                  expect(rect.left).to.be.at.least(-1, 'Dropdown option should not be cut off')
                }
              })
              
              cy.log(`✅ Dropdown ${index + 1} options within viewport`)
            }
          })
          
          // Close dropdown
          cy.get('body').click(0, 0)
          cy.wait(300)
        }
      })
    })
  })

  describe('🌐 RTL Hebrew Mobile Layout', () => {
    it('Should handle RTL layout correctly on mobile', () => {
      cy.viewport(375, 812)
      cy.visit('/')
      cy.wait(2000)
      
      // Switch to Hebrew
      cy.get('button').then($buttons => {
        const hebrewBtn = $buttons.filter((i, el) => {
          const text = el.textContent || ''
          return text.includes('עברית') || text.includes('HE')
        })
        
        if (hebrewBtn.length > 0) {
          cy.wrap(hebrewBtn.first()).click()
          cy.wait(2000)
          
          // Check RTL is applied
          cy.get('html').should('have.attr', 'dir', 'rtl')
          
          // Navigate to a form page
          cy.visit('/services/calculate-mortgage/1')
          cy.wait(2000)
          
          // Check no overflow in RTL
          cy.window().then(win => {
            const hasHorizontalScroll = win.document.documentElement.scrollWidth > 375
            expect(hasHorizontalScroll).to.be.false
            
            if (hasHorizontalScroll) {
              cy.log('❌ RTL causing horizontal scroll')
              cy.screenshot('rtl-overflow-issue')
            } else {
              cy.log('✅ RTL layout OK')
              cy.screenshot('rtl-layout-ok')
            }
          })
          
          // Check buttons in RTL
          cy.get('[class*="button"], button').each($btn => {
            const rect = $btn[0].getBoundingClientRect()
            expect(rect.right).to.be.at.most(376)
            expect(rect.left).to.be.at.least(-1)
          })
        }
      })
    })
  })

  describe('📊 Comprehensive Mobile Report', () => {
    it('Generate complete mobile UI report', () => {
      const issues = []
      const device = { name: 'iPhone-12', width: 390, height: 844 }
      
      cy.viewport(device.width, device.height)
      
      // Test critical pages
      const criticalPages = [
        '/services/calculate-mortgage/1',
        '/services/calculate-credit/1',
        '/services/refinance-mortgage/1'
      ]
      
      criticalPages.forEach(pageUrl => {
        cy.visit(pageUrl)
        cy.wait(2000)
        
        // Check for issues
        cy.window().then(win => {
          // 1. Horizontal scroll check
          if (win.document.documentElement.scrollWidth > device.width) {
            issues.push({
              page: pageUrl,
              issue: 'Horizontal scroll detected',
              severity: 'HIGH'
            })
          }
          
          // 2. Find overflow elements
          cy.get('body *').each($el => {
            const rect = $el[0].getBoundingClientRect()
            if (rect.right > device.width + 10) {
              issues.push({
                page: pageUrl,
                issue: `Element overflow: ${$el[0].tagName}.${$el[0].className}`,
                severity: 'MEDIUM'
              })
            }
          })
          
          // 3. Check mobile button
          cy.get('[class*="mobileButton"]').then($btns => {
            if ($btns.length === 0) {
              issues.push({
                page: pageUrl,
                issue: 'No mobile button found',
                severity: 'LOW'
              })
            } else {
              const btnRect = $btns[0].getBoundingClientRect()
              if (btnRect.bottom > device.height + 10) {
                issues.push({
                  page: pageUrl,
                  issue: 'Mobile button below viewport',
                  severity: 'HIGH'
                })
              }
            }
          })
        })
        
        cy.screenshot(`mobile-check-${pageUrl.replace(/\//g, '-')}`)
      })
      
      // Generate report
      cy.then(() => {
        cy.log('📊 MOBILE UI TEST REPORT')
        cy.log('========================')
        
        if (issues.length === 0) {
          cy.log('✅ NO ISSUES FOUND - Mobile UI is working correctly!')
        } else {
          cy.log(`❌ Found ${issues.length} issues:`)
          
          // Group by severity
          const highIssues = issues.filter(i => i.severity === 'HIGH')
          const mediumIssues = issues.filter(i => i.severity === 'MEDIUM')
          const lowIssues = issues.filter(i => i.severity === 'LOW')
          
          if (highIssues.length > 0) {
            cy.log(`🔴 HIGH SEVERITY (${highIssues.length}):`)
            highIssues.forEach(issue => {
              cy.log(`   - ${issue.page}: ${issue.issue}`)
            })
          }
          
          if (mediumIssues.length > 0) {
            cy.log(`🟡 MEDIUM SEVERITY (${mediumIssues.length}):`)
            mediumIssues.forEach(issue => {
              cy.log(`   - ${issue.page}: ${issue.issue}`)
            })
          }
          
          if (lowIssues.length > 0) {
            cy.log(`🟢 LOW SEVERITY (${lowIssues.length}):`)
            lowIssues.forEach(issue => {
              cy.log(`   - ${issue.page}: ${issue.issue}`)
            })
          }
        }
        
        // Summary
        cy.log('========================')
        cy.log(`Device tested: ${device.name} (${device.width}x${device.height})`)
        cy.log(`Pages tested: ${criticalPages.length}`)
        cy.log(`Total issues: ${issues.length}`)
        
        // Assert no high severity issues
        expect(highIssues.length, 'Should have no high severity mobile issues').to.equal(0)
      })
    })
  })

  describe('⚡ Quick Mobile Smoke Test', () => {
    it('Fast check for critical mobile issues', () => {
      cy.viewport(375, 812) // iPhone X
      
      // Just check the most important page
      cy.visit('/services/calculate-mortgage/1')
      cy.wait(2000)
      
      // Quick checks
      cy.window().then(win => {
        // No horizontal scroll
        const noScroll = win.document.documentElement.scrollWidth <= 375
        expect(noScroll).to.be.true
        
        // Mobile button visible
        cy.get('[class*="mobileButton"], [class*="mobile-button"], .button-mobile').then($btn => {
          if ($btn.length > 0) {
            expect($btn).to.be.visible
            const rect = $btn[0].getBoundingClientRect()
            expect(rect.bottom).to.be.at.most(812 + 50)
            cy.log('✅ Mobile button OK')
          }
        })
        
        // Form elements within viewport
        cy.get('input:visible, select:visible').each($input => {
          const rect = $input[0].getBoundingClientRect()
          expect(rect.right).to.be.at.most(376)
        })
        
        cy.log('✅ Quick mobile check PASSED')
        cy.screenshot('quick-mobile-check')
      })
    })
  })
})