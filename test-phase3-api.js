#!/usr/bin/env node

/**
 * Phase 3 API Testing Script
 * Tests the new dropdown endpoints and caching functionality
 */

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8003,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Phase 3 API Testing Started\n');

    const tests = [];

    // Test 1: Enhanced content endpoint with type filtering
    console.log('1️⃣ Testing enhanced content endpoint with type filtering...');
    try {
        const result = await makeRequest('/api/content/mortgage_step1/en?type=dropdown');
        const success = result.status === 200 && result.data.status === 'success' && result.data.filtered_by_type === 'dropdown';
        tests.push({ name: 'Content endpoint with type filter', success, details: `${result.data.content_count} dropdown items` });
        console.log(`   ✅ Found ${result.data.content_count} dropdown items\n`);
    } catch (error) {
        tests.push({ name: 'Content endpoint with type filter', success: false, details: error.message });
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // Test 2: New structured dropdowns endpoint
    console.log('2️⃣ Testing new structured dropdowns endpoint...');
    try {
        const result = await makeRequest('/api/dropdowns/mortgage_step1/en');
        const success = result.status === 200 && 
                       result.data.status === 'success' && 
                       Array.isArray(result.data.dropdowns) &&
                       typeof result.data.options === 'object' &&
                       typeof result.data.placeholders === 'object' &&
                       typeof result.data.labels === 'object';
        
        tests.push({ 
            name: 'Structured dropdowns endpoint', 
            success, 
            details: `${result.data.dropdowns?.length || 0} dropdowns, ${Object.keys(result.data.options || {}).length} option groups` 
        });
        console.log(`   ✅ Found ${result.data.dropdowns?.length || 0} dropdowns with ${Object.keys(result.data.options || {}).length} option groups\n`);
    } catch (error) {
        tests.push({ name: 'Structured dropdowns endpoint', success: false, details: error.message });
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // Test 3: Cache functionality - Initial miss
    console.log('3️⃣ Testing cache functionality...');
    try {
        // Clear cache first
        await makeRequest('/api/content/cache/clear', 'DELETE');
        
        // Make request (should be cache miss)
        const start1 = Date.now();
        const result1 = await makeRequest('/api/dropdowns/mortgage_step1/en');
        const time1 = Date.now() - start1;
        
        // Make same request again (should be cache hit)
        const start2 = Date.now();
        const result2 = await makeRequest('/api/dropdowns/mortgage_step1/en');
        const time2 = Date.now() - start2;
        
        const cacheWorking = time2 < time1 / 2; // Cache hit should be much faster
        tests.push({ 
            name: 'Cache functionality', 
            success: cacheWorking, 
            details: `First: ${time1}ms, Second: ${time2}ms, Speedup: ${(time1/time2).toFixed(1)}x` 
        });
        console.log(`   ✅ Cache working: First request ${time1}ms, Second request ${time2}ms (${(time1/time2).toFixed(1)}x speedup)\n`);
    } catch (error) {
        tests.push({ name: 'Cache functionality', success: false, details: error.message });
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // Test 4: Cache statistics endpoint
    console.log('4️⃣ Testing cache statistics endpoint...');
    try {
        const result = await makeRequest('/api/content/cache/stats');
        const success = result.status === 200 && 
                       result.data.status === 'success' && 
                       typeof result.data.cache_stats === 'object' &&
                       typeof result.data.cache_stats.keys_count === 'number';
        
        tests.push({ 
            name: 'Cache statistics endpoint', 
            success, 
            details: `${result.data.cache_stats?.keys_count || 0} keys, ${result.data.cache_stats?.hit_rate || '0%'} hit rate` 
        });
        console.log(`   ✅ Cache stats: ${result.data.cache_stats?.keys_count || 0} keys, ${result.data.cache_stats?.hit_rate || '0%'} hit rate\n`);
    } catch (error) {
        tests.push({ name: 'Cache statistics endpoint', success: false, details: error.message });
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // Test 5: Multi-language support
    console.log('5️⃣ Testing multi-language support...');
    try {
        const enResult = await makeRequest('/api/dropdowns/mortgage_step1/en');
        const heResult = await makeRequest('/api/dropdowns/mortgage_step1/he');
        
        const success = enResult.status === 200 && heResult.status === 200 &&
                       enResult.data.dropdowns?.length > 0 && heResult.data.dropdowns?.length > 0;
        
        tests.push({ 
            name: 'Multi-language support', 
            success, 
            details: `EN: ${enResult.data.dropdowns?.length || 0} dropdowns, HE: ${heResult.data.dropdowns?.length || 0} dropdowns` 
        });
        console.log(`   ✅ Multi-language: EN has ${enResult.data.dropdowns?.length || 0} dropdowns, HE has ${heResult.data.dropdowns?.length || 0} dropdowns\n`);
    } catch (error) {
        tests.push({ name: 'Multi-language support', success: false, details: error.message });
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // Test 6: Performance validation
    console.log('6️⃣ Testing performance requirements...');
    try {
        await makeRequest('/api/content/cache/clear', 'DELETE'); // Clear cache for fresh test
        
        const start = Date.now();
        const result = await makeRequest('/api/dropdowns/mortgage_step1/en');
        const responseTime = Date.now() - start;
        
        const meetsPerfTarget = responseTime < 200; // < 200ms requirement
        tests.push({ 
            name: 'Performance requirement (<200ms)', 
            success: meetsPerfTarget, 
            details: `${responseTime}ms response time` 
        });
        console.log(`   ${meetsPerfTarget ? '✅' : '❌'} Performance: ${responseTime}ms response time (target: <200ms)\n`);
    } catch (error) {
        tests.push({ name: 'Performance requirement (<200ms)', success: false, details: error.message });
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // Summary
    console.log('📊 Test Results Summary:');
    console.log('========================');
    
    const passed = tests.filter(t => t.success).length;
    const total = tests.length;
    
    tests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.success ? '✅' : '❌'} ${test.name}: ${test.details}`);
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed (${(passed/total*100).toFixed(1)}%)`);
    
    if (passed === total) {
        console.log('🎉 All Phase 3 API requirements successfully implemented!');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Review implementation.');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
});