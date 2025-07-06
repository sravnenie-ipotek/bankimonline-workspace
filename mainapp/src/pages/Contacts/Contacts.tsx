import React from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames/bind'
import Container from '../../components/ui/Container/Container.tsx'
import styles from './contacts.module.scss'

const cx = classNames.bind(styles)

const Contacts: React.FC = () => {
  const { t } = useTranslation()

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_self')
  }

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className={cx('contacts')}>
      {/* Header Section */}
      <div className={cx('header')}>
        <Container>
          <div className={cx('header-content')}>
            <div className={cx('header-info')}>
              <h1 className={cx('title')}>{t('contacts_title')}</h1>
              
              <div className={cx('main-office')}>
                <h2 className={cx('office-title')}>{t('contacts_main_office')}</h2>
                <div className={cx('office-details')}>
                  <p className={cx('address')}>{t('contacts_address')}</p>
                  <div className={cx('contact-links')}>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handlePhoneClick(t('contacts_phone'))}
                    >
                      {t('contacts_phone')}
                    </button>
                    <button 
                      className={cx('contact-link')}
                      onClick={() => handleEmailClick(t('contacts_email'))}
                    >
                      {t('contacts_email')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={cx('login-section')}>
              <button 
                className={cx('login-button')}
                onClick={() => handleLinkClick('/auth')}
              >
                {t('contacts_login_cabinet')} →
              </button>
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
              <div className={cx('tab', 'active')}>{t('contacts_general_questions')}</div>
              <div className={cx('tab')}>{t('contacts_service_questions')}</div>
              <div className={cx('tab')}>{t('contacts_real_estate_questions')}</div>
              <div className={cx('tab')}>{t('contacts_cooperation')}</div>
            </div>
          </div>

          {/* General Questions Section */}
          <section className={cx('section')}>
            <h3 className={cx('section-title')}>{t('contacts_general_questions')}</h3>
            <div className={cx('contact-grid')}>
              {/* Technical Support */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_tech_support')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_tech_support_phone'))}
                  >
                    {t('contacts_tech_support_phone')}
                  </button>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handleEmailClick(t('contacts_tech_support_email'))}
                  >
                    {t('contacts_tech_support_email')}
                  </button>
                  <button className={cx('action-link')}>
                    {t('contacts_tech_support_link')}
                  </button>
                </div>
              </div>

              {/* Secretary */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_secretary')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_secretary_phone'))}
                  >
                    {t('contacts_secretary_phone')}
                  </button>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handleEmailClick(t('contacts_secretary_email'))}
                  >
                    {t('contacts_secretary_email')}
                  </button>
                  <button className={cx('action-link')}>
                    {t('contacts_secretary_link')}
                  </button>
                </div>
              </div>

              {/* Customer Service */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_customer_service')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_customer_service_phone'))}
                  >
                    {t('contacts_customer_service_phone')}
                  </button>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handleEmailClick(t('contacts_customer_service_email'))}
                  >
                    {t('contacts_customer_service_email')}
                  </button>
                  <button className={cx('action-link')}>
                    {t('contacts_customer_service_link')}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Mortgage and Credit Questions */}
          <section className={cx('section')}>
            <h3 className={cx('section-title')}>{t('contacts_service_questions')}</h3>
            <div className={cx('contact-grid', 'two-column')}>
              {/* Mortgage Calculator */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_mortgage_calc')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_mortgage_calc_phone'))}
                  >
                    {t('contacts_mortgage_calc_phone')}
                  </button>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handleEmailClick(t('contacts_mortgage_calc_email'))}
                  >
                    {t('contacts_mortgage_calc_email')}
                  </button>
                </div>
              </div>

              {/* Credit Calculator */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_credit_calc')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_credit_calc_phone'))}
                  >
                    {t('contacts_credit_calc_phone')}
                  </button>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handleEmailClick(t('contacts_credit_calc_email'))}
                  >
                    {t('contacts_credit_calc_email')}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Real Estate Questions */}
          <section className={cx('section')}>
            <h3 className={cx('section-title')}>{t('contacts_real_estate_questions')}</h3>
            <div className={cx('contact-grid', 'two-column')}>
              {/* Buy/Sell Real Estate */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_real_estate_buy_sell')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_real_estate_buy_sell_phone'))}
                  >
                    {t('contacts_real_estate_buy_sell_phone')}
                  </button>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handleEmailClick(t('contacts_real_estate_buy_sell_email'))}
                  >
                    {t('contacts_real_estate_buy_sell_email')}
                  </button>
                </div>
              </div>

              {/* Rent Real Estate */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_real_estate_rent')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_real_estate_rent_phone'))}
                  >
                    {t('contacts_real_estate_rent_phone')}
                  </button>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handleEmailClick(t('contacts_real_estate_rent_email'))}
                  >
                    {t('contacts_real_estate_rent_email')}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Cooperation Section */}
          <section className={cx('section')}>
            <h3 className={cx('section-title')}>{t('contacts_cooperation')}</h3>
            <div className={cx('contact-grid')}>
              {/* Cooperation and Management */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_cooperation_management')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_cooperation_management_phone'))}
                  >
                    {t('contacts_cooperation_management_phone')}
                  </button>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handleEmailClick(t('contacts_cooperation_management_email'))}
                  >
                    {t('contacts_cooperation_management_email')}
                  </button>
                </div>
              </div>

              {/* Management Contacts */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_management_contacts')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_management_contacts_phone'))}
                  >
                    {t('contacts_management_contacts_phone')}
                  </button>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handleEmailClick(t('contacts_management_contacts_email'))}
                  >
                    {t('contacts_management_contacts_email')}
                  </button>
                </div>
              </div>

              {/* Accounting */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_accounting')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_accounting_phone'))}
                  >
                    {t('contacts_accounting_phone')}
                  </button>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handleEmailClick(t('contacts_accounting_email'))}
                  >
                    {t('contacts_accounting_email')}
                  </button>
                </div>
              </div>

              {/* Fax */}
              <div className={cx('contact-card')}>
                <h4 className={cx('card-title')}>{t('contacts_fax')}</h4>
                <div className={cx('contact-info')}>
                  <button 
                    className={cx('contact-link')}
                    onClick={() => handlePhoneClick(t('contacts_fax_phone'))}
                  >
                    {t('contacts_fax_phone')}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Social Media Section */}
          <section className={cx('section', 'social-section')}>
            <h3 className={cx('section-title')}>{t('contacts_social_follow')}</h3>
            <div className={cx('social-links')}>
              <button className={cx('social-link')} onClick={() => handleLinkClick('#')}>
                <span className={cx('social-icon')}>📘</span>
              </button>
              <button className={cx('social-link')} onClick={() => handleLinkClick('#')}>
                <span className={cx('social-icon')}>📷</span>
              </button>
              <button className={cx('social-link')} onClick={() => handleLinkClick('#')}>
                <span className={cx('social-icon')}>🐦</span>
              </button>
              <button className={cx('social-link')} onClick={() => handleLinkClick('#')}>
                <span className={cx('social-icon')}>💬</span>
              </button>
            </div>
          </section>
        </div>
      </Container>

      {/* Footer Section */}
      <footer className={cx('footer')}>
        <Container>
          <div className={cx('footer-content')}>
            <div className={cx('footer-column')}>
              <h4 className={cx('footer-title')}>{t('contacts_footer_company')}</h4>
              <ul className={cx('footer-links')}>
                <li><button className={cx('footer-link')}>{t('contacts_footer_about')}</button></li>
                <li><button className={cx('footer-link')}>{t('contacts_footer_team')}</button></li>
                <li><button className={cx('footer-link')}>{t('contacts_footer_vacancies')}</button></li>
                <li><button className={cx('footer-link')}>{t('contacts_footer_cooperation')}</button></li>
              </ul>
            </div>

            <div className={cx('footer-column')}>
              <h4 className={cx('footer-title')}>{t('contacts_footer_contacts')}</h4>
              <ul className={cx('footer-links')}>
                <li>
                  <button 
                    className={cx('footer-link')}
                    onClick={() => handlePhoneClick(t('contacts_footer_phone'))}
                  >
                    {t('contacts_footer_phone')}
                  </button>
                </li>
                <li><button className={cx('footer-link')}>{t('contacts_footer_admin_contact')}</button></li>
              </ul>
            </div>

            <div className={cx('footer-column')}>
              <h4 className={cx('footer-title')}>{t('contacts_footer_legal_docs')}</h4>
              <ul className={cx('footer-links')}>
                <li><button className={cx('footer-link')}>{t('contacts_footer_privacy')}</button></li>
                <li><button className={cx('footer-link')}>{t('contacts_footer_confidentiality')}</button></li>
                <li><button className={cx('footer-link')}>{t('contacts_footer_cookie_usage')}</button></li>
                <li><button className={cx('footer-link')}>{t('contacts_footer_refund')}</button></li>
                <li><button className={cx('footer-link')}>{t('contacts_footer_cookie_settings')}</button></li>
              </ul>
            </div>
          </div>

          <div className={cx('footer-bottom')}>
            <p className={cx('copyright')}>© 2023 Все права защищены Bankimonline Ltd</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default Contacts