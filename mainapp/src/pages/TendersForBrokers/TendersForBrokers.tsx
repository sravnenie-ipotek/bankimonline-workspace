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
          <div className={styles.marketLeft}>
            <img src="/static/primary-logo05-1.svg" alt="Logo" className={styles.marketLogo}/>
            <h3>{t('tenders_marketplace_title')}</h3>
            <ul>
              <li>{t('tenders_market_b1')}</li>
              <li>{t('tenders_market_b2')}</li>
            </ul>
          </div>
          <img src="/static/illustration1@2x.png" className={styles.marketPhoto} alt="market" />
        </section>

        {/* We bring clients banner */}
        <section className={styles.clientsBanner}>
          <PercentIcon color="#FBE54D" width={28} height={28} />
          <p>{t('tenders_clients_text')}</p>
        </section>

        {/* Earnings section header */}
        <section className={styles.earnHeader}>
          <h2>{t('tenders_earn_title')}</h2>
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
                  <span>{feature.title}</span>
                  {openFeature === idx ? (
                    <CaretUpIcon width={20} height={20} />
                  ) : (
                    <CaretDownIcon width={20} height={20} />
                  )}
                </button>
                {openFeature === idx && (
                  <ul className={styles.accordionBody}>
                    {feature.points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <img
            src="/static/illustration2@2x.png"
            alt="illustration"
            className={styles.licenseIllustration}
          />
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
