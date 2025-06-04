import classNames from 'classnames/bind'
import { FC, RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Email } from '@assets/icons/Email'
import { Phone } from '@assets/icons/Phone'
import { SettingsPoints } from '@assets/icons/SettingsPoints'
import { User } from '@assets/icons/User'
import { UserPhoto } from '@assets/icons/UserPhoto'
import { Portal } from '@src/components/ui/Portal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'
import { changeModal } from '@src/store/slices/settingsModalSlice'
import { ModalVariant } from '@src/store/slices/settingsModalSlice'

import { SettingsModal } from '../SettingsModal'
import styles from './settingDropdown.module.scss'

const cx = classNames.bind(styles)

const SettingDropdown: FC = () => {
  const [isOpen, setOpen] = useState<boolean>(false)
  const [isPortalOpen, setPortal] = useState<boolean>(false)
  const menuRef = useRef(null) as RefObject<HTMLElement>
  const { t } = useTranslation()
  const language = useAppSelector((state: RootState) => state.language)
  const userData = useAppSelector((state: RootState) => state.settingsUser)

  const modals = [
    {
      modal: 'changePhoto',
      icon: <UserPhoto width={20} color="white" />,
    },
    {
      modal: 'changeName',
      icon: <User width={20} color="white" />,
    },
    {
      modal: 'changePhone',
      icon: <Phone width={20} color="white" />,
    },
    {
      modal: userData.email?.length ? 'changeEmail' : 'addEmail',
      icon: <Email width={20} color="white" />,
    },
  ]

  useEffect(() => {
    const chechClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', chechClickOutside)

    return () => {
      document.removeEventListener('mousedown', chechClickOutside)
    }
  }, [isOpen])

  const modal = useAppSelector(
    (state: RootState) => state.settingsModal.variant
  )
  const dispatch = useAppDispatch()

  const onItemClick = (index: number) => () => {
    setOpen(false)
    dispatch(changeModal(modals[index].modal as ModalVariant))
    setPortal(true)
  }

  const closePortal = () => {
    setPortal(false)
    dispatch(changeModal(null))
  }

  return (
    <div className={cx(styles.root)} ref={menuRef as RefObject<HTMLDivElement>}>
      <div
        className={cx(
          styles.dropdown_button,
          isOpen && styles.dropdown_button__active
        )}
        onClick={() => setOpen(!isOpen)}
      >
        <SettingsPoints size={20} />
        {isOpen && (
          <div
            className={cx(
              styles.dropdown_container,
              language.currentFont === 'font-ru'
                ? styles.dropdown_container_ltr
                : styles.dropdown_container_rtr
            )}
          >
            {modals.map((item, index) => (
              <div key={index} className={cx(styles.dropdown_item)}>
                {item.icon}
                <div
                  onClick={onItemClick(index)}
                  className={cx(styles.dropdown_item_name)}
                >
                  {t(`settings.${item.modal}`)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isPortalOpen && !!modal && (
        <Portal>
          <SettingsModal onModalClose={closePortal} />
        </Portal>
      )}
    </div>
  )
}

export default SettingDropdown
