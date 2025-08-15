import { Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Container } from '@components/ui/Container'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { AdditionalIncomeModal } from '@src/pages/Services/pages/Modals/AdditionalIncomeModal'
import { ObligationModal } from '@src/pages/Services/pages/Modals/ObligationModal'
import { SourceOfIncomeModal } from '@src/pages/Services/pages/Modals/SourceOfIncomeModal'
import { updateCreditData } from '@src/pages/Services/slices/calculateCreditSlice.ts'
import { preloadValidationErrors } from '@src/utils/validationHelpers'

import { DoubleButtons } from '../../../../components/DoubleButtons'
import ThirdStepForm from './ThirdStepForm/ThirdStepForm'
import { getValidationSchema } from './constants'

const ThirdStep = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const [validationSchema, setValidationSchema] = useState(() => getValidationSchema())

  const savedValue = useAppSelector((state) => state.credit)

  // Preload validation errors and regenerate schema when component mounts or language changes
  useEffect(() => {
    const initializeValidation = async () => {
      await preloadValidationErrors()
      
      // Regenerate validation schema after errors are loaded
      const newSchema = getValidationSchema()
      setValidationSchema(newSchema)
      }
    
    initializeValidation()
  }, [i18n.language]) // Regenerate when language changes

  const initialValues = {
    mainSourceOfIncome: savedValue.mainSourceOfIncome || '',
    monthlyIncome: savedValue.monthlyIncome || null,
    startDate: savedValue.startDate || new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
    fieldOfActivity: savedValue.fieldOfActivity || '',
    profession: savedValue.profession || '',
    companyName: savedValue.companyName || '',
    additionalIncome: savedValue.additionalIncome || 'no_additional_income', // Default to "No additional income" (API value)
    additionalIncomeAmount: savedValue.additionalIncomeAmount || null,
    obligation: savedValue.obligation || 'no_obligations', // Default to "No obligations" (API value)
    bank: savedValue.bank || '',
    monthlyPaymentForAnotherBank:
      savedValue.monthlyPaymentForAnotherBank || null,
    endDate: savedValue.endDate || new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
    amountIncomeCurrentYear: savedValue?.amountIncomeCurrentYear || null,
    noIncome: savedValue.noIncome || new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateCreditData(values))
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
