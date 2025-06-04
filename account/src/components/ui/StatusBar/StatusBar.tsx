import classNames from 'classnames/bind'
import React from 'react'

import styles from './statusBar.module.scss'

const cx = classNames.bind(styles)

const StatusBar: React.FC<{
  text: string
  textColor: string
  backgroundColor: string
}> = ({ text, textColor, backgroundColor }) => {
  const statusBarStyle = {
    color: textColor,
    backgroundColor,
  }

  return (
    <div className={cx(styles.statusBar)} style={statusBarStyle}>
      {text}
    </div>
  )
}

export default StatusBar
