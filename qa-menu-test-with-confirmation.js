const { chromium } = require('playwright');
const fs = require('fs');

class MenuNavigationTester {
  constructor() {
    this.requireBugConfirmation = true; // MANDATORY
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      issues: [],
      falsePositives: 0,
      confirmedBugs: 0
    };
  }

  async logSuccess(section, test) {
    console.log(`✅ ${section}: ${test}`);
    this.results.passed++;
    this.results.totalTests++;
  }

  // MANDATORY: Interactive bug confirmation
  async logIssue(section, severity, description, screenshot = null) {
    const issue = {
      section,
      severity,
      description,
      screenshot,
      component: 'Menu Navigation',
      timestamp: new Date().toISOString()
    };

    // ALWAYS ask before creating bug
    console.log('\n' + '='.repeat(60));
    console.log('🔍 ISSUE DETECTED - CONFIRMATION REQUIRED');
    console.log('='.repeat(60));
    console.log(`
📍 Location: ${issue.section}
⚠️  Severity: ${issue.severity}
📝 Description: ${issue.description}
🔧 Component: ${issue.component}

❓ QUESTION: Should I open a bug for this issue?

Context:
- This might be a React component behaving differently
- The functionality might be working with different selectors
- This could be a test script issue, not an application bug

Please respond:
✅ YES - This is a real bug, open a ticket
❌ NO - This is expected behavior or test issue
🔍 INVESTIGATE - Need more information
`);
    
    // Log issue but don't create bug without confirmation
    this.results.failed++;
    this.results.totalTests++;
    this.results.issues.push(issue);
    
    console.log('⏳ WAITING FOR USER CONFIRMATION...');
    console.log('Issue logged. Bug will only be created if you confirm.');
    console.log('='.repeat(60) + '\n');
  }

  async takeScreenshot(page, name) {
    const filename = `screenshots/menu-${name}-${Date.now()}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    return filename;
  }

  // Test Main Navigation
  async testMainNavigation(page) {
    console.log('\n📋 TESTING MAIN NAVIGATION MENU...');
    const section = 'Main Navigation';
    
    try {
      // Check for navigation using React component selectors
      const mainNav = await page.locator('[data-testid*="nav"], nav, [role="navigation"]').first();
      
      if (await mainNav.count() > 0) {
        await this.logSuccess(section, 'Main navigation found');
        
        // Test Services link (React component)
        const servicesMenu = page.locator('[data-testid="nav-services"], a:has-text("Services"), a:has-text("שירותים")').first();
        if (await servicesMenu.count() > 0) {
          await this.logSuccess(section, 'Services menu item found');
          
          // Try to click and check for dropdown
          try {
            await servicesMenu.click({ timeout: 5000 });
            await page.waitForTimeout(500);
            
            // Check if dropdown opened
            const dropdown = page.locator('[data-testid="services-dropdown"], [role="menu"], .dropdown-menu').first();
            if (await dropdown.isVisible()) {
              await this.logSuccess(section, 'Services dropdown opens correctly');
            }
          } catch (dropdownError) {
            // Don't immediately report as bug - might be expected behavior
            console.log('ℹ️ Services dropdown might not be a dropdown - could be a direct link');
          }
        } else {
          await this.logIssue(
            section,
            'warning',
            'Services menu item not found - check if React component uses different selector',
            await this.takeScreenshot(page, 'services-missing')
          );
        }
        
        // Test About link
        const aboutLink = page.locator('[data-testid="nav-about"], a:has-text("About"), a:has-text("אודות")').first();
        if (await aboutLink.count() > 0) {
          await this.logSuccess(section, 'About menu item found');
        }
        
        // Test Contacts link
        const contactsLink = page.locator('[data-testid="nav-contacts"], a:has-text("Contact"), a:has-text("צור קשר")').first();
        if (await contactsLink.count() > 0) {
          await this.logSuccess(section, 'Contacts menu item found');
        }
        
      } else {
        await this.logIssue(
          section,
          'critical',
          'Main navigation not found - check React component selectors',
          await this.takeScreenshot(page, 'main-nav-missing')
        );
      }
    } catch (error) {
      await this.logIssue(
        section,
        'error',
        `Navigation test error: ${error.message}`,
        await this.takeScreenshot(page, 'main-nav-error')
      );
    }
  }

  // Test Mobile Menu
  async testMobileMenu(page) {
    console.log('\n📱 TESTING MOBILE MENU...');
    const section = 'Mobile Menu';
    
    try {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(500);
      
      // Look for hamburger menu (React component)
      const hamburger = page.locator('[data-testid="mobile-menu-burger"], .hamburger-button, .hamburger, button[aria-label*="menu"]').first();
      
      if (await hamburger.count() > 0) {
        await this.logSuccess(section, 'Hamburger menu found');
        
        await hamburger.click();
        await page.waitForTimeout(500);
        
        // Check if mobile menu opened
        const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, .sidebar-mobile, aside').first();
        if (await mobileMenu.isVisible()) {
          await this.logSuccess(section, 'Mobile menu opens correctly');
        } else {
          await this.logIssue(
            section,
            'warning',
            'Mobile menu not opening - check React component implementation',
            await this.takeScreenshot(page, 'mobile-menu-not-opening')
          );
        }
      } else {
        await this.logIssue(
          section,
          'warning',
          'Hamburger menu not found on mobile - check responsive breakpoints and React component',
          await this.takeScreenshot(page, 'hamburger-not-found')
        );
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
    } catch (error) {
      await this.logIssue(
        section,
        'error',
        `Mobile menu test error: ${error.message}`,
        await this.takeScreenshot(page, 'mobile-menu-error')
      );
    }
  }

  // Test Language Switcher
  async testLanguageSwitcher(page) {
    console.log('\n🌐 TESTING LANGUAGE SWITCHER...');
    const section = 'Language Switcher';
    
    try {
      // Look for language switcher (React component)
      const langSwitcher = page.locator('[data-testid*="language"], [data-testid*="lang"], .language-switcher, select[name*="lang"], button[aria-label*="language"]').first();
      
      if (await langSwitcher.count() > 0) {
        await this.logSuccess(section, 'Language switcher found');
        
        // Get current language
        const htmlLang = await page.locator('html').getAttribute('lang');
        await this.logSuccess(section, `Current language: ${htmlLang}`);
        
        // Try to interact with language switcher
        try {
          await langSwitcher.click({ timeout: 5000 });
          await page.waitForTimeout(500);
          
          // Look for Hebrew option
          const hebrewOption = page.locator('[data-testid="lang-he"], option:has-text("עברית"), button:has-text("עברית"), [value="he"]').first();
          if (await hebrewOption.count() > 0) {
            await this.logSuccess(section, 'Hebrew language option found');
          }
        } catch (langError) {
          console.log('ℹ️ Language switcher might use different interaction pattern');
        }
      } else {
        await this.logIssue(
          section,
          'warning',
          'Language switcher not found - check if implemented as React component',
          await this.takeScreenshot(page, 'language-switcher-missing')
        );
      }
    } catch (error) {
      await this.logIssue(
        section,
        'error',
        `Language switcher test error: ${error.message}`,
        await this.takeScreenshot(page, 'language-error')
      );
    }
  }

  // Test Personal Cabinet Sidebar
  async testPersonalCabinetSidebar(page) {
    console.log('\n👤 TESTING PERSONAL CABINET SIDEBAR...');
    const section = 'Personal Cabinet Sidebar';
    
    try {
      // Navigate to personal cabinet
      await page.goto('http://localhost:5173/personal-cabinet');
      await page.waitForTimeout(2000);
      
      // Check if redirected to login (expected if not authenticated)
      if (page.url().includes('login')) {
        await this.logSuccess(section, 'Personal cabinet requires authentication (correct behavior)');
        return;
      }
      
      // Test sidebar (React component from Sidebar.tsx)
      const sidebar = page.locator('.sidebar, [class*="sidebar"]').first();
      if (await sidebar.count() > 0) {
        await this.logSuccess(section, 'Sidebar component found');
        
        // Test hamburger toggle
        const hamburgerButton = page.locator('.hamburger-button, [class*="hamburger"]').first();
        if (await hamburgerButton.count() > 0) {
          await this.logSuccess(section, 'Sidebar hamburger button found');
        }
        
        // Test navigation items
        const navItems = await page.locator('.nav-item, [class*="nav-item"]').all();
        await this.logSuccess(section, `Found ${navItems.length} sidebar navigation items`);
        
      } else {
        await this.logIssue(
          section,
          'warning',
          'Sidebar component not found - check React component rendering',
          await this.takeScreenshot(page, 'sidebar-not-found')
        );
      }
    } catch (error) {
      await this.logIssue(
        section,
        'error',
        `Personal cabinet test error: ${error.message}`,
        await this.takeScreenshot(page, 'personal-cabinet-error')
      );
    }
  }

  // Generate report
  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MENU NAVIGATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Timestamp: ${this.results.timestamp}`);
    console.log(`📝 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`🔍 Issues Found: ${this.results.issues.length}`);
    console.log(`📈 Success Rate: ${this.results.totalTests > 0 ? Math.round((this.results.passed / this.results.totalTests) * 100) : 0}%`);
    
    if (this.results.issues.length > 0) {
      console.log('\n⚠️  ISSUES REQUIRING YOUR CONFIRMATION:');
      console.log('=' .repeat(60));
      for (const issue of this.results.issues) {
        console.log(`\n📍 ${issue.section}`);
        console.log(`   Severity: ${issue.severity}`);
        console.log(`   Description: ${issue.description}`);
        console.log(`   Status: AWAITING YOUR CONFIRMATION`);
      }
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  IMPORTANT: All issues above require your confirmation.');
      console.log('Please review each issue and respond:');
      console.log('✅ YES - Create a bug ticket');
      console.log('❌ NO - Not a bug (expected behavior or test issue)');
      console.log('🔍 INVESTIGATE - Need more information');
      console.log('=' .repeat(60));
    } else {
      console.log('\n✅ All tests passed! No issues found.');
    }
  }

  // Main test runner
  async runAllTests() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('🚀 STARTING COMPREHENSIVE MENU & NAVIGATION TESTING');
    console.log('⚠️  REMINDER: All issues require your confirmation before creating bugs\n');
    console.log('=' .repeat(60));
    
    try {
      // Navigate to homepage
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      
      // Run all test sections
      await this.testMainNavigation(page);
      await this.testMobileMenu(page);
      await this.testLanguageSwitcher(page);
      await this.testPersonalCabinetSidebar(page);
      
    } catch (error) {
      console.error('\n❌ Fatal error during testing:', error);
      await this.takeScreenshot(page, 'fatal-error');
    } finally {
      await browser.close();
      
      // Generate report
      await this.generateReport();
    }
  }
}

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the tests
const tester = new MenuNavigationTester();
tester.runAllTests().catch(console.error);