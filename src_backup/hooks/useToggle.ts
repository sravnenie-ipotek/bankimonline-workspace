import { useState } from 'react'

/**
 * Хук для управления состоянием переключателя (toggle).
 *
 * @param {boolean} start - начальное значение переключателя.
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

export const useToggle = (start: boolean): PropTypes => {
  // Состояние, указывающее, включен ли переключатель.
  const [isOn, setIsOn] = useState(start)

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

// Пример использования

/*

import React from 'react';
import { useToggle } from './path-to-your-hook-file'; // Импортируйте ваш хук из соответствующего файла

const ToggleButton = () => {
  // Используем хук useToggle с начальным состоянием false (выключено)
  const { isOn, toggle } = useToggle(false);

  return (
    <button
      onClick={toggle} 
    >
      {isOn ? 'Включено' : 'Выключено'}
    </button>
  );
}

export default ToggleButton;

 */
