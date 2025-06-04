import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import useRoute from '@src/hooks/useRoute'
import { useWindowResize } from '@src/hooks/useWindowResize'

import CalculateMortgage from '../../../assets/img/features/calculate-mortgage.webp'
import MobileCalculateMortgage from '../../../assets/img/features/mobile-calculate-mortgage.webp'
import MobileRefinanceLoan from '../../../assets/img/features/mobile-refinance-loan.webp'
import MobileRefinanceMortgage from '../../../assets/img/features/mobile-refinance-mortgage.webp'
import MobileCalculateLoan from '../../../assets/img/features/mobile-сalculate-loan.webp'
import RefinanceLoan from '../../../assets/img/features/refinance-loan.webp'
import RefinanceMortgage from '../../../assets/img/features/refinance-mortgage.webp'
import CalculateLoan from '../../../assets/img/features/сalculate-loan.webp'
import { FeatureCard } from '../FeatureCard'
import styles from './featuresBeforeDeal.module.scss'

const cx = classNames.bind(styles)

const FeaturesBeforeDeal = () => {
  const { isMobile } = useWindowResize()

  const { nav } = useRoute()

  const { t } = useTranslation()

  return (
    <div className="flex flex-col">
      <p className={cx(styles.featuresTitle)}>{t('features.titleBefore')}</p>
      <div className={cx(styles.featuresPlate)}>
        <FeatureCard
          title={t('features.calculateMortgage')}
          img={isMobile ? MobileCalculateMortgage : CalculateMortgage}
          link={nav('calculateMortgage')}
          variant="big"
          className={cx(styles.featureCard)}
        />
        <FeatureCard
          title={t('features.refinanceMortgage')}
          img={isMobile ? MobileRefinanceMortgage : RefinanceMortgage}
          link={nav('refinanceMortgage')}
          variant="big"
          className={cx(styles.featureCard)}
        />
        <FeatureCard
          title={t('features.calculateLoan')}
          img={isMobile ? MobileCalculateLoan : CalculateLoan}
          link={nav('calculateLoan')}
          variant="big"
          className={cx(styles.featureCard)}
        />
        <FeatureCard
          title={t('features.refinanceLoan')}
          img={isMobile ? MobileRefinanceLoan : RefinanceLoan}
          link={nav('refinanceLoan')}
          variant="big"
          className={cx(styles.featureCard)}
        />
      </div>
    </div>
  )
}

export default FeaturesBeforeDeal
