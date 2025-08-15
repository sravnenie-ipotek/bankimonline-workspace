#!/usr/bin/env node

const { exec } = require('child_process');
const fetch = require('node-fetch');

// Simple test without starting servers - assumes servers will be started manually
async function testDropdownAPI(serverName) {
    console.log(`\n🔍 Testing ${serverName}...`);
    
    try {
        const response = await fetch('http://localhost:8003/api/dropdowns/other_borrowers_step2/he');
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(`API Error: ${data.message || 'Unknown error'}`);
        }
        
        const fieldOptions = data.options?.other_borrowers_step2_field_of_activity;
        
        if (!fieldOptions) {
            throw new Error('field_of_activity not found in response');
        }
        
        console.log(`✅ ${serverName} Results:`);
        console.log(`   - Status: ${data.status}`);
        console.log(`   - Screen: ${data.screen_location}`);
        console.log(`   - Language: ${data.language_code}`);
        console.log(`   - field_of_activity options: ${fieldOptions.length}`);
        console.log(`   - Sample options: ${fieldOptions.slice(0, 3).map(o => o.value).join(', ')}`);
        
        return fieldOptions;
        
    } catch (error) {
        console.log(`❌ ${serverName} Failed: ${error.message}`);
        return null;
    }
}

function killPort8003() {
    return new Promise((resolve) => {
        exec('lsof -ti:8003 | xargs kill -9', (error) => {
            // Ignore errors - just cleanup
            setTimeout(resolve, 1000);
        });
    });
}

function startServer(serverPath, serverName) {
    return new Promise((resolve, reject) => {
        console.log(`🚀 Starting ${serverName}...`);
        
        const server = exec(`cd ${serverPath} && NODE_ENV=development node server-db.js || node src/server.js`, {
            env: { ...process.env, NODE_ENV: 'development' }
        });
        
        let started = false;
        
        server.stdout?.on('data', (data) => {
            if (data.includes('Server running on port 8003') || data.includes('server listening on port 8003')) {
                if (!started) {
                    started = true;
                    console.log(`✅ ${serverName} started`);
                    resolve(server);
                }
            }
        });
        
        server.stderr?.on('data', (data) => {
            console.error(`${serverName} error:`, data.toString());
        });
        
        // Timeout
        setTimeout(() => {
            if (!started) {
                reject(new Error(`${serverName} failed to start`));
            }
        }, 10000);
    });
}

async function main() {
    console.log('🎯 FINAL DROPDOWN VALIDATION TEST');
    console.log('=================================');
    
    await killPort8003();
    
    // Test Legacy Server
    console.log('\n📡 LEGACY SERVER TEST:');
    try {
        const legacyServer = await startServer('server', 'Legacy Server');
        await new Promise(resolve => setTimeout(resolve, 3000));
        const legacyResults = await testDropdownAPI('Legacy Server');
        legacyServer.kill();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test Packages Server
        console.log('\n📡 PACKAGES SERVER TEST:');
        const packagesServer = await startServer('packages/server', 'Packages Server');
        await new Promise(resolve => setTimeout(resolve, 3000));
        const packagesResults = await testDropdownAPI('Packages Server');
        packagesServer.kill();
        
        // Compare
        console.log('\n📊 FINAL COMPARISON:');
        console.log('====================');
        
        if (legacyResults && packagesResults) {
            if (legacyResults.length === packagesResults.length) {
                console.log('✅ VALIDATION PASSED: Both servers return same number of options');
                console.log(`   Both servers: ${legacyResults.length} field_of_activity options`);
                
                // Check if options match
                const legacy_values = legacyResults.map(o => o.value).sort();
                const packages_values = packagesResults.map(o => o.value).sort();
                
                if (JSON.stringify(legacy_values) === JSON.stringify(packages_values)) {
                    console.log('✅ VALIDATION PASSED: Option values are identical');
                } else {
                    console.log('⚠️  Option values differ between servers');
                }
                
            } else {
                console.log('❌ VALIDATION FAILED: Different number of options');
                console.log(`   Legacy: ${legacyResults.length}, Packages: ${packagesResults.length}`);
            }
        } else {
            console.log('❌ VALIDATION FAILED: One or both servers failed');
        }
        
    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
    } finally {
        await killPort8003();
    }
}

if (require.main === module) {
    main().catch(console.error);
}