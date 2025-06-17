import classNames from 'classnames/bind'
import React from 'react'

import styles from './hint.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  text: string
}

const Hint: React.FC<TypeProps> = ({ text }) => {
  return <div className={cx('hint')}>{text}</div>
}

export default Hint
