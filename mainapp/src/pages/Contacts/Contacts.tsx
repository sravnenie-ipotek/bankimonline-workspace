import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames/bind'
import Container from '../../components/ui/Container/Container.tsx'
import styles from './contacts.module.scss'

const cx = classNames.bind(styles)

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  message?: string
}

const Contacts: React.FC = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Company contact information
  const contactInfo = {
    address: t('contacts_address'),
    phone: '04-6232280',
    email: 'info@bankimonline.com',
    workingHours: t('contacts_working_hours')
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('contact_form_name_required')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact_form_email_required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact_form_email_invalid')
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('contact_form_phone_required')
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact_form_message_required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContactClick = (type: string, value: string) => {
    switch (type) {
      case 'phone':
        window.open(`tel:${value}`, '_self')
        break
      case 'email':
        window.open(`mailto:${value}`, '_self')
        break
      default:
        break
    }
  }

  const openMap = () => {
    const address = encodeURIComponent(contactInfo.address)
    window.open(`https://maps.google.com/maps?q=${address}`, '_blank')
  }

  return (
    <div className={cx('contacts')}>
      <Container>
        {/* Page Header */}
        <section className={cx('hero-section')}>
          <div className={cx('hero-content')}>
            <h1 className={cx('page-title')}>{t('contacts_title')}</h1>
            <p className={cx('page-subtitle')}>{t('contacts_subtitle')}</p>
          </div>
        </section>

        <div className={cx('contact-content')}>
          {/* Contact Information */}
          <section className={cx('contact-info-section')}>
            <h2 className={cx('section-title')}>{t('contacts_info_title')}</h2>
            <div className={cx('contact-info-grid')}>
              <div className={cx('contact-info-card')}>
                <h3 className={cx('info-title')}>{t('contacts_address_title')}</h3>
                <p className={cx('info-text')}>{contactInfo.address}</p>
                <button 
                  className={cx('map-button')}
                  onClick={openMap}
                >
                  {t('contacts_view_map')}
                </button>
              </div>
              
              <div className={cx('contact-info-card')}>
                <h3 className={cx('info-title')}>{t('contacts_phone_title')}</h3>
                <button
                  className={cx('contact-link')}
                  onClick={() => handleContactClick('phone', contactInfo.phone)}
                >
                  {contactInfo.phone}
                </button>
                <p className={cx('info-text')}>{contactInfo.workingHours}</p>
              </div>
              
              <div className={cx('contact-info-card')}>
                <h3 className={cx('info-title')}>{t('contacts_email_title')}</h3>
                <button
                  className={cx('contact-link')}
                  onClick={() => handleContactClick('email', contactInfo.email)}
                >
                  {contactInfo.email}
                </button>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className={cx('contact-form-section')}>
            <h2 className={cx('section-title')}>{t('contacts_form_title')}</h2>
            
            {submitSuccess ? (
              <div className={cx('success-message')}>
                <h3>{t('contact_form_success_title')}</h3>
                <p>{t('contact_form_success_message')}</p>
                <button 
                  className={cx('reset-button')}
                  onClick={() => setSubmitSuccess(false)}
                >
                  {t('contact_form_send_another')}
                </button>
              </div>
            ) : (
              <form className={cx('contact-form')} onSubmit={handleSubmit}>
                <div className={cx('form-row')}>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')} htmlFor="name">
                      {t('contact_form_name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={cx('form-input', { error: errors.name })}
                      placeholder={t('contact_form_name_placeholder')}
                    />
                    {errors.name && <span className={cx('error-text')}>{errors.name}</span>}
                  </div>
                  
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')} htmlFor="email">
                      {t('contact_form_email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={cx('form-input', { error: errors.email })}
                      placeholder={t('contact_form_email_placeholder')}
                    />
                    {errors.email && <span className={cx('error-text')}>{errors.email}</span>}
                  </div>
                </div>
                
                <div className={cx('form-group')}>
                  <label className={cx('form-label')} htmlFor="phone">
                    {t('contact_form_phone')} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={cx('form-input', { error: errors.phone })}
                    placeholder={t('contact_form_phone_placeholder')}
                  />
                  {errors.phone && <span className={cx('error-text')}>{errors.phone}</span>}
                </div>
                
                <div className={cx('form-group')}>
                  <label className={cx('form-label')} htmlFor="message">
                    {t('contact_form_message')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={cx('form-textarea', { error: errors.message })}
                    placeholder={t('contact_form_message_placeholder')}
                    rows={5}
                  />
                  {errors.message && <span className={cx('error-text')}>{errors.message}</span>}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cx('submit-button', { loading: isSubmitting })}
                >
                  {isSubmitting ? t('contact_form_sending') : t('contact_form_submit')}
                </button>
              </form>
            )}
          </section>

          {/* Interactive Map Section */}
          <section className={cx('map-section')}>
            <h2 className={cx('section-title')}>{t('contacts_map_title')}</h2>
            <div className={cx('map-container')}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3375.4682!2d34.7749!3d32.0568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4d6e6f4f4f4f%3A0x4f4f4f4f4f4f4f4f!2sHerzl%20St%201%2C%20Tel%20Aviv-Yafo!5e0!3m2!1sen!2sil!4v1234567890"
                className={cx('map-iframe')}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('contacts_map_title')}
              />
            </div>
          </section>
        </div>
      </Container>
    </div>
  )
}

export default Contacts