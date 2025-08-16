import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // In development, use relative path to leverage Vite proxy
  if (import.meta.env.DEV) {
    return '/api'
  }
  
  // In production, use environment variable or fallback to relative API path
  return import.meta.env.VITE_NODE_API_BASE_URL || '/api'
}

export const api = createApi({
  reducerPath: 'api', // optional
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
  }),
  tagTypes: [],
  endpoints: (builder) => ({}),
})
