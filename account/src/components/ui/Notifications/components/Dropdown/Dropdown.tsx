import classNames from 'classnames/bind'
import { FC, ReactNode, useEffect, useRef, useState } from 'react'

import { Close } from '@assets/icons/Close'
import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import { NotificationIndicator } from '../NotificationIndicator/index'
import styles from './Dropdown.module.scss'
import { DropdownUser } from './components/DropdownUser/DropdownUser'

type DropdownButtonType = 'user' | 'notification'

export type DropdownProps = {
  type: DropdownButtonType
  avatar?: ReactNode
  name?: string
  lastName?: string
  children: ReactNode
  value?: number
  isDropdownContainerTitle?: boolean
  dropdownContainerTitle?: string
}

const cx = classNames.bind(styles)

export const Dropdown: FC<DropdownProps> = ({
  type,
  children,
  isDropdownContainerTitle = true,
  dropdownContainerTitle,
  ...props
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [isOpen, setOpen] = useState<boolean>(false)
  const { currentFont } = useAppSelector((state: RootState) => state.language)

  useEffect(() => {
    const checkClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        !!menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', checkClickOutside)

    return () => {
      document.removeEventListener('mousedown', checkClickOutside)
    }
  }, [isOpen])

  const switchAccordionButtonType = (type: DropdownButtonType) => {
    switch (type) {
      case 'user':
        return (
          <DropdownUser
            name={props.name}
            lastName={props.lastName}
            isOpen={isOpen}
          />
        )
      case 'notification':
        return <NotificationIndicator value={props.value} />
    }
  }

  return (
    <div className={cx('root')} ref={menuRef}>
      <div className={cx('dropdown_button')} onClick={() => setOpen(!isOpen)}>
        {switchAccordionButtonType(type)}
      </div>
      <div
        className={cx(
          'dropdown_container',
          isOpen ? 'dropdown_container__open' : 'dropdown_container__close',
          currentFont === 'font-ru' ? 'ltr' : 'rtl',
          'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'
        )}
      >
        {isDropdownContainerTitle && (
          <div className={cx('dropdown_container_title__wrapper')}>
            <div className={cx('dropdown_container_title')}>
              {dropdownContainerTitle}
            </div>
            {type === 'notification' && (
              <div
                className={cx('dropdown_container_title__button')}
                onClick={() => setOpen(!isOpen)}
              >
                <Close />
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
