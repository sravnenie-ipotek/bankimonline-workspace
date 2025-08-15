/**
 * Debug server grouping logic for dropdown API
 * This tests why mortgage_step3.field.main_source is not being grouped into mortgage_step3_main_source
 */

const testData = [
    {
        content_key: 'mortgage_step3.field.main_source',
        component_type: 'dropdown_container',
        content_value: 'מקור הכנסה עיקרי'
    },
    {
        content_key: 'mortgage_step3.field.main_source_employee',
        component_type: 'dropdown_option',
        content_value: 'עובד שכיר'
    },
    {
        content_key: 'mortgage_step3.field.additional_income',
        component_type: 'dropdown_container',
        content_value: 'הכנסה נוספת'
    },
    {
        content_key: 'mortgage_step3.field.additional_income_0_no_additional_income',
        component_type: 'dropdown_option',
        content_value: 'אין הכנסות נוספות'
    }
];

console.log('=== Testing Server Grouping Logic ===\n');

const dropdownMap = new Map();

testData.forEach(row => {
    console.log(`Processing: ${row.content_key} (${row.component_type})`);
    
    // Copy the exact field name extraction logic from server
    let fieldName = null;
    
    // Pattern 1: mortgage_step1.field.{fieldname} (handles both container and options)
    // Special pattern for numbered options like additional_income_0_no_additional_income
    let match = row.content_key.match(/^[^.]*\.field\.([^.]+?)_[0-9]_(?:no_additional_income|no_obligations)/);
    if (match) {
        fieldName = match[1];
        console.log(`  ✅ Matched Pattern 1a (numbered options): ${fieldName}`);
    } else {
        match = row.content_key.match(/^[^.]*\.field\.([^.]+)_(?:has_property|no_property|selling_property|within_3_months|3_to_6_months|6_to_12_months|over_12_months|apartment|garden_apartment|penthouse|private_house|other|yes_first_home|no_additional_property|investment|fixed_rate|variable_rate|mixed_rate|not_sure|im_|i_no_|i_own_|selling_|no_|has_|single|married|divorced|widowed|partner|commonlaw_partner|no_high_school_diploma|partial_high_school_diploma|full_high_school_diploma|postsecondary_education|bachelors|masters|doctorate|employee|selfemployed|pension|student|unemployed|unpaid_leave|additional_salary|additional_work|property_rental_income|no_additional_income|bank_loan|consumer_credit|credit_card|no_obligations|hapoalim|leumi|discount|massad|mizrahi)/);
        if (match) {
            fieldName = match[1];
            console.log(`  ✅ Matched Pattern 1b (standard options): ${fieldName}`);
        }
    }
    
    if (!fieldName) {
        // Fix: Handle underscores in field names like field_of_activity
        match = row.content_key.match(/^[^.]*\.field\.([^.]+?)_(?:agriculture|technology|healthcare|education|finance|real_estate|construction|retail|manufacturing|government|transport|consulting|entertainment|other)/);
        if (match) {
            fieldName = match[1];
            console.log(`  ✅ Matched Pattern 1c (underscore fields): ${fieldName}`);
        } else {
            // Fallback to original pattern
            match = row.content_key.match(/^[^.]*\.field\.([^.]+)/);
            if (match) {
                fieldName = match[1];
                console.log(`  ✅ Matched Pattern 1d (fallback): ${fieldName}`);
            }
        }
    }
    
    if (!fieldName) {
        console.log(`  ❌ No field name extracted`);
        return;
    }
    
    // Build the dropdown key as server does
    const dropdownKey = `mortgage_step3_${fieldName}`;
    console.log(`  📊 Generated dropdown key: ${dropdownKey}`);
    
    // Simulate server grouping logic
    if (!dropdownMap.has(dropdownKey)) {
        dropdownMap.set(dropdownKey, {
            options: [],
            label: null,
            placeholder: null
        });
    }
    
    const dropdownGroup = dropdownMap.get(dropdownKey);
    
    if (row.component_type === 'dropdown_container' || row.component_type === 'label') {
        dropdownGroup.label = row.content_value;
        console.log(`  🏷️  Set label: ${row.content_value}`);
    } else if (row.component_type === 'dropdown_option') {
        // Extract option value from the key
        const optionValue = row.content_key.split('_').pop() || row.content_key;
        dropdownGroup.options.push({
            value: optionValue,
            label: row.content_value
        });
        console.log(`  📝 Added option: ${optionValue} -> ${row.content_value}`);
    }
    
    console.log('');
});

console.log('=== Final Grouped Results ===');
for (const [key, value] of dropdownMap) {
    console.log(`${key}:`);
    console.log(`  Label: ${value.label}`);
    console.log(`  Options: ${value.options.length}`);
    value.options.forEach(option => {
        console.log(`    ${option.value}: ${option.label}`);
    });
    console.log('');
}