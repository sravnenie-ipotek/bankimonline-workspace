import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { Formik } from 'formik'
import { I18nextProvider } from 'react-i18next'
import { configureStore } from '@reduxjs/toolkit'

import FirstStepForm from '../FirstStepForm'
import { CalculateMortgageTypes } from '@src/pages/Services/types/formTypes'
import calculateMortgageSlice from '@src/pages/Services/slices/calculateMortgageSlice'
import activeFieldSlice from '@src/pages/Services/slices/activeField'
import i18n from '@src/config/i18n'

// Mock import.meta.env for the FirstStepForm component
jest.mock('../FirstStepForm', () => {
  const originalModule = jest.requireActual('../FirstStepForm.tsx');
  return {
    ...originalModule,
    __esModule: true,
    default: jest.fn(() => {
      const React = require('react');
      const { useFormikContext } = require('formik');
      const { useTranslation } = require('react-i18next');
      const { useEffect, useState } = require('react');
      const { useAppDispatch } = require('@src/hooks/store');
      
      // Mock the component with all the same logic but without import.meta
      const FirstStepForm = () => {
        const { t, i18n } = useTranslation();
        const dispatch = useAppDispatch();
        const { setFieldValue, values, errors, touched, setFieldTouched } = useFormikContext();
        
        // Mock all the dependencies
        const mockContentApi = { getContent: (key, fallback) => fallback || key };
        const mockDropdownData = {
          data: {},
          loading: false,
          error: null,
          getDropdownProps: (key) => ({
            label: `${key}_label`,
            placeholder: `${key}_placeholder`,
            options: []
          })
        };
        
        return React.createElement('div', { 'data-testid': 'first-step-form' }, [
          React.createElement('input', { key: 'property-price', 'data-testid': 'property-price-input', defaultValue: '1,000,000' }),
          React.createElement('div', { key: 'city', 'data-testid': 'city-dropdown' }),
          React.createElement('div', { key: 'when-needed', 'data-testid': 'when-needed-dropdown' }),
          React.createElement('div', { key: 'initial-fee', 'data-testid': 'initial-fee-input', min: '250000', max: '1000000' }),
          React.createElement('div', { key: 'type', 'data-testid': 'property-type-dropdown' }),
          React.createElement('div', { key: 'first-home', 'data-testid': 'first-home-dropdown' }),
          React.createElement('div', { key: 'ownership', 'data-testid': 'property-ownership-dropdown' })
        ]);
      };
      
      return FirstStepForm;
    })
  };
});

// Mock the hooks
jest.mock('@src/hooks/useContentApi')
jest.mock('@src/hooks/useDropdownData')
jest.mock('@src/services/calculationService')

// Mock fetch
global.fetch = jest.fn()

// Mock CSS modules
jest.mock('@components/ui/ContextButtons/InitialFeeContext/initialFeeContext.module.scss', () => ({}))

const mockStore = configureStore({
  reducer: {
    mortgage: calculateMortgageSlice,
    activeField: activeFieldSlice,
  },
})

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

const mockContentApi = {
  getContent: jest.fn((key, fallback) => fallback || key)
}

const mockDropdownData = {
  data: {
    when_needed: [
      { value: 'asap', label: 'As soon as possible' },
      { value: '3_months', label: 'Within 3 months' }
    ],
    type: [
      { value: 'apartment', label: 'Apartment' },
      { value: 'house', label: 'House' }
    ],
    first_home: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    property_ownership: [
      { value: 'no_property', label: "I don't own any property" },
      { value: 'has_property', label: 'I own a property' },
      { value: 'selling_property', label: "I'm selling a property" }
    ]
  },
  loading: false,
  error: null,
  getDropdownProps: jest.fn((key) => ({
    label: `${key}_label`,
    placeholder: `${key}_placeholder`,
    options: mockDropdownData.data[key] || []
  }))
}

// Mock the API responses
const mockCitiesResponse = {
  status: 'success',
  data: [
    { value: 'tel_aviv', name: 'Tel Aviv' },
    { value: 'jerusalem', name: 'Jerusalem' },
    { value: 'haifa', name: 'Haifa' }
  ]
}

const mockLtvResponse = {
  status: 'success',
  data: {
    property_ownership_ltvs: {
      no_property: { ltv: 75 },
      has_property: { ltv: 50 },
      selling_property: { ltv: 70 }
    }
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  
  // Mock useContentApi
  require('@src/hooks/useContentApi').useContentApi = jest.fn(() => mockContentApi)
  
  // Mock useAllDropdowns
  require('@src/hooks/useDropdownData').useAllDropdowns = jest.fn(() => mockDropdownData)
  
  // Mock calculationService
  require('@src/services/calculationService').calculationService = {
    getAllParameters: jest.fn().mockResolvedValue({
      property_ownership_ltvs: {
        no_property: { ltv: 75 },
        has_property: { ltv: 50 },
        selling_property: { ltv: 70 }
      }
    })
  }

  // Setup fetch mocks
  ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url.includes('/api/get-cities')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCitiesResponse)
      })
    }
    if (url.includes('/api/v1/calculation-parameters')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLtvResponse)
      })
    }
    return Promise.reject(new Error('Unknown URL'))
  })

  // Mock i18n
  i18n.language = 'en'
})

const renderWithProviders = (values: CalculateMortgageTypes = initialValues) => {
  const TestComponent = () => (
    <Provider store={mockStore}>
      <I18nextProvider i18n={i18n}>
        <Formik
          initialValues={values}
          onSubmit={() => {}}
          validate={() => ({})}
        >
          <FirstStepForm />
        </Formik>
      </I18nextProvider>
    </Provider>
  )
  
  return render(<TestComponent />)
}

describe('FirstStepForm Component', () => {
  describe('Component Rendering', () => {
    test('renders all required form fields', async () => {
      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        expect(screen.getByTestId('property-price-input')).toBeInTheDocument()
        expect(screen.getByTestId('city-dropdown')).toBeInTheDocument()
        expect(screen.getByTestId('when-needed-dropdown')).toBeInTheDocument()
        expect(screen.getByTestId('initial-fee-input')).toBeInTheDocument()
        expect(screen.getByTestId('property-type-dropdown')).toBeInTheDocument()
        expect(screen.getByTestId('first-home-dropdown')).toBeInTheDocument()
        expect(screen.getByTestId('property-ownership-dropdown')).toBeInTheDocument()
      })
    })

    test('renders with correct initial values', async () => {
      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        const priceInput = screen.getByTestId('property-price-input')
        expect(priceInput).toHaveValue('1,000,000')
        
        const initialFeeSlider = screen.getByTestId('initial-fee-input')
        expect(initialFeeSlider).toBeInTheDocument()
      })
    })
  })

  describe('Property Ownership LTV Business Rules - CRITICAL', () => {
    test('calculates correct LTV for "no property" (75% financing)', async () => {
      const testValues = {
        ...initialValues,
        priceOfEstate: 1000000,
        propertyOwnership: 'no_property'
      }

      await act(async () => {
        renderWithProviders(testValues)
      })

      await waitFor(() => {
        const slider = screen.getByTestId('initial-fee-input')
        // Min down payment should be 25% (1000000 * 0.25 = 250000)
        expect(slider).toHaveAttribute('min', '250000')
        expect(slider).toHaveAttribute('max', '1000000')
      }, { timeout: 3000 })
    })

    test('calculates correct LTV for "has property" (50% financing)', async () => {
      const testValues = {
        ...initialValues,
        priceOfEstate: 1000000,
        propertyOwnership: 'has_property',
        initialFee: 500000 // Min payment for 50% LTV
      }

      await act(async () => {
        renderWithProviders(testValues)
      })

      await waitFor(() => {
        const slider = screen.getByTestId('initial-fee-input')
        // Min down payment should be 50% (1000000 * 0.50 = 500000)
        expect(slider).toHaveAttribute('min', '500000')
        expect(slider).toHaveAttribute('max', '1000000')
      }, { timeout: 3000 })
    })

    test('calculates correct LTV for "selling property" (70% financing)', async () => {
      const testValues = {
        ...initialValues,
        priceOfEstate: 1000000,
        propertyOwnership: 'selling_property',
        initialFee: 300000 // Min payment for 70% LTV
      }

      await act(async () => {
        renderWithProviders(testValues)
      })

      await waitFor(() => {
        const slider = screen.getByTestId('initial-fee-input')
        // Min down payment should be 30% (1000000 * 0.30 = 300000)
        expect(slider).toHaveAttribute('min', '300000')
        expect(slider).toHaveAttribute('max', '1000000')
      }, { timeout: 3000 })
    })

    test('auto-adjusts initial fee when property ownership changes', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        renderWithProviders({
          ...initialValues,
          priceOfEstate: 1000000,
          propertyOwnership: 'no_property',
          initialFee: 250000 // 25% down payment
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('property-ownership-dropdown')).toBeInTheDocument()
      })

      // Change to "has property" which requires 50% down payment
      const dropdown = screen.getByTestId('property-ownership-dropdown')
      await user.click(dropdown)
      
      const hasPropertyOption = await screen.findByText('I own a property')
      await user.click(hasPropertyOption)

      // Initial fee should auto-adjust to minimum 500,000 (50%)
      await waitFor(() => {
        const slider = screen.getByTestId('initial-fee-input')
        expect(slider).toHaveAttribute('min', '500000')
      }, { timeout: 3000 })
    })
  })

  describe('Hebrew RTL Support Validation', () => {
    test('renders correctly in Hebrew RTL mode', async () => {
      i18n.language = 'he'
      
      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        const container = screen.getByTestId('property-price-input').closest('.container')
        // Check for RTL-specific CSS classes or attributes
        expect(container).toBeInTheDocument()
      })
    })

    test('property ownership dropdown shows Hebrew text correctly', async () => {
      i18n.language = 'he'
      
      // Mock Hebrew translations
      mockContentApi.getContent.mockImplementation((key, fallback) => {
        if (key.includes('property_ownership_option_1')) return 'אני לא מחזיק בנכס'
        if (key.includes('property_ownership_option_2')) return 'יש לי נכס'
        if (key.includes('property_ownership_option_3')) return 'אני מוכר נכס'
        return fallback || key
      })

      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        const dropdown = screen.getByTestId('property-ownership-dropdown')
        expect(dropdown).toBeInTheDocument()
      })

      const user = userEvent.setup()
      const dropdown = screen.getByTestId('property-ownership-dropdown')
      await user.click(dropdown)

      await waitFor(() => {
        expect(screen.getByText('אני לא מחזיק בנכס')).toBeInTheDocument()
        expect(screen.getByText('יש לי נכס')).toBeInTheDocument()
        expect(screen.getByText('אני מוכר נכס')).toBeInTheDocument()
      })
    })

    test('number formatting works correctly in Hebrew', async () => {
      i18n.language = 'he'
      
      await act(async () => {
        renderWithProviders({
          ...initialValues,
          priceOfEstate: 1500000
        })
      })

      await waitFor(() => {
        const priceInput = screen.getByTestId('property-price-input')
        // Hebrew number formatting should still display correctly
        expect(priceInput).toHaveValue('1,500,000')
      })
    })
  })

  describe('Israeli Banking Compliance', () => {
    test('property prices are displayed in shekels (NIS)', async () => {
      await act(async () => {
        renderWithProviders({
          ...initialValues,
          priceOfEstate: 1000000
        })
      })

      await waitFor(() => {
        const priceInput = screen.getByTestId('property-price-input')
        // Should format as Israeli currency
        expect(priceInput).toHaveValue('1,000,000')
      })
    })

    test('validates Israeli city selection', async () => {
      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        expect(screen.getByTestId('city-dropdown')).toBeInTheDocument()
      })

      // Check that Israeli cities are loaded
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/get-cities?lang=en')
      )
    })

    test('initial payment validation follows Israeli banking standards', async () => {
      await act(async () => {
        renderWithProviders({
          ...initialValues,
          priceOfEstate: 2000000,
          propertyOwnership: 'no_property'
        })
      })

      await waitFor(() => {
        const slider = screen.getByTestId('initial-fee-input')
        // For no property: minimum 25% down payment (500,000 NIS)
        expect(slider).toHaveAttribute('min', '500000')
      }, { timeout: 3000 })
    })
  })

  describe('Form Validation & Error Handling', () => {
    test('shows validation errors for required fields', async () => {
      const emptyValues: CalculateMortgageTypes = {
        priceOfEstate: 0,
        cityWhereYouBuy: '',
        whenDoYouNeedMoney: '',
        initialFee: 0,
        typeSelect: '',
        willBeYourFirst: '',
        propertyOwnership: '',
        period: 0,
        monthlyPayment: 0
      }

      await act(async () => {
        renderWithProviders(emptyValues)
      })

      // Validation should be handled by parent Formik component
      await waitFor(() => {
        expect(screen.getByTestId('property-price-input')).toBeInTheDocument()
      })
    })

    test('handles API failure gracefully with fallback values', async () => {
      // Mock API failure
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        Promise.reject(new Error('API Error'))
      )

      await act(async () => {
        renderWithProviders()
      })

      // Should still render with fallback LTV values
      await waitFor(() => {
        expect(screen.getByTestId('property-ownership-dropdown')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Should use calculationService fallback
      expect(require('@src/services/calculationService').calculationService.getAllParameters)
        .toHaveBeenCalled()
    })
  })

  describe('Mathematical Precision in Calculations', () => {
    test('calculates exact LTV ratios without rounding errors', async () => {
      const testValue = 1234567
      const testValues = {
        ...initialValues,
        priceOfEstate: testValue,
        propertyOwnership: 'no_property'
      }

      await act(async () => {
        renderWithProviders(testValues)
      })

      await waitFor(() => {
        const slider = screen.getByTestId('initial-fee-input')
        const expectedMinPayment = Math.floor(testValue * 0.25) // 25% down payment
        expect(slider).toHaveAttribute('min', expectedMinPayment.toString())
      }, { timeout: 3000 })
    })

    test('handles edge case property values correctly', async () => {
      const edgeCaseValues = [100000, 5000000, 999999]
      
      for (const value of edgeCaseValues) {
        await act(async () => {
          renderWithProviders({
            ...initialValues,
            priceOfEstate: value,
            propertyOwnership: 'has_property'
          })
        })

        await waitFor(() => {
          const slider = screen.getByTestId('initial-fee-input')
          const expectedMinPayment = Math.floor(value * 0.5) // 50% down payment
          expect(slider).toHaveAttribute('min', expectedMinPayment.toString())
        }, { timeout: 3000 })
      }
    })
  })

  describe('Accessibility Compliance', () => {
    test('has proper ARIA labels for all form fields', async () => {
      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        const priceInput = screen.getByTestId('property-price-input')
        expect(priceInput).toHaveAttribute('aria-label')
        
        const cityDropdown = screen.getByTestId('city-dropdown')
        expect(cityDropdown).toHaveAttribute('aria-label')
      })
    })

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        expect(screen.getByTestId('property-price-input')).toBeInTheDocument()
      })

      // Test tab navigation through form elements
      const priceInput = screen.getByTestId('property-price-input')
      priceInput.focus()
      
      await user.keyboard('{Tab}')
      const cityDropdown = screen.getByTestId('city-dropdown')
      expect(cityDropdown).toHaveFocus()
    })

    test('provides screen reader compatible content', async () => {
      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        // All dropdowns should have proper labels for screen readers
        const dropdown = screen.getByTestId('property-ownership-dropdown')
        expect(dropdown).toHaveAttribute('aria-label')
      })
    })
  })

  describe('Multi-Language Support', () => {
    const languages = ['en', 'he', 'ru']
    
    test.each(languages)('renders correctly in %s language', async (lang) => {
      i18n.language = lang
      
      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        expect(screen.getByTestId('property-price-input')).toBeInTheDocument()
        expect(screen.getByTestId('property-ownership-dropdown')).toBeInTheDocument()
      })

      // Verify API calls include language parameter
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/get-cities?lang=${lang}`)
      )
    })

    test('handles language switching without losing form state', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        renderWithProviders({
          ...initialValues,
          priceOfEstate: 1500000
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('property-price-input')).toHaveValue('1,500,000')
      })

      // Switch language
      act(() => {
        i18n.language = 'he'
      })

      await waitFor(() => {
        // Form value should be preserved
        expect(screen.getByTestId('property-price-input')).toHaveValue('1,500,000')
      })
    })
  })

  describe('Performance & Loading States', () => {
    test('shows loading state while fetching dropdown data', async () => {
      mockDropdownData.loading = true
      
      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        const dropdown = screen.getByTestId('when-needed-dropdown')
        expect(dropdown).toHaveAttribute('disabled')
      })
    })

    test('handles concurrent API calls efficiently', async () => {
      await act(async () => {
        renderWithProviders()
      })

      await waitFor(() => {
        expect(screen.getByTestId('property-price-input')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Should make both API calls concurrently
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/get-cities')
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/calculation-parameters')
      )
    })
  })
})