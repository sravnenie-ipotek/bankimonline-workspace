/**
 * Banking Calculation Utilities
 * Shared calculation functions for mortgage and credit operations
 */

import { BANKING_CONSTANTS, PROPERTY_OWNERSHIP } from '../constants/banking'
import type { PropertyOwnership, CalculationParams } from '../types/banking'

/**
 * Calculate age from birth date
 * @param birthDate - Birth date as string or number
 * @returns Age in years
 */
export const calculateAge = (birthDate: string | number): number => {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Calculate employment years from start date
 * @param startDate - Employment start date as string
 * @returns Years of employment (with decimal precision)
 */
export const calculateEmploymentYears = (startDate: string): number => {
  const start = new Date(startDate)
  const today = new Date()
  const diffTime = today.getTime() - start.getTime()
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
  
  return Math.round(diffYears * 10) / 10 // Round to 1 decimal place
}

/**
 * Get LTV ratio based on property ownership
 * @param propertyOwnership - Property ownership status
 * @returns LTV ratio as percentage
 */
export const getLTVRatio = (propertyOwnership: PropertyOwnership): number => {
  switch (propertyOwnership) {
    case PROPERTY_OWNERSHIP.NO_PROPERTY:
      return BANKING_CONSTANTS.LTV_RATIOS.NO_PROPERTY
    case PROPERTY_OWNERSHIP.HAS_PROPERTY:
      return BANKING_CONSTANTS.LTV_RATIOS.HAS_PROPERTY
    case PROPERTY_OWNERSHIP.SELLING_PROPERTY:
      return BANKING_CONSTANTS.LTV_RATIOS.SELLING_PROPERTY
    default:
      return BANKING_CONSTANTS.LTV_RATIOS.NO_PROPERTY
  }
}

/**
 * Calculate maximum loan amount based on property value and ownership
 * @param propertyValue - Property value in ILS
 * @param propertyOwnership - Property ownership status
 * @returns Maximum loan amount
 */
export const calculateMaxLoanAmount = (
  propertyValue: number,
  propertyOwnership: PropertyOwnership
): number => {
  const ltvRatio = getLTVRatio(propertyOwnership)
  return Math.floor(propertyValue * (ltvRatio / 100))
}

/**
 * Calculate minimum down payment
 * @param propertyValue - Property value in ILS
 * @param propertyOwnership - Property ownership status
 * @returns Minimum down payment amount
 */
export const calculateMinDownPayment = (
  propertyValue: number,
  propertyOwnership: PropertyOwnership
): number => {
  const ltvRatio = getLTVRatio(propertyOwnership)
  const downPaymentRatio = 100 - ltvRatio
  return Math.ceil(propertyValue * (downPaymentRatio / 100))
}

/**
 * Calculate monthly mortgage payment using standard formula
 * @param params - Calculation parameters
 * @returns Monthly payment amount
 */
export const calculateMonthlyPayment = (params: CalculationParams): number => {
  const { loan_amount, interest_rate, term_years } = params
  
  if (interest_rate === 0) {
    return loan_amount / (term_years * 12)
  }
  
  const monthlyRate = interest_rate / 100 / 12
  const numPayments = term_years * 12
  
  const monthlyPayment = loan_amount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  
  return Math.round(monthlyPayment)
}

/**
 * Calculate total payment over loan term
 * @param monthlyPayment - Monthly payment amount
 * @param termYears - Loan term in years
 * @returns Total payment amount
 */
export const calculateTotalPayment = (
  monthlyPayment: number,
  termYears: number
): number => {
  return monthlyPayment * termYears * 12
}

/**
 * Calculate debt-to-income ratio
 * @param monthlyPayment - Proposed monthly payment
 * @param monthlyIncome - Monthly income
 * @param existingDebts - Existing monthly debt payments
 * @returns DTI ratio as percentage
 */
export const calculateDTIRatio = (
  monthlyPayment: number,
  monthlyIncome: number,
  existingDebts: number = 0
): number => {
  const totalMonthlyDebt = monthlyPayment + existingDebts
  return Math.round((totalMonthlyDebt / monthlyIncome) * 100)
}

/**
 * Validate calculation parameters
 * @param params - Calculation parameters to validate
 * @returns Validation result with errors if any
 */
export const validateCalculationParams = (params: CalculationParams): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (params.loan_amount < BANKING_CONSTANTS.MIN_LOAN_AMOUNT) {
    errors.push(`Loan amount must be at least ${BANKING_CONSTANTS.MIN_LOAN_AMOUNT.toLocaleString()} ILS`)
  }
  
  if (params.loan_amount > BANKING_CONSTANTS.MAX_LOAN_AMOUNT) {
    errors.push(`Loan amount cannot exceed ${BANKING_CONSTANTS.MAX_LOAN_AMOUNT.toLocaleString()} ILS`)
  }
  
  if (params.term_years > BANKING_CONSTANTS.MAX_LOAN_TERM_YEARS) {
    errors.push(`Loan term cannot exceed ${BANKING_CONSTANTS.MAX_LOAN_TERM_YEARS} years`)
  }
  
  if (params.interest_rate < 0 || params.interest_rate > 20) {
    errors.push('Interest rate must be between 0% and 20%')
  }
  
  if (params.property_value <= 0) {
    errors.push('Property value must be greater than 0')
  }
  
  const maxLoanAmount = calculateMaxLoanAmount(params.property_value, params.property_ownership)
  if (params.loan_amount > maxLoanAmount) {
    errors.push(`Loan amount exceeds maximum allowed for property ownership type (${maxLoanAmount.toLocaleString()} ILS)`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}