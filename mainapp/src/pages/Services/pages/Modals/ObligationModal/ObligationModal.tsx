import { Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { useContentApi } from '@src/hooks/useContentApi'
import { updateObligationModal } from '@src/pages/Services/slices/borrowersSlice.ts'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { ObligationModalTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'
import { getValidationErrorSync, preloadValidationErrors } from '@src/utils/validationHelpers'

import { ObligationForm } from './ObligationForm'

const ObligationModal = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('common')
  const [validationSchema, setValidationSchema] = useState(() => getValidationSchema())

  const dispatch = useAppDispatch()

  // Preload validation errors and regenerate schema when language changes
  useEffect(() => {
    const initializeValidation = async () => {
      console.log('🔄 ObligationModal: Preloading validation errors for language:', i18n.language)
      await preloadValidationErrors()
      
      // Regenerate validation schema after errors are loaded
      const newSchema = getValidationSchema()
      setValidationSchema(newSchema)
      console.log('✅ ObligationModal: Validation schema updated for language:', i18n.language)
    }
    
    initializeValidation()
  }, [i18n.language]) // Regenerate when language changes

  // Dynamic validation schema function
  const getValidationSchema = () => Yup.object().shape({
    obligation: Yup.string().required(getValidationErrorSync('error_select_one_of_the_options', 'Please select one of the options')),
    bank: Yup.string().when('obligation', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && value !== '1', // If NOT "no obligations", require bank
      then: (shema) => shema.required(getValidationErrorSync('error_select_bank', 'Please select a bank')),
      otherwise: (shema) => shema.notRequired(),
    }),
    monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && value !== '1', // If NOT "no obligations", require monthly payment
      then: (shema) => shema.required(getValidationErrorSync('error_fill_field', 'Please fill this field')),
      otherwise: (shema) => shema.notRequired(),
    }),
    endDate: Yup.string().when('obligation', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && value !== '1', // If NOT "no obligations", require end date
      then: (shema) => shema.required(getValidationErrorSync('error_date', 'Please enter a valid date')),
      otherwise: (shema) => shema.notRequired(),
    }),
  })

  const isOpen = useAppSelector((state) => state.modalSlice.isOpenObligation)
  const id = useAppSelector((state) => state.modalSlice.currentId)
  const value = useAppSelector((state) => state.borrowers.obligationModal)

  const savedValue: ObligationModalTypes | undefined =
    value[id - 1] !== undefined ? value[id - 1] : undefined

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
    endDate: savedValue?.endDate || new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    noIncome: savedValue?.noIncome || new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  }

  return (
    <Modal
      isVisible={isOpen}
      onCancel={handleClose}
      title={`${getContent('obligation_modal_title', t('obligation_modal_title'))} ${modalId + 1}`}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount={true}
        onSubmit={(values) => {
          dispatch(updateObligationModal({ id: modalId, ...values }))
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
