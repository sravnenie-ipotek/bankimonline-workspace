import classNames from 'classnames/bind'
import React, { ComponentPropsWithoutRef, ElementType } from 'react'
import { Link } from 'react-router-dom'

import { Path } from '@remix-run/router/history.ts'
import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import styles from './button.module.scss'

export type ButtonProps<T extends ElementType = 'button'> = {
  as?: T // Указывает, какой HTML-тег будет использоваться для рендера компонента Button, 'button' по умолчанию
  variant?: // Вид кнопки
  | 'primary'
    | 'secondary'
    | 'modalWarning'
    | 'documentUpload'
    | 'notification_button'
  size?: 'small' | 'smallLong' | 'medium' // Размер кнопки
  view?: 'default' | 'square' | 'smallSquare' | 'flex' // Тип размера кнопки (по умолчанию, квадратный, ширина 100%)
  disabled?: boolean // Флаг, указывающий, заблокирована ли кнопка
  type?: 'submit' | 'reset' | 'button' | undefined // Тип кнопки (submit, reset, button)
  children?: React.ReactNode // Дочерние элементы кнопки
  className?: string // Дополнительные CSS-классы
  to?: string | Partial<Path> // Путь для перехода по клику на кнопку
  icon?: React.ReactNode // Дополнительная иконка
} & ComponentPropsWithoutRef<T> // обобщенный тип из библиотеки React, который используется для определения пропсов,
// которые могут быть переданы в компонент Button исключая специальный пропс ref.

const cx = classNames.bind(styles) // Создание функции для генерации css-классов на основе заданных стилей

const Button: React.FC<ButtonProps> = ({
  disabled,
  type,
  children,
  variant = 'primary',
  size = 'medium',
  view = 'default',
  className,
  to,
  icon,
  ...rest
}) => {
  const { direction } = useAppSelector((state: RootState) => state.language)

  const buttonClasses = {
    [styles.button]: true, // Добавление базового css-класса кнопки
    [variant]: true, // Добавление css-класса, соответствующего выбранному variant
    [view]: true, // Добавление css-класса, соответствующего выбранному variant
  }

  const buttonInternalClasses = {
    [size]: true, // Добавление css-класса, соответствующего выбранному размеру
  }

  return to ? (
    <Link to={to as string} className={cx(view === 'flex' && 'w-full')}>
      <button
        className={cx(buttonClasses, className)} // Генерация классов с использованием classNames и добавление
        // дополнительных классов из пропсов и классов в зависимости от вида объекта
        disabled={disabled} // Заблокирована ли кнопка
        type={type} // Тип кнопки
        {...(rest as ButtonProps)} // Распространение остальных пропсов на кнопку
      >
        {view === 'default' ? ( //если вид стандартный, то содержимое с отступами
          <p className={cx(buttonInternalClasses, styles.internalButton)}>
            {children}
          </p>
        ) : (
          children
        )}
        <div className={direction === 'rtl' ? 'rotate-180' : ''}>{icon}</div>
      </button>
    </Link>
  ) : (
    //предотвращение поведения кнопки как навигационный элемент
    <div className={cx(view === 'flex' && 'w-full')}>
      <button
        className={cx(buttonClasses, className)} // Генерация классов с использованием classNames и добавление
        // дополнительных классов из пропсов и классов в зависимости от вида объекта
        disabled={disabled} // Заблокирована ли кнопка
        type={type} // Тип кнопки
        {...(rest as ButtonProps)} // Распространение остальных пропсов на кнопку
      >
        {view === 'default' ? ( //если вид стандартный, то содержимое с отступами
          <p className={cx(buttonInternalClasses, styles.internalButton)}>
            {children}
          </p>
        ) : (
          children
        )}
        <div className={direction === 'rtl' ? 'rotate-180' : ''}>{icon}</div>
      </button>
    </div>
  )
}

export default Button
