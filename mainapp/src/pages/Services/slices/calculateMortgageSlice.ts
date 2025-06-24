import { createSlice } from '@reduxjs/toolkit'

import { CalculateMortgageTypes, FormTypes } from '../types/formTypes'

type BankOfferType = {
  id: string
  bankName: string
  program: string
  rate: number
  monthlyPayment: number
  totalAmount: number
  mortgageAmount: number
}

type IncomeDataType = {
  monthlyIncome?: number
  employmentYears?: number
  monthlyExpenses?: number
}

type CalculateMortgageState = CalculateMortgageTypes & FormTypes & {
  selectedBank?: BankOfferType
  selectedBankId?: string
  selectedBankName?: string
  incomeData?: IncomeDataType
}

export const calculateMortgageSlice = createSlice({
  name: 'mortgage',
  initialState: {
    incomeData: {}
  } as unknown as CalculateMortgageState,
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
    updateIncomeData: (state, action) => {
      state.incomeData = {
        ...state.incomeData,
        ...action.payload,
      }
    },
  },
})

export const { updateMortgageData, updateIncomeData } = calculateMortgageSlice.actions

export default calculateMortgageSlice.reducer
