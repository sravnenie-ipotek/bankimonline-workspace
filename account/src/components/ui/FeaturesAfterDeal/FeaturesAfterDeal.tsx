import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import useRoute from '@src/hooks/useRoute'

import CalculateMortgage from '../../../assets/img/features/calculate-mortgage.webp'
import RefinanceLoan from '../../../assets/img/features/refinance-loan.webp'
import RefinanceMortgage from '../../../assets/img/features/refinance-mortgage.webp'
import CalculateLoan from '../../../assets/img/features/сalculate-loan.webp'
import { FeatureCard } from '../FeatureCard'
import styles from './featuresAfterDeal.module.scss'

interface FeatureAfterDealProps {
  viewCalculateMortgage?: boolean // видимость рассчёта ипотеки
  viewRefinanceLoan?: boolean // видимость рефинансирования кредита
  viewRefinanceMortgage?: boolean // видимость рефинансирования ипотеки
  viewCalculateLoan?: boolean // видимость рассчёта кредита
}

const cx = classNames.bind(styles)

const FeaturesAfterDeal: React.FC<FeatureAfterDealProps> = ({
  viewCalculateMortgage = true,
  viewRefinanceLoan = true,
  viewRefinanceMortgage = true,
  viewCalculateLoan = true,
}: FeatureAfterDealProps) => {
  const { nav } = useRoute()

  const { t } = useTranslation()

  return (
    <div className="flex flex-col">
      <p className={cx(styles.featuresTitle)}>{t('features.titleAfter')}</p>
      <div className={cx(styles.featuresPlate)}>
        {viewCalculateMortgage && (
          <FeatureCard
            title={t('features.calculateMortgage')}
            img={CalculateMortgage}
            link={nav('calculateMortgage')}
            variant="small"
            className={cx(styles.featureCard)}
          />
        )}
        {viewRefinanceLoan && (
          <FeatureCard
            title={t('features.refinanceMortgage')}
            img={RefinanceMortgage}
            link={nav('refinanceMortgage')}
            variant="small"
            className={cx(styles.featureCard)}
          />
        )}
        {viewRefinanceMortgage && (
          <FeatureCard
            title={t('features.calculateLoan')}
            img={CalculateLoan}
            link={nav('calculateLoan')}
            variant="small"
            className={cx(styles.featureCard)}
          />
        )}
        {viewCalculateLoan && (
          <FeatureCard
            title={t('features.refinanceLoan')}
            img={RefinanceLoan}
            link={nav('refinanceLoan')}
            variant="small"
            className={cx(styles.featureCard)}
          />
        )}
      </div>
    </div>
  )
}

export default FeaturesAfterDeal
