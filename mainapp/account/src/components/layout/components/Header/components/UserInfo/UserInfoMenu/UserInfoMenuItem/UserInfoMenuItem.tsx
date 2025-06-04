import classNames from 'classnames/bind'
import React from 'react'
import { Link } from 'react-router-dom'

import IconPropsType from '@assets/icons/IconPropsType'
import useTheme from '@src/hooks/useTheme.ts'

import i18n from '../../../../../../../../../utils/i18n'
import styles from './userInfoMenuItem.module.scss'

const cx = classNames.bind(styles)

type UserInfoMenuItemProps = {
  title: string
  path?: string
  icon: React.FC<IconPropsType>
  onClick: () => void
}

const UserInfoMenuItem: React.FC<UserInfoMenuItemProps> = ({
  title,
  path,
  icon: IconComponent,
  onClick,
}) => {
  const theme = useTheme()

  const isRussian = i18n.language === 'ru'

  const iconColor = theme?.colors?.base.white

  return (
    <>
      {path ? (
        <Link
          to={path}
          className={cx(styles.userInfoMenuItemWrapper)}
          onClick={onClick}
        >
          <IconComponent color={iconColor} />
          <p
            className={cx(styles.userInfoMenuItem, {
              'pl-[0.8rem]': isRussian,
              'pr-[0.8rem]': !isRussian,
            })}
          >
            {title}
          </p>
        </Link>
      ) : (
        <div className={cx(styles.userInfoMenuItemWrapper)}>
          <IconComponent color={iconColor} />
          <p
            className={cx(styles.userInfoMenuItem, {
              'pl-[0.8rem]': isRussian,
              'pr-[0.8rem]': !isRussian,
            })}
          >
            {title}
          </p>
        </div>
      )}
    </>
  )
}

export default UserInfoMenuItem
