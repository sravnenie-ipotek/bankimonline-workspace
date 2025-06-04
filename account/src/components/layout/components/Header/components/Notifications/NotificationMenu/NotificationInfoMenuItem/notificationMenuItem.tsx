import classNames from 'classnames/bind'
import React from 'react'
import { Link } from 'react-router-dom'

import { IMenuItem } from '@layout/components/Sidebar/types/menuItem.ts'
import useTheme from '@src/hooks/useTheme.ts'

import i18n from '../../../../../../../../../utils/i18n'
import styles from './notificationMenuItem.module.scss'

const cx = classNames.bind(styles)

const NotificationMenuItem: React.FC<IMenuItem> = ({
  title,
  path,
  icon: IconComponent,
}) => {
  const theme = useTheme()

  const isRussian = i18n.language === 'ru'

  const iconColor = theme?.colors?.base.white

  return (
    <>
      {path ? (
        <Link to={path} className={cx(styles.notificationMenuItemWrapper)}>
          <IconComponent color={iconColor} />
          <p
            className={cx(styles.notificationMenuItem, {
              'pl-[0.8rem]': isRussian,
              'pr-[0.8rem]': !isRussian,
            })}
          >
            {title}
          </p>
        </Link>
      ) : (
        <div className={cx(styles.notificationMenuItemWrapper)}>
          <IconComponent color={iconColor} />
          <p
            className={cx(styles.notificationMenuItem, {
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

export default NotificationMenuItem
