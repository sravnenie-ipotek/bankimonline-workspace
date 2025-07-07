import { useTranslation } from 'react-i18next'
import Container from '../../components/ui/Container/Container'
import { PartnersSwiper } from '@src/components/ui/Swiper'
import PercentIcon from '../../assets/icons/PercentIcon/PercentIcon'
import { CaretDownIcon } from '../../assets/icons/CaretDownIcon/CaretDownIcon'
import { CaretUpIcon } from '../../assets/icons/CaretUpIcon/CaretUpIcon'
import styles from './TendersForBrokers.module.scss'
import { useState } from 'react'

const TendersForBrokers = () => {
  const { t } = useTranslation()

  // accordion state for license features
  const [openFeature, setOpenFeature] = useState<number | null>(0)

  const licenseFeatures = [
    {
      title: t('tenders_license_feature1_title'),
      points: [
        t('tenders_license_feature1_p1'),
        t('tenders_license_feature1_p2'),
        t('tenders_license_feature1_p3'),
      ],
    },
    {
      title: t('tenders_license_feature2_title'),
      points: [
        t('tenders_license_feature2_p1'),
        t('tenders_license_feature2_p2'),
        t('tenders_license_feature2_p3'),
      ],
    },
    {
      title: t('tenders_license_feature3_title'),
      points: [
        t('tenders_license_feature3_p1'),
        t('tenders_license_feature3_p2'),
        t('tenders_license_feature3_p3'),
      ],
    },
  ]

  const handleCtaClick = () => {
    window.open('/broker-questionnaire', '_blank')
  }

  return (
    <div className={styles.tenders}>
      <Container>
        {/* Hero Banner */}
        <section className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <h2>{t('tenders_hero_headline')}</h2>
            <ul className={styles.benefitsList}>
              <li>{t('tenders_hero_b1')}</li>
              <li>{t('tenders_hero_b2')}</li>
              <li>{t('tenders_hero_b3')}</li>
            </ul>
            <button className={styles.primaryBtn} onClick={handleCtaClick}>
              {t('tenders_hero_cta')}
            </button>
          </div>
          <img className={styles.heroImage} src="/static/illustration@2x.png" alt="office" />
        </section>

        {/* Marketplace Promo */}
        <section className={styles.marketplace}>
          <div className={styles.marketContent}>
            <h3>{t('tenders_marketplace_title')}</h3>
            <p className={styles.marketSubtitle}>{t('tenders_marketplace_subtitle')}</p>
            <ul className={styles.marketList}>
              <li>{t('calculate_mortgage')}</li>
              <li>{t('calculate_credit')}</li>
              <li>{t('refinance_mortgage')}</li>
              <li>{t('refinance_credit')}</li>
            </ul>
          </div>
          <div className={styles.logoCard}>
            <img src="/static/logo.svg" alt="Bankimonline" className={styles.logoImage} />
          </div>
        </section>

        {/* Clients & Earnings banner */}
        <section className={styles.clientsBanner}>
          <div className={styles.clientsCard}>
            <div className={styles.clientsIconWrapper}>
              <PercentIcon color="#161616" width={24} height={24} />
            </div>
            <div className={styles.clientsContent}>
              <h3>{t('tenders_clients_title')}</h3>
              <p>{t('tenders_clients_subtitle')}</p>
            </div>
          </div>
          <h2 className={styles.clientsHeading}>{t('tenders_earn_title')}</h2>
        </section>

        {/* License Accordion Section */}
        <section className={styles.licenseSection}>
          <div className={styles.licenseContent}>
            <h2>{t('tenders_license_title')}</h2>
            {licenseFeatures.map((feature, idx) => (
              <div key={idx} className={styles.accordionItem}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => setOpenFeature(openFeature === idx ? null : idx)}
                >
                  <div className={styles.accordionHeaderContent}>
                    <div className={styles.accordionIcon}>
                      {idx === 0 && <div className={styles.iconBuilding}>🏢</div>}
                      {idx === 1 && <div className={styles.iconMarketing}>📢</div>}
                      {idx === 2 && <div className={styles.iconSupport}>🎓</div>}
                    </div>
                    <span className={styles.accordionTitle}>{feature.title}</span>
                  </div>
                  {openFeature === idx ? (
                    <CaretUpIcon width={20} height={20} />
                  ) : (
                    <CaretDownIcon width={20} height={20} />
                  )}
                </button>
                {openFeature === idx && (
                  <ul className={styles.accordionBody}>
                    {feature.points.map((p, i) => (
                      <li key={i}>
                        <span className={styles.bulletIcon}>•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className={styles.licenseIllustrationWrapper}>
            <div className={styles.tooltipContainer}>
              <div className={styles.tooltip}>
                <span className={styles.tooltipIcon}>💰</span>
                <span>{t('tenders_tooltip_earnings')}</span>
              </div>
            </div>
            <img
              src="/static/illustration2@2x.png"
              alt="illustration"
              className={styles.licenseIllustration}
            />
            <div className={styles.illustrationLabel}>
              <span className={styles.labelIcon}>🏢</span>
              <span>{t('tenders_illustration_label')}</span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className={styles.about}>
          <h2>{t('tenders_about_title')}</h2>
          <p>{t('tenders_about_desc')}</p>
        </section>

        {/* Partners */}
        <section>
          <PartnersSwiper />
        </section>

        {/* Steps Section */}
        <section className={styles.stepsSection}>
          <h2 className={styles.stepsTitle}>{t('tenders_steps_title')}</h2>
          <div className={styles.stepsGrid}>
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} className={styles.stepCard}>
                <span className={styles.stepNumber}>{num}</span>
                <p>{t(`tenders_step${num}` as any)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Metrics Section */}
        <section className={styles.metricsSection}>
          <div className={styles.metricCard}>
            <h3>{t('tenders_metrics_investment_title')}</h3>
            <p className={styles.metricValue}>{t('tenders_metrics_investment_value')}</p>
          </div>
          <div className={styles.metricCard}>
            <h3>{t('tenders_metrics_income_title')}</h3>
            <p className={styles.metricValue}>{t('tenders_metrics_income_value')}</p>
          </div>
          <div className={styles.metricCard}>
            <h3>{t('tenders_metrics_payback_title')}</h3>
            <p className={styles.metricValue}>{t('tenders_metrics_payback_value')}</p>
          </div>
        </section>

        {/* CTA Banner */}
        <section className={styles.ctaBanner}>
          <h2 className={styles.ctaTitle}>{t('tenders_cta_title')}</h2>
          <button className={styles.ctaButton} onClick={handleCtaClick}>
            {t('tenders_cta_button')}
          </button>
        </section>
      </Container>
    </div>
  )
}

export default TendersForBrokers
