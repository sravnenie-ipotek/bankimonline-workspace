import { Form, Formik } from 'formik'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

import { Container } from '@components/ui/Container'
import { VideoPoster } from '@src/components/ui/VideoPoster'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { openLoginModal } from '@src/pages/Services/slices/modalSlice'
import { updateCreditData } from '@src/pages/Services/slices/calculateCreditSlice'
import AuthModal from '@src/pages/AuthModal/AuthModal'
import MortgagePhoneVerificationModal from '../../../CalculateMortgage/pages/FirstStep/MortgagePhoneVerificationModal'

import { SingleButton } from '../../../../components/SingleButton'
import { FirstStepForm } from './FirstStepForm/FirstStepForm'

// Dynamic validation schema that gets validation errors from database at runtime
export const getValidationSchema = () => Yup.object().shape({
  purposeOfLoan: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  loanAmount: Yup.number()
    .when('purposeOfLoan', {
      is: 'option_6', // Use option value instead of translation
      then: (shema) =>
        shema.max(
          1000000,
          getValidationErrorSync('error_loan_of_amount_credit_max_1000000', 'Maximum loan amount is 1,000,000 NIS')
        ),
      otherwise: (shema) =>
        shema.max(200000, getValidationErrorSync('error_loan_of_amount_credit_max_200000', 'Maximum loan amount is 200,000 NIS')),
    })
    .required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
  whenDoYouNeedMoney: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  loanDeferral: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  priceOfEstate: Yup.number().when('purposeOfLoan', {
    is: 'option_2',
    then: (schema) => schema.required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
    otherwise: (schema) => schema.notRequired(),
  }),
  cityWhereYouBuy: Yup.string().when('purposeOfLoan', {
    is: 'option_2',
    then: (schema) => schema.required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
    otherwise: (schema) => schema.notRequired(),
  }),
  haveMortgage: Yup.string().when('purposeOfLoan', {
    is: 'option_2',
    then: (schema) => schema.required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
    otherwise: (schema) => schema.notRequired(),
  }),
  period: Yup.number()
    .min(1, getValidationErrorSync('error_min_credit_period', 'Minimum period is 1 year'))
    .max(30, getValidationErrorSync('error_max_credit_period', 'Maximum period is 30 years'))
    .required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
  monthlyPayment: Yup.number().required(
    getValidationErrorSync('error_required_to_fill_out', 'This field is required')
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
        validationSchema={getValidationSchema()}
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
            dispatch(openLoginModal())
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
      <MortgagePhoneVerificationModal />
      <AuthModal />
    </>
  )
}

export default FirstStep
