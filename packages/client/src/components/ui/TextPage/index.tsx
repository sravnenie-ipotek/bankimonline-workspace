import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Container } from '../Container'
import { CaretRightIcon } from '@/components/icons/CaretRightIcon'

import styles from './TextPage.module.css'

const cx = classNames.bind(styles)

interface TextPageProps {
  title: string
  text: string
}

const TextPage: React.FC<TextPageProps> = ({ title, text }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className={cx('page')}>
      <Container>
        <div className={cx('page-container')}>
          <div className={cx('page-header')}>
            <button className={cx('button')} onClick={() => navigate(-1)}>
              <CaretRightIcon
                color="#fff"
                style={{
                  transform: i18n.language === 'he' ? 'rotate(0)' : 'rotate(180deg)',
                }}
              />
              {t('back')}
            </button>
            <h1 className={cx('page-header__title')}>{title}</h1>
          </div>
          <div className={cx('page-text')}>{text}</div>
        </div>
      </Container>
    </div>
  )
}

export default TextPage