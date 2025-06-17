import classNames from 'classnames/bind'
import React from 'react'

import styles from './divider.module.scss'

const cx = classNames.bind(styles)
// Компонент разделителя полей в форме
const Divider: React.FC = () => {
  return <div className={cx('divider')}></div>
}

export default Divider
