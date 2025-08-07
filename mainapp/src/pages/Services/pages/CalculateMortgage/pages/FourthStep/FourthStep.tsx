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
 * - This file handles mortgage calculation step 4 form logic
 * - Changes could affect mortgage calculation accuracy and user experience
 * - Contains critical bank selection and offer processing logic
 * - Requires thorough testing before any modifications
 * - Affects the entire mortgage calculation flow and final submission
 * 
 * Last modified: 2025-08-07
 * Protected by: Michael Mishayev
 * File purpose: Mortgage calculation step 4 - Bank selection and final submission
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 * To allow specific modifications, add: "ALLOW_MODIFICATIONS: [specific_type]"
 */

import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'

import { Container } from '@components/ui/Container'
import { DoubleButtons } from '@src/pages/Services/components/DoubleButtons'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice'

import FourthStepForm from './FourthStepForm/FourthStepForm'

const initialValues = {
  selectedBank: '',
  selectedOffer: null,
}

export const validationSchema = Yup.object().shape({
  selectedBank: Yup.string(),
  selectedOffer: Yup.object().nullable(),
})

const FourthStep = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const loginData = useAppSelector((state) => state.login.loginData)
  const isAuthenticated = useAppSelector((state) => state.login.isLogin)

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount={true}
      onSubmit={(values) => {
        console.log('Saving mortgage data and proceeding...', values)
        
        // Save any selected bank/offer data
        dispatch(updateMortgageData(values))
        
        // For now, bypass authentication and go directly to application submitted
        // TODO: Implement proper authentication flow
        console.log('Proceeding to application submission (auth bypassed for testing)')
        navigate('/services/application-submitted')
        
        // Original authentication logic (commented out for testing):
        // if (!isAuthenticated || !loginData?.phoneNumber) {
        //   console.log('User not authenticated, redirecting to registration')
        //   navigate('/auth?step=register&returnTo=/services/calculate-mortgage/4')
        // } else {
        //   console.log('User authenticated, proceeding to application')
        //   navigate('/services/application-submitted')
        // }
      }}
    >
      <Form>
        <Container>
          <FourthStepForm />
        </Container>
        <DoubleButtons />
      </Form>
    </Formik>
  )
}

export default FourthStep
