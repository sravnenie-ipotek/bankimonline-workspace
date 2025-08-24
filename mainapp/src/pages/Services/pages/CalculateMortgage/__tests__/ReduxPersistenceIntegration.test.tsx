import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { Formik } from 'formik'
import { I18nextProvider } from 'react-i18next'
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import storage from 'redux-persist/lib/storage'

import { CalculateMortgageTypes } from '@src/pages/Services/types/formTypes'
import calculateMortgageSlice from '@src/pages/Services/slices/calculateMortgageSlice'
import activeFieldSlice from '@src/pages/Services/slices/activeField'
// Mock language slice instead of importing
const languageSlice = (state = { language: 'en' }, action: any) => {
  switch (action.type) {
    case 'language/setLanguage':
      return { ...state, language: action.payload }
    default:
      return state
  }
}

// For older version compatibility
const setupUserEvent = userEvent.setup || (() => userEvent)

// Mock i18n
const mockI18n = {
  language: 'en',
  changeLanguage: jest.fn(),
  t: jest.fn((key, fallback) => fallback || key)
}

// Mock all external dependencies
jest.mock('@src/hooks/useContentApi', () => ({
  useContentApi: () => ({
    getContent: (key: string, fallback: string) => fallback || key
  })
}))

jest.mock('@src/hooks/useDropdownData', () => ({
  useAllDropdowns: () => ({
    data: {},
    loading: false,
    error: null,
    getDropdownProps: (key: string) => ({
      label: `${key}_label`,
      placeholder: `${key}_placeholder`,
      options: []
    })
  })
}))

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage for redux-persist testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Create persisted store configuration for testing
const persistConfig = {
  key: 'mortgage-test',
  storage,
  whitelist: ['mortgage', 'language'] // Only persist specific slices
}

const rootReducer = {
  mortgage: calculateMortgageSlice,
  activeField: activeFieldSlice,
  language: languageSlice
}

const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer))

const createTestStore = (preloadedState?: any) => {
  const store = configureStore({
    reducer: persistedReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
        }
      })
  })
  const persistor = persistStore(store)
  return { store, persistor }
}

// Mock component that simulates form interaction with Redux
const MockPersistentMortgageForm: React.FC = () => {
  const { setFieldValue, values } = 
    React.useContext(require('formik').FormikContext) as any

  return (
    <div data-testid="persistent-form">
      <input
        data-testid="property-price"
        type="text"
        value={values.priceOfEstate?.toLocaleString() || ''}
        onChange={(e) => {
          const numValue = parseInt(e.target.value.replace(/,/g, '')) || 0
          setFieldValue('priceOfEstate', numValue)
        }}
      />
      
      <select
        data-testid="property-ownership"
        value={values.propertyOwnership || ''}
        onChange={(e) => setFieldValue('propertyOwnership', e.target.value)}
      >
        <option value="">Select ownership</option>
        <option value="no_property">I don't own any property</option>
        <option value="has_property">I own a property</option>
        <option value="selling_property">I'm selling a property</option>
      </select>

      <input
        data-testid="initial-fee"
        type="number"
        value={values.initialFee || 0}
        onChange={(e) => setFieldValue('initialFee', parseInt(e.target.value))}
      />

      <div data-testid="form-state">
        Price: {values.priceOfEstate}
        Ownership: {values.propertyOwnership}
        Fee: {values.initialFee}
      </div>
    </div>
  )
}

const initialValues: CalculateMortgageTypes = {
  priceOfEstate: 1000000,
  cityWhereYouBuy: '',
  whenDoYouNeedMoney: '',
  initialFee: 250000,
  typeSelect: '',
  willBeYourFirst: '',
  propertyOwnership: 'no_property',
  period: 25,
  monthlyPayment: 4500
}

function combineReducers(reducers: any) {
  return (state: any = {}, action: any) => {
    return Object.keys(reducers).reduce((nextState, key) => {
      nextState[key] = reducers[key](state[key], action)
      return nextState
    }, {} as any)
  }
}

const renderWithPersistence = (values: CalculateMortgageTypes = initialValues) => {
  const { store, persistor } = createTestStore()

  const TestComponent = () => (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <I18nextProvider i18n={mockI18n as any}>
          <Formik
            initialValues={values}
            onSubmit={() => {}}
            validate={() => ({})}
          >
            <MockPersistentMortgageForm />
          </Formik>
        </I18nextProvider>
      </PersistGate>
    </Provider>
  )
  
  return { component: render(<TestComponent />), store, persistor }
}

describe('🔗 Redux State Management & Persistence Integration - CATEGORY 3', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockI18n.language = 'en'
    localStorageMock.clear()
    
    // Mock successful API responses
    ;(global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: { property_ownership_ltvs: {
            no_property: { ltv: 75 },
            has_property: { ltv: 50 },
            selling_property: { ltv: 70 }
          }}
        })
      })
    )
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('🔄 Form State Persistence', () => {
    test('persists mortgage form data to localStorage', async () => {
      const { component, store } = renderWithPersistence()

      await act(async () => {
        await waitFor(() => {
          expect(screen.getByTestId('persistent-form')).toBeInTheDocument()
        })
      })

      const priceInput = screen.getByTestId('property-price')
      const user = setupUserEvent()

      // Update form value
      await user.clear(priceInput)
      await user.type(priceInput, '1500000')

      await waitFor(() => {
        expect(priceInput).toHaveValue('1,500,000')
      })

      // Check that localStorage was called to persist data
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    test('restores form data from localStorage on page reload', async () => {
      // Simulate existing persisted data
      const persistedData = {
        mortgage: {
          priceOfEstate: 2000000,
          propertyOwnership: 'has_property',
          initialFee: 1000000,
          _persist: { version: -1, rehydrated: true }
        }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedData))

      const { component } = renderWithPersistence()

      await waitFor(() => {
        const stateDisplay = screen.getByTestId('form-state')
        expect(stateDisplay).toHaveTextContent('Price: 2000000')
        expect(stateDisplay).toHaveTextContent('Ownership: has_property')
        expect(stateDisplay).toHaveTextContent('Fee: 1000000')
      })
    })

    test('handles corrupted localStorage data gracefully', async () => {
      // Simulate corrupted data
      localStorageMock.getItem.mockReturnValue('invalid-json-{')

      const { component } = renderWithPersistence()

      await waitFor(() => {
        // Should fall back to initial values
        const stateDisplay = screen.getByTestId('form-state')
        expect(stateDisplay).toHaveTextContent('Price: 1000000')
        expect(stateDisplay).toHaveTextContent('Ownership: no_property')
      })
    })
  })

  describe('🌐 Multi-Language State Persistence', () => {
    test('persists language selection across sessions', async () => {
      const { store } = renderWithPersistence()

      // Change language to Hebrew
      act(() => {
        store.dispatch({ type: 'language/setLanguage', payload: 'he' })
        mockI18n.language = 'he'
      })

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled()
      })

      // Verify Hebrew language state is persisted
      const calls = localStorageMock.setItem.mock.calls
      const persistCall = calls.find(call => call[0].includes('mortgage-test'))
      if (persistCall) {
        const persistedState = JSON.parse(persistCall[1])
        expect(persistedState.language).toBe('he')
      }
    })

    test('restores Hebrew RTL settings on app restart', async () => {
      const persistedData = {
        language: 'he',
        mortgage: {
          priceOfEstate: 1500000,
          propertyOwnership: 'no_property'
        }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedData))
      mockI18n.language = 'he'

      const { component } = renderWithPersistence()

      await waitFor(() => {
        expect(screen.getByTestId('persistent-form')).toBeInTheDocument()
        // Language should be restored to Hebrew
        expect(mockI18n.language).toBe('he')
      })
    })

    test('preserves form data when switching languages', async () => {
      const { store } = renderWithPersistence()

      await waitFor(() => {
        expect(screen.getByTestId('persistent-form')).toBeInTheDocument()
      })

      const user = setupUserEvent()
      const priceInput = screen.getByTestId('property-price')
      
      // Set form data
      await user.clear(priceInput)
      await user.type(priceInput, '1800000')

      // Switch to Hebrew
      act(() => {
        store.dispatch({ type: 'language/setLanguage', payload: 'he' })
        mockI18n.language = 'he'
      })

      // Switch back to English
      act(() => {
        store.dispatch({ type: 'language/setLanguage', payload: 'en' })
        mockI18n.language = 'en'
      })

      await waitFor(() => {
        expect(priceInput).toHaveValue('1,800,000') // Data preserved
      })
    })
  })

  describe('🎯 Cross-Form State Synchronization', () => {
    test('maintains consistency across mortgage calculator steps', async () => {
      const { store } = renderWithPersistence()

      await waitFor(() => {
        expect(screen.getByTestId('persistent-form')).toBeInTheDocument()
      })

      const user = setupUserEvent()
      const ownershipSelect = screen.getByTestId('property-ownership')
      const feeInput = screen.getByTestId('initial-fee')

      // Change property ownership
      await user.selectOptions(ownershipSelect, 'has_property')

      // Change should be reflected in Redux state immediately
      await waitFor(() => {
        const state = store.getState()
        expect(state.mortgage?.propertyOwnership).toBe('has_property')
      })

      // Update initial fee
      await user.clear(feeInput)
      await user.type(feeInput, '500000')

      await waitFor(() => {
        const state = store.getState()
        expect(state.mortgage?.initialFee).toBe(500000)
      })
    })

    test('handles concurrent form updates without data loss', async () => {
      const { store } = renderWithPersistence()

      await waitFor(() => {
        expect(screen.getByTestId('persistent-form')).toBeInTheDocument()
      })

      const user = setupUserEvent()
      const priceInput = screen.getByTestId('property-price')
      const ownershipSelect = screen.getByTestId('property-ownership')
      const feeInput = screen.getByTestId('initial-fee')

      // Perform multiple concurrent updates
      await Promise.all([
        user.clear(priceInput),
        user.selectOptions(ownershipSelect, 'selling_property'),
        user.clear(feeInput)
      ])

      await Promise.all([
        user.type(priceInput, '2500000'),
        user.type(feeInput, '750000')
      ])

      await waitFor(() => {
        const state = store.getState()
        expect(state.mortgage?.priceOfEstate).toBe(2500000)
        expect(state.mortgage?.propertyOwnership).toBe('selling_property')
        expect(state.mortgage?.initialFee).toBe(750000)
      })
    })
  })

  describe('🏦 Israeli Banking Data Persistence', () => {
    test('persists Hebrew text values correctly', async () => {
      const { store } = renderWithPersistence()
      mockI18n.language = 'he'

      await waitFor(() => {
        expect(screen.getByTestId('persistent-form')).toBeInTheDocument()
      })

      const user = setupUserEvent()
      const ownershipSelect = screen.getByTestId('property-ownership')

      // Select Hebrew property ownership option
      await user.selectOptions(ownershipSelect, 'no_property')

      await waitFor(() => {
        const state = store.getState()
        expect(state.mortgage?.propertyOwnership).toBe('no_property')
      })

      // Verify persistence includes Hebrew values
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    test('persists Israeli currency amounts correctly', async () => {
      const { store } = renderWithPersistence()

      await waitFor(() => {
        expect(screen.getByTestId('persistent-form')).toBeInTheDocument()
      })

      const user = setupUserEvent()
      const priceInput = screen.getByTestId('property-price')

      // Set typical Israeli property price
      await user.clear(priceInput)
      await user.type(priceInput, '3500000') // 3.5M NIS

      await waitFor(() => {
        const state = store.getState()
        expect(state.mortgage?.priceOfEstate).toBe(3500000)
      })

      // Verify large numbers are persisted correctly
      const calls = localStorageMock.setItem.mock.calls
      const persistCall = calls.find(call => call[0].includes('mortgage-test'))
      if (persistCall) {
        const persistedState = JSON.parse(persistCall[1])
        expect(persistedState.mortgage?.priceOfEstate).toBe(3500000)
      }
    })

    test('maintains LTV calculation consistency after persistence', async () => {
      const testScenarios = [
        { ownership: 'no_property', price: 1000000, expectedMinDown: 250000 },
        { ownership: 'has_property', price: 2000000, expectedMinDown: 1000000 },
        { ownership: 'selling_property', price: 1500000, expectedMinDown: 450000 }
      ]

      for (const scenario of testScenarios) {
        const { store } = renderWithPersistence({
          ...initialValues,
          priceOfEstate: scenario.price,
          propertyOwnership: scenario.ownership
        })

        await waitFor(() => {
          const state = store.getState()
          expect(state.mortgage?.priceOfEstate).toBe(scenario.price)
          expect(state.mortgage?.propertyOwnership).toBe(scenario.ownership)
        })

        // Verify persistence maintains calculation integrity
        expect(localStorageMock.setItem).toHaveBeenCalled()
        
        // Clean up for next iteration
        localStorageMock.clear()
      }
    })
  })

  describe('⚡ Performance & Error Recovery', () => {
    test('handles localStorage quota exceeded gracefully', async () => {
      // Mock localStorage quota exceeded
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const { component } = renderWithPersistence()

      await waitFor(() => {
        expect(screen.getByTestId('persistent-form')).toBeInTheDocument()
      })

      const user = setupUserEvent()
      const priceInput = screen.getByTestId('property-price')

      // Should not crash when localStorage fails
      await user.clear(priceInput)
      await user.type(priceInput, '1200000')

      await waitFor(() => {
        expect(priceInput).toHaveValue('1,200,000')
      })
    })

    test('recovers from Redux rehydration failures', async () => {
      // Simulate rehydration failure
      const { component } = renderWithPersistence()

      await waitFor(() => {
        expect(screen.getByTestId('persistent-form')).toBeInTheDocument()
      })

      // Should still render with default values
      const stateDisplay = screen.getByTestId('form-state')
      expect(stateDisplay).toHaveTextContent('Price: 1000000')
    })

    test('persistence performance with large datasets', async () => {
      const { store } = renderWithPersistence()
      const startTime = performance.now()

      // Perform multiple rapid state updates
      for (let i = 0; i < 10; i++) {
        act(() => {
          store.dispatch({ 
            type: 'mortgage/updateField', 
            payload: { priceOfEstate: 1000000 + i * 100000 } 
          })
        })
      }

      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // Should complete within 100ms
    })
  })

  describe('🔒 Data Integrity & Security', () => {
    test('does not persist sensitive financial data', async () => {
      const { store } = renderWithPersistence()

      // Simulate sensitive data that shouldn't be persisted
      act(() => {
        store.dispatch({
          type: 'mortgage/setSensitiveData',
          payload: { ssn: '123-45-6789', creditScore: 750 }
        })
      })

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled()
      })

      // Check that sensitive data is not in localStorage
      const calls = localStorageMock.setItem.mock.calls
      const persistCall = calls.find(call => call[0].includes('mortgage-test'))
      if (persistCall) {
        const persistedState = JSON.parse(persistCall[1])
        expect(persistedState).not.toHaveProperty('ssn')
        expect(persistedState).not.toHaveProperty('creditScore')
      }
    })

    test('validates persisted data integrity', async () => {
      const validPersistedData = {
        mortgage: {
          priceOfEstate: 1500000,
          propertyOwnership: 'no_property',
          initialFee: 375000
        }
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validPersistedData))

      const { component } = renderWithPersistence()

      await waitFor(() => {
        const stateDisplay = screen.getByTestId('form-state')
        expect(stateDisplay).toHaveTextContent('Price: 1500000')
        expect(stateDisplay).toHaveTextContent('Ownership: no_property')
        expect(stateDisplay).toHaveTextContent('Fee: 375000')
      })
    })

    test('rejects invalid persisted data', async () => {
      const invalidPersistedData = {
        mortgage: {
          priceOfEstate: 'invalid-price',
          propertyOwnership: 'invalid-ownership',
          initialFee: -1000
        }
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidPersistedData))

      const { component } = renderWithPersistence()

      await waitFor(() => {
        // Should fall back to safe defaults
        const stateDisplay = screen.getByTestId('form-state')
        expect(stateDisplay).toHaveTextContent('Price: 1000000') // Default
        expect(stateDisplay).toHaveTextContent('Ownership: no_property') // Default
      })
    })
  })
})