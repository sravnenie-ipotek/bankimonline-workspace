const { Pool } = require('pg');
const fs = require('fs');

// Connect to NEON database
const neonPool = new Pool({
    connectionString: process.env.NEON_CONTENT_URL || 'postgresql://neondb_owner:npg_jbzp4wqldAu7@ep-wild-feather-ad1lx42k.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

async function analyzeMissingDropdowns() {
    console.log('🔍 ANALYZING MISSING DROPDOWNS - Deep Investigation\n');
    console.log('=' .repeat(80));
    
    try {
        // 1. Get all dropdowns and their status
        const allDropdowns = await neonPool.query(`
            SELECT 
                dropdown_key,
                field_name,
                screen_location,
                dropdown_data,
                CASE 
                    WHEN dropdown_data IS NULL THEN 'NULL'
                    WHEN dropdown_data::text = '{}' THEN 'EMPTY_OBJECT'
                    WHEN dropdown_data::text = '[]' THEN 'EMPTY_ARRAY'
                    WHEN jsonb_array_length(COALESCE(dropdown_data->'options', '[]'::jsonb)) = 0 THEN 'NO_OPTIONS'
                    ELSE 'HAS_DATA'
                END as status,
                jsonb_array_length(COALESCE(dropdown_data->'options', '[]'::jsonb)) as option_count
            FROM dropdown_configs
            WHERE is_active = true
            ORDER BY screen_location, field_name
        `);
        
        console.log(`📊 Total dropdowns in database: ${allDropdowns.rows.length}\n`);
        
        // 2. Group by screen and status
        const screenStats = {};
        const missingDropdowns = [];
        
        for (const row of allDropdowns.rows) {
            if (!screenStats[row.screen_location]) {
                screenStats[row.screen_location] = {
                    total: 0,
                    has_data: 0,
                    missing: 0,
                    fields: []
                };
            }
            
            screenStats[row.screen_location].total++;
            
            if (row.status === 'HAS_DATA' && row.option_count > 0) {
                screenStats[row.screen_location].has_data++;
            } else {
                screenStats[row.screen_location].missing++;
                missingDropdowns.push({
                    key: row.dropdown_key,
                    field: row.field_name,
                    screen: row.screen_location,
                    status: row.status,
                    option_count: row.option_count
                });
            }
            
            screenStats[row.screen_location].fields.push({
                field: row.field_name,
                status: row.status,
                options: row.option_count
            });
        }
        
        // 3. Display statistics by screen
        console.log('📱 SCREEN-BY-SCREEN ANALYSIS:');
        console.log('-' .repeat(80));
        
        for (const [screen, stats] of Object.entries(screenStats)) {
            const successRate = ((stats.has_data / stats.total) * 100).toFixed(1);
            console.log(`\n🖥️  ${screen}`);
            console.log(`   Total: ${stats.total} | Working: ${stats.has_data} | Missing: ${stats.missing} | Success: ${successRate}%`);
            
            if (stats.missing > 0) {
                console.log('   ❌ Missing dropdowns:');
                stats.fields.filter(f => f.status !== 'HAS_DATA' || f.options === 0).forEach(f => {
                    console.log(`      - ${f.field} (${f.status}, ${f.options} options)`);
                });
            }
        }
        
        // 4. Identify unique field names that need fixing
        const uniqueFieldsToFix = new Set();
        missingDropdowns.forEach(d => uniqueFieldsToFix.add(d.field));
        
        console.log('\n' + '=' .repeat(80));
        console.log(`\n🎯 UNIQUE FIELDS NEEDING DATA: ${uniqueFieldsToFix.size}`);
        console.log('-' .repeat(80));
        
        const fieldArray = Array.from(uniqueFieldsToFix).sort();
        fieldArray.forEach((field, idx) => {
            console.log(`${idx + 1}. ${field}`);
        });
        
        // 5. Check for patterns in field names
        console.log('\n' + '=' .repeat(80));
        console.log('\n🔎 FIELD NAME PATTERNS:');
        console.log('-' .repeat(80));
        
        const patterns = {
            borrower: fieldArray.filter(f => f.includes('borrower')),
            income: fieldArray.filter(f => f.includes('income')),
            property: fieldArray.filter(f => f.includes('property')),
            loan: fieldArray.filter(f => f.includes('loan')),
            bank: fieldArray.filter(f => f.includes('bank')),
            purpose: fieldArray.filter(f => f.includes('purpose')),
            other: fieldArray.filter(f => !f.includes('borrower') && !f.includes('income') && 
                                          !f.includes('property') && !f.includes('loan') && 
                                          !f.includes('bank') && !f.includes('purpose'))
        };
        
        for (const [pattern, fields] of Object.entries(patterns)) {
            if (fields.length > 0) {
                console.log(`\n${pattern.toUpperCase()} related (${fields.length}):`);
                fields.forEach(f => console.log(`  - ${f}`));
            }
        }
        
        // 6. Save detailed analysis to file
        const analysis = {
            timestamp: new Date().toISOString(),
            total_dropdowns: allDropdowns.rows.length,
            missing_count: missingDropdowns.length,
            unique_fields_to_fix: fieldArray,
            screen_statistics: screenStats,
            missing_dropdowns: missingDropdowns,
            patterns: patterns
        };
        
        fs.writeFileSync(
            '/Users/michaelmishayev/Projects/bankDev2_standalone/missing-dropdowns-analysis.json',
            JSON.stringify(analysis, null, 2)
        );
        
        console.log('\n' + '=' .repeat(80));
        console.log('\n✅ Analysis complete! Saved to missing-dropdowns-analysis.json');
        console.log(`\n📈 SUMMARY:`);
        console.log(`   - Total dropdowns: ${allDropdowns.rows.length}`);
        console.log(`   - Missing data: ${missingDropdowns.length} (${((missingDropdowns.length / allDropdowns.rows.length) * 100).toFixed(1)}%)`);
        console.log(`   - Unique fields to fix: ${uniqueFieldsToFix.size}`);
        console.log(`   - Ready to generate comprehensive fix...`);
        
        return analysis;
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await neonPool.end();
    }
}

analyzeMissingDropdowns();