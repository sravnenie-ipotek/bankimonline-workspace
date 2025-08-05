const { Client } = require('pg');
require('dotenv').config();

async function verifyMigration() {
  const client = new Client({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Get all sidebar menu items with their translations
    const query = `
      SELECT 
        ci.id,
        ci.content_key,
        ci.content_type,
        ci.category,
        ci.screen_location,
        ci.component_type,
        ci.legacy_translation_key,
        ci.migration_status,
        ci.is_active,
        json_agg(
          json_build_object(
            'language', ct.language_code,
            'value', ct.content_value,
            'status', ct.status,
            'is_default', ct.is_default
          ) ORDER BY ct.language_code
        ) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.category = 'sidebar_menu'
      GROUP BY ci.id
      ORDER BY ci.id;
    `;

    const result = await client.query(query);
    
    console.log(`Found ${result.rows.length} sidebar menu items:\n`);
    
    for (const item of result.rows) {
      console.log(`Content Key: ${item.content_key}`);
      console.log(`  ID: ${item.id}`);
      console.log(`  Type: ${item.content_type}`);
      console.log(`  Location: ${item.screen_location}`);
      console.log(`  Component: ${item.component_type}`);
      console.log(`  Legacy Key: ${item.legacy_translation_key}`);
      console.log(`  Status: ${item.migration_status}`);
      console.log(`  Active: ${item.is_active}`);
      console.log(`  Translations:`);
      
      for (const translation of item.translations) {
        console.log(`    ${translation.language}: "${translation.value}" (status: ${translation.status}, default: ${translation.is_default})`);
      }
      console.log('');
    }

    // Summary statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT ct.id) as total_translations,
        COUNT(DISTINCT ct.language_code) as languages_count,
        array_agg(DISTINCT ct.language_code ORDER BY ct.language_code) as languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.category = 'sidebar_menu';
    `;
    
    const statsResult = await client.query(statsQuery);
    const stats = statsResult.rows[0];
    
    console.log('=== SUMMARY ===');
    console.log(`Total sidebar menu items: ${stats.total_items}`);
    console.log(`Total translations: ${stats.total_translations}`);
    console.log(`Languages: ${stats.languages.join(', ')}`);
    console.log(`Average translations per item: ${(stats.total_translations / stats.total_items).toFixed(1)}`);

  } catch (error) {
    console.error('Error verifying migration:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

verifyMigration();