import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import classNames from 'classnames/bind'

import { CaretRightIcon } from '@assets/icons/CaretRightIcon'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { useAppSelector } from '@src/hooks/store'
import { 
  fetchMortgagePrograms,
  type BankOffer,
  type MortgageProgram 
} from '@src/services/bankOffersApi'

import styles from './programSelection.module.scss'

const cx = classNames.bind(styles)

interface BankProgram {
  id: string
  bankName: string
  bankLogo?: string
  programName: string
  interestRate: number
  monthlyPayment: number
  loanAmount: number
  termYears: number
  description: string
  isSelected?: boolean
}

export const ProgramSelectionPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [bankPrograms, setBankPrograms] = useState<BankProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>('rate')
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])

  // Get mortgage parameters from Redux store
  const mortgageParameters = useAppSelector((state) => state.mortgage)

  useEffect(() => {
    const loadBankPrograms = async () => {
      try {
        setLoading(true)
        
        // Mock bank programs data based on Figma design
        const mockBankPrograms: BankProgram[] = [
          {
            id: 'hapoalim-prime',
            bankName: 'Bank Hapoalim',
            programName: 'Прайм %',
            interestRate: 2.1,
            monthlyPayment: 4500,
            loanAmount: 1000000,
            termYears: 20,
            description: 'Prime rate linked mortgage program'
          },
          {
            id: 'hapoalim-fixed',
            bankName: 'Bank Hapoalim',
            programName: 'Фиксированная % с индексацией',
            interestRate: 3.2,
            monthlyPayment: 4800,
            loanAmount: 1000000,
            termYears: 20,
            description: 'Fixed rate with inflation adjustment'
          },
          {
            id: 'hapoalim-variable',
            bankName: 'Bank Hapoalim',
            programName: 'Переменная % с индексацией',
            interestRate: 2.8,
            monthlyPayment: 4650,
            loanAmount: 1000000,
            termYears: 20,
            description: 'Variable rate with inflation adjustment'
          },
          {
            id: 'leumi-prime',
            bankName: 'Bank Leumi',
            programName: 'Прайм %',
            interestRate: 2.3,
            monthlyPayment: 4550,
            loanAmount: 1000000,
            termYears: 20,
            description: 'Prime rate linked mortgage program'
          },
          {
            id: 'leumi-fixed',
            bankName: 'Bank Leumi',
            programName: 'Фиксированная % с индексацией',
            interestRate: 3.1,
            monthlyPayment: 4750,
            loanAmount: 1000000,
            termYears: 20,
            description: 'Fixed rate with inflation adjustment'
          },
          {
            id: 'mizrahi-prime',
            bankName: 'Mizrahi Tefahot',
            programName: 'Прайм %',
            interestRate: 2.2,
            monthlyPayment: 4525,
            loanAmount: 1000000,
            termYears: 20,
            description: 'Prime rate linked mortgage program'
          }
        ]

        setBankPrograms(mockBankPrograms)
      } catch (error) {
        console.warn('⚠️ [PROGRAM-SELECTION] Failed to fetch programs')
      } finally {
        setLoading(false)
      }
    }

    loadBankPrograms()
  }, [])

  // Sorting options
  const sortOptions = [
    { value: 'rate', label: t('sort_by_rate', 'По процентной ставке') },
    { value: 'payment', label: t('sort_by_payment', 'По ежемесячному платежу') },
    { value: 'bank', label: t('sort_by_bank', 'По банку') }
  ]

  // Sort programs based on selected criteria
  const sortedPrograms = [...bankPrograms].sort((a, b) => {
    switch (sortBy) {
      case 'rate':
        return a.interestRate - b.interestRate
      case 'payment':
        return a.monthlyPayment - b.monthlyPayment
      case 'bank':
        return a.bankName.localeCompare(b.bankName)
      default:
        return 0
    }
  })

  // Action #2: Return to Personal Cabinet Button
  const handleBackNavigation = () => {
    navigate('/personal-cabinet')
  }

  // Action #8: Program Selection
  const handleProgramSelection = (programId: string) => {
    setSelectedPrograms(prev => {
      if (prev.includes(programId)) {
        return prev.filter(id => id !== programId)
      } else {
        return [...prev, programId]
      }
    })
  }

  // Action #12: Continue Button - Navigate to calculation page
  const handleContinue = () => {
    if (selectedPrograms.length === 0) {
      alert(t('select_program_warning', 'Пожалуйста, выберите хотя бы одну программу'))
      return
    }

    const selectedProgramsData = bankPrograms.filter(program => 
      selectedPrograms.includes(program.id)
    )

    navigate('/personal-cabinet/program-selection-calculation', {
      state: { selectedPrograms: selectedProgramsData }
    })
  }

  // Get bank logo placeholder
  const getBankLogoPlaceholder = (bankName: string) => {
    return bankName.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className={cx('container')}>
        <div className={cx('loading')}>
          {t('loading', 'Загрузка...')}
        </div>
      </div>
    )
  }

  return (
    <div className={cx('container')}>
      {/* Action #1: Logo Display - handled by PersonalCabinetLayout */}
      
      {/* Action #2: Return to Personal Cabinet Button */}
      <div className={cx('header')}>
        <button 
          className={cx('return-button')}
          onClick={handleBackNavigation}
          aria-label={t('return_to_cabinet', 'Вернуться в личный кабинет')}
        >
          <CaretRightIcon size={20} color="#ffffff" style={{ transform: 'rotate(180deg)' }} />
          {t('return_to_cabinet', 'Вернуться в личный кабинет')}
        </button>
      </div>

      {/* Action #3: Page Title Display */}
      <div className={cx('title-section')}>
        <h1 className={cx('page-title')}>
          {t('program_selection_title', 'Выбор программ окончательный расчет')}
        </h1>
        <p className={cx('page-subtitle')}>
          {t('program_selection_subtitle', 'Выберите подходящие программы ипотечного кредитования')}
        </p>
      </div>

      {/* Action #4: Sorting Controls */}
      <div className={cx('controls-section')}>
        <div className={cx('sort-control')}>
          <label className={cx('sort-label')}>
            {t('sort_programs', 'Сортировать программы')}
          </label>
          <DropdownMenu
            data={sortOptions}
            placeholder={t('select_sort', 'Выберите сортировку')}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
        <div className={cx('selection-info')}>
          <span className={cx('selected-count')}>
            {t('selected_programs', 'Выбрано программ')}: {selectedPrograms.length}
          </span>
        </div>
      </div>

      {/* Programs Grid - Actions #5-#11 */}
      <div className={cx('programs-grid')}>
        {sortedPrograms.map((program) => (
          <div 
            key={program.id} 
            className={cx('program-card', {
              'selected': selectedPrograms.includes(program.id)
            })}
            onClick={() => handleProgramSelection(program.id)}
          >
            {/* Action #5: Bank Logo Display */}
            <div className={cx('bank-header')}>
              <div className={cx('bank-logo')}>
                <div className={cx('logo-placeholder')}>
                  {getBankLogoPlaceholder(program.bankName)}
                </div>
              </div>
              
              {/* Action #6: Bank Name Display */}
              <div className={cx('bank-info')}>
                <h3 className={cx('bank-name')}>{program.bankName}</h3>
                <p className={cx('program-name')}>{program.programName}</p>
              </div>

              {/* Selection indicator */}
              <div className={cx('selection-indicator')}>
                {selectedPrograms.includes(program.id) && (
                  <div className={cx('checkmark')}>✓</div>
                )}
              </div>
            </div>

            {/* Action #7: Program Details Display */}
            <div className={cx('program-details')}>
              <div className={cx('detail-row')}>
                <span className={cx('detail-label')}>
                  {t('loan_amount', 'Сумма кредита')}
                </span>
                <span className={cx('detail-value')}>
                  {program.loanAmount.toLocaleString('en-US')} ₪
                </span>
              </div>

              {/* Action #10: Interest Rate Display */}
              <div className={cx('detail-row')}>
                <span className={cx('detail-label')}>
                  {t('interest_rate', 'Процентная ставка')}
                </span>
                <span className={cx('detail-value', 'rate')}>
                  {program.interestRate}%
                </span>
              </div>

              {/* Action #9: Monthly Payment Display */}
              <div className={cx('detail-row')}>
                <span className={cx('detail-label')}>
                  {t('monthly_payment', 'Ежемесячный платеж')}
                </span>
                <span className={cx('detail-value', 'payment')}>
                  {program.monthlyPayment.toLocaleString('en-US')} ₪
                </span>
              </div>

              {/* Action #11: Term Display */}
              <div className={cx('detail-row')}>
                <span className={cx('detail-label')}>
                  {t('loan_term', 'Срок кредита')}
                </span>
                <span className={cx('detail-value')}>
                  {program.termYears} {t('years', 'лет')}
                </span>
              </div>
            </div>

            <div className={cx('program-description')}>
              {program.description}
            </div>
          </div>
        ))}
      </div>

      {/* Action #12: Continue Button */}
      <div className={cx('actions-section')}>
        <button 
          className={cx('continue-button', {
            'disabled': selectedPrograms.length === 0
          })}
          onClick={handleContinue}
          disabled={selectedPrograms.length === 0}
        >
          {t('continue_to_calculation', 'Продолжить к расчету')}
        </button>
      </div>
    </div>
  )
} 