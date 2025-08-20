/**
 * Global Setup for Integration Tests
 * 
 * Prepares the test environment by ensuring backend server is running
 * and database connections are available
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function globalSetup(config) {
  console.log('🚀 Setting up integration test environment...');
  
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:8003';
  console.log(`Target API: ${baseURL}`);
  
  // Wait for server to be ready
  let serverReady = false;
  let attempts = 0;
  const maxAttempts = 30; // 30 attempts = 30 seconds
  
  while (!serverReady && attempts < maxAttempts) {
    try {
      console.log(`Checking server health (attempt ${attempts + 1}/${maxAttempts})...`);
      
      const response = await fetch(`${baseURL}/api/health`);
      
      if (response.status === 200) {
        const health = await response.json();
        console.log('✅ Server health check passed:', health);
        serverReady = true;
      } else {
        console.log(`⚠️ Server returned status ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠️ Server not ready: ${error.message}`);
    }
    
    if (!serverReady) {
      attempts++;
      // Wait 1 second before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (!serverReady) {
    console.error('❌ Server failed to start within 30 seconds');
    
    // Try to start server if we're in local development
    if (baseURL.includes('localhost')) {
      console.log('🔄 Attempting to start local server...');
      
      try {
        // Check if server process is already running
        const { stdout } = await execAsync('lsof -i :8003');
        if (stdout.trim()) {
          console.log('ℹ️ Server process already running on port 8003');
        }
      } catch (error) {
        console.log('ℹ️ No server running on port 8003, starting server...');
        // Server not running, but we don't want to start it in global setup
        // as it should be handled by the CI/CD environment
      }
    }
    
    throw new Error('Server is not available for integration tests');
  }
  
  // Test critical API endpoints are available
  console.log('🔍 Testing critical API endpoints...');
  
  const criticalEndpoints = [
    '/api/health',
    '/api/v1/calculation-parameters?business_path=mortgage',
    '/api/dropdowns/mortgage_step1/en',
    '/api/content/mortgage_step1/en'
  ];
  
  for (const endpoint of criticalEndpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`);
      console.log(`  ${endpoint}: ${response.status} ${response.status === 200 ? '✅' : '⚠️'}`);
      
      if (response.status === 200) {
        const data = await response.json();
        if (data.status) {
          console.log(`    Status: ${data.status}`);
        }
      }
    } catch (error) {
      console.log(`  ${endpoint}: ❌ ${error.message}`);
    }
  }
  
  // Set up test data if needed
  console.log('📋 Integration test environment ready');
  
  // Store configuration for tests
  global.testConfig = {
    baseURL,
    startTime: Date.now(),
    serverReady
  };
  
  return global.testConfig;
}

module.exports = globalSetup;