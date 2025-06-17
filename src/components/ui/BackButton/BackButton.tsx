import classNames from 'classnames/bind'
import * as React from 'react'

import styles from './backButton.module.scss'

interface PropTypes extends React.HTMLProps<HTMLButtonElement> {
  title: string
  handleClick?: () => void
  className?: string
}

const cx = classNames.bind(styles)
// Компонент кнопки назад
const BackButton: React.FC<PropTypes> = ({ title, handleClick, className }) => {
  return (
    <button
      onClick={handleClick}
      type="button"
      className={cx('button', className)}
    >
      {title}
    </button>
  )
}

export default BackButton
