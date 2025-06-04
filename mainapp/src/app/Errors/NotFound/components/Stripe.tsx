import classNames from 'classnames/bind'
import React from 'react'

import '../NotFound.module.scss'
import styles from '../NotFound.module.scss'

const cx = classNames.bind(styles)
const Body: React.FC = () => {
  return <div className={cx('notfound-stripe')}></div>
}

export default Body
