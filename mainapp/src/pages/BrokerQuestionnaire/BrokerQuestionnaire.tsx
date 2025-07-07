import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import classNames from 'classnames/bind'

import { CustomPhoneInput } from '@src/components/ui/CustomPhoneInput'
import { DropdownMenu } from '@src/components/ui/DropdownMenu'
import { Error } from '@src/components/ui/Error'
import { TitleElement } from '@src/components/ui/TitleElement'
import { Button } from '@src/components/ui/ButtonUI'
import { FormattedInput } from '@src/components/ui/FormattedInput'
import { useGetCitiesQuery } from '@src/pages/Services/api/api'

import styles from './BrokerQuestionnaire.module.scss'

const cx = classNames.bind(styles)

interface FormData {
  fullName: string
  phone: string
  email: string
  city: string
  desiredRegion: string
  employmentType: string
  monthlyIncome: string
  workExperience: string
  // Conditional fields for business types
  organizationNumber: string
  organizationName: string
  averageClientsPerMonth: string
  mortgageClientsLastYear: string
  refinanceClientsLastYear: string
  // Yes/No questions
  hasClientCases: string
  hasDebtCases: string
  comments: string
  agreement: boolean
}

const BrokerQuestionnaire: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery()
  const formRef = useRef<HTMLFormElement>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  // Transform cities data for dropdown (no fallback to hard-coded list)
  const cityOptions = (citiesData?.data ?? []).map((city: any) => ({
    value: city.value || city.name?.toLowerCase().replace(/\s+/g, '-'),
    label: city.name,
  }))

  const employmentOptions = [
    { value: 'employment', label: t('broker_questionnaire_employment_type_employment') },
    { value: 'business', label: t('broker_questionnaire_employment_type_business') },
    { value: 'investments', label: t('broker_questionnaire_employment_type_investments') },
    { value: 'property', label: t('broker_questionnaire_employment_type_property') },
    { value: 'no_income', label: t('broker_questionnaire_employment_type_no_income') }
  ]

  const incomeOptions = [
    { value: '0-5000', label: t('broker_questionnaire_income_0_5000') },
    { value: '5000-10000', label: t('broker_questionnaire_income_5000_10000') },
    { value: '10000-20000', label: t('broker_questionnaire_income_10000_20000') },
    { value: '20000-50000', label: t('broker_questionnaire_income_20000_50000') },
    { value: '50000+', label: t('broker_questionnaire_income_50000_plus') }
  ]

  const experienceOptions = [
    { value: '0-1', label: t('broker_questionnaire_experience_0_1') },
    { value: '1-3', label: t('broker_questionnaire_experience_1_3') },
    { value: '3-5', label: t('broker_questionnaire_experience_3_5') },
    { value: '5-10', label: t('broker_questionnaire_experience_5_10') },
    { value: '10+', label: t('broker_questionnaire_experience_10_plus') }
  ]

  const yesNoOptions = [
    { value: 'yes', label: t('yes') },
    { value: 'no', label: t('no') }
  ]

  const requiresBusinessFields = (employmentType: string) => {
    return employmentType === 'business' || employmentType === 'investments' || employmentType === 'property'
  }

  const getValidationSchema = (employmentType: string) => {
    const baseSchema = {
      fullName: Yup.string()
        .required(t('broker_questionnaire_error_required'))
        .min(2, t('broker_questionnaire_error_name_min')),
      phone: Yup.string()
        .required(t('broker_questionnaire_error_required'))
        .matches(/^\+?[1-9]\d{1,14}$/, t('broker_questionnaire_error_phone_format')),
      email: Yup.string()
        .required(t('broker_questionnaire_error_required'))
        .email(t('broker_questionnaire_error_email_format')),
      city: Yup.string()
        .required(t('broker_questionnaire_error_required')),
      desiredRegion: Yup.string()
        .required(t('broker_questionnaire_error_required')),
      employmentType: Yup.string()
        .required(t('broker_questionnaire_error_required')),
      monthlyIncome: Yup.string()
        .required(t('broker_questionnaire_error_required')),
      workExperience: Yup.string()
        .required(t('broker_questionnaire_error_required')),
      hasClientCases: Yup.string()
        .required(t('broker_questionnaire_error_required')),
      hasDebtCases: Yup.string()
        .required(t('broker_questionnaire_error_required')),
      comments: Yup.string()
        .max(1000, t('broker_questionnaire_error_comments_max')),
      agreement: Yup.boolean()
        .oneOf([true], t('broker_questionnaire_error_agreement'))
    }

    // Add conditional fields for business types
    if (requiresBusinessFields(employmentType)) {
      return Yup.object().shape({
        ...baseSchema,
        organizationNumber: Yup.string()
          .required(t('broker_questionnaire_error_required'))
          .matches(/^\d+$/, t('broker_questionnaire_error_number_format')),
        organizationName: Yup.string()
          .required(t('broker_questionnaire_error_required'))
          .min(2, t('broker_questionnaire_error_name_min')),
        averageClientsPerMonth: Yup.string()
          .required(t('broker_questionnaire_error_required'))
          .matches(/^\d+$/, t('broker_questionnaire_error_number_format')),
        mortgageClientsLastYear: Yup.string()
          .matches(/^\d*$/, t('broker_questionnaire_error_number_format')),
        refinanceClientsLastYear: Yup.string()
          .matches(/^\d*$/, t('broker_questionnaire_error_number_format'))
      })
    }

    return Yup.object().shape(baseSchema)
  }

  const initialValues: FormData = {
    fullName: '',
    phone: '',
    email: '',
    city: '',
    desiredRegion: '',
    employmentType: '',
    monthlyIncome: '',
    workExperience: '',
    organizationNumber: '',
    organizationName: '',
    averageClientsPerMonth: '',
    mortgageClientsLastYear: '',
    refinanceClientsLastYear: '',
    hasClientCases: '',
    hasDebtCases: '',
    comments: '',
    agreement: false
  }

  const scrollToFirstError = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0]
    const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.focus()
    }
  }

  const handleSubmit = async (values: FormData) => {
    setIsSubmitting(true)
    setShowValidationErrors(true)

    try {
      const response = await fetch('/api/broker-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        setSubmitSuccess(true)
      } else {
        const errorData = await response.json()
        console.error('Submission error:', errorData)
        throw new Error(errorData.message || 'Failed to submit questionnaire')
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error)
      alert(t('broker_questionnaire_error_submit'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success message if submission was successful
  if (submitSuccess) {
    return (
      <div className={cx('broker-questionnaire')}>
        <div className={cx('content')}>
          <div className={cx('form-container')}>
            <div className={cx('success-message')}>
              <h2>{t('broker_questionnaire_success_title')}</h2>
              <p>{t('broker_questionnaire_success_message')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cx('broker-questionnaire')}>
      <div className={cx('header')}>
        <button 
          className={cx('back-button')}
          onClick={() => navigate('/tenders-for-brokers')}
          type="button"
        >
          ← {t('broker_questionnaire_back')}
        </button>
        <div className={cx('logo')}>
          <img src="/static/logo.svg" alt="Bankimonline" />
        </div>
      </div>

      <div className={cx('content')}>
        <div className={cx('form-container')}>
          <h1 className={cx('title')}>{t('broker_questionnaire_title')}</h1>
          <p className={cx('subtitle')}>Анкета для сотрудничества брокеров страница №20.1</p>
          <a href="#" className={cx('form-link')}>[–] הרכב טופס לחשבון האישי שלך</a>
          
          <Formik
            initialValues={initialValues}
            validationSchema={getValidationSchema(initialValues.employmentType)}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched, setFieldTouched, isValid }) => (
              <Form className={cx('form')} ref={formRef}>
                {/* Contact Information Section */}
                <div className={cx('section')}>
                  <div className={cx('form-row', 'three-columns')}>
                    {/* Full Name */}
                    <div className={cx('form-field')}>
                      <TitleElement title={t('broker_questionnaire_full_name')} />
                      <input
                        type="text"
                        name="fullName"
                        value={values.fullName}
                        onChange={(e) => setFieldValue('fullName', e.target.value)}
                        onBlur={() => setFieldTouched('fullName', true)}
                        placeholder={t('broker_questionnaire_full_name_placeholder')}
                        className={cx('input', { error: touched.fullName && errors.fullName })}
                      />
                      {touched.fullName && errors.fullName && <Error error={errors.fullName} />}
                    </div>

                    {/* Phone */}
                    <div className={cx('form-field')}>
                      <CustomPhoneInput
                        title={t('broker_questionnaire_phone')}
                        value={values.phone}
                        handleChange={(phone) => setFieldValue('phone', phone)}
                        onBlur={() => setFieldTouched('phone', true)}
                        error={touched.phone && errors.phone}
                        onlyCountries={['il', 'us', 'ru']}
                      />
                    </div>
                    
                    {/* Email */}
                    <div className={cx('form-field')}>
                      <TitleElement title={t('broker_questionnaire_email')} />
                      <input
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={(e) => setFieldValue('email', e.target.value)}
                        onBlur={() => setFieldTouched('email', true)}
                        placeholder={t('broker_questionnaire_email_placeholder')}
                        className={cx('input', { error: touched.email && errors.email })}
                      />
                      {touched.email && errors.email && <Error error={errors.email} />}
                    </div>
                  </div>
                </div>

                {/* Location Section - Same row as contact info in screenshot */}
                <div className={cx('section')}>
                  <div className={cx('form-row', 'two-columns')}>
                    {/* City */}
                    <div className={cx('form-field')}>
                      <DropdownMenu
                        title={t('broker_questionnaire_city')}
                        data={cityOptions}
                        placeholder={t('broker_questionnaire_city_placeholder')}
                        value={values.city}
                        onChange={(value) => setFieldValue('city', value)}
                        onBlur={() => setFieldTouched('city', true)}
                        searchable
                        searchPlaceholder={t('search')}
                        nothingFoundText={t('nothing_found')}
                        error={touched.city && errors.city}
                      />
                    </div>
                    
                    {/* Desired Region */}
                    <div className={cx('form-field')}>
                      <DropdownMenu
                        title={t('broker_questionnaire_desired_region')}
                        data={cityOptions}
                        placeholder={t('broker_questionnaire_desired_region_placeholder')}
                        value={values.desiredRegion}
                        onChange={(value) => setFieldValue('desiredRegion', value)}
                        onBlur={() => setFieldTouched('desiredRegion', true)}
                        searchable
                        searchPlaceholder={t('search')}
                        nothingFoundText={t('nothing_found')}
                        error={touched.desiredRegion && errors.desiredRegion}
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className={cx('section')}>
                  <div className={cx('form-row', 'three-columns')}>
                    {/* Employment Type */}
                    <div className={cx('form-field')}>
                      <DropdownMenu
                        title={t('broker_questionnaire_employment_type')}
                        data={employmentOptions}
                        placeholder={t('broker_questionnaire_employment_type_placeholder')}
                        value={values.employmentType}
                        onChange={(value) => {
                          setFieldValue('employmentType', value)
                          // Reset conditional fields when employment type changes
                          if (!requiresBusinessFields(value)) {
                            setFieldValue('organizationNumber', '')
                            setFieldValue('organizationName', '')
                            setFieldValue('averageClientsPerMonth', '')
                            setFieldValue('mortgageClientsLastYear', '')
                            setFieldValue('refinanceClientsLastYear', '')
                          }
                        }}
                        onBlur={() => setFieldTouched('employmentType', true)}
                        error={touched.employmentType && errors.employmentType}
                      />
                    </div>

                    {/* Monthly Income */}
                    {values.employmentType !== 'no_income' && (
                      <div className={cx('form-field')}>
                        <DropdownMenu
                          title={t('broker_questionnaire_monthly_income')}
                          data={incomeOptions}
                          placeholder={t('broker_questionnaire_monthly_income_placeholder')}
                          value={values.monthlyIncome}
                          onChange={(value) => setFieldValue('monthlyIncome', value)}
                          onBlur={() => setFieldTouched('monthlyIncome', true)}
                          error={touched.monthlyIncome && errors.monthlyIncome}
                        />
                      </div>
                    )}

                    {/* No Income Date Field */}
                    {values.employmentType === 'no_income' && (
                      <div className={cx('form-field')}>
                        <TitleElement title={t('broker_questionnaire_no_income_since')} />
                        <input
                          type="date"
                          name="monthlyIncome"
                          value={values.monthlyIncome}
                          onChange={(e) => setFieldValue('monthlyIncome', e.target.value)}
                          onBlur={() => setFieldTouched('monthlyIncome', true)}
                          placeholder={t('broker_questionnaire_no_income_since_placeholder')}
                          className={cx('input', { error: touched.monthlyIncome && errors.monthlyIncome })}
                        />
                        {touched.monthlyIncome && errors.monthlyIncome && <Error error={errors.monthlyIncome} />}
                      </div>
                    )}

                    {/* Work Experience */}
                    <div className={cx('form-field')}>
                      <DropdownMenu
                        title={t('broker_questionnaire_work_experience')}
                        data={experienceOptions}
                        placeholder={t('broker_questionnaire_work_experience_placeholder')}
                        value={values.workExperience}
                        onChange={(value) => setFieldValue('workExperience', value)}
                        onBlur={() => setFieldTouched('workExperience', true)}
                        error={touched.workExperience && errors.workExperience}
                      />
                    </div>
                  </div>

                  {/* Conditional Business Fields */}
                  {requiresBusinessFields(values.employmentType) && (
                    <div className={cx('business-fields')}>
                      <div className={cx('form-row', 'three-columns')}>
                        {/* Organization Number */}
                        <div className={cx('form-field')}>
                          <FormattedInput
                            title={t('broker_questionnaire_organization_number')}
                            value={values.organizationNumber ? parseInt(values.organizationNumber) : null}
                            handleChange={(value) => setFieldValue('organizationNumber', value?.toString() || '')}
                            onBlur={() => setFieldTouched('organizationNumber', true)}
                            placeholder={t('broker_questionnaire_organization_number_placeholder')}
                            error={touched.organizationNumber && errors.organizationNumber}
                            disableCurrency={true}
                          />
                        </div>

                        {/* Organization Name */}
                        <div className={cx('form-field')}>
                          <TitleElement title={t('broker_questionnaire_organization_name')} />
                          <input
                            type="text"
                            name="organizationName"
                            value={values.organizationName}
                            onChange={(e) => setFieldValue('organizationName', e.target.value)}
                            onBlur={() => setFieldTouched('organizationName', true)}
                            placeholder={t('broker_questionnaire_organization_name_placeholder')}
                            className={cx('input', { error: touched.organizationName && errors.organizationName })}
                          />
                          {touched.organizationName && errors.organizationName && <Error error={errors.organizationName} />}
                        </div>

                        {/* Average Clients Per Month */}
                        <div className={cx('form-field')}>
                          <FormattedInput
                            title={t('broker_questionnaire_average_clients_month')}
                            value={values.averageClientsPerMonth ? parseInt(values.averageClientsPerMonth) : null}
                            handleChange={(value) => setFieldValue('averageClientsPerMonth', value?.toString() || '')}
                            onBlur={() => setFieldTouched('averageClientsPerMonth', true)}
                            placeholder={t('broker_questionnaire_average_clients_month_placeholder')}
                            error={touched.averageClientsPerMonth && errors.averageClientsPerMonth}
                            disableCurrency={true}
                          />
                        </div>
                      </div>

                      <div className={cx('form-row')}>
                        {/* Mortgage Clients Last Year */}
                        <div className={cx('form-field')}>
                          <FormattedInput
                            title={t('broker_questionnaire_mortgage_clients_year')}
                            value={values.mortgageClientsLastYear ? parseInt(values.mortgageClientsLastYear) : null}
                            handleChange={(value) => setFieldValue('mortgageClientsLastYear', value?.toString() || '')}
                            onBlur={() => setFieldTouched('mortgageClientsLastYear', true)}
                            placeholder={t('broker_questionnaire_mortgage_clients_year_placeholder')}
                            error={touched.mortgageClientsLastYear && errors.mortgageClientsLastYear}
                            disableCurrency={true}
                          />
                        </div>

                        {/* Refinance Clients Last Year */}
                        <div className={cx('form-field')}>
                          <FormattedInput
                            title={t('broker_questionnaire_refinance_clients_year')}
                            value={values.refinanceClientsLastYear ? parseInt(values.refinanceClientsLastYear) : null}
                            handleChange={(value) => setFieldValue('refinanceClientsLastYear', value?.toString() || '')}
                            onBlur={() => setFieldTouched('refinanceClientsLastYear', true)}
                            placeholder={t('broker_questionnaire_refinance_clients_year_placeholder')}
                            error={touched.refinanceClientsLastYear && errors.refinanceClientsLastYear}
                            disableCurrency={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Questions Section */}
                <div className={cx('section')}>
                  <div className={cx('form-row', 'two-columns')}>
                    {/* Client Cases */}
                    <div className={cx('form-field')}>
                      <TitleElement title={t('broker_questionnaire_has_client_cases')} />
                      <div className={cx('yes-no-buttons')}>
                        {yesNoOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={cx('yes-no-button', { 
                              active: values.hasClientCases === option.value,
                              error: touched.hasClientCases && errors.hasClientCases
                            })}
                            onClick={() => {
                              setFieldValue('hasClientCases', option.value)
                              setFieldTouched('hasClientCases', true)
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {touched.hasClientCases && errors.hasClientCases && <Error error={errors.hasClientCases} />}
                    </div>
                    
                    {/* Debt Cases */}
                    <div className={cx('form-field')}>
                      <TitleElement title={t('broker_questionnaire_has_debt_cases')} />
                      <div className={cx('yes-no-buttons')}>
                        {yesNoOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={cx('yes-no-button', { 
                              active: values.hasDebtCases === option.value,
                              error: touched.hasDebtCases && errors.hasDebtCases
                            })}
                            onClick={() => {
                              setFieldValue('hasDebtCases', option.value)
                              setFieldTouched('hasDebtCases', true)
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {touched.hasDebtCases && errors.hasDebtCases && <Error error={errors.hasDebtCases} />}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className={cx('form-field', 'full-width')}>
                    <TitleElement title={t('broker_questionnaire_comments')} />
                    <textarea
                      name="comments"
                      value={values.comments}
                      onChange={(e) => setFieldValue('comments', e.target.value)}
                      onBlur={() => setFieldTouched('comments', true)}
                      placeholder={t('broker_questionnaire_comments_placeholder')}
                      className={cx('textarea', { error: touched.comments && errors.comments })}
                      rows={4}
                      maxLength={1000}
                    />
                    <div className={cx('character-count')}>
                      {values.comments.length}/1000
                    </div>
                    {touched.comments && errors.comments && <Error error={errors.comments} />}
                  </div>
                </div>

                {/* Agreement Section */}
                <div className={cx('section')}>
                  <div className={cx('agreement-section', 'full-width')}>
                    <label className={cx('checkbox-label')}>
                      <input
                        type="checkbox"
                        name="agreement"
                        checked={values.agreement}
                        onChange={(e) => setFieldValue('agreement', e.target.checked)}
                        onBlur={() => setFieldTouched('agreement', true)}
                        className={cx('checkbox')}
                      />
                      <span className={cx('checkbox-text')}>
                        {t('broker_questionnaire_agreement')}
                      </span>
                    </label>
                    {touched.agreement && errors.agreement && <Error error={errors.agreement} />}
                  </div>
                </div>

                {/* Submit Section */}
                <div className={cx('submit-section')}>
                  {/* Back Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="full"
                    onClick={() => navigate('/tenders-for-brokers')}
                    isDisabled={false}
                  >
                    {t('broker_questionnaire_back')}
                  </Button>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="full"
                    disabled={!isValid || isSubmitting}
                    isDisabled={!isValid || isSubmitting}
                  >
                    {isSubmitting ? t('broker_questionnaire_submitting') : t('broker_questionnaire_submit')}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default BrokerQuestionnaire