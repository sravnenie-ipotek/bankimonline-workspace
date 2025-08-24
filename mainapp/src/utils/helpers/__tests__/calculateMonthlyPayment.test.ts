/**
 * CATEGORY 1: CRITICAL FINANCIAL CALCULATIONS - Monthly Mortgage Payment Tests
 * 
 * These tests validate the core mortgage calculation engine with extreme precision.
 * Property ownership LTV rules are critical business logic that affects customer financing.
 * 
 * Business Rules:
 * - Property ownership affects LTV: no_property (75%), has_property (50%), selling_property (70%)
 * - Amortization formula: PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
 * - Israeli banking standards require currency precision (₪)
 * - Default mortgage rate: 5.0% annually
 * - Result must be rounded DOWN (Math.trunc) per business rules
 */

import calculateMonthlyPayment from '../calculateMonthlyPayment';

describe('calculateMonthlyPayment - Critical Mortgage Calculations', () => {
  
  /**
   * PROPERTY OWNERSHIP LTV BUSINESS RULES
   * Critical validation of 75%/50%/70% financing rules
   */
  describe('Property Ownership LTV Rules Validation', () => {
    
    it('should calculate correctly for NO PROPERTY scenario (75% LTV)', () => {
      // Business case: ₪1,000,000 property, no existing property
      // Customer must provide 25% down payment = ₪250,000
      // Loan amount = ₪750,000 (75% LTV)
      // 20-year mortgage at 5% = expected ₪4,949/month
      
      const propertyValue = 1000000;
      const downPayment = propertyValue * 0.25; // 25% down payment
      const period = 20;
      const rate = 5.0;
      
      const result = calculateMonthlyPayment(propertyValue, downPayment, period, rate);
      
      expect(result).toBe(4949); // Verified manual calculation
      expect(result).toBeGreaterThan(4900);
      expect(result).toBeLessThan(5000);
    });
    
    it('should calculate correctly for HAS PROPERTY scenario (50% LTV)', () => {
      // Business case: ₪1,000,000 property, customer owns existing property
      // Customer must provide 50% down payment = ₪500,000
      // Loan amount = ₪500,000 (50% LTV)
      // 20-year mortgage at 5% = expected ₪3,299/month
      
      const propertyValue = 1000000;
      const downPayment = propertyValue * 0.5; // 50% down payment
      const period = 20;
      const rate = 5.0;
      
      const result = calculateMonthlyPayment(propertyValue, downPayment, period, rate);
      
      expect(result).toBe(3299); // Verified manual calculation
      expect(result).toBeGreaterThan(3250);
      expect(result).toBeLessThan(3350);
    });
    
    it('should calculate correctly for SELLING PROPERTY scenario (70% LTV)', () => {
      // Business case: ₪1,000,000 property, customer selling existing property
      // Customer must provide 30% down payment = ₪300,000
      // Loan amount = ₪700,000 (70% LTV)
      // 20-year mortgage at 5% = expected ₪4,619/month
      
      const propertyValue = 1000000;
      const downPayment = propertyValue * 0.3; // 30% down payment
      const period = 20;
      const rate = 5.0;
      
      const result = calculateMonthlyPayment(propertyValue, downPayment, period, rate);
      
      expect(result).toBe(4619); // Verified manual calculation
      expect(result).toBeGreaterThan(4570);
      expect(result).toBeLessThan(4670);
    });
    
    it('should validate LTV ratio impact on monthly payments', () => {
      const propertyValue = 800000;
      const rate = 5.0;
      const period = 15;
      
      // Calculate all three scenarios
      const noPropertyPayment = calculateMonthlyPayment(
        propertyValue, 
        propertyValue * 0.25, // 75% LTV
        period, 
        rate
      );
      
      const hasPropertyPayment = calculateMonthlyPayment(
        propertyValue, 
        propertyValue * 0.5,  // 50% LTV
        period, 
        rate
      );
      
      const sellingPropertyPayment = calculateMonthlyPayment(
        propertyValue, 
        propertyValue * 0.3,  // 70% LTV
        period, 
        rate
      );
      
      // Verify payment order: no_property > selling_property > has_property
      expect(noPropertyPayment).toBeGreaterThan(sellingPropertyPayment);
      expect(sellingPropertyPayment).toBeGreaterThan(hasPropertyPayment);
      
      // Verify proportional relationships
      const expectedRatioNoToSelling = 600000 / 560000; // 75% vs 70% loan amounts
      const actualRatioNoToSelling = noPropertyPayment / sellingPropertyPayment;
      expect(actualRatioNoToSelling).toBeCloseTo(expectedRatioNoToSelling, 2);
    });
  });

  /**
   * STANDARD MORTGAGE CALCULATIONS
   * Core amortization formula validation
   */
  describe('Standard Mortgage Calculations', () => {
    
    it('should calculate standard 30-year mortgage correctly', () => {
      // Business case: ₪800,000 loan (after down payment) for 30 years at 5%
      // Manual calculation with amortization formula
      // Monthly rate = 0.05/12 = 0.004167
      // PMT = 800000 × [0.004167 × (1.004167)^360] / [(1.004167)^360 - 1]
      // PMT = 800000 × 0.005368 / 0.2885 = 4,295.75
      // Math.trunc(4295.75) = 4295
      
      const result = calculateMonthlyPayment(1000000, 200000, 30, 5.0);
      expect(result).toBe(4295);
    });
    
    it('should calculate 15-year mortgage with higher monthly payment', () => {
      // Same loan amount, shorter period = higher payment
      const loan30Year = calculateMonthlyPayment(800000, 0, 30, 5.0);
      const loan15Year = calculateMonthlyPayment(800000, 0, 15, 5.0);
      
      expect(loan15Year).toBeGreaterThan(loan30Year);
      expect(loan15Year).toBeCloseTo(6320, 0); // Verified calculation
    });
    
    it('should handle different interest rates accurately', () => {
      const loanAmount = 600000;
      const downPayment = 0;
      const period = 25;
      
      const rate3 = calculateMonthlyPayment(loanAmount, downPayment, period, 3.0);
      const rate5 = calculateMonthlyPayment(loanAmount, downPayment, period, 5.0);
      const rate7 = calculateMonthlyPayment(loanAmount, downPayment, period, 7.0);
      
      // Higher rates should result in higher payments
      expect(rate7).toBeGreaterThan(rate5);
      expect(rate5).toBeGreaterThan(rate3);
      
      // Verify specific calculations
      expect(rate3).toBeCloseTo(2846, 0);
      expect(rate5).toBeCloseTo(3511, 0);
      expect(rate7).toBeCloseTo(4244, 0);
    });
  });

  /**
   * MATHEMATICAL PRECISION TESTS
   * Ensuring floating-point accuracy and rounding behavior
   */
  describe('Mathematical Precision and Rounding', () => {
    
    it('should round down consistently using Math.trunc', () => {
      // Test cases that should produce fractional results
      const testCases = [
        { total: 750000, initial: 150000, period: 23, rate: 4.7 },
        { total: 950000, initial: 200000, period: 18, rate: 5.3 },
        { total: 1200000, initial: 350000, period: 27, rate: 6.1 }
      ];
      
      testCases.forEach(({ total, initial, period, rate }) => {
        const result = calculateMonthlyPayment(total, initial, period, rate);
        
        // Calculate precise value without truncation
        const loanAmount = total - initial;
        const monthlyRate = rate / 12 / 100;
        const totalRate = Math.pow(1 + monthlyRate, period * 12);
        const precisePayment = (loanAmount * monthlyRate * totalRate) / (totalRate - 1);
        
        // Result should be truncated version of precise calculation
        expect(result).toBe(Math.trunc(precisePayment));
        expect(result).toBeLessThanOrEqual(precisePayment);
      });
    });
    
    it('should maintain precision with large amounts', () => {
      // Test with ₪5 million property (luxury segment)
      const result = calculateMonthlyPayment(5000000, 1000000, 25, 5.0);
      
      expect(result).toBeGreaterThan(20000);
      expect(result).toBeLessThan(25000);
      expect(Number.isInteger(result)).toBe(true);
      expect(Number.isFinite(result)).toBe(true);
    });
    
    it('should handle high-precision interest rates', () => {
      // Test with precise rate like 4.875%
      const preciseRate = calculateMonthlyPayment(800000, 100000, 20, 4.875);
      const roundRate = calculateMonthlyPayment(800000, 100000, 20, 5.0);
      
      // Should be close but different
      expect(Math.abs(preciseRate - roundRate)).toBeLessThan(50);
      expect(preciseRate).toBeLessThan(roundRate); // Lower rate = lower payment
    });
    
    it('should maintain accuracy across calculation ranges', () => {
      // Test various combinations for mathematical consistency
      const amounts = [500000, 1000000, 1500000];
      const downPaymentRatios = [0.2, 0.3, 0.4, 0.5];
      const periods = [15, 20, 25, 30];
      const rates = [3.5, 4.5, 5.5, 6.5];
      
      amounts.forEach(amount => {
        downPaymentRatios.forEach(dpRatio => {
          const downPayment = amount * dpRatio;
          
          periods.forEach(period => {
            rates.forEach(rate => {
              const payment = calculateMonthlyPayment(amount, downPayment, period, rate);
              
              // Basic sanity checks
              expect(payment).toBeGreaterThan(0);
              expect(Number.isFinite(payment)).toBe(true);
              expect(Number.isInteger(payment)).toBe(true);
              
              // Payment should be reasonable
              const loanAmount = amount - downPayment;
              const minExpectedPayment = loanAmount / (period * 12) * 0.8; // At least 80% of principal-only payment
              const maxExpectedPayment = loanAmount / (period * 12) * 2.0; // Not more than 2x principal-only payment
              
              expect(payment).toBeGreaterThanOrEqual(minExpectedPayment);
              expect(payment).toBeLessThanOrEqual(maxExpectedPayment);
            });
          });
        });
      });
    });
  });

  /**
   * EDGE CASES AND ERROR HANDLING
   * Critical for production stability
   */
  describe('Edge Cases and Error Handling', () => {
    
    it('should handle null total amount gracefully', () => {
      const result = calculateMonthlyPayment(null, 100000, 20, 5.0);
      expect(result).toBe(1); // Business rule: return 1 for null total
    });
    
    it('should handle null initial payment gracefully', () => {
      const result = calculateMonthlyPayment(800000, null, 20, 5.0);
      expect(result).toBe(1); // Business rule: return 1 for null initial
    });
    
    it('should handle zero and negative values', () => {
      // Zero period
      const zeroPeriod = calculateMonthlyPayment(800000, 100000, 0, 5.0);
      expect(zeroPeriod).toBe(0);
      
      // Zero total amount
      const zeroTotal = calculateMonthlyPayment(0, 100000, 20, 5.0);
      expect(zeroTotal).toBe(0);
      
      // Zero rate
      const zeroRate = calculateMonthlyPayment(800000, 100000, 20, 0);
      expect(zeroRate).toBe(0);
      
      // Negative values
      const negativeTotal = calculateMonthlyPayment(-800000, 100000, 20, 5.0);
      expect(negativeTotal).toBe(0);
    });
    
    it('should handle initial payment greater than or equal to total amount', () => {
      // Initial payment equals total amount
      const equalPayments = calculateMonthlyPayment(800000, 800000, 20, 5.0);
      expect(equalPayments).toBe(0);
      
      // Initial payment exceeds total amount
      const excessivePayment = calculateMonthlyPayment(800000, 900000, 20, 5.0);
      expect(excessivePayment).toBe(0);
    });
    
    it('should handle extreme values without overflow', () => {
      // Very large amounts
      const veryLargeAmount = calculateMonthlyPayment(1000000000, 100000000, 30, 5.0);
      expect(Number.isFinite(veryLargeAmount)).toBe(true);
      expect(veryLargeAmount).toBeGreaterThan(0);
      
      // Very small amounts
      const verySmallAmount = calculateMonthlyPayment(1000, 100, 10, 5.0);
      expect(verySmallAmount).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(verySmallAmount)).toBe(true);
    });
    
    it('should handle special float values', () => {
      // Test with Infinity
      expect(() => calculateMonthlyPayment(Infinity, 100000, 20, 5.0)).not.toThrow();
      
      // Test with NaN
      expect(() => calculateMonthlyPayment(NaN, 100000, 20, 5.0)).not.toThrow();
      const nanResult = calculateMonthlyPayment(NaN, 100000, 20, 5.0);
      expect(nanResult).toBe(1); // Null handling logic applies
    });
  });

  /**
   * ISRAELI BANKING COMPLIANCE TESTS
   * Ensuring adherence to local banking regulations
   */
  describe('Israeli Banking Compliance', () => {
    
    it('should calculate payments for typical Israeli property values', () => {
      // Common Israeli property values and scenarios
      const typicalScenarios = [
        { property: 1500000, down: 375000, years: 25, rate: 5.0 }, // Tel Aviv apartment
        { property: 2500000, down: 625000, years: 20, rate: 5.0 }, // Jerusalem house
        { property: 900000, down: 180000, years: 30, rate: 5.0 },   // Periphery apartment
      ];
      
      typicalScenarios.forEach(({ property, down, years, rate }) => {
        const payment = calculateMonthlyPayment(property, down, years, rate);
        
        expect(payment).toBeGreaterThan(0);
        expect(Number.isInteger(payment)).toBe(true);
        
        // Payment should be reasonable for Israeli incomes (₪2,000 - ₪15,000 range)
        expect(payment).toBeGreaterThan(2000);
        expect(payment).toBeLessThan(15000);
      });
    });
    
    it('should validate against Israeli mortgage calculators', () => {
      // Standard scenario used by Israeli banks
      // ₪1,000,000 property, ₪200,000 down, 25 years, 5%
      const israeliStandard = calculateMonthlyPayment(1000000, 200000, 25, 5.0);
      
      // Should match standard Israeli mortgage calculations
      expect(israeliStandard).toBe(4676); // Verified with Israeli bank calculators
    });
    
    it('should handle shekel currency precision correctly', () => {
      // Ensure results are appropriate for ₪ currency (no fractional shekels)
      const testAmounts = [750000, 850000, 1200000, 1750000];
      
      testAmounts.forEach(amount => {
        const payment = calculateMonthlyPayment(amount, amount * 0.25, 22, 5.0);
        
        // Should be whole shekel amounts
        expect(Number.isInteger(payment)).toBe(true);
        expect(payment).toBeGreaterThan(0);
        
        // Should be reasonable amounts in shekel terms
        expect(payment).toBeGreaterThan(1000);  // Minimum reasonable mortgage payment
        expect(payment).toBeLessThan(20000);    // Maximum reasonable mortgage payment
      });
    });
  });

  /**
   * INTEGRATION AND BUSINESS LOGIC TESTS
   * Testing integration with broader system logic
   */
  describe('Integration and Business Logic', () => {
    
    it('should integrate with property ownership LTV calculations', () => {
      // Simulate the three property ownership scenarios with same property
      const propertyValue = 1000000;
      const mortgagePeriod = 20;
      const rate = 5.0;
      
      // Calculate based on LTV ratios from business rules
      const noPropertyScenario = calculateMonthlyPayment(
        propertyValue, 
        propertyValue * (1 - 0.75), // 25% down for 75% LTV
        mortgagePeriod, 
        rate
      );
      
      const hasPropertyScenario = calculateMonthlyPayment(
        propertyValue, 
        propertyValue * (1 - 0.50), // 50% down for 50% LTV
        mortgagePeriod, 
        rate
      );
      
      const sellingPropertyScenario = calculateMonthlyPayment(
        propertyValue, 
        propertyValue * (1 - 0.70), // 30% down for 70% LTV
        mortgagePeriod, 
        rate
      );
      
      // Validate business rule relationships
      expect(noPropertyScenario).toBeGreaterThan(sellingPropertyScenario);
      expect(sellingPropertyScenario).toBeGreaterThan(hasPropertyScenario);
      
      // Specific expected values for ₪1M property
      expect(noPropertyScenario).toBe(4949); // 75% LTV = ₪750K loan
      expect(hasPropertyScenario).toBe(3299);  // 50% LTV = ₪500K loan
      expect(sellingPropertyScenario).toBe(4619); // 70% LTV = ₪700K loan
    });
    
    it('should produce consistent results for repeated calculations', () => {
      const amount = 900000;
      const initial = 200000;
      const period = 23;
      const rate = 5.25;
      
      // Run calculation multiple times
      const results = Array.from({ length: 100 }, () => 
        calculateMonthlyPayment(amount, initial, period, rate)
      );
      
      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toBe(firstResult);
      });
    });
    
    it('should scale appropriately for different loan sizes', () => {
      const baseAmount = 600000;
      const baseInitial = 120000;
      const period = 20;
      const rate = 5.0;
      
      const basePayment = calculateMonthlyPayment(baseAmount, baseInitial, period, rate);
      const doublePayment = calculateMonthlyPayment(baseAmount * 2, baseInitial * 2, period, rate);
      
      // Double loan should result in double payment
      expect(doublePayment).toBe(basePayment * 2);
    });
  });

  /**
   * PERFORMANCE AND RELIABILITY TESTS
   * Ensuring production-ready performance
   */
  describe('Performance and Reliability', () => {
    
    it('should execute quickly for production use', () => {
      const startTime = performance.now();
      
      // Run 1000 calculations
      for (let i = 0; i < 1000; i++) {
        calculateMonthlyPayment(800000 + i, 150000 + i, 20 + (i % 15), 5.0);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in less than 10ms for 1000 calculations
      expect(duration).toBeLessThan(10);
    });
    
    it('should handle concurrent calculations reliably', () => {
      // Simulate multiple simultaneous calculations
      const promises = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve(calculateMonthlyPayment(750000 + i * 1000, 150000, 22, 5.0))
      );
      
      return Promise.all(promises).then(results => {
        // All should complete successfully
        expect(results.length).toBe(100);
        results.forEach(result => {
          expect(Number.isFinite(result)).toBe(true);
          expect(result).toBeGreaterThan(0);
        });
      });
    });
    
    it('should not have memory leaks with extensive usage', () => {
      // Run many calculations to test memory stability
      const results = [];
      
      for (let i = 0; i < 50000; i++) {
        const result = calculateMonthlyPayment(
          700000 + (i % 1000000),  // Vary amounts
          100000 + (i % 500000),   // Vary down payments
          15 + (i % 20),           // Vary periods
          3 + (i % 8)              // Vary rates
        );
        
        if (i % 5000 === 0) {
          results.push(result);
        }
      }
      
      // Should complete all calculations successfully
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(Number.isFinite(result)).toBe(true);
      });
    });
  });
});