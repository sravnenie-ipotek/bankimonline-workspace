import classNames from 'classnames/bind'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LockSimple } from '@assets/icons/LockSimple'
import { Portal } from '@src/components/ui/Portal'
import { useAppDispatch } from '@src/hooks/store'
import { changeModal } from '@src/store/slices/settingsModalSlice'

import { SettingsModal } from '../SettingsModal'
import styles from './settingPassword.module.scss'

const cx = classNames.bind(styles)

// type SettingPaswordProps = Pick<SettingsProps, 'password'>

const SettingPassword: FC = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [isModal, setModal] = useState<boolean>(false)

  const onClick = () => {
    dispatch(changeModal('changePassword'))
    setModal(true)
  }

  const closeModal = () => {
    setModal(false)
  }

  return (
    <div className={cx(styles.root)}>
      <div className={cx(styles.title)}>{t('settings.password')}</div>
      <div className={cx(styles.button)} onClick={onClick}>
        <LockSimple />
        <div className={cx(styles.button_title)}>
          {t('settings.changePassword')}
        </div>
      </div>
      {isModal && (
        <Portal>
          <SettingsModal onModalClose={closeModal} />
        </Portal>
      )}
    </div>
  )
}

export default SettingPassword
