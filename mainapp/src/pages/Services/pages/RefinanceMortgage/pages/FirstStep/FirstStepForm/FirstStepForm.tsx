import { useFormikContext } from 'formik'
import { memo, useEffect, useLayoutEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

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
import { calculationService } from '@src/services/calculationService'

import { MortgageData } from './ui/MortgageData'

const FirstStepForm = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('refinance_step1')
  const [maxMonthlyPayment, setMaxMonthlyPayment] = useState(51130)
  const [minMonthlyPayment, setMinMonthlyPayment] = useState(2654)

  const dispatch = useAppDispatch()
  const activeField = useAppSelector((state) => state.activeField)

  // Use useMemo to ensure dropdown options update when translations change
  const TypeSelectOptions = useMemo(() => [
    { value: 'option_1', label: getContent('calculate_mortgage_type_options_1', 'calculate_mortgage_type_options_1') },
    { value: 'option_2', label: getContent('calculate_mortgage_type_options_2', 'calculate_mortgage_type_options_2') },
    { value: 'option_3', label: getContent('calculate_mortgage_type_options_3', 'calculate_mortgage_type_options_3') },
    { value: 'option_4', label: getContent('calculate_mortgage_type_options_4', 'calculate_mortgage_type_options_4') },
    { value: 'option_5', label: getContent('calculate_mortgage_type_options_5', 'calculate_mortgage_type_options_5') },
  ], [getContent])

  const WhyDoYouRefinanceOptions = useMemo(() => [
    { value: 'option_1', label: getContent('mortgage_refinance_why_option_1', 'mortgage_refinance_why_option_1') },
    { value: 'option_2', label: getContent('mortgage_refinance_why_option_2', 'mortgage_refinance_why_option_2') },
    { value: 'option_3', label: getContent('mortgage_refinance_why_option_3', 'mortgage_refinance_why_option_3') },
    { value: 'option_4', label: getContent('mortgage_refinance_why_option_4', 'mortgage_refinance_why_option_4') },
    { value: 'option_5', label: getContent('mortgage_refinance_why_option_5', 'mortgage_refinance_why_option_5') },
  ], [getContent])

  const WhereIsRegisteredOptions = useMemo(() => [
    { value: 'option_1', label: getContent('mortgage_refinance_reg_option_1', 'mortgage_refinance_reg_option_1') },
    { value: 'option_2', label: getContent('mortgage_refinance_reg_option_2', 'mortgage_refinance_reg_option_2') },
  ], [getContent])

  const banks = useMemo(() => [
    { value: 'hapoalim', label: getContent('bank_hapoalim', 'bank_hapoalim') },
    { value: 'leumi', label: getContent('bank_leumi', 'bank_leumi') },
    { value: 'discount', label: getContent('bank_discount', 'bank_discount') },
    { value: 'massad', label: getContent('bank_massad', 'bank_massad') },
  ], [getContent])

  const { setFieldValue, values, errors, touched, setFieldTouched } =
    useFormikContext<RefinanceMortgageTypes>()

  // Рассчитывает максимальное и минимальное значение ежемесячного платежа
  useLayoutEffect(() => {
    const updatePaymentLimits = async () => {
      try {
        const maxInitialPayment = await calculationService.calculateMortgagePayment(
          values.mortgageBalance,
          0,
          4 // 4 years
        )
        const minInitialPayment = await calculationService.calculateMortgagePayment(
          values.mortgageBalance,
          0,
          30 // 30 years
        )

        if (!Number.isNaN(maxInitialPayment)) {
          setMaxMonthlyPayment(maxInitialPayment)
        }
        if (maxInitialPayment === 0) {
          setMaxMonthlyPayment(1)
        }

        if (!Number.isNaN(minInitialPayment)) {
          setMinMonthlyPayment(minInitialPayment)
        }
      } catch (error) {
        console.error('❌ Error calculating mortgage payment limits:', error)
        // Fallback to reasonable defaults
        setMaxMonthlyPayment(51130)
        setMinMonthlyPayment(2654)
      }
    }

    updatePaymentLimits()
  }, [values.mortgageBalance])

  useEffect(() => {
    const updateCalculations = async () => {
      try {
        if (activeField === 'period') {
          const monthlyPayment = await calculationService.calculateMortgagePayment(
            values.mortgageBalance,
            0,
            values.period
          )
          if (!Number.isNaN(monthlyPayment)) {
            setFieldValue('monthlyPayment', monthlyPayment)
          }
        } else {
          const period = await calculationService.calculateLoanPeriod(
            values.mortgageBalance,
            0,
            values.monthlyPayment
          )
          if (!Number.isNaN(period)) {
            setFieldValue('period', period)
          }
        }
      } catch (error) {
        console.error('❌ Error calculating mortgage refinance values:', error)
      }
    }

    updateCalculations()
  }, [
    activeField,
    setFieldValue,
    values.monthlyPayment,
    values.mortgageBalance,
    values.period,
  ])

  return (
    <>
      <FormContainer>
        <FormCaption title={getContent('sidebar_sub_refinance_mortgage', 'sidebar_sub_refinance_mortgage')} />
        <Row>
          <Column>
            <DropdownMenu
              data={WhyDoYouRefinanceOptions}
              title={getContent('mortgage_refinance_why', 'mortgage_refinance_why')}
              placeholder={t('mortgage_refinance_why_ph')}
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
              title={getContent('mortgage_refinance_left', 'mortgage_refinance_left')}
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
              title={getContent('mortgage_refinance_price', 'mortgage_refinance_price')}
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
              title={getContent('mortgage_refinance_type', 'mortgage_refinance_type')}
              placeholder={t('mortgage_refinance_type_ph')}
              value={values.typeSelect}
              onChange={(value) => setFieldValue('typeSelect', value)}
              onBlur={() => setFieldTouched('typeSelect')}
              error={touched.typeSelect && errors.typeSelect}
            />
          </Column>
          <Column>
            <DropdownMenu
              data={banks}
              title={getContent('mortgage_refinance_bank', 'mortgage_refinance_bank')}
              placeholder={t('mortgage_refinance_bank_ph')}
              value={values.bank}
              onChange={(value) => setFieldValue('bank', value)}
              onBlur={() => setFieldTouched('bank')}
              error={touched.bank && errors.bank}
            />
          </Column>
          <Column>
            <DropdownMenu
              data={WhereIsRegisteredOptions}
              title={getContent('mortgage_refinance_registered', 'mortgage_refinance_registered')}
              placeholder={t('mortgage_refinance_registered_ph')}
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
              title={getContent('start_date_mortgage_title', 'start_date_mortgage_title')}
              placeholder={t('date_ph')}
              value={values.startDate}
              onChange={(value) => setFieldValue('startDate', value)}
              onBlur={() => setFieldTouched('startDate')}
              error={touched.startDate && errors.startDate}
            />
            {touched.startDate && errors.startDate && (
              <Error error={errors.startDate} />
            )}
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
          {values.whyRefinancingMortgage === 'option_5' && (
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
              onBlur={() => setFieldTouched('monthlyPayment')}
            />
            <IncreasePayment />
            {touched.monthlyPayment && errors.monthlyPayment && <Error error={errors.monthlyPayment} />}
          </Column>

          <Column />
        </Row>
      </FormContainer>
    </>
  )
}

export default memo(FirstStepForm)
