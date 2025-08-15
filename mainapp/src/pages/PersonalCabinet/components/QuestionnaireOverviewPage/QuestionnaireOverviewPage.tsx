import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'

import { PersonalCabinetLayout } from '../PersonalCabinetLayout/PersonalCabinetLayout'
import { Button } from '@components/ui/ButtonUI'
import styles from './QuestionnaireOverviewPage.module.scss'

const cx = classNames.bind(styles)

interface BorrowerData {
  id: string
  name: string
  phone?: string
  personalDataComplete: boolean
  incomeDataComplete: boolean
  activitySphere?: string
  monthlyIncome?: string
}

interface QuestionnaireOverviewPageProps {
  onOpenModal?: (modalType: string, data?: any) => void
}

export const QuestionnaireOverviewPage: React.FC<QuestionnaireOverviewPageProps> = ({
  onOpenModal
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Sample data - in real app this would come from Redux/API
  const [borrowers] = useState<BorrowerData[]>([
    {
      id: 'main',
      name: 'Александр Пушкин',
      phone: '+935 234 3344',
      personalDataComplete: true,
      incomeDataComplete: true,
      activitySphere: 'Работа по найму',
      monthlyIncome: '3,500 ₪'
    },
    {
      id: 'co1',
      name: 'Людмила Пушкина',
      phone: '+972 50 123 4567',
      personalDataComplete: true,
      incomeDataComplete: false,
      activitySphere: 'Самозанятость',
      monthlyIncome: '2,800 ₪'
    },
    {
      id: 'co2',
      name: 'Созаемщик #2',
      phone: undefined,
      personalDataComplete: false,
      incomeDataComplete: false,
      activitySphere: undefined,
      monthlyIncome: undefined
    }
  ])

  const [activeBorrowerId, setActiveBorrowerId] = useState('co1') // Default to co-borrower as shown in Figma

  const activeBorrower = borrowers.find(b => b.id === activeBorrowerId)

  // Action #12 - Add Co-borrower
  const handleAddCoBorrower = () => {
    navigate('/personal-cabinet/co-borrower-personal-data')
  }

  // Action #13 - Borrower tab switching
  const handleBorrowerSwitch = (borrowerId: string) => {
    setActiveBorrowerId(borrowerId)
  }

  // Action #17 - Edit Personal Data
  const handleEditPersonalData = () => {
    if (activeBorrowerId === 'main') {
      navigate('/personal-cabinet/main-borrower-personal-data')
    } else {
      navigate(`/personal-cabinet/co-borrower-personal-data/${activeBorrowerId}`)
    }
  }

  // Action #18 - Edit Income
  const handleEditIncome = () => {
    if (activeBorrowerId === 'main') {
      navigate('/personal-cabinet/income-data')
    } else {
      navigate(`/personal-cabinet/co-borrower-income-data/${activeBorrowerId}`)
    }
  }

  // Action #19 - Delete Co-borrower
  const handleDeleteCoBorrower = () => {
    if (activeBorrowerId !== 'main' && onOpenModal) {
      onOpenModal('coBorrowerDelete', {
        id: activeBorrowerId,
        name: activeBorrower?.name
      })
    }
  }

  // Action #16 - Complete Questionnaire
  const handleCompleteQuestionnaire = () => {
    // Check if all data is complete
    const allComplete = borrowers.every(b => b.personalDataComplete && b.incomeDataComplete)
    if (allComplete) {
      navigate('/personal-cabinet/documents')
    } else {
      // Show completion modal or navigate to incomplete sections
      }
  }

  const isQuestionnaireComplete = borrowers.every(b => b.personalDataComplete && b.incomeDataComplete)

  return (
    <PersonalCabinetLayout>
      <div className={cx('questionnaire-overview-page')}>
        {/* Main Content */}
        <div className={cx('content')}>
          {/* Page Title */}
          <div className={cx('page-header')}>
            <h1 className={cx('page-title')}>Анкета</h1>
            
            {/* Action #12 - Add Co-borrower Button */}
            <button 
              className={cx('add-co-borrower-btn')}
              onClick={handleAddCoBorrower}
            >
              <span className={cx('plus-icon')}>+</span>
              Добавить созаемщика
            </button>
          </div>

          {/* Action #13 - Co-borrower Tabs */}
          <div className={cx('borrower-tabs')}>
            {borrowers.map((borrower) => (
              <button
                key={borrower.id}
                className={cx('borrower-tab', {
                  active: borrower.id === activeBorrowerId
                })}
                onClick={() => handleBorrowerSwitch(borrower.id)}
              >
                {borrower.name}
                {borrower.personalDataComplete && (
                  <span className={cx('completion-indicator')}>✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Active Borrower Content */}
          {activeBorrower && (
            <div className={cx('borrower-content')}>
              {/* Borrower Name Header */}
              <div className={cx('borrower-header')}>
                <h2 className={cx('borrower-name')}>{activeBorrower.name}</h2>
                
                {/* Action #19 - Delete Co-borrower (only for co-borrowers) */}
                {activeBorrowerId !== 'main' && (
                  <button 
                    className={cx('delete-borrower-btn')}
                    onClick={handleDeleteCoBorrower}
                  >
                    🗑️ Удалить созаемщика
                  </button>
                )}
              </div>

              <div className={cx('data-sections')}>
                {/* Action #14 - Personal Data Section */}
                <div className={cx('data-section')}>
                  <div className={cx('section-header')}>
                    <h3 className={cx('section-title')}>Личные данные</h3>
                    {/* Action #17 - Edit Personal Data */}
                    <button 
                      className={cx('edit-btn')}
                      onClick={handleEditPersonalData}
                    >
                      ✏️
                    </button>
                  </div>
                  
                  <div className={cx('section-content')}>
                    <div className={cx('data-item')}>
                      <span className={cx('data-label')}>{activeBorrower.name}</span>
                    </div>
                    {activeBorrower.phone && (
                      <div className={cx('data-item')}>
                        <span className={cx('data-value')}>{activeBorrower.phone}</span>
                      </div>
                    )}
                    {!activeBorrower.personalDataComplete && (
                      <div className={cx('incomplete-notice')}>
                        Данные не заполнены
                      </div>
                    )}
                  </div>
                </div>

                {/* Action #15 - Income Section */}
                <div className={cx('data-section')}>
                  <div className={cx('section-header')}>
                    <h3 className={cx('section-title')}>Доходы</h3>
                    {/* Action #18 - Edit Income */}
                    <button 
                      className={cx('edit-btn')}
                      onClick={handleEditIncome}
                    >
                      ✏️
                    </button>
                  </div>
                  
                  <div className={cx('section-content')}>
                    {activeBorrower.activitySphere && (
                      <div className={cx('data-item')}>
                        <span className={cx('data-label')}>{activeBorrower.activitySphere}</span>
                      </div>
                    )}
                    {activeBorrower.monthlyIncome && (
                      <div className={cx('data-item')}>
                        <span className={cx('data-value')}>{activeBorrower.monthlyIncome}</span>
                      </div>
                    )}
                    {!activeBorrower.incomeDataComplete && (
                      <div className={cx('incomplete-notice')}>
                        Данные не заполнены
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action #16 - Complete Questionnaire Button */}
              {isQuestionnaireComplete && (
                <div className={cx('complete-section')}>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleCompleteQuestionnaire}
                    className={cx('complete-btn')}
                  >
                    Завершить анкету
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PersonalCabinetLayout>
  )
} 