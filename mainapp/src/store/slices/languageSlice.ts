import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface LanguageState {
  currentFont: string
  direction: 'ltr' | 'rtl'
  language: string
}

// Get language from localStorage or default to 'en'
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en'
  }
  return 'en'
}

const getInitialFont = (language: string): string => {
  if (language === 'he') return 'font-he'
  return 'font-ru'
}

const getInitialDirection = (language: string): 'ltr' | 'rtl' => {
  if (language === 'he') return 'rtl'
  return 'ltr'
}

const initialLanguage = getInitialLanguage()

const initialState: LanguageState = {
  currentFont: getInitialFont(initialLanguage),
  direction: getInitialDirection(initialLanguage),
  language: initialLanguage,
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    changeLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', action.payload)
      }
      
      if (action.payload === 'ru') {
        state.currentFont = 'font-ru'
        state.direction = 'ltr'
      } else if (action.payload === 'he') {
        state.currentFont = 'font-he'
        state.direction = 'rtl'
      } else if (action.payload === 'en') {
        state.currentFont = 'font-ru' // Use same font as Russian for English
        state.direction = 'ltr'
      }
    },
  },
})

export const { changeLanguage } = languageSlice.actions
export default languageSlice.reducer
