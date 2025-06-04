import classNames from 'classnames/bind'
import React from 'react'

import { IdentificationIcon, Payment, Settings } from '@assets/icons'
import { useAppSelector } from '@src/hooks/store'
import useRoute from '@src/hooks/useRoute'
import { RootState } from '@src/store'

import { UserInfoMenuItem } from './UserInfoMenuItem'
import styles from './userInfoMenu.module.scss'

const cx = classNames.bind(styles)

type UserInfoMenuProps = {
  onClick: () => void
}

const UserInfoMenu: React.FC<UserInfoMenuProps> = ({ onClick }) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { nav } = useRoute()

  return (
    <div
      className={cx(
        styles.modalContent,
        'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'
      )}
    >
      <div className={cx(styles.userInfoMenuWrapper)}>
        <UserInfoMenuItem
          icon={IdentificationIcon}
          title={isRussian ? 'Анкета' : 'שְׁאֵלוֹן'}
          path={nav('questionnaire')}
          onClick={onClick}
        />
        <UserInfoMenuItem
          icon={Settings}
          title={isRussian ? 'Настройки' : 'הגדרות'}
          path={nav('settings')}
          onClick={onClick}
        />
        <UserInfoMenuItem
          icon={Payment}
          title={isRussian ? 'Платежи' : 'תשלומים'}
          path={nav('payments')}
          onClick={onClick}
        />
      </div>
    </div>
  )
}

export default UserInfoMenu
