import classNames from 'classnames/bind'
import React from 'react'

import styles from './mortgageCardStepsTitle.module.scss'

const cx = classNames.bind(styles)

const MortgageCardStepsTitle: React.FC<{ text: string }> = ({ text }) => {
  return <p className={cx(styles.mortgageCardStepsTitle)}>{text}</p>
}

export default MortgageCardStepsTitle
