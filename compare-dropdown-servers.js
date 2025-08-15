#!/usr/bin/env node

const { spawn } = require('child_process');
const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const TEST_URL = 'http://localhost:8003/api/dropdowns/other_borrowers_step2/he';
const SERVERS = {
    legacy: {
        name: 'Legacy Server',
        cwd: './server',
        command: 'node',
        args: ['server-db.js'],
        env: { NODE_ENV: 'development' }
    },
    packages: {
        name: 'Packages Server', 
        cwd: './packages/server',
        command: 'node',
        args: ['src/server.js'],
        env: { NODE_ENV: 'development' }
    }
};

// Colors for output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function startServer(serverConfig) {
    return new Promise((resolve, reject) => {
        log('cyan', `🚀 Starting ${serverConfig.name}...`);
        
        const server = spawn(serverConfig.command, serverConfig.args, {
            cwd: serverConfig.cwd,
            env: { ...process.env, ...serverConfig.env },
            stdio: 'pipe'
        });
        
        let started = false;
        
        server.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Server running on port 8003') || output.includes('server listening on port 8003')) {
                if (!started) {
                    started = true;
                    log('green', `✅ ${serverConfig.name} started successfully`);
                    resolve(server);
                }
            }
        });
        
        server.stderr.on('data', (data) => {
            console.error(`${serverConfig.name} stderr:`, data.toString());
        });
        
        server.on('error', (error) => {
            reject(error);
        });
        
        // Timeout after 15 seconds
        setTimeout(() => {
            if (!started) {
                reject(new Error(`${serverConfig.name} failed to start within 15 seconds`));
            }
        }, 15000);
    });
}

function stopServer(server, name) {
    return new Promise((resolve) => {
        if (server && !server.killed) {
            log('yellow', `🛑 Stopping ${name}...`);
            server.kill('SIGTERM');
            
            setTimeout(() => {
                if (!server.killed) {
                    server.kill('SIGKILL');
                }
                resolve();
            }, 2000);
        } else {
            resolve();
        }
    });
}

async function testServerAPI(serverName) {
    try {
        log('blue', `🔍 Testing ${serverName} API...`);
        
        const response = await fetch(TEST_URL);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(`API returned error: ${data.message}`);
        }
        
        // Check field_of_activity specifically
        const fieldOfActivity = data.options?.other_borrowers_step2_field_of_activity;
        
        if (!fieldOfActivity) {
            throw new Error('field_of_activity not found in response');
        }
        
        log('green', `✅ ${serverName} API Response:`);
        log('bright', `   - Status: ${data.status}`);
        log('bright', `   - Screen: ${data.screen_location}`);
        log('bright', `   - Language: ${data.language_code}`);
        log('bright', `   - Total dropdowns: ${data.dropdowns ? data.dropdowns.length : 0}`);
        log('bright', `   - field_of_activity options: ${fieldOfActivity.length}`);
        
        // Sample first 3 options
        log('cyan', '   - Sample field_of_activity options:');
        fieldOfActivity.slice(0, 3).forEach(option => {
            log('bright', `     * ${option.value}: ${option.label}`);
        });
        
        return {
            status: data.status,
            screen_location: data.screen_location,
            language_code: data.language_code,
            dropdowns_count: data.dropdowns ? data.dropdowns.length : 0,
            field_of_activity_count: fieldOfActivity.length,
            field_of_activity_options: fieldOfActivity,
            full_response: data
        };
        
    } catch (error) {
        log('red', `❌ ${serverName} API Test Failed: ${error.message}`);
        return null;
    }
}

async function compareResponses(legacyResult, packagesResult) {
    log('magenta', '\n📊 COMPARISON RESULTS:');
    log('bright', '================================');
    
    if (!legacyResult || !packagesResult) {
        log('red', '❌ Cannot compare - one or both servers failed');
        return;
    }
    
    // Compare key metrics
    const comparisons = [
        ['Status', legacyResult.status, packagesResult.status],
        ['Screen Location', legacyResult.screen_location, packagesResult.screen_location],
        ['Language Code', legacyResult.language_code, packagesResult.language_code],
        ['Dropdowns Count', legacyResult.dropdowns_count, packagesResult.dropdowns_count],
        ['Field of Activity Count', legacyResult.field_of_activity_count, packagesResult.field_of_activity_count]
    ];
    
    let allMatch = true;
    
    comparisons.forEach(([field, legacy, packages]) => {
        const match = legacy === packages;
        allMatch = allMatch && match;
        
        log(match ? 'green' : 'red', `${match ? '✅' : '❌'} ${field}:`);
        log('bright', `   Legacy: ${legacy}`);
        log('bright', `   Packages: ${packages}`);
    });
    
    // Deep compare field_of_activity options
    log('cyan', '\n🔍 Deep comparison of field_of_activity options:');
    
    if (legacyResult.field_of_activity_options.length !== packagesResult.field_of_activity_options.length) {
        log('red', `❌ Option count mismatch: ${legacyResult.field_of_activity_options.length} vs ${packagesResult.field_of_activity_options.length}`);
        allMatch = false;
    } else {
        let optionsMatch = true;
        for (let i = 0; i < legacyResult.field_of_activity_options.length; i++) {
            const legacyOpt = legacyResult.field_of_activity_options[i];
            const packagesOpt = packagesResult.field_of_activity_options[i];
            
            if (legacyOpt.value !== packagesOpt.value || legacyOpt.label !== packagesOpt.label) {
                log('red', `❌ Option ${i} mismatch:`);
                log('bright', `   Legacy: ${legacyOpt.value} = ${legacyOpt.label}`);
                log('bright', `   Packages: ${packagesOpt.value} = ${packagesOpt.label}`);
                optionsMatch = false;
            }
        }
        
        if (optionsMatch) {
            log('green', '✅ All field_of_activity options match exactly');
        } else {
            allMatch = false;
        }
    }
    
    // Final verdict
    log('magenta', '\n🏁 FINAL VERDICT:');
    if (allMatch) {
        log('green', '✅ SERVERS ARE IDENTICAL - Both servers return exactly the same dropdown data');
    } else {
        log('red', '❌ SERVERS DIFFER - Found differences in dropdown responses');
    }
    
    return allMatch;
}

async function main() {
    log('bright', '🔬 DROPDOWN SERVER COMPARISON TEST');
    log('bright', '=====================================\n');
    
    let legacyServer = null;
    let packagesServer = null;
    
    try {
        // Test Legacy Server
        log('cyan', '📡 TESTING LEGACY SERVER:');
        log('bright', '-------------------------');
        
        legacyServer = await startServer(SERVERS.legacy);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for full startup
        const legacyResult = await testServerAPI('Legacy Server');
        await stopServer(legacyServer, 'Legacy Server');
        
        // Wait between server switches
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test Packages Server  
        log('cyan', '\n📡 TESTING PACKAGES SERVER:');
        log('bright', '----------------------------');
        
        packagesServer = await startServer(SERVERS.packages);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for full startup
        const packagesResult = await testServerAPI('Packages Server');
        await stopServer(packagesServer, 'Packages Server');
        
        // Compare results
        await compareResponses(legacyResult, packagesResult);
        
        // Save detailed results
        const detailedResults = {
            timestamp: new Date().toISOString(),
            legacy: legacyResult,
            packages: packagesResult
        };
        
        fs.writeFileSync('./dropdown-server-comparison.json', JSON.stringify(detailedResults, null, 2));
        log('blue', '\n💾 Detailed results saved to dropdown-server-comparison.json');
        
    } catch (error) {
        log('red', `💥 Test failed: ${error.message}`);
    } finally {
        // Cleanup
        if (legacyServer) await stopServer(legacyServer, 'Legacy Server');
        if (packagesServer) await stopServer(packagesServer, 'Packages Server');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { startServer, stopServer, testServerAPI, compareResponses };