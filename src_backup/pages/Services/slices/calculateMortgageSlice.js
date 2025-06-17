import { createSlice } from '@reduxjs/toolkit';
export const calculateMortgageSlice = createSlice({
    name: 'mortgage',
    initialState: {},
    reducers: {
        updateMortgageData: (state, action) => {
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
});
export const { updateMortgageData } = calculateMortgageSlice.actions;
export default calculateMortgageSlice.reducer;
