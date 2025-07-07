import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'
import Container from '../../components/ui/Container/Container'
import { Button } from '../../components/ui/ButtonUI'
import styles from './BrokerQuestionnaire.module.scss'

const cx = classNames.bind(styles)

interface FormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  
  // Professional Information
  experience: string
  licenseNumber: string
  currentClients: string
  monthlyDeals: string
  
  // Business Information
  officeType: string
  teamSize: string
  marketingBudget: string
  preferredCommission: string
  
  // Additional Information
  motivation: string
  expectations: string
  additionalInfo: string
}

const BrokerQuestionnaire: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    experience: '',
    licenseNumber: '',
    currentClients: '',
    monthlyDeals: '',
    officeType: '',
    teamSize: '',
    marketingBudget: '',
    preferredCommission: '',
    motivation: '',
    expectations: '',
    additionalInfo: ''
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const totalSteps = 4

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Here you would typically send the data to your API
      console.log('Submitting broker questionnaire:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Navigate to success page or show success message
      navigate('/tenders-for-brokers', { 
        state: { 
          message: t('broker_questionnaire_success', 'Thank you for your application! We will contact you soon.') 
        } 
      })
    } catch (error) {
      console.error('Error submitting questionnaire:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep1 = () => (
    <div className={cx('step-content')}>
      <h2 className={cx('step-title')}>{t('broker_questionnaire_step1_title', 'Personal Information')}</h2>
      
      <div className={cx('form-row')}>
        <div className={cx('form-field')}>
          <label htmlFor="firstName">{t('broker_questionnaire_first_name', 'First Name')} *</label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
            className={cx('form-input')}
          />
        </div>
        
        <div className={cx('form-field')}>
          <label htmlFor="lastName">{t('broker_questionnaire_last_name', 'Last Name')} *</label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
            className={cx('form-input')}
          />
        </div>
      </div>
      
      <div className={cx('form-row')}>
        <div className={cx('form-field')}>
          <label htmlFor="email">{t('broker_questionnaire_email', 'Email Address')} *</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className={cx('form-input')}
          />
        </div>
        
        <div className={cx('form-field')}>
          <label htmlFor="phone">{t('broker_questionnaire_phone', 'Phone Number')} *</label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            className={cx('form-input')}
          />
        </div>
      </div>
      
      <div className={cx('form-field')}>
        <label htmlFor="city">{t('broker_questionnaire_city', 'City')} *</label>
        <input
          type="text"
          id="city"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          required
          className={cx('form-input')}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className={cx('step-content')}>
      <h2 className={cx('step-title')}>{t('broker_questionnaire_step2_title', 'Professional Experience')}</h2>
      
      <div className={cx('form-field')}>
        <label htmlFor="experience">{t('broker_questionnaire_experience', 'Years of Experience')} *</label>
        <select
          id="experience"
          value={formData.experience}
          onChange={(e) => handleInputChange('experience', e.target.value)}
          required
          className={cx('form-select')}
        >
          <option value="">{t('broker_questionnaire_select_experience', 'Select experience level')}</option>
          <option value="0-1">{t('broker_questionnaire_experience_0_1', '0-1 years')}</option>
          <option value="2-5">{t('broker_questionnaire_experience_2_5', '2-5 years')}</option>
          <option value="6-10">{t('broker_questionnaire_experience_6_10', '6-10 years')}</option>
          <option value="10+">{t('broker_questionnaire_experience_10_plus', '10+ years')}</option>
        </select>
      </div>
      
      <div className={cx('form-field')}>
        <label htmlFor="licenseNumber">{t('broker_questionnaire_license', 'License Number')} *</label>
        <input
          type="text"
          id="licenseNumber"
          value={formData.licenseNumber}
          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
          required
          className={cx('form-input')}
        />
      </div>
      
      <div className={cx('form-row')}>
        <div className={cx('form-field')}>
          <label htmlFor="currentClients">{t('broker_questionnaire_current_clients', 'Current Number of Clients')} *</label>
          <select
            id="currentClients"
            value={formData.currentClients}
            onChange={(e) => handleInputChange('currentClients', e.target.value)}
            required
            className={cx('form-select')}
          >
            <option value="">{t('broker_questionnaire_select_clients', 'Select client range')}</option>
            <option value="0-10">{t('broker_questionnaire_clients_0_10', '0-10 clients')}</option>
            <option value="11-50">{t('broker_questionnaire_clients_11_50', '11-50 clients')}</option>
            <option value="51-100">{t('broker_questionnaire_clients_51_100', '51-100 clients')}</option>
            <option value="100+">{t('broker_questionnaire_clients_100_plus', '100+ clients')}</option>
          </select>
        </div>
        
        <div className={cx('form-field')}>
          <label htmlFor="monthlyDeals">{t('broker_questionnaire_monthly_deals', 'Monthly Deals')} *</label>
          <select
            id="monthlyDeals"
            value={formData.monthlyDeals}
            onChange={(e) => handleInputChange('monthlyDeals', e.target.value)}
            required
            className={cx('form-select')}
          >
            <option value="">{t('broker_questionnaire_select_deals', 'Select deal range')}</option>
            <option value="0-5">{t('broker_questionnaire_deals_0_5', '0-5 deals')}</option>
            <option value="6-15">{t('broker_questionnaire_deals_6_15', '6-15 deals')}</option>
            <option value="16-30">{t('broker_questionnaire_deals_16_30', '16-30 deals')}</option>
            <option value="30+">{t('broker_questionnaire_deals_30_plus', '30+ deals')}</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className={cx('step-content')}>
      <h2 className={cx('step-title')}>{t('broker_questionnaire_step3_title', 'Business Information')}</h2>
      
      <div className={cx('form-row')}>
        <div className={cx('form-field')}>
          <label htmlFor="officeType">{t('broker_questionnaire_office_type', 'Office Type')} *</label>
          <select
            id="officeType"
            value={formData.officeType}
            onChange={(e) => handleInputChange('officeType', e.target.value)}
            required
            className={cx('form-select')}
          >
            <option value="">{t('broker_questionnaire_select_office', 'Select office type')}</option>
            <option value="home">{t('broker_questionnaire_office_home', 'Home Office')}</option>
            <option value="shared">{t('broker_questionnaire_office_shared', 'Shared Office')}</option>
            <option value="private">{t('broker_questionnaire_office_private', 'Private Office')}</option>
            <option value="agency">{t('broker_questionnaire_office_agency', 'Real Estate Agency')}</option>
          </select>
        </div>
        
        <div className={cx('form-field')}>
          <label htmlFor="teamSize">{t('broker_questionnaire_team_size', 'Team Size')} *</label>
          <select
            id="teamSize"
            value={formData.teamSize}
            onChange={(e) => handleInputChange('teamSize', e.target.value)}
            required
            className={cx('form-select')}
          >
            <option value="">{t('broker_questionnaire_select_team', 'Select team size')}</option>
            <option value="solo">{t('broker_questionnaire_team_solo', 'Solo Broker')}</option>
            <option value="2-5">{t('broker_questionnaire_team_2_5', '2-5 people')}</option>
            <option value="6-10">{t('broker_questionnaire_team_6_10', '6-10 people')}</option>
            <option value="10+">{t('broker_questionnaire_team_10_plus', '10+ people')}</option>
          </select>
        </div>
      </div>
      
      <div className={cx('form-row')}>
        <div className={cx('form-field')}>
          <label htmlFor="marketingBudget">{t('broker_questionnaire_marketing_budget', 'Monthly Marketing Budget')} *</label>
          <select
            id="marketingBudget"
            value={formData.marketingBudget}
            onChange={(e) => handleInputChange('marketingBudget', e.target.value)}
            required
            className={cx('form-select')}
          >
            <option value="">{t('broker_questionnaire_select_budget', 'Select budget range')}</option>
            <option value="0-1000">{t('broker_questionnaire_budget_0_1000', '₪0 - ₪1,000')}</option>
            <option value="1000-5000">{t('broker_questionnaire_budget_1000_5000', '₪1,000 - ₪5,000')}</option>
            <option value="5000-10000">{t('broker_questionnaire_budget_5000_10000', '₪5,000 - ₪10,000')}</option>
            <option value="10000+">{t('broker_questionnaire_budget_10000_plus', '₪10,000+')}</option>
          </select>
        </div>
        
        <div className={cx('form-field')}>
          <label htmlFor="preferredCommission">{t('broker_questionnaire_preferred_commission', 'Preferred Commission Structure')} *</label>
          <select
            id="preferredCommission"
            value={formData.preferredCommission}
            onChange={(e) => handleInputChange('preferredCommission', e.target.value)}
            required
            className={cx('form-select')}
          >
            <option value="">{t('broker_questionnaire_select_commission', 'Select commission structure')}</option>
            <option value="per-deal">{t('broker_questionnaire_commission_per_deal', 'Per Deal')}</option>
            <option value="percentage">{t('broker_questionnaire_commission_percentage', 'Percentage Based')}</option>
            <option value="monthly">{t('broker_questionnaire_commission_monthly', 'Monthly Retainer')}</option>
            <option value="hybrid">{t('broker_questionnaire_commission_hybrid', 'Hybrid Model')}</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className={cx('step-content')}>
      <h2 className={cx('step-title')}>{t('broker_questionnaire_step4_title', 'Additional Information')}</h2>
      
      <div className={cx('form-field')}>
        <label htmlFor="motivation">{t('broker_questionnaire_motivation', 'What motivates you to join our platform?')} *</label>
        <textarea
          id="motivation"
          value={formData.motivation}
          onChange={(e) => handleInputChange('motivation', e.target.value)}
          required
          rows={4}
          className={cx('form-textarea')}
          placeholder={t('broker_questionnaire_motivation_placeholder', 'Please share your motivation...')}
        />
      </div>
      
      <div className={cx('form-field')}>
        <label htmlFor="expectations">{t('broker_questionnaire_expectations', 'What are your expectations from our partnership?')} *</label>
        <textarea
          id="expectations"
          value={formData.expectations}
          onChange={(e) => handleInputChange('expectations', e.target.value)}
          required
          rows={4}
          className={cx('form-textarea')}
          placeholder={t('broker_questionnaire_expectations_placeholder', 'Please share your expectations...')}
        />
      </div>
      
      <div className={cx('form-field')}>
        <label htmlFor="additionalInfo">{t('broker_questionnaire_additional_info', 'Additional Information (Optional)')}</label>
        <textarea
          id="additionalInfo"
          value={formData.additionalInfo}
          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
          rows={4}
          className={cx('form-textarea')}
          placeholder={t('broker_questionnaire_additional_info_placeholder', 'Any additional information you would like to share...')}
        />
      </div>
    </div>
  )

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.city
      case 2:
        return formData.experience && formData.licenseNumber && formData.currentClients && formData.monthlyDeals
      case 3:
        return formData.officeType && formData.teamSize && formData.marketingBudget && formData.preferredCommission
      case 4:
        return formData.motivation && formData.expectations
      default:
        return false
    }
  }

  return (
    <div className={cx('broker-questionnaire')}>
      <Container>
        <div className={cx('questionnaire-header')}>
          <h1 className={cx('questionnaire-title')}>
            {t('broker_questionnaire_title', 'Broker Partnership Application')}
          </h1>
          <p className={cx('questionnaire-subtitle')}>
            {t('broker_questionnaire_subtitle', 'Join our network of successful brokers and grow your business with us')}
          </p>
        </div>

        <div className={cx('progress-bar')}>
          <div className={cx('progress-steps')}>
            {Array.from({ length: totalSteps }, (_, index) => (
              <div
                key={index}
                className={cx('progress-step', {
                  active: index + 1 === currentStep,
                  completed: index + 1 < currentStep
                })}
              >
                <div className={cx('step-number')}>{index + 1}</div>
                <div className={cx('step-label')}>
                  {t(`broker_questionnaire_step${index + 1}_label`, `Step ${index + 1}`)}
                </div>
              </div>
            ))}
          </div>
          <div 
            className={cx('progress-fill')} 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className={cx('questionnaire-form')}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className={cx('form-actions')}>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevious}
                className={cx('action-button')}
              >
                {t('broker_questionnaire_previous', 'Previous')}
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={!isStepValid()}
                className={cx('action-button')}
              >
                {t('broker_questionnaire_next', 'Next')}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={!isStepValid() || isSubmitting}
                className={cx('action-button')}
              >
                {isSubmitting 
                  ? t('broker_questionnaire_submitting', 'Submitting...') 
                  : t('broker_questionnaire_submit', 'Submit Application')
                }
              </Button>
            )}
          </div>
        </form>
      </Container>
    </div>
  )
}

export default BrokerQuestionnaire 