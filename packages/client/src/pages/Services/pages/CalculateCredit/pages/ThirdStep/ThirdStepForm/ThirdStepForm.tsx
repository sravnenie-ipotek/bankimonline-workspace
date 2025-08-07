import { useFormikContext } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useContentApi } from '@src/hooks/useContentApi'
import { createSearchParams } from 'react-router-dom'

import { AddButton } from '@components/ui/AddButton'
import { Column } from '@components/ui/Column'
import { FormContainer } from '@components/ui/FormContainer'
import { Row } from '@components/ui/Row'
import { TitleElement } from '@components/ui/TitleElement'
import { UserProfileCard } from '@components/ui/UserProfileCard'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { AdditionalIncome } from '@src/pages/Services/components/AdditionalIncome'
import { AdditionalIncomeAmount } from '@src/pages/Services/components/AdditionalIncomeAmount'
import { MainSourceOfIncome } from '@src/pages/Services/components/MainSourceOfIncome'
import { Obligation } from '@src/pages/Services/components/Obligation'
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'
import { componentsByObligation } from '@src/pages/Services/constants/componentsByObligation'
import {
  deleteAdditionalIncomeModal,
  deleteObligationModal,
  deleteSourceOfIncomeModal,
} from '@src/pages/Services/slices/borrowersSlice.ts'
import { updateCreditData } from '@src/pages/Services/slices/calculateCreditSlice.ts'
import {
  createAdditionalIncomeModal,
  createObligationModal,
  createSourceOfIncomeModal,
  openAdditionalIncomeModal,
  openObligationModal,
  openSourceOfIncomeModal,
} from '@src/pages/Services/slices/modalSlice.ts'
import {
  deleteOtherBorrowers,
  openBorrowersPage,
} from '@src/pages/Services/slices/otherBorrowersSlice'
import { FormTypes } from '@src/pages/Services/types/formTypes'
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts'

// Helper function to check if a value indicates "no additional income"
const isNoAdditionalIncomeValue = (value: string): boolean => {
  if (!value) return false
  const lowerValue = value.toLowerCase()
  return (
    lowerValue === 'option_1' ||
    lowerValue === '1' ||
    lowerValue.includes('no_additional') ||
    lowerValue.includes('no additional') ||
    lowerValue.includes('none')
  )
}

// Компонент расчета ипотеки - 3 шаг
const ThirdStepForm = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('calculate_credit_3')
  const navigate = useNavigate()

  const { values } = useFormikContext<FormTypes>()

  const { mainSourceOfIncome, additionalIncome, obligation } = values

  const dispatch = useAppDispatch()

  const sourceOfIncomeValues = useAppSelector(
    (state) => state.borrowers.sourceOfIncomeModal
  )

  const additionalIncomeValues = useAppSelector(
    (state) => state.borrowers.additionalIncomeModal
  )

  const obligationValues = useAppSelector(
    (state) => state.borrowers.obligationModal
  )

  const otherBorrowers = useAppSelector(
    (state) => state.otherBorrowers.otherBorrowers
  )

  const userData = useAppSelector((state) => state.login.loginData)

  const openSourceOfIncome = () => {
    dispatch(updateCreditData(values))
    dispatch(createSourceOfIncomeModal())
  }

  const openAdditionalIncome = () => {
    dispatch(updateCreditData(values))
    dispatch(createAdditionalIncomeModal())
  }

  const openObligation = () => {
    dispatch(updateCreditData(values))
    dispatch(createObligationModal())
  }

  const handleDeleteSourceOfIncome = (idToDelete: number) => {
    dispatch(deleteSourceOfIncomeModal({ id: idToDelete }))
  }

  const handleDeleteAdditionalIncome = (idToDelete: number) => {
    dispatch(deleteAdditionalIncomeModal({ id: idToDelete }))
  }

  const handleDeleteObligation = (idToDelete: number) => {
    dispatch(deleteObligationModal({ id: idToDelete }))
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

  const handleOpenOtherBorrowers = (id: number) => {
    dispatch(openBorrowersPage(id))

    const isNew = !otherBorrowers.some((item) => item.id === id)
    const otherBorrowersPageId = isNew ? generateNewId(otherBorrowers) : id

    navigate({
      pathname: '/services/other-borrowers/1/',
      search: createSearchParams({
        pageId: String(otherBorrowersPageId),
      }).toString(),
    })
  }

  const handleCreateOtherBorrowers = () => {
    dispatch(openBorrowersPage(generateNewId(otherBorrowers)))
    dispatch(updateCreditData(values))

    navigate({
      pathname: '/services/other-borrowers/1/',
      search: createSearchParams({
        pageId: generateNewId(otherBorrowers).toString(),
      }).toString(),
    })
  }

  const handleDeleteOtherBorrowers = (id: number) => {
    dispatch(deleteOtherBorrowers(id))
  }

  return (
    <FormContainer>
      <FormCaption title={getContent('calculate_credit_step3_title', t('credit_step3_title'))} />

      <UserProfileCard
        name={userData?.nameSurname}
        phone={userData?.phoneNumber}
      />

      <Row>
        <MainSourceOfIncome screenLocation="calculate_credit_3" />
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
            {sourceOfIncomeValues.map((item) => (
              <UserProfileCard
                onEdit={() => handleEditSourceOfIncome(item.id)}
                onDelete={() => handleDeleteSourceOfIncome(item.id)}
                enableEdit
                key={item.id}
                name={`${getContent('calculate_credit_source_of_income', t('main_income_source'))}${item.id + 1}`}
              />
            ))}
            <AddButton
              onClick={openSourceOfIncome}
              color="#FBE54D"
              value={getContent('calculate_credit_add_place_to_work', t('add_place_to_work'))}
              variant="none"
            />
          </Column>
        )}
      </Row>

      <Divider />

      <Row>
        <AdditionalIncome screenLocation="calculate_credit_3" />
        {additionalIncome && !isNoAdditionalIncomeValue(additionalIncome) && (
          <AdditionalIncomeAmount />
        )}
        <Column />
      </Row>

      {additionalIncome && !isNoAdditionalIncomeValue(additionalIncome) && (
        <Row>
          <Column>
            {additionalIncomeValues.map((item) => (
              <UserProfileCard
                onEdit={() => handleEditAdditionalIncome(item.id)}
                onDelete={() => handleDeleteAdditionalIncome(item.id)}
                enableEdit
                key={item.id}
                name={`${getContent('calculate_credit_additional_income', t('additional_source_of_income'))}${item.id + 1}`}
              />
            ))}
            <AddButton
              onClick={openAdditionalIncome}
              color="#FBE54D"
              value={getContent('calculate_credit_add_additional_income', t('add_additional_source_of_income'))}
              variant="none"
            />
          </Column>
        </Row>
      )}

      <Divider />

      <Row>
        <Obligation screenLocation="calculate_credit_3" />
        {componentsByObligation[obligation] &&
          componentsByObligation[obligation].map((Component, index) => (
            <React.Fragment key={index}>{Component}</React.Fragment>
          ))}
        <Column />
      </Row>

      {obligation && obligation !== 'option_1' && (
        <Row>
          <Column>
            {obligationValues.map((item) => (
              <UserProfileCard
                onEdit={() => handleEditObligation(item.id)}
                onDelete={() => handleDeleteObligation(item.id)}
                enableEdit
                key={item.id}
                name={`${getContent('calculate_credit_obligation', t('obligation'))}${item.id + 1}`}
              />
            ))}
            <AddButton
              onClick={openObligation}
              color="#FBE54D"
              value={getContent('calculate_credit_add_obligation', t('add_obligation'))}
              variant="none"
            />
          </Column>
        </Row>
      )}

      <Divider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {otherBorrowers && <TitleElement title={getContent('calculate_credit_borrower', t('borrower'))} />}
        <Row style={{ columnGap: '2rem' }}>
          {otherBorrowers.map((item) => (
            <Column key={item.id}>
              <UserProfileCard
                onEdit={() => handleOpenOtherBorrowers(item.id)}
                onDelete={() => handleDeleteOtherBorrowers(item.id)}
                enableEdit
                key={item.id}
                name={item.nameSurname}
              />
            </Column>
          ))}
          {!otherBorrowers && <TitleElement title={getContent('calculate_credit_borrower', t('borrower'))} />}
          <Column>
            <AddButton
              value={getContent('calculate_credit_add_borrower', t('add_borrower'))}
              onClick={handleCreateOtherBorrowers}
              style={{
                height: '3.5rem',
                borderRadius: '0.25rem',
                padding: '0',
                width: '13.125rem',
              }}
            />
          </Column>
          <Column />
        </Row>
      </div>
    </FormContainer>
  )
}

export default ThirdStepForm
