import classNames from 'classnames/bind'
import React from 'react'

import styles from './mortgageCardDetailsInfo.module.scss'

const cx = classNames.bind(styles)

const MortgageCardDetailsInfo: React.FC<{
  amount?: string
  mortgageTem?: string
  text: string
  percent?: string
}> = ({ amount, text, percent, mortgageTem }) => (
  <div>
    {percent ? (
      <>
        <div className={cx(styles.initialPaymentWrapper)}>
          <div className={cx(styles.mortgageCardNumbers)}>{amount}</div>
          <div className={cx(styles.initialPaymentPercent)}>{percent}</div>
        </div>
        <div className={cx(styles.mortgageCardText)}>{text}</div>
      </>
    ) : (
      <>
        <div className={cx(styles.mortgageCardNumbers)}>{amount}</div>
        {mortgageTem && (
          <div className={cx(styles.mortgageCardNumbers)}>{mortgageTem}</div>
        )}
        <div className={cx(styles.mortgageCardText)}>{text}</div>
      </>
    )}
  </div>
)

export default MortgageCardDetailsInfo
