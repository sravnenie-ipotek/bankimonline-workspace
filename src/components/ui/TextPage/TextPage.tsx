import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { CaretRightIcon } from '@assets/icons/CaretRightIcon'

import { Container } from '../Container'
import styles from './textPage.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  title: string
  text: string
}
const TextPage: React.FC<TypeProps> = ({ title, text }) => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

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
                  transform:
                    i18n.language === 'he' ? 'rotate(0)' : 'rotate(180deg)',
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
