#!/usr/bin/env node

/**
 * 🚨 EMERGENCY FIX: Credit Calculator Dropdown Values Migration
 * 
 * CRITICAL BUSINESS ISSUE:
 * - Credit API returns numeric values: {"value": "1", "label": "Employee"}  
 * - Frontend expects semantic values: {"value": "employee", "label": "Employee"}
 * - Result: NO income components render after selection -> BROKEN CREDIT FLOW
 * 
 * This script converts numeric values to semantic values in the content database
 * for calculate_credit_3 screen location.
 * 
 * SOLUTION: Add semantic value patterns to dropdown processing for main_source field
 */

require('dotenv').config();
const { Pool } = require('pg');

// Content Database Connection (Railway)
const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
    ssl: { rejectUnauthorized: false }
});

// Mapping of option numbers to semantic values for main_source
const MAIN_SOURCE_VALUE_MAPPING = {
    '1': 'employee',
    '2': 'selfemployed', 
    '3': 'selfemployed', // Business owner treated as self-employed
    '4': 'pension',
    '5': 'student',
    '6': 'unemployed',
    '7': 'other'
};

// Mapping for has_additional field
const HAS_ADDITIONAL_VALUE_MAPPING = {
    '1': 'no_additional_income',
    '2': 'additional_salary',
    '3': 'additional_work',
    '4': 'investment_income',
    '5': 'property_rental_income',
    '6': 'pension_benefits',
    '7': 'other_income'
};

// Mapping for debt_types/types field
const DEBT_TYPES_VALUE_MAPPING = {
    '1': 'no_obligations',
    '2': 'credit_card',
    '3': 'bank_loan', 
    '4': 'consumer_credit',
    '5': 'other_obligations'
};

// Mapping for field_of_activity
const FIELD_OF_ACTIVITY_VALUE_MAPPING = {
    '1': 'technology',
    '2': 'healthcare',
    '3': 'education',
    '4': 'finance',
    '5': 'real_estate',
    '6': 'construction',
    '7': 'retail',
    '8': 'manufacturing',
    '9': 'government',
    '10': 'transport',
    '11': 'consulting',
    '12': 'entertainment',
    '13': 'other'
};

async function fixCreditDropdownValues() {
    try {
        // Test database connection
        await contentPool.query('SELECT NOW()');
        // Step 1: Analyze current data
        const analysisResult = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.component_type,
                ct.content_value,
                ct.language_code,
                ci.id as content_item_id,
                ct.id as translation_id
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = 'calculate_credit_3'
                AND ci.component_type = 'option'
                AND ct.status = 'approved'
                AND ci.is_active = true
                AND ci.content_key ~ '_option_[0-9]+$'
            ORDER BY ci.content_key, ct.language_code
        `);
        
        // Group by field and option number
        const fieldGroups = {};
        analysisResult.rows.forEach(row => {
            // Extract field name and option number
            const match = row.content_key.match(/calculate_credit_3_([^_]+(?:_[^_]+)*)_option_(\d+)$/);
            if (match) {
                const fieldName = match[1];
                const optionNum = match[2];
                
                if (!fieldGroups[fieldName]) {
                    fieldGroups[fieldName] = {};
                }
                if (!fieldGroups[fieldName][optionNum]) {
                    fieldGroups[fieldName][optionNum] = [];
                }
                fieldGroups[fieldName][optionNum].push(row);
            }
        });

        for (const [fieldName, options] of Object.entries(fieldGroups)) {
            .length} options`);
        }

        // Step 2: Display current API output for verification
        const testResponse = await fetch('http://localhost:8003/api/dropdowns/calculate_credit_3/en');
        if (testResponse.ok) {
            const apiData = await testResponse.json();
            const mainSourceOptions = apiData.options?.calculate_credit_3_main_source || [];
            mainSourceOptions.forEach(opt => {
                });
        } else {
            }

        // Step 3: The REAL FIX - Update server-side processing
        $/ pattern extracts numeric values from _option_1, _option_2, etc.');
        // Step 4: Generate the semantic mapping fix
        {
            const semanticMapping = {
                '1': 'employee',
                '2': 'selfemployed', 
                '3': 'selfemployed', // Business owner as self-employed
                '4': 'pension',
                '5': 'student',
                '6': 'unemployed',
                '7': 'other'
            };
            if (semanticMapping[optionValue]) {
                optionValue = semanticMapping[optionValue];
            }
        } else if (fieldName === 'has_additional') {
            const semanticMapping = {
                '1': 'no_additional_income',
                '2': 'additional_salary',
                '3': 'additional_work',
                '4': 'investment_income',
                '5': 'property_rental_income',
                '6': 'pension_benefits',
                '7': 'other_income'
            };
            if (semanticMapping[optionValue]) {
                optionValue = semanticMapping[optionValue];
            }
        } else if (fieldName === 'debt_types' || fieldName === 'types') {
            const semanticMapping = {
                '1': 'no_obligations',
                '2': 'credit_card',
                '3': 'bank_loan', 
                '4': 'consumer_credit',
                '5': 'other_obligations'
            };
            if (semanticMapping[optionValue]) {
                optionValue = semanticMapping[optionValue];
            }
        } else if (fieldName === 'field_of_activity' || fieldName === 'activity') {
            const semanticMapping = {
                '1': 'technology',
                '2': 'healthcare',
                '3': 'education',
                '4': 'finance',
                '5': 'real_estate',
                '6': 'construction',
                '7': 'retail',
                '8': 'manufacturing',
                '9': 'government',
                '10': 'transport',
                '11': 'consulting',
                '12': 'entertainment',
                '13': 'other'
            };
            if (semanticMapping[optionValue]) {
                optionValue = semanticMapping[optionValue];
            }
        }
        `);

        ');

        } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await contentPool.end();
    }
}

// Self-executing function
if (require.main === module) {
    fixCreditDropdownValues().catch(console.error);
}

module.exports = { fixCreditDropdownValues };