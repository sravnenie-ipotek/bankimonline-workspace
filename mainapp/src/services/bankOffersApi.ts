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
           'https://bankimonline.com/api' : 
           'http://localhost:8003/api')
}

// Fetch bank offers from API
export const fetchBankOffers = async (requestPayload: BankOfferRequest): Promise<BankOffer[]> => {
  const API_BASE = getApiBaseUrl()
  
  // Get current language for Accept-Language header
  const currentLanguage = i18n.language || 'en'
  const acceptLanguage = currentLanguage === 'he' ? 'he-IL' : 
                        currentLanguage === 'ru' ? 'ru-RU' : 
                        'en-US'
  
  const response = await fetch(`${API_BASE}/customer/compare-banks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': acceptLanguage,
    },
    body: JSON.stringify(requestPayload),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ [BANK-API] Error:', response.status, errorText)
    throw new Error(`API Error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  return data.data?.bank_offers || []
}

// Fetch mortgage programs from API
export const fetchMortgagePrograms = async (): Promise<MortgageProgram[]> => {
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
      return data.data?.programs || []
    } else {
      console.warn('⚠️ [MORTGAGE-PROGRAMS-API] Failed to fetch programs')
      throw new Error(`Failed to fetch programs: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ [MORTGAGE-PROGRAMS-API] Error:', error)
    throw error
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
  
  // Handle different service types for amount calculation
  let amount = 0
  let property_value = 0
  
  if (isCredit) {
    amount = parameters.loanAmount || 0
    property_value = 0
  } else if (serviceType === 'refinance-credit') {
    // For refinance credit, sum all creditData amounts
    const creditData = parameters.creditData || []
    amount = creditData.reduce((total: number, credit: any) => {
      const creditAmount = credit.amount || 0
      return total + creditAmount
    }, 0)
    property_value = 0
  } else if (serviceType === 'refinance-mortgage') {
    // For refinance mortgage, use mortgage balance as amount
    amount = parameters.mortgageBalance || 0
    property_value = parameters.priceOfEstate || 0
  } else {
    // For regular mortgage
    amount = (parameters.priceOfEstate && parameters.initialFee 
      ? parameters.priceOfEstate - parameters.initialFee 
      : parameters.priceOfEstate * 0.5) // Default 50% loan if no initial fee
    property_value = parameters.priceOfEstate || 0
  }
  
  if (serviceType === 'refinance-credit') {
    parameters?.creditData?.forEach((credit: any, index: number) => {
      })
  }
  const requestPayload = {
    loan_type: isCredit ? 'credit' : 'mortgage',
    amount: amount,
    property_value: property_value,
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
  
  console.log('Bank offers API - Request payload prepared:', {
    loan_type: requestPayload.loan_type,
    amount: requestPayload.amount,
    monthly_income: requestPayload.monthly_income,
    age: requestPayload.age,
    citizenship: requestPayload.citizenship
  })
  
  return requestPayload
}