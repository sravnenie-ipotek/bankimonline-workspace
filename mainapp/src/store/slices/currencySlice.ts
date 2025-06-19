import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Currency = 'ILS' | 'USD' | 'EUR';

interface CurrencyState {
  currency: Currency;
}

const initialState: CurrencyState = {
  currency: 'ILS', // Default currency
}

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<Currency>) {
      state.currency = action.payload;
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer; 