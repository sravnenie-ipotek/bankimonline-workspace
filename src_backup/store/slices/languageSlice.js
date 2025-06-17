import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    currentFont: 'font-ru',
    direction: 'ltr',
    language: 'ru',
};
const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        changeLanguage: (state, action) => {
            state.language = action.payload;
            if (action.payload === 'ru') {
                state.currentFont = 'font-ru';
                state.direction = 'ltr';
            }
            else if (action.payload === 'he') {
                state.currentFont = 'font-he';
                state.direction = 'rtl';
            }
        },
    },
});
export const { changeLanguage } = languageSlice.actions;
export default languageSlice.reducer;
