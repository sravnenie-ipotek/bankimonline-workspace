import classNames from 'classnames/bind'
import React from 'react'

import styles from './progressBar.module.scss'

const cx = classNames.bind(styles)

type ProgressBarProps = {
  progress: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const progressStyle = {
    width: `${progress}%`,
  }

  return (
    <div className={cx(styles.progressBarContainer)}>
      <div className={cx(styles.progressBar)} style={progressStyle}>
        {progress}
      </div>
    </div>
  )
}

export default ProgressBar
