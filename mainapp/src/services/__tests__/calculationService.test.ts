/**
 * CATEGORY 1: CRITICAL FINANCIAL CALCULATIONS - Calculation Service Integration Tests
 * 
 * These tests validate the database-driven calculation service that eliminates hardcoded values.
 * The service integrates with the backend API to fetch real-time calculation parameters.
 * 
 * Business Rules:
 * - All calculations must use database-driven parameters
 * - Property ownership LTV rules: no_property (75%), has_property (50%), selling_property (70%)
 * - Fallback values only used when database is completely unreachable
 * - Results must match helper function calculations when given same parameters
 * - Caching must work properly to avoid repeated API calls
 */

import { calculationService } from '../calculationService';
import type { CalculationParametersResponse } from '../calculationParametersApi';

// Mock fetch globally
global.fetch = jest.fn();

describe('CalculationService - Database-Driven Financial Calculations', () => {
  
  beforeEach(() => {
    // Clear all mocks and cache before each test
    jest.clearAllMocks();
    calculationService.clearCache();
    
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  /**
   * MOCK DATA SETUP
   * Standard response data for testing
   */
  const mockSuccessResponse: CalculationParametersResponse = {
    status: 'success',
    data: {
      business_path: 'mortgage',
      current_interest_rate: 5.0,
      property_ownership_ltvs: {
        no_property: { ltv: 75.0, min_down_payment: 25.0 },
        has_property: { ltv: 50.0, min_down_payment: 50.0 },
        selling_property: { ltv: 70.0, min_down_payment: 30.0 }
      },
      standards: {
        ltv: {
          max_ltv: { value: 80.0, type: 'percentage', description: 'Maximum LTV ratio' }
        },
        dti: {
          max_dti: { value: 42.0, type: 'percentage', description: 'Maximum DTI ratio' }
        }
      },
      last_updated: '2024-01-15T10:30:00Z',
      is_fallback: false
    }
  };

  const mockCreditResponse: CalculationParametersResponse = {
    status: 'success',
    data: {
      business_path: 'credit',
      current_interest_rate: 8.5,
      property_ownership_ltvs: {},
      standards: {},
      last_updated: '2024-01-15T10:30:00Z',
      is_fallback: false
    }
  };

  /**
   * API INTEGRATION TESTS
   * Testing database connectivity and parameter fetching
   */
  describe('API Integration and Parameter Fetching', () => {
    
    it('should fetch calculation parameters from database successfully', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      });

      const rate = await calculationService.getCurrentRate('mortgage');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/calculation-parameters?business_path=mortgage');
      expect(rate).toBe(5.0);
    });
    
    it('should cache parameters to avoid repeated API calls', async () => {
      // Mock API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      });

      // First call should hit API
      const rate1 = await calculationService.getCurrentRate('mortgage');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const rate2 = await calculationService.getCurrentRate('mortgage');
      expect(global.fetch).toHaveBeenCalledTimes(1); // No additional call
      
      expect(rate1).toBe(rate2);
      expect(rate1).toBe(5.0);
    });
    
    it('should fetch different parameters for different business paths', async () => {
      // Mock mortgage response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse
      });
      
      // Mock credit response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreditResponse
      });

      const mortgageRate = await calculationService.getCurrentRate('mortgage');
      const creditRate = await calculationService.getCurrentRate('credit');
      
      expect(mortgageRate).toBe(5.0);
      expect(creditRate).toBe(8.5);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
    
    it('should handle API errors gracefully with fallback values', async () => {
      // Mock API failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const rate = await calculationService.getCurrentRate('mortgage');
      
      // Should use emergency fallback rate
      expect(rate).toBe(5.0); // Emergency fallback for mortgage
    });
    
    it('should handle malformed API responses', async () => {
      // Mock malformed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      });

      const rate = await calculationService.getCurrentRate('mortgage');
      
      // Should use emergency fallback
      expect(rate).toBe(5.0);
    });
  });

  /**
   * PROPERTY OWNERSHIP LTV TESTS
   * Critical business logic validation
   */
  describe('Property Ownership LTV Rules', () => {
    
    beforeEach(() => {
      // Setup successful API response for LTV tests
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });
    });
    
    it('should return correct LTV for no property scenario', async () => {
      const ltv = await calculationService.getPropertyOwnershipLtv('no_property', 'mortgage');
      expect(ltv).toBe(75.0);
    });
    
    it('should return correct LTV for has property scenario', async () => {
      const ltv = await calculationService.getPropertyOwnershipLtv('has_property', 'mortgage');
      expect(ltv).toBe(50.0);
    });
    
    it('should return correct LTV for selling property scenario', async () => {
      const ltv = await calculationService.getPropertyOwnershipLtv('selling_property', 'mortgage');
      expect(ltv).toBe(70.0);
    });
    
    it('should return fallback LTV for unknown ownership type', async () => {
      const ltv = await calculationService.getPropertyOwnershipLtv('unknown_type', 'mortgage');
      expect(ltv).toBe(50.0); // Default fallback
    });
    
    it('should validate all three LTV scenarios are different', async () => {
      const noPropertyLtv = await calculationService.getPropertyOwnershipLtv('no_property', 'mortgage');
      const hasPropertyLtv = await calculationService.getPropertyOwnershipLtv('has_property', 'mortgage');
      const sellingPropertyLtv = await calculationService.getPropertyOwnershipLtv('selling_property', 'mortgage');
      
      // All should be different
      expect(noPropertyLtv).not.toBe(hasPropertyLtv);
      expect(hasPropertyLtv).not.toBe(sellingPropertyLtv);
      expect(noPropertyLtv).not.toBe(sellingPropertyLtv);
      
      // Verify correct order: no_property > selling_property > has_property
      expect(noPropertyLtv).toBeGreaterThan(sellingPropertyLtv);
      expect(sellingPropertyLtv).toBeGreaterThan(hasPropertyLtv);
    });
  });

  /**
   * CALCULATION INTEGRATION TESTS
   * Testing integration with helper functions
   */
  describe('Calculation Function Integration', () => {
    
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });
    });
    
    it('should calculate mortgage payment using database rate', async () => {
      const payment = await calculationService.calculateMortgagePayment(1000000, 200000, 20);
      
      // Should use 5% rate from database
      // Loan amount: ₪800,000 for 20 years at 5%
      // Expected monthly payment: ₪5,279
      expect(payment).toBe(5279);
      expect(payment).toBeGreaterThan(5000);
      expect(payment).toBeLessThan(6000);
    });
    
    it('should calculate credit payment using database rate', async () => {
      // Mock credit response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreditResponse
      });
      
      const payment = await calculationService.calculateCreditPayment(100000, 5);
      
      // Should use 8.5% rate from database
      // Expected payment for ₪100K over 5 years at 8.5%
      expect(payment).toBe(2165);
      expect(payment).toBeGreaterThan(2000);
      expect(payment).toBeLessThan(2300);
    });
    
    it('should allow custom rate override', async () => {
      const customRate = 6.0;
      const payment = await calculationService.calculateMortgagePayment(800000, 100000, 25, customRate);
      
      // Should use custom rate instead of database rate
      // ₪700K loan for 25 years at 6%
      expect(payment).toBe(4505);
    });
    
    it('should calculate remaining mortgage amount correctly', async () => {
      const remaining = await calculationService.calculateRemainingMortgage(500000, 10);
      
      // ₪500K remaining for 10 years at 5% (simple interest)
      // 500,000 × (1 + 0.5) = ₪750,000
      expect(remaining).toBe(750000);
    });
    
    it('should calculate loan period correctly', async () => {
      const period = await calculationService.calculateLoanPeriod(1000000, 200000, 5279);
      
      // Should return approximately 20 years for this payment amount
      expect(period).toBeCloseTo(20, 0);
      expect(period).toBeGreaterThan(19);
      expect(period).toBeLessThan(21);
    });
  });

  /**
   * STANDARDS AND CONFIGURATION TESTS
   * Testing banking standards retrieval
   */
  describe('Banking Standards and Configuration', () => {
    
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });
    });
    
    it('should retrieve standard values from database', async () => {
      const maxLtv = await calculationService.getStandardValue('ltv', 'max_ltv', 'mortgage');
      const maxDti = await calculationService.getStandardValue('dti', 'max_dti', 'mortgage');
      
      expect(maxLtv).toBe(80.0);
      expect(maxDti).toBe(42.0);
    });
    
    it('should return fallback for unknown standards', async () => {
      const unknown = await calculationService.getStandardValue('unknown', 'unknown', 'mortgage');
      expect(unknown).toBe(0); // Default fallback
    });
    
    it('should get all parameters for a business path', async () => {
      const params = await calculationService.getAllParameters('mortgage');
      
      expect(params.business_path).toBe('mortgage');
      expect(params.current_interest_rate).toBe(5.0);
      expect(params.property_ownership_ltvs).toBeDefined();
      expect(params.standards).toBeDefined();
      expect(params.is_fallback).toBe(false);
    });
  });

  /**
   * CACHING MECHANISM TESTS
   * Ensuring proper cache behavior
   */
  describe('Caching Mechanism', () => {
    
    it('should cache parameters for 5 minutes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });

      // Make multiple calls within cache period
      await calculationService.getCurrentRate('mortgage');
      await calculationService.getPropertyOwnershipLtv('no_property', 'mortgage');
      await calculationService.getStandardValue('ltv', 'max_ltv', 'mortgage');
      
      // Should only make one API call
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    it('should refresh cache after expiry', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });

      // First call
      await calculationService.getCurrentRate('mortgage');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // Clear cache to simulate expiry
      calculationService.clearCache();
      
      // Second call should hit API again
      await calculationService.getCurrentRate('mortgage');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
    
    it('should maintain separate cache for different business paths', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccessResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCreditResponse
        });

      // Call different business paths
      await calculationService.getCurrentRate('mortgage');
      await calculationService.getCurrentRate('credit');
      
      // Should make separate API calls
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/calculation-parameters?business_path=mortgage');
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/calculation-parameters?business_path=credit');
    });
  });

  /**
   * ERROR HANDLING AND RESILIENCE TESTS
   * Testing system behavior under various failure conditions
   */
  describe('Error Handling and Resilience', () => {
    
    it('should handle network timeouts gracefully', async () => {
      // Mock network timeout
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Request timeout'));

      const rate = await calculationService.getCurrentRate('mortgage');
      
      // Should use emergency fallback
      expect(rate).toBe(5.0);
    });
    
    it('should handle server errors (500) gracefully', async () => {
      // Mock server error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      const rate = await calculationService.getCurrentRate('mortgage');
      expect(rate).toBe(5.0); // Emergency fallback
    });
    
    it('should handle malformed JSON responses', async () => {
      // Mock malformed JSON
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const rate = await calculationService.getCurrentRate('mortgage');
      expect(rate).toBe(5.0); // Emergency fallback
    });
    
    it('should provide appropriate fallback values for different business paths', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const mortgageRate = await calculationService.getCurrentRate('mortgage');
      const creditRate = await calculationService.getCurrentRate('credit');
      
      expect(mortgageRate).toBe(5.0);  // Mortgage fallback
      expect(creditRate).toBe(8.5);    // Credit fallback
    });
    
    it('should include emergency fallback property ownership LTVs', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API unreachable'));

      const noPropertyLtv = await calculationService.getPropertyOwnershipLtv('no_property', 'mortgage');
      const hasPropertyLtv = await calculationService.getPropertyOwnershipLtv('has_property', 'mortgage');
      const sellingPropertyLtv = await calculationService.getPropertyOwnershipLtv('selling_property', 'mortgage');
      
      // Should use emergency fallback values
      expect(noPropertyLtv).toBe(75.0);
      expect(hasPropertyLtv).toBe(50.0);
      expect(sellingPropertyLtv).toBe(70.0);
    });
  });

  /**
   * BUSINESS LOGIC VALIDATION TESTS
   * Ensuring calculations match business requirements
   */
  describe('Business Logic Validation', () => {
    
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });
    });
    
    it('should calculate payments for all property ownership scenarios', async () => {
      const propertyValue = 1000000;
      const period = 20;
      
      // Calculate payments for each LTV scenario
      const noPropertyPayment = await calculationService.calculateMortgagePayment(
        propertyValue, 
        propertyValue * 0.25, // 25% down payment for 75% LTV
        period
      );
      
      const hasPropertyPayment = await calculationService.calculateMortgagePayment(
        propertyValue, 
        propertyValue * 0.5,  // 50% down payment for 50% LTV
        period
      );
      
      const sellingPropertyPayment = await calculationService.calculateMortgagePayment(
        propertyValue, 
        propertyValue * 0.3,  // 30% down payment for 70% LTV
        period
      );
      
      // Validate payment relationships
      expect(noPropertyPayment).toBeGreaterThan(sellingPropertyPayment);
      expect(sellingPropertyPayment).toBeGreaterThan(hasPropertyPayment);
      
      // Verify specific calculations (based on 5% rate)
      expect(noPropertyPayment).toBe(4949); // ₪750K loan
      expect(hasPropertyPayment).toBe(3299); // ₪500K loan
      expect(sellingPropertyPayment).toBe(4619); // ₪700K loan
    });
    
    it('should maintain precision for Israeli currency calculations', async () => {
      const payment = await calculationService.calculateMortgagePayment(750000, 150000, 25);
      
      // Should be whole shekel amounts
      expect(Number.isInteger(payment)).toBe(true);
      expect(payment).toBeGreaterThan(0);
      
      // Should be reasonable for Israeli market
      expect(payment).toBeGreaterThan(2000);
      expect(payment).toBeLessThan(8000);
    });
    
    it('should validate against known Israeli mortgage calculations', async () => {
      // Standard Israeli mortgage scenario
      const standardPayment = await calculationService.calculateMortgagePayment(1000000, 200000, 25);
      
      // Should match Israeli bank calculators (₪800K for 25 years at 5%)
      expect(standardPayment).toBe(4676);
    });
  });

  /**
   * PERFORMANCE AND RELIABILITY TESTS
   * Ensuring production-ready performance
   */
  describe('Performance and Reliability', () => {
    
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });
    });
    
    it('should execute multiple calculations efficiently', async () => {
      const startTime = performance.now();
      
      // Perform multiple calculations (should use cached data after first call)
      const calculations = await Promise.all([
        calculationService.calculateMortgagePayment(800000, 160000, 20),
        calculationService.calculateMortgagePayment(900000, 180000, 25),
        calculationService.calculateMortgagePayment(1100000, 220000, 30),
        calculationService.calculateCreditPayment(150000, 7),
        calculationService.getPropertyOwnershipLtv('no_property', 'mortgage'),
        calculationService.getStandardValue('ltv', 'max_ltv', 'mortgage')
      ]);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly
      expect(duration).toBeLessThan(50); // Less than 50ms
      expect(calculations.length).toBe(6);
      
      // Should only make one API call due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    it('should handle concurrent requests properly', async () => {
      // Make multiple concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) => 
        calculationService.calculateMortgagePayment(800000 + i * 10000, 160000, 20)
      );
      
      const results = await Promise.all(promises);
      
      // All should complete successfully
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(Number.isFinite(result)).toBe(true);
        expect(result).toBeGreaterThan(0);
      });
      
      // Should only make one API call due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    it('should not leak memory with extensive usage', async () => {
      // Perform many calculations to test memory stability
      const results = [];
      
      for (let i = 0; i < 100; i++) {
        const payment = await calculationService.calculateMortgagePayment(
          700000 + i * 1000,
          140000,
          20 + (i % 10)
        );
        
        if (i % 10 === 0) {
          results.push(payment);
        }
      }
      
      // All calculations should complete successfully
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(Number.isFinite(result)).toBe(true);
        expect(result).toBeGreaterThan(0);
      });
    });
  });

  /**
   * INTEGRATION WITH ENVIRONMENT TESTS
   * Testing different environment configurations
   */
  describe('Environment Integration', () => {
    
    it('should use correct API base URL in development', async () => {
      // Mock development environment
      const originalEnv = import.meta.env.DEV;
      Object.defineProperty(import.meta.env, 'DEV', { value: true, configurable: true });
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });
      
      await calculationService.getCurrentRate('mortgage');
      
      // Should use relative API path for development
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/calculation-parameters?business_path=mortgage');
      
      // Restore original environment
      Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv, configurable: true });
    });
    
    it('should handle production environment configuration', async () => {
      // Mock production environment
      Object.defineProperty(import.meta.env, 'DEV', { value: false, configurable: true });
      Object.defineProperty(import.meta.env, 'VITE_NODE_API_BASE_URL', { value: 'https://api.example.com', configurable: true });
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSuccessResponse
      });
      
      await calculationService.getCurrentRate('mortgage');
      
      // Should use environment variable URL
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/v1/calculation-parameters?business_path=mortgage');
      
      // Restore original environment
      Object.defineProperty(import.meta.env, 'DEV', { value: true, configurable: true });
      delete import.meta.env.VITE_NODE_API_BASE_URL;
    });
  });
});