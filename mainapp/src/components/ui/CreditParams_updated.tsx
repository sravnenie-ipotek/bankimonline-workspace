import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Error } from '@components/ui/Error'

import IncreasePayment from './ContextButtons/InvceasePayment/IncreasePayment'
import SliderInput from './SliderInput/SliderInput'

// Компонент для элементов данных для кредита

type TypesValues = {
  sum?: number
  period: number
  monthlyPayment: number
  minSum: number
  maxSum: number
  onPeriodChange: (e: number) => void
  errorPeriod?: string | boolean
  errorMonthlyPayment?: string | boolean
  // onSumChange: () => void
}

export const CreditParams_updated: FC<TypesValues> = ({
  period,
  monthlyPayment,
  minSum,
  maxSum,
  onPeriodChange,
  errorPeriod,
  errorMonthlyPayment,
  // onSumChange,
}) => {
  // const [maxMonthlyPayment, setMaxMonthlyPayment] = useState(51130)
  // const [minMonthlyPayment, setMinMonthlyPayment] = useState(2654)

  const { t, i18n } = useTranslation()

  // const { activeField, setActiveField } = useContext(ActiveFieldContext)

  // const { errors } = useFormikContext<FormValues>()

  // const handleChangePeriod = (value: number | null) => {
  //   // setActiveField('period')
  //   // console.log('активный')
  //   setFieldValue('period', value)
  // }

  // const handleChangeMonthlyPayment = (value: number | null) => {
  //   // setActiveField('monthlyPayment')
  //   setFieldValue('monthlyPayment', value)
  // }

  // Рассчитывает и меняет значения ежемесячного платежа или срока
  // в зависимости от активного инпута
  // useEffect(() => {
  //   if (activeField === 'period') {
  //     const monthlyPayment = calculateMonthlyPayment(
  //       values.priceOfEstate,
  //       values.initialFee,
  //       values.period
  //     )
  //     if (!Number.isNaN(monthlyPayment)) {
  //       setFieldValue('monthlyPayment', monthlyPayment)
  //     }
  //   } else {
  //     const period = calculatePeriod(
  //       values.priceOfEstate,
  //       values.initialFee,
  //       values.monthlyPayment
  //     )
  //     if (!Number.isNaN(period)) {
  //       setFieldValue('period', period)
  //     }
  //   }
  // }, [
  //   activeField,
  //   setFieldValue,
  //   values.initialFee,
  //   values.monthlyPayment,
  //   values.period,
  //   values.priceOfEstate,
  // ])

  // Рассчитывает максимальное и минимальное значение ежемесячного платежа
  // useLayoutEffect(() => {
  //   const maxInitialPayment = calculateMonthlyPayment(
  //     values.priceOfEstate,
  //     values.initialFee,
  //     4
  //   )

  //   const minInitialPayment = calculateMonthlyPayment(
  //     values.priceOfEstate,
  //     values.initialFee,
  //     30
  //   )

  //   if (!Number.isNaN(maxInitialPayment)) {
  //     setMaxMonthlyPayment(maxInitialPayment)
  //   }
  //   if (maxInitialPayment === 0) {
  //     setMaxMonthlyPayment(1)
  //   }

  //   if (!Number.isNaN(maxInitialPayment)) {
  //     setMinMonthlyPayment(minInitialPayment)
  //   }
  // }, [values.initialFee, values.priceOfEstate])

  return (
    <div className={'form-row'}>
      <div className={'form-regular-control'}>
        <SliderInput
          disableCurrency={true}
          unitsMax={t('calculate_mortgage_period_units_max')}
          unitsMin={t('calculate_mortgage_period_units_min')}
          value={period}
          name="Period"
          min={4}
          max={30}
          error={errorPeriod}
          title={t('calculate_mortgage_period')}
          handleChange={(value: number | string | null) =>
            onPeriodChange(value as number)
          }
        />
        {!!errorPeriod && <Error error={errorPeriod} />}
      </div>

      <div className={'form-regular-control'}>
        <SliderInput
          unitsMax="₪"
          unitsMin="₪"
          name="MonthlyPayment"
          min={minSum}
          max={maxSum}
          error={errorMonthlyPayment}
          title={t('calculate_mortgage_initial_payment')}
          handleChange={() => {}}
          value={monthlyPayment}
          disableRanger={true}
        />
        <IncreasePayment />
        {!!errorMonthlyPayment && <Error error={errorMonthlyPayment} />}
      </div>

      <div className={'form-regular-control'}></div>
    </div>
  )
}
