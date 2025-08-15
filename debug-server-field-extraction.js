/**
 * Debug the exact field name extraction logic used by the server
 * This will help identify why mortgage_step3.field.main_source is not being processed
 */

// Sample problematic keys from the database
const testKeys = [
    'mortgage_step3.field.main_source',
    'mortgage_step3.field.main_source_employee',
    'mortgage_step3.field.main_source_selfemployed',
    'mortgage_step3.field.additional_income',
    'mortgage_step3.field.additional_income_0_no_additional_income',
    'mortgage_step3.field.additional_income_additional_salary',
    // Some working examples
    'mortgage_step3_bank',
    'mortgage_step3_sphere'
];

function extractFieldName(contentKey) {
    console.log(`\n=== Processing: ${contentKey} ===`);
    
    // Copy EXACT logic from server-db.js lines 1105-1238
    let fieldName = null;
    
    // Pattern 1: mortgage_step1.field.{fieldname} (handles both container and options)
    // First check if this is an option that needs to be grouped
    // Special pattern for numbered options like additional_income_0_no_additional_income
    let match = contentKey.match(/^[^.]*\.field\.([^.]+?)_[0-9]_(?:no_additional_income|no_obligations)/);
    if (match) {
        fieldName = match[1];
        console.log(`✅ Pattern 1a (numbered options): ${fieldName}`);
        return fieldName;
    } else {
        match = contentKey.match(/^[^.]*\.field\.([^.]+)_(?:has_property|no_property|selling_property|within_3_months|3_to_6_months|6_to_12_months|over_12_months|apartment|garden_apartment|penthouse|private_house|other|yes_first_home|no_additional_property|investment|fixed_rate|variable_rate|mixed_rate|not_sure|im_|i_no_|i_own_|selling_|no_|has_|single|married|divorced|widowed|partner|commonlaw_partner|no_high_school_diploma|partial_high_school_diploma|full_high_school_diploma|postsecondary_education|bachelors|masters|doctorate|employee|selfemployed|pension|student|unemployed|unpaid_leave|additional_salary|additional_work|property_rental_income|no_additional_income|bank_loan|consumer_credit|credit_card|no_obligations|hapoalim|leumi|discount|massad|mizrahi)/);
        if (match) {
            fieldName = match[1];
            console.log(`✅ Pattern 1b (standard options): ${fieldName}`);
            return fieldName;
        }
    }
    
    if (!fieldName) {
        // Fix: Handle underscores in field names like field_of_activity
        // First try to match the full field name including underscores
        match = contentKey.match(/^[^.]*\.field\.([^.]+?)_(?:agriculture|technology|healthcare|education|finance|real_estate|construction|retail|manufacturing|government|transport|consulting|entertainment|other)/);
        if (match) {
            fieldName = match[1];
            console.log(`✅ Pattern 1c (underscore fields): ${fieldName}`);
            return fieldName;
        } else {
            // Fallback to original pattern
            match = contentKey.match(/^[^.]*\.field\.([^.]+)/);
            if (match) {
                fieldName = match[1];
                console.log(`✅ Pattern 1d (fallback): ${fieldName}`);
                return fieldName;
            }
        }
    }
    
    // Pattern 1.5: mortgage_stepN_{fieldname} (handles both container and options)
    if (!fieldName) {
        // Placeholder pattern (support both _ph and _options_ph)
        match = contentKey.match(/^mortgage_step\d+_([^_]+(?:_[^_]+)*)_(?:options_)?ph$/);
        if (match) {
            fieldName = match[1];
            console.log(`✅ Pattern 1.5a (placeholder): ${fieldName}`);
            return fieldName;
        } else if (contentKey.includes('_option_') || contentKey.includes('_options_')) {
            // Option pattern (support _option_N and _options_N)
            match = contentKey.match(/^mortgage_step\d+_([^_]+(?:_[^_]+)*)_(?:option|options)_\d+$/);
            if (match) {
                fieldName = match[1];
                console.log(`✅ Pattern 1.5b (option): ${fieldName}`);
                return fieldName;
            }
        } else {
            // Base container label
            match = contentKey.match(/^mortgage_step\d+_([^_]+(?:_[^_]+)*)$/);
            if (match) {
                fieldName = match[1];
                console.log(`✅ Pattern 1.5c (base): ${fieldName}`);
                return fieldName;
            }
        }
    }

    // Continue with other patterns...
    console.log(`❌ No field name extracted`);
    return null;
}

console.log('=== Testing Server Field Name Extraction Logic ===');

testKeys.forEach(key => {
    const result = extractFieldName(key);
    console.log(`Result: ${key} → ${result || 'NULL'}`);
});

console.log('\n=== Expected Results ===');
console.log('mortgage_step3.field.main_source → main_source');
console.log('mortgage_step3.field.additional_income → additional_income');
console.log('mortgage_step3_bank → bank');
console.log('mortgage_step3_sphere → sphere');