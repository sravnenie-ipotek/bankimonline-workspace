import { Form, Formik } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import * as Yup from 'yup'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { updateSourceOfIncomeModal } from '@src/pages/Services/slices/otherBorrowersSlice'
import { SourceOfIncomeModalTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'

import { SourceOfIncomeForm } from './SourceOfIncomeForm'

const SourceOfIncomeModal: React.FC = () => {
  const { t, i18n } = useTranslation()

  const dispatch = useAppDispatch()

  const [searchParams] = useSearchParams()

  const query = searchParams.get('pageId')

  const pageId = parseInt(query!)

  const isOpen = useAppSelector(
    (state) => state.modalSlice.isOpenSourceOfIncome
  )

  const id = useAppSelector((state) => state.modalSlice.currentId)
  const value = useAppSelector(
    (state) =>
      state.otherBorrowers.otherBorrowers[pageId - 1]?.sourceOfIncomeModal || []
  )

  const savedValue: SourceOfIncomeModalTypes | undefined = value.find(
    (item) => item.id === id
  )

  const handleClose = () => {
    dispatch(closeModal())
  }

  const isNew = !value.some((item) => item.id === id)

  const modalId = isNew ? generateNewId(value) : id

  const initialValues = {
    mainSourceOfIncome: savedValue?.mainSourceOfIncome || '',
    monthlyIncome: savedValue?.monthlyIncome || null,
    startDate: savedValue?.startDate || new Date().getTime(),
    fieldOfActivity: savedValue?.fieldOfActivity || '',
    profession: savedValue?.profession || '',
    companyName: savedValue?.companyName || '',
    amountIncomeCurrentYear: savedValue?.amountIncomeCurrentYear || null,
  }

  const validationSchema = Yup.object().shape({
    mainSourceOfIncome: Yup.string().required(t('error_select_answer')),
    monthlyIncome: Yup.number().required(t('error_fill_field')),
    startDate: Yup.string().required(t('error_date')),
    fieldOfActivity: Yup.object().when('mainSourceOfIncome', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '',
      then: (shema) => shema.required(t('error_select_field_of_activity')),
      otherwise: (shema) => shema.notRequired(),
    }),
    profession: Yup.string().required(t('error_fill_field')),
    companyName: Yup.string().required(t('error_fill_field')),
  })

  return (
    <Modal
      isVisible={isOpen}
      onCancel={handleClose}
      title={`${t('source_of_income')} ${modalId + 1}`}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount={false}
        onSubmit={(values) => {
          dispatch(
            updateSourceOfIncomeModal({ id: modalId, pageId, ...values })
          )
          handleClose()
        }}
      >
        <Form>
          <SourceOfIncomeForm />
        </Form>
      </Formik>
    </Modal>
  )
}

export default SourceOfIncomeModal
