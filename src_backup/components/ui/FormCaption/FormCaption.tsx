import classNames from 'classnames/bind'
import * as React from 'react'

import styles from './formCaption.module.scss'

interface PropTypes {
  title: string
  subtitle?: string
}

const cx = classNames.bind(styles)

// Компонент для заголовка формы
const FormCaption: React.FC<PropTypes> = ({ title, subtitle }) => {
  return (
    <div className={cx('form')}>
      <div className={cx('form-caption')}>{title}</div>
      <div className={cx('form-caption-subtitle')}>{subtitle}</div>
    </div>
  )
}

export default FormCaption
