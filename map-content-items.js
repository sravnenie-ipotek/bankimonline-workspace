const { Pool } = require('pg');
const fs = require('fs');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function mapContentItems() {
    try {
        // 1. Get table structure
        const structureResult = await contentPool.query(`
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_name = 'content_items'
            ORDER BY ordinal_position
        `);

        // 2. Get all content items with full details
        const contentResult = await contentPool.query(`
            SELECT * FROM content_items
            ORDER BY screen_location, category, key
        `);

        // 3. Get unique values for each field
        const uniqueScreens = await contentPool.query(`
            SELECT DISTINCT screen_location, COUNT(*) as count
            FROM content_items
            GROUP BY screen_location
            ORDER BY count DESC, screen_location
        `);

        const uniqueCategories = await contentPool.query(`
            SELECT DISTINCT category, COUNT(*) as count
            FROM content_items
            GROUP BY category
            ORDER BY count DESC, category
        `);

        const uniqueComponents = await contentPool.query(`
            SELECT DISTINCT component_type, COUNT(*) as count
            FROM content_items
            GROUP BY component_type
            ORDER BY count DESC, component_type
        `);

        const uniqueStatuses = await contentPool.query(`
            SELECT DISTINCT status, COUNT(*) as count
            FROM content_items
            GROUP BY status
            ORDER BY count DESC, status
        `);

        // 4. Get content with translations count
        const translationStats = await contentPool.query(`
            SELECT 
                ci.id,
                ci.key,
                ci.screen_location,
                COUNT(DISTINCT ct.language_code) as translation_count,
                STRING_AGG(DISTINCT ct.language_code, ', ' ORDER BY ct.language_code) as available_languages
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            GROUP BY ci.id, ci.key, ci.screen_location
            ORDER BY ci.screen_location, ci.key
        `);

        // 5. Create comprehensive mapping
        const mapping = {
            metadata: {
                generated_at: new Date().toISOString(),
                total_items: contentResult.rows.length,
                database: 'banking_content'
            },
            table_structure: structureResult.rows.map(col => ({
                column: col.column_name,
                type: col.data_type,
                max_length: col.character_maximum_length,
                nullable: col.is_nullable,
                default: col.column_default
            })),
            statistics: {
                by_screen_location: uniqueScreens.rows.map(row => ({
                    screen: row.screen_location,
                    count: parseInt(row.count)
                })),
                by_category: uniqueCategories.rows.map(row => ({
                    category: row.category,
                    count: parseInt(row.count)
                })),
                by_component_type: uniqueComponents.rows.map(row => ({
                    component: row.component_type,
                    count: parseInt(row.count)
                })),
                by_status: uniqueStatuses.rows.map(row => ({
                    status: row.status,
                    count: parseInt(row.count)
                }))
            },
            content_mapping: {},
            translation_coverage: translationStats.rows.map(row => ({
                id: row.id,
                key: row.key,
                screen: row.screen_location,
                translations: parseInt(row.translation_count),
                languages: row.available_languages || 'none'
            })),
            items: contentResult.rows
        };

        // 6. Organize content by screen and category
        contentResult.rows.forEach(item => {
            const screen = item.screen_location || 'unassigned';
            const category = item.category || 'uncategorized';
            
            if (!mapping.content_mapping[screen]) {
                mapping.content_mapping[screen] = {};
            }
            
            if (!mapping.content_mapping[screen][category]) {
                mapping.content_mapping[screen][category] = [];
            }
            
            mapping.content_mapping[screen][category].push({
                id: item.id,
                key: item.key,
                component_type: item.component_type,
                status: item.status,
                created_at: item.created_at,
                updated_at: item.updated_at
            });
        });

        // 7. Save the mapping
        fs.writeFileSync(
            'content-items-mapping.json',
            JSON.stringify(mapping, null, 2)
        );

        // 8. Create a summary report
        const summary = {
            generated_at: new Date().toISOString(),
            overview: {
                total_content_items: contentResult.rows.length,
                unique_screens: uniqueScreens.rows.length,
                unique_categories: uniqueCategories.rows.length,
                unique_component_types: uniqueComponents.rows.length
            },
            screen_breakdown: {}
        };

        // Add screen breakdown
        for (const [screen, categories] of Object.entries(mapping.content_mapping)) {
            summary.screen_breakdown[screen] = {
                total_items: 0,
                categories: {}
            };
            
            for (const [category, items] of Object.entries(categories)) {
                summary.screen_breakdown[screen].categories[category] = items.length;
                summary.screen_breakdown[screen].total_items += items.length;
            }
        }

        fs.writeFileSync(
            'content-items-summary.json',
            JSON.stringify(summary, null, 2)
        );

        // Print summary
        console.log('Content Items Mapping Complete');
        console.log('==============================');
        console.log(`Total items: ${contentResult.rows.length}`);
        console.log(`\nScreens (${uniqueScreens.rows.length}):`);
        uniqueScreens.rows.forEach(row => {
            console.log(`  - ${row.screen_location}: ${row.count} items`);
        });
        console.log(`\nCategories (${uniqueCategories.rows.length}):`);
        uniqueCategories.rows.forEach(row => {
            console.log(`  - ${row.category}: ${row.count} items`);
        });
        console.log(`\nComponent Types (${uniqueComponents.rows.length}):`);
        uniqueComponents.rows.forEach(row => {
            console.log(`  - ${row.component_type}: ${row.count} items`);
        });
        console.log('\nFiles created:');
        console.log('  - content-items-mapping.json (full mapping)');
        console.log('  - content-items-summary.json (summary report)');

        await contentPool.end();
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

mapContentItems();