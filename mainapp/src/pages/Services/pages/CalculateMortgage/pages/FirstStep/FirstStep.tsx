import { Form, Formik } from 'formik'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'

import { Container } from '@src/components/ui/Container'
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice.ts'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { openLoginModal } from '@src/pages/Services/slices/modalSlice'
import AuthModal from '@src/pages/AuthModal/AuthModal'

import { SingleButton } from '../../../../components/SingleButton'
import MortgagePhoneVerificationModal from './MortgagePhoneVerificationModal'
import FirstStepForm from './FirstStepForm/FirstStepForm'

export const validationSchema = Yup.object().shape({
  priceOfEstate: Yup.number()
    .max(10000000, i18next.t('error_max_price'))
    .required(i18next.t('error_property_value_required')),
  cityWhereYouBuy: Yup.string().required(i18next.t('error_city_required')),
  whenDoYouNeedMoney: Yup.string().required(i18next.t('error_when_need_mortgage')),
  initialFee: Yup.number()
    .test(
      'initial-payment-percentage',
      i18next.t('error_initial_fee'),
      function (value) {
        const priceOfEstate: number = this.parent.priceOfEstate || 0
        return validateInitialPayment(priceOfEstate, value)
      }
    )
    .required(i18next.t('error_initial_payment_required')),
  typeSelect: Yup.string().required(i18next.t('error_mortgage_type_required')),
  willBeYourFirst: Yup.string().required(i18next.t('error_first_home_required')),
  period: Yup.number()
    .min(4, i18next.t('error_min_period'))
    .max(30, i18next.t('error_max_period'))
    .required(i18next.t('error_period_required')),
  monthlyPayment: Yup.number()
    .min(
      2654,
      i18next.t('error_min_monthly_payment')
    )
    .required(i18next.t('error_monthly_payment_required')),
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
              title={t('video_calculate_mortgage_title')}
              text={t('show_offers')}
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
