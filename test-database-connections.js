#!/usr/bin/env node

const { Pool } = require('pg');

// Test different possible passwords for SHORTLINE and YAMANOTE
const testCredentials = [
  // Current credentials from code (likely outdated)
  {
    name: 'SHORTLINE (Current Code)',
    url: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'YAMANOTE (Current Code)',
    url: 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
    ssl: { rejectUnauthorized: false }
  },
  // Alternative credentials (if passwords were rotated)
  {
    name: 'SHORTLINE (Alternative 1)',
    url: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'YAMANOTE (Alternative 1)',
    url: 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
    ssl: { rejectUnauthorized: false }
  }
];

async function testDatabaseConnections() {
  console.log('🔍 Testing Railway database connections...\n');
  
  for (const db of testCredentials) {
    console.log(`Testing ${db.name}:`);
    console.log(`URL: ${db.url.replace(/:([^:@]+)@/, ':***@')}`);
    
    const pool = new Pool({
      connectionString: db.url,
      ssl: db.ssl,
      connectionTimeoutMillis: 10000,
      max: 1
    });
    
    try {
      // Test basic connection
      const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name, version() as pg_version');
      console.log(`✅ Connection: SUCCESS`);
      console.log(`   Database: ${result.rows[0].db_name}`);
      console.log(`   Time: ${result.rows[0].current_time}`);
      console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]}`);
      
      // Test table count
      try {
        const tableCount = await pool.query(`
          SELECT COUNT(*) as table_count 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        console.log(`   Tables: ${tableCount.rows[0].table_count}`);
      } catch (tableError) {
        console.log(`   Tables: Error counting - ${tableError.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Connection: FAILED`);
      console.log(`   Error: ${error.message}`);
      
      // Provide specific guidance based on error
      if (error.message.includes('password authentication failed')) {
        console.log(`   🔧 Action: Password is incorrect - needs to be updated`);
      } else if (error.message.includes('connection')) {
        console.log(`   🔧 Action: Network connectivity issue`);
      } else if (error.message.includes('SSL')) {
        console.log(`   🔧 Action: SSL configuration issue`);
      }
    }
    
    try {
      await pool.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    console.log('');
  }
  
  console.log('📋 Next Steps:');
  console.log('1. If all connections fail, check Railway dashboard for current credentials');
  console.log('2. Update environment variables with correct passwords');
  console.log('3. Restart services after credential update');
}

testDatabaseConnections().catch(console.error);
