import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import refinanceCredit from '../pages/RefinanceCredit/api/refinanceCredit'
import { FormTypes, RefinanceCreditTypes } from '../types/formTypes'

type RefinanceCreditState = RefinanceCreditTypes & FormTypes

export const fetchRefinanceCredit = createAsyncThunk(
  'refinanceCredit/fetchRefinanceCredit',
  async (params: { data: RefinanceCreditTypes }) => {
    return await refinanceCredit(params)
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
