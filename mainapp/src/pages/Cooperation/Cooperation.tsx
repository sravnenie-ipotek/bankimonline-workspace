import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Container from '../../components/ui/Container/Container'
import styles from './Cooperation.module.scss'

const Cooperation = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0)

  // Partner bank logos (using placeholder data - should come from API in real implementation)
  const partnerBanks = [
    { name: 'Bank Hapoalim', logo: '/images/banks/bank-hapoalim.png' },
    { name: 'Bank Leumi', logo: '/images/banks/bank-leumi.png' },
    { name: 'Mizrahi Tefahot', logo: '/images/banks/mizrahi-tefahot.png' },
    { name: 'First International Bank', logo: '/images/banks/fibi.png' },
    { name: 'Bank Discount', logo: '/images/banks/bank-discount.png' },
    { name: 'Union Bank', logo: '/images/banks/union-bank.png' }
  ]

  // Navigation handlers
  const handleLogoClick = () => {
    navigate('/')
  }

  const handlePartnerLoginClick = () => {
    // Navigate to partner admin panel login
    window.open('/admin/partner-login', '_blank')
  }

  const handleRegisterClick = () => {
    // Navigate to partner registration
    window.open('/admin/partner-register', '_blank')
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

  const handleContactClick = (type: 'email' | 'phone' | 'support') => {
    if (type === 'email') {
      window.location.href = `mailto:${t('cooperation_email')}`
    } else if (type === 'phone') {
      window.location.href = `tel:${t('cooperation_phone')}`
    } else if (type === 'support') {
      window.open('https://wa.me/972501234567', '_blank')
    }
  }

  const handleLinkClick = (path: string) => {
    navigate(path)
  }

  // Partner carousel navigation
  const nextPartner = () => {
    setCurrentPartnerIndex((prev) => 
      prev === partnerBanks.length - 1 ? 0 : prev + 1
    )
  }

  const prevPartner = () => {
    setCurrentPartnerIndex((prev) => 
      prev === 0 ? partnerBanks.length - 1 : prev - 1
    )
  }

  return (
    <div className={styles.cooperationPage}>
      <Container>
        <div className={styles.content}>
          {/* Header Section */}
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <div className={styles.logo} onClick={handleLogoClick}>
                <img src="/images/logo.png" alt="Bankimonline" />
              </div>
              <button 
                className={styles.partnerLoginButton}
                onClick={handlePartnerLoginClick}
              >
                {t('cooperation_partner_login')}
              </button>
            </div>
            
            <div className={styles.heroSection}>
              <h1 className={styles.title}>{t('cooperation_title')}</h1>
              <p className={styles.subtitle}>{t('cooperation_subtitle')}</p>
              <button 
                className={styles.registerButton}
                onClick={handleRegisterClick}
              >
                {t('cooperation_register')}
              </button>
            </div>
          </header>

          {/* About Us Section */}
          <section className={styles.section}>
            <div className={styles.aboutSection}>
              <h2 className={styles.sectionTitle}>{t('cooperation_about_title')}</h2>
              <div className={styles.aboutContent}>
                <p>{t('cooperation_about_description_1')}</p>
                <p>{t('cooperation_about_description_2')}</p>
                <p>{t('cooperation_about_description_3')}</p>
              </div>
            </div>
          </section>

          {/* How You Will Earn Section */}
          <section className={styles.section}>
            <div className={styles.earningSection}>
              <h2 className={styles.sectionTitle}>{t('cooperation_earning_title')}</h2>
              <div className={styles.earningContent}>
                <div className={styles.earningCard}>
                  <div className={styles.earningIcon}>💰</div>
                  <h3>{t('cooperation_earning_commission_title')}</h3>
                  <p>{t('cooperation_earning_commission_desc')}</p>
                </div>
                <div className={styles.earningCard}>
                  <div className={styles.earningIcon}>📈</div>
                  <h3>{t('cooperation_earning_bonus_title')}</h3>
                  <p>{t('cooperation_earning_bonus_desc')}</p>
                </div>
                <div className={styles.earningCard}>
                  <div className={styles.earningIcon}>🎯</div>
                  <h3>{t('cooperation_earning_targets_title')}</h3>
                  <p>{t('cooperation_earning_targets_desc')}</p>
                </div>
              </div>
              <button 
                className={styles.registerButton}
                onClick={handleRegisterClick}
              >
                {t('cooperation_register')}
              </button>
            </div>
          </section>

          {/* Partnership Steps Section */}
          <section className={styles.section}>
            <div className={styles.stepsSection}>
              <h2 className={styles.sectionTitle}>{t('cooperation_steps_title')}</h2>
              <div className={styles.stepsGrid}>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>1</div>
                  <h3>{t('cooperation_step1_title')}</h3>
                  <p>{t('cooperation_step1_desc')}</p>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>2</div>
                  <h3>{t('cooperation_step2_title')}</h3>
                  <p>{t('cooperation_step2_desc')}</p>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>3</div>
                  <h3>{t('cooperation_step3_title')}</h3>
                  <p>{t('cooperation_step3_desc')}</p>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>4</div>
                  <h3>{t('cooperation_step4_title')}</h3>
                  <p>{t('cooperation_step4_desc')}</p>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>5</div>
                  <h3>{t('cooperation_step5_title')}</h3>
                  <p>{t('cooperation_step5_desc')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Partner Banks Section */}
          <section className={styles.section}>
            <div className={styles.partnersSection}>
              <h2 className={styles.sectionTitle}>{t('cooperation_partners_title')}</h2>
              <div className={styles.partnersCarousel}>
                <button 
                  className={styles.carouselButton}
                  onClick={prevPartner}
                  aria-label="Previous partner"
                >
                  ‹
                </button>
                <div className={styles.partnersGrid}>
                  {partnerBanks.slice(currentPartnerIndex, currentPartnerIndex + 4).map((bank, index) => (
                    <div key={index} className={styles.partnerLogo}>
                      <img src={bank.logo} alt={bank.name} />
                    </div>
                  ))}
                </div>
                <button 
                  className={styles.carouselButton}
                  onClick={nextPartner}
                  aria-label="Next partner"
                >
                  ›
                </button>
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className={styles.section}>
            <div className={styles.ctaSection}>
              <h2 className={styles.ctaTitle}>{t('cooperation_cta_title')}</h2>
              <p className={styles.ctaDescription}>{t('cooperation_cta_description')}</p>
              <button 
                className={styles.registerButton}
                onClick={handleRegisterClick}
              >
                {t('cooperation_register')}
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className={styles.footer}>
            <div className={styles.footerContent}>
              <div className={styles.footerSection}>
                <h3>{t('footer_social_follow')}</h3>
                <div className={styles.socialLinks}>
                  <button 
                    className={styles.socialLink}
                    onClick={() => handleSocialClick('instagram')}
                    aria-label="Instagram"
                  >
                    📷
                  </button>
                  <button 
                    className={styles.socialLink}
                    onClick={() => handleSocialClick('youtube')}
                    aria-label="YouTube"
                  >
                    📺
                  </button>
                  <button 
                    className={styles.socialLink}
                    onClick={() => handleSocialClick('facebook')}
                    aria-label="Facebook"
                  >
                    f
                  </button>
                  <button 
                    className={styles.socialLink}
                    onClick={() => handleSocialClick('twitter')}
                    aria-label="Twitter"
                  >
                    𝕏
                  </button>
                  <button 
                    className={styles.socialLink}
                    onClick={() => handleSocialClick('whatsapp')}
                    aria-label="WhatsApp"
                  >
                    💬
                  </button>
                </div>
              </div>

              <div className={styles.footerSection}>
                <h3>{t('footer_navigation')}</h3>
                <div className={styles.footerLinks}>
                  <button onClick={() => handleLinkClick('/about')}>{t('footer_about')}</button>
                  <button onClick={() => handleLinkClick('/contacts')}>{t('footer_contacts')}</button>
                  <button onClick={() => handleLinkClick('/vacancies')}>{t('footer_vacancies')}</button>
                  <button onClick={() => handleLinkClick('/cooperation')}>{t('footer_cooperation')}</button>
                </div>
              </div>

              <div className={styles.footerSection}>
                <h3>{t('footer_contact_info')}</h3>
                <div className={styles.contactInfo}>
                  <button 
                    className={styles.contactLink}
                    onClick={() => handleContactClick('email')}
                  >
                    {t('cooperation_email')}
                  </button>
                  <button 
                    className={styles.contactLink}
                    onClick={() => handleContactClick('phone')}
                  >
                    {t('cooperation_phone')}
                  </button>
                  <button 
                    className={styles.contactLink}
                    onClick={() => handleContactClick('support')}
                  >
                    {t('footer_support')}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.footerBottom}>
              <div className={styles.legalLinks}>
                <button onClick={() => handleLinkClick('/terms')}>{t('footer_terms')}</button>
                <button onClick={() => handleLinkClick('/privacy')}>{t('footer_privacy')}</button>
                <button onClick={() => handleLinkClick('/cookies')}>{t('footer_cookies')}</button>
                <button onClick={() => handleLinkClick('/refund')}>{t('footer_refund')}</button>
              </div>
            </div>
          </footer>
        </div>
      </Container>
    </div>
  )
}

export default Cooperation
