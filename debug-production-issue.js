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
  for (const db of productionConnections) {
    const pool = new Pool({
      connectionString: db.url,
      ssl: db.ssl,
      connectionTimeoutMillis: 5000,
      max: 1
    });
    
    try {
      // Test basic connection
      const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
      // Test specific tables that might be causing issues
      try {
        const tables = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        `);
        .join(', ')}`);
        
        // Check for specific problematic tables
        const hasFieldOfActivity = tables.rows.some(t => t.table_name === 'field_of_activity');
        const hasStatusTracking = tables.rows.some(t => t.table_name === 'status_tracking');
        
        } catch (tableError) {
        }
      
    } catch (error) {
      }
    
    try {
      await pool.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    }
  
  }

debugProductionIssue().catch(console.error);

