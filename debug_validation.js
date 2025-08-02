// Debug script to test form validation
// Open browser console on http://localhost:5174/services/calculate-mortgage/3
// Paste this script to see the current validation state

console.log('=== MORTGAGE STEP 3 VALIDATION DEBUGGER ===');

// Helper to extract Formik state from React components
function findFormikState() {
  const formElement = document.querySelector('form');
  if (!formElement) return null;
  
  // Try to access React fiber for Formik state
  const reactKey = Object.keys(formElement).find(key => 
    key.startsWith('__reactInternalInstance') || 
    key.startsWith('__reactFiber') ||
    key.startsWith('__reactProps')
  );
  
  if (reactKey) {
    const fiber = formElement[reactKey];
    console.log('🔍 React fiber found:', fiber);
    
    // Walk up the fiber tree to find Formik context
    let currentFiber = fiber;
    while (currentFiber) {
      if (currentFiber.memoizedProps && 
          (currentFiber.memoizedProps.values || currentFiber.memoizedProps.errors)) {
        return {
          values: currentFiber.memoizedProps.values,
          errors: currentFiber.memoizedProps.errors,
          touched: currentFiber.memoizedProps.touched,
          isValid: currentFiber.memoizedProps.isValid,
          isValidating: currentFiber.memoizedProps.isValidating
        };
      }
      currentFiber = currentFiber.return || currentFiber.parent;
    }
  }
  
  return null;
}

// Wait for React to be available
setTimeout(() => {
  console.log('🔍 Checking form state...');
  
  // Try to find Formik state
  const formikState = findFormikState();
  if (formikState) {
    console.log('✅ Found Formik state:', {
      values: formikState.values,
      errors: formikState.errors,
      touched: formikState.touched,
      isValid: formikState.isValid,
      isValidating: formikState.isValidating
    });
  } else {
    console.log('❌ Could not find Formik state');
  }
  
  // Check if there are any validation errors in the DOM
  const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
  console.log('🔍 Error elements found:', errorElements.length);
  
  errorElements.forEach((el, index) => {
    console.log(`Error ${index + 1}:`, el.textContent, el);
  });
  
  // Check dropdowns
  const dropdowns = document.querySelectorAll('[role="combobox"], select, [class*="dropdown"]');
  console.log('🔍 Dropdown elements found:', dropdowns.length);
  
  dropdowns.forEach((el, index) => {
    console.log(`Dropdown ${index + 1}:`, {
      element: el,
      value: el.value || el.getAttribute('value'),
      textContent: el.textContent?.trim(),
      className: el.className
    });
  });
  
  // Check for "Save and Continue" button
  const saveButton = document.querySelector('button[type="submit"]:not([onClick*="navigate(-1)"])');
  if (saveButton) {
    console.log('🔍 Save button:', {
      disabled: saveButton.disabled,
      textContent: saveButton.textContent,
      className: saveButton.className
    });
  } else {
    console.log('❌ Save button not found');
  }
  
  // Check for form validation using Formik's data attributes
  const formElement = document.querySelector('form');
  if (formElement) {
    console.log('✅ Form element found');
  }
  
  // Check console for validation debug messages
  console.log('📝 Look for debug messages starting with 🔍 in the console to see dropdown values and validation states');
  
}, 3000);

// Helper to manually check field values
window.checkFormValues = () => {
  const inputs = document.querySelectorAll('input, select, [role="combobox"]');
  const values = {};
  
  inputs.forEach(input => {
    const name = input.name || input.getAttribute('data-field') || input.id;
    const value = input.value || input.getAttribute('value') || input.textContent;
    if (name) {
      values[name] = value;
    }
  });
  
  console.log('📝 Current form values:', values);
  return values;
};

// Helper to manually trigger validation
window.triggerValidation = () => {
  // Find all dropdown elements and trigger blur events
  const dropdowns = document.querySelectorAll('[role="combobox"], select, [class*="dropdown"]');
  dropdowns.forEach(dropdown => {
    dropdown.dispatchEvent(new Event('blur', { bubbles: true }));
  });
  
  // Find all input fields and trigger blur events
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  });
  
  console.log('🔄 Triggered validation on all form fields');
};

// Helper to check button state
window.checkButtonState = () => {
  const saveButton = document.querySelector('button[type="submit"]:not([onClick*="navigate(-1)"])');
  if (saveButton) {
    console.log('🎯 Save button state:', {
      disabled: saveButton.disabled,
      textContent: saveButton.textContent,
      canClick: !saveButton.disabled
    });
  }
};

console.log('🚀 Debug helpers available:');
console.log('- window.checkFormValues() - See current form values');
console.log('- window.triggerValidation() - Force validation');
console.log('- window.checkButtonState() - Check save button state');