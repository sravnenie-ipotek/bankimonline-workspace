import React from 'react'
import { useTranslation } from 'react-i18next'

import FormattedInput from '../ui/FormattedInput/FormattedInput'
import SlideInput from './SlideInput'

// Компонент рефинансирования ипотеки для ввода доп параметров
export default function RefinanceMortgageParams(props) {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]

  return (
    <div className={'form-row'} style={{ alignItems: 'flex-start' }}>
      <div className={'form-regular-control'}>
        <SlideInput
          disableCurrency={true}
          unitsMax="שנה"
          unitsMin="שנים"
          value={props.Period}
          name="Period"
          min="1"
          max="30"
          title={t('mortgage_refinance_period')}
          handleChange={props.handleChangePeriod}
        />
      </div>

      <div className={'form-regular-control'}>
        <FormattedInput
          handleChange={props.handleChangeMonthlyPayment}
          name="MonthlyPayment"
          value={props.MonthlyPayment}
          title={t('mortgage_refinance_monthly')}
          placeholder="2,654"
        />
      </div>
      <div className={'form-regular-control'}></div>
    </div>
  )
}
