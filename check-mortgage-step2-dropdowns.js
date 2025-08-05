const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkMortgageStep2Dropdowns() {
  try {
    console.log('🔍 CHECKING MORTGAGE STEP 2 DROPDOWNS\n');
    
    // Get all dropdown-type content from mortgage_step2
    const query = `
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.content_value as hebrew_text,
        COUNT(DISTINCT ct2.content_item_id) as option_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
      LEFT JOIN content_items ci2 ON ci2.content_key LIKE ci.content_key || '_option_%' AND ci2.screen_location = ci.screen_location
      LEFT JOIN content_translations ct2 ON ci2.id = ct2.content_item_id
      WHERE ci.screen_location = 'mortgage_step2'
        AND ci.is_active = true
        AND (ci.component_type IN ('dropdown', 'select', 'radio', 'option') 
             OR ci.content_key LIKE '%option%'
             OR ci.content_key LIKE '%select%'
             OR ci.content_key LIKE '%dropdown%')
      GROUP BY ci.id, ci.content_key, ci.component_type, ct.content_value
      ORDER BY 
        CASE 
          WHEN ci.content_key LIKE '%education%' THEN 1
          WHEN ci.content_key LIKE '%family_status%' THEN 2
          WHEN ci.content_key LIKE '%citizenship%' THEN 3
          WHEN ci.content_key LIKE '%children%' THEN 4
          WHEN ci.content_key LIKE '%tax%' THEN 5
          WHEN ci.content_key LIKE '%insurance%' THEN 6
          WHEN ci.content_key LIKE '%public%' THEN 7
          WHEN ci.content_key LIKE '%partner%' THEN 8
          ELSE 9
        END,
        ci.content_key;
    `;
    
    const result = await pool.query(query);
    
    console.log(`Found ${result.rows.length} dropdown-related items\n`);
    
    // Group by dropdown
    const dropdowns = new Map();
    
    result.rows.forEach(row => {
      const baseKey = row.content_key.replace(/_option_\d+$/, '');
      if (!dropdowns.has(baseKey)) {
        dropdowns.set(baseKey, {
          title: '',
          options: []
        });
      }
      
      if (row.content_key.includes('_option_')) {
        dropdowns.get(baseKey).options.push({
          key: row.content_key,
          text: row.hebrew_text || row.content_key
        });
      } else {
        dropdowns.get(baseKey).title = row.hebrew_text || row.content_key;
      }
    });
    
    console.log('DROPDOWNS IN MORTGAGE_STEP2:');
    console.log('=' .repeat(80));
    
    let count = 1;
    dropdowns.forEach((data, key) => {
      console.log(`\n${count}. ${key}`);
      console.log(`   Title: ${data.title}`);
      if (data.options.length > 0) {
        console.log(`   Options (${data.options.length}):`);
        data.options.forEach(opt => {
          console.log(`     - ${opt.text}`);
        });
      }
      count++;
    });
    
    // Also check what the React code expects
    console.log('\n\nCOMPARISON WITH SCREENSHOT:');
    console.log('=' .repeat(80));
    console.log('From screenshot, we see these dropdowns/selects:');
    console.log('1. השכלה (Education) - dropdown');
    console.log('2. ילדים מתחת לגיל 18 (Children under 18) - Yes/No');
    console.log('3. חובות מס בחו"ל (Tax obligations abroad) - Yes/No');
    console.log('4. ביטוח בריאות (Health insurance) - Yes/No');
    console.log('5. תפקיד ציבורי (Public position) - Yes/No');
    console.log('6. השתתפות בן/בת זוג (Partner participation) - Yes/No');
    console.log('7. מצב משפחתי (Family status) - dropdown');
    console.log('8. תאריך לידה (Birth date) - date picker');
    
    // Check for content in mortgage_calculation that should be in mortgage_step2
    console.log('\n\nCHECKING MORTGAGE_CALCULATION FOR STEP 2 CONTENT:');
    console.log('=' .repeat(80));
    
    const missingQuery = `
      SELECT 
        ci.content_key,
        ci.component_type,
        ct.content_value as hebrew_text
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
      WHERE ci.screen_location = 'mortgage_calculation'
        AND ci.is_active = true
        AND (
          ci.content_key LIKE '%family_status%'
          OR ci.content_key LIKE '%education%'
          OR ci.content_key LIKE '%children%'
          OR ci.content_key LIKE '%tax%'
          OR ci.content_key LIKE '%insurance%'
          OR ci.content_key LIKE '%public%'
          OR ci.content_key LIKE '%partner%'
          OR ci.content_key LIKE '%birth%'
          OR ci.content_key LIKE '%citizenship%'
        )
      ORDER BY ci.content_key;
    `;
    
    const missingResult = await pool.query(missingQuery);
    console.log(`\nFound ${missingResult.rows.length} step 2 items in mortgage_calculation that might need to be copied`);
    
    missingResult.rows.forEach(row => {
      console.log(`- ${row.content_key}: ${row.hebrew_text || 'No Hebrew text'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMortgageStep2Dropdowns();