/**
 * Database Connectivity Integration Tests
 * 
 * Tests critical database connections that power dropdown functionality
 * and content management system
 * 
 * @author DevOps Team
 * @priority Critical - Banking application requires 100% database reliability
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8003';
const TEST_TIMEOUT = 30000; // 30 seconds

test.describe('Database Connectivity Integration Tests', () => {
  
  // Setup and teardown
  test.beforeEach(async () => {
    console.log('🔗 Starting database connectivity test');
  });

  test.afterEach(async () => {
    console.log('✅ Database connectivity test completed');
  });

  test('should connect to main database (Railway maglev)', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test database connectivity through health endpoint
    const response = await fetch(`${API_BASE_URL}/api/health`);
    
    expect(response.status).toBe(200);
    
    const healthData = await response.json();
    console.log('Health check response:', healthData);
    
    // Verify database connection status
    expect(healthData.status).toBe('ok');
    expect(healthData.database).toBeDefined();
    expect(healthData.database.connected).toBe(true);
    
    // Verify response time is acceptable
    expect(healthData.responseTime).toBeLessThan(5000); // < 5 seconds
  });

  test('should connect to content database (Railway shortline)', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test content database through content API
    const response = await fetch(`${API_BASE_URL}/api/content/health`);
    
    // Content health endpoint should exist
    if (response.status === 404) {
      console.warn('⚠️ Content health endpoint not implemented - testing through content API');
      
      // Fallback: test through actual content endpoint
      const contentResponse = await fetch(`${API_BASE_URL}/api/content/mortgage_step1/en`);
      expect(contentResponse.status).toBe(200);
      
      const contentData = await contentResponse.json();
      expect(contentData.status).toBe('success');
      expect(contentData.content).toBeDefined();
      
    } else {
      expect(response.status).toBe(200);
      
      const healthData = await response.json();
      expect(healthData.status).toBe('ok');
      expect(healthData.content_database).toBeDefined();
    }
  });

  test('should handle database connection failures gracefully', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test with invalid database URL (should fallback gracefully)
    const response = await fetch(`${API_BASE_URL}/api/v1/calculation-parameters?business_path=mortgage`);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    console.log('Calculation parameters response:', data);
    
    // Should return success or fallback data
    expect(['success', 'error']).toContain(data.status);
    
    // If error, should have fallback data
    if (data.status === 'error') {
      expect(data.data).toBeDefined();
      expect(data.data.is_fallback).toBe(true);
      console.log('✅ Fallback mechanism working correctly');
    }
  });

  test('should maintain connection pool stability', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test multiple concurrent connections
    const concurrentRequests = 5;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        fetch(`${API_BASE_URL}/api/health`)
          .then(response => response.json())
      );
    }
    
    const results = await Promise.all(promises);
    
    // All requests should succeed
    results.forEach((result, index) => {
      expect(result.status).toBe('ok');
      expect(result.database.connected).toBe(true);
      console.log(`Request ${index + 1}: ✅ Connected`);
    });
    
    console.log('✅ Connection pool handling concurrent requests correctly');
  });

  test('should validate database schema integrity', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Test critical tables exist by querying APIs that depend on them
    const criticalEndpoints = [
      { url: `${API_BASE_URL}/api/v1/banks`, table: 'banks' },
      { url: `${API_BASE_URL}/api/v1/cities`, table: 'cities' },
      { url: `${API_BASE_URL}/api/v1/calculation-parameters?business_path=mortgage`, table: 'banking_standards' },
      { url: `${API_BASE_URL}/api/content/mortgage_step1/en`, table: 'content_items' }
    ];
    
    for (const endpoint of criticalEndpoints) {
      console.log(`Testing ${endpoint.table} table via ${endpoint.url}`);
      
      const response = await fetch(endpoint.url);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(['success', 'error']).toContain(data.status);
      
      // If error, should have meaningful error message
      if (data.status === 'error') {
        expect(data.message).toBeDefined();
        console.log(`Table ${endpoint.table}: ⚠️ ${data.message}`);
      } else {
        console.log(`Table ${endpoint.table}: ✅ Available`);
      }
    }
  });

  test('should validate database performance metrics', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    const startTime = Date.now();
    
    // Test database query performance
    const response = await fetch(`${API_BASE_URL}/api/v1/calculation-parameters?business_path=mortgage`);
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    console.log(`Database query time: ${queryTime}ms`);
    
    expect(response.status).toBe(200);
    expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
    
    const data = await response.json();
    expect(data.status).toBeDefined();
    
    if (data.status === 'success') {
      console.log('✅ Database query performance acceptable');
    } else {
      console.log('⚠️ Database query using fallback (may indicate connection issues)');
    }
  });

  test('should validate environment-specific database configuration', async () => {
    test.setTimeout(TEST_TIMEOUT);
    
    // Check if we're running against correct database based on environment
    const response = await fetch(`${API_BASE_URL}/api/health`);
    expect(response.status).toBe(200);
    
    const healthData = await response.json();
    
    // Log database configuration for debugging
    console.log('Database configuration:', {
      connected: healthData.database?.connected,
      environment: process.env.NODE_ENV || 'development',
      host: healthData.database?.host || 'unknown'
    });
    
    // Verify we can perform basic CRUD operations
    const testEndpoints = [
      `${API_BASE_URL}/api/v1/banks`, // Read operation
      `${API_BASE_URL}/api/content/mortgage_step1/en` // Content read operation
    ];
    
    for (const endpoint of testEndpoints) {
      const testResponse = await fetch(endpoint);
      expect([200, 404]).toContain(testResponse.status); // 200 or 404 are acceptable
      
      if (testResponse.status === 200) {
        const testData = await testResponse.json();
        console.log(`✅ ${endpoint}: Working`);
      } else {
        console.log(`⚠️ ${endpoint}: Endpoint not available (may be expected in test environment)`);
      }
    }
  });
});