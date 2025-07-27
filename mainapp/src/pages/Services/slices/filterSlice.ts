import { createSlice } from '@reduxjs/toolkit'

export interface FilterState {
  mortgageType: string
}

const initialState: FilterState = {
  mortgageType: 'all' // Default to show all mortgage programs
}

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.mortgageType = action.payload
    },
    resetFilter: (state) => {
      state.mortgageType = 'all'
    }
  },
})

export const { setFilter, resetFilter } = filterSlice.actions

export default filterSlice.reducer
