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
  const isAuthenticated = useAppSelector((state) => state.login.isAuthenticated)

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
