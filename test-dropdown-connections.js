#!/usr/bin/env node

/**
 * Test Dropdown Database Connections
 * Tests Railway database connectivity for dropdown data
 */

const { Client } = require('pg');
require('dotenv').config();

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testDatabaseConnection(name, connectionString) {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000 // 10 second timeout
  });

  console.log(`\n${colors.blue}Testing ${name} Database Connection...${colors.reset}`);
  console.log(`Connection string: ${connectionString?.substring(0, 30)}...`);

  try {
    await client.connect();
    console.log(`${colors.green}✅ Connected to ${name} successfully${colors.reset}`);

    // Test query
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log(`Database: ${result.rows[0].db_name}`);
    console.log(`Server time: ${result.rows[0].current_time}`);

    // Test dropdown-specific tables
    if (name === 'Shortline') {
      console.log(`\n${colors.blue}Testing dropdown tables...${colors.reset}`);
      
      // Test dropdown_configs table
      try {
        const dropdownResult = await client.query(`
          SELECT COUNT(*) as count 
          FROM dropdown_configs 
          WHERE screen_name = 'mortgage_step1'
        `);
        console.log(`${colors.green}✅ dropdown_configs table: ${dropdownResult.rows[0].count} rows for mortgage_step1${colors.reset}`);

        // Get sample data
        const sampleResult = await client.query(`
          SELECT screen_name, field_name, language, 
                 jsonb_array_length(options) as option_count
          FROM dropdown_configs 
          WHERE screen_name = 'mortgage_step1' 
          LIMIT 3
        `);
        
        console.log('\nSample dropdown configurations:');
        sampleResult.rows.forEach(row => {
          console.log(`  - ${row.screen_name}/${row.field_name}/${row.language}: ${row.option_count} options`);
        });

        // Test property ownership dropdown specifically
        const propertyOwnershipResult = await client.query(`
          SELECT options 
          FROM dropdown_configs 
          WHERE screen_name = 'mortgage_step1' 
            AND field_name = 'property_ownership' 
            AND language = 'en'
          LIMIT 1
        `);
        
        if (propertyOwnershipResult.rows.length > 0) {
          const options = propertyOwnershipResult.rows[0].options;
          console.log(`\n${colors.green}✅ Property ownership dropdown has ${options.length} options${colors.reset}`);
          options.forEach((opt, idx) => {
            console.log(`  ${idx + 1}. ${opt.label} (value: ${opt.value})`);
          });
        } else {
          console.log(`${colors.yellow}⚠️ Property ownership dropdown not found${colors.reset}`);
        }

      } catch (err) {
        console.log(`${colors.red}❌ Error testing dropdown tables: ${err.message}${colors.reset}`);
      }
    }

    if (name === 'Maglev') {
      console.log(`\n${colors.blue}Testing main database tables...${colors.reset}`);
      
      // Test cities table
      try {
        const citiesResult = await client.query('SELECT COUNT(*) as count FROM cities');
        console.log(`${colors.green}✅ cities table: ${citiesResult.rows[0].count} rows${colors.reset}`);
      } catch (err) {
        console.log(`${colors.yellow}⚠️ cities table not accessible: ${err.message}${colors.reset}`);
      }

      // Test banks table
      try {
        const banksResult = await client.query('SELECT COUNT(*) as count FROM banks');
        console.log(`${colors.green}✅ banks table: ${banksResult.rows[0].count} rows${colors.reset}`);
      } catch (err) {
        console.log(`${colors.yellow}⚠️ banks table not accessible: ${err.message}${colors.reset}`);
      }
    }

    await client.end();
    return true;

  } catch (error) {
    console.log(`${colors.red}❌ Failed to connect to ${name}: ${error.message}${colors.reset}`);
    
    if (error.message.includes('timeout')) {
      console.log(`${colors.yellow}⚠️ Connection timeout - Railway database may be sleeping or network issue${colors.reset}`);
    }
    
    return false;
  }
}

async function testDropdownAPIs() {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Testing Local API Endpoints${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);

  const baseUrl = 'http://localhost:8003';
  const endpoints = [
    '/api/health',
    '/api/v1/calculation-parameters?business_path=mortgage',
    '/api/dropdowns/mortgage_step1/en',
    '/api/dropdowns/mortgage_step1/he',
    '/api/content/mortgage_step1/en'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${endpoint}`);
      const response = await fetch(`${baseUrl}${endpoint}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`${colors.green}✅ Success (${response.status})${colors.reset}`);
        
        // Show relevant data
        if (endpoint.includes('calculation-parameters')) {
          const ltvData = data.data?.property_ownership_ltvs;
          if (ltvData) {
            console.log('LTV Ratios:');
            Object.entries(ltvData).forEach(([key, value]) => {
              console.log(`  - ${key}: ${value.ltv}% LTV, ${value.min_down_payment}% down payment`);
            });
          }
        } else if (endpoint.includes('dropdowns')) {
          const dropdownCount = Object.keys(data).filter(k => Array.isArray(data[k])).length;
          console.log(`Dropdowns returned: ${dropdownCount}`);
          
          if (data.property_ownership) {
            console.log(`Property ownership options: ${data.property_ownership.length}`);
          }
        }
      } else {
        console.log(`${colors.red}❌ Failed (${response.status}): ${data.error || 'Unknown error'}${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Request failed: ${error.message}${colors.reset}`);
    }
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}     Dropdown Database Connection Test${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);

  // Test database connections
  const databases = [
    { 
      name: 'Maglev', 
      env: 'DATABASE_URL',
      fallback: process.env.MAGLEV_DATABASE_URL
    },
    { 
      name: 'Shortline', 
      env: 'SHORTLINE_DATABASE_URL',
      fallback: process.env.DATABASE_URL
    }
  ];

  let allConnected = true;
  
  for (const db of databases) {
    const connectionString = process.env[db.env] || db.fallback;
    
    if (!connectionString) {
      console.log(`${colors.red}❌ No connection string for ${db.name} (${db.env})${colors.reset}`);
      allConnected = false;
      continue;
    }

    const connected = await testDatabaseConnection(db.name, connectionString);
    if (!connected) {
      allConnected = false;
    }
  }

  // Test API endpoints
  await testDropdownAPIs();

  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}                SUMMARY${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);

  if (allConnected) {
    console.log(`${colors.green}✅ All database connections successful!${colors.reset}`);
    console.log(`\n${colors.green}The dropdown system should be working properly.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Some database connections failed!${colors.reset}`);
    console.log(`\n${colors.yellow}Possible solutions:${colors.reset}`);
    console.log('1. Check Railway database is active (may need to wake up)');
    console.log('2. Verify DATABASE_URL and SHORTLINE_DATABASE_URL environment variables');
    console.log('3. Check network connectivity to Railway servers');
    console.log('4. Ensure database connection pooling is configured correctly');
  }

  process.exit(allConnected ? 0 : 1);
}

// Run the test
main().catch(console.error);