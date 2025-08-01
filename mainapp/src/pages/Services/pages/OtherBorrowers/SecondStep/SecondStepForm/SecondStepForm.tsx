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
import { Obligation } from '@src/pages/Services/components/Obligation'
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
        {componentsByIncomeSource[mainSourceOfIncome] &&
          componentsByIncomeSource[mainSourceOfIncome].map(
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
        <Obligation />
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
