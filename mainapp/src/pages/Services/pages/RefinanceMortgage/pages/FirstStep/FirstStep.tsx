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
import { updateRefinanceMortgageData } from '@src/pages/Services/slices/refinanceMortgageSlice.ts'
import AuthModal from '@src/pages/AuthModal/AuthModal'
import MortgagePhoneVerificationModal from '../../../CalculateMortgage/pages/FirstStep/MortgagePhoneVerificationModal'

import { SingleButton } from '../../../../components/SingleButton'
import FirstStepForm from './FirstStepForm/FirstStepForm'

// Dynamic validation schema that gets validation errors from database at runtime
export const getValidationSchema = () => Yup.object().shape({
  whyRefinancingMortgage: Yup.string().required(
    getValidationErrorSync('error_refinance_why_required', 'Please specify why you want to refinance')
  ),
  mortgageBalance: Yup.number()
    .test(
      'is-less',
      getValidationErrorSync('error_refinance_balance_greater_than_property', 'Mortgage balance cannot exceed property value'),
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
    .required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
  priceOfEstate: Yup.number()
    .test(
      'is-greater',
      getValidationErrorSync('error_refinance_property_less_than_balance', 'Property value must be at least the mortgage balance'),
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
    .required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
  typeSelect: Yup.string().required(getValidationErrorSync('error_refinance_type_required', 'Property type is required')),
  bank: Yup.string().required(getValidationErrorSync('error_refinance_bank_required', 'Current bank is required')),
  propertyRegistered: Yup.string().required(getValidationErrorSync('error_refinance_registered_required', 'Property registration status is required')),
  startDate: Yup.string().required(getValidationErrorSync('error_refinance_start_date_required', 'Mortgage start date is required')),
  period: Yup.number()
    .min(4, getValidationErrorSync('error_min_period', 'Minimum period is 4 years'))
    .max(30, getValidationErrorSync('error_max_period', 'Maximum period is 30 years'))
    .required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
  monthlyPayment: Yup.number()
    .positive(getValidationErrorSync('error_mortgage_payment_positive', 'Monthly payment must be positive'))
    .required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
  decreaseMortgage: Yup.string().when('whyRefinancingMortgage', {
    is: 'option_2',
    then: (shema) => shema.required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
    otherwise: (shema) => shema.notRequired(),
  }),
  increaseMortgage: Yup.string().when('whyRefinancingMortgage', {
    is: 'option_5',
    then: (shema) => shema.required(getValidationErrorSync('error_required_to_fill_out', 'This field is required')),
    otherwise: (shema) => shema.notRequired(),
  }),
  mortgageData: Yup.array().of(
    Yup.object().shape({
      program: Yup.string().required(getValidationErrorSync('error_mortgage_program_required', 'Mortgage program is required')),
      balance: Yup.number()
        .positive(getValidationErrorSync('error_mortgage_balance_positive', 'Balance must be positive'))
        .required(getValidationErrorSync('error_mortgage_balance_required', 'Mortgage balance is required')),
      endDate: Yup.string().required(getValidationErrorSync('error_mortgage_end_date_required', 'End date is required')),
      bid: Yup.number()
        .positive(getValidationErrorSync('error_mortgage_bid_positive', 'Bid must be positive'))
        .required(getValidationErrorSync('error_mortgage_bid_required', 'Bid is required')),
    })
  ).test(
    'is-balance-sum-equal',
    getValidationErrorSync('error_refinance_mortgage_balance_mismatch', 'Total mortgage balance must match individual balances'),
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
        validationSchema={getValidationSchema()}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateRefinanceMortgageData(values))
          dispatch(openLoginModal())
          dispatch(setActiveModal('phoneVerification'))
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
      <MortgagePhoneVerificationModal />
      <AuthModal />
    </>
  )
}

export default FirstStep
