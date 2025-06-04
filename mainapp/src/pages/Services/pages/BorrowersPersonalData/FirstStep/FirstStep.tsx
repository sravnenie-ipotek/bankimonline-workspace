import { Form, Formik } from 'formik'
import { useNavigate } from 'react-router'

import { Container } from '@components/ui/Container'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateBorrowersPersonalData } from '@src/pages/Services/slices/borrowersPersonalDataSlice'
import { FormTypes } from '@src/pages/Services/types/formTypes'

import { DoubleButtons } from '../../../components/DoubleButtons'
import FirstStepForm from './FirstStepForm'
import { validationSchema } from './constants'

const FirstStep = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const value = useAppSelector(
    (state) => state.borrowersPersonalData.borrowersPersonalData
  )

  const savedValues: FormTypes | undefined =
    value !== undefined ? value : undefined

  const initialValues = {
    nameSurname: savedValues?.nameSurname || '',
    birthday:
      savedValues?.birthday ||
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)).getTime(),
    education: savedValues?.education || '',
    additionalCitizenships: savedValues?.additionalCitizenships || null,
    citizenshipsDropdown: savedValues?.citizenshipsDropdown || [],
    taxes: savedValues?.taxes || null,
    countriesPayTaxes: savedValues?.countriesPayTaxes || [],
    childrens: savedValues?.childrens || null,
    howMuchChildrens: savedValues?.howMuchChildrens || 1,
    medicalInsurance: savedValues?.medicalInsurance || null,
    isForeigner: savedValues?.isForeigner || null,
    publicPerson: savedValues?.publicPerson || null,
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount={true}
      onSubmit={(values) => {
        dispatch(updateBorrowersPersonalData(values))
        navigate('/services/borrowers-personal-data/2')
      }}
    >
      <Form>
        <Container>
          <FirstStepForm />
        </Container>
        <DoubleButtons />
      </Form>
    </Formik>
  )
}

export default FirstStep
