import classNames from 'classnames/bind'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Close } from '@assets/icons/Close'

import styles from './modalButton.module.scss'

const cx = classNames.bind(styles)

type ModalButtonVariant = 'close' | 'save' | 'load' | 'back' | 'continue'
type ModalButtonType = 'button' | 'submit' | 'reset'

type ModalButtonProps = {
  variant: ModalButtonVariant
  type?: ModalButtonType
  onClick: () => void
  disabled?: boolean
}

const ModalButton: FC<ModalButtonProps> = ({
  variant,
  onClick,
  type = 'button',
  disabled = false,
}) => {
  const { t } = useTranslation()

  const setButtonText = (text: ModalButtonVariant) => {
    return t(`settings.buttonText.${text}`)
  }

  return (
    <div className={cx(styles.root)}>
      {variant === 'close' && (
        <div className={cx(styles.button_close)} onClick={onClick}>
          <Close color="white" />
        </div>
      )}
      {variant === 'back' && (
        <button
          className={cx(
            styles.button,
            styles.button_secondary,
            disabled && styles.button_disabled
          )}
          onClick={onClick}
          disabled={disabled}
        >
          {setButtonText(variant)}
        </button>
      )}
      {variant !== 'close' && variant !== 'back' && (
        <button
          className={cx(
            styles.button,
            styles.button_primary,
            disabled && styles.button_disabled
          )}
          onClick={onClick}
          type={type}
          disabled={disabled}
        >
          {setButtonText(variant)}
        </button>
      )}
    </div>
  )
}

export default ModalButton
