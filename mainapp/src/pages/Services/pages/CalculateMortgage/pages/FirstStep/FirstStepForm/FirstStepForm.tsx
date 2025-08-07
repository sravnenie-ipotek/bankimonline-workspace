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
import { useContentApi } from '@src/hooks/useContentApi'
import { useAllDropdowns } from '@src/hooks/useDropdownData'
import { calculationService } from '@src/services/calculationService'

interface CityOption {
  value: string
  label: string
}

const FirstStepForm = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step1')
  const dispatch = useAppDispatch()

  // Phase 4: Use bulk dropdown fetching for better performance
  const { data: dropdownData, loading: dropdownsLoading, error: dropdownsError, getDropdownProps } = useAllDropdowns('mortgage_step1')

  const [cityOptions, setCityOptions] = useState<CityOption[]>([])
  const [ltvRatios, setLtvRatios] = useState<{[key: string]: number}>({})
  const [isLoadingLtvRatios, setIsLoadingLtvRatios] = useState(true)

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

    // Fetch property ownership LTV ratios from database using new calculation parameters API
    const fetchLtvRatios = async () => {
      try {
        setIsLoadingLtvRatios(true)
        const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? '/api' 
          : import.meta.env.VITE_NODE_API_BASE_URL || 'https://bankdev2standalone-production.up.railway.app/api'
        const response = await fetch(`${apiBaseUrl}/v1/calculation-parameters?business_path=mortgage`)
        const data = await response.json()
        
        if (data.status === 'success' && data.data.property_ownership_ltvs) {
          // Convert the new API format to the expected format
          const ltvData: {[key: string]: number} = {}
          Object.keys(data.data.property_ownership_ltvs).forEach(key => {
            ltvData[key] = data.data.property_ownership_ltvs[key].ltv / 100 // Convert percentage to ratio
          })
          setLtvRatios(ltvData)
          console.info('✅ LTV ratios loaded from database:', ltvData)
        } else if (data.status === 'error' && data.data?.property_ownership_ltvs) {
          // Use fallback values from API if database is down
          const ltvData: {[key: string]: number} = {}
          Object.keys(data.data.property_ownership_ltvs).forEach(key => {
            ltvData[key] = data.data.property_ownership_ltvs[key].ltv / 100
          })
          setLtvRatios(ltvData)
          console.info('📋 Using fallback LTV ratios (database connection issue):', ltvData)
        } else {
          throw new Error('No LTV data in response')
        }
      } catch (error) {
        console.warn('⚠️ Error fetching LTV ratios from calculation parameters API:', error.message)
        // Last resort fallback - use calculationService fallback values
        console.info('📋 Using calculationService fallback values')
        try {
          const params = await calculationService.getAllParameters('mortgage')
          setLtvRatios({
            no_property: params.property_ownership_ltvs?.no_property?.ltv / 100 || 0.75,
            has_property: params.property_ownership_ltvs?.has_property?.ltv / 100 || 0.50,
            selling_property: params.property_ownership_ltvs?.selling_property?.ltv / 100 || 0.70
          })
        } catch (serviceError) {
          console.warn('🚨 CRITICAL: Even calculationService failed, using hardcoded emergency values')
          setLtvRatios({
            no_property: 0.75,
            has_property: 0.50,
            selling_property: 0.70
          })
        }
      } finally {
        setIsLoadingLtvRatios(false)
      }
    }

    fetchCities()
    fetchLtvRatios()
  }, [i18n.language])

  // Phase 4: Get dropdown data from database instead of hardcoded arrays
  // Fixed: Use correct API keys that match the backend response
  const whenNeededProps = getDropdownProps('when')  // API key: mortgage_step1_when
  const typeProps = getDropdownProps('type')        // API key: mortgage_step1_type ✅ (already works)
  const firstHomeProps = getDropdownProps('first')  // API key: mortgage_step1_first  
  const propertyOwnershipProps = getDropdownProps('property_ownership')

  // Phase 4: Show loading state for dropdowns while fetching from API
  if (dropdownsLoading) {
    console.log('🔄 Loading dropdown data for mortgage_step1...')
  }

  // Phase 4: Log dropdown data for debugging
  if (dropdownData && !dropdownsLoading) {
    console.log('✅ Dropdown data loaded for mortgage_step1:', {
      whenNeeded: whenNeededProps.options.length,
      type: typeProps.options.length,
      firstHome: firstHomeProps.options.length,
      propertyOwnership: propertyOwnershipProps.options.length
    })
  }

  const { setFieldValue, values, errors, touched, setFieldTouched } =
    useFormikContext<CalculateMortgageTypes>()

  // Calculate maximum loan amount based on property ownership (Confluence Action #12)
  // Now uses database configuration instead of hardcoded values
  const getMaxLoanAmount = (propertyValue: number, propertyOwnership: string): number => {
    if (!propertyValue || propertyValue === 0) return 1
    
    // Use LTV ratios from database configuration (fallback to no_property, then emergency default)
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
        <FormCaption title={getContent('mortgage_step1.header.title', 'calculate_mortgage_title')} />
        <Row>
          <Column>
            <FormattedInput
              handleChange={(value) => {
                dispatch(setActiveField('period'))
                setFieldValue('priceOfEstate', value)
              }}
              name="PriceOfEstate"
              title={getContent('mortgage_step1.field.property_price', 'calculate_mortgage_price')}
              value={values.priceOfEstate}
              placeholder="1,000,000"
              error={errors.priceOfEstate}
              data-testid="property-price-input"
            />
            {errors.priceOfEstate && <Error error={errors.priceOfEstate} />}
          </Column>
          <Column>
            <DropdownMenu
              title={getContent('mortgage_step1.field.city', 'calculate_mortgage_city')}
              data={cityOptions}
              placeholder={getContent('mortgage_step1.field.city_ph', 'Select city')}
              value={values.cityWhereYouBuy}
              onChange={(value) => setFieldValue('cityWhereYouBuy', value)}
              onBlur={() => setFieldTouched('cityWhereYouBuy', true)}
              searchable
              searchPlaceholder={getContent('mortgage_step1.field.search_ph', 'Search...')}
              nothingFoundText={getContent('mortgage_step1.field.nothing_found', 'Nothing found')}
              error={touched.cityWhereYouBuy && errors.cityWhereYouBuy}
              dataTestId="city-dropdown"
            />
          </Column>
          <Column>
            <DropdownMenu
              title={whenNeededProps.label || getContent('mortgage_step1.field.when_needed', 'calculate_mortgage_when')}
              data={whenNeededProps.options}
              placeholder={whenNeededProps.placeholder || getContent('mortgage_step1.field.when_needed_ph', 'calculate_mortgage_when_options_ph')}
              value={values.whenDoYouNeedMoney}
              onChange={(value) => setFieldValue('whenDoYouNeedMoney', value)}
              onBlur={() => setFieldTouched('whenDoYouNeedMoney', true)}
              error={touched.whenDoYouNeedMoney && errors.whenDoYouNeedMoney}
              dataTestId="when-needed-dropdown"
              disabled={dropdownsLoading}
            />
            {dropdownsError && (
              <Error error={getContent('error_dropdown_load_failed', 'Failed to load options. Please refresh the page.')} />
            )}
          </Column>
        </Row>

        <Row>
          <Column>
            <SliderInput
              name="InitialFee"
              value={values.initialFee}
              min={getMinInitialPayment(values.priceOfEstate, values.propertyOwnership)}
              max={values.priceOfEstate || 1}
              title={getContent('mortgage_step1.field.initial_fee', 'calculate_mortgage_initial_fee')}
              handleChange={(value) => {
                dispatch(setActiveField('period'))
                setFieldValue('initialFee', value)
              }}
              tooltip={getContent('mortgage_step1.field.initial_payment_tooltip', 'Minimum down payment depends on property ownership status')}
              error={errors.initialFee}
              disableRangeValues
              data-testid="initial-fee-input"
            />
            <InitialFeeContext />
            {errors.initialFee && <Error error={errors.initialFee} />}
          </Column>
          <Column>
            <DropdownMenu
              title={typeProps.label || getContent('mortgage_step1.field.type', 'calculate_mortgage_type')}
              data={typeProps.options}
              placeholder={typeProps.placeholder || getContent('mortgage_step1.field.type_ph', 'calculate_mortgage_type_ph')}
              value={values.typeSelect}
              onChange={(value) => setFieldValue('typeSelect', value)}
              onBlur={() => setFieldTouched('typeSelect', true)}
              error={touched.typeSelect && errors.typeSelect}
              dataTestId="property-type-dropdown"
              disabled={dropdownsLoading}
            />
            {dropdownsError && (
              <Error error={getContent('error_dropdown_load_failed', 'Failed to load type options. Please refresh the page.')} />
            )}
          </Column>
          <Column>
            <DropdownMenu
              title={firstHomeProps.label || getContent('mortgage_step1.field.first_home', 'calculate_mortgage_first')}
              data={firstHomeProps.options}
              placeholder={firstHomeProps.placeholder || getContent('mortgage_step1.field.first_home_ph', 'calculate_mortgage_first_ph')}
              value={values.willBeYourFirst}
              onChange={(value) => setFieldValue('willBeYourFirst', value)}
              onBlur={() => setFieldTouched('willBeYourFirst', true)}
              error={touched.willBeYourFirst && errors.willBeYourFirst}
              dataTestId="first-home-dropdown"
              disabled={dropdownsLoading}
            />
            {dropdownsError && (
              <Error error={getContent('error_dropdown_load_failed', 'Failed to load first home options. Please refresh the page.')} />
            )}
          </Column>
        </Row>

        <Row>
          <Column>
            <DropdownMenu
              title={propertyOwnershipProps.label || getContent('mortgage_step1.field.property_ownership', 'calculate_mortgage_property_ownership')}
              data={propertyOwnershipProps.options}
              placeholder={propertyOwnershipProps.placeholder || getContent('mortgage_step1.field.property_ownership_ph', 'calculate_mortgage_property_ownership_ph')}
              value={values.propertyOwnership}
              onChange={(value) => setFieldValue('propertyOwnership', value)}
              onBlur={() => setFieldTouched('propertyOwnership', true)}
              error={touched.propertyOwnership && errors.propertyOwnership}
              dataTestId="property-ownership-dropdown"
              disabled={dropdownsLoading}
            />
            {dropdownsError && (
              <Error error={getContent('error_dropdown_load_failed', 'Failed to load property ownership options. Please refresh the page.')} />
            )}
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
