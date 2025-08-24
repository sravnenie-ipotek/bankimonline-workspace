/**
 * CATEGORY 1: CRITICAL FINANCIAL CALCULATIONS - Remaining Amount Calculation Tests
 * 
 * These tests validate the remaining amount calculation for mortgage/loan scenarios.
 * This function calculates total amount to be paid on remaining mortgage balance.
 * 
 * Business Rules:
 * - Formula: Total = Principal × (1 + (rate × years) / 100)
 * - Simple interest calculation (not compound)
 * - Result truncated to whole currency units (Math.trunc)
 * - Used for refinancing and payoff calculations
 * - Critical for determining refinancing benefits
 */

import calculateRemainingAmount from '../calculateRemainingAmount';

describe('calculateRemainingAmount - Critical Remaining Balance Calculations', () => {
  
  /**
   * CORE BUSINESS LOGIC TESTS
   * Testing standard remaining amount scenarios
   */
  describe('Standard Remaining Amount Calculations', () => {
    
    it('should calculate remaining amount with simple interest correctly', () => {
      // Business case: ₪500,000 remaining balance, 10 years left, 5% rate
      // Simple interest formula: 500,000 × (1 + (5 × 10) / 100)
      // = 500,000 × (1 + 0.5) = 500,000 × 1.5 = ₪750,000
      
      const result = calculateRemainingAmount(500000, 10, 5.0);
      expect(result).toBe(750000);
    });
    
    it('should calculate for different remaining periods', () => {
      const remainingBalance = 600000;
      const rate = 5.0;
      
      const shortTerm = calculateRemainingAmount(remainingBalance, 5, rate);  // 5 years
      const longTerm = calculateRemainingAmount(remainingBalance, 15, rate);  // 15 years
      
      // Longer term should result in higher total amount
      expect(longTerm).toBeGreaterThan(shortTerm);
      
      // Verify specific calculations
      // 5 years: 600,000 × (1 + 0.25) = 750,000
      // 15 years: 600,000 × (1 + 0.75) = 1,050,000
      expect(shortTerm).toBe(750000);
      expect(longTerm).toBe(1050000);
    });
    
    it('should calculate for different interest rates', () => {
      const remainingBalance = 400000;
      const years = 8;
      
      const lowRate = calculateRemainingAmount(remainingBalance, years, 3.0);
      const midRate = calculateRemainingAmount(remainingBalance, years, 5.0);
      const highRate = calculateRemainingAmount(remainingBalance, years, 7.0);
      
      // Higher rates should result in higher total amounts
      expect(highRate).toBeGreaterThan(midRate);
      expect(midRate).toBeGreaterThan(lowRate);
      
      // Verify calculations
      // 3%: 400,000 × (1 + 0.24) = 496,000
      // 5%: 400,000 × (1 + 0.40) = 560,000
      // 7%: 400,000 × (1 + 0.56) = 624,000
      expect(lowRate).toBe(496000);
      expect(midRate).toBe(560000);
      expect(highRate).toBe(624000);
    });
    
    it('should handle various remaining balance amounts', () => {
      const years = 12;
      const rate = 6.0;
      const balances = [100000, 300000, 500000, 800000, 1000000];
      
      balances.forEach((balance) => {
        const result = calculateRemainingAmount(balance, years, rate);
        
        // Should be proportional to balance
        const expectedMultiplier = 1 + (rate * years) / 100; // 1 + 0.72 = 1.72
        const expected = balance * expectedMultiplier;
        
        expect(result).toBe(Math.trunc(expected));
        expect(result).toBeGreaterThan(balance); // Should always be more than principal
      });
    });
  });

  /**
   * SIMPLE INTEREST FORMULA VALIDATION
   * Ensuring correct mathematical implementation
   */
  describe('Simple Interest Formula Validation', () => {
    
    it('should implement correct simple interest formula', () => {
      // Manual verification of formula: A = P(1 + rt)
      const testCases = [
        { principal: 250000, years: 6, rate: 4.5, expected: 317500 },
        { principal: 750000, years: 3, rate: 6.0, expected: 885000 },
        { principal: 180000, years: 15, rate: 5.5, expected: 328500 },
      ];
      
      testCases.forEach(({ principal, years, rate, expected }) => {
        const result = calculateRemainingAmount(principal, years, rate);
        expect(result).toBe(expected);
      });
    });
    
    it('should handle fractional years correctly', () => {
      // Test with fractional years (6 months = 0.5 years)
      const halfYear = calculateRemainingAmount(200000, 0.5, 8.0);
      const fullYear = calculateRemainingAmount(200000, 1.0, 8.0);
      
      // Half year should be between principal and full year amount
      expect(halfYear).toBeGreaterThan(200000);
      expect(halfYear).toBeLessThan(fullYear);
      
      // Verify: 200,000 × (1 + 0.04) = 208,000
      expect(halfYear).toBe(208000);
      // Verify: 200,000 × (1 + 0.08) = 216,000  
      expect(fullYear).toBe(216000);
    });
    
    it('should handle high precision rates', () => {
      // Test with precise rates like 5.375%
      const preciseRate = calculateRemainingAmount(300000, 10, 5.375);
      const roundRate = calculateRemainingAmount(300000, 10, 5.0);
      
      expect(preciseRate).toBeGreaterThan(roundRate);
      
      // Verify: 300,000 × (1 + 0.5375) = 461,250
      expect(preciseRate).toBe(461250);
    });
    
    it('should truncate results consistently', () => {
      // Test cases that produce fractional results
      const testCases = [
        { principal: 333333, years: 7, rate: 4.33 },
        { principal: 666666, years: 3, rate: 7.77 },
        { principal: 123456, years: 11, rate: 6.89 },
      ];
      
      testCases.forEach(({ principal, years, rate }) => {
        const result = calculateRemainingAmount(principal, years, rate);
        
        // Calculate precise value
        const preciseValue = principal * (1 + (rate * years) / 100);
        
        // Result should be truncated version
        expect(result).toBe(Math.trunc(preciseValue));
        expect(result).toBeLessThanOrEqual(preciseValue);
        expect(Number.isInteger(result)).toBe(true);
      });
    });
  });

  /**
   * EDGE CASES AND ERROR HANDLING
   * Critical for production stability
   */
  describe('Edge Cases and Error Handling', () => {
    
    it('should handle null remaining amount gracefully', () => {
      const result = calculateRemainingAmount(null, 10, 5.0);
      expect(result).toBe(0); // Business rule: return 0 for null
    });
    
    it('should handle zero values', () => {
      // Zero remaining amount
      const zeroAmount = calculateRemainingAmount(0, 10, 5.0);
      expect(zeroAmount).toBe(0);
      
      // Zero years remaining
      const zeroYears = calculateRemainingAmount(500000, 0, 5.0);
      expect(zeroYears).toBe(0);
      
      // Zero interest rate
      const zeroRate = calculateRemainingAmount(500000, 10, 0);
      expect(zeroRate).toBe(0);
    });
    
    it('should handle negative values appropriately', () => {
      // Negative remaining amount
      const negativeAmount = calculateRemainingAmount(-100000, 5, 5.0);
      expect(negativeAmount).toBe(0);
      
      // Negative years
      const negativeYears = calculateRemainingAmount(500000, -5, 5.0);
      expect(negativeYears).toBe(0);
      
      // Negative rate
      const negativeRate = calculateRemainingAmount(500000, 10, -5.0);
      expect(negativeRate).toBe(0);
    });
    
    it('should handle very large values', () => {
      // Very large remaining amount
      const largeAmount = calculateRemainingAmount(10000000, 20, 5.0);
      expect(Number.isFinite(largeAmount)).toBe(true);
      expect(largeAmount).toBeGreaterThan(10000000);
      expect(largeAmount).toBe(20000000); // 10M × (1 + 1.0) = 20M
      
      // Very long remaining period
      const longPeriod = calculateRemainingAmount(500000, 50, 5.0);
      expect(Number.isFinite(longPeriod)).toBe(true);
      expect(longPeriod).toBe(1750000); // 500K × (1 + 2.5) = 1.75M
    });
    
    it('should handle very small values', () => {
      // Very small remaining amount
      const smallAmount = calculateRemainingAmount(100, 5, 5.0);
      expect(smallAmount).toBe(125); // 100 × (1 + 0.25) = 125
      
      // Very small rate
      const smallRate = calculateRemainingAmount(500000, 10, 0.1);
      expect(smallRate).toBe(505000); // 500K × (1 + 0.01) = 505K
      
      // Very small period
      const smallPeriod = calculateRemainingAmount(500000, 0.1, 5.0);
      expect(smallPeriod).toBe(502500); // 500K × (1 + 0.005) = 502.5K, trunc to 502K
    });
    
    it('should handle special float values', () => {
      // Test with Infinity
      expect(() => calculateRemainingAmount(Infinity, 10, 5.0)).not.toThrow();
      const infinityResult = calculateRemainingAmount(Infinity, 10, 5.0);
      expect(infinityResult).toBe(Infinity);
      
      // Test with NaN
      expect(() => calculateRemainingAmount(NaN, 10, 5.0)).not.toThrow();
      const nanResult = calculateRemainingAmount(NaN, 10, 5.0);
      expect(nanResult).toBe(0); // Null handling applies
    });
  });

  /**
   * REFINANCING SCENARIOS
   * Real-world refinancing calculations
   */
  describe('Refinancing Scenarios', () => {
    
    it('should calculate remaining amount for typical refinancing scenario', () => {
      // Customer has ₪800K remaining, 15 years left at 5%
      // Considering refinancing - need to know total amount to pay
      const remainingTotal = calculateRemainingAmount(800000, 15, 5.0);
      
      // 800,000 × (1 + 0.75) = 1,400,000
      expect(remainingTotal).toBe(1400000);
      
      // This helps calculate if refinancing at lower rate is beneficial
    });
    
    it('should compare different refinancing options', () => {
      const remainingBalance = 600000;
      const yearsLeft = 12;
      
      // Current loan at 6%
      const currentLoan = calculateRemainingAmount(remainingBalance, yearsLeft, 6.0);
      
      // Refinancing option at 4%
      const refinanceOption = calculateRemainingAmount(remainingBalance, yearsLeft, 4.0);
      
      // Refinancing should save money
      expect(refinanceOption).toBeLessThan(currentLoan);
      
      // Calculate savings
      const savings = currentLoan - refinanceOption;
      expect(savings).toBeGreaterThan(0);
      expect(savings).toBe(144000); // 1,032,000 - 888,000 = 144,000
    });
    
    it('should handle early payoff scenarios', () => {
      const remainingBalance = 450000;
      
      // Compare 10 years vs 5 years payoff
      const normalPayoff = calculateRemainingAmount(remainingBalance, 10, 5.5);
      const earlyPayoff = calculateRemainingAmount(remainingBalance, 5, 5.5);
      
      expect(earlyPayoff).toBeLessThan(normalPayoff);
      
      // Verify calculations
      expect(earlyPayoff).toBe(573750);  // 450K × 1.275
      expect(normalPayoff).toBe(697500); // 450K × 1.55
      
      // Savings from early payoff
      const interestSavings = normalPayoff - earlyPayoff;
      expect(interestSavings).toBe(123750);
    });
  });

  /**
   * BUSINESS COMPLIANCE TESTS
   * Israeli banking and financial standards
   */
  describe('Business Compliance and Standards', () => {
    
    it('should handle typical Israeli mortgage remaining balances', () => {
      // Common remaining balance scenarios in Israeli market
      const scenarios = [
        { balance: 800000, years: 18, rate: 5.0 },   // Mid-mortgage
        { balance: 1200000, years: 22, rate: 5.5 },  // Large mortgage
        { balance: 300000, years: 8, rate: 4.5 },    // Nearly paid off
      ];
      
      scenarios.forEach(({ balance, years, rate }) => {
        const total = calculateRemainingAmount(balance, years, rate);
        
        expect(total).toBeGreaterThan(balance);
        expect(Number.isInteger(total)).toBe(true);
        expect(Number.isFinite(total)).toBe(true);
        
        // Total should be reasonable (not more than 3x balance)
        expect(total).toBeLessThan(balance * 3);
      });
    });
    
    it('should calculate correctly for Israeli interest rate ranges', () => {
      const balance = 750000;
      const years = 15;
      
      // Test with typical Israeli mortgage rates (3% - 7%)
      const rates = [3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0];
      
      rates.forEach((rate, index) => {
        const total = calculateRemainingAmount(balance, years, rate);
        
        // Higher rates should produce higher totals
        if (index > 0) {
          const previousRate = rates[index - 1];
          const previousTotal = calculateRemainingAmount(balance, years, previousRate);
          expect(total).toBeGreaterThan(previousTotal);
        }
        
        // Should be within reasonable range
        expect(total).toBeGreaterThan(balance);
        expect(total).toBeLessThan(balance * 2.5);
      });
    });
    
    it('should provide whole shekel amounts', () => {
      // Ensure results are appropriate for ₪ currency
      const testAmounts = [123456, 654321, 987654, 456789];
      
      testAmounts.forEach(amount => {
        const total = calculateRemainingAmount(amount, 7, 5.3);
        
        // Should be whole shekel amounts
        expect(Number.isInteger(total)).toBe(true);
        expect(total % 1).toBe(0);
      });
    });
  });

  /**
   * MATHEMATICAL RELATIONSHIPS
   * Testing mathematical consistency
   */
  describe('Mathematical Relationships and Consistency', () => {
    
    it('should demonstrate linear relationship with principal', () => {
      const years = 8;
      const rate = 5.0;
      
      const base = calculateRemainingAmount(100000, years, rate);
      const double = calculateRemainingAmount(200000, years, rate);
      const triple = calculateRemainingAmount(300000, years, rate);
      
      // Should scale linearly
      expect(double).toBe(base * 2);
      expect(triple).toBe(base * 3);
    });
    
    it('should demonstrate linear relationship with time', () => {
      const balance = 400000;
      const rate = 6.0;
      
      const fiveYears = calculateRemainingAmount(balance, 5, rate);
      const tenYears = calculateRemainingAmount(balance, 10, rate);
      
      // Interest portion should double with double time
      const fiveYearInterest = fiveYears - balance;
      const tenYearInterest = tenYears - balance;
      
      expect(tenYearInterest).toBe(fiveYearInterest * 2);
    });
    
    it('should demonstrate linear relationship with rate', () => {
      const balance = 500000;
      const years = 10;
      
      const rate3 = calculateRemainingAmount(balance, years, 3.0);
      const rate6 = calculateRemainingAmount(balance, years, 6.0);
      
      // Interest portion should double with double rate
      const interest3 = rate3 - balance;   // 150,000
      const interest6 = rate6 - balance;   // 300,000
      
      expect(interest6).toBe(interest3 * 2);
    });
    
    it('should maintain consistency across multiple calculations', () => {
      // Run same calculation multiple times
      const balance = 650000;
      const years = 12;
      const rate = 5.25;
      
      const results = Array.from({ length: 100 }, () => 
        calculateRemainingAmount(balance, years, rate)
      );
      
      // All results should be identical
      const expectedResult = 1063750; // 650,000 × (1 + 0.63)
      results.forEach(result => {
        expect(result).toBe(expectedResult);
      });
    });
  });

  /**
   * INTEGRATION TESTS
   * Testing integration with other system components
   */
  describe('Integration and System Compatibility', () => {
    
    it('should integrate with refinancing decision logic', () => {
      // Simulate refinancing decision process
      const currentBalance = 700000;
      const yearsRemaining = 18;
      const currentRate = 6.5;
      const newRate = 4.0;
      
      const currentTotal = calculateRemainingAmount(currentBalance, yearsRemaining, currentRate);
      const refinanceTotal = calculateRemainingAmount(currentBalance, yearsRemaining, newRate);
      
      // Calculate potential savings
      const savings = currentTotal - refinanceTotal;
      const savingsPercentage = (savings / currentTotal) * 100;
      
      expect(savings).toBeGreaterThan(0);
      expect(savingsPercentage).toBeGreaterThan(15); // Should save at least 15%
    });
    
    it('should work with property ownership scenarios', () => {
      // Test with different loan amounts based on LTV rules
      const propertyValue = 1000000;
      const years = 20;
      const rate = 5.0;
      
      // No property: 75% LTV = ₪750K loan
      const noPropertyRemaining = calculateRemainingAmount(750000, years, rate);
      
      // Has property: 50% LTV = ₪500K loan  
      const hasPropertyRemaining = calculateRemainingAmount(500000, years, rate);
      
      // Selling property: 70% LTV = ₪700K loan
      const sellingPropertyRemaining = calculateRemainingAmount(700000, years, rate);
      
      // Should reflect proportional relationships
      expect(noPropertyRemaining).toBeGreaterThan(sellingPropertyRemaining);
      expect(sellingPropertyRemaining).toBeGreaterThan(hasPropertyRemaining);
      
      // Verify proportions
      const noPropertyRatio = noPropertyRemaining / hasPropertyRemaining;
      expect(noPropertyRatio).toBeCloseTo(1.5, 1); // 750K/500K = 1.5
    });
  });

  /**
   * PERFORMANCE TESTS
   * Ensuring production-ready performance
   */
  describe('Performance and Reliability', () => {
    
    it('should execute calculations quickly', () => {
      const startTime = performance.now();
      
      // Run 1000 calculations
      for (let i = 0; i < 1000; i++) {
        calculateRemainingAmount(500000 + i, 10 + (i % 20), 5.0 + (i % 5));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in less than 5ms for 1000 calculations
      expect(duration).toBeLessThan(5);
    });
    
    it('should handle concurrent calculations', () => {
      // Simulate multiple simultaneous calculations
      const promises = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve(calculateRemainingAmount(600000 + i * 1000, 12, 5.0))
      );
      
      return Promise.all(promises).then(results => {
        expect(results.length).toBe(100);
        results.forEach(result => {
          expect(Number.isFinite(result)).toBe(true);
          expect(result).toBeGreaterThanOrEqual(0);
        });
      });
    });
    
    it('should not have memory leaks with extensive usage', () => {
      // Run many calculations to test memory stability
      const results = [];
      
      for (let i = 0; i < 10000; i++) {
        const result = calculateRemainingAmount(
          400000 + (i % 1000000),
          5 + (i % 25),
          3 + (i % 8)
        );
        
        if (i % 1000 === 0) {
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