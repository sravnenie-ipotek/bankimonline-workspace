import { useFormikContext } from 'formik'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Error } from '@components/ui/Error'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { setActiveField } from '@src/pages/Services/slices/activeField'
import { CalculateMortgageTypes } from '@src/pages/Services/types/formTypes'
import { calculationService } from '@src/services/calculationService'

import { Column } from './Column'
import IncreasePayment from './ContextButtons/InvceasePayment/IncreasePayment'
import { Row } from './Row'
import SliderInput from './SliderInput/SliderInput'

// Компонент для элементов данных для кредита
export default function CreditParams() {
  const [maxMonthlyPayment, setMaxMonthlyPayment] = useState(51130)
  const [minMonthlyPayment, setMinMonthlyPayment] = useState(2654)
  const [loanTermLimits, setLoanTermLimits] = useState({ min: 4, max: 30 })

  const { t, i18n } = useTranslation()

  const { setFieldValue, values, errors } =
    useFormikContext<CalculateMortgageTypes>()
  const activeField = useAppSelector((state) => state.activeField)
  const dispatch = useAppDispatch()

  // Fetch loan term limits from database
  useEffect(() => {
    const fetchLoanTermLimits = async () => {
      try {
        const params = await calculationService.getAllParameters('mortgage')
        const minYears = params.standards?.loan_terms?.min_years?.value || 4
        const maxYears = params.standards?.loan_terms?.max_years?.value || 30
        setLoanTermLimits({ min: minYears, max: maxYears })
      } catch (error) {
        console.error('❌ Error fetching loan term limits:', error)
        // Keep default values (4-30 years) as fallback
      }
    }
    fetchLoanTermLimits()
  }, [])

  const handleChangePeriod = (value: number | string | null) => {
    dispatch(setActiveField('period'))
    setFieldValue('period', value)
  }

  const handleChangeMonthlyPayment = (value: number | string | null) => {
    dispatch(setActiveField('monthlyPayment'))
    setFieldValue('monthlyPayment', value)
  }

  // Рассчитывает и меняет значения ежемесячного платежа или срока
  // в зависимости от активного инпута
  useEffect(() => {
    const updateCalculations = async () => {
      try {
        if (activeField === 'period') {
          const monthlyPayment = await calculationService.calculateMortgagePayment(
            values.priceOfEstate,
            values.initialFee,
            values.period
          )
          if (!Number.isNaN(monthlyPayment)) {
            setFieldValue('monthlyPayment', monthlyPayment)
          }
        } else {
          const period = await calculationService.calculateLoanPeriod(
            values.priceOfEstate,
            values.initialFee,
            values.monthlyPayment
          )
          if (!Number.isNaN(period)) {
            setFieldValue('period', period)
          }
        }
      } catch (error) {
        console.error('❌ Error calculating mortgage values:', error)
      }
    }

    updateCalculations()
  }, [
    activeField,
    setFieldValue,
    values.initialFee,
    values.monthlyPayment,
    values.period,
    values.priceOfEstate,
  ])

  // Рассчитывает максимальное и минимальное значение ежемесячного платежа
  useLayoutEffect(() => {
    const updatePaymentLimits = async () => {
      try {
        const maxInitialPayment = await calculationService.calculateMortgagePayment(
          values.priceOfEstate,
          values.initialFee,
          loanTermLimits.min // Database-driven minimum term
        )

        const minInitialPayment = await calculationService.calculateMortgagePayment(
          values.priceOfEstate,
          values.initialFee,
          loanTermLimits.max // Database-driven maximum term
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
        console.error('❌ Error calculating payment limits:', error)
        // Fallback to database-driven defaults or reasonable hardcoded values
        try {
          const params = await calculationService.getAllParameters('mortgage')
          const defaultMax = params.standards?.payment_limits?.default_max?.value || 51130
          const defaultMin = params.standards?.payment_limits?.default_min?.value || 2654
          setMaxMonthlyPayment(defaultMax)
          setMinMonthlyPayment(defaultMin)
        } catch (fallbackError) {
          console.error('❌ Even database fallback failed:', fallbackError)
          setMaxMonthlyPayment(51130)
          setMinMonthlyPayment(2654)
        }
      }
    }

    updatePaymentLimits()
  }, [values.initialFee, values.priceOfEstate, loanTermLimits])

  return (
    <Row>
      <Column>
        <SliderInput
          disableCurrency={true}
          unitsMax={t('calculate_mortgage_period_units_max')}
          unitsMin={t('calculate_mortgage_period_units_min')}
          value={values.period}
          name="Period"
          min={loanTermLimits.min}
          max={loanTermLimits.max}
          error={errors.period}
          title={t('calculate_mortgage_period')}
          handleChange={handleChangePeriod}
        />
        {errors.period && <Error error={errors.period} />}
      </Column>
      <Column>
        <SliderInput
          unitsMax="₪"
          unitsMin="₪"
          name="MonthlyPayment"
          min={minMonthlyPayment}
          max={maxMonthlyPayment}
          error={errors.monthlyPayment}
          title={t('calculate_mortgage_initial_payment')}
          handleChange={handleChangeMonthlyPayment}
          value={values.monthlyPayment}
        />
        <IncreasePayment />
        {errors.monthlyPayment && <Error error={errors.monthlyPayment} />}
      </Column>
      <Column></Column>
    </Row>
  )
}
