/**
 * 🛡️ CRITICAL AI PROTECTION ZONE 🚨
 * 
 * ⚠️  WARNING: This file contains critical business logic
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - DO NOT add new features or functionality
 * - DO NOT modify imports or dependencies
 * - DO NOT change component props or interfaces
 * - DO NOT modify validation schema or business rules
 * - DO NOT change form field names or validation logic
 * - ONLY modify if user specifically asks for changes
 * 
 * BUSINESS CRITICAL:
 * - This file handles mortgage calculation step 3 form logic
 * - Changes could affect mortgage calculation accuracy and user experience
 * - Contains critical income and financial information fields
 * - Requires thorough testing before any modifications
 * - Affects the entire mortgage calculation flow
 * 
 * Last modified: 2025-08-07
 * Protected by: Michael Mishayev
 * File purpose: Mortgage calculation step 3 - Income and financial information
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 * To allow specific modifications, add: "ALLOW_MODIFICATIONS: [specific_type]"
 */

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
    amountIncomeCurrentYear: savedValue.amountIncomeCurrentYear || null,
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
          navigate('/services/calculate-mortgage/4')
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
