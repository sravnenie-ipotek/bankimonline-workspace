import { Form, Formik } from 'formik'
import * as Yup from 'yup'

import { Container } from '@components/ui/Container'
import { DoubleButtons } from '@src/pages/Services/components/DoubleButtons'

import FourthStepForm from './FourthStepForm/FourthStepForm'

const initialValues = {}

export const validationSchema = Yup.object().shape({})

const FourthStep = () => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount={true}
      onSubmit={() => {
        console.log('нажата кнопка')
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
