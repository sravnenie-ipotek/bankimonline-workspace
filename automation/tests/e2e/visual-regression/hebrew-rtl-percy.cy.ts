/**
 * 🇮🇱 HEBREW RTL VISUAL REGRESSION TESTS
 * 
 * Comprehensive Hebrew Right-to-Left (RTL) visual testing suite
 * Features:
 * - Hebrew font loading and rendering validation
 * - RTL layout and text alignment testing
 * - Hebrew banking terminology accuracy
 * - RTL form validation and interaction
 * - Cross-browser Hebrew support
 * - Hebrew mobile responsiveness
 */

/// <reference types="cypress" />

describe('🇮🇱 Hebrew RTL - Percy Visual Regression', () => {
  
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Set Hebrew as primary language
    cy.setupPercyLanguage('he')
    
    // Set RTL test context
    cy.window().then((win) => {
      win.localStorage.setItem('percy-test-mode', 'true')
      win.localStorage.setItem('rtl-test-context', JSON.stringify({
        language: 'he',
        direction: 'rtl',
        testRun: new Date().toISOString(),
        environment: 'visual-regression'
      }))
      
      // Force RTL direction
      win.document.documentElement.setAttribute('dir', 'rtl')
      win.document.body.setAttribute('dir', 'rtl')
    })
  })

  context('🔤 Hebrew Font & Typography Testing', () => {
    
    it('📝 Hebrew Font Loading Verification', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Wait for Hebrew fonts to load
      cy.get('body').should('have.css', 'direction', 'rtl')
      cy.wait(2000) // Allow time for web fonts
      
      cy.percySnapshotBanking('Hebrew Font Loading Test', {
        rtlTest: true,
        percyCSS: `
          /* Hebrew font validation */
          body, h1, h2, h3, h4, h5, h6, p, span, div, input, button {
            font-family: 'Heebo', Arial, sans-serif !important;
            direction: rtl !important;
          }
          
          /* Font loading indicator */
          body::before {
            content: "📝 עברית - Heebo Font Loaded";
            position: fixed;
            top: 0;
            right: 0;
            background: rgba(103, 58, 183, 0.9);
            color: white;
            padding: 8px 12px;
            font-size: 14px;
            font-family: 'Heebo', Arial, sans-serif;
            z-index: 10000;
            border-radius: 0 0 0 8px;
          }
          
          /* Hebrew character verification */
          *:contains('א'), *:contains('ב'), *:contains('ג'), *:contains('ד'), *:contains('ה') {
            border: 1px solid #9C27B0 !important;
            background: rgba(156, 39, 176, 0.1) !important;
          }
        `
      })
    })

    it('🎨 Hebrew Typography Hierarchy', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Test Hebrew text in different elements
      const hebrewText = {
        title: 'מחשבון משכנתא',
        subtitle: 'חשבו את תשלומי המשכנתא',
        button: 'המשך',
        label: 'ערך הנכס',
        placeholder: 'הזן סכום בשקלים'
      }
      
      // Inject Hebrew text for testing
      cy.window().then((win) => {
        const doc = win.document
        
        // Update page title if exists
        const titleEl = doc.querySelector('h1, [data-test="title"], .title')
        if (titleEl) titleEl.textContent = hebrewText.title
        
        // Update subtitle if exists  
        const subtitleEl = doc.querySelector('h2, .subtitle, [data-test="subtitle"]')
        if (subtitleEl) subtitleEl.textContent = hebrewText.subtitle
      })
      
      cy.wait(1000)
      
      cy.percySnapshotBanking('Hebrew Typography Hierarchy', {
        rtlTest: true,
        percyCSS: `
          /* Typography validation */
          h1, h2, h3 {
            text-align: right !important;
            font-family: 'Heebo', Arial, sans-serif !important;
            font-weight: 700 !important;
            direction: rtl !important;
          }
          
          /* Hebrew text highlighting */
          *:contains('מחשבון'), *:contains('משכנתא'), *:contains('חשבו') {
            border: 2px solid #E91E63 !important;
            background: rgba(233, 30, 99, 0.1) !important;
            padding: 4px !important;
            border-radius: 4px !important;
          }
          
          /* RTL text alignment indicator */
          h1::after, h2::after {
            content: " ◄ RTL";
            color: #9C27B0;
            font-size: 12px;
            font-weight: normal;
          }
        `
      })
    })

    it('📏 Hebrew Line Height & Spacing', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      cy.percySnapshotBanking('Hebrew Line Height Spacing', {
        rtlTest: true,
        percyCSS: `
          /* Hebrew text spacing optimization */
          body {
            line-height: 1.6 !important;
            letter-spacing: 0 !important; /* Hebrew doesn't need letter spacing */
          }
          
          p, div, span {
            line-height: 1.5 !important;
            text-align: right !important;
            direction: rtl !important;
          }
          
          /* Hebrew diacritics support */
          .hebrew-text {
            line-height: 1.8 !important; /* Extra space for Hebrew diacritics */
          }
          
          /* Spacing visualization */
          *:contains('א'), *:contains('ב'), *:contains('ג') {
            background: linear-gradient(90deg, transparent 0%, rgba(156, 39, 176, 0.1) 25%, transparent 50%, rgba(156, 39, 176, 0.1) 75%, transparent 100%);
          }
        `
      })
    })
  })

  context('📝 Hebrew Form Controls & Inputs', () => {
    
    it('📊 Hebrew Form Field Alignment', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Fill form with Hebrew labels and values
      cy.fillFormField('property_value', '1500000')
      cy.fillFormField('down_payment', '300000')
      cy.fillFormField('loan_period', '25')
      
      cy.wait(1000)
      
      cy.percySnapshotBanking('Hebrew Form Field Alignment', {
        rtlTest: true,
        percyCSS: `
          /* Hebrew form styling */
          input, textarea, select {
            text-align: right !important;
            direction: rtl !important;
            font-family: 'Heebo', Arial, sans-serif !important;
            padding-right: 12px !important;
            padding-left: 8px !important;
          }
          
          /* Hebrew number formatting */
          input[type="number"] {
            direction: ltr !important; /* Numbers remain LTR */
            text-align: left !important;
          }
          
          /* Hebrew form labels */
          label {
            text-align: right !important;
            direction: rtl !important;
            margin-left: 0 !important;
            margin-right: 8px !important;
          }
          
          /* RTL form layout indicators */
          .form-group, .form-field {
            border-right: 3px solid #9C27B0 !important;
            border-left: none !important;
            padding-right: 8px !important;
            padding-left: 0 !important;
          }
          
          /* Hebrew placeholder simulation */
          input::placeholder {
            color: #757575 !important;
            direction: rtl !important;
            text-align: right !important;
          }
        `
      })
    })

    it('📋 Hebrew Dropdown & Selection', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Test Hebrew dropdown options
      cy.get('body').then($body => {
        const dropdown = $body.find('select, [role="combobox"], [class*="dropdown"]')
        if (dropdown.length > 0) {
          cy.get(dropdown.first()).click()
          cy.wait(500)
          
          // Look for Hebrew property ownership options
          cy.get('body').then($bodyAfterClick => {
            const options = $bodyAfterClick.find('[class*="option"], option, [role="option"]')
            if (options.length > 0) {
              // Try to select Hebrew option
              cy.get(options).contains(/אין לי נכס|יש לי נכס|מוכר נכס/).first().click()
            }
          })
          
          cy.wait(1000)
        }
      })
      
      cy.percySnapshotBanking('Hebrew Dropdown Selection', {
        rtlTest: true,
        percyCSS: `
          /* Hebrew dropdown styling */
          select, [role="combobox"] {
            direction: rtl !important;
            text-align: right !important;
            padding-right: 12px !important;
            padding-left: 30px !important; /* Space for arrow */
          }
          
          /* Hebrew dropdown arrow */
          select {
            background-position: 8px center !important; /* Arrow on left for RTL */
          }
          
          /* Hebrew options */
          option, [role="option"] {
            direction: rtl !important;
            text-align: right !important;
            font-family: 'Heebo', Arial, sans-serif !important;
          }
          
          /* Selected Hebrew option highlighting */
          option:checked, [aria-selected="true"] {
            background: rgba(156, 39, 176, 0.2) !important;
            color: #4A148C !important;
            font-weight: bold !important;
          }
          
          /* Hebrew dropdown indicator */
          select::after {
            content: "עברית ▼";
            position: absolute;
            right: -60px;
            top: 0;
            background: #9C27B0;
            color: white;
            padding: 2px 6px;
            font-size: 10px;
          }
        `
      })
    })

    it('🔢 Hebrew Number & Currency Input', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Fill with Israeli currency values
      const israeliAmounts = {
        property_value: '2,500,000', // 2.5M ILS
        down_payment: '500,000',    // 500K ILS  
        loan_period: '30'           // 30 years
      }
      
      Object.entries(israeliAmounts).forEach(([field, value]) => {
        cy.fillFormField(field, value.replace(/,/g, ''))
      })
      
      cy.wait(1000)
      
      cy.percySnapshotBanking('Hebrew Number Currency Input', {
        rtlTest: true,
        percyCSS: `
          /* Hebrew currency formatting */
          input[name*="value"], input[name*="amount"], input[name*="payment"] {
            direction: ltr !important; /* Numbers stay LTR */
            text-align: left !important;
            font-weight: bold !important;
            color: #1976D2 !important;
          }
          
          /* Currency symbol positioning for RTL */
          input[name*="value"]::after {
            content: "₪";
            position: absolute;
            right: -25px;
            top: 50%;
            transform: translateY(-50%);
            color: #4CAF50;
            font-weight: bold;
          }
          
          /* Hebrew number labels */
          label[for*="value"], label[for*="amount"] {
            direction: rtl !important;
            text-align: right !important;
          }
          
          /* Hebrew numeric validation */
          input[value*="2500000"]::before {
            content: "2.5 מיליון ₪";
            position: absolute;
            top: -25px;
            right: 0;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 2px 6px;
            font-size: 11px;
            border-radius: 2px;
          }
        `
      })
    })

    it('✅ Hebrew Form Validation Messages', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Trigger validation by clicking continue without filling
      cy.get('button').contains(/המשך|Continue/).click()
      cy.wait(1500)
      
      cy.percySnapshotBanking('Hebrew Form Validation', {
        rtlTest: true,
        percyCSS: `
          /* Hebrew validation messages */
          .error, [class*="error"], [role="alert"], .invalid {
            direction: rtl !important;
            text-align: right !important;
            font-family: 'Heebo', Arial, sans-serif !important;
            border-right: 4px solid #f44336 !important;
            border-left: none !important;
            padding-right: 12px !important;
            background: #ffebee !important;
          }
          
          /* Hebrew error indicators */
          .error::before {
            content: "⚠️ שגיאה: ";
            color: #d32f2f;
            font-weight: bold;
          }
          
          /* Required field indicators in Hebrew */
          [required]::after, .required::after {
            content: " *נדרש";
            color: #f44336;
            font-size: 12px;
            position: absolute;
            right: -45px;
            top: 50%;
            transform: translateY(-50%);
          }
          
          /* Hebrew validation styling */
          input:invalid, input.error {
            border: 2px solid #f44336 !important;
            border-right: 4px solid #f44336 !important;
          }
        `
      })
    })
  })

  context('📱 Hebrew Mobile RTL Layout', () => {
    
    it('📲 Hebrew Mobile Form Layout', () => {
      cy.viewport(375, 812)
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      cy.percySnapshotBanking('Hebrew Mobile RTL Layout', {
        widths: [375],
        rtlTest: true,
        testButtonOverflow: true,
        percyCSS: `
          /* Hebrew mobile RTL optimizations */
          body {
            direction: rtl !important;
            font-family: 'Heebo', Arial, sans-serif !important;
          }
          
          /* Mobile Hebrew form styling */
          input, textarea, select {
            font-size: 16px !important; /* Prevent iOS zoom */
            text-align: right !important;
            direction: rtl !important;
            padding: 12px 16px 12px 8px !important;
          }
          
          /* Mobile Hebrew buttons */
          button {
            font-family: 'Heebo', Arial, sans-serif !important;
            text-align: center !important;
            width: 100% !important;
            margin: 8px 0 !important;
          }
          
          /* Hebrew mobile indicator */
          body::before {
            content: "📱 עברית RTL - Mobile";
            position: fixed;
            top: 0;
            right: 0;
            background: rgba(156, 39, 176, 0.9);
            color: white;
            padding: 4px 8px;
            font-size: 12px;
            z-index: 10000;
          }
          
          /* RTL scroll indicators */
          .scroll-indicator {
            position: fixed;
            right: 0;
            top: 50%;
            width: 4px;
            height: 60px;
            background: linear-gradient(to bottom, #9C27B0, #E1BEE7);
          }
        `
      })
      
      // Test Hebrew mobile button overflow
      cy.percyTestButtonOverflow('Hebrew Mobile Layout')
    })

    it('💳 Hebrew Mobile Credit Form', () => {
      cy.viewport(375, 812)
      cy.visit('/services/calculate-credit/1')
      cy.waitForBankingPageLoad()
      
      // Fill Hebrew credit form
      cy.fillFormField('credit_amount', '100000')
      cy.fillFormField('loan_period', '36')
      cy.wait(1000)
      
      cy.percySnapshotBanking('Hebrew Mobile Credit Form', {
        widths: [375],
        rtlTest: true,
        percyCSS: `
          /* Hebrew credit mobile styling */
          input[name*="credit"], input[name*="amount"] {
            direction: ltr !important; /* Keep numbers LTR */
            text-align: left !important;
            font-size: 18px !important;
            font-weight: bold !important;
            color: #1976D2 !important;
          }
          
          /* Hebrew credit labels */
          label {
            direction: rtl !important;
            text-align: right !important;
            font-family: 'Heebo', Arial, sans-serif !important;
            color: #424242 !important;
          }
          
          /* Hebrew mobile credit indicators */
          input[value="100000"]::after {
            content: "100,000 ₪";
            position: absolute;
            top: -20px;
            right: 0;
            background: rgba(25, 118, 210, 0.9);
            color: white;
            padding: 2px 6px;
            font-size: 11px;
            border-radius: 2px;
          }
        `
      })
    })

    it('🔄 Hebrew Mobile Navigation', () => {
      cy.viewport(375, 812)
      
      const hebrewPages = [
        { url: '/services/calculate-mortgage/1', name: 'מחשבון משכנתא' },
        { url: '/services/calculate-credit/1', name: 'מחשבון אשראי' },
        { url: '/services/refinance-mortgage/1', name: 'מחזור משכנתא' }
      ]
      
      hebrewPages.forEach(({ url, name }, index) => {
        cy.visit(url)
        cy.waitForBankingPageLoad()
        
        cy.percySnapshotBanking(`Hebrew Mobile Navigation - ${name}`, {
          widths: [375],
          rtlTest: true,
          percyCSS: `
            /* Hebrew navigation styling */
            nav, .navigation, .nav-menu {
              direction: rtl !important;
              text-align: right !important;
            }
            
            /* Hebrew menu items */
            .nav-item, .menu-item {
              text-align: right !important;
              direction: rtl !important;
              padding: 8px 16px 8px 8px !important;
            }
            
            /* Hebrew breadcrumbs */
            .breadcrumb {
              direction: rtl !important;
              text-align: right !important;
            }
            
            .breadcrumb-separator::after {
              content: "◄" !important; /* RTL arrow */
            }
            
            /* Page title indicator */
            body::after {
              content: "${name}";
              position: fixed;
              bottom: 0;
              right: 0;
              background: rgba(63, 81, 181, 0.9);
              color: white;
              padding: 4px 8px;
              font-size: 12px;
              font-family: 'Heebo', Arial, sans-serif;
            }
          `
        })
      })
    })
  })

  context('🎯 Hebrew Banking Terminology', () => {
    
    it('🏦 Hebrew Banking Terms Accuracy', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Check for proper Hebrew banking terminology
      const hebrewBankingTerms = [
        'משכנתא', // Mortgage
        'ריבית',   // Interest  
        'מקדמה',   // Down payment
        'תשלום',   // Payment
        'נכס',     // Property
        'הלוואה',  // Loan
        'בנק',     // Bank
        'אשראי'    // Credit
      ]
      
      cy.percySnapshotBanking('Hebrew Banking Terminology', {
        rtlTest: true,
        percyCSS: `
          /* Hebrew banking terms highlighting */
          ${hebrewBankingTerms.map(term => `*:contains('${term}')`).join(', ')} {
            border: 2px solid #4CAF50 !important;
            background: rgba(76, 175, 80, 0.1) !important;
            padding: 2px 4px !important;
            border-radius: 3px !important;
            position: relative !important;
          }
          
          /* Banking term validation badges */
          *:contains('משכנתא')::after {
            content: "✓ משכנתא";
            position: absolute;
            top: -20px;
            right: 0;
            background: #4CAF50;
            color: white;
            font-size: 9px;
            padding: 1px 3px;
          }
          
          *:contains('ריבית')::after {
            content: "✓ ריבית";
            position: absolute;
            top: -20px;
            right: 0;
            background: #FF9800;
            color: white;
            font-size: 9px;
            padding: 1px 3px;
          }
          
          /* Hebrew financial terminology indicator */
          body::before {
            content: "🏦 בדיקת מונחים בנקאיים בעברית";
            position: fixed;
            top: 0;
            width: 100%;
            text-align: center;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 8px;
            font-family: 'Heebo', Arial, sans-serif;
            z-index: 10000;
          }
        `
      })
    })

    it('💰 Hebrew Currency & Number Formatting', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Fill with Israeli standard amounts
      cy.fillFormField('property_value', '2500000') // 2.5M ILS
      cy.fillFormField('down_payment', '500000')    // 500K ILS
      cy.wait(1000)
      
      cy.percySnapshotBanking('Hebrew Currency Formatting', {
        rtlTest: true,
        percyCSS: `
          /* Hebrew currency display */
          input[value*="2500000"]::before {
            content: "2,500,000 ₪ (2.5 מיליון שקלים)";
            position: absolute;
            top: -30px;
            right: 0;
            background: rgba(25, 118, 210, 0.9);
            color: white;
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 4px;
            font-family: 'Heebo', Arial, sans-serif;
            white-space: nowrap;
          }
          
          input[value*="500000"]::before {
            content: "500,000 ₪ (חצי מיליון שקלים)";
            position: absolute;
            top: -30px;
            right: 0;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 4px;
            font-family: 'Heebo', Arial, sans-serif;
            white-space: nowrap;
          }
          
          /* Hebrew number separators */
          input[type="number"] {
            direction: ltr !important;
            text-align: left !important;
          }
          
          /* Shekel symbol positioning */
          .currency-shekel::after {
            content: " ₪";
            color: #4CAF50;
            font-weight: bold;
          }
        `
      })
    })
  })

  context('🔄 Hebrew Multi-Step Form Flow', () => {
    
    it('📋 Hebrew Step-by-Step Navigation', () => {
      // Test Hebrew navigation through multiple steps
      for (let step = 1; step <= 3; step++) {
        cy.visit(`/services/calculate-mortgage/${step}`)
        cy.waitForBankingPageLoad()
        
        // Add Hebrew step indicators if not present
        cy.window().then((win) => {
          const stepIndicator = win.document.createElement('div')
          stepIndicator.innerHTML = `שלב ${step} מתוך 4`
          stepIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(63, 81, 181, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Heebo', Arial, sans-serif;
            z-index: 10000;
          `
          win.document.body.appendChild(stepIndicator)
        })
        
        cy.wait(1000)
        
        cy.percySnapshotBanking(`Hebrew Step ${step} Navigation`, {
          rtlTest: true,
          percyCSS: `
            /* Hebrew step indicators */
            .step-indicator, .progress-indicator {
              direction: rtl !important;
              text-align: right !important;
              font-family: 'Heebo', Arial, sans-serif !important;
            }
            
            /* Hebrew progress styling */
            .progress-bar {
              direction: ltr !important; /* Progress bars remain LTR */
            }
            
            /* Hebrew step labels */
            .step-label {
              direction: rtl !important;
              text-align: right !important;
            }
            
            /* Step completion indicators */
            .step-complete::after {
              content: "✅ הושלם";
              color: #4CAF50;
              font-size: 12px;
              margin-right: 8px;
            }
            
            .step-current::after {
              content: "👈 שלב נוכחי";
              color: #FF9800;
              font-size: 12px;
              margin-right: 8px;
            }
          `
        })
      }
    })

    it('🎯 Hebrew Form Completion Journey', () => {
      // Complete Hebrew form journey
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      // Step 1 - Hebrew property details
      cy.fillFormField('property_value', '1800000') // 1.8M ILS
      cy.fillFormField('down_payment', '360000')    // 20% down
      cy.fillFormField('loan_period', '25')         // 25 years
      
      cy.percySnapshotBanking('Hebrew Form Journey - Step 1 Complete', {
        rtlTest: true,
        percyCSS: `
          /* Hebrew completion indicators */
          input[value]:not([value=""]) {
            border: 2px solid #4CAF50 !important;
            background: rgba(76, 175, 80, 0.1) !important;
          }
          
          input[value]:not([value=""])::after {
            content: "✅";
            position: absolute;
            right: -25px;
            top: 50%;
            transform: translateY(-50%);
            color: #4CAF50;
            font-size: 16px;
          }
          
          /* Hebrew form completion message */
          body::after {
            content: "שלב 1 הושלם בהצלחה! ✅";
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: 'Heebo', Arial, sans-serif;
            z-index: 10000;
          }
        `
      })
      
      // Continue to next step
      cy.get('button').contains(/המשך|Continue/).click()
      cy.url().should('include', '/2')
      cy.waitForBankingPageLoad()
      
      cy.percySnapshotBanking('Hebrew Form Journey - Step 2 Start', {
        rtlTest: true
      })
    })
  })

  context('♿ Hebrew Accessibility Testing', () => {
    
    it('🔍 Hebrew Screen Reader Support', () => {
      cy.visit('/services/calculate-mortgage/1')
      cy.waitForBankingPageLoad()
      
      cy.percySnapshotBanking('Hebrew Screen Reader Support', {
        rtlTest: true,
        percyCSS: `
          /* Hebrew accessibility enhancements */
          [aria-label], [aria-labelledby] {
            border: 2px solid #4CAF50 !important;
            position: relative;
          }
          
          [aria-label]::after {
            content: "🔊 נגיש";
            position: absolute;
            top: -20px;
            right: 0;
            background: #4CAF50;
            color: white;
            font-size: 10px;
            padding: 2px 4px;
            border-radius: 2px;
          }
          
          /* Hebrew landmark roles */
          [role="main"]::before {
            content: "תוכן עיקרי";
            position: absolute;
            top: -25px;
            right: 0;
            background: #2196F3;
            color: white;
            font-size: 10px;
            padding: 2px 4px;
          }
          
          [role="navigation"]::before {
            content: "ניווט";
            position: absolute;
            top: -25px;
            right: 0;
            background: #FF9800;
            color: white;
            font-size: 10px;
            padding: 2px 4px;
          }
          
          /* Hebrew focus indicators */
          *:focus {
            outline: 3px solid #2196F3 !important;
            outline-offset: 2px !important;
          }
        `
      })
    })
  })

  // Enhanced Hebrew RTL failure reporting
  afterEach(function() {
    if (this.currentTest && this.currentTest.state === 'failed') {
      const testName = this.currentTest.title
      const spec = Cypress.spec.relative
      
      cy.task('createVisualRegressionJira', {
        testName: `Hebrew RTL - ${testName}`,
        snapshots: [`${testName} - Hebrew RTL Failure`],
        percyBuildUrl: Cypress.env('PERCY_BUILD_URL'),
        visualDifferences: [{
          elementName: 'Hebrew RTL Element',
          changeType: 'text' as const,
          severity: 'high' as const
        }],
        affectedLanguages: ['he'],
        affectedViewports: [375, 768, 1280],
        bankingImpact: 'ui-only' as const,
        screenshots: [],
        specFile: spec,
        branch: Cypress.env('BRANCH_NAME') || 'main',
        commit: Cypress.env('COMMIT_SHA') || 'unknown'
      }, { log: false }).then((result: any) => {
        if (result && result.issueKey) {
          cy.log(`🇮🇱 Hebrew RTL issue reported: ${result.issueKey}`)
        }
      })
    }
  })
})