import React from 'react'
import { useTranslation } from 'react-i18next'

interface PropTypes {
  name: string
  title: string
  handleClick: () => void
}

// Компонент кнопки
const Button: React.FC<PropTypes> = ({ name, title, handleClick }) => {
  const { i18n } = useTranslation()

  return (
    <span
      className={name + ' ' + ' noselect button button-' + i18n.language}
      onClick={handleClick}
    >
      <div className={'button-inner'}>
        <div className={'button-inner-title'}>{title}</div>
      </div>
    </span>
  )
}

export default Button
