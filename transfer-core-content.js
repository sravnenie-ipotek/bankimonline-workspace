#!/usr/bin/env node

/**
 * TRANSFER UNIQUE CONTENT FROM BANKIM_CORE TO BANKIM_CONTENT
 * Version: 0.1_1755776100000
 * Phase 3 of database separation - consolidates all content in bankim_content
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

class ContentTransfer {
    constructor() {
        this.stats = {
            contentItemsTransferred: 0,
            translationsTransferred: 0,
            dropdownConfigsTransferred: 0,
            localesTransferred: 0,
            conflicts: 0,
            errors: []
        };
    }

    async transferAllContent() {
        console.log('🚚 TRANSFERRING CONTENT FROM CORE TO CONTENT DATABASE');
        console.log('====================================================\n');

        try {
            await contentPool.query('BEGIN');
            await corePool.query('BEGIN');

            // Step 1: Transfer unique content items (not conflicts)
            await this.transferUniqueContentItems();

            // Step 2: Transfer translations for the transferred content items
            await this.transferContentTranslations();

            // Step 3: Transfer dropdown_configs
            await this.transferDropdownConfigs();

            // Step 4: Transfer locales  
            await this.transferLocales();

            // Step 5: Validate the transfer
            await this.validateTransfer();

            await contentPool.query('COMMIT');
            await corePool.query('COMMIT');

            this.printSummary();

        } catch (error) {
            console.error('🚨 Transfer failed:', error.message);
            await contentPool.query('ROLLBACK');
            await corePool.query('ROLLBACK');
            throw error;
        }
    }

    async transferUniqueContentItems() {
        console.log('📝 Transferring unique content items...');

        // Get content items that are in core but not in content (avoid conflicts)
        const uniqueItems = await corePool.query(`
            SELECT ci.*
            FROM content_items ci
            WHERE NOT EXISTS (
                SELECT 1 FROM content_items 
                -- We'll check against bankim_content via a different approach
            )
        `);

        // Get all content keys from bankim_content for comparison
        const existingKeys = await contentPool.query(`
            SELECT content_key, screen_location 
            FROM content_items
        `);

        const existingKeySet = new Set();
        existingKeys.rows.forEach(row => {
            existingKeySet.add(`${row.content_key}|${row.screen_location}`);
        });

        // Filter out items that already exist in content database
        const coreItems = await corePool.query(`
            SELECT id, content_key, screen_location, component_type, category, 
                   status, created_at, updated_at, app_context_id, is_active, page_number
            FROM content_items
            ORDER BY content_key
        `);

        let transferred = 0;
        let conflicts = 0;

        for (const item of coreItems.rows) {
            const key = `${item.content_key}|${item.screen_location}`;
            
            if (!existingKeySet.has(key)) {
                // This item doesn't exist in content database - transfer it
                try {
                    await contentPool.query(`
                        INSERT INTO content_items (
                            content_key, screen_location, component_type, category,
                            status, created_at, updated_at, app_context_id, is_active, page_number
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    `, [
                        item.content_key,
                        item.screen_location, 
                        item.component_type,
                        item.category,
                        item.status || 'active',
                        item.created_at,
                        item.updated_at,
                        item.app_context_id || 1,
                        item.is_active !== false,
                        item.page_number
                    ]);
                    transferred++;
                } catch (error) {
                    this.stats.errors.push(`Content item ${item.content_key}: ${error.message}`);
                }
            } else {
                conflicts++;
            }
        }

        this.stats.contentItemsTransferred = transferred;
        this.stats.conflicts = conflicts;
        
        console.log(`   ✅ Transferred: ${transferred} unique content items`);
        console.log(`   ⚠️  Conflicts avoided: ${conflicts} existing items`);
    }

    async transferContentTranslations() {
        console.log('🌐 Transferring content translations...');

        // Transfer translations for content items that were just added
        // We'll match by content_key between the databases
        
        const translations = await corePool.query(`
            SELECT ct.*, ci.content_key, ci.screen_location
            FROM content_translations ct
            JOIN content_items ci ON ct.content_item_id = ci.id
        `);

        let transferred = 0;

        for (const translation of translations.rows) {
            try {
                // Find the corresponding content item in the content database
                const contentItem = await contentPool.query(`
                    SELECT id FROM content_items 
                    WHERE content_key = $1 AND screen_location = $2
                `, [translation.content_key, translation.screen_location]);

                if (contentItem.rows.length > 0) {
                    const contentItemId = contentItem.rows[0].id;

                    // Check if translation already exists
                    const existingTranslation = await contentPool.query(`
                        SELECT id FROM content_translations
                        WHERE content_item_id = $1 AND language_code = $2
                    `, [contentItemId, translation.language_code]);

                    if (existingTranslation.rows.length === 0) {
                        // Insert the translation
                        await contentPool.query(`
                            INSERT INTO content_translations (
                                content_item_id, language_code, content_value, status, created_at, updated_at
                            ) VALUES ($1, $2, $3, $4, $5, $6)
                        `, [
                            contentItemId,
                            translation.language_code,
                            translation.content_value,
                            translation.status || 'active', 
                            translation.created_at,
                            translation.updated_at
                        ]);
                        transferred++;
                    }
                }
            } catch (error) {
                this.stats.errors.push(`Translation ${translation.content_key}/${translation.language_code}: ${error.message}`);
            }
        }

        this.stats.translationsTransferred = transferred;
        console.log(`   ✅ Transferred: ${transferred} translations`);
    }

    async transferDropdownConfigs() {
        console.log('📋 Transferring dropdown configurations...');

        const dropdowns = await corePool.query(`SELECT * FROM dropdown_configs`);

        for (const dropdown of dropdowns.rows) {
            try {
                await contentPool.query(`
                    INSERT INTO dropdown_configs (field_name, screen_location, config, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (field_name, screen_location) DO UPDATE SET
                        config = EXCLUDED.config,
                        updated_at = EXCLUDED.updated_at
                `, [
                    dropdown.field_name,
                    dropdown.screen_location,
                    dropdown.config,
                    dropdown.created_at,
                    dropdown.updated_at
                ]);
                this.stats.dropdownConfigsTransferred++;
            } catch (error) {
                this.stats.errors.push(`Dropdown ${dropdown.field_name}: ${error.message}`);
            }
        }

        console.log(`   ✅ Transferred: ${this.stats.dropdownConfigsTransferred} dropdown configs`);
    }

    async transferLocales() {
        console.log('🌍 Transferring locale data...');

        const locales = await corePool.query(`SELECT * FROM locales`);

        for (const locale of locales.rows) {
            try {
                await contentPool.query(`
                    INSERT INTO locales (key, language_code, value, namespace, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (key, language_code) DO UPDATE SET
                        value = EXCLUDED.value,
                        namespace = EXCLUDED.namespace,
                        updated_at = EXCLUDED.updated_at
                `, [
                    locale.key,
                    locale.language_code,
                    locale.value,
                    locale.namespace,
                    locale.created_at,
                    locale.updated_at
                ]);
                this.stats.localesTransferred++;
            } catch (error) {
                this.stats.errors.push(`Locale ${locale.key}/${locale.language_code}: ${error.message}`);
            }
        }

        console.log(`   ✅ Transferred: ${this.stats.localesTransferred} locale entries`);
    }

    async validateTransfer() {
        console.log('🔍 Validating transfer...');

        const validation = await contentPool.query(`SELECT * FROM validate_content_consolidation()`);
        
        console.log('\n📊 POST-TRANSFER VALIDATION:');
        validation.rows.forEach(row => {
            console.log(`   ${row.validation_type}: ${row.count_value} (${row.details})`);
        });
    }

    printSummary() {
        console.log('\n📈 TRANSFER SUMMARY');
        console.log('===================');
        console.log(`✅ Content Items: ${this.stats.contentItemsTransferred} transferred`);
        console.log(`✅ Translations: ${this.stats.translationsTransferred} transferred`);
        console.log(`✅ Dropdown Configs: ${this.stats.dropdownConfigsTransferred} transferred`);
        console.log(`✅ Locales: ${this.stats.localesTransferred} transferred`);
        console.log(`⚠️  Conflicts Avoided: ${this.stats.conflicts}`);
        console.log(`❌ Errors: ${this.stats.errors.length}`);

        if (this.stats.errors.length > 0) {
            console.log('\n🚨 ERRORS ENCOUNTERED:');
            this.stats.errors.slice(0, 10).forEach(error => {
                console.log(`   • ${error}`);
            });
            if (this.stats.errors.length > 10) {
                console.log(`   • ... and ${this.stats.errors.length - 10} more errors`);
            }
        }
    }

    async cleanup() {
        await corePool.end();
        await contentPool.end();
    }
}

async function main() {
    const transfer = new ContentTransfer();
    try {
        await transfer.transferAllContent();
        await transfer.cleanup();
        console.log('\n🎉 CONTENT CONSOLIDATION COMPLETE');
    } catch (error) {
        console.error('💥 Content transfer failed:', error);
        await transfer.cleanup();
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = ContentTransfer;