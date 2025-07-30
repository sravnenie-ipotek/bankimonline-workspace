require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection using same config as server-db.js
const pool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW() as time, current_database() as db');
        console.log('✅ Database connected successfully!');
        console.log(`   Database: ${result.rows[0].db}`);
        console.log(`   Time: ${result.rows[0].time}`);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

async function runVerificationQuery(title, query) {
    console.log(`\n🔍 ${title}`);
    console.log('='.repeat(60));
    
    try {
        const result = await pool.query(query);
        
        if (result.rows.length === 0) {
            console.log('📝 No results found');
            return;
        }
        
        // Print header
        const columns = Object.keys(result.rows[0]);
        console.log(columns.map(col => col.padEnd(25)).join(' | '));
        console.log('-'.repeat(columns.length * 27));
        
        // Print rows
        result.rows.forEach(row => {
            const values = columns.map(col => {
                const val = row[col] || '';
                return String(val).padEnd(25);
            });
            console.log(values.join(' | '));
        });
        
        console.log(`\n📊 Total rows: ${result.rows.length}`);
        return result.rows;
        
    } catch (error) {
        console.error('❌ Query failed:', error.message);
        return null;
    }
}

async function runUpdates() {
    console.log('\n🔧 RUNNING DROPDOWN COMPONENT TYPE FIXES');
    console.log('='.repeat(60));
    
    const updates = [
        {
            name: 'Credit Step 1 (2 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'credit_step1' 
                    AND content_key IN ('calculate_credit_prolong', 'calculate_credit_target')
                    AND component_type = 'field_label'`
        },
        {
            name: 'Credit Step 2 (7 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'credit_step2' 
                    AND content_key IN (
                        'calculate_credit_citizenship',
                        'calculate_credit_education', 
                        'calculate_credit_family_status',
                        'calculate_credit_foreigner',
                        'calculate_credit_medical_insurance',
                        'calculate_credit_public_person',
                        'calculate_credit_us_tax_reporting'
                    )
                    AND component_type = 'field_label'`
        },
        {
            name: 'Credit Step 3 (4 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'credit_step3' 
                    AND content_key IN (
                        'calculate_credit_additional_income',
                        'calculate_credit_existing_debts',
                        'calculate_credit_main_source_income',
                        'calculate_credit_professional_sphere'
                    )
                    AND component_type = 'field_label'`
        },
        {
            name: 'Mortgage Step 1 (6 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'mortgage_step1' 
                    AND content_key IN (
                        'calculate_mortgage_city',
                        'calculate_mortgage_debt_types',
                        'calculate_mortgage_family_status', 
                        'calculate_mortgage_has_additional',
                        'calculate_mortgage_main_source',
                        'mortgage_property_type'
                    )
                    AND component_type IN ('label', 'text', 'field_label')`
        },
        {
            name: 'Mortgage Step 2 (3 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'mortgage_step2' 
                    AND content_key IN (
                        'calculate_mortgage_borrowers',
                        'calculate_mortgage_children18',
                        'calculate_mortgage_citizenship'
                    )
                    AND component_type = 'label'`
        },
        {
            name: 'Mortgage Step 3 (1 field)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'mortgage_step3' 
                    AND content_key = 'calculate_mortgage_bank'
                    AND component_type = 'label'`
        },
        {
            name: 'Refinance Credit 2 (3 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'refinance_credit_2' 
                    AND content_key IN (
                        'calculate_mortgage_borrowers',
                        'calculate_mortgage_children18', 
                        'calculate_mortgage_citizenship'
                    )
                    AND component_type = 'label'`
        },
        {
            name: 'Refinance Mortgage 1 (1 field)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'refinance_mortgage_1' 
                    AND content_key = 'mortgage_refinance_why'
                    AND component_type = 'text'`
        }
    ];
    
    let totalUpdated = 0;
    
    for (const update of updates) {
        try {
            console.log(`\n📝 ${update.name}...`);
            const result = await pool.query(update.query);
            const rowsUpdated = result.rowCount;
            console.log(`   ✅ Updated ${rowsUpdated} rows`);
            totalUpdated += rowsUpdated;
        } catch (error) {
            console.error(`   ❌ Failed: ${error.message}`);
        }
    }
    
    console.log(`\n🎯 TOTAL UPDATED: ${totalUpdated} rows`);
    return totalUpdated;
}

async function main() {
    console.log('🚀 DROPDOWN COMPONENT TYPE FIXER');
    console.log('=====================================\n');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) return;
    
    // STEP 1: Show current problematic state
    await runVerificationQuery(
        'BEFORE - Problematic Fields (have options but wrong type)',
        `SELECT 
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
        WHERE ci.component_type IN ('text', 'label', 'field_label')
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        HAVING COUNT(opt.id) > 0
        ORDER BY ci.screen_location, ci.content_key`
    );
    
    // STEP 2: Run updates
    const totalUpdated = await runUpdates();
    
    if (totalUpdated === 0) {
        console.log('\n⚠️ No rows were updated. This might mean:');
        console.log('   - All fields are already correctly configured');
        console.log('   - The field names or screen locations don\'t match');
        console.log('   - The current component_type conditions don\'t match');
    }
    
    // STEP 3: Verify fixes were applied
    await runVerificationQuery(
        'AFTER - Verification (should all be ✅ FIXED CORRECTLY)',
        `SELECT 
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
        WHERE ci.content_key IN (
            'calculate_credit_prolong', 'calculate_credit_target',
            'calculate_credit_citizenship', 'calculate_credit_education', 'calculate_credit_family_status',
            'calculate_credit_foreigner', 'calculate_credit_medical_insurance', 'calculate_credit_public_person', 'calculate_credit_us_tax_reporting',
            'calculate_credit_additional_income', 'calculate_credit_existing_debts', 'calculate_credit_main_source_income', 'calculate_credit_professional_sphere',
            'calculate_mortgage_city', 'calculate_mortgage_debt_types', 'calculate_mortgage_family_status', 
            'calculate_mortgage_has_additional', 'calculate_mortgage_main_source', 'mortgage_property_type',
            'calculate_mortgage_borrowers', 'calculate_mortgage_children18', 'calculate_mortgage_citizenship',
            'calculate_mortgage_bank', 'mortgage_refinance_why'
        )
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        ORDER BY ci.screen_location, ci.content_key`
    );
    
    // STEP 4: Summary statistics
    await runVerificationQuery(
        'SUMMARY - By Screen Location',
        `SELECT 
            screen_location,
            COUNT(*) as total_dropdowns,
            SUM(CASE WHEN component_type = 'dropdown' THEN 1 ELSE 0 END) as correct_dropdowns,
            SUM(CASE WHEN component_type != 'dropdown' THEN 1 ELSE 0 END) as still_broken
        FROM content_items 
        WHERE content_key IN (
            'calculate_credit_prolong', 'calculate_credit_target',
            'calculate_credit_citizenship', 'calculate_credit_education', 'calculate_credit_family_status',
            'calculate_credit_foreigner', 'calculate_credit_medical_insurance', 'calculate_credit_public_person', 'calculate_credit_us_tax_reporting',
            'calculate_credit_additional_income', 'calculate_credit_existing_debts', 'calculate_credit_main_source_income', 'calculate_credit_professional_sphere',
            'calculate_mortgage_city', 'calculate_mortgage_debt_types', 'calculate_mortgage_family_status', 
            'calculate_mortgage_has_additional', 'calculate_mortgage_main_source', 'mortgage_property_type',
            'calculate_mortgage_borrowers', 'calculate_mortgage_children18', 'calculate_mortgage_citizenship',
            'calculate_mortgage_bank', 'mortgage_refinance_why'
        )
        GROUP BY screen_location
        ORDER BY screen_location`
    );
    
    console.log('\n🎉 DROPDOWN COMPONENT TYPE FIXES COMPLETED!');
    console.log('=====================================');
    console.log('✅ All problematic dropdown fields should now be properly configured');
    console.log('✅ Drill pages should now show dropdowns instead of text fields');
    console.log('✅ Edit pages should now show dropdown editors instead of text editors');
    
    pool.end();
}

main().catch(error => {
    console.error('❌ Script failed:', error);
    pool.end();
    process.exit(1);
}); 