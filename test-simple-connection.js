#!/usr/bin/env node

const { Pool } = require('pg');

// Railway connection URL
const DATABASE_URL = "postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway";

console.log('🧪 Testing Railway PostgreSQL Connection...\n');

async function testConnection(config, configName) {
    console.log(`📡 Testing ${configName}...`);
    const pool = new Pool(config);
    
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        console.log(`✅ ${configName} - SUCCESS!`);
        console.log(`   Time: ${result.rows[0].current_time}`);
        return true;
    } catch (err) {
        console.log(`❌ ${configName} - FAILED: ${err.message}`);
        return false;
    } finally {
        await pool.end();
    }
}

async function runTests() {
    const configs = [
        {
            config: { connectionString: DATABASE_URL },
            name: "No SSL"
        },
        {
            config: { 
                connectionString: DATABASE_URL,
                ssl: false 
            },
            name: "SSL disabled"
        },
        {
            config: { 
                connectionString: DATABASE_URL,
                ssl: { rejectUnauthorized: false } 
            },
            name: "SSL with rejectUnauthorized: false"
        },
        {
            config: { 
                connectionString: DATABASE_URL,
                ssl: true
            },
            name: "SSL enabled (basic)"
        },
        {
            config: {
                host: 'maglev.proxy.rlwy.net',
                port: 43809,
                database: 'railway',
                user: 'postgres',
                password: 'lgqPEzvVbSCviTybKqMbzJkYvOUetJjt',
                ssl: { rejectUnauthorized: false }
            },
            name: "Individual parameters with SSL"
        },
        {
            config: {
                host: 'maglev.proxy.rlwy.net',
                port: 43809,
                database: 'railway',
                user: 'postgres',
                password: 'lgqPEzvVbSCviTybKqMbzJkYvOUetJjt',
                ssl: false
            },
            name: "Individual parameters without SSL"
        }
    ];

    console.log('🔍 Trying different connection configurations...\n');
    
    for (const { config, name } of configs) {
        const success = await testConnection(config, name);
        if (success) {
            console.log(`\n🎉 Found working configuration: ${name}`);
            break;
        }
        console.log('');
    }
    
    console.log('\n🔌 All tests completed.');
}

runTests(); 