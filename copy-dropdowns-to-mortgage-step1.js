const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function copyDropdownsToMortgageStep1() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting dropdown copy from mortgage_calculation to mortgage_step1\n');
    
    // Start transaction
    await client.query('BEGIN');
    
    // 1. First, let's identify all dropdown content for step 1
    const dropdownContentQuery = `
      SELECT 
        ci.id,
        ci.content_key,
        ci.content_type,
        ci.component_type,
        ci.category,
        ci.description,
        ci.is_active,
        ci.legacy_translation_key,
        ci.migration_status,
        ci.created_by,
        ci.updated_by
      FROM content_items ci
      WHERE ci.screen_location = 'mortgage_calculation'
        AND ci.is_active = true
        AND ci.content_key IN (
          -- City dropdown
          'mortgage_calculation.field.city',
          'mortgage_calculation.field.city_ph',
          
          -- When needed dropdown
          'mortgage_calculation.field.when_needed',
          'mortgage_calculation.field.when_needed_ph',
          'mortgage_calculation.field.when_needed_option_1',
          'mortgage_calculation.field.when_needed_option_2',
          'mortgage_calculation.field.when_needed_option_3',
          'mortgage_calculation.field.when_needed_option_4',
          
          -- Property type dropdown
          'mortgage_calculation.field.type',
          'mortgage_calculation.field.type_ph',
          'mortgage_calculation.field.type_option_1',
          'mortgage_calculation.field.type_option_2',
          'mortgage_calculation.field.type_option_3',
          'mortgage_calculation.field.type_option_4',
          
          -- First home dropdown
          'mortgage_calculation.field.first_home',
          'mortgage_calculation.field.first_home_ph',
          'mortgage_calculation.field.first_home_option_1',
          'mortgage_calculation.field.first_home_option_2',
          'mortgage_calculation.field.first_home_option_3',
          
          -- Property ownership dropdown
          'mortgage_calculation.field.property_ownership',
          'mortgage_calculation.field.property_ownership_ph',
          'mortgage_calculation.field.property_ownership_option_1',
          'mortgage_calculation.field.property_ownership_option_2',
          'mortgage_calculation.field.property_ownership_option_3'
        )
      ORDER BY content_key;
    `;
    
    const dropdownItems = await client.query(dropdownContentQuery);
    console.log(`📊 Found ${dropdownItems.rows.length} dropdown items to copy\n`);
    
    // 2. Check if any of these already exist in mortgage_step1
    const existingCheckQuery = `
      SELECT content_key 
      FROM content_items 
      WHERE screen_location = 'mortgage_step1'
        AND content_key LIKE 'mortgage_step1.field.%'
    `;
    
    const existing = await client.query(existingCheckQuery);
    const existingKeys = new Set(existing.rows.map(r => r.content_key));
    
    if (existingKeys.size > 0) {
      console.log(`⚠️  Found ${existingKeys.size} existing items in mortgage_step1`);
      console.log('These will be skipped to avoid duplicates.\n');
    }
    
    // 3. Create a mapping of old parent IDs to new parent IDs
    const parentIdMap = new Map();
    let copiedCount = 0;
    
    // 4. Copy items (parents first, then children)
    // First pass: Copy items without parents
    for (const item of dropdownItems.rows) {
      if (!item.parent_id) {
        const newKey = item.content_key.replace('mortgage_calculation', 'mortgage_step1');
        
        if (existingKeys.has(newKey)) {
          console.log(`⏭️  Skipping existing: ${newKey}`);
          continue;
        }
        
        const insertResult = await client.query(`
          INSERT INTO content_items (
            content_key, screen_location, component_type, field_type,
            validation_rules, default_value, parent_id, metadata,
            is_required, is_active, created_by, updated_by, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
          ) RETURNING id
        `, [
          newKey,
          'mortgage_step1',
          item.component_type,
          item.field_type,
          item.validation_rules,
          item.default_value,
          null, // parent_id
          item.metadata,
          item.is_required,
          item.is_active,
          item.created_by || 'system',
          item.updated_by || 'system'
        ]);
        
        parentIdMap.set(item.content_key, insertResult.rows[0].id);
        copiedCount++;
        console.log(`✅ Copied: ${item.content_key} → ${newKey}`);
      }
    }
    
    // Second pass: Copy items with parents
    for (const item of dropdownItems.rows) {
      if (item.parent_id) {
        // Find the parent's new ID
        const parentKeyResult = await client.query(
          'SELECT content_key FROM content_items WHERE id = $1',
          [item.parent_id]
        );
        
        if (parentKeyResult.rows.length === 0) continue;
        
        const parentKey = parentKeyResult.rows[0].content_key;
        const newParentId = parentIdMap.get(parentKey);
        
        if (!newParentId) {
          console.log(`⚠️  Cannot find new parent for: ${item.content_key}`);
          continue;
        }
        
        const newKey = item.content_key.replace('mortgage_calculation', 'mortgage_step1');
        
        if (existingKeys.has(newKey)) {
          console.log(`⏭️  Skipping existing: ${newKey}`);
          continue;
        }
        
        const insertResult = await client.query(`
          INSERT INTO content_items (
            content_key, screen_location, component_type, field_type,
            validation_rules, default_value, parent_id, metadata,
            is_required, is_active, created_by, updated_by, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
          ) RETURNING id
        `, [
          newKey,
          'mortgage_step1',
          item.component_type,
          item.field_type,
          item.validation_rules,
          item.default_value,
          newParentId,
          item.metadata,
          item.is_required,
          item.is_active,
          item.created_by || 'system',
          item.updated_by || 'system'
        ]);
        
        copiedCount++;
        console.log(`✅ Copied: ${item.content_key} → ${newKey}`);
      }
    }
    
    // 5. Copy translations for all new items
    console.log('\n📝 Copying translations...\n');
    
    const translationsCopyQuery = `
      INSERT INTO content_translations (
        content_item_id, language_code, content_value, 
        is_default, status, created_at, updated_at, 
        created_by, approved_by, approved_at
      )
      SELECT 
        new_ci.id,
        ct.language_code,
        ct.content_value,
        ct.is_default,
        ct.status,
        NOW(),
        NOW(),
        ct.created_by,
        ct.approved_by,
        ct.approved_at
      FROM content_items old_ci
      JOIN content_translations ct ON old_ci.id = ct.content_item_id
      JOIN content_items new_ci ON new_ci.content_key = REPLACE(old_ci.content_key, 'mortgage_calculation', 'mortgage_step1')
      WHERE old_ci.screen_location = 'mortgage_calculation'
        AND new_ci.screen_location = 'mortgage_step1'
        AND old_ci.content_key IN (
          'mortgage_calculation.field.city',
          'mortgage_calculation.field.city_ph',
          'mortgage_calculation.field.when_needed',
          'mortgage_calculation.field.when_needed_ph',
          'mortgage_calculation.field.when_needed_option_1',
          'mortgage_calculation.field.when_needed_option_2',
          'mortgage_calculation.field.when_needed_option_3',
          'mortgage_calculation.field.when_needed_option_4',
          'mortgage_calculation.field.type',
          'mortgage_calculation.field.type_ph',
          'mortgage_calculation.field.type_option_1',
          'mortgage_calculation.field.type_option_2',
          'mortgage_calculation.field.type_option_3',
          'mortgage_calculation.field.type_option_4',
          'mortgage_calculation.field.first_home',
          'mortgage_calculation.field.first_home_ph',
          'mortgage_calculation.field.first_home_option_1',
          'mortgage_calculation.field.first_home_option_2',
          'mortgage_calculation.field.first_home_option_3',
          'mortgage_calculation.field.property_ownership',
          'mortgage_calculation.field.property_ownership_ph',
          'mortgage_calculation.field.property_ownership_option_1',
          'mortgage_calculation.field.property_ownership_option_2',
          'mortgage_calculation.field.property_ownership_option_3'
        )
        AND NOT EXISTS (
          SELECT 1 FROM content_translations existing_ct 
          WHERE existing_ct.content_item_id = new_ci.id 
            AND existing_ct.language_code = ct.language_code
        );
    `;
    
    const translationResult = await client.query(translationsCopyQuery);
    console.log(`✅ Copied ${translationResult.rowCount} translations\n`);
    
    // 6. Verify the copy
    const verifyQuery = `
      SELECT 
        ci.content_key,
        COUNT(DISTINCT ct.language_code) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step1'
        AND ci.content_key LIKE 'mortgage_step1.field.%'
      GROUP BY ci.content_key
      ORDER BY ci.content_key;
    `;
    
    const verifyResult = await client.query(verifyQuery);
    console.log('📋 Verification - Items in mortgage_step1:\n');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.content_key} (${row.translation_count} languages)`);
    });
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`\n✅ SUCCESS: Copied ${copiedCount} dropdown items to mortgage_step1`);
    console.log('\n⚠️  IMPORTANT NEXT STEPS:');
    console.log('1. Update React components to use "mortgage_step1" instead of "mortgage_calculation"');
    console.log('2. Test that all dropdowns appear correctly in the admin panel');
    console.log('3. Verify that the frontend still works correctly');
    console.log('\nTo update React components, change:');
    console.log('  const { getContent } = useContentApi("mortgage_calculation")');
    console.log('  to:');
    console.log('  const { getContent } = useContentApi("mortgage_step1")');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during copy:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Add command line option to execute
if (process.argv[2] === '--execute') {
  copyDropdownsToMortgageStep1()
    .then(() => console.log('\n✅ Copy completed successfully'))
    .catch(err => {
      console.error('\n❌ Copy failed:', err.message);
      process.exit(1);
    });
} else {
  console.log('📌 DRY RUN MODE - Review the script');
  console.log('To execute, run: node copy-dropdowns-to-mortgage-step1.js --execute');
  console.log('\nThis script will:');
  console.log('1. Copy all 5 dropdown definitions from mortgage_calculation to mortgage_step1');
  console.log('2. Update content keys to use mortgage_step1 prefix');
  console.log('3. Copy all translations (Hebrew, English, Russian)');
  console.log('4. Maintain parent-child relationships for dropdown options');
  console.log('5. Skip any existing items to avoid duplicates');
}