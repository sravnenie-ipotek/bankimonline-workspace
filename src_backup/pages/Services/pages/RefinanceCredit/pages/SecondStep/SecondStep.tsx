import { Form, Formik } from 'formik'
import { useNavigate } from 'react-router-dom'

import { Container } from '@components/ui/Container'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice.ts'

import { DoubleButtons } from '../../../../components/DoubleButtons'
import { SecondStepForm } from './SecondStepForm'
import { validationSchema } from './constants'

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
      validationSchema={validationSchema}
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
