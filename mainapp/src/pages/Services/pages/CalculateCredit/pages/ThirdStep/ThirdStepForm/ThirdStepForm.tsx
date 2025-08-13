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
import { getComponentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'
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
  const { getContent } = useContentApi('credit_step3')
  const navigate = useNavigate()

  const { values, errors, isValid, touched } = useFormikContext<FormTypes>()

  const { mainSourceOfIncome, additionalIncome, obligation } = values

  // Comprehensive form debugging
  React.useEffect(() => {
    console.log('🔍 ThirdStepForm Debug:', {
      isValid,
      values,
      errors,
      touched,
      mainSourceOfIncome,
      additionalIncome,
      obligation
    })
    
    // Log specific field validation status
    const requiredFields = ['mainSourceOfIncome', 'additionalIncome', 'obligation']
    requiredFields.forEach(field => {
      console.log(`Field ${field}:`, {
        value: values[field],
        error: errors[field],
        touched: touched[field]
      })
    })
    
    // If main source of income requires additional fields
    if (mainSourceOfIncome && !['5', '6'].includes(mainSourceOfIncome)) {
      const conditionalFields = ['monthlyIncome', 'startDate', 'fieldOfActivity', 'profession', 'companyName']
      conditionalFields.forEach(field => {
        console.log(`Conditional Field ${field}:`, {
          value: values[field],
          error: errors[field],
          touched: touched[field]
        })
      })
    }
  }, [values, errors, isValid, touched, mainSourceOfIncome, additionalIncome, obligation])

  // 🚨 CRITICAL REGRESSION FIX: Credit API still uses numeric values
  // While other screens use semantic values, calculate_credit_3 returns "1", "2", "3"
  // This causes componentsByIncomeSource lookup to fail (expects "employee", "selfemployed")
  const getIncomeSourceKey = (optionValue: string): string => {
    // If already semantic, return as-is (future-proofing for when API is fixed)
    if (optionValue && !optionValue.match(/^\d+$/)) {
      return optionValue
    }
    
    // Numeric-to-semantic mapping for calculate_credit_3 API
    const numericMapping: { [key: string]: string } = {
      '1': 'employee',        // Employee
      '2': 'selfemployed',    // Self-employed
      '3': 'selfemployed',    // Business owner (treat as self-employed)
      '4': 'pension',         // Pension
      '5': 'student',         // Student
      '6': 'unemployed',      // Unemployed
      '7': 'other'            // Other
    }
    return numericMapping[optionValue] || ''
  }

  const incomeSourceKey = getIncomeSourceKey(mainSourceOfIncome)

  // ✅ FIXED: Obligations need numeric-to-semantic mapping like income sources
  // Credit API returns numeric values ("1", "2", "3") but componentsByObligation expects semantic keys
  const getObligationKey = (optionValue: string): string => {
    // Handle no obligations case
    if (!optionValue || optionValue === '5' || optionValue === 'no_obligations') {
      return ''
    }
    
    // If already semantic, return as-is (future-proofing)
    if (optionValue && !optionValue.match(/^\d+$/)) {
      return optionValue
    }
    
    // Numeric-to-semantic mapping for credit_step3 API
    const numericMapping: { [key: string]: string } = {
      '1': 'bank_loan',       // משכנתא (Mortgage) → bank_loan
      '2': 'consumer_credit', // הלוואה אישית (Personal loan) → consumer_credit
      '3': 'credit_card',     // חוב כרטיס אשראי (Credit card debt) → credit_card
      '4': 'other',           // הלוואת רכב (Car loan) → other
      // '5' is handled above as no obligations
    }
    return numericMapping[optionValue] || ''
  }
  
  const obligationKey = getObligationKey(obligation)

  // Debug: Enhanced logging for troubleshooting - ALWAYS LOG
  // Get components with proper screenLocation for credit_step3
  const componentsByIncomeSource = getComponentsByIncomeSource('credit_step3')
  
  console.log('🔍 Credit Step 3 - ENHANCED DEBUG:', {
    formValues: { mainSourceOfIncome, obligation },
    incomeMapping: {
      originalValue: mainSourceOfIncome,
      mappedKey: incomeSourceKey,
      hasComponents: !!componentsByIncomeSource[incomeSourceKey],
      componentsCount: componentsByIncomeSource[incomeSourceKey]?.length || 0,
      availableKeys: Object.keys(componentsByIncomeSource)
    },
    obligationMapping: {
      originalValue: obligation,
      mappedKey: obligationKey,
      hasComponents: !!componentsByObligation[obligationKey],
      componentsCount: componentsByObligation[obligationKey]?.length || 0,
      availableKeys: Object.keys(componentsByObligation)
    },
    shouldShowIncomeComponents: !!(mainSourceOfIncome && componentsByIncomeSource[incomeSourceKey]),
    shouldShowObligationComponents: !!(obligation && componentsByObligation[obligationKey])
  })
  
  console.log('🚨 FORM RENDERING DEBUG - ThirdStepForm is mounting/updating')
  console.log('🚨 VALUES:', { mainSourceOfIncome, obligation })
  console.log('🚨 MAPPED KEYS:', { incomeSourceKey, obligationKey })

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

      <FormCaption title={getContent('calculate_credit_step3_title', 'פרטי הכנסה ופיננסיים')} />

      <UserProfileCard
        name={userData?.nameSurname}
        phone={userData?.phoneNumber}
      />

      <Row>
        <MainSourceOfIncome screenLocation="credit_step3" />
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
        <AdditionalIncome screenLocation="credit_step3" />
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
        <Obligation screenLocation="credit_step3" />
        {componentsByObligation[obligationKey] &&
          componentsByObligation[obligationKey].map((Component, index) => (
            <React.Fragment key={index}>{Component}</React.Fragment>
          ))}
        <Column />
      </Row>

      {obligation && obligationKey && (
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
