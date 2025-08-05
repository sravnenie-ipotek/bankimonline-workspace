const { Client } = require('pg');
require('dotenv').config();

async function checkDatabaseStructure() {
  const client = new Client({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database successfully\n');

    // Check content_items table structure
    console.log('=== CONTENT_ITEMS TABLE STRUCTURE ===');
    const contentItemsQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'content_items'
      ORDER BY ordinal_position;
    `;
    const contentItemsResult = await client.query(contentItemsQuery);
    console.table(contentItemsResult.rows);

    // Check content_translations table structure
    console.log('\n=== CONTENT_TRANSLATIONS TABLE STRUCTURE ===');
    const contentTranslationsQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'content_translations'
      ORDER BY ordinal_position;
    `;
    const contentTranslationsResult = await client.query(contentTranslationsQuery);
    console.table(contentTranslationsResult.rows);

    // Check for any existing sidebar menu content
    console.log('\n=== EXISTING SIDEBAR MENU CONTENT ===');
    const existingContentQuery = `
      SELECT 
        ci.id,
        ci.content_key,
        ci.content_type,
        ci.category,
        ci.screen_location,
        ci.component_type,
        ci.created_at
      FROM content_items ci
      WHERE ci.category = 'sidebar_menu'
      ORDER BY ci.id;
    `;
    const existingContentResult = await client.query(existingContentQuery);
    console.log(`Found ${existingContentResult.rows.length} existing sidebar menu items`);
    if (existingContentResult.rows.length > 0) {
      console.table(existingContentResult.rows);
    }

    // Check a sample of translations if any exist
    if (existingContentResult.rows.length > 0) {
      console.log('\n=== SAMPLE TRANSLATIONS ===');
      const translationsQuery = `
        SELECT 
          ct.content_item_id,
          ct.language_code,
          ct.content_value,
          ci.content_key
        FROM content_translations ct
        JOIN content_items ci ON ci.id = ct.content_item_id
        WHERE ci.category = 'sidebar_menu'
        ORDER BY ct.content_item_id, ct.language_code
        LIMIT 10;
      `;
      const translationsResult = await client.query(translationsQuery);
      console.table(translationsResult.rows);
    }

    // Check constraints and foreign keys
    console.log('\n=== FOREIGN KEY CONSTRAINTS ===');
    const constraintsQuery = `
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = 'content_translations' OR tc.table_name = 'content_items');
    `;
    const constraintsResult = await client.query(constraintsQuery);
    console.table(constraintsResult.rows);

  } catch (error) {
    console.error('Error checking database structure:', error);
  } finally {
    await client.end();
  }
}

checkDatabaseStructure();