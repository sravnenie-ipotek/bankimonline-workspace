import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { Formik } from 'formik'
import { configureStore } from '@reduxjs/toolkit'

import SecondStep from '../SecondStep'
import borrowersSlice from '@src/pages/Services/slices/borrowersSlice'
import modalSlice from '@src/pages/Services/slices/modalSlice'
import activeFieldSlice from '@src/pages/Services/slices/activeField'
import i18n from '@src/config/i18n'
import { FormTypes } from '@src/pages/Services/types/formTypes'

const mockStore = configureStore({
  reducer: {
    borrowers: borrowersSlice,
    modal: modalSlice,
    activeField: activeFieldSlice,
  },
})

const initialValues: FormTypes = {
  id: 1,
  nameSurname: 'John Doe',
  birthday: '1990-05-15',
  education: 'university',
  additionalCitizenships: null,
  citizenshipsDropdown: [],
  taxes: null,
  countriesPayTaxes: [],
  childrens: null,
  howMuchChildrens: 0,
  medicalInsurance: null,
  isForeigner: null,
  publicPerson: null,
  borrowers: null,
  familyStatus: 'married',
  partnerPayMortgage: null,
  addPartner: '',
  mainSourceOfIncome: '',
  monthlyIncome: null,
  startDate: '',
  fieldOfActivity: '',
  profession: '',
  companyName: '',
  additionalIncome: '',
  additionalIncomeAmount: null,
  obligation: '',
  bank: '',
  monthlyPaymentForAnotherBank: null,
  endDate: '',
  amountIncomeCurrentYear: null,
  noIncome: '',
  whoAreYouForBorrowers: '',
  address: '',
  idDocument: '',
  documentIssueDate: '',
  gender: '',
  propertyOwnership: ''
}

const renderWithProviders = (values: FormTypes = initialValues, language = 'en') => {
  i18n.language = language
  
  const TestComponent = () => (
    <Provider store={mockStore}>
      <I18nextProvider i18n={i18n}>
        <Formik
          initialValues={values}
          onSubmit={() => {}}
          validate={() => ({})}
        >
          <SecondStep />
        </Formik>
      </I18nextProvider>
    </Provider>
  )
  
  return render(<TestComponent />)
}

describe('Income Data Form - Israeli Banking Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Main Income Source Validation', () => {
    test('displays all Israeli employment types', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues)

      const incomeSourceDropdown = screen.getByLabelText(/main source of income/i)
      await user.click(incomeSourceDropdown)

      await waitFor(() => {
        expect(screen.getByText('Employed')).toBeInTheDocument()
        expect(screen.getByText('Self-employed')).toBeInTheDocument()
        expect(screen.getByText('Freelancer')).toBeInTheDocument()
        expect(screen.getByText('Business Owner')).toBeInTheDocument()
        expect(screen.getByText('Pensioner')).toBeInTheDocument()
        expect(screen.getByText('Student')).toBeInTheDocument()
      })
    })

    test('validates Israeli minimum wage compliance', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed'
      })

      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i)
      
      // Test below minimum wage (5,300 NIS as of 2024)
      await user.type(monthlyIncomeInput, '4000')
      
      await waitFor(() => {
        expect(screen.getByText(/income below minimum wage/i)).toBeInTheDocument()
      })

      // Test above minimum wage
      await user.clear(monthlyIncomeInput)
      await user.type(monthlyIncomeInput, '8000')
      
      await waitFor(() => {
        expect(screen.queryByText(/income below minimum wage/i)).not.toBeInTheDocument()
      })
    })

    test('enforces Israeli employment tenure requirements', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed'
      })

      const startDateInput = screen.getByLabelText(/employment start date/i)
      
      // Test employment less than 3 months (insufficient for mortgage)
      const recentDate = new Date()
      recentDate.setMonth(recentDate.getMonth() - 2)
      const recentDateStr = recentDate.toISOString().split('T')[0]
      
      await user.type(startDateInput, recentDateStr)
      
      await waitFor(() => {
        expect(screen.getByText(/minimum 3 months employment required/i)).toBeInTheDocument()
      })

      // Test employment over 3 months
      await user.clear(startDateInput)
      const validDate = new Date()
      validDate.setMonth(validDate.getMonth() - 6)
      const validDateStr = validDate.toISOString().split('T')[0]
      
      await user.type(startDateInput, validDateStr)
      
      await waitFor(() => {
        expect(screen.queryByText(/minimum 3 months employment required/i)).not.toBeInTheDocument()
      })
    })

    test('validates Israeli company name format', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed'
      })

      const companyNameInput = screen.getByLabelText(/company name/i)
      
      // Valid Israeli company formats
      const validCompanies = [
        'Microsoft Israel Ltd.',
        'בנק לאומי לישראל בע״מ',
        'Teva Pharmaceutical Industries Ltd.',
        'מחקרי פיתוח בע״מ'
      ]

      for (const company of validCompanies) {
        await user.clear(companyNameInput)
        await user.type(companyNameInput, company)
        
        await waitFor(() => {
          expect(screen.queryByText(/invalid company name format/i)).not.toBeInTheDocument()
        })
      }
    })

    test('validates Israeli business registration number for self-employed', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'self_employed'
      })

      // Business registration number field should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/business registration number/i)).toBeInTheDocument()
      })

      const businessRegInput = screen.getByLabelText(/business registration number/i)
      
      // Valid Israeli business number format (9 digits)
      await user.type(businessRegInput, '123456789')
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid business registration/i)).not.toBeInTheDocument()
      })

      // Invalid format
      await user.clear(businessRegInput)
      await user.type(businessRegInput, '12345')
      
      await waitFor(() => {
        expect(screen.getByText(/invalid business registration format/i)).toBeInTheDocument()
      })
    })
  })

  describe('Field of Activity - Israeli Industry Classification', () => {
    test('displays Israeli standard industry classifications', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed'
      })

      const fieldOfActivityDropdown = screen.getByLabelText(/field of activity/i)
      await user.click(fieldOfActivityDropdown)

      await waitFor(() => {
        // Israeli major industries
        expect(screen.getByText('Technology')).toBeInTheDocument()
        expect(screen.getByText('Banking & Finance')).toBeInTheDocument()
        expect(screen.getByText('Healthcare')).toBeInTheDocument()
        expect(screen.getByText('Education')).toBeInTheDocument()
        expect(screen.getByText('Manufacturing')).toBeInTheDocument()
        expect(screen.getByText('Agriculture')).toBeInTheDocument()
        expect(screen.getByText('Tourism & Hospitality')).toBeInTheDocument()
        expect(screen.getByText('Security & Defense')).toBeInTheDocument()
      })
    })

    test('shows profession options based on selected field', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed',
        fieldOfActivity: 'technology'
      })

      const professionDropdown = screen.getByLabelText(/profession/i)
      await user.click(professionDropdown)

      await waitFor(() => {
        // Technology-specific professions
        expect(screen.getByText('Software Engineer')).toBeInTheDocument()
        expect(screen.getByText('Product Manager')).toBeInTheDocument()
        expect(screen.getByText('Data Scientist')).toBeInTheDocument()
        expect(screen.getByText('DevOps Engineer')).toBeInTheDocument()
        expect(screen.getByText('QA Engineer')).toBeInTheDocument()
      })
    })

    test('validates profession income ranges for Israeli market', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed',
        fieldOfActivity: 'technology',
        profession: 'software_engineer'
      })

      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i)
      
      // Test unrealistically low income for software engineer
      await user.type(monthlyIncomeInput, '6000')
      
      await waitFor(() => {
        expect(screen.getByText(/income seems low for this profession/i)).toBeInTheDocument()
      })

      // Test reasonable income
      await user.clear(monthlyIncomeInput)
      await user.type(monthlyIncomeInput, '18000')
      
      await waitFor(() => {
        expect(screen.queryByText(/income seems low for this profession/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Additional Income Sources', () => {
    test('handles multiple additional income sources', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues)

      // Select yes for additional income
      const additionalIncomeYes = screen.getByLabelText(/additional income.*yes/i)
      await user.click(additionalIncomeYes)

      // Additional income modal should open
      await waitFor(() => {
        expect(screen.getByText(/add additional income/i)).toBeInTheDocument()
      })

      // Add rental income
      const incomeTypeDropdown = screen.getByLabelText(/income type/i)
      await user.selectOptions(incomeTypeDropdown, 'rental_income')

      const amountInput = screen.getByLabelText(/amount/i)
      await user.type(amountInput, '4000')

      const addButton = screen.getByRole('button', { name: /add income/i })
      await user.click(addButton)

      // Should show added income in summary
      await waitFor(() => {
        expect(screen.getByText(/rental income.*₪4,000/i)).toBeInTheDocument()
      })
    })

    test('validates additional income documentation requirements', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues)

      const additionalIncomeYes = screen.getByLabelText(/additional income.*yes/i)
      await user.click(additionalIncomeYes)

      // Select business income
      const incomeTypeDropdown = screen.getByLabelText(/income type/i)
      await user.selectOptions(incomeTypeDropdown, 'business_income')

      // Should show documentation requirements
      await waitFor(() => {
        expect(screen.getByText(/tax returns required/i)).toBeInTheDocument()
        expect(screen.getByText(/profit and loss statements/i)).toBeInTheDocument()
      })
    })

    test('calculates total income correctly with multiple sources', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed',
        monthlyIncome: 15000
      })

      // Add additional income
      const additionalIncomeYes = screen.getByLabelText(/additional income.*yes/i)
      await user.click(additionalIncomeYes)

      // Add rental income
      const incomeTypeDropdown = screen.getByLabelText(/income type/i)
      await user.selectOptions(incomeTypeDropdown, 'rental_income')

      const amountInput = screen.getByLabelText(/amount/i)
      await user.type(amountInput, '3000')

      const addButton = screen.getByRole('button', { name: /add income/i })
      await user.click(addButton)

      // Total income should be calculated
      await waitFor(() => {
        expect(screen.getByText(/total monthly income.*₪18,000/i)).toBeInTheDocument()
      })
    })
  })

  describe('Existing Obligations & Debts', () => {
    test('validates existing mortgage payments', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues)

      // Select yes for existing obligations
      const obligationYes = screen.getByLabelText(/existing obligations.*yes/i)
      await user.click(obligationYes)

      // Obligation modal should open
      await waitFor(() => {
        expect(screen.getByText(/add existing obligation/i)).toBeInTheDocument()
      })

      // Select mortgage
      const obligationTypeDropdown = screen.getByLabelText(/obligation type/i)
      await user.selectOptions(obligationTypeDropdown, 'mortgage')

      // Bank selection should appear
      const bankDropdown = screen.getByLabelText(/bank/i)
      await user.click(bankDropdown)

      await waitFor(() => {
        expect(screen.getByText('Bank Hapoalim')).toBeInTheDocument()
        expect(screen.getByText('Bank Leumi')).toBeInTheDocument()
        expect(screen.getByText('Discount Bank')).toBeInTheDocument()
        expect(screen.getByText('Mizrahi-Tefahot Bank')).toBeInTheDocument()
      })

      await user.selectOptions(bankDropdown, 'bank_hapoalim')

      const monthlyPaymentInput = screen.getByLabelText(/monthly payment/i)
      await user.type(monthlyPaymentInput, '3500')

      const endDateInput = screen.getByLabelText(/end date/i)
      await user.type(endDateInput, '2035-12-31')

      const addObligationButton = screen.getByRole('button', { name: /add obligation/i })
      await user.click(addObligationButton)

      // Should show added obligation
      await waitFor(() => {
        expect(screen.getByText(/mortgage.*bank hapoalim.*₪3,500/i)).toBeInTheDocument()
      })
    })

    test('calculates debt-to-income ratio for Israeli banking standards', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed',
        monthlyIncome: 20000
      })

      // Add existing obligation
      const obligationYes = screen.getByLabelText(/existing obligations.*yes/i)
      await user.click(obligationYes)

      const obligationTypeDropdown = screen.getByLabelText(/obligation type/i)
      await user.selectOptions(obligationTypeDropdown, 'credit_card')

      const monthlyPaymentInput = screen.getByLabelText(/monthly payment/i)
      await user.type(monthlyPaymentInput, '2000')

      const addObligationButton = screen.getByRole('button', { name: /add obligation/i })
      await user.click(addObligationButton)

      // Should show DTI calculation (2000/20000 = 10%)
      await waitFor(() => {
        expect(screen.getByText(/debt to income ratio.*10%/i)).toBeInTheDocument()
      })

      // Should warn if DTI exceeds Israeli banking limits (typically 40%)
      await user.clear(monthlyPaymentInput)
      await user.type(monthlyPaymentInput, '9000') // 45% DTI

      await waitFor(() => {
        expect(screen.getByText(/debt ratio exceeds recommended limit/i)).toBeInTheDocument()
      })
    })

    test('validates Israeli credit card debt limits', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues)

      const obligationYes = screen.getByLabelText(/existing obligations.*yes/i)
      await user.click(obligationYes)

      const obligationTypeDropdown = screen.getByLabelText(/obligation type/i)
      await user.selectOptions(obligationTypeDropdown, 'credit_card')

      const monthlyPaymentInput = screen.getByLabelText(/monthly payment/i)
      
      // Test extremely high credit card payment
      await user.type(monthlyPaymentInput, '15000')
      
      await waitFor(() => {
        expect(screen.getByText(/unusually high credit card payment/i)).toBeInTheDocument()
      })
    })
  })

  describe('Annual Income Verification', () => {
    test('requires annual income for self-employed applicants', async () => {
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'self_employed'
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/annual income current year/i)).toBeInTheDocument()
        expect(screen.getByText(/required for self-employed/i)).toBeInTheDocument()
      })
    })

    test('validates consistency between monthly and annual income', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'self_employed'
      })

      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i)
      await user.type(monthlyIncomeInput, '15000')

      const annualIncomeInput = screen.getByLabelText(/annual income current year/i)
      await user.type(annualIncomeInput, '100000') // Inconsistent with monthly (should be ~180000)

      await waitFor(() => {
        expect(screen.getByText(/annual income inconsistent with monthly/i)).toBeInTheDocument()
      })

      // Test consistent values
      await user.clear(annualIncomeInput)
      await user.type(annualIncomeInput, '180000')

      await waitFor(() => {
        expect(screen.queryByText(/annual income inconsistent with monthly/i)).not.toBeInTheDocument()
      })
    })

    test('shows tax return requirements for high income earners', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed'
      })

      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i)
      
      // High income (above average Israeli salary)
      await user.type(monthlyIncomeInput, '35000')

      await waitFor(() => {
        expect(screen.getByText(/tax returns may be required/i)).toBeInTheDocument()
        expect(screen.getByText(/salary slips from last 3 months/i)).toBeInTheDocument()
      })
    })
  })

  describe('Multi-Language Income Validation', () => {
    test('validates income fields in Hebrew', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'he')

      await waitFor(() => {
        expect(screen.getByLabelText(/מקור הכנסה עיקרי/)).toBeInTheDocument()
        expect(screen.getByLabelText(/הכנסה חודשית/)).toBeInTheDocument()
        expect(screen.getByLabelText(/שם חברה/)).toBeInTheDocument()
      })

      const incomeInput = screen.getByLabelText(/הכנסה חודשית/)
      await user.type(incomeInput, '15000')

      // Should format as Hebrew currency
      await waitFor(() => {
        expect(incomeInput).toHaveValue('15,000')
      })
    })

    test('validates Hebrew company names correctly', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed'
      }, 'he')

      const companyNameInput = screen.getByLabelText(/שם חברה/)
      
      // Hebrew company name
      await user.type(companyNameInput, 'בנק לאומי לישראל בע״מ')
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid company name format/i)).not.toBeInTheDocument()
      })
    })

    test('shows Hebrew profession options', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed',
        fieldOfActivity: 'technology'
      }, 'he')

      const professionDropdown = screen.getByLabelText(/מקצוע/)
      await user.click(professionDropdown)

      await waitFor(() => {
        expect(screen.getByText('מהנדס תוכנה')).toBeInTheDocument()
        expect(screen.getByText('מנהל מוצר')).toBeInTheDocument()
        expect(screen.getByText('מדען נתונים')).toBeInTheDocument()
      })
    })
  })

  describe('Income Calculation Edge Cases', () => {
    test('handles irregular income patterns for freelancers', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'freelancer'
      })

      // Freelancer should show average income over period
      await waitFor(() => {
        expect(screen.getByText(/average monthly income/i)).toBeInTheDocument()
        expect(screen.getByText(/last 12 months/i)).toBeInTheDocument()
      })

      const averageIncomeInput = screen.getByLabelText(/average monthly income/i)
      await user.type(averageIncomeInput, '12000')

      // Should show variability warning
      await waitFor(() => {
        expect(screen.getByText(/income may vary significantly/i)).toBeInTheDocument()
      })
    })

    test('validates pension income for retirees', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'pensioner'
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/pension amount/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/pension source/i)).toBeInTheDocument()
      })

      const pensionSourceDropdown = screen.getByLabelText(/pension source/i)
      await user.click(pensionSourceDropdown)

      await waitFor(() => {
        expect(screen.getByText('National Insurance')).toBeInTheDocument()
        expect(screen.getByText('Private Pension Fund')).toBeInTheDocument()
        expect(screen.getByText('Employer Pension')).toBeInTheDocument()
      })
    })

    test('calculates combined income for married couples', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        familyStatus: 'married',
        mainSourceOfIncome: 'employed',
        monthlyIncome: 15000,
        partnerPayMortgage: 'yes'
      })

      // Partner income fields should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/partner income/i)).toBeInTheDocument()
      })

      const partnerIncomeInput = screen.getByLabelText(/partner income/i)
      await user.type(partnerIncomeInput, '12000')

      // Should show combined household income
      await waitFor(() => {
        expect(screen.getByText(/combined household income.*₪27,000/i)).toBeInTheDocument()
      })
    })
  })

  describe('Israeli Tax Compliance', () => {
    test('validates tax residency status', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues)

      // Tax residency question should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/israeli tax resident/i)).toBeInTheDocument()
      })

      const taxResidentNo = screen.getByLabelText(/tax resident.*no/i)
      await user.click(taxResidentNo)

      // Foreign tax obligations should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/countries where you pay taxes/i)).toBeInTheDocument()
      })

      const foreignTaxCountries = screen.getByLabelText(/countries where you pay taxes/i)
      await user.type(foreignTaxCountries, 'United States')

      // FATCA compliance warning should appear
      await waitFor(() => {
        expect(screen.getByText(/FATCA reporting requirements/i)).toBeInTheDocument()
      })
    })

    test('handles dual citizenship tax implications', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        additionalCitizenships: 'yes',
        citizenshipsDropdown: ['usa']
      })

      // US citizenship should trigger tax warnings
      await waitFor(() => {
        expect(screen.getByText(/US tax obligations apply/i)).toBeInTheDocument()
        expect(screen.getByText(/may affect mortgage qualification/i)).toBeInTheDocument()
      })
    })
  })

  describe('Performance & UX Optimization', () => {
    test('debounces income calculations to prevent excessive processing', async () => {
      const user = userEvent.setup()
      const mockCalculate = jest.fn()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed'
      })

      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i)
      
      // Rapid typing should debounce calculations
      await user.type(monthlyIncomeInput, '123456789')
      
      await waitFor(() => {
        // Should not calculate for every character
        expect(mockCalculate).toHaveBeenCalledTimes(1)
      })
    })

    test('provides real-time income validation feedback', async () => {
      const user = userEvent.setup()
      
      renderWithProviders({
        ...initialValues,
        mainSourceOfIncome: 'employed'
      })

      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i)
      
      // Should show formatting as user types
      await user.type(monthlyIncomeInput, '15000')
      
      await waitFor(() => {
        expect(monthlyIncomeInput).toHaveDisplayValue('15,000')
      })

      // Should show qualification indicator
      await waitFor(() => {
        expect(screen.getByText(/✓ meets minimum requirements/i)).toBeInTheDocument()
      })
    })
  })
})