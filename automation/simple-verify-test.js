#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Simple Test Verification');
console.log('=' .repeat(60));

// Create a very simple test file
const simpleTest = `
describe('Basic Smoke Test', () => {
  it('should load the homepage', () => {
    cy.visit('/')
    cy.contains('body').should('exist')
  })
  
  it('should check for buttons', () => {
    cy.visit('/services/calculate-mortgage/1')
    cy.get('button').should('exist')
  })
})
`;

// Save test file
const testPath = path.join(__dirname, 'simple-test.cy.js');
fs.writeFileSync(testPath, simpleTest);

// Create minimal config
const config = {
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    video: false
  }
};

const configPath = path.join(__dirname, 'simple-cypress.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('\n1️⃣ Running with minimal config...\n');

try {
  const result = execSync(
    `npx cypress run --spec "${testPath}" --config-file "${configPath}"`,
    { 
      cwd: __dirname,
      encoding: 'utf8',
      stdio: 'inherit'
    }
  );
  console.log('\n✅ Test passed with minimal config!');
} catch (err) {
  console.log('\n❌ Test failed even with minimal config');
  console.log('Error:', err.message);
}

// Clean up
fs.unlinkSync(testPath);
fs.unlinkSync(configPath);

console.log('\n2️⃣ Checking Cypress installation...\n');

try {
  const version = execSync('npx cypress version', { encoding: 'utf8' });
  console.log('Cypress version info:');
  console.log(version);
} catch (err) {
  console.log('❌ Cypress not properly installed');
  console.log('Run: npm install cypress --save-dev');
}

console.log('\n3️⃣ Checking server connectivity...\n');

try {
  execSync('curl -s http://localhost:5173 > /dev/null');
  console.log('✅ Frontend reachable at http://localhost:5173');
} catch (err) {
  console.log('❌ Frontend not reachable');
}

try {
  execSync('curl -s http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage > /dev/null');
  console.log('✅ Backend API reachable at http://localhost:8003');
} catch (err) {
  console.log('❌ Backend API not reachable');
}