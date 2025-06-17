import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import refinanceMortgage from '../pages/RefinanceMortgage/api/refinanceMortgage';
export const fetchRefinanceMortgage = createAsyncThunk('refinanceMortgage/fetchRefinanceMortgage', async (params) => {
    return await refinanceMortgage(params);
});
export const refinanceMortgageSlice = createSlice({
    name: 'refinanceMortgage',
    initialState: {},
    reducers: {
        updateRefinanceMortgageData: (state, action) => {
            const newValues = { ...action.payload };
            if (newValues.additionalIncome === 'no') {
                delete newValues.additionalIncomeAmount;
            }
            if (newValues.obligation === 'no') {
                delete newValues.bank;
                delete newValues.monthlyPaymentForAnotherBank;
                delete newValues.endDate;
            }
            return {
                ...state,
                ...newValues,
            };
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchRefinanceMortgage.fulfilled, (state, action) => {
            state = action.payload.data.percent;
        });
    },
});
export const { updateRefinanceMortgageData } = refinanceMortgageSlice.actions;
export default refinanceMortgageSlice.reducer;
