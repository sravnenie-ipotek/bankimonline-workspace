#!/usr/bin/env node

/**
 * Feature Flag Testing Script
 * Tests the JSONB vs Traditional dropdown systems
 */

const http = require('http');

// Test configuration
const PORT = 8004; // Use different port to avoid conflicts
const TEST_SCREENS = ['mortgage_step1', 'calculate_credit_1'];
const TEST_LANGUAGES = ['en', 'he'];

async function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = http.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        responseTime,
                        data: jsonData,
                        url
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        responseTime,
                        error: error.message,
                        url
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject({
                error: error.message,
                url
            });
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject({
                error: 'Request timeout',
                url
            });
        });
    });
}

async function testFeatureFlag() {
    console.log('🎛️ Testing Feature Flag Endpoint...');
    
    try {
        const flagResult = await makeRequest('http://localhost:8003/api/feature-flags/dropdown-system');
        
        if (flagResult.status === 200) {
            console.log('✅ Feature Flag Status:');
            console.log(`   Current System: ${flagResult.data.feature_flags.current_system}`);
            console.log(`   JSONB Enabled: ${flagResult.data.feature_flags.USE_JSONB_DROPDOWNS}`);
            console.log(`   Environment: ${flagResult.data.feature_flags.environment}`);
            console.log(`   Expected Improvement: ${flagResult.data.performance_info.expected_improvement}`);
            return flagResult.data.feature_flags;
        } else {
            console.log('❌ Feature flag endpoint failed:', flagResult.status);
            return null;
        }
    } catch (error) {
        console.log('❌ Could not connect to feature flag endpoint:', error.error);
        return null;
    }
}

async function testDropdownEndpoint(screen, language) {
    console.log(`🔍 Testing /api/dropdowns/${screen}/${language}...`);
    
    try {
        const result = await makeRequest(`http://localhost:8003/api/dropdowns/${screen}/${language}`);
        
        if (result.status === 200) {
            const data = result.data;
            console.log(`✅ Success (${result.responseTime}ms):`);
            console.log(`   System: ${data.jsonb_source ? 'JSONB' : 'Traditional'}`);
            console.log(`   Dropdowns: ${data.dropdowns?.length || 0}`);
            console.log(`   Options: ${Object.keys(data.options || {}).length}`);
            console.log(`   Labels: ${Object.keys(data.labels || {}).length}`);
            console.log(`   Query Count: ${data.performance?.query_count || 'unknown'}`);
            console.log(`   Source: ${data.performance?.source || 'unknown'}`);
            
            return {
                success: true,
                responseTime: result.responseTime,
                system: data.jsonb_source ? 'JSONB' : 'Traditional',
                dropdownCount: data.dropdowns?.length || 0,
                queryCount: data.performance?.query_count || 0
            };
        } else {
            console.log(`❌ Failed (${result.status}):`, result.data?.message || 'Unknown error');
            return {
                success: false,
                status: result.status,
                error: result.data?.message || 'Unknown error'
            };
        }
    } catch (error) {
        console.log(`❌ Connection failed:`, error.error);
        return {
            success: false,
            error: error.error
        };
    }
}

async function runTests() {
    console.log('🚀 Starting Feature Flag Testing...\n');
    
    // Test feature flag endpoint
    const flagStatus = await testFeatureFlag();
    console.log('');
    
    if (!flagStatus) {
        console.log('❌ Cannot proceed with dropdown tests - server not responding');
        return;
    }
    
    // Test dropdown endpoints
    const results = [];
    
    for (const screen of TEST_SCREENS) {
        for (const language of TEST_LANGUAGES) {
            const result = await testDropdownEndpoint(screen, language);
            results.push({
                screen,
                language,
                ...result
            });
            console.log('');
        }
    }
    
    // Summary
    console.log('📊 Test Summary:');
    console.log(`   Total Tests: ${results.length}`);
    console.log(`   Successful: ${results.filter(r => r.success).length}`);
    console.log(`   Failed: ${results.filter(r => !r.success).length}`);
    
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
        const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
        console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);
        console.log(`   System Used: ${successfulResults[0].system}`);
    }
    
    console.log('\n🎉 Feature flag testing completed!');
}

// Run the tests
runTests().catch(console.error);