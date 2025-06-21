import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // For Node.js API endpoints (refinance services)
  if (import.meta.env.VITE_NODE_API_BASE_URL) {
    return import.meta.env.VITE_NODE_API_BASE_URL
  }
  
  // Always use Railway backend in production, localhost for development
  return import.meta.env.MODE === 'production' 
    ? 'https://bankim-nodejs-api-production.up.railway.app/api' 
    : 'http://localhost:8003/api'
}

export const api = createApi({
  reducerPath: 'api', // optional
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
  }),
  tagTypes: [],
  endpoints: (builder) => ({}),
})
