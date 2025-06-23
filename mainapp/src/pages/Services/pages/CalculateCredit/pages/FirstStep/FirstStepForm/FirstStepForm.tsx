import { useFormikContext } from 'formik'
import { FC, useEffect, useLayoutEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'
import { FormContainer } from '@components/ui/FormContainer'
import { FormattedInput } from '@components/ui/FormattedInput'
import { Row } from '@components/ui/Row'
import IncreasePayment from '@src/components/ui/ContextButtons/InvceasePayment/IncreasePayment'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { SliderInput } from '@src/components/ui/SliderInput'
import { TitleElement } from '@src/components/ui/TitleElement'
import { YesNo } from '@src/components/ui/YesNo'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { setActiveField } from '@src/pages/Services/slices/activeField'
import { CalculateCreditTypes } from '@src/pages/Services/types/formTypes'
import calculateMonthlyPayment from '@src/utils/helpers/calculateMonthlyPayment'
import calculatePeriod from '@src/utils/helpers/calculatePeriod'

interface CityOption {
  value: string
  label: string
}

export const FirstStepForm: FC = () => {
  const [maxMonthlyPayment, setMaxMonthlyPayment] = useState(51130)
  const [minMonthlyPayment, setMinMonthlyPayment] = useState(2654)
  const [cityOptions, setCityOptions] = useState<CityOption[]>([])
  const { t, i18n } = useTranslation()

  // Use useMemo to ensure dropdown options update when translations change
  const creditPurposes = useMemo(() => [
    { value: 'option_1', label: t('calculate_credit_target_option_1') },
    { value: 'option_2', label: t('calculate_credit_target_option_2') },
    { value: 'option_3', label: t('calculate_credit_target_option_3') },
    { value: 'option_4', label: t('calculate_credit_target_option_4') },
    { value: 'option_5', label: t('calculate_credit_target_option_5') },
    { value: 'option_6', label: t('calculate_credit_target_option_6') },
  ], [t])

  const WhenDoYouNeedMoneyOptions = useMemo(() => [
    { value: 'option_1', label: t('calculate_mortgage_when_options_1') },
    { value: 'option_2', label: t('calculate_mortgage_when_options_2') },
    { value: 'option_3', label: t('calculate_mortgage_when_options_3') },
    { value: 'option_4', label: t('calculate_mortgage_when_options_4') },
  ], [t])

  const loanDeferralOptions = useMemo(() => [
    { value: 'option_1', label: t('calculate_credit_prolong_option_1') },
    { value: 'option_2', label: t('calculate_credit_prolong_option_2') },
    { value: 'option_3', label: t('calculate_credit_prolong_option_3') },
    { value: 'option_4', label: t('calculate_credit_prolong_option_4') },
    { value: 'option_5', label: t('calculate_credit_prolong_option_5') },
    { value: 'option_6', label: t('calculate_credit_prolong_option_6') },
    { value: 'option_7', label: t('calculate_credit_prolong_option_7') },
  ], [t])

  const { setFieldValue, values, errors, touched, setFieldTouched } =
    useFormikContext<CalculateCreditTypes>()

  const activeField = useAppSelector((state) => state.activeField)
  const dispatch = useAppDispatch()

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`/api/get-cities?lang=${i18n.language}`)
        const data = await response.json()
        if (data.status === 'success') {
          const formattedCities = data.data.map((city) => ({
            value: city.value,
            label: city.name,
          }))
          setCityOptions(formattedCities)
        } else {
          console.error('Failed to fetch cities:', data.message)
        }
      } catch (error) {
        console.error('Error fetching cities:', error)
      }
    }

    fetchCities()
  }, [i18n.language])

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
    if (activeField === 'period') {
      const monthlyPayment = calculateMonthlyPayment(
        values.loanAmount,
        0,
        values.period,
        5
      )
      if (!Number.isNaN(monthlyPayment)) {
        setFieldValue('monthlyPayment', monthlyPayment)
      }
    } else {
      const period = calculatePeriod(
        values.loanAmount,
        0,
        values.monthlyPayment,
        5
      )
      if (!Number.isNaN(period)) {
        setFieldValue('period', period)
      }
    }
  }, [
    activeField,
    setFieldValue,
    values.loanAmount,
    values.monthlyPayment,
    values.period,
  ])

  // Рассчитывает максимальное и минимальное значение ежемесячного платежа
  useLayoutEffect(() => {
    const maxInitialPayment = calculateMonthlyPayment(
      values.loanAmount,
      0,
      1,
      5
    )

    const minInitialPayment = calculateMonthlyPayment(
      values.loanAmount,
      0,
      30,
      5
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
  }, [values.loanAmount])

  return (
    <>
      <FormContainer>
        <FormCaption title={t('sidebar_sub_calculate_credit')} />

        <Row>
          <Column>
            <DropdownMenu
              title={t('calculate_why')}
              data={creditPurposes}
              placeholder={t('calculate_credit_target_ph')}
              value={values.purposeOfLoan}
              onChange={(value) => setFieldValue('purposeOfLoan', value)}
              onBlur={() => setFieldTouched('purposeOfLoan', true)}
              error={touched.purposeOfLoan && errors.purposeOfLoan}
            />
          </Column>
          <Column>
            <FormattedInput
              handleChange={(value) => {
                dispatch(setActiveField('period'))
                setFieldValue('loanAmount', value)
              }}
              name="loanAmount"
              title={t('calculate_amount')}
              value={values.loanAmount}
              placeholder="1,000,000"
              error={errors.loanAmount}
            />
            {errors.loanAmount && <Error error={errors.loanAmount} />}
          </Column>

          <Column>
            <DropdownMenu
              title={t('calculate_when')}
              data={WhenDoYouNeedMoneyOptions}
              placeholder={t('calculate_mortgage_when_options_ph')}
              value={values.whenDoYouNeedMoney}
              onChange={(value) => setFieldValue('whenDoYouNeedMoney', value)}
              onBlur={() => setFieldTouched('whenDoYouNeedMoney', true)}
              error={touched.whenDoYouNeedMoney && errors.whenDoYouNeedMoney}
            />
          </Column>
        </Row>
        <Row>
          <Column>
            <DropdownMenu
              title={t('calculate_prolong')}
              data={loanDeferralOptions}
              placeholder={t('calculate_mortgage_first_ph')}
              value={values.loanDeferral}
              onChange={(value) => setFieldValue('loanDeferral', value)}
              onBlur={() => setFieldTouched('loanDeferral', true)}
              error={touched.loanDeferral && errors.loanDeferral}
            />
          </Column>
        </Row>

        {values.purposeOfLoan && values.purposeOfLoan === 'option_6' && (
          <>
            <Divider />
            <Row>
              <Column>
                <FormattedInput
                  handleChange={(value) => {
                    setFieldValue('priceOfEstate', value)
                  }}
                  name="PriceOfEstate"
                  title={t('calculate_mortgage_price')}
                  value={values.priceOfEstate}
                  placeholder="1,000,000"
                  error={errors.priceOfEstate}
                />
                {errors.priceOfEstate && <Error error={errors.priceOfEstate} />}
              </Column>
              <Column>
                <DropdownMenu
                  title={t('calculate_mortgage_city')}
                  data={cityOptions}
                  placeholder={t('city')}
                  value={values.cityWhereYouBuy}
                  onChange={(value) => setFieldValue('cityWhereYouBuy', value)}
                  onBlur={() => setFieldTouched('cityWhereYouBuy', true)}
                  searchable
                  searchPlaceholder={t('search')}
                  nothingFoundText={t('nothing_found')}
                  error={touched.cityWhereYouBuy && errors.cityWhereYouBuy}
                />
              </Column>
              <Column>
                <TitleElement title={t('have_mortgage_title')} />
                <YesNo
                  value={values.haveMortgage}
                  onChange={(value) => setFieldValue('haveMortgage', value)}
                  error={touched.haveMortgage && errors.haveMortgage}
                />
              </Column>
            </Row>
          </>
        )}

        <Divider />

        <Row>
          <Column>
            <SliderInput
              disableCurrency={true}
              unitsMax={t('calculate_mortgage_period_units_max')}
              unitsMin={t('calculate_mortgage_period_units_min')}
              value={values.period}
              name="Period"
              min={1}
              max={30}
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

          <Column />
        </Row>
      </FormContainer>
    </>
  )
}
