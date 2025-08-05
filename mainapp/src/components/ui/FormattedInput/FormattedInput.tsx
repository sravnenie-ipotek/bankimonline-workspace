import classNames from 'classnames/bind'
import React from 'react'

import Control from '@components/ui/FormattedInput/Control/Control.tsx'

import TitleElement from '../TitleElement/TitleElement.tsx'
import styles from './formattedInput.module.scss'

const cx = classNames.bind(styles)

interface FormattedInputProps {
  value: number | null
  handleChange: (value: number | string | null) => void
  size?: 'xs' | 'sm' | 'md' | 'lg'
  placeholder?: string
  disableCurrency?: boolean
  validation?: string
  error?: string | boolean
  onBlur?: () => void
  name?: string
  title?: string
  ttop?: string
  tleft?: string
  tright?: string
  tooltip?: string
  hasTooltip?: boolean
  'data-testid'?: string
}

const FormattedInput: React.FC<FormattedInputProps> = ({
  value,
  name,
  title,
  tooltip,
  placeholder,
  disableCurrency,
  handleChange,
  error,
  validation,
  onBlur,
  size,
  'data-testid': dataTestId,
}) => {
  return (
    <div className={cx('formatted-input')}>
      <TitleElement name={name} title={title} tooltip={tooltip} />
      <Control
        name={name}
        placeholder={placeholder}
        disableCurrency={disableCurrency}
        handleChange={handleChange}
        onBlur={onBlur}
        value={value}
        error={error}
        validation={validation}
        size={size}
        data-testid={dataTestId}
      />
    </div>
  )
}

export default FormattedInput
