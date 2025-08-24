import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { PersistGate } from 'redux-persist/integration/react'

import CalculateMortgage from '../CalculateMortgage'
import calculateMortgageSlice from '@src/pages/Services/slices/calculateMortgageSlice'
import borrowersSlice from '@src/pages/Services/slices/borrowersSlice'
import borrowersPersonalDataSlice from '@src/pages/Services/slices/borrowersPersonalDataSlice'
import activeFieldSlice from '@src/pages/Services/slices/activeField'
import modalSlice from '@src/pages/Services/slices/modalSlice'
import i18n from '@src/config/i18n'

// Mock persist storage
jest.mock('redux-persist/lib/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}))

// Mock navigation
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ step: '1' })
}))

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['mortgage', 'borrowers', 'borrowersPersonalData']
}

const rootReducer = {
  mortgage: persistReducer(persistConfig, calculateMortgageSlice),
  borrowers: persistReducer(persistConfig, borrowersSlice),
  borrowersPersonalData: persistReducer(persistConfig, borrowersPersonalDataSlice),
  activeField: activeFieldSlice,
  modal: modalSlice
}

const createTestStore = (preloadedState = {}) => {
  const store = configureStore({
    reducer: rootReducer,
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

const renderWithPersistence = (component: React.ReactElement, initialState = {}) => {
  const { store, persistor } = createTestStore(initialState)
  
  return render(
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          {component}
        </I18nextProvider>
      </PersistGate>
    </Provider>
  )
}

describe('Mortgage Form State Persistence - CRITICAL', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Step 1 - Basic Information Persistence', () => {
    test('persists property price across browser refresh', async () => {
      const initialState = {
        mortgage: {
          priceOfEstate: 1500000,
          cityWhereYouBuy: 'tel_aviv',
          whenDoYouNeedMoney: 'asap',
          propertyOwnership: 'no_property',
          initialFee: 375000
        }
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      await waitFor(() => {
        const priceInput = screen.getByTestId('property-price-input')
        expect(priceInput).toHaveValue('1,500,000')
      })

      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('1500000')
      )
    })

    test('persists property ownership and recalculates LTV correctly', async () => {
      const user = userEvent.setup()
      
      const initialState = {
        mortgage: {
          priceOfEstate: 1000000,
          propertyOwnership: 'has_property', // 50% LTV
          initialFee: 500000 // Correct minimum for has_property
        }
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      await waitFor(() => {
        const dropdown = screen.getByTestId('property-ownership-dropdown')
        expect(dropdown).toHaveDisplayValue('I own a property')
        
        const slider = screen.getByTestId('initial-fee-input')
        expect(slider).toHaveAttribute('min', '500000') // 50% down payment
      })
    })

    test('persists city selection with API integration', async () => {
      const initialState = {
        mortgage: {
          cityWhereYouBuy: 'jerusalem',
          priceOfEstate: 800000
        }
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      await waitFor(() => {
        const cityDropdown = screen.getByTestId('city-dropdown')
        expect(cityDropdown).toHaveDisplayValue('Jerusalem')
      })
    })

    test('validates persistence with mathematical precision', () => {
      const testValues = {
        priceOfEstate: 1234567.89,
        initialFee: 308641.97 // Exactly 25% of property price
      }

      const initialState = {
        mortgage: {
          ...testValues,
          propertyOwnership: 'no_property'
        }
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      // Verify mathematical precision is maintained through persistence
      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringMatching(/1234567\.89/)
      )
    })
  })

  describe('Step 2 - Personal Data Persistence', () => {
    test('persists borrower personal information across steps', async () => {
      const personalData = {
        nameSurname: 'John Doe',
        birthday: '1990-05-15',
        education: 'university',
        familyStatus: 'married',
        borrowers: 2
      }

      const initialState = {
        borrowers: personalData,
        borrowersPersonalData: personalData
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      // Navigate to step 2
      mockNavigate('/services/calculate-mortgage/2')

      await waitFor(() => {
        expect(storage.setItem).toHaveBeenCalledWith(
          'persist:root',
          expect.stringContaining('John Doe')
        )
      })
    })

    test('persists complex family status with children data', async () => {
      const familyData = {
        familyStatus: 'married',
        childrens: 'yes',
        howMuchChildrens: 3,
        partnerPayMortgage: 'yes'
      }

      const initialState = {
        borrowers: familyData
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('"howMuchChildrens":3')
      )
    })

    test('persists citizenship and tax information correctly', async () => {
      const citizenshipData = {
        additionalCitizenships: 'yes',
        citizenshipsDropdown: ['usa', 'canada'],
        taxes: 'yes',
        countriesPayTaxes: ['usa']
      }

      const initialState = {
        borrowers: citizenshipData
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('["usa","canada"]')
      )
    })
  })

  describe('Step 3 - Income Data Persistence', () => {
    test('persists main income source with employment details', async () => {
      const incomeData = {
        mainSourceOfIncome: 'employed',
        monthlyIncome: 15000,
        startDate: '2020-01-01',
        fieldOfActivity: 'technology',
        profession: 'software_engineer',
        companyName: 'Tech Corp Ltd'
      }

      const initialState = {
        borrowers: incomeData
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('"monthlyIncome":15000')
      )
      
      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('Tech Corp Ltd')
      )
    })

    test('persists additional income sources correctly', async () => {
      const additionalIncomeData = {
        additionalIncome: 'yes',
        additionalIncomeAmount: 3000
      }

      const initialState = {
        borrowers: additionalIncomeData,
        modal: {
          additionalIncomeModal: [
            {
              id: 1,
              additionalIncome: 'rental_income',
              additionalIncomeAmount: 3000
            }
          ]
        }
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('rental_income')
      )
    })

    test('persists obligation and existing loan data', async () => {
      const obligationData = {
        obligation: 'yes',
        bank: 'bank_hapoalim',
        monthlyPaymentForAnotherBank: 2500,
        endDate: '2030-12-31'
      }

      const initialState = {
        borrowers: obligationData
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('bank_hapoalim')
      )
    })
  })

  describe('Cross-Step Data Consistency', () => {
    test('maintains LTV calculations when navigating between steps', async () => {
      const user = userEvent.setup()
      
      const initialState = {
        mortgage: {
          priceOfEstate: 1000000,
          propertyOwnership: 'no_property',
          initialFee: 250000 // 25% down payment for no_property
        }
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      // Navigate to step 2 and back to step 1
      mockNavigate('/services/calculate-mortgage/2')
      await waitFor(() => expect(mockNavigate).toHaveBeenCalled())

      mockNavigate('/services/calculate-mortgage/1')
      
      await waitFor(() => {
        const slider = screen.getByTestId('initial-fee-input')
        expect(slider).toHaveValue('250000')
        expect(slider).toHaveAttribute('min', '250000')
      })
    })

    test('updates dependent fields when base values change', async () => {
      const user = userEvent.setup()
      
      const initialState = {
        mortgage: {
          priceOfEstate: 1000000,
          propertyOwnership: 'no_property',
          initialFee: 250000
        }
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      // Change property ownership to has_property (50% LTV)
      const dropdown = screen.getByTestId('property-ownership-dropdown')
      await user.selectOptions(dropdown, 'has_property')

      await waitFor(() => {
        // Initial fee should auto-adjust to minimum 500,000
        expect(storage.setItem).toHaveBeenCalledWith(
          'persist:root',
          expect.stringContaining('"initialFee":500000')
        )
      })
    })

    test('preserves form validation state across navigation', async () => {
      const invalidState = {
        mortgage: {
          priceOfEstate: 0, // Invalid
          propertyOwnership: '', // Required but empty
        },
        borrowers: {
          nameSurname: '', // Required but empty
          birthday: '' // Required but empty
        }
      }

      renderWithPersistence(<CalculateMortgage />, invalidState)

      // Validation errors should be preserved in storage
      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('"priceOfEstate":0')
      )
    })
  })

  describe('Hebrew Language State Persistence', () => {
    test('persists Hebrew language selection and form data', async () => {
      i18n.language = 'he'
      
      const hebrewFormData = {
        mortgage: {
          priceOfEstate: 1000000,
          cityWhereYouBuy: 'ירושלים', // Jerusalem in Hebrew
          propertyOwnership: 'no_property'
        },
        borrowers: {
          nameSurname: 'ישראל כהן', // Hebrew name
          birthday: '1985-03-20'
        }
      }

      renderWithPersistence(<CalculateMortgage />, hebrewFormData)

      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('ישראל כהן')
      )

      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('ירושלים')
      )
    })

    test('maintains RTL layout state through persistence', async () => {
      i18n.language = 'he'
      
      const initialState = {
        mortgage: {
          priceOfEstate: 1200000
        }
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      await waitFor(() => {
        const container = screen.getByTestId('property-price-input').closest('[dir]')
        expect(container).toHaveAttribute('dir', 'rtl')
      })
    })

    test('persists Hebrew number formatting correctly', async () => {
      i18n.language = 'he'
      
      const hebrewNumbers = {
        priceOfEstate: 1500000, // Should display as ₪1,500,000
        monthlyIncome: 18000 // Should display as ₪18,000
      }

      const initialState = {
        mortgage: hebrewNumbers,
        borrowers: { monthlyIncome: hebrewNumbers.monthlyIncome }
      }

      renderWithPersistence(<CalculateMortgage />, initialState)

      // Numbers should be stored as numbers but displayed with Hebrew formatting
      expect(storage.setItem).toHaveBeenCalledWith(
        'persist:root',
        expect.stringContaining('1500000')
      )
    })
  })

  describe('Performance & Storage Optimization', () => {
    test('throttles storage writes to prevent excessive persistence calls', async () => {
      const user = userEvent.setup()
      
      renderWithPersistence(<CalculateMortgage />)

      const priceInput = screen.getByTestId('property-price-input')
      
      // Rapid consecutive changes
      for (let i = 0; i < 10; i++) {
        await user.clear(priceInput)
        await user.type(priceInput, `${1000000 + i * 100000}`)
      }

      // Should throttle storage writes (not 10 separate calls)
      expect(storage.setItem).toHaveBeenCalledTimes(1)
    })

    test('handles storage quota exceeded gracefully', async () => {
      // Mock storage quota exceeded
      ;(storage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const largeState = {
        mortgage: {
          priceOfEstate: 1000000,
          // Large data to exceed quota
          largeField: 'x'.repeat(10000000)
        }
      }

      expect(() => {
        renderWithPersistence(<CalculateMortgage />, largeState)
      }).not.toThrow()

      // Should log error and continue functioning
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('QuotaExceededError')
      )
    })

    test('compresses large form data for efficient storage', async () => {
      const complexFormData = {
        mortgage: {
          priceOfEstate: 1000000,
          cityWhereYouBuy: 'tel_aviv',
          propertyOwnership: 'no_property'
        },
        borrowers: {
          nameSurname: 'John Doe',
          birthday: '1990-01-01',
          familyStatus: 'married',
          childrens: 'yes',
          howMuchChildrens: 2
        },
        borrowersPersonalData: {
          address: '123 Main Street, Tel Aviv',
          profession: 'software_engineer',
          monthlyIncome: 15000
        },
        modal: {
          additionalIncomeModal: [
            { id: 1, additionalIncome: 'rental', additionalIncomeAmount: 3000 },
            { id: 2, additionalIncome: 'freelance', additionalIncomeAmount: 2000 }
          ],
          obligationModal: [
            { id: 1, bank: 'bank_leumi', monthlyPaymentForAnotherBank: 1500, endDate: '2030-01-01' }
          ]
        }
      }

      renderWithPersistence(<CalculateMortgage />, complexFormData)

      // Should compress data efficiently
      const storedData = (storage.setItem as jest.Mock).mock.calls[0][1]
      expect(storedData.length).toBeLessThan(JSON.stringify(complexFormData).length)
    })
  })

  describe('Data Recovery & Migration', () => {
    test('recovers from corrupted storage data', async () => {
      // Mock corrupted storage data
      ;(storage.getItem as jest.Mock).mockResolvedValue('invalid-json-{corrupted}')

      expect(() => {
        renderWithPersistence(<CalculateMortgage />)
      }).not.toThrow()

      // Should initialize with default values
      await waitFor(() => {
        const priceInput = screen.getByTestId('property-price-input')
        expect(priceInput).toHaveValue('')
      })
    })

    test('migrates old storage format to new format', async () => {
      // Mock old format data
      const oldFormatData = {
        // Old format without LTV business rules
        calculateMortgage: {
          propertyPrice: 1000000, // Old field name
          downPayment: 200000, // Old field name
          ownership: 'first_time' // Old format
        }
      }

      ;(storage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldFormatData))

      renderWithPersistence(<CalculateMortgage />)

      // Should migrate to new format
      await waitFor(() => {
        expect(storage.setItem).toHaveBeenCalledWith(
          'persist:root',
          expect.stringContaining('"priceOfEstate":1000000')
        )
        
        expect(storage.setItem).toHaveBeenCalledWith(
          'persist:root',
          expect.stringContaining('"propertyOwnership":"no_property"')
        )
      })
    })

    test('validates and sanitizes restored data', async () => {
      const maliciousData = {
        mortgage: {
          priceOfEstate: '<script>alert("xss")</script>',
          nameSurname: 'javascript:void(0)'
        }
      }

      ;(storage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(maliciousData))

      renderWithPersistence(<CalculateMortgage />)

      // Should sanitize malicious content
      await waitFor(() => {
        const priceInput = screen.getByTestId('property-price-input')
        expect(priceInput).toHaveValue('0') // Sanitized to safe default
      })
    })
  })

  describe('Storage Security & Privacy', () => {
    test('encrypts sensitive financial data before storage', async () => {
      const sensitiveData = {
        borrowers: {
          monthlyIncome: 25000,
          companyName: 'Sensitive Corp',
          additionalIncomeAmount: 5000
        }
      }

      renderWithPersistence(<CalculateMortgage />, sensitiveData)

      const storedData = (storage.setItem as jest.Mock).mock.calls[0][1]
      
      // Sensitive data should be encrypted (not plain text)
      expect(storedData).not.toContain('25000')
      expect(storedData).not.toContain('Sensitive Corp')
    })

    test('clears sensitive data on session timeout', async () => {
      jest.useFakeTimers()
      
      const sensitiveData = {
        borrowers: {
          monthlyIncome: 20000,
          nameSurname: 'John Doe'
        }
      }

      renderWithPersistence(<CalculateMortgage />, sensitiveData)

      // Fast-forward 30 minutes (session timeout)
      jest.advanceTimersByTime(30 * 60 * 1000)

      await waitFor(() => {
        expect(storage.removeItem).toHaveBeenCalledWith('persist:root')
      })

      jest.useRealTimers()
    })
  })
})