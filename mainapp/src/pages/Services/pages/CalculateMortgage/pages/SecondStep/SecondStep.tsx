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
 * - This file handles mortgage calculation step 2 form logic
 * - Changes could affect mortgage calculation accuracy and user experience
 * - Contains critical personal information fields and validation
 * - Requires thorough testing before any modifications
 * - Affects the entire mortgage calculation flow
 * 
 * Last modified: 2025-08-07
 * Protected by: Michael Mishayev
 * File purpose: Mortgage calculation step 2 - Personal information and borrower details
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 * To allow specific modifications, add: "ALLOW_MODIFICATIONS: [specific_type]"
 */

import { Form, Formik } from 'formik'
import { useNavigate } from 'react-router-dom'

import { Container } from '@src/components/ui/Container'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice.ts'

import { DoubleButtons } from '../../../../components/DoubleButtons'
import { SecondStepForm } from './SecondStepForm'
import { getValidationSchema } from './constants'

const SecondStep = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const savedValues = useAppSelector((state) => state.mortgage)
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
      validationSchema={getValidationSchema()}
      validateOnMount={true}
      onSubmit={(values) => {
        dispatch(updateMortgageData(values))
        navigate('/services/calculate-mortgage/3')
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
