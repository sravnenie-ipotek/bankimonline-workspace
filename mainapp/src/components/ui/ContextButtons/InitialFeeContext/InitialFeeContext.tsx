import classnames from 'classnames/bind'
import { useFormikContext } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { CalculateMortgageTypes } from '@src/pages/Services/types/formTypes'

import { Message } from '../../Message'
import styles from './initialFeeContext.module.scss'

const cx = classnames.bind(styles)

// Компонент  кнопки под полем ввода дс текстом первоначального взноса

const InitialFeeContext: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { values } = useFormikContext<CalculateMortgageTypes>()

  const financingAmount = (values.priceOfEstate - values.initialFee).toLocaleString('en-US')
  const financingPercentage = Math.trunc(
    ((values.priceOfEstate - values.initialFee) / values.priceOfEstate) * 100
  )

  return (
    <Message style={{ marginTop: '2px' }}>
      <span className={cx('margin-sides')}>{t('calc_mortrage_subtext_1')}</span>
      <b className={cx('bold-text')}>{financingAmount} ₪</b>
      <br />
      <span className={cx('margin-sides')}>{t('calc_mortrage_subtext_3')}</span>
      <b className={cx('bold-text')}>
        {isNaN(financingPercentage) || financingPercentage < 0 ? 0 : financingPercentage}%
      </b>
    </Message>
  )
}

export default InitialFeeContext
