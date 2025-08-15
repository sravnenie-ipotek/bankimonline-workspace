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
  for (const db of testCredentials) {
    @/, ':***@')}`);
    
    const pool = new Pool({
      connectionString: db.url,
      ssl: db.ssl,
      connectionTimeoutMillis: 10000,
      max: 1
    });
    
    try {
      // Test basic connection
      const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name, version() as pg_version');
      [0]}`);
      
      // Test table count
      try {
        const tableCount = await pool.query(`
          SELECT COUNT(*) as table_count 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        } catch (tableError) {
        }
      
    } catch (error) {
      // Provide specific guidance based on error
      if (error.message.includes('password authentication failed')) {
        } else if (error.message.includes('connection')) {
        } else if (error.message.includes('SSL')) {
        }
    }
    
    try {
      await pool.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    }
  
  }

testDatabaseConnections().catch(console.error);

