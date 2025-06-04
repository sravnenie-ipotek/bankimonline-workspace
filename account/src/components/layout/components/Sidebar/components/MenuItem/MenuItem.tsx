import classNames from 'classnames/bind'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import IconPropsType from '@assets/icons/IconPropsType'
import { SignOut } from '@assets/icons/SignOut'
import { ExitDeleteModal } from '@src/components/ui/ExitDeleteModal'
import { useAppSelector } from '@src/hooks/store.ts'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import styles from './menuItem.module.scss'

interface MenuItemProps {
  title: string
  path?: string
  icon: React.FC<IconPropsType>
  isSelect: boolean
}

const cx = classNames.bind(styles)
const MenuItem: React.FC<MenuItemProps> = ({
  title,
  path,
  icon: IconComponent,
  isSelect,
}) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const [visibleModal, setVisibleModal] = useState(false)

  const theme = useTheme()
  const primaryIconColor = theme?.colors?.textTheme.primary

  const { t } = useTranslation()

  const exit = () => {
    console.log('выход')
    localStorage.clear()
  }

  return (
    <>
      <ExitDeleteModal
        visibleModal={visibleModal}
        setVisibleModal={setVisibleModal}
        title={t('exit.title')}
        icon={<SignOut size={30} color={primaryIconColor} />}
        buttonText={t('exit.buttonText')}
        onClickFunction={exit}
      />
      {path ? (
        <Link
          to={path}
          className={cx(
            isSelect
              ? isRussian
                ? styles.menuItemPlateSelectRight
                : styles.menuItemPlateSelectLeft
              : styles.menuItemPlate
          )}
        >
          <IconComponent color={'currentColor'} />
          <p
            className={cx({
              'pl-4': isRussian,
              'pr-4': !isRussian,
            })}
          >
            {title}
          </p>
        </Link>
      ) : (
        <div
          className={cx(
            isSelect
              ? isRussian
                ? styles.menuItemPlateSelectRight
                : styles.menuItemPlateSelectLeft
              : styles.menuItemPlate
          )}
          onClick={() => setVisibleModal(!visibleModal)}
        >
          <IconComponent color={'currentColor'} />
          <p
            className={cx({
              'pl-4': isRussian,
              'pr-4': !isRussian,
            })}
          >
            {title}
          </p>
        </div>
      )}
    </>
  )
}

export default MenuItem
