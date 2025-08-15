/**
 * DROPDOWN SYSTEM HEALTH CHECK
 * 
 * This script validates that all dropdown API endpoints return data
 * and can detect when screen location mappings break.
 */

const fetch = require('node-fetch');

const CRITICAL_ENDPOINTS = [
  { screen: 'mortgage_step3', field: 'field_of_activity', minOptions: 10 },
  { screen: 'refinance_step3', field: 'field_of_activity', minOptions: 10 },
  { screen: 'other_borrowers_step2', field: 'field_of_activity', minOptions: 10 },
  { screen: 'credit_step3', field: 'professional_sphere', minOptions: 10 }
];

async function checkDropdownHealth() {
  let allHealthy = true;
  const issues = [];
  
  for (const endpoint of CRITICAL_ENDPOINTS) {
    const apiUrl = `http://localhost:8003/api/dropdowns/${endpoint.screen}/he`;
    const expectedKey = `${endpoint.screen}_${endpoint.field}`;
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const options = data.options?.[expectedKey] || [];
      const optionCount = options.length;
      
      if (optionCount >= endpoint.minOptions) {
        `);
      } else if (optionCount > 0) {
        `);
        issues.push(`${expectedKey}: Low option count (${optionCount})`);
      } else {
        `);
        issues.push(`${expectedKey}: No options returned - screen location mapping may be broken`);
        allHealthy = false;
      }
      
    } catch (error) {
      issues.push(`${endpoint.screen}: API error - ${error.message}`);
      allHealthy = false;
    }
  }
  
  );
  if (allHealthy) {
    } else {
    issues.forEach(issue => {
      });
    }
  );
  
  return allHealthy;
}

// Run the health check
if (require.main === module) {
  checkDropdownHealth()
    .then(healthy => process.exit(healthy ? 0 : 1))
    .catch(error => {
      console.error('Health check failed:', error.message);
      process.exit(1);
    });
}

module.exports = { checkDropdownHealth };
