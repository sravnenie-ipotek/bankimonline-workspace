import { useFormikContext } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { FormContainer } from '@components/ui/FormContainer'
import { Row } from '@components/ui/Row'
import { AddButton } from '@src/components/ui/AddButton'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { UserProfileCard } from '@src/components/ui/UserProfileCard'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { AdditionalIncome } from '@src/pages/Services/components/AdditionalIncome'
import { AdditionalIncomeAmount } from '@src/pages/Services/components/AdditionalIncomeAmount'
import { MainSourceOfIncome } from '@src/pages/Services/components/MainSourceOfIncome'
import { OtherBorrowersObligation } from '@src/pages/Services/components/OtherBorrowersObligation'
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'
import { componentsByObligation } from '@src/pages/Services/constants/componentsByObligation'
import {
  createAdditionalIncomeModal,
  createObligationModal,
  createSourceOfIncomeModal,
  openAdditionalIncomeModal,
  openObligationModal,
  openSourceOfIncomeModal,
} from '@src/pages/Services/slices/modalSlice'
import {
  deleteAdditionalIncomeModal,
  deleteObligationModal,
  deleteSourceOfIncomeModal,
} from '@src/pages/Services/slices/otherBorrowersSlice'
import { FormTypes } from '@src/pages/Services/types/formTypes'

const SecondStepForm = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('other_borrowers_step2')

  const [searchParams] = useSearchParams()

  const query = searchParams.get('pageId')

  const pageId = parseInt(query!)

  const { values } = useFormikContext<FormTypes>()

  const { mainSourceOfIncome, additionalIncome, obligation } = values

  const dispatch = useAppDispatch()

  // FIX: Map dropdown option values to componentsByIncomeSource keys
  // Following systemTranslationLogic.md - handle dropdown value mapping properly
  const getIncomeSourceKey = (optionValue: string): string => {
    const mapping: { [key: string]: string } = {
      employee: 'employee',
      selfemployed: 'selfemployed',
      pension: 'pension',
      student: 'student',
      unemployed: 'unemployed',
      unpaid_leave: 'unpaid_leave',
      other: 'other',
      // Legacy numeric values
      '1': 'employee',
      '2': 'selfemployed',
      '3': 'selfemployed',
      '4': 'pension',
      '5': 'student',
      '6': 'unemployed',
      '7': 'other',
      // Legacy option
      option_1: 'employee',
      option_2: 'selfemployed',
      option_3: 'selfemployed',
      option_4: 'pension',
      option_5: 'student',
      option_6: 'unemployed',
      option_7: 'other',
    }

    if (mapping[optionValue]) return mapping[optionValue]

    const lower = optionValue.toLowerCase()
    if (lower.includes('employee')) return 'employee'
    if (lower.includes('selfemployed') || lower.includes('self_employed') || lower.includes('self-employed')) return 'selfemployed'
    if (lower.includes('pension')) return 'pension'
    if (lower.includes('student')) return 'student'
    if (lower.includes('unemployed')) return 'unemployed'
    if (lower.includes('unpaid_leave') || lower.includes('unpaid') || lower.includes('leave')) return 'unpaid_leave'
    if (lower.includes('other')) return 'other'

    return ''
  }

  const incomeSourceKey = getIncomeSourceKey(mainSourceOfIncome)

  // Debug logging for conditional field rendering
  console.log('🔍 OtherBorrowers SecondStepForm debug:', {
    mainSourceOfIncome,
    incomeSourceKey,
    componentsByIncomeSource,
    hasComponent: !!componentsByIncomeSource[incomeSourceKey],
    componentKeys: Object.keys(componentsByIncomeSource),
    allFormValues: values
  })

  const sourceOfIncomeValues = useAppSelector(
    (state) =>
      state.otherBorrowers.otherBorrowers[pageId - 1]?.sourceOfIncomeModal || []
  )

  const additionalIncomeValues = useAppSelector(
    (state) =>
      state.otherBorrowers.otherBorrowers[pageId - 1]?.additionalIncomeModal ||
      []
  )

  const obligationValues = useAppSelector(
    (state) =>
      state.otherBorrowers.otherBorrowers[pageId - 1]?.obligationModal || []
  )

  const openSourceOfIncome = () => {
    // dispatch(updateOtherBorrowers({ id, newFields: values }))
    dispatch(createSourceOfIncomeModal())
  }

  const openAdditionalIncome = () => {
    // dispatch(updateOtherBorrowers({ id, newFields: values }))
    dispatch(createAdditionalIncomeModal())
  }

  const openObligation = () => {
    // dispatch(updateOtherBorrowers({ id, newFields: values }))
    dispatch(createObligationModal())
  }

  const handleDeleteSourceOfIncome = (idToDelete: number, pageId: number) => {
    dispatch(deleteSourceOfIncomeModal({ id: idToDelete, pageId }))
  }

  const handleDeleteAdditionalIncome = (idToDelete: number, pageId: number) => {
    dispatch(deleteAdditionalIncomeModal({ id: idToDelete, pageId }))
  }

  const handleDeleteObligation = (idToDelete: number, pageId: number) => {
    dispatch(deleteObligationModal({ id: idToDelete, pageId }))
  }

  const handleEditSourceOfIncome = (id: number) => {
    dispatch(openSourceOfIncomeModal(id))
  }

  const handleEditAdditionalIncome = (id: number) => {
    dispatch(openAdditionalIncomeModal(id))
  }

  const handleEditObligation = (id: number) => {
    dispatch(openObligationModal(id))
  }

  return (
    <FormContainer>
      <FormCaption title={`${getContent('app.other_borrowers.step2.borrowers_income_title', 'Borrower\'s Income')}#${pageId}`} />

      <Row>
        <MainSourceOfIncome screenLocation="mortgage_step3" />
        {componentsByIncomeSource[incomeSourceKey] &&
          componentsByIncomeSource[incomeSourceKey].map(
            (Component, index) => (
              <React.Fragment key={index}>{Component}</React.Fragment>
            )
          )}
        <Column />
      </Row>
      <Row>
        {mainSourceOfIncome && (
          <Column>
            {sourceOfIncomeValues &&
              sourceOfIncomeValues.map((item) => (
                <UserProfileCard
                  onEdit={() => handleEditSourceOfIncome(item.id)}
                  onDelete={() => handleDeleteSourceOfIncome(item.id, pageId)}
                  enableEdit
                  key={item.id}
                  name={`${getContent('app.other_borrowers.step2.source_of_income_label', 'Source of Income')} ${item.id + 1}`}
                />
              ))}
            <AddButton
              onClick={openSourceOfIncome}
              color="#FBE54D"
              value={t('add_place_to_work')}
              variant="none"
            />
          </Column>
        )}
      </Row>

      <Divider />

      <Row>
        <AdditionalIncome />
        {additionalIncome && additionalIncome !== 'option_1' && additionalIncome !== '1' && additionalIncome !== 'no_additional_income' && (
          <AdditionalIncomeAmount />
        )}
        <Column />
      </Row>

      {additionalIncome && additionalIncome !== 'option_1' && additionalIncome !== '1' && additionalIncome !== 'no_additional_income' && (
        <Row>
          <Column>
            {additionalIncomeValues &&
              additionalIncomeValues.map((item) => (
                <UserProfileCard
                  onEdit={() => handleEditAdditionalIncome(item.id)}
                  onDelete={() => handleDeleteAdditionalIncome(item.id, pageId)}
                  enableEdit
                  key={item.id}
                  name={`${t('additional_source_of_income')}${item.id + 1}`}
                />
              ))}
            <AddButton
              onClick={openAdditionalIncome}
              color="#FBE54D"
              value={t('add_additional_source_of_income')}
              variant="none"
            />
          </Column>
        </Row>
      )}

      <Divider />

      <Row>
        <OtherBorrowersObligation />
        {componentsByObligation[obligation] &&
          componentsByObligation[obligation].map((Component, index) => (
            <React.Fragment key={index}>{Component}</React.Fragment>
          ))}
        <Column />
      </Row>

      {obligation && obligation !== 'option_1' && obligation !== '1' && obligation !== 'no_obligations' && (
        <Row>
          <Column>
            {obligationValues &&
              obligationValues.map((item) => (
                <UserProfileCard
                  onEdit={() => handleEditObligation(item.id)}
                  onDelete={() => handleDeleteObligation(item.id, pageId)}
                  enableEdit
                  key={item.id}
                  name={`${t('obligation')}${item.id + 1}`}
                />
              ))}
            <AddButton
              onClick={openObligation}
              color="#FBE54D"
              value={t('add_obligation')}
              variant="none"
            />
          </Column>
        </Row>
      )}
    </FormContainer>
  )
}

export default SecondStepForm
