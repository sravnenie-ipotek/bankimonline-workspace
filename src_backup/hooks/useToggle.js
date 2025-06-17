import { useState } from 'react';
export const useToggle = (start) => {
    // Состояние, указывающее, включен ли переключатель.
    const [isOn, setIsOn] = useState(start);
    /**
     * Переключает состояние.
     */
    const toggle = () => {
        setIsOn((prevState) => !prevState);
    };
    /**
     * Устанавливает состояние в "включено".
     */
    const on = () => {
        setIsOn(true);
    };
    /**
     * Устанавливает состояние в "выключено".
     */
    const off = () => {
        setIsOn(false);
    };
    /**
     * Устанавливает состояние в указанное значение.
     *
     * @param {boolean} bool - значение, которое нужно установить.
     */
    const set = (bool) => {
        setIsOn(bool);
    };
    return {
        isOn,
        isOff: !isOn,
        toggle,
        on,
        off,
        set, // метод для установки произвольного состояния
    };
};
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
