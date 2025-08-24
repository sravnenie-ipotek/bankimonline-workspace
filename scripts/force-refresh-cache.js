const { Pool } = require('pg');

class CacheRefresher {
  constructor() {
    this.contentPool = new Pool({
      connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
      ssl: { rejectUnauthorized: false }
    });
  }

  async forceRefresh() {
    try {
      console.log('🔄 Force refreshing Railway database cache...');
      
      // Update a timestamp field to force cache invalidation
      const timestampQuery = `
        UPDATE content_translations 
        SET updated_at = NOW()
        WHERE content_item_id IN (
          SELECT id FROM content_items 
          WHERE content_key IN (
            'app.home.service.calculate_mortgage',
            'app.home.service.refinance_mortgage',
            'title_compare'
          )
        )
        AND language_code = 'he'
      `;
      
      const result = await this.contentPool.query(timestampQuery);
      console.log(`✅ Updated ${result.rowCount} records to force cache refresh`);
      
      // Verify the current state of the key translations
      const verifyQuery = `
        SELECT 
          ci.content_key,
          ci.screen_location,
          ct.language_code,
          ct.content_value,
          ct.updated_at
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.content_key IN (
          'app.home.service.calculate_mortgage',
          'app.home.service.refinance_mortgage',
          'title_compare'
        )
        AND ct.language_code = 'he'
        ORDER BY ci.content_key
      `;
      
      const verifyResult = await this.contentPool.query(verifyQuery);
      console.log('\n📋 Current state of key translations:');
      verifyResult.rows.forEach(row => {
        console.log(`  ✅ ${row.content_key} (${row.screen_location}): "${row.content_value}"`);
        console.log(`     Last updated: ${row.updated_at}`);
      });

      console.log('\n🎉 Cache refresh completed!');
      console.log('\n📝 To see the changes, please:');
      console.log('   1. Hard refresh your browser:');
      console.log('      - Windows/Linux: Ctrl + F5');
      console.log('      - Mac: Cmd + Shift + R');
      console.log('   2. Clear browser cache completely:');
      console.log('      - Chrome: Settings > Privacy > Clear browsing data');
      console.log('      - Firefox: Options > Privacy > Clear Data');
      console.log('   3. If using a CDN, wait 5-10 minutes for CDN cache to clear');
      console.log('   4. Restart your application server if needed');

    } catch (error) {
      console.error('❌ Error forcing cache refresh:', error);
    } finally {
      await this.contentPool.end();
    }
  }
}

// Run the refresher
const refresher = new CacheRefresher();
refresher.forceRefresh();
