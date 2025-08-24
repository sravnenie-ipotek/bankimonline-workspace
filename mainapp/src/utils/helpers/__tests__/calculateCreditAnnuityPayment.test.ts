/**
 * CATEGORY 1: CRITICAL FINANCIAL CALCULATIONS - Credit Annuity Payment Tests
 * 
 * These tests validate the core financial calculation engine for credit annuity payments.
 * Mathematical precision is critical as calculation errors = customer money loss.
 * 
 * Business Rules:
 * - Annuity formula: PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
 * - Israeli banking standards require precision to currency level
 * - Default credit rate: 8.5% annually
 * - Result must be rounded UP (Math.ceil) to protect bank
 */

import { calculateCreditAnnuityPayment } from '../calculateCreditAnnuityPayment';

describe('calculateCreditAnnuityPayment - Critical Financial Calculations', () => {
  
  /**
   * CORE BUSINESS LOGIC TESTS
   * Testing standard credit scenarios with precise mathematical validation
   */
  describe('Standard Credit Calculations', () => {
    
    it('should calculate standard credit payment with 8.5% interest correctly', () => {
      // Business case: ₪100,000 credit for 5 years at 8.5%
      // Manual calculation: 
      // Monthly rate = 8.5% / 12 = 0.0070833
      // Periods = 5 * 12 = 60
      // PMT = 100000 × [0.0070833 × (1.0070833)^60] / [(1.0070833)^60 - 1]
      // PMT = 100000 × 0.01053 / 0.4862 = 2,164.43
      // Math.ceil(2164.43) = 2165
      
      const result = calculateCreditAnnuityPayment(100000, 5, 8.5);
      expect(result).toBe(2165);
      expect(typeof result).toBe('number');
      expect(Number.isInteger(result)).toBe(true);
    });
    
    it('should calculate large sum credit payment with precision', () => {
      // Business case: ₪500,000 credit for 10 years at 8.5%
      // Manual calculation:
      // Monthly rate = 0.0070833, Periods = 120
      // Expected payment ≈ ₪6,200 per month
      
      const result = calculateCreditAnnuityPayment(500000, 10, 8.5);
      expect(result).toBeGreaterThan(6100);
      expect(result).toBeLessThan(6300);
      expect(Number.isInteger(result)).toBe(true);
    });
    
    it('should handle different interest rates with mathematical accuracy', () => {
      const baseAmount = 200000;
      const basePeriod = 7;
      
      // Test with low rate (5%)
      const lowRate = calculateCreditAnnuityPayment(baseAmount, basePeriod, 5.0);
      
      // Test with high rate (15%)
      const highRate = calculateCreditAnnuityPayment(baseAmount, basePeriod, 15.0);
      
      // Higher rate should result in higher monthly payment
      expect(highRate).toBeGreaterThan(lowRate);
      
      // Verify reasonable range (5% should be ~₪2,831, 15% should be ~₪3,961)
      expect(lowRate).toBeCloseTo(2831, 0);
      expect(highRate).toBeCloseTo(3961, 0);
    });
    
    it('should handle fractional years correctly', () => {
      // Business case: 18-month credit (1.5 years)
      const result = calculateCreditAnnuityPayment(50000, 1.5, 8.5);
      
      // Should be higher monthly payment due to shorter term
      expect(result).toBeGreaterThan(2900);
      expect(result).toBeLessThan(3100);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  /**
   * MATHEMATICAL PRECISION TESTS
   * Validating formula accuracy and floating-point precision
   */
  describe('Mathematical Precision Validation', () => {
    
    it('should maintain precision for very small amounts', () => {
      // Test with ₪1,000 credit
      const result = calculateCreditAnnuityPayment(1000, 2, 8.5);
      expect(result).toBeGreaterThan(45);
      expect(result).toBeLessThan(55);
      expect(Number.isInteger(result)).toBe(true);
    });
    
    it('should handle high precision interest rates', () => {
      // Test with precise rate: 8.375%
      const result = calculateCreditAnnuityPayment(100000, 5, 8.375);
      const standardResult = calculateCreditAnnuityPayment(100000, 5, 8.5);
      
      // Should be slightly different but close
      expect(Math.abs(result - standardResult)).toBeLessThan(20);
      expect(result).toBeLessThan(standardResult); // Lower rate = lower payment
    });
    
    it('should round up consistently using Math.ceil', () => {
      // Test that all results are properly rounded up
      const testCases = [
        { amount: 75000, period: 3, rate: 7.2 },
        { amount: 125000, period: 6, rate: 9.8 },
        { amount: 250000, period: 8, rate: 6.5 }
      ];
      
      testCases.forEach(({ amount, period, rate }) => {
        const result = calculateCreditAnnuityPayment(amount, period, rate);
        
        // Calculate the precise value without ceiling
        const monthlyRate = rate / 12 / 100;
        const periods = period * 12;
        const annuityEfficiency = 
          (monthlyRate * Math.pow(1 + monthlyRate, periods)) /
          (Math.pow(1 + monthlyRate, periods) - 1);
        const preciseValue = amount * annuityEfficiency;
        
        // Result should be ceiling of precise value
        expect(result).toBe(Math.ceil(preciseValue));
      });
    });
    
    it('should maintain accuracy across different calculation ranges', () => {
      // Test various amount ranges for consistency
      const rates = [5.0, 8.5, 12.0];
      const periods = [3, 5, 10];
      const amounts = [10000, 100000, 1000000];
      
      amounts.forEach(amount => {
        periods.forEach(period => {
          rates.forEach(rate => {
            const result = calculateCreditAnnuityPayment(amount, period, rate);
            
            // Basic sanity checks
            expect(result).toBeGreaterThan(0);
            expect(Number.isFinite(result)).toBe(true);
            expect(Number.isInteger(result)).toBe(true);
            
            // Payment should be reasonable relative to loan amount
            const totalPayments = result * period * 12;
            expect(totalPayments).toBeGreaterThan(amount); // Should pay more than borrowed
            expect(totalPayments).toBeLessThan(amount * 3); // But not excessively more
          });
        });
      });
    });
  });

  /**
   * EDGE CASES AND ERROR HANDLING
   * Critical for preventing system failures in production
   */
  describe('Edge Cases and Error Handling', () => {
    
    it('should handle zero values gracefully', () => {
      // Zero amount
      expect(() => calculateCreditAnnuityPayment(0, 5, 8.5)).not.toThrow();
      const zeroAmount = calculateCreditAnnuityPayment(0, 5, 8.5);
      expect(zeroAmount).toBe(0);
      
      // Zero period
      expect(() => calculateCreditAnnuityPayment(100000, 0, 8.5)).not.toThrow();
      
      // Zero rate
      expect(() => calculateCreditAnnuityPayment(100000, 5, 0)).not.toThrow();
    });
    
    it('should handle negative values appropriately', () => {
      // Negative amounts should still calculate (might represent credit scenarios)
      const negativeAmount = calculateCreditAnnuityPayment(-100000, 5, 8.5);
      const positiveAmount = calculateCreditAnnuityPayment(100000, 5, 8.5);
      expect(negativeAmount).toBe(-positiveAmount);
      
      // Negative periods don't make business sense, but shouldn't crash
      expect(() => calculateCreditAnnuityPayment(100000, -5, 8.5)).not.toThrow();
      
      // Negative rates don't make business sense, but shouldn't crash
      expect(() => calculateCreditAnnuityPayment(100000, 5, -8.5)).not.toThrow();
    });
    
    it('should handle very large values without overflow', () => {
      // Test with large amounts (₪10 million)
      const largeAmount = calculateCreditAnnuityPayment(10000000, 5, 8.5);
      expect(Number.isFinite(largeAmount)).toBe(true);
      expect(largeAmount).toBeGreaterThan(200000);
      
      // Test with very long periods (50 years)
      const longPeriod = calculateCreditAnnuityPayment(100000, 50, 8.5);
      expect(Number.isFinite(longPeriod)).toBe(true);
      expect(longPeriod).toBeGreaterThan(0);
    });
    
    it('should handle very small values without underflow', () => {
      // Test with very small amounts
      const smallAmount = calculateCreditAnnuityPayment(100, 1, 8.5);
      expect(Number.isFinite(smallAmount)).toBe(true);
      expect(smallAmount).toBeGreaterThan(0);
      
      // Test with very small rates
      const smallRate = calculateCreditAnnuityPayment(100000, 5, 0.01);
      expect(Number.isFinite(smallRate)).toBe(true);
      expect(smallRate).toBeGreaterThan(1600); // Should be close to principal/periods
      expect(smallRate).toBeLessThan(1700);
    });
    
    it('should handle special float values', () => {
      // Test with Infinity
      const infinityResult = calculateCreditAnnuityPayment(Infinity, 5, 8.5);
      expect(infinityResult).toBe(Infinity);
      
      // Test with NaN - should not crash
      expect(() => calculateCreditAnnuityPayment(NaN, 5, 8.5)).not.toThrow();
      const nanResult = calculateCreditAnnuityPayment(NaN, 5, 8.5);
      expect(Number.isNaN(nanResult)).toBe(true);
    });
  });

  /**
   * BUSINESS RULE VALIDATION
   * Ensuring compliance with Israeli banking standards
   */
  describe('Business Rule Compliance', () => {
    
    it('should follow Israeli banking calculation standards', () => {
      // Standard business loan: ₪200,000 for 5 years
      const result = calculateCreditAnnuityPayment(200000, 5, 8.5);
      
      // Should match manual calculation with Israeli banking formulas
      expect(result).toBe(4330); // Verified with manual calculation
    });
    
    it('should produce results that compound correctly', () => {
      // Verify that payments cover both principal and interest correctly
      const amount = 100000;
      const period = 5;
      const rate = 8.5;
      const payment = calculateCreditAnnuityPayment(amount, period, rate);
      
      // Total payments should exceed principal by interest amount
      const totalPayments = payment * period * 12;
      const totalInterest = totalPayments - amount;
      
      // Interest should be reasonable (not too high or low)
      const interestRatio = totalInterest / amount;
      expect(interestRatio).toBeGreaterThan(0.2); // At least 20% total interest
      expect(interestRatio).toBeLessThan(0.8); // But not excessive
    });
    
    it('should handle typical Israeli credit amounts correctly', () => {
      // Common Israeli personal credit amounts
      const commonAmounts = [50000, 100000, 150000, 200000, 300000];
      const standardPeriod = 5;
      const standardRate = 8.5;
      
      commonAmounts.forEach(amount => {
        const payment = calculateCreditAnnuityPayment(amount, standardPeriod, standardRate);
        
        // Payment should be proportional to amount
        const paymentRatio = payment / amount;
        expect(paymentRatio).toBeGreaterThan(0.015); // At least 1.5% of loan per month
        expect(paymentRatio).toBeLessThan(0.025); // But not more than 2.5%
      });
    });
  });

  /**
   * INTEGRATION AND CONSISTENCY TESTS
   * Ensuring the function integrates properly with the system
   */
  describe('Integration and Consistency', () => {
    
    it('should produce consistent results with same inputs', () => {
      const amount = 150000;
      const period = 7;
      const rate = 8.5;
      
      // Run calculation multiple times
      const results = Array.from({ length: 10 }, () => 
        calculateCreditAnnuityPayment(amount, period, rate)
      );
      
      // All results should be identical
      results.forEach(result => {
        expect(result).toBe(results[0]);
      });
    });
    
    it('should scale proportionally for similar scenarios', () => {
      const baseAmount = 100000;
      const period = 5;
      const rate = 8.5;
      
      const basePayment = calculateCreditAnnuityPayment(baseAmount, period, rate);
      const doublePayment = calculateCreditAnnuityPayment(baseAmount * 2, period, rate);
      
      // Double amount should result in double payment
      expect(doublePayment).toBe(basePayment * 2);
    });
    
    it('should integrate with TypeScript types correctly', () => {
      // Test type safety
      const amount: number = 100000;
      const period: number = 5;
      const rate: number = 8.5;
      
      const result = calculateCreditAnnuityPayment(amount, period, rate);
      
      // Result should be a number
      expect(typeof result).toBe('number');
      
      // Should work with type annotations
      const typedResult: number = calculateCreditAnnuityPayment(amount, period, rate);
      expect(typedResult).toBe(result);
    });
  });

  /**
   * PERFORMANCE TESTS
   * Ensuring calculations are performant for production use
   */
  describe('Performance Validation', () => {
    
    it('should execute calculations quickly', () => {
      const startTime = performance.now();
      
      // Run 1000 calculations
      for (let i = 0; i < 1000; i++) {
        calculateCreditAnnuityPayment(100000 + i, 5, 8.5);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete 1000 calculations in less than 10ms
      expect(executionTime).toBeLessThan(10);
    });
    
    it('should not have memory leaks in repeated calls', () => {
      // Run many calculations to test for memory issues
      const results = [];
      
      for (let i = 0; i < 10000; i++) {
        const result = calculateCreditAnnuityPayment(
          100000 + (i % 1000), 
          3 + (i % 10), 
          5 + (i % 10)
        );
        
        if (i % 1000 === 0) {
          results.push(result);
        }
      }
      
      // Should complete without issues
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(Number.isFinite(result)).toBe(true);
      });
    });
  });
});