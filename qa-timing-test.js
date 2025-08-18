#!/usr/bin/env node

/**
 * QA Automation Timing Test
 * Measures execution time for each component
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const TARGET_URL = 'https://dev2.bankimonline.com';
const JIRA_URL = 'http://localhost:33367';

// Timing results
const timingResults = {
    startTime: new Date(),
    tests: []
};

function logTiming(testName, duration) {
    const result = {
        test: testName,
        duration: duration,
        durationFormatted: formatDuration(duration)
    };
    timingResults.tests.push(result);
    console.log(`⏱️  ${testName}: ${result.durationFormatted}`);
}

function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${Math.floor(ms / 60000)}m ${((ms % 60000) / 1000).toFixed(2)}s`;
}

async function testJavaScriptErrors(page) {
    const startTime = Date.now();
    const errors = [];
    
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    logTiming('JavaScript Error Check', Date.now() - startTime);
    return errors.length === 0;
}

async function testCoreWebVitals(page) {
    const startTime = Date.now();
    
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    
    const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0];
        return {
            FCP: perf?.loadEventEnd || 0,
            TTFB: perf?.responseStart || 0,
            resources: performance.getEntriesByType('resource').length
        };
    });
    
    logTiming('Core Web Vitals', Date.now() - startTime);
    return metrics;
}

async function testResponsiveDesign(page) {
    const startTime = Date.now();
    const viewports = [
        { name: 'Mobile', width: 390, height: 844 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);
    }
    
    logTiming('Responsive Design (3 viewports)', Date.now() - startTime);
    return true;
}

async function testAccessibility(page) {
    const startTime = Date.now();
    
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    
    const a11yChecks = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const imagesWithAlt = Array.from(images).filter(img => 
            img.alt || img.getAttribute('aria-label')
        );
        
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const lang = document.documentElement.lang;
        
        return {
            imagesWithAlt: `${imagesWithAlt.length}/${images.length}`,
            headingCount: headings.length,
            hasLang: !!lang
        };
    });
    
    logTiming('Accessibility Checks', Date.now() - startTime);
    return a11yChecks;
}

async function testFontLoading(page) {
    const startTime = Date.now();
    
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    
    const fonts = await page.evaluate(() => {
        const googleFonts = Array.from(document.querySelectorAll('link[href*="fonts.googleapis.com"]'));
        const computedFont = window.getComputedStyle(document.body).fontFamily;
        return {
            googleFontsCount: googleFonts.length,
            bodyFont: computedFont
        };
    });
    
    logTiming('Font Loading Check', Date.now() - startTime);
    return fonts;
}

async function testJIRAConnection() {
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${JIRA_URL}/api/health`);
        const isHealthy = response.ok;
        logTiming('JIRA Server Health Check', Date.now() - startTime);
        return isHealthy;
    } catch (error) {
        logTiming('JIRA Server Health Check (failed)', Date.now() - startTime);
        return false;
    }
}

async function runQuickTests() {
    console.log('🚀 QA AUTOMATION TIMING TEST');
    console.log('============================');
    console.log(`📍 Target: ${TARGET_URL}`);
    console.log(`🔗 JIRA: ${JIRA_URL}`);
    console.log(`🕐 Started: ${new Date().toLocaleString()}`);
    console.log('============================\n');
    
    const totalStartTime = Date.now();
    
    // Test JIRA first (no browser needed)
    console.log('📊 Testing JIRA Connection...');
    const jiraHealthy = await testJIRAConnection();
    console.log(`   Status: ${jiraHealthy ? '✅ Connected' : '❌ Not Available'}\n`);
    
    // Launch browser for web tests
    console.log('🌐 Launching Browser...');
    const browserStartTime = Date.now();
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        locale: 'he-IL',
        timezoneId: 'Asia/Jerusalem'
    });
    const page = await context.newPage();
    logTiming('Browser Launch', Date.now() - browserStartTime);
    console.log('');
    
    // Run tests
    console.log('🧪 Running Tests...\n');
    
    console.log('1️⃣ JavaScript Errors');
    await testJavaScriptErrors(page);
    console.log('');
    
    console.log('2️⃣ Core Web Vitals');
    const vitals = await testCoreWebVitals(page);
    console.log(`   Resources loaded: ${vitals.resources}`);
    console.log('');
    
    console.log('3️⃣ Responsive Design');
    await testResponsiveDesign(page);
    console.log('');
    
    console.log('4️⃣ Accessibility');
    const a11y = await testAccessibility(page);
    console.log(`   Images with alt: ${a11y.imagesWithAlt}`);
    console.log(`   Headings: ${a11y.headingCount}`);
    console.log('');
    
    console.log('5️⃣ Font Loading');
    const fonts = await testFontLoading(page);
    console.log(`   Google Fonts: ${fonts.googleFontsCount}`);
    console.log('');
    
    // Cleanup
    await browser.close();
    logTiming('Browser Cleanup', 100);
    
    const totalDuration = Date.now() - totalStartTime;
    
    // Generate report
    console.log('\n============================');
    console.log('📊 TIMING SUMMARY');
    console.log('============================');
    
    timingResults.tests.forEach(test => {
        console.log(`${test.test.padEnd(35, '.')} ${test.durationFormatted.padStart(10)}`);
    });
    
    console.log('----------------------------');
    console.log(`${'TOTAL EXECUTION TIME'.padEnd(35, '.')} ${formatDuration(totalDuration).padStart(10)}`);
    console.log('============================');
    
    // Save report
    const reportPath = path.join(__dirname, 'qa-timing-report.json');
    timingResults.endTime = new Date();
    timingResults.totalDuration = totalDuration;
    timingResults.totalDurationFormatted = formatDuration(totalDuration);
    
    await fs.writeFile(reportPath, JSON.stringify(timingResults, null, 2));
    console.log(`\n📁 Report saved to: ${reportPath}`);
    
    return timingResults;
}

// Run if executed directly
if (require.main === module) {
    runQuickTests()
        .then(() => {
            console.log('\n✅ Timing test completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Error during timing test:', error);
            process.exit(1);
        });
}

module.exports = { runQuickTests };