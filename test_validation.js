// Quick validation test script
// Run this in browser console to test validation
const testValidation = () => {
  console.log('🧪 Testing Credit Step 3 Validation...');
  
  // Test case 1: Employee (value: '1') with all required fields
  const employeeData = {
    mainSourceOfIncome: '1', // Employee
    monthlyIncome: 10000,
    startDate: '2023-01-01',
    fieldOfActivity: '1', // Technology
    profession: 'Software Developer',
    companyName: 'Tech Corp',
    additionalIncome: '1', // No additional income
    additionalIncomeAmount: null,
    obligation: '1', // No obligations
    bank: '',
    monthlyPaymentForAnotherBank: null,
    endDate: ''
  };
  
  console.log('✅ Test Case 1 - Employee with all fields:', employeeData);
  
  // Test case 2: Student (value: '5') - should not require additional fields
  const studentData = {
    mainSourceOfIncome: '5', // Student
    monthlyIncome: null,
    startDate: '',
    fieldOfActivity: '',
    profession: '',
    companyName: '',
    additionalIncome: '1', // No additional income
    additionalIncomeAmount: null,
    obligation: '1', // No obligations
    bank: '',
    monthlyPaymentForAnotherBank: null,
    endDate: ''
  };
  
  console.log('✅ Test Case 2 - Student (minimal fields):', studentData);
  
  // Test case 3: Employee with additional income and obligations
  const complexEmployeeData = {
    mainSourceOfIncome: '1', // Employee
    monthlyIncome: 15000,
    startDate: '2022-06-01',
    fieldOfActivity: '1', // Technology
    profession: 'Senior Developer',
    companyName: 'Big Tech',
    additionalIncome: '3', // Freelance work
    additionalIncomeAmount: 5000,
    obligation: '2', // Credit card debt
    bank: 'Bank Leumi',
    monthlyPaymentForAnotherBank: 2000,
    endDate: '2025-12-31'
  };
  
  console.log('✅ Test Case 3 - Employee with additional income and obligations:', complexEmployeeData);
  
  return { employeeData, studentData, complexEmployeeData };
};

// Instructions for testing:
console.log(`
🧪 CREDIT STEP 3 VALIDATION TEST

1. Navigate to: http://localhost:5174/services/calculate-credit/3
2. Open browser console
3. Run: testValidation()
4. Check the form debug panel (red box)
5. Try filling the form with test data above
6. Check if "Save and Continue" button becomes enabled

Expected behavior:
- Employee (value '1'): Requires income, date, activity, profession, company
- Student (value '5'): Only requires main source and additional income selection
- Unemployed (value '6'): Only requires main source and additional income selection
`);

if (typeof window !== 'undefined') {
  window.testValidation = testValidation;
}
