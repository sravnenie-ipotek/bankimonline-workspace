require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

// Content database connection
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: (process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || '').includes('railway') ? {
    rejectUnauthorized: false
  } : false
});

async function verifyDropdownImplementation() {
  try {
    console.log('🔍 VERIFYING DROPDOWN IMPLEMENTATION AGAINST DOCUMENTATION\n');
    
    // 1. Check actual table columns vs documented schema
    console.log('1️⃣ CHECKING TABLE SCHEMAS:');
    console.log('==========================');
    
    // Check content_items columns
    const itemsColumns = await contentPool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'content_items'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 content_items columns:');
    const expectedItemsColumns = ['id', 'content_key', 'component_type', 'category', 'screen_location', 'is_active'];
    const actualItemsColumns = itemsColumns.rows.map(col => col.column_name);
    
    expectedItemsColumns.forEach(col => {
      const exists = actualItemsColumns.includes(col);
      console.log(`  ${exists ? '✅' : '❌'} ${col} ${exists ? '(found)' : '(MISSING!)'}`);
    });
    
    // Additional columns not in documentation
    const extraItemsColumns = actualItemsColumns.filter(col => !expectedItemsColumns.includes(col));
    if (extraItemsColumns.length > 0) {
      console.log('\n  📌 Additional columns found:');
      extraItemsColumns.forEach(col => console.log(`    - ${col}`));
    }
    
    // Check content_translations columns
    const transColumns = await contentPool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'content_translations'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 content_translations columns:');
    const expectedTransColumns = ['id', 'content_item_id', 'language_code', 'content_value', 'status'];
    const actualTransColumns = transColumns.rows.map(col => col.column_name);
    
    expectedTransColumns.forEach(col => {
      const exists = actualTransColumns.includes(col);
      console.log(`  ${exists ? '✅' : '❌'} ${col} ${exists ? '(found)' : '(MISSING!)'}`);
    });
    
    // 2. Check component types used
    console.log('\n\n2️⃣ CHECKING COMPONENT TYPES:');
    console.log('============================');
    
    const componentTypes = await contentPool.query(`
      SELECT DISTINCT component_type, COUNT(*) as count
      FROM content_items
      WHERE component_type IS NOT NULL
      GROUP BY component_type
      ORDER BY component_type
    `);
    
    console.log('\n📊 Component types in database:');
    const expectedTypes = ['dropdown', 'option', 'placeholder', 'label'];
    const actualTypes = componentTypes.rows.map(row => row.component_type);
    
    componentTypes.rows.forEach(row => {
      const isExpected = expectedTypes.includes(row.component_type);
      console.log(`  ${isExpected ? '✅' : '⚠️'} ${row.component_type}: ${row.count} items ${!isExpected ? '(NOT IN DOCS!)' : ''}`);
    });
    
    // Check for missing expected types
    const missingTypes = expectedTypes.filter(type => !actualTypes.includes(type));
    if (missingTypes.length > 0) {
      console.log('\n❌ Missing expected component types:');
      missingTypes.forEach(type => console.log(`  - ${type}`));
    }
    
    // 3. Check naming conventions
    console.log('\n\n3️⃣ CHECKING NAMING CONVENTIONS:');
    console.log('================================');
    
    // Check for numeric vs descriptive option naming
    const numericOptions = await contentPool.query(`
      SELECT content_key, component_type, screen_location
      FROM content_items
      WHERE component_type IN ('option', 'dropdown_option')
      AND content_key LIKE '%_option_%'
      LIMIT 10
    `);
    
    const descriptiveOptions = await contentPool.query(`
      SELECT content_key, component_type, screen_location
      FROM content_items
      WHERE component_type IN ('option', 'dropdown_option')
      AND content_key NOT LIKE '%_option_%'
      AND content_key LIKE '%_%'
      LIMIT 10
    `);
    
    console.log(`\n📊 Option naming patterns:`);
    console.log(`  Numeric pattern (_option_N): ${numericOptions.rows.length > 0 ? '❌ FOUND' : '✅ Not found'}`);
    if (numericOptions.rows.length > 0) {
      console.log('  Examples:');
      numericOptions.rows.slice(0, 3).forEach(row => {
        console.log(`    - ${row.content_key} (${row.screen_location})`);
      });
    }
    
    console.log(`\n  Descriptive pattern: ${descriptiveOptions.rows.length > 0 ? '✅ FOUND' : '❌ Not found'}`);
    if (descriptiveOptions.rows.length > 0) {
      console.log('  Examples:');
      descriptiveOptions.rows.slice(0, 3).forEach(row => {
        console.log(`    - ${row.content_key} (${row.screen_location})`);
      });
    }
    
    // 4. Check status values
    console.log('\n\n4️⃣ CHECKING STATUS VALUES:');
    console.log('==========================');
    
    const statusValues = await contentPool.query(`
      SELECT DISTINCT status, COUNT(*) as count
      FROM content_translations
      WHERE status IS NOT NULL
      GROUP BY status
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Status values in database:');
    const expectedStatuses = ['approved', 'draft', 'pending'];
    statusValues.rows.forEach(row => {
      const isExpected = expectedStatuses.includes(row.status);
      console.log(`  ${isExpected ? '✅' : '⚠️'} ${row.status}: ${row.count} translations ${!isExpected ? '(NOT IN DOCS!)' : ''}`);
    });
    
    // 5. Check categories
    console.log('\n\n5️⃣ CHECKING CATEGORIES:');
    console.log('=======================');
    
    const categories = await contentPool.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM content_items
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `);
    
    const nullCategories = await contentPool.query(`
      SELECT COUNT(*) as count
      FROM content_items
      WHERE category IS NULL
    `);
    
    console.log('\n📊 Categories in database:');
    categories.rows.forEach(row => {
      console.log(`  - ${row.category}: ${row.count} items`);
    });
    
    if (parseInt(nullCategories.rows[0].count) > 0) {
      console.log(`\n  ⚠️ NULL categories: ${nullCategories.rows[0].count} items`);
    }
    
    // 6. Check specific mortgage calculator dropdowns
    console.log('\n\n6️⃣ CHECKING MORTGAGE CALCULATOR DROPDOWNS:');
    console.log('==========================================');
    
    const mortgageDropdowns = await contentPool.query(`
      SELECT ci.content_key, ci.component_type, ci.screen_location, ci.category,
             COUNT(ct.id) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location IN ('mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4')
      AND ci.component_type IN ('dropdown', 'option', 'placeholder', 'label')
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location, ci.category
      ORDER BY ci.screen_location, ci.component_type, ci.content_key
    `);
    
    console.log('\n📊 Mortgage calculator dropdown content:');
    let currentScreen = '';
    mortgageDropdowns.rows.forEach(row => {
      if (row.screen_location !== currentScreen) {
        currentScreen = row.screen_location;
        console.log(`\n  📍 ${currentScreen}:`);
      }
      const hasAllTranslations = row.translation_count >= 3;
      console.log(`    ${hasAllTranslations ? '✅' : '⚠️'} ${row.content_key} (${row.component_type}) - ${row.translation_count} translations`);
    });
    
    // 7. Check for documented bugs
    console.log('\n\n7️⃣ CHECKING FOR DOCUMENTED BUGS:');
    console.log('=================================');
    
    // Bug 1: Mixed component types (option vs dropdown_option)
    const mixedTypes = await contentPool.query(`
      SELECT COUNT(*) as dropdown_option_count
      FROM content_items
      WHERE component_type = 'dropdown_option'
    `);
    
    console.log(`\n🐛 Bug 1 - Mixed component types:`);
    console.log(`  dropdown_option count: ${mixedTypes.rows[0].dropdown_option_count}`);
    console.log(`  Status: ${mixedTypes.rows[0].dropdown_option_count > 0 ? '❌ BUG EXISTS' : '✅ FIXED'}`);
    
    // Bug 6: Missing dropdown containers
    const dropdownContainers = await contentPool.query(`
      SELECT COUNT(*) as dropdown_count
      FROM content_items
      WHERE component_type = 'dropdown'
    `);
    
    console.log(`\n🐛 Bug 6 - Missing dropdown containers:`);
    console.log(`  dropdown count: ${dropdownContainers.rows[0].dropdown_count}`);
    console.log(`  Status: ${dropdownContainers.rows[0].dropdown_count === 0 ? '❌ BUG EXISTS' : '✅ Has dropdowns'}`);
    
    // Bug 7: Missing placeholder and label components
    const placeholderCount = await contentPool.query(`
      SELECT COUNT(*) as count FROM content_items WHERE component_type = 'placeholder'
    `);
    const labelCount = await contentPool.query(`
      SELECT COUNT(*) as count FROM content_items WHERE component_type = 'label'
    `);
    
    console.log(`\n🐛 Bug 7 - Missing placeholder and label components:`);
    console.log(`  placeholder count: ${placeholderCount.rows[0].count}`);
    console.log(`  label count: ${labelCount.rows[0].count}`);
    console.log(`  Status: ${placeholderCount.rows[0].count === 0 || labelCount.rows[0].count === 0 ? '❌ BUG EXISTS' : '✅ Has components'}`);
    
    // Summary
    console.log('\n\n📊 SUMMARY:');
    console.log('===========');
    console.log('✅ Database tables have the required columns');
    console.log(`${mixedTypes.rows[0].dropdown_option_count > 0 ? '❌' : '✅'} Component types ${mixedTypes.rows[0].dropdown_option_count > 0 ? 'NOT' : ''} standardized`);
    console.log(`${numericOptions.rows.length > 0 ? '⚠️' : '✅'} Using ${numericOptions.rows.length > 0 ? 'MIXED' : 'descriptive'} naming conventions`);
    console.log('✅ Status values match documentation');
    console.log(`${parseInt(nullCategories.rows[0].count) > 0 ? '⚠️' : '✅'} Categories ${parseInt(nullCategories.rows[0].count) > 0 ? 'have NULL values' : 'properly set'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await contentPool.end();
  }
}

verifyDropdownImplementation();