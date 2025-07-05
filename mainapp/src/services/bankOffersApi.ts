// Bank Offers API Service
// Centralized API calls for bank offers and mortgage programs

export interface BankOfferRequest {
  loan_type: string
  amount: number
  property_value: number
  monthly_income: number
  age: number
  credit_score: number
  employment_years: number
  monthly_expenses: number
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

// Get API base URL
const getApiBaseUrl = () => {
  return import.meta.env.VITE_NODE_API_BASE_URL || 
         (import.meta.env.PROD ? 
           'https://bankdev2standalone-production.up.railway.app/api' : 
           'http://localhost:8003/api')
}

// Fetch bank offers from API
export const fetchBankOffers = async (requestPayload: BankOfferRequest): Promise<BankOffer[]> => {
  const API_BASE = getApiBaseUrl()
  
  console.log('🚀 [BANK-API] Making bank offers request:', requestPayload)
  
  const response = await fetch(`${API_BASE}/customer/compare-banks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  })
  
  console.log('📡 [BANK-API] Response status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ [BANK-API] Error:', response.status, errorText)
    throw new Error(`API Error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  console.log('📦 [BANK-API] Response data:', data)
  
  return data.data?.bank_offers || []
}

// Fetch mortgage programs from API
export const fetchMortgagePrograms = async (): Promise<MortgageProgram[]> => {
  try {
    const API_BASE = getApiBaseUrl()
    
    const response = await fetch(`${API_BASE}/customer/mortgage-programs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('📋 [MORTGAGE-PROGRAMS-API] Fetched programs:', data)
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

// Helper function to calculate age from birth date
export const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 35 // fallback
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Transform user data to API request format
export const transformUserDataToRequest = (
  parameters: any,
  userPersonalData: any,
  userIncomeData: any,
  serviceType?: string
): BankOfferRequest => {
  const isCredit = serviceType === 'credit'
  
  return {
    loan_type: isCredit ? 'credit' : 'mortgage',
    amount: isCredit ? parameters.loanAmount || 100000 : (parameters.priceOfEstate - parameters.initialFee || 496645),
    property_value: isCredit ? 0 : (parameters.priceOfEstate || 1000000),
    monthly_income: userIncomeData?.monthlyIncome || userPersonalData.monthlyIncome || 25000,
    age: userPersonalData.birthDate ? calculateAge(userPersonalData.birthDate) : 35,
    credit_score: 750, // This would come from credit check API
    employment_years: userIncomeData?.employmentYears || 5,
    monthly_expenses: userIncomeData?.monthlyExpenses || 8000,
    // Additional real user data
    education: userPersonalData.education,
    citizenship: userPersonalData.citizenship,
    marital_status: userPersonalData.familyStatus,
    children_count: userPersonalData.childrens === 'yes' ? userPersonalData.childrenCount || 1 : 0,
    property_city: isCredit ? parameters.city : parameters.city,
    property_type: isCredit ? undefined : parameters.typeOfEstate,
    is_first_apartment: isCredit ? false : (parameters.firstApartment === 'yes'),
    has_medical_insurance: userPersonalData.medicalInsurance === 'yes',
    is_foreigner: userPersonalData.isForeigner === 'yes',
    is_public_figure: userPersonalData.isPublic === 'yes'
  }
}