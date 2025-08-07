import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // Check if we're running on localhost (development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8003/api'
  }
  
  // In production, use environment variable or fallback to production API
  return import.meta.env.VITE_NODE_API_BASE_URL || 'https://bankimonline.com/api'
}

export const api = createApi({
  reducerPath: 'api', // optional
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
  }),
  tagTypes: [],
  endpoints: (builder) => ({}),
})
