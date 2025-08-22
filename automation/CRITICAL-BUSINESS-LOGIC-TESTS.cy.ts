/**
 * 🎯 CRITICAL BUSINESS LOGIC TESTS - ALL SERVICES 4-STEP VALIDATION
 * 
 * MANDATORY REQUIREMENTS:
 * 1. All services MUST complete 4 steps
 * 2. All dropdowns MUST be validated
 * 3. Visual regression MUST pass
 * 4. Font consistency MUST be maintained
 */

describe('🔴 CRITICAL: All Services 4-Step Business Logic', () => {
  
  // Test configuration
  const services = [
    {
      name: 'Mortgage Calculator',
      path: '/services/calculate-mortgage',
      expectedSteps: 4,
      criticalDropdowns: ['property_ownership', 'property_type', 'when_needed', 'city']
    },
    {
      name: 'Credit Calculator',
      path: '/services/calculate-credit',
      expectedSteps: 4,
      criticalDropdowns: ['loan_purpose', 'loan_type', 'payment_method']
    },
    {
      name: 'Refinance Mortgage',
      path: '/services/refinance-mortgage',
      expectedSteps: 4,
      criticalDropdowns: ['current_bank', 'refinance_type', 'property_status']
    },
    {
      name: 'Refinance Credit',
      path: '/services/refinance-credit',
      expectedSteps: 4,
      criticalDropdowns: ['current_loan_type', 'refinance_reason']
    }
  ];

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/');
    cy.wait(2000);
  });

  services.forEach(service => {
    describe(`🏦 ${service.name}`, () => {
      
      it(`MUST complete all 4 steps with business logic validation`, () => {
        cy.log(`🚀 Starting ${service.name} 4-step validation`);
        
        // STEP 1: Initial Form
        cy.visit(`${service.path}/1`);
        cy.wait(3000);
        
        // Validate Step 1 is loaded
        cy.url().should('include', `${service.path}/1`);
        cy.get('body').should('be.visible');
        
        // Take visual snapshot of Step 1
        cy.screenshot(`${service.name}-step1-initial`);
        
        // Fill Step 1 mandatory fields
        cy.log('📝 Filling Step 1 mandatory fields');
        
        // Property/Loan value
        cy.get('input[type="text"]').first().clear().type('1500000');
        
        // Validate dropdowns exist and have options
        service.criticalDropdowns.forEach(dropdown => {
          cy.log(`🔍 Checking dropdown: ${dropdown}`);
          // Multiple selectors to find dropdowns
          cy.get(`[data-testid="${dropdown}"], [name="${dropdown}"], [id="${dropdown}"], select, [role="combobox"]`)
            .first()
            .should('exist')
            .then($el => {
              if ($el.is('select')) {
                cy.wrap($el).children('option').should('have.length.greaterThan', 1);
              }
            });
        });
        
        // Click Next to Step 2
        cy.get('button').contains(/הבא|Next|Continue/i).click();
        cy.wait(3000);
        
        // STEP 2: Personal Information
        cy.log('📍 Step 2: Personal Information');
        cy.url().should('include', `${service.path}/2`);
        cy.screenshot(`${service.name}-step2-personal`);
        
        // Fill personal data
        cy.get('input').then($inputs => {
          // Name field
          if ($inputs.filter('[type="text"]').length > 0) {
            cy.wrap($inputs.filter('[type="text"]').first()).clear().type('ישראל ישראלי');
          }
          // Phone if needed
          if ($inputs.filter('[type="tel"]').length > 0) {
            cy.wrap($inputs.filter('[type="tel"]').first()).clear().type('0501234567');
          }
        });
        
        // Age/Birthday
        cy.get('input[type="number"], input[type="date"]').first().then($input => {
          if ($input.attr('type') === 'number') {
            cy.wrap($input).clear().type('35');
          } else {
            cy.wrap($input).clear().type('1989-01-01');
          }
        });
        
        // Click Next to Step 3
        cy.get('button').contains(/הבא|Next|Continue/i).click();
        cy.wait(3000);
        
        // STEP 3: Financial Information
        cy.log('💰 Step 3: Financial Information');
        cy.url().should('include', `${service.path}/3`);
        cy.screenshot(`${service.name}-step3-financial`);
        
        // Fill income
        cy.get('input').then($inputs => {
          const incomeFields = $inputs.filter((i, el) => {
            const placeholder = el.getAttribute('placeholder') || '';
            return placeholder.includes('הכנסה') || placeholder.includes('income') || placeholder.includes('משכורת');
          });
          
          if (incomeFields.length > 0) {
            cy.wrap(incomeFields.first()).clear().type('25000');
          } else {
            // Fallback: fill first numeric input
            cy.wrap($inputs.filter('[type="text"], [type="number"]').first()).clear().type('25000');
          }
        });
        
        // Click Next to Step 4
        cy.get('button').contains(/הבא|Next|Continue|Calculate|חשב/i).click();
        cy.wait(5000);
        
        // STEP 4: Results/Offers
        cy.log('🎯 Step 4: Results/Offers');
        cy.url().should('include', `${service.path}/4`);
        cy.screenshot(`${service.name}-step4-results`);
        
        // Validate results are displayed
        cy.get('body').then($body => {
          // Look for bank offers or results
          const hasResults = $body.find('[class*="offer"], [class*="result"], [class*="bank"], table').length > 0;
          expect(hasResults).to.be.true;
        });
        
        cy.log(`✅ ${service.name} completed all 4 steps successfully`);
      });
      
      it(`MUST have working dropdowns in all steps`, () => {
        cy.visit(`${service.path}/1`);
        cy.wait(3000);
        
        // Find all dropdowns
        cy.get('select, [role="combobox"], [class*="dropdown"], [class*="select"]').then($dropdowns => {
          cy.log(`Found ${$dropdowns.length} dropdowns`);
          expect($dropdowns.length).to.be.greaterThan(0);
          
          // Test each dropdown
          $dropdowns.each((index, dropdown) => {
            cy.wrap(dropdown).should('not.be.disabled');
            
            // For select elements, check options
            if (dropdown.tagName === 'SELECT') {
              cy.wrap(dropdown).children('option').should('have.length.greaterThan', 1);
            }
          });
        });
      });
    });
  });
});

describe('🎨 CRITICAL: Visual Regression Tests', () => {
  
  const criticalPages = [
    { name: 'Homepage', path: '/' },
    { name: 'Mortgage Step 1', path: '/services/calculate-mortgage/1' },
    { name: 'Credit Step 1', path: '/services/calculate-credit/1' },
    { name: 'Refinance Mortgage Step 1', path: '/services/refinance-mortgage/1' },
    { name: 'Refinance Credit Step 1', path: '/services/refinance-credit/1' }
  ];
  
  criticalPages.forEach(page => {
    it(`Visual test for ${page.name}`, () => {
      cy.visit(page.path);
      cy.wait(3000);
      
      // Take screenshots in multiple viewports
      const viewports = [
        { name: 'Desktop', width: 1920, height: 1080 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 812 }
      ];
      
      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        cy.wait(1000);
        cy.screenshot(`${page.name}-${viewport.name}`);
        
        // Percy snapshot if available
        if (window.Percy) {
          cy.percySnapshot(`${page.name} - ${viewport.name}`, {
            widths: [viewport.width]
          });
        }
      });
    });
  });
});

describe('🔤 CRITICAL: Font Consistency Validation', () => {
  
  it('MUST use consistent font across all pages', () => {
    const pagesToCheck = [
      '/',
      '/services/calculate-mortgage/1',
      '/services/calculate-credit/1',
      '/services/refinance-mortgage/1',
      '/services/refinance-credit/1',
      '/about',
      '/contact'
    ];
    
    const expectedFonts = ['Rubik', 'Open Sans', 'Segoe UI', 'Arial'];
    const fontResults = {};
    
    pagesToCheck.forEach(page => {
      cy.visit(page);
      cy.wait(2000);
      
      // Check font-family on body
      cy.get('body').then($body => {
        const bodyFont = window.getComputedStyle($body[0]).fontFamily;
        fontResults[page] = bodyFont;
        
        cy.log(`Page: ${page}, Font: ${bodyFont}`);
        
        // Validate font is in expected list
        const hasExpectedFont = expectedFonts.some(font => bodyFont.includes(font));
        expect(hasExpectedFont, `Page ${page} should use expected font`).to.be.true;
      });
      
      // Check all text elements have consistent font
      cy.get('h1, h2, h3, h4, h5, h6, p, span, label, button').then($elements => {
        const fonts = new Set();
        
        $elements.each((index, el) => {
          const font = window.getComputedStyle(el).fontFamily;
          fonts.add(font);
        });
        
        // Log unique fonts found
        cy.log(`Unique fonts on ${page}: ${Array.from(fonts).join(', ')}`);
        
        // Warn if too many different fonts
        if (fonts.size > 3) {
          cy.log(`⚠️ WARNING: ${fonts.size} different fonts found on ${page}`);
        }
      });
    });
    
    // Final consistency check
    cy.wrap(fontResults).then(results => {
      const uniqueFonts = new Set(Object.values(results));
      cy.log(`Total unique fonts across site: ${uniqueFonts.size}`);
      
      // All pages should use similar fonts
      expect(uniqueFonts.size).to.be.lessThan(4, 'Site should use consistent fonts');
    });
  });
  
  it('Hebrew text MUST use RTL-compatible font', () => {
    cy.visit('/');
    
    // Switch to Hebrew
    cy.get('button').contains(/עברית|HE/i).click();
    cy.wait(2000);
    
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(2000);
    
    // Check Hebrew text rendering
    cy.get('body').should('have.attr', 'dir', 'rtl');
    
    cy.get('h1, h2, h3, label, button').then($elements => {
      $elements.each((index, el) => {
        const text = el.textContent || '';
        
        // If contains Hebrew characters
        if (/[\u0590-\u05FF]/.test(text)) {
          const font = window.getComputedStyle(el).fontFamily;
          
          // Should use Hebrew-compatible font
          const hebrewFonts = ['Rubik', 'Open Sans', 'Arial', 'Heebo', 'Assistant'];
          const hasHebrewFont = hebrewFonts.some(f => font.includes(f));
          
          expect(hasHebrewFont, `Hebrew text should use compatible font, found: ${font}`).to.be.true;
        }
      });
    });
  });
});

describe('🔽 CRITICAL: All Dropdowns Validation', () => {
  
  it('MUST validate ALL dropdowns have correct options', () => {
    // Test mortgage dropdowns
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(3000);
    
    // Property ownership dropdown MUST have 3 options
    cy.get('select, [role="combobox"]').then($dropdowns => {
      cy.log(`Found ${$dropdowns.length} dropdowns on mortgage page`);
      
      // Find property ownership dropdown
      $dropdowns.each((index, dropdown) => {
        cy.wrap(dropdown).then($el => {
          // Check if it's property ownership
          const text = $el.text() || '';
          if (text.includes('נכס') || text.includes('property')) {
            cy.log('Found property ownership dropdown');
            
            if ($el.is('select')) {
              cy.wrap($el).children('option').then($options => {
                // Should have exactly 3 property options + 1 placeholder = 4
                expect($options.length).to.be.at.least(3);
                
                // Validate specific options exist
                const optionTexts = $options.map((i, opt) => opt.textContent).get();
                cy.log(`Options found: ${optionTexts.join(', ')}`);
                
                // Must have these options
                expect(optionTexts.some(t => t.includes('אין') || t.includes("don't"))).to.be.true;
                expect(optionTexts.some(t => t.includes('יש') || t.includes('have'))).to.be.true;
                expect(optionTexts.some(t => t.includes('מוכר') || t.includes('selling'))).to.be.true;
              });
            }
          }
        });
      });
    });
  });
  
  it('Dropdown data MUST load from API', () => {
    // Check API endpoint
    cy.request('/api/v1/calculation-parameters?business_path=mortgage').then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.exist;
      
      // Validate property ownership LTVs
      const ltvs = response.body.data.property_ownership_ltvs;
      expect(ltvs).to.exist;
      expect(ltvs.no_property.ltv).to.eq(75);
      expect(ltvs.has_property.ltv).to.eq(50);
      expect(ltvs.selling_property.ltv).to.eq(70);
    });
    
    // Check dropdown API
    cy.request('/api/dropdowns/mortgage_step1/he').then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.dropdowns).to.exist;
      expect(response.body.dropdowns.length).to.be.greaterThan(0);
    });
  });
});

// Export test status
export const criticalTestStatus = {
  fourStepValidation: 'MANDATORY',
  visualRegression: 'MANDATORY',
  fontConsistency: 'MANDATORY',
  dropdownValidation: 'MANDATORY',
  expectedPassRate: 100
};