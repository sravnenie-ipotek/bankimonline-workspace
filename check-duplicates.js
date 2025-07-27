const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

async function checkDuplicates() {
  try {
    // Check for duplicate content_keys across different screen_locations
    const duplicatesResult = await pool.query(`
      SELECT content_key, ARRAY_AGG(DISTINCT screen_location ORDER BY screen_location) AS screens, COUNT(DISTINCT screen_location) as location_count
      FROM content_items
      GROUP BY content_key
      HAVING COUNT(DISTINCT screen_location) > 1
      ORDER BY location_count DESC, content_key
    `);
    
    console.log('🔍 Checking for duplicate content_keys across screen_locations...\n');
    
    if (duplicatesResult.rows.length === 0) {
      console.log('✅ No duplicate content_keys found across different screen_locations!');
    } else {
      console.log('⚠️  Found duplicate content_keys:');
      console.log('================================');
      duplicatesResult.rows.forEach(row => {
        console.log(`\n📌 ${row.content_key}`);
        console.log(`   Locations (${row.location_count}): ${row.screens.join(', ')}`);
      });
    }
    
    // Check calculate_credit specific content
    const creditContentResult = await pool.query(`
      SELECT screen_location, COUNT(*) as content_items, 
             COUNT(CASE WHEN component_type = 'field_label' THEN 1 END) as labels,
             COUNT(CASE WHEN component_type = 'placeholder' THEN 1 END) as placeholders,
             COUNT(CASE WHEN component_type = 'option' THEN 1 END) as options,
             COUNT(CASE WHEN component_type = 'button' THEN 1 END) as buttons,
             COUNT(CASE WHEN component_type = 'title' THEN 1 END) as titles
      FROM content_items 
      WHERE screen_location LIKE 'calculate_credit_%'
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('\n\n📊 Calculate Credit Content Summary:');
    console.log('=====================================');
    creditContentResult.rows.forEach(row => {
      console.log(`\n${row.screen_location}:`);
      console.log(`  Total items: ${row.content_items}`);
      console.log(`  - Labels: ${row.labels}`);
      console.log(`  - Placeholders: ${row.placeholders}`);
      console.log(`  - Options: ${row.options}`);
      console.log(`  - Buttons: ${row.buttons}`);
      console.log(`  - Titles: ${row.titles}`);
    });
    
    // Check for missing calculate_credit_3 content
    const step3Result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE screen_location = 'calculate_credit_3'
    `);
    
    if (step3Result.rows[0].count === 0) {
      console.log('\n❌ calculate_credit_3 has NO content in database!');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDuplicates();