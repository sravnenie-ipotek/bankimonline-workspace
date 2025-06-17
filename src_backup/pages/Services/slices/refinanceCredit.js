import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import refinanceCredit from '../pages/RefinanceCredit/api/refinanceCredit';
export const fetchRefinanceCredit = createAsyncThunk('refinanceCredit/fetchRefinanceCredit', async (params) => {
    return await refinanceCredit(params);
});
export const refinanceCreditSlice = createSlice({
    name: 'refinanceCredit',
    initialState: {},
    reducers: {
        updateRefinanceCreditData: (state, action) => {
            return {
                ...state,
                ...action.payload,
            };
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchRefinanceCredit.fulfilled, (state, action) => {
            state = action.payload.data.percent;
        });
    },
});
export const { updateRefinanceCreditData } = refinanceCreditSlice.actions;
export default refinanceCreditSlice.reducer;
