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

async function checkDropdownTables() {
  try {
    console.log('🔍 SEARCHING FOR DROPDOWN-RELATED TABLES AND DATA\n');
    console.log('=' .repeat(80));

    // 1. Check if there are any tables that might contain dropdown data
    console.log('\n1️⃣ CHECKING FOR DROPDOWN-RELATED TABLES:');
    console.log('-'.repeat(40));
    const dropdownTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (
          table_name LIKE '%dropdown%' 
          OR table_name LIKE '%option%'
          OR table_name LIKE '%select%'
          OR table_name LIKE '%choice%'
          OR table_name LIKE '%list%'
        )
      ORDER BY table_name
    `);
    
    if (dropdownTables.rows.length > 0) {
      console.log('Found potential dropdown tables:');
      dropdownTables.rows.forEach(row => {
        console.log(`  • ${row.table_name}`);
      });
    } else {
      console.log('No dedicated dropdown tables found.');
    }

    // 2. Check the locales table for dropdown content
    console.log('\n2️⃣ CHECKING LOCALES TABLE FOR DROPDOWN CONTENT:');
    console.log('-'.repeat(40));
    const localesDropdowns = await pool.query(`
      SELECT 
        id,
        locale_key,
        en,
        he,
        ru
      FROM locales
      WHERE (
        locale_key LIKE '%credit%dropdown%'
        OR locale_key LIKE '%credit%option%'
        OR locale_key LIKE '%credit%select%'
        OR locale_key LIKE '%credit_target%'
        OR locale_key LIKE '%credit_prolong%'
        OR locale_key LIKE '%credit%purpose%'
      )
      ORDER BY locale_key
      LIMIT 20
    `);
    
    if (localesDropdowns.rows.length > 0) {
      console.log(`Found ${localesDropdowns.rows.length} dropdown-related entries in locales table:`);
      localesDropdowns.rows.forEach(row => {
        console.log(`\n  🔑 ${row.locale_key}`);
        console.log(`     EN: ${row.en ? row.en.substring(0, 50) : 'N/A'}...`);
      });
    } else {
      console.log('No dropdown content found in locales table.');
    }

    // 3. Check for params table or similar configuration tables
    console.log('\n3️⃣ CHECKING PARAMS TABLE:');
    console.log('-'.repeat(40));
    const paramsCheck = await pool.query(`
      SELECT 
        id,
        param_key,
        param_value,
        param_group
      FROM params
      WHERE (
        param_key LIKE '%credit%'
        OR param_key LIKE '%dropdown%'
        OR param_group LIKE '%credit%'
      )
      ORDER BY param_group, param_key
      LIMIT 20
    `);
    
    if (paramsCheck.rows.length > 0) {
      console.log(`Found ${paramsCheck.rows.length} credit-related params:`);
      paramsCheck.rows.forEach(row => {
        console.log(`  • ${row.param_group || 'N/A'} | ${row.param_key}: ${String(row.param_value).substring(0, 50)}...`);
      });
    } else {
      console.log('No credit-related params found.');
    }

    // 4. Check how mortgage dropdowns are stored for comparison
    console.log('\n4️⃣ ANALYZING MORTGAGE DROPDOWN PATTERN:');
    console.log('-'.repeat(40));
    
    // Check for mortgage dropdown content
    const mortgageDropdowns = await pool.query(`
      SELECT 
        content_key,
        component_type,
        screen_location,
        category
      FROM content_items
      WHERE screen_location = 'mortgage_step1'
        AND component_type IN ('dropdown', 'dropdown_option')
      ORDER BY content_key
      LIMIT 10
    `);
    
    if (mortgageDropdowns.rows.length > 0) {
      console.log('Mortgage dropdown pattern found:');
      mortgageDropdowns.rows.forEach(row => {
        console.log(`  • ${row.content_key} | Type: ${row.component_type}`);
      });
    } else {
      console.log('No explicit dropdown types for mortgage either.');
    }

    // Check how mortgage options are structured
    const mortgageOptions = await pool.query(`
      SELECT 
        content_key,
        component_type,
        category,
        COUNT(*) OVER (PARTITION BY SUBSTRING(content_key FROM '^[^_]+_[^_]+_[^_]+')) as option_count
      FROM content_items
      WHERE screen_location = 'mortgage_step1'
        AND component_type = 'option'
      ORDER BY content_key
      LIMIT 10
    `);
    
    console.log('\nMortgage options pattern:');
    mortgageOptions.rows.forEach(row => {
      console.log(`  • ${row.content_key} (${row.option_count} options in group)`);
    });

    // 5. Let's check if credit dropdowns are stored as a JSON field somewhere
    console.log('\n5️⃣ CHECKING FOR JSON COLUMNS THAT MIGHT CONTAIN OPTIONS:');
    console.log('-'.repeat(40));
    
    const jsonColumns = await pool.query(`
      SELECT 
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (data_type = 'json' OR data_type = 'jsonb')
      ORDER BY table_name, column_name
    `);
    
    if (jsonColumns.rows.length > 0) {
      console.log('Found JSON columns that might contain dropdown options:');
      jsonColumns.rows.forEach(row => {
        console.log(`  • ${row.table_name}.${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('No JSON columns found.');
    }

    // 6. Let's create the comprehensive query for the admin portal
    console.log('\n6️⃣ COMPREHENSIVE ADMIN PORTAL QUERY:');
    console.log('-'.repeat(40));
    
    console.log('\n📝 FINAL ANALYSIS & RECOMMENDATIONS:\n');
    
    console.log('Based on the investigation, credit dropdowns are stored as:');
    console.log('1. field_label entries (e.g., calculate_credit_target)');
    console.log('2. placeholder entries (e.g., calculate_credit_target_ph)');
    console.log('3. Multiple option entries (e.g., calculate_credit_target_option_1, _option_2, etc.)');
    console.log('\nThis is the same pattern used for mortgage dropdowns.');
    
    console.log('\n✅ RECOMMENDED ADMIN PORTAL QUERY:');
    console.log(`
    -- Get all credit_step1 content including dropdowns assembled from options
    WITH dropdown_fields AS (
      -- Identify dropdown fields by finding field_labels with corresponding options
      SELECT DISTINCT
        REPLACE(content_key, '_option_1', '') as base_key,
        screen_location
      FROM content_items
      WHERE screen_location = 'credit_step1'
        AND component_type = 'option'
        AND content_key LIKE '%_option_1'
    )
    SELECT 
      ci.id,
      ci.content_key,
      ci.component_type,
      ci.screen_location,
      ci.category,
      ci.app_context_id,
      ct_en.content_value as content_en,
      ct_he.content_value as content_he,
      ct_ru.content_value as content_ru,
      CASE 
        WHEN ci.component_type = 'field_label' 
          AND EXISTS (
            SELECT 1 FROM dropdown_fields df 
            WHERE df.base_key = ci.content_key 
              AND df.screen_location = ci.screen_location
          )
        THEN 'dropdown_field'
        ELSE ci.component_type
      END as effective_type
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
      CASE ci.component_type
        WHEN 'title' THEN 1
        WHEN 'subtitle' THEN 2
        WHEN 'field_label' THEN 3
        WHEN 'placeholder' THEN 4
        WHEN 'option' THEN 5
        WHEN 'error' THEN 6
        ELSE 7
      END,
      ci.content_key;
    `);
    
    console.log('\n🔧 ADMIN PORTAL IMPLEMENTATION TIPS:');
    console.log('1. Dropdowns are identified by field_label + multiple option entries');
    console.log('2. Group options by their base key (remove _option_N suffix)');
    console.log('3. The pattern is: calculate_credit_[field]_option_[number]');
    console.log('4. Include placeholders (_ph suffix) for dropdown hints');
    console.log('5. The component_type "option" contains all dropdown choices');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDropdownTables();