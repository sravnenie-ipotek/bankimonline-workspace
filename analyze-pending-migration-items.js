const { Client } = require('pg');
require('dotenv').config();

async function analyzePendingItems() {
  const client = new Client({ connectionString: process.env.CONTENT_DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // 1. Analyze pending items by screen location
    console.log('=== PENDING ITEMS BY SCREEN LOCATION ===');
    const byScreen = await client.query(`
      SELECT 
        screen_location,
        COUNT(*) as total_items,
        COUNT(CASE WHEN migration_status = 'pending' THEN 1 END) as pending_items,
        COUNT(CASE WHEN migration_status = 'migrated' THEN 1 END) as migrated_items
      FROM content_items
      GROUP BY screen_location
      ORDER BY pending_items DESC
    `);
    
    console.log('Screen Location Distribution:');
    byScreen.rows.forEach(row => {
      console.log(`  ${row.screen_location}: ${row.pending_items} pending, ${row.migrated_items} migrated (${row.total_items} total)`);
    });
    
    // 2. Check if pending items have complete translations
    console.log('\n=== PENDING ITEMS WITH COMPLETE TRANSLATIONS ===');
    const completeTranslations = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ci.migration_status,
        COUNT(DISTINCT ct.language_code) as language_count,
        STRING_AGG(DISTINCT ct.language_code, ', ' ORDER BY ct.language_code) as languages,
        COUNT(CASE WHEN ct.status = 'approved' THEN 1 END) as approved_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.migration_status = 'pending'
      GROUP BY ci.id
      HAVING COUNT(DISTINCT ct.language_code) >= 3
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 20
    `);
    
    console.log(`Found ${completeTranslations.rowCount} pending items with translations in 3+ languages:`);
    completeTranslations.rows.forEach(item => {
      console.log(`  - ${item.content_key} (${item.languages}) - ${item.approved_count} approved`);
    });
    
    // 3. Check the purpose of migration_status
    console.log('\n=== UNDERSTANDING MIGRATION_STATUS PURPOSE ===');
    console.log('Based on the analysis:');
    console.log('1. "pending" - New content items that need review or completion');
    console.log('2. "migrated" - Content that was moved from JSON translation files to database');
    console.log('3. "completed" - Would indicate fully reviewed and approved content');
    
    // 4. Recommend actions
    console.log('\n=== RECOMMENDED ACTIONS ===');
    
    // Count items ready for status update
    const readyForCompletion = await client.query(`
      SELECT COUNT(DISTINCT ci.id) as count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.migration_status = 'pending'
        AND ct.status = 'approved'
      GROUP BY ci.id
      HAVING COUNT(DISTINCT ct.language_code) >= 3
    `);
    
    console.log(`\n1. UPDATE ${readyForCompletion.rowCount} items from 'pending' to 'completed':`);
    console.log('   These items have approved translations in all 3 languages');
    
    // Items needing translation review
    const needsTranslation = await client.query(`
      SELECT COUNT(*) as count
      FROM content_items ci
      WHERE ci.migration_status = 'pending'
        AND ci.id NOT IN (
          SELECT DISTINCT ci2.id
          FROM content_items ci2
          JOIN content_translations ct2 ON ci2.id = ct2.content_item_id
          WHERE ct2.status = 'approved'
          GROUP BY ci2.id
          HAVING COUNT(DISTINCT ct2.language_code) >= 3
        )
    `);
    
    console.log(`\n2. REVIEW ${needsTranslation.rows[0].count} items that need translation completion:`);
    console.log('   These items are missing approved translations in one or more languages');
    
    // Show SQL to update completed items
    console.log('\n=== SQL TO UPDATE COMPLETED ITEMS ===');
    console.log(`
UPDATE content_items 
SET migration_status = 'completed',
    updated_at = CURRENT_TIMESTAMP
WHERE migration_status = 'pending' 
  AND id IN (
    SELECT DISTINCT ci.id
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ct.status = 'approved'
    GROUP BY ci.id
    HAVING COUNT(DISTINCT ct.language_code) >= 3
  );
    `);
    
    // 5. Check specific examples
    console.log('\n=== SAMPLE PENDING ITEMS ANALYSIS ===');
    const sampleItems = await client.query(`
      SELECT 
        ci.content_key,
        ci.screen_location,
        json_agg(
          json_build_object(
            'lang', ct.language_code,
            'value', LEFT(ct.content_value, 50),
            'status', ct.status
          ) ORDER BY ct.language_code
        ) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.migration_status = 'pending'
      GROUP BY ci.id
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 5
    `);
    
    console.log('Sample pending items with their translations:');
    sampleItems.rows.forEach(item => {
      console.log(`\n${item.content_key} (${item.screen_location}):`);
      item.translations.forEach(trans => {
        if (trans.lang) {
          console.log(`  ${trans.lang}: "${trans.value}..." [${trans.status}]`);
        }
      });
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

// Run the analysis
analyzePendingItems()
  .then(() => console.log('\n✅ Analysis complete'))
  .catch(error => console.error('\n❌ Analysis failed:', error.message));