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

// Компонент расчета ипотеки - 3 шаг
const ThirdStepForm = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('calculate_credit_3')
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

  // Map dropdown option values to componentsByIncomeSource keys
  const getIncomeSourceKey = (optionValue: string): string => {
    const mapping: { [key: string]: string } = {
      '1': 'employee',        // Employee
      '2': 'selfemployed',    // Self-employed  
      '3': 'selfemployed',    // Business owner (similar to self-employed)
      '4': 'pension',         // Pension
      '5': 'student',         // Student
      '6': 'unemployed',      // Unemployed
      '7': 'other',           // Other
      // Keep backward compatibility with old option format
      'option_1': 'employee',
      'option_2': 'selfemployed',
      'option_3': 'selfemployed',
      'option_4': 'pension',
      'option_5': 'student',
      'option_6': 'unemployed',
      'option_7': 'other'
    }
    return mapping[optionValue] || ''
  }

  const incomeSourceKey = getIncomeSourceKey(mainSourceOfIncome)

  // Map dropdown option values to componentsByObligation keys
  const getObligationKey = (optionValue: string): string => {
    const mapping: { [key: string]: string } = {
      '1': '',                // No obligations (no additional fields)
      '2': 'bank_loan',       // Bank loan (הלוואה בנקאית)
      '3': 'credit_card',     // Credit card debt
      '4': 'consumer_credit', // Consumer credit
      '5': 'other',           // Other obligations
      // Keep backward compatibility with old option format
      'option_1': '',
      'option_2': 'bank_loan',    // Bank loan (הלוואה בנקאית)
      'option_3': 'credit_card',
      'option_4': 'consumer_credit',
      'option_5': 'other'
    }
    return mapping[optionValue] || ''
  }

  const obligationKey = getObligationKey(obligation)

  // Debug: Enhanced logging for troubleshooting - ALWAYS LOG
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
      {/* Debug validation button */}
      <div style={{ 
        background: '#ff6b6b', 
        color: 'white', 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '5px',
        fontFamily: 'monospace'
      }}>
        <h4>🐛 DEBUG INFO:</h4>
        <p>Form Valid: {isValid ? '✅ YES' : '❌ NO'}</p>
        <p>Main Income: {values.mainSourceOfIncome || '(empty)'}</p>
        <p>Additional Income: {values.additionalIncome || '(empty)'}</p>
        <p>Obligation: {values.obligation || '(empty)'}</p>
        <button 
          type="button"
          style={{ background: 'white', color: 'black', padding: '5px', borderRadius: '3px', border: 'none' }}
          onClick={() => {
            console.log('🔍 MANUAL VALIDATION CHECK:');
            console.log('Values:', values);
            console.log('Errors:', errors);
            console.log('Touched:', touched);
            console.log('Form Valid:', isValid);
          }}
        >
          Log Validation State
        </button>
      </div>
      <FormCaption title={getContent('calculate_credit_step3_title', t('credit_step3_title'))} />

      <UserProfileCard
        name={userData?.nameSurname}
        phone={userData?.phoneNumber}
      />

      <Row>
        <MainSourceOfIncome screenLocation="calculate_credit_3" />
        {/* DEBUG: Add visual indicator for conditional logic */}
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', margin: '10px' }}>
          DEBUG: mainSourceOfIncome="{mainSourceOfIncome}", mappedKey="{incomeSourceKey}", 
          hasComponents={componentsByIncomeSource[incomeSourceKey] ? 'YES' : 'NO'}
        </div>
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
        <AdditionalIncome screenLocation="calculate_credit_3" />
        {additionalIncome && additionalIncome !== 'option_1' && (
          <AdditionalIncomeAmount />
        )}
        <Column />
      </Row>

      {additionalIncome && additionalIncome !== 'option_1' && (
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
        {/* DEBUG: Add visual indicator for obligation conditional logic */}
        <div style={{ color: 'blue', padding: '10px', border: '1px solid blue', margin: '10px' }}>
          DEBUG: obligation="{obligation}", mappedKey="{obligationKey}", 
          hasComponents={componentsByObligation[obligationKey] ? 'YES' : 'NO'}
        </div>
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
