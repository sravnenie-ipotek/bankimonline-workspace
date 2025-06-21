import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // For Node.js API endpoints (refinance services)
  if (import.meta.env.VITE_NODE_API_BASE_URL) {
    return import.meta.env.VITE_NODE_API_BASE_URL
  }
  
  // Always use Railway production URL since we're deploying to Railway
  // In development, the server runs on Railway too, so we use the same URL
  return 'https://bankdev2standalone-production.up.railway.app/api'
}

export const api = createApi({
  reducerPath: 'api', // optional
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
  }),
  tagTypes: [],
  endpoints: (builder) => ({}),
})
