import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import refinanceMortgage from '../pages/RefinanceMortgage/api/refinanceMortgage'
import { FormTypes, RefinanceMortgageTypes } from '../types/formTypes'

type RefinanceMortgage = RefinanceMortgageTypes & FormTypes
export const fetchRefinanceMortgage = createAsyncThunk(
  'refinanceMortgage/fetchRefinanceMortgage',
  async (params: {
    target: string
    amount_left: number | null
    full_amount: number | null
    estate_type: string
    bank_id: string
    programs: {
      id: number
      program_id: string
      amount_left: number
      end_date: number
      bid: number
    }
  }) => {
    return await refinanceMortgage(params)
  }
)

export const refinanceMortgageSlice = createSlice({
  name: 'refinanceMortgage',
  initialState: {} as RefinanceMortgage,
  reducers: {
    updateRefinanceMortgageData: (state, action) => {
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
  extraReducers: (builder) => {
    builder.addCase(fetchRefinanceMortgage.fulfilled, (state, action) => {
      state = action.payload.data.percent
    })
  },
})

export const { updateRefinanceMortgageData } = refinanceMortgageSlice.actions

export default refinanceMortgageSlice.reducer
