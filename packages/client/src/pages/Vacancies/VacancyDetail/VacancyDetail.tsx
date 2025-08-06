import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Container from '../../../components/ui/Container/Container'
import { MapPinIcon } from '../../../assets/icons/MapPinIcon'
import { ClockIcon } from '../../../assets/icons/ClockIcon'
import styles from './VacancyDetail.module.scss'

interface Vacancy {
  id: number
  title: string
  category: string
  subcategory?: string
  location: string
  description: string
  requirements: string
  responsibilities: string
  benefits: string
  nice_to_have: string
  employment_type: string
  salary_min: number
  salary_max: number
  salary_currency: string
  is_featured?: boolean
  posted_date: string
  closing_date?: string
}

interface ApplicationForm {
  applicant_name: string
  applicant_phone: string
  applicant_email: string
  applicant_city: string
  expected_salary: string
  portfolio_url: string
  cover_letter: string
  resume: File | null
}

interface FormErrors {
  [key: string]: string
}

/**
 * VacancyDetail Component
 * 
 * Displays detailed information about a specific job vacancy including:
 * - Job description, requirements, responsibilities, benefits
 * - Professional application form with file upload functionality
 * - Validation and error handling
 * - Success message after application submission
 * 
 * Features:
 * - Responsive design for mobile/tablet/desktop
 * - Multi-language support (Hebrew, English, Russian)
 * - File upload with drag & drop (PDF, DOC, DOCX only)
 * - Form validation with real-time feedback
 * - Professional success window with navigation
 */
const VacancyDetail = () => {
  // Router and internationalization hooks
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  
  // Vacancy data state management
  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applicationLoading, setApplicationLoading] = useState(false)
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  
  const [formData, setFormData] = useState<ApplicationForm>({
    applicant_name: '',
    applicant_phone: '',
    applicant_email: '',
    applicant_city: '',
    expected_salary: '',
    portfolio_url: '',
    cover_letter: '',
    resume: null
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [dragActive, setDragActive] = useState(false)

  // Fetch vacancy details
  useEffect(() => {
    const fetchVacancy = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/vacancies/${id}?lang=${i18n.language}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Vacancy not found')
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.status === 'success') {
          setVacancy(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch vacancy')
        }
      } catch (err) {
        console.error('Error fetching vacancy:', err)
        setError(err instanceof Error ? err.message : 'Failed to load vacancy')
      } finally {
        setLoading(false)
      }
    }

    fetchVacancy()
  }, [id, i18n.language])

  /**
   * Email validation function
   * @param email - Email address to validate
   * @returns boolean - True if email format is valid
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Phone validation function for Israeli phone numbers
   * Accepts formats: +972XXXXXXXXX, 972XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXXX
   * @param phone - Phone number to validate
   * @returns boolean - True if phone format is valid
   */
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+?972|0)?[5-9]\d{8}$/
    return phoneRegex.test(phone.replace(/[-\s]/g, ''))
  }

  /**
   * Comprehensive form validation function
   * Validates all form fields according to business rules:
   * - Name: Required, 2-100 characters
   * - Phone: Required, Israeli format
   * - Email: Required, valid email format
   * - City: Required, min 2 characters
   * - Salary: Optional, positive number, max 100,000
   * - Cover letter: Optional, max 2000 characters
   * - Resume: Required, PDF/DOC/DOCX only, max 5MB
   * 
   * @returns boolean - True if all validations pass
   */
  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    // Name validation - Required field with length constraints
    if (!formData.applicant_name.trim()) {
      errors.applicant_name = t('vacancyDetail.applicationForm.validation.required')
    } else if (formData.applicant_name.length < 2) {
      errors.applicant_name = t('vacancyDetail.applicationForm.validation.nameMinLength')
    } else if (formData.applicant_name.length > 100) {
      errors.applicant_name = t('vacancyDetail.applicationForm.validation.nameMaxLength')
    }

    // Phone validation
    if (!formData.applicant_phone.trim()) {
      errors.applicant_phone = t('vacancyDetail.applicationForm.validation.required')
    } else if (!validatePhone(formData.applicant_phone)) {
      errors.applicant_phone = t('vacancyDetail.applicationForm.validation.phoneFormat')
    }

    // Email validation
    if (!formData.applicant_email.trim()) {
      errors.applicant_email = t('vacancyDetail.applicationForm.validation.required')
    } else if (!validateEmail(formData.applicant_email)) {
      errors.applicant_email = t('vacancyDetail.applicationForm.validation.invalidEmail')
    }

    // City validation
    if (!formData.applicant_city.trim()) {
      errors.applicant_city = t('vacancyDetail.applicationForm.validation.required')
    } else if (formData.applicant_city.length < 2) {
      errors.applicant_city = t('vacancyDetail.applicationForm.validation.cityMinLength')
    }

    // Salary validation
    if (formData.expected_salary.trim()) {
      const salary = parseInt(formData.expected_salary)
      if (isNaN(salary) || salary <= 0) {
        errors.expected_salary = t('vacancyDetail.applicationForm.validation.salaryMinValue')
      } else if (salary > 100000) {
        errors.expected_salary = t('vacancyDetail.applicationForm.validation.salaryMaxValue')
      }
    }

    // Cover letter validation
    if (formData.cover_letter.length > 2000) {
      errors.cover_letter = t('vacancyDetail.applicationForm.validation.coverLetterMaxLength')
    }

    // Resume file validation
    if (!formData.resume) {
      errors.resume = t('vacancyDetail.applicationForm.validation.fileRequired')
    } else {
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (formData.resume.size > maxSize) {
        errors.resume = t('vacancyDetail.applicationForm.validation.fileSize')
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(formData.resume.type)) {
        errors.resume = t('vacancyDetail.applicationForm.validation.fileType')
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Handle file input change
  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      resume: file
    }))

    // Validate file immediately
    if (file) {
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      
      if (file.size > maxSize) {
        setFormErrors(prev => ({
          ...prev,
          resume: t('vacancyDetail.applicationForm.validation.fileSize')
        }))
      } else if (!allowedTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          resume: t('vacancyDetail.applicationForm.validation.fileType')
        }))
      } else {
        // Clear error if file is valid
        setFormErrors(prev => ({
          ...prev,
          resume: ''
        }))
      }
    } else {
      // Clear file error when no file
      setFormErrors(prev => ({
        ...prev,
        resume: ''
      }))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFileChange(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0])
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setApplicationLoading(true)
    setApplicationSuccess(false)
    setAlreadyApplied(false)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('applicant_name', formData.applicant_name)
      formDataToSend.append('applicant_phone', formData.applicant_phone)
      formDataToSend.append('applicant_email', formData.applicant_email)
      formDataToSend.append('applicant_city', formData.applicant_city)
      formDataToSend.append('expected_salary', formData.expected_salary)
      formDataToSend.append('portfolio_url', formData.portfolio_url)
      formDataToSend.append('cover_letter', formData.cover_letter)
      
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume)
      }
      
      const response = await fetch(`/api/vacancies/${id}/apply`, {
        method: 'POST',
        body: formDataToSend
      })
      
      const data = await response.json()
      
      if (response.ok && data.status === 'success') {
        setApplicationSuccess(true)
        // Reset form
        setFormData({
          applicant_name: '',
          applicant_phone: '',
          applicant_email: '',
          applicant_city: '',
          expected_salary: '',
          portfolio_url: '',
          cover_letter: '',
          resume: null
        })
      } else if (response.status === 409) {
        // Handle "already applied" case with friendly message
        setAlreadyApplied(true)
      } else {
        // Handle other errors
        throw new Error(data.message || 'Failed to submit application')
      }
    } catch (err) {
      console.error('Error submitting application:', err)
      alert(t('vacancyDetail.applicationForm.error'))
    } finally {
      setApplicationLoading(false)
    }
  }

  // Get localized content
  const getLocalizedContent = (field: 'description' | 'requirements' | 'responsibilities' | 'benefits' | 'nice_to_have') => {
    if (!vacancy) return ''
    
    // The API already returns localized content based on the language parameter
    return (vacancy[field] as string) || ''
  }

  // Get localized title
  const getLocalizedTitle = () => {
    if (!vacancy) return ''
    
    // The API already returns localized title based on the language parameter
    return vacancy.title || ''
  }

  // Format salary display
  const formatSalary = (min: number, max: number, currency: string) => {
    const formatNumber = (num: number) => {
      return new Intl.NumberFormat().format(num)
    }
    
    if (min && max && min !== max) {
      return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`
    } else if (min) {
      return `${t('vacancy_salary_from')} ${formatNumber(min)} ${currency}`
    }
    return ''
  }

  // Get employment type text
  const getEmploymentTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'full_time': t('vacancy_employment_fulltime'),
      'part_time': t('vacancy_employment_parttime', 'Part Time'),
      'contract': t('vacancy_employment_contract', 'Contract'),
      'temporary': t('vacancy_employment_temporary', 'Temporary')
    }
    return typeMap[type] || type
  }

  // Get category color
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'development': '#FBE54D',
      'design': '#4DABF7',
      'management': '#69DB7C',
      'marketing': '#FFB366',
      'finance': '#A78BFA',
      'customer_service': '#FF8CC8'
    }
    return colorMap[category] || '#FBE54D'
  }

  if (loading) {
    return (
      <div className={styles.vacancyDetailPage}>
        <Container>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>{t('loading', 'Loading...')}</p>
          </div>
        </Container>
      </div>
    )
  }

  if (error || !vacancy) {
    return (
      <div className={styles.vacancyDetailPage}>
        <Container>
          <div className={styles.error}>
            <h1>{t('vacancy_not_found', 'Vacancy Not Found')}</h1>
            <p>{error || t('vacancy_not_found_description', 'The vacancy you are looking for does not exist or has been removed.')}</p>
            <Link to="/vacancies" className={styles.backButton}>
              {t('back_to_vacancies', 'Back to Vacancies')}
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className={styles.vacancyDetailPage}>
      <Container>
        <div className={styles.content}>
          {/* Breadcrumbs */}
          <div className={styles.breadcrumbs}>
            <Link to="/" className={styles.breadcrumbLink}>{t('navigation.home')}</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <Link to="/vacancies" className={styles.breadcrumbLink}>{t('vacancies.title')}</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbCurrent}>{getLocalizedTitle()}</span>
          </div>

          {/* Show centered message for success or already applied */}
          {(applicationSuccess || alreadyApplied) ? (
            <div className={styles.centeredMessageContainer}>
              {applicationSuccess ? (
                <div className={styles.successMessageCentered}>
                  <div className={styles.successIcon}>✓</div>
                  <h2>{t('vacancyDetail.applicationForm.success')}</h2>
                  <p>{t('vacancyDetail.applicationForm.successMessage')}</p>
                  <button 
                    onClick={() => navigate('/')}
                    className={styles.goHomeButton}
                  >
                    {t('vacancyDetail.applicationForm.goHome')}
                  </button>
                </div>
              ) : (
                <div className={styles.alreadyAppliedMessageCentered}>
                  <div className={styles.infoIcon}>ℹ</div>
                  <h2>{t('vacancyDetail.applicationForm.alreadyApplied')}</h2>
                  <p>{t('vacancyDetail.applicationForm.alreadyAppliedMessage')}</p>
                  <div className={styles.buttonGroup}>
                    <button 
                      onClick={() => navigate('/vacancies')}
                      className={styles.viewOtherPositionsButton}
                    >
                      {t('vacancyDetail.applicationForm.viewOtherPositions')}
                    </button>
                    <button 
                      onClick={() => navigate('/')}
                      className={styles.goHomeButton}
                    >
                      {t('vacancyDetail.applicationForm.goHome')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.vacancyLayout}>
              {/* Left Column - Vacancy Details */}
              <div className={styles.vacancyDetails}>
              {/* Back Button */}
              <button 
                onClick={() => navigate('/vacancies')} 
                className={styles.backButtonTop}
              >
                ‹ {t('vacancies.backToVacancies')}
              </button>

              {/* Vacancy Header */}
              <div className={styles.vacancyHeader}>
                <h1 className={styles.title}>{getLocalizedTitle()}</h1>
                
                <div className={styles.vacancyMeta}>
                  <div className={styles.categoryChip} style={{ backgroundColor: getCategoryColor(vacancy.category) }}>
                    <div className={styles.categoryDot}></div>
                    <span>{t(`vacancies.categories.${vacancy.category.toLowerCase()}`, vacancy.category)}</span>
                  </div>
                  
                  <div className={styles.metaInfo}>
                    <div className={styles.metaItem}>
                      <MapPinIcon />
                      <span>{vacancy.location}</span>
                    </div>
                    
                    <div className={styles.metaItem}>
                      <ClockIcon />
                      <span>{getEmploymentTypeText(vacancy.employment_type)}</span>
                    </div>
                    
                    <div className={styles.metaItem}>
                      <span className={styles.currency}>₪</span>
                      <span>{formatSalary(vacancy.salary_min, vacancy.salary_max, vacancy.salary_currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className={styles.section}>
                <h2>{t('vacancyDetail.generalInfo')}</h2>
                <div className={styles.sectionContent}>
                  {getLocalizedContent('description').split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div className={styles.section}>
                <h2>{t('vacancyDetail.responsibilities')}</h2>
                <div className={styles.sectionContent}>
                  {getLocalizedContent('responsibilities').split('\n').map((line, index) => (
                    <div key={index} className={styles.textLine}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className={styles.section}>
                <h2>{t('vacancyDetail.requirements')}</h2>
                <div className={styles.sectionContent}>
                  {getLocalizedContent('requirements').split('\n').map((line, index) => (
                    <div key={index} className={styles.textLine}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Nice to Have */}
              <div className={styles.section}>
                <h2>{t('vacancyDetail.niceToHave')}</h2>
                <div className={styles.sectionContent}>
                  {getLocalizedContent('nice_to_have').split('\n').map((line, index) => (
                    <div key={index} className={styles.textLine}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className={styles.section}>
                <h2>{t('vacancyDetail.benefits')}</h2>
                <div className={styles.sectionContent}>
                  {getLocalizedContent('benefits').split('\n').map((line, index) => (
                    <div key={index} className={styles.textLine}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Application Form */}
            <div className={styles.applicationForm}>
              <div className={styles.formContainer}>
                <h3>{t('vacancyDetail.applicationForm.title')}</h3>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                      <label htmlFor="applicant_name">{t('vacancyDetail.applicationForm.fullName')} *</label>
                      <input
                        type="text"
                        id="applicant_name"
                        name="applicant_name"
                        value={formData.applicant_name}
                        onChange={handleInputChange}
                        required
                        placeholder={t('vacancyDetail.applicationForm.fullNamePlaceholder')}
                        className={formErrors.applicant_name ? styles.error : ''}
                      />
                      {formErrors.applicant_name && (
                        <span className={styles.errorText}>{formErrors.applicant_name}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="applicant_phone">{t('vacancyDetail.applicationForm.phone')} *</label>
                      <div className={`${styles.phoneInputContainer} ${formErrors.applicant_phone ? styles.error : ''}`}>
                        <div className={styles.countryFlag}>
                          <img 
                            src="/static/lang/he.svg" 
                            alt="Israel" 
                            className={styles.flagIcon}
                          />
                          <span className={styles.dropdownArrow}>▼</span>
                        </div>
                        <input
                          type="tel"
                          id="applicant_phone"
                          name="applicant_phone"
                          value={formData.applicant_phone}
                          onChange={handleInputChange}
                          required
                          placeholder={t('vacancyDetail.applicationForm.phonePlaceholder')}
                        />
                      </div>
                      {formErrors.applicant_phone && (
                        <span className={styles.errorText}>{formErrors.applicant_phone}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="applicant_email">{t('vacancyDetail.applicationForm.email')} *</label>
                      <input
                        type="email"
                        id="applicant_email"
                        name="applicant_email"
                        value={formData.applicant_email}
                        onChange={handleInputChange}
                        required
                        placeholder={t('vacancyDetail.applicationForm.emailPlaceholder')}
                        className={formErrors.applicant_email ? styles.error : ''}
                      />
                      {formErrors.applicant_email && (
                        <span className={styles.errorText}>{formErrors.applicant_email}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="applicant_city">{t('vacancyDetail.applicationForm.city')} *</label>
                      <input
                        type="text"
                        id="applicant_city"
                        name="applicant_city"
                        value={formData.applicant_city}
                        onChange={handleInputChange}
                        required
                        placeholder={t('vacancyDetail.applicationForm.cityPlaceholder')}
                        className={formErrors.applicant_city ? styles.error : ''}
                      />
                      {formErrors.applicant_city && (
                        <span className={styles.errorText}>{formErrors.applicant_city}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="expected_salary">{t('vacancyDetail.applicationForm.expectedSalary')}</label>
                      <div className={`${styles.salaryInputContainer} ${formErrors.expected_salary ? styles.error : ''}`}>
                        <input
                          type="text"
                          id="expected_salary"
                          name="expected_salary"
                          value={formData.expected_salary}
                          onChange={handleInputChange}
                          placeholder={t('vacancyDetail.applicationForm.expectedSalaryPlaceholder')}
                        />
                        <span className={styles.currencySymbol}>₪</span>
                      </div>
                      {formErrors.expected_salary && (
                        <span className={styles.errorText}>{formErrors.expected_salary}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="portfolio_url">{t('vacancyDetail.applicationForm.portfolioLink')}</label>
                      <input
                        type="url"
                        id="portfolio_url"
                        name="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={handleInputChange}
                        placeholder={t('vacancyDetail.applicationForm.portfolioLinkPlaceholder')}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="resume">{t('vacancyDetail.applicationForm.uploadResume')} *</label>
                      <div 
                        className={`${styles.fileUpload} ${dragActive ? styles.dragActive : ''} ${formErrors.resume ? styles.error : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="resume"
                          name="resume"
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx"
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="resume" className={styles.fileUploadLabel}>
                          {formData.resume ? (
                            <span className={styles.fileName}>{formData.resume.name}</span>
                          ) : (
                            <div className={styles.uploadContent}>
                              <div className={styles.uploadIcon}>
                                ⬆
                              </div>
                              <p>{t('vacancyDetail.applicationForm.uploadResumeText')}</p>
                            </div>
                          )}
                        </label>
                      </div>
                      <small className={styles.fileHelp}>
                        {t('vacancyDetail.applicationForm.allowedFiles')}
                      </small>
                      {formErrors.resume && (
                        <span className={styles.errorText}>{formErrors.resume}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="cover_letter">{t('vacancyDetail.applicationForm.coverLetter')}</label>
                      <textarea
                        id="cover_letter"
                        name="cover_letter"
                        value={formData.cover_letter}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder={t('vacancyDetail.applicationForm.coverLetterPlaceholder')}
                        className={formErrors.cover_letter ? styles.error : ''}
                      />
                      {formErrors.cover_letter && (
                        <span className={styles.errorText}>{formErrors.cover_letter}</span>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      className={styles.submitButton}
                      disabled={applicationLoading}
                    >
                      {applicationLoading ? t('vacancyDetail.applicationForm.submitting') : t('vacancyDetail.applicationForm.submit')}
                    </button>
                  </form>
              </div>
            </div>
              </div>
            )}
        </div>
      </Container>
    </div>
  )
}

export default VacancyDetail 