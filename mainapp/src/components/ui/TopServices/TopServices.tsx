import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ServiceCardIcons } from '@assets/icons/ServiceCardIcons'
import { useContentApi } from '@src/hooks/useContentApi'

import { ServiceCard } from './ServiceCard'
import styles from './topServices.module.scss'

const cx = classNames.bind(styles)

const TopServices: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { getContent, loading, error } = useContentApi('home_page')
  
  // Show loading state
  if (loading) {
    return (
      <div className={cx('services')}>
        <div>Loading services...</div>
      </div>
    )
  }
  
  return (
    <div className={cx('services')}>
      <ServiceCard
        to="/services/calculate-mortgage/1"
        title={getContent('calculate_mortgage', 'calculate_mortgage')}
        icon={<ServiceCardIcons src="/static/calculate-mortgage-icon.png" />}
      />
      <ServiceCard
        to="/services/refinance-mortgage/1"
        title={getContent('refinance_mortgage', 'mortgage_refinance')}
        icon={<ServiceCardIcons src="/static/refinance-mortgage-icon.png" />}
      />
      <ServiceCard
        to="/services/calculate-credit/1"
        title={getContent('calculate_credit', 'calculate_credit')}
        icon={<ServiceCardIcons src="/static/calculate-credit-icon.png" />}
      />
      <ServiceCard
        to="/services/refinance-credit/1"
        title={getContent('refinance_credit', 'credit_refinance')}
        icon={<ServiceCardIcons src="/static/refinance-credit-icon.png" />}
      />
    </div>
  )
}

export default TopServices
