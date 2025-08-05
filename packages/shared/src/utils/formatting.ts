/**
 * Formatting Utilities
 * Shared formatting functions for currency, dates, and numbers
 */

import { CURRENCY } from '../constants/banking'

/**
 * Format currency amount for display
 * @param amount - Amount to format
 * @param currency - Currency code (default: ILS)
 * @param locale - Locale for formatting (default: he-IL)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: 'ILS' | 'USD' | 'EUR' = 'ILS',
  locale?: string
): string => {
  const currencyInfo = CURRENCY[currency]
  const formatLocale = locale || currencyInfo.locale
  
  return new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency: currencyInfo.code,
  }).format(amount)
}

/**
 * Format number with thousands separators
 * @param num - Number to format
 * @param locale - Locale for formatting (default: he-IL)
 * @returns Formatted number string
 */
export const formatNumber = (num: number, locale: string = 'he-IL'): string => {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Format percentage with specified decimal places
 * @param value - Value to format as percentage
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Locale for formatting (default: he-IL)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2,
  locale: string = 'he-IL'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Format date for display
 * @param date - Date to format
 * @param locale - Locale for formatting (default: he-IL)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'he-IL',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

/**
 * Format phone number for display
 * @param phone - Phone number string
 * @param countryCode - Country code for formatting (default: IL)
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (
  phone: string,
  countryCode: string = 'IL'
): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  if (countryCode === 'IL') {
    // Israeli phone number formatting
    if (cleaned.startsWith('972')) {
      // International format
      const national = cleaned.substring(3)
      if (national.length === 9) {
        return `+972-${national.substring(0, 2)}-${national.substring(2, 5)}-${national.substring(5)}`
      }
    } else if (cleaned.length === 10) {
      // National format
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
    }
  }
  
  // Return original if no formatting rule matches
  return phone
}

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  )
}

/**
 * Generate initials from full name
 * @param fullName - Full name string
 * @param maxInitials - Maximum number of initials (default: 2)
 * @returns Initials string
 */
export const getInitials = (fullName: string, maxInitials: number = 2): string => {
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, maxInitials)
    .join('')
}