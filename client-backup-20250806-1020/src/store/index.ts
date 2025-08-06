import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// Import slices (to be added as services are migrated)
import languageSlice from './slices/languageSlice'

// Root reducer
const rootReducer = combineReducers({
  language: languageSlice,
  // Additional slices will be added here as services are migrated:
  // auth: authSlice,
  // mortgage: mortgageSlice,
  // credit: creditSlice,
  // etc.
})

// Persist configuration
const persistConfig = {
  key: 'bankimonline-client',
  storage,
  whitelist: [
    'language',
    // Add other slices to persist as they are migrated
  ],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

// Export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch