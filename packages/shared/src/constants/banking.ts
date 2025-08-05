/**
 * Banking Constants for BankIM Online
 * Critical business rules and calculations
 */

import type { BankingConstants } from '../types/banking'

// Core Banking Constants
export const BANKING_CONSTANTS: BankingConstants = {
  DEFAULT_INTEREST_RATE: 5.0, // 5% default interest rate
  
  // LTV (Loan-to-Value) Ratios based on property ownership
  LTV_RATIOS: {
    NO_PROPERTY: 75,      // 75% financing, 25% down payment
    HAS_PROPERTY: 50,     // 50% financing, 50% down payment  
    SELLING_PROPERTY: 70, // 70% financing, 30% down payment
  },
  
  MAX_LOAN_TERM_YEARS: 30,
  MIN_LOAN_AMOUNT: 50000,   // Minimum loan amount in ILS
  MAX_LOAN_AMOUNT: 5000000, // Maximum loan amount in ILS
}

// Property Ownership Constants
export const PROPERTY_OWNERSHIP = {
  NO_PROPERTY: 'no_property',
  HAS_PROPERTY: 'has_property', 
  SELLING_PROPERTY: 'selling_property',
} as const

// Loan Type Constants
export const LOAN_TYPES = {
  MORTGAGE: 'mortgage',
  CREDIT: 'credit',
  REFINANCE_MORTGAGE: 'refinance_mortgage',
  REFINANCE_CREDIT: 'refinance_credit',
} as const

// Credit Score Thresholds
export const CREDIT_SCORE_THRESHOLDS = {
  EXCELLENT: 750,
  GOOD: 700,
  FAIR: 650,
  POOR: 600,
} as const

// Validation Constants
export const VALIDATION_RULES = {
  MIN_AGE: 18,
  MAX_AGE: 75,
  MIN_INCOME: 3000,     // Minimum monthly income in ILS
  MAX_DTI_RATIO: 42,    // Maximum debt-to-income ratio (42%)
  MIN_EMPLOYMENT_YEARS: 0.5, // Minimum 6 months employment
} as const

// Currency and Formatting
export const CURRENCY = {
  ILS: {
    symbol: '₪',
    code: 'ILS',
    locale: 'he-IL',
  },
  USD: {
    symbol: '$',
    code: 'USD', 
    locale: 'en-US',
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    locale: 'en-EU',
  },
} as const

// API Endpoints (relative paths)
export const API_ENDPOINTS = {
  BANK_OFFERS: '/api/customer/compare-banks',
  MORTGAGE_PROGRAMS: '/api/customer/mortgage-programs', 
  LOGIN: '/api/sms-login',
  VERIFY_CODE: '/api/sms-code-login',
  BANKS: '/api/v1/banks',
  LOCALES: '/api/v1/locales',
  CITIES: '/api/v1/cities',
} as const