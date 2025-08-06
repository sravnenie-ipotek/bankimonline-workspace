const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkMenuStructure() {
  try {
    console.log('🔍 MENU INFRASTRUCTURE ANALYSIS\n');
    console.log('================================\n');
    
    // Get all screen locations
    const screens = await pool.query(`
      SELECT DISTINCT screen_location, COUNT(*) as items
      FROM content_items
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('📋 EXISTING SCREENS (potential menu items):');
    console.log('===========================================');
    screens.rows.forEach(row => {
      console.log(`✅ ${row.screen_location} (${row.items} items)`);
    });
    
    console.log('\n📋 MENU MAPPING:');
    console.log('================');
    console.log('Based on your image, here\'s what we need:');
    console.log('');
    console.log('Menu Item                    | Current Screen     | Status');
    console.log('---------------------------- | ------------------ | ------');
    console.log('Главная (Home)               | main_page          | ✅ EXISTS');
    console.log('Рассчитать ипотеку           | mortgage_*         | ✅ EXISTS');
    console.log('Рефинансирование Ипотеки     | refinance_*        | ✅ EXISTS');
    console.log('Расчет Кредита               | calculate_credit_* | ✅ EXISTS');
    console.log('Общие страницы               | ?                  | ❓ UNCLEAR');
    
    console.log('\n💡 INFRASTRUCTURE ASSESSMENT:');
    console.log('==============================');
    console.log('✅ YES, we have infrastructure for menu categories\!');
    console.log('');
    console.log('Current system supports:');
    console.log('1. screen_location - Groups content by page/feature');
    console.log('2. category - Sub-groups content within screens');
    console.log('3. component_type - Defines content type (dropdown, option, menu_item, etc.)');
    console.log('');
    console.log('For menu system, we can:');
    console.log('- Create screen_location: "navigation" or "main_menu"');
    console.log('- Use component_type: "menu_item"');
    console.log('- Use category: "primary_nav", "secondary_nav", "footer_nav"');
    console.log('- Link to existing screens via content_value or custom fields');
    
    // Check if menu content exists
    const menuCheck = await pool.query(`
      SELECT screen_location, content_key, component_type
      FROM content_items
      WHERE content_key LIKE '%menu%' 
         OR content_key LIKE '%nav%'
         OR component_type = 'menu_item'
      LIMIT 5
    `);
    
    if (menuCheck.rows.length > 0) {
      console.log('\n📋 EXISTING MENU CONTENT:');
      console.log('=========================');
      menuCheck.rows.forEach(row => {
        console.log(`${row.screen_location} > ${row.content_key} (${row.component_type})`);
      });
    } else {
      console.log('\n❌ NO DEDICATED MENU CONTENT FOUND');
      console.log('Menu items are likely hardcoded in components or use translation files');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMenuStructure();
