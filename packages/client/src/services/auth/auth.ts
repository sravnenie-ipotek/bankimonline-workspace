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
        url: '/auth-password',
        method: 'POST',
        body,
      }),
    }),
    signInName: builder.mutation({
      query: (body) => ({
        url: '/auth-mobile',
        method: 'POST',
        body,
      }),
    }),
    sendSmsCodeMobile: builder.mutation({
      query: (body) => ({
        url: '/auth-verify',
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
