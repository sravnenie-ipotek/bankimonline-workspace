import { Form, Formik } from 'formik'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import * as Yup from 'yup'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { updateAdditionalIncomeModal } from '@src/pages/Services/slices/otherBorrowersSlice'
import { AdditionalIncomeModalTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'

import { AdditionalIncomeForm } from './AdditionalIncomeForm'

const AdditionalIncomeModal = () => {
  const { t, i18n } = useTranslation()

  const dispatch = useAppDispatch()

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
      t('error_select_one_of_the_options')
    ).test(
      'not-empty',
      t('error_select_one_of_the_options'),
      (value) => value !== null && value !== undefined && value !== ''
    ),
    additionalIncomeAmount: Yup.number().when('additionalIncome', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && value !== 'option_1',
      then: (shema) => shema.required(i18next.t('error_fill_field')),
      otherwise: (shema) => shema.notRequired(),
    }),
  })

  return (
    <Modal
      isVisible={isOpen}
      onCancel={handleClose}
      title={`${t('additional_source_of_income')} ${modalId + 1}`}
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
