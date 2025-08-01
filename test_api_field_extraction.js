#!/usr/bin/env node

// Test the field name extraction logic from the API

const testKeys = [
    // when_needed
    'mortgage_step1.field.when_needed',
    'mortgage_step1.field.when_needed_within_3_months',
    'mortgage_step1.field.when_needed_3_to_6_months',
    
    // type
    'mortgage_step1.field.type',
    'mortgage_step1.field.type_apartment',
    'mortgage_step1.field.type_private_house',
    
    // first_home
    'mortgage_step1.field.first_home',
    'mortgage_step1.field.first_home_yes_first_home',
    'mortgage_step1.field.first_home_investment',
];

testKeys.forEach(key => {
    console.log(`\nTesting: ${key}`);
    
    let fieldName = null;
    
    // Pattern 1: mortgage_step1.field.{fieldname} (handles both container and options)
    let match = key.match(/^[^.]*\.field\.([^.]+?)_(?:im_|i_no_|i_own_|selling_|no_|has_)/);
    if (match) {
        fieldName = match[1];
        console.log(`  Pattern 1 (option): ${fieldName}`);
    } else {
        match = key.match(/^[^.]*\.field\.([^.]+)/);
        if (match) {
            fieldName = match[1];
            console.log(`  Pattern 1 (container): ${fieldName}`);
        }
    }
    
    if (!fieldName) {
        console.log(`  NO MATCH!`);
    }
    
    console.log(`  Result fieldName: ${fieldName}`);
    console.log(`  Dropdown key would be: mortgage_step1_${fieldName}`);
});