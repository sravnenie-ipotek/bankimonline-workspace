import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface LanguageState {
  currentFont: string
  direction: 'ltr' | 'rtl'
  language: string
}

const initialState: LanguageState = {
  currentFont: 'font-ru',
  direction: 'ltr',
  language: 'ru',
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    changeLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
      if (action.payload === 'ru') {
        state.currentFont = 'font-ru'
        state.direction = 'ltr'
      } else if (action.payload === 'he') {
        state.currentFont = 'font-he'
        state.direction = 'rtl'
      }
    },
  },
})

export const { changeLanguage } = languageSlice.actions
export default languageSlice.reducer
