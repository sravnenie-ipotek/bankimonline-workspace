/**
 * Fallback configuration values for when database or API is unavailable
 * These values are based on Israeli banking standards
 */

/**
 * Property ownership LTV (Loan-to-Value) ratios
 * These are critical business rules for mortgage calculations
 */
export const FALLBACK_LTV_RATIOS = {
  no_property: 0.75,      // 75% financing for first-time buyers
  has_property: 0.50,     // 50% financing for those who own property
  selling_property: 0.70  // 70% financing for those selling property
} as const

/**
 * Default calculation parameters
 */
export const FALLBACK_CALCULATION_PARAMS = {
  current_interest_rate: 5.0,  // 5% default interest rate
  min_loan_amount: 100000,     // Minimum loan ₪100,000
  max_loan_amount: 5000000,    // Maximum loan ₪5,000,000
  min_period_years: 4,          // Minimum 4 years
  max_period_years: 30,         // Maximum 30 years
  min_monthly_payment: 2654     // Minimum monthly payment ₪2,654
} as const

/**
 * City list fallback (major Israeli cities)
 */
export const FALLBACK_CITIES = [
  { value: 'tel_aviv', label: 'תל אביב' },
  { value: 'jerusalem', label: 'ירושלים' },
  { value: 'haifa', label: 'חיפה' },
  { value: 'beer_sheva', label: 'באר שבע' },
  { value: 'rishon_lezion', label: 'ראשון לציון' },
  { value: 'petah_tikva', label: 'פתח תקווה' },
  { value: 'ashdod', label: 'אשדוד' },
  { value: 'netanya', label: 'נתניה' },
  { value: 'holon', label: 'חולון' },
  { value: 'bnei_brak', label: 'בני ברק' }
] as const

/**
 * Dropdown fallback options
 */
export const FALLBACK_DROPDOWNS = {
  when_needed: [
    { value: 'immediately', label: 'מיידי' },
    { value: 'within_month', label: 'תוך חודש' },
    { value: 'within_3_months', label: 'תוך 3 חודשים' },
    { value: 'within_6_months', label: 'תוך 6 חודשים' }
  ],
  type: [
    { value: 'apartment', label: 'דירה' },
    { value: 'house', label: 'בית פרטי' },
    { value: 'penthouse', label: 'פנטהאוז' },
    { value: 'land', label: 'קרקע' }
  ],
  first_home: [
    { value: 'yes', label: 'כן' },
    { value: 'no', label: 'לא' }
  ]
} as const

/**
 * Retry configuration for API calls
 */
export const API_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,    // Start with 1 second
  maxRetryDelay: 5000, // Max 5 seconds
  backoffMultiplier: 2 // Exponential backoff
} as const

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  ttl: 300000,          // 5 minutes in milliseconds
  checkperiod: 60000,   // Check for expired cache every minute
  maxKeys: 100          // Maximum number of cache keys
} as const