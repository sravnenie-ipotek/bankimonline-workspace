// Mock for bankOffersApi to avoid import.meta.env issues in Jest tests

import type { BankOfferRequest, BankOffer, MortgageProgram } from '../../../services/bankOffersApi';

// Mock implementation of getApiBaseUrl without import.meta.env
const getApiBaseUrl = () => {
  // Use environment variable or fallback for tests
  return process.env.VITE_NODE_API_BASE_URL || '/api';
};

// Mock fetch bank offers function
export const fetchBankOffers = async (requestPayload: BankOfferRequest): Promise<BankOffer[]> => {
  const API_BASE = getApiBaseUrl();
  
  // Mock fetch for testing
  const response = await fetch(`${API_BASE}/customer/compare-banks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US',
    },
    body: JSON.stringify(requestPayload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data.data?.bank_offers || [];
};

// Mock fetch mortgage programs function
export const fetchMortgagePrograms = async (): Promise<MortgageProgram[]> => {
  const API_BASE = getApiBaseUrl();
  
  const response = await fetch(`${API_BASE}/customer/mortgage-programs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch programs: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data?.programs || [];
};

// Mock transform function
export const transformUserDataToRequest = (
  parameters: any,
  userPersonalData: any,
  userIncomeData: any,
  serviceType?: string,
  sessionId?: string,
  clientId?: string
): BankOfferRequest => {
  return {
    loan_type: serviceType === 'credit' ? 'credit' : 'mortgage',
    amount: parameters?.amount || 800000,
    property_value: parameters?.property_value || 1000000,
    monthly_income: userPersonalData?.monthlyIncome || 15000,
    birth_date: userPersonalData?.birthday,
    age: 35,
    employment_years: userIncomeData?.employmentYears || 5,
    property_ownership: parameters?.propertyOwnership || 'no_property',
    session_id: sessionId || 'test_session',
    client_id: clientId,
  };
};

// Export types for testing
export type { BankOfferRequest, BankOffer, MortgageProgram };