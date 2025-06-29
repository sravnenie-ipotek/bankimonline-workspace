import { useState, useEffect } from 'react'

/**
 * Хук для управления состоянием переключателя с персистентностью в localStorage.
 *
 * @param {string} key - ключ для localStorage.
 * @param {boolean} defaultValue - значение по умолчанию, если в localStorage ничего нет.
 * @returns {PropTypes} объект с методами и свойствами для управления состоянием.
 */

interface PropTypes {
  isOn: boolean
  isOff: boolean
  toggle: () => void
  on: () => void
  off: () => void
  set: (value: boolean) => void
}

export const usePersistentToggle = (key: string, defaultValue: boolean): PropTypes => {
  // Получаем значение из localStorage или используем значение по умолчанию
  const [isOn, setIsOn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : defaultValue
    } catch {
      return defaultValue
    }
  })

  // Сохраняем в localStorage при каждом изменении состояния
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(isOn))
    } catch {
      // Игнорируем ошибки localStorage (например, в режиме инкогнито)
    }
  }, [key, isOn])

  /**
   * Переключает состояние.
   */
  const toggle = () => {
    setIsOn((prevState) => !prevState)
  }

  /**
   * Устанавливает состояние в "включено".
   */
  const on = () => {
    setIsOn(true)
  }

  /**
   * Устанавливает состояние в "выключено".
   */
  const off = () => {
    setIsOn(false)
  }

  /**
   * Устанавливает состояние в указанное значение.
   *
   * @param {boolean} bool - значение, которое нужно установить.
   */
  const set = (bool: boolean) => {
    setIsOn(bool)
  }

  return {
    isOn, // текущее состояние
    isOff: !isOn, // обратное текущему состоянию
    toggle, // метод для переключения состояния
    on, // метод для установки состояния в "включено"
    off, // метод для установки состояния в "выключено"
    set, // метод для установки произвольного состояния
  }
} 