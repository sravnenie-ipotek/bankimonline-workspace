import classNames from 'classnames/bind'
import { useSwiper } from 'swiper/react'

import { CaretRightIcon } from '@assets/icons/CaretRightIcon'

import styles from './swiperNavButtons.module.scss'

const cx = classNames.bind(styles)

type SwiperButtonProps = {
  onPrevious?: () => void
  onNext?: () => void
}

export const SwiperLeftButtons: React.FC<Pick<SwiperButtonProps, 'onPrevious'>> = ({ onPrevious }) => {
  const swiper = useSwiper()
  
  const handleClick = () => {
    if (onPrevious) {
      onPrevious() // Call parent callback (Действие #34)
    }
    swiper.slidePrev()
  }
  
  return (
    <button className={cx('left-icon')} onClick={handleClick}>
      <CaretRightIcon color="#fff" />
    </button>
  )
}

export const SwiperRightButtons: React.FC<Pick<SwiperButtonProps, 'onNext'>> = ({ onNext }) => {
  const swiper = useSwiper()
  
  const handleClick = () => {
    if (onNext) {
      onNext() // Call parent callback (Действие #11)
    }
    swiper.slideNext()
  }
  
  return (
    <button className={cx('right-icon')} onClick={handleClick}>
      <CaretRightIcon color="#fff" />
    </button>
  )
}
