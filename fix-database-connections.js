#!/usr/bin/env node

const { Pool } = require('pg');

const databases = [
  {
    name: 'shortline (WORKING)',
    url: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'yamanote (BROKEN)',
    url: 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'maglev (BROKEN)',
    url: 'postgresql://postgres:lqqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: { rejectUnauthorized: false }
  }
];

async function testDatabases() {
  console.log('🔍 Testing all Railway databases...\n');
  
  for (const db of databases) {
    console.log(`Testing ${db.name}:`);
    console.log(`URL: ${db.url.replace(/:([^:@]+)@/, ':***@')}`);
    
    const pool = new Pool({
      connectionString: db.url,
      ssl: db.ssl,
      connectionTimeoutMillis: 5000,
      max: 1
    });
    
    try {
      // Test basic connection
      const result = await pool.query('SELECT NOW() as current_time, current_database()');
      console.log(`✅ Connection: OK`);
      console.log(`   Database: ${result.rows[0].current_database}`);
      console.log(`   Time: ${result.rows[0].current_time}`);
      
      // Test function existence
      try {
        const funcTest = await pool.query(`
          SELECT EXISTS (
            SELECT FROM pg_proc 
            WHERE proname = 'get_content_by_screen'
          ) as function_exists
        `);
        
        if (funcTest.rows[0].function_exists) {
          console.log(`✅ get_content_by_screen function: EXISTS`);
          
          // Test function call
          try {
            const funcCall = await pool.query('SELECT * FROM get_content_by_screen($1, $2) LIMIT 1', ['mortgage_calculation', 'en']);
            console.log(`✅ Function call: WORKS (${funcCall.rows.length} rows)`);
          } catch (callError) {
            console.log(`❌ Function call: FAILS - ${callError.message}`);
          }
        } else {
          console.log(`❌ get_content_by_screen function: MISSING`);
        }
      } catch (funcError) {
        console.log(`❌ Function check: ERROR - ${funcError.message}`);
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
}

testDatabases().catch(console.error);