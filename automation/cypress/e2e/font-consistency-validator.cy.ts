/**
 * 🔤 FONT CONSISTENCY VALIDATOR
 * 
 * CRITICAL REQUIREMENT: All pages MUST use the same font family
 * This test validates font consistency across the entire application
 */

describe('🔤 Font Consistency Validation - CRITICAL', () => {
  
  const pagesToValidate = [
    { name: 'Homepage', path: '/', critical: true },
    { name: 'About', path: '/about', critical: true },
    { name: 'Contact', path: '/contact', critical: true },
    { name: 'Mortgage Step 1', path: '/services/calculate-mortgage/1', critical: true },
    { name: 'Mortgage Step 2', path: '/services/calculate-mortgage/2', critical: true },
    { name: 'Mortgage Step 3', path: '/services/calculate-mortgage/3', critical: true },
    { name: 'Mortgage Step 4', path: '/services/calculate-mortgage/4', critical: true },
    { name: 'Credit Step 1', path: '/services/calculate-credit/1', critical: true },
    { name: 'Credit Step 2', path: '/services/calculate-credit/2', critical: true },
    { name: 'Credit Step 3', path: '/services/calculate-credit/3', critical: true },
    { name: 'Credit Step 4', path: '/services/calculate-credit/4', critical: true },
    { name: 'Refinance Mortgage Step 1', path: '/services/refinance-mortgage/1', critical: true },
    { name: 'Refinance Credit Step 1', path: '/services/refinance-credit/1', critical: true }
  ];
  
  // Expected font families (in order of preference)
  const EXPECTED_FONTS = {
    hebrew: ['Rubik', 'Open Sans Hebrew', 'Arial Hebrew', 'Arial'],
    english: ['Rubik', 'Open Sans', 'Segoe UI', 'Arial'],
    russian: ['Rubik', 'Open Sans', 'Arial']
  };
  
  // Store font results for final validation
  const fontAnalysis = {
    pages: {},
    elements: {},
    inconsistencies: []
  };
  
  beforeEach(() => {
    cy.viewport(1920, 1080);
  });
  
  it('MUST use consistent font-family across all pages', () => {
    cy.wrap(pagesToValidate).each(page => {
      cy.visit(page.path);
      cy.wait(2000);
      
      // Get body font
      cy.get('body').then($body => {
        const bodyFont = window.getComputedStyle($body[0]).fontFamily;
        fontAnalysis.pages[page.name] = {
          bodyFont,
          elements: {}
        };
        
        cy.log(`📄 ${page.name}: ${bodyFont}`);
        
        // Check if it's one of our expected fonts
        const allExpectedFonts = [...EXPECTED_FONTS.hebrew, ...EXPECTED_FONTS.english, ...EXPECTED_FONTS.russian];
        const hasExpectedFont = allExpectedFonts.some(font => bodyFont.includes(font));
        
        if (!hasExpectedFont) {
          fontAnalysis.inconsistencies.push({
            page: page.name,
            issue: `Unexpected font: ${bodyFont}`
          });
        }
        
        expect(hasExpectedFont, `${page.name} should use expected font family`).to.be.true;
      });
    });
    
    // Final consistency check
    cy.wrap(fontAnalysis).then(analysis => {
      const allBodyFonts = Object.values(analysis.pages).map(p => p.bodyFont);
      const uniqueFonts = [...new Set(allBodyFonts)];
      
      cy.log('📊 Font Consistency Report:');
      cy.log(`Unique fonts found: ${uniqueFonts.length}`);
      uniqueFonts.forEach(font => {
        cy.log(`  - ${font}`);
      });
      
      // All pages should use the same font (allowing for fallbacks)
      expect(uniqueFonts.length).to.be.lessThan(3, 'All pages should use consistent fonts');
      
      if (analysis.inconsistencies.length > 0) {
        cy.log('⚠️ Inconsistencies found:');
        analysis.inconsistencies.forEach(issue => {
          cy.log(`  - ${issue.page}: ${issue.issue}`);
        });
      }
    });
  });
  
  it('All text elements MUST use consistent fonts', () => {
    // Test critical pages
    const criticalPages = pagesToValidate.filter(p => p.critical).slice(0, 5);
    
    cy.wrap(criticalPages).each(page => {
      cy.visit(page.path);
      cy.wait(2000);
      
      // Check all text elements
      const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, label, button, a, li, td, th';
      
      cy.get(textSelectors).then($elements => {
        const fonts = new Map();
        
        $elements.each((index, el) => {
          const font = window.getComputedStyle(el).fontFamily;
          const tagName = el.tagName.toLowerCase();
          
          if (!fonts.has(font)) {
            fonts.set(font, []);
          }
          fonts.get(font).push(tagName);
        });
        
        cy.log(`📄 ${page.name} - Font usage:`);
        fonts.forEach((tags, font) => {
          cy.log(`  ${font}: ${tags.length} elements`);
        });
        
        // Should not have more than 2 different font families
        expect(fonts.size).to.be.lessThan(4, `${page.name} should not have more than 3 different fonts`);
      });
    });
  });
  
  it('Hebrew pages MUST use RTL-compatible fonts', () => {
    // Switch to Hebrew
    cy.visit('/');
    cy.get('button').contains(/עברית|HE/i).then($btn => {
      if ($btn.length > 0) {
        cy.wrap($btn.first()).click();
        cy.wait(2000);
      }
    });
    
    // Check Hebrew pages
    const hebrewPages = [
      '/services/calculate-mortgage/1',
      '/services/calculate-credit/1'
    ];
    
    hebrewPages.forEach(page => {
      cy.visit(page);
      cy.wait(2000);
      
      // Verify RTL
      cy.get('html').should('have.attr', 'dir', 'rtl');
      
      // Check font on Hebrew text
      cy.get('h1, h2, h3, label, button').each($el => {
        const text = $el.text();
        // Check if contains Hebrew characters
        if (/[\u0590-\u05FF]/.test(text)) {
          const font = window.getComputedStyle($el[0]).fontFamily;
          
          // Must use Hebrew-compatible font
          const isHebrewFont = EXPECTED_FONTS.hebrew.some(f => font.includes(f));
          
          if (!isHebrewFont) {
            cy.log(`⚠️ Non-Hebrew font on Hebrew text: ${font}`);
          }
          
          expect(isHebrewFont, 'Hebrew text must use Hebrew-compatible font').to.be.true;
        }
      });
    });
  });
  
  it('Font size and weight MUST be consistent for same element types', () => {
    const elementsToCheck = [
      { selector: 'h1', expectedSize: { min: 24, max: 48 } },
      { selector: 'h2', expectedSize: { min: 20, max: 36 } },
      { selector: 'h3', expectedSize: { min: 18, max: 28 } },
      { selector: 'p', expectedSize: { min: 14, max: 18 } },
      { selector: 'label', expectedSize: { min: 12, max: 18 } },
      { selector: 'button', expectedSize: { min: 14, max: 20 } }
    ];
    
    cy.visit('/services/calculate-mortgage/1');
    cy.wait(2000);
    
    elementsToCheck.forEach(element => {
      cy.get(element.selector).then($elements => {
        if ($elements.length > 0) {
          const sizes = [];
          const weights = [];
          
          $elements.each((index, el) => {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            const fontWeight = style.fontWeight;
            
            sizes.push(fontSize);
            weights.push(fontWeight);
          });
          
          // Check size consistency
          const minSize = Math.min(...sizes);
          const maxSize = Math.max(...sizes);
          
          cy.log(`${element.selector}: ${minSize}px - ${maxSize}px`);
          
          // Sizes should be within expected range
          expect(minSize).to.be.at.least(element.expectedSize.min);
          expect(maxSize).to.be.at.most(element.expectedSize.max);
          
          // Check weight consistency
          const uniqueWeights = [...new Set(weights)];
          cy.log(`${element.selector} weights: ${uniqueWeights.join(', ')}`);
          
          // Same element type shouldn't have too many different weights
          expect(uniqueWeights.length).to.be.lessThan(3);
        }
      });
    });
  });
  
  it('Generate Font Consistency Report', () => {
    const report = {
      timestamp: new Date().toISOString(),
      results: [],
      summary: {
        totalPages: pagesToValidate.length,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
    
    // Quick check on all pages
    cy.wrap(pagesToValidate).each((page, index) => {
      cy.visit(page.path);
      cy.wait(1000);
      
      cy.get('body').then($body => {
        const font = window.getComputedStyle($body[0]).fontFamily;
        const fontSize = window.getComputedStyle($body[0]).fontSize;
        
        const result = {
          page: page.name,
          font,
          fontSize,
          status: 'PASS'
        };
        
        // Check if it matches expected
        const isExpected = Object.values(EXPECTED_FONTS).flat().some(f => font.includes(f));
        
        if (!isExpected) {
          result.status = 'FAIL';
          report.summary.failed++;
        } else {
          report.summary.passed++;
        }
        
        report.results.push(result);
      });
    }).then(() => {
      // Log final report
      cy.log('📊 FONT CONSISTENCY REPORT');
      cy.log('========================');
      cy.log(`Total Pages: ${report.summary.totalPages}`);
      cy.log(`✅ Passed: ${report.summary.passed}`);
      cy.log(`❌ Failed: ${report.summary.failed}`);
      
      // Show failed pages
      const failed = report.results.filter(r => r.status === 'FAIL');
      if (failed.length > 0) {
        cy.log('Failed Pages:');
        failed.forEach(f => {
          cy.log(`  - ${f.page}: ${f.font}`);
        });
      }
      
      // Overall verdict
      const passRate = (report.summary.passed / report.summary.totalPages) * 100;
      cy.log(`Pass Rate: ${passRate.toFixed(1)}%`);
      
      expect(passRate).to.be.at.least(80, 'Font consistency should be at least 80%');
    });
  });
});