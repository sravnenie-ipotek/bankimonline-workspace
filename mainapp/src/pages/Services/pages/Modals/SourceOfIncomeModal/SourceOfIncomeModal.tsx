import { Form, Formik } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { useContentApi } from '@src/hooks/useContentApi'
import { updateSourceOfIncomeModal } from '@src/pages/Services/slices/borrowersSlice.ts'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { SourceOfIncomeModalTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'
import { getValidationErrorSync } from '@src/utils/validationHelpers'

import { SourceOfIncomeForm } from './SourceOfIncomeForm'

const SourceOfIncomeModal: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('common')

  const dispatch = useAppDispatch()

  const isOpen = useAppSelector(
    (state) => state.modalSlice.isOpenSourceOfIncome
  )
  const id = useAppSelector((state) => state.modalSlice.currentId)
  const value = useAppSelector((state) => state.borrowers.sourceOfIncomeModal)

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
    mainSourceOfIncome: Yup.string().required(getValidationErrorSync('error_select_answer', 'Please select an answer')),
    monthlyIncome: Yup.number().transform((value, originalValue) => {
      // Handle string values from FormattedInput
      if (typeof originalValue === 'string') {
        const numericValue = originalValue.replace(/[^0-9]/g, '')
        return numericValue ? parseInt(numericValue, 10) : null
      }
      return value
    }).when('mainSourceOfIncome', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && !['unpaid_leave', 'unemployed'].includes(value),
      then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (schema) => schema.notRequired(),
    }),
    startDate: Yup.string().when('mainSourceOfIncome', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && !['unpaid_leave', 'unemployed'].includes(value),
      then: (schema) => schema.required(getValidationErrorSync('error_date', 'Please select a date')),
      otherwise: (schema) => schema.notRequired(),
    }),
    fieldOfActivity: Yup.string().when('mainSourceOfIncome', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && !['unpaid_leave', 'unemployed'].includes(value),
      then: (shema) => shema.required(getValidationErrorSync('error_select_field_of_activity', 'Please select field of activity')),
      otherwise: (shema) => shema.notRequired(),
    }),
    profession: Yup.string().when('mainSourceOfIncome', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && !['unpaid_leave', 'unemployed'].includes(value),
      then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (schema) => schema.notRequired(),
    }),
    companyName: Yup.string().when('mainSourceOfIncome', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && !['unpaid_leave', 'unemployed'].includes(value),
      then: (schema) => schema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (schema) => schema.notRequired(),
    }),
  })

  return (
    <Modal
      isVisible={isOpen}
      onCancel={handleClose}
      title={`${getContent('source_of_income_modal_title', 'Source of Income')} ${modalId + 1}`}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount={false}
        validateOnChange={true}
        validateOnBlur={true}
        onSubmit={(values) => {
          dispatch(updateSourceOfIncomeModal({ id: modalId, ...values }))
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
