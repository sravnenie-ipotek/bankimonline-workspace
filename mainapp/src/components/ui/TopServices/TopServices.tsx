import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ServiceCardIcons } from '@assets/icons/ServiceCardIcons'

import { ServiceCard } from './ServiceCard'
import styles from './topServices.module.scss'

const cx = classNames.bind(styles)

const TopServices: React.FC = () => {
  const { t, i18n } = useTranslation()
  return (
    <div className={cx('services')}>
      <ServiceCard
        to="/services/calculate-mortgage/1"
        title={t('calculate_mortgage')}
        icon={<ServiceCardIcons src="/static/calculate-mortgage-icon.png" />}
      />
      <ServiceCard
        to="/services/refinance-mortgage/1"
        title={t('mortgage_refinance')}
        icon={<ServiceCardIcons src="/static/refinance-mortgage-icon.png" />}
      />
      <ServiceCard
        to="/services/calculate-credit/1"
        title={t('calculate_credit')}
        icon={<ServiceCardIcons src="/static/calculate-credit-icon.png" />}
      />
      <ServiceCard
        to="/services/refinance-credit/1"
        title={t('credit_refinance')}
        icon={<ServiceCardIcons src="/static/refinance-credit-icon.png" />}
      />
    </div>
  )
}

export default TopServices
