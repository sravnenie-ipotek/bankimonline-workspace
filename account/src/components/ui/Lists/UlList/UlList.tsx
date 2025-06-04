import classNames from 'classnames/bind'
import React from 'react'

import styles from './ulList.module.scss'

interface UlListProps {
  children: React.ReactNode
  additionalStyles?: string | string[]
}

const cx = classNames.bind(styles)

const UlList: React.FC<UlListProps> = ({ children, additionalStyles }) => {
  return <ul className={cx(styles.UlStyle, additionalStyles)}>{children}</ul>
}

export default UlList
