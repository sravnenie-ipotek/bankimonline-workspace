import { Form, Formik } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateSourceOfIncomeModal } from '@src/pages/Services/slices/borrowersPersonalDataSlice'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { SourceOfIncomeModalTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'

import { SourceOfIncomeForm } from './SourceOfIncomeForm'

const SourceOfIncomeModal: React.FC = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const dispatch = useAppDispatch()

  const isOpen = useAppSelector(
    (state) => state.modalSlice.isOpenSourceOfIncome
  )
  const id = useAppSelector((state) => state.modalSlice.currentId)
  const value = useAppSelector(
    (state) => state.borrowersPersonalData.sourceOfIncomeModal
  )

  const savedValue: SourceOfIncomeModalTypes | undefined =
    value[id - 1] !== undefined ? value[id - 1] : undefined

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
    fieldOfActivity: Yup.string().when('mainSourceOfIncome', {
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
            updateSourceOfIncomeModal({
              id: modalId,
              ...values,
            })
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
