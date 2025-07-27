// Bank Offers API Service
// Centralized API calls for bank offers and mortgage programs

import i18n from 'i18next'

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

export interface BankOffer {
  id: string
  bankName: string
  program: string
  rate: number
  monthlyPayment: number
  totalAmount: number
  mortgageAmount: number
  bank_id?: string
  bank_name?: string
  bank_logo?: string
  loan_amount?: number
  monthly_payment?: number
  interest_rate?: number
  term_years?: number
  total_payment?: number
  approval_status?: 'approved' | 'rejected' | 'pending'
  ltv_ratio?: number
  dti_ratio?: number
}

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

// Generate fallback bank offers when API is unavailable
export const generateFallbackOffers = (): BankOffer[] => {
  console.log('🔄 [FALLBACK-OFFERS] Generating fallback bank offers')
  
  const currentLanguage = i18n.language || 'en'
  
  // Bank names by language
  const bankNames = {
    en: ['Bank of Israel', 'Hapoalim Bank', 'Leumi Bank', 'Discount Bank', 'Mizrahi Bank', 'First International Bank'],
    he: ['בנק ישראל', 'בנק הפועלים', 'בנק לאומי', 'בנק דיסקונט', 'בנק מזרחי', 'הבנק הבינלאומי הראשון'],
    ru: ['Банк Израиля', 'Банк Апоалим', 'Банк Леуми', 'Банк Дисконт', 'Банк Мизрахи', 'Первый международный банк']
  }
  
  // Program names by language  
  const programNames = {
    en: ['Prime Rate Mortgage', 'Fixed Rate Mortgage', 'Variable Rate Mortgage', 'Premium Program', 'Young Family Program', 'First Home Program'],
    he: ['משכנתא בריבית פריים', 'משכנתא בריבית קבועה', 'משכנתא בריבית משתנה', 'תוכנית פרמיום', 'תוכנית משפחה צעירה', 'תוכנית דירה ראשונה'],
    ru: ['Ипотека по прайм-ставке', 'Ипотека с фиксированной ставкой', 'Ипотека с переменной ставкой', 'Премиум программа', 'Программа молодой семьи', 'Программа первого дома']
  }
  
  const selectedBankNames = bankNames[currentLanguage] || bankNames.en
  const selectedProgramNames = programNames[currentLanguage] || programNames.en
  
  // Generate 6 fallback offers
  const fallbackOffers: BankOffer[] = selectedBankNames.map((bankName, index) => {
    const baseAmount = 1000000 + (index * 200000) // 1M to 2M range
    const interestRate = 2.1 + (index * 0.3) // 2.1% to 3.9% range
    const termYears = 20 + (index * 2) // 20 to 30 years
    const monthlyPayments = 12 * termYears
    const monthlyPayment = Math.round((baseAmount * (interestRate / 100) / 12) * (Math.pow(1 + (interestRate / 100) / 12, monthlyPayments)) / (Math.pow(1 + (interestRate / 100) / 12, monthlyPayments) - 1))
    const totalAmount = monthlyPayment * monthlyPayments
    
    return {
      id: `fallback_${index + 1}`,
      bankName: bankName,
      program: selectedProgramNames[index],
      rate: parseFloat(interestRate.toFixed(2)),
      monthlyPayment: monthlyPayment,
      totalAmount: totalAmount,
      mortgageAmount: baseAmount,
      
      // Legacy API compatibility fields
      bank_id: `bank_${index + 1}`,
      bank_name: bankName,
      loan_amount: baseAmount,
      monthly_payment: monthlyPayment,
      interest_rate: parseFloat(interestRate.toFixed(2)),
      term_years: termYears,
      total_payment: totalAmount,
      approval_status: 'approved' as const,
      ltv_ratio: 75,
      dti_ratio: 30 + (index * 5)
    }
  })
  
  console.log('✅ [FALLBACK-OFFERS] Generated', fallbackOffers.length, 'fallback offers')
  return fallbackOffers
}

// Helper function to calculate age from birth date
const calculateAge = (birthDate: string | number): number => {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Get API base URL
const getApiBaseUrl = () => {
  return import.meta.env.VITE_NODE_API_BASE_URL || 
         (import.meta.env.PROD ? 
           'https://bankdev2standalone-production.up.railway.app/api' : 
           'http://localhost:8003/api')
}

// Fetch bank offers from API with improved error handling
export const fetchBankOffers = async (requestPayload?: BankOfferRequest): Promise<{success: boolean, data?: {offers: BankOffer[]}, error?: string}> => {
  const API_BASE = getApiBaseUrl()
  
  try {
    // Get current language for Accept-Language header
    const currentLanguage = i18n.language || 'en'
    const acceptLanguage = currentLanguage === 'he' ? 'he-IL' : 
                          currentLanguage === 'ru' ? 'ru-RU' : 
                          'en-US'
    
    console.log('🚀 [BANK-API] Making bank offers request:', requestPayload)
    console.log('🌍 [BANK-API] Using language:', currentLanguage, '→', acceptLanguage)
    
    const response = await fetch(`${API_BASE}/customer/compare-banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': acceptLanguage,
      },
      body: JSON.stringify(requestPayload || {}),
    })
    
    console.log('📡 [BANK-API] Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [BANK-API] Error:', response.status, errorText)
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`
      }
    }
    
    const data = await response.json()
    console.log('📦 [BANK-API] Response data:', data)
    
    return {
      success: true,
      data: {
        offers: data.data?.bank_offers || []
      }
    }
    
  } catch (error) {
    console.error('❌ [BANK-API] Network error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Fetch mortgage programs from API with improved error handling
export const fetchMortgagePrograms = async (): Promise<{success: boolean, data?: {programs: MortgageProgram[]}, error?: string}> => {
  try {
    const API_BASE = getApiBaseUrl()
    
    // Get current language for Accept-Language header
    const currentLanguage = i18n.language || 'en'
    const acceptLanguage = currentLanguage === 'he' ? 'he-IL' : 
                          currentLanguage === 'ru' ? 'ru-RU' : 
                          'en-US'
    
    const response = await fetch(`${API_BASE}/customer/mortgage-programs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': acceptLanguage,
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('📋 [MORTGAGE-PROGRAMS-API] Fetched programs:', data)
      return {
        success: true,
        data: {
          programs: data.data?.programs || []
        }
      }
    } else {
      console.warn('⚠️ [MORTGAGE-PROGRAMS-API] Failed to fetch programs')
      return {
        success: false,
        error: `Failed to fetch programs: ${response.status}`
      }
    }
  } catch (error) {
    console.error('❌ [MORTGAGE-PROGRAMS-API] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Transform user data to API request format (Database-Driven, No Hardcoded Values)
export const transformUserDataToRequest = (
  parameters: any,
  userPersonalData: any,
  userIncomeData: any,
  serviceType?: string,
  sessionId?: string,
  clientId?: string
): BankOfferRequest => {
  const isCredit = serviceType === 'credit'
  
  // Generate session ID if not provided
  const currentSessionId = sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Debug logging
  console.log('🔍 [TRANSFORM-DATA] Service Type:', serviceType, 'Is Credit:', isCredit)
  console.log('🔍 [TRANSFORM-DATA] Parameters:', parameters)
  console.log('🔍 [TRANSFORM-DATA] User Personal Data:', userPersonalData)
  console.log('🔍 [TRANSFORM-DATA] User Income Data:', userIncomeData)
  
  // Calculate age from birthday if available
  let calculatedAge: number | undefined = undefined
  if (userPersonalData?.birthday) {
    const birthDate = new Date(userPersonalData.birthday)
    // Validate that birthDate is a valid date
    if (!isNaN(birthDate.getTime())) {
      const today = new Date()
      calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      // Ensure age is reasonable (between 18 and 100)
      if (calculatedAge < 18 || calculatedAge > 100) {
        calculatedAge = undefined
      }
    }
  }
  
  // Ensure we have required monthly_income - check multiple possible sources
  // For credit flow, userPersonalData contains the FormTypes with monthlyIncome
  // For mortgage flow, userIncomeData contains the income information
  const monthlyIncome = userPersonalData?.monthlyIncome || 
                       userIncomeData?.monthlyIncome || 
                       parameters?.monthlyIncome ||
                       0 // No fallback - should be provided by user
  
  console.log('💰 [TRANSFORM-DATA] Monthly Income Sources:')
  console.log('   userPersonalData.monthlyIncome:', userPersonalData?.monthlyIncome)
  console.log('   userIncomeData.monthlyIncome:', userIncomeData?.monthlyIncome)
  console.log('   parameters.monthlyIncome:', parameters?.monthlyIncome)
  console.log('   Final monthlyIncome:', monthlyIncome)
  
  const requestPayload = {
    loan_type: isCredit ? 'credit' : 'mortgage',
    amount: isCredit 
      ? parameters.loanAmount 
      : (parameters.priceOfEstate && parameters.initialFee 
          ? parameters.priceOfEstate - parameters.initialFee 
          : parameters.priceOfEstate * 0.5), // Default 50% loan if no initial fee - should be calculated based on property ownership LTV
    property_value: isCredit ? 0 : (parameters.priceOfEstate || 0), // No default - should be provided by user
    monthly_income: monthlyIncome,
    
    // Use real birth date and employment start date for calculation
    birth_date: userPersonalData?.birthday,
    employment_start_date: userIncomeData?.startDate,
    
    // Provide fallback age if birth_date not available
    age: calculatedAge || 35, // Reasonable fallback for loan calculations
    employment_years: userIncomeData?.employmentYears || 0, // No fallback - should be provided by user
    
    // Property ownership for LTV calculation (Confluence Action #12)
    property_ownership: parameters.propertyOwnership || 'no_property', // Default to 75% financing
    
    // Session and client management
    session_id: currentSessionId,
    client_id: clientId,
    
    // Remove hardcoded values - let backend calculate from database
    // credit_score: Will be fetched from client_credit_history table if client_id provided
    // monthly_expenses: Will be calculated from client_debts table if client_id provided
    
    // Additional real user data with fallbacks
    education: userPersonalData?.education,
    citizenship: userPersonalData?.citizenship,
    marital_status: userPersonalData?.familyStatus,
    children_count: userPersonalData?.childrens === 'yes' ? userPersonalData?.childrenCount || 1 : 0,
    property_city: parameters?.cityWhereYouBuy,
    property_type: isCredit ? undefined : parameters?.typeSelect,
    is_first_apartment: isCredit ? false : (parameters?.willBeYourFirst === '1'),
    has_medical_insurance: userPersonalData?.medicalInsurance === 'yes',
    is_foreigner: userPersonalData?.isForeigner === 'yes',
    is_public_figure: userPersonalData?.publicPerson === 'yes'
  }
  
  console.log('🚀 [TRANSFORM-DATA] Final Request Payload:', requestPayload)
  console.log('🚀 [TRANSFORM-DATA] Critical Fields Check:')
  console.log('   loan_type:', requestPayload.loan_type, '(should not be empty)')
  console.log('   amount:', requestPayload.amount, '(should be > 0)')
  console.log('   monthly_income:', requestPayload.monthly_income, '(should be > 0)')
  console.log('   age:', requestPayload.age, '(should be > 0)')
  console.log('   property_ownership:', requestPayload.property_ownership, '(should not be empty)')
  
  return requestPayload
}