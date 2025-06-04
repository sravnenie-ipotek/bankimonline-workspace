import classNames from 'classnames/bind'
import React, { RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronRight, UserProfileIcon } from '@assets/icons'
import { UserInfoMenu } from '@layout/components/Header/components/UserInfo/UserInfoMenu'
import { useAppSelector } from '@src/hooks/store'
import { useWindowResize } from '@src/hooks/useWindowResize.ts'
import { RootState } from '@src/store'

import styles from './userInfo.module.scss'

const cx = classNames.bind(styles)

const UserInfo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()
  const { isDesktop } = useWindowResize()
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const menuRef = useRef(null) as RefObject<HTMLElement>
  useEffect(() => {
    const chechClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', chechClickOutside)

    return () => {
      document.removeEventListener('mousedown', chechClickOutside)
    }
  }, [isOpen])

  const onItemClick = () => {
    setIsOpen(false)
  }

  return (
    <div className={cx(styles.root)} ref={menuRef as RefObject<HTMLDivElement>}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cx(styles.userInfoWrapper)}
      >
        <UserProfileIcon />
        {isDesktop && (
          <>
            <div className={cx(styles.userName)}>{t('header.userName')}</div>
            <div className={cx(isOpen ? 'rotate-180' : 'rotate-0')}>
              <ChevronRight />
            </div>
          </>
        )}
      </div>
      {isOpen && (
        <div
          className={cx(
            styles.userInfo_container,
            isOpen
              ? styles.userInfo_container__open
              : styles.userInfo_container__close,
            isRussian ? styles.ltr : styles.rtr
          )}
        >
          <UserInfoMenu onClick={onItemClick} />
        </div>
      )}
    </div>
  )
}

export default UserInfo
