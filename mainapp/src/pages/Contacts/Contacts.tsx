import React, { useState } from 'react'
// Database-first migration: useTranslation removed in Phase 10
import classNames from 'classnames/bind'
import { useNavigate } from 'react-router-dom'
import Container from '../../components/ui/Container/Container.tsx'
import { useContentApi } from '@src/hooks/useContentApi'
import styles from './contacts.module.scss'

const cx = classNames.bind(styles)

const Contacts: React.FC = () => {
  // Database-first migration: t() hook removed in Phase 10
  const { getContent } = useContentApi('contacts')
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_self')
  }

  const handleLinkClick = (url: string) => {
    if (url.startsWith('/')) {
      navigate(url)
    } else {
      window.open(url, '_blank')
    }
  }

  const handleSocialClick = (platform: string) => {
    const socialLinks = {
      facebook: 'https://www.facebook.com/profile.php?id=100082843615194',
      instagram: 'https://instagram.com/erik_eitan2018',
      twitter: 'https://twitter.com/bankimonline',
      whatsapp: 'https://wa.me/972537162235'
    }
    
    if (socialLinks[platform as keyof typeof socialLinks]) {
      window.open(socialLinks[platform as keyof typeof socialLinks], '_blank')
    }
  }

  return (
    <div className={cx('contacts')}>
      {/* Header Section */}
      <div className={cx('header')}>
        <Container>
          <div className={cx('header-content')}>
            <div className={cx('header-info')}>
              <h1 className={cx('title')}>{getContent('contacts_title')}</h1>
              
              <div className={cx('main-office')}>
                <h2 className={cx('office-title')}>{getContent('contacts_main_office')}</h2>
                <div className={cx('office-details')}>
                  <p className={cx('address')}>{getContent('contacts_address')}</p>
                  <div className={cx('contact-links')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_phone'))}
                    >
                      {getContent('contacts_phone_label')}: {getContent('contacts_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_email'))}
                    >
                      {getContent('contacts_email_label')}: {getContent('contacts_email')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container>
        <div className={cx('content')}>
          {/* Contact Categories */}
          <div className={cx('categories')}>
            <div className={cx('category-tabs')}>
              <button 
                className={cx('tab', { active: activeTab === 'general' })}
                onClick={() => setActiveTab('general')}
              >
                {getContent('contacts_general_questions')}
              </button>
              <button 
                className={cx('tab', { active: activeTab === 'service' })}
                onClick={() => setActiveTab('service')}
              >
                {getContent('contacts_service_questions')}
              </button>
              <button 
                className={cx('tab', { active: activeTab === 'realestate' })}
                onClick={() => setActiveTab('realestate')}
              >
                {getContent('contacts_real_estate_questions')}
              </button>
              <button 
                className={cx('tab', { active: activeTab === 'cooperation' })}
                onClick={() => setActiveTab('cooperation')}
              >
                {getContent('contacts_cooperation')}
              </button>
            </div>
          </div>

          {/* General Questions Section */}
          {activeTab === 'general' && (
            <section className={cx('section')}>
              <h3 className={cx('section-title')}>{getContent('contacts_general_questions')}</h3>
              <div className={cx('contact-grid')}>
                {/* Technical Support */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_tech_support')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_tech_support_phone'))}
                    >
                      {getContent('contacts_tech_support_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_tech_support_email'))}
                    >
                      {getContent('contacts_tech_support_email')}
                    </button>
                    <button 
                      className={cx('action-link')}
                      onClick={() => handleEmailClick(getContent('contacts_tech_support_email'))}
                    >
                      {getContent('contacts_tech_support_link')}
                    </button>
                  </div>
                </div>

                {/* Secretary */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_secretary')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_secretary_phone'))}
                    >
                      {getContent('contacts_secretary_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_secretary_email'))}
                    >
                      {getContent('contacts_secretary_email')}
                    </button>
                    <button 
                      className={cx('action-link')}
                      onClick={() => handleEmailClick(getContent('contacts_secretary_email'))}
                    >
                      {getContent('contacts_secretary_link')}
                    </button>
                  </div>
                </div>

                {/* Customer Service */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_customer_service')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_customer_service_phone'))}
                    >
                      {getContent('contacts_customer_service_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_customer_service_email'))}
                    >
                      {getContent('contacts_customer_service_email')}
                    </button>
                    <button 
                      className={cx('action-link')}
                      onClick={() => handleEmailClick(getContent('contacts_customer_service_email'))}
                    >
                      {getContent('contacts_customer_service_link')}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Service Questions Section */}
          {activeTab === 'service' && (
            <section className={cx('section')}>
              <h3 className={cx('section-title')}>{getContent('contacts_service_questions')}</h3>
              <div className={cx('contact-grid', 'two-column')}>
                {/* Mortgage Calculator */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_mortgage_calc')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_mortgage_calc_phone'))}
                    >
                      {getContent('contacts_mortgage_calc_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_mortgage_calc_email'))}
                    >
                      {getContent('contacts_mortgage_calc_email')}
                    </button>
                  </div>
                </div>

                {/* Credit Calculator */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_credit_calc')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_credit_calc_phone'))}
                    >
                      {getContent('contacts_credit_calc_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_credit_calc_email'))}
                    >
                      {getContent('contacts_credit_calc_email')}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Real Estate Questions Section */}
          {activeTab === 'realestate' && (
            <section className={cx('section')}>
              <h3 className={cx('section-title')}>{getContent('contacts_real_estate_questions')}</h3>
              <div className={cx('contact-grid', 'two-column')}>
                {/* Buy/Sell Real Estate */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_real_estate_buy_sell')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_real_estate_buy_sell_phone'))}
                    >
                      {getContent('contacts_real_estate_buy_sell_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_real_estate_buy_sell_email'))}
                    >
                      {getContent('contacts_real_estate_buy_sell_email')}
                    </button>
                  </div>
                </div>

                {/* Rent Real Estate */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_real_estate_rent')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_real_estate_rent_phone'))}
                    >
                      {getContent('contacts_real_estate_rent_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_real_estate_rent_email'))}
                    >
                      {getContent('contacts_real_estate_rent_email')}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Cooperation Section */}
          {activeTab === 'cooperation' && (
            <section className={cx('section')}>
              <h3 className={cx('section-title')}>{getContent('contacts_cooperation')}</h3>
              <div className={cx('contact-grid')}>
                {/* Cooperation and Management */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_cooperation_management')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_cooperation_management_phone'))}
                    >
                      {getContent('contacts_cooperation_management_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_cooperation_management_email'))}
                    >
                      {getContent('contacts_cooperation_management_email')}
                    </button>
                  </div>
                </div>

                {/* Management Contacts */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_management_contacts')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_management_contacts_phone'))}
                    >
                      {getContent('contacts_management_contacts_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_management_contacts_email'))}
                    >
                      {getContent('contacts_management_contacts_email')}
                    </button>
                  </div>
                </div>

                {/* Accounting */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_accounting')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_accounting_phone'))}
                    >
                      {getContent('contacts_accounting_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(getContent('contacts_accounting_email'))}
                    >
                      {getContent('contacts_accounting_email')}
                    </button>
                  </div>
                </div>

                {/* Fax */}
                <div className={cx('contact-card')}>
                  <h4 className={cx('card-title')}>{getContent('contacts_fax')}</h4>
                  <div className={cx('contact-info')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(getContent('contacts_fax_phone'))}
                    >
                      {getContent('contacts_fax_phone')}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Social Media Section */}
          <section className={cx('section', 'social-section')}>
            <h3 className={cx('section-title')}>{getContent('contacts_social_follow')}</h3>
            <div className={cx('social-links')}>
              <button 
                className={cx('social-link', 'facebook')} 
                onClick={() => handleSocialClick('facebook')}
                aria-label="Facebook"
              >
                <span className={cx('social-icon')}>f</span>
              </button>
              <button 
                className={cx('social-link', 'instagram')} 
                onClick={() => handleSocialClick('instagram')}
                aria-label="Instagram"
              >
                <span className={cx('social-icon')}>📷</span>
              </button>
              <button 
                className={cx('social-link', 'twitter')} 
                onClick={() => handleSocialClick('twitter')}
                aria-label="Twitter"
              >
                <span className={cx('social-icon')}>𝕏</span>
              </button>
              <button 
                className={cx('social-link', 'whatsapp')} 
                onClick={() => handleSocialClick('whatsapp')}
                aria-label="WhatsApp"
              >
                <span className={cx('social-icon')}>💬</span>
              </button>
            </div>
          </section>
        </div>
      </Container>
    </div>
  )
}

export default Contacts