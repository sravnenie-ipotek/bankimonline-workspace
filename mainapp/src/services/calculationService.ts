import calculateMonthlyPayment from '../utils/helpers/calculateMonthlyPayment'
import { calculateCreditAnnuityPayment } from '../utils/helpers/calculateCreditAnnuityPayment'
import calculateRemainingAmount from '../utils/helpers/calculateRemainingAmount'
import calculatePeriod from '../utils/helpers/calculatePeriod'
import type { CalculationParametersResponse } from './calculationParametersApi'

/**
 * Service class that provides database-driven calculation functions.
 * This service eliminates all hardcoded values by fetching parameters from the database.
 * 
 * ВАЖНО: Этот сервис заменяет прямое использование helper функций с hardcoded значениями.
 * Все расчеты теперь используют параметры из базы данных.
 */
class CalculationService {
  private cache: Map<string, { data: CalculationParametersResponse['data'], expiry: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Get API base URL
   */
  private getApiBaseUrl(): string {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8003/api'
    }
    return import.meta.env.VITE_NODE_API_BASE_URL || 'https://bankimonline.com/api'
  }

  /**
   * Fetch calculation parameters from API with caching
   */
  private async fetchCalculationParameters(
    businessPath: 'mortgage' | 'credit' | 'mortgage_refinance' | 'credit_refinance' = 'mortgage'
  ): Promise<CalculationParametersResponse['data']> {
    const cacheKey = businessPath
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() < cached.expiry) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.getApiBaseUrl()}/v1/calculation-parameters?business_path=${businessPath}`)
      const result: CalculationParametersResponse = await response.json()
      
      if (result.status === 'success' || (result.status === 'error' && result.data)) {
        // Cache the result
        this.cache.set(cacheKey, {
          data: result.data,
          expiry: Date.now() + this.CACHE_DURATION
        })
        
        if (result.data.is_fallback) {
          console.info(`📋 Using fallback calculation parameters for ${businessPath} (database connection issue)`)
        } else {
          console.info(`✅ Using database calculation parameters for ${businessPath}`)
        }
        
        return result.data
      } else {
        throw new Error(result.message || 'Failed to fetch calculation parameters')
      }
    } catch (error) {
      console.warn(`⚠️ Failed to fetch calculation parameters for ${businessPath}:`, error.message)
      
      // Emergency fallback - only for complete API failure
      console.warn('🚨 CRITICAL: Using emergency hardcoded fallback parameters - API completely unreachable')
      return {
        business_path: businessPath,
        current_interest_rate: businessPath.includes('credit') ? 8.5 : 5.0,
        property_ownership_ltvs: {
          no_property: { ltv: 75.0, min_down_payment: 25.0 },
          has_property: { ltv: 50.0, min_down_payment: 50.0 },
          selling_property: { ltv: 70.0, min_down_payment: 30.0 }
        },
        standards: {},
        last_updated: new Date().toISOString(),
        is_fallback: true
      }
    }
  }

  /**
   * Get current interest rate for business path
   */
  async getCurrentRate(businessPath: 'mortgage' | 'credit' | 'mortgage_refinance' | 'credit_refinance' = 'mortgage'): Promise<number> {
    const params = await this.fetchCalculationParameters(businessPath)
    return params.current_interest_rate
  }

  /**
   * Get property ownership LTV ratio
   */
  async getPropertyOwnershipLtv(ownership: string, businessPath: 'mortgage' | 'credit' | 'mortgage_refinance' | 'credit_refinance' = 'mortgage'): Promise<number> {
    const params = await this.fetchCalculationParameters(businessPath)
    const ltvData = params.property_ownership_ltvs[ownership]
    
    if (!ltvData) {
      console.warn(`⚠️ Property ownership LTV for ${ownership} not found, using default 50%`)
      return 50.0
    }
    
    return ltvData.ltv
  }

  /**
   * Get specific standard value
   */
  async getStandardValue(category: string, name: string, businessPath: 'mortgage' | 'credit' | 'mortgage_refinance' | 'credit_refinance' = 'mortgage'): Promise<number> {
    const params = await this.fetchCalculationParameters(businessPath)
    const value = params.standards?.[category]?.[name]?.value
    
    if (value === undefined) {
      console.warn(`⚠️ Standard ${category}.${name} not found for ${businessPath}`)
      // Try to get from general configuration or use minimal fallback
      const fallbackValue = this.getEmergencyFallback(category, name)
      if (fallbackValue !== null) return fallbackValue
      return 0
    }
    
    return value
  }

  /**
   * Calculate monthly mortgage payment with database-driven rate
   */
  async calculateMortgagePayment(
    totalAmount: number | null,
    initialPayment: number | null,
    period: number,
    customRate?: number
  ): Promise<number> {
    const rate = customRate || await this.getCurrentRate('mortgage')
    return calculateMonthlyPayment(totalAmount, initialPayment, period, rate)
  }

  /**
   * Calculate credit annuity payment with database-driven rate
   */
  async calculateCreditPayment(
    sum: number,
    period: number,
    customRate?: number
  ): Promise<number> {
    const rate = customRate || await this.getCurrentRate('credit')
    return calculateCreditAnnuityPayment(sum, period, rate)
  }

  /**
   * Calculate remaining amount with database-driven rate
   */
  async calculateRemainingMortgage(
    remainingMortgageAmount: number | null,
    remainingYears: number,
    customRate?: number
  ): Promise<number> {
    const rate = customRate || await this.getCurrentRate('mortgage')
    return calculateRemainingAmount(remainingMortgageAmount, remainingYears, rate)
  }

  /**
   * Calculate loan period with database-driven rate
   */
  async calculateLoanPeriod(
    totalAmount: number | null,
    initialPayment: number,
    monthlyPayment: number,
    customRate?: number
  ): Promise<number> {
    const rate = customRate || await this.getCurrentRate('mortgage')
    return calculatePeriod(totalAmount, initialPayment, monthlyPayment, rate)
  }

  /**
   * Get emergency fallback values for critical business parameters
   */
  private getEmergencyFallback(category: string, name: string): number | null {
    // Only provide fallbacks for critical business parameters
    const fallbacks: Record<string, Record<string, number>> = {
      'ltv': {
        'max_ltv': 80.0,
        'standard_ltv_max': 80.0
      },
      'dti': {
        'max_dti': 42.0,
        'front_end_dti_max': 28.0,
        'back_end_dti_max': 42.0
      },
      'credit_score': {
        'minimum_credit_score': 620.0,
        'min_credit_score': 620.0
      },
      'loan_terms': {
        'min_years': 4.0,
        'max_years': 30.0
      }
    }
    
    return fallbacks[category]?.[name] || null
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get all calculation parameters for a business path
   */
  async getAllParameters(businessPath: 'mortgage' | 'credit' | 'mortgage_refinance' | 'credit_refinance' = 'mortgage'): Promise<CalculationParametersResponse['data']> {
    return this.fetchCalculationParameters(businessPath)
  }
}

// Export singleton instance
export const calculationService = new CalculationService()
export default calculationService

// Export types for use in components
export type { CalculationParametersResponse } from './calculationParametersApi'