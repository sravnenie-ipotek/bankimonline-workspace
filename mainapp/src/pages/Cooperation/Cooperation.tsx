import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
// import { useNavigate } from 'react-router-dom'
import Container from '../../components/ui/Container/Container'
import { PartnersSwiper } from '@src/components/ui/Swiper'
import styles from './Cooperation.module.scss'
import HowItWorks from '../../components/ui/HowItWorks'
import HandPointingIcon from '../../assets/icons/HandPointingIcon/HandPointingIcon'
import PercentIcon from '../../assets/icons/PercentIcon/PercentIcon'

const Cooperation = () => {
  const { t } = useTranslation()
  // const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0)
  // const [visibleCount, setVisibleCount] = useState(5)

  // Navigation handlers
  const handlePartnerLoginClick = () => {
    // Navigate to partner admin panel login
    window.open('/admin/login', '_blank')
  }

  const handleRegisterClick = () => {
    // Navigate to partner admin panel login for registration
    window.open('/admin/login', '_blank')
  }

  const handleSocialClick = (platform: string) => {
    const socialUrls = {
      instagram: 'https://instagram.com/bankimonline',
      youtube: 'https://youtube.com/@bankimonline',
      facebook: 'https://facebook.com/bankimonline',
      twitter: 'https://twitter.com/bankimonline',
      whatsapp: 'https://wa.me/972501234567'
    }
    
    if (socialUrls[platform as keyof typeof socialUrls]) {
      window.open(socialUrls[platform as keyof typeof socialUrls], '_blank')
    }
  }

  return (
    <div className={styles.cooperation}>
      <Container>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            {t('cooperation_title')}
          </h1>
          <p className={styles.heroSubtitle}>
            {t('cooperation_subtitle')}
          </p>
          
          <div className={styles.heroActions}>
            <button 
              className={styles.primaryButton}
              onClick={handleRegisterClick}
            >
              {t('register_partner_program')}
            </button>
          </div>
        </section>

        {/* Marketplace Promo Section */}
        <section className={styles.marketplace}>
          <div className={styles.marketLeft}>
            <h2 className={styles.marketTitle}>{t('marketplace_title')}</h2>
            <p className={styles.marketDesc}>{t('marketplace_description')}</p>

            <div className={styles.marketFeatures}>
              <ul>
                <li>{t('feature_mortgage_calc')}</li>
                <li>{t('feature_mortgage_refinance')}</li>
              </ul>
              <ul>
                <li>{t('feature_credit_calc')}</li>
                <li>{t('feature_credit_refinance')}</li>
              </ul>
            </div>
          </div>

          <div className={styles.marketRight}>
            <div className={styles.marketCard}>
              <img src="/static/primary-logo05-1.svg" alt="Bankimonline" />
              <img className={styles.marketPhoto} src="/static/about/frame-14100937611.svg" alt="Team" />
            </div>
            <button className={styles.marketCta}>
              <HandPointingIcon width={20} height={20} />
              {t('one_click_mortgage')}
            </button>
          </div>
        </section>

        {/* Referral Section */}
        <section className={styles.referral}>
          <div className={styles.referralLeft}>
            <div className={styles.iconCircle}>
              <PercentIcon color="#FBE54D" width={24} height={24} />
            </div>
            <h2 className={styles.referralTitle}>
              {t('referral_title', { defaultValue: 'Bring a client and get 500 ₪ reward' })}
            </h2>
            <p className={styles.referralDesc}>
              {t('referral_description', {
                defaultValue: 'Earn a commission for every client who purchases our services'
              })}
            </p>

            <button 
              className={styles.referralButton} 
              onClick={handleRegisterClick}
            >
              {t('register_partner_program')}
            </button>
          </div>
          <div className={styles.referralRight}>
            <img
              src="/static/about/frame-14100937612.svg"
              alt="Referral handshake"
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section className={styles.howItWorksWrapper}>
          <HowItWorks />
        </section>

        {/* Partners Section */}
        <section className={styles.partners}>
          <PartnersSwiper />
        </section>

        {/* CTA Banner Section */}
        <section className={styles.ctaBanner}>
          <div className={styles.ctaBannerContent}>
            <h2 className={styles.ctaBannerTitle}>
              {t('cooperation_cta_title')}
            </h2>
            <button 
              className={styles.ctaBannerButton}
              onClick={handleRegisterClick}
            >
              {t('register_partner_program')}
            </button>
          </div>
        </section>
      </Container>
    </div>
  )
}

export default Cooperation
