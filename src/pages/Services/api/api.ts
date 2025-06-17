import i18next from 'i18next'

import { api } from '@src/services/api.ts'

export const servicesApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query({
      query: () => `/get-cities?lang=${i18next.language}`,
    }),
  }),
})

export const { useGetCitiesQuery } = servicesApiSlice
