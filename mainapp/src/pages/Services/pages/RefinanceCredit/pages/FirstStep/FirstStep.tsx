import { Form, Formik } from 'formik'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'

import { Container } from '@components/ui/Container'
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { openLoginModal } from '@src/pages/Services/slices/modalSlice'
import {
  fetchRefinanceCredit,
  updateRefinanceCreditData,
} from '@src/pages/Services/slices/refinanceCredit'

import { SingleButton } from '../../../../components/SingleButton'
import { LoginModal } from '../../../Modals/LoginModal'
import FirstStepForm from './FirstStepForm/FirstStepForm'

export const validationSchema = Yup.object().shape({
  refinancingCredit: Yup.string().required(i18next.t('error_select_answer')),
  period: Yup.number()
    .min(4, i18next.t('error_min_period'))
    .max(30, i18next.t('error_max_period'))
    .required(i18next.t('error_required_to_fill_out')),
  monthlyPayment: Yup.number().required(
    i18next.t('error_required_to_fill_out')
  ),
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
      endDate: Yup.string().required(i18next.t('error_credit_end_date_required')),
      earlyRepayment: Yup.number().when(['../refinancingCredit'], {
        is: (refinancingCredit: string) => refinancingCredit && refinancingCredit !== 'option_3',
        then: (schema) => schema.positive(i18next.t('error_credit_early_payment_positive')).required(i18next.t('error_credit_early_payment_required')),
        otherwise: (schema) => schema.nullable()
      })
    })
  ).min(1, i18next.t('error_credit_data_required')),
})

const FirstStep = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const savedValue = useAppSelector((state) => state.refinanceCredit)

  const isLogin = useAppSelector((state) => state.login.isLogin)

  const initialValues = {
    refinancingCredit: savedValue.refinancingCredit || '',
    period: savedValue.period || 30,
    monthlyPayment: savedValue.monthlyPayment || 1000000,
    creditData: savedValue.creditData || [
      {
        id: 1,
        bank: '',
        amount: null,
        monthlyPayment: '',
        startDate: '',
        endDate: '',
        earlyRepayment: '',
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
          {
            isLogin
              ? navigate('/services/refinance-credit/2')
              : dispatch(openLoginModal())
          }
        }}
      >
        <Form>
          <Container>
            <VideoPoster
              title={t('credit_refinance_title')}
              text={t('calculate_mortgage_banner_subtext')}
              size="small"
            />
            <FirstStepForm />
          </Container>
          <SingleButton showValidationHints={true} />
        </Form>
      </Formik>
      <LoginModal />
    </>
  )
}

export default FirstStep
