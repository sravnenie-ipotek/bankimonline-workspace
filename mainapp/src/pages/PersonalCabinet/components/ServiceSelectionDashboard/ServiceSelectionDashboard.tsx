import React from 'react'
import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import styles from './serviceSelectionDashboard.module.scss'

const cx = classNames.bind(styles)

interface ServiceCard {
  id: string
  title: string
  icon: string
  route: string
}

export const ServiceSelectionDashboard: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const services: ServiceCard[] = [
    {
      id: 'mortgage',
      title: t('calculate_mortgage', 'מחזור אשראי'),
      icon: '/static/mortgage-icon.png',
      route: '/services/calculate-mortgage/1'
    },
    {
      id: 'refinance-mortgage',
      title: t('refinance_mortgage', 'מחזור משכנתא'),
      icon: '/static/refinance-mortgage-icon.png',
      route: '/services/refinance-mortgage/1'
    },
    {
      id: 'credit',
      title: t('calculate_credit', 'חישוב אשראי'),
      icon: '/static/credit-icon.png',
      route: '/services/calculate-credit/1'
    },
    {
      id: 'refinance-credit',
      title: t('refinance_credit', 'מחזור אשראי'),
      icon: '/static/refinance-credit-icon.png',
      route: '/services/refinance-credit/1'
    }
  ]

  const handleServiceSelect = (service: ServiceCard) => {
    // Navigate to the service page
    navigate(service.route)
  }

  return (
    <div className={cx('service-selection-dashboard')}>
      {/* Page Header */}
      <div className={cx('header')}>
        <h1 className={cx('title')}>
          {t('main_dashboard_title', 'Главная')}
        </h1>
      </div>

      {/* Service Selection Section */}
      <div className={cx('selection-section')}>
        <div className={cx('selection-header')}>
          <h2 className={cx('selection-title')}>
            {t('choose_service_message', 'Выберите одну из услуг, чтобы продолжить')}
          </h2>
        </div>

        {/* Service Cards Grid */}
        <div className={cx('services-grid')}>
          {services.map((service) => (
            <button
              key={service.id}
              className={cx('service-card')}
              onClick={() => handleServiceSelect(service)}
              aria-label={`Select ${service.title}`}
            >
              <div className={cx('service-content')}>
                <div className={cx('service-icon')}>
                  <img 
                    src={service.icon} 
                    alt={service.title}
                    className={cx('icon-image')}
                  />
                </div>
                <div className={cx('service-title')}>
                  {service.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 