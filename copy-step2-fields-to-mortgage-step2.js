const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function copyStep2FieldsToMortgageStep2() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting copy of step 2 fields from mortgage_calculation to mortgage_step2\n');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Define all step 2 content keys that need to be copied
    const step2Keys = [
      // Birth date
      'mortgage_calculation.field.birth_date',
      'mortgage_calculation.field.birth_date_ph',
      
      // Children under 18
      'mortgage_calculation.field.children18',
      'mortgage_calculation.field.children18_ph',
      'mortgage_calculation.field.how_much_childrens',
      'mortgage_calculation.field.how_much_childrens_ph',
      
      // Citizenship
      'mortgage_calculation.field.citizenship',
      'mortgage_calculation.field.citizenship_ph',
      
      // Education (full set)
      'mortgage_calculation.field.education',
      'mortgage_calculation.field.education_ph',
      'mortgage_calculation.field.education_option_1',
      'mortgage_calculation.field.education_option_2',
      'mortgage_calculation.field.education_option_3',
      'mortgage_calculation.field.education_option_4',
      'mortgage_calculation.field.education_option_5',
      'mortgage_calculation.field.education_option_6',
      'mortgage_calculation.field.education_option_7',
      
      // Family status (full set)
      'mortgage_calculation.field.family_status',
      'mortgage_calculation.field.family_status_ph',
      'mortgage_calculation.field.family_status_option_1',
      'mortgage_calculation.field.family_status_option_2',
      'mortgage_calculation.field.family_status_option_3',
      'mortgage_calculation.field.family_status_option_4',
      'mortgage_calculation.field.family_status_option_5',
      'mortgage_calculation.field.family_status_option_6',
      
      // Tax obligations
      'mortgage_calculation.field.tax',
      'mortgage_calculation.field.tax_ph',
      
      // Health insurance
      'mortgage_calculation.field.is_medinsurance',
      'mortgage_calculation.field.is_medinsurance_ph',
      
      // Public position
      'mortgage_calculation.field.is_public',
      'mortgage_calculation.field.is_public_ph',
      
      // Partner participation
      'mortgage_calculation.field.partner_pay_mortgage',
      'mortgage_calculation.field.partner_pay_mortgage_ph',
      
      // Add partner button
      'mortgage_calculation.button.add_partner',
      
      // Other personal fields
      'mortgage_calculation.field.name_surname',
      'mortgage_calculation.field.name_surname_ph',
      'mortgage_calculation.field.borrowers',
      'mortgage_calculation.field.borrowers_ph',
      'mortgage_calculation.field.is_foreigner',
      'mortgage_calculation.field.is_foreigner_ph'
    ];
    
    console.log(`📋 Will attempt to copy ${step2Keys.length} step 2 items\n`);
    
    // Check what already exists in mortgage_step2
    const existingCheck = await client.query(`
      SELECT content_key 
      FROM content_items 
      WHERE screen_location = 'mortgage_step2'
        AND content_key LIKE 'mortgage_step2.%'
    `);
    
    const existingKeys = new Set(existingCheck.rows.map(r => r.content_key));
    console.log(`Found ${existingKeys.size} existing items in mortgage_step2\n`);
    
    let copiedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;
    
    // Copy each item
    for (const oldKey of step2Keys) {
      const newKey = oldKey.replace('mortgage_calculation', 'mortgage_step2');
      
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
        notFoundCount++;
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
        'mortgage_step2',
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
    
    // Copy translations
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
      JOIN content_items new_ci ON new_ci.content_key = REPLACE(old_ci.content_key, 'mortgage_calculation', 'mortgage_step2')
      WHERE old_ci.screen_location = 'mortgage_calculation'
        AND new_ci.screen_location = 'mortgage_step2'
        AND old_ci.content_key = ANY($1::text[])
        AND NOT EXISTS (
          SELECT 1 FROM content_translations existing_ct 
          WHERE existing_ct.content_item_id = new_ci.id 
            AND existing_ct.language_code = ct.language_code
        );
    `, [step2Keys]);
    
    console.log(`✅ Copied ${translationResult.rowCount} translations\n`);
    
    // Verify the results - count all form fields in mortgage_step2
    const verifyResult = await client.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.content_value as hebrew_text,
        CASE 
          WHEN ci.content_key LIKE '%education%' THEN '1. Education'
          WHEN ci.content_key LIKE '%family_status%' THEN '2. Family Status'
          WHEN ci.content_key LIKE '%citizenship%' THEN '3. Citizenship'
          WHEN ci.content_key LIKE '%children%' THEN '4. Children'
          WHEN ci.content_key LIKE '%birth%' THEN '5. Birth Date'
          WHEN ci.content_key LIKE '%tax%' THEN '6. Tax Obligations'
          WHEN ci.content_key LIKE '%medinsurance%' THEN '7. Health Insurance'
          WHEN ci.content_key LIKE '%public%' THEN '8. Public Position'
          WHEN ci.content_key LIKE '%partner%' THEN '9. Partner Participation'
          WHEN ci.content_key LIKE '%name%' THEN '10. Name'
          WHEN ci.content_key LIKE '%borrowers%' THEN '11. Borrowers'
          WHEN ci.content_key LIKE '%foreigner%' THEN '12. Foreign Resident'
          ELSE '99. Other'
        END as field_group,
        CASE 
          WHEN ci.content_key LIKE '%_option_%' THEN 'option'
          WHEN ci.content_key LIKE '%_ph' THEN 'placeholder'
          WHEN ci.component_type IN ('dropdown', 'select', 'radio') THEN 'dropdown'
          WHEN ci.component_type = 'button' THEN 'button'
          ELSE 'field'
        END as element_type
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
      WHERE ci.screen_location = 'mortgage_step2'
        AND ci.content_key LIKE 'mortgage_step2.%'
      ORDER BY field_group, element_type, ci.content_key;
    `);
    
    console.log('📋 Final verification - All form elements in mortgage_step2:\n');
    
    // Count unique dropdowns/fields
    const fieldGroups = new Map();
    verifyResult.rows.forEach(row => {
      const group = row.field_group;
      if (!fieldGroups.has(group)) {
        fieldGroups.set(group, { count: 0, hasOptions: false });
      }
      fieldGroups.get(group).count++;
      if (row.element_type === 'option') {
        fieldGroups.get(group).hasOptions = true;
      }
    });
    
    let dropdownCount = 0;
    let fieldCount = 0;
    fieldGroups.forEach((data, group) => {
      if (data.hasOptions || group.includes('Status') || group.includes('Education')) {
        dropdownCount++;
      } else if (!group.includes('Other')) {
        fieldCount++;
      }
    });
    
    console.log(`Total interactive fields: ${dropdownCount + fieldCount}`);
    console.log(`- Dropdowns/Selects: ${dropdownCount}`);
    console.log(`- Yes/No fields: ${fieldCount}`);
    console.log(`- Total items in database: ${verifyResult.rows.length}\n`);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`\n✅ SUCCESS: Copied ${copiedCount} items, skipped ${skippedCount} existing, ${notFoundCount} not found`);
    console.log('\n📌 NEXT STEPS:');
    console.log('1. Update DROPDOWNS_BY_SCREEN.md to reflect the accurate count');
    console.log('2. Update React components to use mortgage_step2 if needed');
    
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
copyStep2FieldsToMortgageStep2()
  .catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
  });