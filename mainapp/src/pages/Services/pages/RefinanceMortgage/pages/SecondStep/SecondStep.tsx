/**
 * 🛡️ CRITICAL AI PROTECTION ZONE 🚨
 * 
 * ⚠️  WARNING: This file contains critical business logic for refinance mortgage step 2
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - DO NOT modify Formik integration or validation schema
 * - DO NOT change form field handling or data flow
 * - DO NOT add new features or functionality
 * - ONLY modify if user specifically asks for changes
 * 
 * BUSINESS CRITICAL:
 * - This file handles refinance mortgage step 2 form logic
 * - Changes could affect user data collection and validation
 * - Contains personal information form handling
 * - Requires thorough testing before any modifications
 * 
 * Last modified: 2025-01-08
 * Protected by: AI Assistant
 * File purpose: Refinance mortgage step 2 - personal information
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 */

import { Form, Formik } from 'formik'
import { useNavigate } from 'react-router-dom'

import { Container } from '@components/ui/Container'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateRefinanceMortgageData } from '@src/pages/Services/slices/refinanceMortgageSlice.ts'

import { DoubleButtons } from '../../../../components/DoubleButtons'
import { SecondStepForm } from './SecondStepForm'
import { validationSchema } from './constants'

const SecondStep = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const savedValues = useAppSelector((state) => state.refinanceMortgage)
  const loginData = useAppSelector((state) => state.login.loginData)

  const initialValues = {
    nameSurname: loginData.nameSurname || savedValues.nameSurname || '',
    birthday:
      savedValues.birthday ||
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)).getTime(),
    education: savedValues.education || '',
    additionalCitizenships: savedValues.additionalCitizenships || null,
    citizenshipsDropdown: savedValues.citizenshipsDropdown || [],
    taxes: savedValues.taxes || null,
    countriesPayTaxes: savedValues.countriesPayTaxes || [],
    childrens: savedValues.childrens || null,
    howMuchChildrens: savedValues.howMuchChildrens || 1,
    medicalInsurance: savedValues.medicalInsurance || null,
    isForeigner: savedValues.isForeigner || null,
    publicPerson: savedValues.publicPerson || null,
    borrowers: savedValues.borrowers || null,
    familyStatus: savedValues.familyStatus || '',
    partnerPayMortgage: savedValues.partnerPayMortgage || null,
    addPartner: savedValues.addPartner || '',
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount={true}
      onSubmit={(values) => {
        dispatch(updateRefinanceMortgageData(values))
        navigate('/services/refinance-mortgage/3')
      }}
    >
      <Form>
        <Container>
          <SecondStepForm />
        </Container>
        <DoubleButtons />
      </Form>
    </Formik>
  )
}

export default SecondStep
