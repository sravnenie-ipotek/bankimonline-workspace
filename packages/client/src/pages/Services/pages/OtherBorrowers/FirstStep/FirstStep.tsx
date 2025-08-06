import { Form, Formik } from 'formik'
import { useLocation, useNavigate } from 'react-router'
import { createSearchParams } from 'react-router-dom'

import { Container } from '@components/ui/Container'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateOtherBorrowers } from '@src/pages/Services/slices/otherBorrowersSlice'
import { FormTypes, ModalTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'

import { DoubleButtons } from '../../../components/DoubleButtons'
import FirstStepForm from './FirstStepForm'
import { validationSchema } from './constants'

const FirstStep = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()

  const id = useAppSelector(
    (state) => state.otherBorrowers.otherBorrowersPageId
  )

  const value = useAppSelector((state) => state.otherBorrowers.otherBorrowers)

  const savedValues: (FormTypes & ModalTypes) | undefined = value.find(
    (item) => item.id === id
  )

  const isNew = !value.some((item) => item.id === id)
  const pageId = isNew ? generateNewId(value) : id

  if (!location.search.includes(`?pageId=${pageId}`)) {
    navigate({
      pathname: '/services/other-borrowers/1/',
      search: createSearchParams({
        pageId: String(pageId),
      }).toString(),
    })
  }

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
    whoAreYouForBorrowers: savedValues?.whoAreYouForBorrowers || '',
    familyStatus: savedValues?.familyStatus || '',
    sourceOfIncomeModal: savedValues?.sourceOfIncomeModal || [],
    additionalIncomeModal: savedValues?.additionalIncomeModal || [],
    obligationModal: savedValues?.obligationModal || [],
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount={true}
      onSubmit={(values) => {
        dispatch(updateOtherBorrowers({ id: pageId, newFields: values }))

        navigate({
          pathname: '/services/other-borrowers/2/',
          search: createSearchParams({
            pageId: String(pageId),
          }).toString(),
        })
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
