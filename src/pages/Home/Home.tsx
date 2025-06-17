import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HowItWorks from '@components/ui/HowItWorks'
import SkipCookie from '@components/ui/SkipCookie/SkipCookie.tsx'
import { Container } from '@src/components/ui/Container'
import { PartnersSwiper } from '@src/components/ui/Swiper'
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster'

import TopServices from '../../components/ui/TopServices/TopServices'
import styles from './home.module.scss'

const cx = classNames.bind(styles)

// Компонент главной страницы
const Home: React.FC = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]

  return (
    <>
      <div className={cx('home')}>
        <Container>
          <VideoPoster
            title={t('title_compare')}
            subtitle={t('compare_in_5minutes')}
            text={t('show_offers')}
          />
        </Container>
        <TopServices />
        <PartnersSwiper />
        <HowItWorks />
      </div>
      <SkipCookie />
    </>
  )
}

export default Home
