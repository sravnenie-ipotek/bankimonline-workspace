// Test the complete API logic simulation
const apiData = {
    dropdowns: [],
    options: {},
    placeholders: {},
    labels: {}
};

const testRows = [
    { content_key: 'calculate_mortgage_main_source', component_type: 'dropdown_container', content_value: 'Main source of income' },
    { content_key: 'calculate_mortgage_main_source_ph', component_type: 'placeholder', content_value: 'Select your main source of income' },
    { content_key: 'calculate_mortgage_main_source_option_1', component_type: 'option', content_value: 'Employee' },
    { content_key: 'calculate_mortgage_main_source_option_2', component_type: 'option', content_value: 'Self-employed' }
];

const screen = 'calculate_credit_3';
const dropdownMap = new Map();

testRows.forEach(row => {
    let fieldName = null;
    
    // Pattern 2b: calculate_mortgage_{fieldname}
    const match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)(?:_ph|$)/);
    if (match) {
        fieldName = match[1];
    }
    
    if (!fieldName) {
        fieldName = row.content_key.replace(/[._]/g, '_');
    }
    
    const dropdownKey = `${screen}_${fieldName}`;
    
    if (!dropdownMap.has(fieldName)) {
        dropdownMap.set(fieldName, {
            key: dropdownKey,
            label: null,
            options: [],
            placeholder: null
        });
    }
    
    const dropdown = dropdownMap.get(fieldName);
    
    console.log(`Processing: ${row.content_key} → fieldName: ${fieldName} → dropdownKey: ${dropdownKey}`);
    
    switch (row.component_type) {
        case 'dropdown_container':
            dropdown.label = row.content_value;
            apiData.labels[dropdown.key] = row.content_value;
            break;
        case 'option':
            const optionMatch = row.content_key.match(/_option_(.+)$/);
            const optionValue = optionMatch ? optionMatch[1] : row.content_key;
            dropdown.options.push({
                value: optionValue,
                label: row.content_value
            });
            break;
        case 'placeholder':
            dropdown.placeholder = row.content_value;
            apiData.placeholders[dropdown.key] = row.content_value;
            break;
    }
});

// Finalize dropdowns - only add if has label and options
dropdownMap.forEach((dropdown, fieldName) => {
    console.log(`Checking dropdown: ${fieldName}, label: ${dropdown.label}, options: ${dropdown.options.length}`);
    if (dropdown.label && dropdown.options.length > 0) {
        apiData.dropdowns.push({
            key: dropdown.key,
            label: dropdown.label
        });
        apiData.options[dropdown.key] = dropdown.options;
    }
});

console.log('\n🎯 Final result:');
console.log(`- Dropdowns found: ${apiData.dropdowns.length}`);
console.log(`- Dropdown keys: ${JSON.stringify(apiData.dropdowns.map(d => d.key))}`);
console.log(`- Options groups: ${Object.keys(apiData.options).length}`);

if (apiData.dropdowns.length === 0) {
    console.log('\n❌ Issue found: No dropdowns created!');
    console.log('Debugging dropdown map:');
    dropdownMap.forEach((dropdown, fieldName) => {
        console.log(`  ${fieldName}: label=${dropdown.label}, options=${dropdown.options.length}`);
    });
}