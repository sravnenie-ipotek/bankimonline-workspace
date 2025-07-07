import { useTranslation } from 'react-i18next'
import Container from '../../components/ui/Container/Container'
import { PartnersSwiper } from '@src/components/ui/Swiper'
import PercentIcon from '../../assets/icons/PercentIcon/PercentIcon'
import styles from './TendersForBrokers.module.scss'

const TendersForBrokers = () => {
  const { t } = useTranslation()

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
