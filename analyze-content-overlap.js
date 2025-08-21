#!/usr/bin/env node

/**
 * ANALYZE CONTENT OVERLAP BETWEEN DATABASES
 * Identifies duplicate, unique, and conflicting content before consolidation
 */

const { Pool } = require('pg');
require('dotenv').config();

const corePool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: false  
});

async function analyzeContentOverlap() {
    console.log('🔍 ANALYZING CONTENT OVERLAP BETWEEN DATABASES');
    console.log('==============================================\n');

    try {
        // Get all content_items from both databases
        const coreItems = await corePool.query(`
            SELECT content_key, screen_location, component_type, category, id
            FROM content_items
            ORDER BY content_key
        `);

        const contentItems = await contentPool.query(`
            SELECT content_key, screen_location, component_type, category, id  
            FROM content_items
            ORDER BY content_key
        `);

        console.log(`📊 CONTENT ITEMS COUNTS:`);
        console.log(`   bankim_core: ${coreItems.rows.length} items`);
        console.log(`   bankim_content: ${contentItems.rows.length} items`);

        // Create maps for comparison
        const coreMap = new Map();
        const contentMap = new Map();

        coreItems.rows.forEach(item => {
            coreMap.set(item.content_key, item);
        });

        contentItems.rows.forEach(item => {
            contentMap.set(item.content_key, item);
        });

        // Find overlaps and differences
        const inBothDatabases = [];
        const coreOnly = [];
        const contentOnly = [];
        const conflicts = [];

        // Check items in core database
        for (const [key, coreItem] of coreMap) {
            if (contentMap.has(key)) {
                const contentItem = contentMap.get(key);
                
                // Check for conflicts (same key, different metadata)
                if (coreItem.screen_location !== contentItem.screen_location ||
                    coreItem.component_type !== contentItem.component_type ||
                    coreItem.category !== contentItem.category) {
                    conflicts.push({
                        key,
                        core: coreItem,
                        content: contentItem
                    });
                } else {
                    inBothDatabases.push(key);
                }
            } else {
                coreOnly.push(coreItem);
            }
        }

        // Check items only in content database
        for (const [key, contentItem] of contentMap) {
            if (!coreMap.has(key)) {
                contentOnly.push(contentItem);
            }
        }

        console.log(`\n📈 OVERLAP ANALYSIS:`);
        console.log(`   Identical in both: ${inBothDatabases.length}`);
        console.log(`   Only in core: ${coreOnly.length}`);
        console.log(`   Only in content: ${contentOnly.length}`);
        console.log(`   Conflicts: ${conflicts.length}`);

        // Analyze translations for items in both databases  
        console.log(`\n🔤 TRANSLATION ANALYSIS:`);
        for (const key of inBothDatabases.slice(0, 5)) { // Sample first 5
            const coreTranslations = await corePool.query(`
                SELECT language_code, content_value
                FROM content_translations ct
                JOIN content_items ci ON ct.content_item_id = ci.id
                WHERE ci.content_key = $1
            `, [key]);

            const contentTranslations = await contentPool.query(`
                SELECT language_code, content_value  
                FROM content_translations ct
                JOIN content_items ci ON ct.content_item_id = ci.id
                WHERE ci.content_key = $1
            `, [key]);

            console.log(`   ${key}:`);
            console.log(`      core: ${coreTranslations.rows.length} translations`);
            console.log(`      content: ${contentTranslations.rows.length} translations`);
        }

        // Check for dropdown_configs and locales in core (should be moved)
        const coreDropdownConfigs = await corePool.query(`SELECT COUNT(*) as count FROM dropdown_configs`);
        const coreLocales = await corePool.query(`SELECT COUNT(*) as count FROM locales`);

        console.log(`\n🚨 TABLES TO MIGRATE FROM CORE:`);
        console.log(`   dropdown_configs: ${coreDropdownConfigs.rows[0].count} records`);
        console.log(`   locales: ${coreLocales.rows[0].count} records`);

        // Show conflicts in detail if any
        if (conflicts.length > 0) {
            console.log(`\n⚠️  CONFLICTS DETECTED:`);
            conflicts.forEach(conflict => {
                console.log(`   ${conflict.key}:`);
                console.log(`      core: ${conflict.core.screen_location}/${conflict.core.component_type}`);
                console.log(`      content: ${conflict.content.screen_location}/${conflict.content.component_type}`);
            });
        }

        // Show sample unique items
        if (coreOnly.length > 0) {
            console.log(`\n📋 SAMPLE CORE-ONLY ITEMS (first 10):`);
            coreOnly.slice(0, 10).forEach(item => {
                console.log(`   ${item.content_key} (${item.screen_location}/${item.component_type})`);
            });
        }

        if (contentOnly.length > 0) {
            console.log(`\n📋 SAMPLE CONTENT-ONLY ITEMS (first 10):`);
            contentOnly.slice(0, 10).forEach(item => {
                console.log(`   ${item.content_key} (${item.screen_location}/${item.component_type})`);
            });
        }

        // Generate consolidation recommendations
        console.log(`\n💡 CONSOLIDATION RECOMMENDATIONS:`);
        console.log(`   1. Merge ${coreOnly.length} unique items from core to content`);
        console.log(`   2. Resolve ${conflicts.length} conflicts manually`);  
        console.log(`   3. Keep ${contentOnly.length + inBothDatabases.length} items in content`);
        console.log(`   4. Migrate dropdown_configs and locales from core to content`);
        console.log(`   5. After consolidation, rename core content tables with 'migrated_' prefix`);

        return {
            inBothDatabases,
            coreOnly,
            contentOnly,
            conflicts,
            dropdownConfigs: parseInt(coreDropdownConfigs.rows[0].count),
            locales: parseInt(coreLocales.rows[0].count)
        };

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        throw error;
    } finally {
        await corePool.end();
        await contentPool.end();
    }
}

if (require.main === module) {
    analyzeContentOverlap().then(result => {
        console.log(`\n✅ Analysis complete. Ready for Phase 3 consolidation.`);
    }).catch(error => {
        console.error('💥 Analysis failed:', error);
        process.exit(1);
    });
}

module.exports = { analyzeContentOverlap };