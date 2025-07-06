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
  description_he?: string
  description_en?: string
  description_ru?: string
  requirements_he?: string
  requirements_en?: string
  requirements_ru?: string
  responsibilities_he?: string
  responsibilities_en?: string
  responsibilities_ru?: string
  benefits_he?: string
  benefits_en?: string
  benefits_ru?: string
  nice_to_have_he?: string
  nice_to_have_en?: string
  nice_to_have_ru?: string
  employment_type: string
  salary_min: number
  salary_max: number
  salary_currency: string
  is_featured?: boolean
  posted_date: string
  closing_date?: string
}

interface ApplicationForm {
  full_name: string
  email: string
  phone: string
  city: string
  expected_salary: string
  portfolio_url: string
  cover_letter: string
  resume_file?: File
}

const VacancyDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  
  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applicationLoading, setApplicationLoading] = useState(false)
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  
  const [formData, setFormData] = useState<ApplicationForm>({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    expected_salary: '',
    portfolio_url: '',
    cover_letter: '',
  })

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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        resume_file: file
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!vacancy) return
    
    try {
      setApplicationLoading(true)
      
      const formDataToSend = new FormData()
      formDataToSend.append('full_name', formData.full_name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('city', formData.city)
      formDataToSend.append('expected_salary', formData.expected_salary)
      formDataToSend.append('portfolio_url', formData.portfolio_url)
      formDataToSend.append('cover_letter', formData.cover_letter)
      
      if (formData.resume_file) {
        formDataToSend.append('resume', formData.resume_file)
      }
      
      const response = await fetch(`/api/vacancies/${vacancy.id}/apply`, {
        method: 'POST',
        body: formDataToSend
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setApplicationSuccess(true)
        // Reset form
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          city: '',
          expected_salary: '',
          portfolio_url: '',
          cover_letter: '',
        })
      } else {
        throw new Error(data.message || 'Failed to submit application')
      }
    } catch (err) {
      console.error('Error submitting application:', err)
      alert(t('application_error', 'Failed to submit application. Please try again.'))
    } finally {
      setApplicationLoading(false)
    }
  }

  // Get localized content
  const getLocalizedContent = (field: 'description' | 'requirements' | 'responsibilities' | 'benefits' | 'nice_to_have') => {
    if (!vacancy) return ''
    
    const key = `${field}_${i18n.language}` as keyof Vacancy
    return (vacancy[key] as string) || vacancy[`${field}_en` as keyof Vacancy] || vacancy[`${field}_ru` as keyof Vacancy] || ''
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
            <Link to="/" className={styles.breadcrumbLink}>{t('home', 'Home')}</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <Link to="/vacancies" className={styles.breadcrumbLink}>{t('vacancies_title')}</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbCurrent}>{vacancy.title}</span>
          </div>

          <div className={styles.vacancyLayout}>
            {/* Left Column - Vacancy Details */}
            <div className={styles.vacancyDetails}>
              {/* Back Button */}
              <button 
                onClick={() => navigate('/vacancies')} 
                className={styles.backButtonTop}
              >
                ‹ {t('back', 'Back')}
              </button>

              {/* Vacancy Header */}
              <div className={styles.vacancyHeader}>
                <h1 className={styles.title}>{vacancy.title}</h1>
                
                <div className={styles.vacancyMeta}>
                  <div className={styles.categoryChip} style={{ backgroundColor: getCategoryColor(vacancy.category) }}>
                    <div className={styles.categoryDot}></div>
                    <span>{t(`vacancies_category_${vacancy.category}`, vacancy.category)}</span>
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
                <h2>{t('vacancy_general_info', 'General Information:')}</h2>
                <div className={styles.sectionContent}>
                  {getLocalizedContent('description').split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              {getLocalizedContent('responsibilities') && (
                <div className={styles.section}>
                  <h2>{t('vacancy_responsibilities', 'Responsibilities:')}</h2>
                  <div className={styles.sectionContent}>
                    {getLocalizedContent('responsibilities').split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {getLocalizedContent('requirements') && (
                <div className={styles.section}>
                  <h2>{t('vacancy_requirements', 'Requirements:')}</h2>
                  <div className={styles.sectionContent}>
                    {getLocalizedContent('requirements').split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Nice to Have */}
              {getLocalizedContent('nice_to_have') && (
                <div className={styles.section}>
                  <h2>{t('vacancy_nice_to_have', 'Nice to Have:')}</h2>
                  <div className={styles.sectionContent}>
                    {getLocalizedContent('nice_to_have').split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {getLocalizedContent('benefits') && (
                <div className={styles.section}>
                  <h2>{t('vacancy_benefits', 'Benefits:')}</h2>
                  <div className={styles.sectionContent}>
                    {getLocalizedContent('benefits').split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Application Form */}
            <div className={styles.applicationForm}>
              <div className={styles.formContainer}>
                <h3>{t('apply_for_position', 'Apply for this position')}</h3>
                
                {applicationSuccess ? (
                  <div className={styles.successMessage}>
                    <h4>{t('application_submitted', 'Application Submitted!')}</h4>
                    <p>{t('application_submitted_description', 'Thank you for your application. We will review it and get back to you soon.')}</p>
                    <button 
                      onClick={() => setApplicationSuccess(false)}
                      className={styles.submitAnother}
                    >
                      {t('submit_another', 'Submit Another Application')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                      <label htmlFor="full_name">{t('full_name', 'Full Name')}</label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        placeholder={t('full_name_placeholder', 'Enter your full name')}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="phone">{t('phone_number', 'Phone Number')}</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder={t('phone_placeholder', '+972 XX XXX XXXX')}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder={t('email_placeholder', 'your@email.com')}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="city">{t('city', 'City')}</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder={t('city_placeholder', 'Tel Aviv')}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="expected_salary">{t('expected_salary', 'Expected Salary')}</label>
                      <input
                        type="text"
                        id="expected_salary"
                        name="expected_salary"
                        value={formData.expected_salary}
                        onChange={handleInputChange}
                        placeholder="2000 ₪"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="portfolio_url">{t('portfolio_link', 'Portfolio Link')} ({t('optional', 'Optional')})</label>
                      <input
                        type="url"
                        id="portfolio_url"
                        name="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={handleInputChange}
                        placeholder="portfolio.com"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="resume">{t('upload_resume', 'Upload Resume')}</label>
                      <div className={styles.fileUpload}>
                        <input
                          type="file"
                          id="resume"
                          name="resume"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                          className={styles.fileInput}
                        />
                        <label htmlFor="resume" className={styles.fileLabel}>
                          <span className={styles.uploadIcon}>📁</span>
                          {formData.resume_file 
                            ? formData.resume_file.name 
                            : t('choose_file', 'Choose file or drag and drop')
                          }
                        </label>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="cover_letter">{t('cover_letter', 'Cover Letter')}</label>
                      <textarea
                        id="cover_letter"
                        name="cover_letter"
                        value={formData.cover_letter}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder={t('cover_letter_placeholder', 'Tell us about yourself and your experience...')}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className={styles.submitButton}
                      disabled={applicationLoading}
                    >
                      {applicationLoading ? t('submitting', 'Submitting...') : t('submit_application', 'Submit Application')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default VacancyDetail 