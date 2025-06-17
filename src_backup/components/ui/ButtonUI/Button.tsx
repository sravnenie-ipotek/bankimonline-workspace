import classNames from 'classnames/bind'
import React, { ComponentPropsWithoutRef, ElementType } from 'react'
import { Link } from 'react-router-dom'

import { Path } from '@remix-run/router/history.ts'
import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import styles from './button.module.scss'

export type ButtonProps<T extends ElementType = 'button'> = {
  as?: T // Указывает, какой HTML-тег будет использоваться для рендера компонента ButtonUI, 'button' по умолчанию
  variant?:
    | 'primary'
    | 'secondary'
    | 'modalBase'
    | 'modalWarning'
    | 'transparent' // Вид кнопки: основной или вторичный
  size?: 'small' | 'smallLong' | 'medium' | 'full' // Размер кнопки: маленький или средний
  disabled?: boolean // Флаг, указывающий, заблокирована ли кнопка
  type?: 'submit' | 'reset' | 'button' | undefined // Тип кнопки (submit, reset, button)
  children?: React.ReactNode // Дочерние элементы кнопки
  className?: string // Дополнительные CSS-классы
  to?: string | Partial<Path> // Путь для перехода по клику на кнопку
  icon?: React.ReactNode // Дополнительная иконка
  isDisabled?: boolean // Флаг, указывающий, активна ли кнопка
} & ComponentPropsWithoutRef<T> // обобщенный тип из библиотеки React, который используется для определения пропсов,
// которые могут быть переданы в компонент ButtonUI исключая специальный пропс ref.

const cx = classNames.bind(styles) // Создание функции для генерации css-классов на основе заданных стилей

const Button: React.FC<ButtonProps> = ({
  disabled,
  type,
  children,
  variant = 'primary',
  size = 'medium',
  className,
  to,
  icon,
  isDisabled,
  ...rest
}) => {
  const { direction } = useAppSelector((state: RootState) => state.language)

  const buttonClasses = {
    [variant]: true, // Добавление css-класса, соответствующего выбранному variant
    [styles.button]: true, // Добавление базового css-класса кнопки
  }

  const buttonInternalClasses = {
    [size]: true, // Добавление css-класса, соответствующего выбранному размеру
  }

  return (
    <Link to={to as string} className={styles.link}>
      <button
        className={cx(buttonClasses, className, { isDisabled: isDisabled })} // Генерация классов с использованием classNames и добавление
        // дополнительных классов из пропсов
        disabled={disabled} // Заблокирована ли кнопка
        type={type} // Тип кнопки
        {...(rest as ButtonProps)} // Распространение остальных пропсов на кнопку
      >
        <p className={cx(buttonInternalClasses, styles.internalButton)}>
          {children}
        </p>
        <div className={direction === 'rtl' ? 'rotate-180' : ''}>{icon}</div>
      </button>
    </Link>
  )
}

export default Button
