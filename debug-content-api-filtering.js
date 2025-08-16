#!/usr/bin/env node

// Debug script to identify Content API filtering bug
// Checks component_type values for mortgage_step1.field.* keys

const { Client } = require('pg');
require('dotenv').config();

async function debugContentFiltering() {
  const client = new Client({ 
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL 
  });
  
  try {
    await client.connect();
    console.log('🔍 DEBUGGING CONTENT API FILTERING BUG');
    console.log('=====================================');
    
    // Check component_type values for mortgage_step1.field.* keys
    console.log('\n1. 📊 Component Types for mortgage_step1.field.* keys:');
    const componentTypesResult = await client.query(`
      SELECT 
        content_key,
        component_type,
        screen_location,
        is_active,
        created_at
      FROM content_items 
      WHERE content_key LIKE 'mortgage_step1.field%'
      ORDER BY content_key
    `);
    
    if (componentTypesResult.rows.length === 0) {
      console.log('❌ NO mortgage_step1.field.* keys found in content_items table!');
    } else {
      console.log(`✅ Found ${componentTypesResult.rows.length} mortgage_step1.field.* keys:`);
      componentTypesResult.rows.forEach(row => {
        console.log(`   ${row.content_key}: ${row.component_type} (active: ${row.is_active})`);
      });
    }
    
    // Check what component types are allowed in dropdown filter
    console.log('\n2. 🔍 Dropdown API Filter Analysis:');
    const allowedTypes = ['dropdown_container', 'dropdown_option', 'option', 'placeholder', 'label'];
    console.log('   Allowed component_types in dropdown filter:', allowedTypes);
    
    const filteredOut = componentTypesResult.rows.filter(
      row => !allowedTypes.includes(row.component_type)
    );
    
    if (filteredOut.length > 0) {
      console.log('\n❌ FILTERING BUG CONFIRMED:');
      console.log('   These mortgage_step1.field.* keys are FILTERED OUT by dropdown API:');
      filteredOut.forEach(row => {
        console.log(`   🚨 ${row.content_key}: "${row.component_type}" NOT in allowed list`);
      });
    } else {
      console.log('\n✅ No filtering issues found - all component types are allowed');
    }
    
    // Test the actual API queries
    console.log('\n3. 🧪 Testing API Queries:');
    
    // Test regular content API query (should work)
    console.log('\n   A. Regular Content API Query:');
    const regularQuery = `
      SELECT 
        content_items.content_key,
        content_items.component_type,
        content_translations.content_value
      FROM content_items
      JOIN content_translations ON content_items.id = content_translations.content_item_id
      WHERE content_items.screen_location = $1 
          AND content_translations.language_code = $2 
          AND content_translations.status = 'approved'
          AND content_items.is_active = true
      ORDER BY content_items.content_key
    `;
    
    const regularResult = await client.query(regularQuery, ['mortgage_step1', 'en']);
    console.log(`   Regular API returns: ${regularResult.rows.length} keys`);
    regularResult.rows.forEach(row => {
      if (row.content_key.includes('mortgage_step1.field')) {
        console.log(`   ✅ ${row.content_key}: ${row.component_type}`);
      }
    });
    
    // Test dropdown API query (might be filtered out)
    console.log('\n   B. Dropdown API Query (with component_type filter):');
    const dropdownQuery = `
      SELECT 
        content_items.content_key,
        content_items.component_type,
        content_translations.content_value
      FROM content_items
      JOIN content_translations ON content_items.id = content_translations.content_item_id
      WHERE content_items.screen_location = $1 
          AND content_translations.language_code = $2
          AND content_translations.status = 'approved'
          AND content_items.is_active = true
          AND content_items.component_type IN ('dropdown_container', 'dropdown_option', 'option', 'placeholder', 'label')
      ORDER BY content_items.content_key
    `;
    
    const dropdownResult = await client.query(dropdownQuery, ['mortgage_step1', 'en']);
    console.log(`   Dropdown API returns: ${dropdownResult.rows.length} keys`);
    
    const mortgageFieldKeys = dropdownResult.rows.filter(row => 
      row.content_key.includes('mortgage_step1.field')
    );
    
    if (mortgageFieldKeys.length === 0) {
      console.log('   ❌ CONFIRMED: Dropdown API filters out ALL mortgage_step1.field.* keys!');
    } else {
      console.log('   ✅ Dropdown API includes these mortgage_step1.field.* keys:');
      mortgageFieldKeys.forEach(row => {
        console.log(`   ✅ ${row.content_key}: ${row.component_type}`);
      });
    }
    
    // Check translation status
    console.log('\n4. 📝 Translation Status Check:');
    const translationStatus = await client.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        ct.status,
        ct.content_value IS NOT NULL as has_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE 'mortgage_step1.field%'
      ORDER BY ci.content_key, ct.language_code
    `);
    
    const statusSummary = {};
    translationStatus.rows.forEach(row => {
      if (!statusSummary[row.content_key]) {
        statusSummary[row.content_key] = {};
      }
      statusSummary[row.content_key][row.language_code] = {
        status: row.status,
        has_value: row.has_value
      };
    });
    
    Object.entries(statusSummary).forEach(([key, languages]) => {
      console.log(`   ${key}:`);
      Object.entries(languages).forEach(([lang, info]) => {
        const statusIcon = info.status === 'approved' ? '✅' : '❌';
        const valueIcon = info.has_value ? '📝' : '❓';
        console.log(`     ${lang}: ${statusIcon} ${info.status} ${valueIcon}`);
      });
    });
    
    // Recommend fix
    console.log('\n5. 🔧 RECOMMENDED FIX:');
    if (filteredOut.length > 0) {
      console.log('   OPTION 1: Expand allowed component_type list in dropdown API');
      const missingTypes = [...new Set(filteredOut.map(row => row.component_type))];
      console.log('   Add these component types to the filter:');
      missingTypes.forEach(type => {
        console.log(`   + '${type}'`);
      });
      
      console.log('\n   OPTION 2: Update component_type values in database');
      console.log('   Change these component types to allowed values:');
      filteredOut.forEach(row => {
        const suggestedType = row.component_type.includes('placeholder') ? 'placeholder' : 'label';
        console.log(`   ${row.content_key}: "${row.component_type}" → "${suggestedType}"`);
      });
      
      console.log('\n   OPTION 3: Frontend should use regular Content API, not Dropdown API');
      console.log('   Change frontend to call: /api/content/mortgage_step1/en (not dropdown endpoint)');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await client.end();
  }
}

// Run the debug
debugContentFiltering()
  .then(() => console.log('\n🎯 Debug complete!'))
  .catch(error => console.error('Debug error:', error.message));