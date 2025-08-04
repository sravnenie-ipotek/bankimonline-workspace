// Debug the exact API processing logic with our real data
const testRows = [
    { content_key: 'calculate_mortgage_main_source', component_type: 'label', content_value: 'Main source of income' },
    { content_key: 'calculate_mortgage_main_source_ph', component_type: 'placeholder', content_value: 'Select your main source of income' },
    { content_key: 'calculate_mortgage_main_source_option_1', component_type: 'option', content_value: 'Employee' },
    { content_key: 'calculate_mortgage_main_source_option_2', component_type: 'option', content_value: 'Self-employed' },
    { content_key: 'calculate_mortgage_has_additional', component_type: 'label', content_value: 'Additional income' },
    { content_key: 'calculate_mortgage_has_additional_ph', component_type: 'placeholder', content_value: 'Do you have additional income?' },
    { content_key: 'calculate_mortgage_has_additional_option_1', component_type: 'option', content_value: 'No additional income' },
    { content_key: 'calculate_mortgage_debt_types', component_type: 'label', content_value: 'Existing obligations' },
    { content_key: 'calculate_mortgage_debt_types_ph', component_type: 'placeholder', content_value: 'Do you have existing debts or obligations?' },
    { content_key: 'calculate_mortgage_debt_types_option_1', component_type: 'option', content_value: 'No obligations' }
];

const screen = 'calculate_credit_3';
const response = {
    status: 'success',
    screen_location: screen,
    language_code: 'en',
    dropdowns: [],
    options: {},
    placeholders: {},
    labels: {},
    cached: false
};

// Group by dropdown field - extract field name from content_key
const dropdownMap = new Map();

testRows.forEach(row => {
    console.log(`\n🔍 Processing: ${row.content_key} (${row.component_type})`);
    
    let fieldName = null;
    
    // Pattern 2: app.mortgage.form.calculate_mortgage_{fieldname} (handles both container and options)
    // For options like: calculate_mortgage_property_ownership_selling_property
    let match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)_(?:im_|i_no_|i_own_|selling_|no_|has_)/);
    if (match) {
        fieldName = match[1];
        console.log(`  ✅ Pattern 2a matched: ${fieldName}`);
    } else {
        // For containers like: calculate_mortgage_property_ownership
        match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)(?:_ph|$)/);
        if (match) {
            fieldName = match[1];
            console.log(`  ✅ Pattern 2b matched: ${fieldName}`);
        } else {
            console.log(`  ❌ Pattern 2 failed`);
        }
    }
    
    // Pattern 5: Simple field name extraction from various patterns
    if (!fieldName) {
        // Try to extract from patterns like field_name_option_X or field_name_ph
        match = row.content_key.match(/([^._]+)(?:_option_|_ph|$)/);
        if (match && match[1] !== 'mortgage' && match[1] !== 'step1' && match[1] !== 'field') {
            fieldName = match[1];
            console.log(`  ✅ Pattern 5 matched: ${fieldName}`);
        }
    }
    
    // Fallback: use the content_key itself if no pattern matches
    if (!fieldName) {
        fieldName = row.content_key.replace(/[._]/g, '_');
        console.log(`  ⚠️ Fallback used: ${fieldName}`);
    }
    
    // Create dropdown key
    const dropdownKey = `${screen}_${fieldName}`;
    console.log(`  🔑 Dropdown key: ${dropdownKey}`);
    
    if (!dropdownMap.has(fieldName)) {
        dropdownMap.set(fieldName, {
            key: dropdownKey,
            label: null,
            options: [],
            placeholder: null
        });
        console.log(`  🆕 Created new dropdown for field: ${fieldName}`);
    }
    
    const dropdown = dropdownMap.get(fieldName);
    
    switch (row.component_type) {
        case 'dropdown_container':
        case 'label': // ← NEW: Handle label type like the working dropdowns
            dropdown.label = row.content_value;
            response.labels[dropdown.key] = row.content_value;
            console.log(`    📝 Set label: ${row.content_value}`);
            break;
            
        case 'dropdown_option':
        case 'option':
            // Extract option value from content_key
            let optionValue = null;
            
            // Try standard pattern: field_option_value
            const optionMatch = row.content_key.match(/_option_(.+)$/);
            if (optionMatch) {
                optionValue = optionMatch[1];
            } else {
                optionValue = row.content_key;
            }
            
            dropdown.options.push({
                value: optionValue,
                label: row.content_value
            });
            console.log(`    ➕ Added option: ${optionValue} = ${row.content_value}`);
            break;
            
        case 'placeholder':
            dropdown.placeholder = row.content_value;
            response.placeholders[dropdown.key] = row.content_value;
            console.log(`    💬 Set placeholder: ${row.content_value}`);
            break;
    }
});

// Build final response
console.log(`\n🏗️ Building final response...`);
dropdownMap.forEach((dropdown, fieldName) => {
    console.log(`\n📋 Checking dropdown: ${fieldName}`);
    console.log(`  - Label: ${dropdown.label}`);
    console.log(`  - Options: ${dropdown.options.length}`);
    console.log(`  - Placeholder: ${dropdown.placeholder}`);
    
    if (dropdown.label && dropdown.options.length > 0) {
        response.dropdowns.push({
            key: dropdown.key,
            label: dropdown.label
        });
        response.options[dropdown.key] = dropdown.options;
        console.log(`  ✅ Added to final response`);
    } else {
        console.log(`  ❌ Skipped (missing label or options)`);
    }
});

console.log(`\n🎯 FINAL RESULT:`);
console.log(`- Dropdowns found: ${response.dropdowns.length}`);
console.log(`- Dropdown keys: ${response.dropdowns.map(d => d.key)}`);
console.log(`- Options groups: ${Object.keys(response.options).length}`);

if (response.dropdowns.length > 0) {
    console.log(`\n🎉 SUCCESS! The logic should work!`);
} else {
    console.log(`\n💥 FAILED! There's still an issue in the logic`);
}