import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'
import { FormContainer } from '@components/ui/FormContainer'
import FormattedInput from '@components/ui/FormattedInput/FormattedInput'
import { Row } from '@components/ui/Row'
import { SliderInput } from '@components/ui/SliderInput'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { RefinanceCreditTypes } from '@src/pages/Services/types/formTypes'

import { CreditData } from './ui/CreditData'

const FirstStepForm = () => {
  const { t, i18n } = useTranslation()

  const WhyYouTakeCreditOptions = [
    { value: 'option_1', label: t('calculate_credit_why_option_1') },
    { value: 'option_2', label: t('calculate_credit_why_option_2') },
    { value: 'option_3', label: t('calculate_credit_why_option_3') },
    { value: 'option_4', label: t('calculate_credit_why_option_4') },
  ]

  const { setFieldValue, values, errors, touched, setFieldTouched } =
    useFormikContext<RefinanceCreditTypes>()

  return (
    <FormContainer>
      <FormCaption title={t('credit_refinance_title')} />

      <Row>
        <Column>
          <DropdownMenu
            data={WhyYouTakeCreditOptions}
            title={t('mortgage_credit_why')}
            placeholder={t('credit_refinance_why_ph')}
            value={values.refinancingCredit}
            onChange={(value) => setFieldValue('refinancingCredit', value)}
            onBlur={() => setFieldTouched('refinancingCredit')}
            error={touched.refinancingCredit && errors.refinancingCredit}
          />
        </Column>
      </Row>

      <Divider />

      <Row>
        <CreditData />
      </Row>

      <Divider />

      {/* Monthly Income and Expenses - Required by API */}
      <Row>
        <Column>
          <FormattedInput
            name="monthlyIncome"
            title={t('monthly_income')}
            placeholder="10,000"
            handleChange={(value) => setFieldValue('monthlyIncome', value)}
            value={values.monthlyIncome}
            onBlur={() => setFieldTouched('monthlyIncome')}
            error={touched.monthlyIncome && errors.monthlyIncome}
          />
        </Column>
        <Column>
          <FormattedInput
            name="expenses"
            title={t('monthly_expenses')}
            placeholder="5,000"
            handleChange={(value) => setFieldValue('expenses', value)}
            value={values.expenses}
            onBlur={() => setFieldTouched('expenses')}
            error={touched.expenses && errors.expenses}
          />
        </Column>
      </Row>

      {/* option_1: Improve interest rate - no additional inputs */}
      {/* option_2: Reduce credit amount - shows early repayment amount (handled in CreditData component) */}
      
      {/* option_3: Increase term to reduce payment - shows desired monthly payment */}
      {values.refinancingCredit === 'option_3' && (
        <>
          <Divider />
          <Row>
            <Column>
              <FormattedInput
                name="desiredMonthlyPayment"
                title={t('desired_monthly_payment')}
                handleChange={(value) => setFieldValue('desiredMonthlyPayment', value)}
                value={values.desiredMonthlyPayment}
                onBlur={() => setFieldTouched('desiredMonthlyPayment')}
                error={touched.desiredMonthlyPayment && errors.desiredMonthlyPayment}
              />
            </Column>
          </Row>
        </>
      )}

      {/* option_4: Increase payment to reduce term - shows desired term */}
      {values.refinancingCredit === 'option_4' && (
        <>
          <Divider />
          <Row>
            <Column>
              <SliderInput
                disableCurrency={true}
                unitsMax={t('calculate_mortgage_period_units_max')}
                unitsMin={t('calculate_mortgage_period_units_min')}
                value={values.desiredTerm}
                name="desiredTerm"
                min={4}
                max={30}
                error={errors.desiredTerm}
                title={t('credit_loan_period')}
                handleChange={(value) => setFieldValue('desiredTerm', value)}
                onBlur={() => setFieldTouched('desiredTerm')}
              />
              {errors.desiredTerm && <Error error={errors.desiredTerm} />}
            </Column>
          </Row>
        </>
      )}
    </FormContainer>
  )
}

export default FirstStepForm
