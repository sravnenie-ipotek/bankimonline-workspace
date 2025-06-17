import classNames from 'classnames/bind'
import React from 'react'
import { GetTrackProps } from 'react-compound-slider'

import styles from './Ranger.module.scss'

const cx = classNames.bind(styles)
interface TrackProps {
  source: { percent: number }
  target: { percent: number }
  getTrackProps: () => GetTrackProps
}

const Track: React.FC<TrackProps> = ({ source, target, getTrackProps }) => {
  return (
    <div
      className={cx('track', 'bg-accent-primary')}
      style={{
        width: `${target.percent - source.percent}%`,
      }}
      {...getTrackProps()}
    />
  )
}

export default Track
