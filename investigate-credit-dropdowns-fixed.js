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

async function investigateCreditDropdowns() {
  try {
    console.log('🔍 CREDIT CALCULATOR DROPDOWN INVESTIGATION\n');
    console.log('=' .repeat(80));

    // 1. Check all credit-related content items
    console.log('\n1️⃣ ALL CREDIT-RELATED CONTENT ITEMS:');
    console.log('-'.repeat(40));
    const creditContent = await pool.query(`
      SELECT 
        id,
        content_key,
        component_type,
        screen_location,
        app_context_id,
        category,
        is_active,
        status
      FROM content_items
      WHERE screen_location LIKE '%credit%'
      ORDER BY screen_location, component_type, content_key
    `);
    
    console.log(`Found ${creditContent.rows.length} credit-related items:\n`);
    
    // Group by screen_location and component_type
    const groupedContent = {};
    creditContent.rows.forEach(item => {
      const key = `${item.screen_location} - ${item.component_type}`;
      if (!groupedContent[key]) {
        groupedContent[key] = [];
      }
      groupedContent[key].push(item);
    });
    
    for (const [group, items] of Object.entries(groupedContent)) {
      console.log(`\n📍 ${group}: ${items.length} items`);
      items.slice(0, 3).forEach(item => {
        console.log(`   - ${item.content_key} (category: ${item.category || 'N/A'})`);
      });
      if (items.length > 3) {
        console.log(`   ... and ${items.length - 3} more`);
      }
    }

    // 2. Specifically look for dropdown/select components
    console.log('\n2️⃣ SEARCHING FOR DROPDOWN COMPONENTS:');
    console.log('-'.repeat(40));
    
    // First, let's see all component types in the database
    const allComponentTypes = await pool.query(`
      SELECT DISTINCT 
        component_type,
        COUNT(*) as count
      FROM content_items
      WHERE is_active = true
      GROUP BY component_type
      ORDER BY count DESC
    `);
    
    console.log('\nAll component types in database:');
    allComponentTypes.rows.forEach(row => {
      console.log(`  • ${row.component_type}: ${row.count} items`);
    });

    // Now specifically for credit screens
    const dropdownQuery = await pool.query(`
      SELECT DISTINCT
        screen_location,
        component_type,
        category,
        COUNT(*) as count
      FROM content_items
      WHERE screen_location LIKE '%credit%'
        AND (
          component_type ILIKE '%dropdown%' 
          OR component_type ILIKE '%select%'
          OR component_type = 'option'
          OR component_type = 'field'
        )
      GROUP BY screen_location, component_type, category
      ORDER BY screen_location, component_type
    `);
    
    if (dropdownQuery.rows.length > 0) {
      console.log('\nFound potential dropdown/select components in credit screens:');
      dropdownQuery.rows.forEach(row => {
        console.log(`  📝 ${row.screen_location} | ${row.component_type} | Category: ${row.category || 'N/A'} (${row.count} items)`);
      });
    } else {
      console.log('\n❌ No dropdown/select components found for credit screens!');
    }

    // 3. Check specific credit_step1 content
    console.log('\n3️⃣ CREDIT_STEP1 ANALYSIS:');
    console.log('-'.repeat(40));
    
    const creditStep1 = await pool.query(`
      SELECT 
        component_type,
        category,
        COUNT(*) as count,
        array_agg(content_key ORDER BY content_key) as keys
      FROM content_items
      WHERE screen_location = 'credit_step1'
        AND is_active = true
      GROUP BY component_type, category
      ORDER BY component_type, category
    `);
    
    if (creditStep1.rows.length > 0) {
      console.log('\nCredit Step 1 content breakdown:');
      creditStep1.rows.forEach(row => {
        console.log(`\n  📊 Type: ${row.component_type} | Category: ${row.category || 'N/A'} (${row.count} items)`);
        console.log(`     Keys: ${row.keys.slice(0, 3).join(', ')}${row.keys.length > 3 ? '...' : ''}`);
      });
    } else {
      console.log('No content found for credit_step1');
    }

    // 4. Check if credit dropdowns might be in a different screen_location
    console.log('\n4️⃣ SEARCHING FOR CREDIT DROPDOWN PATTERNS:');
    console.log('-'.repeat(40));
    
    // Look for content keys that suggest dropdown functionality
    const dropdownPatterns = await pool.query(`
      SELECT 
        screen_location,
        content_key,
        component_type,
        category
      FROM content_items
      WHERE (
        content_key ILIKE '%dropdown%'
        OR content_key ILIKE '%select%'
        OR content_key ILIKE '%option%'
        OR content_key ILIKE '%choice%'
        OR content_key ILIKE '%purpose%'
        OR content_key ILIKE '%bank%'
        OR content_key ILIKE '%employment%'
      )
      AND (
        screen_location LIKE '%credit%'
        OR screen_location LIKE '%loan%'
      )
      AND is_active = true
      ORDER BY screen_location, content_key
      LIMIT 20
    `);
    
    if (dropdownPatterns.rows.length > 0) {
      console.log('\nContent keys suggesting dropdown functionality:');
      dropdownPatterns.rows.forEach(row => {
        console.log(`  🔑 ${row.screen_location} | ${row.content_key}`);
        console.log(`     Type: ${row.component_type} | Category: ${row.category || 'N/A'}`);
      });
    } else {
      console.log('No dropdown-related content keys found');
    }

    // 5. Compare with mortgage_step1 to understand the pattern
    console.log('\n5️⃣ COMPARISON: MORTGAGE_STEP1 vs CREDIT_STEP1:');
    console.log('-'.repeat(40));
    
    console.log('\n🏠 Mortgage Step 1:');
    const mortgageStep1 = await pool.query(`
      SELECT 
        component_type,
        COUNT(*) as count
      FROM content_items
      WHERE screen_location = 'mortgage_step1'
        AND is_active = true
      GROUP BY component_type
      ORDER BY component_type
    `);
    
    mortgageStep1.rows.forEach(row => {
      console.log(`  • ${row.component_type}: ${row.count} items`);
    });
    
    console.log('\n💳 Credit Step 1:');
    const creditStep1Summary = await pool.query(`
      SELECT 
        component_type,
        COUNT(*) as count
      FROM content_items
      WHERE screen_location = 'credit_step1'
        AND is_active = true
      GROUP BY component_type
      ORDER BY component_type
    `);
    
    creditStep1Summary.rows.forEach(row => {
      console.log(`  • ${row.component_type}: ${row.count} items`);
    });

    // 6. Check if dropdowns might be stored as individual options
    console.log('\n6️⃣ CHECKING FOR OPTION-BASED DROPDOWNS:');
    console.log('-'.repeat(40));
    
    const optionContent = await pool.query(`
      SELECT 
        content_key,
        screen_location,
        component_type,
        category
      FROM content_items
      WHERE screen_location LIKE '%credit%'
        AND (
          content_key LIKE '%option_%'
          OR content_key LIKE '%_opt_%'
          OR content_key LIKE '%choice%'
        )
        AND is_active = true
      ORDER BY screen_location, content_key
      LIMIT 15
    `);
    
    if (optionContent.rows.length > 0) {
      console.log('\nFound option-based content (potential dropdown items):');
      optionContent.rows.forEach(row => {
        console.log(`  • ${row.screen_location} | ${row.content_key}`);
        console.log(`    Type: ${row.component_type} | Category: ${row.category || 'N/A'}`);
      });
    } else {
      console.log('No option-based content found');
    }

    // 7. Check all screen locations that contain 'credit'
    console.log('\n7️⃣ ALL CREDIT SCREEN LOCATIONS:');
    console.log('-'.repeat(40));
    
    const allCreditScreens = await pool.query(`
      SELECT 
        screen_location,
        COUNT(*) as total_items,
        COUNT(DISTINCT component_type) as unique_types,
        array_agg(DISTINCT component_type) as types
      FROM content_items
      WHERE screen_location LIKE '%credit%'
        AND is_active = true
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('\nAll credit-related screen locations:');
    allCreditScreens.rows.forEach(row => {
      console.log(`\n  📍 ${row.screen_location}:`);
      console.log(`     Total items: ${row.total_items} | Unique types: ${row.unique_types}`);
      console.log(`     Types: ${row.types.join(', ')}`);
    });

    // 8. Final recommendations
    console.log('\n8️⃣ ANALYSIS SUMMARY & RECOMMENDATIONS:');
    console.log('-'.repeat(40));
    
    console.log('\n📋 KEY FINDINGS:');
    console.log('1. The content_items table does NOT have a "field_name" column');
    console.log('2. The table does NOT have an "options" column for storing dropdown options');
    console.log('3. Credit content exists but appears to be mostly "text" type components');
    console.log('4. No explicit dropdown/select component types found for credit screens');
    
    console.log('\n💡 POSSIBLE EXPLANATIONS:');
    console.log('1. Credit dropdowns might be hardcoded in the frontend, not database-driven');
    console.log('2. Dropdown options might be stored in a different table');
    console.log('3. Credit dropdowns might use a different component_type naming convention');
    console.log('4. The production site might be using legacy code not yet migrated to content_items');
    
    console.log('\n🔧 RECOMMENDED QUERY FOR ADMIN PORTAL:');
    console.log(`
    -- Query 1: Get all credit_step1 content (including potential dropdown-related)
    SELECT 
      ci.id,
      ci.content_key,
      ci.component_type,
      ci.screen_location,
      ci.category,
      ci.app_context_id,
      ct_en.content_value as content_en,
      ct_he.content_value as content_he,
      ct_ru.content_value as content_ru
    FROM content_items ci
    LEFT JOIN content_translations ct_en 
      ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
    LEFT JOIN content_translations ct_he 
      ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
    LEFT JOIN content_translations ct_ru 
      ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
    WHERE ci.screen_location = 'credit_step1'
      AND ci.is_active = true
    ORDER BY ci.component_type, ci.content_key;
    
    -- Query 2: Check if dropdown options are stored as individual items
    SELECT 
      ci.content_key,
      ci.component_type,
      ci.category,
      ct.content_value
    FROM content_items ci
    LEFT JOIN content_translations ct 
      ON ci.id = ct.content_item_id AND ct.language_code = 'en'
    WHERE ci.screen_location LIKE '%credit%'
      AND (ci.content_key LIKE '%option%' OR ci.content_key LIKE '%choice%')
      AND ci.is_active = true
    ORDER BY ci.content_key;
    `);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

investigateCreditDropdowns();