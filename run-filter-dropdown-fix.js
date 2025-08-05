const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Use the Railway database URL
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:DbERdyUMwXKSvjQArxCjzCbxKJCRBgQT@autorack.proxy.rlwy.net:26213/railway';
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const migrationSQL = fs.readFileSync('./migrations/202501_phase1_fix_filter_dropdown_container.sql', 'utf8');
    
    console.log('Running filter dropdown container migration...');
    const result = await pool.query(migrationSQL);
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();