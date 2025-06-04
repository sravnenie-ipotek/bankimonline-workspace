import classNames from 'classnames/bind'
import React from 'react'
import ReactDOM from 'react-dom'

import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import styles from './slideBarMobilePlate.module.scss'

const cx = classNames.bind(styles)

interface SlideBarMobilePlateProps {
  children: React.ReactNode // Содержимое окна
  mobileMenuVisible: boolean // видимость мобильного меню
  setMobileMenuVisible: (mobileMenuVisible: boolean) => void // функция изменения видимоти мобильного окна
}

const menuRoot = document.getElementById('mobile-sidebar-root')

const SlideBarMobilePlate: React.FC<SlideBarMobilePlateProps> = ({
  children,
  mobileMenuVisible,
  setMobileMenuVisible,
}) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  if (!menuRoot) return null

  return ReactDOM.createPortal(
    <div onClick={() => setMobileMenuVisible(false)}>
      {mobileMenuVisible && <div className={cx(styles.modal)}></div>}
      <div
        className={cx(
          isRussian
            ? mobileMenuVisible
              ? styles.modalPlateRuOn
              : styles.modalPlateRuOff
            : mobileMenuVisible
            ? styles.modalPlateHeOn
            : styles.modalPlateHeOff,
          styles.modalPlate
        )}
      >
        {children}
      </div>
    </div>,
    menuRoot
  )
}

export default SlideBarMobilePlate
