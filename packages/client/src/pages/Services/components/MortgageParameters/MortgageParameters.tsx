import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useContentApi } from '@src/hooks/useContentApi'

import { SliderHorizontalIcon } from '@assets/icons/SlidersHorizontalIcon'
import { Column } from '@components/ui/Column'
import { useServiceContext } from '@src/hooks/useServiceContext'

import styles from './mortgageParameters.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  cost?: number
  initialPayment?: number
  period?: number
  credit?: number
  onEditClick?: () => void
}

const MortgageParameters: React.FC<TypeProps> = ({
  cost,
  initialPayment,
  period,
  credit,
  onEditClick,
}: TypeProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step4')
  const navigate = useNavigate()
  const serviceType = useServiceContext()

  const isCredit = serviceType === 'credit'
  const numericCost = cost !== undefined && cost !== null ? Number(cost) : undefined
  const numericInitialPayment = initialPayment !== undefined && initialPayment !== null ? Number(initialPayment) : undefined
  const numericCredit = credit !== undefined && credit !== null ? Number(credit) : undefined
  const numericPeriod = period !== undefined && period !== null ? Number(period) : undefined

  // Dynamic navigation based on current service context
  const getEditNavigationPath = () => {
    switch (serviceType) {
      case 'mortgage':
        return '/services/calculate-mortgage/1'
      case 'credit':
        return '/services/calculate-credit/1'
      case 'refinance-mortgage':
        return '/services/refinance-mortgage/1'
      case 'refinance-credit':
        return '/services/refinance-credit/1'
      default:
        return '/services/calculate-mortgage/1' // fallback
    }
  }

  const formattedCost = numericCost !== undefined ? numericCost.toLocaleString('en-US') : undefined
  const formattedInitialPayment = numericInitialPayment !== undefined ? numericInitialPayment.toLocaleString('en-US') : undefined
  const formattedCredit = numericCredit !== undefined ? numericCredit.toLocaleString('en-US') : undefined
  const formattedPeriod = numericPeriod !== undefined ? numericPeriod * 12 : undefined

  return (
    <Column>
      <div className={cx('parameters')}>
        <div className={cx('parameters-title')}>
          <p className={cx('parameters-title__text')}>
            {getContent('calculate_mortgage_parameters', 'calculate_mortgage_parameters')}
          </p>
          <SliderHorizontalIcon
            onClick={onEditClick || (() => navigate(getEditNavigationPath()))}
            className={cx('parameters-title__icon')}
          />
        </div>
        <div className={cx('wrapper')}>
          {formattedCredit && (
            <div className={cx('parameters-data')}>
              <div className={cx('parameters-data__title')}>
                {formattedCredit} ₪
              </div>
              <div className={cx('parameters-data__desc')}>
                {t('sum_credit')}
              </div>
            </div>
          )}
          {formattedCost && (
            <div className={cx('parameters-data')}>
              <div className={cx('parameters-data__title')}>
                {formattedCost} ₪
              </div>
              <div className={cx('parameters-data__desc')}>
                {getContent(isCredit ? 'calculate_credit_parameters_cost' : 'calculate_mortgage_parameters_cost', isCredit ? 'calculate_credit_parameters_cost' : 'calculate_mortgage_parameters_cost')}
              </div>
            </div>
          )}
          {formattedInitialPayment && (
            <div className={cx('parameters-data')}>
              <div className={cx('parameters-data__title')}>
                {formattedInitialPayment} ₪
              </div>
              <div className={cx('parameters-data__desc')}>
                {getContent('calculate_mortgage_parameters_initial', 'calculate_mortgage_parameters_initial')}
              </div>
            </div>
          )}
        </div>
        {formattedPeriod && (
          <div className={cx('wrapper')}>
            <div className={cx('parameters-data')}>
              <div className={cx('parameters-data__title')}>
                {formattedPeriod} {getContent('calculate_mortgage_parameters_months', 'calculate_mortgage_parameters_months')}
              </div>
              <div className={cx('parameters-data__desc')}>
                {getContent(isCredit ? 'calculate_credit_parameters_period' : 'calculate_mortgage_parameters_period', isCredit ? 'calculate_credit_parameters_period' : 'calculate_mortgage_parameters_period')}
              </div>
            </div>
          </div>
        )}
      </div>
    </Column>
  )
}

export default MortgageParameters
