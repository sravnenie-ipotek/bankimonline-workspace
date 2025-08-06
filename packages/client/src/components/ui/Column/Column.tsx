import classNames from 'classnames/bind'
import React from 'react'

import styles from './column.module.scss'

const cx = classNames.bind(styles)

interface PropTypes extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode
}

const Column: React.FC<PropTypes> = ({
  children,
  ...props
}: {
  children?: React.ReactNode
}) => {
  return (
    <div className={cx('column')} {...props}>
      {children}
    </div>
  )
}

export default Column
