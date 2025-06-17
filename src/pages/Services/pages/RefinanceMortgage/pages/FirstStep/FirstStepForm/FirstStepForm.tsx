import { useFormikContext } from 'formik'
import { memo, useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'
import { FormContainer } from '@components/ui/FormContainer'
import FormattedInput from '@components/ui/FormattedInput/FormattedInput'
import { Row } from '@components/ui/Row'
import { SliderInput } from '@components/ui/SliderInput'
import { Calendar } from '@src/components/ui/Calendar'
import IncreasePayment from '@src/components/ui/ContextButtons/InvceasePayment/IncreasePayment'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { setActiveField } from '@src/pages/Services/slices/activeField'
import { RefinanceMortgageTypes } from '@src/pages/Services/types/formTypes'
import calculateMonthlyPayment from '@src/utils/helpers/calculateMonthlyPayment'
import calculatePeriod from '@src/utils/helpers/calculatePeriod'

import { MortgageData } from './ui/MortgageData'

const FirstStepForm = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]
  const [maxMonthlyPayment, setMaxMonthlyPayment] = useState(51130)
  const [minMonthlyPayment, setMinMonthlyPayment] = useState(2654)

  const dispatch = useAppDispatch()
  const activeField = useAppSelector((state) => state.activeField)

  const TypeSelectOptions = [
    { value: 'option_1', label: t('calculate_mortgage_type_options_1') },
    { value: 'option_2', label: t('calculate_mortgage_type_options_2') },
    { value: 'option_3', label: t('calculate_mortgage_type_options_3') },
    { value: 'option_4', label: t('calculate_mortgage_type_options_4') },
    { value: 'option_5', label: t('calculate_mortgage_type_options_5') },
  ]

  const WhyDoYouRefinanceOptions = [
    { value: 'option_1', label: t('mortgage_refinance_why_option_1') },
    { value: 'option_2', label: t('mortgage_refinance_why_option_2') },
    { value: 'option_3', label: t('mortgage_refinance_why_option_3') },
    { value: 'option_4', label: t('mortgage_refinance_why_option_4') },
    { value: 'option_5', label: t('mortgage_refinance_why_option_5') },
  ]

  const WhereIsRegisteredOptions = [
    { value: 'option_1', label: t('mortgage_refinance_reg_option_1') },
    { value: 'option_2', label: t('mortgage_refinance_reg_option_2') },
    { value: 'option_3', label: t('mortgage_refinance_reg_option_3') },
    { value: 'option_4', label: t('mortgage_refinance_reg_option_4') },
    { value: 'option_5', label: t('mortgage_refinance_reg_option_5') },
  ]

  const BankSelectOptions = [
    { value: 'hapoalim', label: 'Bank Hapoalim' },
    { value: 'leumi', label: 'Leumi Bank' },
    { value: 'discount', label: 'Discount Bank' },
    { value: 'massad', label: 'Massad Bank' },
    { value: 'israel', label: 'Bank of Israel' },
  ]

  const { setFieldValue, values, errors, touched, setFieldTouched } =
    useFormikContext<RefinanceMortgageTypes>()

  // Рассчитывает максимальное и минимальное значение ежемесячного платежа
  useLayoutEffect(() => {
    const maxInitialPayment = calculateMonthlyPayment(
      values.mortgageBalance,
      0,
      4
    )

    const minInitialPayment = calculateMonthlyPayment(
      values.mortgageBalance,
      0,
      30
    )

    if (!Number.isNaN(maxInitialPayment)) {
      setMaxMonthlyPayment(maxInitialPayment)
    }
    if (maxInitialPayment === 0) {
      setMaxMonthlyPayment(1)
    }

    if (!Number.isNaN(maxInitialPayment)) {
      setMinMonthlyPayment(minInitialPayment)
    }
  }, [values.mortgageBalance])

  useEffect(() => {
    if (activeField === 'period') {
      const monthlyPayment = calculateMonthlyPayment(
        values.mortgageBalance,
        0,
        values.period
      )
      if (!Number.isNaN(monthlyPayment)) {
        setFieldValue('monthlyPayment', monthlyPayment)
      }
    } else {
      const period = calculatePeriod(
        values.mortgageBalance,
        0,
        values.monthlyPayment
      )
      if (!Number.isNaN(period)) {
        setFieldValue('period', period)
      }
    }
  }, [
    activeField,
    setFieldValue,
    values.monthlyPayment,
    values.mortgageBalance,
    values.period,
  ])

  console.log(errors)

  return (
    <>
      <FormContainer>
        <FormCaption title={t('sidebar_sub_refinance_mortgage')} />
        <Row>
          <Column>
            <DropdownMenu
              data={WhyDoYouRefinanceOptions}
              title={t('mortgage_refinance_why')}
              placeholder={t('calculate_mortgage_citizenship_ph')}
              value={values.whyRefinancingMortgage}
              onChange={(value) =>
                setFieldValue('whyRefinancingMortgage', value)
              }
              onBlur={() => setFieldTouched('whyRefinancingMortgage')}
              error={
                touched.whyRefinancingMortgage && errors.whyRefinancingMortgage
              }
            />
          </Column>
          <Column>
            <FormattedInput
              name="PriceOfEstate"
              title={t('mortgage_refinance_left')}
              value={values.mortgageBalance}
              placeholder="1,000,000"
              handleChange={(value) => {
                dispatch(setActiveField('period'))
                setFieldValue('mortgageBalance', value)
              }}
              onBlur={() => setFieldTouched('mortgageBalance')}
              error={touched.mortgageBalance && errors.mortgageBalance}
            />
            {touched.mortgageBalance && errors.mortgageBalance && (
              <Error error={errors.mortgageBalance} />
            )}
          </Column>
          <Column>
            <FormattedInput
              handleChange={(value) => setFieldValue('priceOfEstate', value)}
              name="PriceOfEstate"
              title={t('mortgage_refinance_price')}
              value={values.priceOfEstate}
              placeholder="1,000,000"
              error={errors.priceOfEstate}
            />
            {errors.priceOfEstate && <Error error={errors.priceOfEstate} />}
          </Column>
        </Row>

        <Row>
          <Column>
            <DropdownMenu
              data={TypeSelectOptions}
              title={t('mortgage_refinance_type')}
              placeholder={t('mortgage_refinance_type_ph')}
              value={values.typeSelect}
              onChange={(value) => setFieldValue('typeSelect', value)}
              onBlur={() => setFieldTouched('typeSelect')}
              error={touched.typeSelect && errors.typeSelect}
            />
          </Column>
          <Column>
            <DropdownMenu
              data={BankSelectOptions}
              title={t('mortgage_refinance_bank')}
              placeholder={t('calculate_mortgage_citizenship_ph')}
              value={values.bank}
              onChange={(value) => setFieldValue('bank', value)}
              onBlur={() => setFieldTouched('bank')}
              error={touched.bank && errors.bank}
            />
          </Column>
          <Column>
            <DropdownMenu
              data={WhereIsRegisteredOptions}
              title={t('mortgage_refinance_registered')}
              placeholder={t('calculate_mortgage_citizenship_ph')}
              value={values.propertyRegistered}
              onChange={(value) => setFieldValue('propertyRegistered', value)}
              onBlur={() => setFieldTouched('propertyRegistered')}
              error={touched.propertyRegistered && errors.propertyRegistered}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <Calendar
              title={t('start_date_mortgage_title')}
              placeholder={t('date_ph')}
              value={values.startDate}
              onChange={(value) => setFieldValue('startDate', value)}
            />
          </Column>
          {values.whyRefinancingMortgage === 'option_2' && (
            <Column>
              <FormattedInput
                handleChange={(value) =>
                  setFieldValue('decreaseMortgage', value)
                }
                name="PriceOfEstate"
                title={t('mortgage_refinance_decrease')}
                value={values.decreaseMortgage}
                placeholder="1,000,000"
                onBlur={() => setFieldTouched('decreaseMortgage')}
                error={touched.decreaseMortgage && errors.decreaseMortgage}
              />
              {touched.decreaseMortgage && errors.decreaseMortgage && (
                <Error error={errors.decreaseMortgage} />
              )}
            </Column>
          )}
          {values.whyRefinancingMortgage === 'option_3' && (
            <Column>
              <FormattedInput
                handleChange={(value) =>
                  setFieldValue('increaseMortgage', value)
                }
                name="PriceOfEstate"
                title={t('mortgage_refinance_increase')}
                value={values.increaseMortgage}
                placeholder="1,000,000"
                onBlur={() => setFieldTouched('increaseMortgage')}
                error={touched.increaseMortgage && errors.increaseMortgage}
              />
              {touched.increaseMortgage && errors.increaseMortgage && (
                <Error error={errors.increaseMortgage} />
              )}
            </Column>
          )}
          <Column />
        </Row>

        <Divider />

        <Row>
          <MortgageData />
        </Row>

        <Divider />

        <Row>
          <Column>
            <SliderInput
              disableCurrency
              unitsMax={t('calculate_mortgage_period_units_max')}
              unitsMin={t('calculate_mortgage_period_units_min')}
              value={values.period}
              name="Period"
              min={4}
              max={30}
              error={errors.period}
              title={t('calculate_mortgage_period')}
              handleChange={(value) => {
                dispatch(setActiveField('period'))
                setFieldValue('period', value)
              }}
            />
            {errors.period && <Error error={errors.period} />}
          </Column>

          <Column>
            <SliderInput
              unitsMax="₪"
              unitsMin="₪"
              value={values.monthlyPayment}
              name="monthlyPayment"
              min={minMonthlyPayment}
              max={maxMonthlyPayment}
              error={errors.monthlyPayment}
              title={t('calculate_mortgage_initial_payment')}
              handleChange={(value) => {
                dispatch(setActiveField('monthlyPayment'))
                setFieldValue('monthlyPayment', value)
              }}
            />
            <IncreasePayment />
            {errors.monthlyPayment && <Error error={errors.monthlyPayment} />}
          </Column>

          <Column />
        </Row>
      </FormContainer>
    </>
  )
}

export default memo(FirstStepForm)
