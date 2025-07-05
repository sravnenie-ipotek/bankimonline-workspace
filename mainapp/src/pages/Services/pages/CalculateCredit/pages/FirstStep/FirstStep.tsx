import { Form, Formik } from 'formik'
import i18next from 'i18next'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'

import { Container } from '@components/ui/Container'
import { VideoPoster } from '@src/components/ui/VideoPoster'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { openAuthModal } from '@src/pages/Services/slices/modalSlice'
import { updateCreditData } from '@src/pages/Services/slices/calculateCreditSlice'
import AuthModal from '@src/pages/AuthModal/AuthModal'

import { SingleButton } from '../../../../components/SingleButton'
import { FirstStepForm } from './FirstStepForm/FirstStepForm'

export const validationSchema = Yup.object().shape({
  purposeOfLoan: Yup.string().required(i18next.t('error_select_answer')),
  loanAmount: Yup.number()
    .when('purposeOfLoan', {
      is: i18next.t('calculate_credit_target_option_6'),
      then: (shema) =>
        shema.max(
          1000000,
          i18next.t('error_loan_of_amount_credit_max_1000000')
        ),
      otherwise: (shema) =>
        shema.max(200000, i18next.t('error_loan_of_amount_credit_max_200000')),
    })
    .required(i18next.t('error_required_to_fill_out')),
  whenDoYouNeedMoney: Yup.string().required(i18next.t('error_select_answer')),
  loanDeferral: Yup.string().required(i18next.t('error_select_answer')),
  priceOfEstate: Yup.number().when('purposeOfLoan', {
    is: 'option_2',
    then: (schema) => schema.required(i18next.t('error_required_to_fill_out')),
    otherwise: (schema) => schema.notRequired(),
  }),
  cityWhereYouBuy: Yup.string().when('purposeOfLoan', {
    is: 'option_2',
    then: (schema) => schema.required(i18next.t('error_select_answer')),
    otherwise: (schema) => schema.notRequired(),
  }),
  haveMortgage: Yup.string().when('purposeOfLoan', {
    is: 'option_2',
    then: (schema) => schema.required(i18next.t('error_select_answer')),
    otherwise: (schema) => schema.notRequired(),
  }),
  period: Yup.number()
    .min(1, i18next.t('error_min__credit_period'))
    .max(30, i18next.t('error_max_credit_period'))
    .required(i18next.t('error_required_to_fill_out')),
  monthlyPayment: Yup.number().required(
    i18next.t('error_required_to_fill_out')
  ),
})

const FirstStep: FC = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()

  const navigate = useNavigate()

  const savedValue = useAppSelector((state) => state.credit)
  const isLogin = useAppSelector((state) => state.login.isLogin)

  const initialValues = {
    purposeOfLoan: savedValue.purposeOfLoan || '',
    loanAmount: savedValue.loanAmount || 200000,
    whenDoYouNeedMoney: savedValue.whenDoYouNeedMoney || '',
    loanDeferral: savedValue.loanDeferral || '',
    priceOfEstate: savedValue.priceOfEstate || null,
    cityWhereYouBuy: savedValue.cityWhereYouBuy || '',
    haveMortgage: savedValue.haveMortgage || null,
    period: savedValue.period || 30,
    monthlyPayment: savedValue.monthlyPayment || 5368,
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateCreditData(values))
          if (isLogin) {
            // Business logic: If house renovation and has mortgage, route to refinance mortgage
            if (values.purposeOfLoan === 'option_2' && values.haveMortgage === 'yes') {
              navigate('/services/refinance-mortgage/1')
            } else {
              // Continue with standard credit flow
              navigate('/services/calculate-credit/2')
            }
          } else {
            dispatch(openAuthModal())
            dispatch(setActiveModal('phoneVerification'))
          }
        }}
      >
        <Form>
          <Container>
            <VideoPoster
              title={t('sidebar_sub_calculate_credit')}
              text={t('calculate_mortgage_banner_subtext')}
              size="small"
            />
            <FirstStepForm />
          </Container>
          <SingleButton />
        </Form>
      </Formik>
      <AuthModal />
    </>
  )
}

export default FirstStep
