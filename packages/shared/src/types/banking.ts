/**
 * Banking Domain Types for BankIM Online
 * Business logic types for mortgage, credit, and banking operations
 */

// Property Ownership Types (Critical for LTV calculations)
export type PropertyOwnership = 
  | 'no_property'      // 75% LTV
  | 'has_property'     // 50% LTV
  | 'selling_property' // 70% LTV

// Loan Types
export type LoanType = 
  | 'mortgage'
  | 'credit'
  | 'refinance_mortgage' 
  | 'refinance_credit'

// Approval Status
export type ApprovalStatus = 
  | 'approved'
  | 'rejected' 
  | 'pending'
  | 'under_review'

// Banking Constants Interface
export interface BankingConstants {
  DEFAULT_INTEREST_RATE: number
  LTV_RATIOS: {
    NO_PROPERTY: number
    HAS_PROPERTY: number
    SELLING_PROPERTY: number
  }
  MAX_LOAN_TERM_YEARS: number
  MIN_LOAN_AMOUNT: number
  MAX_LOAN_AMOUNT: number
}

// Calculation Parameters
export interface CalculationParams {
  loan_amount: number
  property_value: number
  interest_rate: number
  term_years: number
  property_ownership: PropertyOwnership
  monthly_income: number
  monthly_expenses?: number
}

// Bank Information
export interface BankInfo {
  id: string
  name: string
  logo?: string
  contact_info?: {
    phone?: string
    email?: string
    website?: string
  }
  active: boolean
}

// Credit Score Ranges
export type CreditScoreRange = 
  | 'excellent'  // 750+
  | 'good'       // 700-749
  | 'fair'       // 650-699  
  | 'poor'       // 600-649
  | 'bad'        // <600

export interface CreditProfile {
  score: number
  range: CreditScoreRange
  history_length: number
  payment_history: 'excellent' | 'good' | 'fair' | 'poor'
  credit_utilization: number
  recent_inquiries: number
}