import { createSlice } from '@reduxjs/toolkit';
const calculateCreditSlice = createSlice({
    name: 'credit',
    initialState: {},
    reducers: {
        updateCreditData: (state, action) => {
            return {
                ...state,
                ...action.payload,
            };
        },
    },
});
export const { updateCreditData } = calculateCreditSlice.actions;
export default calculateCreditSlice.reducer;
