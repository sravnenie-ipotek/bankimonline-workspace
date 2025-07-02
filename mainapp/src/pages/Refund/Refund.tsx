import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import classNames from 'classnames/bind'

import { Container } from '@src/components/ui/Container'
import { CaretRightIcon } from '@assets/icons/CaretRightIcon'

import styles from './refund.module.scss'

const cx = classNames.bind(styles)

const Refund = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className={cx('refund', { 'rtl': i18n.language === 'he' })}>
      <Container>
        <div className={cx('refund-container')}>
          <div className={cx('refund-header')}>
            <button className={cx('back-button')} onClick={() => navigate(-1)}>
              <CaretRightIcon
                color="#fff"
                style={{
                  transform: i18n.language === 'he' ? 'rotate(0)' : 'rotate(180deg)',
                }}
              />
              {t('back')}
            </button>
          </div>
          
          <div className={cx('refund-content')}>
            <h1 className={cx('refund-title')}>{t('refund_title')}</h1>
            
            <div className={cx('refund-text')}>
              <p>{t('refund_text')}</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Refund
