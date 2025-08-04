// FINAL FIXED API processing logic - correctly group all components under base field
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
    
    // NEW CORRECT LOGIC: Extract base field name - stop at first _ph or _option_
    if (row.content_key.includes('_ph')) {
        // For placeholders: calculate_mortgage_main_source_ph → main_source  
        const match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)_ph$/);
        if (match) {
            fieldName = match[1];
            console.log(`  ✅ Placeholder pattern: ${fieldName}`);
        }
    } else if (row.content_key.includes('_option_')) {
        // For options: calculate_mortgage_main_source_option_1 → main_source
        const match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)_option_\d+$/);
        if (match) {
            fieldName = match[1];
            console.log(`  ✅ Option pattern: ${fieldName}`);
        }
    } else {
        // For labels: calculate_mortgage_main_source → main_source
        const match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)$/);
        if (match) {
            fieldName = match[1];
            console.log(`  ✅ Label pattern: ${fieldName}`);
        }
    }
    
    // Fallback
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
    } else {
        console.log(`  🔄 Using existing dropdown for field: ${fieldName}`);
    }
    
    const dropdown = dropdownMap.get(fieldName);
    
    switch (row.component_type) {
        case 'dropdown_container':
        case 'label':
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
        console.log(`  ❌ Skipped (missing label: ${!dropdown.label}, missing options: ${dropdown.options.length === 0})`);
    }
});

console.log(`\n🎯 FINAL RESULT:`);
console.log(`- Dropdowns found: ${response.dropdowns.length}`);
console.log(`- Dropdown keys: ${JSON.stringify(response.dropdowns.map(d => d.key))}`);
console.log(`- Options groups: ${Object.keys(response.options).length}`);

if (response.dropdowns.length > 0) {
    console.log(`\n🎉 SUCCESS! Fixed logic works!`);
    
    response.dropdowns.forEach((dropdown, i) => {
        console.log(`\n📋 Dropdown ${i + 1}: ${dropdown.key}`);
        console.log(`  Label: ${response.labels[dropdown.key]}`);
        console.log(`  Placeholder: ${response.placeholders[dropdown.key] || 'None'}`);
        console.log(`  Options (${response.options[dropdown.key].length}):`, 
                   response.options[dropdown.key].map(o => `${o.value}=${o.label}`).join(', '));
    });
} else {
    console.log(`\n💥 STILL FAILED!`);
}