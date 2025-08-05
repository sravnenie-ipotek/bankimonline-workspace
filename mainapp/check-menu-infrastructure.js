const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkMenuInfrastructure() {
  try {
    console.log('🔍 CHECKING MENU INFRASTRUCTURE IN DATABASE\n');
    
    // Check for menu-related content
    const menuContent = await pool.query(`
      SELECT 
        screen_location,
        content_key,
        component_type,
        category
      FROM content_items
      WHERE content_key LIKE '%menu%' 
         OR content_key LIKE '%nav%'
         OR content_key LIKE '%Меню%'
         OR screen_location LIKE '%menu%'
         OR category LIKE '%menu%'
         OR category LIKE '%nav%'
      ORDER BY screen_location, content_key
    `);
    
    if (menuContent.rows.length > 0) {
      console.log('✅ FOUND MENU-RELATED CONTENT:');
      console.log('==============================\n');
      menuContent.rows.forEach(row => {
        console.log(`${row.screen_location} > ${row.content_key}`);
        console.log(`  Type: ${row.component_type}, Category: ${row.category}\n`);
      });
    } else {
      console.log('❌ NO MENU-RELATED CONTENT FOUND\n');
    }
    
    // Check for navigation or menu categories
    console.log('📋 CHECKING EXISTING CATEGORIES:\n');
    
    const categories = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM content_items
      WHERE category IS NOT NULL AND category \!= ''
      GROUP BY category
      ORDER BY count DESC, category
    `);
    
    console.log('Existing categories:');
    categories.rows.forEach(row => {
      console.log(`  - ${row.category}: ${row.count} items`);
    });
    
    // Check if we have any hierarchical menu structure
    console.log('\n\n🔍 CHECKING FOR HIERARCHICAL MENU STRUCTURE:\n');
    
    const hierarchical = await pool.query(`
      SELECT 
        screen_location,
        content_key,
        component_type,
        category
      FROM content_items
      WHERE content_key LIKE '%main%' 
         OR content_key LIKE '%home%'
         OR content_key LIKE '%calculate%'
         OR content_key LIKE '%refinance%'
         OR content_key LIKE '%credit%'
         OR content_key LIKE '%mortgage%'
      ORDER BY screen_location, content_key
      LIMIT 20
    `);
    
    if (hierarchical.rows.length > 0) {
      console.log('Menu-related content found:');
      hierarchical.rows.forEach(row => {
        console.log(`  ${row.screen_location} > ${row.content_key} (${row.component_type})`);
      });
    }
    
    // Check database schema for menu support
    console.log('\n\n📋 CHECKING DATABASE SCHEMA FOR MENU SUPPORT:\n');
    
    const schemaCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'content_items'
        AND column_name IN ('parent_id', 'menu_order', 'menu_level', 'menu_category', 'menu_group')
      ORDER BY column_name
    `);
    
    if (schemaCheck.rows.length > 0) {
      console.log('Menu-specific columns found:');
      schemaCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable})`);
      });
    } else {
      console.log('❌ No menu-specific columns found in content_items table');
      console.log('Current schema supports:');
      console.log('  - screen_location (groups content by page/screen)');
      console.log('  - category (groups content within a screen)');
      console.log('  - component_type (dropdown, option, button, etc.)');
    }
    
    // Suggest menu infrastructure
    console.log('\n\n💡 MENU INFRASTRUCTURE RECOMMENDATIONS:\n');
    console.log('Current system can support menu categories using:');
    console.log('1. screen_location for main menu items (home, calculate_mortgage, etc.)');
    console.log('2. category for grouping (menu_main, menu_services, menu_general)');
    console.log('3. component_type = "menu_item" for navigation items');
    console.log('\nExample structure:');
    console.log('  screen_location: "main_menu"');
    console.log('  content_key: "menu_home", "menu_calculate_mortgage", etc.');
    console.log('  category: "primary_nav", "secondary_nav", etc.');
    console.log('  component_type: "menu_item"');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMenuInfrastructure();
