const { Client } = require('pg');
require('dotenv').config();

async function updateMigrationStatus() {
  const client = new Client({ connectionString: process.env.CONTENT_DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // Start transaction
    await client.query('BEGIN');
    console.log('Started transaction');
    
    // 1. First, show what will be updated
    console.log('=== PREVIEW: ITEMS TO BE UPDATED ===');
    const preview = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ci.migration_status,
        COUNT(DISTINCT ct.language_code) as language_count,
        COUNT(CASE WHEN ct.status = 'approved' THEN 1 END) as approved_count
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.migration_status = 'pending'
      GROUP BY ci.id
      HAVING COUNT(DISTINCT ct.language_code) >= 3
        AND COUNT(CASE WHEN ct.status = 'approved' THEN 1 END) >= 3
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 10
    `);
    
    console.log(`Sample of items to be updated (showing 10 of many):`);
    preview.rows.forEach(item => {
      console.log(`  - ${item.screen_location}.${item.content_key} (${item.language_count} languages, ${item.approved_count} approved)`);
    });
    
    // 2. Count total items to update
    const countResult = await client.query(`
      SELECT COUNT(DISTINCT ci.id) as total
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.migration_status = 'pending'
        AND ct.status = 'approved'
      GROUP BY ci.id
      HAVING COUNT(DISTINCT ct.language_code) >= 3
    `);
    
    const totalToUpdate = countResult.rows[0]?.total || 0;
    console.log(`\nTotal items to update: ${totalToUpdate}`);
    
    // 3. Perform the update
    console.log('\n=== UPDATING MIGRATION STATUS ===');
    const updateResult = await client.query(`
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
        )
      RETURNING id, content_key, screen_location
    `);
    
    console.log(`✅ Updated ${updateResult.rowCount} items to 'completed' status`);
    
    // 4. Show remaining pending items
    console.log('\n=== REMAINING PENDING ITEMS ===');
    const remaining = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        COUNT(DISTINCT ct.language_code) as language_count,
        STRING_AGG(DISTINCT ct.language_code, ', ' ORDER BY ct.language_code) as languages,
        COUNT(CASE WHEN ct.status = 'approved' THEN 1 END) as approved_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.migration_status = 'pending'
      GROUP BY ci.id
      ORDER BY language_count DESC, ci.screen_location, ci.content_key
      LIMIT 20
    `);
    
    console.log(`Remaining pending items (${remaining.rowCount} shown):`);
    remaining.rows.forEach(item => {
      console.log(`  - ${item.screen_location}.${item.content_key}: ${item.language_count} languages (${item.languages || 'none'}), ${item.approved_count} approved`);
    });
    
    // 5. Final status summary
    console.log('\n=== FINAL STATUS SUMMARY ===');
    const finalStatus = await client.query(`
      SELECT 
        COALESCE(migration_status, 'NULL') as status, 
        COUNT(*) as count 
      FROM content_items 
      GROUP BY migration_status 
      ORDER BY count DESC
    `);
    
    finalStatus.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count} items`);
    });
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Transaction committed successfully');
    
    // 6. Recommendations for remaining items
    console.log('\n=== RECOMMENDATIONS FOR REMAINING PENDING ITEMS ===');
    console.log('1. Items with 0 translations need content to be added');
    console.log('2. Items with <3 languages need translations for missing languages');
    console.log('3. Items with non-approved translations need review and approval');
    console.log('4. Consider if some pending items are obsolete and can be removed');
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Transaction rolled back due to error');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

// Add command line argument handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

if (dryRun) {
  console.log('DRY RUN MODE - No changes will be made\n');
} else {
  console.log('LIVE MODE - Database will be updated\n');
  console.log('To preview changes without updating, run: node update-migration-status.js --dry-run\n');
}

// Run the update
updateMigrationStatus()
  .then(() => console.log('\n✅ Process complete'))
  .catch(error => console.error('\n❌ Process failed:', error.message));