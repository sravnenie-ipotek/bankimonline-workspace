import classNames from 'classnames/bind'
import { FC } from 'react'

import styles from './FinancialItem.module.scss'

type FinancialItemCurrancy = 'shekel' | 'euro' | 'rubles'

type FinancialItemProps = {
  value: number | undefined
  currancy?: FinancialItemCurrancy
  label: string
}

const cx = classNames.bind(styles)

const FinancialItem: FC<FinancialItemProps> = ({
  value,
  currancy = 'shekel',
  label,
}) => {
  const setCurrancy = (currancy: string) => {
    switch (currancy) {
      case 'shekel':
        return '₪'
    }
  }

  return (
    <div className={cx('.root')}>
      <div className={cx('value')}>
        {value && value.toLocaleString('en-US')} {setCurrancy(currancy)}
      </div>
      <div className={cx('label')}>{label}</div>
    </div>
  )
}

export default FinancialItem
