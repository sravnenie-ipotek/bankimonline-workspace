const { chromium } = require('playwright');
const fs = require('fs');

/**
 * HEBREW MENU NAVIGATION TEST - Advanced React Components
 * Tests the actual Hebrew menu items shown in the screenshots
 */

class HebrewMenuNavigationTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      emptyPages: [],
      workingPages: [],
      issues: []
    };
  }

  async logSuccess(section, test) {
    console.log(`✅ ${section}: ${test}`);
    this.results.passed++;
    this.results.totalTests++;
  }

  async logIssue(section, severity, description, screenshot = null) {
    console.log(`❌ ${section}: ${description}`);
    this.results.failed++;
    this.results.totalTests++;
    this.results.issues.push({
      section,
      severity,
      description,
      screenshot,
      timestamp: new Date().toISOString()
    });
  }

  async takeScreenshot(page, name) {
    const filename = `screenshots/hebrew-menu-${name}-${Date.now()}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    return filename;
  }

  // Test Hebrew Menu Navigation from Screenshots
  async testHebrewMenuItems(page) {
    console.log('\n🔍 TESTING HEBREW MENU NAVIGATION FROM SCREENSHOTS...\n');
    
    // Menu items from the screenshots (right side - חברה section)
    const companyMenuItems = [
      { text: 'השירותים שלנו', englishText: 'Our Services', expectedUrl: '/services' },
      { text: 'אודות', englishText: 'About', expectedUrl: '/about' },
      { text: 'זכיון זמני למתווכים', englishText: 'Temporary Franchise for Brokers', expectedUrl: '/temporary-franchise' },
      { text: 'משרות', englishText: 'Vacancies', expectedUrl: '/vacancies' },
      { text: 'צור קשר', englishText: 'Contact', expectedUrl: '/contacts' }
    ];

    // Business menu items (left side - עסקים section)
    const businessMenuItems = [
      { text: 'מוסדות פיננסיים שותפים', englishText: 'Partner Financial Institutions', expectedUrl: '/partner-institutions' },
      { text: 'תכנית שותפים', englishText: 'Partnership Program', expectedUrl: '/partnership-program' },
      { text: 'זיכיון למתווכים', englishText: 'Franchise for Brokers', expectedUrl: '/franchise-brokers' },
      { text: 'זיכיון למתווכי נדל"ן', englishText: 'Franchise for Real Estate Brokers', expectedUrl: '/real-estate-franchise' },
      { text: 'תכנית שותפים לעורכי דין', englishText: 'Partnership Program for Lawyers', expectedUrl: '/lawyers-partnership' }
    ];

    // Additional menu items from second screenshot
    const additionalMenuItems = [
      { text: 'בנק הפועלים', englishText: 'Bank Hapoalim', expectedUrl: '/bank-hapoalim' },
      { text: 'בנק דיסקונט', englishText: 'Bank Discount', expectedUrl: '/bank-discount' },
      { text: 'בנק לאומי', englishText: 'Bank Leumi', expectedUrl: '/bank-leumi' },
      { text: 'בנק בינלאומי', englishText: 'Bank International', expectedUrl: '/bank-international' },
      { text: 'בנק מרכנתיל דיסקונט', englishText: 'Bank Mercantile Discount', expectedUrl: '/bank-mercantile' },
      { text: 'בנק ירושלים', englishText: 'Bank Jerusalem', expectedUrl: '/bank-jerusalem' }
    ];

    // First, check if we need to open the menu
    console.log('🔄 Opening navigation menu...');
    
    // Try to find and click the hamburger menu
    const hamburgerSelectors = [
      '.burger',
      'button:has(span)',
      '[class*="burger"]',
      'button[aria-label*="menu"]',
      '[data-testid*="menu"]'
    ];

    let menuOpened = false;
    for (const selector of hamburgerSelectors) {
      const hamburger = await page.locator(selector).first();
      if (await hamburger.count() > 0) {
        await hamburger.click();
        await page.waitForTimeout(1000); // Wait for animation
        console.log('✅ Menu opened successfully');
        menuOpened = true;
        break;
      }
    }

    if (!menuOpened) {
      console.log('⚠️ Could not find hamburger menu - testing direct navigation');
    }

    // Test Company Menu Items (חברה)
    console.log('\n📋 Testing Company Menu Items (חברה)...\n');
    for (const item of companyMenuItems) {
      await this.testMenuItem(page, item);
    }

    // Test Business Menu Items (עסקים)
    console.log('\n💼 Testing Business Menu Items (עסקים)...\n');
    for (const item of businessMenuItems) {
      await this.testMenuItem(page, item);
    }

    // Test Bank Menu Items
    console.log('\n🏦 Testing Bank Menu Items...\n');
    for (const item of additionalMenuItems) {
      await this.testMenuItem(page, item);
    }
  }

  async testMenuItem(page, item) {
    console.log(`\nTesting: ${item.text} (${item.englishText})`);
    
    try {
      // Try multiple selectors for the menu item
      const selectors = [
        `text="${item.text}"`,
        `a:has-text("${item.text}")`,
        `[href="${item.expectedUrl}"]`,
        `button:has-text("${item.text}")`,
        `div:has-text("${item.text}")`,
        `span:has-text("${item.text}")`
      ];

      let linkFound = false;
      let element = null;

      for (const selector of selectors) {
        try {
          element = await page.locator(selector).first();
          if (await element.count() > 0) {
            linkFound = true;
            console.log(`  ✅ Found menu item with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!linkFound) {
        await this.logIssue(
          'Menu Navigation',
          'warning',
          `Menu item not found: ${item.text} (${item.englishText})`,
          await this.takeScreenshot(page, `missing-${item.englishText.replace(/\s+/g, '-')}`)
        );
        return;
      }

      // Try to click the menu item
      const currentUrl = page.url();
      
      try {
        await element.click();
        await page.waitForTimeout(2000); // Wait for navigation
        
        const newUrl = page.url();
        
        // Check if navigation happened
        if (newUrl !== currentUrl) {
          console.log(`  ✅ Navigation successful to: ${newUrl}`);
          
          // Check if page has content (not empty)
          const pageContent = await page.locator('body').textContent();
          const hasContent = pageContent && pageContent.trim().length > 100;
          
          // Check for common empty page indicators
          const emptyPageIndicators = [
            await page.locator('text="404"').count() > 0,
            await page.locator('text="Page not found"').count() > 0,
            await page.locator('text="דף לא נמצא"').count() > 0,
            await page.locator('text="Coming soon"').count() > 0,
            await page.locator('text="בקרוב"').count() > 0,
            !hasContent
          ];
          
          const isEmptyPage = emptyPageIndicators.some(indicator => indicator === true);
          
          if (isEmptyPage) {
            console.log(`  ⚠️ WARNING: Page appears to be empty or under construction`);
            this.results.emptyPages.push({
              text: item.text,
              englishText: item.englishText,
              url: newUrl,
              expectedUrl: item.expectedUrl
            });
            
            await this.logIssue(
              'Empty Page',
              'high',
              `Empty page detected: ${item.text} (${item.englishText}) - URL: ${newUrl}`,
              await this.takeScreenshot(page, `empty-page-${item.englishText.replace(/\s+/g, '-')}`)
            );
          } else {
            console.log(`  ✅ Page has content`);
            this.results.workingPages.push({
              text: item.text,
              englishText: item.englishText,
              url: newUrl
            });
            await this.logSuccess('Menu Navigation', `${item.text} - Page loads with content`);
          }
          
          // Navigate back
          await page.goBack();
          await page.waitForTimeout(1000);
          
          // Reopen menu if needed
          const hamburger = await page.locator('.burger, button:has(span)').first();
          if (await hamburger.count() > 0 && await hamburger.isVisible()) {
            await hamburger.click();
            await page.waitForTimeout(500);
          }
          
        } else {
          console.log(`  ⚠️ No navigation occurred - might be JavaScript handled`);
        }
        
      } catch (clickError) {
        console.log(`  ❌ Error clicking menu item: ${clickError.message}`);
        await this.logIssue(
          'Menu Navigation',
          'error',
          `Cannot click menu item: ${item.text} - ${clickError.message}`,
          await this.takeScreenshot(page, `click-error-${item.englishText.replace(/\s+/g, '-')}`)
        );
      }
      
    } catch (error) {
      console.log(`  ❌ Error testing menu item: ${error.message}`);
      await this.logIssue(
        'Menu Navigation',
        'error',
        `Error testing ${item.text}: ${error.message}`,
        await this.takeScreenshot(page, `error-${item.englishText.replace(/\s+/g, '-')}`)
      );
    }
  }

  // Generate detailed report
  async generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 HEBREW MENU NAVIGATION TEST REPORT');
    console.log('='.repeat(70));
    console.log(`⏱️  Timestamp: ${this.results.timestamp}`);
    console.log(`📝 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${this.results.totalTests > 0 ? Math.round((this.results.passed / this.results.totalTests) * 100) : 0}%`);
    
    // Report empty pages
    if (this.results.emptyPages.length > 0) {
      console.log('\n⚠️  EMPTY PAGES DETECTED:');
      console.log('='.repeat(70));
      for (const page of this.results.emptyPages) {
        console.log(`\n📍 ${page.text} (${page.englishText})`);
        console.log(`   URL: ${page.url}`);
        console.log(`   Expected: ${page.expectedUrl}`);
        console.log(`   Status: EMPTY/UNDER CONSTRUCTION`);
      }
    }
    
    // Report working pages
    if (this.results.workingPages.length > 0) {
      console.log('\n✅ WORKING PAGES:');
      console.log('='.repeat(70));
      for (const page of this.results.workingPages) {
        console.log(`✅ ${page.text} (${page.englishText}) - ${page.url}`);
      }
    }
    
    // Report issues
    if (this.results.issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      console.log('='.repeat(70));
      for (const issue of this.results.issues) {
        console.log(`\n📍 ${issue.section}`);
        console.log(`   Severity: ${issue.severity}`);
        console.log(`   Description: ${issue.description}`);
        if (issue.screenshot) {
          console.log(`   Screenshot: ${issue.screenshot}`);
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📋 SUMMARY:');
    console.log(`- Total Menu Items Tested: ${this.results.totalTests}`);
    console.log(`- Working Pages: ${this.results.workingPages.length}`);
    console.log(`- Empty Pages: ${this.results.emptyPages.length}`);
    console.log(`- Navigation Issues: ${this.results.issues.filter(i => i.section === 'Menu Navigation').length}`);
    
    // Recommendations
    if (this.results.emptyPages.length > 0) {
      console.log('\n🎯 RECOMMENDATIONS:');
      console.log('1. Complete implementation of empty pages');
      console.log('2. Add "Coming Soon" or placeholder content');
      console.log('3. Consider hiding menu items for unimplemented pages');
      console.log('4. Implement proper 404 handling');
    }
    
    console.log('='.repeat(70));
  }

  // Main test runner
  async runAllTests() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      locale: 'he-IL',
      timezoneId: 'Asia/Jerusalem'
    });
    const page = await context.newPage();
    
    console.log('🚀 STARTING HEBREW MENU NAVIGATION TESTING');
    console.log('Testing menu items from provided screenshots\n');
    console.log('=' .repeat(70));
    
    try {
      // Navigate to homepage
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      
      // Wait a bit for any dynamic content
      await page.waitForTimeout(2000);
      
      // Run Hebrew menu tests
      await this.testHebrewMenuItems(page);
      
    } catch (error) {
      console.error('\n❌ Fatal error during testing:', error);
      await this.takeScreenshot(page, 'fatal-error');
    } finally {
      await browser.close();
      
      // Generate report
      await this.generateReport();
      
      // Save report to file
      const reportData = {
        ...this.results,
        recommendation: this.results.emptyPages.length > 0 ? 
          'Multiple empty pages detected. Implement content or hide menu items.' : 
          'All tested pages have content.'
      };
      
      fs.writeFileSync(
        'hebrew-menu-test-report.json',
        JSON.stringify(reportData, null, 2)
      );
      
      console.log('\n📊 Report saved to hebrew-menu-test-report.json');
      console.log('✅ HEBREW MENU NAVIGATION TESTING COMPLETE!');
    }
  }
}

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the tests
const tester = new HebrewMenuNavigationTester();
tester.runAllTests().catch(console.error);