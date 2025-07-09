/**
 * Phase 3: Bank Worker Registration Component
 * 
 * Implements the complete invitation-based bank worker registration system
 * as specified in Confluence documentation and Phase 2 API requirements.
 * 
 * Features:
 * - Multi-step registration form with validation
 * - Multi-language support (Hebrew, English, Russian)
 * - Integration with Phase 2 API endpoints
 * - Responsive design matching existing patterns
 * - Error handling and loading states
 * - Accessibility compliance
 * 
 * @author AI Assistant
 * @date 2025-01-09
 * @ticket PHASE3-BANK-WORKER-REGISTRATION
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Formik, Form, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import classNames from 'classnames/bind'
import { toast } from 'react-toastify'

import { Loader } from '@components/layout/Loader'
import { Container } from '@components/ui/Container'
import { TitleElement } from '@components/ui/TitleElement'
import { Button } from '@components/ui/ButtonUI'
import { FormattedInput } from '@components/ui/FormattedInput'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'
import { Modal } from '@components/ui/Modal'

import { bankWorkerApi } from '@src/services/bankWorkerApi'
import { useAppSelector } from '@src/hooks/store'

import styles from './BankWorkerRegistration.module.scss'

const cx = classNames.bind(styles)

// TypeScript interfaces for form data
interface InvitationData {
  id: string
  email: string
  bankId: string
  bankName: string
  branchId?: string
  branchName?: string
  expiresAt: string
}

interface BankBranch {
  id: string
  name_en: string
  name_he: string
  name_ru: string
  branch_code: string
  city: string
}

interface RegistrationFormData {
  fullName: string
  position: string
  branchId: string
  bankNumber: string
  termsAccepted: boolean
  language: string
}

interface ValidationError {
  field: string
  message: string
  type: string
}

// Validation schema using Yup
const getValidationSchema = (t: any) => {
  return Yup.object({
    fullName: Yup.string()
      .min(2, t('validation.fullName.min'))
      .max(100, t('validation.fullName.max'))
      .matches(/^[\u0590-\u05FF\u0020A-Za-z\s]+$/, t('validation.fullName.format'))
      .required(t('validation.fullName.required')),
    position: Yup.string()
      .min(2, t('validation.position.min'))
      .max(100, t('validation.position.max'))
      .required(t('validation.position.required')),
    branchId: Yup.string()
      .required(t('validation.branchId.required')),
    bankNumber: Yup.string()
      .matches(/^[0-9]+$/, t('validation.bankNumber.format'))
      .min(3, t('validation.bankNumber.min'))
      .max(10, t('validation.bankNumber.max'))
      .required(t('validation.bankNumber.required')),
    termsAccepted: Yup.boolean()
      .oneOf([true], t('validation.termsAccepted.required'))
      .required(t('validation.termsAccepted.required'))
  })
}

/**
 * Bank Worker Registration Component
 * Handles the complete registration flow from invitation token validation to form submission
 */
export const BankWorkerRegistration: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  // Component state
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [branches, setBranches] = useState<BankBranch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<any>(null)

  // Get current language for multi-language validation
  const currentLanguage = i18n.language || 'en'

  /**
   * Load invitation data and bank branches on component mount
   * Validates invitation token and prepares form data
   */
  useEffect(() => {
    const loadInvitationData = async () => {
      if (!token) {
        setError(t('errors.invalidToken'))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await bankWorkerApi.getRegistrationForm(token)
        
        if (response.status === 'success') {
          setInvitation(response.data.invitation)
          setBranches(response.data.branches)
          setError(null)
        } else {
          setError(response.message || t('errors.failedToLoadForm'))
        }
      } catch (err: any) {
        console.error('Error loading invitation data:', err)
        setError(err.message || t('errors.networkError'))
      } finally {
        setLoading(false)
      }
    }

    loadInvitationData()
  }, [token, t])

  /**
   * Handle form submission with comprehensive validation and error handling
   * Integrates with Phase 2 API endpoints
   */
  const handleSubmit = async (
    values: RegistrationFormData,
    { setFieldError, setSubmitting: setFormikSubmitting }: FormikHelpers<RegistrationFormData>
  ) => {
    try {
      setSubmitting(true)
      setValidationErrors([])
      setError(null)

      const registrationData = {
        invitationToken: token!,
        fullName: values.fullName.trim(),
        position: values.position.trim(),
        branchId: values.branchId,
        bankNumber: values.bankNumber.trim(),
        termsAccepted: values.termsAccepted,
        language: currentLanguage
      }

      const response = await bankWorkerApi.completeRegistration(registrationData)

      if (response.status === 'success') {
        setRegistrationResult(response.data)
        setSuccessModalVisible(true)
        toast.success(t('registration.success.message'))
      } else {
        // Handle validation errors from server
        if (response.errors && Array.isArray(response.errors)) {
          setValidationErrors(response.errors)
          response.errors.forEach((error: ValidationError) => {
            setFieldError(error.field, error.message)
          })
        } else {
          setError(response.message || t('errors.registrationFailed'))
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || t('errors.networkError'))
    } finally {
      setSubmitting(false)
      setFormikSubmitting(false)
    }
  }

  /**
   * Handle successful registration completion
   * Navigates to status page or home
   */
  const handleRegistrationSuccess = () => {
    setSuccessModalVisible(false)
    if (registrationResult?.id) {
      navigate(`/bank-worker/status/${registrationResult.id}`)
    } else {
      navigate('/')
    }
  }

  // Loading state
  if (loading) {
    return <Loader />
  }

  // Error state - invalid or expired invitation
  if (error && !invitation) {
    return (
      <Container>
        <div className={cx('errorContainer')}>
          <TitleElement title={t('registration.error.title')} />
          <Error message={error} />
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className={cx('backButton')}
          >
            {t('common.backToHome')}
          </Button>
        </div>
      </Container>
    )
  }

  // Main registration form
  return (
    <Container>
      <div className={cx('registrationContainer')}>
        {/* Header */}
        <div className={cx('header')}>
          <TitleElement 
            title={t('registration.title')} 
            tooltip={t('registration.tooltip')}
          />
          <div className={cx('invitationInfo')}>
            <p className={cx('bankName')}>{invitation?.bankName}</p>
            <p className={cx('email')}>{invitation?.email}</p>
          </div>
        </div>

        {/* Registration Form */}
        <Formik
          initialValues={{
            fullName: '',
            position: '',
            branchId: invitation?.branchId || '',
            bankNumber: '',
            termsAccepted: false,
            language: currentLanguage
          }}
          validationSchema={getValidationSchema(t)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form className={cx('form')}>
              {/* Full Name Input */}
              <div className={cx('formField')}>
                <FormattedInput
                  name="fullName"
                  title={t('registration.fields.fullName.label')}
                  placeholder={t('registration.fields.fullName.placeholder')}
                  value={values.fullName}
                  handleChange={(value) => setFieldValue('fullName', value)}
                  error={touched.fullName && errors.fullName}
                  tooltip={t('registration.fields.fullName.tooltip')}
                />
              </div>

              {/* Position Input */}
              <div className={cx('formField')}>
                <FormattedInput
                  name="position"
                  title={t('registration.fields.position.label')}
                  placeholder={t('registration.fields.position.placeholder')}
                  value={values.position}
                  handleChange={(value) => setFieldValue('position', value)}
                  error={touched.position && errors.position}
                  tooltip={t('registration.fields.position.tooltip')}
                />
              </div>

              {/* Branch Selection */}
              <div className={cx('formField')}>
                <DropdownMenu
                  name="branchId"
                  title={t('registration.fields.branch.label')}
                  placeholder={t('registration.fields.branch.placeholder')}
                  options={branches.map(branch => ({
                    value: branch.id,
                    label: currentLanguage === 'he' ? branch.name_he : 
                           currentLanguage === 'ru' ? branch.name_ru : 
                           branch.name_en,
                    subtitle: `${branch.branch_code} - ${branch.city}`
                  }))}
                  value={values.branchId}
                  onChange={(value) => setFieldValue('branchId', value)}
                  error={touched.branchId && errors.branchId}
                  tooltip={t('registration.fields.branch.tooltip')}
                />
              </div>

              {/* Bank Number Input */}
              <div className={cx('formField')}>
                <FormattedInput
                  name="bankNumber"
                  title={t('registration.fields.bankNumber.label')}
                  placeholder={t('registration.fields.bankNumber.placeholder')}
                  value={values.bankNumber}
                  handleChange={(value) => setFieldValue('bankNumber', value)}
                  error={touched.bankNumber && errors.bankNumber}
                  tooltip={t('registration.fields.bankNumber.tooltip')}
                />
              </div>

              {/* Terms and Conditions */}
              <div className={cx('formField', 'termsField')}>
                <label className={cx('termsLabel')}>
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={values.termsAccepted}
                    onChange={(e) => setFieldValue('termsAccepted', e.target.checked)}
                    className={cx('termsCheckbox')}
                  />
                  <span className={cx('termsText')}>
                    {t('registration.fields.terms.text')}
                    <a 
                      href="/terms" 
                      target="_blank" 
                      className={cx('termsLink')}
                    >
                      {t('registration.fields.terms.link')}
                    </a>
                  </span>
                </label>
                {touched.termsAccepted && errors.termsAccepted && (
                  <Error message={errors.termsAccepted} />
                )}
              </div>

              {/* Server-side validation errors */}
              {validationErrors.length > 0 && (
                <div className={cx('validationErrors')}>
                  {validationErrors.map((error, index) => (
                    <Error key={index} message={error.message} />
                  ))}
                </div>
              )}

              {/* General error message */}
              {error && (
                <div className={cx('errorMessage')}>
                  <Error message={error} />
                </div>
              )}

              {/* Submit Button */}
              <div className={cx('submitSection')}>
                <Button
                  type="submit"
                  variant="primary"
                  size="full"
                  disabled={submitting || isSubmitting}
                  className={cx('submitButton')}
                >
                  {submitting ? t('common.submitting') : t('registration.submit')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Success Modal */}
        <Modal
          isVisible={successModalVisible}
          title={t('registration.success.title')}
          onCancel={handleRegistrationSuccess}
          className={cx('successModal')}
        >
          <div className={cx('successContent')}>
            <p className={cx('successMessage')}>
              {t('registration.success.description')}
            </p>
            <div className={cx('successDetails')}>
              <p><strong>{t('registration.success.id')}:</strong> {registrationResult?.id}</p>
              <p><strong>{t('registration.success.status')}:</strong> {t('registration.success.pendingApproval')}</p>
            </div>
            <Button
              variant="primary"
              onClick={handleRegistrationSuccess}
              className={cx('successButton')}
            >
              {t('registration.success.continue')}
            </Button>
          </div>
        </Modal>
      </div>
    </Container>
  )
}

export default BankWorkerRegistration 