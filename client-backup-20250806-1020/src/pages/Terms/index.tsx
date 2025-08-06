import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Container } from '@/components/ui/Container'
import { CaretRightIcon } from '@/components/icons/CaretRightIcon'

import styles from './Terms.module.css'

const cx = classNames.bind(styles)

const Terms: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className={cx('terms', { 'rtl': i18n.language === 'he' })}>
      <Container>
        <div className={cx('terms-container')}>
          <div className={cx('terms-header')}>
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
          
          <div className={cx('terms-content')}>
            <h1 className={cx('terms-title')}>{t('terms_title')}</h1>
            
            <div className={cx('terms-text')}>
              <p>{t('terms_text')}</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Terms