const { createPool } = require('./server/config/database-core.js');

async function testQueryPerformance() {
  console.log('🔍 ANALYZING DROPDOWN QUERY PERFORMANCE...\n');
  
  const contentPool = createPool('content');
  
  try {
    // Test the actual query from the dropdown API
    const testScreen = 'credit_refinance_step3'; // This is what's causing 1137ms
    const testLanguage = 'en';
    
    console.log('📊 Testing actual dropdown query performance:');
    console.log(`   Screen: ${testScreen}`);
    console.log(`   Language: ${testLanguage}\n`);
    
    // Get query execution plan BEFORE index changes
    console.log('🔍 EXPLAIN ANALYZE (before proposed indexes):');
    const explainResult = await contentPool.query(`
      EXPLAIN (ANALYZE, BUFFERS) 
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
      ORDER BY content_items.content_key, content_items.component_type
    `, [testScreen, testLanguage]);
    
    explainResult.rows.forEach(row => {
      console.log('   ' + row['QUERY PLAN']);
    });
    
    console.log('\n📊 Timing actual query execution:');
    const startTime = Date.now();
    
    const actualResult = await contentPool.query(`
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
      ORDER BY content_items.content_key, content_items.component_type
    `, [testScreen, testLanguage]);
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    console.log(`   ⏱️  Query executed in: ${queryTime}ms`);
    console.log(`   📋 Results returned: ${actualResult.rows.length} rows`);
    
    if (queryTime > 500) {
      console.log(`   🚨 SLOW QUERY: ${queryTime}ms exceeds 500ms threshold`);
    } else {
      console.log(`   ✅ FAST QUERY: ${queryTime}ms within acceptable range`);
    }
    
    // Test index effectiveness prediction
    console.log('\n🔍 ANALYZING EXISTING INDEXES:');
    
    // Check what indexes are already being used
    const indexUsageResult = await contentPool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'content_items' 
        AND (indexdef LIKE '%screen_location%' OR indexname LIKE '%screen%')
      ORDER BY indexname;
    `);
    
    console.log('📋 Screen-related indexes on content_items:');
    indexUsageResult.rows.forEach(idx => {
      console.log('   ✅ ' + idx.indexname + ': ' + idx.indexdef);
    });
    
    const translationIndexesResult = await contentPool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'content_translations' 
        AND (indexdef LIKE '%content_item_id%' OR indexdef LIKE '%language_code%' OR indexdef LIKE '%status%')
      ORDER BY indexname;
    `);
    
    console.log('\n📋 Join-related indexes on content_translations:');
    translationIndexesResult.rows.forEach(idx => {
      console.log('   ✅ ' + idx.indexname + ': ' + idx.indexdef);
    });
    
    // Check if proposed indexes would conflict
    console.log('\n🔍 PROPOSED INDEX ANALYSIS:');
    console.log('📋 Proposed Index 1: idx_content_items_screen_location ON content_items(screen_location)');
    
    const existingScreenIndex = indexUsageResult.rows.find(idx => 
      idx.indexdef.includes('screen_location') && !idx.indexdef.includes(',')
    );
    
    if (existingScreenIndex) {
      console.log('   ⚠️  CONFLICT: Similar index already exists: ' + existingScreenIndex.indexname);
      console.log('   🔧 RECOMMENDATION: Index may already provide the optimization');
    } else {
      console.log('   ✅ NO CONFLICT: New index would be beneficial');
    }
    
    console.log('\n📋 Proposed Index 2: idx_content_translations_lookup ON content_translations(content_item_id, language_code, status)');
    
    const existingCompoundIndex = translationIndexesResult.rows.find(idx => 
      idx.indexdef.includes('content_item_id') && 
      idx.indexdef.includes('language_code') && 
      idx.indexdef.includes('status')
    );
    
    if (existingCompoundIndex) {
      console.log('   ⚠️  CONFLICT: Similar compound index already exists: ' + existingCompoundIndex.indexname);
    } else {
      console.log('   ✅ NO CONFLICT: New compound index would be beneficial');
    }
    
    await contentPool.end();
    
    return {
      queryTime: queryTime,
      needsOptimization: queryTime > 500,
      resultCount: actualResult.rows.length,
      hasConflicts: existingScreenIndex || existingCompoundIndex
    };
    
  } catch (error) {
    console.error('❌ Query performance test error:', error.message);
    await contentPool.end();
    return { error: error.message };
  }
}

testQueryPerformance().then(result => {
  console.log('\n🏆 PERFORMANCE ANALYSIS SUMMARY:');
  if (result.error) {
    console.log('❌ Test failed:', result.error);
  } else {
    console.log(`⏱️  Current Query Time: ${result.queryTime}ms`);
    console.log(`📊 Query Status: ${result.needsOptimization ? 'NEEDS OPTIMIZATION' : 'ACCEPTABLE'}`);
    console.log(`📋 Result Count: ${result.resultCount} rows`);
    console.log(`🔧 Index Conflicts: ${result.hasConflicts ? 'YES - Review needed' : 'NO - Safe to proceed'}`);
    
    if (result.queryTime > 1000) {
      console.log('\n🚨 CRITICAL: Query time exceeds 1000ms - Immediate optimization required');
    } else if (result.queryTime > 500) {
      console.log('\n⚠️  WARNING: Query time exceeds 500ms - Optimization recommended');
    } else {
      console.log('\n✅ GOOD: Query performance within acceptable range');
    }
  }
}).catch(console.error);
