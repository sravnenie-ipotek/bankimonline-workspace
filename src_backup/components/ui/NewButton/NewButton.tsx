import classNames from 'classnames/bind'
import React from 'react'

import styles from './button.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  text: string
  color?: 'default' | 'warning'
  onChange?: () => void
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode
}
const NewButton: React.FC<TypeProps> = ({
  text,
  color,
  onChange,
  leftSection,
  rightSection,
}) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cx('button', { warning: color === 'warning' })}
    >
      {leftSection && leftSection}
      {text}
      {rightSection && rightSection}
    </button>
  )
}

export default NewButton
