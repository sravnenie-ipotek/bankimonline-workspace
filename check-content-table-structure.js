require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found. Please check your .env file.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('railway') ? {
    rejectUnauthorized: false
  } : false
});

async function checkTableStructure() {
  try {
    console.log('📊 CHECKING CONTENT TABLE STRUCTURE\n');
    console.log('=' .repeat(80));

    // 1. Get content_items table structure
    console.log('\n1️⃣ CONTENT_ITEMS TABLE STRUCTURE:');
    console.log('-'.repeat(40));
    const columnsQuery = await pool.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'content_items'
      ORDER BY ordinal_position
    `);
    
    console.log('Columns in content_items table:');
    columnsQuery.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`  • ${col.column_name}: ${col.data_type}${length} ${nullable}`);
    });

    // 2. Get content_translations table structure
    console.log('\n2️⃣ CONTENT_TRANSLATIONS TABLE STRUCTURE:');
    console.log('-'.repeat(40));
    const transColumnsQuery = await pool.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'content_translations'
      ORDER BY ordinal_position
    `);
    
    if (transColumnsQuery.rows.length > 0) {
      console.log('Columns in content_translations table:');
      transColumnsQuery.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`  • ${col.column_name}: ${col.data_type}${length} ${nullable}`);
      });
    } else {
      console.log('❌ content_translations table not found!');
    }

    // 3. Sample data from content_items
    console.log('\n3️⃣ SAMPLE DATA FROM CONTENT_ITEMS:');
    console.log('-'.repeat(40));
    const sampleData = await pool.query(`
      SELECT * FROM content_items 
      WHERE screen_location LIKE '%credit%'
      LIMIT 2
    `);
    
    if (sampleData.rows.length > 0) {
      console.log(`\nFound ${sampleData.rows.length} sample credit items:`);
      sampleData.rows.forEach((row, index) => {
        console.log(`\nSample ${index + 1}:`);
        Object.entries(row).forEach(([key, value]) => {
          if (value !== null) {
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            console.log(`  ${key}: ${displayValue.substring(0, 100)}${displayValue.length > 100 ? '...' : ''}`);
          }
        });
      });
    } else {
      console.log('No credit-related items found in content_items table.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure();