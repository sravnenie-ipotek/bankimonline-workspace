import classNames from 'classnames/bind'
import { useSwiper } from 'swiper/react'

import { CaretRightIcon } from '@assets/icons/CaretRightIcon'

import styles from './swiperNavButtons.module.scss'

const cx = classNames.bind(styles)

export const SwiperLeftButtons = () => {
  const swiper = useSwiper()
  return (
    <button className={cx('left-icon')} onClick={() => swiper.slidePrev()}>
      <CaretRightIcon color="#fff" />
    </button>
  )
}

export const SwiperRightButtons = () => {
  const swiper = useSwiper()
  return (
    <button className={cx('right-icon')} onClick={() => swiper.slideNext()}>
      <CaretRightIcon color="#fff" />
    </button>
  )
}
