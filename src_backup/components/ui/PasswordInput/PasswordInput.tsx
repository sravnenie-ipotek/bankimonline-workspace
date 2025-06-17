import cn from 'classnames'
import classNames from 'classnames/bind'
import { ChangeEvent, useId, useState } from 'react'

import { HiddenEyeIcon } from '@assets/icons/HiddenEyeIcon'
import ErrorBlock from '@components/ui/ErrorBlock'

import { TitleElement } from '../TitleElement'
import styles from './PasswordInput.module.scss'

const cx = classNames.bind(styles)

interface PasswordInputProps {
  value: string
  language: string
  title?: string
  placeholder?: string
  handleChange: (value: string | null) => void
  error?: string | string[] | boolean
  onBlur?: () => void
  label?: ''
}
export function PasswordInput({
  value,
  language,
  title,
  placeholder,
  handleChange,
  error,
  onBlur,
  label,
}: PasswordInputProps) {
  const [isShown, setIsShown] = useState(false)
  const id = useId()
  const handleChangeValue = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    handleChange(newValue)
  }
  const handleShowPassword = () => {
    setIsShown((prevState) => !prevState)
  }
  return (
    <>
      {title && <TitleElement title={title} />}
      <div className={styles.passwordInput}>
        {/* {label && (
          <label className={styles.label} htmlFor={id}>
            {label}
          </label>
        )} */}
        <div className={styles.wrapper}>
          <input
            id={id}
            value={value}
            onChange={handleChangeValue}
            onBlur={onBlur}
            placeholder={placeholder}
            type={isShown ? 'text' : 'password'}
            className={cx(
              'password',
              { error: error },
              {
                ru: [styles.inputRU],
                he: [styles.inputHE],
              }[language]
            )}
            autoComplete="off"
          />
          <button
            type="button"
            className={cn(
              styles.button,
              {
                ru: [styles.buttonRU],
                he: [styles.buttonHE],
              }[language]
            )}
            onClick={handleShowPassword}
          >
            <HiddenEyeIcon size={24} color="white" />
          </button>
        </div>
        {error && <ErrorBlock error={error as string} />}
      </div>
    </>
  )
}
