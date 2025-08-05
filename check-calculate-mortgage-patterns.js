#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

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
            console.table(result.rows);
        } else {
            console.log('   No results found');
        }
        return result;
    } catch (error) {
        console.error(`❌ Error in ${description}:`, error.message);
        return null;
    }
}

async function checkCalculateMortgagePatterns() {
    console.log('🔍 CHECKING CALCULATE_MORTGAGE_* PATTERNS');
    console.log('==========================================\n');
    
    // Check all calculate_mortgage_* fields
    await executeQuery(`
        SELECT 
            content_key,
            component_type,
            screen_location,
            is_active
        FROM content_items 
        WHERE content_key LIKE 'calculate_mortgage_%'
        ORDER BY content_key
    `, 'All calculate_mortgage_* fields in database');
    
    // Check for fields with _option_ patterns
    await executeQuery(`
        SELECT 
            content_key,
            component_type,
            screen_location
        FROM content_items 
        WHERE content_key LIKE 'calculate_mortgage_%_option_%'
        ORDER BY content_key
    `, 'All calculate_mortgage_*_option_* fields');
    
    // Check for problematic text fields with options
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            COUNT(opt.id) as option_count
        FROM content_items ci
        LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
            AND opt.content_key LIKE ci.content_key || '_option_%' 
            AND opt.component_type = 'option'
        WHERE ci.content_key LIKE 'calculate_mortgage_%'
            AND ci.component_type = 'text'
            AND ci.content_key NOT LIKE '%_option_%'
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        HAVING COUNT(opt.id) > 0
        ORDER BY ci.content_key
    `, 'calculate_mortgage_* text fields that have options');
    
    // Check what screen locations have calculate_mortgage_* fields
    await executeQuery(`
        SELECT 
            screen_location,
            COUNT(*) as field_count,
            STRING_AGG(DISTINCT component_type, ', ') as component_types
        FROM content_items 
        WHERE content_key LIKE 'calculate_mortgage_%'
        GROUP BY screen_location
        ORDER BY screen_location
    `, 'Screen locations with calculate_mortgage_* fields');
    
    pool.end();
}

checkCalculateMortgagePatterns().catch(error => {
    console.error('❌ Script failed:', error);
    pool.end();
    process.exit(1);
}); 