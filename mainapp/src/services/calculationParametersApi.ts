import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // In development, use relative path to leverage Vite proxy
  if (import.meta.env.DEV) {
    return '/api'
  
  // In production, use environment variable or fallback to production
  return import.meta.env.VITE_NODE_API_BASE_URL || 'https://bankimonline.com/api'
}

// Type definitions for calculation parameters
export interface CalculationStandard {
  value: number
  type: 'percentage' | 'ratio' | 'amount' | 'years' | 'score'
  description: string
}

export interface PropertyOwnershipLtv {
  ltv: number
  min_down_payment: number
}

export interface CalculationParametersResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    business_path: string
    current_interest_rate: number
    property_ownership_ltvs: Record<string, PropertyOwnershipLtv>
    standards: Record<string, Record<string, CalculationStandard>>
    last_updated: string
    is_fallback?: boolean
  }
}

export const calculationParametersApi = createApi({
  reducerPath: 'calculationParametersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
  }),
  tagTypes: ['CalculationParameters'],
  endpoints: (builder) => ({
    getCalculationParameters: builder.query<CalculationParametersResponse, {
      business_path?: 'mortgage' | 'credit' | 'mortgage_refinance' | 'credit_refinance'
    }>({
      query: ({ business_path = 'mortgage' }) => ({
        url: `/v1/calculation-parameters?business_path=${business_path}`,
        method: 'GET',
      }),
      providesTags: ['CalculationParameters'],
      // Cache for 5 minutes (parameters don't change frequently)
      keepUnusedDataFor: 300,
    }),
  }),
})

export const { useGetCalculationParametersQuery, useLazyGetCalculationParametersQuery } = calculationParametersApi

// Helper function to extract specific parameter value
export const getParameterValue = (
  data: CalculationParametersResponse['data'] | undefined,
  category: string,
  name: string,
  fallback: number
): number => {
  if (!data?.standards?.[category]?.[name]) {
    console.warn(`Parameter ${category}.${name} not found, using fallback: ${fallback}`)
    return fallback
  }
  return data.standards[category][name].value
}

// Helper function to get property ownership LTV
export const getPropertyOwnershipLtv = (
  data: CalculationParametersResponse['data'] | undefined,
  ownership: string,
  fallback: number
): number => {
  if (!data?.property_ownership_ltvs?.[ownership]) {
    console.warn(`Property ownership LTV for ${ownership} not found, using fallback: ${fallback}`)
    return fallback
  }
  return data.property_ownership_ltvs[ownership].ltv
}

// Helper function to get current interest rate
export const getCurrentInterestRate = (
  data: CalculationParametersResponse['data'] | undefined,
  fallback: number = 5.0
): number => {
  if (!data?.current_interest_rate) {
    console.warn(`Current interest rate not found, using fallback: ${fallback}`)
    return fallback
  }
  return data.current_interest_rate
}