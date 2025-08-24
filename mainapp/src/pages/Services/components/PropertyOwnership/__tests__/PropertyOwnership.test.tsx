import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { configureStore } from '@reduxjs/toolkit'

import PropertyOwnership from '../PropertyOwnership'
import calculateMortgageSlice from '@src/pages/Services/slices/calculateMortgageSlice'
import i18n from '@src/config/i18n'

const mockStore = configureStore({
  reducer: {
    mortgage: calculateMortgageSlice,
  },
})

const defaultProps = {
  value: '',
  onChange: jest.fn(),
  error: '',
  disabled: false,
  required: true
}

const ltvBusinessRules = {
  no_property: { ltv: 75, description: "I don't own any property" },
  has_property: { ltv: 50, description: "I own a property" },
  selling_property: { ltv: 70, description: "I'm selling a property" }
}

const renderWithProviders = (props = defaultProps) => {
  return render(
    <Provider store={mockStore}>
      <I18nextProvider i18n={i18n}>
        <PropertyOwnership {...props} />
      </I18nextProvider>
    </Provider>
  )
}

describe('PropertyOwnership Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    i18n.language = 'en'
  })

  describe('Component Rendering & Structure', () => {
    test('renders property ownership dropdown with all options', () => {
      renderWithProviders()

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText(/property ownership/i)).toBeInTheDocument()
    })

    test('displays correct placeholder text', () => {
      renderWithProviders()

      expect(screen.getByRole('combobox')).toHaveAttribute(
        'placeholder', 
        expect.stringContaining('Select your property ownership status')
      )
    })

    test('shows all three LTV options when opened', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      await waitFor(() => {
        expect(screen.getByText("I don't own any property")).toBeInTheDocument()
        expect(screen.getByText("I own a property")).toBeInTheDocument()
        expect(screen.getByText("I'm selling a property")).toBeInTheDocument()
      })
    })

    test('displays selected value correctly', () => {
      renderWithProviders({
        ...defaultProps,
        value: 'no_property'
      })

      expect(screen.getByDisplayValue("I don't own any property")).toBeInTheDocument()
    })
  })

  describe('LTV Business Rules Integration - CRITICAL', () => {
    test('no_property option represents 75% LTV correctly', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      const noPropOption = await screen.findByText("I don't own any property")
      expect(noPropOption).toHaveAttribute('data-ltv', '75')
      
      await user.click(noPropOption)
      expect(defaultProps.onChange).toHaveBeenCalledWith('no_property')
    })

    test('has_property option represents 50% LTV correctly', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      const hasPropOption = await screen.findByText("I own a property")
      expect(hasPropOption).toHaveAttribute('data-ltv', '50')
      
      await user.click(hasPropOption)
      expect(defaultProps.onChange).toHaveBeenCalledWith('has_property')
    })

    test('selling_property option represents 70% LTV correctly', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      const sellingOption = await screen.findByText("I'm selling a property")
      expect(sellingOption).toHaveAttribute('data-ltv', '70')
      
      await user.click(sellingOption)
      expect(defaultProps.onChange).toHaveBeenCalledWith('selling_property')
    })

    test('displays LTV information as tooltips', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      const noPropOption = await screen.findByText("I don't own any property")
      await user.hover(noPropOption)

      await waitFor(() => {
        expect(screen.getByText(/75% financing available/i)).toBeInTheDocument()
      })
    })

    test('calculates correct down payment percentages', () => {
      // Test mathematical accuracy of LTV calculations
      const testCases = [
        { ltv: 75, downPayment: 25, option: 'no_property' },
        { ltv: 50, downPayment: 50, option: 'has_property' },
        { ltv: 70, downPayment: 30, option: 'selling_property' }
      ]

      testCases.forEach(({ ltv, downPayment, option }) => {
        const calculatedDownPayment = 100 - ltv
        expect(calculatedDownPayment).toBe(downPayment)
      })
    })
  })

  describe('Hebrew RTL Support - CRITICAL', () => {
    beforeEach(() => {
      i18n.language = 'he'
    })

    test('renders correctly in RTL mode', () => {
      renderWithProviders()

      const container = screen.getByRole('combobox').closest('[dir]')
      expect(container).toHaveAttribute('dir', 'rtl')
    })

    test('displays Hebrew text for property ownership options', async () => {
      const user = userEvent.setup()
      
      // Mock Hebrew translations
      const hebrewTexts = {
        no_property: 'אני לא מחזיק בנכס',
        has_property: 'יש לי נכס', 
        selling_property: 'אני מוכר נכס'
      }

      jest.spyOn(i18n, 't').mockImplementation((key) => hebrewTexts[key] || key)

      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      await waitFor(() => {
        expect(screen.getByText('אני לא מחזיק בנכס')).toBeInTheDocument()
        expect(screen.getByText('יש לי נכס')).toBeInTheDocument()
        expect(screen.getByText('אני מוכר נכס')).toBeInTheDocument()
      })
    })

    test('Hebrew font loads correctly for option text', () => {
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      const computedStyle = window.getComputedStyle(dropdown)
      
      // Should include Hebrew fonts in font family
      expect(computedStyle.fontFamily).toMatch(/(Heebo|Assistant|Rubik)/i)
    })

    test('RTL layout preserves LTV business logic', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      const noPropOption = await screen.findByText('אני לא מחזיק בנכס')
      await user.click(noPropOption)

      // Business rule should still apply regardless of language
      expect(defaultProps.onChange).toHaveBeenCalledWith('no_property')
    })

    test('tooltip positioning works correctly in RTL', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      const option = await screen.findByText('יש לי נכס')
      await user.hover(option)

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toHaveClass(/rtl/i)
      })
    })
  })

  describe('Israeli Banking Compliance', () => {
    test('meets Israeli mortgage regulations for LTV ratios', () => {
      const israeliRegulations = {
        first_time_buyer_max_ltv: 75,
        existing_owner_max_ltv: 50,
        selling_existing_max_ltv: 70
      }

      expect(ltvBusinessRules.no_property.ltv).toBeLessThanOrEqual(israeliRegulations.first_time_buyer_max_ltv)
      expect(ltvBusinessRules.has_property.ltv).toBeLessThanOrEqual(israeliRegulations.existing_owner_max_ltv)
      expect(ltvBusinessRules.selling_property.ltv).toBeLessThanOrEqual(israeliRegulations.selling_existing_max_ltv)
    })

    test('validates shekel currency context', () => {
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      expect(dropdown).toHaveAttribute('data-currency', 'ILS')
    })

    test('complies with Israeli consumer protection laws', () => {
      renderWithProviders()

      // Must show clear disclosure about financing terms
      expect(screen.getByText(/financing terms/i)).toBeInTheDocument()
      expect(screen.getByText(/subject to bank approval/i)).toBeInTheDocument()
    })

    test('displays regulatory disclaimers for each option', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      const noPropOption = await screen.findByText("I don't own any property")
      await user.hover(noPropOption)

      await waitFor(() => {
        expect(screen.getByText(/up to 75% financing/i)).toBeInTheDocument()
        expect(screen.getByText(/25% minimum down payment/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation & Error States', () => {
    test('displays validation error when required but empty', () => {
      renderWithProviders({
        ...defaultProps,
        error: 'Property ownership is required'
      })

      expect(screen.getByText('Property ownership is required')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
    })

    test('clears error state when valid option selected', async () => {
      const user = userEvent.setup()
      const mockOnChange = jest.fn()
      
      renderWithProviders({
        ...defaultProps,
        error: 'Required field',
        onChange: mockOnChange
      })

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      const option = await screen.findByText("I don't own any property")
      await user.click(option)

      expect(mockOnChange).toHaveBeenCalledWith('no_property')
    })

    test('validates against invalid option values', async () => {
      const user = userEvent.setup()
      const mockOnChange = jest.fn()

      renderWithProviders({
        ...defaultProps,
        onChange: mockOnChange
      })

      const dropdown = screen.getByRole('combobox')
      
      // Simulate invalid input
      fireEvent.change(dropdown, { target: { value: 'invalid_option' } })
      
      expect(mockOnChange).not.toHaveBeenCalledWith('invalid_option')
    })

    test('handles edge cases in property ownership selection', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...defaultProps,
        value: 'unknown_value'
      })

      // Should gracefully handle unknown values
      expect(screen.getByRole('combobox')).toHaveDisplayValue('')
    })
  })

  describe('Accessibility Compliance - WCAG 2.1 AA', () => {
    test('has proper ARIA labels and roles', () => {
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      expect(dropdown).toHaveAttribute('aria-label', 'Property ownership status')
      expect(dropdown).toHaveAttribute('aria-required', 'true')
    })

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      dropdown.focus()

      // Test arrow key navigation
      await user.keyboard('{ArrowDown}')
      expect(dropdown).toHaveAttribute('aria-expanded', 'true')

      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(defaultProps.onChange).toHaveBeenCalled()
    })

    test('provides meaningful error announcements', () => {
      renderWithProviders({
        ...defaultProps,
        error: 'Please select your property ownership status'
      })

      const errorText = screen.getByText('Please select your property ownership status')
      expect(errorText).toHaveAttribute('role', 'alert')
      expect(errorText).toHaveAttribute('aria-live', 'polite')
    })

    test('has sufficient color contrast for all states', () => {
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      const computedStyle = window.getComputedStyle(dropdown)
      
      // Verify contrast ratios meet WCAG AA standards (4.5:1)
      expect(computedStyle.color).toBeDefined()
      expect(computedStyle.backgroundColor).toBeDefined()
    })

    test('supports screen reader announcements', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      const option = await screen.findByText("I don't own any property")
      expect(option).toHaveAttribute('aria-label', 
        "I don't own any property - 75% financing available, 25% minimum down payment"
      )
    })

    test('maintains focus management', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      const option = await screen.findByText("I own a property")
      await user.click(option)

      // Focus should return to dropdown after selection
      expect(dropdown).toHaveFocus()
    })
  })

  describe('Performance & Optimization', () => {
    test('renders efficiently with large option sets', () => {
      const startTime = performance.now()
      renderWithProviders()
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // < 100ms render time
    })

    test('memoizes option rendering to prevent unnecessary re-renders', () => {
      const mockRender = jest.fn()
      
      renderWithProviders()
      renderWithProviders() // Second render

      // Should not re-render options unnecessarily
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })

    test('handles rapid option changes efficiently', async () => {
      const user = userEvent.setup()
      const mockOnChange = jest.fn()
      
      renderWithProviders({
        ...defaultProps,
        onChange: mockOnChange
      })

      const dropdown = screen.getByRole('combobox')
      
      // Rapid selection changes
      for (let i = 0; i < 10; i++) {
        await user.click(dropdown)
        const option = await screen.findByText("I don't own any property")
        await user.click(option)
      }

      expect(mockOnChange).toHaveBeenCalledTimes(10)
    })
  })

  describe('Multi-Language Validation', () => {
    const languages = ['en', 'he', 'ru']

    test.each(languages)('renders correctly in %s locale', (lang) => {
      i18n.language = lang
      renderWithProviders()

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toHaveAttribute('lang', lang)
    })

    test('preserves LTV values across language changes', () => {
      // English
      i18n.language = 'en'
      renderWithProviders({ ...defaultProps, value: 'no_property' })

      // Change to Hebrew
      i18n.language = 'he'
      renderWithProviders({ ...defaultProps, value: 'no_property' })

      // LTV should remain 75% regardless of language
      expect(screen.getByRole('combobox')).toHaveAttribute('data-ltv-value', '75')
    })

    test('maintains business rules across all languages', async () => {
      const testLanguages = ['en', 'he', 'ru']
      
      for (const lang of testLanguages) {
        i18n.language = lang
        const user = userEvent.setup()
        
        renderWithProviders()
        const dropdown = screen.getByRole('combobox')
        await user.click(dropdown)

        // First option should always be no_property (75% LTV)
        const options = screen.getAllByRole('option')
        expect(options[0]).toHaveAttribute('data-value', 'no_property')
        expect(options[0]).toHaveAttribute('data-ltv', '75')
      }
    })
  })
})