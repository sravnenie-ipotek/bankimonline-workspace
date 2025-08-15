#!/usr/bin/env node

const { exec } = require('child_process');
const fetch = require('node-fetch');

// Simple test without starting servers - assumes servers will be started manually
async function testDropdownAPI(serverName) {
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
        
        .map(o => o.value).join(', ')}`);
        
        return fieldOptions;
        
    } catch (error) {
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
        const server = exec(`cd ${serverPath} && NODE_ENV=development node server-db.js || node src/server.js`, {
            env: { ...process.env, NODE_ENV: 'development' }
        });
        
        let started = false;
        
        server.stdout?.on('data', (data) => {
            if (data.includes('Server running on port 8003') || data.includes('server listening on port 8003')) {
                if (!started) {
                    started = true;
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
    await killPort8003();
    
    // Test Legacy Server
    try {
        const legacyServer = await startServer('server', 'Legacy Server');
        await new Promise(resolve => setTimeout(resolve, 3000));
        const legacyResults = await testDropdownAPI('Legacy Server');
        legacyServer.kill();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test Packages Server
        const packagesServer = await startServer('packages/server', 'Packages Server');
        await new Promise(resolve => setTimeout(resolve, 3000));
        const packagesResults = await testDropdownAPI('Packages Server');
        packagesServer.kill();
        
        // Compare
        if (legacyResults && packagesResults) {
            if (legacyResults.length === packagesResults.length) {
                // Check if options match
                const legacy_values = legacyResults.map(o => o.value).sort();
                const packages_values = packagesResults.map(o => o.value).sort();
                
                if (JSON.stringify(legacy_values) === JSON.stringify(packages_values)) {
                    } else {
                    }
                
            } else {
                }
        } else {
            }
        
    } catch (error) {
        } finally {
        await killPort8003();
    }
}

if (require.main === module) {
    main().catch(console.error);
}