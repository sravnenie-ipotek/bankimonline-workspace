async function testDropdownLive() {
  try {
    console.log('Testing dropdown API for mortgage_step3 additional_income...\n');
    
    // Test Hebrew
    const heResponse = await fetch('http://localhost:8003/api/dropdowns/mortgage_step3/he');
    const heData = await heResponse.json();
    
    console.log('Hebrew Response:');
    console.log('================');
    console.log('Label:', heData.labels?.mortgage_step3_additional_income || 'NOT FOUND');
    console.log('Placeholder:', heData.placeholders?.mortgage_step3_additional_income || 'NOT FOUND');
    console.log('\nOptions:', JSON.stringify(heData.options?.mortgage_step3_additional_income, null, 2));
    
    // Check if "no additional income" option exists
    const hasNoOption = heData.options?.mortgage_step3_additional_income?.some(
      opt => opt.value === 'no_additional_income'
    );
    
    console.log('\n✅ Has "No additional income" option:', hasNoOption);
    
    if (hasNoOption) {
      const noOption = heData.options.mortgage_step3_additional_income.find(
        opt => opt.value === 'no_additional_income'
      );
      console.log('   Value:', noOption.value);
      console.log('   Label:', noOption.label);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testDropdownLive();