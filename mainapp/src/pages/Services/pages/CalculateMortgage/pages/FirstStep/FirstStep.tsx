import { Form, Formik } from 'formik'
import i18next from 'i18next'
import { getValidationErrorSync, preloadValidationErrors } from '@src/utils/validationHelpers'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'
import { useEffect } from 'react'

import { Container } from '@src/components/ui/Container'
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { useContentApi } from '@src/hooks/useContentApi'
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice.ts'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { openLoginModal } from '@src/pages/Services/slices/modalSlice'
import AuthModal from '@src/pages/AuthModal/AuthModal'
import MortgagePhoneVerificationModal from './MortgagePhoneVerificationModal'

import { SingleButton } from '../../../../components/SingleButton'
import FirstStepForm from './FirstStepForm/FirstStepForm'

export const validationSchema = Yup.object().shape({
  priceOfEstate: Yup.number()
    .max(10000000, getValidationErrorSync('error_max_price', 'Maximum property value is 10,000,000 NIS'))
    .required(getValidationErrorSync('error_property_value_required', 'Property value is required')),
  cityWhereYouBuy: Yup.string().required(getValidationErrorSync('error_city_required', 'City is required')),
  whenDoYouNeedMoney: Yup.string().required(getValidationErrorSync('error_when_need_mortgage', 'Please specify when you need the mortgage')),
  initialFee: Yup.number()
    .test(
      'initial-payment-percentage',
      getValidationErrorSync('error_initial_fee', 'Initial payment cannot exceed 75% of property value'),
      function (value) {
        const priceOfEstate: number = this.parent.priceOfEstate || 0
        return validateInitialPayment(priceOfEstate, value)
      }
    )
    .required(getValidationErrorSync('error_initial_payment_required', 'Initial payment is required')),
  typeSelect: Yup.string().required(getValidationErrorSync('error_mortgage_type_required', 'Mortgage type is required')),
  willBeYourFirst: Yup.string().required(getValidationErrorSync('error_first_home_required', 'Please specify if this is your first home')),
  propertyOwnership: Yup.string().required(getValidationErrorSync('error_property_ownership_required', 'Property ownership status is required')),
  period: Yup.number()
    .min(4, getValidationErrorSync('error_min_period', 'Minimum period is 4 years'))
    .max(30, getValidationErrorSync('error_max_period', 'Maximum period is 30 years'))
    .required(getValidationErrorSync('error_period_required', 'Mortgage period is required')),
  monthlyPayment: Yup.number()
    .min(
      2654,
      getValidationErrorSync('error_min_monthly_payment', 'Minimum monthly payment is 2,664 NIS')
    )
    .required(getValidationErrorSync('error_monthly_payment_required', 'Monthly payment is required')),
})

export function validateInitialPayment(priceOfEstate: number, value?: number) {
  const minInitialPayment = priceOfEstate * 0.25

  if (typeof value === 'undefined') {
    return false
  }

  return value >= minInitialPayment
}

const FirstStep = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step1')
  const dispatch = useAppDispatch()

  const navigate = useNavigate()

  const savedValue = useAppSelector((state) => state.mortgage)

  const isLogin = useAppSelector((state) => state.login.isLogin)

  // Preload validation errors when component mounts
  useEffect(() => {
    preloadValidationErrors()
  }, [])

  const initialValues = {
    priceOfEstate: savedValue.priceOfEstate || 1000000,
    cityWhereYouBuy: savedValue.cityWhereYouBuy || '',
    whenDoYouNeedMoney: savedValue.whenDoYouNeedMoney || '',
    initialFee: savedValue.initialFee || 500000,
    typeSelect: savedValue.typeSelect || '',
    willBeYourFirst: savedValue.willBeYourFirst || '',
    propertyOwnership: savedValue.propertyOwnership || '', // Property ownership affecting LTV (Confluence Action #12)
    period: savedValue.period || 4,
    monthlyPayment: savedValue.monthlyPayment || 11514,
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateMortgageData(values))
          if (isLogin) {
            navigate('/services/calculate-mortgage/2')
          } else {
            dispatch(openLoginModal())
            dispatch(setActiveModal('phoneVerification'))
          }
        }}
      >
        <Form>
          <Container>
            <VideoPoster
              title={getContent('video_calculate_mortgage_title', 'video_calculate_mortgage_title')}
              text={getContent('show_offers', 'show_offers')}
              size="small"
            />
            <FirstStepForm />
          </Container>
          <SingleButton />
        </Form>
      </Formik>
      <MortgagePhoneVerificationModal />
      <AuthModal />
    </>
  )
}

export default FirstStep
