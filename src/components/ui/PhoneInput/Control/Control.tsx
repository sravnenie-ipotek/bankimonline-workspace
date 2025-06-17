import classnames from 'classnames/bind'
import React, { useEffect, useState } from 'react'

import formatNumeric from '@src/utils/helpers/fmt.ts'

import styles from './control.module.scss'

// Привязка стилей для использования с classnames
const cx = classnames.bind(styles)

// Определение интерфейса для свойств компонента
interface ControlProps {
  name: string
  value?: string
  placeholder: string
  disableCurrency?: boolean // Опциональное свойство для отключения отображения валюты
  handleChange: (value: string | null) => void // Обработчик изменений
}

export default function Control({
  name,
  value = '',
  placeholder,
  disableCurrency,
  handleChange,
}: ControlProps) {
  // Локальное состояние для управления значением ввода
  const [inputValue, setInputValue] = useState(value)

  // Эффект для форматирования и установки значения ввода
  useEffect(() => {
    const formattedValue = formatNumeric(value)
    setInputValue(formattedValue)
    handleChange(formattedValue)
  }, [handleChange, value])

  // Обработчик события ввода
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const inputEvent = e.nativeEvent as InputEvent
    const res = patternMatch({
      input: e.currentTarget.value,
      key: inputEvent.data,
    })
    if (res !== null) {
      setInputValue(res)
    }
    handleChange(res)
  }

  // Функция для проверки и форматирования введенного значения
  function patternMatch({
    input,
    key,
  }: {
    input: string
    key: string | null
  }): string | null {
    try {
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

      if (keys.indexOf(key || '') === -1) {
        input = input.replaceAll(key || '', '')
        return input
      }

      return formatNumeric(input)
    } catch {
      return null
    }
  }

  // Рендер компонента
  return (
    <div className={cx('container')}>
      <div className={cx('box')}>
        <div className={cx('inputWrapper')}>
          <input
            className={cx(name, 'input')}
            type="tel"
            maxLength={19}
            placeholder={placeholder}
            value={inputValue}
            onInput={handleInput}
          />
          {disableCurrency === false ? (
            <img
              className={cx('currencyIcon')}
              alt=""
              src="/static/calculate-credit/currencies.svg"
            />
          ) : (
            <div className={cx('emptyDiv')} />
          )}
        </div>
      </div>
    </div>
  )
}
