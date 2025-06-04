import classNames from 'classnames/bind'
import React from 'react'
import { Link } from 'react-router-dom'

import { CaretRightIcon } from '@assets/icons/CaretRightIcon'
import { useWindowResize } from '@src/hooks/useWindowResize'

import styles from './serviceCard.module.scss'

type TypeProps = {
  title: string
  to: string
  icon: React.ReactNode
}

const cx = classNames.bind(styles)

const ServiceCard: React.FC<TypeProps> = ({ title, to, icon }) => {
  const { isDesktop, isTablet, isMobile } = useWindowResize()
  return (
    <Link to={to}>
      {isDesktop && (
        <div className={cx('service-card')}>
          <div className={cx('service-card__title')}>{title}</div>
          <div className={cx('service-card__icon')}>{icon}</div>
        </div>
      )}
      {isTablet && (
        <div className={cx('service-card')}>
          <div className={cx('service-card__tablet')}>
            <div className={cx('service-card__tablet-icon')}>{icon}</div>
            <div className={cx('service-card__tablet-title')}>{title}</div>
          </div>
          <div className={cx('service-card__icon')}>
            <CaretRightIcon color="#fff" />
          </div>
        </div>
      )}
      {isMobile && (
        <div className={cx('service-card')}>
          <div className={cx('service-card__tablet')}>
            <div className={cx('service-card__tablet-icon')}>{icon}</div>
            <div className={cx('service-card__tablet-title')}>{title}</div>
          </div>
          <div className={cx('service-card__icon')}>
            <CaretRightIcon color="#fff" />
          </div>
        </div>
      )}
    </Link>
  )
}

export default ServiceCard
