import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import InitialFeeContext from '@components/ui/ContextButtons/InitialFeeContext/InitialFeeContext'
import CreditParams from '@components/ui/CreditParams'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'
import FormattedInput from '@components/ui/FormattedInput/FormattedInput'
import { SliderInput } from '@components/ui/SliderInput'
import { Column } from '@src/components/ui/Column'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { FormContainer } from '@src/components/ui/FormContainer'
import { Row } from '@src/components/ui/Row'
import { useAppDispatch } from '@src/hooks/store'
import { setActiveField } from '@src/pages/Services/slices/activeField'
import { CalculateMortgageTypes } from '@src/pages/Services/types/formTypes'

interface CityOption {
  value: string
  label: string
}

const FirstStepForm = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()

  const [cityOptions, setCityOptions] = useState<CityOption[]>([])

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`/api/get-cities?lang=${lang}`)
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
  }, [lang])

  const WhenDoYouNeedMoneyOptions = [
    { value: '1', label: t('calculate_mortgage_when_options_1') },
    { value: '2', label: t('calculate_mortgage_when_options_2') },
    { value: '3', label: t('calculate_mortgage_when_options_3') },
    { value: '4', label: t('calculate_mortgage_when_options_4') },
  ]

  const TypeSelectOptions = [
    { value: '1', label: t('calculate_mortgage_type_options_1') },
    { value: '2', label: t('calculate_mortgage_type_options_2') },
    { value: '3', label: t('calculate_mortgage_type_options_3') },
    { value: '4', label: t('calculate_mortgage_type_options_4') },
  ]

  const WillBeYourFirstOptions = [
    { value: '1', label: t('calculate_mortgage_first_options_1') },
    { value: '2', label: t('calculate_mortgage_first_options_2') },
    { value: '3', label: t('calculate_mortgage_first_options_3') },
  ]

  const { setFieldValue, values, errors, touched, setFieldTouched } =
    useFormikContext<CalculateMortgageTypes>()

  return (
    <>
      <FormContainer>
        <FormCaption title={t('calculate_mortgage_title')} />
        <Row>
          <Column>
            <FormattedInput
              handleChange={(value) => {
                dispatch(setActiveField('period'))
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
            <DropdownMenu
              title={t('calculate_mortgage_when')}
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
            <SliderInput
              name="InitialFee"
              value={values.initialFee}
              min={0}
              max={
                String(values.priceOfEstate) === '' ||
                values.priceOfEstate === 0
                  ? 1
                  : values.priceOfEstate
              }
              title={t('calculate_mortgage_initial_fee')}
              handleChange={(value) => {
                dispatch(setActiveField('period'))
                setFieldValue('initialFee', value)
              }}
              tooltip={t('initial_payment_tooltip')}
              error={errors.initialFee}
              disableRangeValues
            />
            <InitialFeeContext />
            {errors.initialFee && <Error error={errors.initialFee} />}
          </Column>
          <Column>
            <DropdownMenu
              title={t('calculate_mortgage_type')}
              data={TypeSelectOptions}
              placeholder={t('calculate_mortgage_type_ph')}
              value={values.typeSelect}
              onChange={(value) => setFieldValue('typeSelect', value)}
              onBlur={() => setFieldTouched('typeSelect', true)}
              error={touched.typeSelect && errors.typeSelect}
            />
          </Column>
          <Column>
            <DropdownMenu
              title={t('calculate_mortgage_first')}
              data={WillBeYourFirstOptions}
              placeholder={t('calculate_mortgage_first_ph')}
              value={values.willBeYourFirst}
              onChange={(value) => setFieldValue('willBeYourFirst', value)}
              onBlur={() => setFieldTouched('willBeYourFirst', true)}
              error={touched.willBeYourFirst && errors.willBeYourFirst}
            />
          </Column>
        </Row>

        <Divider />
        <CreditParams />
      </FormContainer>
    </>
  )
}

export default FirstStepForm
