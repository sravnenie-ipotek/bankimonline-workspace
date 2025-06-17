import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { configureStore } from '@reduxjs/toolkit'
import modalSliceReducer from '@src/pages/Services/slices/modalSlice.ts'
import refinanceCredit from '@src/pages/Services/slices/refinanceCredit.ts'
import { api } from '@src/services/api.ts'
import authReducer from '@src/store/slices/authSlice.ts'
import dialogReducer from '@src/store/slices/dialogSlice.ts'

import activeFieldReducer from '../pages/Services/slices/activeField.ts'
import borrowersPersonalDataReducer from '../pages/Services/slices/borrowersPersonalDataSlice.ts'
import borrowersReducer from '../pages/Services/slices/borrowersSlice.ts'
import creditReducer from '../pages/Services/slices/calculateCreditSlice.ts'
import mortgageReducer from '../pages/Services/slices/calculateMortgageSlice.ts'
import filterReducer from '../pages/Services/slices/filterSlice.ts'
import loginReducer from '../pages/Services/slices/loginSlice.ts'
import otherBorrowersReducer from '../pages/Services/slices/otherBorrowersSlice.ts'
import refinanceMortgageReducer from '../pages/Services/slices/refinanceMortgageSlice.ts'
import languageReducer from './slices/languageSlice'
import windowSizeReducer from './slices/windowSizeSlice'

const persistConfig = {
  key: 'calculateMortgage',
  storage,
}

const persistedMortgageReducer = persistReducer(persistConfig, mortgageReducer)

const refinanceMortgagePersistConfig = {
  key: 'refinanceMortgage',
  storage,
}

const persistedRefinanceMortgageReducer = persistReducer(
  refinanceMortgagePersistConfig,
  refinanceMortgageReducer
)

const persistCreditConfig = {
  key: 'calculateCredit',
  storage,
}

const persistedCreditReducer = persistReducer(
  persistCreditConfig,
  creditReducer
)

const refinanceCreditPersistConfig = {
  key: 'refinanceCredit',
  storage,
}

const persistedRefinanceCreditReducer = persistReducer(
  refinanceCreditPersistConfig,
  refinanceCredit
)

const borrowersPersonalDataPersistConfig = {
  key: 'borrowersPersonalData',
  storage,
}

const persistedBorrowersPersonalDataReducer = persistReducer(
  borrowersPersonalDataPersistConfig,
  borrowersPersonalDataReducer
)

const otherBorrowersConfig = {
  key: 'otherBorrowers',
  storage,
}

const persistedOtherBorrowersReducer = persistReducer(
  otherBorrowersConfig,
  otherBorrowersReducer
)

const borrowersPersistConfig = {
  key: 'borrowers',
  storage,
}

const persistedBorrowersReducer = persistReducer(
  borrowersPersistConfig,
  borrowersReducer
)

const loginPersistConfig = {
  key: 'login',
  storage,
}

const persistedLoginReducer = persistReducer(loginPersistConfig, loginReducer)

const languagePersistConfig = {
  key: 'lang',
  storage,
}

const persistedLanguageReducer = persistReducer(
  languagePersistConfig,
  languageReducer
)

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    language: persistedLanguageReducer,
    windowSize: windowSizeReducer,
    auth: authReducer,
    login: persistedLoginReducer,
    dialog: dialogReducer,
    mortgage: persistedMortgageReducer,
    refinanceMortgage: persistedRefinanceMortgageReducer,
    refinanceCredit: persistedRefinanceCreditReducer,
    credit: persistedCreditReducer,
    borrowers: persistedBorrowersReducer,
    otherBorrowers: persistedOtherBorrowersReducer,
    borrowersPersonalData: persistedBorrowersPersonalDataReducer,
    filter: filterReducer,
    modalSlice: modalSliceReducer,
    activeField: activeFieldReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['dialog'],
      },
    }).concat(api.middleware),
})

const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export { store, persistor }
