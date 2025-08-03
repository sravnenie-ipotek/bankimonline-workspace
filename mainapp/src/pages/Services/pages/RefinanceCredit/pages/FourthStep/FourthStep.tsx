import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'

import { Container } from '@components/ui/Container'
import { DoubleButtons } from '@src/pages/Services/components/DoubleButtons'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice'
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
        console.log('Saving refinance credit data and proceeding...', values)
        
        // Save any selected bank/offer data
        dispatch(updateMortgageData(values))
        
        // If user is not authenticated, open auth modal
        if (!isAuthenticated || !loginData?.phoneNumber) {
          console.log('User not authenticated, opening auth modal')
          dispatch(openAuthModal())
          dispatch(setActiveModal('signUp'))
        } else {
          // User is authenticated, proceed to application submission
          console.log('User authenticated, proceeding to application')
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
