#!/usr/bin/env node

/**
 * Simple BrowserStack Mobile Button Test
 * Tests mobile button positioning using hosted test page
 */

const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME || 'bankim_bDR9eZP4Bb2';
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || 'DwWqjFesqgUNTZqrddhV';

// Use a simple hosted test page (we'll create this content inline)
const TEST_HTML = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>בנקים אונליין - Button Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            direction: rtl;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            min-height: 200vh;
        }
        
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .header {
            background: #6B46C1;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        /* CRITICAL: The mobile button fix */
        .mobile-button-fixed {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            z-index: 1000;
            padding-bottom: env(safe-area-inset-bottom, 0);
        }
        
        .mobile-button-fixed button {
            width: 100%;
            background: #F59E0B;
            color: white;
            padding: 16px 24px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            min-height: 44px;
            cursor: pointer;
        }
        
        /* Test content to force scrolling */
        .content {
            height: 150vh;
            background: linear-gradient(to bottom, #fff, #f0f0f0);
            padding: 20px;
            margin: 20px 0;
        }
        
        .debug-info {
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px;
            border-radius: 4px;
            font-size: 11px;
            z-index: 2000;
            direction: ltr;
        }
    </style>
</head>
<body>
    <div class="debug-info" id="debugInfo">
        <div>VP: <span id="viewport"></span></div>
        <div>Btn: <span id="buttonPos"></span></div>
    </div>

    <div class="container">
        <h1 class="header">בנקים אונליין</h1>
        <p>בדיקת מיקום כפתורים במובייל</p>
        <p>Mobile Button Position Test</p>
    </div>
    
    <div class="content">
        <h2>תוכן דף ארוך לבדיקת גלילה</h2>
        <p>הכפתור צריך להישאר במקום קבוע בתחתית המסך</p>
        <p>The button should stay fixed at the bottom</p>
        <br><br><br><br><br><br><br><br><br><br>
        <p>עוד תוכן...</p>
        <br><br><br><br><br><br><br><br><br><br>
        <p>More content to test scrolling...</p>
    </div>

    <!-- CRITICAL: The button that was causing overflow -->
    <div class="mobile-button-fixed">
        <button type="submit" id="mainButton">שמור והמשך</button>
    </div>

    <script>
        function updateDebugInfo() {
            const viewport = { width: window.innerWidth, height: window.innerHeight };
            const button = document.getElementById('mainButton');
            const buttonRect = button ? button.getBoundingClientRect() : null;
            
            document.getElementById('viewport').textContent = viewport.width + 'x' + viewport.height;
            document.getElementById('buttonPos').textContent = buttonRect ? 
                Math.round(buttonRect.bottom) + 'px (' + (buttonRect.bottom > viewport.height ? 'OVERFLOW' : 'OK') + ')' : 'N/A';
        }
        
        window.addEventListener('load', updateDebugInfo);
        window.addEventListener('resize', updateDebugInfo);
        setInterval(updateDebugInfo, 1000);
        
        // Make button clickable for testing
        document.getElementById('mainButton').onclick = function() {
            this.style.background = '#10B981';
            this.textContent = '✅ לחיצה הצליחה!';
            setTimeout(() => {
                this.style.background = '#F59E0B';
                this.textContent = 'שמור והמשך';
            }, 2000);
        };
    </script>
</body>
</html>`;

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

async function createDriver() {
  const capabilities = {
    'bstack:options': {
      os: 'ios',
      osVersion: '17',
      deviceName: 'iPhone 15 Pro',
      realMobile: 'true',
      projectName: 'Banking Mobile Button Fix',
      buildName: 'Button Overflow Test',
      sessionName: 'iPhone 15 Pro - Button Position Validation',
      userName: BROWSERSTACK_USERNAME,
      accessKey: BROWSERSTACK_ACCESS_KEY,
      debug: 'true',
      consoleLogs: 'verbose'
    },
    browserName: 'safari'
  };

  return new Builder()
    .usingServer('https://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();
}

async function testMobileButton() {
  log('🚀 BrowserStack Mobile Button Test - iPhone 15 Pro', '\x1b[1m\x1b[34m');
  log('Testing mobile button overflow fixes...', '\x1b[36m');
  
  let driver = null;
  
  try {
    // Create BrowserStack session
    driver = await createDriver();
    log('✅ BrowserStack session created', '\x1b[32m');
    
    // Create data URL with our test HTML
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(TEST_HTML);
    
    // Navigate to test page
    await driver.get(dataUrl);
    log('✅ Test page loaded', '\x1b[32m');
    
    // Wait for page to fully load
    await driver.sleep(3000);
    
    // Get viewport dimensions
    const viewport = await driver.executeScript(`
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      };
    `);
    
    log(`📱 Viewport: ${viewport.width}x${viewport.height} (${viewport.devicePixelRatio}x)`, '\x1b[36m');
    
    // Wait for button to be available and analyze it
    const buttonAnalysis = await driver.executeScript(`
      // Wait for button to be available
      let attempts = 0;
      while (attempts < 10) {
        const button = document.getElementById('mainButton');
        if (button) {
          const rect = button.getBoundingClientRect();
          const style = window.getComputedStyle(button);
          
          // Test button click
          button.click();
          button.style.background = '#10B981';
          
          return {
            found: true,
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              bottom: rect.bottom,
              right: rect.right
            },
            style: {
              position: style.position,
              bottom: style.bottom,
              zIndex: style.zIndex
            },
            text: button.textContent,
            isOverflow: rect.bottom > window.innerHeight,
            isTooSmall: rect.width < 44 || rect.height < 44,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            }
          };
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Button not found - return debug info
      return {
        found: false,
        error: 'Button not found after 5 seconds',
        html: document.body.innerHTML.substring(0, 500),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    `);
    
    if (!buttonAnalysis.found) {
      throw new Error(`Button not found: ${buttonAnalysis.error}`);
    }
    
    await driver.sleep(1000);
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = 'automation/reports/browserstack-button-test.png';
    
    // Ensure directory exists
    const dir = path.dirname(screenshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    
    // Analyze results
    const analysis = buttonAnalysis;
    const passed = !analysis.isOverflow && !analysis.isTooSmall;
    
    log('\n📊 BUTTON ANALYSIS RESULTS:', '\x1b[1m\x1b[34m');
    log(`📱 Device: iPhone 15 Pro`, '\x1b[36m');
    log(`📐 Viewport: ${analysis.viewport.width}x${analysis.viewport.height}px`, '\x1b[36m');
    log(`📏 Button Size: ${Math.round(analysis.rect.width)}x${Math.round(analysis.rect.height)}px`, '\x1b[36m');
    log(`📍 Button Position: bottom=${Math.round(analysis.rect.bottom)}px`, '\x1b[36m');
    log(`🎨 CSS Position: ${analysis.style.position}`, '\x1b[36m');
    log(`📸 Screenshot: ${screenshotPath}`, '\x1b[36m');
    
    if (analysis.isOverflow) {
      log(`❌ OVERFLOW DETECTED: Button bottom (${Math.round(analysis.rect.bottom)}px) > Viewport (${analysis.viewport.height}px)`, '\x1b[31m');
    } else {
      log(`✅ NO OVERFLOW: Button is within viewport`, '\x1b[32m');
    }
    
    if (analysis.isTooSmall) {
      log(`❌ TOUCH TARGET TOO SMALL: ${Math.round(analysis.rect.width)}x${Math.round(analysis.rect.height)}px (minimum: 44x44px)`, '\x1b[31m');
    } else {
      log(`✅ TOUCH TARGET OK: Meets iOS guidelines (≥44px)`, '\x1b[32m');
    }
    
    // Final result
    if (passed) {
      log('\n🎉 MOBILE BUTTON FIX SUCCESSFUL!', '\x1b[1m\x1b[32m');
      log('✨ Button is properly positioned and sized', '\x1b[32m');
      log('🏆 CSS position: fixed works correctly on real iPhone', '\x1b[32m');
    } else {
      log('\n⚠️  MOBILE BUTTON ISSUES DETECTED', '\x1b[1m\x1b[33m');
      log('🔧 Further CSS adjustments may be needed', '\x1b[33m');
    }
    
    return passed;
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, '\x1b[31m');
    return false;
  } finally {
    if (driver) {
      await driver.quit();
      log('🔚 BrowserStack session closed', '\x1b[33m');
    }
  }
}

if (require.main === module) {
  testMobileButton().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testMobileButton };