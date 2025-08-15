import classNames from 'classnames/bind'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { Formik, Form, useFormikContext } from 'formik'
import * as Yup from 'yup'
import i18next from 'i18next'

import { Container } from '@src/components/ui/Container'
import { Error } from '@src/components/ui/Error'
import { submitLawyerForm } from '@src/services/lawyerFormApi'

import styles from './lawyersPage.module.scss'

const cx = classNames.bind(styles)

interface DropdownOption {
  value: string
  label: string
}

interface FormValues {
  contactName: string
  phone: string
  email: string
  city: string
  desiredRegion: string
  employmentType: string
  monthlyIncome: string
  workExperience: string
  clientLitigation: string
  debtLitigation: string
  comments: string
  termsAccepted: boolean
  source: string
}

// Validation schema using Yup (same pattern as mortgage pages)
const getValidationSchema = () => Yup.object().shape({
  contactName: Yup.string()
    .min(2, i18next.t('name_min_length'))
    .required(i18next.t('name_required')),
  phone: Yup.string()
    .matches(/^0[5-9][0-9]{8}$|^[+]?972[5-9][0-9]{8}$/, i18next.t('phone_invalid'))
    .required(i18next.t('phone_required')),
  email: Yup.string()
    .email(i18next.t('invalid_email'))
    .required(i18next.t('required_field')),
  termsAccepted: Yup.boolean()
    .oneOf([true], i18next.t('agreement_text_start') + ' ' + i18next.t('terms_title'))
    .required(i18next.t('agreement_text_start') + ' ' + i18next.t('terms_title'))
})

const initialValues: FormValues = {
    contactName: '',
    phone: '',
    email: '',
    city: '',
    desiredRegion: '',
    employmentType: '',
    monthlyIncome: '',
    workExperience: '',
    clientLitigation: '',
    debtLitigation: '',
    comments: '',
    termsAccepted: false,
    source: ''
}

// Form content component that uses Formik context
const LawyersFormContent: React.FC<{
  cities: DropdownOption[]
  regions: DropdownOption[]
  professions: DropdownOption[]
  onBack: () => void
}> = ({ cities, regions, professions, onBack }) => {
  const { t, i18n } = useTranslation()
  const { values, setFieldValue, errors, setFieldTouched, touched } = useFormikContext<FormValues>()
  
  const handleInputChange = (field: keyof FormValues, value: string | boolean) => {
    setFieldValue(field, value)
  }

  const handleInputBlur = (field: keyof FormValues) => {
    setFieldTouched(field, true)
  }

  // Check if all mandatory fields are properly filled using Formik validation
  const isMandatoryFieldsFilled = (): boolean => {
    // Validate name
    const isNameValid = values.contactName.trim().length >= 2
    
    // Validate phone with same regex as Yup schema
    const phoneRegex = /^0[5-9][0-9]{8}$|^[+]?972[5-9][0-9]{8}$/
    const isPhoneValid = phoneRegex.test(values.phone.replace(/[-\s]/g, ''))
    
    // Validate email with basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isEmailValid = emailRegex.test(values.email.trim())
    
    // Validate terms acceptance
    const isTermsAccepted = values.termsAccepted
    
    return isNameValid && isPhoneValid && isEmailValid && isTermsAccepted
  }

  return (
    <div className={cx('form-content')}>
      <div className={cx('form-title')}>
        <h1>טופס הרשמה לעורכי דין ויועצים משפטיים</h1>
        <p className={cx('form-subtitle')}>הצטרפו לרשת המובילה של מתווכי נדל"ן ומשפטנים מקצועיים</p>
      </div>

      <div className={cx('lawyer-form')}>
        <div className={cx('form-section')}>
          <h2 className={cx('section-title')}>פרטים אישיים</h2>
          
          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label className={cx('form-label')}>שם איש הקשר המוסמך</label>
              <input
                type="text"
                className={cx('form-input', { error: touched.contactName && errors.contactName })}
                placeholder="הזינו שם מלא"
                value={values.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                onBlur={() => handleInputBlur('contactName')}
              />
              {touched.contactName && errors.contactName && (
                <Error error={errors.contactName} />
              )}
            </div>
            <div className={cx('form-group')}>
              <label className={cx('form-label')}>טלפון</label>
              <input
                type="tel"
                className={cx('form-input', { error: touched.phone && errors.phone })}
                placeholder="050-123-4567"
                value={values.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={() => handleInputBlur('phone')}
              />
              {touched.phone && errors.phone && (
                <Error error={errors.phone} />
              )}
            </div>
          </div>

          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label className={cx('form-label')}>דוא"ל</label>
              <input
                type="email"
                className={cx('form-input', { error: touched.email && errors.email })}
                placeholder="example@email.com"
                value={values.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
              />
              {touched.email && errors.email && (
                <Error error={errors.email} />
              )}
            </div>
            <div className={cx('form-group')}>
              <label className={cx('form-label')}>עיר מגורים</label>
              <select 
                className={cx('form-select')}
                value={values.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                onBlur={() => handleInputBlur('city')}
              >
                <option value="">בחרו עיר</option>
                {cities.map(city => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label className={cx('form-label')}>אזור פעילות מועדף לשירותים משפטיים</label>
              <select 
                className={cx('form-select')}
                value={values.desiredRegion}
                onChange={(e) => handleInputChange('desiredRegion', e.target.value)}
                onBlur={() => handleInputBlur('desiredRegion')}
              >
                <option value="">בחרו אזור</option>
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={cx('form-section')}>
          <h2 className={cx('section-title')}>פרטים מקצועיים</h2>
          
          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label className={cx('form-label')}>סטטוס מקצועי</label>
              <select 
                className={cx('form-select')}
                value={values.employmentType}
                onChange={(e) => handleInputChange('employmentType', e.target.value)}
                onBlur={() => handleInputBlur('employmentType')}
              >
                <option value="">בחרו סטטוס</option>
                {professions.map(profession => (
                  <option key={profession.value} value={profession.value}>
                    {profession.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={cx('form-group')}>
              <label className={cx('form-label')}>הכנסה חודשית ממוצעת</label>
              <input
                type="text"
                className={cx('form-input')}
                placeholder="25,000 ₪"
                value={values.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                onBlur={() => handleInputBlur('monthlyIncome')}
              />
            </div>
          </div>

          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label className={cx('form-label')}>שנות ניסיון בתחום המשפטי</label>
              <select 
                className={cx('form-select')}
                value={values.workExperience}
                onChange={(e) => handleInputChange('workExperience', e.target.value)}
                onBlur={() => handleInputBlur('workExperience')}
              >
                <option value="">בחרו מספר שנים</option>
                <option value="0-2">0-2 שנים</option>
                <option value="3-5">3-5 שנים</option>
                <option value="6-10">6-10 שנים</option>
                <option value="11-15">11-15 שנים</option>
                <option value="16+">16+ שנים</option>
              </select>
            </div>
          </div>
        </div>

        <div className={cx('form-section')}>
          <h2 className={cx('section-title')}>מידע נוסף</h2>
          
          <div className={cx('form-row')}>
            <div className={cx('form-group')}>
              <label className={cx('form-label')}>האם יש לכם ניסיון בייצוג לקוחות בהליכים משפטיים?</label>
              <select 
                className={cx('form-select')}
                value={values.clientLitigation}
                onChange={(e) => handleInputChange('clientLitigation', e.target.value)}
                onBlur={() => handleInputBlur('clientLitigation')}
              >
                <option value="">בחרו תשובה</option>
                <option value="yes">כן, ניסיון רב</option>
                <option value="some">כן, ניסיון מוגבל</option>
                <option value="no">לא</option>
              </select>
            </div>
            <div className={cx('form-group')}>
              <label className={cx('form-label')}>האם יש לכם ניסיון בהליכי גביית חובות?</label>
              <select 
                className={cx('form-select')}
                value={values.debtLitigation}
                onChange={(e) => handleInputChange('debtLitigation', e.target.value)}
                onBlur={() => handleInputBlur('debtLitigation')}
              >
                <option value="">בחרו תשובה</option>
                <option value="yes">כן, ניסיון רב</option>
                <option value="some">כן, ניסיון מוגבל</option>
                <option value="no">לא</option>
              </select>
            </div>
          </div>

          <div className={cx('form-group')}>
            <label className={cx('form-label')}>הערות נוספות</label>
            <textarea
              className={cx('form-textarea')}
              placeholder="ספרו לנו עוד על הרקע המקצועי שלכם ועל התחומים המעניינים אתכם..."
              rows={4}
              value={values.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              onBlur={() => handleInputBlur('comments')}
            />
          </div>
        </div>

        <div className={cx('form-section')}>
          <div className={cx('terms-section')}>
            <label className={cx('checkbox-label')}>
              <input
                type="checkbox"
                className={cx('checkbox', { error: touched.termsAccepted && errors.termsAccepted })}
                checked={values.termsAccepted}
                onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                onBlur={() => handleInputBlur('termsAccepted')}
              />
              <span className={cx('checkbox-text')}>
                אני מסכים/ה לתנאי השימוש ולמדיניות הפרטיות ומאשר/ת קבלת עדכונים מטעם TechRealt
              </span>
            </label>
            {touched.termsAccepted && errors.termsAccepted && (
              <Error error={errors.termsAccepted} />
            )}
          </div>

          <div className={cx('form-actions')}>
            <button
              type="button"
              className={cx('form-button', 'form-button--secondary')}
              onClick={onBack}
            >
              חזרה
            </button>
            <button
              type="submit"
              className={cx('form-button', 'form-button--primary')}
              disabled={!isMandatoryFieldsFilled()}
            >
              שליחת הטופס
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const LawyersPage: React.FC = () => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  
  // State for dropdown options
  const [cities, setCities] = useState<DropdownOption[]>([])
  const [regions, setRegions] = useState<DropdownOption[]>([])
  const [professions, setProfessions] = useState<DropdownOption[]>([])
  const [loading, setLoading] = useState(true)
  const [formSource, setFormSource] = useState<string>('')

  // Detect source on component mount
  useEffect(() => {
    const detectSource = () => {
      // Priority 1: URL query parameter
      const urlParams = new URLSearchParams(location.search)
      const urlSource = urlParams.get('source')
      if (urlSource) {
        setFormSource(urlSource)
        return
      }

      // Priority 2: Navigation state
      const navigationState = location.state as any
      if (navigationState?.source) {
        setFormSource(navigationState.source)
        return
      }

      // Priority 3: Referrer detection
      const referrer = document.referrer
      if (referrer) {
        try {
          const referrerUrl = new URL(referrer)
          if (referrerUrl.pathname.includes('/tenders-for-lawyers')) {
            setFormSource('tenders-for-lawyers-page')
          } else if (referrerUrl.pathname.includes('/temporary-franchise')) {
            setFormSource('temporary-franchise-page')
          } else {
            setFormSource('external-referrer')
          }
          return
        } catch (e) {
          // Invalid referrer URL
        }
      }

      // Priority 4: Session storage (for tracking across page refreshes)
      const sessionSource = sessionStorage.getItem('lawyerFormSource')
      if (sessionSource) {
        setFormSource(sessionSource)
        return
      }

      // Default: direct navigation
      setFormSource('direct-navigation')
    }

    detectSource()
  }, [location])

  // Store source in session storage for persistence
  useEffect(() => {
    if (formSource) {
      sessionStorage.setItem('lawyerFormSource', formSource)
    }
  }, [formSource])

  // Fetch dropdown data from APIs
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true)
        
        // Fetch cities
        const citiesResponse = await fetch(`/api/get-cities?lang=${i18n.language}`)
        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json()
          if (citiesData.status === 'success') {
            const formattedCities = citiesData.data.map((city: any) => ({
              value: city.value || city.key,
              label: city.name
            }))
            setCities(formattedCities)
          }
        }

        // Fetch regions
        const regionsResponse = await fetch(`/api/get-regions?lang=${i18n.language}`)
        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json()
          if (regionsData.status === 'success') {
            const formattedRegions = regionsData.data.map((region: any) => ({
              value: region.key,
              label: region.name
            }))
            setRegions(formattedRegions)
          }
        }

        // Fetch professions
        const professionsResponse = await fetch(`/api/get-professions?lang=${i18n.language}`)
        if (professionsResponse.ok) {
          const professionsData = await professionsResponse.json()
          if (professionsData.status === 'success') {
            const formattedProfessions = professionsData.data.map((profession: any) => ({
              value: profession.key,
              label: profession.name
            }))
            setProfessions(formattedProfessions)
          }
        }
        
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
        // Fallback data if API fails
        setCities([
          { value: 'tel_aviv', label: 'תל אביב' },
          { value: 'jerusalem', label: 'ירושלים' },
          { value: 'haifa', label: 'חיפה' }
        ])
        setRegions([
          { value: 'center', label: 'מחוז המרכז' },
          { value: 'tel_aviv', label: 'מחוז תל אביב' },
          { value: 'jerusalem', label: 'מחוז ירושלים' }
        ])
        setProfessions([
          { value: 'lawyer', label: 'עורך דין' },
          { value: 'legal_advisor', label: 'יועץ משפטי' },
          { value: 'notary', label: 'נוטריון' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchDropdownData()
  }, [i18n.language])

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    const submissionData = {
      ...values,
      source: formSource,
      submittedAt: new Date().toISOString(),
      referrer: document.referrer || 'none'
    }
    
    try {
      // Here you can add actual API call to submit form data
      await submitLawyerForm(submissionData)
      
      // Navigate to success page
      navigate('/lawyer-success')
      } catch (error) {
      console.error('❌ Form submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className={cx('lawyers-form', { rtl: i18n.language === 'he' })} lang={i18n.language}>
        <Container>
          <div className={cx('form-container')}>
            <div className={cx('form-header')}>
              <div className={cx('logo')}>
                <img 
                  src="/static/menu/header.png" 
                  alt="Header" 
                  className={cx('header-img')}
                />
              </div>
            </div>
            <div className={cx('form-content')}>
              <div className={cx('loading-state')}>טוען נתונים...</div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  // Create initial values with detected source
  const initialValuesWithSource: FormValues = {
    ...initialValues,
    source: formSource
  }

  return (
    <div className={cx('lawyers-form', { rtl: i18n.language === 'he' })} lang={i18n.language}>
      <Container>
        <div className={cx('form-container')}>
          <div className={cx('form-header')}>
            <div className={cx('logo')}>
              <img 
                src="/static/menu/header.png" 
                alt="Header" 
                className={cx('header-img')}
              />
            </div>
          </div>
          
          <Formik
            initialValues={initialValuesWithSource}
            validationSchema={getValidationSchema()}
            validateOnMount={false}
            onSubmit={handleSubmit}
          >
            <Form>
              <LawyersFormContent
                cities={cities}
                regions={regions}
                professions={professions}
                onBack={handleBack}
              />
            </Form>
          </Formik>
        </div>
      </Container>
    </div>
  )
}

export default LawyersPage 