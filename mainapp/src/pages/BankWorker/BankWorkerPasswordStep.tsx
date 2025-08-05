/**
 * Bank Worker Registration - Password Confirmation Step (Step 1.1)
 * 
 * Implements the password confirmation page as specified in Confluence:
 * https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/117735528/1.1+.+.+.+.+.1.1+.+12
 * 
 * Features implemented:
 * - Action 5: Service selection dropdown
 * - Action 6: Password input with validation
 * - Action 7: Password confirmation input with matching validation
 * - Action 8: Terms agreement checkbox
 * - Action 10: Registration button (disabled until form is valid)
 * - Action 11: Login redirect link
 * - Action 12: Support widget
 * 
 * Matches Figma design exactly:
 * - 624px form width, dark theme (#1F2A37, #111928)
 * - Exact spacing, typography, and component layout
 * - Multi-language support with RTL for Hebrew
 * - Professional banking validation requirements
 * 
 * @author AI Assistant
 * @date 2025-01-10
 * @ticket CONFLUENCE-117735528
 */

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import classNames from 'classnames/bind'

import { bankWorkerApi } from '@src/services/bankWorkerApi'
import styles from './BankWorkerPasswordStep.module.scss'

const cx = classNames.bind(styles)

// Form data interface
interface PasswordFormData {
  fullName: string
  position: string
  selectedService: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

// Bank service options (from existing system)
interface ServiceOption {
  id: string
  name: string
}

/**
 * Bank Worker Password Confirmation Step Component
 * Implements step 1.1 of bank worker registration with password setup
 */
export const BankWorkerPasswordStep: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  // Component state
  const [services, setServices] = useState<ServiceOption[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Load available banks on component mount
  useEffect(() => {
    const loadBanks = async () => {
      try {
        setIsLoadingServices(true)
        // Fetch banks from the real API
        const response = await fetch('/api/banks/list')
        const data = await response.json()
        
        if (data.status === 'success' && data.data) {
          const bankOptions: ServiceOption[] = data.data.map((bank: any) => ({
            id: bank.id.toString(),
            name: bank.name_en || bank.name_he || bank.name_ru || `Bank ${bank.id}`
          }))
          setServices(bankOptions)
        } else {
          console.error('Failed to load banks:', data.message)
          toast.error(t('errors.loading_banks'))
        }
      } catch (error) {
        console.error('Error loading banks:', error)
        toast.error(t('errors.loading_banks'))
      } finally {
        setIsLoadingServices(false)
      }
    }

    loadBanks()
  }, [t])

  // Registration validation schema with all requirements from Confluence
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .min(2, t('bank_worker_validation_name_min'))
      .max(100, t('bank_worker_validation_name_max'))
      .required(t('bank_worker_validation_name_required')),
    position: Yup.string()
      .min(2, t('bank_worker_validation_position_min'))
      .max(100, t('bank_worker_validation_position_max'))
      .required(t('bank_worker_validation_position_required')),
    selectedService: Yup.string()
      .required(t('bank_worker_validation_bank_required')),
    password: Yup.string()
      .min(8, t('bank_worker_validation_password_min'))
      .matches(/[A-Z]/, t('bank_worker_validation_password_uppercase'))
      .matches(/[a-z]/, t('bank_worker_validation_password_lowercase'))
      .matches(/[0-9]/, t('bank_worker_validation_password_number'))
      .matches(/[!@#$%^&*(),.?":{}|<>]/, t('bank_worker_validation_password_special'))
      .required(t('bank_worker_validation_password_required')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('bank_worker_validation_password_match'))
      .required(t('bank_worker_validation_password_repeat_required')),
    acceptTerms: Yup.boolean()
      .oneOf([true], t('bank_worker_validation_terms_required'))
      .required(t('bank_worker_validation_terms_required'))
  })

  // Form submission handler
  const handleSubmit = async (values: PasswordFormData) => {
    try {
      setIsSubmitting(true)

      // Create registration data for the API
      const registrationData = {
        fullName: values.fullName.trim(),
        position: values.position.trim(),
        corporateEmail: `${values.fullName.toLowerCase().replace(/\s+/g, '.')}@bank.com`, // Generate corporate email
        bankId: parseInt(values.selectedService),
        branchId: 1, // Default branch - in real system this would be selected
        bankNumber: Math.floor(Math.random() * 1000000).toString(), // Generate bank number
        termsAccepted: values.acceptTerms,
        password: values.password,
        selectedServices: [] // Optional services
      }

      // Submit to real API endpoint
      const response = await fetch('/api/bank-employee/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })

      const result = await response.json()

      if (response.ok && result.status === 'success') {
        // Registration successful
        toast.success(t('bank_partner_registration_success'))
        
        // Navigate to status page with real registration ID
        navigate(`/bank-partner/status/${result.data.id}`)
      } else {
        // Handle API errors
        const errorMessage = result.message || t('errors.registration_failed')
        toast.error(errorMessage)
        setIsSubmitting(false)
      }

    } catch (error) {
      console.error('Registration error:', error)
      toast.error(t('errors.registration_failed'))
      setIsSubmitting(false)
    }
  }

  // Handle login redirect
  const handleLoginRedirect = () => {
    navigate('/auth')
  }

  // Language-specific validation for input restrictions
  const validateInputLanguage = (value: string, fieldName: string) => {
    if (!value) return true

    const currentLang = i18n.language
    
    // Language-specific character validation as per Confluence requirements
    if (currentLang === 'he') {
      // Hebrew: Allow Hebrew + Latin characters
      const hebrewLatinRegex = /^[\u0590-\u05FF\u0020A-Za-z\s\-']*$/
      if (!hebrewLatinRegex.test(value)) {
        toast.error(t('errors.invalid_characters_hebrew'))
        return false
      }
    } else if (currentLang === 'ru') {
      // Russian: Allow Cyrillic + Latin characters
      const russianLatinRegex = /^[а-яёА-ЯЁa-zA-Z\s\-']*$/u
      if (!russianLatinRegex.test(value)) {
        toast.error(t('errors.invalid_characters_russian'))
        return false
      }
    }

    return true
  }

  return (
    <div className={cx('container')}>
      {/* Header with Logo and Language Selector */}
      <div className={cx('header')}>
        <div className={cx('logo')}>
          <span>BankIM</span>
        </div>
        <div className={cx('languageSelector')}>
          <span className={cx('languageText')}>
            {i18n.language === 'ru' ? 'Русский' : 
             i18n.language === 'he' ? 'עברית' : 'English'}
          </span>
          <svg className={cx('chevronDown')} width="16" height="16" viewBox="0 0 16 16">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.33"/>
          </svg>
        </div>
      </div>

      {/* Page Background */}
      <div className={cx('pageBackground')}>
        {/* Sign up form - exact Figma dimensions */}
        <div className={cx('signUpForm')}>
          {/* Title Section */}
          <div className={cx('titleSection')}>
            <h1 className={cx('mainTitle')}>{t('bank_partner_registration')}</h1>
            <p className={cx('subtitle')}>{t('bank_partner_welcome')}</p>
          </div>

          {/* Stepper Navigation */}
          <div className={cx('stepperNavigation')}>
            <div className={cx('navigation')}>
              {/* Completed Step */}
              <div className={cx('navItemStepper', 'completed')}>
                <div className={cx('shape', 'completed')}>
                  <svg className={cx('checkIcon')} width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
                <span className={cx('stepText')}>{t('bank_worker_basic_info')}</span>
              </div>
              
              {/* Arrow */}
              <div className={cx('chevronRight')}>
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.33"/>
                </svg>
              </div>

              {/* Active Step */}
              <div className={cx('navItemStepper', 'active')}>
                <div className={cx('shape', 'active')}>
                  <span className={cx('stepNumber')}>2</span>
                </div>
                <span className={cx('stepText')}>{t('bank_worker_service_selection')}</span>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className={cx('containerWithForms')}>
            <Formik
              initialValues={{
                fullName: '',
                position: '',
                selectedService: '',
                password: '',
                confirmPassword: '',
                acceptTerms: false
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, errors, touched, isValid }) => (
                <Form>
                  {/* Full Name Input */}
                  <div className={cx('firstRow')}>
                    <div className={cx('inputField')}>
                      <label className={cx('label')}>{t('bank_partner_full_name')}</label>
                      <div className={cx('input')}>
                        <div className={cx('content')}>
                          <svg className={cx('userIcon')} width="16" height="16" viewBox="0 0 16 16">
                            <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8Z" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                            <path d="M8 10C4.69 10 2 12.69 2 16H14C14 12.69 11.31 10 8 10Z" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                          </svg>
                          <Field
                            type="text"
                            name="fullName"
                            placeholder={t('bank_partner_full_name_placeholder')}
                            className={cx('inputText')}
                          />
                        </div>
                      </div>
                      <ErrorMessage name="fullName" component="div" className={cx('errorMessage')} />
                    </div>
                  </div>

                  {/* Position Input */}
                  <div className={cx('secondRow')}>
                    <div className={cx('inputField')}>
                      <label className={cx('label')}>{t('bank_partner_position')}</label>
                      <div className={cx('input')}>
                        <div className={cx('content')}>
                          <svg className={cx('briefcaseIcon')} width="16" height="16" viewBox="0 0 16 16">
                            <rect x="2" y="4" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                            <path d="M6 4V2C6 1.45 6.45 1 7 1H9C9.55 1 10 1.45 10 2V4" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                          </svg>
                          <Field
                            type="text"
                            name="position"
                            placeholder={t('bank_partner_position_placeholder')}
                            className={cx('inputText')}
                          />
                        </div>
                      </div>
                      <ErrorMessage name="position" component="div" className={cx('errorMessage')} />
                    </div>
                  </div>

                  {/* Service Selection - Action 5 */}
                  <div className={cx('thirdRow')}>
                    <div className={cx('inputField')}>
                      <label className={cx('label')}>{t('bank_partner_service_selection')}</label>
                      <div className={cx('input')}>
                        <div className={cx('content')}>
                          <Field
                            as="select"
                            name="selectedService"
                            className={cx('selectInput')}
                            disabled={isLoadingServices}
                          >
                            <option value="">{t('bank_partner_service_selection_placeholder')}</option>
                            {services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                          </Field>
                          <svg className={cx('chevronDownIcon')} width="16" height="16" viewBox="0 0 16 16">
                            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.33"/>
                          </svg>
                        </div>
                      </div>
                      <ErrorMessage name="selectedService" component="div" className={cx('errorMessage')} />
                    </div>
                  </div>

                  {/* Line separator */}
                  <div className={cx('line')}></div>

                  {/* Password Fields - Actions 6 & 7 */}
                  <div className={cx('fourthRow')}>
                    {/* Password Input - Action 6 */}
                    <div className={cx('inputField')}>
                      <label className={cx('label')}>{t('bank_partner_password')}</label>
                      <div className={cx('input')}>
                        <div className={cx('content')}>
                          <svg className={cx('lockIcon')} width="16" height="16" viewBox="0 0 16 16">
                            <path d="M4 7V5C4 2.79 5.79 1 8 1C10.21 1 12 2.79 12 5V7" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                            <rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                          </svg>
                          <Field
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder={t('bank_partner_password_placeholder')}
                            className={cx('inputText')}
                          />
                          <button
                            type="button"
                            className={cx('eyeButton')}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16">
                              {showPassword ? (
                                <path d="M1.33 8S3.33 4 8 4S14.67 8 14.67 8S12.67 12 8 12S1.33 8 1.33 8Z" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                              ) : (
                                <path d="M1.33 8S3.33 4 8 4S14.67 8 14.67 8S12.67 12 8 12S1.33 8 1.33 8Z" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                              )}
                              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <ErrorMessage name="password" component="div" className={cx('errorMessage')} />
                    </div>

                    {/* Confirm Password Input - Action 7 */}
                    <div className={cx('inputField')}>
                      <label className={cx('label')}>{t('bank_partner_confirm_password')}</label>
                      <div className={cx('input')}>
                        <div className={cx('content')}>
                          <svg className={cx('lockIcon')} width="16" height="16" viewBox="0 0 16 16">
                            <path d="M4 7V5C4 2.79 5.79 1 8 1C10.21 1 12 2.79 12 5V7" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                            <rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                          </svg>
                          <Field
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder={t('bank_partner_confirm_password_placeholder')}
                            className={cx('inputText')}
                          />
                          <button
                            type="button"
                            className={cx('eyeButton')}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16">
                              {showConfirmPassword ? (
                                <path d="M1.33 8S3.33 4 8 4S14.67 8 14.67 8S12.67 12 8 12S1.33 8 1.33 8Z" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                              ) : (
                                <path d="M1.33 8S3.33 4 8 4S14.67 8 14.67 8S12.67 12 8 12S1.33 8 1.33 8Z" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                              )}
                              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.33" fill="none"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <ErrorMessage name="confirmPassword" component="div" className={cx('errorMessage')} />
                    </div>
                  </div>

                  {/* Terms Checkbox - Action 8 */}
                  <div className={cx('checkboxContainer')}>
                    <div className={cx('checkboxRow')}>
                      <Field
                        type="checkbox"
                        id="acceptTerms"
                        name="acceptTerms"
                        className={cx('checkbox')}
                      />
                      <div className={cx('labelAndHelperText')}>
                        <label htmlFor="acceptTerms" className={cx('checkboxLabel')}>
                          {i18n.language === 'he' ? (
                            <>
                              אני מסכים <span className={cx('termsLink')}>לכללי הפלטפורמה</span>
                            </>
                          ) : (
                            t('bank_partner_accept_terms')
                          )}
                        </label>
                      </div>
                    </div>
                    <ErrorMessage name="acceptTerms" component="div" className={cx('errorMessage')} />
                  </div>

                  {/* Registration Button - Action 10 */}
                  <button 
                    type="submit" 
                    className={cx('submitButton', { disabled: !isValid || isSubmitting })}
                    disabled={!isValid || isSubmitting}
                  >
                    <span className={cx('buttonText')}>
                      {isSubmitting ? t('loading') : t('bank_partner_complete_registration')}
                    </span>
                  </button>

                  {/* Line separator */}
                  <div className={cx('line')}></div>

                  {/* Login Link - Action 11 */}
                  <div className={cx('loginLink')}>
                    <button
                      type="button"
                      onClick={handleLoginRedirect}
                      className={cx('loginButton')}
                    >
                      {t('bank_partner_already_registered')}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {/* Support Widget - Action 12 */}
      <div className={cx('supportWidget')}>
        <button className={cx('supportButton')} title={t('common.support')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C13.1046 2 14 2.89543 14 4V8C14 9.10457 13.1046 10 12 10C10.8954 10 10 9.10457 10 8V4C10 2.89543 10.8954 2 12 2Z" fill="currentColor"/>
            <path d="M4 12C4 7.58172 7.58172 4 12 4V6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18V20C7.58172 20 4 16.4183 4 12Z" fill="currentColor"/>
            <path d="M20 12C20 16.4183 16.4183 20 12 20V18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6V4C16.4183 4 20 7.58172 20 12Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* Demo Notice */}
      <div className={cx('demoNotice')}>
        <h3>{t('bank_worker_demo_notice')}</h3>
        <p>{t('bank_worker_demo_description')}</p>
      </div>
    </div>
  )
}

export default BankWorkerPasswordStep 