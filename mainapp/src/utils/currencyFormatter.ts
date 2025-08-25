/**
 * Currency formatting utilities (Bug #15)
 * Ensures consistent currency display across the application
 */

/**
 * Currency configuration for different locales
 */
const CURRENCY_CONFIG = {
  he: {
    locale: 'he-IL',
    currency: 'ILS',
    symbol: '₪',
    position: 'suffix', // ₪ comes after the number in Hebrew
  },
  en: {
    locale: 'en-US',
    currency: 'ILS',
    symbol: '₪',
    position: 'prefix',
  },
  ru: {
    locale: 'ru-RU',
    currency: 'ILS',
    symbol: '₪',
    position: 'suffix',
  },
} as const

/**
 * Format currency with proper locale and symbol
 * @param amount - The amount to format
 * @param language - The language code (he, en, ru)
 * @param options - Additional formatting options
 */
export const formatCurrency = (
  amount: number,
  language: string = 'he',
  options: {
    showSymbol?: boolean
    decimals?: number
    compact?: boolean
  } = {}
): string => {
  const {
    showSymbol = true,
    decimals = 0,
    compact = false
  } = options
  
  const config = CURRENCY_CONFIG[language as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.he
  
  // Handle compact notation for large numbers
  if (compact && amount >= 1000000) {
    const millions = amount / 1000000
    const formatted = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(millions)
    
    return showSymbol 
      ? config.position === 'prefix'
        ? `${config.symbol}${formatted}M`
        : `${formatted}M ${config.symbol}`
      : `${formatted}M`
  }
  
  // Standard formatting
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
  
  if (!showSymbol) {
    return formatted
  }
  
  // Apply symbol based on position
  return config.position === 'prefix'
    ? `${config.symbol}${formatted}`
    : `${formatted} ${config.symbol}`
}

/**
 * Parse currency string to number
 * @param value - The currency string to parse
 * @returns The numeric value
 */
export const parseCurrency = (value: string): number => {
  if (!value) return 0
  
  // Remove all non-numeric characters except decimal point and minus
  const cleaned = value.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format currency for input fields
 * @param value - The value to format
 * @param language - The language code
 * @returns Formatted string for input display
 */
export const formatCurrencyInput = (
  value: string | number,
  language: string = 'he'
): string => {
  const numValue = typeof value === 'string' ? parseCurrency(value) : value
  
  if (isNaN(numValue) || numValue === 0) {
    return ''
  }
  
  const config = CURRENCY_CONFIG[language as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.he
  
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue)
}

/**
 * Validate currency input
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validation result
 */
export const validateCurrencyInput = (
  value: string | number,
  min?: number,
  max?: number
): { valid: boolean; error?: string } => {
  const numValue = typeof value === 'string' ? parseCurrency(value) : value
  
  if (isNaN(numValue)) {
    return { valid: false, error: 'Invalid number' }
  }
  
  if (min !== undefined && numValue < min) {
    return { valid: false, error: `Minimum value is ${formatCurrency(min)}` }
  }
  
  if (max !== undefined && numValue > max) {
    return { valid: false, error: `Maximum value is ${formatCurrency(max)}` }
  }
  
  return { valid: true }
}

/**
 * Hook for currency formatting
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const useCurrencyFormatter = () => {
  const { i18n } = useTranslation()
  
  const format = useMemo(() => {
    return (amount: number, options?: Parameters<typeof formatCurrency>[2]) => 
      formatCurrency(amount, i18n.language, options)
  }, [i18n.language])
  
  const parse = useMemo(() => parseCurrency, [])
  
  const formatInput = useMemo(() => {
    return (value: string | number) => formatCurrencyInput(value, i18n.language)
  }, [i18n.language])
  
  return {
    format,
    parse,
    formatInput,
    validate: validateCurrencyInput,
    symbol: CURRENCY_CONFIG[i18n.language as keyof typeof CURRENCY_CONFIG]?.symbol || '₪',
  }
}