const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixDuplicateContentKeys() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 FIXING DUPLICATE CONTENT KEYS IN MORTGAGE_STEP1\n');
    
    // Start transaction
    await client.query('BEGIN');
    
    // 1. First, let's see what we're dealing with
    console.log('1. ANALYZING DUPLICATES:');
    console.log('========================');
    
    const duplicates = await client.query(`
      SELECT 
        content_key,
        component_type,
        COUNT(*) as count
      FROM content_items
      WHERE screen_location = 'mortgage_step1'
        AND is_active = true
        AND content_key LIKE 'mortgage_calculation.field.%'
      GROUP BY content_key, component_type
      ORDER BY content_key
    `);
    
    if (duplicates.rows.length === 0) {
      console.log('✅ No mortgage_calculation content found in mortgage_step1');
      return;
    }
    
    console.log('Found incorrectly placed content:');
    duplicates.rows.forEach(row => {
      console.log(`  - ${row.content_key} (${row.component_type}): ${row.count} occurrences`);
    });
    
    // 2. Delete the incorrectly placed content
    console.log('\n2. REMOVING INCORRECTLY PLACED CONTENT:');
    console.log('==========================================');
    
    const deleteResult = await client.query(`
      DELETE FROM content_items 
      WHERE screen_location = 'mortgage_step1'
        AND is_active = true
        AND content_key LIKE 'mortgage_calculation.field.%'
      RETURNING id, content_key, component_type
    `);
    
    console.log(`Deleted ${deleteResult.rowCount} items:`);
    deleteResult.rows.forEach(row => {
      console.log(`  - ${row.content_key} (${row.component_type})`);
    });
    
    // 3. Verify the fix
    console.log('\n3. VERIFYING THE FIX:');
    console.log('======================');
    
    const verification = await client.query(`
      SELECT 
        content_key,
        component_type,
        COUNT(*) as count
      FROM content_items
      WHERE screen_location = 'mortgage_step1'
        AND is_active = true
        AND content_key LIKE '%first_home%'
      GROUP BY content_key, component_type
      ORDER BY content_key
    `);
    
    console.log('Remaining first_home content in mortgage_step1:');
    verification.rows.forEach(row => {
      console.log(`  - ${row.content_key} (${row.component_type}): ${row.count} occurrences`);
    });
    
    // 4. Check for any remaining duplicates
    console.log('\n4. CHECKING FOR REMAINING DUPLICATES:');
    console.log('=====================================');
    
    const remainingDuplicates = await client.query(`
      SELECT 
        content_key,
        component_type,
        COUNT(*) as count
      FROM content_items
      WHERE screen_location = 'mortgage_step1'
        AND is_active = true
      GROUP BY content_key, component_type
      HAVING COUNT(*) > 1
      ORDER BY count DESC, content_key
    `);
    
    if (remainingDuplicates.rows.length === 0) {
      console.log('✅ No remaining duplicates found');
    } else {
      console.log('⚠️ Remaining duplicates found:');
      remainingDuplicates.rows.forEach(row => {
        console.log(`  - ${row.content_key} (${row.component_type}): ${row.count} occurrences`);
      });
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('\n✅ SUCCESS: Duplicate content keys fixed!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during fix:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixDuplicateContentKeys(); 