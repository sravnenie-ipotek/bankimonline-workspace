import { Form, Formik } from 'formik'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import * as Yup from 'yup'

import { Container } from '@components/ui/Container'
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { openLoginModal } from '@src/pages/Services/slices/modalSlice'
import { updateRefinanceMortgageData } from '@src/pages/Services/slices/refinanceMortgageSlice.ts'

import { SingleButton } from '../../../../components/SingleButton'
import { LoginModal } from '../../../Modals/LoginModal'
import FirstStepForm from './FirstStepForm/FirstStepForm'

export const validationSchema = Yup.object().shape({
  whyRefinancingMortgage: Yup.string().required(
    i18next.t('error_refinance_why_required')
  ),
  mortgageBalance: Yup.number()
    .test(
      'is-less',
      i18next.t('error_refinance_balance_greater_than_property'),
      function (this: Yup.TestContext, mortgageBalance?: number) {
        const { priceOfEstate } = this.parent

        if (typeof mortgageBalance === 'undefined') {
          return true
        }

        if (typeof priceOfEstate === 'number') {
          return mortgageBalance <= priceOfEstate
        }
        return true
      }
    )
    .required(i18next.t('error_required_to_fill_out')),
  priceOfEstate: Yup.number()
    .test(
      'is-greater',
      i18next.t('error_refinance_property_less_than_balance'),
      function (this: Yup.TestContext, priceOfEstate?: number) {
        const { mortgageBalance } = this.parent

        if (typeof priceOfEstate === 'undefined') {
          return true
        }
        if (typeof mortgageBalance === 'number') {
          return priceOfEstate >= mortgageBalance
        }
        return true
      }
    )
    .required(i18next.t('error_required_to_fill_out')),
  typeSelect: Yup.string().required(i18next.t('error_refinance_type_required')),
  bank: Yup.string().required(i18next.t('error_refinance_bank_required')),
  propertyRegistered: Yup.string().required(i18next.t('error_refinance_registered_required')),
  startDate: Yup.string().required(i18next.t('error_refinance_start_date_required')),
  period: Yup.number()
    .min(4, i18next.t('error_min_period'))
    .max(30, i18next.t('error_max_period'))
    .required(i18next.t('error_required_to_fill_out')),
  monthlyPayment: Yup.number()
    .positive(i18next.t('error_mortgage_payment_positive'))
    .required(i18next.t('error_required_to_fill_out')),
  decreaseMortgage: Yup.string().when('whyRefinancingMortgage', {
    is: i18next.t('calculate_mortgage_type_options_2'),
    then: (shema) => shema.required(i18next.t('error_required_to_fill_out')),
    otherwise: (shema) => shema.notRequired(),
  }),
  increaseMortgage: Yup.string().when('whyRefinancingMortgage', {
    is: i18next.t('calculate_mortgage_type_options_3'),
    then: (shema) => shema.required(i18next.t('error_required_to_fill_out')),
    otherwise: (shema) => shema.notRequired(),
  }),
  mortgageData: Yup.array().of(
    Yup.object().shape({
      program: Yup.string().required(i18next.t('error_mortgage_program_required')),
      balance: Yup.number()
        .positive(i18next.t('error_mortgage_balance_positive'))
        .required(i18next.t('error_mortgage_balance_required')),
      endDate: Yup.string().required(i18next.t('error_mortgage_end_date_required')),
      bid: Yup.number()
        .positive(i18next.t('error_mortgage_bid_positive'))
        .required(i18next.t('error_mortgage_bid_required')),
    })
  ).test(
    'is-balance-sum-equal',
    i18next.t('error_refinance_mortgage_balance_mismatch'),
    function () {
      const totalBalance = this.parent.mortgageData.reduce(
        (sum: number, item: { balance: number }) => sum + (item.balance || 0),
        0
      )

      return totalBalance === this.parent.mortgageBalance
    }
  ),
})

const FirstStep = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const savedValue = useAppSelector((state) => state.refinanceMortgage)
  const isLogin = useAppSelector((state) => state.login.isLogin)

  const initialValues = {
    whyRefinancingMortgage: savedValue.whyRefinancingMortgage || '',
    mortgageBalance: savedValue.mortgageBalance || 200000,
    priceOfEstate: savedValue.priceOfEstate || 1000000,
    typeSelect: savedValue.typeSelect || '',
    bank: savedValue.bank || '',
    startDate: savedValue.startDate || '',
    propertyRegistered: savedValue.propertyRegistered || '',
    period: savedValue.period || 4,
    monthlyPayment: savedValue.monthlyPayment || 4605,
    decreaseMortgage: savedValue.decreaseMortgage || null,
    increaseMortgage: savedValue.increaseMortgage || null,
    mortgageData: savedValue.mortgageData || [
      { id: 1, program: '', balance: null, endDate: '', bid: null },
    ],
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateRefinanceMortgageData(values))
          {
            isLogin
              ? navigate('/services/refinance-mortgage/2')
              : dispatch(openLoginModal())
          }
        }}
      >
        <Form>
          <Container>
            <VideoPoster
              title={t('sidebar_sub_refinance_mortgage')}
              text={t('refinance_mortgage_promo_text')}
              size="small"
            />
            <FirstStepForm />
          </Container>
          <SingleButton />
        </Form>
      </Formik>
      <LoginModal />
    </>
  )
}

export default FirstStep
