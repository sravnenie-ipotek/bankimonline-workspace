const { Pool } = require('pg');

async function analyzePatterns() {
  const pool = new Pool({ 
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
  });
  
  try {
    console.log('🔍 Analyzing all numeric patterns with their translations...\n');
    
    // Get all numeric patterns with translations
    const patterns = await pool.query(`
      SELECT 
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        ct.content_value as english_value,
        ct_he.content_value as hebrew_value
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'en'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      WHERE ci.component_type = 'option' 
        AND (ci.content_key LIKE '%_option_%' OR ci.content_key LIKE '%_options_%' OR ci.content_key ~ '_[0-9]+$')
      ORDER BY ci.screen_location, ci.content_key
    `);
    
    // Group by pattern type
    const groupedPatterns = {};
    
    patterns.rows.forEach(row => {
      // Extract the base pattern (e.g., "calculate_mortgage_property_ownership")
      let basePattern = row.content_key.replace(/_option_\d+$/, '').replace(/_options_\d+$/, '').replace(/_\d+$/, '');
      
      if (!groupedPatterns[basePattern]) {
        groupedPatterns[basePattern] = {
          screen: row.screen_location,
          options: []
        };
      }
      
      groupedPatterns[basePattern].options.push({
        key: row.content_key,
        english: row.english_value || 'NO TRANSLATION',
        hebrew: row.hebrew_value || 'NO TRANSLATION'
      });
    });
    
    // Print analysis
    console.log('📊 PATTERN ANALYSIS:\n');
    
    Object.keys(groupedPatterns).forEach(pattern => {
      const data = groupedPatterns[pattern];
      console.log(`\n🔹 Pattern: ${pattern}`);
      console.log(`   Screen: ${data.screen}`);
      console.log(`   Options:`);
      
      data.options.forEach((opt, index) => {
        console.log(`     ${index + 1}. ${opt.key}`);
        console.log(`        EN: "${opt.english}"`);
        console.log(`        HE: "${opt.hebrew}"`);
      });
    });
    
    // Summary
    console.log(`\n\n📈 SUMMARY:`);
    console.log(`Total patterns to fix: ${patterns.rows.length}`);
    console.log(`Unique pattern groups: ${Object.keys(groupedPatterns).length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzePatterns();