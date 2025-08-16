const { chromium } = require('playwright');
const fs = require('fs');

class DeepMenuNavigationTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testedUrls: new Set(),
      menuHierarchy: {},
      emptyPages: [],
      brokenLinks: [],
      workingPages: [],
      submenus: [],
      deepestLevel: 0,
      totalLinksFound: 0,
      totalLinksTested: 0,
      issues: []
    };
    
    this.visitedUrls = new Set();
    this.menuQueue = [];
  }

  // MAIN TEST: Deep recursive menu exploration
  async exploreAllMenusRecursively(page, depth = 0, parentMenu = 'root') {
    console.log(`\n${'  '.repeat(depth)}📁 Exploring level ${depth}: ${parentMenu}`);
    
    if (depth > 10) {
      console.log(`Max depth reached at level ${depth}`);
      return;
    }
    
    this.results.deepestLevel = Math.max(this.results.deepestLevel, depth);
    
    // Find ALL clickable menu elements at current level
    const menuSelectors = [
      // Main menu items
      'nav a',
      'nav button',
      '[role="navigation"] a',
      '[role="navigation"] button',
      
      // Dropdown triggers
      '[data-testid*="menu"]',
      '[data-testid*="dropdown"]',
      '[class*="dropdown"]',
      '[class*="menu-item"]',
      '[class*="nav-item"]',
      
      // Submenu items
      '[role="menu"] [role="menuitem"]',
      '[role="menuitem"]',
      '.submenu a',
      '.dropdown-menu a',
      '.dropdown-content a',
      
      // Mobile menu items
      '.mobile-menu a',
      '.hamburger-menu a',
      '.sidebar a',
      '.sidebar button',
      
      // Footer links
      'footer a',
      'footer button',
      
      // Breadcrumbs
      '.breadcrumb a',
      '[class*="breadcrumb"] a',
      
      // Hebrew specific
      'a:has-text("שירותים")',
      'a:has-text("אודות")',
      'a:has-text("צור קשר")',
      'a:has-text("משרות")',
      
      // Any link or button with text
      'a[href]',
      'button:not([type="submit"])'
    ];
    
    const foundElements = [];
    
    // Collect all menu elements
    for (const selector of menuSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible()) {
            const text = await element.textContent();
            const href = await element.getAttribute('href');
            
            if (text && text.trim()) {
              foundElements.push({
                element,
                text: text.trim(),
                href,
                selector,
                depth
              });
            }
          }
        }
      } catch (e) {
        // Continue with next selector
      }
    }
    
    console.log(`${'  '.repeat(depth)}Found ${foundElements.length} menu items at level ${depth}`);
    this.results.totalLinksFound += foundElements.length;
    
    // Test each found element
    for (const item of foundElements) {
      await this.testMenuItem(page, item, depth);
    }
  }

  // Test individual menu item
  async testMenuItem(page, item, depth) {
    const indent = '  '.repeat(depth);
    console.log(`\n${indent}🔍 Testing: ${item.text}`);
    
    try {
      const currentUrl = page.url();
      
      // Skip if already tested
      if (this.visitedUrls.has(item.href || item.text)) {
        console.log(`${indent}⏭️  Already tested, skipping`);
        return;
      }
      
      this.visitedUrls.add(item.href || item.text);
      this.results.totalLinksTested++;
      
      // Check if it's a dropdown trigger
      const isDropdown = await this.isDropdownTrigger(page, item.element);
      
      if (isDropdown) {
        console.log(`${indent}📂 Dropdown detected - opening submenu`);
        
        // Click to open dropdown
        await item.element.click();
        await page.waitForTimeout(500);
        
        // Look for submenu items
        const submenuSelectors = [
          '[role="menu"]',
          '.dropdown-menu',
          '.submenu',
          '[class*="dropdown-content"]',
          '[class*="menu-open"]',
          '[class*="expanded"]'
        ];
        
        let submenuFound = false;
        for (const selector of submenuSelectors) {
          const submenu = await page.locator(selector).first();
          if (await submenu.isVisible()) {
            submenuFound = true;
            console.log(`${indent}✅ Submenu opened`);
            
            // Record submenu
            this.results.submenus.push({
              parent: item.text,
              depth: depth,
              url: currentUrl
            });
            
            // Recursively explore submenu
            await this.exploreAllMenusRecursively(page, depth + 1, item.text);
            
            // Close submenu if possible
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
            break;
          }
        }
        
        if (!submenuFound) {
          console.log(`${indent}⚠️ No submenu found after click`);
        }
        
      } else if (item.href && item.href !== '#' && item.href !== 'javascript:void(0)') {
        // It's a regular link - navigate to it
        console.log(`${indent}🔗 Navigating to: ${item.href}`);
        
        try {
          await item.element.click();
          await page.waitForTimeout(2000);
          
          const newUrl = page.url();
          
          if (newUrl !== currentUrl) {
            console.log(`${indent}✅ Navigation successful to: ${newUrl}`);
            
            // Check page content
            const pageStatus = await this.checkPageContent(page, item.text, newUrl);
            
            if (pageStatus.isEmpty) {
              console.log(`${indent}⚠️ EMPTY PAGE DETECTED!`);
              this.results.emptyPages.push({
                text: item.text,
                url: newUrl,
                depth: depth,
                parent: item.parent,
                reason: pageStatus.reason
              });
            } else {
              console.log(`${indent}✅ Page has content`);
              this.results.workingPages.push({
                text: item.text,
                url: newUrl,
                depth: depth,
                contentLength: pageStatus.contentLength
              });
            }
            
            // Check for nested menus on this page
            await this.exploreAllMenusRecursively(page, depth + 1, item.text);
            
            // Navigate back
            await page.goBack();
            await page.waitForTimeout(1000);
            
            // Reopen parent menu if needed
            await this.reopenMenuIfNeeded(page, depth);
            
          } else {
            console.log(`${indent}⚠️ No navigation occurred`);
          }
          
        } catch (navError) {
          console.log(`${indent}❌ Navigation error: ${navError.message}`);
          this.results.brokenLinks.push({
            text: item.text,
            href: item.href,
            error: navError.message,
            depth: depth
          });
        }
      }
      
    } catch (error) {
      console.log(`${indent}❌ Error testing item: ${error.message}`);
      this.results.issues.push({
        text: item.text,
        error: error.message,
        depth: depth
      });
    }
  }

  // Check if element is a dropdown trigger
  async isDropdownTrigger(page, element) {
    try {
      // Check for dropdown indicators
      const hasArrow = await element.locator('[class*="arrow"], [class*="caret"], svg').count() > 0;
      const hasDropdownClass = await element.evaluate(el => 
        el.className.includes('dropdown') || 
        el.className.includes('has-submenu') ||
        el.getAttribute('aria-haspopup') === 'true'
      );
      
      return hasArrow || hasDropdownClass;
    } catch (e) {
      return false;
    }
  }

  // Check page content
  async checkPageContent(page, menuText, url) {
    const content = await page.locator('body').textContent();
    const contentLength = content ? content.trim().length : 0;
    
    // Empty page indicators
    const emptyIndicators = [
      contentLength < 100,
      await page.locator('text="404"').count() > 0,
      await page.locator('text="Page not found"').count() > 0,
      await page.locator('text="דף לא נמצא"').count() > 0,
      await page.locator('text="Coming soon"').count() > 0,
      await page.locator('text="בקרוב"').count() > 0,
      await page.locator('text="Under construction"').count() > 0,
      await page.locator('text="This page is empty"').count() > 0
    ];
    
    const isEmpty = emptyIndicators.some(indicator => indicator === true);
    
    let reason = '';
    if (contentLength < 100) reason = 'Too little content';
    if (await page.locator('text="404"').count() > 0) reason = '404 error';
    if (await page.locator('text="Coming soon"').count() > 0) reason = 'Coming soon page';
    
    // Also check for actual content indicators
    const hasContent = 
      await page.locator('h1, h2, h3').count() > 0 ||
      await page.locator('p').count() > 3 ||
      await page.locator('form').count() > 0 ||
      await page.locator('[class*="content"]').count() > 0;
    
    return {
      isEmpty: isEmpty && !hasContent,
      contentLength,
      reason,
      hasContent
    };
  }

  // Reopen menu after navigation
  async reopenMenuIfNeeded(page, depth) {
    if (depth === 0) {
      // Reopen main menu if it was a hamburger menu
      const hamburger = await page.locator('.burger, [class*="burger"], [class*="hamburger"]').first();
      if (await hamburger.count() > 0 && await hamburger.isVisible()) {
        await hamburger.click();
        await page.waitForTimeout(500);
      }
    }
  }

  // Test all navigation areas
  async testAllNavigationAreas(page) {
    console.log('\n🎯 STARTING COMPREHENSIVE DEEP MENU TESTING\n');
    
    // 1. Test Desktop Header Navigation
    console.log('\n📍 TESTING DESKTOP HEADER NAVIGATION');
    await this.exploreAllMenusRecursively(page, 0, 'Desktop Header');
    
    // 2. Test Mobile Menu
    console.log('\n📱 TESTING MOBILE MENU');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    
    const hamburger = await page.locator('.burger, [class*="burger"], [class*="hamburger"]').first();
    if (await hamburger.count() > 0) {
      await hamburger.click();
      await page.waitForTimeout(500);
      await this.exploreAllMenusRecursively(page, 0, 'Mobile Menu');
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 3. Test Footer Navigation
    console.log('\n🦶 TESTING FOOTER NAVIGATION');
    const footer = await page.locator('footer').first();
    if (await footer.count() > 0) {
      await footer.scrollIntoViewIfNeeded();
      await this.exploreAllMenusRecursively(page, 0, 'Footer');
    }
    
    // 4. Test Sidebar Navigation (if exists)
    console.log('\n📊 TESTING SIDEBAR NAVIGATION');
    const sidebar = await page.locator('.sidebar, [class*="sidebar"], aside').first();
    if (await sidebar.count() > 0) {
      await this.exploreAllMenusRecursively(page, 0, 'Sidebar');
    }
    
    // 5. Test Language Variations
    console.log('\n🌐 TESTING LANGUAGE VARIATIONS');
    await this.testAllLanguages(page);
  }

  // Test all language variations
  async testAllLanguages(page) {
    const languages = ['en', 'he', 'ru'];
    
    for (const lang of languages) {
      console.log(`\n🌐 Testing ${lang.toUpperCase()} language`);
      
      // Switch language
      const langSwitcher = await page.locator('[class*="language"], [data-testid*="language"]').first();
      if (await langSwitcher.count() > 0) {
        await langSwitcher.click();
        await page.waitForTimeout(500);
        
        const langOption = await page.locator(`[data-testid="lang-${lang}"], text="${lang.toUpperCase()}"`).first();
        if (await langOption.count() > 0) {
          await langOption.click();
          await page.waitForTimeout(1000);
          
          // Test navigation in this language
          await this.exploreAllMenusRecursively(page, 0, `${lang.toUpperCase()} Language`);
        }
      }
    }
  }

  // Generate comprehensive report
  async generateComprehensiveReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE DEEP MENU NAVIGATION TEST REPORT');
    console.log('='.repeat(80));
    
    console.log('\n📈 STATISTICS:');
    console.log(`  Total Links Found: ${this.results.totalLinksFound}`);
    console.log(`  Total Links Tested: ${this.results.totalLinksTested}`);
    console.log(`  Unique URLs Tested: ${this.visitedUrls.size}`);
    console.log(`  Deepest Menu Level: ${this.results.deepestLevel}`);
    console.log(`  Submenus Found: ${this.results.submenus.length}`);
    
    console.log('\n✅ WORKING PAGES: ' + this.results.workingPages.length);
    if (this.results.workingPages.length > 0) {
      console.log('  Top 10 working pages:');
      this.results.workingPages.slice(0, 10).forEach(page => {
        console.log(`    ✅ ${page.text} - ${page.url}`);
      });
    }
    
    console.log('\n⚠️ EMPTY PAGES: ' + this.results.emptyPages.length);
    if (this.results.emptyPages.length > 0) {
      this.results.emptyPages.forEach(page => {
        console.log(`    ❌ ${page.text}`);
        console.log(`       URL: ${page.url}`);
        console.log(`       Reason: ${page.reason}`);
        console.log(`       Depth: Level ${page.depth}`);
      });
    }
    
    console.log('\n💔 BROKEN LINKS: ' + this.results.brokenLinks.length);
    if (this.results.brokenLinks.length > 0) {
      this.results.brokenLinks.forEach(link => {
        console.log(`    ❌ ${link.text}`);
        console.log(`       HREF: ${link.href}`);
        console.log(`       Error: ${link.error}`);
      });
    }
    
    console.log('\n📂 SUBMENU HIERARCHY:');
    if (this.results.submenus.length > 0) {
      this.results.submenus.forEach(submenu => {
        console.log(`    ${'  '.repeat(submenu.depth)}└─ ${submenu.parent}`);
      });
    }
    
    // Calculate success rate
    const totalTested = this.results.workingPages.length + this.results.emptyPages.length + this.results.brokenLinks.length;
    const successRate = totalTested > 0 ? (this.results.workingPages.length / totalTested * 100).toFixed(2) : 0;
    
    console.log('\n📊 OVERALL RESULTS:');
    console.log(`  Success Rate: ${successRate}%`);
    console.log(`  Empty Page Rate: ${(this.results.emptyPages.length / totalTested * 100).toFixed(2)}%`);
    console.log(`  Broken Link Rate: ${(this.results.brokenLinks.length / totalTested * 100).toFixed(2)}%`);
    
    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS:');
    if (this.results.emptyPages.length > 0) {
      console.log('  1. Implement content for empty pages or remove menu items');
    }
    if (this.results.brokenLinks.length > 0) {
      console.log('  2. Fix broken links or update navigation paths');
    }
    if (this.results.deepestLevel > 3) {
      console.log('  3. Consider simplifying deep menu hierarchies for better UX');
    }
    if (successRate < 80) {
      console.log('  4. Critical: Many navigation issues detected - requires immediate attention');
    }
    
    console.log('\n' + '='.repeat(80));
    
    // Save detailed report
    const reportData = {
      ...this.results,
      visitedUrls: Array.from(this.visitedUrls),
      successRate: successRate,
      recommendations: this.generateRecommendations()
    };
    
    fs.writeFileSync(
      'deep-menu-navigation-report.json',
      JSON.stringify(reportData, null, 2)
    );
    
    // Generate HTML report
    this.generateHTMLReport(reportData);
    
    console.log('\n📊 Reports saved:');
    console.log('  - deep-menu-navigation-report.json');
    console.log('  - deep-menu-navigation-report.html');
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.emptyPages.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Empty Pages',
        action: 'Implement content or remove menu items',
        count: this.results.emptyPages.length
      });
    }
    
    if (this.results.brokenLinks.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'Broken Links',
        action: 'Fix navigation paths immediately',
        count: this.results.brokenLinks.length
      });
    }
    
    if (this.results.deepestLevel > 3) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'Deep Menu Hierarchy',
        action: 'Simplify navigation structure',
        depth: this.results.deepestLevel
      });
    }
    
    return recommendations;
  }

  generateHTMLReport(data) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Deep Menu Navigation Report - ${new Date().toISOString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }
        .header h1 { 
            font-size: 2.5em; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label { color: #666; font-size: 0.9em; }
        .success { color: #10b981; }
        .warning { color: #f59e0b; }
        .error { color: #ef4444; }
        .info { color: #3b82f6; }
        .section {
            background: white;
            margin: 20px 0;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .section h2 {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .issue-card {
            background: #f9fafb;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #ef4444;
        }
        .empty-page {
            background: #fef2f2;
            border-left-color: #f59e0b;
        }
        .working-page {
            background: #f0fdf4;
            border-left-color: #10b981;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        tr:hover { background: #f9fafb; }
        .btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: opacity 0.3s;
            margin: 5px;
        }
        .btn:hover { opacity: 0.9; }
        .btn-danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
        .recommendation {
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .rec-critical { background: #fee2e2; }
        .rec-high { background: #fed7aa; }
        .rec-medium { background: #fef3c7; }
        .priority-badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
        }
        .badge-critical { background: #ef4444; }
        .badge-high { background: #f59e0b; }
        .badge-medium { background: #eab308; }
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e5e7eb;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 1s ease;
        }
        .bug-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        #confirmModal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        #confirmModal.show { display: flex; }
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .modal-header { 
            font-size: 1.5em; 
            margin-bottom: 15px;
            color: #333;
        }
        .modal-body { 
            margin: 20px 0;
            color: #666;
            line-height: 1.6;
        }
        .modal-footer {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Deep Menu Navigation Test Report</h1>
            <p style="color: #666;">Generated: ${new Date().toISOString()}</p>
            <p style="color: #666;">Banking Application QA - Comprehensive Menu Testing</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number info">${data.totalLinksFound}</div>
                <div class="stat-label">Total Links Found</div>
            </div>
            <div class="stat-card">
                <div class="stat-number info">${data.totalLinksTested}</div>
                <div class="stat-label">Links Tested</div>
            </div>
            <div class="stat-card">
                <div class="stat-number success">${data.workingPages.length}</div>
                <div class="stat-label">Working Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number warning">${data.emptyPages.length}</div>
                <div class="stat-label">Empty Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${data.brokenLinks.length}</div>
                <div class="stat-label">Broken Links</div>
            </div>
            <div class="stat-card">
                <div class="stat-number info">${data.deepestLevel}</div>
                <div class="stat-label">Max Menu Depth</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 Success Rate</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${data.successRate}%">
                    ${data.successRate}%
                </div>
            </div>
            <p style="color: #666; margin-top: 10px;">
                ${data.workingPages.length} working pages out of ${data.workingPages.length + data.emptyPages.length + data.brokenLinks.length} total navigations
            </p>
        </div>

        ${data.emptyPages.length > 0 ? `
        <div class="section">
            <h2>⚠️ Empty Pages Detected (${data.emptyPages.length})</h2>
            <p style="color: #666; margin-bottom: 20px;">These pages have no content or are under construction</p>
            ${data.emptyPages.map((page, index) => `
                <div class="issue-card empty-page">
                    <strong>${page.text}</strong><br>
                    <span style="color: #666;">URL:</span> ${page.url}<br>
                    <span style="color: #666;">Reason:</span> ${page.reason}<br>
                    <span style="color: #666;">Menu Level:</span> ${page.depth}
                    <div class="bug-actions">
                        <button class="btn btn-danger" onclick="confirmBug('empty-page', ${index})">
                            🐛 Create Bug
                        </button>
                        <button class="btn" onclick="investigateFurther('empty-page', ${index})">
                            🔍 Investigate
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${data.brokenLinks.length > 0 ? `
        <div class="section">
            <h2>💔 Broken Links (${data.brokenLinks.length})</h2>
            <p style="color: #666; margin-bottom: 20px;">These links failed to navigate properly</p>
            ${data.brokenLinks.map((link, index) => `
                <div class="issue-card">
                    <strong>${link.text}</strong><br>
                    <span style="color: #666;">HREF:</span> ${link.href}<br>
                    <span style="color: #666;">Error:</span> ${link.error}
                    <div class="bug-actions">
                        <button class="btn btn-danger" onclick="confirmBug('broken-link', ${index})">
                            🐛 Create Bug
                        </button>
                        <button class="btn" onclick="investigateFurther('broken-link', ${index})">
                            🔍 Investigate
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="section">
            <h2>✅ Working Pages (Top 20)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Menu Item</th>
                        <th>URL</th>
                        <th>Content Size</th>
                        <th>Menu Level</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.workingPages.slice(0, 20).map(page => `
                        <tr>
                            <td>${page.text}</td>
                            <td>${page.url}</td>
                            <td>${page.contentLength} chars</td>
                            <td>Level ${page.depth}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🎯 Recommendations</h2>
            ${data.recommendations.map(rec => `
                <div class="recommendation rec-${rec.priority.toLowerCase()}">
                    <span class="priority-badge badge-${rec.priority.toLowerCase()}">${rec.priority}</span>
                    <div>
                        <strong>${rec.issue}</strong><br>
                        ${rec.action}<br>
                        ${rec.count ? `<small>Count: ${rec.count}</small>` : ''}
                        ${rec.depth ? `<small>Depth: ${rec.depth}</small>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>📂 Menu Hierarchy</h2>
            <p style="color: #666; margin-bottom: 20px;">Discovered menu structure (${data.submenus.length} submenus)</p>
            <pre style="background: #f9fafb; padding: 15px; border-radius: 5px; overflow-x: auto;">
${data.submenus.map(submenu => `${'  '.repeat(submenu.depth)}└─ ${submenu.parent}`).join('\n')}
            </pre>
        </div>

        <div class="section">
            <h2>📋 Test Summary</h2>
            <table>
                <tr>
                    <td><strong>Test Date:</strong></td>
                    <td>${new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td><strong>Test Duration:</strong></td>
                    <td>~${Math.ceil(data.totalLinksTested * 3 / 60)} minutes</td>
                </tr>
                <tr>
                    <td><strong>Unique URLs Tested:</strong></td>
                    <td>${data.visitedUrls.length}</td>
                </tr>
                <tr>
                    <td><strong>Success Rate:</strong></td>
                    <td>${data.successRate}%</td>
                </tr>
                <tr>
                    <td><strong>Test Status:</strong></td>
                    <td>${data.successRate >= 80 ? '<span class="success">✅ PASSED</span>' : '<span class="error">❌ FAILED</span>'}</td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Bug Confirmation Modal -->
    <div id="confirmModal">
        <div class="modal-content">
            <div class="modal-header">🐛 Create Bug Confirmation</div>
            <div class="modal-body" id="modalBody">
                Are you sure you want to create a bug for this issue?
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="closeModal()">Cancel</button>
                <button class="btn btn-danger" onclick="createBug()">Create Bug</button>
            </div>
        </div>
    </div>

    <script>
        let currentIssue = null;

        function confirmBug(type, index) {
            const data = ${JSON.stringify(data)};
            let issue;
            
            if (type === 'empty-page') {
                issue = data.emptyPages[index];
                document.getElementById('modalBody').innerHTML = \`
                    <strong>Empty Page Issue</strong><br>
                    Menu Item: \${issue.text}<br>
                    URL: \${issue.url}<br>
                    Reason: \${issue.reason}<br><br>
                    Do you want to create a bug for this empty page?
                \`;
            } else if (type === 'broken-link') {
                issue = data.brokenLinks[index];
                document.getElementById('modalBody').innerHTML = \`
                    <strong>Broken Link Issue</strong><br>
                    Menu Item: \${issue.text}<br>
                    HREF: \${issue.href}<br>
                    Error: \${issue.error}<br><br>
                    Do you want to create a bug for this broken link?
                \`;
            }
            
            currentIssue = { type, index, issue };
            document.getElementById('confirmModal').classList.add('show');
        }

        function closeModal() {
            document.getElementById('confirmModal').classList.remove('show');
            currentIssue = null;
        }

        function createBug() {
            if (currentIssue) {
                console.log('Creating bug for:', currentIssue);
                alert(\`Bug created for \${currentIssue.type}: \${currentIssue.issue.text}\`);
                closeModal();
            }
        }

        function investigateFurther(type, index) {
            const data = ${JSON.stringify(data)};
            let issue = type === 'empty-page' ? data.emptyPages[index] : data.brokenLinks[index];
            console.log('Investigating:', issue);
            alert(\`Investigating \${type}: \${issue.text}\\nCheck console for details.\`);
        }

        // Animate progress bar on load
        window.addEventListener('load', () => {
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                setTimeout(() => {
                    progressFill.style.width = progressFill.style.width;
                }, 100);
            }
        });
    </script>
</body>
</html>`;
    
    fs.writeFileSync('deep-menu-navigation-report.html', html);
  }

  // Main test runner
  async runDeepNavigationTest() {
    const browser = await chromium.launch({ 
      headless: false,
      timeout: 120000 // 2 minutes timeout
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US'
    });
    
    const page = await context.newPage();
    
    console.log('🚀 STARTING DEEP MENU NAVIGATION TESTING');
    console.log('This will test EVERY menu, submenu, and sub-submenu');
    console.log('=' .repeat(80));
    
    try {
      // Navigate to homepage
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
      
      // Run comprehensive tests
      await this.testAllNavigationAreas(page);
      
    } catch (error) {
      console.error('\n❌ Fatal error during testing:', error);
      this.results.issues.push({
        type: 'FATAL',
        error: error.message
      });
    } finally {
      await browser.close();
      
      // Generate comprehensive report
      await this.generateComprehensiveReport();
      
      console.log('\n✅ DEEP MENU NAVIGATION TESTING COMPLETE!');
    }
  }
}

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the comprehensive test
const tester = new DeepMenuNavigationTester();
tester.runDeepNavigationTest().catch(console.error);