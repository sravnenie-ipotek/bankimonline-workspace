const { Pool } = require('pg');

class RailwaySpecificUpdater {
  constructor() {
    // Use the Railway content database URL directly
    this.contentPool = new Pool({
      connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
      ssl: { rejectUnauthorized: false }
    });
  }

  async updateSpecificKeys() {
    try {
      console.log('🔍 Checking Railway database for specific problematic keys...');
      
      // First, let's check what keys are currently showing these values
      const checkQuery = `
        SELECT 
          ci.content_key,
          ci.screen_location,
          ct.language_code,
          ct.content_value
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ct.content_value IN (
          'משכנתא למימון מחדש',
          'דפים כלליים',
          'השוו בין בנקים וקבלו משכנתא'
        )
        AND ct.language_code = 'he'
        ORDER BY ci.content_key, ct.language_code
      `;
      
      const checkResult = await this.contentPool.query(checkQuery);
      console.log('📋 Current problematic keys found:');
      checkResult.rows.forEach(row => {
        console.log(`  - ${row.content_key} (${row.screen_location}): "${row.content_value}"`);
      });

      // Update the specific translations
      const updates = [
        {
          oldValue: 'משכנתא למימון מחדש',
          newValue: 'מיחזור משכנתא',
          description: 'Refinance mortgage'
        },
        {
          oldValue: 'דפים כלליים',
          newValue: 'חישוב משכנתא',
          description: 'Mortgage calculation'
        },
        {
          oldValue: 'השוו בין בנקים וקבלו משכנתא',
          newValue: 'השוו בין בנקים וקבלו את ההצעות המשתלמות ביותר',
          description: 'Compare banks and get the best offers'
        }
      ];

      let totalUpdated = 0;
      
      for (const update of updates) {
        const updateQuery = `
          UPDATE content_translations 
          SET content_value = $1
          WHERE content_value = $2
          AND language_code = 'he'
        `;
        
        const result = await this.contentPool.query(updateQuery, [update.newValue, update.oldValue]);
        
        if (result.rowCount > 0) {
          console.log(`✅ Updated ${result.rowCount} instances: "${update.oldValue}" → "${update.newValue}" (${update.description})`);
          totalUpdated += result.rowCount;
        } else {
          console.log(`⚠️  No instances found for: "${update.oldValue}"`);
        }
      }

      // Also check for any remaining instances with LIKE queries
      console.log('\n🔍 Checking for partial matches...');
      const partialUpdates = [
        {
          oldPattern: '%מחזור משכנתא%',
          newValue: 'מיחזור משכנתא',
          description: 'Fix missing י in refinance'
        }
      ];

      for (const update of partialUpdates) {
        const updateQuery = `
          UPDATE content_translations 
          SET content_value = $1
          WHERE content_value LIKE $2
          AND language_code = 'he'
        `;
        
        const result = await this.contentPool.query(updateQuery, [update.newValue, update.oldPattern]);
        
        if (result.rowCount > 0) {
          console.log(`✅ Updated ${result.rowCount} instances: "${update.oldPattern}" → "${update.newValue}" (${update.description})`);
          totalUpdated += result.rowCount;
        }
      }

      // Verify the updates
      console.log('\n🔍 Verifying updates...');
      const verifyQuery = `
        SELECT 
          ci.content_key,
          ci.screen_location,
          ct.language_code,
          ct.content_value
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ct.content_value IN (
          'מיחזור משכנתא',
          'חישוב משכנתא',
          'השוו בין בנקים וקבלו את ההצעות המשתלמות ביותר'
        )
        AND ct.language_code = 'he'
        ORDER BY ci.content_key, ct.language_code
      `;
      
      const verifyResult = await this.contentPool.query(verifyQuery);
      console.log('📋 Updated keys found:');
      verifyResult.rows.forEach(row => {
        console.log(`  ✅ ${row.content_key} (${row.screen_location}): "${row.content_value}"`);
      });

      console.log(`\n🎉 Total updates completed: ${totalUpdated}`);
      console.log('\n📝 Please refresh your application with a hard refresh:');
      console.log('   - Windows/Linux: Ctrl + F5');
      console.log('   - Mac: Cmd + Shift + R');
      console.log('   - Or clear browser cache completely');

    } catch (error) {
      console.error('❌ Error updating Railway specific Hebrew keys:', error);
    } finally {
      await this.contentPool.end();
    }
  }
}

// Run the updater
const updater = new RailwaySpecificUpdater();
updater.updateSpecificKeys();
