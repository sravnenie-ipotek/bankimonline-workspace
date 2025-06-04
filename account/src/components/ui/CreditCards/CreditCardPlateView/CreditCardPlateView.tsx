import classNames from 'classnames/bind'
import React, { useState } from 'react'

import { useAppSelector } from '@src/hooks/store.ts'
import { RootState } from '@src/store'

import RadioButton from '../../RadioButton/RadioButton.tsx'
import styles from './creditCard.module.scss'

const cx = classNames.bind(styles)

const CreditCardPlateView: React.FC<{
  cardType: string
  ExpirationDate: string
  CreditCardIcon: React.ReactNode
}> = ({ cardType, ExpirationDate, CreditCardIcon }) => {
  const [selectedOption, setSelectedOption] = useState('option1')
  const { currentFont } = useAppSelector((state: RootState) => state.language)

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value)
  }

  const isRussian = currentFont === 'font-ru'

  return (
    <div className={cx(styles.creditCardPlate)}>
      <div className={cx(styles.creditCardWrapper)}>
        {CreditCardIcon}
        <div className={cx(styles.creditCardDetails)}>
          <div className={cx(styles.creditCardType)}>{cardType}</div>
          <div className={cx(styles.creditCardExpirationDate)}>
            {ExpirationDate}
          </div>
        </div>
        <div
          className={cx(styles.creditCardRadioButton, {
            'ml-auto': isRussian,
            'mr-auto': !isRussian,
          })}
        >
          <RadioButton
            name="radio"
            value="option1"
            checked={selectedOption === 'option2'}
            onChange={handleOptionChange}
          />
        </div>
      </div>
      <div className={cx(styles.creditCardDetailsMobile)}>
        <div className={cx(styles.creditCardType)}>{cardType}</div>
        <div className={cx(styles.creditCardExpirationDate)}>
          {ExpirationDate}
        </div>
      </div>
    </div>
  )
}
export default CreditCardPlateView
