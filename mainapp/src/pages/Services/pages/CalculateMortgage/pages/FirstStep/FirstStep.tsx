import { Form, Formik } from 'formik'
import i18next from 'i18next'
import { getValidationErrorSync } from '@src/utils/validationHelpers'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'

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

// Dynamic validation schema that gets validation errors at runtime
export const getValidationSchema = () => Yup.object().shape({
  priceOfEstate: Yup.number()
    .max(10000000, getValidationErrorSync('error_max_price', 'ערך הנכס המקסימלי הוא 10,000,000 ש"ח'))
    .required(getValidationErrorSync('error_property_value_required', 'ערך הנכס נדרש')),
  cityWhereYouBuy: Yup.string().required(getValidationErrorSync('error_city_required', 'עיר נדרשת')),
  whenDoYouNeedMoney: Yup.string().required(getValidationErrorSync('error_when_need_mortgage', 'יש לבחור מתי תזדקק למשכנתא')),
  initialFee: Yup.number()
    .test(
      'initial-payment-percentage',
      getValidationErrorSync('error_initial_fee', 'תשלום ראשוני לא יכול לעלות על 75% מערך הנכס'),
      function (value) {
        const priceOfEstate: number = this.parent.priceOfEstate || 0
        return validateInitialPayment(priceOfEstate, value)
      }
    )
    .required(getValidationErrorSync('error_initial_payment_required', 'תשלום ראשוני נדרש')),
  typeSelect: Yup.string().required(getValidationErrorSync('error_mortgage_type_required', 'סוג משכנתה נדרש')),
  willBeYourFirst: Yup.string().required(getValidationErrorSync('error_first_home_required', 'אנא ציין אם זה הבית הראשון שלך')),
  propertyOwnership: Yup.string().required(getValidationErrorSync('error_property_ownership_required', 'סטטוס בעלות על נכס נדרש')),
  period: Yup.number()
    .min(4, getValidationErrorSync('error_min_period', 'תקופה מינימלית היא 4 שנים'))
    .max(30, getValidationErrorSync('error_max_period', 'תקופה מקסימלית היא 30 שנה'))
    .required(getValidationErrorSync('error_period_required', 'תקופת המשכנתה נדרשת')),
  monthlyPayment: Yup.number()
    .min(
      2654,
      getValidationErrorSync('error_min_monthly_payment', 'תשלום חודשי מינימלי הוא 2,664 ש"ח')
    )
    .required(getValidationErrorSync('error_monthly_payment_required', 'תשלום חודשי נדרש')),
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
        validationSchema={getValidationSchema()}
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
