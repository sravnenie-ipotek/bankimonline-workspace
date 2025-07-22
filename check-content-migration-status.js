const { Client } = require('pg');
require('dotenv').config();

async function checkMigrationStatus() {
  const client = new Client({ connectionString: process.env.CONTENT_DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // 1. Check if migration_status column exists
    console.log('=== CHECKING MIGRATION_STATUS COLUMN ===');
    const columnCheck = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'content_items' 
      AND column_name = 'migration_status'
    `);
    
    if (columnCheck.rowCount === 0) {
      console.log('❌ migration_status column does NOT exist in content_items table');
      console.log('\nChecking all columns in content_items table:');
      
      const allColumns = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'content_items' 
        ORDER BY ordinal_position
      `);
      
      console.log('Columns in content_items:');
      allColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
      
    } else {
      console.log('✅ migration_status column exists:');
      columnCheck.rows.forEach(col => {
        console.log(`  - Type: ${col.data_type}`);
        console.log(`  - Default: ${col.column_default || 'NULL'}`);
        console.log(`  - Nullable: ${col.is_nullable}`);
      });
      
      // 2. Check migration status distribution
      console.log('\n=== MIGRATION STATUS DISTRIBUTION ===');
      const statusCount = await client.query(`
        SELECT 
          COALESCE(migration_status, 'NULL') as status, 
          COUNT(*) as count 
        FROM content_items 
        GROUP BY migration_status 
        ORDER BY count DESC
      `);
      
      if (statusCount.rowCount > 0) {
        statusCount.rows.forEach(row => {
          console.log(`  ${row.status}: ${row.count} items`);
        });
        
        // 3. Check pending items details
        console.log('\n=== PENDING ITEMS SAMPLE ===');
        const pendingItems = await client.query(`
          SELECT 
            ci.id,
            ci.content_key,
            ci.screen_location,
            ci.category,
            ci.migration_status,
            COUNT(ct.id) as translation_count
          FROM content_items ci
          LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
          WHERE ci.migration_status = 'pending' OR ci.migration_status IS NULL
          GROUP BY ci.id
          ORDER BY ci.screen_location, ci.content_key
          LIMIT 10
        `);
        
        if (pendingItems.rowCount > 0) {
          console.log(`Found ${pendingItems.rowCount} pending items (showing first 10):`);
          pendingItems.rows.forEach(item => {
            console.log(`  - ${item.screen_location}.${item.content_key} (${item.translation_count} translations)`);
          });
        }
      }
    }
    
    // 4. Check what migration_status values are expected
    console.log('\n=== MIGRATION STATUS ANALYSIS ===');
    console.log('Based on the code analysis:');
    console.log('- "pending": Initial status for new content items');
    console.log('- "migrated": Content successfully migrated from JSON files');
    console.log('- "completed": Content has all required translations and is approved');
    console.log('- NULL: Legacy items or items created before migration_status was added');
    
    console.log('\n=== RECOMMENDATIONS ===');
    console.log('1. If migration_status column exists:');
    console.log('   - Items with "pending" status need to have their translations completed');
    console.log('   - Items with NULL status might need to be updated to "pending" or "completed"');
    console.log('   - Items with "migrated" status are successfully moved from JSON files');
    console.log('\n2. If migration_status column does NOT exist:');
    console.log('   - The column needs to be added to track migration progress');
    console.log('   - Use: ALTER TABLE content_items ADD COLUMN migration_status VARCHAR(20) DEFAULT \'pending\';');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

// Run the check
checkMigrationStatus()
  .then(() => console.log('\n✅ Check complete'))
  .catch(error => console.error('\n❌ Check failed:', error.message));