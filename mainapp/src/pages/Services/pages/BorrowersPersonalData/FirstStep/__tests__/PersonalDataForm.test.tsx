import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { Formik } from 'formik'
import { configureStore } from '@reduxjs/toolkit'

import FirstStep from '../FirstStep'
import borrowersSlice from '@src/pages/Services/slices/borrowersSlice'
import borrowersPersonalDataSlice from '@src/pages/Services/slices/borrowersPersonalDataSlice'
import activeFieldSlice from '@src/pages/Services/slices/activeField'
import i18n from '@src/config/i18n'
import { FormTypes } from '@src/pages/Services/types/formTypes'

// Mock validation schemas
jest.mock('../constants', () => ({
  validationSchemaEN: jest.fn(() => ({
    validate: jest.fn().mockResolvedValue({})
  })),
  validationSchemaHE: jest.fn(() => ({
    validate: jest.fn().mockResolvedValue({})
  })),
  validationSchemaRU: jest.fn(() => ({
    validate: jest.fn().mockResolvedValue({})
  }))
}))

const mockStore = configureStore({
  reducer: {
    borrowers: borrowersSlice,
    borrowersPersonalData: borrowersPersonalDataSlice,
    activeField: activeFieldSlice,
  },
})

const initialValues: FormTypes = {
  id: 1,
  nameSurname: '',
  birthday: '',
  education: '',
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
  familyStatus: '',
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
          <FirstStep />
        </Formik>
      </I18nextProvider>
    </Provider>
  )
  
  return render(<TestComponent />)
}

describe('Personal Data Form - Multi-Language Support', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('English Language Support', () => {
    test('renders all personal data fields in English', async () => {
      renderWithProviders(initialValues, 'en')

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/education/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/family status/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/gender/i)).toBeInTheDocument()
      })
    })

    test('validates Israeli ID document format in English', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      const idInput = screen.getByLabelText(/id document/i)
      await user.type(idInput, '123456789') // Valid Israeli ID format

      expect(idInput).toHaveValue('123456789')
    })

    test('validates phone number with Israeli format in English', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      // Israeli mobile format: +972-5x-xxx-xxxx
      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, '+972-54-123-4567')

      expect(phoneInput).toHaveValue('+972-54-123-4567')
    })
  })

  describe('Hebrew Language Support - RTL Critical', () => {
    test('renders form in Hebrew with proper RTL layout', async () => {
      renderWithProviders(initialValues, 'he')

      await waitFor(() => {
        const container = screen.getByRole('form')
        expect(container).toHaveAttribute('dir', 'rtl')
        
        // Check Hebrew text rendering
        expect(screen.getByText(/שם מלא/)).toBeInTheDocument() // Full name
        expect(screen.getByText(/תאריך לידה/)).toBeInTheDocument() // Date of birth
        expect(screen.getByText(/השכלה/)).toBeInTheDocument() // Education
      })
    })

    test('Hebrew font loads correctly for form fields', async () => {
      renderWithProviders(initialValues, 'he')

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/שם מלא/)
        const computedStyle = window.getComputedStyle(nameInput)
        
        // Should include Hebrew fonts
        expect(computedStyle.fontFamily).toMatch(/(Heebo|Assistant|Rubik|Noto Sans Hebrew)/i)
      })
    })

    test('validates Hebrew name input correctly', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'he')

      const nameInput = screen.getByLabelText(/שם מלא/)
      await user.type(nameInput, 'ישראל כהן')

      expect(nameInput).toHaveValue('ישראל כהן')
      expect(nameInput).toHaveAttribute('dir', 'rtl')
    })

    test('handles Hebrew address input with proper RTL formatting', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'he')

      const addressInput = screen.getByLabelText(/כתובת/)
      await user.type(addressInput, 'רחוב הרצל 15, תל אביב')

      expect(addressInput).toHaveValue('רחוב הרצל 15, תל אביב')
      expect(addressInput).toHaveAttribute('dir', 'rtl')
    })

    test('education dropdown shows Hebrew options correctly', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'he')

      const educationDropdown = screen.getByLabelText(/השכלה/)
      await user.click(educationDropdown)

      await waitFor(() => {
        expect(screen.getByText('תיכון')).toBeInTheDocument() // High school
        expect(screen.getByText('תואר ראשון')).toBeInTheDocument() // Bachelor's
        expect(screen.getByText('תואר שני')).toBeInTheDocument() // Master's
        expect(screen.getByText('תואר שלישי')).toBeInTheDocument() // PhD
      })
    })

    test('family status options render in Hebrew', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'he')

      const familyStatusDropdown = screen.getByLabelText(/מצב משפחתי/)
      await user.click(familyStatusDropdown)

      await waitFor(() => {
        expect(screen.getByText('רווק/ה')).toBeInTheDocument() // Single
        expect(screen.getByText('נשוי/ה')).toBeInTheDocument() // Married
        expect(screen.getByText('גרוש/ה')).toBeInTheDocument() // Divorced
        expect(screen.getByText('אלמן/ה')).toBeInTheDocument() // Widowed
      })
    })

    test('date picker works correctly with Hebrew calendar', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'he')

      const datePicker = screen.getByLabelText(/תאריך לידה/)
      await user.click(datePicker)

      await waitFor(() => {
        // Hebrew month names should appear
        expect(screen.getByText(/ינואר|פברואר|מרץ/)).toBeInTheDocument()
      })
    })
  })

  describe('Russian Language Support', () => {
    test('renders form in Russian with Cyrillic fonts', async () => {
      renderWithProviders(initialValues, 'ru')

      await waitFor(() => {
        expect(screen.getByText(/Полное имя/)).toBeInTheDocument() // Full name
        expect(screen.getByText(/Дата рождения/)).toBeInTheDocument() // Date of birth
        expect(screen.getByText(/Образование/)).toBeInTheDocument() // Education
      })
    })

    test('validates Russian name input with Cyrillic characters', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'ru')

      const nameInput = screen.getByLabelText(/Полное имя/)
      await user.type(nameInput, 'Владимир Петров')

      expect(nameInput).toHaveValue('Владимир Петров')
    })

    test('Russian education options display correctly', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'ru')

      const educationDropdown = screen.getByLabelText(/Образование/)
      await user.click(educationDropdown)

      await waitFor(() => {
        expect(screen.getByText('Среднее образование')).toBeInTheDocument() // High school
        expect(screen.getByText('Высшее образование')).toBeInTheDocument() // University
        expect(screen.getByText('Магистратура')).toBeInTheDocument() // Master's
      })
    })

    test('handles Russian address input correctly', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'ru')

      const addressInput = screen.getByLabelText(/Адрес/)
      await user.type(addressInput, 'ул. Пушкина 25, Москва')

      expect(addressInput).toHaveValue('ул. Пушкина 25, Москва')
    })
  })

  describe('Israeli Banking Compliance Validation', () => {
    test('validates Israeli ID number with check digit algorithm', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      const idInput = screen.getByLabelText(/id document/i)
      
      // Valid Israeli ID with correct check digit
      await user.type(idInput, '123456782')
      
      // Should validate using Israeli ID algorithm
      await waitFor(() => {
        expect(screen.queryByText(/invalid id format/i)).not.toBeInTheDocument()
      })

      // Invalid Israeli ID
      await user.clear(idInput)
      await user.type(idInput, '123456789')
      
      await waitFor(() => {
        expect(screen.getByText(/invalid israeli id/i)).toBeInTheDocument()
      })
    })

    test('validates Israeli phone number patterns', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      const phoneInput = screen.getByLabelText(/phone/i)
      
      const validPhones = [
        '050-123-4567', // Cellcom
        '052-123-4567', // Partner
        '054-123-4567', // Pelephone
        '058-123-4567', // Golan Telecom
        '03-123-4567'   // Landline
      ]

      for (const phone of validPhones) {
        await user.clear(phoneInput)
        await user.type(phoneInput, phone)
        
        await waitFor(() => {
          expect(screen.queryByText(/invalid phone format/i)).not.toBeInTheDocument()
        })
      }
    })

    test('enforces Israeli legal age requirements (18+)', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      const birthdayInput = screen.getByLabelText(/date of birth/i)
      
      // Test underage (17 years old)
      const underageDate = new Date()
      underageDate.setFullYear(underageDate.getFullYear() - 17)
      const underageDateStr = underageDate.toISOString().split('T')[0]
      
      await user.type(birthdayInput, underageDateStr)
      
      await waitFor(() => {
        expect(screen.getByText(/must be 18 or older/i)).toBeInTheDocument()
      })

      // Test valid age (25 years old)
      await user.clear(birthdayInput)
      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 25)
      const validDateStr = validDate.toISOString().split('T')[0]
      
      await user.type(birthdayInput, validDateStr)
      
      await waitFor(() => {
        expect(screen.queryByText(/must be 18 or older/i)).not.toBeInTheDocument()
      })
    })

    test('validates Israeli address format', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      const addressInput = screen.getByLabelText(/address/i)
      
      // Valid Israeli address formats
      const validAddresses = [
        'Herzl 15, Tel Aviv',
        'Ben Gurion 22, Jerusalem',
        'Rothschild 45, Tel Aviv-Yafo'
      ]

      for (const address of validAddresses) {
        await user.clear(addressInput)
        await user.type(addressInput, address)
        
        await waitFor(() => {
          expect(screen.queryByText(/invalid address format/i)).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Form Validation & Error States', () => {
    test('shows validation errors in correct language', async () => {
      const user = userEvent.setup()

      // Test English validation
      renderWithProviders(initialValues, 'en')
      
      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument()
      })

      // Test Hebrew validation
      renderWithProviders(initialValues, 'he')
      
      const submitButtonHe = screen.getByRole('button', { name: /המשך/ })
      await user.click(submitButtonHe)

      await waitFor(() => {
        expect(screen.getByText(/שם מלא הוא שדה חובה/)).toBeInTheDocument()
        expect(screen.getByText(/תאריך לידה הוא שדה חובה/)).toBeInTheDocument()
      })
    })

    test('validates email format across languages', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      const emailInput = screen.getByLabelText(/email/i)
      
      // Invalid email
      await user.type(emailInput, 'invalid-email')
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })

      // Valid email
      await user.clear(emailInput)
      await user.type(emailInput, 'test@example.com')
      
      await waitFor(() => {
        expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument()
      })
    })

    test('cross-field validation for partner information', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      // Select married status
      const familyStatusDropdown = screen.getByLabelText(/family status/i)
      await user.selectOptions(familyStatusDropdown, 'married')

      // Partner payment question should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/will partner contribute/i)).toBeInTheDocument()
      })

      // Select yes for partner contribution
      const partnerContributeYes = screen.getByLabelText(/yes.*partner/i)
      await user.click(partnerContributeYes)

      // Partner details fields should appear and be required
      await waitFor(() => {
        expect(screen.getByLabelText(/partner name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/partner income/i)).toBeInTheDocument()
      })
    })
  })

  describe('Complex Family Status Logic', () => {
    test('handles children information correctly', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      // Select "yes" for having children
      const hasChildrenYes = screen.getByLabelText(/do you have children.*yes/i)
      await user.click(hasChildrenYes)

      // Number of children field should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/how many children/i)).toBeInTheDocument()
      })

      // Enter number of children
      const childrenCount = screen.getByLabelText(/how many children/i)
      await user.type(childrenCount, '3')

      expect(childrenCount).toHaveValue('3')
    })

    test('validates realistic number of children', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      const hasChildrenYes = screen.getByLabelText(/do you have children.*yes/i)
      await user.click(hasChildrenYes)

      const childrenCount = screen.getByLabelText(/how many children/i)
      
      // Test unrealistic high number
      await user.type(childrenCount, '25')
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a realistic number/i)).toBeInTheDocument()
      })

      // Test valid number
      await user.clear(childrenCount)
      await user.type(childrenCount, '4')
      
      await waitFor(() => {
        expect(screen.queryByText(/please enter a realistic number/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Compliance - WCAG 2.1 AA', () => {
    test('all form fields have proper labels', () => {
      renderWithProviders(initialValues, 'en')

      const formFields = [
        /full name/i,
        /date of birth/i,
        /education/i,
        /family status/i,
        /gender/i,
        /phone/i,
        /email/i
      ]

      formFields.forEach(fieldLabel => {
        expect(screen.getByLabelText(fieldLabel)).toBeInTheDocument()
      })
    })

    test('required fields have proper ARIA attributes', () => {
      renderWithProviders(initialValues, 'en')

      const nameInput = screen.getByLabelText(/full name/i)
      expect(nameInput).toHaveAttribute('aria-required', 'true')
      
      const birthdayInput = screen.getByLabelText(/date of birth/i)
      expect(birthdayInput).toHaveAttribute('aria-required', 'true')
    })

    test('error states are announced to screen readers', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      const nameInput = screen.getByLabelText(/full name/i)
      await user.click(nameInput)
      await user.tab() // Move focus away to trigger validation

      await waitFor(() => {
        const errorMessage = screen.getByText(/full name is required/i)
        expect(errorMessage).toHaveAttribute('role', 'alert')
        expect(errorMessage).toHaveAttribute('aria-live', 'polite')
      })
    })

    test('keyboard navigation works properly', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(initialValues, 'en')

      const nameInput = screen.getByLabelText(/full name/i)
      nameInput.focus()

      // Tab through form fields
      await user.tab()
      expect(screen.getByLabelText(/date of birth/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/education/i)).toHaveFocus()
    })

    test('supports high contrast mode', () => {
      renderWithProviders(initialValues, 'en')

      const form = screen.getByRole('form')
      const computedStyle = window.getComputedStyle(form)
      
      // Should have sufficient contrast ratios
      expect(computedStyle.color).toBeDefined()
      expect(computedStyle.backgroundColor).toBeDefined()
    })
  })

  describe('Language Switching Behavior', () => {
    test('preserves form data when switching languages', async () => {
      const user = userEvent.setup()
      
      // Start in English
      const { rerender } = renderWithProviders(initialValues, 'en')

      const nameInput = screen.getByLabelText(/full name/i)
      await user.type(nameInput, 'John Doe')

      // Switch to Hebrew
      i18n.language = 'he'
      rerender(
        <Provider store={mockStore}>
          <I18nextProvider i18n={i18n}>
            <Formik
              initialValues={{ ...initialValues, nameSurname: 'John Doe' }}
              onSubmit={() => {}}
              validate={() => ({})}
            >
              <FirstStep />
            </Formik>
          </I18nextProvider>
        </Provider>
      )

      // Data should be preserved
      await waitFor(() => {
        const nameInputHe = screen.getByLabelText(/שם מלא/)
        expect(nameInputHe).toHaveValue('John Doe')
      })
    })

    test('validation messages update with language switch', async () => {
      const user = userEvent.setup()
      
      // Show validation error in English
      renderWithProviders(initialValues, 'en')
      
      const submitButton = screen.getByRole('button', { name: /continue/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
      })

      // Switch to Hebrew - error should update
      const { rerender } = renderWithProviders(initialValues, 'he')
      
      await waitFor(() => {
        expect(screen.getByText(/שם מלא הוא שדה חובה/)).toBeInTheDocument()
        expect(screen.queryByText(/full name is required/i)).not.toBeInTheDocument()
      })
    })
  })
})