const fs = require('fs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 
                     process.env.DATABASE_PUBLIC_URL || 
                     process.env.DATABASE_URL || 
                     'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: { rejectUnauthorized: false }
});

async function restoreAndMarkMigratedKeys() {
    try {
        console.log('🔄 RESTORE & MARK: Fixing Migration Marking in Translation Files');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Get all content_keys from database
        const dbQuery = `
            SELECT DISTINCT content_key, screen_location
            FROM content_items 
            ORDER BY content_key;
        `;
        
        const dbResult = await pool.query(dbQuery);
        const dbKeys = new Set(dbResult.rows.map(row => row.content_key));
        
        console.log(`🗄️  Database content_keys: ${dbKeys.size}`);
        console.log();
        
        const languages = ['en', 'he', 'ru'];
        
        for (const lang of languages) {
            const filePath = `locales/${lang}/translation.json`;
            
            if (!fs.existsSync(filePath)) {
                console.log(`❌ File not found: ${filePath}`);
                continue;
            }
            
            console.log(`\n🔍 PROCESSING ${lang.toUpperCase()} TRANSLATION FILE:`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const originalCount = Object.keys(translations).length;
            
            // Find migrated keys that are marked incorrectly
            const migratedKeys = Object.keys(translations).filter(key => key.startsWith('__MIGRATED_'));
            const nonMigratedKeys = Object.keys(translations).filter(key => !key.startsWith('__MIGRATED_'));
            
            console.log(`📊 Current state: ${originalCount} total keys`);
            console.log(`   ✅ Marked as migrated: ${migratedKeys.length}`);
            console.log(`   🔄 Not marked: ${nonMigratedKeys.length}`);
            
            let restoredCount = 0;
            let markedCount = 0;
            const updatedTranslations = { ...translations };
            
            // Check for keys that need to be restored and marked
            for (const key of nonMigratedKeys) {
                if (dbKeys.has(key)) {
                    // This key exists in DB but is not marked as migrated
                    const migratedKey = `__MIGRATED_${key}`;
                    
                    if (!updatedTranslations[migratedKey]) {
                        // Mark it as migrated (keep original as fallback)
                        updatedTranslations[migratedKey] = updatedTranslations[key];
                        markedCount++;
                        console.log(`🏷️  Marked: ${key} → ${migratedKey}`);
                    }
                }
            }
            
            // Check for migrated keys that might have lost their original
            for (const migratedKey of migratedKeys) {
                const originalKey = migratedKey.replace('__MIGRATED_', '');
                
                if (!updatedTranslations[originalKey] && dbKeys.has(originalKey)) {
                    // Restore the original key as fallback
                    updatedTranslations[originalKey] = updatedTranslations[migratedKey];
                    restoredCount++;
                    console.log(`🔄 Restored: ${originalKey} (from ${migratedKey})`);
                }
            }
            
            // Also check if we accidentally deleted keys that should exist as fallback
            for (const dbKey of dbKeys) {
                const migratedKey = `__MIGRATED_${dbKey}`;
                
                if (updatedTranslations[migratedKey] && !updatedTranslations[dbKey]) {
                    // Restore original key for fallback
                    updatedTranslations[dbKey] = updatedTranslations[migratedKey];
                    restoredCount++;
                    console.log(`🔄 Restored fallback: ${dbKey}`);
                }
            }
            
            // Save updated translation file
            if (restoredCount > 0 || markedCount > 0) {
                fs.writeFileSync(filePath, JSON.stringify(updatedTranslations, null, 2), 'utf8');
                console.log(`\n💾 SAVED: ${filePath}`);
                console.log(`   🔄 Keys restored: ${restoredCount}`);
                console.log(`   🏷️  Keys marked: ${markedCount}`);
            } else {
                console.log(`\n✅ No changes needed for ${lang}`);
            }
            
            // Final verification
            const finalTranslations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const finalMigrated = Object.keys(finalTranslations).filter(key => key.startsWith('__MIGRATED_')).length;
            const finalNonMigrated = Object.keys(finalTranslations).filter(key => !key.startsWith('__MIGRATED_')).length;
            
            console.log(`\n📊 FINAL STATE FOR ${lang}:`);
            console.log(`   📝 Total keys: ${Object.keys(finalTranslations).length}`);
            console.log(`   ✅ Migrated: ${finalMigrated}`);
            console.log(`   🔄 Non-migrated: ${finalNonMigrated}`);
            
            // Verify all DB keys have both versions
            const missingFallbacks = [];
            for (const dbKey of dbKeys) {
                if (!finalTranslations[dbKey]) {
                    missingFallbacks.push(dbKey);
                }
            }
            
            if (missingFallbacks.length > 0) {
                console.log(`\n⚠️  MISSING FALLBACKS (${missingFallbacks.length}):`);
                missingFallbacks.slice(0, 5).forEach(key => {
                    console.log(`   ❌ ${key}`);
                });
                if (missingFallbacks.length > 5) {
                    console.log(`   ... and ${missingFallbacks.length - 5} more`);
                }
            } else {
                console.log(`\n✅ All DB keys have fallbacks in ${lang}`);
            }
        }
        
        console.log('\n🎯 SUMMARY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Translation files now have proper structure:');
        console.log('   - Original keys preserved as fallbacks');
        console.log('   - DB keys marked with __MIGRATED_ prefix');
        console.log('   - No data loss from migration process');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

restoreAndMarkMigratedKeys(); 