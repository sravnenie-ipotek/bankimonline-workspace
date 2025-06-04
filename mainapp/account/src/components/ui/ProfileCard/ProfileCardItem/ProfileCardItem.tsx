import classNames from 'classnames/bind'
import React from 'react'

import styles from './profileCardItem.module.scss'

const cx = classNames.bind(styles)

const ProfileCardItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  return (
    <div className={cx(styles.profileCardItemsWrapper)}>
      <div className={cx(styles.profileCardItemLabel)}>{label}</div>
      <div className={cx(styles.profileCardItem)}>{value}</div>
    </div>
  )
}

export default ProfileCardItem
