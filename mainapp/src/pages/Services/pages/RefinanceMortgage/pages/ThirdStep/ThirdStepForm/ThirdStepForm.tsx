import { useFormikContext } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
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
import { useContentApi } from '@src/hooks/useContentApi'
import { AdditionalIncome } from '@src/pages/Services/components/AdditionalIncome'
import { AdditionalIncomeAmount } from '@src/pages/Services/components/AdditionalIncomeAmount'
import { MainSourceOfIncome } from '@src/pages/Services/components/MainSourceOfIncome'
import { Obligation } from '@src/pages/Services/components/Obligation'
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource.tsx'
import { componentsByObligation } from '@src/pages/Services/constants/componentsByObligation.tsx'
import {
  deleteAdditionalIncomeModal,
  deleteObligationModal,
  deleteSourceOfIncomeModal,
} from '@src/pages/Services/slices/borrowersSlice.ts'
import { updateRefinanceMortgageData } from '@src/pages/Services/slices/refinanceMortgageSlice.ts'
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

// Компонент расчета ипотеки - 3 шаг
const ThirdStepForm = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('refinance_step3')
  const navigate = useNavigate()

  const { values } = useFormikContext<FormTypes>()

  const { mainSourceOfIncome, additionalIncome, obligation } = values

  // Debug logging for conditional field rendering
  console.log('🔍 RefinanceMortgage ThirdStepForm debug:', {
    mainSourceOfIncome,
    incomeSourceKey,
    componentsByIncomeSource,
    hasComponent: !!componentsByIncomeSource[incomeSourceKey],
    componentKeys: Object.keys(componentsByIncomeSource),
    allFormValues: values
  })

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

  // FIX: Map dropdown option values to componentsByIncomeSource keys
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
      // Legacy option values
      option_1: 'employee',
      option_2: 'selfemployed',
      option_3: 'selfemployed',
      option_4: 'pension',
      option_5: 'student',
      option_6: 'unemployed',
      option_7: 'other',
    }

    if (mapping[optionValue]) return mapping[optionValue]

    // Substring detection for full content keys (e.g., 'mortgage_step3_main_source_employee')
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

  const openSourceOfIncome = () => {
    dispatch(updateRefinanceMortgageData(values))
    dispatch(createSourceOfIncomeModal())
  }

  const openAdditionalIncome = () => {
    dispatch(updateRefinanceMortgageData(values))
    dispatch(createAdditionalIncomeModal())
  }

  const openObligation = () => {
    dispatch(updateRefinanceMortgageData(values))
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
      <FormCaption title={getContent('refinance_step3_title', 'calculate_mortgage_step3_title')} />

      <UserProfileCard
        name={userData?.nameSurname}
        phone={userData?.phoneNumber}
      />

      <Row>
        <MainSourceOfIncome />
        {componentsByIncomeSource[incomeSourceKey] &&
          componentsByIncomeSource[incomeSourceKey].map(
            (Component, index) => (
              <React.Fragment key={index}>{Component}</React.Fragment>
            )
          )}
      </Row>
      <Row>
        <Column>
          {mainSourceOfIncome && (
            <>
              {sourceOfIncomeValues.map((item) => (
                <UserProfileCard
                  onEdit={() => handleEditSourceOfIncome(item.id)}
                  onDelete={() => handleDeleteSourceOfIncome(item.id)}
                  enableEdit
                  key={item.id}
                  name={`${getContent('source_of_income_label', 'Source of Income')} ${item.id + 1}`}
                />
              ))}
              <AddButton
                onClick={openSourceOfIncome}
                color="#FBE54D"
                value={getContent('add_place_to_work_button', 'Add Place to Work')}
                variant="none"
              />
            </>
          )}
        </Column>
      </Row>

      <Divider />

      <Row>
        <AdditionalIncome />
        {additionalIncome && additionalIncome !== 'option_1' && additionalIncome !== 'no_additional_income' && (
          <AdditionalIncomeAmount />
        )}
        <Column />
      </Row>

      {additionalIncome && additionalIncome !== 'option_1' && additionalIncome !== 'no_additional_income' && (
        <Row>
          <Column>
            {additionalIncomeValues.map((item) => (
              <UserProfileCard
                onEdit={() => handleEditAdditionalIncome(item.id)}
                onDelete={() => handleDeleteAdditionalIncome(item.id)}
                enableEdit
                key={item.id}
                name={`${getContent('additional_source_of_income_label', 'Additional Source of Income')} ${item.id + 1}`}
              />
            ))}
            <AddButton
              onClick={openAdditionalIncome}
              color="#FBE54D"
              value={getContent('add_additional_source_of_income_button', 'Add Additional Source of Income')}
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

      {obligation && obligation !== 'no_obligations' && (
        <Row>
          <Column>
            {obligationValues.map((item) => (
              <UserProfileCard
                onEdit={() => handleEditObligation(item.id)}
                onDelete={() => handleDeleteObligation(item.id)}
                enableEdit
                key={item.id}
                name={`${getContent('obligation_label', 'Obligation')} ${item.id + 1}`}
              />
            ))}
            <AddButton
              onClick={openObligation}
              color="#FBE54D"
              value={getContent('add_obligation_button', 'Add Obligation')}
              variant="none"
            />
          </Column>
        </Row>
      )}

      <Divider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {otherBorrowers && <TitleElement title={t('borrower')} />}
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
          {!otherBorrowers && <TitleElement title={t('borrower')} />}
          <Column>
            <AddButton
              value={t('add_borrower')}
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
