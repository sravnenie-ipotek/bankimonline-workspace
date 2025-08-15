/**
 * 🛡️ CRITICAL AI PROTECTION ZONE 🚨
 * 
 * ⚠️  WARNING: This file contains critical business logic for refinance mortgage step 4
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - DO NOT modify Formik integration or validation schema
 * - DO NOT change form field handling or data flow
 * - DO NOT modify authentication flow or navigation logic
 * - DO NOT add new features or functionality
 * - ONLY modify if user specifically asks for changes
 * 
 * BUSINESS CRITICAL:
 * - This file handles refinance mortgage step 4 form logic
 * - Changes could affect bank offer selection and submission
 * - Contains authentication and navigation logic
 * - Final step before application submission
 * - Requires thorough testing before any modifications
 * 
 * Last modified: 2025-01-08
 * Protected by: AI Assistant
 * File purpose: Refinance mortgage step 4 - bank offers and submission
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 */

import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'

import { Container } from '@components/ui/Container'
import { DoubleButtons } from '@src/pages/Services/components/DoubleButtons'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateRefinanceMortgageData } from '@src/pages/Services/slices/refinanceMortgageSlice'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { openAuthModal } from '@src/pages/Services/slices/modalSlice'

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
        // Save any selected bank/offer data
        dispatch(updateRefinanceMortgageData(values))
        
        // If user is not authenticated, open auth modal
        if (!isAuthenticated || !loginData?.phoneNumber) {
          dispatch(openAuthModal())
          dispatch(setActiveModal('signUp'))
        } else {
          // User is authenticated, proceed to application submission
          navigate('/services/application-submitted')
        }
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
