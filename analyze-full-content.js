const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function analyzeFullContent() {
  try {
    // 1. Get all mortgage content as baseline
    console.log('=== MORTGAGE CONTENT ANALYSIS ===\n');
    
    const mortgageScreens = await pool.query(`
      SELECT DISTINCT screen_location
      FROM content_items
      WHERE screen_location LIKE 'mortgage_%'
      ORDER BY screen_location
    `);
    
    for (const screen of mortgageScreens.rows) {
      console.log(`\n${screen.screen_location}:`);
      console.log('=' .repeat(50));
      
      const content = await pool.query(`
        SELECT ci.content_key, ci.component_type, ci.category,
               ct_en.content_value as en,
               ct_he.content_value as he,
               ct_ru.content_value as ru
        FROM content_items ci
        LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
        LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
        LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
        WHERE ci.screen_location = $1
        ORDER BY ci.content_key
      `, [screen.screen_location]);
      
      const byCategory = {};
      content.rows.forEach(row => {
        if (!byCategory[row.category]) byCategory[row.category] = [];
        byCategory[row.category].push(row);
      });
      
      Object.keys(byCategory).forEach(cat => {
        console.log(`\n  ${cat}:`);
        byCategory[cat].forEach(item => {
          console.log(`    ${item.content_key} (${item.component_type})`);
          if (item.en) console.log(`      EN: ${item.en.substring(0, 50)}...`);
        });
      });
    }
    
    // 2. Check what exists for other services
    console.log('\n\n=== OTHER SERVICES CONTENT ===\n');
    
    const otherServices = await pool.query(`
      SELECT screen_location, COUNT(*) as count,
             array_agg(DISTINCT category) as categories,
             array_agg(DISTINCT component_type) as types
      FROM content_items
      WHERE screen_location LIKE 'refinance_%'
         OR screen_location LIKE 'calculate_credit_%'
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    otherServices.rows.forEach(row => {
      console.log(`${row.screen_location}: ${row.count} items`);
      console.log(`  Categories: ${row.categories.join(', ')}`);
      console.log(`  Types: ${row.types.join(', ')}`);
    });
    
    // 3. Find missing screens
    console.log('\n\n=== MISSING SCREENS ===\n');
    
    const expectedScreens = [
      // Refinance screens
      'refinance_step1', 'refinance_step2', 'refinance_step3', 
      'refinance_step4', 'refinance_results',
      // Credit calculator screens  
      'calculate_credit_step1', 'calculate_credit_step2', 'calculate_credit_step3',
      'calculate_credit_step4', 'calculate_credit_results'
    ];
    
    for (const screen of expectedScreens) {
      const exists = await pool.query(
        'SELECT COUNT(*) as count FROM content_items WHERE screen_location = $1',
        [screen]
      );
      
      if (exists.rows[0].count === '0') {
        console.log(`❌ ${screen} - MISSING`);
        
        // Find corresponding mortgage screen
        const mortgageEquiv = screen.replace('refinance_', 'mortgage_')
                                   .replace('calculate_credit_', 'mortgage_');
        
        const mortgageContent = await pool.query(
          'SELECT COUNT(*) as count FROM content_items WHERE screen_location = $1',
          [mortgageEquiv]
        );
        
        if (mortgageContent.rows[0].count > 0) {
          console.log(`   → Can use template from ${mortgageEquiv}`);
        }
      } else {
        console.log(`✅ ${screen} - EXISTS (${exists.rows[0].count} items)`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeFullContent();