/**
 * @bankimonline/shared - Main Export Index
 * Shared types, constants, utilities, and translations for BankIM Online
 */

// Type Exports
export type {
  // API Types
  BankOfferRequest,
  BankOffer,
  MortgageProgram,
  ApiResponse,
  ApiError,
  LoginRequest,
  LoginResponse,
  DatabaseConfig,
} from './types/api'

export type {
  // Banking Types
  PropertyOwnership,
  LoanType,
  ApprovalStatus,
  BankingConstants,
  CalculationParams,
  BankInfo,
  CreditScoreRange,
  CreditProfile,
} from './types/banking'

// Constant Exports
export {
  BANKING_CONSTANTS,
  PROPERTY_OWNERSHIP,
  LOAN_TYPES,
  CREDIT_SCORE_THRESHOLDS,
  VALIDATION_RULES,
  CURRENCY,
  API_ENDPOINTS,
} from './constants/banking'

// Utility Exports
export {
  // Calculation Utilities
  calculateAge,
  calculateEmploymentYears,
  getLTVRatio,
  calculateMaxLoanAmount,
  calculateMinDownPayment,
  calculateMonthlyPayment,
  calculateTotalPayment,
  calculateDTIRatio,
  validateCalculationParams,
} from './utils/calculations'

export {
  // Formatting Utilities
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatPhoneNumber,
  truncateText,
  capitalizeWords,
  getInitials,
} from './utils/formatting'

// Translation File Paths (for dynamic imports)
export const TRANSLATION_PATHS = {
  en: './locales/en/translation.json',
  he: './locales/he/translation.json',
  ru: './locales/ru/translation.json',
} as const

// Supported Languages
export const SUPPORTED_LANGUAGES = ['en', 'he', 'ru'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

// Package Version and Metadata
export const PACKAGE_INFO = {
  name: '@bankimonline/shared',
  version: '1.0.0',
  description: 'Shared types, constants, utilities, and translations for BankIM Online',
} as const