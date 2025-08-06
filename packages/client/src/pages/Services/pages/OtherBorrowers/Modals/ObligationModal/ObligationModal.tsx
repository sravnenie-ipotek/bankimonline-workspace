import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import * as Yup from 'yup'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { useContentApi } from '@src/hooks/useContentApi'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { updateObligationModal } from '@src/pages/Services/slices/otherBorrowersSlice'
import { ObligationModalTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

import { ObligationForm } from './ObligationForm'

const ObligationModal = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('common')

  const dispatch = useAppDispatch()

  const [searchParams] = useSearchParams()

  const query = searchParams.get('pageId')

  const pageId = parseInt(query!)

  const isOpen = useAppSelector((state) => state.modalSlice.isOpenObligation)
  const id = useAppSelector((state) => state.modalSlice.currentId)
  const value = useAppSelector(
    (state) =>
      state.otherBorrowers.otherBorrowers[pageId - 1]?.obligationModal || []
  )

  const savedValue: ObligationModalTypes | undefined = value.find(
    (item) => item.id === id
  )

  const handleClose = () => {
    dispatch(closeModal())
  }

  const isNew = !value.some((item) => item.id === id)
  const modalId = isNew ? generateNewId(value) : id

  const initialValues = {
    obligation: savedValue?.obligation || '',
    bank: savedValue?.bank || '',
    monthlyPaymentForAnotherBank:
      savedValue?.monthlyPaymentForAnotherBank || null,
    endDate: savedValue?.endDate || new Date().getTime(),
    noIncome: savedValue?.noIncome || new Date().getTime(),
  }

  const validationSchema = Yup.object().shape({
    obligation: Yup.string().required(getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options')),
    bank: Yup.string().when('obligation', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && value !== 'option_1',
      then: (shema) => shema.required(getValidationErrorSync('error_select_bank', 'Please select a bank')),
      otherwise: (shema) => shema.notRequired(),
    }),
    monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && value !== 'option_1',
      then: (shema) => shema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (shema) => shema.notRequired(),
    }),
    endDate: Yup.string().required(getValidationErrorSync('error_date', 'Please select a date')),
  })

  return (
    <Modal
      isVisible={isOpen}
      onCancel={handleClose}
      title={`${getContent('obligation_modal_title', 'Obligation')} ${modalId + 1}`}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateObligationModal({ id: modalId, pageId, ...values }))
          handleClose()
        }}
      >
        <Form>
          <ObligationForm />
        </Form>
      </Formik>
    </Modal>
  )
}

export default ObligationModal
