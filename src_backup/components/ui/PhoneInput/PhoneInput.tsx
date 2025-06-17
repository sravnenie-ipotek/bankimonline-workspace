import classnames from 'classnames/bind'
import { FC, useEffect } from 'react'

import Control from './Control/Control'
import Title from './Title'
import styles from './formattedInput.module.scss'

const cx = classnames.bind(styles)

interface PhoneInputProps {
  value?: string
  handleChange: (value: string | null) => void
  disableCurrency?: boolean
  title?: string
  hasTooltip?: boolean
  name: string
  placeholder: string
}

const PhoneInput: FC<PhoneInputProps> = (props) => {
  const {
    value,
    handleChange,
    disableCurrency,
    title,
    hasTooltip,
    name,
    placeholder,
  } = props

  useEffect(() => {
    if (typeof value !== 'undefined' && value) {
      handleChange(value)
    }
  }, [])

  return (
    <div className={cx('container')}>
      {title && <Title title={title} hasTooltip={hasTooltip} />}
      <Control
        name={name}
        placeholder={placeholder}
        disableCurrency={
          disableCurrency === undefined ? false : disableCurrency
        }
        handleChange={handleChange}
        value={value}
      />
    </div>
  )
}

export default PhoneInput
