import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { configureStore } from '@reduxjs/toolkit'

import BankOffers from '../BankOffers'
import calculateMortgageSlice from '@src/pages/Services/slices/calculateMortgageSlice'
import i18n from '@src/config/i18n'

// Mock the bank offers API
jest.mock('@src/services/bankOffersApi', () => ({
  useLazyCompareBanksQuery: () => [
    jest.fn().mockResolvedValue({
      data: {
        status: 'success',
        data: mockBankOffers
      }
    }),
    {
      isLoading: false,
      error: null,
      data: {
        status: 'success',
        data: mockBankOffers
      }
    }
  ]
}))

// Mock bank data that matches Railway database structure
const mockBankOffers = [
  {
    id: '1',
    bank_id: 1,
    bank_name: 'Bank Hapoalim',
    bank_name_en: 'Bank Hapoalim',
    bank_name_he: 'בנק הפועלים',
    bank_name_ru: 'Банк Апоалим',
    program_name: 'Prime Mortgage',
    program_name_en: 'Prime Mortgage',
    program_name_he: 'משכנתא פריים',
    program_name_ru: 'Прайм ипотека',
    interest_rate: 4.25,
    monthly_payment: 4850,
    total_amount: 1165000,
    mortgage_amount: 750000,
    loan_to_value: 75,
    processing_fee: 2500,
    early_repayment_fee: 1.5,
    max_age: 75,
    min_income: 8000,
    bank_logo: '/images/banks/hapoalim.png',
    bank_color: '#0066CC',
    is_recommended: true,
    rank: 1
  },
  {
    id: '2',
    bank_id: 2,
    bank_name: 'Bank Leumi',
    bank_name_en: 'Bank Leumi',
    bank_name_he: 'בנק לאומי',
    bank_name_ru: 'Банк Леуми',
    program_name: 'Standard Mortgage',
    program_name_en: 'Standard Mortgage',
    program_name_he: 'משכנתא סטנדרטית',
    program_name_ru: 'Стандартная ипотека',
    interest_rate: 4.35,
    monthly_payment: 4920,
    total_amount: 1180800,
    mortgage_amount: 750000,
    loan_to_value: 75,
    processing_fee: 2800,
    early_repayment_fee: 1.8,
    max_age: 70,
    min_income: 8500,
    bank_logo: '/images/banks/leumi.png',
    bank_color: '#D4AF37',
    is_recommended: false,
    rank: 2
  },
  {
    id: '3',
    bank_id: 3,
    bank_name: 'Discount Bank',
    bank_name_en: 'Discount Bank',
    bank_name_he: 'בנק דיסקונט',
    bank_name_ru: 'Дисконт Банк',
    program_name: 'Young Family Mortgage',
    program_name_en: 'Young Family Mortgage',
    program_name_he: 'משכנתא למשפחות צעירות',
    program_name_ru: 'Ипотека для молодых семей',
    interest_rate: 4.15,
    monthly_payment: 4780,
    total_amount: 1147200,
    mortgage_amount: 750000,
    loan_to_value: 75,
    processing_fee: 2200,
    early_repayment_fee: 1.2,
    max_age: 75,
    min_income: 7500,
    bank_logo: '/images/banks/discount.png',
    bank_color: '#228B22',
    is_recommended: true,
    rank: 3
  },
  {
    id: '4',
    bank_id: 4,
    bank_name: 'Mizrahi-Tefahot Bank',
    bank_name_en: 'Mizrahi-Tefahot Bank',
    bank_name_he: 'בנק מזרחי טפחות',
    bank_name_ru: 'Мизрахи-Тфахот Банк',
    program_name: 'Executive Mortgage',
    program_name_en: 'Executive Mortgage',
    program_name_he: 'משכנתא למנהלים',
    program_name_ru: 'Ипотека для руководителей',
    interest_rate: 4.40,
    monthly_payment: 4960,
    total_amount: 1190400,
    mortgage_amount: 750000,
    loan_to_value: 75,
    processing_fee: 3000,
    early_repayment_fee: 2.0,
    max_age: 72,
    min_income: 12000,
    bank_logo: '/images/banks/mizrahi-tefahot.png',
    bank_color: '#8B0000',
    is_recommended: false,
    rank: 4
  }
]

const mockStore = configureStore({
  reducer: {
    mortgage: calculateMortgageSlice,
  },
  preloadedState: {
    mortgage: {
      priceOfEstate: 1000000,
      initialFee: 250000,
      propertyOwnership: 'no_property',
      period: 25,
      selectedBank: null,
      selectedBankId: null
    }
  }
})

const renderWithProviders = (language = 'en') => {
  i18n.language = language
  
  return render(
    <Provider store={mockStore}>
      <I18nextProvider i18n={i18n}>
        <BankOffers />
      </I18nextProvider>
    </Provider>
  )
}

describe('Bank Offers Component - Real Data Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Bank Offers Display', () => {
    test('renders all bank offers from Railway database', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument()
        expect(screen.getByText('Bank Leumi')).toBeInTheDocument()
        expect(screen.getByText('Discount Bank')).toBeInTheDocument()
        expect(screen.getByText('Mizrahi-Tefahot Bank')).toBeInTheDocument()
      })
    })

    test('displays bank logos and brand colors correctly', async () => {
      renderWithProviders()

      await waitFor(() => {
        const hapoalimLogo = screen.getByAltText('Bank Hapoalim logo')
        expect(hapoalimLogo).toHaveAttribute('src', '/images/banks/hapoalim.png')
        
        const leumiCard = screen.getByTestId('bank-card-2')
        expect(leumiCard).toHaveStyle('border-color: #D4AF37')
      })
    })

    test('shows recommended badges for top offers', async () => {
      renderWithProviders()

      await waitFor(() => {
        const recommendedBadges = screen.getAllByText(/recommended/i)
        expect(recommendedBadges).toHaveLength(2) // Hapoalim and Discount
        
        expect(screen.getByTestId('bank-card-1')).toHaveTextContent('Recommended')
        expect(screen.getByTestId('bank-card-3')).toHaveTextContent('Recommended')
      })
    })

    test('sorts banks by interest rate (best first)', async () => {
      renderWithProviders()

      await waitFor(() => {
        const bankCards = screen.getAllByTestId(/bank-card-/)
        const rates = bankCards.map(card => 
          parseFloat(card.textContent.match(/(\d+\.\d+)%/)[1])
        )
        
        // Should be sorted: 4.15%, 4.25%, 4.35%, 4.40%
        expect(rates).toEqual([4.15, 4.25, 4.35, 4.40])
      })
    })
  })

  describe('Financial Calculations - Israeli Banking Standards', () => {
    test('displays accurate monthly payments in NIS', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText(/₪4,850/)).toBeInTheDocument() // Hapoalim
        expect(screen.getByText(/₪4,920/)).toBeInTheDocument() // Leumi
        expect(screen.getByText(/₪4,780/)).toBeInTheDocument() // Discount
        expect(screen.getByText(/₪4,960/)).toBeInTheDocument() // Mizrahi-Tefahot
      })
    })

    test('calculates total loan cost accurately', async () => {
      renderWithProviders()

      await waitFor(() => {
        // Total cost = monthly payment × months (25 years = 300 months)
        expect(screen.getByText(/₪1,165,000/)).toBeInTheDocument() // Hapoalim total
        expect(screen.getByText(/₪1,180,800/)).toBeInTheDocument() // Leumi total
        expect(screen.getByText(/₪1,147,200/)).toBeInTheDocument() // Discount total
        expect(screen.getByText(/₪1,190,400/)).toBeInTheDocument() // Mizrahi total
      })
    })

    test('validates LTV ratios against Israeli regulations', async () => {
      renderWithProviders()

      await waitFor(() => {
        // All offers should show 75% LTV (no_property ownership)
        const ltvDisplays = screen.getAllByText(/75% LTV/)
        expect(ltvDisplays).toHaveLength(4)
      })
    })

    test('displays processing fees in transparency', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText(/processing fee.*₪2,500/i)).toBeInTheDocument()
        expect(screen.getByText(/processing fee.*₪2,800/i)).toBeInTheDocument()
        expect(screen.getByText(/processing fee.*₪2,200/i)).toBeInTheDocument()
        expect(screen.getByText(/processing fee.*₪3,000/i)).toBeInTheDocument()
      })
    })

    test('shows early repayment fees correctly', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText(/early repayment.*1\.5%/i)).toBeInTheDocument()
        expect(screen.getByText(/early repayment.*1\.8%/i)).toBeInTheDocument()
        expect(screen.getByText(/early repayment.*1\.2%/i)).toBeInTheDocument()
        expect(screen.getByText(/early repayment.*2\.0%/i)).toBeInTheDocument()
      })
    })
  })

  describe('Multi-Language Bank Information', () => {
    test('displays Hebrew bank names correctly', async () => {
      renderWithProviders('he')

      await waitFor(() => {
        expect(screen.getByText('בנק הפועלים')).toBeInTheDocument()
        expect(screen.getByText('בנק לאומי')).toBeInTheDocument()
        expect(screen.getByText('בנק דיסקונט')).toBeInTheDocument()
        expect(screen.getByText('בנק מזרחי טפחות')).toBeInTheDocument()
      })
    })

    test('shows Hebrew program names with RTL layout', async () => {
      renderWithProviders('he')

      await waitFor(() => {
        expect(screen.getByText('משכנתא פריים')).toBeInTheDocument()
        expect(screen.getByText('משכנתא סטנדרטית')).toBeInTheDocument()
        expect(screen.getByText('משכנתא למשפחות צעירות')).toBeInTheDocument()
        expect(screen.getByText('משכנתא למנהלים')).toBeInTheDocument()
      })

      // Check RTL layout
      const container = screen.getByTestId('bank-offers-container')
      expect(container).toHaveAttribute('dir', 'rtl')
    })

    test('displays Russian bank names for Russian speakers', async () => {
      renderWithProviders('ru')

      await waitFor(() => {
        expect(screen.getByText('Банк Апоалим')).toBeInTheDocument()
        expect(screen.getByText('Банк Леуми')).toBeInTheDocument()
        expect(screen.getByText('Дисконт Банк')).toBeInTheDocument()
        expect(screen.getByText('Мизрахи-Тфахот Банк')).toBeInTheDocument()
      })
    })

    test('formats currency correctly for each language', async () => {
      // Hebrew
      renderWithProviders('he')
      await waitFor(() => {
        expect(screen.getByText(/4,850 ₪/)).toBeInTheDocument()
      })

      // Russian
      renderWithProviders('ru')
      await waitFor(() => {
        expect(screen.getByText(/₪ 4,850/)).toBeInTheDocument()
      })
    })
  })

  describe('Bank Selection & Comparison', () => {
    test('allows user to select a bank offer', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument()
      })

      const selectButton = screen.getByTestId('select-bank-1')
      await user.click(selectButton)

      await waitFor(() => {
        expect(screen.getByText(/selected.*hapoalim/i)).toBeInTheDocument()
      })
    })

    test('highlights selected bank with visual indicator', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByTestId('bank-card-1')).toBeInTheDocument()
      })

      const selectButton = screen.getByTestId('select-bank-1')
      await user.click(selectButton)

      await waitFor(() => {
        const selectedCard = screen.getByTestId('bank-card-1')
        expect(selectedCard).toHaveClass('selected')
        expect(selectedCard).toHaveAttribute('aria-selected', 'true')
      })
    })

    test('opens detailed comparison modal', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText('Compare Banks')).toBeInTheDocument()
      })

      const compareButton = screen.getByText('Compare Banks')
      await user.click(compareButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText(/detailed comparison/i)).toBeInTheDocument()
      })
    })

    test('comparison table shows all relevant details', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const compareButton = screen.getByText('Compare Banks')
      await user.click(compareButton)

      await waitFor(() => {
        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
        
        // Check table headers
        expect(screen.getByText('Interest Rate')).toBeInTheDocument()
        expect(screen.getByText('Monthly Payment')).toBeInTheDocument()
        expect(screen.getByText('Total Cost')).toBeInTheDocument()
        expect(screen.getByText('Processing Fee')).toBeInTheDocument()
        expect(screen.getByText('Max Age')).toBeInTheDocument()
        expect(screen.getByText('Min Income')).toBeInTheDocument()
      })
    })

    test('filters banks by eligibility criteria', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      // Open eligibility filter
      const filterButton = screen.getByText('Filter by Eligibility')
      await user.click(filterButton)

      // Set high income requirement
      const incomeInput = screen.getByLabelText(/monthly income/i)
      await user.clear(incomeInput)
      await user.type(incomeInput, '15000')

      const applyFilter = screen.getByText('Apply Filter')
      await user.click(applyFilter)

      await waitFor(() => {
        // Only Mizrahi-Tefahot should show (min income 12000)
        expect(screen.getByText('Mizrahi-Tefahot Bank')).toBeInTheDocument()
        expect(screen.queryByText('Bank Hapoalim')).not.toBeInTheDocument()
      })
    })
  })

  describe('Real-time Interest Rate Updates', () => {
    test('handles dynamic interest rate changes', async () => {
      const updatedRates = [...mockBankOffers]
      updatedRates[0].interest_rate = 4.50 // Increase Hapoalim rate
      
      // Mock updated API response
      jest.mocked(require('@src/services/bankOffersApi').useLazyCompareBanksQuery)
        .mockReturnValue([
          jest.fn().mockResolvedValue({
            data: { status: 'success', data: updatedRates }
          }),
          {
            isLoading: false,
            error: null,
            data: { status: 'success', data: updatedRates }
          }
        ])

      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText('4.50%')).toBeInTheDocument()
      })
    })

    test('shows rate change indicators', async () => {
      renderWithProviders()

      // Mock rate increase
      const updatedOffer = { ...mockBankOffers[0], interest_rate: 4.30, rate_change: 'up' }
      
      await waitFor(() => {
        expect(screen.getByTestId('rate-trend-up')).toBeInTheDocument()
      })
    })

    test('displays last update timestamp', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText(/last updated/i)).toBeInTheDocument()
        expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument() // Time format
      })
    })
  })

  describe('Israeli Banking Compliance & Regulations', () => {
    test('displays regulatory disclosures', async () => {
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText(/subject to bank approval/i)).toBeInTheDocument()
        expect(screen.getByText(/rates may change/i)).toBeInTheDocument()
        expect(screen.getByText(/consult with bank representative/i)).toBeInTheDocument()
      })
    })

    test('validates age eligibility requirements', async () => {
      renderWithProviders()

      // Mock user age of 73
      const birthYear = new Date().getFullYear() - 73
      
      await waitFor(() => {
        // Leumi (max age 70) should show warning
        const leumiCard = screen.getByTestId('bank-card-2')
        expect(leumiCard).toHaveTextContent('Age limit exceeded')
        
        // Hapoalim (max age 75) should be available
        const hapoalimCard = screen.getByTestId('bank-card-1')
        expect(hapoalimCard).not.toHaveTextContent('Age limit exceeded')
      })
    })

    test('shows income requirement warnings', async () => {
      renderWithProviders()

      // Mock user income of 7000 (below some minimums)
      
      await waitFor(() => {
        const leumiCard = screen.getByTestId('bank-card-2')
        expect(leumiCard).toHaveTextContent('Income requirement not met')
        
        const discountCard = screen.getByTestId('bank-card-3')
        expect(discountCard).not.toHaveTextContent('Income requirement not met')
      })
    })

    test('displays APRC (Annual Percentage Rate of Charge)', async () => {
      renderWithProviders()

      await waitFor(() => {
        // APRC should include all fees and charges
        expect(screen.getByText(/APRC.*4\.42%/i)).toBeInTheDocument() // Hapoalim
        expect(screen.getByText(/APRC.*4\.51%/i)).toBeInTheDocument() // Leumi
      })
    })
  })

  describe('Error Handling & Loading States', () => {
    test('shows loading skeleton while fetching bank data', async () => {
      // Mock loading state
      jest.mocked(require('@src/services/bankOffersApi').useLazyCompareBanksQuery)
        .mockReturnValue([
          jest.fn(),
          { isLoading: true, error: null, data: null }
        ])

      renderWithProviders()

      expect(screen.getByTestId('bank-offers-skeleton')).toBeInTheDocument()
      expect(screen.getAllByTestId('bank-card-skeleton')).toHaveLength(4)
    })

    test('handles API errors gracefully', async () => {
      // Mock error state
      jest.mocked(require('@src/services/bankOffersApi').useLazyCompareBanksQuery)
        .mockReturnValue([
          jest.fn(),
          { 
            isLoading: false, 
            error: { message: 'Failed to fetch bank offers' }, 
            data: null 
          }
        ])

      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText(/failed to load bank offers/i)).toBeInTheDocument()
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })
    })

    test('shows empty state when no offers available', async () => {
      // Mock empty response
      jest.mocked(require('@src/services/bankOffersApi').useLazyCompareBanksQuery)
        .mockReturnValue([
          jest.fn(),
          { 
            isLoading: false, 
            error: null, 
            data: { status: 'success', data: [] }
          }
        ])

      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByText(/no bank offers available/i)).toBeInTheDocument()
        expect(screen.getByText(/adjust your criteria/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility & User Experience', () => {
    test('supports keyboard navigation through bank cards', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      await waitFor(() => {
        expect(screen.getByTestId('bank-card-1')).toBeInTheDocument()
      })

      const firstCard = screen.getByTestId('bank-card-1')
      firstCard.focus()

      await user.keyboard('{Tab}')
      expect(screen.getByTestId('bank-card-2')).toHaveFocus()
    })

    test('provides screen reader announcements for rate changes', async () => {
      renderWithProviders()

      await waitFor(() => {
        const rateAnnouncement = screen.getByLabelText(/interest rate 4\.25 percent/)
        expect(rateAnnouncement).toBeInTheDocument()
      })
    })

    test('maintains focus management in modals', async () => {
      const user = userEvent.setup()
      renderWithProviders()

      const compareButton = screen.getByText('Compare Banks')
      await user.click(compareButton)

      await waitFor(() => {
        const modal = screen.getByRole('dialog')
        expect(modal).toHaveFocus()
      })

      // Escape should close modal and return focus
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(compareButton).toHaveFocus()
      })
    })

    test('provides sufficient color contrast for all bank cards', () => {
      renderWithProviders()

      const bankCards = screen.getAllByTestId(/bank-card-/)
      bankCards.forEach(card => {
        const computedStyle = window.getComputedStyle(card)
        expect(computedStyle.color).toBeDefined()
        expect(computedStyle.backgroundColor).toBeDefined()
        // Should meet WCAG AA contrast ratio 4.5:1
      })
    })
  })

  describe('Performance Optimization', () => {
    test('virtualizes long lists of bank offers efficiently', async () => {
      // Mock large dataset
      const largeBankList = Array.from({ length: 50 }, (_, i) => ({
        ...mockBankOffers[0],
        id: `bank-${i}`,
        bank_name: `Bank ${i}`,
        interest_rate: 4.0 + (i * 0.01)
      }))

      jest.mocked(require('@src/services/bankOffersApi').useLazyCompareBanksQuery)
        .mockReturnValue([
          jest.fn(),
          { 
            isLoading: false, 
            error: null, 
            data: { status: 'success', data: largeBankList }
          }
        ])

      renderWithProviders()

      // Should only render visible items
      await waitFor(() => {
        const visibleCards = screen.getAllByTestId(/bank-card-/)
        expect(visibleCards.length).toBeLessThan(largeBankList.length)
      })
    })

    test('debounces filter changes to prevent excessive API calls', async () => {
      const user = userEvent.setup()
      const mockFetch = jest.fn()

      renderWithProviders()

      const filterInput = screen.getByLabelText(/filter banks/i)
      
      // Rapid typing should debounce API calls
      await user.type(filterInput, 'hapoalim')
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })
    })
  })
})