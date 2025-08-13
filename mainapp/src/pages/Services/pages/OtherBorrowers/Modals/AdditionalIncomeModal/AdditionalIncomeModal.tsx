import { Form, Formik } from 'formik'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import * as Yup from 'yup'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { useContentApi } from '@src/hooks/useContentApi'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { updateAdditionalIncomeModal } from '@src/pages/Services/slices/otherBorrowersSlice'
import { AdditionalIncomeModalTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'
import { getValidationErrorSync, reloadValidationErrors } from '@src/utils/validationHelpers'

import { AdditionalIncomeForm } from './AdditionalIncomeForm'

const AdditionalIncomeModal = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('common')

  const dispatch = useAppDispatch()

  // Reload validation errors when language changes
  useEffect(() => {
    reloadValidationErrors()
  }, [i18n.language])

  const [searchParams] = useSearchParams()

  const query = searchParams.get('pageId')

  const pageId = parseInt(query!)

  const isOpen = useAppSelector(
    (state) => state.modalSlice.isOpenAdditionalIncome
  )
  const id = useAppSelector((state) => state.modalSlice.currentId)
  const value = useAppSelector(
    (state) =>
      state.otherBorrowers.otherBorrowers[pageId - 1]?.additionalIncomeModal ||
      []
  )
  const savedValue: AdditionalIncomeModalTypes | undefined = value.find(
    (item) => item.id === id
  )

  const handleClose = () => {
    dispatch(closeModal())
  }

  const isNew = !value.some((item) => item.id === id)
  const modalId = isNew ? generateNewId(value) : id

  const initialValues = {
    additionalIncome: savedValue?.additionalIncome || '',
    additionalIncomeAmount: savedValue?.additionalIncomeAmount || null,
  }

  const validationSchema = Yup.object().shape({
    additionalIncome: Yup.string().required(
      getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options')
    ).test(
      'not-empty',
      getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options'),
      (value) => value !== null && value !== undefined && value !== ''
    ),
    additionalIncomeAmount: Yup.number().when('additionalIncome', {
      is: (value: string) => {
        // Only require amount for actual additional income, not for "no_additional_income"
        return value && value !== 'no_additional_income'
      },
      then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (schema) => schema.notRequired(),
    }),
  })

  return (
    <Modal
      isVisible={isOpen}
      onCancel={handleClose}
      title={`${getContent('additional_source_of_income_modal_title', 'Additional Source of Income')} ${modalId + 1}`}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(
            updateAdditionalIncomeModal({ id: modalId, pageId, ...values })
          )
          handleClose()
        }}
      >
        <Form>
          <AdditionalIncomeForm />
        </Form>
      </Formik>
    </Modal>
  )
}

export default AdditionalIncomeModal
