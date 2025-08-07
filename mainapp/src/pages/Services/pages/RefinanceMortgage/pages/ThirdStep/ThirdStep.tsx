import { Form, Formik } from 'formik'
import { useNavigate } from 'react-router-dom'

import { Container } from '@components/ui/Container'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { AdditionalIncomeModal } from '@src/pages/Services/pages/Modals/AdditionalIncomeModal'
import { ObligationModal } from '@src/pages/Services/pages/Modals/ObligationModal'
import { SourceOfIncomeModal } from '@src/pages/Services/pages/Modals/SourceOfIncomeModal'
import { updateRefinanceMortgageData } from '@src/pages/Services/slices/refinanceMortgageSlice.ts'

import { DoubleButtons } from '../../../../components/DoubleButtons'
import ThirdStepForm from './ThirdStepForm/ThirdStepForm'
import { getValidationSchema } from './constants'

const ThirdStep = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const savedValue = useAppSelector((state) => state.refinanceMortgage)

  const initialValues = {
    // Fix: Provide default option_1 (employee) for main source of income
    mainSourceOfIncome: savedValue.mainSourceOfIncome || 'option_1',
    // Fix: Provide default values for employee-related required fields
    monthlyIncome: savedValue.monthlyIncome || 10000,
    startDate: savedValue.startDate || new Date().getTime(),
    fieldOfActivity: savedValue.fieldOfActivity || 'option_1',
    profession: savedValue.profession || 'Software Developer',
    companyName: savedValue.companyName || 'Test Company',
    // Fix: Provide default value for required additionalIncome field
    additionalIncome: savedValue.additionalIncome || 'no_additional_income',
    additionalIncomeAmount: savedValue.additionalIncomeAmount || null,
    // Fix: Provide default value for required obligation field
    obligation: savedValue.obligation || 'no_obligations',
    bank: savedValue.bank || '',
    monthlyPaymentForAnotherBank:
      savedValue.monthlyPaymentForAnotherBank || null,
    endDate: savedValue.endDate || new Date().getTime(),
    amountIncomeCurrentYear: savedValue?.amountIncomeCurrentYear || null,
    noIncome: savedValue.noIncome || new Date().getTime(),
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={getValidationSchema()}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateRefinanceMortgageData(values))
          navigate('/services/refinance-mortgage/4')
        }}
      >
        <Form>
          <Container>
            <ThirdStepForm />
          </Container>
          <DoubleButtons />
        </Form>
      </Formik>
      <SourceOfIncomeModal />
      <AdditionalIncomeModal />
      <ObligationModal />
    </>
  )
}

export default ThirdStep
