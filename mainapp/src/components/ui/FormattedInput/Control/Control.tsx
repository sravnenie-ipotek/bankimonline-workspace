import classnames from 'classnames/bind'
import React from 'react'

import { useAppSelector } from '@src/hooks/store'
import { CurrencyIcon } from '@assets/icons/CurrencyIcon'

import styles from './control.module.scss'

const cx = classnames.bind(styles)

interface ControlProps {
  value: number | null
  handleChange: (value: string | number | null) => void
  size?: 'xs' | 'sm' | 'md' | 'lg'
  onBlur?: () => void
  name?: string
  placeholder?: string
  disableCurrency?: boolean
  error?: string | boolean | unknown
  validation?: string
  rightSection?: React.ReactNode
  type?: 'comma' | 'numeric' | 'default'
}

export function convertInputToNumber(value: string) {
  const numericValue = value.replace(/[^0-9]/g, '')
  return numericValue ? parseInt(numericValue, 10) : ''
}

const Control: React.FC<ControlProps> = ({
  name,
  value,
  handleChange,
  placeholder,
  disableCurrency,
  error,
  onBlur,
  size,
  rightSection,
  type = 'comma',
}) => {
  const { currency } = useAppSelector((state) => state.currency);
  const formattedValue = (value != null) ? value.toLocaleString('en-US') : ''

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value

    switch (type) {
      case 'numeric': {
        if (/^-?\d*\.?\d*$/.test(inputValue)) {
          handleChange(inputValue)
        }
        break
      }
      case 'comma': {
        handleChange(convertInputToNumber(inputValue))
        break
      }
      case 'default': {
        handleChange(inputValue)
        break
      }
      default: {
        handleChange(inputValue)
        break
      }
    }
  }

  const currencySymbols = {
    ILS: '₪',
    USD: '$',
    EUR: '€',
  };

  return (
    <div className={cx('container', `${error && 'error'}`)}>
      <input
        className={cx(name, 'input', { [`${size}`]: size })}
        type="text"
        placeholder={placeholder}
        value={formattedValue}
        onChange={handleInputChange}
        onBlur={onBlur}
      />

      {!disableCurrency && !rightSection ? (
        <div className={cx('currencySymbol')}>
          {currencySymbols[currency]}
        </div>
      ) : (
        <div className={cx('currencyImage')}>{rightSection}</div>
      )}
    </div>
  )
}

export default Control
