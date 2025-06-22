import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // In production, prioritize environment variables
  if (import.meta.env.PROD) {
    // Use environment variable if available, otherwise fallback to Railway production
    return import.meta.env.VITE_NODE_API_BASE_URL || 'https://bankdev2standalone-production.up.railway.app/api'
  }
  
  // In development, use environment variable or localhost
  return import.meta.env.VITE_NODE_API_BASE_URL || 'http://localhost:8003/api'
}

export const api = createApi({
  reducerPath: 'api', // optional
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
  }),
  tagTypes: [],
  endpoints: (builder) => ({}),
})
