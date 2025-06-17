import classNames from 'classnames/bind'
import React from 'react'

import styles from './container.module.scss'

const cx = classNames.bind(styles)

interface PropTypes extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode
}

const Container: React.FC<PropTypes> = ({ children, ...rest }) => {
  return (
    <div className={cx('container')} {...rest}>
      {children}
    </div>
  )
}

export default Container
