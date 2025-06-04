import { configureStore } from '@reduxjs/toolkit'

import languageReducer from './slices/languageSlice'
import settingsModalReducer from './slices/settingsModalSlice.ts'
import settingsUserReducer from './slices/settingsUserSlice.ts'
import windowSizeReducer from './slices/windowSizeSlice.ts'

const store = configureStore({
  reducer: {
    language: languageReducer,
    windowSize: windowSizeReducer,
    settingsUser: settingsUserReducer,
    settingsModal: settingsModalReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
