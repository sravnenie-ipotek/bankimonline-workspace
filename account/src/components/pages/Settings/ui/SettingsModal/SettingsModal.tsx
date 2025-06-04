import classNames from 'classnames/bind'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'
import { ModalVariant } from '@src/store/slices/settingsModalSlice'

// import { ModalTextInput } from '../ModalTextInput'
import { ChangeNameForm } from '../ChangeNameForm'
import { ModalButton } from '../ModalButton'
import styles from './settingsModal.module.scss'

export type ModalProps = {
  onModalClose: () => void
  onModalButtonClick?: () => void
  onModalChange?: () => void
  onModalBackClick?: () => void
}

const cx = classNames.bind(styles)

const SettingsModal: FC<ModalProps> = ({
  onModalClose,
  // onModalButtonClick = () => {},
  // onModalChange = () => {},
  // onModalBackClick,
}) => {
  const variant = useAppSelector(
    (state: RootState) => state.settingsModal.variant
  )
  const { t } = useTranslation()
  const setForm = (variant: ModalVariant) => {
    switch (variant) {
      case 'changeName':
        return <ChangeNameForm onModalClose={onModalClose} />
    }
  }

  return (
    // Стили модалки задаются в зависимости от типа модалки
    <div className={cx(styles.root, !!variant && styles[variant])}>
      {/* Кнопка закрытия модалки */}
      <div className={cx(styles.header)}>
        <ModalButton onClick={onModalClose} variant="close" />
      </div>
      {/* Заголовок модалки */}
      {!!variant && (
        <div className={cx(styles.title)}>{t(`settings.${variant}`)}</div>
      )}

      {/* Форма модалки */}
      <div className={cx(styles.form)}>{setForm(variant)}</div>
    </div>
  )
}

export default SettingsModal
