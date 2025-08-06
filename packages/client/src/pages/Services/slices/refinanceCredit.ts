import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import refinanceCredit from '../pages/RefinanceCredit/api/refinanceCredit'
import { FormTypes, RefinanceCreditTypes } from '../types/formTypes'

type RefinanceCreditState = RefinanceCreditTypes & FormTypes

export const fetchRefinanceCredit = createAsyncThunk(
  'refinanceCredit/fetchRefinanceCredit',
  async (params: { data: RefinanceCreditTypes }) => {
    // Transform the data to match the backend API expectations
    // Only send loans_data as that's what the backend actually uses in calculations
    const transformedData = {
      loans_data: params.data.creditData.map(credit => ({
        id: credit.id,
        bank: credit.bank,
        amount: credit.amount,
        monthly_payment: credit.monthlyPayment,
        start_date: credit.startDate,
        end_date: credit.endDate,
        early_repayment: credit.earlyRepayment,
      })),
      // Include original form data for reference
      refinancing_goal: params.data.refinancingCredit,
      desired_monthly_payment: params.data.desiredMonthlyPayment,
      desired_term: params.data.desiredTerm,
    }
    
    return await refinanceCredit(transformedData)
  }
)

export const refinanceCreditSlice = createSlice({
  name: 'refinanceCredit',
  initialState: {} as RefinanceCreditState,
  reducers: {
    updateRefinanceCreditData: (state, action) => {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRefinanceCredit.fulfilled, (state, action) => {
      state = action.payload.data.percent
    })
  },
})

export const { updateRefinanceCreditData } = refinanceCreditSlice.actions

export default refinanceCreditSlice.reducer
