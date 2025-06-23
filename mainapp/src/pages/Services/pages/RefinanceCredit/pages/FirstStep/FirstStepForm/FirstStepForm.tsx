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
            placeholder={t('calculate_mortgage_citizenship_ph')}
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

      {values.refinancingCredit && values.refinancingCredit === 'option_1' && (
        <Divider />
      )}

      {values.refinancingCredit && values.refinancingCredit === 'option_2' && (
        <Divider />
      )}

      {values.refinancingCredit && values.refinancingCredit == 'option_1' && (
        <Column>
          <FormattedInput
            name="MonthlyPayment"
            title={t('calculate_mortgage_initial_payment')}
            handleChange={(value) => setFieldValue('monthlyPayment', value)}
            value={values.monthlyPayment}
          />
        </Column>
      )}

      <Row>
        {values.refinancingCredit &&
          values.refinancingCredit === 'option_2' && (
            <Column>
              <SliderInput
                disableCurrency={true}
                unitsMax={t('calculate_mortgage_period_units_max')}
                unitsMin={t('calculate_mortgage_period_units_min')}
                value={values.period}
                name="Period"
                min={4}
                max={30}
                error={errors.period}
                title={t('calculate_mortgage_period')}
                handleChange={(value) => setFieldValue('period', value)}
              />
              {errors.period && <Error error={errors.period} />}
            </Column>
          )}

        <Column />
      </Row>
    </FormContainer>
  )
}

export default FirstStepForm
