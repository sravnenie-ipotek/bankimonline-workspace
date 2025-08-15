#!/usr/bin/env node

const { Pool } = require('pg');

// Test the exact same connection strings that production is using
const productionConnections = [
  {
    name: 'SHORTLINE (Production)',
    url: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'YAMANOTE (Production)', 
    url: 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
    ssl: { rejectUnauthorized: false }
  }
];

async function debugProductionIssue() {
  console.log('🔍 Debugging Production Database Issue...\n');
  
  for (const db of productionConnections) {
    console.log(`Testing ${db.name}:`);
    
    const pool = new Pool({
      connectionString: db.url,
      ssl: db.ssl,
      connectionTimeoutMillis: 5000,
      max: 1
    });
    
    try {
      // Test basic connection
      const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
      console.log(`✅ Connection: SUCCESS`);
      console.log(`   Database: ${result.rows[0].db_name}`);
      console.log(`   Time: ${result.rows[0].current_time}`);
      
      // Test specific tables that might be causing issues
      try {
        const tables = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        `);
        console.log(`   Tables found: ${tables.rows.length}`);
        console.log(`   Table names: ${tables.rows.map(t => t.table_name).join(', ')}`);
        
        // Check for specific problematic tables
        const hasFieldOfActivity = tables.rows.some(t => t.table_name === 'field_of_activity');
        const hasStatusTracking = tables.rows.some(t => t.table_name === 'status_tracking');
        
        console.log(`   field_of_activity table: ${hasFieldOfActivity ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`   status_tracking table: ${hasStatusTracking ? '✅ EXISTS' : '❌ MISSING'}`);
        
      } catch (tableError) {
        console.log(`   ❌ Table check failed: ${tableError.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Connection: FAILED`);
      console.log(`   Error: ${error.message}`);
    }
    
    try {
      await pool.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    console.log('');
  }
  
  console.log('🔍 Analysis:');
  console.log('Since databases are accessible, the issue might be:');
  console.log('1. Environment variables not set correctly on production server');
  console.log('2. Different connection strings used in production code');
  console.log('3. Network/firewall issues on production server');
  console.log('4. Service configuration issues');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Check production server environment variables');
  console.log('2. Verify production code is using correct connection strings');
  console.log('3. Check production server network connectivity');
}

debugProductionIssue().catch(console.error);
