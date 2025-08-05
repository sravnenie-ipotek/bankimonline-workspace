import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Container } from '@/components/ui/Container'
import { CaretRightIcon } from '@/components/icons/CaretRightIcon'

import styles from './ServicesOverview.module.css'

const cx = classNames.bind(styles)

interface ServiceCard {
  id: string
  title: string
  description: string
  route: string
  icon: string
}

const ServicesOverview: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const services: ServiceCard[] = [
    {
      id: 'calculate-mortgage',
      title: t('sidebar_sub_calculate_mortgage'),
      description: t('calculate_mortgage_description', 'חישוב משכנתא מותאמת אישית'),
      route: '/services/calculate-mortgage/1',
      icon: '/static/calculate-mortgage-icon.png'
    },
    {
      id: 'refinance-mortgage',
      title: t('sidebar_sub_refinance_mortgage'),
      description: t('refinance_mortgage_description', 'מחזור משכנתא קיימת'),
      route: '/services/refinance-mortgage/1',
      icon: '/static/refinance-mortgage-icon.png'
    },
    {
      id: 'calculate-credit',
      title: t('sidebar_sub_calculate_credit'),
      description: t('calculate_credit_description', 'חישוב אשראי אישי'),
      route: '/services/calculate-credit/1',
      icon: '/static/calculate-credit-icon.png'
    },
    {
      id: 'refinance-credit',
      title: t('sidebar_sub_refinance_credit'),
      description: t('refinance_credit_description', 'מחזור אשראי קיים'),
      route: '/services/refinance-credit/1',
      icon: '/static/refinance-credit-icon.png'
    }
  ]

  const handleServiceSelect = (service: ServiceCard) => {
    navigate(service.route)
  }

  return (
    <div className={cx('services-overview', { 'rtl': i18n.language === 'he' })}>
      <Container>
        <div className={cx('services-container')}>
          <div className={cx('services-header')}>
            <h1 className={cx('services-title')}>{t('sidebar_company_1')}</h1>
            <p className={cx('services-subtitle')}>
              {t('services_overview_subtitle', 'בחרו את השירות הפיננסי המתאים לכם')}
            </p>
          </div>
          
          <div className={cx('services-grid')}>
            {services.map((service) => (
              <div
                key={service.id}
                className={cx('service-card')}
                onClick={() => handleServiceSelect(service)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleServiceSelect(service)
                  }
                }}
              >
                <div className={cx('service-content')}>
                  <div className={cx('service-icon')}>
                    <img 
                      src={service.icon} 
                      alt={service.title}
                      className={cx('icon-image')}
                    />
                  </div>
                  <div className={cx('service-info')}>
                    <h3 className={cx('service-title')}>{service.title}</h3>
                    <p className={cx('service-description')}>{service.description}</p>
                  </div>
                  <div className={cx('service-arrow')}>
                    <CaretRightIcon 
                      color="#fff" 
                      style={{
                        transform: i18n.language === 'he' ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ServicesOverview