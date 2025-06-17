import { createSlice } from '@reduxjs/toolkit'

import { CalculateCreditTypes, FormTypes } from '../types/formTypes'

type CalculateCreditState = CalculateCreditTypes & FormTypes

const calculateCreditSlice = createSlice({
  name: 'credit',
  initialState: {} as unknown as CalculateCreditState,
  reducers: {
    updateCreditData: (state, action) => {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
})

export const { updateCreditData } = calculateCreditSlice.actions

export default calculateCreditSlice.reducer
