import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useEffect, useState, useRef } from 'react'

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
import { getApiBaseUrl } from '@src/utils/environment'
import { fetchJsonWithFallback } from '@src/utils/apiWithFallback'
import { FALLBACK_LTV_RATIOS, FALLBACK_CITIES } from '@src/config/fallbackDefaults'

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
        const data = await fetchJsonWithFallback(
          `/api/get-cities?lang=${i18n.language}`,
          {
            fallbackData: {
              status: 'fallback',
              data: FALLBACK_CITIES
            },
            onRetry: (attempt, error) => {
              console.warn(`Retrying city fetch (attempt ${attempt}):`, error.message)
            }
          }
        )
        
        if (data.status === 'success' || data.status === 'fallback') {
          const cities = data.status === 'fallback' ? data.data : data.data.map((city: any) => ({
            value: city.value,
            label: city.name,
          }))
          setCityOptions(cities)
          
          if (data.status === 'fallback') {
            console.info('Using fallback city list due to API unavailability')
          }
        } else {
          console.error('Failed to fetch cities:', data.message)
          // Use fallback cities anyway
          setCityOptions(FALLBACK_CITIES)
        }
      } catch (error) {
        console.error('Error fetching cities:', error)
        // Use fallback cities on error
        setCityOptions(FALLBACK_CITIES)
      }
    }

    // Fetch property ownership LTV ratios from database using new calculation parameters API
    const fetchLtvRatios = async () => {
      try {
        setIsLoadingLtvRatios(true)
        const apiBaseUrl = getApiBaseUrl()
        
        // Use the new fetch utility with automatic retry and fallback
        const data = await fetchJsonWithFallback(
          `${apiBaseUrl}/v1/calculation-parameters?business_path=mortgage`,
          {
            fallbackData: {
              status: 'fallback',
              data: {
                property_ownership_ltvs: {
                  no_property: { ltv: 75, min_down_payment: 25 },
                  has_property: { ltv: 50, min_down_payment: 50 },
                  selling_property: { ltv: 70, min_down_payment: 30 }
                },
                current_interest_rate: 5.0,
                is_fallback: true
              }
            },
            onRetry: (attempt, error) => {
              console.warn(`Retrying LTV fetch (attempt ${attempt}):`, error.message)
            }
          }
        )
        
        if ((data.status === 'success' || data.status === 'fallback') && data.data?.property_ownership_ltvs) {
          // Convert the API format to the expected format
          const ltvData: {[key: string]: number} = {}
          Object.keys(data.data.property_ownership_ltvs).forEach(key => {
            ltvData[key] = data.data.property_ownership_ltvs[key].ltv / 100 // Convert percentage to ratio
          })
          setLtvRatios(ltvData)
          
          if (data.status === 'fallback' || data.data.is_fallback) {
            if (process.env.NODE_ENV === 'development') {
            console.info('📋 Using fallback LTV ratios due to database unavailability')
          }
          } else {
            if (process.env.NODE_ENV === 'development') {
            console.info('✅ LTV ratios loaded from database:', ltvData)
          }
          }
        } else {
          // Final fallback to hardcoded values
          console.warn('⚠️ Using hardcoded fallback LTV ratios')
          setLtvRatios(FALLBACK_LTV_RATIOS)
        }
      } catch (error) {
        console.error('🚨 Critical error fetching LTV ratios:', error)
        // Use fallback values on any error
        setLtvRatios(FALLBACK_LTV_RATIOS)
      } finally {
        setIsLoadingLtvRatios(false)
      }
    }

    fetchCities()
    fetchLtvRatios()
  }, [i18n.language])

  // Phase 4: Get dropdown data from database instead of hardcoded arrays
  // Production DB has same schema as Railway (user confirmed)
  const whenNeededProps = getDropdownProps('when_needed')  // API key: mortgage_step1_when_needed
  const typeProps = getDropdownProps('type')               // API key: mortgage_step1_type ✅ (already works)
  const firstHomeProps = getDropdownProps('first_home')    // API key: mortgage_step1_first_home
  const propertyOwnershipProps = getDropdownProps('property_ownership')

  // Fallback data for property ownership dropdown when API is not available
  const propertyOwnershipFallback = [
    { value: 'no_property', label: t('calculate_mortgage_property_ownership_option_1', "I don't own any property") },
    { value: 'has_property', label: t('calculate_mortgage_property_ownership_option_2', "I own a property") },
    { value: 'selling_property', label: t('calculate_mortgage_property_ownership_option_3', "I'm selling a property") }
  ]

  // Debug logging
  console.log('Property ownership dropdown state:', {
    loading: dropdownsLoading,
    error: dropdownsError,
    propsOptions: propertyOwnershipProps.options,
    fallback: propertyOwnershipFallback,
    finalData: propertyOwnershipProps.options.length > 0 ? propertyOwnershipProps.options : propertyOwnershipFallback
  })

  // Phase 4: Show loading state for dropdowns while fetching from API
  if (dropdownsLoading) {
    console.log('Dropdowns still loading...')
    }

  // Phase 4: Log dropdown data for debugging
  if (dropdownData && !dropdownsLoading) {
    console.log('Dropdown data loaded:', dropdownData)
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

  // Track previous values to prevent infinite loops
  const prevPropertyOwnership = useRef(values.propertyOwnership)
  const prevPriceOfEstate = useRef(values.priceOfEstate)
  
  // Auto-adjust initial payment when property ownership or price changes (real-time financing update)
  useEffect(() => {
    // Only update if propertyOwnership or priceOfEstate actually changed
    const propertyOwnershipChanged = prevPropertyOwnership.current !== values.propertyOwnership
    const priceOfEstateChanged = prevPriceOfEstate.current !== values.priceOfEstate
    
    if ((propertyOwnershipChanged || priceOfEstateChanged) && values.propertyOwnership && values.priceOfEstate) {
      const minPayment = getMinInitialPayment(values.priceOfEstate, values.propertyOwnership)
      const maxPayment = values.priceOfEstate
      
      // If current initial payment is below the new minimum, set it to minimum
      if (values.initialFee < minPayment) {
        // Remove console.log in production (Bug #10)
        setFieldValue('initialFee', minPayment)
      }
      // If current initial payment is above maximum, set it to maximum
      else if (values.initialFee > maxPayment) {
        // Remove console.log in production (Bug #10)
        setFieldValue('initialFee', maxPayment)
      }
      
      // Update refs for next comparison
      prevPropertyOwnership.current = values.propertyOwnership
      prevPriceOfEstate.current = values.priceOfEstate
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
              data={propertyOwnershipProps.options.length > 0 ? propertyOwnershipProps.options : propertyOwnershipFallback}
              placeholder={propertyOwnershipProps.placeholder || getContent('mortgage_step1.field.property_ownership_ph', 'calculate_mortgage_property_ownership_ph')}
              value={values.propertyOwnership}
              onChange={(value) => setFieldValue('propertyOwnership', value)}
              onBlur={() => setFieldTouched('propertyOwnership', true)}
              error={touched.propertyOwnership && errors.propertyOwnership}
              dataTestId="property-ownership-dropdown"
              disabled={false}
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
