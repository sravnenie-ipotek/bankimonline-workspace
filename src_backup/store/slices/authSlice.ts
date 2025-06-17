import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@src/store'

import { EAuthSteps } from '../../../types/enums/authSteps.enum.ts'
import { ERestorePasswordSteps } from '../../../types/enums/restorePasswordSteps.enum.ts'
import { ESignUpSteps } from '../../../types/enums/signUpSteps.enum.ts'

export type Tab = 'phone' | 'email'

interface IAuthState {
  authStep: EAuthSteps
  restorePasswordStep: ERestorePasswordSteps
  signUpStep: ESignUpSteps
  activeTab: Tab
}

const initialState: IAuthState = {
  authStep: EAuthSteps.Auth,
  restorePasswordStep: ERestorePasswordSteps.TypeVerify,
  signUpStep: ESignUpSteps.SignUp,
  activeTab: 'phone',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthSteps: (state, action: PayloadAction<EAuthSteps>) => {
      state.authStep = action.payload
    },
    setRestorePasswordSteps: (
      state,
      action: PayloadAction<ERestorePasswordSteps>
    ) => {
      state.restorePasswordStep = action.payload
    },
    setSignUpSteps: (state, action: PayloadAction<ESignUpSteps>) => {
      state.signUpStep = action.payload
    },
    setActiveTab: (state, action: PayloadAction<Tab>) => {
      state.activeTab = action.payload
    },
  },
})

export const {
  setAuthSteps,
  setRestorePasswordSteps,
  setSignUpSteps,
  setActiveTab,
} = authSlice.actions
export const authStepSelector = (state: RootState) => state.auth.authStep
export const restorePasswordStepSelector = (state: RootState) =>
  state.auth.restorePasswordStep
export const signUpStepSelector = (state: RootState) => state.auth.signUpStep
export const activeTabSelector = (state: RootState) => state.auth.activeTab

export default authSlice.reducer
