import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api', // optional
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8003/api',
  }),
  tagTypes: [],
  endpoints: (builder) => ({}),
})
