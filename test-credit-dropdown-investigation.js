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
        field_name,
        app_context_id,
        category,
        is_active,
        options
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
        console.log(`   - ${item.content_key} (field: ${item.field_name || 'N/A'})`);
        if (item.options) {
          console.log(`     Options: ${JSON.stringify(item.options).substring(0, 100)}...`);
        }
      });
      if (items.length > 3) {
        console.log(`   ... and ${items.length - 3} more`);
      }
    }

    // 2. Specifically look for dropdown/select components in credit screens
    console.log('\n2️⃣ DROPDOWN/SELECT COMPONENTS IN CREDIT SCREENS:');
    console.log('-'.repeat(40));
    const dropdownQuery = await pool.query(`
      SELECT DISTINCT
        screen_location,
        component_type,
        field_name,
        COUNT(*) as count
      FROM content_items
      WHERE screen_location LIKE '%credit%'
        AND component_type IN ('dropdown', 'select', 'field_dropdown', 'Dropdown', 'Select')
      GROUP BY screen_location, component_type, field_name
      ORDER BY screen_location, component_type
    `);
    
    if (dropdownQuery.rows.length > 0) {
      console.log('Found dropdown components:');
      dropdownQuery.rows.forEach(row => {
        console.log(`  📝 ${row.screen_location} | ${row.component_type} | Field: ${row.field_name || 'N/A'} (${row.count} items)`);
      });
    } else {
      console.log('❌ No dropdown/select components found for credit screens!');
    }

    // 3. Check all unique component_types in the database
    console.log('\n3️⃣ ALL COMPONENT TYPES IN DATABASE:');
    console.log('-'.repeat(40));
    const componentTypes = await pool.query(`
      SELECT DISTINCT 
        component_type,
        COUNT(*) as count
      FROM content_items
      WHERE is_active = true
      GROUP BY component_type
      ORDER BY count DESC
    `);
    
    console.log('Available component types:');
    componentTypes.rows.forEach(row => {
      console.log(`  • ${row.component_type}: ${row.count} items`);
    });

    // 4. Compare credit_step1 with mortgage_step1 to understand pattern differences
    console.log('\n4️⃣ COMPARISON: CREDIT_STEP1 vs MORTGAGE_STEP1:');
    console.log('-'.repeat(40));
    
    console.log('\n📊 Credit Step 1:');
    const creditStep1 = await pool.query(`
      SELECT 
        component_type,
        COUNT(*) as count,
        array_agg(DISTINCT field_name) as field_names
      FROM content_items
      WHERE screen_location = 'credit_step1'
        AND is_active = true
      GROUP BY component_type
      ORDER BY component_type
    `);
    
    creditStep1.rows.forEach(row => {
      console.log(`  • ${row.component_type}: ${row.count} items`);
      console.log(`    Fields: ${row.field_names.filter(f => f).join(', ') || 'N/A'}`);
    });
    
    console.log('\n🏠 Mortgage Step 1:');
    const mortgageStep1 = await pool.query(`
      SELECT 
        component_type,
        COUNT(*) as count,
        array_agg(DISTINCT field_name) as field_names
      FROM content_items
      WHERE screen_location = 'mortgage_step1'
        AND is_active = true
      GROUP BY component_type
      ORDER BY component_type
    `);
    
    mortgageStep1.rows.forEach(row => {
      console.log(`  • ${row.component_type}: ${row.count} items`);
      console.log(`    Fields: ${row.field_names.filter(f => f).join(', ') || 'N/A'}`);
    });

    // 5. Check if credit dropdowns might be stored with different screen_location patterns
    console.log('\n5️⃣ ALTERNATIVE SCREEN_LOCATION PATTERNS:');
    console.log('-'.repeat(40));
    const patterns = await pool.query(`
      SELECT DISTINCT 
        screen_location,
        component_type,
        COUNT(*) as count
      FROM content_items
      WHERE (
        screen_location LIKE '%credit%' 
        OR screen_location LIKE '%loan%'
        OR screen_location LIKE '%calculate%credit%'
      )
      AND component_type IN ('dropdown', 'select', 'field_dropdown', 'Dropdown', 'Select')
      GROUP BY screen_location, component_type
      ORDER BY screen_location
    `);
    
    if (patterns.rows.length > 0) {
      console.log('Found alternative patterns for credit dropdowns:');
      patterns.rows.forEach(row => {
        console.log(`  🔍 ${row.screen_location} | ${row.component_type} (${row.count} items)`);
      });
    } else {
      console.log('No alternative patterns found.');
    }

    // 6. Check app_context_id usage
    console.log('\n6️⃣ APP_CONTEXT_ID ANALYSIS:');
    console.log('-'.repeat(40));
    const contextAnalysis = await pool.query(`
      SELECT 
        app_context_id,
        screen_location,
        component_type,
        COUNT(*) as count
      FROM content_items
      WHERE screen_location LIKE '%credit%'
      GROUP BY app_context_id, screen_location, component_type
      ORDER BY app_context_id, screen_location, component_type
    `);
    
    console.log('App context distribution for credit content:');
    let currentContext = null;
    contextAnalysis.rows.forEach(row => {
      if (row.app_context_id !== currentContext) {
        currentContext = row.app_context_id;
        console.log(`\n  Context ID: ${currentContext || 'NULL'}`);
      }
      console.log(`    • ${row.screen_location} | ${row.component_type}: ${row.count} items`);
    });

    // 7. Sample actual credit step1 content
    console.log('\n7️⃣ SAMPLE CREDIT_STEP1 CONTENT:');
    console.log('-'.repeat(40));
    const sampleContent = await pool.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.field_name,
        ci.options,
        ct.content_en
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_step1'
        AND ci.is_active = true
      ORDER BY ci.component_type, ci.content_key
      LIMIT 10
    `);
    
    console.log('First 10 items from credit_step1:');
    sampleContent.rows.forEach(row => {
      console.log(`\n  📄 ${row.content_key}`);
      console.log(`     Type: ${row.component_type} | Field: ${row.field_name || 'N/A'}`);
      console.log(`     Content: ${row.content_en ? row.content_en.substring(0, 50) + '...' : 'N/A'}`);
      if (row.options) {
        console.log(`     Options: ${JSON.stringify(row.options).substring(0, 100)}...`);
      }
    });

    // 8. Final recommendation query
    console.log('\n8️⃣ RECOMMENDED QUERY FOR ADMIN PORTAL:');
    console.log('-'.repeat(40));
    console.log(`
    SELECT 
      ci.*,
      ct.content_en,
      ct.content_he,
      ct.content_ru
    FROM content_items ci
    LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE (
      ci.screen_location = 'credit_step1'
      OR ci.screen_location LIKE 'credit_step1_%'
      OR (ci.screen_location LIKE '%credit%' AND ci.component_type IN ('dropdown', 'select'))
    )
    AND ci.is_active = true
    ORDER BY ci.component_type, ci.display_order, ci.content_key;
    `);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

investigateCreditDropdowns();