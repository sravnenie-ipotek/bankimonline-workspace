import { createSlice } from '@reduxjs/toolkit'

// Filter types based on the requirements
export type MortgageFilterType = 'all' | 'prime' | 'fixed' | 'variable'

interface FilterState {
  mortgageType: MortgageFilterType
}

const initialState: FilterState = {
  mortgageType: 'all', // Default to showing all programs
}

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      // Support both string (legacy) and new filter structure
      if (typeof action.payload === 'string') {
        // Map old filter values to new structure
        switch (action.payload) {
          case 'filter_1':
            state.mortgageType = 'all'
            break
          case 'filter_2':
            state.mortgageType = 'prime'
            break
          case 'filter_3':
            state.mortgageType = 'fixed'
            break
          case 'filter_4':
            state.mortgageType = 'variable'
            break
          default:
            state.mortgageType = 'all'
        }
      } else {
        state.mortgageType = action.payload.mortgageType || 'all'
      }
    },
    setMortgageTypeFilter: (state, action) => {
      state.mortgageType = action.payload
    },
  },
})

export const { setFilter, setMortgageTypeFilter } = filterSlice.actions

export default filterSlice.reducer
