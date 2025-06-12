import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // For Node.js API endpoints (refinance services)
  if (process.env.VITE_NODE_API_BASE_URL) {
    return process.env.VITE_NODE_API_BASE_URL
  }
  // Fallback to localhost for development
  return 'http://localhost:8003/api'
}

export const api = createApi({
  reducerPath: 'api', // optional
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
  }),
  tagTypes: [],
  endpoints: (builder) => ({}),
})
