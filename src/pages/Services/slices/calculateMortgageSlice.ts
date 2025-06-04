import { createSlice } from '@reduxjs/toolkit'

import { CalculateMortgageTypes, FormTypes } from '../types/formTypes'

type CalculateMortgageState = CalculateMortgageTypes & FormTypes

export const calculateMortgageSlice = createSlice({
  name: 'mortgage',
  initialState: {} as unknown as CalculateMortgageState,
  reducers: {
    updateMortgageData: (state, action) => {
      const newValues = { ...action.payload }

      if (newValues.additionalIncome === 'no') {
        delete newValues.additionalIncomeAmount
      }

      if (newValues.obligation === 'no') {
        delete newValues.bank
        delete newValues.monthlyPaymentForAnotherBank
        delete newValues.endDate
      }

      return {
        ...state,
        ...newValues,
      }
    },
  },
})

export const { updateMortgageData } = calculateMortgageSlice.actions

export default calculateMortgageSlice.reducer
