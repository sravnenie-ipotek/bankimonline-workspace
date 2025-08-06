import React, { useState, useEffect } from 'react'
import { useContentApi } from '@src/hooks/useContentApi'
// import { useNavigate } from 'react-router-dom'
import Container from '../../components/ui/Container/Container'
import { PartnersSwiper } from '@src/components/ui/Swiper'
import styles from './Cooperation.module.scss'
import HowItWorks from '../../components/ui/HowItWorks'
import HandPointingIcon from '../../assets/icons/HandPointingIcon/HandPointingIcon'
import PercentIcon from '../../assets/icons/PercentIcon/PercentIcon'

const Cooperation = () => {
  const { getContent } = useContentApi('cooperation')
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
            {getContent('cooperation_title', 'cooperation_title')}
          </h1>
          <p className={styles.heroSubtitle}>
            {getContent('cooperation_subtitle', 'cooperation_subtitle')}
          </p>
          
          <div className={styles.heroActions}>
            <button 
              className={styles.primaryButton}
              onClick={handleRegisterClick}
            >
              {getContent('register_partner_program', 'register_partner_program')}
            </button>
          </div>
        </section>

        {/* Marketplace Promo Section */}
        <section className={styles.marketplace}>
          <div className={styles.marketLeft}>
            <h2 className={styles.marketTitle}>{getContent('marketplace_title', 'marketplace_title')}</h2>
            <p className={styles.marketDesc}>{getContent('marketplace_description', 'marketplace_description')}</p>

            <div className={styles.marketFeatures}>
              <ul>
                <li>{getContent('feature_mortgage_calc', 'feature_mortgage_calc')}</li>
                <li>{getContent('feature_mortgage_refinance', 'feature_mortgage_refinance')}</li>
              </ul>
              <ul>
                <li>{getContent('feature_credit_calc', 'feature_credit_calc')}</li>
                <li>{getContent('feature_credit_refinance', 'feature_credit_refinance')}</li>
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
              {getContent('one_click_mortgage', 'one_click_mortgage')}
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
              {getContent('referral_title', 'referral_title')}
            </h2>
            <p className={styles.referralDesc}>
              {getContent('referral_description', 'referral_description')}
            </p>

            <button 
              className={styles.referralButton} 
              onClick={handleRegisterClick}
            >
              {getContent('register_partner_program', 'register_partner_program')}
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
          {/* Decorative horizontal lines */}
          <span className={styles.lineTop} aria-hidden="true" />
          <span className={styles.lineMiddle} aria-hidden="true" />

          <div className={styles.ctaBannerContent}>
            <h2 className={styles.ctaBannerTitle}>
              {getContent('cooperation_cta_title', 'cooperation_cta_title')}
            </h2>
            <button 
              className={styles.ctaBannerButton}
              onClick={handleRegisterClick}
            >
              {getContent('register_partner_program', 'register_partner_program')}
            </button>
          </div>
        </section>
      </Container>
    </div>
  )
}

export default Cooperation
