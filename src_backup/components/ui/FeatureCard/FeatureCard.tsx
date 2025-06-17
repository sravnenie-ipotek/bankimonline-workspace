import classNames from 'classnames/bind'
import React from 'react'

import styles from './featureCard.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  icon: React.ReactNode
  title: string
  text: string
  size?: 'default' | 'full'
}
const FeatureCard: React.FC<TypeProps> = ({
  icon,
  title,
  text,
  size = 'default',
}) => {
  const sizeClasses = {
    [size]: true,
  }

  return (
    <div className={cx('card', sizeClasses)}>
      <div className={cx('card-icon')}>{icon}</div>
      <div className={cx('card-title')}>{title}</div>
      <div className={cx('card-text')}>{text}</div>
    </div>
  )
}

export default FeatureCard
