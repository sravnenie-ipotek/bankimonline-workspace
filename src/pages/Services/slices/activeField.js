import { createSlice } from '@reduxjs/toolkit';
export const activeField = createSlice({
    name: 'activeField',
    initialState: '',
    reducers: {
        setActiveField: (state, action) => {
            return (state = action.payload);
        },
    },
});
export const { setActiveField } = activeField.actions;
export default activeField.reducer;
