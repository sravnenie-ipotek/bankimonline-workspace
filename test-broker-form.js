// Test script to verify broker questionnaire form submission
// Run this in the browser console when on the broker questionnaire page

async function testBrokerForm() {
  console.log('Starting broker form test...');
  
  // Function to fill form field
  function fillField(name, value) {
    const field = document.querySelector(`[name="${name}"]`);
    if (field) {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('blur', { bubbles: true }));
      console.log(`✓ Filled ${name} with ${value}`);
    } else {
      console.error(`✗ Could not find field: ${name}`);
    }
  }
  
  // Function to click dropdown and select option
  async function selectDropdown(labelText, optionText) {
    // Find dropdown by label
    const label = Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent?.includes(labelText) && !el.textContent?.includes('placeholder')
    );
    
    if (label) {
      const dropdown = label.parentElement?.querySelector('[class*="dropdown"]') || 
                      label.parentElement?.parentElement?.querySelector('[class*="dropdown"]');
      
      if (dropdown) {
        dropdown.click();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Find and click option
        const option = Array.from(document.querySelectorAll('[class*="dropdown-item"]')).find(el =>
          el.textContent?.includes(optionText)
        );
        
        if (option) {
          option.click();
          console.log(`✓ Selected ${optionText} for ${labelText}`);
        } else {
          console.error(`✗ Could not find option: ${optionText}`);
        }
      } else {
        console.error(`✗ Could not find dropdown for: ${labelText}`);
      }
    } else {
      console.error(`✗ Could not find label: ${labelText}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Function to click button by text
  function clickButton(buttonText) {
    const button = Array.from(document.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes(buttonText)
    );
    
    if (button) {
      button.click();
      console.log(`✓ Clicked button: ${buttonText}`);
    } else {
      console.error(`✗ Could not find button: ${buttonText}`);
    }
  }
  
  try {
    // Fill basic fields
    fillField('fullName', 'Test Broker');
    fillField('phone', '972544123456');
    fillField('email', 'test@example.com');
    
    // Select dropdowns
    await selectDropdown('City', 'Tel Aviv');
    await selectDropdown('Desired region', 'Tel Aviv');
    await selectDropdown('Employment type', 'Employment');
    await selectDropdown('Monthly income', '10000-20000');
    await selectDropdown('Work experience', '3-5');
    
    // Click Yes/No buttons
    const clientCasesSection = Array.from(document.querySelectorAll('*')).find(el =>
      el.textContent?.includes('Do you have client cases?')
    );
    if (clientCasesSection) {
      const noButton = clientCasesSection.parentElement?.parentElement?.querySelector('button:last-child');
      if (noButton) {
        noButton.click();
        console.log('✓ Selected No for client cases');
      }
    }
    
    const debtCasesSection = Array.from(document.querySelectorAll('*')).find(el =>
      el.textContent?.includes('Do you have debt cases?')
    );
    if (debtCasesSection) {
      const noButton = debtCasesSection.parentElement?.parentElement?.querySelector('button:last-child');
      if (noButton) {
        noButton.click();
        console.log('✓ Selected No for debt cases');
      }
    }
    
    // Check agreement checkbox
    const checkbox = document.querySelector('[name="agreement"]');
    if (checkbox && !checkbox.checked) {
      checkbox.click();
      console.log('✓ Checked agreement checkbox');
    }
    
    // Wait a bit for validation to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if submit button is enabled
    const submitButton = Array.from(document.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Submit')
    );
    
    if (submitButton) {
      if (!submitButton.disabled) {
        console.log('✅ Submit button is enabled - form is valid!');
        console.log('Click the Submit button to test navigation to /services/application-submitted');
      } else {
        console.log('❌ Submit button is still disabled - check form validation');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testBrokerForm();