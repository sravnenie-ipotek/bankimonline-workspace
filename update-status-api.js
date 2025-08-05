// Simple script to update translation status via API calls
const updateContentStatus = async (contentKey) => {
  try {
    const response = await fetch(`http://localhost:8003/api/content/key/${contentKey}/en`, {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log(`✅ Content exists: ${contentKey}`);
      return true;
    } else {
      console.log(`❌ Content missing: ${contentKey}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 Error checking: ${contentKey} - ${error.message}`);
    return false;
  }
};

// Test key content items
const testKeys = [
  'app.mortgage.step.mobile_step_1',
  'app.mortgage.header.video_calculate_mortgage_title',
  'app.mortgage.form.calculate_mortgage_title'
];

console.log('🔍 Testing content availability...');

(async () => {
  for (const key of testKeys) {
    await updateContentStatus(key);
  }
})();