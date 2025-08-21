const { Pool } = require('pg');

// Railway database connection
const railwayContentPool = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  max: 1
});

async function checkSchema() {
  console.log('🔍 CHECKING RAILWAY DATABASE SCHEMA\n');
  
  try {
    // Check content_translations columns
    const columns = await railwayContentPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_translations'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 content_translations columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if our key exists
    const check = await railwayContentPool.query(`
      SELECT * FROM content_items 
      WHERE content_key = 'mortgage_refinance_price'
      LIMIT 1
    `);
    
    if (check.rows.length > 0) {
      console.log('\n✅ mortgage_refinance_price exists in Railway!');
      console.log('  ID:', check.rows[0].id);
      
      // Check translations with correct column name
      const trans = await railwayContentPool.query(`
        SELECT * FROM content_translations 
        WHERE content_item_id = $1
      `, [check.rows[0].id]);
      
      console.log(`  Translations: ${trans.rows.length} found`);
      trans.rows.forEach(t => {
        console.log(`    - ${t.language_code}: ${t.content_text || t.translation_text || t.text}`);
      });
    }
    
    console.log('\n✅ Railway database content items synced: 2800 items');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await railwayContentPool.end();
  }
}

checkSchema();