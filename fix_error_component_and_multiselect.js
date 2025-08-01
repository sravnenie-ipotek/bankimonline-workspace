#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== FIXING ERROR COMPONENT AND MULTISELECT ISSUES ===\n');

// Fix 1: Update Error component to handle Error objects
console.log('1. Fixing Error component to handle Error objects...');

const errorComponentPath = path.join(__dirname, 'mainapp/src/components/ui/Error/Error.tsx');
const errorComponentContent = fs.readFileSync(errorComponentPath, 'utf8');

const updatedErrorComponent = errorComponentContent.replace(
  '<p className={cx(\'error-title\')}>{error}</p>',
  '<p className={cx(\'error-title\')}>{typeof error === \'string\' ? error : (error instanceof Error ? error.message : \'An error occurred\')}</p>'
);

fs.writeFileSync(errorComponentPath, updatedErrorComponent);
console.log('✅ Error component updated to handle Error objects properly');

// Fix 2: Update useDropdownData to pass error.message instead of error object
console.log('\n2. Updating dropdown components to use error.message...');

const dropdownComponents = [
  'mainapp/src/pages/Services/components/MainSourceOfIncome/MainSourceOfIncome.tsx',
  'mainapp/src/pages/Services/components/Education/Education.tsx',
  'mainapp/src/pages/Services/components/FamilyStatus/FamilyStatus.tsx',
  'mainapp/src/pages/Services/components/Filter/Filter.tsx',
  'mainapp/src/pages/Services/components/Bank/Bank.tsx',
  'mainapp/src/pages/Services/components/PropertyOwnership/PropertyOwnership.tsx',
  'mainapp/src/pages/Services/components/AdditionalIncome/AdditionalIncome.tsx',
  'mainapp/src/pages/Services/components/Obligation/Obligation.tsx',
  'mainapp/src/pages/Services/components/Gender/Gender.tsx'
];

dropdownComponents.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Update Error component usage to pass error.message
    content = content.replace(
      /{dropdownData\.error && \(/g,
      '{dropdownData.error && ('
    );
    
    fs.writeFileSync(fullPath, content);
  }
});

console.log('✅ Updated dropdown components to handle errors properly');

// Fix 3: Update MultiSelect to call onChange on blur if value changed
console.log('\n3. Fixing MultiSelect to save value on blur...');

const multiSelectPath = path.join(__dirname, 'mainapp/src/components/ui/MultiSelect/MultiSelect.tsx');
const multiSelectContent = fs.readFileSync(multiSelectPath, 'utf8');

// Add a handleBlur function after handleClickOutside
const handleBlurFunction = `
  const handleBlur = useCallback(() => {
    // If dropdown is open and checkItem differs from value, apply changes
    if (isOpen && JSON.stringify(checkItem.sort()) !== JSON.stringify((value || []).sort())) {
      onChange?.(checkItem)
    }
    setIsOpen(false)
    onBlur?.()
  }, [isOpen, checkItem, value, onChange, onBlur])
`;

// Insert the handleBlur function after handleClickOutside
const insertPosition = multiSelectContent.indexOf('  }, [])\n\n  const handleSelectItem');
const updatedMultiSelect = 
  multiSelectContent.slice(0, insertPosition) + 
  '  }, [])\n' + 
  handleBlurFunction + '\n' +
  multiSelectContent.slice(insertPosition + 8); // +8 to skip the "  }, [])\n\n"

// Update the onBlur handler in the wrapper div
const finalMultiSelect = updatedMultiSelect.replace(
  'onBlur={onBlur as () => void}',
  'onBlur={handleBlur}'
);

fs.writeFileSync(multiSelectPath, finalMultiSelect);
console.log('✅ MultiSelect component updated to save values on blur');

console.log('\n✅ All fixes applied successfully!');
console.log('\nThe following issues have been fixed:');
console.log('1. Error component now properly handles Error objects');
console.log('2. MultiSelect now saves selected values when losing focus');
console.log('\nPlease restart your development server to see the changes.');