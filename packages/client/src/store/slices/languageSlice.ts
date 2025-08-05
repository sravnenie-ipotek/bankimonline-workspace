import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@bankimonline/shared'

interface LanguageState {
  currentLanguage: SupportedLanguage
  availableLanguages: readonly SupportedLanguage[]
  isRTL: boolean
}

const initialState: LanguageState = {
  currentLanguage: 'he', // Default to Hebrew
  availableLanguages: SUPPORTED_LANGUAGES,
  isRTL: true, // Hebrew is RTL by default
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.currentLanguage = action.payload
      state.isRTL = action.payload === 'he'
    },
    toggleLanguage: (state) => {
      // Simple language toggle for development
      const currentIndex = state.availableLanguages.indexOf(state.currentLanguage)
      const nextIndex = (currentIndex + 1) % state.availableLanguages.length
      state.currentLanguage = state.availableLanguages[nextIndex]
      state.isRTL = state.currentLanguage === 'he'
    },
  },
})

export const { setLanguage, toggleLanguage } = languageSlice.actions
export default languageSlice.reducer