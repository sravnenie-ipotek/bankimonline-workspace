import classNames from 'classnames/bind'
import React from 'react'

import { MagnifyMinus } from '@assets/icons/Magnify/MagnifyMinus'
import { MagnifyPlus } from '@assets/icons/Magnify/MagnifyPlus'

import styles from './doubleButton.module.scss'

const cx = classNames.bind(styles)

interface DoubleButtonProps {
  plus: () => void
  minus: () => void
}

const DoubleButton: React.FC<DoubleButtonProps> = ({ plus, minus }) => {
  return (
    <div className={cx(styles.buttonPlate)}>
      <div className={cx(styles.buttonPlaya)}>
        <p onClick={plus}>
          <MagnifyPlus />
        </p>
      </div>
      <div className={cx(styles.buttonLine)}></div>
      <div className={cx(styles.buttonPlaya)}>
        <p onClick={minus}>
          <MagnifyMinus />
        </p>
      </div>
    </div>
  )
}

export default DoubleButton
