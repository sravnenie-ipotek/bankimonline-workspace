const { createPool } = require('./server/config/database-core.js');

async function testBothDatabases() {
  console.log('🔍 Testing both databases...\n');
  
  // Test content database
  const contentPool = createPool('content');
  try {
    console.log('📊 CONTENT DATABASE ANALYSIS:');
    
    // Check if content tables exist
    const contentTablesResult = await contentPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('content_items', 'content_translations')
      ORDER BY table_name;
    `);
    console.log('✅ Content tables:', contentTablesResult.rows.map(r => r.table_name));
    
    if (contentTablesResult.rows.length > 0) {
      // Check existing indexes on content tables
      const contentIndexesResult = await contentPool.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename IN ('content_items', 'content_translations')
        ORDER BY tablename, indexname;
      `);
      console.log('📋 Existing indexes on content tables:');
      contentIndexesResult.rows.forEach(idx => {
        console.log('   - ' + idx.tablename + '.' + idx.indexname + ': ' + idx.indexdef);
      });
      
      // Check table sizes and row counts
      const contentCountResult = await contentPool.query(`
        SELECT 
          'content_items' as table_name, COUNT(*) as row_count
        FROM content_items
        UNION ALL
        SELECT 
          'content_translations' as table_name, COUNT(*) as row_count
        FROM content_translations;
      `);
      console.log('📊 Table row counts:');
      contentCountResult.rows.forEach(row => {
        console.log('   - ' + row.table_name + ': ' + row.row_count + ' rows');
      });
    }
    
    await contentPool.end();
  } catch (error) {
    console.error('❌ Content database error:', error.message);
  }
  
  // Test main database
  const mainPool = createPool('main');
  try {
    console.log('\n📊 MAIN DATABASE ANALYSIS:');
    
    // Check if content tables exist in main DB too
    const mainTablesResult = await mainPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('content_items', 'content_translations')
      ORDER BY table_name;
    `);
    console.log('✅ Content tables in main DB:', mainTablesResult.rows.map(r => r.table_name));
    
    if (mainTablesResult.rows.length > 0) {
      // Check existing indexes on content tables in main DB
      const mainIndexesResult = await mainPool.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename IN ('content_items', 'content_translations')
        ORDER BY tablename, indexname;
      `);
      console.log('📋 Existing indexes on content tables in main DB:');
      mainIndexesResult.rows.forEach(idx => {
        console.log('   - ' + idx.tablename + '.' + idx.indexname + ': ' + idx.indexdef);
      });
    }
    
    await mainPool.end();
  } catch (error) {
    console.error('❌ Main database error:', error.message);
  }
}

testBothDatabases().catch(console.error);
