#!/usr/bin/env node

/**
 * Quick Test Script for Database Translation System
 * Verifies that the translation fixes are working correctly
 */

const http = require('http');
const { Client } = require('pg');
require('dotenv').config();

const API_PORT = 8003;
const API_HOST = 'localhost';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e.message}`));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        req.end();
    });
}

async function testDatabaseConnection() {
    const client = new Client({
        connectionString: process.env.CONTENT_DATABASE_URL
    });

    try {
        await client.connect();
        const result = await client.query('SELECT COUNT(*) as count FROM content_items');
        const translationResult = await client.query('SELECT COUNT(*) as count FROM content_translations');
        
        log(`✅ Database connected`, 'green');
        log(`   Content items: ${result.rows[0].count}`, 'cyan');
        log(`   Translations: ${translationResult.rows[0].count}`, 'cyan');
        
        return true;
    } catch (error) {
        log(`❌ Database connection failed: ${error.message}`, 'red');
        return false;
    } finally {
        await client.end();
    }
}

async function testContentAPI() {
    const screens = [
        'home_page',
        'services_landing',
        'mortgage_step1',
        'credit_step1',
        'contact_page'
    ];

    log('\n📋 Testing Content API Endpoints:', 'bright');
    
    let allPassed = true;
    
    for (const screen of screens) {
        try {
            const response = await makeRequest(`/api/content/${screen}/en`);
            
            if (response.status === 'success' && response.content_count > 0) {
                log(`  ✅ ${screen}: ${response.content_count} items`, 'green');
                
                // Check for specific problematic keys
                const content = response.content;
                const hasProblematicKeys = Object.keys(content).some(key => 
                    key.includes('calculate_mortgage_property_ownership') ||
                    key.includes('title_compare')
                );
                
                if (hasProblematicKeys) {
                    log(`     ✓ Contains critical keys`, 'cyan');
                }
            } else {
                log(`  ⚠️ ${screen}: No content found`, 'yellow');
                allPassed = false;
            }
        } catch (error) {
            log(`  ❌ ${screen}: ${error.message}`, 'red');
            allPassed = false;
        }
    }
    
    return allPassed;
}

async function testDropdownAPI() {
    log('\n📋 Testing Dropdown API:', 'bright');
    
    try {
        const response = await makeRequest('/api/dropdowns/mortgage_step1/en');
        
        if (response.status === 'success' && response.dropdowns.length > 0) {
            log(`  ✅ Mortgage Step 1: ${response.dropdowns.length} dropdowns`, 'green');
            
            // Check for property ownership dropdown
            const propertyDropdown = response.dropdowns.find(d => 
                d.key && d.key.includes('property_ownership')
            );
            
            if (propertyDropdown && propertyDropdown.options.length > 0) {
                log(`     ✓ Property ownership dropdown: ${propertyDropdown.options.length} options`, 'cyan');
            }
            
            return true;
        } else {
            log(`  ⚠️ No dropdowns found`, 'yellow');
            return false;
        }
    } catch (error) {
        log(`  ❌ Dropdown API error: ${error.message}`, 'red');
        return false;
    }
}

async function testCacheSystem() {
    log('\n📋 Testing Cache System:', 'bright');
    
    try {
        // Clear cache first
        await makeRequest('/api/cache/clear');
        log(`  ✅ Cache cleared`, 'green');
        
        // First request (not cached)
        const response1 = await makeRequest('/api/content/home_page/en');
        if (!response1.cached) {
            log(`  ✅ First request not cached (expected)`, 'green');
        }
        
        // Second request (should be cached)
        const response2 = await makeRequest('/api/content/home_page/en');
        if (response2.cached) {
            log(`  ✅ Second request cached`, 'green');
        } else {
            log(`  ⚠️ Cache not working as expected`, 'yellow');
        }
        
        return true;
    } catch (error) {
        log(`  ❌ Cache test error: ${error.message}`, 'red');
        return false;
    }
}

async function runAllTests() {
    log('\n🚀 DATABASE TRANSLATION SYSTEM - QUICK TEST', 'bright');
    log('==========================================\n', 'bright');
    
    let results = {
        database: false,
        contentAPI: false,
        dropdownAPI: false,
        cache: false
    };
    
    // Test 1: Database Connection
    log('1️⃣ Database Connection Test:', 'bright');
    results.database = await testDatabaseConnection();
    
    // Test 2: Content API
    results.contentAPI = await testContentAPI();
    
    // Test 3: Dropdown API
    results.dropdownAPI = await testDropdownAPI();
    
    // Test 4: Cache System
    results.cache = await testCacheSystem();
    
    // Summary
    log('\n==========================================', 'bright');
    log('📊 TEST SUMMARY:', 'bright');
    log('==========================================', 'bright');
    
    const allPassed = Object.values(results).every(r => r);
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        const color = passed ? 'green' : 'red';
        log(`  ${test}: ${status}`, color);
    });
    
    log('==========================================\n', 'bright');
    
    if (allPassed) {
        log('✅ ALL TESTS PASSED! Translation system is working correctly.', 'green');
        log('\nYou can now run the full E2E test suite with:', 'cyan');
        log('  ./run-e2e-verification.sh', 'cyan');
    } else {
        log('❌ SOME TESTS FAILED. Please check the issues above.', 'red');
        log('\nTroubleshooting:', 'yellow');
        log('  1. Ensure the API server is running on port 8003', 'yellow');
        log('  2. Check database connection in .env file', 'yellow');
        log('  3. Run: node verify-and-populate-content.js', 'yellow');
    }
    
    process.exit(allPassed ? 0 : 1);
}

// Check if API server is running
const checkServer = http.get(`http://${API_HOST}:${API_PORT}/api/server-mode`, (res) => {
    if (res.statusCode === 200) {
        log('✅ API server is running', 'green');
        runAllTests();
    } else {
        log(`❌ API server returned status ${res.statusCode}`, 'red');
        process.exit(1);
    }
});

checkServer.on('error', (err) => {
    log(`❌ API server is not running on port ${API_PORT}`, 'red');
    log(`   Error: ${err.message}`, 'red');
    log('\n   Please start the server with:', 'yellow');
    log('     npm run dev', 'yellow');
    log('   or', 'yellow');
    log('     ./pm2-start.sh', 'yellow');
    process.exit(1);
});