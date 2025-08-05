const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkConstraints() {
  console.log('🔍 Checking constraints on content_items table...\n');
  
  try {
    // Check table constraints
    const constraintsResult = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_name = 'content_items' 
        AND tc.table_schema = 'public'
      ORDER BY tc.constraint_type, tc.constraint_name, kcu.ordinal_position
    `);
    
    console.log('Constraints on content_items:');
    constraintsResult.rows.forEach(row => {
      console.log(`  ${row.constraint_type}: ${row.constraint_name} on column ${row.column_name}`);
    });
    
    // Check unique indexes
    const indexesResult = await pool.query(`
      SELECT 
        i.relname as index_name,
        a.attname as column_name,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = 'content_items' 
        AND t.relkind = 'r'
      ORDER BY i.relname, a.attnum
    `);
    
    console.log('\nIndexes on content_items:');
    let currentIndex = '';
    indexesResult.rows.forEach(row => {
      if (row.index_name !== currentIndex) {
        currentIndex = row.index_name;
        console.log(`  ${row.index_name} (unique: ${row.is_unique}, primary: ${row.is_primary})`);
      }
      console.log(`    - ${row.column_name}`);
    });
    
  } catch (error) {
    console.error('Error checking constraints:', error.message);
  } finally {
    await pool.end();
  }
}

checkConstraints();