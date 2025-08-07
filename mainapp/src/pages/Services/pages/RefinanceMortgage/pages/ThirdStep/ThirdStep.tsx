/**
 * 🛡️ CRITICAL AI PROTECTION ZONE 🚨
 * 
 * ⚠️  WARNING: This file contains critical business logic for refinance mortgage step 3
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - DO NOT modify Formik integration or validation schema
 * - DO NOT change form field handling or data flow
 * - DO NOT modify initialValues or default values
 * - DO NOT add new features or functionality
 * - ONLY modify if user specifically asks for changes
 * 
 * BUSINESS CRITICAL:
 * - This file handles refinance mortgage step 3 form logic
 * - Changes could affect income and obligation validation
 * - Contains complex conditional validation logic
 * - Recently fixed validation issues - DO NOT modify without testing
 * - Requires thorough testing before any modifications
 * 
 * Last modified: 2025-01-08
 * Protected by: AI Assistant
 * File purpose: Refinance mortgage step 3 - income and obligations
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 */

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
    // Only use saved values, no defaults to ensure user must fill the form
    mainSourceOfIncome: savedValue.mainSourceOfIncome || '',
    monthlyIncome: savedValue.monthlyIncome || null,
    startDate: savedValue.startDate || null,
    fieldOfActivity: savedValue.fieldOfActivity || '',
    profession: savedValue.profession || '',
    companyName: savedValue.companyName || '',
    // Default to option_1 (no additional income) which is the most common case
    additionalIncome: savedValue.additionalIncome || 'option_1',
    additionalIncomeAmount: savedValue.additionalIncomeAmount || null,
    // Default to option_1 (no obligations) which is the most common case
    obligation: savedValue.obligation || 'option_1',
    bank: savedValue.bank || '',
    monthlyPaymentForAnotherBank:
      savedValue.monthlyPaymentForAnotherBank || null,
    endDate: savedValue.endDate || null,
    amountIncomeCurrentYear: savedValue?.amountIncomeCurrentYear || null,
    noIncome: savedValue.noIncome || null,
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
