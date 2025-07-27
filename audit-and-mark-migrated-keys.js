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

async function auditAndMarkMigratedKeys() {
    try {
        console.log('🔍 AUDIT: Translation Keys vs Database Content');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Load translation files
        const languages = ['en', 'he', 'ru'];
        const translations = {};
        
        for (const lang of languages) {
            const filePath = `locales/${lang}/translation.json`;
            if (fs.existsSync(filePath)) {
                translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`📖 Loaded ${lang}: ${Object.keys(translations[lang]).length} keys`);
            }
        }
        
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
        
        // Analyze each language
        for (const lang of languages) {
            if (!translations[lang]) continue;
            
            console.log(`\n🔍 ANALYZING ${lang.toUpperCase()} TRANSLATION.JSON:`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            const jsonKeys = Object.keys(translations[lang]);
            const alreadyMigrated = jsonKeys.filter(key => key.startsWith('__MIGRATED_'));
            const notMigrated = jsonKeys.filter(key => !key.startsWith('__MIGRATED_'));
            
            console.log(`📊 Total keys in ${lang}: ${jsonKeys.length}`);
            console.log(`✅ Already marked migrated: ${alreadyMigrated.length}`);
            console.log(`🔄 Not marked migrated: ${notMigrated.length}`);
            
            // Check which non-migrated keys are actually in DB
            const inDbButNotMarked = [];
            const notInDb = [];
            
            for (const key of notMigrated) {
                if (dbKeys.has(key)) {
                    inDbButNotMarked.push(key);
                } else {
                    notInDb.push(key);
                }
            }
            
            console.log(`\n📋 ANALYSIS RESULTS FOR ${lang}:`);
            console.log(`🎯 In DB but not marked: ${inDbButNotMarked.length} keys`);
            console.log(`❌ Not in DB: ${notInDb.length} keys`);
            
            if (inDbButNotMarked.length > 0) {
                console.log(`\n🔄 KEYS THAT SHOULD BE MARKED AS MIGRATED (${lang}):`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
                // Create updated translation object
                const updatedTranslations = { ...translations[lang] };
                let markedCount = 0;
                
                for (const key of inDbButNotMarked) {
                    const value = updatedTranslations[key];
                    const newKey = `__MIGRATED_${key}`;
                    
                    // Add migrated version and remove original
                    updatedTranslations[newKey] = value;
                    delete updatedTranslations[key];
                    markedCount++;
                    
                    console.log(`✅ ${key} → ${newKey}`);
                }
                
                // Save updated translation file
                const filePath = `locales/${lang}/translation.json`;
                fs.writeFileSync(filePath, JSON.stringify(updatedTranslations, null, 2), 'utf8');
                
                console.log(`\n💾 SAVED: ${markedCount} keys marked as migrated in ${filePath}`);
            }
            
            if (notInDb.length > 0) {
                console.log(`\n❌ KEYS NOT YET MIGRATED TO DB (${lang}) - Sample:`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                notInDb.slice(0, 10).forEach(key => {
                    console.log(`📝 ${key}`);
                });
                if (notInDb.length > 10) {
                    console.log(`... and ${notInDb.length - 10} more keys`);
                }
            }
        }
        
        // Summary report
        console.log(`\n📊 FINAL SUMMARY:`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🗄️  Database content_keys: ${dbKeys.size}`);
        
        for (const lang of languages) {
            if (translations[lang]) {
                const jsonKeys = Object.keys(translations[lang]);
                const migrated = jsonKeys.filter(key => key.startsWith('__MIGRATED_')).length;
                console.log(`📖 ${lang}: ${jsonKeys.length} total, ${migrated} migrated`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

auditAndMarkMigratedKeys(); 