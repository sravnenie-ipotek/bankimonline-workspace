const { Pool } = require('pg');
const fs = require('fs');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function extractBankingContent() {
    try {
        // Get all content items with their translations
        const result = await contentPool.query(`
            SELECT 
                ci.id,
                ci.key,
                ci.category,
                ci.screen_location,
                ci.component_type,
                ci.status as item_status,
                ct.language_code,
                ct.value as content_value,
                ct.status as translation_status
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            ORDER BY ci.category, ci.screen_location, ci.key, ct.language_code
        `);
        
        console.log(`\n=== Total content items found: ${result.rows.length} ===\n`);
        
        // Group by category and screen_location
        const contentMapping = {
            mortgage: [],
            refinance_mortgage: [],
            credit: [],
            refinance_credit: [],
            general: [],
            unknown: []
        };
        
        // Process each row and categorize
        result.rows.forEach(row => {
            const key = row.key || '';
            const screen = row.screen_location || '';
            const category = row.category || '';
            
            // Categorize based on key patterns and screen location
            let processType = 'unknown';
            
            if (key || screen) {
                // Check for mortgage-related content
                if (key.includes('mortgage') || screen.includes('mortgage')) {
                    if (key.includes('refinance') || screen.includes('refinance')) {
                        processType = 'refinance_mortgage';
                    } else {
                        processType = 'mortgage';
                    }
                }
                // Check for credit-related content
                else if (key.includes('credit') || screen.includes('credit')) {
                    if (key.includes('refinance') || screen.includes('refinance')) {
                        processType = 'refinance_credit';
                    } else {
                        processType = 'credit';
                    }
                }
                // Check for general content
                else if (category === 'general' || screen === 'common') {
                    processType = 'general';
                }
            }
            
            contentMapping[processType].push({
                id: row.id,
                key: row.key,
                category: row.category,
                screen: row.screen_location,
                component: row.component_type,
                language: row.language_code,
                value: row.content_value,
                item_status: row.item_status,
                translation_status: row.translation_status
            });
        });
        
        // Generate the mapping report
        const report = {
            timestamp: new Date().toISOString(),
            total_items: result.rows.length,
            process_mapping: {}
        };
        
        // Add summaries for each process
        Object.keys(contentMapping).forEach(process => {
            const items = contentMapping[process];
            const uniqueKeys = [...new Set(items.map(item => item.key))];
            
            report.process_mapping[process] = {
                total_entries: items.length,
                unique_keys: uniqueKeys.length,
                screens: [...new Set(items.map(item => item.screen))],
                categories: [...new Set(items.map(item => item.category))],
                keys: uniqueKeys.sort()
            };
        });
        
        // Save detailed data
        fs.writeFileSync(
            'banking-content-data.json',
            JSON.stringify(contentMapping, null, 2)
        );
        
        // Save mapping report
        fs.writeFileSync(
            'banking-content-mapping.json',
            JSON.stringify(report, null, 2)
        );
        
        // Print summary
        console.log('Process Type Summary:');
        console.log('====================');
        Object.keys(contentMapping).forEach(process => {
            const count = contentMapping[process].length;
            const uniqueKeys = [...new Set(contentMapping[process].map(item => item.key))].length;
            console.log(`${process}: ${count} entries (${uniqueKeys} unique keys)`);
        });
        
        console.log('\nFiles created:');
        console.log('- banking-content-data.json (full data)');
        console.log('- banking-content-mapping.json (mapping report)');
        
        await contentPool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

extractBankingContent();