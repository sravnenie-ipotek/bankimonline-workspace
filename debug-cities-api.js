#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

// Test database connection
async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    
    const pool = new Pool({
        connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
    });
    
    try {
        // Test basic connection
        const result = await pool.query('SELECT COUNT(*) FROM cities');
        console.log('✅ Database connection successful');
        console.log(`📊 Cities count: ${result.rows[0].count}`);
        
        // Test the exact query from the API
        const lang = 'he';
        const nameColumn = `name_${lang}`;
        const query = `SELECT id, key as value, ${nameColumn} as name FROM cities ORDER BY ${nameColumn}`;
        
        console.log(`🔍 Testing query: ${query}`);
        const citiesResult = await pool.query(query);
        console.log(`✅ Cities query successful`);
        console.log(`📊 Found ${citiesResult.rowCount} cities`);
        
        // Show first 3 cities
        console.log('🏙️ Sample cities:');
        citiesResult.rows.slice(0, 3).forEach(city => {
            console.log(`  - ${city.name} (${city.value})`);
        });
        
    } catch (err) {
        console.error('❌ Database error:', err.message);
        console.error('🔍 Full error:', err);
    } finally {
        await pool.end();
    }
}

// Test the API endpoint
async function testAPIEndpoint() {
    console.log('\n🌐 Testing API endpoint...');
    
    try {
        const response = await fetch('https://bankdev2standalone-production.up.railway.app/api/get-cities?lang=he');
        const data = await response.json();
        
        console.log('📡 API Response:');
        console.log(JSON.stringify(data, null, 2));
        
    } catch (err) {
        console.error('❌ API error:', err.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting cities API debug...\n');
    
    await testDatabaseConnection();
    await testAPIEndpoint();
    
    console.log('\n✅ Debug complete');
}

runTests().catch(console.error); 