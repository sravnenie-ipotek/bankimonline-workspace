require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

// Use CONTENT_DATABASE_URL from environment
const DATABASE_URL = process.env.CONTENT_DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function analyzeContentDatabase() {
  try {
    console.log('🔍 COMPREHENSIVE CONTENT DATABASE ANALYSIS');
    console.log('==========================================');
    
    // 1. Content Items Per Step Analysis
    console.log('\n📊 1. CONTENT ITEMS PER STEP ANALYSIS');
    console.log('=====================================');
    
    const stepAnalysis = await pool.query(`
      SELECT 
        screen_location,
        component_type,
        COUNT(*) as item_count,
        COUNT(DISTINCT content_key) as unique_keys
      FROM content_items 
      WHERE screen_location LIKE '%step%'
      GROUP BY screen_location, component_type
      ORDER BY screen_location, component_type
    `);
    
    console.log('Screen Location | Component Type | Items | Unique Keys');
    console.log('----------------------------------------------------------');
    stepAnalysis.rows.forEach(row => {
      console.log(`${row.screen_location.padEnd(20)} | ${row.component_type.padEnd(18)} | ${row.item_count.toString().padEnd(5)} | ${row.unique_keys}`);
    });
    
    // 2. Duplicate Content Keys Analysis
    console.log('\n🔍 2. DUPLICATE CONTENT KEYS ANALYSIS');
    console.log('====================================');
    
    const duplicateKeys = await pool.query(`
      SELECT 
        content_key,
        COUNT(*) as occurrences,
        array_agg(DISTINCT screen_location) as screens,
        array_agg(DISTINCT component_type) as component_types
      FROM content_items 
      GROUP BY content_key 
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC, content_key
      LIMIT 20
    `);
    
    console.log('Content Key | Occurrences | Screens | Component Types');
    console.log('----------------------------------------------------------------');
    duplicateKeys.rows.forEach(row => {
      console.log(`${row.content_key.substring(0, 40).padEnd(40)} | ${row.occurrences.toString().padEnd(11)} | ${row.screens.join(', ').substring(0, 30).padEnd(30)} | ${row.component_types.join(', ')}`);
    });
    
    // 3. Context Distribution Analysis  
    console.log('\n🏗️ 3. CONTEXT DISTRIBUTION ANALYSIS');
    console.log('===================================');
    
    const contextAnalysis = await pool.query(`
      SELECT 
        CASE 
          WHEN screen_location LIKE 'mortgage_%' THEN 'mortgage'
          WHEN screen_location LIKE 'credit_%' THEN 'credit'
          WHEN screen_location LIKE 'refinance_%' THEN 'refinance'
          WHEN screen_location LIKE 'other_%' THEN 'other_borrowers'
          WHEN screen_location LIKE 'admin_%' THEN 'admin'
          WHEN screen_location LIKE 'cms_%' THEN 'cms'
          WHEN screen_location LIKE 'bank_%' THEN 'bank_ops'
          ELSE 'other'
        END as context,
        component_type,
        COUNT(*) as item_count
      FROM content_items 
      GROUP BY 
        CASE 
          WHEN screen_location LIKE 'mortgage_%' THEN 'mortgage'
          WHEN screen_location LIKE 'credit_%' THEN 'credit'
          WHEN screen_location LIKE 'refinance_%' THEN 'refinance'
          WHEN screen_location LIKE 'other_%' THEN 'other_borrowers'
          WHEN screen_location LIKE 'admin_%' THEN 'admin'
          WHEN screen_location LIKE 'cms_%' THEN 'cms'
          WHEN screen_location LIKE 'bank_%' THEN 'bank_ops'
          ELSE 'other'
        END, 
        component_type
      ORDER BY context, component_type
    `);
    
    console.log('Context | Component Type | Item Count');
    console.log('----------------------------------------');
    contextAnalysis.rows.forEach(row => {
      console.log(`${row.context.padEnd(15)} | ${row.component_type.padEnd(18)} | ${row.item_count}`);
    });
    
    // 4. High Volume Screen Analysis
    console.log('\n📈 4. HIGH VOLUME SCREEN ANALYSIS');
    console.log('=================================');
    
    const highVolumeScreens = await pool.query(`
      SELECT 
        screen_location,
        COUNT(*) as total_items,
        COUNT(DISTINCT component_type) as component_types,
        array_agg(DISTINCT component_type) as types_list
      FROM content_items 
      GROUP BY screen_location 
      HAVING COUNT(*) > 15
      ORDER BY COUNT(*) DESC
    `);
    
    console.log('Screen Location | Total Items | Component Types | Types List');
    console.log('---------------------------------------------------------------');
    highVolumeScreens.rows.forEach(row => {
      console.log(`${row.screen_location.padEnd(20)} | ${row.total_items.toString().padEnd(11)} | ${row.component_types.toString().padEnd(15)} | ${row.types_list.join(', ')}`);
    });
    
    // 5. Translation Coverage Analysis
    console.log('\n🌐 5. TRANSLATION COVERAGE ANALYSIS');
    console.log('===================================');
    
    const translationCoverage = await pool.query(`
      SELECT 
        ci.screen_location,
        COUNT(ci.id) as total_items,
        COUNT(CASE WHEN ct_en.content_item_id IS NOT NULL THEN 1 END) as english_translations,
        COUNT(CASE WHEN ct_he.content_item_id IS NOT NULL THEN 1 END) as hebrew_translations,
        COUNT(CASE WHEN ct_ru.content_item_id IS NOT NULL THEN 1 END) as russian_translations,
        ROUND(
          COUNT(CASE WHEN ct_en.content_item_id IS NOT NULL AND ct_he.content_item_id IS NOT NULL AND ct_ru.content_item_id IS NOT NULL THEN 1 END) * 100.0 / COUNT(ci.id), 
          1
        ) as complete_coverage_percent
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.screen_location LIKE '%step%'
      GROUP BY ci.screen_location
      ORDER BY complete_coverage_percent ASC, ci.screen_location
    `);
    
    console.log('Screen Location | Total | EN | HE | RU | Complete %');
    console.log('------------------------------------------------------');
    translationCoverage.rows.forEach(row => {
      console.log(`${row.screen_location.padEnd(20)} | ${row.total_items.toString().padEnd(5)} | ${row.english_translations.toString().padEnd(2)} | ${row.hebrew_translations.toString().padEnd(2)} | ${row.russian_translations.toString().padEnd(2)} | ${row.complete_coverage_percent}%`);
    });
    
    // 6. Content Key Pattern Analysis
    console.log('\n🔑 6. CONTENT KEY PATTERN ANALYSIS');
    console.log('==================================');
    
    const patternAnalysis = await pool.query(`
      SELECT 
        CASE 
          WHEN content_key LIKE '%.%' AND content_key LIKE 'app.%' THEN 'app.service.step.field'
          WHEN content_key LIKE '%_step%_%' THEN 'screen_field_format'
          WHEN content_key LIKE '%option_%' THEN 'dropdown_option'
          WHEN content_key LIKE '%_ph' THEN 'placeholder'
          WHEN content_key LIKE '%_label' THEN 'label'
          WHEN content_key LIKE 'error_%' THEN 'validation_error'
          ELSE 'other_pattern'
        END as pattern_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM content_items), 1) as percentage
      FROM content_items 
      GROUP BY 
        CASE 
          WHEN content_key LIKE '%.%' AND content_key LIKE 'app.%' THEN 'app.service.step.field'
          WHEN content_key LIKE '%_step%_%' THEN 'screen_field_format'
          WHEN content_key LIKE '%option_%' THEN 'dropdown_option'
          WHEN content_key LIKE '%_ph' THEN 'placeholder'
          WHEN content_key LIKE '%_label' THEN 'label'
          WHEN content_key LIKE 'error_%' THEN 'validation_error'
          ELSE 'other_pattern'
        END
      ORDER BY COUNT(*) DESC
    `);
    
    console.log('Pattern Type | Count | Percentage');
    console.log('----------------------------------');
    patternAnalysis.rows.forEach(row => {
      console.log(`${row.pattern_type.padEnd(25)} | ${row.count.toString().padEnd(5)} | ${row.percentage}%`);
    });
    
    // 7. Summary Statistics
    console.log('\n📊 7. SUMMARY STATISTICS');
    console.log('========================');
    
    const summaryStats = await pool.query(`
      SELECT 
        COUNT(*) as total_content_items,
        COUNT(DISTINCT content_key) as unique_content_keys,
        COUNT(DISTINCT screen_location) as total_screens,
        COUNT(DISTINCT component_type) as total_component_types,
        (SELECT COUNT(*) FROM content_translations) as total_translations,
        (SELECT COUNT(DISTINCT language_code) FROM content_translations) as supported_languages
    `);
    
    const stats = summaryStats.rows[0];
    console.log(`Total Content Items: ${stats.total_content_items}`);
    console.log(`Unique Content Keys: ${stats.unique_content_keys}`);
    console.log(`Total Screens: ${stats.total_screens}`);
    console.log(`Component Types: ${stats.total_component_types}`);
    console.log(`Total Translations: ${stats.total_translations}`);
    console.log(`Supported Languages: ${stats.supported_languages}`);
    
    const duplicationRate = Math.round((stats.total_content_items - stats.unique_content_keys) / stats.total_content_items * 100 * 10) / 10;
    console.log(`Content Key Duplication Rate: ${duplicationRate}%`);
    
    console.log('\n✅ Analysis complete');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeContentDatabase();