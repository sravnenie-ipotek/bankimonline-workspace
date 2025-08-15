const { Pool } = require('pg');

const contentPool = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
});

async function checkSchema() {
  try {
    const schemaResult = await contentPool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'content_items'
      ORDER BY ordinal_position
    `);
    
    schemaResult.rows.forEach(row => {
      `);
    });
    
    const transSchema = await contentPool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'content_translations'
      ORDER BY ordinal_position
    `);
    
    transSchema.rows.forEach(row => {
      `);
    });
    
  } catch (error) {
    console.error('Schema check failed:', error.message);
  } finally {
    await contentPool.end();
  }
}

checkSchema();