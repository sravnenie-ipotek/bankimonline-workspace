import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useEffect, useState, useMemo } from 'react'

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
  const [ltvRatios, setLtvRatios] = useState<{[key: string]: number}>({
    no_property: 0.75,
    has_property: 0.50,
    selling_property: 0.70
  })

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

    // Fetch property ownership LTV ratios from database (fixes hardcoded values)
    const fetchLtvRatios = async () => {
      try {
        const response = await fetch('/api/property-ownership-ltv')
        const data = await response.json()
        if (data.status === 'success') {
          setLtvRatios(data.data)
          console.log('✅ LTV ratios loaded from database:', data.data)
        } else {
          console.warn('⚠️ Using fallback LTV ratios:', data.data)
          setLtvRatios(data.data) // Use fallback values from API error response
        }
      } catch (error) {
        console.error('❌ Error fetching LTV ratios, using defaults:', error)
      }
    }

    fetchCities()
    fetchLtvRatios()
  }, [i18n.language])

  // Use useMemo to ensure dropdown options update when translations change
  const WhenDoYouNeedMoneyOptions = useMemo(() => [
    { value: '1', label: t('calculate_mortgage_when_options_1') },
    { value: '2', label: t('calculate_mortgage_when_options_2') },
    { value: '3', label: t('calculate_mortgage_when_options_3') },
    { value: '4', label: t('calculate_mortgage_when_options_4') },
  ], [t])

  const TypeSelectOptions = useMemo(() => [
    { value: '1', label: t('calculate_mortgage_type_options_1') },
    { value: '2', label: t('calculate_mortgage_type_options_2') },
    { value: '3', label: t('calculate_mortgage_type_options_3') },
    { value: '4', label: t('calculate_mortgage_type_options_4') },
  ], [t])

  const WillBeYourFirstOptions = useMemo(() => [
    { value: '1', label: t('calculate_mortgage_first_options_1') },
    { value: '2', label: t('calculate_mortgage_first_options_2') },
    { value: '3', label: t('calculate_mortgage_first_options_3') },
  ], [t])

  // Property Ownership Options (Confluence Action #12 - affects LTV ratios 75%/50%/70%)
  const PropertyOwnershipOptions = useMemo(() => [
    { value: 'no_property', label: t('calculate_mortgage_property_ownership_option_1') },      // 75% financing
    { value: 'has_property', label: t('calculate_mortgage_property_ownership_option_2') },     // 50% financing  
    { value: 'selling_property', label: t('calculate_mortgage_property_ownership_option_3') }, // 70% financing
  ], [t])

  const { setFieldValue, values, errors, touched, setFieldTouched } =
    useFormikContext<CalculateMortgageTypes>()

  // Calculate maximum loan amount based on property ownership (Confluence Action #12)
  // Now uses database configuration instead of hardcoded values
  const getMaxLoanAmount = (propertyValue: number, propertyOwnership: string): number => {
    if (!propertyValue || propertyValue === 0) return 1
    
    // Use LTV ratios from database configuration
    const ltvRatio = ltvRatios[propertyOwnership] || ltvRatios.no_property || 0.75
    return propertyValue * ltvRatio
  }

  // Calculate minimum initial payment based on property ownership
  const getMinInitialPayment = (propertyValue: number, propertyOwnership: string): number => {
    if (!propertyValue || propertyValue === 0) return 0
    
    const maxLoanAmount = getMaxLoanAmount(propertyValue, propertyOwnership)
    return propertyValue - maxLoanAmount // Minimum down payment = property value - max loan
  }

  // Auto-adjust initial payment when property ownership changes (real-time financing update)
  useEffect(() => {
    if (values.propertyOwnership && values.priceOfEstate) {
      const minPayment = getMinInitialPayment(values.priceOfEstate, values.propertyOwnership)
      const maxPayment = values.priceOfEstate
      
      // If current initial payment is below the new minimum, set it to minimum
      if (values.initialFee < minPayment) {
        console.log(`[PROPERTY-OWNERSHIP] Adjusting initial payment from ${values.initialFee} to ${minPayment} (min for ${values.propertyOwnership})`)
        setFieldValue('initialFee', minPayment)
      }
      // If current initial payment is above maximum, set it to maximum
      else if (values.initialFee > maxPayment) {
        console.log(`[PROPERTY-OWNERSHIP] Adjusting initial payment from ${values.initialFee} to ${maxPayment} (max)`)
        setFieldValue('initialFee', maxPayment)
      }
    }
  }, [values.propertyOwnership, values.priceOfEstate, values.initialFee, setFieldValue])

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
              min={getMinInitialPayment(values.priceOfEstate, values.propertyOwnership)}
              max={values.priceOfEstate || 1}
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

        <Row>
          <Column>
            <DropdownMenu
              title={t('calculate_mortgage_property_ownership')}
              data={PropertyOwnershipOptions}
              placeholder={t('calculate_mortgage_property_ownership_ph')}
              value={values.propertyOwnership}
              onChange={(value) => setFieldValue('propertyOwnership', value)}
              onBlur={() => setFieldTouched('propertyOwnership', true)}
              error={touched.propertyOwnership && errors.propertyOwnership}
            />
          </Column>
          <Column />
          <Column />
        </Row>

        <Divider />
        <CreditParams />
      </FormContainer>
    </>
  )
}

export default FirstStepForm
