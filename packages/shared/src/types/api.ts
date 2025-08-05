/**
 * Shared API Types for BankIM Online
 * These types are used across both client and server packages
 */

// Bank Offer Request Interface
export interface BankOfferRequest {
  loan_type: string
  amount: number
  property_value: number
  monthly_income: number
  
  // Database-driven calculation fields (no hardcoded values)
  birth_date?: string           // For real age calculation
  employment_start_date?: string // For real employment years calculation
  age?: number                  // Fallback if birth_date not available
  employment_years?: number     // Fallback if start_date not available
  
  // Property ownership logic (Confluence Action #12)
  property_ownership?: string   // 'no_property', 'has_property', 'selling_property'
  
  // Session management for Steps 1-3 data
  session_id?: string
  client_id?: string
  
  // Optional fields - will be calculated from database if not provided
  credit_score?: number         // From client_credit_history table
  monthly_expenses?: number     // From client_debts table
  
  // Additional user data
  education?: string
  citizenship?: string
  marital_status?: string
  children_count?: number
  property_city?: string
  property_type?: string
  is_first_apartment?: boolean
  has_medical_insurance?: boolean
  is_foreigner?: boolean
  is_public_figure?: boolean
}

// Bank Offer Response Interface
export interface BankOffer {
  bank_id: string
  bank_name: string
  bank_logo?: string
  loan_amount: number
  monthly_payment: number
  interest_rate: number
  term_years: number
  total_payment: number
  approval_status: 'approved' | 'rejected' | 'pending'
  ltv_ratio?: number
  dti_ratio?: number
}

// Mortgage Program Interface
export interface MortgageProgram {
  id: string
  title: string
  description: string
  conditionFinance: string
  conditionPeriod: string
  conditionBid: string
  interestRate?: number
  termYears?: number
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Common API Error Interface
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Authentication Interfaces
export interface LoginRequest {
  phone?: string
  email?: string
  password?: string
  sms_code?: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    phone?: string
    email?: string
    role?: string
  }
  message?: string
}

// Database Connection Types
export interface DatabaseConfig {
  connectionString: string
  ssl?: {
    rejectUnauthorized: boolean
  }
}