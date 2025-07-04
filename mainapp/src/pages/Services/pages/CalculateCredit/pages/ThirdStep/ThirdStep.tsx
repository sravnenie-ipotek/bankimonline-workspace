import { Form, Formik } from 'formik'
import { useNavigate } from 'react-router-dom'

import { Container } from '@components/ui/Container'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { AdditionalIncomeModal } from '@src/pages/Services/pages/Modals/AdditionalIncomeModal'
import { ObligationModal } from '@src/pages/Services/pages/Modals/ObligationModal'
import { SourceOfIncomeModal } from '@src/pages/Services/pages/Modals/SourceOfIncomeModal'
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice.ts'

import { DoubleButtons } from '../../../../components/DoubleButtons'
import ThirdStepForm from './ThirdStepForm/ThirdStepForm'
import { validationSchema } from './constants'

const ThirdStep = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const savedValue = useAppSelector((state) => state.mortgage)

  const initialValues = {
    mainSourceOfIncome: savedValue.mainSourceOfIncome || '',
    monthlyIncome: savedValue.monthlyIncome || null,
    startDate: savedValue.startDate || new Date().getTime(),
    fieldOfActivity: savedValue.fieldOfActivity || '',
    profession: savedValue.profession || '',
    companyName: savedValue.companyName || '',
    additionalIncome: savedValue.additionalIncome || '',
    additionalIncomeAmount: savedValue.additionalIncomeAmount || null,
    obligation: savedValue.obligation || 'option_1',
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
        validationSchema={validationSchema}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateMortgageData(values))
          navigate('/services/calculate-credit/4')
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
