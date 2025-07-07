import { useTranslation } from 'react-i18next'
import Container from '../../components/ui/Container/Container'
import PartnersSwiper from '../../components/ui/Swiper/PartnersSwiper'
import styles from './TendersForBrokers.module.scss'

const TendersForBrokers = () => {
  const { t } = useTranslation()

  const handleCtaClick = () => {
    window.open('/broker-questionnaire', '_blank')
  }

  return (
    <div className={styles.tenders}>
      <Container>
        {/* Hero */}
        <section className={styles.hero}>
          <h1 className={styles.title}>{t('tenders_hero_title')}</h1>
          <p className={styles.subtitle}>{t('tenders_hero_subtitle')}</p>
          <button className={styles.ctaBtn} onClick={handleCtaClick}>
            {t('tenders_hero_cta')}
          </button>
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
