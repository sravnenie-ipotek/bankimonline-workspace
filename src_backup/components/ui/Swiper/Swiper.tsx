import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
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
  i18n.language = i18n.language?.split('-')[0]

  const slides = [
    <PartnerCardFirst key={1} />,
    <PartnerCardSecond key={2} />,
    <PartnerCardThird key={3} />,
    <PartnerCardFourth key={4} />,
    <PartnerCardFifth key={5} />,
    <PartnerCardSixth key={6} />,
    <PartnerCardSeventh key={7} />,
    <PartnerCardFirst key={1} />,
    <PartnerCardSecond key={2} />,
    <PartnerCardThird key={3} />,
    <PartnerCardFourth key={4} />,
    <PartnerCardFifth key={5} />,
    <PartnerCardSixth key={6} />,
    <PartnerCardSeventh key={7} />,
  ]

  return (
    <div className={cx('swiper__wrapper')}>
      <div className={cx('swiper__title')}>
        <span>{t('banks_partners')}</span>
      </div>

      <Swiper slidesPerView={'auto'} loop={true} className={cx('swiper')}>
        {slides.map((item, index) => (
          <SwiperSlide className={cx('swiper__item')} key={index}>
            <div className={cx('swiper__item-img')}>{item}</div>
          </SwiperSlide>
        ))}
        <SwiperLeftButtons />
        <SwiperRightButtons />
      </Swiper>
    </div>
  )
}

export default PartnersSwiper
