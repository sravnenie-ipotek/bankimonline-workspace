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
    
    // 1. Define all dropdown content keys to copy
    const dropdownKeys = [
      // City dropdown
      'mortgage_calculation.field.city',
      'mortgage_calculation.field.city_ph',
      
      // When needed dropdown
      'mortgage_calculation.field.when_needed',
      'mortgage_calculation.field.when_needed_ph',
      'mortgage_calculation.field.when_needed_option_1',
      'mortgage_calculation.field.when_needed_option_2',
      'mortgage_calculation.field.when_needed_option_3',
      'mortgage_calculation.field.when_needed_option_4',
      
      // Property type dropdown
      'mortgage_calculation.field.type',
      'mortgage_calculation.field.type_ph',
      'mortgage_calculation.field.type_option_1',
      'mortgage_calculation.field.type_option_2',
      'mortgage_calculation.field.type_option_3',
      'mortgage_calculation.field.type_option_4',
      
      // First home dropdown
      'mortgage_calculation.field.first_home',
      'mortgage_calculation.field.first_home_ph',
      'mortgage_calculation.field.first_home_option_1',
      'mortgage_calculation.field.first_home_option_2',
      'mortgage_calculation.field.first_home_option_3',
      
      // Property ownership dropdown
      'mortgage_calculation.field.property_ownership',
      'mortgage_calculation.field.property_ownership_ph',
      'mortgage_calculation.field.property_ownership_option_1',
      'mortgage_calculation.field.property_ownership_option_2',
      'mortgage_calculation.field.property_ownership_option_3'
    ];
    
    console.log(`📋 Will copy ${dropdownKeys.length} dropdown items\n`);
    
    // 2. Check what already exists in mortgage_step1
    const existingCheck = await client.query(`
      SELECT content_key 
      FROM content_items 
      WHERE screen_location = 'mortgage_step1'
        AND content_key LIKE 'mortgage_step1.field.%'
    `);
    
    const existingKeys = new Set(existingCheck.rows.map(r => r.content_key));
    console.log(`Found ${existingKeys.size} existing items in mortgage_step1\n`);
    
    let copiedCount = 0;
    let skippedCount = 0;
    
    // 3. Copy each item
    for (const oldKey of dropdownKeys) {
      const newKey = oldKey.replace('mortgage_calculation', 'mortgage_step1');
      
      // Skip if already exists
      if (existingKeys.has(newKey)) {
        console.log(`⏭️  Skipping existing: ${newKey}`);
        skippedCount++;
        continue;
      }
      
      // Get the original item
      const originalItem = await client.query(`
        SELECT 
          content_type,
          component_type,
          category,
          description,
          is_active,
          legacy_translation_key,
          migration_status,
          created_by,
          updated_by
        FROM content_items
        WHERE content_key = $1
          AND screen_location = 'mortgage_calculation'
      `, [oldKey]);
      
      if (originalItem.rows.length === 0) {
        console.log(`⚠️  Not found: ${oldKey}`);
        continue;
      }
      
      const item = originalItem.rows[0];
      
      // Insert the new item
      await client.query(`
        INSERT INTO content_items (
          content_key, screen_location, content_type, component_type,
          category, description, is_active, legacy_translation_key,
          migration_status, created_by, updated_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        )
      `, [
        newKey,
        'mortgage_step1',
        item.content_type,
        item.component_type,
        item.category,
        item.description,
        item.is_active,
        item.legacy_translation_key,
        item.migration_status,
        item.created_by || 1,
        item.updated_by || 1
      ]);
      
      console.log(`✅ Copied: ${oldKey} → ${newKey}`);
      copiedCount++;
    }
    
    // 4. Copy translations
    console.log('\n📝 Copying translations...\n');
    
    const translationResult = await client.query(`
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
        COALESCE(ct.created_by, 1),
        ct.approved_by,
        ct.approved_at
      FROM content_items old_ci
      JOIN content_translations ct ON old_ci.id = ct.content_item_id
      JOIN content_items new_ci ON new_ci.content_key = REPLACE(old_ci.content_key, 'mortgage_calculation', 'mortgage_step1')
      WHERE old_ci.screen_location = 'mortgage_calculation'
        AND new_ci.screen_location = 'mortgage_step1'
        AND old_ci.content_key = ANY($1::text[])
        AND NOT EXISTS (
          SELECT 1 FROM content_translations existing_ct 
          WHERE existing_ct.content_item_id = new_ci.id 
            AND existing_ct.language_code = ct.language_code
        );
    `, [dropdownKeys]);
    
    console.log(`✅ Copied ${translationResult.rowCount} translations\n`);
    
    // 5. Verify the results
    const verifyResult = await client.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        COUNT(DISTINCT ct.language_code) as translation_count,
        array_agg(DISTINCT ct.language_code ORDER BY ct.language_code) as languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step1'
        AND ci.content_key LIKE 'mortgage_step1.field.%'
      GROUP BY ci.content_key, ci.component_type
      ORDER BY 
        CASE 
          WHEN ci.content_key LIKE '%city%' THEN 1
          WHEN ci.content_key LIKE '%when_needed%' THEN 2
          WHEN ci.content_key LIKE '%type%' THEN 3
          WHEN ci.content_key LIKE '%first_home%' THEN 4
          WHEN ci.content_key LIKE '%property_ownership%' THEN 5
        END,
        ci.content_key;
    `);
    
    console.log('📋 Final verification - Items in mortgage_step1:\n');
    console.log('Key | Type | Languages');
    console.log('─'.repeat(80));
    verifyResult.rows.forEach(row => {
      const key = row.content_key.replace('mortgage_step1.field.', '');
      console.log(`${key.padEnd(40)} | ${(row.component_type || 'text').padEnd(10)} | ${row.languages ? row.languages.join(', ') : 'none'}`);
    });
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`\n✅ SUCCESS: Copied ${copiedCount} items, skipped ${skippedCount} existing items`);
    console.log('\n📌 NEXT STEPS:');
    console.log('1. Check admin panel - dropdowns should now appear under mortgage_step1');
    console.log('2. Update React components to use mortgage_step1:');
    console.log('   - FirstStep.tsx (line 64)');
    console.log('   - FirstStepForm.tsx (line 29)');
    console.log('3. Update all content keys in the code from mortgage_calculation to mortgage_step1');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute
copyDropdownsToMortgageStep1()
  .catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
  });