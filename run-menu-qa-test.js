#!/usr/bin/env node

/**
 * Menu Navigation QA Test Runner
 * Based on: /Users/michaelmishayev/Projects/bankDev2_standalone/server/docs/QA/menuQA/instructions.md
 * 
 * Runs comprehensive menu navigation testing as specified in the QA instructions
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 MENU NAVIGATION QA TEST RUNNER');
console.log('📋 Based on: server/docs/QA/menuQA/instructions.md');
console.log('🔍 Running comprehensive menu and navigation testing\n');

// Test configuration
const config = {
    baseUrl: 'http://localhost:5173',
    testSpec: 'cypress/e2e/menu-navigation-comprehensive.cy.ts',
    browser: 'chrome',
    timeout: 180000, // 3 minutes
    workingDir: './mainapp'
};

console.log('📊 Test Configuration:');
console.log(`  Base URL: ${config.baseUrl}`);
console.log(`  Test Spec: ${config.testSpec}`);
console.log(`  Browser: ${config.browser}`);
console.log(`  Working Directory: ${config.workingDir}`);
console.log(`  Timeout: ${config.timeout/1000}s\n`);

// Check if application is running
async function checkApplicationStatus() {
    console.log('🔍 Checking application status...');
    
    try {
        const fetch = require('node-fetch').default || require('node-fetch');
        const response = await fetch(config.baseUrl, { timeout: 5000 });
        
        if (response.ok) {
            console.log('✅ Application is running and accessible');
            console.log(`   Status: ${response.status}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);
            return true;
        } else {
            console.log('❌ Application returned error status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Application is not accessible:', error.message);
        console.log('💡 Make sure the development server is running on port 5173');
        console.log('   Try: npm run dev');
        return false;
    }
}

// Run the Cypress test
async function runMenuNavigationTest() {
    return new Promise((resolve, reject) => {
        console.log('🚀 Starting Cypress menu navigation test...\n');
        
        const cypressArgs = [
            'run',
            '--spec', config.testSpec,
            '--browser', config.browser,
            '--headless',
            '--record', 'false'
        ];
        
        const cypressProcess = spawn('npx', ['cypress', ...cypressArgs], {
            cwd: config.workingDir,
            env: {
                ...process.env,
                CYPRESS_BASE_URL: config.baseUrl
            },
            stdio: 'pipe'
        });
        
        let output = '';
        let errorOutput = '';
        
        cypressProcess.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            process.stdout.write(text);
        });
        
        cypressProcess.stderr.on('data', (data) => {
            const text = data.toString();
            errorOutput += text;
            process.stderr.write(text);
        });
        
        cypressProcess.on('close', (code) => {
            console.log(`\n📊 Cypress test completed with exit code: ${code}`);
            
            const results = {
                exitCode: code,
                output: output,
                errorOutput: errorOutput,
                timestamp: new Date().toISOString()
            };
            
            resolve(results);
        });
        
        cypressProcess.on('error', (error) => {
            console.error('❌ Failed to start Cypress:', error.message);
            reject(error);
        });
        
        // Set timeout
        setTimeout(() => {
            cypressProcess.kill('SIGTERM');
            console.log('\n⏰ Test timed out - terminating process');
            resolve({
                exitCode: 1,
                output: output,
                errorOutput: errorOutput + '\nTest timed out after ' + (config.timeout/1000) + ' seconds',
                timestamp: new Date().toISOString(),
                timedOut: true
            });
        }, config.timeout);
    });
}

// Analyze test results
function analyzeResults(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 MENU NAVIGATION QA TEST ANALYSIS');
    console.log('='.repeat(80));
    
    const { exitCode, output, errorOutput, timedOut } = results;
    
    // Basic status
    console.log('\n📈 BASIC STATUS:');
    console.log(`  Exit Code: ${exitCode}`);
    console.log(`  Timed Out: ${timedOut ? 'Yes' : 'No'}`);
    console.log(`  Test Duration: ${timedOut ? 'Max timeout reached' : 'Completed normally'}`);
    
    // Extract test statistics from output
    const testStats = extractTestStatistics(output);
    
    console.log('\n📊 TEST STATISTICS:');
    console.log(`  Tests Run: ${testStats.total || 'Unknown'}`);
    console.log(`  Passed: ${testStats.passed || 0}`);
    console.log(`  Failed: ${testStats.failed || 0}`);
    console.log(`  Skipped: ${testStats.skipped || 0}`);
    
    // Extract screenshots and videos
    const evidence = extractEvidence(output);
    
    console.log('\n📸 EVIDENCE COLLECTED:');
    console.log(`  Screenshots: ${evidence.screenshots.length}`);
    console.log(`  Videos: ${evidence.videos.length}`);
    
    if (evidence.screenshots.length > 0) {
        console.log('\n  Screenshot files:');
        evidence.screenshots.forEach(screenshot => {
            console.log(`    📷 ${screenshot}`);
        });
    }
    
    if (evidence.videos.length > 0) {
        console.log('\n  Video files:');
        evidence.videos.forEach(video => {
            console.log(`    🎬 ${video}`);
        });
    }
    
    // Analyze failures
    const failures = extractFailures(output, errorOutput);
    
    if (failures.length > 0) {
        console.log('\n❌ FAILURES DETECTED:');
        failures.forEach((failure, index) => {
            console.log(`\n  ${index + 1}. ${failure.test}`);
            console.log(`     Error: ${failure.error}`);
            if (failure.screenshot) {
                console.log(`     Screenshot: ${failure.screenshot}`);
            }
        });
        
        console.log('\n🔍 POTENTIAL ISSUES FOUND:');
        analyzePotentialIssues(failures);
    } else {
        console.log('\n✅ NO FAILURES DETECTED');
    }
    
    // Generate recommendations
    generateRecommendations(results, testStats, failures);
    
    // Save detailed report
    saveDetailedReport(results, testStats, evidence, failures);
    
    return {
        status: exitCode === 0 ? 'PASSED' : 'FAILED',
        testStats,
        evidence,
        failures,
        timedOut
    };
}

// Extract test statistics from Cypress output
function extractTestStatistics(output) {
    const stats = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
    };
    
    // Look for Cypress summary
    const summaryMatch = output.match(/(\d+)\s+passing/);
    if (summaryMatch) {
        stats.passed = parseInt(summaryMatch[1]);
    }
    
    const failingMatch = output.match(/(\d+)\s+failing/);
    if (failingMatch) {
        stats.failed = parseInt(failingMatch[1]);
    }
    
    const pendingMatch = output.match(/(\d+)\s+pending/);
    if (pendingMatch) {
        stats.skipped = parseInt(pendingMatch[1]);
    }
    
    stats.total = stats.passed + stats.failed + stats.skipped;
    
    return stats;
}

// Extract screenshot and video evidence
function extractEvidence(output) {
    const evidence = {
        screenshots: [],
        videos: []
    };
    
    // Extract screenshot paths
    const screenshotMatches = output.match(/Screenshots:\s+(\d+)/);
    if (screenshotMatches) {
        // Look for specific screenshot files in output
        const screenshotPaths = output.match(/screenshot.*\.png/g) || [];
        evidence.screenshots = screenshotPaths;
    }
    
    // Extract video paths
    const videoMatches = output.match(/Video output:.*\.mp4/g) || [];
    evidence.videos = videoMatches.map(match => {
        return match.replace('Video output: ', '').trim();
    });
    
    return evidence;
}

// Extract failure information
function extractFailures(output, errorOutput) {
    const failures = [];
    
    // Look for test failures in output
    const failurePattern = /(\d+)\)\s+(.+?):\s*(.+?)(?=\n\s*at|\n\n|\n\s*$)/gs;
    const matches = output.matchAll(failurePattern);
    
    for (const match of matches) {
        const [, number, testName, error] = match;
        failures.push({
            number: parseInt(number),
            test: testName.trim(),
            error: error.trim().replace(/\n\s+/g, ' '),
            screenshot: null // Will be filled if screenshot exists
        });
    }
    
    return failures;
}

// Analyze potential issues based on failure patterns
function analyzePotentialIssues(failures) {
    const issues = [];
    
    failures.forEach(failure => {
        const error = failure.error.toLowerCase();
        
        if (error.includes('element not found') || error.includes('not exist')) {
            issues.push('🔍 Element selector issues - menu items may have changed selectors');
        }
        
        if (error.includes('timeout') || error.includes('timed out')) {
            issues.push('⏱️ Timeout issues - page loading or navigation too slow');
        }
        
        if (error.includes('visible') || error.includes('clickable')) {
            issues.push('👁️ Visibility issues - menu items may be hidden or overlapped');
        }
        
        if (error.includes('network') || error.includes('fetch')) {
            issues.push('🌐 Network issues - API calls or resource loading problems');
        }
        
        if (error.includes('javascript') || error.includes('script')) {
            issues.push('⚠️ JavaScript errors - client-side execution problems');
        }
    });
    
    // Remove duplicates and display
    const uniqueIssues = [...new Set(issues)];
    uniqueIssues.forEach(issue => {
        console.log(`     ${issue}`);
    });
    
    if (uniqueIssues.length === 0) {
        console.log('     🤔 No specific patterns identified - review individual failures');
    }
}

// Generate recommendations based on results
function generateRecommendations(results, testStats, failures) {
    console.log('\n🎯 RECOMMENDATIONS:');
    
    if (results.exitCode === 0) {
        console.log('  ✅ All menu navigation tests passed!');
        console.log('  📋 Menu structure and navigation appear to be working correctly');
        console.log('  🔄 Consider running this test regularly to catch regressions');
    } else {
        console.log('  ❌ Menu navigation issues detected - immediate attention needed');
        
        if (failures.length > 0) {
            console.log('  🔧 Fix the following menu navigation issues:');
            failures.forEach((failure, index) => {
                console.log(`     ${index + 1}. ${failure.test}`);
            });
        }
        
        if (results.timedOut) {
            console.log('  ⏱️ Test timed out - consider increasing timeout or optimizing page load speed');
        }
        
        console.log('  📚 Refer to: server/docs/QA/menuQA/instructions.md for detailed guidance');
    }
    
    // Always provide these recommendations
    console.log('\n📋 NEXT STEPS:');
    console.log('  1. Review the evidence (screenshots/videos) for visual confirmation');
    console.log('  2. Test menu navigation manually if automated tests failed');
    console.log('  3. Check Confluence spec: https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/48332829/2');
    console.log('  4. Follow bug reporting protocol if issues confirmed');
}

// Save detailed report
function saveDetailedReport(results, testStats, evidence, failures) {
    const reportData = {
        timestamp: results.timestamp,
        testConfiguration: config,
        results: {
            exitCode: results.exitCode,
            timedOut: results.timedOut || false,
            status: results.exitCode === 0 ? 'PASSED' : 'FAILED'
        },
        statistics: testStats,
        evidence: evidence,
        failures: failures,
        fullOutput: results.output,
        errorOutput: results.errorOutput
    };
    
    const reportPath = './menu-navigation-qa-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`\n💾 Detailed report saved: ${reportPath}`);
}

// Main execution
async function main() {
    try {
        // Check if application is accessible
        const appRunning = await checkApplicationStatus();
        
        if (!appRunning) {
            console.log('\n❌ Cannot proceed - application is not accessible');
            console.log('Please start the development server and try again');
            process.exit(1);
        }
        
        console.log('');
        
        // Run the test
        const results = await runMenuNavigationTest();
        
        // Analyze and report results
        const analysis = analyzeResults(results);
        
        console.log('\n' + '='.repeat(80));
        console.log(`🏁 MENU NAVIGATION QA TEST COMPLETE - ${analysis.status}`);
        console.log('='.repeat(80));
        
        // Exit with appropriate code
        process.exit(results.exitCode);
        
    } catch (error) {
        console.error('\n❌ Test runner failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n⚠️ Test runner interrupted by user');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️ Test runner terminated');
    process.exit(1);
});

// Run the test
main();