const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function analyzeExistingContent() {
  try {
    // Get mortgage content as baseline
    const mortgageContent = await pool.query(`
      SELECT screen_location, content_key, component_type, category,
             content_value_en, content_value_he, content_value_ru
      FROM content_items
      WHERE screen_location LIKE 'mortgage_%'
      ORDER BY screen_location, content_key
    `);
    
    console.log('MORTGAGE CONTENT ANALYSIS:');
    console.log('=========================');
    
    const screens = {};
    mortgageContent.rows.forEach(row => {
      if (!screens[row.screen_location]) {
        screens[row.screen_location] = [];
      }
      screens[row.screen_location].push({
        key: row.content_key,
        type: row.component_type,
        category: row.category,
        en: row.content_value_en,
        he: row.content_value_he,
        ru: row.content_value_ru
      });
    });
    
    Object.keys(screens).sort().forEach(screen => {
      console.log(`\n${screen}: ${screens[screen].length} items`);
      console.log('Categories:', [...new Set(screens[screen].map(i => i.category))].join(', '));
      console.log('Types:', [...new Set(screens[screen].map(i => i.type))].join(', '));
    });
    
    // Check other services
    const otherServices = await pool.query(`
      SELECT DISTINCT screen_location, COUNT(*) as count
      FROM content_items
      WHERE screen_location LIKE 'refinance_%'
         OR screen_location LIKE 'calculate_credit_%'
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('\n\nOTHER SERVICES:');
    console.log('===============');
    otherServices.rows.forEach(row => {
      console.log(`${row.screen_location}: ${row.count} items`);
    });
    
    // Get detailed mortgage step 2 content as template
    console.log('\n\nMORTGAGE STEP 2 TEMPLATE (for reuse):');
    console.log('=====================================');
    const step2Template = await pool.query(`
      SELECT content_key, component_type, category
      FROM content_items
      WHERE screen_location = 'mortgage_step2'
      ORDER BY content_key
    `);
    
    step2Template.rows.forEach(row => {
      console.log(`${row.content_key} (${row.component_type}) - ${row.category}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

analyzeExistingContent();