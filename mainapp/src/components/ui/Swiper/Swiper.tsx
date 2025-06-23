import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'

import { PartnerCardFifth } from '@assets/icons/PartnersIcon/PartnerCardFifth'
import { PartnerCardFirst } from '@assets/icons/PartnersIcon/PartnerCardFirst'
import { PartnerCardFourth } from '@assets/icons/PartnersIcon/PartnerCardFourth'
import { PartnerCardSecond } from '@assets/icons/PartnersIcon/PartnerCardSecond'
import { PartnerCardSeventh } from '@assets/icons/PartnersIcon/PartnerCardSeventh'
import { PartnerCardSixth } from '@assets/icons/PartnersIcon/PartnerCardSixth'
import { PartnerCardThird } from '@assets/icons/PartnersIcon/PartnerCardThird'

import {
  SwiperLeftButtons,
  SwiperRightButtons,
} from './SwiperNavButtonts/SwiperNavButtons'
import styles from './swiper.module.scss'

const cx = classNames.bind(styles)

const PartnersSwiper = () => {
  const { t, i18n } = useTranslation()

  const slides = [
    { component: <PartnerCardFirst />, link: '/banks/leumi' },
    { component: <PartnerCardSecond />, link: '/banks/discount' },
    { component: <PartnerCardThird />, link: '/banks/beinleumi' },
    { component: <PartnerCardFourth />, link: '/banks/jerusalem' },
    { component: <PartnerCardFifth />, link: '/banks/apoalim' },
    { component: <PartnerCardSixth />, link: '/banks/mercantile-discount' },
    { component: <PartnerCardSeventh />, link: '#' }, // No link for Mizrahi-Tefahot yet
  ]

  const loopedSlides = [...slides, ...slides] // Loop manually for the swiper

  return (
    <div className={cx('swiper__wrapper')}>
      <div className={cx('swiper__title')}>
        <span>{t('banks_partners')}</span>
      </div>

      <Swiper slidesPerView={'auto'} loop={true} className={cx('swiper')}>
        {loopedSlides.map((slide, index) => (
          <SwiperSlide className={cx('swiper__item')} key={index}>
            <Link to={slide.link} className={cx('swiper__item-img')}>
              {slide.component}
            </Link>
          </SwiperSlide>
        ))}
        <SwiperLeftButtons />
        <SwiperRightButtons />
      </Swiper>
    </div>
  )
}

export default PartnersSwiper
