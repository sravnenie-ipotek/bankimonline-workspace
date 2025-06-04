import classNames from 'classnames/bind'
import { ChangeEvent, FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Message } from '@src/components/ui/Message'

import styles from './modalTextInput.module.scss'

type ModalTextInputType = 'text' | 'password' | 'email'

type ModalTextInputVariant =
  | 'name'
  | 'currentPassword'
  | 'setPassword'
  | 'repeatPassword'

type ModalTextInputProps = {
  name: string
  variant: ModalTextInputVariant
  type?: ModalTextInputType
  value: string | number
  isError?: boolean
  errorText?: string
  onChange: (e: ChangeEvent) => void
  onBlur: () => void
}

const cx = classNames.bind(styles)

const ModalTextInput: FC<ModalTextInputProps> = ({
  name,
  type = 'text',
  variant,
  value,
  onChange,
  onBlur,
  errorText,
  isError = true,
}) => {
  const { t } = useTranslation()

  //функция устанавливает label input-а с переводом в зависимости от его варианта
  const setLabel = (variant: ModalTextInputVariant) => {
    return t(`settings.inputLabel.${variant}`)
  }

  //функция устанавливает placeholder input-а с переводом в зависимости от его варианта
  const setPlaceholder = (variant: ModalTextInputVariant) => {
    return t(`settings.inputPlaceholder.${variant}`)
  }

  console.log(isError)

  return (
    <div className={cx(styles.root)}>
      <div className={cx(styles.label)}>{setLabel(variant)}</div>
      <input
        name={name}
        value={value}
        type={type}
        className={cx(
          styles.input,
          isError && styles.error,
          (variant === 'currentPassword' ||
            variant === 'setPassword' ||
            variant === 'repeatPassword') &&
            styles.password
        )}
        placeholder={setPlaceholder(variant)}
        onChange={onChange}
        onBlur={onBlur}
      />
      {isError && !!errorText && <Message type="error">{errorText}</Message>}
    </div>
  )
}

export default ModalTextInput
