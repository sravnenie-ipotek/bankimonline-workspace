describe('Mobile Fix Validation - Touch Targets & Responsive Design', () => {
  const viewports = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile Medium', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1024, height: 768 },
    { name: 'Large Desktop', width: 1440, height: 900 }
  ]

  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('ACCESS_TOKEN', 'test-token')
      win.localStorage.setItem('USER_DATA', JSON.stringify({
        name: 'Test User',
        phone: '972544123456'
      }))
    })
  })

  viewports.forEach(viewport => {
    describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      beforeEach(() => {
        cy.viewport(viewport.width, viewport.height)
        cy.visit('/services/refinance-mortgage/1')
        cy.wait(1000)
      })

      it('should meet minimum touch target requirements', () => {
        // Check buttons meet 44px minimum
        cy.get('button').each($button => {
          cy.wrap($button).then($el => {
            const rect = $el[0].getBoundingClientRect()
            expect(rect.height).to.be.at.least(44, `Button height ${rect.height}px should be ≥ 44px`)
            expect(rect.width).to.be.at.least(44, `Button width ${rect.width}px should be ≥ 44px`)
          })
        })

        // Check interactive elements have proper spacing
        cy.get('[class*="row"]').within(() => {
          cy.get('button, input, [role="button"]').then($elements => {
            if ($elements.length > 1) {
              for (let i = 0; i < $elements.length - 1; i++) {
                const rect1 = $elements[i].getBoundingClientRect()
                const rect2 = $elements[i + 1].getBoundingClientRect()
                const gap = Math.abs(rect2.left - rect1.right) || Math.abs(rect2.top - rect1.bottom)
                expect(gap).to.be.at.least(8, 'Interactive elements should have ≥ 8px spacing')
              }
            }
          })
        })
      })

      it('should use Tailwind responsive classes correctly', () => {
        // Verify Row component responsive behavior
        cy.get('[class*="row"]').first().should('exist').then($row => {
          const classList = $row[0].className
          
          if (viewport.width < 768) {
            // Mobile: should be flex-col
            cy.wrap($row).should('have.css', 'flex-direction', 'column')
          } else if (viewport.width >= 1280) {
            // Desktop: should have justify-between
            cy.wrap($row).should('have.css', 'justify-content', 'space-between')
          } else {
            // Tablet: should be flex-row with flex-start
            cy.wrap($row).should('have.css', 'flex-direction', 'row')
          }
        })

        // Verify Column component responsive behavior
        cy.get('[class*="column"]').first().then($column => {
          if ($column.length > 0) {
            if (viewport.width < 768) {
              // Mobile: should be full width
              cy.wrap($column).should('have.css', 'width', `${viewport.width}px`)
            } else {
              // Desktop: should have fixed width
              cy.wrap($column).invoke('width').should('be.lessThan', viewport.width)
            }
          }
        })
      })

      it('should handle modal interactions properly', () => {
        // Try to find and click a button that opens a modal
        cy.get('button').contains(/הוסף|Add|Plus/i).first().click({ force: true })

        cy.get('[class*="modal"], [class*="overlayDialogWrapper"]').then($modal => {
          if ($modal.length > 0) {
            // Modal should be visible
            cy.wrap($modal).should('be.visible')

            // Close button should meet touch target requirements
            cy.get('[class*="close"], button[type="button"]').first().then($closeBtn => {
              const rect = $closeBtn[0].getBoundingClientRect()
              expect(rect.height).to.be.at.least(44, 'Modal close button should be ≥ 44px height')
              expect(rect.width).to.be.at.least(44, 'Modal close button should be ≥ 44px width')
            })

            // Modal should be responsive
            if (viewport.width < 768) {
              cy.wrap($modal).should('have.css', 'padding').and('not.equal', '0px')
            }
          }
        })
      })

      it('should maintain proper typography scaling', () => {
        // Check progress bar text scales appropriately
        cy.get('[class*="progress-item"] [class*="text"]').first().then($text => {
          if ($text.length > 0) {
            const fontSize = window.getComputedStyle($text[0]).fontSize
            const fontSizePx = parseInt(fontSize)

            if (viewport.width < 390) {
              expect(fontSizePx).to.be.at.most(14, 'Text should be smaller on very small screens')
            } else if (viewport.width < 768) {
              expect(fontSizePx).to.be.at.most(16, 'Text should be readable on mobile')
            } else if (viewport.width >= 1280) {
              expect(fontSizePx).to.be.at.least(18, 'Text should be larger on desktop')
            }
          }
        })
      })

      it('should prevent horizontal scrolling', () => {
        // Check no horizontal overflow
        cy.get('body').then($body => {
          const bodyWidth = $body[0].scrollWidth
          expect(bodyWidth).to.be.at.most(viewport.width + 1, 'Body should not exceed viewport width')
        })

        // Check main containers don't overflow
        cy.get('[class*="container"], [class*="wrapper"]').each($container => {
          cy.wrap($container).then($el => {
            const rect = $el[0].getBoundingClientRect()
            expect(rect.right).to.be.at.most(viewport.width, 'Containers should not exceed viewport')
          })
        })
      })

      it('should handle form interactions correctly', () => {
        // Form inputs should be accessible
        cy.get('input, select, textarea').each($input => {
          cy.wrap($input).should('be.visible')
          
          // Touch target check for form elements
          cy.wrap($input).then($el => {
            const rect = $el[0].getBoundingClientRect()
            expect(rect.height).to.be.at.least(40, 'Form inputs should be at least 40px high')
          })
        })

        // Dropdown interactions should work
        cy.get('[class*="react-dropdown-select"]').first().click()
        cy.get('[class*="react-dropdown-select-dropdown"]').should('be.visible')
      })
    })
  })

  // Specific touch target validation
  describe('Touch Target Validation', () => {
    beforeEach(() => {
      cy.viewport(375, 667) // iPhone SE size
      cy.visit('/services/refinance-mortgage/1')
    })

    it('should validate all button touch targets', () => {
      cy.get('button, [role="button"], .add-button, .delete-icon').each($element => {
        cy.wrap($element).then($el => {
          const rect = $el[0].getBoundingClientRect()
          const computedStyle = window.getComputedStyle($el[0])
          
          // Check minimum dimensions
          expect(rect.height, `Element ${$el[0].className} height`).to.be.at.least(44)
          expect(rect.width, `Element ${$el[0].className} width`).to.be.at.least(44)
          
          // Check padding is adequate for touch
          const paddingTop = parseInt(computedStyle.paddingTop)
          const paddingBottom = parseInt(computedStyle.paddingBottom)
          const totalPadding = paddingTop + paddingBottom
          
          expect(totalPadding, `Element ${$el[0].className} vertical padding`).to.be.at.least(16)
        })
      })
    })

    it('should validate interactive element spacing', () => {
      cy.get('[class*="container"]').within(() => {
        cy.get('button, input, [role="button"]').then($elements => {
          for (let i = 0; i < $elements.length - 1; i++) {
            const rect1 = $elements[i].getBoundingClientRect()
            const rect2 = $elements[i + 1].getBoundingClientRect()
            
            // Calculate minimum distance between elements
            const horizontalGap = Math.max(0, Math.min(
              Math.abs(rect2.left - rect1.right),
              Math.abs(rect1.left - rect2.right)
            ))
            
            const verticalGap = Math.max(0, Math.min(
              Math.abs(rect2.top - rect1.bottom),
              Math.abs(rect1.top - rect2.bottom)
            ))
            
            const minGap = Math.min(horizontalGap, verticalGap)
            
            if (minGap > 0) { // Only check if elements are actually separate
              expect(minGap).to.be.at.least(8, 'Interactive elements should have ≥ 8px spacing')
            }
          }
        })
      })
    })
  })

  // Performance and accessibility validation
  describe('Performance & Accessibility', () => {
    beforeEach(() => {
      cy.viewport(375, 667)
      cy.visit('/services/refinance-mortgage/1')
    })

    it('should load without layout shifts', () => {
      // Wait for initial load
      cy.wait(1000)
      
      // Take initial measurements
      cy.get('[class*="row"]').first().then($row => {
        const initialRect = $row[0].getBoundingClientRect()
        
        // Wait a bit more for any delayed rendering
        cy.wait(2000)
        
        // Check position hasn't shifted
        cy.wrap($row).then($el => {
          const finalRect = $el[0].getBoundingClientRect()
          expect(Math.abs(finalRect.top - initialRect.top)).to.be.lessThan(5, 'No significant layout shifts')
        })
      })
    })

    it('should maintain keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab()
      cy.focused().should('be.visible')
      
      // Continue tabbing
      for (let i = 0; i < 5; i++) {
        cy.focused().tab()
        cy.focused().should('be.visible')
      }
    })
  })
})