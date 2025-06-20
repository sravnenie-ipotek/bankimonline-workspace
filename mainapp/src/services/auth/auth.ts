import { api } from '@src/services/api.ts'

export const authApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    signInEmail: builder.mutation({
      query: (body) => ({
        url: '/login',
        method: 'POST',
        body,
      }),
    }),
    signInPhone: builder.mutation({
      query: (body) => ({
        url: '/phone-password-login',
        method: 'POST',
        body,
      }),
    }),
    signInName: builder.mutation({
      query: (body) => ({
        url: '/phone-login',
        method: 'POST',
        body,
      }),
    }),
    sendSmsCodeMobile: builder.mutation({
      query: (body) => ({
        url: '/phone-code-login',
        method: 'POST',
        body,
      }),
    }),
    sendSmsCodeEmail: builder.mutation({
      query: (body) => ({
        url: '/email-code-login',
        method: 'POST',
        body,
      }),
    }),
    signUp: builder.mutation({
      query: (body) => ({
        url: '/register',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useSignInEmailMutation,
  useSignInPhoneMutation,
  useSendSmsCodeMobileMutation,
  useSignUpMutation,
  useSendSmsCodeEmailMutation,
  useSignInNameMutation,
} = authApiSlice
