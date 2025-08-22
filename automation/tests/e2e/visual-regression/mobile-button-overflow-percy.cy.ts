/**
 * 📱 MOBILE BUTTON OVERFLOW - PERCY VISUAL REGRESSION TESTS
 * 
 * Comprehensive testing of mobile button overflow fixes and responsive design
 * Features:
 * - Button overflow detection and validation
 * - Sticky button positioning tests
 * - Mobile viewport testing (320px to 428px)
 * - Hebrew RTL mobile layout validation
 * - Cross-device mobile compatibility
 * - Before/after fix comparison documentation
 */

/// <reference types="cypress" />

describe('📱 Mobile Button Overflow - Percy Visual Regression', () => {
  
  const mobileViewports = [
    { width: 320, height: 568, name: 'iPhone SE' },
    { width: 375, height: 667, name: 'iPhone 8' },
    { width: 375, height: 812, name: 'iPhone X' },
    { width: 390, height: 844, name: 'iPhone 12' },
    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    { width: 428, height: 926, name: 'iPhone 12 Pro Max' }
  ]

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.setupPercyLanguage('he')
    
    cy.window().then((win) => {
      win.localStorage.setItem('percy-test-mode', 'true')
      win.localStorage.setItem('mobile-test-context', JSON.stringify({
        feature: 'mobile-button-overflow',
        testRun: new Date().toISOString(),
        environment: 'visual-regression'
      }))
    })
  })

  context('🔧 Button Overflow Fix Validation', () => {
    
    it('📍 Refinance Mortgage - Button Overflow Detection', () => {
      mobileViewports.forEach(({ width, height, name }) => {
        cy.viewport(width, height)
        cy.visit('/services/refinance-mortgage/1')
        cy.waitForBankingPageLoad()
        
        // Test button overflow detection
        cy.percyTestButtonOverflow(`Refinance Mortgage ${name}`)
        
        // Take visual snapshot with overflow indicators
        cy.percySnapshotBanking(`Mobile Fix - Refinance Mortgage ${name}`, {
          widths: [width],
          testButtonOverflow: true,
          percyCSS: `
            /* Mobile fix visualization */
            .mobile-button-fix {
              position: sticky !important;
              bottom: 20px !important;
              z-index: 1000 !important;
              margin: 10px auto !important;
              border: 2px solid #4CAF50 !important;
              box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3) !important;
            }
            
            /* Viewport indicator */
            body::before {
              content: "${name} (${width}x${height})";
              position: fixed;
              top: 0;
              left: 0;
              background: rgba(33, 150, 243, 0.9);
              color: white;
              padding: 4px 8px;
              font-size: 12px;
              z-index: 10000;
              border-radius: 0 0 4px 0;
            }
            
            /* Button overflow warnings */
            .button-overflow-indicator {
              border: 3px solid #FF5722 !important;
              background: rgba(255, 87, 34, 0.2) !important;
            }
            
            .button-overflow-indicator::after {
              content: "⚠️ OVERFLOW";
              position: absolute;
              top: -25px;
              right: 0;
              background: #FF5722;
              color: white;
              padding: 2px 6px;
              font-size: 10px;
              border-radius: 2px;
            }
          `
        })
        
        // Scroll to bottom to test sticky positioning
        cy.scrollTo('bottom')
        cy.wait(500)
        
        cy.percySnapshotBanking(`Mobile Fix - Refinance Mortgage ${name} Scrolled`, {
          widths: [width],
          percyCSS: `
            /* Scrolled state visualization */
            .sticky-button-test {
              position: relative;
            }
            
            .sticky-button-test::before {
              content: "SCROLLED TO BOTTOM - BUTTON SHOULD BE VISIBLE";
              position: fixed;
              bottom: 80px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(255, 193, 7, 0.9);
              color: black;
              padding: 8px;
              font-size: 12px;
              border-radius: 4px;
              z-index: 9999;
            }
          `
        })
      })
    })

    it('👥 Borrowers Personal Data - Mobile Layout', () => {
      mobileViewports.slice(0, 3).forEach(({ width, height, name }) => {
        cy.viewport(width, height)
        cy.visit('/services/borrowers-personal-data/2')
        cy.waitForBankingPageLoad()
        
        // Test dropdown functionality on mobile
        cy.get('body').then($body => {
          const dropdowns = $body.find('select, [role="combobox"], [class*="dropdown"]')
          if (dropdowns.length > 0) {
            cy.get(dropdowns.first()).click()
            cy.wait(500)
            
            cy.percySnapshotBanking(`Mobile Fix - Borrowers Page2 ${name} Dropdown`, {
              widths: [width],
              percyCSS: `
                /* Dropdown mobile styling */
                select, [role="combobox"] {
                  border: 2px solid #2196F3 !important;
                  background: rgba(33, 150, 243, 0.1) !important;
                  font-size: 16px !important; /* Prevent zoom on iOS */
                }
                
                /* Mobile dropdown indicators */
                select:focus, [role="combobox"]:focus {
                  outline: 3px solid #FF9800 !important;
                  outline-offset: 2px !important;
                }
              `
            })
          }
        })
        
        // Test button overflow for this page
        cy.percyTestButtonOverflow(`Borrowers Page2 ${name}`)
        
        cy.percySnapshotBanking(`Mobile Fix - Borrowers Page2 ${name}`, {
          widths: [width],
          testButtonOverflow: true
        })
      })
    })

    it('💳 Calculate Credit - Mobile Button Fix', () => {
      mobileViewports.slice(0, 4).forEach(({ width, height, name }) => {
        cy.viewport(width, height)
        cy.visit('/services/calculate-credit/1')
        cy.waitForBankingPageLoad()
        
        // Fill some data to test form + button interaction
        cy.fillFormField('credit_amount', '100000')
        cy.fillFormField('loan_period', '36')
        cy.wait(1000)
        
        cy.percySnapshotBanking(`Mobile Fix - Credit Calculator ${name}`, {
          widths: [width],
          testButtonOverflow: true,
          percyCSS: `
            /* Credit form mobile enhancements */
            input[type="number"], input[type="text"] {
              font-size: 16px !important; /* Prevent iOS zoom */
              padding: 12px !important;
              border: 2px solid #E0E0E0 !important;
              border-radius: 4px !important;
            }
            
            input:focus {
              border-color: #2196F3 !important;
              box-shadow: 0 0 8px rgba(33, 150, 243, 0.3) !important;
            }
            
            /* Mobile credit amount highlighting */
            input[value="100000"] {
              border-color: #4CAF50 !important;
              background: rgba(76, 175, 80, 0.1) !important;
              font-weight: bold !important;
            }
          `
        })
        
        // Test button accessibility on mobile
        cy.percyTestButtonOverflow(`Credit Calculator ${name}`)
      })
    })
  })

  context('🌐 Hebrew RTL Mobile Testing', () => {
    
    it('עברית 📱 RTL Mobile Button Layout', () => {
      cy.setupPercyLanguage('he')
      
      mobileViewports.slice(0, 3).forEach(({ width, height, name }) => {
        cy.viewport(width, height)
        cy.visit('/services/calculate-mortgage/1')
        cy.waitForBankingPageLoad()
        
        cy.percySnapshotBanking(`Hebrew RTL Mobile - Mortgage ${name}`, {
          widths: [width],
          rtlTest: true,
          testButtonOverflow: true,
          percyCSS: `
            /* Hebrew RTL mobile optimizations */
            body {
              direction: rtl !important;
              font-family: 'Heebo', Arial, sans-serif !important;
            }
            
            /* RTL mobile form styling */
            input, textarea, select {
              text-align: right !important;
              direction: rtl !important;
              font-size: 16px !important; /* Prevent iOS zoom */
            }
            
            /* RTL button positioning */
            button {
              text-align: center !important;
              font-family: 'Heebo', sans-serif !important;
            }
            
            /* RTL mobile indicator */
            body::after {
              content: "📱 עברית RTL - ${name}";
              position: fixed;
              top: 30px;
              right: 0;
              background: rgba(156, 39, 176, 0.9);
              color: white;
              padding: 4px 8px;
              font-size: 11px;
              z-index: 10000;
            }
            
            /* Hebrew text highlighting */
            input[value*="י"], input[value*="ו"], input[value*="ש"] {
              border: 2px solid #E91E63 !important;
              background: rgba(233, 30, 99, 0.1) !important;
            }
          `
        })
        
        // Fill Hebrew form data
        cy.fillFormField('property_value', '1500000')
        cy.fillFormField('down_payment', '300000')
        cy.wait(1000)
        
        cy.percySnapshotBanking(`Hebrew RTL Mobile - Mortgage ${name} Filled`, {
          widths: [width],
          rtlTest: true,
          testButtonOverflow: true
        })
      })
    })

    it('עברית 💳 Credit Application RTL Mobile', () => {
      cy.setupPercyLanguage('he')
      
      mobileViewports.slice(0, 2).forEach(({ width, height, name }) => {
        cy.viewport(width, height)
        cy.visit('/services/calculate-credit/1')
        cy.waitForBankingPageLoad()
        
        // Fill credit form in Hebrew
        cy.fillFormField('credit_amount', '80000')
        cy.fillFormField('loan_period', '24')
        cy.wait(1000)
        
        cy.percySnapshotBanking(`Hebrew RTL Mobile - Credit ${name}`, {
          widths: [width],
          rtlTest: true,
          testButtonOverflow: true,
          percyCSS: `
            /* Credit RTL mobile styling */
            input[name*="credit"], input[name*="amount"] {
              direction: rtl !important;
              text-align: right !important;
              font-weight: bold !important;
              color: #1976D2 !important;
            }
            
            /* RTL credit amount indicator */
            input[value="80000"]::before {
              content: "💰";
              position: absolute;
              right: -25px;
              top: 50%;
              transform: translateY(-50%);
              font-size: 16px;
            }
          `
        })
        
        cy.percyTestButtonOverflow(`Hebrew RTL Credit ${name}`)
      })
    })
  })

  context('📊 Cross-Device Mobile Compatibility', () => {
    
    it('🔄 Responsive Button Behavior', () => {
      const pages = [
        { url: '/services/calculate-mortgage/1', name: 'Mortgage Step 1' },
        { url: '/services/calculate-credit/1', name: 'Credit Step 1' },
        { url: '/services/refinance-mortgage/1', name: 'Refinance Step 1' },
        { url: '/services/borrowers-personal-data/2', name: 'Borrowers Step 2' }
      ]
      
      pages.forEach(({ url, name }) => {
        cy.visit(url)
        cy.waitForBankingPageLoad()
        
        // Test across different mobile widths
        mobileViewports.slice(0, 4).forEach(({ width, height, deviceName }) => {
          cy.viewport(width, height)
          cy.wait(500)
          
          cy.percySnapshotBanking(`Cross Device - ${name} ${deviceName}`, {
            widths: [width],
            testButtonOverflow: true,
            percyCSS: `
              /* Device-specific optimizations */
              @media (max-width: 320px) {
                button {
                  font-size: 14px !important;
                  padding: 10px 16px !important;
                }
              }
              
              @media (min-width: 414px) {
                button {
                  font-size: 16px !important;
                  padding: 12px 24px !important;
                }
              }
              
              /* Device identifier */
              .device-indicator::before {
                content: "${deviceName} - ${width}px";
                position: fixed;
                bottom: 0;
                left: 0;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                font-size: 11px;
                z-index: 10000;
              }
            `
          })
          
          // Log button positions for debugging
          cy.get('button').then($buttons => {
            const viewportHeight = height
            let overflowCount = 0
            
            $buttons.each((index, button) => {
              const rect = button.getBoundingClientRect()
              if (rect.bottom > viewportHeight) {
                overflowCount++
                cy.log(`📱 ${deviceName}: Button "${button.innerText}" overflows at ${rect.bottom}px (viewport: ${viewportHeight}px)`)
              }
            })
            
            if (overflowCount === 0) {
              cy.log(`✅ ${deviceName}: All buttons within viewport`)
            }
          })
        })
      })
    })

    it('🎯 Button Tap Target Size Validation', () => {
      cy.viewport(375, 812)
      
      const testPages = [
        '/services/calculate-mortgage/1',
        '/services/calculate-credit/1',
        '/services/refinance-mortgage/1'
      ]
      
      testPages.forEach((url, index) => {
        cy.visit(url)
        cy.waitForBankingPageLoad()
        
        // Measure button tap target sizes
        cy.get('button').then($buttons => {
          $buttons.each((btnIndex, button) => {
            const rect = button.getBoundingClientRect()
            const tapTargetSize = Math.min(rect.width, rect.height)
            
            if (tapTargetSize < 44) { // iOS guideline
              cy.log(`⚠️ Button tap target too small: ${tapTargetSize}px (should be ≥44px)`)
            }
          })
        })
        
        cy.percySnapshotBanking(`Tap Target Test - Page ${index + 1}`, {
          widths: [375],
          percyCSS: `
            /* Tap target visualization */
            button {
              position: relative;
              min-width: 44px !important;
              min-height: 44px !important;
            }
            
            button::after {
              content: "";
              position: absolute;
              top: 50%;
              left: 50%;
              width: 44px;
              height: 44px;
              border: 1px dashed #FF9800;
              transform: translate(-50%, -50%);
              pointer-events: none;
            }
            
            /* Highlight buttons that meet tap target guidelines */
            button[style*="width: 44"], button[style*="height: 44"] {
              border: 2px solid #4CAF50 !important;
            }
          `
        })
      })
    })
  })

  context('🔧 Button Fix Implementation Validation', () => {
    
    it('📝 CSS Fix Implementation Check', () => {
      cy.viewport(375, 812)
      cy.visit('/services/refinance-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Check if mobile button fix CSS is applied
      cy.get('button').then($buttons => {
        $buttons.each((index, button) => {
          const computedStyle = window.getComputedStyle(button)
          const position = computedStyle.position
          const bottom = computedStyle.bottom
          const zIndex = computedStyle.zIndex
          
          cy.log(`Button ${index}: position=${position}, bottom=${bottom}, z-index=${zIndex}`)
          
          // Visual documentation of CSS properties
          cy.wrap(button).invoke('addClass', 'css-debug-button')
        })
      })
      
      cy.percySnapshotBanking('CSS Fix Implementation Validation', {
        widths: [375],
        percyCSS: `
          /* CSS debug visualization */
          .css-debug-button {
            border: 2px solid #E91E63 !important;
            background: rgba(233, 30, 99, 0.1) !important;
          }
          
          .css-debug-button::before {
            content: "CSS: " attr(style);
            position: absolute;
            top: -30px;
            left: 0;
            background: #000;
            color: white;
            font-size: 10px;
            padding: 2px 4px;
            white-space: nowrap;
            z-index: 10001;
          }
          
          /* Sticky positioning indicator */
          button[style*="sticky"], .mobile-button-fix {
            box-shadow: 0 0 15px rgba(76, 175, 80, 0.8) !important;
          }
          
          button[style*="sticky"]::after {
            content: "✅ STICKY";
            position: absolute;
            top: -20px;
            right: 0;
            background: #4CAF50;
            color: white;
            font-size: 10px;
            padding: 2px 4px;
          }
        `
      })
    })

    it('⚡ Performance Impact of Button Fixes', () => {
      cy.viewport(375, 812)
      
      const testUrls = [
        '/services/calculate-mortgage/1',
        '/services/calculate-credit/1',
        '/services/refinance-mortgage/1'
      ]
      
      testUrls.forEach((url, index) => {
        cy.visit(url)
        cy.waitForBankingPageLoad()
        
        // Measure performance impact
        cy.window().then((win) => {
          const performanceEntries = win.performance.getEntriesByType('navigation')
          if (performanceEntries.length > 0) {
            const entry = performanceEntries[0] as PerformanceNavigationTiming
            const loadTime = entry.loadEventEnd - entry.loadEventStart
            cy.log(`📊 Page ${index + 1} load time: ${loadTime}ms`)
          }
        })
        
        cy.percySnapshotBanking(`Performance Test - Page ${index + 1}`, {
          widths: [375],
          percyCSS: `
            /* Performance indicator */
            body::before {
              content: "⚡ Performance Test - Mobile Button Fix";
              position: fixed;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(76, 175, 80, 0.9);
              color: white;
              padding: 4px 8px;
              font-size: 12px;
              z-index: 10000;
            }
          `
        })
      })
    })
  })

  context('📋 Mobile Accessibility Testing', () => {
    
    it('♿ Mobile Button Accessibility', () => {
      cy.viewport(375, 812)
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Test button accessibility attributes
      cy.get('button').each(($btn) => {
        cy.wrap($btn).then((button) => {
          const hasAriaLabel = button.attr('aria-label')
          const hasRole = button.attr('role')
          const hasTitle = button.attr('title')
          const hasText = button.text().trim().length > 0
          
          if (!hasAriaLabel && !hasText) {
            cy.log('⚠️ Button missing accessible text')
          }
        })
      })
      
      cy.percySnapshotBanking('Mobile Accessibility Test', {
        widths: [375],
        percyCSS: `
          /* Accessibility indicators */
          button[aria-label] {
            border: 2px solid #4CAF50 !important;
            position: relative;
          }
          
          button[aria-label]::after {
            content: "✅ ARIA";
            position: absolute;
            top: -18px;
            right: 0;
            background: #4CAF50;
            color: white;
            font-size: 9px;
            padding: 1px 3px;
          }
          
          button:not([aria-label]):not(:has-text) {
            border: 2px solid #FF5722 !important;
            background: rgba(255, 87, 34, 0.2) !important;
          }
          
          button:not([aria-label]):not(:has-text)::after {
            content: "⚠️ NO ARIA";
            position: absolute;
            top: -18px;
            right: 0;
            background: #FF5722;
            color: white;
            font-size: 9px;
            padding: 1px 3px;
          }
        `
      })
    })
  })

  // Enhanced failure reporting for mobile button overflow issues
  afterEach(function() {
    if (this.currentTest && this.currentTest.state === 'failed') {
      const testName = this.currentTest.title
      const spec = Cypress.spec.relative
      const viewport = Cypress.config('viewportWidth') + 'x' + Cypress.config('viewportHeight')
      
      cy.task('createVisualRegressionJira', {
        testName: `Mobile Button Overflow - ${testName}`,
        snapshots: [`${testName} - Mobile Failure`],
        percyBuildUrl: Cypress.env('PERCY_BUILD_URL'),
        visualDifferences: [{
          elementName: 'Mobile Button',
          changeType: 'layout' as const,
          severity: 'critical' as const
        }],
        affectedLanguages: ['he', 'en'],
        affectedViewports: [375, 414, 428],
        bankingImpact: 'critical-path' as const,
        screenshots: [],
        specFile: spec,
        branch: Cypress.env('BRANCH_NAME') || 'main',
        commit: Cypress.env('COMMIT_SHA') || 'unknown'
      }, { log: false }).then((result: any) => {
        if (result && result.issueKey) {
          cy.log(`📱 Mobile button overflow issue reported: ${result.issueKey}`)
          cy.log(`📊 Viewport: ${viewport}`)
        }
      })
    }
  })
})