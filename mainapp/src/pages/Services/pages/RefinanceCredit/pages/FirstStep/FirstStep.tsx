import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

import { Container } from '@components/ui/Container'
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { openLoginModal } from '@src/pages/Services/slices/modalSlice'
import {
  fetchRefinanceCredit,
  updateRefinanceCreditData,
} from '@src/pages/Services/slices/refinanceCredit'
import AuthModal from '@src/pages/AuthModal/AuthModal'
import MortgagePhoneVerificationModal from '../../../CalculateMortgage/pages/FirstStep/MortgagePhoneVerificationModal'

import { SingleButton } from '../../../../components/SingleButton'
import FirstStepForm from './FirstStepForm/FirstStepForm'

// Dynamic validation schema that gets validation errors from database at runtime
export const getValidationSchema = () => Yup.object().shape({
  refinancingCredit: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
  // option_3: Increase term to reduce payment - requires desired monthly payment
  desiredMonthlyPayment: Yup.number()
    .positive(getValidationErrorSync('error_credit_payment_positive', 'Payment must be positive'))
    .when('refinancingCredit', {
      is: 'option_3',
      then: (schema) => schema.required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
      otherwise: (schema) => schema.notRequired(),
    }),
  // option_4: Increase payment to reduce term - requires desired term
  desiredTerm: Yup.number()
    .min(4, getValidationErrorSync('error_min_period', 'Minimum period is 4 years'))
    .max(30, getValidationErrorSync('error_max_period', 'Maximum period is 30 years'))
    .when('refinancingCredit', {
      is: 'option_4',
      then: (schema) => schema.required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
      otherwise: (schema) => schema.notRequired(),
    }),
  period: Yup.number()
    .min(4, getValidationErrorSync('error_min_period', 'Minimum period is 4 years'))
    .max(30, getValidationErrorSync('error_max_period', 'Maximum period is 30 years'))
    .notRequired(),
  monthlyPayment: Yup.number()
    .notRequired(),
  creditData: Yup.array().of(
    Yup.object().shape({
      bank: Yup.string().required(getValidationErrorSync('error_credit_bank_required', 'Bank selection is required')),
      amount: Yup.number()
        .positive(getValidationErrorSync('error_credit_amount_positive', 'Amount must be positive'))
        .required(getValidationErrorSync('error_credit_amount_required', 'Credit amount is required')),
      monthlyPayment: Yup.number()
        .positive(getValidationErrorSync('error_credit_payment_positive', 'Payment must be positive'))
        .required(getValidationErrorSync('error_credit_payment_required', 'Monthly payment is required')),
      startDate: Yup.string().required(getValidationErrorSync('error_credit_start_date_required', 'Start date is required')),
      endDate: Yup.string()
        .required(getValidationErrorSync('error_credit_end_date_required', 'End date is required'))
        .test('end-date-after-start', getValidationErrorSync('error_credit_end_date_validation', 'End date must be after start date'), function(value) {
          const { startDate } = this.parent;
          if (!value || !startDate) return true;
          
          // Both values are now consistently string dates in YYYY-MM-DD format
          return new Date(value) > new Date(startDate);
        }),
      earlyRepayment: Yup.number()
        .positive(getValidationErrorSync('error_credit_early_payment_positive', 'Early payment must be positive'))
        .nullable()
        .notRequired(),
    })
  ).min(1, getValidationErrorSync('error_credit_data_required', 'At least one credit entry is required')),
})

const FirstStep = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const savedValue = useAppSelector((state) => state.refinanceCredit)
  const isLogin = useAppSelector((state) => state.login.isLogin)

  // Get tomorrow's date for default end date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowString = tomorrow.toISOString().split('T')[0]
  
  // Get realistic default dates for credit
  const fiveYearsAgo = new Date()
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
  const fiveYearsAgoString = fiveYearsAgo.toISOString().split('T')[0]
  
  const tenYearsFromNow = new Date()
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10)
  const tenYearsFromNowString = tenYearsFromNow.toISOString().split('T')[0]

  const initialValues = {
    refinancingCredit: savedValue.refinancingCredit || '',
    period: savedValue.period || 30,
    monthlyPayment: savedValue.monthlyPayment || 1000000,
    desiredMonthlyPayment: savedValue.desiredMonthlyPayment || null,
    desiredTerm: savedValue.desiredTerm || null,
    creditData: savedValue.creditData || [
      {
        id: 1,
        bank: 'hapoalim',
        amount: null,
        monthlyPayment: null,
        startDate: fiveYearsAgoString,
        endDate: tenYearsFromNowString,
        earlyRepayment: null,
      },
    ],
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={getValidationSchema()}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateRefinanceCreditData(values))
          dispatch(fetchRefinanceCredit({ data: values }))
          if (isLogin) {
            navigate('/services/refinance-credit/2')
          } else {
            dispatch(openLoginModal())
            dispatch(setActiveModal('phoneVerification'))
          }
        }}
      >
        <Form>
          <Container>
            <VideoPoster
              title={t('credit_refinance_title')}
              text={t('credit_refinance_banner_subtext')}
              size="small"
            />
            <FirstStepForm />
          </Container>
          <SingleButton showValidationHints={true} />
        </Form>
      </Formik>
      <MortgagePhoneVerificationModal />
      <AuthModal />
    </>
  )
}

export default FirstStep
