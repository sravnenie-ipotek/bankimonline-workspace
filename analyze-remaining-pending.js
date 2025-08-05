const { Client } = require('pg');
require('dotenv').config();

async function analyzeRemainingPending() {
  const client = new Client({ connectionString: process.env.CONTENT_DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // 1. Current status summary
    console.log('=== CURRENT MIGRATION STATUS SUMMARY ===');
    const statusSummary = await client.query(`
      SELECT 
        COALESCE(migration_status, 'NULL') as status, 
        COUNT(*) as count 
      FROM content_items 
      GROUP BY migration_status 
      ORDER BY count DESC
    `);
    
    statusSummary.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count} items`);
    });
    
    // 2. Detailed analysis of remaining pending items
    console.log('\n=== DETAILED ANALYSIS OF REMAINING PENDING ITEMS ===');
    const pendingDetails = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ci.category,
        ci.component_type,
        ci.created_at,
        COUNT(ct.id) as translation_count,
        STRING_AGG(DISTINCT ct.language_code || ':' || ct.status, ', ' ORDER BY ct.language_code || ':' || ct.status) as translation_status
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.migration_status = 'pending'
      GROUP BY ci.id
      ORDER BY ci.screen_location, ci.content_key
    `);
    
    console.log(`Found ${pendingDetails.rowCount} pending items:\n`);
    pendingDetails.rows.forEach(item => {
      console.log(`ID: ${item.id}`);
      console.log(`Key: ${item.content_key}`);
      console.log(`Location: ${item.screen_location}`);
      console.log(`Category: ${item.category || 'NULL'}`);
      console.log(`Type: ${item.component_type || 'NULL'}`);
      console.log(`Created: ${item.created_at}`);
      console.log(`Translations: ${item.translation_count} (${item.translation_status || 'none'})`);
      console.log('---');
    });
    
    // 3. Check if these are test/debug items
    console.log('\n=== ANALYSIS OF ITEM PURPOSES ===');
    console.log('Based on the content keys, these appear to be:');
    console.log('1. Test/Debug items:');
    console.log('   - test_location.test_debug_key');
    console.log('   - mortgage_calculation.debug.check.database');
    console.log('   - mortgage_calculation.test.mortgage.simple');
    console.log('   - home_page.app.home.test.mortgage_step');
    console.log('\n2. Mobile-specific items (possibly not implemented yet):');
    console.log('   - mortgage_calculation.app.mortgage.step.mobile_step_1-4');
    console.log('\n3. Video-related content (possibly not implemented):');
    console.log('   - mortgage_calculation.app.mortgage.header.video_calculate_mortgage_title');
    
    // 4. Recommendations
    console.log('\n=== RECOMMENDATIONS ===');
    console.log('1. DELETE test/debug items if they are not needed:');
    console.log(`   DELETE FROM content_items WHERE content_key LIKE '%test%' OR content_key LIKE '%debug%';`);
    
    console.log('\n2. For mobile/video items, either:');
    console.log('   a) Add translations if these features will be implemented');
    console.log('   b) Delete them if they are not needed');
    console.log('   c) Mark them as "inactive" to preserve but hide them');
    
    console.log('\n3. Consider adding a "item_status" column to track:');
    console.log('   - "active" - Normal active content');
    console.log('   - "test" - Test/debug content');
    console.log('   - "deprecated" - Old content kept for reference');
    console.log('   - "planned" - Future content not yet implemented');
    
    // 5. SQL to clean up test items
    console.log('\n=== CLEANUP SQL OPTIONS ===');
    console.log('Option 1 - Delete test/debug items:');
    console.log(`
DELETE FROM content_items 
WHERE content_key LIKE '%test%' 
   OR content_key LIKE '%debug%'
   OR screen_location = 'test_location';
    `);
    
    console.log('\nOption 2 - Mark mobile/video items as inactive:');
    console.log(`
UPDATE content_items 
SET is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE content_key LIKE '%mobile_step%' 
   OR content_key LIKE '%video%';
    `);
    
    console.log('\nOption 3 - Update remaining pending to completed (if appropriate):');
    console.log(`
UPDATE content_items 
SET migration_status = 'completed',
    updated_at = CURRENT_TIMESTAMP
WHERE migration_status = 'pending'
  AND content_key NOT LIKE '%test%'
  AND content_key NOT LIKE '%debug%';
    `);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

// Run the analysis
analyzeRemainingPending()
  .then(() => console.log('\n✅ Analysis complete'))
  .catch(error => console.error('\n❌ Analysis failed:', error.message));