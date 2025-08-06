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
import { useContentApi } from '@src/hooks/useContentApi'
import { setActiveField } from '@src/pages/Services/slices/activeField'
import { CalculateCreditTypes } from '@src/pages/Services/types/formTypes'
import { calculationService } from '@src/services/calculationService'

interface CityOption {
  value: string
  label: string
}

export const FirstStepForm: FC = () => {
  const [maxMonthlyPayment, setMaxMonthlyPayment] = useState(51130)
  const [minMonthlyPayment, setMinMonthlyPayment] = useState(2654)
  const [cityOptions, setCityOptions] = useState<CityOption[]>([])
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('calculate_credit_1')

  // ✅ CORRECT - Database-driven dropdown options
  const creditPurposes = useMemo(() => [
    { value: 'option_1', label: getContent('calculate_credit_target_option_1', t('calculate_credit_target_option_1')) },
    { value: 'option_2', label: getContent('calculate_credit_target_option_2', t('calculate_credit_target_option_2')) },
    { value: 'option_3', label: getContent('calculate_credit_target_option_3', t('calculate_credit_target_option_3')) },
    { value: 'option_4', label: getContent('calculate_credit_target_option_4', t('calculate_credit_target_option_4')) },
    { value: 'option_5', label: getContent('calculate_credit_target_option_5', t('calculate_credit_target_option_5')) },
    { value: 'option_6', label: getContent('calculate_credit_target_option_6', t('calculate_credit_target_option_6')) },
  ], [getContent, t])

  const WhenDoYouNeedMoneyOptions = useMemo(() => [
    { value: 'option_1', label: getContent('calculate_mortgage_when_options_1', t('calculate_mortgage_when_options_1')) },
    { value: 'option_2', label: getContent('calculate_mortgage_when_options_2', t('calculate_mortgage_when_options_2')) },
    { value: 'option_3', label: getContent('calculate_mortgage_when_options_3', t('calculate_mortgage_when_options_3')) },
    { value: 'option_4', label: getContent('calculate_mortgage_when_options_4', t('calculate_mortgage_when_options_4')) },
  ], [getContent, t])

  const loanDeferralOptions = useMemo(() => [
    { value: 'option_1', label: getContent('calculate_credit_prolong_option_1', t('calculate_credit_prolong_option_1')) },
    { value: 'option_2', label: getContent('calculate_credit_prolong_option_2', t('calculate_credit_prolong_option_2')) },
    { value: 'option_3', label: getContent('calculate_credit_prolong_option_3', t('calculate_credit_prolong_option_3')) },
    { value: 'option_4', label: getContent('calculate_credit_prolong_option_4', t('calculate_credit_prolong_option_4')) },
    { value: 'option_5', label: getContent('calculate_credit_prolong_option_5', t('calculate_credit_prolong_option_5')) },
    { value: 'option_6', label: getContent('calculate_credit_prolong_option_6', t('calculate_credit_prolong_option_6')) },
    { value: 'option_7', label: getContent('calculate_credit_prolong_option_7', t('calculate_credit_prolong_option_7')) },
  ], [getContent, t])

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
    const updateCalculations = async () => {
      try {
        if (activeField === 'period') {
          const monthlyPayment = await calculationService.calculateCreditPayment(
            values.loanAmount,
            values.period
          )
          if (!Number.isNaN(monthlyPayment)) {
            setFieldValue('monthlyPayment', monthlyPayment)
          }
        } else {
          const period = await calculationService.calculateLoanPeriod(
            values.loanAmount,
            0,
            values.monthlyPayment
          )
          if (!Number.isNaN(period)) {
            setFieldValue('period', period)
          }
        }
      } catch (error) {
        console.error('❌ Error calculating credit values:', error)
      }
    }

    updateCalculations()
  }, [
    activeField,
    setFieldValue,
    values.loanAmount,
    values.monthlyPayment,
    values.period,
  ])

  // Рассчитывает максимальное и минимальное значение ежемесячного платежа
  useLayoutEffect(() => {
    const updatePaymentLimits = async () => {
      try {
        const maxInitialPayment = await calculationService.calculateCreditPayment(
          values.loanAmount,
          1 // 1 year
        )
        const minInitialPayment = await calculationService.calculateCreditPayment(
          values.loanAmount,
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
        console.error('❌ Error calculating payment limits:', error)
        // Fallback to reasonable defaults
        setMaxMonthlyPayment(51130)
        setMinMonthlyPayment(2654)
      }
    }

    updatePaymentLimits()
  }, [values.loanAmount])

  return (
    <>
      <FormContainer>
        <FormCaption title={t('sidebar_sub_calculate_credit')} />

        <Row>
          <Column>
            <DropdownMenu
              title={getContent('calculate_why', t('calculate_why'))}
              data={creditPurposes}
              placeholder={getContent('calculate_credit_target_ph', t('calculate_credit_target_ph'))}
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
              title={getContent('calculate_amount', t('calculate_amount'))}
              value={values.loanAmount}
              placeholder="1,000,000"
              error={errors.loanAmount}
            />
            {errors.loanAmount && <Error error={errors.loanAmount} />}
          </Column>

          <Column>
            <DropdownMenu
              title={getContent('calculate_when', t('calculate_when'))}
              data={WhenDoYouNeedMoneyOptions}
              placeholder={getContent('calculate_mortgage_when_options_Time', t('calculate_mortgage_when_options_Time'))}
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
              title={getContent('calculate_prolong', t('calculate_prolong'))}
              data={loanDeferralOptions}
              placeholder={getContent('calculate_credit_prolong_ph', t('calculate_credit_prolong_ph'))}
              value={values.loanDeferral}
              onChange={(value) => setFieldValue('loanDeferral', value)}
              onBlur={() => setFieldTouched('loanDeferral', true)}
              error={touched.loanDeferral && errors.loanDeferral}
            />
          </Column>
        </Row>

        {values.purposeOfLoan && values.purposeOfLoan === 'option_2' && (
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
