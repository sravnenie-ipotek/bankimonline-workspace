import { Form, Formik } from 'formik'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'

import { Container } from '@components/ui/Container'
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import {
  fetchRefinanceCredit,
  updateRefinanceCreditData,
} from '@src/pages/Services/slices/refinanceCredit'

import { SingleButton } from '../../../../components/SingleButton'
import MortgagePhoneVerificationModal from '../../../CalculateMortgage/pages/FirstStep/MortgagePhoneVerificationModal'
import FirstStepForm from './FirstStepForm/FirstStepForm'

export const validationSchema = Yup.object().shape({
  refinancingCredit: Yup.string().required(i18next.t('error_select_answer')),
  // option_3: Increase term to reduce payment - requires desired monthly payment
  desiredMonthlyPayment: Yup.number()
    .positive(i18next.t('error_credit_payment_positive'))
    .when('refinancingCredit', {
      is: 'option_3',
      then: (schema) => schema.required(i18next.t('error_required_to_fill_out')),
      otherwise: (schema) => schema.notRequired(),
    }),
  // option_4: Increase payment to reduce term - requires desired term
  desiredTerm: Yup.number()
    .min(4, i18next.t('error_min_period'))
    .max(30, i18next.t('error_max_period'))
    .when('refinancingCredit', {
      is: 'option_4',
      then: (schema) => schema.required(i18next.t('error_required_to_fill_out')),
      otherwise: (schema) => schema.notRequired(),
    }),
  period: Yup.number()
    .min(4, i18next.t('error_min_period'))
    .max(30, i18next.t('error_max_period'))
    .notRequired(),
  monthlyPayment: Yup.number()
    .notRequired(),
  creditData: Yup.array().of(
    Yup.object().shape({
      bank: Yup.string().required(i18next.t('error_credit_bank_required')),
      amount: Yup.number()
        .positive(i18next.t('error_credit_amount_positive'))
        .required(i18next.t('error_credit_amount_required')),
      monthlyPayment: Yup.number()
        .positive(i18next.t('error_credit_payment_positive'))
        .required(i18next.t('error_credit_payment_required')),
      startDate: Yup.string().required(i18next.t('error_credit_start_date_required')),
      endDate: Yup.string()
        .required(i18next.t('error_credit_end_date_required'))
        .test('end-date-after-start', i18next.t('error_credit_end_date_validation'), function(value) {
          const { startDate } = this.parent;
          if (!value || !startDate) return true;
          return new Date(value) > new Date(startDate);
        }),
      earlyRepayment: Yup.number()
        .positive(i18next.t('error_credit_early_payment_positive'))
        .nullable()
        .notRequired(),
    })
  ).min(1, i18next.t('error_credit_data_required')),
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
        validationSchema={validationSchema}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateRefinanceCreditData(values))
          dispatch(fetchRefinanceCredit({ data: values }))
          isLogin
            ? navigate('/services/refinance-credit/2')
            : dispatch(setActiveModal('phoneVerification'))
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
    </>
  )
}

export default FirstStep
