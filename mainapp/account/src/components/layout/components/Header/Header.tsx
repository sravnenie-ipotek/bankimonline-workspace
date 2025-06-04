import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { BurgerMenu } from '@assets/icons/HeaderIcons/BurgerMenu'
import { UserInfo } from '@layout/components/Header/components'
import { Button } from '@src/components/ui/Button'
import { Notifications } from '@src/components/ui/Notifications'
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RootState } from '@src/store'
import { changeLanguage } from '@src/store/slices/languageSlice.ts'

import i18n from '../../../../../utils/i18n'
import styles from './header.module.scss'

type HeaderProps = {
  setMobileMenuVisible: (mobileMenuVisible: boolean) => void // функция изменения видимоти мобильного окна
}

const cx = classNames.bind(styles)
const Header: React.FC<HeaderProps> = ({ setMobileMenuVisible }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { isMaketMobile } = useWindowResize()

  const handleLanguageChange = async () => {
    const newLanguage = i18n.language === 'ru' ? 'he' : 'ru'
    try {
      await i18n.changeLanguage(newLanguage)
      dispatch(changeLanguage(newLanguage))
    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  return (
    <header
      className={cx(
        styles.header,
        isRussian ? styles.paddingsRu : styles.paddingsHe
      )}
    >
      {isMaketMobile && (
        <div
          onClick={() => setMobileMenuVisible(true)}
          className={cx(isRussian ? 'ml-[4px]' : 'mr-[4px]')}
        >
          <BurgerMenu />
        </div>
      )}

      <div className={cx(styles.headerRight)}>
        <div>
          <Button
            variant="primary"
            size="small"
            view="flex"
            onClick={handleLanguageChange}
          >
            {t('header.nowLanguage')}
          </Button>
        </div>

        <Notifications />
        <UserInfo />
      </div>
    </header>
  )
}

export default Header
