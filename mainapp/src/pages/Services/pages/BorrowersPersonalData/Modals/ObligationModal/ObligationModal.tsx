import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { updateObligationModal } from '@src/pages/Services/slices/borrowersPersonalDataSlice'
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts'
import { ObligationModalTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'

import { ObligationForm } from './ObligationForm'

const ObligationModal = () => {
  const { t, i18n } = useTranslation()

  const dispatch = useAppDispatch()

  const isOpen = useAppSelector((state) => state.modalSlice.isOpenObligation)
  const id = useAppSelector((state) => state.modalSlice.currentId)
  const value = useAppSelector(
    (state) => state.borrowersPersonalData.obligationModal
  )

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
    endDate: savedValue?.endDate || new Date().getTime(),
    noIncome: savedValue?.noIncome || new Date().getTime(),
  }

  const validationSchema = Yup.object().shape({
    obligation: Yup.string().required(t('error_select_one_of_the_options')),
    bank: Yup.string().when('obligation', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && value !== 'option_1',
      then: (shema) => shema.required(t('error_select_bank')),
      otherwise: (shema) => shema.notRequired(),
    }),
    monthlyPaymentForAnotherBank: Yup.number().when('obligation', {
      is: (value: string) =>
        value !== null && value !== undefined && value !== '' && value !== 'option_1',
      then: (shema) => shema.required(t('error_fill_field')),
      otherwise: (shema) => shema.notRequired(),
    }),
    endDate: Yup.string().required(t('error_date')),
  })

  return (
    <Modal
      isVisible={isOpen}
      onCancel={handleClose}
      title={`${t('obligation')} ${modalId + 1}`}
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
