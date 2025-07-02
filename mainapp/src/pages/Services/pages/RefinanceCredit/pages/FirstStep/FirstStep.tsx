import { Form, Formik } from 'formik'
import i18next from 'i18next'
import { useState } from 'react'
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
      endDate: Yup.string()
        .required(i18next.t('error_credit_end_date_required'))
        .test('end-date-after-start', i18next.t('error_credit_end_date_validation'), function(value) {
          const { startDate } = this.parent;
          if (!value || !startDate) return true;
          return new Date(value) > new Date(startDate);
        }),
      earlyRepayment: Yup.number().when('$refinancingCredit', {
        is: (value: string) => value === 'option_2' || value === 'option_4',
        then: (schema) => schema
          .positive(i18next.t('error_credit_early_payment_positive'))
          .required(i18next.t('error_credit_early_payment_required')),
        otherwise: (schema) => schema.notRequired(),
      }),
    })
  ).min(1, i18next.t('error_credit_data_required')),
})

const FirstStep = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const savedValue = useAppSelector((state) => state.refinanceCredit)
  const isLogin = useAppSelector((state) => state.login.isLogin)
  
  const [refinancingCredit, setRefinancingCredit] = useState(savedValue.refinancingCredit || '')

  // Get tomorrow's date for default end date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowString = tomorrow.toISOString().split('T')[0]

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
        endDate: tomorrowString,
        earlyRepayment: null,
      },
    ],
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validationContext={{ refinancingCredit }}
        enableReinitialize={true}
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
        {({ values, setFieldValue }) => {
          // Update refinancing credit state when form value changes
          if (values.refinancingCredit !== refinancingCredit) {
            setRefinancingCredit(values.refinancingCredit)
          }
          
          return (
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
          )
        }}
      </Formik>
      <LoginModal />
    </>
  )
}

export default FirstStep
