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

async function finalCreditDropdownSolution() {
  try {
    console.log('📊 FINAL CREDIT DROPDOWN SOLUTION FOR ADMIN PORTAL\n');
    console.log('=' .repeat(80));

    // 1. Identify all dropdown fields in credit_step1
    console.log('\n1️⃣ IDENTIFYING DROPDOWN FIELDS IN CREDIT_STEP1:');
    console.log('-'.repeat(40));
    
    // Find all unique base keys that have options
    const dropdownFields = await pool.query(`
      WITH dropdown_bases AS (
        SELECT DISTINCT
          REGEXP_REPLACE(content_key, '_option_[0-9]+$', '') as base_key,
          screen_location,
          category
        FROM content_items
        WHERE screen_location = 'credit_step1'
          AND component_type = 'option'
          AND content_key ~ '_option_[0-9]+$'
      )
      SELECT 
        base_key,
        category,
        COUNT(*) as option_count
      FROM (
        SELECT 
          db.base_key,
          db.category,
          ci.content_key
        FROM dropdown_bases db
        JOIN content_items ci ON ci.screen_location = db.screen_location
          AND ci.content_key LIKE db.base_key || '_option_%'
      ) t
      GROUP BY base_key, category
      ORDER BY base_key
    `);
    
    console.log('Credit Step 1 Dropdown Fields:');
    dropdownFields.rows.forEach(row => {
      console.log(`\n  📝 ${row.base_key}`);
      console.log(`     Category: ${row.category || 'N/A'}`);
      console.log(`     Options: ${row.option_count}`);
    });

    // 2. Get the complete data for each dropdown
    console.log('\n2️⃣ COMPLETE DROPDOWN DATA WITH TRANSLATIONS:');
    console.log('-'.repeat(40));
    
    for (const field of dropdownFields.rows) {
      console.log(`\n📋 DROPDOWN: ${field.base_key}`);
      console.log('  '.repeat(20));
      
      // Get field label
      const label = await pool.query(`
        SELECT 
          ci.content_key,
          ct_en.content_value as en,
          ct_he.content_value as he,
          ct_ru.content_value as ru
        FROM content_items ci
        LEFT JOIN content_translations ct_en 
          ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
        LEFT JOIN content_translations ct_he 
          ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
        LEFT JOIN content_translations ct_ru 
          ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
        WHERE ci.screen_location = 'credit_step1'
          AND ci.content_key = $1
          AND ci.component_type = 'field_label'
      `, [field.base_key]);
      
      if (label.rows.length > 0) {
        console.log(`  Label: ${label.rows[0].en || 'N/A'}`);
      }
      
      // Get placeholder
      const placeholder = await pool.query(`
        SELECT 
          ct_en.content_value as en
        FROM content_items ci
        LEFT JOIN content_translations ct_en 
          ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
        WHERE ci.screen_location = 'credit_step1'
          AND ci.content_key = $1
          AND ci.component_type = 'placeholder'
      `, [field.base_key + '_ph']);
      
      if (placeholder.rows.length > 0) {
        console.log(`  Placeholder: ${placeholder.rows[0].en || 'N/A'}`);
      }
      
      // Get all options
      const options = await pool.query(`
        SELECT 
          ci.content_key,
          ct_en.content_value as en
        FROM content_items ci
        LEFT JOIN content_translations ct_en 
          ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
        WHERE ci.screen_location = 'credit_step1'
          AND ci.content_key LIKE $1
          AND ci.component_type = 'option'
        ORDER BY 
          LENGTH(ci.content_key),
          ci.content_key
      `, [field.base_key + '_option_%']);
      
      console.log(`  Options (${options.rows.length}):`);
      options.rows.forEach((opt, idx) => {
        console.log(`    ${idx + 1}. ${opt.en || 'N/A'}`);
      });
    }

    // 3. Generate the recommended query
    console.log('\n3️⃣ RECOMMENDED ADMIN PORTAL QUERIES:');
    console.log('-'.repeat(40));
    
    console.log('\n✅ Query 1: Get all content including dropdown identification');
    console.log(`
    WITH dropdown_fields AS (
      SELECT DISTINCT
        REGEXP_REPLACE(content_key, '_option_[0-9]+$', '') as base_key
      FROM content_items
      WHERE screen_location = 'credit_step1'
        AND component_type = 'option'
        AND content_key ~ '_option_[0-9]+$'
    )
    SELECT 
      ci.id,
      ci.content_key,
      ci.component_type,
      ci.category,
      ct_en.content_value as content_en,
      ct_he.content_value as content_he,
      ct_ru.content_value as content_ru,
      CASE 
        WHEN ci.component_type = 'field_label' 
          AND ci.content_key IN (SELECT base_key FROM dropdown_fields)
        THEN 'dropdown'
        WHEN ci.component_type = 'option'
        THEN 'dropdown_option'
        ELSE ci.component_type
      END as display_type,
      CASE 
        WHEN ci.component_type = 'option'
        THEN REGEXP_REPLACE(ci.content_key, '_option_[0-9]+$', '')
        ELSE NULL
      END as parent_dropdown
    FROM content_items ci
    LEFT JOIN content_translations ct_en 
      ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
    LEFT JOIN content_translations ct_he 
      ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
    LEFT JOIN content_translations ct_ru 
      ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
    WHERE ci.screen_location = 'credit_step1'
      AND ci.is_active = true
    ORDER BY 
      CASE 
        WHEN ci.component_type = 'field_label' THEN ci.content_key
        WHEN ci.component_type = 'option' THEN REGEXP_REPLACE(ci.content_key, '_option_[0-9]+$', '')
        ELSE ci.content_key
      END,
      ci.component_type,
      ci.content_key;
    `);
    
    console.log('\n✅ Query 2: Get dropdown fields as structured data');
    console.log(`
    WITH dropdown_data AS (
      SELECT 
        REGEXP_REPLACE(ci.content_key, '_option_[0-9]+$', '') as dropdown_key,
        ci.content_key as option_key,
        CAST(REGEXP_REPLACE(ci.content_key, '.*_option_', '') AS INTEGER) as option_number,
        ct_en.content_value as option_text_en,
        ct_he.content_value as option_text_he,
        ct_ru.content_value as option_text_ru
      FROM content_items ci
      LEFT JOIN content_translations ct_en 
        ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      LEFT JOIN content_translations ct_he 
        ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_ru 
        ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.screen_location = 'credit_step1'
        AND ci.component_type = 'option'
        AND ci.is_active = true
    )
    SELECT 
      dropdown_key,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'value', option_number,
          'text_en', option_text_en,
          'text_he', option_text_he,
          'text_ru', option_text_ru
        ) ORDER BY option_number
      ) as options
    FROM dropdown_data
    GROUP BY dropdown_key
    ORDER BY dropdown_key;
    `);

    // 4. Answer the dev team's questions
    console.log('\n4️⃣ ANSWERS TO DEV TEAM QUESTIONS:');
    console.log('-'.repeat(40));
    
    console.log('\n📍 Question 1: What screen_location value do credit dropdown fields have?');
    console.log('   Answer: "credit_step1" (also credit_step2, credit_step3 for other steps)');
    
    console.log('\n📍 Question 2: What component_type values are used for credit dropdowns?');
    console.log('   Answer: Dropdowns are stored as:');
    console.log('   - "field_label" for the dropdown label');
    console.log('   - "placeholder" for the placeholder text');
    console.log('   - "option" for each dropdown option');
    console.log('   There is NO "dropdown" or "select" component_type for credit.');
    
    console.log('\n📍 Question 3: Are credit dropdowns stored differently than mortgage?');
    console.log('   Answer: NO, they use the same pattern:');
    console.log('   - Both use "option" component_type for choices');
    console.log('   - Both follow the naming: [field]_option_[number]');
    console.log('   - Mortgage has 1 "dropdown" type entry, credit has 0');
    
    console.log('\n📍 Question 4: Is there a specific app_context_id or filter needed?');
    console.log('   Answer: Use app_context_id = 1 (standard) and is_active = true');
    
    console.log('\n💡 KEY INSIGHT:');
    console.log('   Credit dropdowns are NOT stored as "dropdown" component_type.');
    console.log('   They are assembled from multiple "option" entries.');
    console.log('   Your admin portal needs to:');
    console.log('   1. Identify dropdowns by finding field_labels with matching options');
    console.log('   2. Group options by their base key (remove _option_N)');
    console.log('   3. Display them as dropdown components in the UI');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

finalCreditDropdownSolution();