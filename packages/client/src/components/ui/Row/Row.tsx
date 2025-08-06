import classNames from 'classnames/bind'
import React from 'react'

import styles from './row.module.scss'

const cx = classNames.bind(styles)

interface PropTypes extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode
}

const Row: React.FC<PropTypes> = ({ children, ...rest }) => {
  return (
    <div className={cx('row')} {...rest}>
      {children}
    </div>
  )
}

export default Row
