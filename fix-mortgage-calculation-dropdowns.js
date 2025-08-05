#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

// Database connection using same config as server-db.js
const pool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: { rejectUnauthorized: false }
});

async function executeQuery(query, description) {
    console.log(`\n🔄 ${description}...`);
    try {
        const result = await pool.query(query);
        console.log(`✅ ${description} completed successfully`);
        if (result.rows && result.rows.length > 0) {
            console.table(result.rows.slice(0, 10)); // Limit to first 10 rows for readability
        }
        return result;
    } catch (error) {
        console.error(`❌ Error in ${description}:`, error.message);
        return null;
    }
}

async function fixMortgageCalculationDropdowns() {
    console.log('🚀 MORTGAGE CALCULATION DROPDOWN FIXER');
    console.log('==========================================\n');
    
    // STEP 1: Show current problematic state
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type as current_type,
            ci.screen_location,
            COUNT(opt.id) as option_count,
            CASE 
                WHEN ci.component_type = 'dropdown' THEN '✅ ALREADY CORRECT'
                WHEN COUNT(opt.id) > 0 THEN '❌ NEEDS FIX'
                ELSE '⚠️ NO OPTIONS'
            END as status
        FROM content_items ci
        LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
            AND opt.content_key LIKE ci.content_key || '_option_%' 
            AND opt.component_type = 'option'
        WHERE ci.screen_location = 'mortgage_calculation'
            AND ci.component_type IN ('text', 'label', 'field_label')
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        HAVING COUNT(opt.id) > 0
        ORDER BY ci.content_key
    `, 'BEFORE - Problematic Fields in mortgage_calculation');
    
    console.log('\n🔧 RUNNING MORTGAGE CALCULATION DROPDOWN FIXES');
    console.log('='.repeat(60));
    
    let totalUpdated = 0;
    
    // STEP 2: Apply fixes for mortgage_calculation fields
    const updates = [
        {
            name: 'app.mortgage.form.* fields (4 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'mortgage_calculation' 
                    AND content_key LIKE 'app.mortgage.form.calculate_mortgage_%'
                    AND component_type = 'label'`
        },
        {
            name: 'mortgage_calculation.field.* fields (6+ fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'mortgage_calculation' 
                    AND content_key LIKE 'mortgage_calculation.field.%'
                    AND component_type = 'field_label'`
        }
    ];
    
    for (const update of updates) {
        console.log(`\n📝 ${update.name}...`);
        const result = await executeQuery(update.query, `Updating ${update.name}`);
        if (result) {
            const rowsUpdated = result.rowCount;
            console.log(`   ✅ Updated ${rowsUpdated} rows`);
            totalUpdated += rowsUpdated;
        }
    }
    
    console.log(`\n🎯 TOTAL UPDATED: ${totalUpdated} rows`);
    
    if (totalUpdated === 0) {
        console.log('\n⚠️ No rows were updated. This might mean:');
        console.log('   - All fields are already correctly configured');
        console.log('   - The field names or screen locations don\'t match');
        console.log('   - The current component_type conditions don\'t match');
    }
    
    // STEP 3: Verify fixes were applied
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type as new_type,
            ci.screen_location,
            COUNT(opt.id) as option_count,
            CASE 
                WHEN ci.component_type = 'dropdown' AND COUNT(opt.id) > 0 THEN '✅ FIXED CORRECTLY'
                WHEN ci.component_type = 'dropdown' AND COUNT(opt.id) = 0 THEN '⚠️ DROPDOWN BUT NO OPTIONS'
                WHEN ci.component_type != 'dropdown' AND COUNT(opt.id) > 0 THEN '❌ STILL BROKEN'
                ELSE '✅ OK'
            END as status
        FROM content_items ci
        LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
            AND opt.content_key LIKE ci.content_key || '_option_%' 
            AND opt.component_type = 'option'
        WHERE ci.screen_location = 'mortgage_calculation'
            AND (ci.content_key LIKE 'app.mortgage.form.calculate_mortgage_%' 
                 OR ci.content_key LIKE 'mortgage_calculation.field.%')
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        ORDER BY ci.content_key
    `, 'AFTER - Verification (should all be ✅ FIXED CORRECTLY)');
    
    // STEP 4: Summary statistics
    await executeQuery(`
        SELECT 
            screen_location,
            COUNT(*) as total_fields,
            SUM(CASE WHEN component_type = 'dropdown' THEN 1 ELSE 0 END) as dropdown_fields,
            SUM(CASE WHEN component_type != 'dropdown' THEN 1 ELSE 0 END) as non_dropdown_fields
        FROM content_items 
        WHERE screen_location = 'mortgage_calculation'
        GROUP BY screen_location
    `, 'SUMMARY - mortgage_calculation screen location');
    
    console.log('\n🎉 MORTGAGE CALCULATION DROPDOWN FIXES COMPLETED!');
    console.log('==========================================');
    console.log('✅ All problematic dropdown fields should now be properly configured');
    console.log('✅ Drill pages should now show dropdowns instead of text fields');
    console.log('✅ Edit pages should now show dropdown editors instead of text editors');
    
    pool.end();
}

fixMortgageCalculationDropdowns().catch(error => {
    console.error('❌ Script failed:', error);
    pool.end();
    process.exit(1);
}); 